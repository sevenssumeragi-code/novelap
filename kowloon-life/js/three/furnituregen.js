// ============================================================
// 家具の3Dモデルをコードで自動生成
// 各ジェネレータは「床面が y=0、中心が原点」の Group を返す
// ============================================================
import * as THREE from 'three';
import { box, cyl, sph, grp, mat } from './prims.js';

const G = {};

// ---------- 汎用 ----------
G.table_wood = () => grp(
  box(1.6, 0.08, 1.0, 0x9a6a3a, { y: 0.72 }),
  box(0.08, 0.7, 0.08, 0x7a5028, { x: -0.7, y: 0.35, z: -0.4 }),
  box(0.08, 0.7, 0.08, 0x7a5028, { x: 0.7, y: 0.35, z: -0.4 }),
  box(0.08, 0.7, 0.08, 0x7a5028, { x: -0.7, y: 0.35, z: 0.4 }),
  box(0.08, 0.7, 0.08, 0x7a5028, { x: 0.7, y: 0.35, z: 0.4 }),
);

G.chair_wood = () => grp(
  box(0.5, 0.06, 0.5, 0x9a6a3a, { y: 0.42 }),
  box(0.5, 0.5, 0.06, 0x9a6a3a, { y: 0.72, z: -0.22 }),
  box(0.05, 0.42, 0.05, 0x7a5028, { x: -0.2, y: 0.21, z: -0.2 }),
  box(0.05, 0.42, 0.05, 0x7a5028, { x: 0.2, y: 0.21, z: -0.2 }),
  box(0.05, 0.42, 0.05, 0x7a5028, { x: -0.2, y: 0.21, z: 0.2 }),
  box(0.05, 0.42, 0.05, 0x7a5028, { x: 0.2, y: 0.21, z: 0.2 }),
);

G.plant_pot = () => grp(
  cyl(0.2, 0.15, 0.3, 0xc06a3a, { y: 0.15 }),
  cyl(0.03, 0.03, 0.5, 0x3a6a2a, { y: 0.5 }),
  sph(0.28, 0x3a8a3a, { y: 0.85, sy: 1.2 }),
  sph(0.2, 0x4a9a42, { x: 0.15, y: 0.7 }),
  sph(0.18, 0x2f7a30, { x: -0.14, y: 0.72 }),
);

G.rug_round = () => grp(
  cyl(0.9, 0.9, 0.03, 0xc05a5a, { y: 0.015, seg: 24 }),
  cyl(0.62, 0.62, 0.032, 0xe0b06a, { y: 0.017, seg: 24 }),
);

G.lamp_floor = () => {
  const g = grp(
    cyl(0.18, 0.22, 0.04, 0x333340, { y: 0.02 }),
    cyl(0.025, 0.025, 1.3, 0x555566, { y: 0.67 }),
    cyl(0.16, 0.24, 0.3, 0xffe8b0, { y: 1.42, emissive: 0xffd070, emissiveIntensity: 0.8 }),
  );
  return g;
};

G.tv_stand = () => grp(
  box(1.6, 0.4, 0.5, 0x4a3a30, { y: 0.2 }),
  box(1.2, 0.7, 0.06, 0x111118, { y: 0.95, emissive: 0x2a3a5a, emissiveIntensity: 0.6 }),
  box(0.3, 0.15, 0.05, 0x222228, { y: 0.48 }),
);

G.shelf_small = () => grp(
  box(1.0, 1.0, 0.4, 0x8a6a4a, { y: 0.5 }),
  box(0.9, 0.06, 0.34, 0xa88a68, { y: 0.5 }),
  box(0.22, 0.3, 0.2, 0xd0d0e0, { x: -0.25, y: 0.82 }),
  box(0.18, 0.24, 0.18, 0x6a9ad0, { x: 0.2, y: 0.35 }),
);

