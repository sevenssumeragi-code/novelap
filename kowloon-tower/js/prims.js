// ============================================================
// プロシージャル3D生成の基本部品
// ============================================================
import * as THREE from 'three';

export function mat(color, opts = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: opts.roughness ?? 0.85,
    metalness: opts.metalness ?? 0.05,
    emissive: opts.emissive ?? 0x000000,
    emissiveIntensity: opts.emissiveIntensity ?? 1.0,
    transparent: !!opts.transparent,
    opacity: opts.opacity ?? 1.0,
    side: opts.side ?? THREE.FrontSide,
  });
}

// box(w,h,d,color,{x,y,z,ry,rx,rz, ...matOpts}) — y は底面基準ではなく中心
export function box(w, h, d, color, o = {}) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), o.material ?? mat(color, o));
  m.position.set(o.x ?? 0, o.y ?? 0, o.z ?? 0);
  if (o.ry) m.rotation.y = o.ry;
  if (o.rx) m.rotation.x = o.rx;
  if (o.rz) m.rotation.z = o.rz;
  return m;
}

export function cyl(rTop, rBottom, h, color, o = {}) {
  const m = new THREE.Mesh(
    new THREE.CylinderGeometry(rTop, rBottom, h, o.seg ?? 16),
    o.material ?? mat(color, o)
  );
  m.position.set(o.x ?? 0, o.y ?? 0, o.z ?? 0);
  if (o.rx) m.rotation.x = o.rx;
  if (o.rz) m.rotation.z = o.rz;
  if (o.ry) m.rotation.y = o.ry;
  return m;
}

export function sph(r, color, o = {}) {
  const m = new THREE.Mesh(
    new THREE.SphereGeometry(r, o.seg ?? 12, o.seg ?? 12),
    o.material ?? mat(color, o)
  );
  m.position.set(o.x ?? 0, o.y ?? 0, o.z ?? 0);
  if (o.sx || o.sy || o.sz) m.scale.set(o.sx ?? 1, o.sy ?? 1, o.sz ?? 1);
  return m;
}

export function grp(...children) {
  const g = new THREE.Group();
  for (const c of children) g.add(c);
  return g;
}

export function rand(a, b) { return a + Math.random() * (b - a); }
export function randInt(a, b) { return Math.floor(rand(a, b + 1)); }
export function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// ------------------------------------------------------------
// 看板: Canvasテクスチャで日本語テキストを描く
// vertical=true で縦書き(1文字ずつ縦に積む)
// ------------------------------------------------------------
export function signMesh(text, {
  w = 1, h = 1, bg = '#101018', fg = '#ffffff',
  glow = null, vertical = false, border = true, fontScale = 1.0,
} = {}) {
  const canvas = document.createElement('canvas');
  const PX = 96;
  canvas.width = Math.max(32, Math.round(w * PX));
  canvas.height = Math.max(32, Math.round(h * PX));
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (border) {
    ctx.strokeStyle = glow ?? fg;
    ctx.lineWidth = Math.max(2, canvas.width * 0.03);
    ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2,
      canvas.width - ctx.lineWidth, canvas.height - ctx.lineWidth);
  }
  ctx.fillStyle = fg;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (glow) { ctx.shadowColor = glow; ctx.shadowBlur = canvas.width * 0.08; }
  const chars = [...text];
  if (vertical) {
    const size = Math.min(canvas.width * 0.72, (canvas.height * 0.9) / chars.length) * fontScale;
    ctx.font = `bold ${size}px 'Hiragino Sans','Noto Sans JP',sans-serif`;
    const total = size * chars.length;
    let y = (canvas.height - total) / 2 + size / 2;
    for (const c of chars) { ctx.fillText(c, canvas.width / 2, y); y += size; }
  } else {
    const size = Math.min(canvas.height * 0.6, (canvas.width * 0.9) / chars.length) * fontScale;
    ctx.font = `bold ${size}px 'Hiragino Sans','Noto Sans JP',sans-serif`;
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshStandardMaterial({
      map: tex, roughness: 0.6,
      emissive: 0xffffff, emissiveMap: tex,
      emissiveIntensity: glow ? 0.9 : 0.25,
    })
  );
  return m;
}

// 両面つき看板ボックス(枠+発光面)
export function signBoard(text, opts = {}) {
  const w = opts.w ?? 1, h = opts.h ?? 1, depth = opts.depth ?? 0.12;
  const g = new THREE.Group();
  g.add(box(w + 0.06, h + 0.06, depth, 0x22222c, { roughness: 0.6 }));
  const front = signMesh(text, opts);
  front.position.z = depth / 2 + 0.002;
  g.add(front);
  if (opts.doubleSided) {
    const back = signMesh(text, opts);
    back.rotation.y = Math.PI;
    back.position.z = -depth / 2 - 0.002;
    g.add(back);
  }
  return g;
}

// ストライプのCanvasテクスチャ(床屋のポールなど)
export function stripeTexture(colors, repeat = 6) {
  const c = document.createElement('canvas');
  c.width = 64; c.height = 64;
  const ctx = c.getContext('2d');
  const bandH = c.height / colors.length;
  colors.forEach((col, i) => {
    ctx.fillStyle = col;
    ctx.fillRect(0, i * bandH, c.width, bandH);
  });
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, repeat);
  return tex;
}
