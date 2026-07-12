// ============================================================
// フロア(外装ファサード+内装)・階段・地上の自動生成
// 1フロア: 幅 FLOOR_W ×奥行 FLOOR_D ×高さ FLOOR_H
// 正面は +Z (ドールハウス式にファサードが開閉する)
// ============================================================
import * as THREE from 'three';
import { box, cyl, sph, grp, mat, rand, randInt, pick, signBoard, signMesh, stripeTexture } from './prims.js';
import { CHARS } from '../data/chars.js';

export const FLOOR_W = 14;
export const FLOOR_D = 10;
export const FLOOR_H = 4;
const T = 0.3; // 壁厚

const CONCRETE = [0x8a8578, 0x7d7a70, 0x93887a, 0x6f6d66, 0x857f6e, 0x74786e];

// ------------------------------------------------------------
// 外装パーツ
// ------------------------------------------------------------
function acUnit() {
  const g = grp(
    box(0.55, 0.42, 0.3, 0xb8b4a8, { roughness: 0.7 }),
    cyl(0.14, 0.14, 0.05, 0x55534a, { z: 0.15, rx: Math.PI / 2 }),
    box(0.6, 0.06, 0.35, 0x6a6558, { y: -0.26 }),
  );
  return g;
}

function pipe(h, color = 0x4a5a52) {
  const g = grp(cyl(0.06, 0.06, h, color, { y: h / 2 }));
  const joints = randInt(1, 2);
  for (let i = 0; i < joints; i++) g.add(cyl(0.09, 0.09, 0.1, color, { y: rand(0.5, h - 0.5) }));
  return g;
}

function laundry() {
  const g = grp(cyl(0.02, 0.02, 2.0, 0x8a8a8a, { rz: Math.PI / 2, y: 1.0 }));
  const cols = [0xe8e8e8, 0x9ec2ff, 0xffd0a0, 0xa0e0b8];
  let x = -0.8;
  for (let i = 0; i < randInt(2, 4); i++) {
    g.add(box(0.32, rand(0.4, 0.6), 0.02, pick(cols), { x, y: 0.72 }));
    x += rand(0.45, 0.6);
  }
  return g;
}

function windowPane(w, h, lit, neonColor) {
  const on = lit;
  return box(w, h, 0.04, on ? 0xffe9b0 : 0x1a2430, {
    emissive: on ? (neonColor ?? 0xffc86a) : 0x0a1018,
    emissiveIntensity: on ? (neonColor ? 0.5 : 0.85) : 0.3,
    roughness: 0.4,
  });
}

// ------------------------------------------------------------
// ファサード (正面外壁+装飾) — フォーカス時に非表示にする
// ------------------------------------------------------------
export function makeFacade(entry) {
  const g = new THREE.Group();
  const isHome = entry.kind === 'home';
  const wallColor = pick(CONCRETE);
  const neon = isHome ? 0xffc86a : entry.def.neon;

  // 正面壁
  g.add(box(FLOOR_W, FLOOR_H, T, wallColor, { y: FLOOR_H / 2, z: FLOOR_D / 2 - T / 2 }));

  const zf = FLOOR_D / 2 + 0.03;

  if (isHome) {
    // 窓 2〜3つ
    const n = randInt(2, 3);
    for (let i = 0; i < n; i++) {
      const x = -FLOOR_W / 2 + (i + 0.75) * (FLOOR_W / (n + 0.5)) + rand(-0.3, 0.3);
      g.add(windowPane(rand(1.0, 1.5), rand(1.1, 1.5), Math.random() < 0.65).translateX(x).translateY(rand(1.8, 2.4)).translateZ(zf));
      if (Math.random() < 0.6) { const ac = acUnit(); ac.position.set(x + rand(-0.9, 0.9), rand(0.6, 1.0), zf + 0.2); g.add(ac); }
    }
    // ベランダ
    const bw = rand(3.5, 5);
    const bx = rand(-FLOOR_W / 2 + bw / 2 + 0.5, FLOOR_W / 2 - bw / 2 - 0.5);
    g.add(box(bw, 0.08, 1.0, 0x5a584e, { x: bx, y: 0.3, z: FLOOR_D / 2 + 0.5 }));
    for (let i = 0; i <= 8; i++)
      g.add(box(0.04, 0.7, 0.04, 0x44544c, { x: bx - bw / 2 + (bw / 8) * i, y: 0.68, z: FLOOR_D / 2 + 0.96 }));
    g.add(box(bw, 0.05, 0.05, 0x44544c, { x: bx, y: 1.05, z: FLOOR_D / 2 + 0.96 }));
    const la = laundry(); la.position.set(bx, 0.6, FLOOR_D / 2 + 0.7); g.add(la);
    if (Math.random() < 0.7) { const pl = sph(0.2, 0x3a8a3a, { x: bx + bw / 2 - 0.4, y: 0.55, z: FLOOR_D / 2 + 0.7 }); g.add(pl); g.add(cyl(0.12, 0.09, 0.2, 0xc06a3a, { x: bx + bw / 2 - 0.4, y: 0.4, z: FLOOR_D / 2 + 0.7 })); }
    // 表札ネオン (キャラ名)
    const nb = signBoard(entry.def.name, { w: 1.6, h: 0.5, fg: '#ffffff', glow: '#ffca6a', bg: '#20180a' });
    nb.position.set(rand(-3, 3), 3.4, zf + 0.1);
    g.add(nb);
  } else {
    // 店舗: 入口+ショーウィンドウ
    g.add(box(1.6, 2.4, 0.1, 0x2a2018, { x: -3.5, y: 1.2, z: zf }));                 // ドア
    g.add(box(1.5, 0.9, 0.06, 0x3a2a1a, { x: -3.5, y: 2.9, z: zf + 0.02 }));
    g.add(windowPane(4.5, 1.8, true, entry.def.neon).translateX(1.2).translateY(1.6).translateZ(zf));
    g.add(box(4.9, 0.15, 0.2, 0x3a3a40, { x: 1.2, y: 2.65, z: zf }));
    // 庇 (awning)
    const aw = box(6.5, 0.08, 1.2, 0x7a2a2a, { x: 0, y: 2.85, z: FLOOR_D / 2 + 0.55, rx: 0.15 });
    g.add(aw);
    // 横長メイン看板
    const main = signBoard(entry.def.name, { w: 5.5, h: 0.8, fg: '#fff6e0', glow: '#' + neon.toString(16).padStart(6, '0'), bg: '#181018' });
    main.position.set(0, 3.5, zf + 0.12);
    g.add(main);
  }

  // 縦ネオン看板 (突き出し) — 九龍らしさの核
  if (Math.random() < (isHome ? 0.45 : 1.0)) {
    const text = isHome ? pick(['公寓', '住宅', '九龍', '大廈']) : entry.def.sign;
    const colHex = '#' + neon.toString(16).padStart(6, '0');
    const vb = signBoard(text, { w: 0.7, h: Math.min(3.2, text.length * 0.85 + 0.9), vertical: true, fg: colHex, glow: colHex, bg: '#0c0c14', doubleSided: true });
    vb.rotation.y = Math.PI / 2;
    const sx = pick([-1, 1]) * rand(2, FLOOR_W / 2 - 1);
    vb.position.set(sx, FLOOR_H / 2 + rand(-0.5, 0.5), FLOOR_D / 2 + 0.85);
    // 支持アーム
    const arm = box(0.05, 0.05, 1.0, 0x333333, { x: sx, y: FLOOR_H - 0.4, z: FLOOR_D / 2 + 0.4 });
    g.add(vb, arm);
  }

  // 配管
  for (let i = 0; i < randInt(1, 3); i++) {
    const p = pipe(FLOOR_H, pick([0x4a5a52, 0x5a4a42, 0x3f4a55]));
    p.position.set(pick([-1, 1]) * rand(FLOOR_W / 2 - 1.2, FLOOR_W / 2 - 0.3), 0, FLOOR_D / 2 + 0.12);
    g.add(p);
  }
  // 汚れ(パネル貼り分け)
  for (let i = 0; i < randInt(1, 3); i++) {
    g.add(box(rand(1, 3), rand(0.8, 2), 0.04, pick(CONCRETE), {
      x: rand(-FLOOR_W / 2 + 2, FLOOR_W / 2 - 2), y: rand(0.8, FLOOR_H - 0.8), z: FLOOR_D / 2 - 0.02,
      roughness: 1,
    }));
  }
  return g;
}