// ---------- レニィ: ふわふわ・青 ----------
G.lenny_cloudbed = () => {
  const g = grp(
    box(2.0, 0.35, 1.3, 0xf4f4ff, { y: 0.3 }),
    box(1.9, 0.15, 1.15, 0x9ec2ff, { y: 0.52 }),   // 青い毛布
    box(0.5, 0.16, 0.7, 0xffffff, { x: -0.68, y: 0.6 }), // 枕
  );
  // 雲のもこもこ
  const puffs = [[-1.0, 0.35, 0.6], [1.0, 0.32, 0.62], [-1.0, 0.3, -0.6], [1.0, 0.3, -0.62], [0, 0.28, 0.68], [0, 0.28, -0.68]];
  for (const [x, y, z] of puffs) g.add(sph(0.28, 0xffffff, { x, y, z, roughness: 1 }));
  return g;
};

G.lenny_starlamp = () => {
  const star = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.2),
    mat(0xffe27a, { emissive: 0xffd75a, emissiveIntensity: 1.2, roughness: 0.4 })
  );
  star.position.y = 1.35;
  star.scale.y = 1.5;
  return grp(
    cyl(0.14, 0.18, 0.05, 0x8098c0, { y: 0.025 }),
    cyl(0.02, 0.02, 1.15, 0xa8c0e8, { y: 0.62 }),
    star,
  );
};

G.lenny_sheep = () => grp(
  sph(0.32, 0xffffff, { y: 0.32, sx: 1.2, roughness: 1 }),
  sph(0.16, 0xe8d8c8, { x: 0.36, y: 0.36, z: 0.06 }),
  sph(0.05, 0xffffff, { x: 0.42, y: 0.5, z: 0.1 }),
  sph(0.05, 0xffffff, { x: 0.42, y: 0.5, z: -0.02 }),
);

G.lenny_beanbag = () => grp(
  sph(0.5, 0x6a9aee, { y: 0.35, sy: 0.65, roughness: 1 }),
  sph(0.35, 0x88b0f4, { y: 0.55, sy: 0.5, roughness: 1 }),
);

// ---------- ヒュウ: 優雅・鏡 ----------
G.hyu_mirror = () => grp(
  box(0.8, 1.8, 0.08, 0xc8a030, { y: 0.95, metalness: 0.6, roughness: 0.3 }),
  box(0.64, 1.62, 0.02, 0xbfe2ee, { y: 0.95, z: 0.05, metalness: 0.9, roughness: 0.05 }),
  box(0.5, 0.1, 0.3, 0xc8a030, { y: 0.05, metalness: 0.6 }),
);

G.hyu_rose = () => grp(
  cyl(0.1, 0.14, 0.5, 0xf0f0f4, { y: 0.25, roughness: 0.2 }),
  cyl(0.015, 0.015, 0.45, 0x3a6a2a, { y: 0.65 }),
  sph(0.09, 0xc02040, { y: 0.92, sy: 1.15 }),
  sph(0.06, 0xd83a58, { x: 0.1, y: 0.82 }),
  sph(0.06, 0xd83a58, { x: -0.09, y: 0.85 }),
);

G.hyu_sofa = () => grp(
  box(1.9, 0.4, 0.85, 0x7a1f33, { y: 0.28 }),
  box(1.9, 0.55, 0.22, 0x8a2a40, { y: 0.7, z: -0.31 }),
  box(0.22, 0.35, 0.85, 0x8a2a40, { x: -0.84, y: 0.62 }),
  box(0.22, 0.35, 0.85, 0x8a2a40, { x: 0.84, y: 0.62 }),
  cyl(0.05, 0.05, 0.12, 0xc8a030, { x: -0.8, y: 0.06, z: 0.32, metalness: 0.6 }),
  cyl(0.05, 0.05, 0.12, 0xc8a030, { x: 0.8, y: 0.06, z: 0.32, metalness: 0.6 }),
);

