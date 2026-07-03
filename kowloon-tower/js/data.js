// ============================================================
// データ定義: キャラクター / 施設 / 家具 / ガチャ / セリフ
// ============================================================

export const CHARACTERS = {
  lenny: {
    id: 'lenny', name: 'レニィ',
    hair: 0x4a7dff, eye: 0x2f6bff, cloth: 0xbfd8ff, pants: 0x5a6a8a,
    hairStyle: 'fluffy', scale: 1.0,
    wallColor: 0xcfe0f5, floorColor: 0x9fb4d0,
    homeName: 'レニィの家',
    lines: [
      'ふわぁ…僕、いま起きたとこだよ',
      'ここのベッド、雲みたいでよく眠れるんだよぉ…',
      'ジンパチ、朝からずっと階段を走ってたよ。元気だね',
      'ヒュウはまた鏡を見てたよ。あきないのかなぁ',
      'コイン?どこかのお店でキラッて光ってたよ',
      'むにゃ…あと五分だけ…',
      '屋上から見る夜景、きれいだよぉ…',
      'ムニがね、僕のベッドで一緒にお昼寝したんだよ',
    ],
  },
  hyu: {
    id: 'hyu', name: 'ヒュウ',
    hair: 0x3fae6a, eye: 0xd8323c, cloth: 0x2e2e40, pants: 0x1e1e2c,
    hairStyle: 'onefringe', scale: 1.05,
    wallColor: 0xe8e0ee, floorColor: 0x6a5a6e,
    homeName: 'ヒュウの家',
    lines: [
      'ようこそ。私の美しい部屋へ',
      'この鏡は、私を映すために存在すると言っても過言ではありませんね',
      'レニィはまた寝ていましたよ。まったく、可愛らしいものです',
      'ジンパチくんは、もう少し優雅さを学ぶべきですね',
      'ふふ、今日も完璧な前髪です',
      'ガチャですか?私ほどの当たりは出ないでしょうけれど',
      '薔薇の手入れは欠かせません。美は日々の積み重ねですから',
    ],
  },
  jinpachi: {
    id: 'jinpachi', name: 'ジンパチ',
    hair: 0x8a5a2b, eye: 0x442a10, cloth: 0xd84a2a, pants: 0x3a3a3a,
    hairStyle: 'spiky', scale: 1.08,
    wallColor: 0xf0dcc8, floorColor: 0xa8825a,
    homeName: 'ジンパチの家',
    lines: [
      'おう!よく来たな!',
      '俺のサンドバッグに触っていいのは俺だけだぜ!',
      'この塔のてっぺんまで階段ダッシュ100本!燃えてきたぜ!',
      'レニィのやつ、また寝てやがるのか?しょうがねえなあ!',
      'ヒュウの気取った顔を見てると体がうずうずするぜ!',
      'コイン集めなら俺に任せろ!…どこにあるかは知らねえけどな!',
      'メシは喫茶店のナポリタンに限るな!',
    ],
  },
  muni: {
    id: 'muni', name: 'ムニ',
    hair: 0x6fa8ff, eye: 0x3a6fd8, cloth: 0xffd95a, pants: 0x5a8ad0,
    hairStyle: 'fluffy', scale: 0.62,
    wallColor: 0xfff2c8, floorColor: 0xd8b878,
    homeName: 'ムニの家',
    lines: [
      'あ!きてくれた!ムニ、さみしかったの…',
      'ねえねえ、いっしょにあそぼ?',
      'レニィおにいちゃんのおへや、ふわふわなんだよ!',
      'つみき、いっしょにつんでくれる?',
      'よるはちょっとこわいから、でんきつけててね',
      'ガチャガチャ、ムニもまわしたい!',
      'おかしやさん、できたらいいなぁ…',
    ],
  },
  gel: {
    id: 'gel', name: 'ゲル',
    hair: 0x8e5bc0, eye: 0x6a3fa0, cloth: 0x2f5a5a, pants: 0x28283a,
    hairStyle: 'bob', scale: 1.0,
    wallColor: 0xe0d4ee, floorColor: 0x7a6a94,
    homeName: 'ゲルの家',
    lines: [
      '私の部屋に何か用か。…まあ、座っていくといい',
      'この塔は騒がしいが、悪くない眺めだ',
      '本を読む時間だけは邪魔されたくないな',
      'ネオの声は三階下まで響くんだ。困ったものだな',
      'ムニが遊びに来ると、つい甘やかしてしまうんだ',
      'コインなら、店の物陰で光っているのを見たことがあるな',
      'チェスの相手が欲しいところだ。おまえ、指せるのか?',
    ],
  },
  neo: {
    id: 'neo', name: 'ネオ',
    hair: 0xf0d060, eye: 0xc09a20, cloth: 0xf4f0e4, pants: 0xb89840,
    hairStyle: 'long', scale: 1.06,
    wallColor: 0xf4ecd0, floorColor: 0xb09a50,
    homeName: 'ネオの家',
    lines: [
      'ふん、貴様か。私の部屋に入ることを許可しよう',
      'この玉座こそ、私にふさわしい',
      '最上階は当然この私のものだ。異論は認めん',
      '貴様、ガチャとやらで私の部屋に飾る品を探してくるのだ',
      'ジンパチは騒がしすぎる。だが、あの熱意だけは認めてやろう',
      'シャンデリアの輝きが足りんな。磨いておくのだ',
      'ふっ…夜景と私、どちらが美しいかだと?愚問だな',
    ],
  },
};

