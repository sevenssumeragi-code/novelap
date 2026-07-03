"""BB劇場の台本生成プロンプトと出力スキーマ。"""

from __future__ import annotations

# 背景・BGM・感情はフロントエンド(static/index.html)の描画/演奏機能と 1:1 対応。
BACKGROUNDS: dict[str, str] = {
    "room": "アパートの一室(生活感のある部屋)",
    "park": "公園(ベンチと木)",
    "street": "商店街・路上",
    "school": "教室",
    "office": "オフィス",
    "conbini": "コンビニの前",
    "beach": "海辺",
    "night_city": "夜の繁華街(ネオン)",
}

BGM_MOODS: dict[str, str] = {
    "comical": "コミカル・ズッコケ(テンポの速いおちゃらけ曲)",
    "daily": "日常・平和(ゆるいポップ)",
    "tense": "緊迫・追い詰められる(焦燥感のあるループ)",
    "sad": "悲しい・しんみり",
    "epic": "熱い・決戦・クライマックス",
    "heartwarm": "心温まる・仲直り・エモい",
    "horror": "不穏・ホラー・嫌な予感",
}

EMOTIONS = ["normal", "happy", "angry", "sad", "shock", "smug"]

TIMES = ["day", "evening", "night"]

STORY_SCHEMA: dict = {
    "type": "object",
    "properties": {
        "title": {"type": "string", "description": "劇場のタイトル(短くキャッチーに)"},
        "scenes": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "background": {"type": "string", "enum": list(BACKGROUNDS)},
                    "time": {"type": "string", "enum": TIMES},
                    "bgm": {"type": "string", "enum": list(BGM_MOODS)},
                    "lines": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "speaker": {
                                    "type": "string",
                                    "description": "キャラクター名。地の文は「ナレーション」",
                                },
                                "text": {"type": "string"},
                                "emotion": {"type": "string", "enum": EMOTIONS},
                            },
                            "required": ["speaker", "text", "emotion"],
                            "additionalProperties": False,
                        },
                    },
                },
                "required": ["background", "time", "bgm", "lines"],
                "additionalProperties": False,
            },
        },
    },
    "required": ["title", "scenes"],
    "additionalProperties": False,
}

SYSTEM = """あなたは「BB劇場」(ニコニコ動画的なミーム文化のコント紙芝居)の凄腕脚本家兼選曲DJです。
与えられたキャラクター設定とテーマから、テンポの良い短編コント劇場の台本をJSONで出力します。

# 笑いの設計(最重要 — 台本を書く前に、思考の中で必ず設計すること)
1. **オチから逆算する**: まず最終シーンのオチ(意外だが、後から考えると必然の一撃)を決め、
   そこから逆算して各シーンにフリを配置する。夢オチ・打ち切りオチ・「なんだったんだ」だけで終わるのは禁止。
2. **天丼(コールバック)を最低1回**: 序盤で置いた台詞・小道具・言い訳を、忘れた頃に別の文脈で再登場させて回収する。
3. **キャラ設定そのものを伏線にする**: 各キャラの口癖・性格・弱点が、オチや急展開の原因になるよう組み込む。
   設定が「ただの飾り」になっている台本は書き直し。
4. **具体で笑わせる**: ボケは固有名詞・数字・変に細かいディテールで(「限定300体」「時給1050円」「徒歩30秒」など)。
   ツッコミは短く鋭く。説明台詞・長広舌は禁止。
5. **緩急の設計**: 静→動→静のリズムを作り、BGM選曲(bgm)と連動させる。
   途中に1回、空気の変わるシーン(horror や sad のフェイント)を入れると終盤の笑いが跳ねる。

# 作風
- ネットミーム構文パロディ風の、勢いとテンポで笑わせるコント調。
- 「〜、いいよ!」「やりますねぇ」のようなミーム的定型フレーズのパロディを、わざとらしくなりすぎない範囲で織り交ぜる。
- speaker「ナレーション」で場面説明や無慈悲なメタツッコミを入れると面白い。各シーンの冒頭はナレーション1行で始めるとテンポが良い。
- 名前のないモブ(「店員」「駅員」など)を1人だけ登場させるのは可。妙に人間味のあるモブは笑いになる。

# 厳守事項
- 各キャラのセリフは、与えられた設定・口調・一人称に厳密に従うこと。キャラ崩壊は禁止。
- 露骨な性的描写・過激な暴力・差別表現・実在の人物への誹謗中傷は禁止。下品さは「匂わせ」やパロディの範囲まで。
- セリフは1行あたり全角60文字以内。1シーンあたり4〜10行。
- 話者は、与えられたキャラクター名・「ナレーション」・モブ1名まで。
- background / time / bgm はシーンの内容・感情曲線に最も合うものを選ぶこと。bgm はあなたがDJとして「この場面にはこの曲」と選曲する。同じ bgm を全シーンで使い回さないこと。
- emotion はそのセリフを言うときの表情として最も近いものを選ぶこと。
"""


def build_user_prompt(theme: str, characters: list[dict], scene_count: int) -> str:
    """台本生成のユーザープロンプトを組み立てる。"""
    char_lines = []
    for c in characters:
        profile = (c.get("profile") or "").strip() or "(設定おまかせ。面白くなるよう自由に解釈してよい)"
        char_lines.append(f"- {c['name']}: {profile}")
    bg_lines = "\n".join(f"- {k}: {v}" for k, v in BACKGROUNDS.items())
    bgm_lines = "\n".join(f"- {k}: {v}" for k, v in BGM_MOODS.items())
    theme_text = theme.strip() or "おまかせ(キャラ設定から一番面白くなる日常コントを考える)"
    return f"""次の条件でBB劇場の台本JSONを書いてください。

# 登場キャラクター
{chr(10).join(char_lines)}

# テーマ・お題
{theme_text}

# シーン数
{scene_count}シーン(起承転結がつくように配分)

# 使える背景(background)
{bg_lines}

# 使えるBGM(bgm)
{bgm_lines}
"""