G.hyu_dresser = () => grp(
  box(1.2, 0.75, 0.5, 0xe8e0ee, { y: 0.375 }),
  box(0.9, 0.9, 0.05, 0xc8a030, { y: 1.3, z: -0.2, metalness: 0.6, roughness: 0.3 }),
  box(0.74, 0.74, 0.02, 0xbfe2ee, { y: 1.3, z: -0.16, metalness: 0.9, roughness: 0.05 }),
  sph(0.05, 0xc8a030, { x: -0.3, y: 0.55, z: 0.26 }),
  sph(0.05, 0xc8a030, { x: 0.3, y: 0.55, z: 0.26 }),
);

// ---------- ジンパチ: トレーニング ----------
G.jin_sandbag = () => grp(
  box(0.7, 0.06, 0.7, 0x333340, { y: 2.3 }),
  cyl(0.01, 0.01, 0.5, 0x888898, { y: 2.0 }),
  cyl(0.24, 0.26, 1.1, 0xc03a2a, { y: 1.2, roughness: 0.6 }),
  cyl(0.02, 0.28, 0.02, 0x333333, { y: 0.01 }),
  cyl(0.28, 0.32, 0.06, 0x333340, { y: 0.03 }),
);

G.jin_dumbbell = () => {
  const g = grp(box(1.4, 0.5, 0.5, 0x3a3a44, { y: 0.25 }));
  for (let i = 0; i < 3; i++) {
    const x = -0.45 + i * 0.45;
    const bar = grp(
      cyl(0.02, 0.02, 0.4, 0xaaaabc, { rz: Math.PI / 2 }),
      cyl(0.09, 0.09, 0.08, 0x222230, { x: -0.16, rz: Math.PI / 2 }),
      cyl(0.09, 0.09, 0.08, 0x222230, { x: 0.16, rz: Math.PI / 2 }),
    );
    bar.position.set(x, 0.58, 0);
    g.add(bar);
  }
  return g;
};

G.jin_tatami = () => grp(
  box(1.8, 0.05, 1.8, 0x9aa860, { y: 0.025 }),
  box(1.8, 0.052, 0.12, 0x3a3a2a, { y: 0.026, z: 0 }),
);

G.jin_trophy = () => {
  const g = grp(box(1.2, 0.9, 0.45, 0x6a4a2a, { y: 0.45 }), box(1.1, 0.05, 0.4, 0x8a6a44, { y: 0.62 }));
  for (let i = 0; i < 3; i++) {
    const x = -0.35 + i * 0.35;
    g.add(
      cyl(0.05, 0.08, 0.08, 0xd8b840, { x, y: 0.95, metalness: 0.7, roughness: 0.3 }),
      cyl(0.09, 0.04, 0.12, 0xd8b840, { x, y: 1.05, metalness: 0.7, roughness: 0.3 }),
    );
  }
  return g;
};

// ---------- ムニ: おもちゃ ----------
G.muni_toybox = () => grp(
  box(1.0, 0.5, 0.7, 0xe86a5a, { y: 0.25 }),
  box(1.04, 0.08, 0.74, 0x5a8ad0, { y: 0.54 }),
  sph(0.1, 0xffd95a, { x: -0.25, y: 0.62 }),
  box(0.14, 0.14, 0.14, 0x5ad07a, { x: 0.2, y: 0.65, ry: 0.5 }),
);

G.muni_blocks = () => grp(
  box(0.25, 0.25, 0.25, 0xe85a5a, { x: -0.2, y: 0.125 }),
  box(0.25, 0.25, 0.25, 0x5a8ae8, { x: 0.15, y: 0.125, z: 0.15, ry: 0.4 }),
  box(0.25, 0.25, 0.25, 0xffd95a, { x: -0.05, y: 0.375, z: 0.05, ry: 0.2 }),
  cyl(0.13, 0.13, 0.25, 0x5ad07a, { x: 0.25, y: 0.125, z: -0.2 }),
);

G.muni_bear = () => grp(
  sph(0.26, 0xc08a50, { y: 0.3, sy: 1.1, roughness: 1 }),
  sph(0.2, 0xc08a50, { y: 0.66, roughness: 1 }),
  sph(0.07, 0xa87038, { x: -0.14, y: 0.82 }),
  sph(0.07, 0xa87038, { x: 0.14, y: 0.82 }),
  sph(0.09, 0xe8c898, { y: 0.62, z: 0.16 }),
  sph(0.1, 0xc08a50, { x: -0.28, y: 0.42, roughness: 1 }),
  sph(0.1, 0xc08a50, { x: 0.28, y: 0.42, roughness: 1 }),
);