export const CHAR_ORDER = ['lenny', 'hyu', 'jinpachi', 'muni', 'gel', 'neo'];

// ------------------------------------------------------------
// 商業施設
// type: interior/facade 生成のキー
// ------------------------------------------------------------
export const FACILITIES = {
  post:     { id: 'post',     name: '九龍郵便局',       sign: '郵便',   neon: 0xff4d4d, type: 'post',     initial: true },
  barber:   { id: 'barber',   name: 'バーバー飛龍',     sign: '床屋',   neon: 0x4dd0ff, type: 'barber',   initial: true },
  cafe:     { id: 'cafe',     name: '喫茶クーロン',     sign: '喫茶',   neon: 0xffb84d, type: 'cafe',     initial: true },
  market:   { id: 'market',   name: '九龍マート',       sign: '超市',   neon: 0x5aff7a, type: 'market',   initial: true },
  ramen:    { id: 'ramen',    name: 'ラーメン龍軒',     sign: '拉麺',   neon: 0xff6a3a, type: 'ramen' },
  game:     { id: 'game',     name: 'ゲーセン九龍',     sign: '遊戯',   neon: 0xd05aff, type: 'game' },
  sento:    { id: 'sento',    name: '銭湯 龍の湯',      sign: '湯',     neon: 0x6ab8ff, type: 'sento' },
  book:     { id: 'book',     name: '九龍書店',         sign: '書店',   neon: 0x7affd0, type: 'book' },
  dagashi:  { id: 'dagashi',  name: '駄菓子屋ムニ堂',   sign: '駄菓子', neon: 0xffe45a, type: 'dagashi' },
  flower:   { id: 'flower',   name: '花屋ロゼ',         sign: '花',     neon: 0xff7ab8, type: 'flower' },
  karaoke:  { id: 'karaoke',  name: 'カラオケ龍宮',     sign: '歌',     neon: 0xff5ad0, type: 'karaoke' },
  pharmacy: { id: 'pharmacy', name: '九龍薬局',         sign: '薬',     neon: 0x5affb8, type: 'pharmacy' },
};

export const INITIAL_TOWER = [
  { kind: 'shop', id: 'market' },
  { kind: 'shop', id: 'cafe' },
  { kind: 'shop', id: 'barber' },
  { kind: 'shop', id: 'post' },
  { kind: 'home', id: 'lenny' },
  { kind: 'home', id: 'jinpachi' },
  { kind: 'home', id: 'hyu' },
  { kind: 'home', id: 'muni' },
  { kind: 'home', id: 'gel' },
  { kind: 'home', id: 'neo' },
];

