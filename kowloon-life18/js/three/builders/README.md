# js/three/builders — 九龍城風3D空間のビルダー群

## これは何か

`kowloon-threejs`（Vite製の3D探索プロトタイプ）から移植した、
九龍城風の通路・壁・床・配管・照明・看板・小物を手続き生成するモジュール群です。

**STEP 1 時点ではまだどこからも import されていません。**
既存の `game.js` / `floors.js` の挙動には一切影響しません。

## 出所

| 項目 | 内容 |
|---|---|
| 移植元 | `C:\Users\kazut\OneDrive\デスクトップ\kowloon-threejs\src\world\builders\` |
| 移植日 | 2026-08-08（STEP 1） |
| 改造 | **なし**（3ファイルとも byte-identical でコピー） |
| 対象 three | **r160**（`lib/three.module.js` 同梱版） |

移植元は three 0.180.0 用でしたが、使用している three API 30種すべてが r160 に存在することを
確認済みです。r160 実機での実行検証も通っています。

## 依存関係

```
textures.js      → three
roomBuilder.js   → three, three/addons/utils/BufferGeometryUtils.js, ./textures.js
propBuilder.js   → three, three/addons/utils/BufferGeometryUtils.js,
                   ./roomBuilder.js, ./textures.js
```

bare specifier（`three` / `three/addons/`）は `index.html` の importmap で解決されます。
**ビルド不要・importmap・完全オフラインの方式を維持しています。**

`three/addons/utils/BufferGeometryUtils.js` は STEP 1 で
`lib/addons/utils/BufferGeometryUtils.js` として追加した **r160 版**です
（0.180.0 版ではありません）。使っているのは `mergeGeometries` のみ。

## 各ファイルの役割

### textures.js
Canvas 2D による手続き生成テクスチャ。外部画像ゼロ。生成は一度きりでキャッシュされます。

- 床: 古びた白黒市松タイル（色むら・欠け・下地露出・摩耗）
- 壁: 汚れコンクリート / 古い小口タイル / 錆びた金属板 / 塗装板
- 天井: すす汚れ
- 汚しデカール用アトラス2種（壁: 黒ずみ・カビ・錆の垂れ・雨染み / 床: 黒ずみ・油・水たまり跡・散り）
- ネオン看板・塗装看板・洗濯物・加算合成用グロー

### roomBuilder.js
構造の生成。

- `createCorridorSegment` — 開口部を指定できる通路（床・天井・両側の壁・端の栓）
- `createRoom` / `createBox` / `createWallWithDoorway`
- `applyBoxUV` — UVを実寸基準に焼き込み、マテリアル共有のままタイリングを揃える
- `mergeGroupByMaterial` — マテリアル単位でジオメトリを結合しドローコールを削減
- `createInvisibleCollider` — 描画なしの当たり判定専用ボックス
- `MATERIALS` — 共有マテリアル群（`userData.shared` 付きで誤破棄を防止）

### propBuilder.js
小物・設備・演出。

- 配管（太さ・色違い）・継ぎ手・留め具、電線（たわみ付き）
- 蛍光灯（色温度指定・光源なしモード）、ネオン看板、塗装看板
- 窓・換気扇・室外機・シャッター・暖簾
- 洗濯物、丸椅子、ゴミ袋、植木鉢、電気メーター、配電箱、段ボール/木箱/バケツ/瓶
- `createDecal` — 乗算合成の汚し（ライト計算に参加しないため実質無料）
- `createLightSpill` — 加算合成でネオンの映り込みを表現（光源数を増やさない）
- `createInstancedProps` — 同形状の小物を1ドローコールにまとめる

## 移植元との再同期について

3ファイルは移植元と byte-identical です。移植元を更新した場合は差分をそのまま持ち込めます。
life18 側で改造を入れる場合は、このREADMEに変更点を追記してください。
