// builders.js — 仕様(spec)から建物外観 / 内装 / 家具の3Dモデルを組み立てる
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import * as TX from './textures.js';

const FLOOR_H = 3.0;

function cssColor(hex) { return '#' + new THREE.Color(hex).getHexString(); }

function mesh(geo, mat, x = 0, y = 0, z = 0, name = '') {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  if (name) m.name = name;
  return m;
}

function box(w, h, d, mat, x = 0, y = 0, z = 0, name = '') {
  return mesh(new THREE.BoxGeometry(w, h, d), mat, x, y, z, name);
}

/** [w,h,d,x,y,z,rotY?] の配列をひとつのジオメトリに結合したメッシュを返す */
function mergedBoxes(list, mat, name = '') {
  const geos = list.map(([w, h, d, x, y, z, ry = 0]) => {
    const g = new THREE.BoxGeometry(w, h, d);
    if (ry) g.rotateY(ry);
    g.translate(x, y, z);
    return g;
  });
  if (geos.length === 0) return new THREE.Group();
  return mesh(mergeGeometries(geos), mat, 0, 0, 0, name);
}

function glassMaterial(tint = 0xaad4e8) {
  return new THREE.MeshStandardMaterial({
    color: tint, metalness: 0.55, roughness: 0.05,
    transparent: true, opacity: 0.45,
    side: THREE.DoubleSide,
  });
}

