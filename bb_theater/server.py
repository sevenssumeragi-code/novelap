"""BB劇場メーカーの Web サーバー(FastAPI)。

台本生成は Claude(novel_forge.llm.NovelLLM を再利用)で行い、
JSON テキストを text/plain のチャンクストリーミングで返す。
起動: bb-theater  (または uvicorn bb_theater.server:app)
"""

from __future__ import annotations

from pathlib import Path
from typing import Iterator

from fastapi import FastAPI
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel, Field

from novel_forge.llm import NovelLLM, RefusalError

from .prompts import STORY_SCHEMA, SYSTEM, build_user_prompt

app = FastAPI(title="BB劇場メーカー")

STATIC_DIR = Path(__file__).parent / "static"


class CharacterSpec(BaseModel):
    name: str
    profile: str = ""


class StoryRequest(BaseModel):
    theme: str = ""
    scene_count: int = Field(5, ge=1, le=10)
    characters: list[CharacterSpec] = Field(..., min_length=1, max_length=8)


def _safe_stream(gen: Iterator[str]) -> Iterator[str]:
    try:
        yield from gen
    except RefusalError as exc:
        yield f"\n[エラー] {exc}\n"
    except Exception as exc:  # noqa: BLE001 — UI に必ずエラーを届ける
        yield f"\n[エラー] {type(exc).__name__}: {exc}\n"


@app.get("/")
def index() -> FileResponse:
    return FileResponse(STATIC_DIR / "index.html")


@app.post("/api/story")
def make_story(body: StoryRequest) -> StreamingResponse:
    llm = NovelLLM()
    user = build_user_prompt(
        theme=body.theme,
        characters=[c.model_dump() for c in body.characters],
        scene_count=body.scene_count,
    )
    return StreamingResponse(
        _safe_stream(llm.stream_text(SYSTEM, user, max_tokens=16000, schema=STORY_SCHEMA)),
        media_type="text/plain; charset=utf-8",
    )
