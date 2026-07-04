// textures.js — 1K〜8K のプロシージャルテクスチャ生成と、アップロード画像のテクスチャ化
import * as THREE from 'three';

const MAX_IMAGE_SIZE = 8192;

function makeCanvas(size, w = size, h = size) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}

// 低解像度ノイズを拡大して滑らかなムラを作り、合成する
function noiseOverlay(ctx, size, { alpha = 0.1, cells = 96, mode = 'overlay' } = {}) {
  const n = makeCanvas(cells);
  const nctx = n.getContext('2d');
  const img = nctx.createImageData(cells, cells);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 128 + (Math.random() - 0.5) * 255;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  nctx.putImageData(img, 0, 0);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.globalCompositeOperation = mode;
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(n, 0, 0, size, size);
  ctx.restore();
}

// 細かい粒状ノイズ(布・カーペット・コンクリ用)
function grainOverlay(ctx, size, alpha = 0.08) {
  noiseOverlay(ctx, size, { alpha, cells: Math.min(1024, size / 2), mode: 'overlay' });
}

function jitterColor(hex, amount = 12) {
  // 輝度中心のジッター(チャンネル独立だと色相がズレて虹色になる)
  const c = new THREE.Color(hex);
  const l = (Math.random() - 0.5) * amount / 255;
  const j = () => (Math.random() - 0.5) * amount / 1020;
  c.r = THREE.MathUtils.clamp(c.r + l + j(), 0, 1);
  c.g = THREE.MathUtils.clamp(c.g + l + j(), 0, 1);
  c.b = THREE.MathUtils.clamp(c.b + l + j(), 0, 1);
  return '#' + c.getHexString();
}

// ---------- 各テクスチャ(4m x 4m 相当でタイリングする前提でデザイン) ----------

export function brickTexture(size, base = '#a8503c', mortar = '#d9d2c6') {
  const c = makeCanvas(size), ctx = c.getContext('2d');
  ctx.fillStyle = mortar; ctx.fillRect(0, 0, size, size);
  const rows = 20;                       // 4mに20段 → 1段20cm
  const bh = size / rows;
  const bw = bh * 2.4;
  const gap = Math.max(2, size * 0.004);
  for (let r = 0; r < rows; r++) {
    const off = (r % 2) * bw / 2;
    for (let x = -bw; x < size + bw; x += bw) {
      ctx.fillStyle = jitterColor(base, 34);
      ctx.fillRect(x + off + gap / 2, r * bh + gap / 2, bw - gap, bh - gap);
    }
  }
  noiseOverlay(ctx, size, { alpha: 0.12, cells: 128 });
  grainOverlay(ctx, size, 0.05);
  return c;
}

export function plasterTexture(size, base = '#f0ece2') {
  const c = makeCanvas(size), ctx = c.getContext('2d');
  ctx.fillStyle = base; ctx.fillRect(0, 0, size, size);
  noiseOverlay(ctx, size, { alpha: 0.08, cells: 64 });
  grainOverlay(ctx, size, 0.05);
  return c;
}

export function concreteTexture(size, base = '#b9b9b6') {
  const c = makeCanvas(size), ctx = c.getContext('2d');
  ctx.fillStyle = base; ctx.fillRect(0, 0, size, size);
  noiseOverlay(ctx, size, { alpha: 0.14, cells: 48 });
  // パネル目地
  ctx.strokeStyle = 'rgba(60,60,60,.35)';
  ctx.lineWidth = Math.max(2, size * 0.003);
  const step = size / 2;
  for (let i = 0; i <= 2; i++) {
    ctx.beginPath(); ctx.moveTo(i * step, 0); ctx.lineTo(i * step, size); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i * step); ctx.lineTo(size, i * step); ctx.stroke();
  }
  // Pコン穴
  ctx.fillStyle = 'rgba(70,70,70,.4)';
  const r = size * 0.008;
  for (let px = 0.25; px < 1; px += 0.5) for (let py = 0.25; py < 1; py += 0.5) {
    ctx.beginPath(); ctx.arc(px * size, py * size, r, 0, Math.PI * 2); ctx.fill();
  }
  grainOverlay(ctx, size, 0.07);
  return c;
}