function plainMat(color, { roughness = 0.85, metalness = 0.0 } = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

// ============================================================
// 建物外観
// ============================================================

const WALL_STYLE_BY_TYPE = {
  house: 'plaster', cabin: 'wood', shop: 'brick',
  apartment: 'plaster', office: 'concrete', tower: 'glass',
};

function wallCanvasFn(style, color) {
  const col = color != null ? cssColor(color) : null;
  switch (style) {
    case 'brick':    return s => TX.brickTexture(s, col || '#a8503c');
    case 'wood':     return s => TX.woodTexture(s, col || '#8a5a33');
    case 'concrete': return s => TX.concreteTexture(s, col || '#b9b9b6');
    case 'japanese': return s => TX.woodTexture(s, col || '#6b4a2e');
    case 'modern':   return s => TX.plasterTexture(s, col || '#e8e8e6');
    default:         return s => TX.plasterTexture(s, col || '#f0ece2');
  }
}

/** ファサード座標 (u=横位置, y=高さ) をワールドへ。side: 0=前(+Z) 1=後 2=右(+X) 3=左 */
function facadeGeo(geoFn, side, u, y, W, D, out = 0) {
  const g = geoFn();
  const ang = [0, Math.PI, Math.PI / 2, -Math.PI / 2][side];
  g.rotateY(ang);
  const pos = [
    [u, y, D / 2 + out],
    [-u, y, -D / 2 - out],
    [W / 2 + out, y, -u],
    [-W / 2 - out, y, u],
  ][side];
  g.translate(...pos);
  return g;
}

export function buildBuilding(spec, T) {
  const b = spec.building;
  const W = b.width, D = b.depth, F = b.floors, H = F * FLOOR_H;
  const style = b.style || WALL_STYLE_BY_TYPE[b.type];
  const g = new THREE.Group();
  g.name = 'building';

  const accent = spec.color != null ? spec.color : 0x54606e;
  const glassM = glassMaterial();
  const frameM = plainMat(style === 'wood' ? 0x3a2c1c : 0x3c4148, { roughness: 0.5, metalness: 0.4 });

  // ---- 躯体 ----
  const isGlassTower = style === 'glass';
  const wallM = isGlassTower
    ? glassMaterial(0x7fa8c0)
    : T.std('wall', wallCanvasFn(style, spec.color), {
        repeat: [Math.max(1, Math.round(W / 4)), Math.max(1, Math.round(H / 4))],
        key: 'wall-' + style + '-' + (spec.color ?? 'def'),
      });
  g.add(box(W, H, D, wallM, 0, H / 2, 0, 'body'));

  if (isGlassTower) {
    // ガラス張り: 各階のスパンドレル帯 + 縦マリオン
    const bands = [];
    for (let f = 0; f <= F; f++) bands.push([W + 0.12, 0.5, D + 0.12, 0, f * FLOOR_H + (f === 0 ? 0.25 : -0.25), 0]);
    g.add(mergedBoxes(bands, plainMat(0x2e3540, { roughness: 0.4, metalness: 0.6 }), 'spandrels'));
    const mullions = [];
    for (let side = 0; side < 4; side++) {
      const span = side < 2 ? W : D;
      for (let u = -span / 2 + 1.5; u < span / 2; u += 3) {
        mullions.push(facadeGeo(() => new THREE.BoxGeometry(0.1, H, 0.1), side, u, H / 2, W, D, 0.05));
      }
    }
    g.add(mesh(mergeGeometries(mullions), plainMat(0x2e3540, { roughness: 0.4, metalness: 0.6 }), 0, 0, 0, 'mullions'));
  } else {
    // ---- 窓(結合ジオメトリ) ----
    const winW = 1.4, winH = 1.5, sill = 0.9;
    const frameGeos = [], glassGeos = [];
    for (let side = 0; side < 4; side++) {
      const span = side < 2 ? W : D;
      const n = Math.max(1, Math.floor((span - 2) / 2.3));
      const step = span / n;
      for (let f = 0; f < F; f++) {
        // 店舗は1階前面をショーウィンドウにするので通常窓を省く
        if (b.type === 'shop' && f === 0 && side === 0) continue;
        const y = f * FLOOR_H + sill + winH / 2;
        for (let i = 0; i < n; i++) {
          const u = -span / 2 + step * (i + 0.5);
          // 1階前面中央は玄関のため空ける
          if (f === 0 && side === 0 && Math.abs(u) < 1.3) continue;
          frameGeos.push(facadeGeo(() => new THREE.BoxGeometry(winW + 0.16, winH + 0.16, 0.14), side, u, y, W, D, 0.02));
          glassGeos.push(facadeGeo(() => new THREE.BoxGeometry(winW, winH, 0.06), side, u, y, W, D, 0.06));
        }
      }
    }
    if (frameGeos.length) {
      g.add(mesh(mergeGeometries(frameGeos), frameM, 0, 0, 0, 'windowFrames'));
      g.add(mesh(mergeGeometries(glassGeos), glassM, 0, 0, 0, 'windowGlass'));
    }
  }

  // ---- バルコニー ----
  if (b.balcony && !isGlassTower && F >= 2) {
    const slabs = [], rails = [];
    const bw = W - 2, bd = 1.1;
    for (let f = 1; f < F; f++) {
      const y = f * FLOOR_H;
      const z = D / 2 + bd / 2;
      slabs.push([bw, 0.14, bd, 0, y + 0.07, z]);
      rails.push([bw, 0.9, 0.06, 0, y + 0.55, z + bd / 2 - 0.03]);          // 前面パネル
      rails.push([0.06, 0.9, bd, -bw / 2 + 0.03, y + 0.55, z]);             // 左
      rails.push([0.06, 0.9, bd, bw / 2 - 0.03, y + 0.55, z]);              // 右
      rails.push([bw, 0.06, 0.06, 0, y + 1.02, z + bd / 2 - 0.03]);         // 手すり
    }
    g.add(mergedBoxes(slabs, plainMat(0xd8d5cd), 'balconySlabs'));
    g.add(mergedBoxes(rails, plainMat(0x8f959e, { roughness: 0.4, metalness: 0.5 }), 'balconyRails'));
  }

  // ---- 玄関 ----
  const doorM = T.std('furniture', s => TX.woodTexture(s, '#5f3f24'), { repeat: [1, 1], key: 'door' });
  if (b.type === 'shop') {
    // ショーウィンドウ + 日よけ + 看板
    const sfW = W - 1.6;
    g.add(box(sfW, 2.5, 0.08, glassM, 0, 1.35, D / 2 + 0.04, 'storefront'));
    g.add(mergedBoxes([
      [sfW + 0.2, 0.12, 0.12, 0, 2.7, D / 2 + 0.06],
      [0.12, 2.6, 0.12, -sfW / 2 - 0.04, 1.4, D / 2 + 0.06],
      [0.12, 2.6, 0.12, sfW / 2 + 0.04, 1.4, D / 2 + 0.06],
    ], frameM, 'storefrontFrame'));
    // 日よけ(オーニング)
    const awn = box(sfW + 0.4, 0.06, 1.3,
      T.std('sign', s => TX.fabricTexture(s, cssColor(accent)), { repeat: [4, 1], key: 'awning-' + accent }),
      0, 2.95, D / 2 + 0.6, 'awning');
    awn.rotation.x = 0.28;
    g.add(awn);
    // 看板
    const signM = T.hasImage('sign')
      ? T.std('sign', null, { repeat: [1, 1], key: 'sign' })
      : plainMat(accent, { roughness: 0.55 });
    g.add(box(sfW * 0.7, 0.9, 0.14, signM, 0, FLOOR_H + 0.9, D / 2 + 0.08, 'signBoard'));
  } else {
    const doorW = b.type === 'house' || b.type === 'cabin' ? 1.0 : 1.8;
    const dh = 2.2;
    g.add(box(doorW + 0.2, dh + 0.1, 0.16, frameM, 0, dh / 2, D / 2 + 0.02, 'doorFrame'));
    g.add(box(doorW, dh, 0.1, b.type === 'office' || b.type === 'tower' || b.type === 'apartment' ? glassM : doorM, 0, dh / 2, D / 2 + 0.06, 'door'));
    g.add(box(doorW + 1.2, 0.12, 1.4, plainMat(0xcfccc4), 0, dh + 0.35, D / 2 + 0.6, 'canopy'));
    g.add(mergedBoxes([
      [doorW + 1.0, 0.15, 0.9, 0, 0.075, D / 2 + 0.45],
      [doorW + 1.4, 0.15, 1.3, 0, -0.075, D / 2 + 0.65],
    ], plainMat(0xb5b2aa), 'steps'));
  }

  // ---- 屋根 ----
  const roofM = T.std('roof', s => TX.roofTileTexture(s, style === 'japanese' ? '#3d4048' : '#5a4a44'), {
    repeat: [Math.max(1, Math.round(W / 4)), Math.max(1, Math.round(D / 8) * 2)],
    key: 'roof',
  });
  if (b.roof === 'gable') {
    const ov = 0.45;                                   // 軒の出
    const rise = THREE.MathUtils.clamp(D * 0.32, 1.6, 3.2);
    const slopeLen = Math.hypot(D / 2 + ov, rise * (D / 2 + ov) / (D / 2));
    const ang = Math.atan2(rise, D / 2);
    for (const s of [-1, 1]) {
      // s=+1: 前面側の勾配(棟 z=0 から軒 z=+D/2+ov へ下る)
      const panel = box(W + ov * 2, 0.14, slopeLen, roofM, 0, 0, 0, 'roofSlope');
      panel.rotation.x = s * ang;
      panel.position.set(0, H + rise / 2 + 0.02, s * (D / 4 + ov / 2));
      g.add(panel);
    }
    // 妻壁(三角)
    const tri = new THREE.Shape([new THREE.Vector2(-D / 2, 0), new THREE.Vector2(D / 2, 0), new THREE.Vector2(0, rise)]);
    const triGeo = new THREE.ExtrudeGeometry(tri, { depth: 0.1, bevelEnabled: false });
    triGeo.rotateY(Math.PI / 2);
    const gableM = isGlassTower ? plainMat(0xd8d5cd) : wallM.clone();
    for (const s of [-1, 1]) g.add(mesh(triGeo.clone(), gableM, s * (W / 2 - 0.05), H, 0, 'gableEnd'));
    // 煙突
    if (b.type === 'house' || b.type === 'cabin') {
      g.add(box(0.7, rise + 1.0, 0.7, T.std('wall2', s => TX.brickTexture(s, '#8a4436'), { repeat: [1, 1], key: 'chimney' }), W / 4, H + rise / 2 + 0.4, -D / 6, 'chimney'));
    }
  } else {
    // 陸屋根: パラペット + 屋上設備
    g.add(mergedBoxes([
      [W + 0.2, 0.6, 0.2, 0, H + 0.3, D / 2],
      [W + 0.2, 0.6, 0.2, 0, H + 0.3, -D / 2],
      [0.2, 0.6, D + 0.2, W / 2, H + 0.3, 0],
      [0.2, 0.6, D + 0.2, -W / 2, H + 0.3, 0],
    ], plainMat(0xcac7bf), 'parapet'));
    g.add(mergedBoxes([
      [1.6, 0.9, 1.0, -W / 5, H + 0.45, -D / 6],
      [1.6, 0.9, 1.0, -W / 5 + 2.0, H + 0.45, -D / 6],
    ], plainMat(0x9aa0a8, { roughness: 0.5, metalness: 0.5 }), 'hvac'));
    if (b.type === 'apartment' || b.type === 'office') {
      const tank = mesh(new THREE.CylinderGeometry(0.9, 0.9, 1.6, 20), plainMat(0xd8d5cd), W / 4, H + 1.1, D / 5, 'waterTank');
      g.add(tank);
    }
  }

  const radius = Math.max(W, D);
  return {
    model: g,
    envKind: ['house', 'cabin', 'shop'].includes(b.type) ? 'grass' : 'asphalt',
    envRadius: radius * 2.0,
    walkStart: { pos: new THREE.Vector3(0, 1.6, D / 2 + radius * 0.9), lookAt: new THREE.Vector3(0, H * 0.35, 0) },
    camDist: Math.max(W, D, H) * 1.5,
    camTarget: new THREE.Vector3(0, H * 0.45, 0),
  };
}

// ============================================================
// 家具
// ============================================================

function furnitureMats(spec, T) {
  const col = spec.color;
  const woodKey = 'fwood-' + (col ?? 'def');
  return {
    wood: T.std('furniture', s => TX.woodTexture(s, col != null && /テーブル|机|椅子|棚|木/.test(spec.text) ? cssColor(col) : '#7a5230'), { repeat: [1, 1], key: woodKey, roughness: 0.7 }),
    fabric: T.std('fabric', s => TX.fabricTexture(s, col != null ? cssColor(col) : '#5471a8'), { repeat: [2, 2], key: 'fabric-' + (col ?? 'def') }),
    cushion: T.std('fabric2', s => TX.fabricTexture(s, col != null ? cssColor(new THREE.Color(col).offsetHSL(0, 0, 0.12).getHex()) : '#7189ba'), { repeat: [1, 1], key: 'cushion-' + (col ?? 'def') }),
    metal: plainMat(0x4a4e55, { roughness: 0.35, metalness: 0.7 }),
    white: plainMat(0xf2efe8, { roughness: 0.6 }),
    dark: plainMat(0x2c2c30, { roughness: 0.4 }),
  };
}

const FURNITURE_BUILDERS = {
  sofa(m) {
    const g = new THREE.Group();
    g.add(box(2.0, 0.32, 0.9, m.fabric, 0, 0.28, 0));                       // 座面ベース
    g.add(box(2.0, 0.55, 0.22, m.fabric, 0, 0.62, -0.34));                  // 背もたれ
    g.add(box(0.24, 0.62, 0.9, m.fabric, -1.0 + 0.12, 0.43, 0));            // 左肘掛け
    g.add(box(0.24, 0.62, 0.9, m.fabric, 1.0 - 0.12, 0.43, 0));
    g.add(box(0.82, 0.16, 0.62, m.cushion, -0.44, 0.52, 0.05));             // クッション
    g.add(box(0.82, 0.16, 0.62, m.cushion, 0.44, 0.52, 0.05));
    for (const [x, z] of [[-0.9, 0.38], [0.9, 0.38], [-0.9, -0.38], [0.9, -0.38]])
      g.add(box(0.07, 0.14, 0.07, m.wood, x, 0.07, z));
    return g;
  },
  table(m) {
    const g = new THREE.Group();
    g.add(box(1.2, 0.06, 0.7, m.wood, 0, 0.42, 0));
    for (const [x, z] of [[-0.53, 0.28], [0.53, 0.28], [-0.53, -0.28], [0.53, -0.28]])
      g.add(box(0.06, 0.42, 0.06, m.wood, x, 0.21, z));
    return g;
  },
  desk(m) {
    const g = new THREE.Group();
    g.add(box(1.3, 0.05, 0.65, m.wood, 0, 0.72, 0));
    for (const [x, z] of [[-0.58, 0.26], [0.58, 0.26], [-0.58, -0.26], [0.58, -0.26]])
      g.add(box(0.05, 0.72, 0.05, m.metal, x, 0.36, z));
    g.add(box(0.42, 0.28, 0.03, m.dark, 0, 1.02, -0.18));                   // モニタ
    g.add(box(0.06, 0.14, 0.05, m.metal, 0, 0.82, -0.18));
    return g;
  },
  chair(m) {
    const g = new THREE.Group();
    g.add(box(0.45, 0.05, 0.45, m.wood, 0, 0.45, 0));
    g.add(box(0.45, 0.5, 0.05, m.wood, 0, 0.72, -0.2));
    for (const [x, z] of [[-0.19, 0.19], [0.19, 0.19], [-0.19, -0.19], [0.19, -0.19]])
      g.add(box(0.045, 0.45, 0.045, m.wood, x, 0.225, z));
    return g;
  },
  shelf(m) {
    const g = new THREE.Group();
    g.add(box(0.9, 1.8, 0.3, m.wood, 0, 0.9, 0));
    const inner = plainMat(0x241a10, { roughness: 0.8 });
    for (let i = 0; i < 4; i++) g.add(box(0.78, 0.34, 0.26, inner, 0, 0.28 + i * 0.42, 0.03));
    // 本
    for (let i = 0; i < 4; i++) {
      let bx = -0.34;
      while (bx < 0.3) {
        const bw = 0.045 + Math.random() * 0.035;
        const bh = 0.22 + Math.random() * 0.1;
        g.add(box(bw, bh, 0.18, plainMat(new THREE.Color().setHSL(Math.random(), 0.45, 0.42).getHex()), bx + bw / 2, 0.28 + i * 0.42 - 0.17 + bh / 2 + 0.01, 0.02));
        bx += bw + 0.012;
      }
    }
    return g;
  },
  lamp(m) {
    const g = new THREE.Group();
    g.add(mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.04, 20), m.metal, 0, 0.02, 0));
    g.add(mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.2, 10), m.metal, 0, 0.62, 0));
    const shade = mesh(new THREE.CylinderGeometry(0.16, 0.24, 0.3, 20, 1, true),
      new THREE.MeshStandardMaterial({ color: 0xf5e6c8, emissive: 0xffdf9e, emissiveIntensity: 0.7, side: THREE.DoubleSide }),
      0, 1.32, 0);
    g.add(shade);
    return g;
  },
  tv(m, T) {
    const g = new THREE.Group();
    g.add(box(1.5, 0.42, 0.4, m.wood, 0, 0.21, 0));                         // TVボード
    const screenM = T.hasImage('tv')
      ? T.std('tv', null, { repeat: [1, 1], key: 'tvscreen', roughness: 0.2 })
      : new THREE.MeshStandardMaterial({ color: 0x0a0d12, roughness: 0.15, metalness: 0.4 });
    g.add(box(1.24, 0.72, 0.05, m.dark, 0, 0.42 + 0.4, 0));                 // ベゼル
    g.add(box(1.16, 0.64, 0.055, screenM, 0, 0.82, 0.003));
    return g;
  },
  rug(m) {
    const g = new THREE.Group();
    const rug = mesh(new THREE.CylinderGeometry(1.3, 1.3, 0.02, 36), m.rugMat, 0, 0.01, 0);
    rug.castShadow = false;
    g.add(rug);
    return g;
  },
  plant(m) {
    const g = new THREE.Group();
    g.add(mesh(new THREE.CylinderGeometry(0.16, 0.12, 0.3, 16), plainMat(0x8a5a3a), 0, 0.15, 0));
    g.add(mesh(new THREE.CylinderGeometry(0.025, 0.035, 0.5, 8), plainMat(0x5a4028), 0, 0.5, 0));
    const leaf = plainMat(0x3f6b38, { roughness: 0.7 });
    for (let i = 0; i < 5; i++) {
      const s = mesh(new THREE.IcosahedronGeometry(0.16 + Math.random() * 0.1, 1), leaf,
        (Math.random() - 0.5) * 0.3, 0.75 + Math.random() * 0.3, (Math.random() - 0.5) * 0.3);
      g.add(s);
    }
    return g;
  },
  bed(m) {
    const g = new THREE.Group();
    g.add(box(1.5, 0.28, 2.1, m.wood, 0, 0.16, 0));                         // フレーム
    g.add(box(1.5, 0.75, 0.08, m.wood, 0, 0.53, -1.05));                    // ヘッドボード
    g.add(box(1.4, 0.2, 2.0, m.white, 0, 0.4, 0));                          // マットレス
    g.add(box(1.4, 0.12, 1.3, m.fabric, 0, 0.53, 0.32));                    // 掛け布団
    g.add(box(0.55, 0.12, 0.35, m.white, -0.3, 0.56, -0.75));               // 枕
    g.add(box(0.55, 0.12, 0.35, m.white, 0.35, 0.56, -0.75));
    return g;
  },
  wardrobe(m) {
    const g = new THREE.Group();
    g.add(box(1.2, 2.0, 0.6, m.wood, 0, 1.0, 0));
    g.add(box(0.02, 1.85, 0.62, plainMat(0x2c2018), 0, 1.0, 0.0));          // 中央の合わせ目
    g.add(box(0.04, 0.3, 0.04, m.metal, -0.08, 1.1, 0.32));
    g.add(box(0.04, 0.3, 0.04, m.metal, 0.08, 1.1, 0.32));
    return g;
  },
  kitchen(m) {
    const g = new THREE.Group();
    g.add(box(2.4, 0.85, 0.65, m.white, 0, 0.425, 0));                      // キャビネット
    g.add(box(2.44, 0.05, 0.69, m.dark, 0, 0.875, 0));                      // 天板
    g.add(mesh(new THREE.BoxGeometry(0.5, 0.02, 0.4), m.metal, -0.6, 0.9, 0));  // シンク
    for (let i = 0; i < 4; i++)                                             // コンロ
      g.add(mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.02, 16), m.dark, 0.45 + (i % 2) * 0.3, 0.9, -0.12 + Math.floor(i / 2) * 0.26));
    for (let i = -1; i <= 1; i++) g.add(box(0.5, 0.03, 0.03, m.metal, i * 0.78, 0.6, 0.34)); // 取っ手
    return g;
  },
};

