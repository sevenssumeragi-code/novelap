// ============================================================
// ジンパチ会話DB — 口調正準: 一人称「俺」/ 断定調「〜だぜ」「〜だろ!」
// PC呼称:「大家」
// ============================================================
const N = (id, node) => ({ id, owner: 'JIN', ...node });

export const DLG_JIN = [
  // ---------- 初対面 ----------
  N('DLG_JIN_FIRST_001', {
    type: 'EVENT', pool: 'EVENT', once: true,
    lines: [
      { sp: 'JIN', text: 'おう! あんたが新しい大家か! 俺はジンパチだ!' },
      { sp: 'JIN', text: 'この塔のことなら俺に聞け! 階段の数なら全部言えるぜ。毎朝10往復してるからな!' },
      { sp: 'JIN', text: 'よろしくな、大家! 困ったことがあったら俺を呼べ!' },
    ],
    effects: ['flag(FLG_MET_JIN)', 'aff(JIN,2)', 'info(INFO_JIN_STAIRS)', 'log(EVENT)'],
  }),

  // ---------- ランク解放イベント ----------
  N('DLG_JIN_EV_S3', {
    type: 'EVENT', pool: 'EVENT', once: true,
    cond: 'rank(PC, JIN) >= 3',
    lines: [
      { sp: 'JIN', text: 'おい大家、ちょっと来い。……頼みがあるんだ。' },
      { sp: 'JIN', text: '俺の部屋に畳が欲しいんだよ。畳の上でストレッチすんのが夢なんだぜ。' },
      { sp: 'JIN', text: 'ガチャで出たらでいい! 待ってるぜ!' },
    ],
    effects: ['flag(FLG_EV_JIN_S3)', 'flag(FLG_Q_JIN_TATAMI)', 'log(EVENT)'],
  }),
  N('DLG_JIN_EV_TATAMI_DONE', {
    type: 'EVENT', pool: 'EVENT', once: true,
    cond: 'flag(FLG_Q_JIN_TATAMI_DONE)',
    lines: [
      { sp: 'JIN', text: 'おおお! 畳だ! 本物の畳だぜ!!' },
      { sp: 'JIN', text: 'あんた最高だな! ほら、これ、俺が拾い集めたコインだ。取っとけ!' },
    ],
    effects: ['aff(JIN,5)', 'coin(8)', 'log(EVENT)'],
  }),
  N('DLG_JIN_EV_S5', {
    type: 'EVENT', pool: 'EVENT', once: true,
    cond: 'rank(PC, JIN) >= 5',
    lines: [
      { sp: 'JIN', text: '……なあ大家。俺がなんで毎朝階段を走るか、教えてやろうか。' },
      { sp: 'JIN', text: '昔、ムニが熱出した夜にな、下の薬局まで階段で往復したんだ。エレベーターなんてねえからよ。' },
      { sp: 'JIN', text: 'あの時「もっと速けりゃ」って思ったんだよ。それだけだぜ。……笑うなよ!' },
    ],
    effects: ['flag(FLG_EV_JIN_S5)', 'aff(JIN,4)', 'log(EVENT)'],
  }),

  // ---------- 汎用 ----------
  N('DLG_JIN_GEN_001', { type: 'TALK', pool: 'GENERIC', lines: [{ sp: 'JIN', text: 'おう、大家! 今日も塔はでっかくなってるか?' }], effects: ['aff(JIN,1)'] }),
  N('DLG_JIN_GEN_002', { type: 'TALK', pool: 'GENERIC', lines: [{ sp: 'JIN', text: 'ヒュウのやつ、また鏡見てやがる。……俺は拳を見る! それだけの違いだぜ。' }], effects: ['aff(JIN,1)'] }),
  N('DLG_JIN_GEN_003', { type: 'TALK', pool: 'GENERIC', lines: [{ sp: 'JIN', text: 'レニィのやつ、また寝てんのか? しょうがねえなあ! ……まあ、あいつはあれでいいんだよ。' }], effects: ['aff(JIN,1)'] }),
  N('DLG_JIN_GEN_004', { type: 'TALK', pool: 'GENERIC', lines: [{ sp: 'JIN', text: '飯は喫茶店のナポリタン大盛りに限るぜ! あれは芸術だろ!' }], effects: ['aff(JIN,1)'] }),
  N('DLG_JIN_GEN_005', { type: 'TALK', pool: 'GENERIC', lines: [{ sp: 'JIN', text: 'コイン探しなら任せろ! ……どこにあるかは知らねえけどな! ガハハ!' }], effects: ['aff(JIN,1)'] }),
  N('DLG_JIN_GEN_006', { type: 'TALK', pool: 'GENERIC', lines: [{ sp: 'JIN', text: '筋肉ってのはな、裏切らねえんだ。この塔の柱と一緒だぜ!' }], effects: ['aff(JIN,1)'] }),

  // ---------- 時間帯 ----------
  N('DLG_JIN_TIME_MORN_001', { type: 'TALK', pool: 'COND', cond: 'time == MORNING', lines: [{ sp: 'JIN', text: 'おう! 今ちょうど7往復目だぜ! あんたも走るか? 階段は裏切らねえぞ!' }], effects: ['aff(JIN,1)', 'info(INFO_JIN_STAIRS)'] }),
  N('DLG_JIN_TIME_MORN_002', { type: 'TALK', pool: 'COND', cond: 'time == MORNING', lines: [{ sp: 'JIN', text: '朝飯前のひと汗が最高なんだよ! 大家も健康には気をつけろよな!' }], effects: ['aff(JIN,1)'] }),
  N('DLG_JIN_TIME_DAY_001', { type: 'TALK', pool: 'COND', cond: 'time == DAY', lines: [{ sp: 'JIN', text: '昼間は体を動かすに限るぜ。じっとしてると錆びるからな!' }], effects: ['aff(JIN,1)'] }),
  N('DLG_JIN_TIME_EVE_001', { type: 'TALK', pool: 'COND', cond: 'time == EVENING', lines: [{ sp: 'JIN', text: '夕方の腹の減り具合、これがたまらねえんだよな! 今日はラーメンか、飯屋か……!' }], effects: ['aff(JIN,1)'] }),
  N('DLG_JIN_TIME_NIGHT_001', { type: 'TALK', pool: 'COND', cond: 'time == NIGHT', lines: [{ sp: 'JIN', text: '風呂上がりの夜風! これだから銭湯はやめられねえんだぜ。……え、まだ銭湯ない? 大家、頼んだぜ!' }], effects: ['aff(JIN,1)'] }),
  N('DLG_JIN_TIME_NIGHT_002', { type: 'TALK', pool: 'COND', cond: 'time == NIGHT and built(sento)', lines: [{ sp: 'JIN', text: '龍の湯、最高だったぜ! 一番風呂は俺のもんだ!' }], effects: ['aff(JIN,1)'] }),
  N('DLG_JIN_TIME_MID_001', { type: 'TALK', pool: 'COND', cond: 'time == MIDNIGHT', lines: [{ sp: 'JIN', text: 'ふぁ……こんな時間に何だよ大家ぁ……。明日も朝から鍛錬なんだぜ、俺は……。' }], effects: ['aff(JIN,1)'] }),

  // ---------- 天候 ----------
  N('DLG_JIN_WX_RAIN_001', { type: 'TALK', pool: 'COND', cond: 'weather == RAIN', lines: [{ sp: 'JIN', text: '雨か! 外を走れねえのは残念だが、室内トレに切り替えだぜ! 腕立て500回!' }], effects: ['aff(JIN,1)'] }),
  N('DLG_JIN_WX_RAIN_002', { type: 'TALK', pool: 'COND', cond: 'weather == RAIN', lines: [{ sp: 'JIN', text: '雨の日はよ、なんか塔全体がしっとり静かでな。……嫌いじゃねえぜ、こういうのも。' }], effects: ['aff(JIN,1)'] }),
  N('DLG_JIN_WX_SUN_001', { type: 'TALK', pool: 'COND', cond: 'weather == SUNNY', lines: [{ sp: 'JIN', text: '快晴! 絶好の鍛錬日和だぜ! 見ろよこの青空、走るしかねえだろ!' }], effects: ['aff(JIN,1)'] }),
  N('DLG_JIN_WX_CLOUD_001', { type: 'TALK', pool: 'COND', cond: 'weather == CLOUDY', lines: [{ sp: 'JIN', text: '曇りは涼しくて走りやすいんだぜ。天気にも使い道ってもんがあるだろ!' }], effects: ['aff(JIN,1)'] }),

  // ---------- 季節 ----------
  N('DLG_JIN_SEA_SPR_001', { type: 'TALK', pool: 'COND', cond: 'season == SPRING', lines: [{ sp: 'JIN', text: '春だな! 新しいことを始めるには最高の季節だぜ。大家は何を始めるんだ?' }], effects: ['aff(JIN,1)'] }),
  N('DLG_JIN_SEA_SUM_001', { type: 'TALK', pool: 'COND', cond: 'season == SUMMER', lines: [{ sp: 'JIN', text: '夏! 汗! 最高だろ! 走って、風呂入って、冷えた麦茶! 人生これだぜ!' }], effects: ['aff(JIN,1)'] }),
  N('DLG_JIN_SEA_AUT_001', { type: 'TALK', pool: 'COND', cond: 'season == AUTUMN', lines: [{ sp: 'JIN', text: '食欲の秋だぜ! 何を食っても美味い! 困ったことに全部大盛りにしちまう!' }], effects: ['aff(JIN,1)'] }),
  N('DLG_JIN_SEA_WIN_001', { type: 'TALK', pool: 'COND', cond: 'season == WINTER', lines: [{ sp: 'JIN', text: '寒いか? 走れば温まるぜ! ……嘘だ、悪かった。今日はさすがに俺も温かい飯がいい。' }], effects: ['aff(JIN,1)'] }),

  // ---------- 施設 ----------
  N('DLG_JIN_FAC_RAMEN_001', { type: 'TALK', pool: 'FAC', cond: 'location == ramen', lines: [{ sp: 'JIN', text: '大盛り! 替え玉! チャーシュー追加! ……なんだよ大家、そんな目で見るなよ。育ち盛りなんだぜ。' }], effects: ['aff(JIN,1)'] }),
  N('DLG_JIN_FAC_GAME_001', { type: 'TALK', pool: 'FAC', cond: 'location == game', lines: [{ sp: 'JIN', text: 'このパンチマシン、俺の記録が塗り替えられてやがる……! 誰だ! 勝負だぜ!' }], effects: ['aff(JIN,1)'] }),
  N('DLG_JIN_FAC_SENTO_001', { type: 'TALK', pool: 'FAC', cond: 'location == sento', lines: [{ sp: 'JIN', text: '富士山の壁画を見ながら入る湯は格別だぜ! 大家も入ってけよ!' }], effects: ['aff(JIN,1)'] }),

  // ---------- 状態特化 ----------
  N('DLG_JIN_TASTE_001', {
    type: 'TALK', pool: 'STATE', cond: 'location == HOME_JIN and taste_score(JIN) >= 4', once: true,
    lines: [{ sp: 'JIN', text: '見ろよこの部屋! 鍛錬器具に畳! 男の城ってやつだぜ! 大家、あんた分かってるな!' }],
    effects: ['aff(JIN,3)', 'log(DAILY)'],
  }),
  N('DLG_JIN_SLEEP_001', { type: 'TALK', pool: 'STATE', cond: 'activity(JIN) == SLEEP', weight: 20, lines: [{ sp: 'JIN', text: 'ぐう……もう食えねえ……いや、食える……' }] }),
  N('DLG_JIN_RUMOR_SWEETS', {
    type: 'TALK', pool: 'STATE', cond: 'heard_rumor(RUM_JIN_SWEETS) and not flag(FLG_RUM_JIN_SWEETS_OK)', weight: 30,
    lines: [
      { sp: 'JIN', text: 'な……!? 誰から聞いた!? カネ婆か!? あの婆さん、口が軽すぎるだろ!' },
      { sp: 'JIN', text: '……ああそうだよ! 俺は甘いもんが好きだよ! ラムネ菓子最高だよ! 悪いか!' },
    ],
    choices: [
      { text: '悪くない。むしろいい', effects: ['aff(JIN,3)'], lines: [{ sp: 'JIN', text: '……お、おう。あんた、いいやつだな。今度いちご飴おごってやるぜ。' }] },
      { text: '意外すぎる', effects: ['aff(JIN,1)'], lines: [{ sp: 'JIN', text: 'うるせえ! 筋肉は糖分でできてんだよ! 多分な!' }] },
    ],
    effects: ['flag(FLG_RUM_JIN_SWEETS_OK)', 'info(INFO_JIN_SWEETS)', 'log(RUMOR)'],
  }),

  // ---------- バーク ----------
  N('BRK_JIN_001', { type: 'BARK', pool: 'BARK', lines: [{ sp: 'JIN', text: 'ウォラァ! 気合だぜ!' }] }),
  N('BRK_JIN_002', { type: 'BARK', pool: 'BARK', cond: 'time == MORNING', lines: [{ sp: 'JIN', text: '8往復目ェ!!' }] }),
  N('BRK_JIN_003', { type: 'BARK', pool: 'BARK', cond: 'time == EVENING', lines: [{ sp: 'JIN', text: '腹減ったな……' }] }),
  N('BRK_JIN_004', { type: 'BARK', pool: 'BARK', cond: 'activity(JIN) == TRAINING', weight: 20, lines: [{ sp: 'JIN', text: 'ハッ! ハッ! ハッ!' }] }),
];