function woodGrain(ctx, size, x, w, tone) {
  ctx.fillStyle = tone;
  ctx.fillRect(x, 0, w, size);
  ctx.strokeStyle = 'rgba(40,20,5,.18)';
  ctx.lineWidth = Math.max(1, size * 0.0015);
  const lines = 5 + Math.floor(Math.random() * 5);
  for (let i = 0; i < lines; i++) {
    const gx = x + Math.random() * w;
    ctx.beginPath();
    ctx.moveTo(gx, 0);
    ctx.bezierCurveTo(gx + (Math.random() - .5) * w * .6, size * .33,
                      gx + (Math.random() - .5) * w * .6, size * .66, gx, size);
    ctx.stroke();
  }
}

export function woodTexture(size, base = '#8a5a33') {
  const c = makeCanvas(size), ctx = c.getContext('2d');
  const planks = 8;
  const w = size / planks;
  for (let i = 0; i < planks; i++) woodGrain(ctx, size, i * w, w, jitterColor(base, 26));
  ctx.strokeStyle = 'rgba(30,15,5,.4)';
  ctx.lineWidth = Math.max(1.5, size * 0.002);
  for (let i = 0; i <= planks; i++) {
    ctx.beginPath(); ctx.moveTo(i * w, 0); ctx.lineTo(i * w, size); ctx.stroke();
  }
  grainOverlay(ctx, size, 0.05);
  return c;
}

export function floorWoodTexture(size, base = '#9a6b40') {
  const c = makeCanvas(size), ctx = c.getContext('2d');
  const rows = 10;
  const h = size / rows;
  for (let r = 0; r < rows; r++) {
    const off = (r % 3) * size / 3;
    for (let x = -size; x < size; x += size / 1.5) {
      const px = x + off, pw = size / 1.5;
      ctx.save();
      ctx.translate(px + pw / 2, r * h + h / 2);
      ctx.rotate(Math.PI / 2);
      woodGrain(ctx, pw, -h / 2, h, jitterColor(base, 12));
      ctx.restore();
    }
    ctx.strokeStyle = 'rgba(30,15,5,.45)';
    ctx.lineWidth = Math.max(1.5, size * 0.0018);
    ctx.beginPath(); ctx.moveTo(0, r * h); ctx.lineTo(size, r * h); ctx.stroke();
    for (let x = -size; x < size * 2; x += size / 1.5) {
      const px = x + off;
      ctx.beginPath(); ctx.moveTo(px, r * h); ctx.lineTo(px, r * h + h); ctx.stroke();
    }
  }
  grainOverlay(ctx, size, 0.05);
  return c;
}

export function roofTileTexture(size, base = '#5a5a63') {
  const c = makeCanvas(size), ctx = c.getContext('2d');
  ctx.fillStyle = base; ctx.fillRect(0, 0, size, size);
  const rows = 12, th = size / rows, tw = th * 1.5;
  for (let r = 0; r < rows; r++) {
    const off = (r % 2) * tw / 2;
    for (let x = -tw; x < size + tw; x += tw) {
      ctx.fillStyle = jitterColor(base, 12);
      ctx.beginPath();
      ctx.arc(x + off + tw / 2, r * th + th, tw / 2, Math.PI, 0);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,.35)';
      ctx.lineWidth = Math.max(1.5, size * 0.002);
      ctx.stroke();
    }
  }
  grainOverlay(ctx, size, 0.06);
  return c;
}

export function wallpaperTexture(size, base = '#f4efe4', accent = '#ddd3bd') {
  const c = makeCanvas(size), ctx = c.getContext('2d');
  ctx.fillStyle = base; ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = accent;
  const stripes = 16, sw = size / stripes;
  for (let i = 0; i < stripes; i += 2) ctx.fillRect(i * sw, 0, sw * 0.35, size);
  noiseOverlay(ctx, size, { alpha: 0.05, cells: 96 });
  return c;
}

export function carpetTexture(size, base = '#7f8a96') {
  const c = makeCanvas(size), ctx = c.getContext('2d');
  ctx.fillStyle = base; ctx.fillRect(0, 0, size, size);
  grainOverlay(ctx, size, 0.16);
  noiseOverlay(ctx, size, { alpha: 0.08, cells: 64 });
  return c;
}

