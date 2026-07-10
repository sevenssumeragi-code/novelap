// ============================================================
// キャラクター3Dモデルの自動生成 (ちびキャラ風)
// 床が y=0、正面が +Z。ネオは騎士装(マント+装飾剣)。
// ============================================================
import * as THREE from 'three';
import { box, cyl, sph, grp, mat } from './prims.js';

const SKIN = 0xf6dcc0;

function makeHair(style, color) {
  const g = new THREE.Group();
  switch (style) {
    case 'fluffy': {
      g.add(sph(0.3, color, { y: 0.06, roughness: 1 }));
      g.add(sph(0.14, color, { x: -0.2, y: 0.16, z: 0.1, roughness: 1 }));
      g.add(sph(0.14, color, { x: 0.2, y: 0.18, z: 0.08, roughness: 1 }));
      g.add(sph(0.13, color, { y: 0.26, z: -0.05, roughness: 1 }));
      g.add(sph(0.12, color, { x: 0.05, y: 0.24, z: 0.16, roughness: 1 }));
      break;
    }
    case 'onefringe': {
      g.add(sph(0.29, color, { y: 0.05 }));
      g.add(sph(0.17, color, { x: -0.12, y: -0.04, z: 0.2, sy: 1.5, sz: 0.7 }));   // 左目を覆う前髪
      g.add(sph(0.12, color, { x: 0.18, y: 0.1, z: 0.16, sy: 1.3, sz: 0.6 }));
      g.add(sph(0.13, color, { x: 0, y: -0.1, z: -0.22, sy: 2.0, sz: 0.8 }));
      break;
    }
    case 'spiky': {
      g.add(sph(0.28, color, { y: 0.04 }));
      const spikes = [
        [0, 0.3, 0, 0], [-0.15, 0.26, 0.08, -0.5], [0.15, 0.26, 0.08, 0.5],
        [-0.18, 0.2, -0.12, -0.7], [0.18, 0.2, -0.12, 0.7], [0, 0.26, -0.16, 0],
      ];
      for (const [x, y, z, rz] of spikes) {
        const s = cyl(0.005, 0.09, 0.3, color, { x, y, z });
        s.rotation.z = rz; s.rotation.x = z < 0 ? 0.5 : -0.15;
        g.add(s);
      }
      break;
    }
    case 'bob': {
      g.add(sph(0.3, color, { y: 0.05 }));
      g.add(cyl(0.3, 0.26, 0.42, color, { y: -0.16 }));
      g.add(sph(0.1, color, { x: 0, y: 0.06, z: 0.25, sx: 2.4, sy: 0.8, sz: 0.5 }));
      break;
    }
    case 'long': {
      g.add(sph(0.3, color, { y: 0.05 }));
      g.add(sph(0.1, color, { y: 0.08, z: 0.25, sx: 2.6, sy: 0.7, sz: 0.5 }));
      g.add(box(0.4, 0.85, 0.14, color, { y: -0.42, z: -0.2 }));
      g.add(sph(0.08, color, { x: -0.26, y: -0.2, sz: 1.6, sy: 3.2 }));
      g.add(sph(0.08, color, { x: 0.26, y: -0.2, sz: 1.6, sy: 3.2 }));
      break;
    }
    case 'bald': {   // 床屋のオヤジ: 白髪サイド+ハゲ頭+口ひげ
      g.add(sph(0.12, color, { x: -0.22, y: -0.05, sz: 1.4 }));
      g.add(sph(0.12, color, { x: 0.22, y: -0.05, sz: 1.4 }));
      g.add(sph(0.1, color, { y: -0.12, z: -0.22, sx: 2.2 }));
      g.add(box(0.16, 0.04, 0.03, color, { y: -0.13, z: 0.26 }));   // ひげ
      break;
    }
    case 'bun': {    // カネ: おだんご
      g.add(sph(0.29, color, { y: 0.05 }));
      g.add(sph(0.13, color, { y: 0.3, z: -0.08 }));
      break;
    }
    case 'cap': {    // 郵便屋: 帽子
      g.add(sph(0.28, color, { y: 0.02 }));
      g.add(cyl(0.29, 0.3, 0.14, 0x2a4a8a, { y: 0.16 }));
      g.add(cyl(0.3, 0.3, 0.02, 0x2a4a8a, { y: 0.1, z: 0.16, sx: 1 }));
      g.add(box(0.3, 0.02, 0.18, 0x1e3a6e, { y: 0.1, z: 0.3 }));    // つば
      break;
    }
  }
  return g;
}