// ------------------------------------------------------------
// 部屋のシェル (床・天井・左右壁・奥壁)
// ------------------------------------------------------------
export function makeShell(wallColor = 0xd8d0c0, floorColor = 0x9a8a70) {
  const g = new THREE.Group();
  const wc = wallColor, fc = floorColor;
  g.add(box(FLOOR_W, T, FLOOR_D, fc, { y: -T / 2 + 0.001, roughness: 0.9 }));           // 床
  // 天井は少し内側に入れて、上のフロアの床スラブとの面かぶり(ちらつき)を防ぐ
  g.add(box(FLOOR_W - 0.06, T, FLOOR_D - 0.06, 0x6a675e, { y: FLOOR_H - T / 2 - 0.03 }));
  g.add(box(T, FLOOR_H, FLOOR_D, wc, { x: -FLOOR_W / 2 + T / 2, y: FLOOR_H / 2 }));      // 左
  g.add(box(T, FLOOR_H, FLOOR_D, wc, { x: FLOOR_W / 2 - T / 2, y: FLOOR_H / 2 }));       // 右
  g.add(box(FLOOR_W, FLOOR_H, T, wc, { y: FLOOR_H / 2, z: -FLOOR_D / 2 + T / 2 }));      // 奥
  return g;
}

// ------------------------------------------------------------
// 内装の共通部品
// ------------------------------------------------------------
function counter(w = 4, color = 0x7a5a3a, topColor = 0x9a7a52) {
  return grp(
    box(w, 1.0, 0.8, color, { y: 0.5 }),
    box(w + 0.2, 0.08, 0.95, topColor, { y: 1.04 }),
  );
}

function pendantLight(color = 0xffe0a0) {
  return grp(
    cyl(0.015, 0.015, 0.7, 0x333333, { y: FLOOR_H - 0.35 }),
    cyl(0.08, 0.22, 0.2, 0x445544, { y: FLOOR_H - 0.75 }),
    sph(0.09, color, { y: FLOOR_H - 0.85, emissive: color, emissiveIntensity: 1.2 }),
  );
}

function tableSet(tableColor = 0x8a6a4a) {
  const g = grp(
    cyl(0.5, 0.5, 0.05, tableColor, { y: 0.72, seg: 16 }),
    cyl(0.05, 0.09, 0.7, 0x5a4632, { y: 0.36 }),
  );
  for (const a of [0.4, Math.PI - 0.4]) {
    const c = grp(
      cyl(0.22, 0.22, 0.05, 0x6a4a32, { y: 0.42, seg: 10 }),
      cyl(0.03, 0.03, 0.42, 0x554433, { y: 0.21 }),
    );
    c.position.set(Math.cos(a) * 0.85, 0, Math.sin(a) * 0.85);
    g.add(c);
  }
  return g;
}

function productShelf(cols) {
  const g = grp(box(2.4, 1.7, 0.7, 0xb8c0c8, { y: 0.85 }));
  for (let s = 0; s < 3; s++) {
    g.add(box(2.3, 0.04, 0.66, 0xd8e0e8, { y: 0.5 + s * 0.5 }));
    let x = -1.05;
    while (x < 1.0) {
      const w = rand(0.18, 0.3);
      g.add(box(w, rand(0.2, 0.34), 0.4, pick(cols), { x: x + w / 2, y: 0.52 + s * 0.5 + 0.15 }));
      x += w + 0.05;
    }
  }
  return g;
}

