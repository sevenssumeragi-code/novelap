"""シーン定義(SceneSpec)の JSON Schema。

Claude はアップロード画像と文章指示から、この構造化データを出力する。
フロントエンド(Three.js)がこの定義を読んで、実際の 3D ジオメトリと
PBR マテリアル・最大 8K の手続き型テクスチャを生成する。

すべての寸法は「メートル」。座標系は建物中心を原点、地面 y=0、
X=正面幅方向、Z=奥行き方向、Y=高さ方向。
"""

from __future__ import annotations

MATERIAL_KINDS = [
    "wood", "brick", "plaster", "concrete", "marble", "stone",
    "metal", "glass", "fabric", "leather", "tile", "grass", "roof", "paint",
]

FURNITURE_TYPES = [
    "sofa", "armchair", "coffeetable", "diningtable", "chair", "stool", "bench",
    "bed", "nightstand", "wardrobe", "dresser", "desk", "bookshelf", "shelf",
    "cabinet", "tvstand", "tv", "lamp", "floorlamp", "rug", "plant", "painting",
    "mirror", "kitchencounter", "fridge", "stove", "sink", "bathtub", "toilet",
    "curtain", "window_interior", "door_interior", "box",
]

SCENE_SCHEMA: dict = {
    "type": "object",
    "additionalProperties": False,
    "properties": {
        "name": {"type": "string", "description": "モデル名"},
        "style": {"type": "string", "description": "建築/インテリアの様式(例: 北欧モダン, 和風, ゴシック)"},
        "summary": {"type": "string", "description": "日本語で 1〜2 文の説明"},
        "building": {
            "type": "object",
            "additionalProperties": False,
            "description": "建物の外観。内装のみを作る場合でも外殻として使う。",
            "properties": {
                "width": {"type": "number", "description": "正面幅(m)"},
                "depth": {"type": "number", "description": "奥行き(m)"},
                "floors": {"type": "integer", "description": "階数", "minimum": 1, "maximum": 6},
                "floorHeight": {"type": "number", "description": "1 階あたりの高さ(m)"},
                "wallMaterial": {"type": "string", "description": "外壁の materialId"},
                "roof": {
                    "type": "object",
                    "additionalProperties": False,
                    "properties": {
                        "type": {"type": "string", "enum": ["gable", "hip", "flat", "pyramid", "shed"]},
                        "height": {"type": "number"},
                        "overhang": {"type": "number"},
                        "material": {"type": "string"},
                    },
                    "required": ["type", "height", "material"],
                },
                "features": {
                    "type": "array",
                    "description": "窓・扉・バルコニーなど外観の要素",
                    "items": {
                        "type": "object",
                        "additionalProperties": False,
                        "properties": {
                            "kind": {"type": "string", "enum": ["window", "door", "balcony", "garage", "column", "awning", "sign"]},
                            "side": {"type": "string", "enum": ["front", "back", "left", "right"]},
                            "floor": {"type": "integer"},
                            "u": {"type": "number", "description": "その面に沿った水平位置 0..1"},
                            "width": {"type": "number"},
                            "height": {"type": "number"},
                            "sill": {"type": "number", "description": "床からの高さ(m)"},
                            "material": {"type": "string"},
                        },
                        "required": ["kind", "side", "floor", "u", "width", "height"],
                    },
                },
            },
            "required": ["width", "depth", "floors", "floorHeight", "wallMaterial", "roof"],
        },
        "rooms": {
            "type": "array",
            "description": "内装の部屋。床スラブと壁色の指定に使う。",
            "items": {
                "type": "object",
                "additionalProperties": False,
                "properties": {
                    "name": {"type": "string"},
                    "floor": {"type": "integer"},
                    "x": {"type": "number", "description": "部屋中心の X 座標(m)"},
                    "z": {"type": "number", "description": "部屋中心の Z 座標(m)"},
                    "width": {"type": "number"},
                    "depth": {"type": "number"},
                    "wallMaterial": {"type": "string"},
                    "floorMaterial": {"type": "string"},
                },
                "required": ["name", "floor", "x", "z", "width", "depth", "floorMaterial"],
            },
        },
        "furniture": {
            "type": "array",
            "description": "家具・設備。x,z は建物中心を原点とする座標(m)。",
            "items": {
                "type": "object",
                "additionalProperties": False,
                "properties": {
                    "type": {"type": "string", "enum": FURNITURE_TYPES},
                    "name": {"type": "string"},
                    "floor": {"type": "integer"},
                    "x": {"type": "number"},
                    "z": {"type": "number"},
                    "rotation": {"type": "number", "description": "Y 軸回転(度)"},
                    "width": {"type": "number"},
                    "depth": {"type": "number"},
                    "height": {"type": "number"},
                    "material": {"type": "string"},
                    "color": {"type": "string", "description": "#RRGGBB(材質より優先)"},
                },
                "required": ["type", "x", "z"],
            },
        },
        "materials": {
            "type": "array",
            "description": "マテリアル定義。id で各所から参照する。",
            "items": {
                "type": "object",
                "additionalProperties": False,
                "properties": {
                    "id": {"type": "string"},
                    "kind": {"type": "string", "enum": MATERIAL_KINDS},
                    "color": {"type": "string", "description": "#RRGGBB"},
                    "roughness": {"type": "number", "minimum": 0, "maximum": 1},
                    "metalness": {"type": "number", "minimum": 0, "maximum": 1},
                    "textureScale": {"type": "number", "description": "テクスチャの繰り返し密度(m あたり)"},
                    "emissive": {"type": "string", "description": "#RRGGBB(発光。照明などに)"},
                },
                "required": ["id", "kind", "color"],
            },
        },
        "ground": {
            "type": "object",
            "additionalProperties": False,
            "properties": {
                "material": {"type": "string"},
                "size": {"type": "number", "description": "地面の一辺(m)"},
            },
        },
        "lighting": {
            "type": "object",
            "additionalProperties": False,
            "properties": {
                "timeOfDay": {"type": "string", "enum": ["day", "sunset", "night", "studio"]},
                "sunIntensity": {"type": "number"},
                "ambient": {"type": "number"},
            },
        },
    },
    "required": ["name", "building", "materials"],
}
