// ============================================================
// 家具定義 (設計書a 第3章§3.4.2 / 第6章)
// tasteTags: 住民の好み判定に使用。rarity: N/R/SR/UR。
// char: イメージ元キャラ(表示用)。どの家でも配置可。
// ============================================================

export const FURNITURE = {
  // --- 汎用 (N) ---
  table_wood:  { id: 'table_wood',  name: '木のテーブル',     char: null, rarity: 'N', size: [1.6, 1.0], tasteTags: ['showa'] },
  chair_wood:  { id: 'chair_wood',  name: '木の椅子',         char: null, rarity: 'N', size: [0.6, 0.6], tasteTags: ['showa'] },
  plant_pot:   { id: 'plant_pot',   name: '観葉植物',         char: null, rarity: 'N', size: [0.6, 0.6], tasteTags: ['plants'] },
  rug_round:   { id: 'rug_round',   name: '丸いラグ',         char: null, rarity: 'N', size: [1.8, 1.8], tasteTags: ['soft'] },
  lamp_floor:  { id: 'lamp_floor',  name: 'フロアランプ',     char: null, rarity: 'N', size: [0.5, 0.5], tasteTags: ['quiet'] },
  tv_stand:    { id: 'tv_stand',    name: 'テレビ台',         char: null, rarity: 'N', size: [1.6, 0.6], tasteTags: ['showa'] },
  shelf_small: { id: 'shelf_small', name: '小さな棚',         char: null, rarity: 'N', size: [1.0, 0.5], tasteTags: [] },

  // --- レニィ (R) ---
  lenny_cloudbed: { id: 'lenny_cloudbed', name: '雲のベッド',           char: 'LENNY', rarity: 'SR', size: [2.2, 1.4], tasteTags: ['soft', 'blue'] },
  lenny_starlamp: { id: 'lenny_starlamp', name: '星のランプ',           char: 'LENNY', rarity: 'R',  size: [0.5, 0.5], tasteTags: ['soft', 'quiet'] },
  lenny_sheep:    { id: 'lenny_sheep',    name: 'ひつじクッション',     char: 'LENNY', rarity: 'R',  size: [0.8, 0.6], tasteTags: ['soft'] },
  lenny_beanbag:  { id: 'lenny_beanbag',  name: '青いビーズクッション', char: 'LENNY', rarity: 'R',  size: [1.0, 1.0], tasteTags: ['soft', 'blue'] },

  // --- ヒュウ (R) ---
  hyu_mirror:  { id: 'hyu_mirror',  name: '黄金の姿見',           char: 'HYU', rarity: 'SR', size: [0.9, 0.4], tasteTags: ['elegant', 'mirror'] },
  hyu_rose:    { id: 'hyu_rose',    name: '薔薇の花瓶',           char: 'HYU', rarity: 'R',  size: [0.5, 0.5], tasteTags: ['elegant', 'rose'] },
  hyu_sofa:    { id: 'hyu_sofa',    name: 'ワインレッドのソファ', char: 'HYU', rarity: 'R',  size: [2.0, 0.9], tasteTags: ['elegant'] },
  hyu_dresser: { id: 'hyu_dresser', name: 'ドレッサー',           char: 'HYU', rarity: 'R',  size: [1.2, 0.6], tasteTags: ['elegant', 'mirror'] },

  // --- ジンパチ (R) ---
  jin_sandbag:  { id: 'jin_sandbag',  name: 'サンドバッグ',   char: 'JIN', rarity: 'R',  size: [0.8, 0.8], tasteTags: ['training', 'sturdy'] },
  jin_dumbbell: { id: 'jin_dumbbell', name: 'ダンベルラック', char: 'JIN', rarity: 'R',  size: [1.4, 0.6], tasteTags: ['training'] },
  jin_tatami:   { id: 'jin_tatami',   name: '畳マット',       char: 'JIN', rarity: 'R',  size: [1.8, 1.8], tasteTags: ['showa', 'sturdy'] },
  jin_trophy:   { id: 'jin_trophy',   name: 'トロフィー棚',   char: 'JIN', rarity: 'SR', size: [1.2, 0.5], tasteTags: ['training'] },
  jin_plamo:    { id: 'jin_plamo',    name: 'プラモデル展示棚', char: 'JIN', rarity: 'SR', size: [1.4, 0.6], tasteTags: ['plamo', 'showa'] },

  // --- ムニ (R) ---
  muni_toybox:  { id: 'muni_toybox',  name: 'おもちゃ箱',       char: 'MUNI', rarity: 'R',  size: [1.0, 0.7], tasteTags: ['toy', 'colorful'] },
  muni_blocks:  { id: 'muni_blocks',  name: 'つみき',           char: 'MUNI', rarity: 'R',  size: [0.8, 0.8], tasteTags: ['toy', 'colorful'] },
  muni_bear:    { id: 'muni_bear',    name: 'くまのぬいぐるみ', char: 'MUNI', rarity: 'SR', size: [0.7, 0.6], tasteTags: ['toy', 'soft'] },
  muni_crayon:  { id: 'muni_crayon',  name: 'お絵かきテーブル', char: 'MUNI', rarity: 'R',  size: [1.2, 0.9], tasteTags: ['toy', 'colorful'] },

  // --- ゲル (R) ---
  gel_desk:     { id: 'gel_desk',     name: '紫のワークデスク', char: 'GERU', rarity: 'R',  size: [1.8, 0.8], tasteTags: ['book', 'dark'] },
  gel_bookwall: { id: 'gel_bookwall', name: '大きな本棚',       char: 'GERU', rarity: 'SR', size: [1.8, 0.5], tasteTags: ['book', 'quiet'] },
  gel_chess:    { id: 'gel_chess',    name: 'チェステーブル',   char: 'GERU', rarity: 'R',  size: [0.9, 0.9], tasteTags: ['book', 'quiet'] },
  gel_aroma:    { id: 'gel_aroma',    name: 'アロマスタンド',   char: 'GERU', rarity: 'R',  size: [0.4, 0.4], tasteTags: ['quiet', 'dark'] },

  // --- ネオ (R/UR) ---
  neo_throne:     { id: 'neo_throne',     name: '黄金の玉座',   char: 'NEO', rarity: 'UR', size: [1.3, 1.1], tasteTags: ['gold', 'luxury', 'western'] },
  neo_candelabra: { id: 'neo_candelabra', name: '黄金の燭台',   char: 'NEO', rarity: 'R',  size: [0.6, 0.6], tasteTags: ['gold', 'western'] },
  neo_pillar:     { id: 'neo_pillar',     name: '大理石の柱',   char: 'NEO', rarity: 'R',  size: [0.8, 0.8], tasteTags: ['luxury', 'western'] },
  neo_carpet:     { id: 'neo_carpet',     name: '赤い絨毯',     char: 'NEO', rarity: 'R',  size: [2.6, 1.6], tasteTags: ['luxury'] },
  neo_portrait:   { id: 'neo_portrait',   name: '自分の肖像画', char: 'NEO', rarity: 'SR', size: [0.9, 0.5], tasteTags: ['gold', 'luxury'] },
};

