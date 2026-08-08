import * as THREE from 'three';

/**
 * Canvas 2D による手続き生成テクスチャ。
 *
 * 外部画像を使わずに「汚れ・色むら・経年」を出すための層。
 * 生成コストは一度きりで、以降はキャッシュから返す。
 * すべて RepeatWrapping。タイリングの実寸合わせは
 * roomBuilder.applyBoxUV() が UV 側で行うので、ここでは repeat を触らない。
 */

const cache = new Map();

/** 決定的な乱数。生成結果が毎回変わると調整しづらいので種を固定する */
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeCanvas(width, height = width) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return { canvas, ctx: canvas.getContext('2d') };
}

function toTexture(canvas, { colorSpace = THREE.SRGBColorSpace } = {}) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = colorSpace;
  tex.anisotropy = 8;
  return tex;
}

/** キャッシュ付きで生成する */
function cached(key, factory) {
  if (!cache.has(key)) cache.set(key, factory());
  return cache.get(key);
}

// ---- 共通の汚し処理 --------------------------------------------------

/** 不定形のシミを重ねる */
function addStains(ctx, size, rand, { count, maxRadius, color, alpha }) {
  for (let i = 0; i < count; i += 1) {
    const x = rand() * size;
    const y = rand() * size;
    const r = maxRadius * (0.25 + rand() * 0.75);
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, `rgba(${color}, ${alpha * (0.5 + rand() * 0.5)})`);
    grad.addColorStop(1, `rgba(${color}, 0)`);
    ctx.fillStyle = grad;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
}

/** 上から下へ伸びる雨だれ・水垢 */
function addDrips(ctx, size, rand, { count, color, alpha }) {
  for (let i = 0; i < count; i += 1) {
    const x = rand() * size;
    const top = rand() * size * 0.5;
    const len = size * (0.15 + rand() * 0.5);
    const w = 1 + rand() * 4;
    const grad = ctx.createLinearGradient(0, top, 0, top + len);
    grad.addColorStop(0, `rgba(${color}, ${alpha})`);
    grad.addColorStop(1, `rgba(${color}, 0)`);
    ctx.fillStyle = grad;
    ctx.fillRect(x, top, w, len);
  }
}

/** 細かいざらつき。ImageData を直接触るのが一番速い */
function addGrain(ctx, size, rand, amount = 14) {
  const image = ctx.getImageData(0, 0, size, size);
  const data = image.data;
  for (let i = 0; i < data.length; i += 4) {
    const n = (rand() - 0.5) * amount;
    data[i] += n;
    data[i + 1] += n;
    data[i + 2] += n;
  }
  ctx.putImageData(image, 0, 0);
}

