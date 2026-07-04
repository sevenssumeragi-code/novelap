// parser.js — 日本語(+英語)の指示文から生成仕様を組み立てる
//
// spec v2:
// {
//   mode: 'building'|'room'|'furniture',
//   color: number|null,                      // 全体の基調色
//   building: { type, floors, roof, style, balcony, garage, fence, garden, pool, width, depth },
//   room: { width, depth, height, kind, floorStyle, wallStyle,
//           items: [{type, count, color, seats}] },
//   furniture: [{type, count, color, seats}],
// }

const COLOR_WORDS = [
  [/白い?|ホワイト|white/i, 0xf2efe8],
  [/黒い?|ブラック|black/i, 0x2a2a2e],
  [/真っ?赤|赤い?|レッド|red/i, 0xb03a2e],
  [/ワインレッド|ボルドー|えんじ|臙脂/i, 0x722f37],
  [/水色|スカイブルー|ライトブルー/i, 0x7fb2d9],
  [/ネイビー|紺/i, 0x2e3f66],
  [/ターコイズ|ティール|青緑/i, 0x2e8b8b],
  [/青い?|ブルー|blue/i, 0x3b5ea8],
  [/黄緑|ライム|若草/i, 0x8db34a],
  [/深緑|ダークグリーン|モスグリーン/i, 0x2f4f36],
  [/ミント/i, 0x9fd8c0],
  [/オリーブ/i, 0x6b6b3a],
  [/緑|グリーン|green/i, 0x4a7a4e],
  [/黄色い?|イエロー|yellow/i, 0xd9b23a],
  [/オレンジ|orange/i, 0xd07a30],
  [/茶色い?|ブラウン|brown/i, 0x7a5230],
  [/ダークウッド|ウォールナット|こげ茶|焦げ?茶/i, 0x4a3220],
  [/ベージュ|beige/i, 0xd9c8a8],
  [/クリーム|アイボリー|生成り|オフホワイト/i, 0xefe6d0],
  [/グレー|灰色|gray|grey/i, 0x9a9a9a],
  [/チャコール/i, 0x4a4a4e],
  [/ピンク|桃色|pink/i, 0xd98ca0],
  [/紫|パープル|ラベンダー|purple/i, 0x7a5a9a],
  [/金色?|ゴールド|gold/i, 0xc9a227],
  [/銀色?|シルバー|silver/i, 0xb8bcc2],
];

// [regex, type] — 上から順に評価。先に長い語を置くこと
const FURNITURE_WORDS = [
  [/ダブルベッド|シングルベッド|ベッド|寝台|bed/i, 'bed'],
  [/ソファー?ベッド|ソファー?|sofa|couch/i, 'sofa'],
  [/こたつ|コタツ|炬燵/i, 'kotatsu'],
  [/(ダイニングテーブル|ローテーブル|座卓|ちゃぶ台|テーブル|table)/i, 'table'],
  [/(デスク|机|勉強机|desk)/i, 'desk'],
  [/(座椅子|椅子|イス|いす|チェア|chair)/i, 'chair'],
  [/(スツール|丸椅子|stool)/i, 'stool'],
  [/(ベンチ|bench)/i, 'bench'],
  [/(本棚|書棚|棚|シェルフ|ラック|shelf|bookshelf)/i, 'shelf'],
  [/(シーリングライト|フロアランプ|ランプ|照明|ライト|電気スタンド|lamp)/i, 'lamp'],
  [/(テレビ台|テレビ|TV|モニター?)/i, 'tv'],
  [/(ラグ|カーペット|絨毯|じゅうたん|マット|rug|carpet)/i, 'rug'],
  [/(観葉植物|植物|グリーン(?!の壁)|plant|花瓶|フラワー)/i, 'plant'],
  [/(タンス|箪笥|クローゼット|ワードローブ|衣装棚|wardrobe)/i, 'wardrobe'],
  [/(システムキッチン|キッチン|台所|流し台|kitchen)/i, 'kitchen'],
  [/(冷蔵庫|fridge|refrigerator)/i, 'fridge'],
  [/(洗濯機|washer)/i, 'washer'],
  [/(トイレ|便器|toilet)/i, 'toilet'],
  [/(浴槽|バスタブ|お?風呂|bathtub|bath)/i, 'bathtub'],
  [/(洗面台|洗面所|シンク|sink)/i, 'sink'],
  [/(姿見|鏡|ミラー|mirror)/i, 'mirror'],
  [/(掛け?時計|時計|clock)/i, 'clock'],
  [/(グランドピアノ|ピアノ|piano)/i, 'piano'],
  [/(暖炉|fireplace)/i, 'fireplace'],
  [/(エアコン|クーラー|空調|aircon)/i, 'aircon'],
  [/(カウンター|counter)/i, 'counter'],
  [/(座布団|クッション|cushion)/i, 'cushion'],
];