export function fabricTexture(size, base = '#5471a8') {
  const c = makeCanvas(size), ctx = c.getContext('2d');
  ctx.fillStyle = base; ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = 'rgba(255,255,255,.06)';
  ctx.lineWidth = 1;
  const step = Math.max(3, size / 256);
  for (let i = 0; i < size; i += step) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, size); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(size, i); ctx.stroke();
  }
  grainOverlay(ctx, size, 0.08);
  return c;
}

export function grassTexture(size, base = '#5d7a45') {
  const c = makeCanvas(size), ctx = c.getContext('2d');
  ctx.fillStyle = base; ctx.fillRect(0, 0, size, size);
  noiseOverlay(ctx, size, { alpha: 0.18, cells: 128 });
  grainOverlay(ctx, size, 0.12);
  return c;
}

export function asphaltTexture(size) {
  const c = makeCanvas(size), ctx = c.getContext('2d');
  ctx.fillStyle = '#4a4c50'; ctx.fillRect(0, 0, size, size);
  grainOverlay(ctx, size, 0.14);
  noiseOverlay(ctx, size, { alpha: 0.1, cells: 48 });
  return c;
}

// ---------- テクスチャファクトリ ----------

export class TextureFactory {
  /**
   * @param {number} size 生成テクスチャの一辺 (1024/2048/4096/8192)
   * @param {Object} imagesByRole 役割 → HTMLCanvasElement (アップロード画像)
   * @param {number} anisotropy
   */
  constructor(size, imagesByRole = {}, anisotropy = 8) {
    this.size = size;
    this.images = imagesByRole;
    this.anisotropy = anisotropy;
    this.cache = new Map();
  }

  /** 役割にアップロード画像があればそれを、なければ fallback で生成した canvas をテクスチャ化 */
  texture(role, fallbackFn, { repeat = [1, 1], key: cacheKey = '' } = {}) {
    const key = role + '|' + (cacheKey || (fallbackFn ? fallbackFn.name : ''));
    let tex = this.cache.get(key);
    if (!tex) {
      const canvas = this.images[role] || fallbackFn(this.size);
      tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.anisotropy = this.anisotropy;
      this.cache.set(key, tex);
    }
    const t = tex.clone();
    t.needsUpdate = true;
    t.repeat.set(repeat[0], repeat[1]);
    return t;
  }

  hasImage(role) { return !!this.images[role]; }

  /** MeshStandardMaterial のショートハンド */
  std(role, fallbackFn, { repeat = [1, 1], roughness = 0.9, metalness = 0.0, color = 0xffffff, key = '' } = {}) {
    return new THREE.MeshStandardMaterial({
      map: this.texture(role, fallbackFn, { repeat, key }),
      roughness, metalness, color,
    });
  }
}

// ---------- アップロード画像の取り込み ----------

/** File → 8192px 以下に収めた canvas */
export async function fileToCanvas(file) {
  const bitmap = await createImageBitmap(file);
  let { width: w, height: h } = bitmap;
  const scale = Math.min(1, MAX_IMAGE_SIZE / Math.max(w, h));
  w = Math.round(w * scale); h = Math.round(h * scale);
  const c = makeCanvas(0, w, h);
  c.getContext('2d').drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  return c;
}

/** 画像の代表色を抽出(彩度の高い頻出色を優先) */
export function dominantColor(canvas) {
  const s = 32;
  const c = makeCanvas(s);
  c.getContext('2d').drawImage(canvas, 0, 0, s, s);
  const data = c.getContext('2d').getImageData(0, 0, s, s).data;
  const buckets = new Map();
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
    const sat = Math.max(r, g, b) - Math.min(r, g, b);
    const lum = (r + g + b) / 3;
    const weight = 1 + sat / 48 + (lum > 30 && lum < 225 ? 1 : 0);
    const e = buckets.get(key) || { w: 0, r: 0, g: 0, b: 0, n: 0 };
    e.w += weight; e.r += r; e.g += g; e.b += b; e.n++;
    buckets.set(key, e);
  }
  let best = null;
  for (const e of buckets.values()) if (!best || e.w > best.w) best = e;
  const col = new THREE.Color(best.r / best.n / 255, best.g / best.n / 255, best.b / best.n / 255);
  return col;
}
