// ============================================================
// キャラクター3Dモデルの自動生成 (ちびキャラ風)
// 床が y=0、正面が +Z
// ============================================================
import * as THREE from 'three';
import { box, cyl, sph, grp, mat } from './prims.js';

const SKIN = 0xf6dcc0;

function makeHair(style, color) {
  const g = new THREE.Group();
  switch (style) {
    case 'fluffy': { // レニィ / ムニ: ふわふわ
      g.add(sph(0.3, color, { y: 0.06, roughness: 1 }));
      g.add(sph(0.14, color, { x: -0.2, y: 0.16, z: 0.1, roughness: 1 }));
      g.add(sph(0.14, color, { x: 0.2, y: 0.18, z: 0.08, roughness: 1 }));
      g.add(sph(0.13, color, { y: 0.26, z: -0.05, roughness: 1 }));
      g.add(sph(0.12, color, { x: 0.05, y: 0.24, z: 0.16, roughness: 1 })); // 前髪は目にかからない高さに
      break;
    }
    case 'onefringe': { // ヒュウ: 前髪が片目を隠す
      g.add(sph(0.29, color, { y: 0.05 }));
      const fringe = sph(0.17, color, { x: -0.12, y: -0.04, z: 0.2, sy: 1.5, sz: 0.7 });
      g.add(fringe); // 左目を覆う
      g.add(sph(0.12, color, { x: 0.18, y: 0.1, z: 0.16, sy: 1.3, sz: 0.6 }));
      g.add(sph(0.13, color, { x: 0, y: -0.1, z: -0.22, sy: 2.0, sz: 0.8 })); // 襟足
      break;
    }
    case 'spiky': { // ジンパチ: ツンツン
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
    case 'bob': { // ゲル: セミロングボブ
      g.add(sph(0.3, color, { y: 0.05 }));
      const bobGeo = cyl(0.3, 0.26, 0.42, color, { y: -0.16 });
      g.add(bobGeo);
      g.add(sph(0.1, color, { x: 0, y: 0.06, z: 0.25, sx: 2.4, sy: 0.8, sz: 0.5 })); // 前髪
      break;
    }
    case 'long': { // ネオ: ロング
      g.add(sph(0.3, color, { y: 0.05 }));
      g.add(sph(0.1, color, { y: 0.08, z: 0.25, sx: 2.6, sy: 0.7, sz: 0.5 }));
      const back = box(0.4, 0.85, 0.14, color, { y: -0.42, z: -0.2 });
      g.add(back);
      g.add(sph(0.08, color, { x: -0.26, y: -0.2, sz: 1.6, sy: 3.2 }));
      g.add(sph(0.08, color, { x: 0.26, y: -0.2, sz: 1.6, sy: 3.2 }));
      break;
    }
  }
  return g;
}

export function createCharacterMesh(def) {
  const g = new THREE.Group();
  const s = def.scale;

  // 脚
  g.add(box(0.13, 0.3, 0.15, def.pants, { x: -0.09, y: 0.15 }));
  g.add(box(0.13, 0.3, 0.15, def.pants, { x: 0.09, y: 0.15 }));
  // 靴
  g.add(box(0.14, 0.08, 0.22, 0x33333c, { x: -0.09, y: 0.04, z: 0.02 }));
  g.add(box(0.14, 0.08, 0.22, 0x33333c, { x: 0.09, y: 0.04, z: 0.02 }));
  // 胴体
  g.add(box(0.42, 0.45, 0.26, def.cloth, { y: 0.52 }));
  // 腕
  g.add(box(0.1, 0.38, 0.12, def.cloth, { x: -0.27, y: 0.52 }));
  g.add(box(0.1, 0.38, 0.12, def.cloth, { x: 0.27, y: 0.52 }));
  g.add(sph(0.06, SKIN, { x: -0.27, y: 0.32 }));
  g.add(sph(0.06, SKIN, { x: 0.27, y: 0.32 }));

  // 頭
  const head = new THREE.Group();
  head.position.y = 1.0;
  head.add(sph(0.27, SKIN, { seg: 16 }));

  // 目 (ヒュウは前髪で左目が隠れるので右目のみ視認される)
  const eyeMat = mat(def.eye, { roughness: 0.3 });
  const eyeL = sph(0.045, def.eye, { x: -0.1, y: 0.0, z: 0.24, material: eyeMat });
  const eyeR = sph(0.045, def.eye, { x: 0.1, y: 0.0, z: 0.24, material: eyeMat });
  head.add(eyeL, eyeR);
  // ほっぺ
  head.add(sph(0.035, 0xf4a8a0, { x: -0.16, y: -0.08, z: 0.2, transparent: true, opacity: 0.7 }));
  head.add(sph(0.035, 0xf4a8a0, { x: 0.16, y: -0.08, z: 0.2, transparent: true, opacity: 0.7 }));

  const hair = makeHair(def.hairStyle, def.hair);
  hair.position.y = 0.08;
  head.add(hair);
  g.add(head);

  g.scale.setScalar(s * 1.35);
  g.traverse(o => { if (o.isMesh) o.userData.charId = def.id; });
  g.userData.charId = def.id;
  g.userData.headGroup = head;
  return g;
}

// レニィ用: Zzz 吹き出しスプライト
export function makeZzzSprite() {
  const c = document.createElement('canvas');
  c.width = 128; c.height = 128;
  const ctx = c.getContext('2d');
  ctx.font = 'bold 44px sans-serif';
  ctx.fillStyle = '#bcd4ff';
  ctx.strokeStyle = '#3a5a9a';
  ctx.lineWidth = 3;
  ctx.strokeText('Z', 20, 100);
  ctx.fillText('Z', 20, 100);
  ctx.font = 'bold 32px sans-serif';
  ctx.strokeText('z', 62, 66);
  ctx.fillText('z', 62, 66);
  ctx.font = 'bold 22px sans-serif';
  ctx.strokeText('z', 92, 38);
  ctx.fillText('z', 92, 38);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
  sp.scale.setScalar(0.8);
  return sp;
}