// ------------------------------------------------------------
// 内装ジェネレータ (施設別)
// 返り値: { group, hidingSpots: [[x,y,z],...] }
// ------------------------------------------------------------
const INTERIORS = {

  post(g) {
    g.add(makeShell(0xe8e0d0, 0xb0a890));
    const c = counter(6, 0x8a3a3a, 0xd8d0c0); c.position.set(-2, 0, -2.5); g.add(c);
    // 窓口パネル
    g.add(box(6, 1.2, 0.06, 0xd8d0c0, { x: -2, y: 1.9, z: -2.9 }));
    g.add(box(1.4, 0.8, 0.02, 0x8ab0c8, { x: -3.5, y: 1.7, z: -2.85, transparent: true, opacity: 0.6 }));
    g.add(box(1.4, 0.8, 0.02, 0x8ab0c8, { x: -0.5, y: 1.7, z: -2.85, transparent: true, opacity: 0.6 }));
    const sign = signBoard('〒 ゆうびん', { w: 3, h: 0.6, fg: '#ffffff', glow: '#ff6a6a', bg: '#7a1a1a' });
    sign.position.set(-2, 3.0, -4.5); g.add(sign);
    // 赤いポスト
    g.add(grp(
      cyl(0.35, 0.35, 1.2, 0xd83a2a, { y: 0.6 }),
      sph(0.35, 0xd83a2a, { y: 1.2 }),
      box(0.5, 0.08, 0.1, 0x8a1f18, { y: 1.05, z: 0.3 }),
    ).translateX(4.5).translateZ(-3));
    // 小包棚
    const shelf = productShelf([0xc0a070, 0xb09060, 0xd0b080]); shelf.position.set(4, 0, -4.2); g.add(shelf);
    // 台車
    g.add(grp(
      box(1.0, 0.06, 0.6, 0x5a8a5a, { y: 0.3 }),
      cyl(0.08, 0.08, 0.05, 0x333, { x: -0.4, y: 0.08, z: 0.25, rx: Math.PI / 2 }),
      cyl(0.08, 0.08, 0.05, 0x333, { x: 0.4, y: 0.08, z: 0.25, rx: Math.PI / 2 }),
      box(0.4, 0.3, 0.3, 0xc0a070, { y: 0.5 }),
    ).translateX(1.5).translateZ(1.5));
    g.add(pendantLight().translateX(-2), pendantLight().translateX(3));
    return [[4.5, 0.3, -2.2], [-4.8, 0.3, -0.5], [1.5, 0.75, 1.5], [-2, 1.2, -2.5]];
  },

  barber(g) {
    g.add(makeShell(0xd8e8ee, 0x8a9aa8));
    // 鏡と椅子 ×2
    for (const x of [-3, 0]) {
      g.add(box(1.4, 1.6, 0.05, 0xbfe2ee, { x, y: 1.7, z: -4.55, metalness: 0.85, roughness: 0.1 }));
      g.add(box(1.6, 0.1, 0.5, 0xe8e8e8, { x, y: 0.9, z: -4.3 }));
      g.add(grp(
        cyl(0.3, 0.36, 0.15, 0x8a2a2a, { y: 0.62 }),
        box(0.6, 0.5, 0.15, 0x8a2a2a, { y: 1.0, z: -0.25 }),
        cyl(0.08, 0.2, 0.5, 0x555566, { y: 0.3, metalness: 0.6 }),
      ).translateX(x).translateZ(-3.2));
    }
    // サインポール
    const poleTex = stripeTexture(['#d83a3a', '#ffffff', '#3a5ad8', '#ffffff'], 4);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 1.2, 16),
      new THREE.MeshStandardMaterial({ map: poleTex, emissive: 0x888888, emissiveMap: poleTex, emissiveIntensity: 0.5 }));
    pole.position.set(5.5, 1.5, -1);
    g.add(pole, cyl(0.2, 0.2, 0.08, 0xc8c8d0, { x: 5.5, y: 2.15, z: -1 }), cyl(0.2, 0.2, 0.08, 0xc8c8d0, { x: 5.5, y: 0.85, z: -1 }));
    // 待合ソファ + 棚
    g.add(box(2.2, 0.45, 0.7, 0x4a6a8a, { x: 3.5, y: 0.3, z: -4.2 }));
    g.add(box(2.2, 0.5, 0.2, 0x4a6a8a, { x: 3.5, y: 0.7, z: -4.5 }));
    const sh = grp(box(0.8, 1.4, 0.4, 0xe8e8e8, { y: 0.7 })); sh.position.set(-5.5, 0, -4); g.add(sh);
    for (let i = 0; i < 3; i++) g.add(cyl(0.05, 0.05, 0.2, pick([0xd8b0a0, 0xa0c8d8, 0xe8e0a0]), { x: -5.5 + rand(-0.2, 0.2), y: 1.5, z: -4 + rand(-0.1, 0.1) }));
    g.add(pendantLight(0xd0f0ff).translateX(-1.5), pendantLight(0xd0f0ff).translateX(2.5));
    return [[5.5, 0.3, -3.8], [-5.5, 0.3, -2.5], [3.5, 0.62, -3.9], [-3, 1.0, -4.3]];
  },

  cafe(g) {
    g.add(makeShell(0xd8c8a8, 0x6a4a3a));
    const c = counter(4.5, 0x4a3428, 0x8a6a4a); c.position.set(-3, 0, -3.2); g.add(c);
    // コーヒーマシン
    g.add(grp(
      box(0.6, 0.7, 0.5, 0x9a2a2a, { y: 1.4 }),
      box(0.5, 0.1, 0.3, 0xd8d8d8, { y: 1.15, z: 0.12 }),
      cyl(0.06, 0.06, 0.12, 0xf0f0f0, { x: 0.1, y: 1.15, z: 0.15 }),
    ).translateX(-4).translateZ(-3.2));
    // メニュー黒板
    const menu = signBoard('本日のコーヒー', { w: 2.2, h: 1.2, fg: '#e8d8a0', bg: '#20281f', glow: '#a0b890' });
    menu.position.set(-3, 2.6, -4.5); g.add(menu);
    // テーブル席 ×3
    const t1 = tableSet(); t1.position.set(2, 0, -2.5); g.add(t1);
    const t2 = tableSet(); t2.position.set(4.8, 0, 0.5); t2.rotation.y = 1; g.add(t2);
    const t3 = tableSet(); t3.position.set(1.5, 0, 1.8); t3.rotation.y = 2.2; g.add(t3);
    // 観葉植物
    g.add(grp(cyl(0.2, 0.15, 0.35, 0x8a5a3a, { y: 0.17 }), sph(0.3, 0x3a7a34, { y: 0.7, sy: 1.3 })).translateX(5.8).translateZ(-4.2));
    g.add(pendantLight(0xffca80).translateX(2).translateZ(-2.5), pendantLight(0xffca80).translateX(-3).translateZ(-2), pendantLight(0xffca80).translateX(4.8).translateZ(0.5));
    return [[-5.8, 0.3, -4.3], [5.8, 0.3, -3.6], [-1.5, 0.3, -3.0], [2, 0.78, -2.5]];
  },

  market(g) {
    g.add(makeShell(0xe8f0e8, 0xc8c8b8));
    // ゴンドラ棚 ×3
    const cols1 = [0xd85a4a, 0xe8a03a, 0x5a9ad8, 0x7ac05a, 0xe8d84a];
    for (const [x, z] of [[-2.5, -1], [1.0, -1], [-2.5, 2]]) {
      const s = productShelf(cols1); s.position.set(x, 0, z); g.add(s);
    }
    // 冷蔵ケース
    g.add(grp(
      box(3.5, 1.9, 0.8, 0xd8e8f0, { y: 0.95 }),
      box(3.3, 1.2, 0.05, 0xa8d8f0, { y: 1.2, z: 0.42, transparent: true, opacity: 0.5, emissive: 0x88c8f0, emissiveIntensity: 0.4 }),
    ).translateX(-3).translateZ(-4.2));
    // レジ
    const c = counter(2.2, 0x5a8a6a, 0xd8d8c8); c.position.set(4.5, 0, -2.5); c.rotation.y = Math.PI / 2; g.add(c);
    g.add(box(0.5, 0.4, 0.4, 0x33333c, { x: 4.5, y: 1.3, z: -2.5 }));
    // 野菜カゴ
    for (const [x, z, col] of [[3.5, 2.5, 0xe86a2a], [4.6, 2.5, 0x5ac04a], [4.0, 3.6, 0xd8c84a]]) {
      g.add(grp(box(0.8, 0.4, 0.8, 0x8a6a4a, { y: 0.35 }), sph(0.14, col, { x: -0.15, y: 0.6 }), sph(0.14, col, { x: 0.15, y: 0.6 }), sph(0.14, col, { y: 0.62, z: 0.15 })).translateX(x).translateZ(z));
    }
    const sign = signBoard('特売中!', { w: 2, h: 0.6, fg: '#ffffff', bg: '#c02a2a', glow: '#ff8a6a' });
    sign.position.set(0, 3.2, -4.5); g.add(sign);
    g.add(pendantLight(0xf0f0ff).translateX(-2), pendantLight(0xf0f0ff).translateX(2).translateZ(1));
    return [[-2.5, 0.55, -1], [1.0, 1.05, -1], [-5.8, 0.3, -4.2], [4.2, 0.3, 3.9], [-2.5, 0.3, 3.4]];
  },

  ramen(g) {
    g.add(makeShell(0xc8a878, 0x5a4432));
    const c = counter(7, 0x6a3a22, 0xc8a060); c.position.set(0, 0, -2.8); g.add(c);
    // 丸椅子
    for (let i = 0; i < 5; i++) g.add(grp(cyl(0.22, 0.22, 0.06, 0xc03a2a, { y: 0.58 }), cyl(0.04, 0.06, 0.55, 0x444, { y: 0.28 })).translateX(-2.8 + i * 1.4).translateZ(-1.6));
    // 寸胴と湯気
    g.add(grp(
      cyl(0.4, 0.4, 0.6, 0xb8b8c0, { y: 1.35, metalness: 0.6 }),
      sph(0.12, 0xffffff, { y: 1.85, transparent: true, opacity: 0.5 }),
      sph(0.09, 0xffffff, { x: 0.1, y: 2.1, transparent: true, opacity: 0.35 }),
    ).translateX(-2).translateZ(-4));
    // 赤提灯 ×3
    for (const x of [-3, 0, 3]) {
      g.add(grp(
        cyl(0.22, 0.22, 0.38, 0xd83a2a, { y: -0.2, emissive: 0xff5a2a, emissiveIntensity: 0.8 }),
        cyl(0.1, 0.1, 0.05, 0x2a2a2a, { y: 0.02 }),
        cyl(0.1, 0.1, 0.05, 0x2a2a2a, { y: -0.42 }),
      ).translateX(x).translateY(FLOOR_H - 0.5).translateZ(-2));
    }
    const sign = signBoard('拉麺', { w: 1.6, h: 0.7, fg: '#ffe8a0', bg: '#5a1a10', glow: '#ff8a3a' });
    sign.position.set(0, 3.1, -4.5); g.add(sign);
    // 券売機
    g.add(grp(box(0.9, 1.6, 0.5, 0xc84a3a, { y: 0.8 }), box(0.7, 0.7, 0.02, 0xf0e8d0, { y: 1.1, z: 0.26 })).translateX(5.5).translateZ(-3.5));
    return [[5.5, 0.3, -1.8], [-5.8, 0.3, -4.0], [2.5, 1.1, -3.0], [-4.5, 0.3, 1.5]];
  },

  game(g) {
    g.add(makeShell(0x3a3a55, 0x2a2a3e));
    // アーケード筐体 ×4
    const screens = [0x4affd0, 0xff5ad0, 0x5a8aff, 0xffd05a];
    for (let i = 0; i < 4; i++) {
      const cab = grp(
        box(0.9, 1.7, 0.8, 0x2a2a38, { y: 0.85 }),
        box(0.7, 0.55, 0.05, 0x101018, { y: 1.25, z: 0.35, rx: -0.25, emissive: screens[i], emissiveIntensity: 0.9 }),
        box(0.7, 0.15, 0.3, 0x3a3a4a, { y: 0.88, z: 0.42 }),
        sph(0.04, 0xff4444, { x: -0.15, y: 0.98, z: 0.5 }),
        sph(0.04, 0x44ff44, { x: 0.05, y: 0.98, z: 0.5 }),
      );
      cab.position.set(-4.5 + i * 2.2, 0, -3.8); g.add(cab);
    }
    // クレーンゲーム
    g.add(grp(
      box(1.3, 0.8, 1.1, 0xd85a8a, { y: 0.4 }),
      box(1.2, 1.1, 1.0, 0x88c8f0, { y: 1.35, transparent: true, opacity: 0.35 }),
      box(1.3, 0.2, 1.1, 0xd85a8a, { y: 2.0 }),
      sph(0.12, 0xffd95a, { x: -0.2, y: 0.95 }), sph(0.12, 0x5ad07a, { x: 0.2, y: 0.92, z: 0.2 }), sph(0.12, 0xe86a5a, { y: 0.94, z: -0.2 }),
      cyl(0.02, 0.02, 0.4, 0x888, { y: 1.7 }), box(0.12, 0.1, 0.12, 0xc0c0c8, { y: 1.5 }),
    ).translateX(4.5).translateZ(-2));
    // 両替機
    g.add(box(0.8, 1.4, 0.4, 0xd8d840, { x: 5.7, y: 0.7, z: -4.2, emissive: 0x5a5a10, emissiveIntensity: 0.3 }));
    const sign = signBoard('GAME', { w: 2.4, h: 0.7, fg: '#ff5ad0', bg: '#14081a', glow: '#ff5ad0' });
    sign.position.set(0, 3.3, -4.5); g.add(sign);
    return [[5.7, 0.3, -3.3], [-5.7, 0.3, -1.5], [-1.2, 0.3, -3.4], [4.5, 0.3, 0.2]];
  },

  sento(g) {
    g.add(makeShell(0xd8e8f0, 0xc8d0d8));
    // 富士山壁画
    const mural = new THREE.Group();
    mural.add(box(9, 2.4, 0.05, 0x9ac8e8, { y: 2.5, z: -4.6 }));
    const fuji = new THREE.Mesh(new THREE.ConeGeometry(1.8, 1.6, 4), mat(0x4a6a9a));
    fuji.position.set(0, 2.4, -4.55); fuji.rotation.y = Math.PI / 4; fuji.scale.z = 0.05; mural.add(fuji);
    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.7, 0.65, 4), mat(0xf0f4f8));
    cap.position.set(0, 2.88, -4.5); cap.rotation.y = Math.PI / 4; cap.scale.z = 0.05; mural.add(cap);
    g.add(mural);
    // 浴槽
    g.add(grp(
      box(6, 0.7, 3, 0xb8c8d0, { y: 0.35, z: 0 }),
      box(5.6, 0.1, 2.6, 0x5ab8e8, { y: 0.68, transparent: true, opacity: 0.8, emissive: 0x2a88c8, emissiveIntensity: 0.3 }),
    ).translateX(-2.5).translateZ(-2.6));
    // 湯気
    for (let i = 0; i < 4; i++) g.add(sph(rand(0.15, 0.3), 0xffffff, { x: -4 + i * 1.2, y: rand(1.1, 1.7), z: -2.6, transparent: true, opacity: 0.35 }));
    // 洗い場 (桶+腰掛け)
    for (const x of [2.5, 4, 5.5]) {
      g.add(cyl(0.2, 0.16, 0.15, 0xe8d84a, { x, y: 0.08, z: -3.8 }));
      g.add(cyl(0.22, 0.22, 0.25, 0xd8c8a0, { x, y: 0.13, z: -2.9 }));
    }
    // ロッカー
    const lk = grp(box(2.4, 2.0, 0.5, 0x8a9a78, { y: 1.0 }));
    for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) lk.add(box(0.5, 0.6, 0.02, 0x6a7a58, { x: -0.85 + i * 0.57, y: 0.45 + j * 0.62, z: 0.26 }));
    lk.position.set(4, 0, 3.5); g.add(lk);
    // のれん
    g.add(box(1.8, 0.7, 0.02, 0x3a5a9a, { x: -4.5, y: 3.0, z: 3.5 }));
    return [[5.5, 0.3, -4.3], [-5.7, 0.3, 1.0], [4, 0.3, 2.6], [2.5, 0.3, -4.4]];
  },

  book(g) {
    g.add(makeShell(0xe0d8c0, 0x8a7a5a));
    const bookCols = [0x8a3a3a, 0x3a5a8a, 0x3a7a4a, 0xc8a03a, 0x6a4a8a, 0xd8d0c0];
    // 壁面本棚
    for (const x of [-4.5, -1.5, 1.5, 4.5]) {
      const s = grp(box(2.6, 2.6, 0.5, 0x5a4632, { y: 1.3 }));
      for (let r = 0; r < 4; r++) {
        s.add(box(2.5, 0.04, 0.44, 0x7a6248, { y: 0.4 + r * 0.6 }));
        let bx = -1.15;
        while (bx < 1.1) {
          const w = rand(0.06, 0.13), h = rand(0.35, 0.5);
          s.add(box(w, h, 0.3, pick(bookCols), { x: bx + w / 2, y: 0.42 + r * 0.6 + h / 2 }));
          bx += w + 0.01;
        }
      }
      s.position.set(x, 0, -4.2); g.add(s);
    }
    // 平台
    g.add(grp(
      box(2.4, 0.7, 1.2, 0x7a6248, { y: 0.35 }),
      box(0.5, 0.08, 0.7, 0x8a3a3a, { x: -0.6, y: 0.78, ry: 0.2 }),
      box(0.5, 0.08, 0.7, 0x3a5a8a, { x: 0.3, y: 0.78, ry: -0.15 }),
      box(0.5, 0.08, 0.7, 0xc8a03a, { x: 0.9, y: 0.78, z: 0.3, ry: 0.4 }),
    ).translateZ(1.0));
    // 読書席
    const t = tableSet(0x6a5a42); t.position.set(4.5, 0, 2.2); g.add(t);
    const sign = signBoard('古今書店', { w: 2.4, h: 0.6, fg: '#e8d8b0', bg: '#2a2018', glow: '#c8a86a' });
    sign.position.set(0, 3.3, -4.48); g.add(sign);
    g.add(pendantLight(0xffe0b0).translateZ(1), pendantLight(0xffe0b0).translateX(4.5).translateZ(2.2));
    return [[-5.8, 0.3, -1.5], [0, 0.82, 1.0], [5.8, 0.3, -3.8], [-3, 0.3, 2.8]];
  },

  dagashi(g) {
    g.add(makeShell(0xe8d8b8, 0xb09868));
    const candy = [0xe85a5a, 0xffd95a, 0x5ad07a, 0x5a8ae8, 0xff8ac0, 0xe8883a];
    // 低い駄菓子棚 ×2
    for (const [x, z] of [[-2.5, -2], [1.5, -2]]) {
      const s = grp(box(3, 1.0, 0.8, 0x9a7a4a, { y: 0.5 }));
      for (let r = 0; r < 2; r++) {
        for (let i = 0; i < 7; i++) s.add(box(0.3, 0.12, 0.5, pick(candy), { x: -1.3 + i * 0.42, y: 0.62 + r * 0.35, z: 0.05, ry: rand(-0.15, 0.15) }));
        s.add(box(2.9, 0.04, 0.7, 0xb89868, { y: 0.55 + r * 0.35 }));
      }
      s.position.set(x, 0, z); g.add(s);
    }
    // ガラス瓶
    for (let i = 0; i < 4; i++) {
      g.add(grp(
        cyl(0.16, 0.16, 0.35, 0xd8e8f0, { y: 0.18, transparent: true, opacity: 0.45 }),
        sph(0.1, pick(candy), { y: 0.14 }),
        cyl(0.1, 0.1, 0.05, 0xd83a2a, { y: 0.38 }),
      ).translateX(-4.8 + i * 0.5).translateZ(-4.2).translateY(1.0));
    }
    g.add(box(2.4, 1.0, 0.6, 0x8a6a44, { x: -4.2, y: 0.5, z: -4.2 })); // 瓶を載せる台
    // 10円ゲーム台
    g.add(grp(box(0.7, 1.1, 0.5, 0xc84a6a, { y: 0.55 }), box(0.55, 0.55, 0.03, 0xf0e8c0, { y: 0.85, z: 0.24, rx: -0.3 })).translateX(5).translateZ(-3.5));
    // 赤いベンチ
    g.add(box(2.0, 0.4, 0.5, 0xc0453a, { x: 4, y: 0.25, z: 2.8 }));
    const sign = signBoard('だがし', { w: 2.0, h: 0.6, fg: '#7a2a1a', bg: '#f0e0b0', glow: '#ffca6a' });
    sign.position.set(-1, 3.2, -4.5); g.add(sign);
    g.add(pendantLight(0xffd890));
    return [[5, 0.3, -4.3], [-5.7, 0.3, -1.0], [1.5, 1.1, -2], [4, 0.55, 2.8]];
  },

  flower(g) {
    g.add(makeShell(0xdfeed8, 0x9aa888));
    const petals = [0xff7ab8, 0xffd95a, 0xe85a5a, 0xc08ae8, 0xf0f0f0];
    // 花のひな壇 ×2
    for (const [x, z, ry] of [[-3.5, -3.2, 0], [3.0, -3.2, 0]]) {
      const st = new THREE.Group();
      for (let r = 0; r < 3; r++) {
        st.add(box(2.6, 0.3, 0.7, 0x8a9a78, { y: 0.15 + r * 0.42, z: -r * 0.55 }));
        for (let i = 0; i < 4; i++) {
          const fx = -1.0 + i * 0.66;
          st.add(cyl(0.13, 0.1, 0.22, 0xc06a3a, { x: fx, y: 0.4 + r * 0.42, z: -r * 0.55 }));
          st.add(cyl(0.02, 0.02, 0.25, 0x3a7a34, { x: fx, y: 0.62 + r * 0.42, z: -r * 0.55 }));
          st.add(sph(0.12, pick(petals), { x: fx, y: 0.78 + r * 0.42, z: -r * 0.55 }));
        }
      }
      st.position.set(x, 0, z); st.rotation.y = ry; g.add(st);
    }
    // 作業カウンター+じょうろ
    const c = counter(3, 0x7a6a52, 0xa89a80); c.position.set(0, 0, 2.8); c.rotation.y = Math.PI; g.add(c);
    g.add(grp(
      cyl(0.18, 0.15, 0.3, 0x5a8ac0, { y: 0.15 }),
      cyl(0.03, 0.03, 0.4, 0x5a8ac0, { x: 0.22, y: 0.2, rz: -0.8 }),
    ).translateY(1.1).translateZ(2.8).translateX(1.0));
    // 吊り花
    for (const x of [-2, 0.5, 3]) {
      g.add(grp(
        cyl(0.01, 0.01, 0.6, 0x888, { y: -0.3 }),
        cyl(0.14, 0.1, 0.2, 0x8a6a4a, { y: -0.7 }),
        sph(0.16, pick(petals), { y: -0.55 }),
      ).translateX(x).translateY(FLOOR_H - 0.2).translateZ(0.5));
    }
    const sign = signBoard('花', { w: 0.9, h: 0.9, fg: '#ff9ac8', bg: '#1a2418', glow: '#ff7ab8' });
    sign.position.set(0, 3.2, -4.48); g.add(sign);
    return [[-5.7, 0.3, -4.2], [5.7, 0.3, -1.2], [-1.2, 0.3, 2.8], [3.0, 0.5, -2.4]];
  },

  karaoke(g) {
    g.add(makeShell(0x4a3a5a, 0x3a2f48));
    // ステージ+スクリーン
    g.add(box(4, 0.25, 2.5, 0x6a4a7a, { x: -3, y: 0.13, z: -3.2 }));
    g.add(box(3.2, 1.8, 0.08, 0x101018, { x: -3, y: 2.1, z: -4.4, emissive: 0x4a5aff, emissiveIntensity: 0.7 }));
    // マイクスタンド
    g.add(grp(
      cyl(0.16, 0.2, 0.04, 0x333, { y: 0.02 }),
      cyl(0.015, 0.015, 1.1, 0x888, { y: 0.55 }),
      sph(0.07, 0x333340, { y: 1.15, metalness: 0.7 }),
    ).translateX(-3).translateZ(-2.8).translateY(0.25));
    // ソファ席+テーブル
    g.add(box(3.2, 0.45, 0.8, 0x8a2a4a, { x: 3, y: 0.28, z: 2.0 }));
    g.add(box(3.2, 0.6, 0.2, 0x8a2a4a, { x: 3, y: 0.7, z: 2.45 }));
    g.add(grp(box(1.6, 0.06, 0.8, 0x3a3040, { y: 0.5 }), box(0.1, 0.5, 0.1, 0x2a2233, { y: 0.25 })).translateX(3).translateZ(0.6));
    // ミラーボール
    g.add(grp(
      cyl(0.01, 0.01, 0.4, 0x888, { y: 0.2 }),
      sph(0.25, 0xc8c8d8, { metalness: 0.95, roughness: 0.1 }),
    ).translateY(FLOOR_H - 0.6).translateX(0));
    // カラースポット
    for (const [x, col] of [[-1.5, 0xff5ad0], [1.5, 0x5ad0ff]]) {
      g.add(sph(0.1, col, { x, y: FLOOR_H - 0.3, z: -1, emissive: col, emissiveIntensity: 1.5 }));
    }
    const sign = signBoard('♪歌♪', { w: 1.8, h: 0.6, fg: '#ff8ae0', bg: '#180a20', glow: '#ff5ad0' });
    sign.position.set(3, 3.2, -4.48); g.add(sign);
    return [[5.7, 0.3, -3.8], [-5.7, 0.3, 1.5], [3, 0.56, 0.6], [-3, 0.4, -3.2]];
  },

  pharmacy(g) {
    g.add(makeShell(0xf0f4f0, 0xd0d8d0));
    // 緑十字
    const cross = new THREE.Group();
    cross.add(box(0.9, 0.3, 0.08, 0x2ab84a, { emissive: 0x2ab84a, emissiveIntensity: 0.9 }));
    cross.add(box(0.3, 0.9, 0.08, 0x2ab84a, { emissive: 0x2ab84a, emissiveIntensity: 0.9 }));
    cross.position.set(0, 3.1, -4.5); g.add(cross);
    // 白い棚 ×2
    for (const x of [-3.5, -0.5]) {
      const s = productShelf([0xf0f0f4, 0xa8d8e8, 0xe8c8d8, 0xc8e8c8]); s.position.set(x, 0, -4.0); g.add(s);
    }
    // 調剤カウンター
    const c = counter(3.5, 0xe8e8ec, 0xc8d8c8); c.position.set(3.5, 0, -3); g.add(c);
    g.add(box(0.4, 0.5, 0.3, 0xf0f0f0, { x: 3.0, y: 1.3, z: -3 }));
    // 体重計・ベンチ
    g.add(box(0.6, 0.1, 0.8, 0xa8b0b8, { x: 5.5, y: 0.05, z: 1.5 }));
    g.add(box(2.0, 0.4, 0.5, 0x8ab0a0, { x: -4, y: 0.25, z: 2.6 }));
    // カエルの置物 (薬局らしさ)
    g.add(grp(sph(0.25, 0x4aa84a, { y: 0.25, sy: 0.9 }), sph(0.08, 0x3a883a, { x: -0.1, y: 0.45 }), sph(0.08, 0x3a883a, { x: 0.1, y: 0.45 })).translateX(5.5).translateZ(-4.0));
    return [[5.5, 0.3, -3.2], [-5.7, 0.3, 0.5], [-2, 1.05, -4.0], [-4, 0.5, 2.6]];
  },

  izakaya(g) {
    g.add(makeShell(0x8a6a4a, 0x4a3626));
    // カウンター+徳利棚
    const c = counter(6, 0x5a4028, 0x9a7a50); c.position.set(-1, 0, -3.0); g.add(c);
    const shelf = grp(box(5, 1.2, 0.35, 0x4a3626, { y: 2.2, z: -4.5 }));
    for (let i = 0; i < 8; i++) {
      shelf.add(cyl(0.06, 0.09, 0.24, pick([0xd8d0c0, 0x8ab0c8, 0xc8a070]), { x: -2.2 + i * 0.62, y: 1.85, z: -4.4 }));
    }
    g.add(shelf);
    // 丸椅子
    for (let i = 0; i < 5; i++) g.add(grp(cyl(0.22, 0.22, 0.06, 0x8a5a3a, { y: 0.58 }), cyl(0.04, 0.06, 0.55, 0x3a2a1c, { y: 0.28 })).translateX(-3.6 + i * 1.3).translateZ(-1.8));
    // 小上がり席
    g.add(box(3.4, 0.25, 2.6, 0x6a4a2e, { x: 4, y: 0.13, z: 0.6 }));
    g.add(box(1.4, 0.35, 1.0, 0x3a2a1c, { x: 4, y: 0.42, z: 0.6 }));
    // 赤提灯
    for (const x of [-4, -1, 2]) {
      g.add(grp(
        cyl(0.2, 0.2, 0.34, 0xd83a2a, { y: -0.2, emissive: 0xff5a2a, emissiveIntensity: 0.9 }),
        cyl(0.09, 0.09, 0.05, 0x2a2a2a, { y: 0.02 }),
      ).translateX(x).translateY(FLOOR_H - 0.5).translateZ(-1.2));
    }
    g.add(box(2.2, 0.6, 0.02, 0x3a5a9a, { x: -4.5, y: 3.0, z: 3.8 }));   // のれん
    const sign = signBoard('酒処 月虎', { w: 2.6, h: 0.6, fg: '#ffe8a0', bg: '#2a1408', glow: '#ffa53a' });
    sign.position.set(-1, 3.2, -4.48); g.add(sign);
    // ビールケース
    g.add(box(0.6, 0.35, 0.4, 0xd8b830, { x: -5.6, y: 0.18, z: 3.8 }));
    g.add(box(0.6, 0.35, 0.4, 0xd8b830, { x: -5.6, y: 0.53, z: 3.8, ry: 0.15 }));
    return [[-5.6, 0.9, 3.8], [5.7, 0.4, 0.6], [-5.7, 0.3, -3.8], [1.5, 1.1, -3.0]];
  },

  toyshop(g) {
    g.add(makeShell(0xf0e0c0, 0xc8a878));
    // カラフルな玩具棚 ×3
    const toyCols = [0xe8524a, 0x4a8ae8, 0x4ac86a, 0xe8c84a, 0xd05ac8];
    for (const [x, z] of [[-3.5, -3.8], [0, -3.8], [3.5, -3.8]]) {
      const s = grp(box(2.8, 2.0, 0.6, 0xe8a04a, { y: 1.0 }));
      for (let r = 0; r < 3; r++) {
        s.add(box(2.7, 0.05, 0.55, 0xf0c880, { y: 0.5 + r * 0.55 }));
        for (let i = 0; i < 4; i++) {
          const bx = -1.0 + i * 0.66;
          const kind = Math.random();
          if (kind < 0.4) s.add(box(0.32, 0.32, 0.3, pick(toyCols), { x: bx, y: 0.55 + r * 0.55 + 0.16, ry: rand(-0.2, 0.2) })); // 箱
          else s.add(sph(0.18, pick(toyCols), { x: bx, y: 0.55 + r * 0.55 + 0.18 })); // ボール
        }
      }
      s.position.set(x, 0, z); g.add(s);
    }
    // プラモデルの展示台 (ジンパチ向け)
    g.add(grp(
      box(1.8, 0.8, 0.9, 0x5a6a8a, { y: 0.4 }),
      box(1.8, 0.05, 0.9, 0x8a9ab0, { y: 0.82 }),
      // 組み上がったロボプラモ
      box(0.24, 0.34, 0.16, 0xd83a3a, { x: -0.4, y: 1.1 }),
      box(0.14, 0.14, 0.12, 0xe8c84a, { x: -0.4, y: 1.34 }),
      box(0.08, 0.24, 0.08, 0x3a5ad8, { x: -0.58, y: 1.05 }),
      box(0.08, 0.24, 0.08, 0x3a5ad8, { x: -0.22, y: 1.05 }),
      // 戦艦プラモ
      box(0.7, 0.12, 0.22, 0x8a8a92, { x: 0.5, y: 0.95 }),
      box(0.1, 0.18, 0.1, 0x6a6a72, { x: 0.5, y: 1.1 }),
    ).translateX(-4).translateZ(1.5));
    // ガチャガチャ機ミニ
    for (const x of [4.6, 5.4]) {
      g.add(grp(box(0.5, 0.5, 0.5, pick([0xe85a8a, 0x5a8ae8]), { y: 1.2 }), sph(0.26, 0xbfe2ee, { y: 1.55, transparent: true, opacity: 0.4 }), box(0.5, 0.7, 0.5, 0x8a6a4a, { y: 0.6 })).translateX(x).translateZ(-3.5));
    }
    // レジ
    const c = counter(2.4, 0xc86a3a, 0xe8a860); c.position.set(4.5, 0, 1.5); c.rotation.y = -Math.PI / 2; g.add(c);
    const sign = signBoard('おもちゃ', { w: 2.6, h: 0.6, fg: '#fff', bg: '#c8541a', glow: '#ff9a3a' });
    sign.position.set(0, 3.2, -4.5); g.add(sign);
    g.add(pendantLight(0xfff0d0).translateX(-2), pendantLight(0xfff0d0).translateX(2));
    return [[5.4, 0.3, -3.0], [-5.7, 0.3, 1.0], [0, 1.15, -3.8], [-4, 0.9, 1.5]];
  },

  konbini(g) {
    g.add(makeShell(0xeaf2f6, 0xc0c8cc));
    // 明るい蛍光灯天井
    for (const x of [-3, 0, 3]) g.add(box(2.4, 0.08, 0.4, 0xf4ffff, { x, y: FLOOR_H - 0.12, emissive: 0xd0e8ff, emissiveIntensity: 0.9 }));
    // 商品棚 (ゴンドラ) ×3
    const cols = [0xe85a4a, 0xe8a03a, 0x5a9ad8, 0x7ac05a, 0xe8d84a, 0xd05ac8];
    for (const [x, z] of [[-2.5, -1.5], [0.8, -1.5], [-2.5, 1.5]]) {
      const s = grp(box(2.4, 1.6, 0.7, 0xd8dce0, { y: 0.8 }));
      for (let r = 0; r < 3; r++) {
        s.add(box(2.3, 0.04, 0.66, 0xeef2f4, { y: 0.5 + r * 0.5 }));
        let bx = -1.0;
        while (bx < 0.95) { const w = rand(0.16, 0.26); s.add(box(w, rand(0.2, 0.32), 0.4, pick(cols), { x: bx + w / 2, y: 0.52 + r * 0.5 + 0.14 })); bx += w + 0.04; }
      }
      s.position.set(x, 0, z); g.add(s);
    }
    // 冷蔵ドリンクケース
    g.add(grp(
      box(3.4, 2.0, 0.7, 0xd0e4f0, { y: 1.0 }),
      box(3.2, 1.4, 0.05, 0xa8d8f0, { y: 1.2, z: 0.38, transparent: true, opacity: 0.5, emissive: 0x88c8f0, emissiveIntensity: 0.4 }),
    ).translateX(-3.5).translateZ(-4.0));
    // レジカウンター
    const c = counter(3, 0x4a8ac0, 0xd8e4ec); c.position.set(3.5, 0, -3.2); g.add(c);
    g.add(box(0.5, 0.4, 0.4, 0x33333c, { x: 3.2, y: 1.3, z: -3.2 }));
    // 中華まん蒸し器・おでん
    g.add(cyl(0.28, 0.3, 0.4, 0xc8c8d0, { x: 4.4, y: 1.3, z: -3.2, metalness: 0.5 }));
    // 雑誌ラック
    g.add(box(0.4, 1.4, 1.6, 0xb8b0a0, { x: 5.6, y: 0.7, z: 1.0 }));
    // 24hネオン
    const sign = signBoard('24h コンビニ', { w: 3.2, h: 0.6, fg: '#fff', bg: '#1a5a8a', glow: '#5ad0ff' });
    sign.position.set(0, 3.2, -4.5); g.add(sign);
    return [[5.6, 0.3, -3.0], [-5.7, 0.3, 3.5], [-2.5, 1.05, -1.5], [2.0, 0.3, 2.5]];
  },
};

