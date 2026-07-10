// ============================================================
// NPCスケジュール (設計書a 第7章 層1 / NPC会話設計書 第9章)
// blocks: [開始分, 終了分, activity, loc]
//   loc: 'HOME' | 施設id | 'ROOF' | 'GROUND' | 配列(日次シードで抽選)
//   施設が未建設/閉店中は fallback → 'HOME'
// exceptions: 条件DSLで上書き(上から優先)
// ============================================================

export const SCHEDULES = {
  LENNY: {
    blocks: [
      [0, 600, 'SLEEP', 'HOME'],                 // 〜10:00 惰眠
      [600, 720, 'LEISURE', 'cafe'],             // 喫茶店でぼんやり
      [720, 780, 'MEAL', ['cafe', 'ramen']],
      [780, 960, 'NAP', ['HOME', 'ROOF']],       // 昼寝
      [960, 1140, 'LEISURE', ['ROOF', 'flower', 'book']],
      [1140, 1320, 'HOME', 'HOME'],
      [1320, 1440, 'SLEEP', 'HOME'],
    ],
    exceptions: [
      { cond: 'weather == RAIN and time in [DAY, EVENING]', loc: 'HOME', act: 'NAP' }, // 雨は家で雨音を聞く
    ],
  },
  HYU: {
    blocks: [
      [0, 420, 'SLEEP', 'HOME'],
      [420, 600, 'HOME', 'HOME'],                // 朝の身支度(鏡)
      [600, 780, 'LEISURE', 'cafe'],
      [780, 900, 'LEISURE', ['barber', 'flower', 'HOME']],
      [900, 1140, 'LEISURE', ['cafe', 'book', 'HOME']],
      [1140, 1320, 'LEISURE', ['karaoke', 'izakaya', 'HOME']],
      [1320, 1440, 'SLEEP', 'HOME'],
    ],
    exceptions: [],
  },
  JIN: {
    blocks: [
      [0, 360, 'SLEEP', 'HOME'],
      [360, 540, 'TRAINING', ['GROUND', 'ROOF']], // 朝の階段ダッシュ
      [540, 720, 'WANDER', ['market', 'GROUND']],
      [720, 780, 'MEAL', ['ramen', 'cafe']],
      [780, 1080, 'WORK', ['market', 'GROUND']],  // 手伝い仕事
      [1080, 1200, 'LEISURE', ['game', 'GROUND']],
      [1200, 1320, 'LEISURE', ['sento', 'izakaya', 'HOME']],
      [1320, 1440, 'SLEEP', 'HOME'],
    ],
    exceptions: [
      { cond: 'weather == RAIN and time == MORNING', loc: 'HOME', act: 'TRAINING' },  // 雨は室内筋トレ
    ],
  },
  MUNI: {
    blocks: [
      [0, 420, 'SLEEP', 'HOME'],
      [420, 600, 'HOME', 'HOME'],
      [600, 780, 'LEISURE', ['dagashi', 'market']],
      [780, 960, 'FOLLOW_LENNY', 'FOLLOW'],       // レニィに引っ付く
      [960, 1080, 'LEISURE', ['dagashi', 'GROUND', 'game']],
      [1080, 1200, 'HOME', 'HOME'],
      [1200, 1440, 'SLEEP', 'HOME'],
    ],
    exceptions: [
      { cond: 'weather == RAIN', loc: 'HOME', act: 'HOME', onlyBands: ['DAY', 'EVENING'] },
    ],
  },
  GERU: {
    blocks: [
      [0, 240, 'LEISURE', 'HOME'],                // 深夜の読書
      [240, 720, 'SLEEP', 'HOME'],                // 昼まで寝る(夜型)
      [720, 840, 'MEAL', ['cafe', 'HOME']],
      [840, 1080, 'LEISURE', ['book', 'HOME']],
      [1080, 1200, 'WANDER', ['GROUND', 'market', 'flower']],
      [1200, 1440, 'LEISURE', ['izakaya', 'HOME']],
    ],
    exceptions: [],
  },
  NEO: {
    blocks: [
      [0, 420, 'SLEEP', 'HOME'],
      [420, 600, 'HOME', 'HOME'],
      [600, 780, 'EXPLORE', ['barber', 'market', 'GROUND']],   // 街文化探訪
      [780, 900, 'MEAL', ['ramen', 'cafe']],
      [900, 1140, 'EXPLORE', ['game', 'book', 'dagashi', 'GROUND', 'sento']],
      [1140, 1260, 'HOME', 'HOME'],
      [1260, 1380, 'LEISURE', ['izakaya', 'ROOF', 'HOME']],    // 閉店間際のバー
      [1380, 1440, 'SLEEP', 'HOME'],
    ],
    exceptions: [],
  },
  BARBER: {
    blocks: [
      [0, 540, 'SLEEP', 'barber'],
      [540, 1140, 'WORK', 'barber'],
      [1140, 1260, 'LEISURE', ['izakaya', 'barber']],
      [1260, 1440, 'SLEEP', 'barber'],
    ],
    exceptions: [],
  },
  KANE: {
    blocks: [
      [0, 360, 'SLEEP', 'GROUND'],
      [360, 720, 'WANDER', ['GROUND', 'market']],
      [720, 900, 'LEISURE', 'GROUND'],
      [900, 1140, 'WANDER', ['GROUND', 'market', 'dagashi']],
      [1140, 1440, 'SLEEP', 'GROUND'],
    ],
    exceptions: [
      { cond: '@kane_soft and time == DAY', loc: 'cafe', act: 'LEISURE' },   // 軟化すると喫茶店に来る
      { cond: 'weather == RAIN', loc: 'market', act: 'WANDER', onlyBands: ['DAY', 'EVENING'] },
    ],
  },
  POSTMAN: {
    blocks: [
      [0, 480, 'SLEEP', 'post'],
      [480, 720, 'DELIVER', ['GROUND', 'post']],   // 配達で走り回る
      [720, 1080, 'WORK', 'post'],
      [1080, 1440, 'SLEEP', 'post'],
    ],
    exceptions: [],
  },
};

// 条件マクロ (NPC会話設計書 第4.4節) — 全システム共通
export const MACROS = {
  '@kane_soft': 'kane_softness >= 40',
  '@kane_warm': 'kane_softness >= 70',
  '@bar_open': 'time in [NIGHT, MIDNIGHT]',
  '@rainy_night': 'weather == RAIN and time in [NIGHT, MIDNIGHT]',
};