G.muni_crayon = () => {
  const g = grp(
    cyl(0.55, 0.55, 0.06, 0xffe8a0, { y: 0.42, seg: 20 }),
    cyl(0.06, 0.08, 0.4, 0xe8a05a, { y: 0.2 }),
    cyl(0.3, 0.34, 0.04, 0xe8a05a, { y: 0.02 }),
  );
  const colors = [0xe85a5a, 0x5a8ae8, 0x5ad07a, 0xffd95a];
  colors.forEach((c, i) => {
    const a = (i / colors.length) * Math.PI * 2;
    g.add(cyl(0.025, 0.025, 0.16, c, { x: Math.cos(a) * 0.3, y: 0.5, z: Math.sin(a) * 0.3, rz: 1.4, ry: a }));
  });
  return g;
};

// ---------- ゲル: 知的・紫 ----------
G.gel_desk = () => grp(
  box(1.8, 0.06, 0.8, 0x5a4a7a, { y: 0.74 }),
  box(0.06, 0.74, 0.7, 0x4a3a66, { x: -0.85, y: 0.37 }),
  box(0.06, 0.74, 0.7, 0x4a3a66, { x: 0.85, y: 0.37 }),
  box(0.7, 0.45, 0.04, 0x18181f, { y: 1.05, z: -0.25, emissive: 0x6a4ac0, emissiveIntensity: 0.5 }),
  box(0.4, 0.02, 0.15, 0x2a2a33, { x: 0.1, y: 0.78, z: 0.15 }),
);

G.gel_bookwall = () => {
  const g = grp(box(1.8, 2.0, 0.45, 0x3a2f4a, { y: 1.0 }));
  const cols = [0x8e5bc0, 0x5a4a8a, 0xc0b0d8, 0x6a3fa0, 0x9a8ab8];
  for (let s = 0; s < 4; s++) {
    g.add(box(1.68, 0.04, 0.4, 0x5a4a72, { y: 0.35 + s * 0.45 }));
    let x = -0.75;
    while (x < 0.72) {
      const w = 0.07 + Math.random() * 0.08;
      const h = 0.28 + Math.random() * 0.1;
      g.add(box(w, h, 0.3, cols[Math.floor(Math.random() * cols.length)], { x: x + w / 2, y: 0.37 + s * 0.45 + h / 2 }));
      x += w + 0.015;
    }
  }
  return g;
};

G.gel_chess = () => {
  const g = grp(
    cyl(0.45, 0.45, 0.05, 0x4a3a66, { y: 0.62, seg: 20 }),
    cyl(0.05, 0.09, 0.6, 0x3a2f4a, { y: 0.31 }),
    box(0.56, 0.02, 0.56, 0xe8e0d0, { y: 0.66 }),
  );
  for (let i = 0; i < 8; i++)
    for (let j = 0; j < 8; j++)
      if ((i + j) % 2) g.add(box(0.07, 0.022, 0.07, 0x2a2233, { x: -0.245 + i * 0.07, y: 0.661, z: -0.245 + j * 0.07 }));
  g.add(cyl(0.03, 0.04, 0.12, 0xf4f0e8, { x: -0.1, y: 0.73 }));
  g.add(cyl(0.03, 0.04, 0.12, 0x222230, { x: 0.12, y: 0.73, z: 0.08 }));
  return g;
};

G.gel_aroma = () => grp(
  cyl(0.12, 0.16, 0.7, 0x5a4a7a, { y: 0.35 }),
  sph(0.1, 0xc0a8e8, { y: 0.78, emissive: 0x9a6ae0, emissiveIntensity: 0.7, transparent: true, opacity: 0.9 }),
);