// ------------------------------------------------------------
// 自宅の内装 (家具はゲーム側で配置するので殻+基本装飾のみ)
// ------------------------------------------------------------
export function makeHomeInterior(charId) {
  const def = CHARS[charId];
  const g = new THREE.Group();
  g.add(makeShell(def.wallColor, def.floorColor));
  // 奥壁の窓 (夜景)
  g.add(box(2.2, 1.4, 0.06, 0x101828, { y: 2.2, z: -FLOOR_D / 2 + T + 0.02, emissive: 0x2a3a6a, emissiveIntensity: 0.5 }));
  g.add(box(2.36, 1.56, 0.04, 0x554a3a, { y: 2.2, z: -FLOOR_D / 2 + T }));
  // 天井灯
  g.add(grp(
    cyl(0.4, 0.5, 0.15, 0xf0ead0, { emissive: 0xffe8b0, emissiveIntensity: 0.9 }),
  ).translateY(FLOOR_H - 0.15));
  // ドア (右奥)
  g.add(box(1.0, 2.2, 0.08, 0x6a4a32, { x: FLOOR_W / 2 - T - 0.06, y: 1.1, ry: Math.PI / 2 }));
  return g;
}

export function makeShopInterior(type) {
  const g = new THREE.Group();
  const gen = INTERIORS[type] ?? INTERIORS.cafe;
  const hidingSpots = gen(g) ?? [];
  return { group: g, hidingSpots };
}

