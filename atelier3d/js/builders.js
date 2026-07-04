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
  school: 'plaster', hospital: 'plaster', hotel: 'tile',
  church: 'stone', castle: 'stone', warehouse: 'metal',
  factory: 'metal', temple: 'japanese', conbini: 'plaster',
};

function wallCanvasFn(style, color) {
  const col = color != null ? cssColor(color) : null;
  switch (style) {
    case 'brick':    return s => TX.brickTexture(s, col || '#9e4a36');
    case 'stone':    return s => TX.stoneTexture(s, col || '#9a938a');
    case 'tile':     return s => TX.tileTexture(s, col || '#e8e6e0');
    case 'metal':    return s => TX.metalTexture(s, col || '#aab2b8');
    case 'wood':     return s => TX.woodTexture(s, col || '#8a5a33');
    case 'concrete': return s => TX.concreteTexture(s, col || '#b9b9b6');
    case 'japanese': return s => TX.woodTexture(s, col || '#6b4a2e');
    case 'modern':   return s => TX.plasterTexture(s, col || '#e8e8e6');
    default:         return s => TX.plasterTexture(s, col || '#f0ece2');
  }
}

const WALL_BUMP = {
  brick: TX.brickBump, stone: TX.stoneBump, tile: TX.tileBump,
  metal: TX.metalBump, wood: TX.woodBump, japanese: TX.woodBump,
};

const WALL_SURFACE = {
  metal: { roughness: 0.4, metalness: 0.55 },
  tile: { roughness: 0.3, metalness: 0.05 },
  glass: { roughness: 0.05, metalness: 0.6 },
};

/** 面のサイズに応じて正しいタイリングの壁マテリアルを作る(4m=1タイル) */
function wallMatFor(T, style, color, faceW, faceH, keySuffix = '') {
  const surf = WALL_SURFACE[style] || { roughness: 0.85, metalness: 0.0 };
  return T.std('wall', wallCanvasFn(style, color), {
    repeat: [Math.max(1, Math.round(faceW / 4)), Math.max(1, Math.round(faceH / 4))],
    key: `wall-${style}-${color ?? 'def'}${keySuffix}`,
    bump: WALL_BUMP[style] || null,
    bumpScale: 1.4,
    ...surf,
  });
}