export const FURNITURE_NAMES = {
  bed: 'ベッド', sofa: 'ソファ', table: 'テーブル', desk: 'デスク', chair: '椅子',
  stool: 'スツール', bench: 'ベンチ', shelf: '本棚', lamp: 'ランプ', tv: 'テレビ',
  rug: 'ラグ', plant: '観葉植物', wardrobe: 'クローゼット', kitchen: 'キッチン',
  fridge: '冷蔵庫', washer: '洗濯機', toilet: 'トイレ', bathtub: '浴槽', sink: '洗面台',
  mirror: '鏡', clock: '時計', piano: 'ピアノ', fireplace: '暖炉', aircon: 'エアコン',
  counter: 'カウンター', cushion: 'クッション', kotatsu: 'こたつ',
};

function toHalfWidth(s) {
  return s.replace(/[０-９ｘＸ]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0));
}

// 「三階」「四つ」のようなかな数字を算用数字に(1〜99)
const KANJI_DIGIT = { 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9 };
function kanjiNumbersToDigits(s) {
  return s.replace(/([一二三四五六七八九]?)(十?)([一二三四五六七八九]?)(?=階|つ|個|脚|台|本|人|畳|部屋)/g,
    (m, tens, ju, ones) => {
      if (!tens && !ju && !ones) return m;
      let n = 0;
      if (ju) n = (tens ? KANJI_DIGIT[tens] : 1) * 10 + (ones ? KANJI_DIGIT[ones] : 0);
      else n = KANJI_DIGIT[tens || ones] || 0;
      return n > 0 ? String(n) : m;
    });
}

function pickColor(text) {
  for (const [re, hex] of COLOR_WORDS) if (re.test(text)) return hex;
  return null;
}

/** 文をアイテム単位のセグメントに分割(「赤いソファと青い椅子2脚」→2セグメント) */
function splitSegments(text) {
  return text
    .split(/[、。・,，．.\n/]+/)
    .flatMap(s => s.split(/(?<=[ぁ-んァ-ヶー一-龠a-zA-Z])と(?=[ぁ-んァ-ヶー一-龠a-zA-Z])/))
    .map(s => s.trim())
    .filter(Boolean);
}

/** セグメント列から家具アイテム(型・個数・色・座数)を抽出 */
function parseFurnitureItems(text) {
  const items = [];
  for (const seg of splitSegments(text)) {
    const color = pickColor(seg);
    const seatsM = seg.match(/(\d+)\s*人掛け?/);
    const seats = seatsM ? Math.min(6, Math.max(1, parseInt(seatsM[1], 10))) : null;
    // 「椅子4脚」「4つの椅子」「チェア×2」
    const countM = seg.match(/(?:[x×]\s*(\d+))|(?:(\d+)\s*(?:つ|個|脚|台|本|点|枚|人分|セット))/);
    const count = countM ? Math.min(12, Math.max(1, parseInt(countM[1] || countM[2], 10))) : 1;

    const found = [];
    for (const [re, type] of FURNITURE_WORDS) {
      if (re.test(seg) && !found.includes(type)) found.push(type);
    }
    for (const type of found) {
      const prev = items.find(i => i.type === type);
      if (prev) {
        prev.count = Math.max(prev.count, count);
        if (color != null && prev.color == null) prev.color = color;
      } else {
        items.push({ type, count: found.length === 1 ? count : 1, color, seats: type === 'sofa' || type === 'bench' ? seats : null });
      }
    }
  }
  return items;
}