// ------------------------------------------------------------
// 外階段 (フロアiの右側から i+1 へ / 偶奇でジグザグ)
// ------------------------------------------------------------
export function makeStairs(parity) {
  const g = new THREE.Group();
  const sx = FLOOR_W / 2 + 1.0;
  const steps = 12;
  const runZ = FLOOR_D - 2.2;
  const dir = parity % 2 === 0 ? 1 : -1;
  const z0 = dir === 1 ? -runZ / 2 : runZ / 2;
  for (let i = 0; i < steps; i++) {
    const t01 = i / (steps - 1);
    const y = 0.18 + t01 * (FLOOR_H - 0.36);
    const z = z0 + dir * t01 * runZ;
    g.add(box(1.6, 0.09, 0.62, 0x4a4f58, { x: sx, y, z, roughness: 0.6, metalness: 0.4 }));
  }
  // 手すり
  const rail = box(0.05, 0.05, runZ + 0.8, 0x39404a, { x: sx + 0.75, y: FLOOR_H / 2 + 0.85, metalness: 0.5 });
  rail.rotation.x = -dir * Math.atan2(FLOOR_H - 0.36, runZ);
  g.add(rail);
  for (let i = 0; i <= 4; i++) {
    const t01 = i / 4;
    g.add(box(0.04, 1.0, 0.04, 0x39404a, { x: sx + 0.75, y: 0.6 + t01 * (FLOOR_H - 0.36), z: z0 + dir * t01 * runZ, metalness: 0.5 }));
  }
  // 支柱
  g.add(box(0.16, FLOOR_H, 0.16, 0x3a3f47, { x: sx + 0.6, y: FLOOR_H / 2, z: 0, metalness: 0.4 }));
  // 踊り場
  g.add(box(1.8, 0.1, 1.4, 0x4a4f58, { x: sx, y: FLOOR_H - 0.02, z: dir * (runZ / 2 + 0.5), metalness: 0.4 }));
  return g;
}