/** 躯体: 面ごとに正しいUVリピートを持つ6マテリアルの箱 */
function bodyBox(T, style, color, W, H, D, y = null) {
  const side = wallMatFor(T, style, color, D, H);     // ±X面
  const front = wallMatFor(T, style, color, W, H);    // ±Z面
  const top = plainMat(0xb8b4ac, { roughness: 0.95 });
  const mats = [side, side, top, top, front, front];
  return mesh(new THREE.BoxGeometry(W, H, D), mats, 0, y != null ? y : H / 2, 0, 'body');
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

/**
 * 標準的な窓群(枠+桟+窓台+ガラス)を4面に配置
 * opts: {winW, winH, sill, skipFn(side,f,u), arch, bars}
 */
function addWindows(g, T, b, W, D, F, frameM, glassM, opts = {}) {
  const winW = opts.winW ?? 1.4, winH = opts.winH ?? 1.5, sillH = opts.sill ?? 0.9;
  const bars = opts.bars ?? true;
  const frameGeos = [], glassGeos = [], sillGeos = [];
  for (let side = 0; side < 4; side++) {
    const span = side < 2 ? W : D;
    const n = Math.max(1, Math.floor((span - 2) / (winW + 0.9)));
    const step = span / n;
    for (let f = 0; f < F; f++) {
      const y = f * FLOOR_H + sillH + winH / 2;
      for (let i = 0; i < n; i++) {
        const u = -span / 2 + step * (i + 0.5);
        if (opts.skipFn && opts.skipFn(side, f, u)) continue;
        // 枠(外周4辺を1つのboxで代用せず、立体感のため額縁+奥まったガラス)
        frameGeos.push(facadeGeo(() => new THREE.BoxGeometry(winW + 0.18, winH + 0.18, 0.1), side, u, y, W, D, 0.03));
        if (bars) {
          frameGeos.push(facadeGeo(() => new THREE.BoxGeometry(0.05, winH, 0.12), side, u, y, W, D, 0.05));
          frameGeos.push(facadeGeo(() => new THREE.BoxGeometry(winW, 0.05, 0.12), side, u, y, W, D, 0.05));
        }
        // 窓台(下枠の出っ張り)
        sillGeos.push(facadeGeo(() => new THREE.BoxGeometry(winW + 0.3, 0.08, 0.18), side, u, y - winH / 2 - 0.06, W, D, 0.06));
        // ガラス(壁面より少し奥)
        glassGeos.push(facadeGeo(() => new THREE.BoxGeometry(winW, winH, 0.05), side, u, y, W, D, 0.01));
      }
    }
  }
  if (frameGeos.length) {
    g.add(mesh(mergeGeometries(frameGeos), frameM, 0, 0, 0, 'windowFrames'));
    g.add(mesh(mergeGeometries(sillGeos), plainMat(0xd8d4ca, { roughness: 0.7 }), 0, 0, 0, 'windowSills'));
    g.add(mesh(mergeGeometries(glassGeos), glassM, 0, 0, 0, 'windowGlass'));
  }
}

/** アーチ窓(教会用) */
function addArchWindows(g, T, W, D, F, frameM, glassM, wallH) {
  const winW = 0.9, winH = wallH * 0.55;
  const frameGeos = [], glassGeos = [];
  const archGeo = (w, h, d) => {
    const rect = new THREE.BoxGeometry(w, h, d);
    rect.translate(0, -w / 4, 0);
    const arch = new THREE.CylinderGeometry(w / 2, w / 2, d, 16, 1, false, 0, Math.PI);
    arch.rotateX(Math.PI / 2);
    arch.rotateZ(Math.PI / 2);
    arch.translate(0, h / 2 - w / 4, 0);
    return mergeGeometries([rect, arch]);
  };
  for (const side of [2, 3]) {
    const span = D;
    const n = Math.max(2, Math.floor(span / 2.4));
    const step = span / n;
    for (let i = 0; i < n; i++) {
      const u = -span / 2 + step * (i + 0.5);
      const y = wallH * 0.45;
      frameGeos.push(facadeGeo(() => archGeo(winW + 0.16, winH + 0.16, 0.12), side, u, y, W, D, 0.02));
      glassGeos.push(facadeGeo(() => archGeo(winW, winH, 0.08), side, u, y, W, D, 0.05));
    }
  }
  // 正面のバラ窓
  frameGeos.push(facadeGeo(() => {
    const t = new THREE.TorusGeometry(0.8, 0.1, 8, 24);
    return t;
  }, 0, 0, wallH * 0.72, W, D, 0.05));
  glassGeos.push(facadeGeo(() => {
    const c = new THREE.CylinderGeometry(0.75, 0.75, 0.06, 24);
    c.rotateX(Math.PI / 2);
    return c;
  }, 0, 0, wallH * 0.72, W, D, 0.03));
  g.add(mesh(mergeGeometries(frameGeos), frameM, 0, 0, 0, 'archWindowFrames'));
  const stained = glassMaterial(0x7fa8d9);
  stained.opacity = 0.6;
  g.add(mesh(mergeGeometries(glassGeos), stained, 0, 0, 0, 'archWindowGlass'));
}

/** 屋根を種類に応じて載せる */
function addRoof(g, T, b, style, W, D, H, wallM, spec) {
  const roofM = T.std('roof', s => TX.roofTileTexture(s, style === 'japanese' ? '#3d4048' : '#5a4a44'), {
    repeat: [Math.max(1, Math.round(W / 4)), Math.max(1, Math.round(D / 8) * 2)],
    key: 'roof',
    bump: TX.roofTileBump,
    bumpScale: 1.6,
  });

  if (b.roof === 'gable') {
    const ov = 0.45;                                   // 軒の出
    const rise = THREE.MathUtils.clamp(D * (b.type === 'church' ? 0.5 : 0.32), 1.6, b.type === 'church' ? 5 : 3.2);
    const slopeLen = Math.hypot(D / 2 + ov, rise * (D / 2 + ov) / (D / 2));
    const ang = Math.atan2(rise, D / 2);
    for (const s of [-1, 1]) {
      const panel = box(W + ov * 2, 0.14, slopeLen, roofM, 0, 0, 0, 'roofSlope');
      panel.rotation.x = s * ang;
      panel.position.set(0, H + rise / 2 + 0.02, s * (D / 4 + ov / 2));
      g.add(panel);
    }
    // 妻壁(三角)
    const tri = new THREE.Shape([new THREE.Vector2(-D / 2, 0), new THREE.Vector2(D / 2, 0), new THREE.Vector2(0, rise)]);
    const triGeo = new THREE.ExtrudeGeometry(tri, { depth: 0.1, bevelEnabled: false });
    triGeo.rotateY(Math.PI / 2);
    const gableM = style === 'glass' ? plainMat(0xd8d5cd) : wallMatFor(T, style, spec.color, D, rise, '-gable');
    for (const s of [-1, 1]) g.add(mesh(triGeo.clone(), gableM, s * (W / 2 - 0.05), H, 0, 'gableEnd'));
    // 煙突
    if (b.type === 'house' || b.type === 'cabin') {
      g.add(box(0.7, rise + 1.0, 0.7, T.std('wall2', s => TX.brickTexture(s, '#8a4436'), { repeat: [1, 1], key: 'chimney', bump: TX.brickBump }), W / 4, H + rise / 2 + 0.4, -D / 6, 'chimney'));
    }
    return rise;
  }

  if (b.roof === 'hip') {
    const ov = b.type === 'temple' ? 1.2 : 0.5;
    const rise = THREE.MathUtils.clamp(Math.min(W, D) * 0.3, 1.4, 3.0);
    const cone = new THREE.ConeGeometry(1, 1, 4, 1);
    cone.rotateY(Math.PI / 4);
    const hip = mesh(cone, roofM, 0, H + rise / 2, 0, 'hipRoof');
    hip.scale.set((W + ov * 2) / Math.SQRT2, rise, (D + ov * 2) / Math.SQRT2);
    g.add(hip);
    // 軒裏
    g.add(box(W + ov * 2, 0.12, D + ov * 2, plainMat(style === 'japanese' ? 0x4a3826 : 0xcac7bf), 0, H + 0.06, 0, 'eaves'));
    if (b.type === 'temple') {
      // 棟飾り
      g.add(box(W * 0.3, 0.18, 0.5, plainMat(0x3d4048, { roughness: 0.5 }), 0, H + rise + 0.09, 0, 'ridge'));
    }
    return rise;
  }

  if (b.roof === 'shed') {
    const ov = 0.4;
    const rise = THREE.MathUtils.clamp(D * 0.18, 0.8, 2.0);
    const slopeLen = Math.hypot(D + ov * 2, rise);
    const ang = Math.atan2(rise, D);
    const panel = box(W + ov * 2, 0.14, slopeLen, roofM, 0, H + rise / 2 + 0.05, 0, 'shedRoof');
    panel.rotation.x = ang;
    g.add(panel);
    // 側面の三角壁
    const tri = new THREE.Shape([new THREE.Vector2(-D / 2, 0), new THREE.Vector2(D / 2, 0), new THREE.Vector2(-D / 2, rise)]);
    const triGeo = new THREE.ExtrudeGeometry(tri, { depth: 0.1, bevelEnabled: false });
    triGeo.rotateY(Math.PI / 2);
    const gableM = wallMatFor(T, style, spec.color, D, rise, '-shed');
    for (const s of [-1, 1]) g.add(mesh(triGeo.clone(), gableM, s * (W / 2 - 0.05), H, 0, 'shedSide'));
    return rise;
  }

  if (b.roof === 'dome') {
    const r = Math.min(W, D) * 0.42;
    const dome = mesh(new THREE.SphereGeometry(r, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2),
      plainMat(spec.color ?? 0x4a7a8c, { roughness: 0.35, metalness: 0.45 }), 0, H, 0, 'dome');
    g.add(dome);
    g.add(mesh(new THREE.CylinderGeometry(r * 0.16, r * 0.16, 0.8, 12), plainMat(0xd9c8a8, { roughness: 0.5 }), 0, H + r + 0.3, 0, 'domeTop'));
    // ドーム基部 + パラペット
    g.add(mergedBoxes([
      [W + 0.2, 0.6, 0.2, 0, H + 0.3, D / 2],
      [W + 0.2, 0.6, 0.2, 0, H + 0.3, -D / 2],
      [0.2, 0.6, D + 0.2, W / 2, H + 0.3, 0],
      [0.2, 0.6, D + 0.2, -W / 2, H + 0.3, 0],
    ], plainMat(0xcac7bf), 'parapet'));
    return r;
  }

  // 陸屋根: パラペット + 屋上設備
  g.add(mergedBoxes([
    [W + 0.2, 0.6, 0.2, 0, H + 0.3, D / 2],
    [W + 0.2, 0.6, 0.2, 0, H + 0.3, -D / 2],
    [0.2, 0.6, D + 0.2, W / 2, H + 0.3, 0],
    [0.2, 0.6, D + 0.2, -W / 2, H + 0.3, 0],
  ], plainMat(0xcac7bf), 'parapet'));
  if (!['conbini', 'castle'].includes(b.type)) {
    g.add(mergedBoxes([
      [1.6, 0.9, 1.0, -W / 5, H + 0.45, -D / 6],
      [1.6, 0.9, 1.0, -W / 5 + 2.0, H + 0.45, -D / 6],
    ], plainMat(0x9aa0a8, { roughness: 0.5, metalness: 0.5 }), 'hvac'));
  }
  if (b.type === 'apartment' || b.type === 'office' || b.type === 'hotel') {
    g.add(mesh(new THREE.CylinderGeometry(0.9, 0.9, 1.6, 20), plainMat(0xd8d5cd), W / 4, H + 1.1, D / 5, 'waterTank'));
  }
  return 0.6;
}

/** 玄関まわり */
function addEntrance(g, T, b, W, D, frameM, glassM, accent) {
  const doorM = T.std('furniture', s => TX.woodTexture(s, '#5f3f24'), { repeat: [1, 1], key: 'door', bump: TX.woodBump });
  const glassDoorTypes = ['office', 'tower', 'apartment', 'school', 'hospital', 'hotel'];
  const doorW = ['house', 'cabin', 'temple'].includes(b.type) ? 1.0 : glassDoorTypes.includes(b.type) ? 2.2 : 1.8;
  const dh = 2.2;
  g.add(box(doorW + 0.2, dh + 0.1, 0.16, frameM, 0, dh / 2, D / 2 + 0.02, 'doorFrame'));
  g.add(box(doorW, dh, 0.1, glassDoorTypes.includes(b.type) ? glassM : doorM, 0, dh / 2, D / 2 + 0.06, 'door'));
  // 庇(ひさし)
  const canopyW = glassDoorTypes.includes(b.type) ? doorW + 2.4 : doorW + 1.2;
  g.add(box(canopyW, 0.12, 1.4, plainMat(0xcfccc4), 0, dh + 0.35, D / 2 + 0.6, 'canopy'));
  if (glassDoorTypes.includes(b.type)) {
    // 柱
    for (const s of [-1, 1])
      g.add(mesh(new THREE.CylinderGeometry(0.09, 0.09, dh + 0.3, 12), frameM, s * (canopyW / 2 - 0.3), (dh + 0.3) / 2, D / 2 + 1.05, 'canopyPost'));
  }
  g.add(mergedBoxes([
    [doorW + 1.0, 0.15, 0.9, 0, 0.075, D / 2 + 0.45],
    [doorW + 1.4, 0.15, 1.3, 0, -0.075, D / 2 + 0.65],
  ], plainMat(0xb5b2aa), 'steps'));
}

/** 建物タイプ固有の装飾 */
function addTypeDecorations(g, T, b, spec, W, D, H, F, frameM, glassM, accent, style) {
  const t = b.type;

  if (t === 'shop' || t === 'conbini') {
    // ショーウィンドウ + 日よけ/看板帯
    const sfW = W - 1.6;
    g.add(box(sfW, 2.3, 0.08, glassMaterial(0xbfe0ee), 0, 1.25, D / 2 + 0.04, 'storefront'));
    g.add(mergedBoxes([
      [sfW + 0.2, 0.12, 0.12, 0, 2.46, D / 2 + 0.06],
      [0.12, 2.5, 0.12, -sfW / 2 - 0.04, 1.25, D / 2 + 0.06],
      [0.12, 2.5, 0.12, sfW / 2 + 0.04, 1.25, D / 2 + 0.06],
      [0.1, 2.3, 0.1, -sfW / 6, 1.25, D / 2 + 0.06],
      [0.1, 2.3, 0.1, sfW / 6, 1.25, D / 2 + 0.06],
    ], frameM, 'storefrontFrame'));
    if (t === 'shop') {
      const awn = box(sfW + 0.4, 0.06, 1.3,
        T.std('sign', s => TX.fabricTexture(s, cssColor(accent)), { repeat: [4, 1], key: 'awning-' + accent }),
        0, 2.72, D / 2 + 0.6, 'awning');
      awn.rotation.x = 0.28;
      g.add(awn);
      const signM = T.hasImage('sign')
        ? T.std('sign', null, { repeat: [1, 1], key: 'sign' })
        : plainMat(accent, { roughness: 0.55 });
      g.add(box(sfW * 0.7, 0.9, 0.14, signM, 0, FLOOR_H + 0.9, D / 2 + 0.08, 'signBoard'));
    } else {
      // コンビニ: 3色の看板帯
      const bandY = 2.75;
      g.add(box(W + 0.1, 0.7, 0.16, plainMat(0xf2f2ee, { roughness: 0.4 }), 0, bandY, D / 2 + 0.08, 'signBand'));
      const stripe = [accent, 0x2e6fb0, 0xd0503a];
      stripe.forEach((c, i) => {
        g.add(box(W + 0.12, 0.16, 0.17, plainMat(c, { roughness: 0.4 }), 0, bandY + 0.18 - i * 0.18, D / 2 + 0.085, 'signStripe'));
      });
    }
    return;
  }

  if (t === 'school') {
    // 正面中央の時計
    const clockY = H - 0.9;
    g.add(mesh(new THREE.CylinderGeometry(0.65, 0.65, 0.12, 28), plainMat(0xf4f2ec, { roughness: 0.4 }), 0, clockY, D / 2 + 0.1, 'clockFace').rotateX(Math.PI / 2));
    g.add(mesh(new THREE.TorusGeometry(0.65, 0.07, 10, 28), plainMat(0x3c4148, { roughness: 0.4, metalness: 0.4 }), 0, clockY, D / 2 + 0.12, 'clockRim').rotateX(0));
    g.add(mergedBoxes([
      [0.06, 0.42, 0.04, 0, clockY + 0.18, D / 2 + 0.17],
      [0.3, 0.06, 0.04, 0.12, clockY, D / 2 + 0.17],
    ], plainMat(0x2a2a2e), 'clockHands'));
    // 校門柱
    for (const s of [-1, 1])
      g.add(box(0.5, 1.4, 0.5, plainMat(0xa8a49a), s * (W / 2 - 1), 0.7, D / 2 + 3.2, 'gatePost'));
    return;
  }

  if (t === 'hospital') {
    // 赤十字
    const crossM = plainMat(0xd03a2e, { roughness: 0.45 });
    g.add(mergedBoxes([
      [0.5, 1.5, 0.14, 0, H - 1.2, D / 2 + 0.08],
      [1.5, 0.5, 0.14, 0, H - 1.2, D / 2 + 0.08],
    ], crossM, 'redCross'));
    // 正面1階の大きなガラス
    const gw = Math.min(W - 3, 8);
    g.add(box(gw, 2.2, 0.08, glassMaterial(0xbfe0ee), 0, 1.25, D / 2 + 0.03, 'lobbyGlass'));
    return;
  }

  if (t === 'hotel') {
    // 屋上看板
    const signM = T.hasImage('sign')
      ? T.std('sign', null, { repeat: [1, 1], key: 'sign' })
      : plainMat(accent, { roughness: 0.5 });
    g.add(box(W * 0.5, 1.1, 0.2, signM, 0, H + 1.15, 0, 'roofSign'));
    g.add(mergedBoxes([
      [0.12, 0.6, 0.12, -W * 0.2, H + 0.3, 0],
      [0.12, 0.6, 0.12, W * 0.2, H + 0.3, 0],
    ], frameM, 'roofSignPosts'));
    return;
  }

  if (t === 'church') {
    // 鐘楼 + 尖塔 + 十字架
    const towerW = 2.2, towerH = H + 4.5;
    const tower = bodyBox(T, style, spec.color, towerW, towerH, towerW);
    tower.position.set(-W / 2 - towerW / 2 + 0.3, towerH / 2, D / 2 - towerW / 2);
    g.add(tower);
    // 鐘楼の開口
    const openM = plainMat(0x2a2622, { roughness: 0.95 });
    for (const [dx, dz, ry] of [[0, towerW / 2 + 0.01, 0], [0, -towerW / 2 - 0.01, Math.PI], [towerW / 2 + 0.01, 0, Math.PI / 2], [-towerW / 2 - 0.01, 0, -Math.PI / 2]]) {
      const o = box(0.8, 1.2, 0.05, openM, tower.position.x + dx, towerH - 1.6, tower.position.z + dz, 'belfry');
      o.rotation.y = ry;
      g.add(o);
    }
    const spire = mesh(new THREE.ConeGeometry(towerW * 0.78, 2.6, 4), plainMat(0x4a4a52, { roughness: 0.5 }), tower.position.x, towerH + 1.3, tower.position.z, 'spire');
    spire.rotation.y = Math.PI / 4;
    g.add(spire);
    g.add(mergedBoxes([
      [0.1, 0.9, 0.1, tower.position.x, towerH + 2.95, tower.position.z],
      [0.5, 0.1, 0.1, tower.position.x, towerH + 3.05, tower.position.z],
    ], plainMat(0xc9a227, { roughness: 0.35, metalness: 0.7 }), 'cross'));
    return;
  }

  if (t === 'castle') {
    // 四隅の円塔 + 銃眼付き胸壁
    const towerR = Math.min(W, D) * 0.16;
    const towerH = H + 1.6;
    const stoneM = wallMatFor(T, 'stone', spec.color, towerR * 4, towerH, '-tower');
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      const cyl = mesh(new THREE.CylinderGeometry(towerR, towerR * 1.12, towerH, 20), stoneM, sx * W / 2, towerH / 2, sz * D / 2, 'cornerTower');
      g.add(cyl);
      const cone = mesh(new THREE.ConeGeometry(towerR * 1.25, towerR * 2.4, 20), plainMat(0x51586b, { roughness: 0.5 }), sx * W / 2, towerH + towerR * 1.2, sz * D / 2, 'towerRoof');
      g.add(cone);
      // 旗
      g.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.4, 6), plainMat(0x777), sx * W / 2, towerH + towerR * 2.4 + 0.7, sz * D / 2, 'flagPole'));
      const flag = box(0.7, 0.4, 0.02, plainMat(accent, { roughness: 0.7 }), sx * W / 2 + 0.36, towerH + towerR * 2.4 + 1.1, sz * D / 2, 'flag');
      g.add(flag);
    }
    // 胸壁(クレネル)
    const merlons = [];
    const mw = 0.6, gap = 0.5;
    for (let side = 0; side < 4; side++) {
      const span = side < 2 ? W : D;
      for (let u = -span / 2 + mw; u < span / 2 - mw; u += mw + gap) {
        const [x, z] = side === 0 ? [u, D / 2] : side === 1 ? [u, -D / 2] : side === 2 ? [W / 2, u] : [-W / 2, u];
        merlons.push([side < 2 ? mw : 0.35, 0.7, side < 2 ? 0.35 : mw, x, H + 0.65, z]);
      }
    }
    g.add(mergedBoxes(merlons, wallMatFor(T, 'stone', spec.color, 4, 1, '-merlon'), 'merlons'));
    // 大門
    const gateM = T.std('furniture', s => TX.woodTexture(s, '#4a2f1a'), { repeat: [2, 2], key: 'gate', bump: TX.woodBump });
    g.add(box(2.6, 3.2, 0.2, gateM, 0, 1.6, D / 2 + 0.06, 'gate'));
    g.add(mesh(new THREE.CylinderGeometry(1.3, 1.3, 0.22, 20, 1, false, 0, Math.PI), gateM, 0, 3.2, D / 2 + 0.06, 'gateArch').rotateX(Math.PI / 2));
    return;
  }

  if (t === 'warehouse' || t === 'factory') {
    // 大型シャッター
    const shW = Math.min(4.5, W - 3);
    const slats = [];
    for (let yy = 0.15; yy < 3.4; yy += 0.3) slats.push([shW, 0.26, 0.08, -W / 6, yy, D / 2 + 0.04]);
    g.add(mergedBoxes(slats, plainMat(0x9aa0a8, { roughness: 0.45, metalness: 0.55 }), 'shutter'));
    g.add(mergedBoxes([
      [0.18, 3.6, 0.12, -W / 6 - shW / 2 - 0.09, 1.8, D / 2 + 0.04],
      [0.18, 3.6, 0.12, -W / 6 + shW / 2 + 0.09, 1.8, D / 2 + 0.04],
      [shW + 0.4, 0.2, 0.12, -W / 6, 3.65, D / 2 + 0.04],
    ], plainMat(0x4a4e55, { roughness: 0.4, metalness: 0.5 }), 'shutterFrame'));
    if (t === 'factory') {
      // 煙突と配管
      g.add(mesh(new THREE.CylinderGeometry(0.5, 0.62, H + 5, 16), plainMat(0xb0aca4, { roughness: 0.6 }), W / 2 - 1.2, (H + 5) / 2, -D / 3, 'chimney'));
      g.add(mesh(new THREE.CylinderGeometry(0.16, 0.16, D * 0.7, 10), plainMat(0x8a9098, { roughness: 0.4, metalness: 0.6 }), W / 2 + 0.25, H * 0.6, 0, 'pipe').rotateX(Math.PI / 2));
      // のこぎり屋根
      const teeth = 3;
      const tw = W / teeth;
      const roofM2 = plainMat(0x7d838c, { roughness: 0.5, metalness: 0.4 });
      for (let i = 0; i < teeth; i++) {
        const x = -W / 2 + tw * (i + 0.5);
        const tri = new THREE.Shape([new THREE.Vector2(-tw / 2, 0), new THREE.Vector2(tw / 2, 0), new THREE.Vector2(-tw / 2, 1.3)]);
        const tg = new THREE.ExtrudeGeometry(tri, { depth: D, bevelEnabled: false });
        tg.translate(0, 0, -D / 2);
        g.add(mesh(tg, roofM2, x, H + 0.02, 0, 'sawtooth'));
        const gl = box(tw * 0.92, 1.1, 0.06, glassMaterial(0xcfe4f0), x - tw / 2 + 0.02, H + 0.6, 0, 'sawtoothGlass');
        gl.rotation.y = Math.PI / 2;
        g.add(gl);
      }
    }
    return;
  }

  if (t === 'temple') {
    // 縁側と柱
    const engawaM = T.std('furniture', s => TX.woodTexture(s, '#8a6238'), { repeat: [4, 1], key: 'engawa', bump: TX.woodBump });
    g.add(box(W + 1.6, 0.25, D + 1.6, engawaM, 0, 0.42, 0, 'engawa'));
    g.add(mergedBoxes([[W + 2, 0.15, D + 2, 0, 0.1, 0]], plainMat(0x8a8578), 'foundation'));
    const postM = plainMat(0x5a3c22, { roughness: 0.7 });
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      g.add(mesh(new THREE.CylinderGeometry(0.14, 0.14, FLOOR_H, 10), postM, sx * (W / 2 + 0.55), FLOOR_H / 2 + 0.5, sz * (D / 2 + 0.55), 'post'));
    }
    return;
  }
}