function buildFurnitureItem(type, mats, T) {
  const fn = FURNITURE_BUILDERS[type] || FURNITURE_BUILDERS.table;
  const g = fn(mats, T);
  g.name = type;
  return g;
}

export function buildFurnitureSet(spec, T) {
  const g = new THREE.Group();
  g.name = 'furniture';
  const mats = furnitureMats(spec, T);
  mats.rugMat = T.std('floor', s => TX.carpetTexture(s, spec.color != null ? cssColor(spec.color) : '#7f8a96'), { repeat: [2, 2], key: 'rug-' + (spec.color ?? 'def') });

  const items = [...new Set(spec.furniture)];
  const spacing = 2.2;
  const totalW = (items.length - 1) * spacing;
  items.forEach((type, i) => {
    const item = buildFurnitureItem(type, mats, T);
    item.position.x = -totalW / 2 + i * spacing;
    g.add(item);
  });

  return {
    model: g,
    envKind: 'studio',
    envRadius: Math.max(5, totalW * 0.8 + 3),
    walkStart: { pos: new THREE.Vector3(0, 1.6, 4.5), lookAt: new THREE.Vector3(0, 0.8, 0) },
    camDist: Math.max(4, totalW + 3),
    camTarget: new THREE.Vector3(0, 0.7, 0),
  };
}

