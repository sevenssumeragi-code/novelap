"""生成パイプライン。

企画 → キャラクター → プロット → 各話(草稿 → 自己批評リライト → バイブル更新)
の各ステージを、ストリーミング可能なジェネレータとして提供する。
各ジェネレータは表示用テキストのチャンクを yield し、完了時に成果物を保存する。
"""

from __future__ import annotations

from typing import Iterator

from . import prompts, state
from .llm import NovelLLM


def _run_stage(llm: NovelLLM, user_prompt: str, max_tokens: int) -> Iterator[str]:
    yield from llm.stream_text(prompts.SYSTEM_CORE, user_prompt, max_tokens=max_tokens)


# ---------------------------------------------------------------------------
def build_concept(project: state.Project, llm: NovelLLM | None = None) -> Iterator[str]:
    llm = llm or NovelLLM()
    prompt = prompts.CONCEPT_PROMPT.format(
        title=project.title,
        genre=project.genre or "指定なし(アイデアから最適なジャンルを選ぶ)",
        idea=project.idea or "特になし(面白さ最優先で自由に発想する)",
        episodes=project.episodes,
    )
    chunks: list[str] = []
    for chunk in _run_stage(llm, prompt, max_tokens=16000):
        chunks.append(chunk)
        yield chunk
    project.concept = "".join(chunks)


# ---------------------------------------------------------------------------
def build_characters(project: state.Project, llm: NovelLLM | None = None) -> Iterator[str]:
    if not project.concept:
        raise RuntimeError("先に企画(concept)を生成してください")
    llm = llm or NovelLLM()
    prompt = prompts.CHARACTERS_PROMPT.format(concept=project.concept)
    chunks: list[str] = []
    for chunk in _run_stage(llm, prompt, max_tokens=16000):
        chunks.append(chunk)
        yield chunk
    project.characters = "".join(chunks)


# ---------------------------------------------------------------------------
def build_plot(project: state.Project, llm: NovelLLM | None = None) -> Iterator[str]:
    if not project.characters:
        raise RuntimeError("先にキャラクター設定を生成してください")
    llm = llm or NovelLLM()
    prompt = prompts.PLOT_PROMPT.format(
        episodes=project.episodes,
        concept=project.concept,
        characters=project.characters,
    )
    chunks: list[str] = []
    for chunk in _run_stage(llm, prompt, max_tokens=32000):
        chunks.append(chunk)
        yield chunk
    project.plot = "".join(chunks)


# ---------------------------------------------------------------------------
def write_episode(
    project: state.Project,
    number: int,
    llm: NovelLLM | None = None,
    revise: bool = True,
) -> Iterator[str]:
    """第 number 話を執筆する。

    1. バイブル(要約・未回収伏線・前話ラスト)を注入して草稿をストリーミング生成
    2. 品質チェックリストに基づく自己批評リライト
    3. 確定稿から要約・伏線・関係変化を構造化抽出してバイブルを更新
    """
    if not project.plot:
        raise RuntimeError("先にプロットを生成してください")
    llm = llm or NovelLLM()
    bible = project.load_bible()

    summaries = state.summaries_text(bible)
    open_fs = state.open_foreshadows_text(bible)
    prev = project.read_episode(number - 1)
    previous_tail = prev[-600:] if prev else "(前話はありません)"

    draft_prompt = prompts.EPISODE_PROMPT.format(
        number=number,
        concept=project.concept,
        characters=project.characters,
        plot=project.plot,
        summaries=summaries,
        open_foreshadows=open_fs,
        previous_tail=previous_tail,
        length_hint=project.length_hint,
    )

    yield f"\n===== 第{number}話 草稿を執筆中 =====\n\n"
    draft_chunks: list[str] = []
    for chunk in _run_stage(llm, draft_prompt, max_tokens=32000):
        draft_chunks.append(chunk)
        yield chunk
    final_text = "".join(draft_chunks)

    if revise:
        yield f"\n\n===== 第{number}話 自己批評リライト中 =====\n\n"
        revise_prompt = prompts.REVISE_PROMPT.format(
            number=number,
            draft=final_text,
            summaries=summaries,
            open_foreshadows=open_fs,
        )
        revised_chunks: list[str] = []
        for chunk in _run_stage(llm, revise_prompt, max_tokens=32000):
            revised_chunks.append(chunk)
            yield chunk
        final_text = "".join(revised_chunks)

    project.save_episode(number, final_text)

    yield f"\n\n===== ストーリーバイブル更新中 =====\n"
    update_prompt = prompts.UPDATE_PROMPT.format(
        number=number, text=final_text, open_foreshadows=open_fs
    )
    update = llm.complete_json(
        prompts.SYSTEM_CORE, update_prompt, prompts.UPDATE_SCHEMA
    )
    bible = state.apply_update(bible, number, update)
    project.save_bible(bible)

    planted = len(update.get("new_foreshadows", []))
    resolved = len(update.get("resolved_foreshadow_ids", []))
    open_count = sum(1 for f in bible["foreshadows"] if f["resolved_in"] is None)
    yield (
        f"完了: 第{number}話を保存しました"
        f"(伏線 +{planted} / 回収 {resolved} / 未回収 {open_count})\n"
    )


# ---------------------------------------------------------------------------
def write_remaining(
    project: state.Project, llm: NovelLLM | None = None, revise: bool = True
) -> Iterator[str]:
    """未執筆の話を最終話まで連続して書く。"""
    llm = llm or NovelLLM()
    while (number := project.next_episode()) is not None:
        yield from write_episode(project, number, llm=llm, revise=revise)