/** 付帯設備: ガレージ・塀・プール・庭 */
function addExtras(g, T, b, W, D, accent) {
  if (b.garage) {
    const gw = 3.6, gh = 2.7, gd = 5.6;
    const gx = W / 2 + gw / 2 + 0.8;
    const garage = new THREE.Group();
    garage.name = 'garage';
    const gwM = wallMatFor(T, 'plaster', null, gw, gh, '-garage');
    garage.add(box(gw, gh, gd, gwM, gx, gh / 2, 0));
    garage.add(box(gw + 0.3, 0.14, gd + 0.3, plainMat(0x8d8a82), gx, gh + 0.07, 0, 'garageRoof'));
    const slats = [];
    for (let yy = 0.15; yy < gh - 0.4; yy += 0.28) slats.push([gw - 0.5, 0.24, 0.08, gx, yy, gd / 2 + 0.05]);
    garage.add(mergedBoxes(slats, plainMat(0xb8bcc2, { roughness: 0.4, metalness: 0.5 }), 'garageShutter'));
    g.add(garage);
  }
  if (b.pool) {
    const pw = Math.max(4, W * 0.5), pd = 3;
    const px = -W / 2 - pw / 2 - 1.5;
    const water = mesh(new THREE.BoxGeometry(pw, 0.25, pd),
      new THREE.MeshStandardMaterial({ color: 0x3fb8dd, roughness: 0.08, metalness: 0.1, transparent: true, opacity: 0.85 }),
      px, 0.12, 1.0, 'poolWater');
    g.add(water);
    g.add(mergedBoxes([
      [pw + 0.5, 0.22, 0.25, px, 0.11, 1.0 - pd / 2 - 0.12],
      [pw + 0.5, 0.22, 0.25, px, 0.11, 1.0 + pd / 2 + 0.12],
      [0.25, 0.22, pd + 0.5, px - pw / 2 - 0.12, 0.11, 1.0],
      [0.25, 0.22, pd + 0.5, px + pw / 2 + 0.12, 0.11, 1.0],
    ], plainMat(0xd8d4ca, { roughness: 0.6 }), 'poolRim'));
  }
  if (b.fence) {
    const fx = W / 2 + (b.garage ? 5.4 : 0) + 2.2;
    const fz = D / 2 + 3.0;
    const posts = [], rails = [];
    const step = 1.8;
    for (let x = -fx; x <= fx; x += step) {
      posts.push([0.09, 1.1, 0.09, x, 0.55, fz]);
      posts.push([0.09, 1.1, 0.09, x, 0.55, -fz]);
    }
    for (let z = -fz; z <= fz; z += step) {
      posts.push([0.09, 1.1, 0.09, fx, 0.55, z]);
      posts.push([0.09, 1.1, 0.09, -fx, 0.55, z]);
    }
    for (const s of [-1, 1]) {
      rails.push([fx * 2, 0.07, 0.05, 0, 0.98, s * fz]);
      rails.push([fx * 2, 0.07, 0.05, 0, 0.55, s * fz]);
      rails.push([0.05, 0.07, fz * 2, s * fx, 0.98, 0]);
      rails.push([0.05, 0.07, fz * 2, s * fx, 0.55, 0]);
    }
    // 正面の門の開口: 正面中央 ±1.2m の柵は生成しない(見た目簡略化)
    const fenceM = plainMat(0x6b6b70, { roughness: 0.45, metalness: 0.4 });
    g.add(mergedBoxes(posts.filter(p => !(Math.abs(p[3]) < 1.4 && p[5] === fz)), fenceM, 'fencePosts'));
    g.add(mergedBoxes(rails, fenceM, 'fenceRails'));
  }
  if (b.garden) {
    const bedM = plainMat(0x6b4a2e, { roughness: 1 });
    const leafM = plainMat(0x3f6b38, { roughness: 0.8 });
    for (const s of [-1, 1]) {
      const bx = s * (W / 2 - 1);
      g.add(box(2.2, 0.22, 0.9, bedM, bx, 0.11, D / 2 + 1.6, 'flowerBed'));
      for (let i = 0; i < 6; i++) {
        const fx2 = bx - 1.0 + (i % 3) * 1.0, fz2 = D / 2 + 1.35 + Math.floor(i / 3) * 0.5;
        g.add(mesh(new THREE.IcosahedronGeometry(0.13, 1), leafM, fx2, 0.3, fz2));
        g.add(mesh(new THREE.SphereGeometry(0.07, 8, 6),
          plainMat([0xd05a6e, 0xe8c44a, 0xd9836f, 0xc45ac0][i % 4], { roughness: 0.6 }), fx2, 0.44, fz2, 'flower'));
      }
    }
  }
}

