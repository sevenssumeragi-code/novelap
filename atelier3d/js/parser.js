// parser.js — 日本語(+英語)の指示文から生成仕様を組み立てる
const COLOR_WORDS = [
  [/白い?|ホワイト|white/i, 0xf2efe8],
  [/黒い?|ブラック|black/i, 0x2a2a2e],
  [/赤い?|レッド|red/i, 0xb03a2e],
  [/青い?|ブルー|blue/i, 0x3b5ea8],
  [/水色|スカイブルー/i, 0x7fb2d9],
  [/緑|グリーン|green/i, 0x4a7a4e],
  [/黄色い?|イエロー|yellow/i, 0xd9b23a],
  [/オレンジ|orange/i, 0xd07a30],
  [/茶色い?|ブラウン|brown/i, 0x7a5230],
  [/ベージュ|beige/i, 0xd9c8a8],
  [/グレー|灰色|gray|grey/i, 0x9a9a9a],
  [/ピンク|pink/i, 0xd98ca0],
  [/紫|パープル|purple/i, 0x7a5a9a],
  [/ネイビー|紺/i, 0x2e3f66],
];

const FURNITURE_WORDS = [
  [/ベッド|bed/i, 'bed'],
  [/ソファー?|sofa|couch/i, 'sofa'],
  [/(ローテーブル|テーブル|table)/i, 'table'],
  [/(デスク|机|desk)/i, 'desk'],
  [/(椅子|イス|いす|チェア|chair)/i, 'chair'],
  [/(本棚|棚|シェルフ|shelf|bookshelf)/i, 'shelf'],
  [/(ランプ|照明|ライト|lamp)/i, 'lamp'],
  [/(テレビ|TV)/i, 'tv'],
  [/(ラグ|カーペット|絨毯|rug|carpet)/i, 'rug'],
  [/(観葉植物|植物|plant)/i, 'plant'],
  [/(タンス|クローゼット|wardrobe|箪笥)/i, 'wardrobe'],
  [/(キッチン|kitchen)/i, 'kitchen'],
];

function toHalfWidth(s) {
  return s.replace(/[０-９]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0));
}

function pickColor(text) {
  for (const [re, hex] of COLOR_WORDS) if (re.test(text)) return hex;
  return null;
}

/**
 * @returns spec = {
 *   mode: 'building'|'room'|'furniture',
 *   color: number|null,
 *   building: { type, floors, roof, style, balcony, width, depth },
 *   room: { width, depth, height, floorStyle, wallStyle, furniture: [] },
 *   furniture: []  // 家具単体モード用
 * }
 */
