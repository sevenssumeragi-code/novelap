// ============================================================
// 住民定義 (設計書a 第1章§1.8【口調正準】/ 第3章§3.4.4)
// speech は機械可読の口調正準。forbiddenTokens は tools/validate.js
// および実行時バリデータでチェックされる。
// ============================================================

export const MAIN_IDS = ['LENNY', 'HYU', 'JIN', 'GERU', 'MUNI', 'NEO'];
export const KEY_IDS = ['BARBER', 'KANE', 'POSTMAN', 'CAFEGIRL', 'DAGASHIYA', 'THIEF', 'CLERK'];
// 恋人になれる主要人物 (ムニは子供なので除外=家族関係)
export const ROMANCEABLE = ['LENNY', 'HYU', 'JIN', 'GERU', 'NEO'];
// ゲイカップルになりうる3人組
export const GAY_TRIO = ['LENNY', 'HYU', 'JIN'];

export const CHARS = {
  // ---------- 主要住民6人 ----------
  LENNY: {
    id: 'LENNY', name: 'レニィ', kind: 'main',
    hair: 0x4a7dff, eye: 0x2f6bff, cloth: 0xbfd8ff, pants: 0x5a6a8a,
    hairStyle: 'fluffy', scale: 0.98,
    wallColor: 0xcfe0f5, floorColor: 0x9fb4d0,
    homeName: 'レニィの家',
    speech: {
      firstPerson: '僕', secondPerson: '大家さん',
      sentenceEndings: ['だよ', 'だね', 'だよぉ'], politeness: 'casual',
      forbiddenTokens: [],
    },
    tasteTags: ['soft', 'blue', 'plants'],
    growthRate: 1.0,
    likesRain: true,
    profile: '青い髪と青い瞳の男子学生。いつも眠そうな半目。喫茶店と屋上が好き。',
  },
  HYU: {
    id: 'HYU', name: 'ヒュウ', kind: 'main',
    hair: 0x3fae6a, eye: 0xd8323c, cloth: 0x2e2e40, pants: 0x1e1e2c,
    hairStyle: 'onefringe', scale: 1.06,
    wallColor: 0xe8e0ee, floorColor: 0x6a5a6e,
    homeName: 'ヒュウの家',
    speech: {
      firstPerson: '私', secondPerson: '大家さん',
      sentenceEndings: ['ですね', 'でしょう?'], politeness: 'formal',
      forbiddenTokens: [],
      addressOverrides: { LENNY: 'レニィ', JIN: 'ジンパチくん' },
    },
    tasteTags: ['elegant', 'mirror', 'rose'],
    growthRate: 1.0,
    profile: '緑髪、赤い瞳。前髪で片目が隠れた長身のナルシスト。身だしなみ完璧。',
  },
  JIN: {
    id: 'JIN', name: 'ジンパチ', kind: 'main',
    hair: 0x8a5a2b, eye: 0x442a10, cloth: 0xd84a2a, pants: 0x3a3a3a,
    hairStyle: 'spiky', scale: 1.1,
    wallColor: 0xf0dcc8, floorColor: 0xa8825a,
    homeName: 'ジンパチの家',
    speech: {
      firstPerson: '俺', secondPerson: '大家',
      sentenceEndings: ['だぜ', 'だろ!'], politeness: 'blunt',
      forbiddenTokens: [],
    },
    tasteTags: ['sturdy', 'training', 'showa', 'plamo'],
    growthRate: 1.0,
    profile: '茶髪ツンツンヘアーの熱血漢。町工場と食堂と銭湯の常連。面倒見は良い。実はプラモデル作りが趣味で、玩具屋に新作が入ると人が変わったようにはしゃぐ。',
  },
  MUNI: {
    id: 'MUNI', name: 'ムニ', kind: 'main',
    hair: 0x6fa8ff, eye: 0x3a6fd8, cloth: 0xffd95a, pants: 0x5a8ad0,
    hairStyle: 'fluffy', scale: 0.6,
    wallColor: 0xfff2c8, floorColor: 0xd8b878,
    homeName: 'ムニの家',
    speech: {
      firstPerson: 'ムニ', secondPerson: 'おおやさん',
      sentenceEndings: ['なの', 'だもん'], politeness: 'child',
      forbiddenTokens: [],
      tic: 'むにゅ〜',            // TIC_MUNYU: 3会話に1回程度(頻度は書き手が制御)
    },
    tasteTags: ['toy', 'colorful', 'soft'],
    growthRate: 1.3,               // S0-S3が速い(人懐こい)
    profile: '5歳の男の子。甘えん坊で寂しがり屋。駄菓子屋と誰かの後ろが定位置。',
  },
  GERU: {
    id: 'GERU', name: 'ゲル', kind: 'main',
    hair: 0x8e5bc0, eye: 0x6a3fa0, cloth: 0x2f5a5a, pants: 0x28283a,
    hairStyle: 'bob', scale: 1.0,
    wallColor: 0xe0d4ee, floorColor: 0x7a6a94,
    homeName: 'ゲルの家',
    speech: {
      firstPerson: '私', secondPerson: 'あんた',
      sentenceEndings: ['だな', 'だ'], politeness: 'blunt',
      forbiddenTokens: ['貴様'],   // 【正準】絶対使用禁止(ネオとの差別化)
    },
    tasteTags: ['book', 'dark', 'quiet'],
    growthRate: 1.0,
    nightOwl: true,
    profile: '紫髪セミロングボブ、切れ長の目。6人で唯一の女性。クールな現実主義者だが実は面倒見が良い。夜型。',
  },
  NEO: {
    id: 'NEO', name: 'ネオ', kind: 'main',
    hair: 0xf0d060, eye: 0xc09a20, cloth: 0xf4f0e4, pants: 0xb89840,
    hairStyle: 'long', scale: 1.08, knight: true,
    wallColor: 0xf4ecd0, floorColor: 0xb09a50,
    homeName: 'ネオの家',
    speech: {
      firstPerson: '私', secondPerson: '貴様',
      sentenceEndings: ['である', 'したまえ'], politeness: 'haughty',
      forbiddenTokens: [],
    },
    tasteTags: ['gold', 'luxury', 'western'],
    growthRate: 0.5,               // 最も落ちにくい。INFO_NEO_PAST_* で鍵解放(第16.4節)
    profile: '金髪ロングに騎士風の装い(この街で明らかに浮いている)。自称魔法剣士。高飛車だが庶民文化に籠絡されつつある。',
  },

  // ---------- 主要NPC ----------
  BARBER: {
    id: 'BARBER', name: '床屋のオヤジ', kind: 'key',
    hair: 0x8a8a92, eye: 0x443a30, cloth: 0xe8e8e8, pants: 0x4a4a52,
    hairStyle: 'bald', scale: 1.05,
    speech: { firstPerson: 'わし', secondPerson: 'あんた', sentenceEndings: ['じゃ', 'のう'], politeness: 'elder', forbiddenTokens: [] },
    tasteTags: [], growthRate: 1.0,
    homeFacility: 'barber',
    profile: 'バーバー飛龍の店主。ネオの金髪を切るのは惜しいと言っている。',
  },
  KANE: {
    id: 'KANE', name: '小暮カネ', kind: 'key',
    hair: 0xd8d8dc, eye: 0x554433, cloth: 0x7a5a6a, pants: 0x4a3a44,
    hairStyle: 'bun', scale: 0.88,
    speech: { firstPerson: 'あたし', secondPerson: 'あんた', sentenceEndings: ['だよ', 'かねぇ'], politeness: 'blunt-elder', forbiddenTokens: [] },
    tasteTags: [], growthRate: 1.0,
    profile: '路地の主のような毒舌ばあさん。主要6人と仲良くなるほど態度が軟化する。ネオと口喧嘩するのが日課。',
  },
  POSTMAN: {
    id: 'POSTMAN', name: '郵便屋サン', kind: 'key',
    hair: 0x3a3a44, eye: 0x333333, cloth: 0x3a6ab0, pants: 0x2a3a55,
    hairStyle: 'cap', scale: 1.0,
    speech: { firstPerson: '自分', secondPerson: 'お客さん', sentenceEndings: ['っす', 'っすよ'], politeness: 'casual', forbiddenTokens: [] },
    tasteTags: [], growthRate: 1.2,
    homeFacility: 'post',
    profile: '九龍郵便局の配達員。タワー中の手紙を配って回る。住民の文通事情に詳しい。',
  },
  CAFEGIRL: {
    id: 'CAFEGIRL', name: 'サチ', kind: 'key', female: true,
    hair: 0x7a4a2a, eye: 0x5a3a1a, cloth: 0xf0d8c0, pants: 0x8a5a4a,
    hairStyle: 'ponytail', scale: 0.98,
    speech: { firstPerson: 'わたし', secondPerson: 'お客さん', sentenceEndings: ['ですよ', 'ね♪'], politeness: 'cheerful', forbiddenTokens: [] },
    tasteTags: [], growthRate: 1.2,
    homeFacility: 'cafe',
    profile: '喫茶クーロンの看板娘。明るくててきぱき。ヒュウの口説き文句を笑顔で受け流す。',
  },
  DAGASHIYA: {
    id: 'DAGASHIYA', name: '駄菓子屋のおばあさん', kind: 'key', female: true,
    hair: 0xe8e8ec, eye: 0x554433, cloth: 0xc85a6a, pants: 0x6a5a4a,
    hairStyle: 'bun', scale: 0.86, apron: true,
    speech: { firstPerson: 'わたし', secondPerson: 'ぼうや', sentenceEndings: ['だよ', 'だねぇ'], politeness: 'warm-elder', forbiddenTokens: [] },
    tasteTags: [], growthRate: 1.1,
    homeFacility: 'dagashi',
    profile: '駄菓子屋ムニ堂の店番のおばあさん。子供に甘く、ムニのよき理解者。10円ゲームの名人。',
  },
  THIEF: {
    id: 'THIEF', name: 'コソ泥', kind: 'key', thief: true,
    hair: 0x2a2a30, eye: 0xd84a4a, cloth: 0x2a2a34, pants: 0x1e1e26,
    hairStyle: 'beanie', scale: 1.0,
    speech: { firstPerson: 'オレ', secondPerson: 'あんた', sentenceEndings: ['だぜ', 'なんだよ'], politeness: 'rough', forbiddenTokens: [] },
    tasteTags: [], growthRate: 0.6,
    homeFacility: 'konbini',
    profile: 'コンビニ九龍に時々現れるコソ泥。憎めない小心者。撃退されるたびに顔なじみになっていく。',
  },
  CLERK: {
    id: 'CLERK', name: 'コンビニ店員リン', kind: 'key',
    hair: 0x3a2a44, eye: 0x5a3a6a, cloth: 0x4a8ac0, pants: 0x2a3a55,
    hairStyle: 'bob', scale: 0.98, apron: true,
    speech: { firstPerson: 'わたし', secondPerson: 'お客様', sentenceEndings: ['です', 'ますよ'], politeness: 'polite', forbiddenTokens: [] },
    tasteTags: [], growthRate: 1.0,
    homeFacility: 'konbini',
    profile: 'コンビニ九龍の夜勤も昼勤もこなす頼れる店員。絆が深まる贈り物を各種取り扱っている。コソ泥には塩対応。',
  },
};