export function buildBuilding(spec, T) {
  const b = spec.building;
  const W = b.width, D = b.depth, F = b.floors, H = F * FLOOR_H;
  const style = b.style || WALL_STYLE_BY_TYPE[b.type];
  const g = new THREE.Group();
  g.name = 'building';

  const accent = spec.color != null ? spec.color : 0x54606e;
  const glassM = glassMaterial();
  const frameM = plainMat(style === 'wood' || style === 'japanese' ? 0x3a2c1c : 0x3c4148, { roughness: 0.5, metalness: 0.4 });

  // ---- 躯体 ----
  const isGlassTower = style === 'glass';
  if (isGlassTower) {
    g.add(box(W, H, D, glassMaterial(0x7fa8c0), 0, H / 2, 0, 'body'));
    // 各階のスパンドレル帯 + 縦マリオン
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
    g.add(bodyBox(T, style, spec.color, W, H, D));

    // ---- 窓 ----
    if (b.type === 'church') {
      addArchWindows(g, T, W, D, F, frameM, glassM, H);
    } else if (b.type === 'castle') {
      // 銃眼スリット
      const slits = [];
      for (let side = 0; side < 4; side++) {
        const span = side < 2 ? W : D;
        const n = Math.max(2, Math.floor(span / 3));
        for (let f = 0; f < F; f++) {
          for (let i = 0; i < n; i++) {
            const u = -span / 2 + (span / n) * (i + 0.5);
            if (f === 0 && side === 0 && Math.abs(u) < 2) continue;
            slits.push(facadeGeo(() => new THREE.BoxGeometry(0.22, 0.9, 0.08), side, u, f * FLOOR_H + 1.8, W, D, 0.02));
          }
        }
      }
      g.add(mesh(mergeGeometries(slits), plainMat(0x201d1a, { roughness: 1 }), 0, 0, 0, 'slits'));
    } else {
      const isBig = ['school', 'office', 'hospital'].includes(b.type);
      const isInd = ['warehouse', 'factory'].includes(b.type);   // 工業系は高窓
      addWindows(g, T, b, W, D, F, frameM, glassM, {
        winW: isBig ? 1.8 : isInd ? 1.1 : 1.4,
        winH: isBig ? 1.7 : isInd ? 0.8 : 1.5,
        sill: isInd ? 2.0 : 0.9,
        skipFn: (side, f, u) => {
          if ((b.type === 'shop' || b.type === 'conbini') && f === 0 && side === 0) return true;
          if (isInd && side === 0 && Math.abs(u + W / 6) < 3) return true;  // シャッター位置
          if (!isInd && f === 0 && side === 0 && Math.abs(u) < 1.5) return true;  // 玄関
          return false;
        },
      });
    }
  }

  // ---- バルコニー ----
  if (b.balcony && !isGlassTower && F >= 2 && !['church', 'castle', 'warehouse', 'factory'].includes(b.type)) {
    const slabs = [], rails = [];
    const bw = W - 2, bd = 1.1;
    // 店舗は1階が日よけ・看板で埋まるため2階の床(f=2)から
    const fStart = b.type === 'shop' || b.type === 'conbini' ? 2 : 1;
    for (let f = fStart; f < F; f++) {
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

  // ---- 玄関(店舗系は装飾側で作る) ----
  if (!['shop', 'conbini', 'castle'].includes(b.type)) {
    addEntrance(g, T, b, W, D, frameM, glassM, accent);
  }

  // ---- 屋根 ----
  addRoof(g, T, b, style, W, D, H, null, spec);

  // ---- タイプ固有の装飾 ----
  addTypeDecorations(g, T, b, spec, W, D, H, F, frameM, glassM, accent, style);

  // ---- 付帯設備 ----
  addExtras(g, T, b, W, D, accent);

  const radius = Math.max(W, D) + (b.garage ? 4 : 0);
  const grassTypes = ['house', 'cabin', 'shop', 'church', 'temple', 'castle'];
  return {
    model: g,
    envKind: grassTypes.includes(b.type) ? 'grass' : 'asphalt',
    envRadius: radius * 2.0,
    walkStart: { pos: new THREE.Vector3(0, 1.6, D / 2 + radius * 0.9), lookAt: new THREE.Vector3(0, H * 0.35, 0) },
    camDist: Math.max(W, D, H) * 1.5,
    camTarget: new THREE.Vector3(0, H * 0.45, 0),
  };
}

// ============================================================
// 家具
// ============================================================

/** アイテムごとの色を反映したマテリアル一式 */
function matsForItem(spec, T, item = null) {
  const col = item?.color ?? spec.color;
  const key = col ?? 'def';
  const woodCol = item?.color != null && ['table', 'desk', 'chair', 'shelf', 'bench', 'stool', 'wardrobe', 'bed', 'counter', 'kotatsu'].includes(item.type)
    ? cssColor(item.color) : '#7a5230';
  return {
    wood: T.std('furniture', s => TX.woodTexture(s, woodCol), { repeat: [1, 1], key: 'fwood-' + (woodCol), roughness: 0.65, bump: TX.woodBump, bumpScale: 0.6 }),
    fabric: T.std('fabric', s => TX.fabricTexture(s, col != null ? cssColor(col) : '#5471a8'), { repeat: [2, 2], key: 'fabric-' + key, bump: TX.fabricBump, bumpScale: 0.4 }),
    cushion: T.std('fabric2', s => TX.fabricTexture(s, col != null ? cssColor(new THREE.Color(col).offsetHSL(0, 0, 0.12).getHex()) : '#7189ba'), { repeat: [1, 1], key: 'cushion-' + key, bump: TX.fabricBump, bumpScale: 0.4 }),
    metal: plainMat(0x4a4e55, { roughness: 0.35, metalness: 0.7 }),
    chrome: plainMat(0xc8ccd2, { roughness: 0.15, metalness: 0.9 }),
    white: plainMat(0xf2efe8, { roughness: 0.55 }),
    dark: plainMat(0x2c2c30, { roughness: 0.4 }),
    accent: plainMat(col != null ? col : 0x5471a8, { roughness: 0.6 }),
  };
}

/** 丸みのある箱(クッション・マットレス用) */
function softBox(w, h, d, mat, x = 0, y = 0, z = 0) {
  const r = Math.min(w, h, d) * 0.45;
  const geo = new THREE.CapsuleGeometry(r, Math.max(0.01, w - r * 2), 4, 12);
  geo.rotateZ(Math.PI / 2);
  const m = mesh(geo, mat, x, y, z);
  m.scale.set(1, h / (r * 2), d / (r * 2));
  return m;
}

const FURNITURE_BUILDERS = {
  sofa(m, T, item) {
    const seats = item?.seats || 2;
    const w = 0.75 * seats + 0.5;
    const g = new THREE.Group();
    g.add(box(w, 0.3, 0.9, m.fabric, 0, 0.27, 0));                          // 座面ベース
    g.add(box(w, 0.62, 0.24, m.fabric, 0, 0.6, -0.33));                     // 背もたれ
    // 肘掛け(丸み)
    for (const s of [-1, 1]) {
      g.add(box(0.22, 0.5, 0.9, m.fabric, s * (w / 2 - 0.11), 0.4, 0));
      g.add(softBox(0.26, 0.22, 0.9, m.fabric, s * (w / 2 - 0.11), 0.68, 0));
    }
    // 座クッション + 背クッション(丸み)
    const cw = (w - 0.5) / seats;
    for (let i = 0; i < seats; i++) {
      const x = -((seats - 1) / 2) * cw + i * cw;
      g.add(softBox(cw - 0.06, 0.17, 0.6, m.cushion, x, 0.5, 0.04));
      const back = softBox(cw - 0.08, 0.42, 0.16, m.cushion, x, 0.72, -0.26);
      back.rotation.x = -0.12;
      g.add(back);
    }
    for (const [x, z] of [[-w / 2 + 0.1, 0.38], [w / 2 - 0.1, 0.38], [-w / 2 + 0.1, -0.38], [w / 2 - 0.1, -0.38]])
      g.add(mesh(new THREE.CylinderGeometry(0.035, 0.028, 0.14, 10), m.wood, x, 0.07, z));
    return g;
  },
  table(m) {
    const g = new THREE.Group();
    g.add(box(1.2, 0.06, 0.7, m.wood, 0, 0.42, 0));
    g.add(box(1.06, 0.05, 0.56, m.wood, 0, 0.38, 0));                       // 幕板
    for (const [x, z] of [[-0.52, 0.27], [0.52, 0.27], [-0.52, -0.27], [0.52, -0.27]])
      g.add(mesh(new THREE.CylinderGeometry(0.032, 0.026, 0.42, 10), m.wood, x, 0.21, z));
    return g;
  },
  kotatsu(m) {
    const g = new THREE.Group();
    g.add(box(1.1, 0.05, 0.8, m.wood, 0, 0.38, 0));                         // 天板
    g.add(box(1.25, 0.3, 0.95, m.fabric, 0, 0.2, 0));                       // 布団
    g.add(box(1.0, 0.05, 0.7, m.wood, 0, 0.05, 0));                         // 台
    return g;
  },
  desk(m) {
    const g = new THREE.Group();
    g.add(box(1.3, 0.05, 0.65, m.wood, 0, 0.72, 0));
    for (const [x, z] of [[-0.58, 0.26], [0.58, 0.26], [-0.58, -0.26], [0.58, -0.26]])
      g.add(box(0.05, 0.72, 0.05, m.metal, x, 0.36, z));
    g.add(box(0.4, 0.5, 0.55, m.wood, 0.4, 0.47, 0));                       // 袖引き出し
    g.add(box(0.36, 0.1, 0.02, m.metal, 0.4, 0.6, 0.28));
    g.add(box(0.42, 0.28, 0.03, m.dark, 0, 1.02, -0.18));                   // モニタ
    g.add(box(0.06, 0.14, 0.05, m.metal, 0, 0.82, -0.18));
    g.add(box(0.34, 0.012, 0.13, m.white, -0.1, 0.735, 0.1));               // キーボード
    return g;
  },
  chair(m) {
    const g = new THREE.Group();
    g.add(box(0.45, 0.06, 0.45, m.wood, 0, 0.45, 0));
    g.add(softBox(0.42, 0.05, 0.42, m.cushion, 0, 0.49, 0));                // 座クッション
    const back = box(0.45, 0.5, 0.05, m.wood, 0, 0.72, -0.2);
    back.rotation.x = 0.08;
    g.add(back);
    for (const [x, z] of [[-0.19, 0.19], [0.19, 0.19], [-0.19, -0.19], [0.19, -0.19]])
      g.add(mesh(new THREE.CylinderGeometry(0.024, 0.02, 0.45, 8), m.wood, x, 0.225, z));
    return g;
  },
  stool(m) {
    const g = new THREE.Group();
    g.add(mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.05, 18), m.wood, 0, 0.45, 0));
    g.add(softBox(0.34, 0.06, 0.34, m.cushion, 0, 0.5, 0));
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      const leg = mesh(new THREE.CylinderGeometry(0.02, 0.016, 0.46, 8), m.wood, Math.cos(a) * 0.13, 0.22, Math.sin(a) * 0.13);
      leg.rotation.z = Math.cos(a) * 0.12;
      leg.rotation.x = -Math.sin(a) * 0.12;
      g.add(leg);
    }
    return g;
  },
  bench(m, T, item) {
    const seats = item?.seats || 2;
    const w = 0.6 * seats + 0.3;
    const g = new THREE.Group();
    for (let i = 0; i < 3; i++) g.add(box(w, 0.04, 0.11, m.wood, 0, 0.42, -0.14 + i * 0.14));
    for (const s of [-1, 1]) {
      g.add(box(0.05, 0.42, 0.4, m.metal, s * (w / 2 - 0.08), 0.21, 0));
    }
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
    g.add(box(1.5, 0.4, 0.4, m.wood, 0, 0.2, 0));                           // TVボード
    g.add(box(0.4, 0.28, 0.36, m.dark, -0.5, 0.2, 0.021));                  // デッキ棚
    const screenM = T.hasImage('tv')
      ? T.std('tv', null, { repeat: [1, 1], key: 'tvscreen', roughness: 0.2 })
      : new THREE.MeshStandardMaterial({ color: 0x0a0d12, roughness: 0.12, metalness: 0.45 });
    g.add(box(1.3, 0.76, 0.04, m.dark, 0, 0.84, -0.02));                    // ベゼル
    g.add(box(1.24, 0.7, 0.045, screenM, 0, 0.84, 0.0));
    g.add(box(0.5, 0.05, 0.22, m.dark, 0, 0.425, 0));                       // スタンド
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
    for (let i = 0; i < 7; i++) {
      const s = mesh(new THREE.IcosahedronGeometry(0.14 + Math.random() * 0.1, 1), leaf,
        (Math.random() - 0.5) * 0.34, 0.72 + Math.random() * 0.35, (Math.random() - 0.5) * 0.34);
      g.add(s);
    }
    return g;
  },
  bed(m) {
    const g = new THREE.Group();
    g.add(box(1.5, 0.26, 2.1, m.wood, 0, 0.15, 0));                         // フレーム
    g.add(box(1.5, 0.8, 0.08, m.wood, 0, 0.55, -1.05));                     // ヘッドボード
    g.add(softBox(1.42, 0.22, 2.0, m.white, 0, 0.4, 0));                    // マットレス
    const duvet = softBox(1.46, 0.14, 1.35, m.fabric, 0, 0.52, 0.33);       // 掛け布団
    g.add(duvet);
    for (const px of [-0.32, 0.34])
      g.add(softBox(0.55, 0.13, 0.35, m.white, px, 0.56, -0.75));           // 枕
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
    g.add(mesh(new THREE.BoxGeometry(0.5, 0.02, 0.4), m.chrome, -0.6, 0.9, 0));  // シンク
    g.add(mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.25, 8), m.chrome, -0.6, 1.0, -0.15)); // 蛇口
    for (let i = 0; i < 4; i++)                                             // コンロ
      g.add(mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.02, 16), m.dark, 0.45 + (i % 2) * 0.3, 0.9, -0.12 + Math.floor(i / 2) * 0.26));
    for (let i = -1; i <= 1; i++) g.add(box(0.5, 0.03, 0.03, m.metal, i * 0.78, 0.6, 0.34)); // 取っ手
    // レンジフード
    g.add(box(0.8, 0.4, 0.5, m.metal, 0.6, 1.9, -0.05));
    g.add(box(0.3, 0.5, 0.3, m.metal, 0.6, 2.35, -0.05));
    return g;
  },
  counter(m) {
    const g = new THREE.Group();
    g.add(box(1.8, 0.95, 0.55, m.wood, 0, 0.475, 0));
    g.add(box(1.9, 0.05, 0.65, m.dark, 0, 0.975, 0));
    return g;
  },
  fridge(m) {
    const g = new THREE.Group();
    const body = plainMat(0xe8eaec, { roughness: 0.35, metalness: 0.3 });
    g.add(box(0.68, 1.75, 0.68, body, 0, 0.875, 0));
    g.add(box(0.68, 0.02, 0.69, m.dark, 0, 1.15, 0.0));                     // ドア境界
    g.add(box(0.03, 0.5, 0.03, m.chrome, 0.28, 1.5, 0.35));                 // 取っ手上
    g.add(box(0.03, 0.7, 0.03, m.chrome, 0.28, 0.7, 0.35));                 // 取っ手下
    return g;
  },
  washer(m) {
    const g = new THREE.Group();
    g.add(box(0.62, 0.86, 0.62, m.white, 0, 0.43, 0));
    g.add(mesh(new THREE.TorusGeometry(0.19, 0.035, 10, 24), plainMat(0xd0d3d8, { roughness: 0.3, metalness: 0.4 }), 0, 0.45, 0.315));
    g.add(mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.02, 24), plainMat(0x22262e, { roughness: 0.1, metalness: 0.5 }), 0, 0.45, 0.31).rotateX(Math.PI / 2));
    g.add(box(0.5, 0.06, 0.05, m.dark, 0, 0.82, 0.29));                     // 操作パネル
    return g;
  },
  toilet(m) {
    const g = new THREE.Group();
    const white = plainMat(0xf4f4f2, { roughness: 0.25 });
    g.add(box(0.42, 0.5, 0.24, white, 0, 0.45, -0.24));                     // タンク
    g.add(box(0.36, 0.06, 0.14, m.chrome, 0, 0.72, -0.24));                 // レバー部
    const bowl = mesh(new THREE.CylinderGeometry(0.2, 0.14, 0.32, 20), white, 0, 0.24, 0.02);
    bowl.scale.set(1, 1, 1.25);
    g.add(bowl);
    const seat = mesh(new THREE.TorusGeometry(0.19, 0.045, 10, 24), white, 0, 0.42, 0.02);
    seat.rotation.x = Math.PI / 2;
    seat.scale.set(1, 1.25, 1);
    g.add(seat);
    return g;
  },
  bathtub(m) {
    const g = new THREE.Group();
    const white = plainMat(0xf4f4f2, { roughness: 0.2 });
    g.add(box(1.5, 0.55, 0.75, white, 0, 0.275, 0));
    g.add(box(1.34, 0.04, 0.6, new THREE.MeshStandardMaterial({ color: 0x9fd4e8, roughness: 0.05, metalness: 0.05, transparent: true, opacity: 0.9 }), 0, 0.48, 0, 'water'));
    // 縁の丸み
    g.add(softBox(1.56, 0.1, 0.82, white, 0, 0.56, 0));
    g.add(mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.3, 8), m.chrome, -0.6, 0.7, -0.3));   // 蛇口
    return g;
  },
  sink(m) {
    const g = new THREE.Group();
    g.add(box(0.75, 0.8, 0.5, m.white, 0, 0.4, 0));                         // キャビネット
    g.add(box(0.8, 0.06, 0.55, plainMat(0xe8e6e0, { roughness: 0.2 }), 0, 0.83, 0));
    const basin = mesh(new THREE.CylinderGeometry(0.2, 0.15, 0.1, 20), plainMat(0xffffff, { roughness: 0.15 }), 0, 0.87, 0.02);
    g.add(basin);
    g.add(mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.24, 8), m.chrome, 0, 0.98, -0.14));
    g.add(box(0.6, 0.8, 0.03, plainMat(0xbfd4dd, { roughness: 0.05, metalness: 0.85 }), 0, 1.55, -0.22, 'mirror'));  // 鏡
    return g;
  },
  mirror(m) {
    const g = new THREE.Group();
    g.add(box(0.55, 1.6, 0.05, m.wood, 0, 0.85, 0));
    g.add(box(0.45, 1.5, 0.02, plainMat(0xc4d8e2, { roughness: 0.04, metalness: 0.9 }), 0, 0.85, 0.03));
    const foot = box(0.5, 0.04, 0.3, m.wood, 0, 0.02, -0.05);
    g.add(foot);
    g.rotation.x = -0.06;
    return g;
  },
  clock(m) {
    const g = new THREE.Group();
    g.add(mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.06, 28), m.wood, 0, 0, 0).rotateX(Math.PI / 2));
    g.add(mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.02, 28), plainMat(0xf6f4ee, { roughness: 0.4 }), 0, 0, 0.03).rotateX(Math.PI / 2));
    g.add(mergedBoxes([
      [0.02, 0.14, 0.01, 0, 0.07, 0.045],
      [0.1, 0.02, 0.01, 0.05, 0, 0.045],
    ], plainMat(0x2a2a2e), 'hands'));
    return g;
  },
  piano(m) {
    const g = new THREE.Group();
    const black = plainMat(0x141416, { roughness: 0.15, metalness: 0.2 });
    g.add(box(1.5, 1.3, 0.6, black, 0, 0.65, -0.1));                        // 本体
    g.add(box(1.5, 0.05, 0.35, black, 0, 0.75, 0.25));                      // 鍵盤蓋
    g.add(box(1.38, 0.04, 0.28, plainMat(0xf8f8f4, { roughness: 0.3 }), 0, 0.72, 0.26)); // 白鍵
    const blackKeys = [];
    for (let x = -0.62; x < 0.66; x += 0.055) {
      if (Math.random() < 0.7) blackKeys.push([0.028, 0.03, 0.16, x, 0.745, 0.21]);
    }
    g.add(mergedBoxes(blackKeys, black, 'blackKeys'));
    for (const [x, z] of [[-0.68, 0.28], [0.68, 0.28], [-0.68, -0.35], [0.68, -0.35]])
      g.add(box(0.07, 0.42, 0.07, black, x, 0.21, z));
    g.add(box(0.9, 0.04, 0.3, black, 0, 0.55, 0.65));                       // 椅子
    for (const [x, z] of [[-0.4, 0.55], [0.4, 0.55], [-0.4, 0.75], [0.4, 0.75]])
      g.add(box(0.05, 0.53, 0.05, black, x, 0.265, z));
    return g;
  },
  fireplace(m, T) {
    const g = new THREE.Group();
    const brickM = T.std('wall2', s => TX.brickTexture(s, '#8a4436'), { repeat: [1, 1], key: 'fireplace', bump: TX.brickBump });
    g.add(box(1.4, 1.1, 0.45, brickM, 0, 0.55, 0));
    g.add(box(1.56, 0.09, 0.55, m.wood, 0, 1.14, 0));                       // マントル
    g.add(box(0.8, 0.7, 0.05, plainMat(0x120d0a, { roughness: 1 }), 0, 0.45, 0.21));  // 炉口
    const fire = mesh(new THREE.PlaneGeometry(0.7, 0.5),
      new THREE.MeshStandardMaterial({ color: 0xff8c3a, emissive: 0xff6a1a, emissiveIntensity: 1.6, transparent: true, opacity: 0.9 }),
      0, 0.4, 0.24, 'flame');
    g.add(fire);
    for (let i = 0; i < 3; i++)
      g.add(mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.5, 8), m.wood, -0.1 + i * 0.12, 0.16, 0.24).rotateZ(Math.PI / 2));
    return g;
  },
  aircon(m) {
    const g = new THREE.Group();
    g.add(softBox(0.85, 0.28, 0.21, plainMat(0xf4f4f0, { roughness: 0.4 }), 0, 0, 0));
    g.add(box(0.75, 0.03, 0.02, plainMat(0x3a3f46), 0, -0.1, 0.1));         // 吹き出し口
    return g;
  },
  cushion(m) {
    const g = new THREE.Group();
    g.add(softBox(0.5, 0.12, 0.5, m.cushion, 0, 0.06, 0));
    return g;
  },
};

