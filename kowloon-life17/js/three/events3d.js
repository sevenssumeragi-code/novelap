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

// ひな人形(段飾り)
G.hinadolls = () => {
  const g = new THREE.Group();
  // 赤い緋毛氈の3段
  for (let t = 0; t < 3; t++) {
    const w = 2.4 - t * 0.5;
    g.add(box(w, 0.18, 0.7, 0xc22a3a, { y: 0.1 + t * 0.42, z: -t * 0.55 }));
  }
  // 内裏雛(上段の男雛・女雛)
  const doll = (x, robe, crown) => grp(
    cyl(0.14, 0.18, 0.32, robe, { y: 0.16 }),       // 着物(台形風)
    sph(0.11, 0xf0d8c0, { y: 0.4 }),                 // 顔
    box(0.16, 0.04, 0.16, crown, { y: 0.5 }),        // 冠/髪飾り
  ).translateX(x).translateY(1.28).translateZ(-1.1);
  g.add(doll(-0.4, 0x2a3a8a, 0x1a1a20), doll(0.4, 0xe86a9a, 0xc8a030));
  // 三人官女(中段)
  for (const x of [-0.7, 0, 0.7]) g.add(grp(cyl(0.1, 0.13, 0.24, 0x2a7a4a, { y: 0.12 }), sph(0.08, 0xf0d8c0, { y: 0.3 })).translateX(x).translateY(0.85).translateZ(-0.55));
  // ぼんぼり(灯り)
  for (const x of [-1.0, 1.0]) {
    g.add(cyl(0.02, 0.02, 0.5, 0x8a6a3a, { x, y: 1.5, z: -1.1 }));
    g.add(sph(0.1, 0xffd86a, { x, y: 1.78, z: -1.1, emissive: 0xffb84d, emissiveIntensity: 1.0 }));
  }
  return g;
};

// 怪談クラブ(ろうそくと座布団)— 暗い雰囲気
G.kaidancandle = () => {
  const g = new THREE.Group();
  // 中央の大きなろうそく
  g.add(cyl(0.12, 0.14, 0.5, 0xe8e0d0, { y: 0.25 }));
  g.add(sph(0.09, 0xff9a3a, { y: 0.56, emissive: 0xff6a1a, emissiveIntensity: 1.6, sy: 1.8 }));
  // 周囲の座布団
  const cush = [0x3a3a5a, 0x5a3a3a, 0x3a5a4a, 0x5a5a3a];
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    g.add(box(0.55, 0.1, 0.55, cush[i], { x: Math.cos(a) * 1.3, y: 0.05, z: Math.sin(a) * 1.3 }));
  }
  // 揺れる人魂(青白い光)
  for (let i = 0; i < 3; i++) g.add(sph(0.08, 0x8affd0, { x: rand(-1.5, 1.5), y: rand(1.2, 2.0), z: rand(-1.2, 1.2), emissive: 0x4affb0, emissiveIntensity: 1.2 }));
  return g;
};

// ミニ夏祭りの屋台(金魚すくい + りんご飴)
G.natsustalls = () => {
  const g = new THREE.Group();
  // 屋台の骨組み+赤白幕(2軒)
  const stall = (label) => {
    const s = grp(
      box(1.8, 0.1, 1.0, 0x8a6a4a, { y: 0.7 }),                 // 台
      cyl(0.05, 0.05, 1.2, 0x6a4a3a, { x: -0.8, y: 0.6, z: -0.4 }),
      cyl(0.05, 0.05, 1.2, 0x6a4a3a, { x: 0.8, y: 0.6, z: -0.4 }),
      box(2.0, 0.4, 0.05, 0xd83a3a, { y: 1.25, z: -0.4 }),       // 赤い幕
      box(2.0, 0.4, 0.045, 0xffffff, { y: 1.25, z: -0.39, sy: 0.5 }),
    );
    return s;
  };
  // 金魚すくい(水槽 + 赤い金魚)
  const kingyo = stall();
  kingyo.add(box(1.4, 0.2, 0.8, 0x3a8ad0, { y: 0.82, transparent: true, opacity: 0.6 }));
  for (let i = 0; i < 6; i++) kingyo.add(sph(0.06, 0xff5a2a, { x: rand(-0.5, 0.5), y: 0.86, z: rand(-0.25, 0.25) }));
  kingyo.position.set(-1.4, 0, 0);
  g.add(kingyo);
  // りんご飴(赤い飴を串に)
  const ringo = stall();
  for (let i = 0; i < 5; i++) {
    ringo.add(cyl(0.02, 0.02, 0.4, 0xe8d8b0, { x: -0.5 + i * 0.25, y: 0.95 }));
    ringo.add(sph(0.11, 0xe01f2a, { x: -0.5 + i * 0.25, y: 1.18, emissive: 0x5a0a0a, emissiveIntensity: 0.3 }));
  }
  ringo.position.set(1.4, 0, 0);
  g.add(ringo);
  // 提灯
  for (const x of [-2.4, 0, 2.4]) g.add(grp(cyl(0.16, 0.16, 0.28, 0xd83a3a, { emissive: 0xff6a3a, emissiveIntensity: 0.7 })).translateX(x).translateY(2.2));
  return g;
};

