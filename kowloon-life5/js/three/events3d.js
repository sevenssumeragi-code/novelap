// ============================================================
// 季節イベントのオブジェクト3Dモデル (v4)
// 集会所の飾り台(y=床)に置く。中心が原点、床が y=0。
// ============================================================
import * as THREE from 'three';
import { box, cyl, sph, grp, rand, pick } from './prims.js';

const G = {};

// 桜の木 (お花見)
G.sakura = () => {
  const g = grp(cyl(0.18, 0.26, 1.6, 0x6a4a3a, { y: 0.8 }));
  // 枝
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    g.add(cyl(0.05, 0.08, 0.8, 0x6a4a3a, { x: Math.cos(a) * 0.3, y: 1.5, z: Math.sin(a) * 0.3, rz: Math.cos(a) * 0.6, rx: Math.sin(a) * 0.6 }));
  }
  // 花のかたまり
  const cols = [0xffc0d8, 0xffd8e4, 0xff9ac0];
  for (let i = 0; i < 22; i++) {
    g.add(sph(rand(0.22, 0.36), pick(cols), { x: rand(-1.1, 1.1), y: rand(1.7, 2.7), z: rand(-1.1, 1.1), roughness: 1 }));
  }
  g.userData.petals = true;   // ゲーム側で花びらを散らす
  return g;
};

// 笹の木 (七夕) — 短冊付き
G.bamboo = () => {
  const g = new THREE.Group();
  for (const [x, z, h] of [[0, 0, 2.6], [0.3, 0.2, 2.2], [-0.25, -0.15, 2.4]]) {
    g.add(cyl(0.06, 0.08, h, 0x5a8a3a, { x, y: h / 2, z }));
    // 葉
    for (let s = 0; s < 5; s++) {
      const yy = 0.7 + s * (h / 6);
      g.add(box(0.5, 0.04, 0.12, 0x4a9a3a, { x: x + rand(-0.3, 0.3), y: yy, z: z + rand(-0.2, 0.2), ry: rand(0, Math.PI), rz: rand(-0.4, 0.4) }));
    }
  }
  // 短冊(五色)
  const cols = [0xff5a5a, 0x5a8aff, 0xffd85a, 0x5ad07a, 0xd05af0, 0xffffff];
  for (let i = 0; i < 10; i++) {
    g.add(box(0.14, 0.24, 0.01, pick(cols), { x: rand(-0.4, 0.4), y: rand(1.0, 2.3), z: rand(-0.3, 0.3), rz: rand(-0.2, 0.2) }));
  }
  return g;
};

// クリスマスツリー
G.xmastree = () => {
  const g = grp(cyl(0.14, 0.18, 0.3, 0x6a4a3a, { y: 0.15 }));
  const green = 0x2a7a3a;
  g.add(new THREE.Mesh(new THREE.ConeGeometry(0.9, 1.0, 12), new THREE.MeshStandardMaterial({ color: green, roughness: 0.9 })));
  g.children[g.children.length - 1].position.y = 0.9;
  g.add(new THREE.Mesh(new THREE.ConeGeometry(0.72, 0.9, 12), new THREE.MeshStandardMaterial({ color: 0x2f8a44, roughness: 0.9 })));
  g.children[g.children.length - 1].position.y = 1.4;
  g.add(new THREE.Mesh(new THREE.ConeGeometry(0.52, 0.8, 12), new THREE.MeshStandardMaterial({ color: green, roughness: 0.9 })));
  g.children[g.children.length - 1].position.y = 1.95;
  // オーナメント
  const oc = [0xff4a4a, 0xffd84a, 0x4a8aff, 0xffffff, 0xff8ad0];
  for (let i = 0; i < 20; i++) {
    g.add(sph(0.07, pick(oc), { x: rand(-0.7, 0.7), y: rand(0.6, 2.2), z: rand(-0.7, 0.7), emissive: 0x332200, emissiveIntensity: 0.4 }));
  }
  // 星
  const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.16), new THREE.MeshStandardMaterial({ color: 0xffe45a, emissive: 0xffd23a, emissiveIntensity: 1.0 }));
  star.position.y = 2.5; g.add(star);
  return g;
};

// ハロウィンのかぼちゃ(ジャック・オ・ランタン)
G.pumpkin = () => {
  const g = new THREE.Group();
  for (const [x, z, s] of [[0, 0, 1], [0.7, 0.4, 0.7], [-0.6, 0.3, 0.6]]) {
    const p = grp(
      sph(0.5 * s, 0xe8863a, { y: 0.45 * s, sy: 0.85, roughness: 1 }),
      cyl(0.05 * s, 0.07 * s, 0.2 * s, 0x5a7a3a, { y: 0.85 * s }),
      // 目・口(発光)
      box(0.12 * s, 0.12 * s, 0.05, 0xffd23a, { x: -0.15 * s, y: 0.5 * s, z: 0.42 * s, emissive: 0xffb020, emissiveIntensity: 1.2 }),
      box(0.12 * s, 0.12 * s, 0.05, 0xffd23a, { x: 0.15 * s, y: 0.5 * s, z: 0.42 * s, emissive: 0xffb020, emissiveIntensity: 1.2 }),
      box(0.24 * s, 0.08 * s, 0.05, 0xffd23a, { y: 0.32 * s, z: 0.42 * s, emissive: 0xffb020, emissiveIntensity: 1.2 }),
    );
    p.position.set(x, 0, z);
    g.add(p);
  }
  return g;
};

// 正月の門松
G.kadomatsu = () => {
  const g = new THREE.Group();
  for (const side of [-0.5, 0.5]) {
    const k = grp(cyl(0.3, 0.32, 0.5, 0x2a2a30, { y: 0.25 }));   // 桶
    // 斜め切りの竹3本
    for (const [dx, dz, h] of [[0, 0, 1.2], [0.12, 0.08, 1.0], [-0.1, -0.06, 0.85]]) {
      k.add(cyl(0.06, 0.06, h, 0x8aa84a, { x: dx, y: 0.5 + h / 2, z: dz }));
      k.add(cyl(0.062, 0.01, 0.08, 0xd8e0a0, { x: dx, y: 0.5 + h, z: dz, rx: 0.4 }));  // 斜め口
    }
    k.add(box(0.4, 0.1, 0.4, 0x3a5a2a, { y: 0.5 }));   // 松
    k.add(sph(0.06, 0xd84a4a, { x: 0.1, y: 0.6, z: 0.2 })); // 梅
    k.position.set(side, 0, 0);
    g.add(k);
  }
  return g;
};

export function createEventObject(key) {
  const gen = G[key];
  if (!gen) return null;
  const g = gen();
  return g.isGroup ? g : grp(g);
}
