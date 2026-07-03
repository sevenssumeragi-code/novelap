"""コマンドラインインターフェース。

使い方:
    builder3d serve                       # Web UI を起動(推奨)
    builder3d gen "指示文" [--image a.jpg ...] [--category all] [-o out.json]
    builder3d demo -o sample.json         # サンプルシーンを書き出す
"""

from __future__ import annotations

import argparse
import base64
import json
import mimetypes
import sys
from pathlib import Path

from . import pipeline
from .demo import demo_spec
from .llm import RefusalError


def _encode_images(paths: list[str]) -> list[tuple[str, str]]:
    out: list[tuple[str, str]] = []
    for p in paths:
        path = Path(p)
        media = mimetypes.guess_type(path.name)[0] or "image/png"
        out.append((media, base64.b64encode(path.read_bytes()).decode("ascii")))
    return out


def cmd_gen(args: argparse.Namespace) -> None:
    images = _encode_images(args.image or [])
    try:
        spec = pipeline.generate_scene(args.instruction, category=args.category, images=images)
    except RefusalError as exc:
        print(f"[エラー] {exc}", file=sys.stderr)
        sys.exit(1)
    text = json.dumps(spec, ensure_ascii=False, indent=2)
    if args.out:
        Path(args.out).write_text(text, encoding="utf-8")
        print(f"書き出しました: {args.out}")
    else:
        print(text)


def cmd_demo(args: argparse.Namespace) -> None:
    text = json.dumps(demo_spec(), ensure_ascii=False, indent=2)
    if args.out:
        Path(args.out).write_text(text, encoding="utf-8")
        print(f"書き出しました: {args.out}")
    else:
        print(text)


def cmd_serve(args: argparse.Namespace) -> None:
    import uvicorn

    uvicorn.run("builder3d.server:app", host=args.host, port=args.port)


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(
        prog="builder3d",
        description="画像と文章から建物・内装・家具の 3D モデルを生成する",
    )
    sub = parser.add_subparsers(dest="command", required=True)

    p = sub.add_parser("gen", help="SceneSpec を生成")
    p.add_argument("instruction", help="作りたいものの指示文")
    p.add_argument("--image", action="append", help="参考画像(複数可)")
    p.add_argument("--category", default="all", choices=["all", "exterior", "interior", "furniture"])
    p.add_argument("-o", "--out", help="出力 JSON パス")
    p.set_defaults(func=cmd_gen)

    p = sub.add_parser("demo", help="サンプルシーンを出力")
    p.add_argument("-o", "--out", help="出力 JSON パス")
    p.set_defaults(func=cmd_demo)

    p = sub.add_parser("serve", help="Web UI を起動")
    p.add_argument("--host", default="127.0.0.1")
    p.add_argument("--port", type=int, default=8000)
    p.set_defaults(func=cmd_serve)

    args = parser.parse_args(argv)
    args.func(args)


if __name__ == "__main__":
    main()