// ---- 部屋の種類 → 既定の家具セット ----
const ROOM_KINDS = [
  [/寝室|ベッドルーム/i, 'bedroom'],
  [/書斎|勉強部屋|仕事部屋|ワークスペース/i, 'study'],
  [/ダイニング|食堂/i, 'dining'],
  [/(?:^|[^ー])キッチン|台所/i, 'kitchen'],
  [/和室|畳の部屋|茶室/i, 'washitsu'],
  [/子供部屋|こども部屋|キッズルーム/i, 'kids'],
  [/バスルーム|浴室|風呂場/i, 'bathroom'],
  [/トイレ|お手洗い|化粧室/i, 'restroom'],
  [/オフィス|事務所|会議室/i, 'officeRoom'],
  [/リビング|居間|LDK|ワンルーム/i, 'living'],
];

const ROOM_DEFAULT_ITEMS = {
  living:    [['sofa', 1], ['table', 1], ['tv', 1], ['shelf', 1], ['rug', 1], ['lamp', 1], ['plant', 1]],
  bedroom:   [['bed', 1], ['wardrobe', 1], ['lamp', 1], ['rug', 1], ['mirror', 1], ['plant', 1]],
  study:     [['desk', 1], ['chair', 1], ['shelf', 2], ['lamp', 1], ['rug', 1]],
  dining:    [['table', 1], ['chair', 4], ['shelf', 1], ['lamp', 1], ['plant', 1]],
  kitchen:   [['kitchen', 1], ['fridge', 1], ['counter', 1], ['table', 1], ['chair', 2]],
  washitsu:  [['kotatsu', 1], ['cushion', 4], ['shelf', 1], ['plant', 1]],
  kids:      [['bed', 1], ['desk', 1], ['chair', 1], ['shelf', 1], ['rug', 1], ['clock', 1]],
  bathroom:  [['bathtub', 1], ['sink', 1], ['mirror', 1], ['washer', 1]],
  restroom:  [['toilet', 1], ['sink', 1], ['mirror', 1]],
  officeRoom:[['desk', 2], ['chair', 2], ['shelf', 1], ['clock', 1], ['plant', 1]],
};

// ---- 建物の種類 ----
const BUILDING_TYPES = [
  [/コンビニ/i, 'conbini'],
  [/学校|小学校|中学校|高校|校舎/i, 'school'],
  [/病院|クリニック|医院/i, 'hospital'],
  [/ホテル|旅館/i, 'hotel'],
  [/教会|チャペル|聖堂|church/i, 'church'],
  [/城|キャッスル|宮殿|castle/i, 'castle'],
  [/倉庫|warehouse/i, 'warehouse'],
  [/工場|factory/i, 'factory'],
  [/神社|寺院|寺|temple|shrine/i, 'temple'],
  [/マンション|アパート|団地|集合住宅/i, 'apartment'],
  [/タワー|高層ビル|超高層|摩天楼|tower/i, 'tower'],
  [/オフィス|ビル|会社|庁舎|office/i, 'office'],
  [/店|ショップ|カフェ|レストラン|ベーカリー|パン屋|本屋|喫茶|バー|食堂|shop|cafe/i, 'shop'],
  [/小屋|ロッジ|山荘|コテージ|cabin/i, 'cabin'],
];

const BUILDING_DEFAULTS = {
  //          floors, W, D
  house:     [2, 9, 8],
  cabin:     [1, 6, 5],
  shop:      [2, 10, 8],
  apartment: [5, 16, 10],
  office:    [8, 14, 12],
  tower:     [20, 18, 18],
  school:    [3, 26, 10],
  hospital:  [5, 20, 12],
  hotel:     [8, 18, 12],
  church:    [1, 8, 14],
  castle:    [3, 14, 12],
  warehouse: [1, 14, 20],
  factory:   [1, 16, 22],
  temple:    [1, 10, 8],
  conbini:   [1, 12, 8],
};

