"""Claude API 呼び出し層。

デフォルトモデルは claude-fable-5(思考は常時オン、`thinking` パラメータは送らない)。
Fable 5 では安全分類器によるリフューザル(stop_reason == "refusal")が起こり得るため、
サーバーサイドフォールバック(claude-opus-4-8)をデフォルトで有効にする。
NOVEL_FORGE_MODEL 環境変数で他モデル(例: claude-opus-4-8)にも切り替えられる。
"""

from __future__ import annotations

import json
import os
from typing import Any, Iterator

import anthropic

DEFAULT_MODEL = os.environ.get("NOVEL_FORGE_MODEL", "claude-fable-5")
FALLBACK_MODEL = "claude-opus-4-8"
DEFAULT_EFFORT = os.environ.get("NOVEL_FORGE_EFFORT", "high")


class RefusalError(RuntimeError):
    """リクエストが安全上の理由で拒否された(フォールバック含め全滅)。"""


class NovelLLM:
    def __init__(self, model: str = DEFAULT_MODEL, effort: str = DEFAULT_EFFORT):
        self.client = anthropic.Anthropic()
        self.model = model
        self.effort = effort

    # ------------------------------------------------------------------
    def _kwargs(
        self,
        system: str,
        user: str,
        max_tokens: int,
        schema: dict | None = None,
    ) -> dict[str, Any]:
        kwargs: dict[str, Any] = {
            "model": self.model,
            "max_tokens": max_tokens,
            "system": [
                {
                    "type": "text",
                    "text": system,
                    "cache_control": {"type": "ephemeral"},
                }
            ],
            "messages": [{"role": "user", "content": user}],
            "output_config": {"effort": self.effort},
        }
        if self.model.startswith("claude-fable") or self.model.startswith("claude-mythos"):
            # Fable/Mythos: thinking は常時オン(パラメータ自体を送らない)。
            # リフューザル時は Opus 4.8 に同一リクエストで自動フォールバック。
            kwargs["betas"] = ["server-side-fallback-2026-06-01"]
            kwargs["fallbacks"] = [{"model": FALLBACK_MODEL}]
        else:
            kwargs["thinking"] = {"type": "adaptive"}
        if schema is not None:
            kwargs["output_config"]["format"] = {
                "type": "json_schema",
                "schema": schema,
            }
        return kwargs

    # ------------------------------------------------------------------
    def stream_text(self, system: str, user: str, max_tokens: int = 32000) -> Iterator[str]:
        """本文をストリーミング生成する。チャンク文字列を逐次 yield する。"""
        kwargs = self._kwargs(system, user, max_tokens)
        with self.client.beta.messages.stream(**kwargs) as stream:
            for chunk in stream.text_stream:
                yield chunk
            final = stream.get_final_message()
        if final.stop_reason == "refusal":
            raise RefusalError(
                "リクエストが安全上の理由で拒否されました。題材の表現を調整して再試行してください。"
            )

    # ------------------------------------------------------------------
    def complete_text(self, system: str, user: str, max_tokens: int = 32000) -> str:
        """ストリーミングしつつ全文を返す(内部用)。"""
        return "".join(self.stream_text(system, user, max_tokens=max_tokens))

    # ------------------------------------------------------------------
    def complete_json(
        self, system: str, user: str, schema: dict, max_tokens: int = 8000
    ) -> dict:
        """構造化出力(JSON Schema)で応答を得る。"""
        kwargs = self._kwargs(system, user, max_tokens, schema=schema)
        response = self.client.beta.messages.create(**kwargs)
        if response.stop_reason == "refusal":
            raise RefusalError("リクエストが安全上の理由で拒否されました。")
        text = next(b.text for b in response.content if b.type == "text")
        return json.loads(text)
