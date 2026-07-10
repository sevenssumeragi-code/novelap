// ============================================================
// 施設定義 (設計書a 第1章§1.7 / 第3章§3.4.3)
// openHours はゲーム分 [開店, 閉店]。閉店中は入れるが店主バークのみ。
// cost は増築に必要な圓。initial=true は初期タワーに存在。
// ============================================================

export const FACILITIES = {
  post:     { id: 'post',     name: '九龍郵便局',     sign: '郵便',   neon: 0xff4d4d, type: 'post',     initial: true,  cost: 0,   openHours: [[540, 1080]] },
  barber:   { id: 'barber',   name: 'バーバー飛龍',   sign: '床屋',   neon: 0x4dd0ff, type: 'barber',   initial: true,  cost: 0,   openHours: [[600, 1140]] },
  cafe:     { id: 'cafe',     name: '喫茶クーロン',   sign: '喫茶',   neon: 0xffb84d, type: 'cafe',     initial: true,  cost: 0,   openHours: [[480, 1200]] },
  market:   { id: 'market',   name: '九龍マート',     sign: '超市',   neon: 0x5aff7a, type: 'market',   initial: true,  cost: 0,   openHours: [[540, 1260]] },
  ramen:    { id: 'ramen',    name: 'ラーメン龍軒',   sign: '拉麺',   neon: 0xff6a3a, type: 'ramen',    cost: 350, openHours: [[660, 900], [1080, 1440]] },
  game:     { id: 'game',     name: 'ゲーセン九龍',   sign: '遊戯',   neon: 0xd05aff, type: 'game',     cost: 400, openHours: [[600, 1440]] },
  sento:    { id: 'sento',    name: '銭湯 龍の湯',    sign: '湯',     neon: 0x6ab8ff, type: 'sento',    cost: 450, openHours: [[900, 1440]] },
  book:     { id: 'book',     name: '九龍書店',       sign: '書店',   neon: 0x7affd0, type: 'book',     cost: 300, openHours: [[600, 1200]] },
  dagashi:  { id: 'dagashi',  name: '駄菓子屋ムニ堂', sign: '駄菓子', neon: 0xffe45a, type: 'dagashi',  cost: 250, openHours: [[600, 1080]] },
  flower:   { id: 'flower',   name: '花屋ロゼ',       sign: '花',     neon: 0xff7ab8, type: 'flower',   cost: 300, openHours: [[540, 1080]] },
  karaoke:  { id: 'karaoke',  name: 'カラオケ龍宮',   sign: '歌',     neon: 0xff5ad0, type: 'karaoke',  cost: 400, openHours: [[720, 1440]] },
  pharmacy: { id: 'pharmacy', name: '九龍薬局',       sign: '薬',     neon: 0x5affb8, type: 'pharmacy', cost: 300, openHours: [[540, 1140]] },
  izakaya:  { id: 'izakaya',  name: '居酒屋 月虎',    sign: '酒',     neon: 0xffa53a, type: 'izakaya',  cost: 500, openHours: [[1080, 1440]], noKids: true },
};

export const INITIAL_TOWER = [
  { kind: 'shop', id: 'market' },
  { kind: 'shop', id: 'cafe' },
  { kind: 'shop', id: 'barber' },
  { kind: 'shop', id: 'post' },
  { kind: 'home', id: 'LENNY' },
  { kind: 'home', id: 'JIN' },
  { kind: 'home', id: 'HYU' },
  { kind: 'home', id: 'MUNI' },
  { kind: 'home', id: 'GERU' },
  { kind: 'home', id: 'NEO' },
];

// 特殊ロケーション: 屋上 / 路地(地上)
export const SPECIAL_LOCS = ['ROOF', 'GROUND'];
export const LOC_LABEL = { ROOF: '屋上', GROUND: '路地' };

export function isFacilityOpen(fdef, minute) {
  if (!fdef.openHours) return true;
  return fdef.openHours.some(([a, b]) => minute >= a && minute < b);
}

// ------------------------------------------------------------
// 経済 (設計書a 第1章§1.10)
// 通貨2種: 城内コイン(収集・ガチャ) / 圓(家賃収入・建設)
// ------------------------------------------------------------
export const ECON = {
  rentPerHomePerDay: 12,        // 6人の家賃 → 72圓/日
  shopTributePerDay: 8,         // 商業施設1軒あたり上納金
  minIncomePerDay: 30,          // 詰み防止の最低保証
  coinBase: 3,                  // 隠しコインの基礎枚数
  coinPerShop: 1.5,             // 商業施設1軒ごとの追加枚数
};

// 1日に隠されるコイン総数: 施設が増えるほど増える (要望)
// 初期4店 → 3 + 4×1.5 = 9枚、店が増えるたび +1〜2枚
export function coinsForDay(shopCount) {
  return Math.round(ECON.coinBase + shopCount * ECON.coinPerShop);
}