export function parsePrompt(rawText, forcedMode = 'auto') {
  const text = kanjiNumbersToDigits(toHalfWidth(rawText || '').trim());

  const furnitureItems = parseFurnitureItems(text);

  let roomKind = null;
  for (const [re, kind] of ROOM_KINDS) if (re.test(text)) { roomKind = kind; break; }
  const roomHit = roomKind != null || /部屋|内装|インテリア|室内|間取り/i.test(text);
  const buildingHit = /建|ビル|マンション|アパート|家(?!具)|住宅|一軒家|タワー|店|ショップ|カフェ|レストラン|外観|オフィス|会社|教会|城|小屋|階|学校|病院|ホテル|倉庫|工場|神社|寺|コンビニ/i.test(text);

  let mode = forcedMode;
  if (mode === 'auto') {
    if (buildingHit && !roomHit) mode = 'building';
    else if (roomHit) mode = 'room';
    else if (furnitureItems.length >= 4) mode = 'room';   // 家具が多ければ部屋として構成
    else if (furnitureItems.length > 0) mode = 'furniture';
    else mode = 'building';
  }

  const color = pickColor(text);

  // ---- 建物 ----
  let type = 'house';
  for (const [re, t] of BUILDING_TYPES) if (re.test(text)) { type = t; break; }

  const [defFloors, baseW, baseD] = BUILDING_DEFAULTS[type];
  const fm = text.match(/(\d+)\s*階/);
  let floors = fm ? Math.min(60, Math.max(1, parseInt(fm[1], 10))) : defFloors;
  if (/平屋/.test(text)) floors = 1;

  let roof =
    ['house', 'cabin', 'shop', 'church', 'temple', 'warehouse'].includes(type) ? 'gable' : 'flat';
  if (/三角屋根|切妻|とんが|尖った屋根/i.test(text)) roof = 'gable';
  if (/寄棟|よせむね/i.test(text)) roof = 'hip';
  if (/片流れ/i.test(text)) roof = 'shed';
  if (/ドーム|丸屋根|丸い屋根/i.test(text)) roof = 'dome';
  if (/平ら|陸屋根|フラット|屋上/i.test(text)) roof = 'flat';
  if (type === 'temple') roof = 'hip';

  let style = null; // null = タイプごとの既定
  if (/レンガ|煉瓦|ブリック|brick/i.test(text)) style = 'brick';
  else if (/石造り?|石壁|ストーン|stone/i.test(text)) style = 'stone';
  else if (/タイル張り|タイルの|tile/i.test(text)) style = 'tile';
  else if (/トタン|金属|鋼板|metal/i.test(text)) style = 'metal';
  else if (/木造|ログ|木の|木製|wood/i.test(text)) style = 'wood';
  else if (/コンクリ|打ちっぱなし|concrete/i.test(text)) style = 'concrete';
  else if (/ガラス張り|ガラスの|glass/i.test(text)) style = 'glass';
  else if (/モダン|modern/i.test(text)) style = 'modern';
  else if (/和風|和式|日本家屋|純和風/i.test(text)) style = 'japanese';

  const balcony = /ベランダ|バルコニー|balcony/i.test(text) || ['apartment', 'hotel'].includes(type);
  const garage = /ガレージ|車庫/i.test(text);
  const fence = /(?:^|[^防])塀|フェンス|柵/i.test(text);
  const garden = /(?<!家)庭|ガーデン|花壇/.test(text);
  const pool = /プール/i.test(text);

  const wide = /広い|大きな|大きい|ワイド|巨大/i.test(text);
  const slim = /細長い|狭い|小さな|小さい|コンパクト/i.test(text);
  const scaleW = wide ? 1.3 : slim ? 0.8 : 1;
  const scaleD = wide ? 1.2 : slim ? 0.85 : 1;

  // ---- 部屋 ----
  let floorStyle = 'wood';
  if (/カーペット|絨毯/i.test(text)) floorStyle = 'carpet';
  if (/畳|和室/i.test(text)) floorStyle = 'tatami';
  if (/タイルの床|大理石/i.test(text)) floorStyle = 'tile';
  if (roomKind === 'washitsu') floorStyle = 'tatami';
  if (roomKind === 'bathroom' || roomKind === 'restroom') floorStyle = 'tile';

  let wallStyle = 'wallpaper';
  if (/コンクリ|打ちっぱなし/i.test(text)) wallStyle = 'concrete';
  if (/木の壁|板張り|ログハウス風/i.test(text)) wallStyle = 'wood';
  if (/タイルの壁/i.test(text)) wallStyle = 'tile';
  if (roomKind === 'bathroom' || roomKind === 'restroom') wallStyle = 'tile';
  if (roomKind === 'washitsu') wallStyle = 'washi';

  // 広さ: 「8畳」等
  let rw = wide ? 8.5 : slim ? 5 : 6.5;
  let rd = wide ? 7 : slim ? 4.2 : 5.5;
  const jm = text.match(/(\d+(?:\.\d+)?)\s*畳/);
  if (jm) {
    const area = parseFloat(jm[1]) * 1.62;
    rw = Math.sqrt(area * 1.3);
    rd = area / rw;
  }
  if (roomKind === 'restroom') { rw = Math.min(rw, 2.2); rd = Math.min(rd, 2.6); }
  if (roomKind === 'bathroom') { rw = Math.min(rw, 3.4); rd = Math.min(rd, 3.2); }

  const kind = roomKind || 'living';
  const roomItems = furnitureItems.length > 0
    ? furnitureItems
    : ROOM_DEFAULT_ITEMS[kind].map(([t, c]) => ({ type: t, count: c, color: null, seats: null }));

  return {
    mode, color, text,
    hasTextFurniture: furnitureItems.length > 0,
    hasBuildingHint: buildingHit,
    building: {
      type, floors, roof, style, balcony, garage, fence, garden, pool,
      width: baseW * scaleW,
      depth: baseD * scaleD,
    },
    room: {
      width: rw, depth: rd, height: roomKind === 'washitsu' ? 2.5 : 2.7,
      kind, floorStyle, wallStyle,
      items: roomItems,
    },
    furniture: furnitureItems.length > 0
      ? furnitureItems
      : [{ type: 'sofa', count: 1, color: null, seats: null }],
  };
}

