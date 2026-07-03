"""Web UI(FastAPI)。

起動: builder3d serve  (または uvicorn builder3d.server:app)
"""

from __future__ import annotations

import base64
from pathlib import Path

from fastapi import FastAPI, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from . import pipeline
from .demo import demo_spec
from .llm import RefusalError

app = FastAPI(title="Builder3D")

STATIC_DIR = Path(__file__).parent / "static"
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

_ALLOWED_IMAGE = {"image/png", "image/jpeg", "image/webp", "image/gif"}
_MAX_IMAGE_BYTES = 5 * 1024 * 1024  # 1 枚あたり 5MB


@app.get("/")
def index() -> FileResponse:
    return FileResponse(STATIC_DIR / "index.html")


@app.get("/api/demo")
def demo() -> JSONResponse:
    """API キー不要のサンプルシーンを返す。"""
    return JSONResponse(demo_spec())


@app.post("/api/generate")
async def generate(
    instruction: str = Form(""),
    category: str = Form("all"),
    images: list[UploadFile] | None = None,
) -> JSONResponse:
    """画像 + 指示から SceneSpec を生成する。"""
    encoded: list[tuple[str, str]] = []
    for up in images or []:
        media = up.content_type or "image/png"
        if media not in _ALLOWED_IMAGE:
            raise HTTPException(400, f"未対応の画像形式です: {media}")
        data = await up.read()
        if len(data) > _MAX_IMAGE_BYTES:
            raise HTTPException(400, f"画像が大きすぎます(上限 5MB): {up.filename}")
        if data:
            encoded.append((media, base64.b64encode(data).decode("ascii")))

    if not encoded and not instruction.strip():
        raise HTTPException(400, "画像または文章による指示のいずれかが必要です。")

    try:
        spec = pipeline.generate_scene(instruction, category=category, images=encoded)
    except RefusalError as exc:
        raise HTTPException(422, str(exc))
    except Exception as exc:  # noqa: BLE001 — UI にエラーを届ける
        raise HTTPException(500, f"{type(exc).__name__}: {exc}")
    return JSONResponse(spec)