// ------------------------------------------------------------
// 屋上 (タワーの高さが変わるたびに作り直す)
// ------------------------------------------------------------
export function makeRoof() {
  const g = new THREE.Group();
  g.add(box(FLOOR_W + 0.4, 0.25, FLOOR_D + 0.4, 0x6a675e, { y: 0.12 }));
  // 給水タンク
  g.add(grp(
    cyl(1.0, 1.0, 1.6, 0x7a6a5a, { y: 1.6 }),
    cyl(1.05, 0.2, 0.5, 0x6a5a4a, { y: 2.6 }),
    box(0.12, 0.8, 0.12, 0x555, { x: -0.6, y: 0.4, z: -0.6 }),
    box(0.12, 0.8, 0.12, 0x555, { x: 0.6, y: 0.4, z: 0.6 }),
    box(0.12, 0.8, 0.12, 0x555, { x: -0.6, y: 0.4, z: 0.6 }),
    box(0.12, 0.8, 0.12, 0x555, { x: 0.6, y: 0.4, z: -0.6 }),
  ).translateX(-4).translateZ(-2));
  // アンテナ群
  for (let i = 0; i < 6; i++) {
    const x = rand(-5, 5), z = rand(-3.5, 3.5);
    g.add(cyl(0.02, 0.03, rand(1.2, 2.6), 0x8a8a92, { x, y: rand(0.7, 1.4), z }));
    if (Math.random() < 0.5) g.add(box(rand(0.5, 1.0), 0.02, 0.02, 0x8a8a92, { x, y: rand(1.6, 2.4), z }));
  }
  // てっぺんの大看板
  const top = signBoard('九龍城', { w: 4.5, h: 1.1, vertical: false, fg: '#ffec9a', bg: '#14060a', glow: '#ff4d6a', doubleSided: true });
  top.position.set(2.5, 2.2, 0.5);
  g.add(top, box(0.1, 1.8, 0.1, 0x39404a, { x: 0.8, y: 0.9, z: 0.5 }), box(0.1, 1.8, 0.1, 0x39404a, { x: 4.2, y: 0.9, z: 0.5 }));
  return g;
}