export function createCharacterMesh(def) {
  const g = new THREE.Group();

  // 脚・靴
  g.add(box(0.13, 0.3, 0.15, def.pants, { x: -0.09, y: 0.15 }));
  g.add(box(0.13, 0.3, 0.15, def.pants, { x: 0.09, y: 0.15 }));
  g.add(box(0.14, 0.08, 0.22, 0x33333c, { x: -0.09, y: 0.04, z: 0.02 }));
  g.add(box(0.14, 0.08, 0.22, 0x33333c, { x: 0.09, y: 0.04, z: 0.02 }));
  // 胴体・腕
  g.add(box(0.42, 0.45, 0.26, def.cloth, { y: 0.52 }));
  g.add(box(0.1, 0.38, 0.12, def.cloth, { x: -0.27, y: 0.52 }));
  g.add(box(0.1, 0.38, 0.12, def.cloth, { x: 0.27, y: 0.52 }));
  g.add(sph(0.06, SKIN, { x: -0.27, y: 0.32 }));
  g.add(sph(0.06, SKIN, { x: 0.27, y: 0.32 }));

  // 騎士装 (ネオ): マント + 肩当て + 装飾剣
  if (def.knight) {
    g.add(box(0.5, 0.62, 0.04, 0x8a1f2f, { y: 0.45, z: -0.18, rx: 0.08 }));                // マント
    g.add(box(0.16, 0.08, 0.2, 0xc8a030, { x: -0.28, y: 0.72, metalness: 0.7, roughness: 0.3 }));
    g.add(box(0.16, 0.08, 0.2, 0xc8a030, { x: 0.28, y: 0.72, metalness: 0.7, roughness: 0.3 }));
    const sword = grp(
      cyl(0.015, 0.02, 0.5, 0xc8c8d4, { y: 0.25, metalness: 0.8, roughness: 0.2 }),
      box(0.12, 0.03, 0.04, 0xc8a030, { y: 0.02, metalness: 0.7 }),
      sph(0.03, 0xd83a4a, { y: -0.04 }),
    );
    sword.position.set(0.24, 0.18, -0.1);
    sword.rotation.z = -0.25;
    g.add(sword);
  }

  // 頭
  const head = new THREE.Group();
  head.position.y = 1.0;
  head.add(sph(0.27, SKIN, { seg: 16 }));
  const eyeMat = mat(def.eye, { roughness: 0.3 });
  head.add(sph(0.045, def.eye, { x: -0.1, y: 0.0, z: 0.24, material: eyeMat }));
  head.add(sph(0.045, def.eye, { x: 0.1, y: 0.0, z: 0.24, material: eyeMat }));
  head.add(sph(0.035, 0xf4a8a0, { x: -0.16, y: -0.08, z: 0.2, transparent: true, opacity: 0.7 }));
  head.add(sph(0.035, 0xf4a8a0, { x: 0.16, y: -0.08, z: 0.2, transparent: true, opacity: 0.7 }));
  const hair = makeHair(def.hairStyle, def.hair);
  hair.position.y = 0.08;
  head.add(hair);
  g.add(head);

  g.scale.setScalar((def.scale ?? 1) * 1.35);
  g.traverse(o => { if (o.isMesh) o.userData.charId = def.id; });
  g.userData.charId = def.id;
  g.userData.headGroup = head;
  return g;
}

// 吹き出しスプライト (バーク用): 短文をCanvasで描く
export function makeBarkSprite(text) {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 128;
  const ctx = c.getContext('2d');
  // 長文は文字サイズを自動縮小して収める
  let size = 40;
  ctx.font = `bold ${size}px 'Hiragino Sans','Noto Sans JP',sans-serif`;
  while (size > 18 && ctx.measureText(text).width > 452) {
    size -= 2;
    ctx.font = `bold ${size}px 'Hiragino Sans','Noto Sans JP',sans-serif`;
  }
  const w = Math.min(492, ctx.measureText(text).width + 40);
  // 吹き出し
  ctx.fillStyle = 'rgba(16,16,28,0.85)';
  ctx.strokeStyle = 'rgba(255,202,106,0.8)';
  ctx.lineWidth = 3;
  const x = (512 - w) / 2;
  ctx.beginPath();
  ctx.roundRect(x, 14, w, 76, 20);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#f0e8d8';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 256, 54);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
  sp.scale.set(3.4, 0.85, 1);
  return sp;
}

export function makeZzzSprite() {
  const c = document.createElement('canvas');
  c.width = 128; c.height = 128;
  const ctx = c.getContext('2d');
  ctx.font = 'bold 44px sans-serif';
  ctx.fillStyle = '#bcd4ff';
  ctx.strokeStyle = '#3a5a9a';
  ctx.lineWidth = 3;
  ctx.strokeText('Z', 20, 100); ctx.fillText('Z', 20, 100);
  ctx.font = 'bold 32px sans-serif';
  ctx.strokeText('z', 62, 66); ctx.fillText('z', 62, 66);
  ctx.font = 'bold 22px sans-serif';
  ctx.strokeText('z', 92, 38); ctx.fillText('z', 92, 38);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
  sp.scale.setScalar(0.8);
  return sp;
}