/** ひび割れ */
function addCracks(ctx, size, rand, { count, color = '0,0,0', alpha = 0.35 }) {
  ctx.strokeStyle = `rgba(${color}, ${alpha})`;
  for (let i = 0; i < count; i += 1) {
    let x = rand() * size;
    let y = rand() * size;
    ctx.lineWidth = 0.6 + rand() * 1.2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    const steps = 4 + Math.floor(rand() * 6);
    for (let s = 0; s < steps; s += 1) {
      x += (rand() - 0.5) * size * 0.18;
      y += (rand() - 0.5) * size * 0.18;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

// ---- 床: 古びた市松タイル ---------------------------------------------

/**
 * 白黒（やや薄茶寄り）の市松タイル。1テクスチャ = 8×8 マス。
 * 実寸 2m に貼ると 1 マス 25cm になる想定。
 */
export function checkerFloorTexture() {
  return cached('floor.checker', () => {
    const size = 512;
    const cells = 8;
    const cell = size / cells;
    const { canvas, ctx } = makeCanvas(size);
    const rand = mulberry32(20260808);

    for (let y = 0; y < cells; y += 1) {
      for (let x = 0; x < cells; x += 1) {
        const isLight = (x + y) % 2 === 0;
        // 1枚ごとに色をずらして「揃っていない古いタイル」にする。
        // 色相も少し振ると、貼り替えの跡があるように見える。
        const jitter = (rand() - 0.5) * 30;
        const warm = (rand() - 0.5) * 14;
        const base = isLight
          ? [204 + jitter + warm, 195 + jitter, 172 + jitter - warm]
          : [58 + jitter + warm * 0.4, 55 + jitter, 49 + jitter];
        ctx.fillStyle = `rgb(${base.map((v) => Math.round(Math.max(8, Math.min(247, v)))).join(',')})`;
        ctx.fillRect(x * cell, y * cell, cell, cell);

        // 1枚まるごと抜けて下地が出ている
        if (rand() < 0.05) {
          ctx.fillStyle = 'rgba(74,68,58,0.92)';
          ctx.fillRect(x * cell + 2, y * cell + 2, cell - 4, cell - 4);
          ctx.fillStyle = 'rgba(40,35,28,0.5)';
          ctx.fillRect(x * cell + 2, y * cell + 2, cell - 4, cell * 0.25);
        } else if (rand() < 0.26) {
          // 角の欠け
          ctx.fillStyle = 'rgba(40,36,31,0.55)';
          const cs = cell * (0.1 + rand() * 0.22);
          const cxp = x * cell + (rand() < 0.5 ? 0 : cell - cs);
          const cyp = y * cell + (rand() < 0.5 ? 0 : cell - cs);
          ctx.fillRect(cxp, cyp, cs, cs);
        }

        // 摩耗して艶が落ちた部分
        if (rand() < 0.3) {
          ctx.fillStyle = `rgba(120,112,96,${0.08 + rand() * 0.16})`;
          ctx.fillRect(x * cell, y * cell, cell, cell);
        }
      }
    }

    // 目地
    ctx.strokeStyle = 'rgba(30,27,23,0.75)';
    ctx.lineWidth = 2.5;
    for (let i = 0; i <= cells; i += 1) {
      ctx.beginPath();
      ctx.moveTo(i * cell, 0);
      ctx.lineTo(i * cell, size);
      ctx.moveTo(0, i * cell);
      ctx.lineTo(size, i * cell);
      ctx.stroke();
    }

    // 通行で黒ずんだ部分と油染み
    addStains(ctx, size, rand, {
      count: 26,
      maxRadius: 120,
      color: '32,28,22',
      alpha: 0.3,
    });
    addStains(ctx, size, rand, {
      count: 10,
      maxRadius: 60,
      color: '92,70,38',
      alpha: 0.22,
    });
    addCracks(ctx, size, rand, { count: 5, alpha: 0.22 });
    addGrain(ctx, size, rand, 12);

    return toTexture(canvas);
  });
}

// ---- 壁: 汚れたコンクリート -------------------------------------------

export function dirtyConcreteTexture() {
  return cached('wall.concrete', () => {
    const size = 512;
    const { canvas, ctx } = makeCanvas(size);
    const rand = mulberry32(913377);

    ctx.fillStyle = '#6b665e';
    ctx.fillRect(0, 0, size, size);

    // 打ち継ぎのムラ
    addStains(ctx, size, rand, {
      count: 30,
      maxRadius: 150,
      color: '120,116,106',
      alpha: 0.28,
    });
    addStains(ctx, size, rand, {
      count: 24,
      maxRadius: 130,
      color: '44,42,38',
      alpha: 0.3,
    });
    // 苔・カビと錆の色移り。湿っている壁にするため多めに入れる
    addStains(ctx, size, rand, {
      count: 16,
      maxRadius: 90,
      color: '64,80,52',
      alpha: 0.28,
    });
    addStains(ctx, size, rand, {
      count: 14,
      maxRadius: 70,
      color: '116,68,36',
      alpha: 0.24,
    });
    // 補修跡（後から塗ったモルタルの色違い）
    for (let i = 0; i < 4; i += 1) {
      const x = rand() * size;
      const y = rand() * size;
      const w = 60 + rand() * 150;
      const h = 40 + rand() * 120;
      ctx.fillStyle = `rgba(${Math.round(126 + rand() * 30)},${Math.round(120 + rand() * 26)},${Math.round(110 + rand() * 20)},0.32)`;
      ctx.fillRect(x, y, w, h);
    }

    addDrips(ctx, size, rand, { count: 22, color: '38,36,32', alpha: 0.32 });
    addCracks(ctx, size, rand, { count: 9, alpha: 0.3 });

    // コンクリート型枠のセパレータ穴
    for (let i = 0; i < 6; i += 1) {
      const x = rand() * size;
      const y = rand() * size;
      ctx.fillStyle = 'rgba(38,35,30,0.55)';
      ctx.beginPath();
      ctx.arc(x, y, 3 + rand() * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    addGrain(ctx, size, rand, 16);
    return toTexture(canvas);
  });
}

// ---- 壁: 古い小口タイル -----------------------------------------------

export function oldWallTileTexture() {
  return cached('wall.tile', () => {
    const size = 512;
    const cols = 16;
    const rows = 32; // 横長のタイル
    const cw = size / cols;
    const ch = size / rows;
    const { canvas, ctx } = makeCanvas(size);
    const rand = mulberry32(55512);

    ctx.fillStyle = '#4b4a44';
    ctx.fillRect(0, 0, size, size);

    for (let y = 0; y < rows; y += 1) {
      // 一段ごとに半枚ずらす
      const offset = y % 2 === 0 ? 0 : cw / 2;
      for (let x = -1; x < cols + 1; x += 1) {
        const j = (rand() - 0.5) * 26;
        // 青緑がかった古い浴室タイルの色
        const r = 122 + j;
        const g = 134 + j;
        const b = 122 + j * 0.6;
        ctx.fillStyle = `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
        ctx.fillRect(x * cw + offset + 1.5, y * ch + 1.5, cw - 3, ch - 3);

        // 剥がれて下地が見えているタイル
        if (rand() < 0.05) {
          ctx.fillStyle = 'rgba(72,66,58,0.9)';
          ctx.fillRect(x * cw + offset + 1.5, y * ch + 1.5, cw - 3, ch - 3);
        }
      }
    }

    addStains(ctx, size, rand, {
      count: 18,
      maxRadius: 110,
      color: '40,38,32',
      alpha: 0.3,
    });
    addDrips(ctx, size, rand, { count: 16, color: '46,42,34', alpha: 0.3 });
    addGrain(ctx, size, rand, 10);

    return toTexture(canvas);
  });
}

// ---- 錆びた金属板 -----------------------------------------------------

/**
 * @param {boolean} ribbed 波板（シャッター）にするか
 */
function buildRustyMetal(seed, ribbed) {
  const size = 512;
  const { canvas, ctx } = makeCanvas(size);
  const rand = mulberry32(seed);

  ctx.fillStyle = '#5d5952';
  ctx.fillRect(0, 0, size, size);

  if (ribbed) {
    // 横方向のリブ。シャッターらしい陰影を作る
    const ribs = 32;
    const rh = size / ribs;
    for (let i = 0; i < ribs; i += 1) {
      const grad = ctx.createLinearGradient(0, i * rh, 0, (i + 1) * rh);
      grad.addColorStop(0, 'rgba(20,18,16,0.55)');
      grad.addColorStop(0.45, 'rgba(255,255,255,0.16)');
      grad.addColorStop(1, 'rgba(20,18,16,0.5)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, i * rh, size, rh);
    }
  }

  // 錆
  addStains(ctx, size, rand, {
    count: 34,
    maxRadius: 90,
    color: '138,72,28',
    alpha: 0.42,
  });
  addStains(ctx, size, rand, {
    count: 18,
    maxRadius: 45,
    color: '92,42,16',
    alpha: 0.5,
  });
  addDrips(ctx, size, rand, { count: 20, color: '120,60,22', alpha: 0.35 });
  addGrain(ctx, size, rand, 18);

  return toTexture(canvas);
}

export function rustyMetalTexture() {
  return cached('metal.rusty', () => buildRustyMetal(778811, false));
}

export function shutterTexture() {
  return cached('metal.shutter', () => buildRustyMetal(24680, true));
}

// ---- 天井 -------------------------------------------------------------

export function grimyCeilingTexture() {
  return cached('ceiling.grimy', () => {
    const size = 512;
    const { canvas, ctx } = makeCanvas(size);
    const rand = mulberry32(31415);

    ctx.fillStyle = '#413d38';
    ctx.fillRect(0, 0, size, size);
    addStains(ctx, size, rand, {
      count: 30,
      maxRadius: 140,
      color: '24,22,20',
      alpha: 0.4,
    });
    addStains(ctx, size, rand, {
      count: 12,
      maxRadius: 90,
      color: '86,80,70',
      alpha: 0.2,
    });
    addCracks(ctx, size, rand, { count: 7, alpha: 0.3 });
    addGrain(ctx, size, rand, 12);
    return toTexture(canvas);
  });
}

// ---- 小物 -------------------------------------------------------------

export function cardboardTexture() {
  return cached('prop.cardboard', () => {
    const size = 256;
    const { canvas, ctx } = makeCanvas(size);
    const rand = mulberry32(6060);

    ctx.fillStyle = '#a8845a';
    ctx.fillRect(0, 0, size, size);
    // 段ボールの筋
    ctx.strokeStyle = 'rgba(120,92,58,0.35)';
    ctx.lineWidth = 1;
    for (let x = 0; x < size; x += 4) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, size);
      ctx.stroke();
    }
    // 封をしたテープ
    ctx.fillStyle = 'rgba(196,178,146,0.7)';
    ctx.fillRect(0, size * 0.46, size, size * 0.08);
    addStains(ctx, size, rand, {
      count: 14,
      maxRadius: 60,
      color: '70,52,32',
      alpha: 0.3,
    });
    addGrain(ctx, size, rand, 12);
    return toTexture(canvas);
  });
}

export function crateWoodTexture() {
  return cached('prop.crate', () => {
    const size = 256;
    const { canvas, ctx } = makeCanvas(size);
    const rand = mulberry32(4242);

    ctx.fillStyle = '#6d5236';
    ctx.fillRect(0, 0, size, size);
    // 板の継ぎ目
    const planks = 5;
    for (let i = 0; i < planks; i += 1) {
      const y = (i * size) / planks;
      const j = (rand() - 0.5) * 22;
      ctx.fillStyle = `rgb(${Math.round(112 + j)},${Math.round(84 + j)},${Math.round(54 + j)})`;
      ctx.fillRect(0, y + 2, size, size / planks - 4);
    }
    // 木目
    ctx.strokeStyle = 'rgba(60,44,28,0.32)';
    for (let i = 0; i < 40; i += 1) {
      const y = rand() * size;
      ctx.lineWidth = 0.5 + rand();
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(size * 0.3, y + (rand() - 0.5) * 8, size * 0.7, y + (rand() - 0.5) * 8, size, y);
      ctx.stroke();
    }
    addStains(ctx, size, rand, {
      count: 12,
      maxRadius: 50,
      color: '48,34,20',
      alpha: 0.3,
    });
    addGrain(ctx, size, rand, 14);
    return toTexture(canvas);
  });
}

// ---- ラフネス用のグレースケールノイズ -----------------------------------

/**
 * 濡れ・油・埃で艶がまだらになる感じを出す共通ラフネスマップ。
 * カラーマップと同じ UV に乗るので、実寸タイリングも自動的に合う。
 */
export function grimeRoughnessTexture() {
  return cached('common.roughness', () => {
    const size = 256;
    const { canvas, ctx } = makeCanvas(size);
    const rand = mulberry32(90909);

    ctx.fillStyle = '#b4b4b4'; // 基準ラフネス（やや粗い）
    ctx.fillRect(0, 0, size, size);
    // 暗い = つるつる（濡れ・油）
    addStains(ctx, size, rand, {
      count: 22,
      maxRadius: 80,
      color: '60,60,60',
      alpha: 0.55,
    });
    // 明るい = ざらざら（埃）
    addStains(ctx, size, rand, {
      count: 18,
      maxRadius: 70,
      color: '235,235,235',
      alpha: 0.4,
    });
    addGrain(ctx, size, rand, 24);

    return toTexture(canvas, { colorSpace: THREE.NoColorSpace });
  });
}

// ---- ネオン看板 -------------------------------------------------------

/**
 * 発光する看板テクスチャ。背景は透明で、文字だけがグローとともに残る。
 * @param {{text: string, color: string, vertical?: boolean, key?: string}} options
 */
export function neonSignTexture({ text, color, vertical = false, key }) {
  const cacheKey = `neon.${key ?? text}.${color}.${vertical}`;
  return cached(cacheKey, () => {
    const w = vertical ? 256 : 512;
    const h = vertical ? 512 : 256;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');

    const chars = [...text];
    const fontSize = vertical
      ? Math.min(w * 0.66, (h * 0.86) / chars.length)
      : Math.min(h * 0.66, (w * 0.86) / chars.length);

    ctx.font = `bold ${fontSize}px "Yu Gothic", "Noto Sans JP", "Microsoft YaHei", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const draw = (fill, blur, lineWidth) => {
      ctx.shadowColor = color;
      ctx.shadowBlur = blur;
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.fillStyle = fill;
      chars.forEach((ch, i) => {
        const x = vertical ? w / 2 : (w / chars.length) * (i + 0.5);
        const y = vertical ? (h / chars.length) * (i + 0.5) : h / 2;
        if (lineWidth > 0) ctx.strokeText(ch, x, y);
        ctx.fillText(ch, x, y);
      });
    };

    // 外側のにじみ → 管の色 → 芯の白、の順に重ねてネオンらしくする
    draw('rgba(0,0,0,0)', 44, 14);
    draw(color, 28, 6);
    draw('#ffffff', 12, 0);

    const tex = toTexture(canvas);
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  });
}

// ---- 汚しデカール用アトラス ---------------------------------------------

/**
 * デカールは MultiplyBlending で重ねる。
 * 「白 = 変化なし / 暗い色 = 汚れ」で描いておけば、下の壁の陰影を保ったまま
 * 汚しだけを乗せられる。ライト計算が要らないので実質タダ。
 *
 * 4分割のアトラスにしてあるので、材質は1つでも4種類の汚れを使い分けられる。
 */

/** 4分割セルごとに描く。描画座標はセルローカルになる */
function forEachCell(ctx, size, draw) {
  const half = size / 2;
  for (let i = 0; i < 4; i += 1) {
    const x0 = (i % 2) * half;
    const y0 = Math.floor(i / 2) * half;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x0, y0, half, half);
    ctx.clip();
    ctx.translate(x0, y0);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, half, half);
    draw(i, half);
    ctx.restore();
  }
}

/**
 * セルの縁を白に戻す。
 * これをやらないと板の輪郭が四角い汚れとして見えてしまう。
 */
function fadeCellEdges(ctx, s, margin, sides = ['left', 'right', 'top', 'bottom']) {
  const grad = (x0, y0, x1, y1) => {
    const g = ctx.createLinearGradient(x0, y0, x1, y1);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    return g;
  };
  if (sides.includes('left')) {
    ctx.fillStyle = grad(0, 0, margin, 0);
    ctx.fillRect(0, 0, margin, s);
  }
  if (sides.includes('right')) {
    ctx.fillStyle = grad(s, 0, s - margin, 0);
    ctx.fillRect(s - margin, 0, margin, s);
  }
  if (sides.includes('top')) {
    ctx.fillStyle = grad(0, 0, 0, margin);
    ctx.fillRect(0, 0, s, margin);
  }
  if (sides.includes('bottom')) {
    ctx.fillStyle = grad(0, s, 0, s - margin);
    ctx.fillRect(0, s - margin, s, margin);
  }
}

/** 壁用の汚しアトラス。0=下部の黒ずみ 1=カビ 2=錆の垂れ 3=雨染み */
export function grimeAtlasTexture() {
  return cached('decal.grime', () => {
    const size = 1024;
    const { canvas, ctx } = makeCanvas(size);
    const rand = mulberry32(60318);

    forEachCell(ctx, size, (cell, s) => {
      if (cell === 0) {
        // 巾木のあたりから立ち上がる黒ずみ
        const g = ctx.createLinearGradient(0, s, 0, s * 0.2);
        g.addColorStop(0, 'rgba(34,30,25,0.92)');
        g.addColorStop(0.4, 'rgba(74,68,58,0.55)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, s, s);

        // 不規則に高く上がる舌状の汚れ
        for (let i = 0; i < 16; i += 1) {
          const x = rand() * s;
          const w = s * (0.03 + rand() * 0.09);
          const h = s * (0.25 + rand() * 0.45);
          const g2 = ctx.createLinearGradient(0, s, 0, s - h);
          g2.addColorStop(0, 'rgba(40,36,30,0.7)');
          g2.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = g2;
          ctx.fillRect(x, s - h, w, h);
        }
        addStains(ctx, s, rand, { count: 10, maxRadius: s * 0.14, color: '46,42,34', alpha: 0.35 });
        fadeCellEdges(ctx, s, s * 0.1, ['left', 'right', 'top']);
      } else if (cell === 1) {
        // カビ。緑がかった黒を群れで置く
        for (let i = 0; i < 22; i += 1) {
          const cx = s * (0.15 + rand() * 0.7);
          const cy = s * (0.15 + rand() * 0.7);
          const r = s * (0.04 + rand() * 0.14);
          const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
          g.addColorStop(0, 'rgba(38,50,32,0.62)');
          g.addColorStop(0.55, 'rgba(58,68,48,0.32)');
          g.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = g;
          ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
        }
        // 芯の濃い点
        for (let i = 0; i < 40; i += 1) {
          ctx.fillStyle = `rgba(30,40,26,${0.2 + rand() * 0.35})`;
          ctx.beginPath();
          ctx.arc(s * (0.15 + rand() * 0.7), s * (0.15 + rand() * 0.7), 1 + rand() * 4, 0, Math.PI * 2);
          ctx.fill();
        }
        fadeCellEdges(ctx, s, s * 0.14);
      } else if (cell === 2) {
        // ボルトや室外機から垂れる錆
        const ox = s * 0.5;
        const oy = s * 0.16;
        ctx.fillStyle = 'rgba(74,40,16,0.7)';
        ctx.beginPath();
        ctx.arc(ox, oy, s * 0.035, 0, Math.PI * 2);
        ctx.fill();

        for (let i = 0; i < 9; i += 1) {
          const x = ox + (rand() - 0.5) * s * 0.32;
          const w = s * (0.015 + rand() * 0.05);
          const h = s * (0.35 + rand() * 0.5);
          const g = ctx.createLinearGradient(0, oy, 0, oy + h);
          g.addColorStop(0, 'rgba(96,50,20,0.72)');
          g.addColorStop(0.5, 'rgba(128,72,32,0.42)');
          g.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = g;
          ctx.fillRect(x, oy, w, h);
        }
        addStains(ctx, s, rand, { count: 8, maxRadius: s * 0.1, color: '110,58,22', alpha: 0.3 });
        fadeCellEdges(ctx, s, s * 0.1, ['left', 'right', 'top']);
      } else {
        // 雨染み。広く薄い筋と、水位の跡になる横線
        for (let i = 0; i < 12; i += 1) {
          const x = rand() * s;
          const w = s * (0.05 + rand() * 0.16);
          const g = ctx.createLinearGradient(0, s * 0.1, 0, s * 0.95);
          g.addColorStop(0, 'rgba(255,255,255,0)');
          g.addColorStop(0.4, 'rgba(86,82,72,0.34)');
          g.addColorStop(1, 'rgba(64,60,52,0.42)');
          ctx.fillStyle = g;
          ctx.fillRect(x, 0, w, s);
        }
        const tide = ctx.createLinearGradient(0, s * 0.62, 0, s * 0.72);
        tide.addColorStop(0, 'rgba(255,255,255,0)');
        tide.addColorStop(0.5, 'rgba(58,54,46,0.4)');
        tide.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = tide;
        ctx.fillRect(0, s * 0.6, s, s * 0.14);
        fadeCellEdges(ctx, s, s * 0.12);
      }
    });

    return toTexture(canvas);
  });
}

/** 床・天井用の汚しアトラス。0=広い黒ずみ 1=油染み 2=水たまり跡 3=細かい散り */
export function stainAtlasTexture() {
  return cached('decal.stain', () => {
    const size = 1024;
    const { canvas, ctx } = makeCanvas(size);
    const rand = mulberry32(778452);

    forEachCell(ctx, size, (cell, s) => {
      if (cell === 0) {
        addStains(ctx, s, rand, { count: 16, maxRadius: s * 0.28, color: '34,30,24', alpha: 0.4 });
        addStains(ctx, s, rand, { count: 10, maxRadius: s * 0.16, color: '52,46,36', alpha: 0.3 });
      } else if (cell === 1) {
        // 油。輪郭がやや締まった濃いシミ
        for (let i = 0; i < 5; i += 1) {
          const cx = s * (0.25 + rand() * 0.5);
          const cy = s * (0.25 + rand() * 0.5);
          const r = s * (0.1 + rand() * 0.18);
          const g = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r);
          g.addColorStop(0, 'rgba(26,22,18,0.62)');
          g.addColorStop(0.7, 'rgba(46,38,28,0.4)');
          g.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = g;
          ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
        }
      } else if (cell === 2) {
        // 乾いた水たまりの輪
        for (let i = 0; i < 3; i += 1) {
          const cx = s * (0.3 + rand() * 0.4);
          const cy = s * (0.3 + rand() * 0.4);
          const r = s * (0.14 + rand() * 0.16);
          const g = ctx.createRadialGradient(cx, cy, r * 0.55, cx, cy, r);
          g.addColorStop(0, 'rgba(255,255,255,0)');
          g.addColorStop(0.75, 'rgba(58,52,42,0.4)');
          g.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = g;
          ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
        }
        addStains(ctx, s, rand, { count: 6, maxRadius: s * 0.12, color: '48,44,36', alpha: 0.22 });
      } else {
        for (let i = 0; i < 90; i += 1) {
          ctx.fillStyle = `rgba(40,36,30,${0.12 + rand() * 0.3})`;
          ctx.beginPath();
          ctx.arc(s * (0.1 + rand() * 0.8), s * (0.1 + rand() * 0.8), 1 + rand() * 5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      fadeCellEdges(ctx, s, s * 0.16);
    });

    return toTexture(canvas);
  });
}

/** 加算合成で使う放射グロー。看板の光が壁に落ちている表現に使う */
export function radialGlowTexture() {
  return cached('decal.glow', () => {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, 'rgba(255,255,255,0.95)');
    g.addColorStop(0.35, 'rgba(255,255,255,0.42)');
    g.addColorStop(0.7, 'rgba(255,255,255,0.12)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);

    const tex = toTexture(canvas);
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  });
}

// ---- 塗装板 -------------------------------------------------------------

/** 塗装が剥げて下地と錆が覗いている板。壁の素材を1種類増やすために使う */
export function paintedBoardTexture() {
  return cached('wall.painted', () => {
    const size = 512;
    const { canvas, ctx } = makeCanvas(size);
    const rand = mulberry32(151617);

    ctx.fillStyle = '#4c655e'; // 褪せた青緑
    ctx.fillRect(0, 0, size, size);

    // 板の継ぎ目
    const planks = 4;
    for (let i = 1; i < planks; i += 1) {
      const y = (i * size) / planks;
      ctx.fillStyle = 'rgba(26,32,30,0.55)';
      ctx.fillRect(0, y - 2, size, 4);
      ctx.fillStyle = 'rgba(150,168,160,0.16)';
      ctx.fillRect(0, y + 2, size, 2);
    }

    // 塗装のムラ
    addStains(ctx, size, rand, { count: 20, maxRadius: 120, color: '96,124,114', alpha: 0.22 });
    addStains(ctx, size, rand, { count: 16, maxRadius: 100, color: '30,44,40', alpha: 0.26 });

    // 剥がれ。下地（グレー）と錆（茶）を覗かせる
    for (let i = 0; i < 26; i += 1) {
      const cx = rand() * size;
      const cy = rand() * size;
      const r = 6 + rand() * 34;
      ctx.fillStyle = rand() < 0.45 ? 'rgba(122,74,36,0.8)' : 'rgba(124,120,110,0.75)';
      ctx.beginPath();
      // いびつな多角形にして「剥がれ」らしくする
      const points = 6 + Math.floor(rand() * 4);
      for (let p = 0; p <= points; p += 1) {
        const a = (p / points) * Math.PI * 2;
        const rr = r * (0.55 + rand() * 0.6);
        const x = cx + Math.cos(a) * rr;
        const y = cy + Math.sin(a) * rr;
        if (p === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.fill();
    }

    addDrips(ctx, size, rand, { count: 14, color: '34,28,22', alpha: 0.3 });
    addGrain(ctx, size, rand, 14);
    return toTexture(canvas);
  });
}

// ---- 看板（非発光の古い札） ----------------------------------------------

/**
 * 塗装された店舗札・注意書き。ネオンではない「古い看板」を増やすためのもの。
 * @param {{text: string, bg?: string, fg?: string, vertical?: boolean, key?: string}} options
 */
export function signPlateTexture({ text, bg = '#8c1f1c', fg = '#e8d49a', vertical = false, key }) {
  const cacheKey = `plate.${key ?? text}.${bg}.${fg}.${vertical}`;
  return cached(cacheKey, () => {
    const w = vertical ? 256 : 512;
    const h = vertical ? 512 : 256;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    const rand = mulberry32(text.length * 977 + 31);

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // 縁取り
    ctx.strokeStyle = fg;
    ctx.lineWidth = Math.min(w, h) * 0.035;
    ctx.strokeRect(w * 0.05, h * 0.05, w * 0.9, h * 0.9);

    const chars = [...text];
    const fontSize = vertical
      ? Math.min(w * 0.6, (h * 0.78) / chars.length)
      : Math.min(h * 0.58, (w * 0.8) / chars.length);
    ctx.font = `bold ${fontSize}px "Yu Gothic", "Noto Sans JP", "Microsoft YaHei", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = fg;
    chars.forEach((ch, i) => {
      const x = vertical ? w / 2 : (w / chars.length) * (i + 0.5);
      const y = vertical ? (h / chars.length) * (i + 0.5) : h / 2;
      ctx.fillText(ch, x, y);
    });

    // 経年。塗装の剥げと汚れ
    for (let i = 0; i < 18; i += 1) {
      ctx.fillStyle = `rgba(70,60,48,${0.15 + rand() * 0.3})`;
      ctx.beginPath();
      ctx.arc(rand() * w, rand() * h, 2 + rand() * 12, 0, Math.PI * 2);
      ctx.fill();
    }
    const shade = ctx.createLinearGradient(0, h * 0.4, 0, h);
    shade.addColorStop(0, 'rgba(0,0,0,0)');
    shade.addColorStop(1, 'rgba(20,16,12,0.45)');
    ctx.fillStyle = shade;
    ctx.fillRect(0, 0, w, h);

    const tex = toTexture(canvas);
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  });
}

// ---- 洗濯物 -------------------------------------------------------------

export function clothTexture() {
  return cached('prop.cloth', () => {
    const size = 256;
    const { canvas, ctx } = makeCanvas(size);
    const rand = mulberry32(3120);

    ctx.fillStyle = '#c8c2b4';
    ctx.fillRect(0, 0, size, size);

    // 織り目
    ctx.strokeStyle = 'rgba(150,144,132,0.3)';
    ctx.lineWidth = 1;
    for (let i = 0; i < size; i += 3) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, size);
      ctx.moveTo(0, i);
      ctx.lineTo(size, i);
      ctx.stroke();
    }
    // 裾の縫い目
    ctx.fillStyle = 'rgba(120,112,100,0.5)';
    ctx.fillRect(0, size - 12, size, 4);

    addStains(ctx, size, rand, { count: 10, maxRadius: 60, color: '120,110,92', alpha: 0.3 });
    addGrain(ctx, size, rand, 10);
    return toTexture(canvas);
  });
}

/** 生成済みテクスチャをすべて破棄する（通常は呼ばない） */
export function disposeAllTextures() {
  for (const tex of cache.values()) tex.dispose?.();
  cache.clear();
}