export const ALL_IDS = [...MAIN_IDS, ...KEY_IDS];

// ------------------------------------------------------------
// 親密度ランク (NPC会話設計書 第6.2節)
// ------------------------------------------------------------
export const RANKS = [
  { s: 0, min: 0, label: '他人' },
  { s: 1, min: 10, label: '顔見知り' },
  { s: 2, min: 25, label: '知人' },
  { s: 3, min: 40, label: '友人' },
  { s: 4, min: 60, label: '親しい友人' },
  { s: 5, min: 75, label: '特別な相手' },
  { s: 6, min: 90, label: '唯一無二' },
];
export function rankOf(aff) {
  let r = 0;
  for (const rk of RANKS) if (aff >= rk.min) r = rk.s;
  return r;
}

// 相互親密度: 定義済みペアのみ変動 (第6.4節)。未定義ペアは20固定。
export const PAIRS = [
  // 主要人物どうし (レニィ/ヒュウ/ジンパチは×1.5で上がりやすい)
  { a: 'LENNY', b: 'HYU', init: 30, growth: 1.5 },
  { a: 'LENNY', b: 'JIN', init: 30, growth: 1.5 },
  { a: 'HYU', b: 'JIN', init: 30, growth: 1.5 },
  { a: 'LENNY', b: 'MUNI', init: 45, growth: 1.2 },
  { a: 'GERU', b: 'MUNI', init: 35, growth: 1.0 },
  { a: 'GERU', b: 'NEO', init: 20, growth: 1.0 },
  { a: 'HYU', b: 'NEO', init: 22, growth: 1.0 },
  { a: 'JIN', b: 'NEO', init: 24, growth: 1.0 },
  { a: 'JIN', b: 'MUNI', init: 38, growth: 1.0 },
  { a: 'HYU', b: 'MUNI', init: 32, growth: 1.0 },
  { a: 'LENNY', b: 'GERU', init: 30, growth: 1.0 },
  { a: 'HYU', b: 'GERU', init: 26, growth: 1.0 },
  { a: 'JIN', b: 'GERU', init: 28, growth: 1.0 },
  { a: 'LENNY', b: 'NEO', init: 24, growth: 1.0 },
  { a: 'MUNI', b: 'NEO', init: 30, growth: 1.0 },
  // 主要NPC×主要人物 (カネはじめ、街の人ともっと交流する)
  { a: 'NEO', b: 'KANE', init: 25, growth: 1.0 },   // 口喧嘩の様式美
  { a: 'KANE', b: 'MUNI', init: 40, growth: 1.0 },
  { a: 'KANE', b: 'LENNY', init: 35, growth: 1.0 },
  { a: 'KANE', b: 'JIN', init: 30, growth: 1.0 },
  { a: 'KANE', b: 'HYU', init: 26, growth: 1.0 },
  { a: 'KANE', b: 'GERU', init: 34, growth: 1.0 },
  { a: 'NEO', b: 'BARBER', init: 55, growth: 1.0 },
  { a: 'BARBER', b: 'JIN', init: 40, growth: 1.0 },
  { a: 'BARBER', b: 'HYU', init: 42, growth: 1.0 },
  { a: 'POSTMAN', b: 'LENNY', init: 36, growth: 1.0 },
  { a: 'POSTMAN', b: 'MUNI', init: 38, growth: 1.0 },
  { a: 'CAFEGIRL', b: 'HYU', init: 35, growth: 1.0 },   // ヒュウの口説き相手
  { a: 'CAFEGIRL', b: 'LENNY', init: 40, growth: 1.0 },
  { a: 'CAFEGIRL', b: 'GERU', init: 34, growth: 1.0 },
  // 駄菓子屋のおばあさん
  { a: 'DAGASHIYA', b: 'MUNI', init: 55, growth: 1.0 },
  { a: 'DAGASHIYA', b: 'NEO', init: 30, growth: 1.0 },
  { a: 'DAGASHIYA', b: 'JIN', init: 34, growth: 1.0 },
  { a: 'DAGASHIYA', b: 'KANE', init: 50, growth: 1.0 },
  // コンビニ店員
  { a: 'CLERK', b: 'LENNY', init: 34, growth: 1.0 },
  { a: 'CLERK', b: 'GERU', init: 32, growth: 1.0 },
  { a: 'CLERK', b: 'NEO', init: 28, growth: 1.0 },
];
export function pairKey(a, b) { return [a, b].sort().join('-'); }

// 日次上限 (第6.6節): 会話による対PC親密度は 1NPCあたり +3/日
export const DAILY_AFF_CAP = 3;
