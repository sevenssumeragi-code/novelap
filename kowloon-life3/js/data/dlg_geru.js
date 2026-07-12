// ============================================================
// ゲル会話DB — 口調正準: 一人称は必ず「私」/「〜だな」「〜だ」/ 二人称「あんた」
// 【禁止】二人称「貴様」は絶対に使用しない(ネオとの差別化・バリデータ対象)
// ============================================================
const N = (id, node) => ({ id, owner: 'GERU', ...node });

export const DLG_GERU = [
  // ---------- 初対面 ----------
  N('DLG_GER_FIRST_001', {
    type: 'EVENT', pool: 'EVENT', once: true,
    lines: [
      { sp: 'GERU', text: '……あんたが新しい大家か。私はゲル。' },
      { sp: 'GERU', text: '増築するなら騒音は夜だけ勘弁してくれ。私は夜に生きてるんだ。' },
      { sp: 'GERU', text: '……まあ、よろしく頼む。この街は、雑多なほど落ち着くからな。好きにやるといい。' },
    ],
    effects: ['flag(FLG_MET_GERU)', 'aff(GERU,2)', 'log(EVENT)'],
  }),

  // ---------- ランク解放イベント ----------
  N('DLG_GER_EV_S3', {
    type: 'EVENT', pool: 'EVENT', once: true,
    cond: 'rank(PC, GERU) >= 3',
    lines: [
      { sp: 'GERU', text: '……あんた、チェスは指せるのか。' },
      { sp: 'GERU', text: 'この塔に来てから、対戦相手がいなくてな。ジンパチは3手で盤をひっくり返すし、レニィは長考のふりして寝る。' },
    ],
    choices: [
      { text: '指せる。勝負しよう', effects: ['aff(GERU,3)'], lines: [{ sp: 'GERU', text: 'ほう。……いい目だ。夜、私の部屋に来い。茶くらいは出す。' }] },
      { text: 'ルールから教えて', effects: ['aff(GERU,2)'], lines: [{ sp: 'GERU', text: '構わない。教えるのは嫌いじゃないんだ。……ムニで慣れてるからな。' }] },
    ],
    effects: ['flag(FLG_EV_GERU_S3)', 'log(EVENT)'],
  }),
  N('DLG_GER_EV_S5', {
    type: 'EVENT', pool: 'EVENT', once: true,
    cond: 'rank(PC, GERU) >= 5 and time in [NIGHT, MIDNIGHT]',
    lines: [
      { sp: 'GERU', text: '……見せたいものがある。この写真だ。' },
      { sp: 'GERU', text: '昔、私が住んでいた街だ。再開発で、もう跡形もない。だから私は、壊れながら育つこの塔が好きなんだろうな。' },
      { sp: 'GERU', text: '消えない街を、あんたは作ってくれ。……柄にもないことを言った。忘れろ。' },
    ],
    effects: ['flag(FLG_EV_GERU_S5)', 'info(INFO_GERU_PHOTO)', 'aff(GERU,4)', 'log(EVENT)'],
  }),

  // ---------- 汎用 ----------
  N('DLG_GER_GEN_001', { type: 'TALK', pool: 'GENERIC', lines: [{ sp: 'GERU', text: '私の部屋に何か用か。……まあ、座っていくといい。' }], effects: ['aff(GERU,1)'] }),
  N('DLG_GER_GEN_002', { type: 'TALK', pool: 'GENERIC', lines: [{ sp: 'GERU', text: '増築か。いいんじゃないか。この街は、雑多なほど落ち着く。' }], effects: ['aff(GERU,1)'] }),
  N('DLG_GER_GEN_003', { type: 'TALK', pool: 'GENERIC', lines: [{ sp: 'GERU', text: '本を読む時間だけは邪魔されたくないな。……あんたなら、まあ、許す。' }], effects: ['aff(GERU,1)'] }),
  N('DLG_GER_GEN_004', { type: 'TALK', pool: 'GENERIC', lines: [{ sp: 'GERU', text: 'ネオの声は三階下まで響くんだ。本人は「威厳」だと言い張るがな。' }], effects: ['aff(GERU,1)'] }),
  N('DLG_GER_GEN_005', { type: 'TALK', pool: 'GENERIC', lines: [{ sp: 'GERU', text: 'コインなら、店の物陰で光っているのを見たことがあるな。私は拾わない主義だ。探す楽しみを奪うだろう。' }], effects: ['aff(GERU,1)'] }),
  N('DLG_GER_GEN_006', { type: 'TALK', pool: 'GENERIC', lines: [{ sp: 'GERU', text: '……なんだ、その顔は。私が笑うと珍しいか。' }], effects: ['aff(GERU,1)'] }),

  // ---------- 時間帯 ----------
  N('DLG_GER_TIME_MORN_001', { type: 'TALK', pool: 'COND', cond: 'time == MORNING', lines: [{ sp: 'GERU', text: '……朝から元気だな、あんたは。私はこれから寝るところだ。おやすみ。' }], effects: ['aff(GERU,1)'] }),
  N('DLG_GER_TIME_DAY_001', { type: 'TALK', pool: 'COND', cond: 'time == DAY', lines: [{ sp: 'GERU', text: 'ふぁ……起きたばかりだ。昼の光は目に刺さるな。' }], effects: ['aff(GERU,1)'] }),
  N('DLG_GER_TIME_EVE_001', { type: 'TALK', pool: 'COND', cond: 'time == EVENING', lines: [{ sp: 'GERU', text: '夕方か。ここからが私の一日だ。夜は長い。いいことだな。' }], effects: ['aff(GERU,1)'] }),
  N('DLG_GER_TIME_NIGHT_001', { type: 'TALK', pool: 'COND', cond: 'time == NIGHT', lines: [{ sp: 'GERU', text: '夜のこの塔は悪くない眺めだ。ネオンが本のページに落ちる。読書が進む。' }], effects: ['aff(GERU,1)'] }),
  N('DLG_GER_TIME_NIGHT_002', {
    type: 'TALK', pool: 'COND', cond: 'time in [NIGHT, MIDNIGHT] and rank(PC, GERU) >= 2', weight: 12,
    lines: [
      { sp: 'GERU', text: 'さっきまでムニを部屋まで送っていた。あの子は夜が怖いくせに、夜更かししたがるんだ。' },
      { sp: 'GERU', text: '……別に、心配などしていない。通り道だっただけだ。' },
    ],
    effects: ['aff(GERU,1)', 'info(INFO_GERU_CARING)'],
  }),
  N('DLG_GER_TIME_MID_001', { type: 'TALK', pool: 'COND', cond: 'time == MIDNIGHT', lines: [{ sp: 'GERU', text: 'こんな時間まで起きているのか。……ふ、あんたも夜側の人間だな。歓迎する。' }], effects: ['aff(GERU,1)'] }),

  // ---------- 天候 ----------
  N('DLG_GER_WX_RAIN_001', { type: 'TALK', pool: 'COND', cond: 'weather == RAIN', lines: [{ sp: 'GERU', text: '雨か。読書日和だ。雨音は最高のBGMだからな。' }], effects: ['aff(GERU,1)'] }),
  N('DLG_GER_WX_SUN_001', { type: 'TALK', pool: 'COND', cond: 'weather == SUNNY', lines: [{ sp: 'GERU', text: 'いい天気だな。……だからどうした、という顔をするな。私にも天気の話くらいさせろ。' }], effects: ['aff(GERU,1)'] }),
  N('DLG_GER_WX_CLOUD_001', { type: 'TALK', pool: 'COND', cond: 'weather == CLOUDY', lines: [{ sp: 'GERU', text: '曇り。ちょうどいい。眩しくもなく、濡れもしない。完璧な散歩日和だな。' }], effects: ['aff(GERU,1)'] }),

  // ---------- 季節 ----------
  N('DLG_GER_SEA_SPR_001', { type: 'TALK', pool: 'COND', cond: 'season == SPRING', lines: [{ sp: 'GERU', text: '春は新刊が多くて困る。財布がな。' }], effects: ['aff(GERU,1)'] }),
  N('DLG_GER_SEA_SUM_001', { type: 'TALK', pool: 'COND', cond: 'season == SUMMER', lines: [{ sp: 'GERU', text: '夏の夜は悪くない。窓を開けると、街の音がぜんぶ聞こえる。生きてる音だな。' }], effects: ['aff(GERU,1)'] }),
  N('DLG_GER_SEA_AUT_001', { type: 'TALK', pool: 'COND', cond: 'season == AUTUMN', lines: [{ sp: 'GERU', text: '読書の秋、だそうだ。私には一年中読書の季節だがな。' }], effects: ['aff(GERU,1)'] }),
  N('DLG_GER_SEA_WIN_001', { type: 'TALK', pool: 'COND', cond: 'season == WINTER', lines: [{ sp: 'GERU', text: '冬は嫌いじゃない。布団と本と熱い茶。それで宇宙が完成する。' }], effects: ['aff(GERU,1)'] }),

  // ---------- 施設 ----------
  N('DLG_GER_FAC_BOOK_001', { type: 'TALK', pool: 'FAC', cond: 'location == book', lines: [{ sp: 'GERU', text: 'この本屋を建てたのは、あんたの采配のうち最良の判断だな。……ん? 今のは褒めたんだ。' }], effects: ['aff(GERU,1)'] }),
  N('DLG_GER_FAC_IZAKAYA_001', { type: 'TALK', pool: 'FAC', cond: 'location == izakaya', lines: [{ sp: 'GERU', text: '私は酒よりジュース派だ。……悪いか。ここは音と灯りがちょうどいいから来てるだけだ。' }], effects: ['aff(GERU,1)'] }),
  N('DLG_GER_FAC_CAFE_001', { type: 'TALK', pool: 'FAC', cond: 'location == cafe', lines: [{ sp: 'GERU', text: 'ナポリタンは好きだが、本を汚しそうで頼みにくいんだ。……深刻な問題だろう。' }], effects: ['aff(GERU,1)'] }),

  // ---------- 状態特化 ----------
  N('DLG_GER_TASTE_001', {
    type: 'TALK', pool: 'STATE', cond: 'location == HOME_GERU and taste_score(GERU) >= 4', once: true,
    lines: [{ sp: 'GERU', text: 'この部屋、本と静けさの配分が完璧になったな。……あんた、いい仕事をする。素直に礼を言う。ありがとう。' }],
    effects: ['aff(GERU,3)', 'log(DAILY)'],
  }),
  N('DLG_GER_SLEEP_001', { type: 'TALK', pool: 'STATE', cond: 'activity(GERU) == SLEEP', weight: 20, lines: [{ sp: 'GERU', text: '……(本を開いたまま眠っている。栞代わりの古い写真が見える)' }], effects: ['info(INFO_GERU_PHOTO)'] }),

  // ---------- バーク ----------
  N('BRK_GER_001', { type: 'BARK', pool: 'BARK', lines: [{ sp: 'GERU', text: '……いい夜だ' }] }),
  N('BRK_GER_002', { type: 'BARK', pool: 'BARK', cond: 'time == DAY', lines: [{ sp: 'GERU', text: 'まぶしいな……' }] }),
  N('BRK_GER_003', { type: 'BARK', pool: 'BARK', cond: 'weather == RAIN', lines: [{ sp: 'GERU', text: '雨音。読書が進む' }] }),
  N('BRK_GER_004', { type: 'BARK', pool: 'BARK', cond: 'built(book)', lines: [{ sp: 'GERU', text: '新刊、入ったかな' }] }),
];
