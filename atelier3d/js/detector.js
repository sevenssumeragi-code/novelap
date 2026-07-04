// detector.js — アップロード画像の物体認識とシーン解析
// TensorFlow.js + COCO-SSD (ssdlite_mobilenet_v2) を全てブラウザ内で実行する。
// サーバーへの送信は一切ない。モデルは vendor/tf/ に同梱。
import { dominantColor, colorStats } from './textures.js';

// COCO のクラス → このアプリの家具ビルダー
const COCO_TO_FURNITURE = {
  chair: 'chair',
  couch: 'sofa',
  bed: 'bed',
  'dining table': 'table',
  tv: 'tv',
  laptop: 'desk',
  'potted plant': 'plant',
  refrigerator: 'fridge',
  toilet: 'toilet',
  sink: 'sink',
  clock: 'clock',
  microwave: 'kitchen',
  oven: 'kitchen',
  vase: 'plant',
  book: 'shelf',
  bench: 'bench',
};

export const COCO_JA = {
  chair: '椅子', couch: 'ソファ', bed: 'ベッド', 'dining table': 'テーブル', tv: 'テレビ',
  laptop: 'デスク(PC)', 'potted plant': '観葉植物', refrigerator: '冷蔵庫', toilet: 'トイレ',
  sink: 'シンク', clock: '時計', microwave: '電子レンジ', oven: 'オーブン', vase: '花瓶',
  book: '本', bench: 'ベンチ', person: '人物',
};

let loadPromise = null;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = () => reject(new Error('スクリプトの読み込みに失敗: ' + src));
    document.head.appendChild(s);
  });
}

/** 認識モデルを読み込む(初回のみ)。失敗した環境では null を返す。 */
export function loadDetector() {
  if (!loadPromise) {
    loadPromise = (async () => {
      if (!window.tf) await loadScript('vendor/tf/tf.min.js');
      if (!window.cocoSsd) await loadScript('vendor/tf/coco-ssd.min.js');
      return await window.cocoSsd.load({ modelUrl: 'vendor/tf/ssdlite_mobilenet_v2/model.json' });
    })().catch(err => {
      console.warn('物体認識モデルを読み込めませんでした(画像はテクスチャとして利用されます):', err);
      return null;
    });
  }
  return loadPromise;
}

/** 検出用に縮小したキャンバス(巨大画像をそのまま推論すると重すぎる) */
function detectSizeCanvas(canvas, max = 512) {
  const scale = Math.min(1, max / Math.max(canvas.width, canvas.height));
  if (scale >= 1) return canvas;
  const c = document.createElement('canvas');
  c.width = Math.round(canvas.width * scale);
  c.height = Math.round(canvas.height * scale);
  c.getContext('2d').drawImage(canvas, 0, 0, c.width, c.height);
  return c;
}

/**
 * 画像内の家具・物体を検出する。
 * @returns [{label, ja, type, score, box:{u,v,w,h}}]  box は 0-1 正規化
 *          type はこのアプリで立体化できる家具型(なければ null)
 */
export async function detectObjects(canvas) {
  const model = await loadDetector();
  if (!model) return null;   // モデル利用不可
  const small = detectSizeCanvas(canvas);
  const preds = await model.detect(small, 24, 0.36);
  const W = small.width, H = small.height;
  return preds.map(p => ({
    label: p.class,
    ja: COCO_JA[p.class] || p.class,
    type: COCO_TO_FURNITURE[p.class] || null,
    score: p.score,
    box: {
      u: p.bbox[0] / W,
      v: p.bbox[1] / H,
      w: p.bbox[2] / W,
      h: p.bbox[3] / H,
    },
  }));
}

/**
 * 内装写真 → 家具アイテム列 + 床・壁の色。
 * 検出された家具はすべて、写真内の位置(左右・手前奥)を保って配置される。
 */
export function roomItemsFromDetections(canvas, detections) {
  const items = [];
  for (const d of detections) {
    if (!d.type) continue;
    const b = d.box;
    // 物体領域の代表色(家具の色として利用)
    const region = [
      Math.round(b.u * canvas.width), Math.round(b.v * canvas.height),
      Math.max(2, Math.round(b.w * canvas.width)), Math.max(2, Math.round(b.h * canvas.height)),
    ];
    const color = dominantColor(canvas, region).getHex();
    // 写真内の位置 → 部屋内の位置 (u: 左右, v: 手前(下)ほど 1)
    const u = Math.min(1, Math.max(0, b.u + b.w / 2));
    const yb = b.v + b.h;                                   // バウンディングボックス下端
    const v = Math.min(1, Math.max(0.02, (yb - 0.45) / 0.55));
    // 色付けが不自然な家具は色を持たせない
    const noColor = ['tv', 'fridge', 'toilet', 'sink', 'clock', 'kitchen', 'plant'].includes(d.type);
    items.push({
      type: d.type, count: 1,
      color: noColor ? null : color,
      seats: null,
      pos: { u, v },
      score: d.score,
    });
  }
  // 床(画像下端の帯)と壁(上部の帯)の色
  const floorColor = dominantColor(canvas, [0, Math.round(canvas.height * 0.86), canvas.width, Math.round(canvas.height * 0.14)]).getHex();
  const wallColor = dominantColor(canvas, [0, Math.round(canvas.height * 0.06), canvas.width, Math.round(canvas.height * 0.28)]).getHex();
  return { items, floorColor, wallColor };
}

/**
 * 外観写真 → 壁スタイルと色の推定(検出モデルではなく色統計ベース)。
 */
export function guessExterior(canvas) {
  const st = colorStats(canvas, [
    Math.round(canvas.width * 0.2), Math.round(canvas.height * 0.3),
    Math.round(canvas.width * 0.6), Math.round(canvas.height * 0.5),
  ]);
  const dom = dominantColor(canvas, [
    Math.round(canvas.width * 0.2), Math.round(canvas.height * 0.3),
    Math.round(canvas.width * 0.6), Math.round(canvas.height * 0.5),
  ]);
  const hex = dom.getHex();
  let style;
  if (st.lum > 0.78 && st.sat < 0.12) style = 'plaster';                 // 白系
  else if (st.sat < 0.1 && st.lum >= 0.25 && st.lum <= 0.62) style = 'concrete';
  else if (st.hue >= 0.5 && st.hue <= 0.68 && st.lum > 0.45) style = 'glass';
  else if ((st.hue <= 0.06 || st.hue >= 0.93) && st.sat > 0.15) style = 'brick';
  else if (st.hue > 0.06 && st.hue <= 0.13 && st.sat > 0.18 && st.lum < 0.6) style = 'wood';
  else style = 'plaster';
  return { style, color: hex };
}

/** 検出結果の日本語サマリ: 「ソファ×2・テレビ・観葉植物」 */
export function describeDetections(detections) {
  const counts = new Map();
  for (const d of detections) {
    if (!d.type && d.label !== 'person') continue;
    const ja = d.ja;
    counts.set(ja, (counts.get(ja) || 0) + 1);
  }
  return [...counts.entries()].map(([ja, n]) => n > 1 ? `${ja}×${n}` : ja).join('・');
}
