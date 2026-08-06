// ============================================================
// 動物 (屋上の猫・鳥 / 地上の犬) — ローポリ
// 返り値の Group に userData.kind を持たせ、game.js 側で揺れ動かす。
// ============================================================
import * as THREE from 'three';
import { box, cyl, sph, grp } from './prims.js';

// 三毛猫(お座り)
export function createCat() {
  const c = 0xe8b878, w = 0xf4f0e8, d = 0x5a4634;
  const g = grp(
    // 体(お座り)
    sph(0.22, c, { y: 0.22, sy: 1.2 }),
    box(0.34, 0.18, 0.3, c, { y: 0.12 }),
    // 前脚
    cyl(0.05, 0.05, 0.22, w, { x: -0.09, y: 0.11, z: 0.16 }),
    cyl(0.05, 0.05, 0.22, w, { x: 0.09, y: 0.11, z: 0.16 }),
    // 頭
    sph(0.17, c, { y: 0.42, z: 0.12 }),
    // 耳
    box(0.08, 0.1, 0.03, d, { x: -0.1, y: 0.55, z: 0.12, rz: 0.3 }),
    box(0.08, 0.1, 0.03, d, { x: 0.1, y: 0.55, z: 0.12, rz: -0.3 }),
    // 目・鼻
    sph(0.025, 0x2a2a2a, { x: -0.06, y: 0.44, z: 0.26 }),
    sph(0.025, 0x2a2a2a, { x: 0.06, y: 0.44, z: 0.26 }),
    sph(0.02, 0xd06a7a, { y: 0.4, z: 0.28 }),
  );
  // しっぽ(揺らす対象)
  const tail = grp(cyl(0.04, 0.05, 0.4, c, { y: 0.2 }));
  tail.position.set(0, 0.12, -0.18);
  tail.rotation.x = -0.9;
  g.add(tail);
  g.userData = { kind: 'cat', tail, baseY: 0 };
  return g;
}

// 小鳥(青)
export function createBird() {
  const b = 0x4a8ad8, belly = 0xf0f0f0, beak = 0xe8a030;
  const g = grp(
    sph(0.13, b, { y: 0.13, sz: 1.3 }),          // 体
    sph(0.08, belly, { y: 0.1, z: 0.08, sz: 1.1 }), // お腹
    sph(0.1, b, { y: 0.24, z: 0.06 }),            // 頭
    box(0.06, 0.04, 0.08, beak, { y: 0.23, z: 0.18 }), // くちばし
    sph(0.02, 0x2a2a2a, { x: -0.05, y: 0.26, z: 0.12 }),
    sph(0.02, 0x2a2a2a, { x: 0.05, y: 0.26, z: 0.12 }),
    // 脚
    cyl(0.012, 0.012, 0.08, beak, { x: -0.04, y: 0.02 }),
    cyl(0.012, 0.012, 0.08, beak, { x: 0.04, y: 0.02 }),
    // 尾
    box(0.1, 0.03, 0.14, b, { y: 0.12, z: -0.16, rx: 0.3 }),
  );
  // 翼(羽ばたき対象)
  const wingL = box(0.16, 0.03, 0.12, b, { });
  wingL.position.set(-0.12, 0.14, 0);
  const wingR = box(0.16, 0.03, 0.12, b, { });
  wingR.position.set(0.12, 0.14, 0);
  g.add(wingL, wingR);
  g.userData = { kind: 'bird', wingL, wingR, baseY: 0 };
  return g;
}

// 犬(茶・お座り気味)
export function createDog() {
  const c = 0xb07a4a, d = 0x8a5a30, w = 0xe8d8c0;
  const g = grp(
    // 体
    box(0.4, 0.34, 0.66, c, { y: 0.4 }),
    // 脚
    cyl(0.07, 0.07, 0.4, c, { x: -0.13, y: 0.2, z: 0.22 }),
    cyl(0.07, 0.07, 0.4, c, { x: 0.13, y: 0.2, z: 0.22 }),
    cyl(0.07, 0.07, 0.4, c, { x: -0.13, y: 0.2, z: -0.22 }),
    cyl(0.07, 0.07, 0.4, c, { x: 0.13, y: 0.2, z: -0.22 }),
    // 頭
    sph(0.24, c, { y: 0.62, z: 0.36 }),
    box(0.18, 0.14, 0.2, w, { y: 0.56, z: 0.5 }),   // マズル
    sph(0.05, 0x2a2a2a, { y: 0.56, z: 0.62 }),      // 鼻
    // 垂れ耳
    box(0.1, 0.22, 0.04, d, { x: -0.2, y: 0.62, z: 0.32, rz: 0.2 }),
    box(0.1, 0.22, 0.04, d, { x: 0.2, y: 0.62, z: 0.32, rz: -0.2 }),
    // 目
    sph(0.03, 0x2a2a2a, { x: -0.1, y: 0.68, z: 0.55 }),
    sph(0.03, 0x2a2a2a, { x: 0.1, y: 0.68, z: 0.55 }),
  );
  // しっぽ(振る対象)
  const tail = grp(cyl(0.05, 0.03, 0.34, c, { y: 0.17 }));
  tail.position.set(0, 0.4, -0.33);
  tail.rotation.x = 0.8;
  g.add(tail);
  g.userData = { kind: 'dog', tail, baseY: 0 };
  return g;
}