function buildFurnitureItem(type, mats, T, item = null) {
  const fn = FURNITURE_BUILDERS[type] || FURNITURE_BUILDERS.table;
  const g = fn(mats, T, item);
  g.name = type;
  return g;
}

/** アイテムの概略フットプリント半径(重なり回避用) */
const FOOTPRINT = {
  sofa: 1.1, table: 0.75, kotatsu: 0.8, desk: 0.75, chair: 0.4, stool: 0.3, bench: 0.8,
  shelf: 0.55, lamp: 0.3, tv: 0.85, rug: 1.3, plant: 0.35, wardrobe: 0.7, kitchen: 1.3,
  counter: 1.0, fridge: 0.45, washer: 0.42, toilet: 0.35, bathtub: 0.85, sink: 0.5,
  mirror: 0.35, clock: 0.3, piano: 0.85, fireplace: 0.8, aircon: 0.5, cushion: 0.35, bed: 1.2,
};

// 壁付けで置く家具
const WALL_TYPES = new Set(['tv', 'shelf', 'wardrobe', 'kitchen', 'counter', 'fridge', 'washer',
  'toilet', 'bathtub', 'sink', 'mirror', 'piano', 'fireplace']);
// 壁掛け
const MOUNT_TYPES = { clock: 1.85, aircon: 2.25 };

