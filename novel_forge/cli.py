"""コマンドラインインターフェース。

使い方:
    novel-forge new "タイトル" --idea "..." --genre "ミステリー" --episodes 12
    novel-forge build <slug>            # 企画→キャラ→プロットを一括生成
    novel-forge write <slug>            # 次の1話を執筆
    novel-forge write <slug> --all      # 最終話まで連続執筆
    novel-forge status <slug>           # 進捗と伏線台帳
    novel-forge export <slug>           # 全話を1ファイルに結合
    novel-forge serve                   # Web UI を起動
"""

from __future__ import annotations

import argparse
import sys

from . import pipeline, state
from .llm import NovelLLM, RefusalError


def _stream_to_stdout(gen) -> None:
    try:
        for chunk in gen:
            sys.stdout.write(chunk)
            sys.stdout.flush()
        print()
    except RefusalError as exc:
        print(f"\n[エラー] {exc}", file=sys.stderr)
        sys.exit(1)


def cmd_new(args: argparse.Namespace) -> None:
    project = state.Project.create(
        title=args.title, idea=args.idea, genre=args.genre, episodes=args.episodes
    )
    print(f"プロジェクトを作成しました: {project.dir}")
    print(f"次のステップ: novel-forge build {project.slug}")


def cmd_build(args: argparse.Namespace) -> None:
    project = state.Project.load(args.slug)
    llm = NovelLLM()
    if not project.concept or args.force:
        print("\n========== 企画書を生成中 ==========\n")
        _stream_to_stdout(pipeline.build_concept(project, llm))
    if not project.characters or args.force:
        print("\n========== キャラクターを設計中 ==========\n")
        _stream_to_stdout(pipeline.build_characters(project, llm))
    if not project.plot or args.force:
        print("\n========== 全話プロットを設計中 ==========\n")
        _stream_to_stdout(pipeline.build_plot(project, llm))
    print(f"\n準備完了。執筆を開始できます: novel-forge write {project.slug}")


def cmd_write(args: argparse.Namespace) -> None:
    project = state.Project.load(args.slug)
    revise = not args.fast
    if args.all:
        _stream_to_stdout(pipeline.write_remaining(project, revise=revise))
    else:
        number = args.episode or project.next_episode()
        if number is None:
            print("全話執筆済みです。novel-forge export で書き出せます。")
            return
        _stream_to_stdout(pipeline.write_episode(project, number, revise=revise))


def cmd_status(args: argparse.Namespace) -> None:
    project = state.Project.load(args.slug)
    bible = project.load_bible()
    written = project.written_episodes()
    print(f"タイトル : {project.title}")
    print(f"ジャンル : {project.genre}")
    print(f"進捗     : {len(written)}/{project.episodes} 話")
    print(f"企画     : {'済' if project.concept else '未'} / "
          f"キャラ: {'済' if project.characters else '未'} / "
          f"プロット: {'済' if project.plot else '未'}")
    print("\n[伏線台帳]")
    if not bible["foreshadows"]:
        print("  (まだありません)")
    for f in bible["foreshadows"]:
        mark = f"第{f['resolved_in']}話で回収済" if f["resolved_in"] else "未回収"
        print(f"  - id={f['id']} [{mark}] {f['description']}(第{f['planted_in']}話)")


def cmd_export(args: argparse.Namespace) -> None:
    project = state.Project.load(args.slug)
    out = project.dir / f"{project.slug}_full.md"
    out.write_text(project.export(), encoding="utf-8")
    print(f"書き出しました: {out}")


def cmd_list(args: argparse.Namespace) -> None:
    slugs = state.Project.list_all()
    if not slugs:
        print("プロジェクトはまだありません。novel-forge new で作成してください。")
    for slug in slugs:
        print(slug)


def cmd_serve(args: argparse.Namespace) -> None:
    import uvicorn

    uvicorn.run("novel_forge.server:app", host=args.host, port=args.port)


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(
        prog="novel-forge",
        description="面白さ最優先の長編小説を完成させる生成アプリ",
    )
    sub = parser.add_subparsers(dest="command", required=True)

    p = sub.add_parser("new", help="プロジェクトを作成")
    p.add_argument("title")
    p.add_argument("--idea", default="", help="アイデア・要望")
    p.add_argument("--genre", default="", help="ジャンル")
    p.add_argument("--episodes", type=int, default=12, help="話数(既定: 12)")
    p.set_defaults(func=cmd_new)

    p = sub.add_parser("build", help="企画→キャラ→プロットを生成")
    p.add_argument("slug")
    p.add_argument("--force", action="store_true", help="生成済みでも作り直す")
    p.set_defaults(func=cmd_build)

    p = sub.add_parser("write", help="本文を執筆")
    p.add_argument("slug")
    p.add_argument("--episode", type=int, help="話数を指定(省略時は次の話)")
    p.add_argument("--all", action="store_true", help="最終話まで連続執筆")
    p.add_argument("--fast", action="store_true", help="自己批評リライトを省略")
    p.set_defaults(func=cmd_write)

    p = sub.add_parser("status", help="進捗と伏線台帳を表示")
    p.add_argument("slug")
    p.set_defaults(func=cmd_status)

    p = sub.add_parser("export", help="全話を1ファイルに結合")
    p.add_argument("slug")
    p.set_defaults(func=cmd_export)

    p = sub.add_parser("list", help="プロジェクト一覧")
    p.set_defaults(func=cmd_list)

    p = sub.add_parser("serve", help="Web UI を起動")
    p.add_argument("--host", default="127.0.0.1")
    p.add_argument("--port", type=int, default=8000)
    p.set_defaults(func=cmd_serve)

    args = parser.parse_args(argv)
    args.func(args)


if __name__ == "__main__":
    main()