// ------------------------------------------------------------
// 家具カタログ
// char: null=汎用 / キャラid=そのキャラのイメージ家具
// size: [幅, 奥行] 配置時の目安(当たり判定は簡易)
// ------------------------------------------------------------
export const FURNITURE = {
  // --- 汎用 ---
  table_wood:  { id: 'table_wood',  name: '木のテーブル',     char: null, rarity: 1, size: [1.6, 1.0] },
  chair_wood:  { id: 'chair_wood',  name: '木の椅子',         char: null, rarity: 1, size: [0.6, 0.6] },
  plant_pot:   { id: 'plant_pot',   name: '観葉植物',         char: null, rarity: 1, size: [0.6, 0.6] },
  rug_round:   { id: 'rug_round',   name: '丸いラグ',         char: null, rarity: 1, size: [1.8, 1.8] },
  lamp_floor:  { id: 'lamp_floor',  name: 'フロアランプ',     char: null, rarity: 1, size: [0.5, 0.5] },
  tv_stand:    { id: 'tv_stand',    name: 'テレビ台',         char: null, rarity: 1, size: [1.6, 0.6] },
  shelf_small: { id: 'shelf_small', name: '小さな棚',         char: null, rarity: 1, size: [1.0, 0.5] },

  // --- レニィ ---
  lenny_cloudbed: { id: 'lenny_cloudbed', name: '雲のベッド',           char: 'lenny', rarity: 2, size: [2.2, 1.4] },
  lenny_starlamp: { id: 'lenny_starlamp', name: '星のランプ',           char: 'lenny', rarity: 2, size: [0.5, 0.5] },
  lenny_sheep:    { id: 'lenny_sheep',    name: 'ひつじクッション',     char: 'lenny', rarity: 2, size: [0.8, 0.6] },
  lenny_beanbag:  { id: 'lenny_beanbag',  name: '青いビーズクッション', char: 'lenny', rarity: 2, size: [1.0, 1.0] },

  // --- ヒュウ ---
  hyu_mirror:  { id: 'hyu_mirror',  name: '黄金の姿見',         char: 'hyu', rarity: 2, size: [0.9, 0.4] },
  hyu_rose:    { id: 'hyu_rose',    name: '薔薇の花瓶',         char: 'hyu', rarity: 2, size: [0.5, 0.5] },
  hyu_sofa:    { id: 'hyu_sofa',    name: 'ワインレッドのソファ', char: 'hyu', rarity: 2, size: [2.0, 0.9] },
  hyu_dresser: { id: 'hyu_dresser', name: 'ドレッサー',         char: 'hyu', rarity: 2, size: [1.2, 0.6] },

  // --- ジンパチ ---
  jin_sandbag:  { id: 'jin_sandbag',  name: 'サンドバッグ',   char: 'jinpachi', rarity: 2, size: [0.8, 0.8] },
  jin_dumbbell: { id: 'jin_dumbbell', name: 'ダンベルラック', char: 'jinpachi', rarity: 2, size: [1.4, 0.6] },
  jin_tatami:   { id: 'jin_tatami',   name: '畳マット',       char: 'jinpachi', rarity: 2, size: [1.8, 1.8] },
  jin_trophy:   { id: 'jin_trophy',   name: 'トロフィー棚',   char: 'jinpachi', rarity: 2, size: [1.2, 0.5] },

  // --- ムニ ---
  muni_toybox:  { id: 'muni_toybox',  name: 'おもちゃ箱',       char: 'muni', rarity: 2, size: [1.0, 0.7] },
  muni_blocks:  { id: 'muni_blocks',  name: 'つみき',           char: 'muni', rarity: 2, size: [0.8, 0.8] },
  muni_bear:    { id: 'muni_bear',    name: 'くまのぬいぐるみ', char: 'muni', rarity: 2, size: [0.7, 0.6] },
  muni_crayon:  { id: 'muni_crayon',  name: 'お絵かきテーブル', char: 'muni', rarity: 2, size: [1.2, 0.9] },

  // --- ゲル ---
  gel_desk:     { id: 'gel_desk',     name: '紫のワークデスク', char: 'gel', rarity: 2, size: [1.8, 0.8] },
  gel_bookwall: { id: 'gel_bookwall', name: '大きな本棚',       char: 'gel', rarity: 2, size: [1.8, 0.5] },
  gel_chess:    { id: 'gel_chess',    name: 'チェステーブル',   char: 'gel', rarity: 2, size: [0.9, 0.9] },
  gel_aroma:    { id: 'gel_aroma',    name: 'アロマスタンド',   char: 'gel', rarity: 2, size: [0.4, 0.4] },

  // --- ネオ ---
  neo_throne:     { id: 'neo_throne',     name: '黄金の玉座',   char: 'neo', rarity: 3, size: [1.3, 1.1] },
  neo_candelabra: { id: 'neo_candelabra', name: '黄金の燭台',   char: 'neo', rarity: 2, size: [0.6, 0.6] },
  neo_pillar:     { id: 'neo_pillar',     name: '大理石の柱',   char: 'neo', rarity: 2, size: [0.8, 0.8] },
  neo_carpet:     { id: 'neo_carpet',     name: '赤い絨毯',     char: 'neo', rarity: 2, size: [2.6, 1.6] },
  neo_portrait:   { id: 'neo_portrait',   name: '自分の肖像画', char: 'neo', rarity: 2, size: [0.9, 0.5] },
};

