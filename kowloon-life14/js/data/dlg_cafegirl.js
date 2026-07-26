// ============================================================
// 喫茶クーロンの看板娘サチ 会話DB (v2追加)
// 明るい店員。ヒュウの口説き文句を笑顔で受け流す三者会話あり (第15.2節)。
// 口調: 「〜ですよ」「〜ね♪」/ PC呼称「お客さん」
// ============================================================
const N = (id, node) => ({ id, owner: 'CAFEGIRL', ...node });

export const DLG_CAFEGIRL = [
  // ---------- 初対面 ----------
  N('DLG_CFG_FIRST_001', {
    type: 'EVENT', pool: 'EVENT', once: true,
    lines: [
      { sp: 'CAFEGIRL', text: 'いらっしゃいませ、喫茶クーロンへ! ……あ、もしかして新しい大家さんですか?' },
      { sp: 'CAFEGIRL', text: 'わたし、看板娘のサチです♪ ここのコーヒーとクリームソーダは自信作なんですよ。' },
      { sp: 'CAFEGIRL', text: 'ヒュウさんが毎日いらっしゃるので、賑やか……というか、鏡が増えました。ふふ。' },
    ],
    effects: ['flag(FLG_MET_CAFEGIRL)', 'aff(CAFEGIRL,2)', 'log(EVENT)'],
  }),

  // ---------- 三者会話: ヒュウが口説く(害のない上品なやりとり, CERO A) ----------
  N('DLG_CFG_HYU_FLIRT_001', {
    type: 'TALK', pool: 'FAC', weight: 24,
    cond: 'location == cafe and npc_at(HYU) == cafe',
    lines: [
      { sp: 'HYU', text: 'サチさん。今日のあなたのエプロン、その色は罪ですね。私の心を奪う色です。' },
      { sp: 'CAFEGIRL', text: 'あらヒュウさん、口説き文句もホットコーヒーと一緒に一日100杯ですね♪ はい、いつものです。' },
      { sp: 'HYU', text: '……手厳しい。ですがその余裕、嫌いではありませんよ。' },
      { sp: 'CAFEGIRL', text: '(大家さんに小声で) こういう方なので、真に受けないでくださいね。悪い人じゃないんですよ。' },
    ],
    effects: ['aff(CAFEGIRL,1)', 'mutual(CAFEGIRL,HYU,1)', 'log(DAILY)'],
  }),
  N('DLG_CFG_HYU_FLIRT_002', {
    type: 'TALK', pool: 'FAC', weight: 20,
    cond: 'location == cafe and npc_at(HYU) == cafe',
    lines: [
      { sp: 'HYU', text: 'サチさん、僕とあなたなら、この店の売上を三割は上げられると思いませんか?' },
      { sp: 'CAFEGIRL', text: 'ヒュウさんが窓際に座ってるだけで女性客は増えてますよ。実質もう共同経営です♪' },
      { sp: 'HYU', text: '……ふふ。あなたには敵いませんね。' },
    ],
    effects: ['aff(CAFEGIRL,1)', 'mutual(CAFEGIRL,HYU,2)', 'log(DAILY)'],
  }),

  // ---------- 汎用 ----------
  N('DLG_CFG_GEN_001', { type: 'TALK', pool: 'GENERIC', lines: [{ sp: 'CAFEGIRL', text: 'いらっしゃいませ♪ 今日のおすすめはナポリタンですよ。ジンパチさんは三皿食べました。' }], effects: ['aff(CAFEGIRL,1)'] }),
  N('DLG_CFG_GEN_002', { type: 'TALK', pool: 'GENERIC', lines: [{ sp: 'CAFEGIRL', text: 'レニィさん、また窓際でうとうとしてます。あの子、コーヒーで寝るんですよ。逆ですよね、ふふ。' }], effects: ['aff(CAFEGIRL,1)'] }),
  N('DLG_CFG_GEN_003', { type: 'TALK', pool: 'GENERIC', lines: [{ sp: 'CAFEGIRL', text: 'ゲルさんは長居してくださる常連さん。本を読む横顔、絵になるんですよ〜。' }], effects: ['aff(CAFEGIRL,1)'] }),
  N('DLG_CFG_GEN_004', { type: 'TALK', pool: 'GENERIC', lines: [{ sp: 'CAFEGIRL', text: 'クリームソーダのさくらんぼ、ムニくんにはいつも2個入れちゃいます。内緒ですよ♪' }], effects: ['aff(CAFEGIRL,1)'] }),

  // ---------- 時間帯 ----------
  N('DLG_CFG_TIME_MORN', { type: 'TALK', pool: 'COND', cond: 'time == MORNING', lines: [{ sp: 'CAFEGIRL', text: 'モーニングセット、やってますよ! トーストの焼き加減はお任せください♪' }], effects: ['aff(CAFEGIRL,1)'] }),
  N('DLG_CFG_TIME_EVE', { type: 'TALK', pool: 'COND', cond: 'time == EVENING', lines: [{ sp: 'CAFEGIRL', text: '夕方は光が琥珀色で、この店が一番きれいな時間なんです。写真、撮っていきます?' }], effects: ['aff(CAFEGIRL,1)'] }),
  N('DLG_CFG_WX_RAIN', { type: 'TALK', pool: 'COND', cond: 'weather == RAIN', lines: [{ sp: 'CAFEGIRL', text: '雨の日はお客さんが少ないぶん、ゆっくりできますよ。あったかいの、淹れますね♪' }], effects: ['aff(CAFEGIRL,1)'] }),

  // ---------- バーク ----------
  N('BRK_CFG_001', { type: 'BARK', pool: 'BARK', lines: [{ sp: 'CAFEGIRL', text: 'いらっしゃいませ♪' }] }),
  N('BRK_CFG_002', { type: 'BARK', pool: 'BARK', cond: 'time == MORNING', lines: [{ sp: 'CAFEGIRL', text: 'モーニングどうぞ〜' }] }),
];