// 初期配置 [itemId, x, z, rot]
export const DEFAULT_HOME_LAYOUT = {
  LENNY: [['lenny_cloudbed', -3.2, -2.2, 0], ['lenny_starlamp', -1.4, -3.2, 0], ['lenny_sheep', 2.6, -1.0, 1]],
  HYU:   [['hyu_mirror', -3.4, -3.0, 0], ['hyu_sofa', 1.8, -2.6, 0], ['hyu_rose', -1.2, -3.4, 0]],
  JIN:   [['jin_sandbag', -3.0, -1.6, 0], ['jin_tatami', 1.6, -1.2, 0], ['jin_dumbbell', 3.2, -3.2, 0]],
  MUNI:  [['muni_toybox', -3.2, -3.0, 0], ['muni_bear', 2.8, -2.4, 2], ['muni_blocks', 0.6, -1.2, 0]],
  GERU:  [['gel_bookwall', -2.6, -3.5, 0], ['gel_desk', 2.4, -3.2, 0], ['gel_chess', 0.0, -0.8, 0]],
  NEO:   [['neo_carpet', 0, -1.2, 0], ['neo_throne', 0, -2.8, 0], ['neo_candelabra', -2.6, -2.8, 0]],
};

// ------------------------------------------------------------
// ガチャ (設計書a 第1章§1.9.2: レアリティN/R/SR/UR・天井・重複還元)
// ------------------------------------------------------------
export const GACHA = {
  costCoin: 10,
  pity: { count: 30, rarity: 'UR' },      // 30回で最高レア確定(バランス調整値)
  rarityWeights: { N: 55, R: 30, SR: 12, UR: 3 },
  duplicateRefund: { N: 2, R: 5, SR: 15, UR: 40 },
};
export const RARITY_ORDER = ['N', 'R', 'SR', 'UR'];
export const RARITY_COLOR = { N: '#b8b0a0', R: '#6ab8ff', SR: '#d05aff', UR: '#ffca6a' };

// 施設開業権はSRとして排出(かぶりは圓に変換)
export function buildGachaPool(FACILITIES) {
  const pool = [];
  for (const f of Object.values(FACILITIES)) {
    if (!f.initial) pool.push({ kind: 'facility', id: f.id, rarity: 'SR' });
  }
  for (const it of Object.values(FURNITURE)) {
    pool.push({ kind: 'furniture', id: it.id, rarity: it.rarity });
  }
  return pool;
}
