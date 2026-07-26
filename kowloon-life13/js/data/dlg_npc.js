// ============================================================
// 主要NPC会話DB — 床屋のオヤジ / 小暮カネ / 郵便屋サン
// カネは kane_softness (= 主要6人の対PC親密度平均) で3段階に軟化する
// (NPC会話設計書 第17.1節)
// ============================================================
const N = (id, node) => ({ id, ...node });

export const DLG_NPC = [
  // ============ 床屋のオヤジ ============
  N('DLG_BRB_FIRST_001', {
    owner: 'BARBER', type: 'EVENT', pool: 'EVENT', once: true,
    lines: [
      { sp: 'BARBER', text: 'おう、いらっしゃい……と思ったら、あんたが新しい大家さんかい。' },
      { sp: 'BARBER', text: 'わしはこの「バーバー飛龍」の主じゃ。この塔の頭は、だいたいわしが刈っとる。' },
      { sp: 'BARBER', text: '伸びたらいつでも来るといい。話のタネなら、髪より多く揃っとるでのう。' },
    ],
    effects: ['flag(FLG_MET_BARBER)', 'aff(BARBER,2)', 'log(EVENT)'],
  }),
  N('DLG_BRB_GEN_001', { owner: 'BARBER', type: 'TALK', pool: 'GENERIC', lines: [{ sp: 'BARBER', text: '髪ってのはのう、その人の暮らしが出るんじゃ。よう寝る子の寝ぐせは、幸せの形をしとるよ。' }], effects: ['aff(BARBER,1)'] }),
  N('DLG_BRB_GEN_002', { owner: 'BARBER', type: 'TALK', pool: 'GENERIC', lines: [{ sp: 'BARBER', text: 'ジンパチのツンツン頭かい? ありゃ地毛じゃ。ワックスいらずで羨ましいのう。' }], effects: ['aff(BARBER,1)'] }),
  N('DLG_BRB_GEN_003', { owner: 'BARBER', type: 'TALK', pool: 'GENERIC', lines: [{ sp: 'BARBER', text: 'ヒュウの前髪には触らせてもらえん。「聖域」なんじゃと。プロとしては悔しいがのう、あの仕上がりは見事じゃ。' }], effects: ['aff(BARBER,1)'] }),
  N('DLG_BRB_NEO_001', {
    owner: 'BARBER', type: 'TALK', pool: 'STATE', cond: 'rank(PC, BARBER) >= 2 and not heard_rumor(RUM_NEO_BARBER)', weight: 20,
    lines: [
      { sp: 'BARBER', text: 'ネオの坊やの金髪、見たかい? ありゃあ絹糸じゃよ。' },
      { sp: 'BARBER', text: '本人は「手入れだけせい」と言うがのう。正直、わしも切るのは惜しい。あの髪には、何か物語がある。' },
    ],
    effects: ['rumor(RUM_NEO_BARBER)', 'info(INFO_NEO_PAST_1)', 'aff(BARBER,1)', 'log(RUMOR)'],
  }),
  N('DLG_BRB_TIME_MORN_001', { owner: 'BARBER', type: 'TALK', pool: 'COND', cond: 'time == MORNING', lines: [{ sp: 'BARBER', text: '開店前の仕込み中じゃ。ハサミを研ぐこの時間が、一番心が澄むんじゃよ。' }], effects: ['aff(BARBER,1)'] }),
  N('DLG_BRB_WX_RAIN_001', { owner: 'BARBER', type: 'TALK', pool: 'COND', cond: 'weather == RAIN', lines: [{ sp: 'BARBER', text: '雨の日は客が減っての。まあ、ゆっくりラジオでも聴くさね。' }], effects: ['aff(BARBER,1)'] }),
  N('BRK_BRB_001', { owner: 'BARBER', type: 'BARK', pool: 'BARK', lines: [{ sp: 'BARBER', text: 'チョキチョキ……' }] }),

  // ============ 小暮カネ (軟化3段階) ============
  N('DLG_KAN_FIRST_001', {
    owner: 'KANE', type: 'EVENT', pool: 'EVENT', once: true,
    lines: [
      { sp: 'KANE', text: '……なんだい、じろじろ見て。あんたが新しい大家かい。' },
      { sp: 'KANE', text: 'あたしは小暮カネ。この路地の生き字引だよ。ふん、若い大家に何ができるんだかねぇ。' },
      { sp: 'KANE', text: '……まあ、せいぜい気張りな。塔が育つのは、悪い気はしないからさ。' },
    ],
    effects: ['flag(FLG_MET_KANE)', 'aff(KANE,2)', 'log(EVENT)'],
  }),
  // 毒舌期 (softness < 40)
  N('DLG_KAN_HARD_001', { owner: 'KANE', type: 'TALK', pool: 'COND', cond: 'kane_softness < 40', lines: [{ sp: 'KANE', text: 'ふん、暇なのかい大家。あたしゃ忙しいんだよ。……何がって? 路地の見張りだよ。' }], effects: ['aff(KANE,1)'] }),
  N('DLG_KAN_HARD_002', { owner: 'KANE', type: 'TALK', pool: 'COND', cond: 'kane_softness < 40', lines: [{ sp: 'KANE', text: 'あの金ぴか騎士かい? 気取っちゃって、いけすかないねぇ。……まあ、口喧嘩の相手としては悪くないけどさ。' }], effects: ['aff(KANE,1)'] }),
  // 軟化期 (40-69)
  N('DLG_KAN_SOFT_001', { owner: 'KANE', type: 'TALK', pool: 'COND', cond: '@kane_soft and kane_softness < 70', lines: [{ sp: 'KANE', text: '……あんた、あの子らと仲良くやってるらしいじゃないか。ふん。……悪くない大家だよ、あんたは。' }], effects: ['aff(KANE,1)'] }),
  N('DLG_KAN_SOFT_002', { owner: 'KANE', type: 'TALK', pool: 'COND', cond: '@kane_soft and kane_softness < 70', lines: [{ sp: 'KANE', text: 'ムニが今日も元気に走り回ってたよ。ああいうのを見ると、この塔も捨てたもんじゃないと思うのさ。' }], effects: ['aff(KANE,1)'] }),
  // 世話焼き期 (70+)
  N('DLG_KAN_WARM_001', { owner: 'KANE', type: 'TALK', pool: 'COND', cond: '@kane_warm', weight: 12, lines: [{ sp: 'KANE', text: 'おや大家、ちゃんと食べてるのかい? ほら、飴やるよ。……ジンパチには内緒だよ。あの子、甘いものに目がないからね。' }], effects: ['aff(KANE,1)', 'rumor(RUM_JIN_SWEETS)'] }),
  N('DLG_KAN_WARM_002', {
    owner: 'KANE', type: 'TALK', pool: 'COND', cond: '@kane_warm and time in [NIGHT, MIDNIGHT]', weight: 14,
    lines: [
      { sp: 'KANE', text: '……昔話をしようかね。あたしは昔、この塔の一階で小さな食堂をやってたのさ。' },
      { sp: 'KANE', text: '亭主の代からの店でね。閉めた日は、そりゃあ泣いたよ。……でもね、こうして塔に灯りが増えていくのを見てると、また誰かが始めるんだって分かるのさ。' },
      { sp: 'KANE', text: 'あんたの増築、あたしは楽しみにしてるんだよ。……言っとくけど、二度は言わないからね。' },
    ],
    effects: ['info(INFO_KANE_PAST)', 'aff(KANE,3)', 'log(EVENT)'],
  }),
  N('DLG_KAN_MUNI_001', { owner: 'KANE', type: 'TALK', pool: 'GENERIC', weight: 8, lines: [{ sp: 'KANE', text: 'ムニは塔のみんなで育ててる下宿の子なのさ。……あたし? あたしは飴を渡す係だよ。' }], effects: ['aff(KANE,1)', 'info(INFO_MUNI_LODGER)'] }),
  N('DLG_KAN_GEN_001', { owner: 'KANE', type: 'TALK', pool: 'GENERIC', lines: [{ sp: 'KANE', text: 'この路地はねぇ、あたしの庭みたいなもんさ。落ちてるコインの一枚まで把握してる……と言いたいけど、最近目が悪くてねぇ。' }], effects: ['aff(KANE,1)'] }),
  N('DLG_KAN_GEN_002', { owner: 'KANE', type: 'TALK', pool: 'GENERIC', lines: [{ sp: 'KANE', text: 'ゲルの嬢ちゃんは口は硬いが情は深いよ。夜中にムニを送ってくの、あたしゃ知ってるんだ。' }], effects: ['aff(KANE,1)', 'info(INFO_GERU_CARING)'] }),
  N('BRK_KAN_001', { owner: 'KANE', type: 'BARK', pool: 'BARK', lines: [{ sp: 'KANE', text: 'ふん、今日も騒がしいねぇ' }] }),
  N('BRK_KAN_002', { owner: 'KANE', type: 'BARK', pool: 'BARK', cond: '@kane_warm', lines: [{ sp: 'KANE', text: '飴、いるかい?' }] }),

  // ============ 郵便屋サン ============
  N('DLG_PST_FIRST_001', {
    owner: 'POSTMAN', type: 'EVENT', pool: 'EVENT', once: true,
    lines: [
      { sp: 'POSTMAN', text: 'あっ、どうもっす! 新しい大家さんっすよね? 九龍郵便局の配達担当っす!' },
      { sp: 'POSTMAN', text: 'この塔、階段だらけで配達は大変っすけど、その分、手紙を渡した時の顔が見られるんで好きっすよ。' },
      { sp: 'POSTMAN', text: '大家さん宛の手紙が来たら、ポストに入れとくんで! 郵便局でいつでも読めるっすよ!' },
    ],
    effects: ['flag(FLG_MET_POSTMAN)', 'aff(POSTMAN,2)', 'log(EVENT)'],
  }),
  N('DLG_PST_GEN_001', { owner: 'POSTMAN', type: 'TALK', pool: 'GENERIC', lines: [{ sp: 'POSTMAN', text: 'この塔の人たち、いまだに手紙を書くんすよね。いいと思うっす。声より残るんで。' }], effects: ['aff(POSTMAN,1)', 'info(INFO_POSTMAN_LETTERS)'] }),
  N('DLG_PST_GEN_002', { owner: 'POSTMAN', type: 'TALK', pool: 'GENERIC', lines: [{ sp: 'POSTMAN', text: '配達のコツっすか? 階段は2段飛ばし、ジンパチさんの朝ダッシュとはすれ違わない。以上っす!' }], effects: ['aff(POSTMAN,1)'] }),
  N('DLG_PST_HINT_001', {
    owner: 'POSTMAN', type: 'TALK', pool: 'STATE', cond: 'rank(PC, POSTMAN) >= 3', weight: 8,
    lines: [{ sp: 'POSTMAN', text: '守秘義務の範囲で言うと……住民の皆さん、大家さんと仲良くなると手紙を書きたくなるみたいっすよ。季節の変わり目とか、特に。' }],
    effects: ['aff(POSTMAN,1)'],
  }),
  N('DLG_PST_WX_RAIN_001', { owner: 'POSTMAN', type: 'TALK', pool: 'COND', cond: 'weather == RAIN', lines: [{ sp: 'POSTMAN', text: '雨の日の配達はしんどいっすけど、手紙は絶対濡らさないっす。プロなんで!' }], effects: ['aff(POSTMAN,1)'] }),
  N('BRK_PST_001', { owner: 'POSTMAN', type: 'BARK', pool: 'BARK', cond: 'activity(POSTMAN) == DELIVER', weight: 20, lines: [{ sp: 'POSTMAN', text: '配達っす〜!' }] }),
  N('BRK_PST_002', { owner: 'POSTMAN', type: 'BARK', pool: 'BARK', lines: [{ sp: 'POSTMAN', text: '本日も定時配達っす' }] }),
];