// 各キャラの初期配置家具 [itemId, x, z, rotY(90度単位)]
export const DEFAULT_HOME_LAYOUT = {
  lenny:    [['lenny_cloudbed', -3.2, -2.2, 0], ['lenny_starlamp', -1.4, -3.2, 0], ['lenny_sheep', 2.6, -1.0, 1]],
  hyu:      [['hyu_mirror', -3.4, -3.0, 0], ['hyu_sofa', 1.8, -2.6, 0], ['hyu_rose', -1.2, -3.4, 0]],
  jinpachi: [['jin_sandbag', -3.0, -1.6, 0], ['jin_tatami', 1.6, -1.2, 0], ['jin_dumbbell', 3.2, -3.2, 0]],
  muni:     [['muni_toybox', -3.2, -3.0, 0], ['muni_bear', 2.8, -2.4, 2], ['muni_blocks', 0.6, -1.2, 0]],
  gel:      [['gel_bookwall', -2.6, -3.5, 0], ['gel_desk', 2.4, -3.2, 0], ['gel_chess', 0.0, -0.8, 0]],
  neo:      [['neo_carpet', 0, -1.2, 0], ['neo_throne', 0, -2.8, 0], ['neo_candelabra', -2.6, -2.8, 0]],
};

// ------------------------------------------------------------
// ガチャ
// ------------------------------------------------------------
export const GACHA_COST = 5;

// weight付きプール (facilityはかぶるとコイン返金)
export function buildGachaPool() {
  const pool = [];
  for (const f of Object.values(FACILITIES)) {
    if (!f.initial) pool.push({ kind: 'facility', id: f.id, weight: 2 });
  }
  for (const it of Object.values(FURNITURE)) {
    const w = it.rarity >= 3 ? 1 : it.rarity === 2 ? 3 : 6;
    pool.push({ kind: 'furniture', id: it.id, weight: w });
  }
  return pool;
}

export const RARITY_LABEL = { 1: '★', 2: '★★', 3: '★★★' };
export const DUP_REFUND = 3;

// コイン
export const COIN_MAX_ON_TOWER = 6;   // タワー全体の同時存在上限
export const COIN_SPAWN_SEC = 40;     // 出現間隔(秒)
export const COIN_INITIAL = 6;        // 開始時に隠されている枚数