// ---------- ネオ: 黄金 ----------
G.neo_throne = () => grp(
  box(1.3, 0.25, 1.1, 0xc8a030, { y: 0.125, metalness: 0.7, roughness: 0.3 }),
  box(1.0, 0.3, 0.8, 0x8a1f2f, { y: 0.42 }),
  box(1.0, 1.5, 0.2, 0xc8a030, { y: 1.05, z: -0.4, metalness: 0.7, roughness: 0.3 }),
  box(0.8, 1.1, 0.08, 0x8a1f2f, { y: 1.0, z: -0.28 }),
  box(0.16, 0.5, 0.8, 0xc8a030, { x: -0.55, y: 0.7, metalness: 0.7 }),
  box(0.16, 0.5, 0.8, 0xc8a030, { x: 0.55, y: 0.7, metalness: 0.7 }),
  sph(0.1, 0xffe27a, { y: 1.86, z: -0.4, emissive: 0xffd75a, emissiveIntensity: 0.6 }),
);

G.neo_candelabra = () => {
  const g = grp(
    cyl(0.18, 0.24, 0.06, 0xc8a030, { y: 0.03, metalness: 0.7 }),
    cyl(0.03, 0.03, 1.3, 0xc8a030, { y: 0.7, metalness: 0.7 }),
  );
  for (let i = -1; i <= 1; i++) {
    g.add(cyl(0.02, 0.02, 0.4, 0xc8a030, { x: i * 0.2, y: 1.35, rz: i * 0.5, metalness: 0.7 }));
    g.add(cyl(0.035, 0.035, 0.15, 0xf4ecd0, { x: i * 0.3, y: 1.55 }));
    g.add(sph(0.05, 0xffb84d, { x: i * 0.3, y: 1.66, emissive: 0xff9a2a, emissiveIntensity: 1.4, sy: 1.6 }));
  }
  return g;
};

G.neo_pillar = () => grp(
  box(0.7, 0.12, 0.7, 0xe8e4da, { y: 0.06 }),
  cyl(0.22, 0.26, 2.6, 0xf0ece2, { y: 1.42, seg: 14, roughness: 0.4 }),
  box(0.66, 0.12, 0.66, 0xe8e4da, { y: 2.78 }),
);

G.neo_carpet = () => grp(
  box(2.6, 0.03, 1.6, 0x9a1f2f, { y: 0.015 }),
  box(2.3, 0.032, 1.3, 0xb83a4a, { y: 0.016 }),
  box(0.2, 0.034, 0.2, 0xd8b840, { x: -1.05, y: 0.017, z: 0.55 }),
  box(0.2, 0.034, 0.2, 0xd8b840, { x: 1.05, y: 0.017, z: 0.55 }),
  box(0.2, 0.034, 0.2, 0xd8b840, { x: -1.05, y: 0.017, z: -0.55 }),
  box(0.2, 0.034, 0.2, 0xd8b840, { x: 1.05, y: 0.017, z: -0.55 }),
);

G.neo_portrait = () => grp(
  box(0.05, 1.5, 0.5, 0x6a4a2a, { y: 0.75, rz: 0.12 }),
  box(0.9, 1.1, 0.06, 0xc8a030, { y: 1.15, z: 0.06, rx: -0.12, metalness: 0.6 }),
  box(0.74, 0.94, 0.02, 0xf4ecd0, { y: 1.15, z: 0.1, rx: -0.12 }),
  sph(0.13, 0xf0d060, { y: 1.35, z: 0.13 }),          // 金髪
  sph(0.1, 0xf0d8b8, { y: 1.3, z: 0.15 }),            // 顔
  box(0.3, 0.35, 0.02, 0xf4f0e4, { y: 1.0, z: 0.13, rx: -0.12 }),
);

export function createFurnitureMesh(itemId) {
  const gen = G[itemId];
  const g = gen ? gen() : box(0.5, 0.5, 0.5, 0xff00ff, { y: 0.25 });
  const group = g.isGroup ? g : grp(g);
  group.traverse(o => { if (o.isMesh) o.userData.furnitureRoot = group; });
  return group;
}