export const BUILDING_NAMES = {
  house: '一軒家', cabin: '小屋', shop: '店舗', apartment: 'マンション', office: 'オフィスビル',
  tower: 'タワー', school: '学校', hospital: '病院', hotel: 'ホテル', church: '教会',
  castle: '城', warehouse: '倉庫', factory: '工場', temple: '和風建築', conbini: 'コンビニ',
};

const ROOF_NAMES = { gable: '三角屋根', flat: '陸屋根', hip: '寄棟屋根', shed: '片流れ屋根', dome: 'ドーム屋根' };

const ROOM_KIND_NAMES = {
  living: 'リビング', bedroom: '寝室', study: '書斎', dining: 'ダイニング', kitchen: 'キッチン',
  washitsu: '和室', kids: '子供部屋', bathroom: 'バスルーム', restroom: 'トイレ', officeRoom: 'オフィス',
};

function itemLabel(i) {
  const name = FURNITURE_NAMES[i.type] || i.type;
  return i.count > 1 ? `${name}×${i.count}` : name;
}

/** 生成内容の説明文(HUD表示用) */
export function describeSpec(spec) {
  if (spec.mode === 'building') {
    const t = BUILDING_NAMES[spec.building.type] || spec.building.type;
    return `${spec.building.floors}階建ての${t}(${ROOF_NAMES[spec.building.roof]})`;
  }
  if (spec.mode === 'room') {
    const kind = ROOM_KIND_NAMES[spec.room.kind] || '部屋';
    return `${kind}の内装(${spec.room.items.map(itemLabel).join('・')})`;
  }
  return `家具セット(${spec.furniture.map(itemLabel).join('・')})`;
}
