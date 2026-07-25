// ============================================================
// ムニ会話DB — 口調正準: 一人称「ムニ」(自分の名前呼び) / 幼児語「〜なの」「〜だもん」
// 口癖「むにゅ〜」(TIC_MUNYU: 3会話に1回程度)
// PC呼称:「おおやさん」
// ============================================================
const N = (id, node) => ({ id, owner: 'MUNI', ...node });

export const DLG_MUNI = [
  // ---------- 初対面 ----------
  N('DLG_MUN_FIRST_001', {
    type: 'EVENT', pool: 'EVENT', once: true,
    lines: [
      { sp: 'MUNI', text: '……だれ? ……あたらしい、おおやさん?' },
      { sp: 'MUNI', text: 'ムニはね、ムニっていうの。5さいなの。' },
      { sp: 'MUNI', text: '……おおやさん、またきてくれる? ムニ、ひとりはやなの。' },
    ],
    effects: ['flag(FLG_MET_MUNI)', 'aff(MUNI,2)', 'log(EVENT)'],
  }),

  // ---------- お願いイベント「よるこわいの」(第1.8.8節の例) ----------
  N('DLG_MUN_EV_LAMP', {
    type: 'EVENT', pool: 'EVENT', once: true,
    cond: 'rank(PC, MUNI) >= 2 and time in [NIGHT, MIDNIGHT]',
    lines: [
      { sp: 'MUNI', text: 'おおやさん……あのね。よるね、おへやがまっくらだと、こわいの。' },
      { sp: 'MUNI', text: 'おばけがでるかもだもん。……ランプ、おいてくれる? ひかるやつ。' },
    ],
    effects: ['flag(FLG_Q_MUNI_LAMP)', 'info(INFO_MUNI_NIGHT)', 'aff(MUNI,1)', 'log(EVENT)'],
  }),
  N('DLG_MUN_EV_LAMP_DONE', {
    type: 'EVENT', pool: 'EVENT', once: true,
    cond: 'flag(FLG_Q_MUNI_LAMP_DONE)',
    lines: [
      { sp: 'MUNI', text: 'わあ! ランプだ! ひかってる! むにゅ〜!!' },
      { sp: 'MUNI', text: 'これでおばけこないね! おおやさん、だーいすき!' },
    ],
    effects: ['aff(MUNI,5)', 'coin(5)', 'log(EVENT)'],
  }),
  N('DLG_MUN_EV_S3', {
    type: 'EVENT', pool: 'EVENT', once: true,
    cond: 'rank(PC, MUNI) >= 3',
    lines: [
      { sp: 'MUNI', text: 'あのね、カネばあちゃんがいってたの。ムニはね、「とうのみんなのこども」なんだって。' },
      { sp: 'MUNI', text: 'だからね、レニィおにいちゃんも、ジンパチおにいちゃんも、ゲルおねえちゃんも、みーんなムニのかぞくなの。' },
      { sp: 'MUNI', text: 'おおやさんも、かぞくにいれてあげる!' },
    ],
    effects: ['flag(FLG_EV_MUNI_S3)', 'info(INFO_MUNI_LODGER)', 'aff(MUNI,3)', 'log(EVENT)'],
  }),
  N('DLG_MUN_EV_S5', {
    type: 'EVENT', pool: 'EVENT', once: true,
    cond: 'rank(PC, MUNI) >= 5',
    lines: [
      { sp: 'MUNI', text: 'おおやさん、みみかして。……ないしょのはなしなの。' },
      { sp: 'MUNI', text: 'ムニのいちばんすきなばしょはね、レニィおにいちゃんのくものベッドなの。ふわふわで、あんしんするの。' },
      { sp: 'MUNI', text: 'でもね、いまはおおやさんのおへやも、すき。……えへへ。' },
    ],
    effects: ['flag(FLG_EV_MUNI_S5)', 'aff(MUNI,4)', 'log(EVENT)'],
  }),

  // ---------- 汎用 ----------
  N('DLG_MUN_GEN_001', { type: 'TALK', pool: 'GENERIC', lines: [{ sp: 'MUNI', text: 'あ! おおやさんだ! きてくれたの? むにゅ〜!' }], effects: ['aff(MUNI,1)'] }),
  N('DLG_MUN_GEN_002', { type: 'TALK', pool: 'GENERIC', lines: [{ sp: 'MUNI', text: 'ねえねえ、いっしょにあそぼ? つみき、たかくつめるようになったの!' }], effects: ['aff(MUNI,1)'] }),
  N('DLG_MUN_GEN_003', { type: 'TALK', pool: 'GENERIC', lines: [{ sp: 'MUNI', text: 'レニィおにいちゃんのおへや、ふわふわなんだよ! ムニのおひるねばしょなの。' }], effects: ['aff(MUNI,1)'] }),
  N('DLG_MUN_GEN_004', { type: 'TALK', pool: 'GENERIC', lines: [{ sp: 'MUNI', text: 'ガチャガチャ、ムニもまわしたいの! コインちょうだい? ……だめ? けちんぼだもん。' }], effects: ['aff(MUNI,1)'] }),
  N('DLG_MUN_GEN_005', { type: 'TALK', pool: 'GENERIC', lines: [{ sp: 'MUNI', text: 'ジンパチおにいちゃんはね、かたぐるましてくれるの。せかいがおっきくみえるんだよ!' }], effects: ['aff(MUNI,1)'] }),
  N('DLG_MUN_GEN_006', { type: 'TALK', pool: 'GENERIC', lines: [{ sp: 'MUNI', text: 'ネオおにいちゃんの「きさま」って、あいさつなんでしょ? ムニもいえるよ。きさま〜!' }], effects: ['aff(MUNI,1)'] }),

  // ---------- 時間帯 ----------
  N('DLG_MUN_TIME_MORN_001', { type: 'TALK', pool: 'COND', cond: 'time == MORNING', lines: [{ sp: 'MUNI', text: 'おはよ! ムニ、きょうはじぶんでおきたの! えらい? えらいでしょ!' }], effects: ['aff(MUNI,1)'] }),
  N('DLG_MUN_TIME_DAY_001', { type: 'TALK', pool: 'COND', cond: 'time == DAY', lines: [{ sp: 'MUNI', text: 'おひるはね、だがしやさんいくの! ラムネかうの! ……あれ、だがしやさん、まだない? はやくつくって!' }], effects: ['aff(MUNI,1)'] }),
  N('DLG_MUN_TIME_EVE_001', { type: 'TALK', pool: 'COND', cond: 'time == EVENING', lines: [{ sp: 'MUNI', text: 'ゆうやけだ! おそらがオレンジのジュースみたいなの。むにゅ〜。' }], effects: ['aff(MUNI,1)'] }),
  N('DLG_MUN_TIME_NIGHT_001', { type: 'TALK', pool: 'COND', cond: 'time == NIGHT', lines: [{ sp: 'MUNI', text: 'よるはちょっとこわいの……。でも、でんきがついてたら、へいき。……おおやさん、もうちょっといて?' }], effects: ['aff(MUNI,1)', 'info(INFO_MUNI_NIGHT)'] }),
  N('DLG_MUN_TIME_MID_001', { type: 'TALK', pool: 'COND', cond: 'time == MIDNIGHT', lines: [{ sp: 'MUNI', text: 'すぅ……すぅ……。(ぬいぐるみをぎゅっと抱きしめて眠っている)' }] }),

  // ---------- 天候 ----------
  N('DLG_MUN_WX_RAIN_001', { type: 'TALK', pool: 'COND', cond: 'weather == RAIN', lines: [{ sp: 'MUNI', text: 'あめ、きらい。おそといけないんだもん。……でもね、まえにヒュウおにいちゃんがかさかしてくれたの。' }], effects: ['aff(MUNI,1)', 'info(INFO_HYU_KIND)'] }),
  N('DLG_MUN_WX_SUN_001', { type: 'TALK', pool: 'COND', cond: 'weather == SUNNY', lines: [{ sp: 'MUNI', text: 'おてんき! おさんぽびより! おおやさん、ろじうらたんけん、いこ!' }], effects: ['aff(MUNI,1)'] }),
  N('DLG_MUN_WX_CLOUD_001', { type: 'TALK', pool: 'COND', cond: 'weather == CLOUDY', lines: [{ sp: 'MUNI', text: 'おそら、ねずみいろなの。おこってるのかなあ。' }], effects: ['aff(MUNI,1)'] }),

  // ---------- 季節 ----------
  N('DLG_MUN_SEA_SPR_001', { type: 'TALK', pool: 'COND', cond: 'season == SPRING', lines: [{ sp: 'MUNI', text: 'はるだ! おはながさいてるの! ムニ、いっこだけつんじゃった……ないしょね。' }], effects: ['aff(MUNI,1)'] }),
  N('DLG_MUN_SEA_SUM_001', { type: 'TALK', pool: 'COND', cond: 'season == SUMMER', lines: [{ sp: 'MUNI', text: 'なつはアイスなの! みどりのソーダのやつ! むにゅ〜、たべたくなっちゃった。' }], effects: ['aff(MUNI,1)'] }),
  N('DLG_MUN_SEA_AUT_001', { type: 'TALK', pool: 'COND', cond: 'season == AUTUMN', lines: [{ sp: 'MUNI', text: 'あきはね、おいもがおいしいの。カネばあちゃんがやきいもくれたの!' }], effects: ['aff(MUNI,1)'] }),
  N('DLG_MUN_SEA_WIN_001', { type: 'TALK', pool: 'COND', cond: 'season == WINTER', lines: [{ sp: 'MUNI', text: 'さむいの! てがつめたいの! ……おおやさんのポケット、かして。' }], effects: ['aff(MUNI,1)'] }),

  // ---------- 施設 ----------
  N('DLG_MUN_FAC_DAGASHI_001', { type: 'TALK', pool: 'FAC', cond: 'location == dagashi', lines: [{ sp: 'MUNI', text: 'だがしやさんだ! ムニのてんごくなの! きょうはねー、ラムネと、グミと、チョコバナナのやつ!' }], effects: ['aff(MUNI,1)'] }),
  N('DLG_MUN_FAC_GAME_001', { type: 'TALK', pool: 'FAC', cond: 'location == game', lines: [{ sp: 'MUNI', text: 'クレーンゲームのくまさん、とって? おねがい、おおやさんしかいないの!' }], effects: ['aff(MUNI,1)'] }),
  N('DLG_MUN_FAC_MARKET_001', { type: 'TALK', pool: 'FAC', cond: 'location == market', lines: [{ sp: 'MUNI', text: 'おつかいなの! たまごをかうの。われないようにもつの。ムニ、おにいさんだから!' }], effects: ['aff(MUNI,1)'] }),

  // ---------- 状態特化 ----------
  N('DLG_MUN_TASTE_001', {
    type: 'TALK', pool: 'STATE', cond: 'location == HOME_MUNI and taste_score(MUNI) >= 4', once: true,
    lines: [{ sp: 'MUNI', text: 'ムニのおへや、おもちゃがいっぱい! むにゅ〜! おおやさん、てんさいなの!?' }],
    effects: ['aff(MUNI,3)', 'log(DAILY)'],
  }),
  N('DLG_MUN_FOLLOW_001', { type: 'TALK', pool: 'STATE', cond: 'activity(MUNI) == FOLLOW_LENNY', weight: 16, lines: [{ sp: 'MUNI', text: 'いまね、レニィおにいちゃんとおひるねツアーちゅうなの。しずかにね。' }], effects: ['aff(MUNI,1)'] }),

  // ---------- バーク ----------
  N('BRK_MUN_001', { type: 'BARK', pool: 'BARK', lines: [{ sp: 'MUNI', text: 'むにゅ〜' }] }),
  N('BRK_MUN_002', { type: 'BARK', pool: 'BARK', cond: 'time in [NIGHT, MIDNIGHT]', lines: [{ sp: 'MUNI', text: 'くらいの、こわいの……' }] }),
  N('BRK_MUN_003', { type: 'BARK', pool: 'BARK', cond: 'weather == SUNNY', lines: [{ sp: 'MUNI', text: 'たんけんいくの!' }] }),
  N('BRK_MUN_004', { type: 'BARK', pool: 'BARK', cond: 'built(dagashi)', lines: [{ sp: 'MUNI', text: 'ラムネかうの!' }] }),
];
