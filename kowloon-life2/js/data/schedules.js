// ============================================================
// NPCスケジュール (設計書a 第7章 層1 / NPC会話設計書 第9章)
// v2: 主要人物が同じ場所に集まりやすいよう時間割を調整。
//     ・昼(11:00-13:00)は6人が九龍マートに立ち寄る帯を用意 → 市場会話が増える
//     ・夕〜夜(19:00-22:00)は男性陣が銭湯に集まる → 男湯グループ会話
//     ・ゲルは銭湯に少しずらして単独で来る
// blocks: [開始分, 終了分, activity, loc]
//   loc: 'HOME' | 施設id | 'ROOF' | 'GROUND' | 配列(日次シードで抽選)
// ============================================================

export const SCHEDULES = {
  LENNY: {
    blocks: [
      [0, 600, 'SLEEP', 'HOME'],
      [600, 660, 'LEISURE', 'cafe'],
      [660, 780, 'SHOP', ['market', 'cafe']],       // 昼は市場帯
      [780, 960, 'NAP', ['HOME', 'ROOF']],
      [960, 1140, 'LEISURE', ['ROOF', 'flower', 'book']],
      [1140, 1260, 'BATH', 'sento'],                  // 夕方 銭湯(男湯グループ)
      [1260, 1440, 'SLEEP', 'HOME'],
    ],
    exceptions: [
      { cond: 'weather == RAIN and time in [DAY, EVENING]', loc: 'HOME', act: 'NAP' },
    ],
  },
  HYU: {
    blocks: [
      [0, 420, 'SLEEP', 'HOME'],
      [420, 600, 'HOME', 'HOME'],
      [600, 660, 'LEISURE', 'cafe'],
      [660, 780, 'SHOP', ['market', 'cafe']],
      [780, 900, 'LEISURE', ['barber', 'flower', 'cafe']],
      [900, 1140, 'LEISURE', ['cafe', 'book', 'HOME']],
      [1140, 1260, 'BATH', 'sento'],
      [1260, 1380, 'LEISURE', ['karaoke', 'izakaya', 'HOME']],
      [1380, 1440, 'SLEEP', 'HOME'],
    ],
    exceptions: [],
  },
  JIN: {
    blocks: [
      [0, 360, 'SLEEP', 'HOME'],
      [360, 540, 'TRAINING', ['GROUND', 'ROOF']],
      [540, 660, 'WANDER', ['market', 'GROUND']],
      [660, 780, 'MEAL', ['ramen', 'market']],
      [780, 1080, 'WORK', ['market', 'GROUND']],
      [1080, 1140, 'LEISURE', ['game', 'GROUND']],
      [1140, 1260, 'BATH', 'sento'],                  // 夜は銭湯(男湯グループ)
      [1260, 1320, 'LEISURE', ['izakaya', 'GROUND']],  // 湯上がりに一杯
      [1320, 1440, 'SLEEP', 'HOME'],
    ],
    exceptions: [
      { cond: 'weather == RAIN and time == MORNING', loc: 'HOME', act: 'TRAINING' },
    ],
  },
  MUNI: {
    blocks: [
      [0, 420, 'SLEEP', 'HOME'],
      [420, 600, 'HOME', 'HOME'],
      [600, 660, 'LEISURE', ['dagashi', 'market']],
      [660, 780, 'SHOP', ['market', 'dagashi']],
      [780, 960, 'FOLLOW_LENNY', 'FOLLOW'],
      [960, 1080, 'LEISURE', ['dagashi', 'GROUND', 'game']],
      [1080, 1200, 'BATH', 'sento'],                  // ジンパチに背中を流してもらう
      [1200, 1440, 'SLEEP', 'HOME'],
    ],
    exceptions: [
      { cond: 'weather == RAIN', loc: 'HOME', act: 'HOME', onlyBands: ['DAY', 'EVENING'] },
    ],
  },
  GERU: {
    blocks: [
      [0, 240, 'LEISURE', 'HOME'],
      [240, 720, 'SLEEP', 'HOME'],
      [720, 780, 'MEAL', ['cafe', 'HOME']],
      [780, 840, 'SHOP', ['market', 'book']],
      [840, 1080, 'LEISURE', ['book', 'HOME']],
      [1080, 1200, 'WANDER', ['GROUND', 'market', 'flower']],
      [1200, 1320, 'BATH', 'sento'],                  // 男湯グループの後、単独で女湯へ
      [1320, 1440, 'LEISURE', ['izakaya', 'HOME']],
    ],
    exceptions: [],
  },
  NEO: {
    blocks: [
      [0, 420, 'SLEEP', 'HOME'],
      [420, 600, 'HOME', 'HOME'],
      [600, 660, 'EXPLORE', ['barber', 'market', 'GROUND']],
      [660, 780, 'SHOP', ['market', 'ramen']],
      [780, 900, 'MEAL', ['ramen', 'cafe']],
      [900, 1080, 'EXPLORE', ['game', 'book', 'dagashi', 'GROUND']],
      [1080, 1260, 'BATH', 'sento'],                  // 銭湯にすっかりハマった
      [1260, 1380, 'LEISURE', ['izakaya', 'ROOF', 'HOME']],
      [1380, 1440, 'SLEEP', 'HOME'],
    ],
    exceptions: [],
  },
  BARBER: {
    blocks: [
      [0, 540, 'SLEEP', 'barber'],
      [540, 1140, 'WORK', 'barber'],
      [1140, 1260, 'LEISURE', ['izakaya', 'sento', 'barber']],
      [1260, 1440, 'SLEEP', 'barber'],
    ],
    exceptions: [],
  },
  KANE: {
    blocks: [
      [0, 360, 'SLEEP', 'GROUND'],
      [360, 660, 'WANDER', ['GROUND', 'market']],
      [660, 780, 'LEISURE', ['market', 'GROUND']],     // 昼は市場でおしゃべり
      [780, 900, 'LEISURE', 'GROUND'],
      [900, 1140, 'WANDER', ['GROUND', 'market', 'dagashi']],
      [1140, 1440, 'SLEEP', 'GROUND'],
    ],
    exceptions: [
      { cond: '@kane_soft and time == DAY', loc: 'cafe', act: 'LEISURE' },
      { cond: 'weather == RAIN', loc: 'market', act: 'WANDER', onlyBands: ['DAY', 'EVENING'] },
    ],
  },
  POSTMAN: {
    blocks: [
      [0, 480, 'SLEEP', 'post'],
      [480, 660, 'DELIVER', ['GROUND', 'post']],
      [660, 780, 'DELIVER', ['market', 'GROUND']],
      [780, 1080, 'WORK', 'post'],
      [1080, 1200, 'LEISURE', ['GROUND', 'izakaya']],
      [1200, 1440, 'SLEEP', 'post'],
    ],
    exceptions: [],
  },
  CAFEGIRL: {
    blocks: [
      [0, 450, 'SLEEP', 'cafe'],
      [450, 480, 'HOME', 'cafe'],
      [480, 1200, 'WORK', 'cafe'],       // 開店中はずっと喫茶店
      [1200, 1320, 'LEISURE', ['GROUND', 'market', 'cafe']],
      [1320, 1440, 'SLEEP', 'cafe'],
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