// ------------------------------------------------------------
// 地上 (広場・ガチャマシン・街灯など)
// ------------------------------------------------------------
export function makeGround() {
  const g = new THREE.Group();
  g.add(box(90, 0.4, 90, 0x2c2c31, { y: -0.2, roughness: 1 }));
  g.add(box(24, 0.44, 18, 0x3a3a40, { y: -0.18, z: 4, roughness: 1 }));

  // ガチャマシン
  const gacha = new THREE.Group();
  gacha.add(box(1.3, 1.1, 1.0, 0xd8324a, { y: 0.55, roughness: 0.4 }));
  gacha.add(sph(0.62, 0xbfe2ee, { y: 1.55, transparent: true, opacity: 0.4, roughness: 0.1 }));
  const capCols = [0xffd95a, 0x5ad07a, 0x5a8ae8, 0xff7ab8, 0xe86a5a];
  for (let i = 0; i < 8; i++) {
    gacha.add(sph(0.14, pick(capCols), { x: rand(-0.35, 0.35), y: rand(1.25, 1.75), z: rand(-0.35, 0.35) }));
  }
  gacha.add(cyl(0.16, 0.16, 0.1, 0xc8c8d0, { y: 0.62, z: 0.52, rx: Math.PI / 2, metalness: 0.7 }));
  gacha.add(box(0.3, 0.06, 0.02, 0x333, { y: 0.62, z: 0.58 }));
  gacha.add(box(0.5, 0.25, 0.06, 0x222228, { y: 0.25, z: 0.51 }));
  const gsign = signBoard('ガチャ', { w: 1.2, h: 0.4, fg: '#fff', bg: '#8a1428', glow: '#ff6a8a' });
  gsign.position.y = 2.35; gacha.add(gsign, cyl(0.04, 0.04, 0.25, 0x555, { y: 2.1 }));
  gacha.position.set(FLOOR_W / 2 + 4.5, 0, FLOOR_D / 2 + 2.5);
  gacha.traverse(o => { o.userData.gacha = true; });
  g.add(gacha);

  // 街灯
  for (const [x, z] of [[-10, 8], [10, 9], [-6, -9]]) {
    g.add(grp(
      cyl(0.08, 0.1, 4.2, 0x3a3f47, { y: 2.1 }),
      cyl(0.5, 0.02, 0.02, 0x3a3f47, { x: 0.5, y: 4.2, rz: Math.PI / 2 }),
      sph(0.14, 0xffd890, { x: 0.9, y: 4.1, emissive: 0xffc86a, emissiveIntensity: 1.4 }),
    ).translateX(x).translateZ(z));
  }
  // 自販機
  g.add(grp(
    box(1.0, 1.9, 0.7, 0xd84a3a, { y: 0.95, emissive: 0x501510, emissiveIntensity: 0.4 }),
    box(0.8, 0.7, 0.03, 0xffe8c0, { y: 1.45, z: 0.36, emissive: 0xffd890, emissiveIntensity: 0.8 }),
  ).translateX(-FLOOR_W / 2 - 2.5).translateZ(FLOOR_D / 2 + 1.5));
  // 立て看板
  const sb = signBoard('九龍城タワー', { w: 2.2, h: 0.7, fg: '#ffec9a', bg: '#101018', glow: '#ffb84d' });
  sb.position.set(-3, 1.4, FLOOR_D / 2 + 4); sb.rotation.y = 0.2;
  g.add(sb, box(0.08, 1.2, 0.08, 0x39404a, { x: -3, y: 0.5, z: FLOOR_D / 2 + 4 }));

  return { group: g, gachaMachine: gacha };
}
