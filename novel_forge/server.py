"""Web UI(FastAPI)。

生成はすべて text/plain のチャンクストリーミングで返す。
起動: novel-forge serve  (または uvicorn novel_forge.server:app)
"""

from __future__ import annotations

from pathlib import Path
from typing import Iterator

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse, PlainTextResponse, StreamingResponse
from pydantic import BaseModel

from . import pipeline, state
from .llm import RefusalError

app = FastAPI(title="Novel Forge")

STATIC_DIR = Path(__file__).parent / "static"


class NewProject(BaseModel):
    title: str
    idea: str = ""
    genre: str = ""
    episodes: int = 12


def _load(slug: str) -> state.Project:
    try:
        return state.Project.load(slug)
    except FileNotFoundError:
        raise HTTPException(404, f"プロジェクト '{slug}' が見つかりません")


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


@app.get("/api/projects")
def list_projects() -> list[str]:
    return state.Project.list_all()


@app.post("/api/projects")
def create_project(body: NewProject) -> dict:
    try:
        project = state.Project.create(
            title=body.title, idea=body.idea, genre=body.genre, episodes=body.episodes
        )
    except FileExistsError as exc:
        raise HTTPException(409, str(exc))
    return {"slug": project.slug}


@app.get("/api/projects/{slug}")
def project_status(slug: str) -> dict:
    project = _load(slug)
    bible = project.load_bible()
    return {
        "slug": project.slug,
        "title": project.title,
        "genre": project.genre,
        "idea": project.idea,
        "episodes": project.episodes,
        "written": project.written_episodes(),
        "next_episode": project.next_episode(),
        "has_concept": bool(project.concept),
        "has_characters": bool(project.characters),
        "has_plot": bool(project.plot),
        "foreshadows": bible["foreshadows"],
        "summaries": bible["episodes"],
    }


_STAGES = {
    "concept": pipeline.build_concept,
    "characters": pipeline.build_characters,
    "plot": pipeline.build_plot,
}


@app.post("/api/projects/{slug}/stage/{stage}")
def run_stage(slug: str, stage: str) -> StreamingResponse:
    if stage not in _STAGES:
        raise HTTPException(400, f"不明なステージ: {stage}")
    project = _load(slug)
    return StreamingResponse(
        _safe_stream(_STAGES[stage](project)), media_type="text/plain; charset=utf-8"
    )


@app.post("/api/projects/{slug}/write")
def write_next(slug: str, episode: int | None = None, revise: bool = True) -> StreamingResponse:
    project = _load(slug)
    number = episode or project.next_episode()
    if number is None:
        raise HTTPException(409, "全話執筆済みです")
    return StreamingResponse(
        _safe_stream(pipeline.write_episode(project, number, revise=revise)),
        media_type="text/plain; charset=utf-8",
    )


@app.post("/api/projects/{slug}/write-all")
def write_all(slug: str, revise: bool = True) -> StreamingResponse:
    project = _load(slug)
    return StreamingResponse(
        _safe_stream(pipeline.write_remaining(project, revise=revise)),
        media_type="text/plain; charset=utf-8",
    )


@app.get("/api/projects/{slug}/episodes/{number}")
def read_episode(slug: str, number: int) -> PlainTextResponse:
    project = _load(slug)
    text = project.read_episode(number)
    if not text:
        raise HTTPException(404, "その話はまだ執筆されていません")
    return PlainTextResponse(text, media_type="text/plain; charset=utf-8")


@app.get("/api/projects/{slug}/export")
def export(slug: str) -> PlainTextResponse:
    project = _load(slug)
    return PlainTextResponse(project.export(), media_type="text/markdown; charset=utf-8")