export function parsePrompt(rawText, forcedMode = 'auto') {
  const text = toHalfWidth(rawText || '').trim();

  const furniture = [];
  for (const [re, type] of FURNITURE_WORDS) {
    if (re.test(text)) furniture.push(type);
  }

  const roomHit = /部屋|内装|インテリア|リビング|寝室|室内|書斎|ワンルーム|LDK|居間/i.test(text);
  const buildingHit = /建|ビル|マンション|アパート|家|住宅|一軒家|タワー|店|ショップ|カフェ|レストラン|外観|オフィス|会社|教会|城|小屋|階/i.test(text);

  let mode = forcedMode;
  if (mode === 'auto') {
    if (buildingHit && !roomHit) mode = 'building';
    else if (roomHit) mode = 'room';
    else if (furniture.length > 0) mode = 'furniture';
    else mode = 'building';
  }

  const color = pickColor(text);

  // ---- 建物 ----
  let type = 'house';
  if (/マンション|アパート|団地/i.test(text)) type = 'apartment';
  else if (/タワー|高層|超高層/i.test(text)) type = 'tower';
  else if (/ビル|オフィス|会社/i.test(text)) type = 'office';
  else if (/店|ショップ|カフェ|レストラン|ベーカリー|パン屋|本屋/i.test(text)) type = 'shop';
  else if (/小屋|ロッジ|山荘/i.test(text)) type = 'cabin';

  const defFloors = { house: 2, cabin: 1, shop: 2, apartment: 5, office: 8, tower: 20 }[type];
  const fm = text.match(/(\d+)\s*階/);
  let floors = fm ? Math.min(40, Math.max(1, parseInt(fm[1], 10))) : defFloors;
  if (/平屋/.test(text)) floors = 1;

  let roof = ['house', 'cabin', 'shop'].includes(type) ? 'gable' : 'flat';
  if (/三角屋根|切妻|とんが|尖った屋根/i.test(text)) roof = 'gable';
  if (/平ら|陸屋根|フラット|屋上/i.test(text)) roof = 'flat';

  let style = null; // null = タイプごとの既定
  if (/レンガ|煉瓦|ブリック|brick/i.test(text)) style = 'brick';
  else if (/木造|ログ|木の|木製/i.test(text)) style = 'wood';
  else if (/コンクリ|打ちっぱなし/i.test(text)) style = 'concrete';
  else if (/ガラス張り|ガラスの|glass/i.test(text)) style = 'glass';
  else if (/モダン|modern/i.test(text)) style = 'modern';
  else if (/和風|和式|日本家屋/i.test(text)) style = 'japanese';

  const balcony = /ベランダ|バルコニー|balcony/i.test(text) || type === 'apartment';

  const baseW = { house: 9, cabin: 6, shop: 10, apartment: 16, office: 14, tower: 18 }[type];
  const baseD = { house: 8, cabin: 5, shop: 8, apartment: 10, office: 12, tower: 18 }[type];
  const wide = /広い|大きな|大きい|ワイド/i.test(text);

  // ---- 部屋 ----
  let floorStyle = 'wood';
  if (/カーペット|絨毯/i.test(text)) floorStyle = 'carpet';
  if (/畳|和室/i.test(text)) floorStyle = 'tatami';
  let wallStyle = 'wallpaper';
  if (/コンクリ|打ちっぱなし/i.test(text)) wallStyle = 'concrete';
  if (/木の壁|板張り/i.test(text)) wallStyle = 'wood';

  const roomFurniture = furniture.length > 0
    ? furniture
    : ['sofa', 'table', 'tv', 'shelf', 'rug', 'lamp', 'plant']; // 既定のリビングセット

  return {
    mode, color, text,
    building: {
      type, floors, roof, style, balcony,
      width: baseW * (wide ? 1.3 : 1),
      depth: baseD * (wide ? 1.2 : 1),
    },
    room: {
      width: wide ? 8.5 : 6.5,
      depth: wide ? 7 : 5.5,
      height: 2.7,
      floorStyle, wallStyle,
      furniture: roomFurniture,
    },
    furniture: furniture.length > 0 ? furniture : ['sofa'],
  };
}

/** 生成内容の説明文(HUD表示用) */
export function describeSpec(spec) {
  if (spec.mode === 'building') {
    const t = { house: '一軒家', cabin: '小屋', shop: '店舗', apartment: 'マンション', office: 'オフィスビル', tower: 'タワー' }[spec.building.type];
    const r = { gable: '三角屋根', flat: '陸屋根' }[spec.building.roof];
    return `${spec.building.floors}階建ての${t}(${r})`;
  }
  if (spec.mode === 'room') {
    const names = { bed: 'ベッド', sofa: 'ソファ', table: 'テーブル', desk: 'デスク', chair: '椅子', shelf: '本棚', lamp: 'ランプ', tv: 'テレビ', rug: 'ラグ', plant: '観葉植物', wardrobe: 'クローゼット', kitchen: 'キッチン' };
    return `部屋の内装(${spec.room.furniture.map(f => names[f] || f).join('・')})`;
  }
  return `家具セット(${spec.furniture.join(', ')})`;
}