// 誕生日ケーキ + 風船 + ガーランド
G.birthdaycake = () => {
  const g = new THREE.Group();
  // 台
  g.add(cyl(0.6, 0.62, 0.2, 0xf0e0d0, { y: 0.5 }));
  // ケーキ2段
  g.add(cyl(0.5, 0.5, 0.35, 0xf8d8e4, { y: 0.78 }));
  g.add(cyl(0.34, 0.34, 0.3, 0xfff0f6, { y: 1.1 }));
  // いちご
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; g.add(sph(0.06, 0xe83a5a, { x: Math.cos(a) * 0.4, y: 0.98, z: Math.sin(a) * 0.4 })); }
  // ろうそくの火
  for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2; g.add(cyl(0.015, 0.015, 0.14, 0xffe0a0, { x: Math.cos(a) * 0.18, y: 1.32, z: Math.sin(a) * 0.18 })); g.add(sph(0.03, 0xffb84d, { x: Math.cos(a) * 0.18, y: 1.42, z: Math.sin(a) * 0.18, emissive: 0xff9a2a, emissiveIntensity: 1.6, sy: 1.6 })); }
  // 風船
  const bcol = [0xff5a6a, 0x5a9aff, 0xffd84a, 0x6ad07a, 0xd06aff];
  for (let i = 0; i < 5; i++) {
    const x = -2 + i * 1.0;
    g.add(sph(0.28, bcol[i], { x, y: 2.3, sy: 1.2, emissive: bcol[i], emissiveIntensity: 0.15 }));
    g.add(cyl(0.006, 0.006, 0.9, 0xdddddd, { x, y: 1.7 }));
  }
  // ガーランド(旗)
  for (let i = 0; i < 7; i++) g.add(box(0.16, 0.2, 0.02, bcol[i % bcol.length], { x: -1.8 + i * 0.6, y: 2.9, rz: 0.1 }));
  return g;
};

// こいのぼり(こどもの日) — 柱に大中小の鯉
G.koinobori = () => {
  const g = new THREE.Group();
  // 支柱
  g.add(cyl(0.06, 0.07, 3.2, 0x6a5a4a, { y: 1.6 }));
  // 矢車(てっぺんの回転飾り)
  g.add(sph(0.14, 0xe8c84a, { y: 3.3, emissive: 0x8a6a1a, emissiveIntensity: 0.4 }));
  // 吹き流し(五色)
  const fcols = [0xe83a3a, 0x3a8ad0, 0x4ac86a, 0xe8c84a, 0xd05af0];
  for (let i = 0; i < 5; i++) g.add(box(0.05, 0.9, 0.05, fcols[i], { x: -0.2 + i * 0.1, y: 2.7, z: 0.15 }));
  // 鯉 3匹(黒→赤→青、上から下へ大きさ減)
  const koi = (y, len, color) => {
    const k = grp(
      box(len, len * 0.5, 0.06, color, { x: len * 0.5, roughness: 0.9 }),   // 胴
      box(len * 0.3, len * 0.6, 0.06, color, { x: len + len * 0.1, rz: 0 }), // 尾びれ
      sph(0.05, 0xffffff, { x: 0.12, y: len * 0.12, z: 0.05 }),             // 目
      sph(0.03, 0x111111, { x: 0.13, y: len * 0.12, z: 0.08 }),
    );
    k.position.set(0.06, y, 0);
    return k;
  };
  g.add(koi(2.7, 1.4, 0x2a2a2e));   // 真鯉(黒・父)
  g.add(koi(1.9, 1.1, 0xe0442e));   // 緋鯉(赤・母)
  g.add(koi(1.2, 0.8, 0x3a7ad0));   // 子鯉(青)
  return g;
};

export function createEventObject(key) {
  const gen = G[key];
  if (!gen) return null;
  const g = gen();
  return g.isGroup ? g : grp(g);
}
