"""Claude API 呼び出し層(画像対応)。

デフォルトは claude-opus-4-8(vision + 構造化出力に安定)。
BUILDER3D_MODEL 環境変数でモデルを切り替えられる。
"""

from __future__ import annotations

import json
import os
from typing import Any

import anthropic

DEFAULT_MODEL = os.environ.get("BUILDER3D_MODEL", "claude-opus-4-8")
FALLBACK_MODEL = "claude-opus-4-8"
DEFAULT_EFFORT = os.environ.get("BUILDER3D_EFFORT", "high")


class RefusalError(RuntimeError):
    """リクエストが安全上の理由で拒否された。"""


class DesignLLM:
    def __init__(self, model: str = DEFAULT_MODEL, effort: str = DEFAULT_EFFORT):
        self.client = anthropic.Anthropic()
        self.model = model
        self.effort = effort

    # ------------------------------------------------------------------
    def _user_content(
        self, text: str, images: list[tuple[str, str]] | None
    ) -> list[dict[str, Any]] | str:
        """画像があれば content ブロック配列を、なければ素の文字列を返す。

        images: (media_type, base64_data) のリスト。
        """
        if not images:
            return text
        blocks: list[dict[str, Any]] = []
        for media_type, data in images:
            blocks.append(
                {
                    "type": "image",
                    "source": {"type": "base64", "media_type": media_type, "data": data},
                }
            )
        blocks.append({"type": "text", "text": text})
        return blocks

    # ------------------------------------------------------------------
    def design_scene(
        self,
        system: str,
        user: str,
        schema: dict,
        images: list[tuple[str, str]] | None = None,
        max_tokens: int = 16000,
    ) -> dict:
        """画像+指示から構造化された SceneSpec(JSON)を得る。"""
        kwargs: dict[str, Any] = {
            "model": self.model,
            "max_tokens": max_tokens,
            "system": [
                {"type": "text", "text": system, "cache_control": {"type": "ephemeral"}}
            ],
            "messages": [{"role": "user", "content": self._user_content(user, images)}],
            "output_config": {
                "effort": self.effort,
                "format": {"type": "json_schema", "schema": schema},
            },
        }
        if self.model.startswith("claude-fable") or self.model.startswith("claude-mythos"):
            kwargs["betas"] = ["server-side-fallback-2026-06-01"]
            kwargs["fallbacks"] = [{"model": FALLBACK_MODEL}]
        else:
            kwargs["thinking"] = {"type": "adaptive"}

        response = self.client.beta.messages.create(**kwargs)
        if response.stop_reason == "refusal":
            raise RefusalError(
                "リクエストが安全上の理由で拒否されました。指示や画像を調整して再試行してください。"
            )
        text = next(b.text for b in response.content if b.type == "text")
        return json.loads(text)
