// textures.js — プロシージャルテクスチャ生成(色 + バンプ)と、アップロード画像のテクスチャ化
//
// メモリ設計:
//  - プロシージャルテクスチャはタイリング前提なので 2048px を上限に生成する
//    (8K 設定でも壁一面あたりの実効解像度はタイリングで 8K 相当になる)。
//  - アップロード画像のみ品質設定と GPU の maxTextureSize の範囲で最大 8192px を使う。
//  - 同一テクスチャは (キー, リピート) 単位でキャッシュし、GPU への重複アップロードをしない。
//    → 旧実装の「使用ごとに clone」で 8K × 10枚 = 数GB に達しタブがクラッシュする問題の修正。
import * as THREE from 'three';

const MAX_IMAGE_SIZE = 8192;
const MAX_PROC_SIZE = 2048;

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

// 大きく柔らかいシミ・退色ムラ(壁・漆喰用)
function stainOverlay(ctx, size, { count = 6, alpha = 0.05, dark = true } = {}) {
  ctx.save();
  ctx.globalCompositeOperation = dark ? 'multiply' : 'screen';
  for (let i = 0; i < count; i++) {
    const x = Math.random() * size, y = Math.random() * size;
    const r = size * (0.12 + Math.random() * 0.25);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    const tone = dark ? '80,72,60' : '255,252,244';
    g.addColorStop(0, `rgba(${tone},${alpha})`);
    g.addColorStop(1, `rgba(${tone},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  ctx.restore();
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

function shade(hex, f) {
  const c = new THREE.Color(hex);
  c.r = THREE.MathUtils.clamp(c.r * f, 0, 1);
  c.g = THREE.MathUtils.clamp(c.g * f, 0, 1);
  c.b = THREE.MathUtils.clamp(c.b * f, 0, 1);
  return '#' + c.getHexString();
}

// ---------- 各テクスチャ(4m x 4m 相当でタイリングする前提でデザイン) ----------

export function brickTexture(size, base = '#9e4a36') {
  const c = makeCanvas(size), ctx = c.getContext('2d');
  ctx.fillStyle = '#cfc6b8'; ctx.fillRect(0, 0, size, size);
  grainOverlay(ctx, size, 0.06);
  const rows = 20;                       // 4mに20段 → 1段20cm
  const bh = size / rows;
  const bw = bh * 2.4;
  const gap = Math.max(2, size * 0.005);
  for (let r = 0; r < rows; r++) {
    const off = (r % 2) * bw / 2;
    for (let x = -bw; x < size + bw; x += bw) {
      // レンガごとの色幅: 時々かなり暗い/明るい個体を混ぜる
      let tone = jitterColor(base, 30);
      const roll = Math.random();
      if (roll < 0.08) tone = shade(tone, 0.62);
      else if (roll < 0.16) tone = shade(tone, 1.25);
      const bx = x + off + gap / 2, by = r * bh + gap / 2;
      const w = bw - gap, h = bh - gap;
      const g = ctx.createLinearGradient(0, by, 0, by + h);
      g.addColorStop(0, shade(tone, 1.12));
      g.addColorStop(0.5, tone);
      g.addColorStop(1, shade(tone, 0.8));
      ctx.fillStyle = g;
      ctx.fillRect(bx, by, w, h);
      // 焼きムラ
      if (Math.random() < 0.5) {
        const sx = bx + Math.random() * w * 0.6;
        const sg = ctx.createRadialGradient(sx, by + h / 2, 0, sx, by + h / 2, w * 0.4);
        sg.addColorStop(0, 'rgba(40,25,18,0.18)');
        sg.addColorStop(1, 'rgba(40,25,18,0)');
        ctx.fillStyle = sg;
        ctx.fillRect(bx, by, w, h);
      }
    }
  }
  noiseOverlay(ctx, size, { alpha: 0.1, cells: 128 });
  grainOverlay(ctx, size, 0.05);
  return c;
}

export function brickBump(size) {
  const c = makeCanvas(size), ctx = c.getContext('2d');
  ctx.fillStyle = '#404040'; ctx.fillRect(0, 0, size, size);   // 目地=低
  const rows = 20, bh = size / rows, bw = bh * 2.4;
  const gap = Math.max(2, size * 0.005);
  for (let r = 0; r < rows; r++) {
    const off = (r % 2) * bw / 2;
    for (let x = -bw; x < size + bw; x += bw) {
      const v = 175 + Math.random() * 60;
      ctx.fillStyle = `rgb(${v},${v},${v})`;
      ctx.fillRect(x + off + gap / 2, r * bh + gap / 2, bw - gap, bh - gap);
    }
  }
  noiseOverlay(ctx, size, { alpha: 0.25, cells: 256 });
  return c;
}

export function stoneTexture(size, base = '#9a938a') {
  const c = makeCanvas(size), ctx = c.getContext('2d');
  ctx.fillStyle = '#6e685f'; ctx.fillRect(0, 0, size, size);
  const rows = 7;
  let y = 0;
  for (let r = 0; r < rows; r++) {
    const h = (size / rows) * (0.8 + Math.random() * 0.4);
    let x = -size * 0.05 - Math.random() * size * 0.1;
    while (x < size) {
      const w = size * (0.1 + Math.random() * 0.16);
      const gap = Math.max(2, size * 0.006);
      const tone = jitterColor(base, 26);
      const g = ctx.createLinearGradient(x, y, x, y + h);
      g.addColorStop(0, shade(tone, 1.15));
      g.addColorStop(1, shade(tone, 0.78));
      ctx.fillStyle = g;
      const rx = x + gap / 2, ry = y + gap / 2, rw = w - gap, rh = Math.min(h, size - y) - gap;
      ctx.beginPath();
      ctx.roundRect(rx, ry, rw, rh, Math.min(rw, rh) * 0.12);
      ctx.fill();
      // ハイライト
      const hg = ctx.createRadialGradient(rx + rw * 0.35, ry + rh * 0.3, 0, rx + rw * 0.35, ry + rh * 0.3, rw * 0.5);
      hg.addColorStop(0, 'rgba(255,250,240,0.10)');
      hg.addColorStop(1, 'rgba(255,250,240,0)');
      ctx.fillStyle = hg;
      ctx.fill();
      x += w;
    }
    y += h;
    if (y >= size) break;
  }
  grainOverlay(ctx, size, 0.08);
  stainOverlay(ctx, size, { count: 5, alpha: 0.06 });
  return c;
}

export function stoneBump(size) {
  const c = makeCanvas(size), ctx = c.getContext('2d');
  ctx.fillStyle = '#3a3a3a'; ctx.fillRect(0, 0, size, size);
  const rows = 7;
  let y = 0;
  for (let r = 0; r < rows; r++) {
    const h = (size / rows) * (0.8 + Math.random() * 0.4);
    let x = -size * 0.08;
    while (x < size) {
      const w = size * (0.1 + Math.random() * 0.16);
      const gap = Math.max(2, size * 0.006);
      const v = 150 + Math.random() * 80;
      ctx.fillStyle = `rgb(${v},${v},${v})`;
      ctx.beginPath();
      ctx.roundRect(x + gap / 2, y + gap / 2, w - gap, Math.min(h, size - y) - gap, w * 0.06);
      ctx.fill();
      x += w;
    }
    y += h;
    if (y >= size) break;
  }
  noiseOverlay(ctx, size, { alpha: 0.2, cells: 200 });
  return c;
}

export function tileTexture(size, base = '#e8e6e0') {
  const c = makeCanvas(size), ctx = c.getContext('2d');
  ctx.fillStyle = '#b9b5ac'; ctx.fillRect(0, 0, size, size);
  const n = 8, t = size / n, gap = Math.max(2, size * 0.004);
  for (let r = 0; r < n; r++) {
    for (let col = 0; col < n; col++) {
      const tone = jitterColor(base, 10);
      const x = col * t + gap / 2, y = r * t + gap / 2, w = t - gap;
      const g = ctx.createLinearGradient(x, y, x + w, y + w);
      g.addColorStop(0, shade(tone, 1.06));
      g.addColorStop(0.5, tone);
      g.addColorStop(1, shade(tone, 0.94));
      ctx.fillStyle = g;
      ctx.fillRect(x, y, w, w);
    }
  }
  grainOverlay(ctx, size, 0.03);
  return c;
}

export function tileBump(size) {
  const c = makeCanvas(size), ctx = c.getContext('2d');
  ctx.fillStyle = '#505050'; ctx.fillRect(0, 0, size, size);
  const n = 8, t = size / n, gap = Math.max(2, size * 0.004);
  ctx.fillStyle = '#d8d8d8';
  for (let r = 0; r < n; r++) for (let col = 0; col < n; col++)
    ctx.fillRect(col * t + gap / 2, r * t + gap / 2, t - gap, t - gap);
  return c;
}

export function metalTexture(size, base = '#aab2b8') {
  const c = makeCanvas(size), ctx = c.getContext('2d');
  const ribs = 24, w = size / ribs;
  for (let i = 0; i < ribs; i++) {
    const g = ctx.createLinearGradient(i * w, 0, (i + 1) * w, 0);
    g.addColorStop(0, shade(base, 0.72));
    g.addColorStop(0.35, shade(base, 1.12));
    g.addColorStop(0.65, shade(base, 0.98));
    g.addColorStop(1, shade(base, 0.68));
    ctx.fillStyle = g;
    ctx.fillRect(i * w, 0, w + 1, size);
  }
  // 錆・汚れ
  stainOverlay(ctx, size, { count: 4, alpha: 0.08 });
  grainOverlay(ctx, size, 0.05);
  return c;
}

export function metalBump(size) {
  const c = makeCanvas(size), ctx = c.getContext('2d');
  const ribs = 24, w = size / ribs;
  for (let i = 0; i < ribs; i++) {
    const g = ctx.createLinearGradient(i * w, 0, (i + 1) * w, 0);
    g.addColorStop(0, '#303030');
    g.addColorStop(0.5, '#e0e0e0');
    g.addColorStop(1, '#303030');
    ctx.fillStyle = g;
    ctx.fillRect(i * w, 0, w + 1, size);
  }
  return c;
}

export function plasterTexture(size, base = '#f0ece2') {
  const c = makeCanvas(size), ctx = c.getContext('2d');
  ctx.fillStyle = base; ctx.fillRect(0, 0, size, size);
  noiseOverlay(ctx, size, { alpha: 0.07, cells: 64 });
  stainOverlay(ctx, size, { count: 5, alpha: 0.045 });
  stainOverlay(ctx, size, { count: 3, alpha: 0.05, dark: false });
  grainOverlay(ctx, size, 0.05);
  return c;
}

export function concreteTexture(size, base = '#b9b9b6') {
  const c = makeCanvas(size), ctx = c.getContext('2d');
  ctx.fillStyle = base; ctx.fillRect(0, 0, size, size);
  noiseOverlay(ctx, size, { alpha: 0.14, cells: 48 });
  stainOverlay(ctx, size, { count: 6, alpha: 0.07 });
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
  const g = ctx.createLinearGradient(x, 0, x + w, 0);
  g.addColorStop(0, shade(tone, 0.92));
  g.addColorStop(0.5, shade(tone, 1.06));
  g.addColorStop(1, shade(tone, 0.9));
  ctx.fillStyle = g;
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
  // 節(ふし)
  if (Math.random() < 0.4) {
    const kx = x + w * (0.25 + Math.random() * 0.5);
    const ky = size * Math.random();
    const kr = w * (0.1 + Math.random() * 0.12);
    const kg = ctx.createRadialGradient(kx, ky, 0, kx, ky, kr);
    kg.addColorStop(0, 'rgba(45,25,10,0.55)');
    kg.addColorStop(0.6, 'rgba(60,35,15,0.3)');
    kg.addColorStop(1, 'rgba(60,35,15,0)');
    ctx.fillStyle = kg;
    ctx.beginPath(); ctx.arc(kx, ky, kr, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(40,22,8,.4)';
    ctx.lineWidth = Math.max(1, size * 0.001);
    for (let rr = kr * 1.2; rr < kr * 2.2; rr += kr * 0.5) {
      ctx.beginPath(); ctx.ellipse(kx, ky, rr * 0.7, rr, 0, 0, Math.PI * 2); ctx.stroke();
    }
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

export function woodBump(size) {
  const c = makeCanvas(size), ctx = c.getContext('2d');
  ctx.fillStyle = '#909090'; ctx.fillRect(0, 0, size, size);
  const planks = 8, w = size / planks;
  ctx.strokeStyle = '#282828';
  ctx.lineWidth = Math.max(2, size * 0.004);
  for (let i = 0; i <= planks; i++) {
    ctx.beginPath(); ctx.moveTo(i * w, 0); ctx.lineTo(i * w, size); ctx.stroke();
  }
  noiseOverlay(ctx, size, { alpha: 0.3, cells: 256 });
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
      woodGrain(ctx, pw, -h / 2, h, jitterColor(base, 14));
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
  // ワックスの光沢ムラ
  stainOverlay(ctx, size, { count: 4, alpha: 0.05, dark: false });
  grainOverlay(ctx, size, 0.04);
  return c;
}

export function floorWoodBump(size) {
  const c = makeCanvas(size), ctx = c.getContext('2d');
  ctx.fillStyle = '#a0a0a0'; ctx.fillRect(0, 0, size, size);
  const rows = 10, h = size / rows;
  ctx.strokeStyle = '#303030';
  ctx.lineWidth = Math.max(2, size * 0.003);
  for (let r = 0; r <= rows; r++) {
    ctx.beginPath(); ctx.moveTo(0, r * h); ctx.lineTo(size, r * h); ctx.stroke();
  }
  noiseOverlay(ctx, size, { alpha: 0.22, cells: 256 });
  return c;
}

export function roofTileTexture(size, base = '#5a5a63') {
  const c = makeCanvas(size), ctx = c.getContext('2d');
  ctx.fillStyle = shade(base, 0.7); ctx.fillRect(0, 0, size, size);
  const rows = 12, th = size / rows, tw = th * 1.5;
  for (let r = 0; r < rows; r++) {
    const off = (r % 2) * tw / 2;
    for (let x = -tw; x < size + tw; x += tw) {
      const tone = jitterColor(base, 16);
      const cx = x + off + tw / 2, cy = r * th + th;
      const g = ctx.createRadialGradient(cx, cy - th * 0.4, 0, cx, cy, tw * 0.6);
      g.addColorStop(0, shade(tone, 1.2));
      g.addColorStop(0.7, tone);
      g.addColorStop(1, shade(tone, 0.7));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, tw / 2, Math.PI, 0);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,.4)';
      ctx.lineWidth = Math.max(1.5, size * 0.002);
      ctx.stroke();
    }
  }
  grainOverlay(ctx, size, 0.06);
  return c;
}

export function roofTileBump(size) {
  const c = makeCanvas(size), ctx = c.getContext('2d');
  ctx.fillStyle = '#404040'; ctx.fillRect(0, 0, size, size);
  const rows = 12, th = size / rows, tw = th * 1.5;
  for (let r = 0; r < rows; r++) {
    const off = (r % 2) * tw / 2;
    for (let x = -tw; x < size + tw; x += tw) {
      const cx = x + off + tw / 2, cy = r * th + th;
      const g = ctx.createRadialGradient(cx, cy - th * 0.3, 0, cx, cy, tw * 0.55);
      g.addColorStop(0, '#e8e8e8');
      g.addColorStop(1, '#404040');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(cx, cy, tw / 2, Math.PI, 0); ctx.fill();
    }
  }
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

export function washiTexture(size, base = '#f2ead8') {
  const c = makeCanvas(size), ctx = c.getContext('2d');
  ctx.fillStyle = base; ctx.fillRect(0, 0, size, size);
  // 和紙の繊維
  ctx.strokeStyle = 'rgba(160,140,105,0.12)';
  ctx.lineWidth = Math.max(1, size * 0.0008);
  const fibers = size / 4;
  for (let i = 0; i < fibers; i++) {
    const x = Math.random() * size, y = Math.random() * size;
    const len = size * (0.01 + Math.random() * 0.03);
    const a = Math.random() * Math.PI;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
    ctx.stroke();
  }
  noiseOverlay(ctx, size, { alpha: 0.05, cells: 72 });
  return c;
}

export function tatamiTexture(size, base = '#b0ad72') {
  const c = makeCanvas(size), ctx = c.getContext('2d');
  ctx.fillStyle = base; ctx.fillRect(0, 0, size, size);
  // い草の目(縦線)
  ctx.lineWidth = Math.max(1, size * 0.0012);
  const step = Math.max(3, size / 220);
  for (let x = 0; x < size; x += step) {
    ctx.strokeStyle = `rgba(90,88,40,${0.12 + Math.random() * 0.1})`;
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, size); ctx.stroke();
  }
  // 横の織りの節
  ctx.strokeStyle = 'rgba(220,215,160,0.25)';
  for (let y = 0; y < size; y += step * 2.6) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(size, y); ctx.stroke();
  }
  // 縁(へり) — 1テクスチャ=畳1帖として周囲に帯
  const heri = size * 0.045;
  ctx.fillStyle = '#3c3a34';
  ctx.fillRect(0, 0, heri, size);
  ctx.fillRect(size - heri, 0, heri, size);
  grainOverlay(ctx, size, 0.05);
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
  stainOverlay(ctx, size, { count: 3, alpha: 0.04, dark: false });
  return c;
}

export function fabricBump(size) {
  const c = makeCanvas(size), ctx = c.getContext('2d');
  ctx.fillStyle = '#808080'; ctx.fillRect(0, 0, size, size);
  noiseOverlay(ctx, size, { alpha: 0.5, cells: Math.min(512, size / 2) });
  return c;
}

export function grassTexture(size, base = '#5d7a45') {
  const c = makeCanvas(size), ctx = c.getContext('2d');
  ctx.fillStyle = base; ctx.fillRect(0, 0, size, size);
  noiseOverlay(ctx, size, { alpha: 0.18, cells: 128 });
  // 草の短いストローク
  const blades = size;
  for (let i = 0; i < blades; i++) {
    const x = Math.random() * size, y = Math.random() * size;
    const len = size * (0.004 + Math.random() * 0.008);
    ctx.strokeStyle = `rgba(${60 + Math.random() * 60},${100 + Math.random() * 60},${40 + Math.random() * 40},0.35)`;
    ctx.lineWidth = Math.max(1, size * 0.001);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (Math.random() - 0.5) * len * 0.6, y - len);
    ctx.stroke();
  }
  grainOverlay(ctx, size, 0.1);
  return c;
}

export function asphaltTexture(size) {
  const c = makeCanvas(size), ctx = c.getContext('2d');
  ctx.fillStyle = '#4a4c50'; ctx.fillRect(0, 0, size, size);
  grainOverlay(ctx, size, 0.14);
  noiseOverlay(ctx, size, { alpha: 0.1, cells: 48 });
  stainOverlay(ctx, size, { count: 5, alpha: 0.08 });
  return c;
}

// ---------- テクスチャファクトリ ----------

export class TextureFactory {
  /**
   * @param {number} size 品質設定 (1024/2048/4096/8192)
   * @param {Object} imagesByRole 役割 → HTMLCanvasElement (アップロード画像)
   * @param {number} anisotropy
   * @param {number} maxTexSize GPU の gl.MAX_TEXTURE_SIZE
   */
  constructor(size, imagesByRole = {}, anisotropy = 8, maxTexSize = MAX_IMAGE_SIZE) {
    this.size = size;
    this.procSize = Math.min(size, MAX_PROC_SIZE);
    this.bumpSize = Math.min(size, 1024);
    this.imageSize = Math.min(size, maxTexSize, MAX_IMAGE_SIZE);
    this.images = imagesByRole;
    this.anisotropy = anisotropy;
    this.canvasCache = new Map();  // 描画キャッシュ (key → canvas)
    this.texCache = new Map();     // GPUテクスチャキャッシュ (key|repeat → THREE.Texture)
  }

  _image(role) {
    const src = this.images[role];
    if (!src) return null;
    const m = Math.max(src.width, src.height);
    if (m <= this.imageSize) return src;
    const k = 'img:' + role;
    let cv = this.canvasCache.get(k);
    if (!cv) {
      const scale = this.imageSize / m;
      cv = makeCanvas(0, Math.round(src.width * scale), Math.round(src.height * scale));
      const cx = cv.getContext('2d');
      cx.imageSmoothingQuality = 'high';
      cx.drawImage(src, 0, 0, cv.width, cv.height);
      this.canvasCache.set(k, cv);
    }
    return cv;
  }

  /** 役割にアップロード画像があればそれを、なければ fallback で生成した canvas をテクスチャ化 */
  texture(role, fallbackFn, { repeat = [1, 1], key: cacheKey = '' } = {}) {
    const ck = role + '|' + (cacheKey || (fallbackFn ? fallbackFn.name : ''));
    const tk = ck + '|' + repeat[0].toFixed(2) + 'x' + repeat[1].toFixed(2);
    let tex = this.texCache.get(tk);
    if (tex) return tex;
    let canvas = this.canvasCache.get(ck);
    if (!canvas) {
      canvas = this._image(role) || fallbackFn(this.procSize);
      this.canvasCache.set(ck, canvas);
    }
    tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.anisotropy = this.anisotropy;
    tex.repeat.set(repeat[0], repeat[1]);
    this.texCache.set(tk, tex);
    return tex;
  }

  /** バンプマップ(グレースケール・低解像度で十分) */
  bumpTexture(bumpFn, { repeat = [1, 1], key = '' } = {}) {
    const ck = 'bump|' + (key || bumpFn.name);
    const tk = ck + '|' + repeat[0].toFixed(2) + 'x' + repeat[1].toFixed(2);
    let tex = this.texCache.get(tk);
    if (tex) return tex;
    let canvas = this.canvasCache.get(ck);
    if (!canvas) {
      canvas = bumpFn(this.bumpSize);
      this.canvasCache.set(ck, canvas);
    }
    tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.anisotropy = Math.min(4, this.anisotropy);
    tex.repeat.set(repeat[0], repeat[1]);
    this.texCache.set(tk, tex);
    return tex;
  }

  hasImage(role) { return !!this.images[role]; }

  /** MeshStandardMaterial のショートハンド */
  std(role, fallbackFn, {
    repeat = [1, 1], roughness = 0.9, metalness = 0.0, color = 0xffffff, key = '',
    bump = null, bumpScale = 1.2,
  } = {}) {
    const mat = new THREE.MeshStandardMaterial({
      map: this.texture(role, fallbackFn, { repeat, key }),
      roughness, metalness, color,
    });
    // アップロード画像使用時は模様と合わないためプロシージャルバンプは付けない
    if (bump && !this.hasImage(role)) {
      mat.bumpMap = this.bumpTexture(bump, { repeat, key: key ? key + '-b' : '' });
      mat.bumpScale = bumpScale;
    }
    return mat;
  }

  /** 生成済みリソースの破棄 */
  dispose() {
    for (const t of this.texCache.values()) t.dispose();
    this.texCache.clear();
    this.canvasCache.clear();
  }
}

// ---------- アップロード画像の取り込み ----------

/** File → maxSize 以下に収めた canvas */
export async function fileToCanvas(file, maxSize = MAX_IMAGE_SIZE) {
  const bitmap = await createImageBitmap(file);
  let { width: w, height: h } = bitmap;
  const scale = Math.min(1, maxSize / Math.max(w, h));
  w = Math.round(w * scale); h = Math.round(h * scale);
  const c = makeCanvas(0, w, h);
  c.getContext('2d').drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  return c;
}

/** 画像(の一部領域)の代表色を抽出(彩度の高い頻出色を優先) */
export function dominantColor(canvas, region = null) {
  const s = 32;
  const c = makeCanvas(s);
  const ctx = c.getContext('2d');
  if (region) {
    const [rx, ry, rw, rh] = region;
    ctx.drawImage(canvas, rx, ry, rw, rh, 0, 0, s, s);
  } else {
    ctx.drawImage(canvas, 0, 0, s, s);
  }
  const data = ctx.getImageData(0, 0, s, s).data;
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

/** 画像全体の色統計(外観推定用): {avg: Color, sat, lum, hue} */
export function colorStats(canvas, region = null) {
  const s = 24;
  const c = makeCanvas(s);
  const ctx = c.getContext('2d');
  if (region) {
    const [rx, ry, rw, rh] = region;
    ctx.drawImage(canvas, rx, ry, rw, rh, 0, 0, s, s);
  } else {
    ctx.drawImage(canvas, 0, 0, s, s);
  }
  const data = ctx.getImageData(0, 0, s, s).data;
  let r = 0, g = 0, b = 0, sat = 0, n = 0;
  for (let i = 0; i < data.length; i += 4) {
    r += data[i]; g += data[i + 1]; b += data[i + 2];
    sat += Math.max(data[i], data[i + 1], data[i + 2]) - Math.min(data[i], data[i + 1], data[i + 2]);
    n++;
  }
  const col = new THREE.Color(r / n / 255, g / n / 255, b / n / 255);
  const hsl = {};
  col.getHSL(hsl);
  return { avg: col, sat: sat / n / 255, lum: hsl.l, hue: hsl.h };
}