export function buildFurnitureSet(spec, T) {
  const g = new THREE.Group();
  g.name = 'furniture';

  // 個数を展開
  const insts = [];
  for (const item of spec.furniture) {
    for (let k = 0; k < (item.count || 1); k++) insts.push(item);
  }
  const cols = Math.min(insts.length, 4);
  const spacingX = 2.4, spacingZ = 2.2;
  const rows = Math.ceil(insts.length / cols);
  insts.forEach((item, i) => {
    const mats = matsForItem(spec, T, item);
    mats.rugMat = T.std('floor', s => TX.carpetTexture(s, (item.color ?? spec.color) != null ? cssColor(item.color ?? spec.color) : '#7f8a96'), { repeat: [2, 2], key: 'rug-' + (item.color ?? spec.color ?? 'def') });
    const obj = buildFurnitureItem(item.type, mats, T, item);
    const r = i % cols, c = Math.floor(i / cols);
    obj.position.set(-((cols - 1) / 2) * spacingX + r * spacingX, MOUNT_TYPES[item.type] ? 1.2 : 0, -((rows - 1) / 2) * spacingZ + c * spacingZ);
    g.add(obj);
  });

  const totalW = (cols - 1) * spacingX;
  return {
    model: g,
    envKind: 'studio',
    envRadius: Math.max(5, totalW * 0.8 + 4),
    walkStart: { pos: new THREE.Vector3(0, 1.6, rows * spacingZ / 2 + 3.5), lookAt: new THREE.Vector3(0, 0.8, 0) },
    camDist: Math.max(3.6, totalW * 0.75 + 2.2 + rows * 0.8),
    camTarget: new THREE.Vector3(0, 0.7, 0),
  };
}