// ============================================================
// 内装(部屋)
// ============================================================

export function buildRoom(spec, T) {
  const r = spec.room;
  const W = r.width, D = r.depth, H = r.height;
  const g = new THREE.Group();
  g.name = 'room';

  // ---- 床・天井・壁(内向きの片面ポリゴン: 外からドールハウスのように覗ける) ----
  const floorFn = {
    wood: s => TX.floorWoodTexture(s, '#9a6b40'),
    carpet: s => TX.carpetTexture(s, spec.color != null ? cssColor(spec.color) : '#8a93a0'),
    tatami: s => TX.carpetTexture(s, '#a8a86a'),
  }[r.floorStyle];
  const floorM = T.std('floor', floorFn, { repeat: [Math.max(1, W / 4), Math.max(1, D / 4)], key: 'floor-' + r.floorStyle + (spec.color ?? ''), roughness: 0.65 });
  const floor = mesh(new THREE.PlaneGeometry(W, D), floorM, 0, 0, 0, 'floor');
  floor.rotation.x = -Math.PI / 2;
  g.add(floor);

  const ceil = mesh(new THREE.PlaneGeometry(W, D), plainMat(0xf4f2ec), 0, H, 0, 'ceiling');
  ceil.rotation.x = Math.PI / 2;
  g.add(ceil);

  const wallFn = {
    wallpaper: s => TX.wallpaperTexture(s, '#f4efe4'),
    concrete: s => TX.concreteTexture(s),
    wood: s => TX.woodTexture(s, '#8a6238'),
  }[r.wallStyle];
  const mkWall = (w) => {
    const m = T.std('interiorWall', wallFn, { repeat: [Math.max(1, w / 4), Math.max(1, H / 2.7)], key: 'iwall-' + r.wallStyle });
    return m;
  };
  const walls = [
    { w: W, pos: [0, H / 2, -D / 2], ry: 0 },            // 奥
    { w: W, pos: [0, H / 2, D / 2], ry: Math.PI },        // 手前(カメラからは透ける)
    { w: D, pos: [-W / 2, H / 2, 0], ry: Math.PI / 2 },   // 左
    { w: D, pos: [W / 2, H / 2, 0], ry: -Math.PI / 2 },   // 右
  ];
  for (const wdef of walls) {
    const wall = mesh(new THREE.PlaneGeometry(wdef.w, H), mkWall(wdef.w), ...wdef.pos, 'wall');
    wall.rotation.y = wdef.ry;
    wall.castShadow = false;
    g.add(wall);
  }

  // 幅木
  const baseM = plainMat(0xe8e2d4, { roughness: 0.6 });
  g.add(mergedBoxes([
    [W, 0.1, 0.03, 0, 0.05, -D / 2 + 0.015],
    [W, 0.1, 0.03, 0, 0.05, D / 2 - 0.015],
    [0.03, 0.1, D, -W / 2 + 0.015, 0.05, 0],
    [0.03, 0.1, D, W / 2 - 0.015, 0.05, 0],
  ], baseM, 'baseboard'));

  // ---- 窓(左の壁) + カーテン ----
  const frameM = plainMat(0x8a8f96, { roughness: 0.4, metalness: 0.5 });
  const winG = new THREE.Group(); winG.name = 'window';
  winG.add(box(0.1, 1.5, 1.9, frameM, 0, 0, 0));
  winG.add(box(0.06, 1.36, 1.76, glassMaterial(0xcfe8f5), 0.0, 0, 0));
  winG.add(box(0.12, 0.06, 2.3, frameM, 0.02, 0.83, 0));                    // カーテンレール
  const curtM = T.std('fabric3', s => TX.fabricTexture(s, '#d9cfba'), { repeat: [2, 2], key: 'curtain' });
  for (const s of [-1, 1]) {
    const cur = box(0.06, 1.9, 0.45, curtM, 0.1, -0.12, s * (0.95 + 0.2));
    winG.add(cur);
  }
  winG.position.set(-W / 2 + 0.05, 1.5, 0);
  g.add(winG);

  // ---- ドア(奥の壁の右寄り) ----
  const doorG = new THREE.Group(); doorG.name = 'door';
  const doorM = T.std('furniture2', s => TX.woodTexture(s, '#7a5230'), { repeat: [1, 1], key: 'roomdoor' });
  doorG.add(box(0.95, 2.05, 0.12, frameM, 0, 1.025, 0));
  doorG.add(box(0.82, 1.95, 0.06, doorM, 0, 0.98, 0.02));
  doorG.add(mesh(new THREE.SphereGeometry(0.035, 12, 8), frameM, -0.3, 1.0, 0.09));
  doorG.position.set(W / 2 - 1.1, 0, -D / 2 + 0.06);
  g.add(doorG);

  // ---- シーリングライト ----
  const lightG = new THREE.Group(); lightG.name = 'ceilingLight';
  lightG.add(mesh(new THREE.CylinderGeometry(0.32, 0.36, 0.12, 24),
    new THREE.MeshStandardMaterial({ color: 0xf8f6ee, emissive: 0xfff2d8, emissiveIntensity: 0.9 }), 0, H - 0.07, 0));
  g.add(lightG);

  // ---- 家具の配置 ----
  const mats = furnitureMats(spec, T);
  mats.rugMat = T.std('rug', s => TX.carpetTexture(s, spec.color != null ? cssColor(spec.color) : '#96a0ab'), { repeat: [1.5, 1.5], key: 'rug2-' + (spec.color ?? 'def') });

  const place = (type, x, z, ry = 0) => {
    const item = buildFurnitureItem(type, mats, T);
    item.position.set(x, 0, z);
    item.rotation.y = ry;
    g.add(item);
  };
  const slots = {
    rug:      () => place('rug', 0, 0.4),
    sofa:     () => place('sofa', 0, D / 2 - 1.0, Math.PI),
    table:    () => place('table', 0, 0.4),
    tv:       () => place('tv', 0, -D / 2 + 0.35),
    shelf:    () => place('shelf', -W / 2 + 1.5, -D / 2 + 0.25),
    bed:      () => place('bed', -W / 2 + 1.1, -D / 2 + 1.35),
    desk:     () => place('desk', W / 2 - 0.5, 0.6, -Math.PI / 2),
    chair:    () => spec.room.furniture.includes('desk')
                      ? place('chair', W / 2 - 1.15, 0.6, Math.PI / 2)
                      : place('chair', 1.1, 1.2, -Math.PI / 4),
    lamp:     () => place('lamp', W / 2 - 0.5, D / 2 - 0.6),
    plant:    () => place('plant', -W / 2 + 0.5, D / 2 - 0.6),
    wardrobe: () => place('wardrobe', W / 2 - 0.8, -D / 2 + 0.4),
    kitchen:  () => place('kitchen', W / 2 - 0.42, -0.5, -Math.PI / 2),
  };
  // bed があり shelf/tv と場所が競合する場合は bed 優先で tv を右壁へ
  const list = [...new Set(r.furniture)];
  if (list.includes('bed') && list.includes('shelf')) {
    slots.shelf = () => place('shelf', 1.0, -D / 2 + 0.25);
  }
  for (const f of list) slots[f]?.();

  return {
    model: g,
    envKind: 'room',
    envRadius: Math.max(W, D),
    roomSize: { W, D, H },
    walkStart: { pos: new THREE.Vector3(0, 1.55, D / 2 - 0.8), lookAt: new THREE.Vector3(0, 1.3, -D / 2) },
    camDist: Math.max(W, D) * 1.35,
    camTarget: new THREE.Vector3(0, H / 2 - 0.3, 0),
  };
}

