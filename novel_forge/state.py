"""プロジェクトとストーリーバイブルの永続化。

ディレクトリ構成:
    projects/<slug>/
        project.json      … 設定(タイトル、アイデア、話数など)
        bible.json        … ストーリーバイブル(伏線台帳・要約・関係変化)
        concept.md        … 企画書
        characters.md     … キャラクター設定
        plot.md           … 全話プロット
        episodes/ep001.md … 各話本文
"""

from __future__ import annotations

import json
import os
import re
import unicodedata
from dataclasses import dataclass
from pathlib import Path

PROJECTS_DIR = Path(os.environ.get("NOVEL_FORGE_HOME", Path.cwd() / "projects"))


def slugify(title: str) -> str:
    text = unicodedata.normalize("NFKC", title).strip()
    text = re.sub(r"[\\/:*?\"<>|\s]+", "-", text)
    return text[:60] or "novel"


@dataclass
class Project:
    slug: str
    title: str
    idea: str
    genre: str
    episodes: int
    length_hint: str = "3000〜5000字"

    # ------------------------------------------------------------------
    @property
    def dir(self) -> Path:
        return PROJECTS_DIR / self.slug

    @property
    def episodes_dir(self) -> Path:
        return self.dir / "episodes"

    # ------------------------------------------------------------------
    @classmethod
    def create(cls, title: str, idea: str, genre: str, episodes: int) -> "Project":
        project = cls(slug=slugify(title), title=title, idea=idea, genre=genre, episodes=episodes)
        if project.dir.exists():
            raise FileExistsError(f"プロジェクト '{project.slug}' は既に存在します")
        project.episodes_dir.mkdir(parents=True)
        project.save()
        project.save_bible(_empty_bible())
        return project

    @classmethod
    def load(cls, slug: str) -> "Project":
        path = PROJECTS_DIR / slug / "project.json"
        data = json.loads(path.read_text(encoding="utf-8"))
        return cls(**data)

    @classmethod
    def list_all(cls) -> list[str]:
        if not PROJECTS_DIR.exists():
            return []
        return sorted(
            p.name for p in PROJECTS_DIR.iterdir() if (p / "project.json").exists()
        )

    def save(self) -> None:
        data = {
            "slug": self.slug,
            "title": self.title,
            "idea": self.idea,
            "genre": self.genre,
            "episodes": self.episodes,
            "length_hint": self.length_hint,
        }
        (self.dir / "project.json").write_text(
            json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8"
        )

    # -- ステージ成果物 -------------------------------------------------
    def _read(self, name: str) -> str:
        path = self.dir / name
        return path.read_text(encoding="utf-8") if path.exists() else ""

    def _write(self, name: str, text: str) -> None:
        (self.dir / name).write_text(text, encoding="utf-8")

    @property
    def concept(self) -> str:
        return self._read("concept.md")

    @concept.setter
    def concept(self, text: str) -> None:
        self._write("concept.md", text)

    @property
    def characters(self) -> str:
        return self._read("characters.md")

    @characters.setter
    def characters(self, text: str) -> None:
        self._write("characters.md", text)

    @property
    def plot(self) -> str:
        return self._read("plot.md")

    @plot.setter
    def plot(self, text: str) -> None:
        self._write("plot.md", text)

    # -- 各話本文 --------------------------------------------------------
    def episode_path(self, number: int) -> Path:
        return self.episodes_dir / f"ep{number:03d}.md"

    def save_episode(self, number: int, text: str) -> None:
        self.episode_path(number).write_text(text, encoding="utf-8")

    def read_episode(self, number: int) -> str:
        path = self.episode_path(number)
        return path.read_text(encoding="utf-8") if path.exists() else ""

    def written_episodes(self) -> list[int]:
        return sorted(
            int(p.stem[2:]) for p in self.episodes_dir.glob("ep*.md")
        )

    def next_episode(self) -> int | None:
        written = self.written_episodes()
        nxt = (written[-1] + 1) if written else 1
        return nxt if nxt <= self.episodes else None

    def export(self) -> str:
        parts = [f"# {self.title}\n"]
        for n in self.written_episodes():
            parts.append(self.read_episode(n).strip())
        return "\n\n\n".join(parts) + "\n"

    # -- ストーリーバイブル ----------------------------------------------
    def load_bible(self) -> dict:
        path = self.dir / "bible.json"
        if path.exists():
            return json.loads(path.read_text(encoding="utf-8"))
        return _empty_bible()

    def save_bible(self, bible: dict) -> None:
        (self.dir / "bible.json").write_text(
            json.dumps(bible, ensure_ascii=False, indent=2), encoding="utf-8"
        )


def _empty_bible() -> dict:
    return {
        "episodes": [],      # {number, summary, cliffhanger, relationship_changes, character_updates}
        "foreshadows": [],   # {id, description, planted_in, resolved_in(None=未回収)}
    }


# ---------------------------------------------------------------------------
# バイブルから執筆コンテキストを組み立てるヘルパー
# ---------------------------------------------------------------------------

def open_foreshadows_text(bible: dict) -> str:
    items = [f for f in bible["foreshadows"] if f.get("resolved_in") is None]
    if not items:
        return "(未回収の伏線はまだありません)"
    return "\n".join(
        f"- id={f['id']}: {f['description']}(第{f['planted_in']}話で提示)" for f in items
    )


def summaries_text(bible: dict) -> str:
    if not bible["episodes"]:
        return "(これが第1話です。前の話はありません)"
    lines = []
    for ep in bible["episodes"]:
        lines.append(f"## 第{ep['number']}話の要約\n{ep['summary']}")
        if ep.get("relationship_changes"):
            lines.append("関係性の変化: " + " / ".join(ep["relationship_changes"]))
        if ep.get("cliffhanger"):
            lines.append(f"ラストの引き: {ep['cliffhanger']}")
    return "\n".join(lines)


def apply_update(bible: dict, number: int, update: dict) -> dict:
    """各話確定後の抽出結果をバイブルに反映する。"""
    next_id = max((f["id"] for f in bible["foreshadows"]), default=0) + 1
    for item in update.get("new_foreshadows", []):
        bible["foreshadows"].append(
            {
                "id": next_id,
                "description": item["description"],
                "planted_in": number,
                "resolved_in": None,
            }
        )
        next_id += 1
    resolved = set(update.get("resolved_foreshadow_ids", []))
    for f in bible["foreshadows"]:
        if f["id"] in resolved and f["resolved_in"] is None:
            f["resolved_in"] = number
    bible["episodes"] = [ep for ep in bible["episodes"] if ep["number"] != number]
    bible["episodes"].append(
        {
            "number": number,
            "summary": update.get("summary", ""),
            "cliffhanger": update.get("cliffhanger", ""),
            "relationship_changes": update.get("relationship_changes", []),
            "character_updates": update.get("character_updates", []),
        }
    )
    bible["episodes"].sort(key=lambda ep: ep["number"])
    return bible
