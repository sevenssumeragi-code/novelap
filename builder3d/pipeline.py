"""生成パイプライン: 画像 + 指示 → SceneSpec(JSON)。"""

from __future__ import annotations

from .llm import DesignLLM
from .prompts import SYSTEM, build_user_prompt
from .schema import SCENE_SCHEMA


def generate_scene(
    instruction: str,
    category: str = "all",
    images: list[tuple[str, str]] | None = None,
    llm: DesignLLM | None = None,
) -> dict:
    """SceneSpec を生成して返す。

    images: (media_type, base64_data) のリスト(任意)。
    """
    llm = llm or DesignLLM()
    user = build_user_prompt(instruction, category, has_image=bool(images))
    spec = llm.design_scene(SYSTEM, user, SCENE_SCHEMA, images=images)
    return spec