// ============================================================

export function buildModel(spec, T) {
  if (spec.mode === 'building') return buildBuilding(spec, T);
  if (spec.mode === 'room') return buildRoom(spec, T);
  return buildFurnitureSet(spec, T);
}

/** 生成物の周囲環境(書き出し対象外) */
export function buildEnvironment(result, T) {
  const env = new THREE.Group();
  env.name = 'environment';
  env.userData.noExport = true;
  const R = result.envRadius;

  if (result.envKind === 'room') {
    // 部屋: 内部照明
    const p = new THREE.PointLight(0xfff0d8, 25, 0, 1.9);
    p.position.set(0, result.roomSize.H - 0.25, 0);
    p.castShadow = true;
    p.shadow.mapSize.set(1024, 1024);
    p.shadow.bias = -0.002;
    env.add(p);
    return env;
  }

  const groundFn = {
    grass: (s) => TX.grassTexture(s),
    asphalt: (s) => TX.asphaltTexture(s),
    studio: (s) => TX.plasterTexture(s, '#d9d6ce'),
  }[result.envKind] || ((s) => TX.plasterTexture(s, '#d9d6ce'));
  const groundM = T.std('ground', groundFn, { repeat: [R / 3, R / 3], key: 'ground-' + result.envKind, roughness: 1 });
  const ground = mesh(new THREE.CircleGeometry(R, 48), groundM, 0, -0.01, 0, 'ground');
  ground.rotation.x = -Math.PI / 2;
  ground.castShadow = false;
  env.add(ground);

  if (result.envKind === 'grass') {
    // 玄関アプローチ + 木
    const path = mesh(new THREE.PlaneGeometry(2, R * 0.5), plainMat(0xb5aca0, { roughness: 1 }), 0, 0.0, R * 0.28);
    path.rotation.x = -Math.PI / 2;
    path.castShadow = false;
    env.add(path);
    const trunkM = plainMat(0x5a4028);
    const leafM = plainMat(0x44693d, { roughness: 0.8 });
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + 0.5;
      const d = R * 0.72;
      const t = new THREE.Group();
      t.add(mesh(new THREE.CylinderGeometry(0.12, 0.18, 1.6, 8), trunkM, 0, 0.8, 0));
      t.add(mesh(new THREE.IcosahedronGeometry(1.1, 1), leafM, 0, 2.2, 0));
      t.add(mesh(new THREE.IcosahedronGeometry(0.8, 1), leafM, 0.5, 1.8, 0.3));
      t.position.set(Math.cos(a) * d, 0, Math.sin(a) * d);
      t.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
      env.add(t);
    }
  }
  return env;
}