// ============================================================
// 内装(部屋)
// ============================================================

/**
 * 家具インスタンスの配置を決める。
 * item.pos = {u,v} (画像から推定した正規化位置) があればそれを優先。
 */
function layoutRoomItems(items, W, D) {
  const placed = [];   // {x, z, r}
  const out = [];
  const has = t => items.some(i => i.type === t);
  const cx = 0, cz = 0.3;   // テーブルの基準位置

  const overlaps = (x, z, r) => placed.some(p => Math.hypot(p.x - x, p.z - z) < p.r + r - 0.05);
  const clampX = (x, mgn) => THREE.MathUtils.clamp(x, -W / 2 + mgn, W / 2 - mgn);
  const clampZ = (z, mgn) => THREE.MathUtils.clamp(z, -D / 2 + mgn, D / 2 - mgn);

  function push(type, item, x, z, ry, y = 0) {
    const r = FOOTPRINT[type] || 0.5;
    if (type !== 'rug' && y === 0) {
      let tries = 0;
      const dirs = [[0.35, 0], [-0.35, 0], [0, 0.35], [0, -0.35], [0.35, 0.35], [-0.35, -0.35]];
      while (overlaps(x, z, r) && tries < 14) {
        const d = dirs[tries % dirs.length];
        x = clampX(x + d[0] * (1 + tries / 4), r * 0.7);
        z = clampZ(z + d[1] * (1 + tries / 4), r * 0.7);
        tries++;
      }
      placed.push({ x, z, r });
    }
    out.push({ type, item, x, z, ry, y });
  }

  // 壁位置スロット(壁付け家具を順に並べる)
  const wallSlots = [];
  {
    const step = 1.4;
    for (let x = -W / 2 + 1.2; x <= W / 2 - 1.2; x += step) wallSlots.push({ x, z: -D / 2 + 0.36, ry: 0 });            // 奥壁
    for (let z = -D / 2 + 1.2; z <= D / 2 - 1.2; z += step) wallSlots.push({ x: -W / 2 + 0.36, z, ry: Math.PI / 2 });   // 左壁
    for (let z = -D / 2 + 1.2; z <= D / 2 - 1.2; z += step) wallSlots.push({ x: W / 2 - 0.36, z, ry: -Math.PI / 2 });   // 右壁
  }
  let wallIdx = 0;
  const nextWallSlot = () => wallSlots[Math.min(wallIdx++, wallSlots.length - 1)];

  // 画像から位置が来ているものはまずそれを使う
  const fromImage = [];
  const rest = [];
  for (const item of items) {
    for (let k = 0; k < (item.count || 1); k++) {
      const inst = { ...item, _k: k };
      if (item.pos && k === 0) fromImage.push(inst);
      else rest.push(inst);
    }
  }

  for (const inst of fromImage) {
    const t = inst.type;
    let x = -W / 2 + 0.7 + inst.pos.u * (W - 1.4);
    let z = -D / 2 + 0.7 + inst.pos.v * (D - 1.4);
    let ry = 0;
    if (MOUNT_TYPES[t]) {
      push(t, inst, clampX(x, 0.4), -D / 2 + 0.13, 0, MOUNT_TYPES[t]);
      continue;
    }
    if (WALL_TYPES.has(t)) {
      // 最寄りの壁にスナップ
      const dl = x + W / 2, dr = W / 2 - x, db = z + D / 2;
      const m = Math.min(dl, dr, db);
      if (m === db) { z = -D / 2 + 0.38; ry = 0; }
      else if (m === dl) { x = -W / 2 + 0.38; ry = Math.PI / 2; }
      else { x = W / 2 - 0.38; ry = -Math.PI / 2; }
    } else if (t === 'sofa') {
      ry = Math.PI;    // 手前(カメラ側)から奥のTVを向く配置が多い
      if (z > 0) ry = Math.PI; else ry = 0;
    } else if (t === 'chair' || t === 'stool') {
      ry = Math.atan2(cx - x, cz - z);
    }
    push(t, inst, x, z, ry);
  }

  // 既定スロット配置
  const defaultPlace = {
    rug:      (i) => push('rug', i, 0, 0.4, 0),
    sofa:     (i, k, n) => push('sofa', i, n > 1 ? (k - (n - 1) / 2) * 2.4 : 0, D / 2 - 1.0, Math.PI),
    table:    (i, k) => push('table', i, cx + k * 1.6, cz, 0),
    kotatsu:  (i) => push('kotatsu', i, cx, cz, 0),
    tv:       (i) => push('tv', i, 0, -D / 2 + 0.4, 0),
    bed:      (i, k) => push('bed', i, -W / 2 + 1.1 + k * 1.8, -D / 2 + 1.35, 0),
    desk:     (i, k) => { const s = nextWallSlot(); push('desk', i, s.x, s.z, s.ry); },
    chair:    (i, k, n) => {
      if (has('table') || has('kotatsu') || has('desk')) {
        // テーブルの周囲に等間隔
        const a = (k / Math.max(2, n)) * Math.PI * 2 + Math.PI / 4;
        const rr = has('kotatsu') ? 1.0 : 1.15;
        push('chair', i, cx + Math.cos(a) * rr, cz + Math.sin(a) * rr * 0.75, Math.atan2(cx - (cx + Math.cos(a) * rr), cz - (cz + Math.sin(a) * rr * 0.75)));
      } else {
        push('chair', i, 1.1 + k * 0.7, 1.2, -Math.PI / 4);
      }
    },
    cushion:  (i, k, n) => {
      const a = (k / Math.max(2, n)) * Math.PI * 2;
      push('cushion', i, cx + Math.cos(a) * 1.0, cz + Math.sin(a) * 0.8, -a);
    },
    stool:    (i, k) => push('stool', i, 0.8 + k * 0.6, 1.0, 0),
    bench:    (i) => push('bench', i, 0, D / 2 - 0.6, Math.PI),
    shelf:    (i) => { const s = nextWallSlot(); push('shelf', i, s.x, s.z, s.ry); },
    wardrobe: (i) => { const s = nextWallSlot(); push('wardrobe', i, s.x, s.z, s.ry); },
    piano:    (i) => { const s = nextWallSlot(); push('piano', i, s.x, s.z, s.ry); },
    fireplace:(i) => { const s = nextWallSlot(); push('fireplace', i, s.x, s.z, s.ry); },
    kitchen:  (i) => push('kitchen', i, W / 2 - 0.42, -0.5, -Math.PI / 2),
    counter:  (i) => push('counter', i, W / 2 - 1.6, -0.5, -Math.PI / 2),
    fridge:   (i) => push('fridge', i, W / 2 - 0.42, -D / 2 + 0.6, -Math.PI / 2),
    washer:   (i) => { const s = nextWallSlot(); push('washer', i, s.x, s.z, s.ry); },
    toilet:   (i) => push('toilet', i, -W / 2 + 0.5, -D / 2 + 0.45, 0),
    bathtub:  (i) => push('bathtub', i, -W / 2 + 1.0, -D / 2 + 0.6, 0),
    sink:     (i) => { const s = nextWallSlot(); push('sink', i, s.x, s.z, s.ry); },
    mirror:   (i) => { const s = nextWallSlot(); push('mirror', i, s.x, s.z, s.ry); },
    lamp:     (i, k) => push('lamp', i, k % 2 ? -W / 2 + 0.5 : W / 2 - 0.5, D / 2 - 0.6, 0),
    plant:    (i, k) => push('plant', i, k % 2 ? W / 2 - 0.5 : -W / 2 + 0.5, D / 2 - 0.6, 0),
    clock:    (i) => push('clock', i, 0.9, -D / 2 + 0.13, 0, MOUNT_TYPES.clock),
    aircon:   (i) => push('aircon', i, -1.2, -D / 2 + 0.13, 0, MOUNT_TYPES.aircon),
  };

  // rug は最初に(他と重ならない扱いなので)
  rest.sort((a, b) => (a.type === 'rug' ? -1 : 0) - (b.type === 'rug' ? -1 : 0));
  const counters = {};
  for (const inst of rest) {
    const t = inst.type;
    counters[t] = counters[t] || { k: 0, n: rest.filter(r2 => r2.type === t).length + fromImage.filter(f => f.type === t).length };
    const fn = defaultPlace[t];
    if (fn) fn(inst, counters[t].k, counters[t].n);
    else { const s = nextWallSlot(); push(t, inst, s.x, s.z, s.ry); }
    counters[t].k++;
  }
  return out;
}

