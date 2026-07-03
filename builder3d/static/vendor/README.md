# Vendored libraries

このディレクトリには [three.js](https://threejs.org/) **r160** をローカル同梱しています
(外部 CDN に依存せず、オフライン/制限環境でも動くようにするため)。

- `three.module.js` — three.js コアモジュール
- `addons/` — three.js `examples/jsm` の一部
  (OrbitControls, PointerLockControls, GLTFExporter, OBJExporter,
  RoomEnvironment, utils/TextureUtils)

three.js は MIT ライセンスです。Copyright © 2010-2024 three.js authors.
更新する場合は `npm pack three@<version>` で取得したファイルで差し替えてください。