export function buildRoom(spec, T) {
  const r = spec.room;
  const W = r.width, D = r.depth, H = r.height;
  const g = new THREE.Group();
  g.name = 'room';

  // ---- 床・天井・壁(内向きの片面ポリゴン: 外からドールハウスのように覗ける) ----
  const fCol = r.floorColor != null ? cssColor(r.floorColor) : null;   // 画像から推定した床色
  const floorFn = {
    wood: s => TX.floorWoodTexture(s, fCol || '#9a6b40'),
    carpet: s => TX.carpetTexture(s, fCol || (spec.color != null ? cssColor(spec.color) : '#8a93a0')),
    tatami: s => TX.tatamiTexture(s),
    tile: s => TX.tileTexture(s, fCol || '#dfe0da'),
  }[r.floorStyle] || (s => TX.floorWoodTexture(s, fCol || '#9a6b40'));
  const floorBump = { wood: TX.floorWoodBump, tile: TX.tileBump }[r.floorStyle] || null;
  const floorRepeat = r.floorStyle === 'tatami'
    ? [Math.max(1, Math.round(W / 1.8)), Math.max(1, Math.round(D / 0.9))]
    : [Math.max(1, W / 4), Math.max(1, D / 4)];
  const floorM = T.std('floor', floorFn, {
    repeat: floorRepeat,
    key: 'floor-' + r.floorStyle + (r.floorColor ?? spec.color ?? ''),
    roughness: r.floorStyle === 'tile' ? 0.3 : 0.6,
    bump: floorBump, bumpScale: 0.8,
  });
  const floor = mesh(new THREE.PlaneGeometry(W, D), floorM, 0, 0, 0, 'floor');
  floor.rotation.x = -Math.PI / 2;
  g.add(floor);

  const ceil = mesh(new THREE.PlaneGeometry(W, D), plainMat(0xf4f2ec), 0, H, 0, 'ceiling');
  ceil.rotation.x = Math.PI / 2;
  g.add(ceil);

  const wCol = r.wallColor != null ? cssColor(r.wallColor) : null;   // 画像から推定した壁色
  const wallFn = {
    wallpaper: s => TX.wallpaperTexture(s, wCol || '#f4efe4'),
    concrete: s => TX.concreteTexture(s),
    wood: s => TX.woodTexture(s, wCol || '#8a6238'),
    tile: s => TX.tileTexture(s, wCol || '#e4e6e2'),
    washi: s => TX.washiTexture(s, wCol || undefined),
  }[r.wallStyle] || (s => TX.wallpaperTexture(s, wCol || '#f4efe4'));
  const wallBump = { tile: TX.tileBump, wood: TX.woodBump, concrete: null }[r.wallStyle] || null;
  const mkWall = (w) => T.std('interiorWall', wallFn, {
    repeat: [Math.max(1, w / 4), Math.max(1, H / 2.7)],
    key: 'iwall-' + r.wallStyle + (r.wallColor ?? ''),
    bump: wallBump, bumpScale: 0.6,
    roughness: r.wallStyle === 'tile' ? 0.3 : 0.9,
  });
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
  if (!['bathroom', 'restroom'].includes(r.kind)) {
    const winG = new THREE.Group(); winG.name = 'window';
    winG.add(box(0.1, 1.5, 1.9, frameM, 0, 0, 0));
    winG.add(box(0.06, 1.36, 1.76, glassMaterial(0xcfe8f5), 0.0, 0, 0));
    winG.add(box(0.05, 1.36, 0.05, frameM, 0.02, 0, 0));                    // 中央桟
    winG.add(box(0.05, 0.05, 1.76, frameM, 0.02, 0, 0));
    winG.add(box(0.12, 0.06, 2.3, frameM, 0.02, 0.83, 0));                  // カーテンレール
    const curtM = T.std('fabric3', s => TX.fabricTexture(s, '#d9cfba'), { repeat: [2, 2], key: 'curtain', bump: TX.fabricBump, bumpScale: 0.5 });
    for (const s of [-1, 1]) {
      const cur = box(0.06, 1.9, 0.45, curtM, 0.1, -0.12, s * (0.95 + 0.2));
      winG.add(cur);
    }
    winG.position.set(-W / 2 + 0.05, 1.5, 0);
    g.add(winG);
  }

  // ---- ドア(奥の壁の右寄り) ----
  const doorG = new THREE.Group(); doorG.name = 'door';
  const doorM = T.std('furniture2', s => TX.woodTexture(s, '#7a5230'), { repeat: [1, 1], key: 'roomdoor', bump: TX.woodBump, bumpScale: 0.5 });
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
  const layout = layoutRoomItems(r.items, W, D);
  for (const slot of layout) {
    const mats = matsForItem(spec, T, slot.item);
    mats.rugMat = T.std('rug', s => TX.carpetTexture(s, (slot.item.color ?? spec.color) != null ? cssColor(slot.item.color ?? spec.color) : '#96a0ab'), { repeat: [1.5, 1.5], key: 'rug2-' + (slot.item.color ?? spec.color ?? 'def') });
    const obj = buildFurnitureItem(slot.type, mats, T, slot.item);
    obj.position.set(slot.x, slot.y || 0, slot.z);
    obj.rotation.y = slot.ry || 0;
    g.add(obj);
  }

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
