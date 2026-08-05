// ============================================================
// ヒュウ会話DB — 口調正準: 常に敬語のナルシスト「〜ですね」「〜でしょう?」
// レニィは呼び捨て / ジンパチは「ジンパチくん」
// ============================================================
const N = (id, node) => ({ id, owner: 'HYU', ...node });

export const DLG_HYU = [
  // ---------- 初対面 ----------
  N('DLG_HYU_FIRST_001', {
    type: 'EVENT', pool: 'EVENT', once: true,
    lines: [
      { sp: 'HYU', text: 'おや。見ない顔ですね。……なるほど、あなたが新しい大家さんですか。' },
      { sp: 'HYU', text: '私はヒュウ。この塔で最も美しい住人、と言えば分かりやすいでしょう?' },
      { sp: 'HYU', text: 'ふふ。冗談と受け取っていただいて結構ですよ。……半分は事実ですが。' },
    ],
    effects: ['flag(FLG_MET_HYU)', 'aff(HYU,2)', 'log(EVENT)'],
  }),

  // ---------- ランク解放イベント ----------
  N('DLG_HYU_EV_S3', {
    type: 'EVENT', pool: 'EVENT', once: true,
    cond: 'rank(PC, HYU) >= 3',
    lines: [
      { sp: 'HYU', text: '大家さん。ひとつ、重大な秘密を打ち明けましょう。' },
      { sp: 'HYU', text: 'この完璧な前髪……セットに毎朝2時間かかっています。' },
      { sp: 'HYU', text: '美とは、才能ではなく継続なのですよ。……誰にも言わないでくださいね?' },
    ],
    choices: [
      { text: '2時間!?', effects: ['aff(HYU,2)'], lines: [{ sp: 'HYU', text: '驚きましたか? 芸術には時間がかかるものです。' }] },
      { text: '努力家なんだね', effects: ['aff(HYU,3)'], lines: [{ sp: 'HYU', text: '……ほう。あなたは物事の本質が見える人ですね。気に入りました。' }] },
    ],
    effects: ['flag(FLG_EV_HYU_S3)', 'info(INFO_HYU_MORNING)', 'log(EVENT)'],
  }),
  N('DLG_HYU_EV_S5', {
    type: 'EVENT', pool: 'EVENT', once: true,
    cond: 'rank(PC, HYU) >= 5',
    lines: [
      { sp: 'HYU', text: '……ここだけの話ですが。私が毎日鏡を見るのは、自分に見惚れるためだけではありません。' },
      { sp: 'HYU', text: '「今日の自分は、誰かに優しくできる顔をしているか」。それを確認しているのです。' },
      { sp: 'HYU', text: '美しさとは、つまるところ、在り方ですから。……おっと。今のは聞かなかったことに。柄ではありません。' },
    ],
    effects: ['flag(FLG_EV_HYU_S5)', 'aff(HYU,4)', 'log(EVENT)'],
  }),

  // ---------- 汎用 ----------
  N('DLG_HYU_GEN_001', { type: 'TALK', pool: 'GENERIC', lines: [{ sp: 'HYU', text: 'ようこそ。今日の私も完璧ですが、何かご用でしょうか?' }], effects: ['aff(HYU,1)'] }),
  N('DLG_HYU_GEN_002', { type: 'TALK', pool: 'GENERIC', lines: [{ sp: 'HYU', text: 'レニィはまた寝ていましたよ。まったく……絵にはなりますが。' }], effects: ['aff(HYU,1)'] }),
  N('DLG_HYU_GEN_003', { type: 'TALK', pool: 'GENERIC', lines: [{ sp: 'HYU', text: 'ジンパチくん、今朝も声が大きいのです。私の優雅な朝が台無しでしょう?' }], effects: ['aff(HYU,1)'] }),
  N('DLG_HYU_GEN_004', { type: 'TALK', pool: 'GENERIC', lines: [{ sp: 'HYU', text: 'この塔の雑多な美しさ……嫌いではありません。私が住むことで完成する美、と言えるでしょうね。' }], effects: ['aff(HYU,1)'] }),
  N('DLG_HYU_GEN_005', { type: 'TALK', pool: 'GENERIC', lines: [{ sp: 'HYU', text: '薔薇の手入れは欠かせません。美は日々の積み重ねですから。' }], effects: ['aff(HYU,1)'] }),
  N('DLG_HYU_GEN_006', { type: 'TALK', pool: 'GENERIC', lines: [{ sp: 'HYU', text: 'ガチャ、ですか。私ほどの当たりはそうそう出ないでしょうけれど……挑戦する姿は美しいですよ。' }], effects: ['aff(HYU,1)'] }),

  // ---------- 時間帯 ----------
  N('DLG_HYU_TIME_MORN_001', { type: 'TALK', pool: 'COND', cond: 'time == MORNING', lines: [{ sp: 'HYU', text: 'おはようございます。朝の光は、私を最も美しく見せる照明ですね。' }], effects: ['aff(HYU,1)'] }),
  N('DLG_HYU_TIME_MORN_002', { type: 'TALK', pool: 'COND', cond: 'time == MORNING', lines: [{ sp: 'HYU', text: '今、前髪の最終調整が終わったところです。0.5ミリの妥協もありません。' }], effects: ['aff(HYU,1)'] }),
  N('DLG_HYU_TIME_DAY_001', { type: 'TALK', pool: 'COND', cond: 'time == DAY', lines: [{ sp: 'HYU', text: '午後は喫茶店で過ごすに限ります。窓際の席は、私のために設計されたとしか思えませんね。' }], effects: ['aff(HYU,1)'] }),
  N('DLG_HYU_TIME_EVE_001', { type: 'TALK', pool: 'COND', cond: 'time == EVENING', lines: [{ sp: 'HYU', text: '夕暮れの光……悪くない色です。私の髪に合いますから。' }], effects: ['aff(HYU,1)'] }),
  N('DLG_HYU_TIME_NIGHT_001', { type: 'TALK', pool: 'COND', cond: 'time == NIGHT', lines: [{ sp: 'HYU', text: '夜のネオンと私。どちらが輝いているか……ふふ、答えは言わないでおきましょう。' }], effects: ['aff(HYU,1)'] }),
  N('DLG_HYU_TIME_MID_001', { type: 'TALK', pool: 'COND', cond: 'time == MIDNIGHT', lines: [{ sp: 'HYU', text: 'こんな時間まで起きているのですか? ……美容の大敵ですよ。私は例外ですが。' }], effects: ['aff(HYU,1)'] }),

  // ---------- 天候 ----------
  N('DLG_HYU_WX_RAIN_001', { type: 'TALK', pool: 'COND', cond: 'weather == RAIN', lines: [{ sp: 'HYU', text: '雨は嫌いです。前髪が……いえ、なんでもありません。とにかく嫌いです。' }], effects: ['aff(HYU,1)'] }),
  N('DLG_HYU_WX_RAIN_002', {
    type: 'TALK', pool: 'COND', cond: 'weather == RAIN and rank(PC, HYU) >= 3', weight: 14,
    lines: [
      { sp: 'HYU', text: '先ほどムニが濡れて歩いていたので、傘を差してやりました。' },
      { sp: 'HYU', text: '……勘違いしないでください。子供が風邪をひくと、塔全体の美観に関わりますから。' },
    ],
    effects: ['aff(HYU,1)', 'info(INFO_HYU_KIND)'],
  }),
  N('DLG_HYU_WX_SUN_001', { type: 'TALK', pool: 'COND', cond: 'weather == SUNNY', lines: [{ sp: 'HYU', text: '快晴ですね。太陽も、今日の私を見に来たのでしょう。' }], effects: ['aff(HYU,1)'] }),
  N('DLG_HYU_WX_CLOUD_001', { type: 'TALK', pool: 'COND', cond: 'weather == CLOUDY', lines: [{ sp: 'HYU', text: '曇り空。……まあ、主役より目立たない背景、という点では評価できますね。' }], effects: ['aff(HYU,1)'] }),

  // ---------- 季節 ----------
  N('DLG_HYU_SEA_SPR_001', { type: 'TALK', pool: 'COND', cond: 'season == SPRING', lines: [{ sp: 'HYU', text: '春ですね。花々が競って咲いていますが、残念、この塔で一番の華は私です。' }], effects: ['aff(HYU,1)'] }),
  N('DLG_HYU_SEA_SUM_001', { type: 'TALK', pool: 'COND', cond: 'season == SUMMER', lines: [{ sp: 'HYU', text: '夏は試練の季節です。汗は美の敵。ですが、涼しげに見せるのも技術のうちですよ。' }], effects: ['aff(HYU,1)'] }),
  N('DLG_HYU_SEA_AUT_001', { type: 'TALK', pool: 'COND', cond: 'season == AUTUMN', lines: [{ sp: 'HYU', text: '秋は読書の季節……つまり、本を持つ私の横顔が最も映える季節ということです。' }], effects: ['aff(HYU,1)'] }),
  N('DLG_HYU_SEA_WIN_001', { type: 'TALK', pool: 'COND', cond: 'season == WINTER', lines: [{ sp: 'HYU', text: '冬の澄んだ空気は良いですね。マフラーという名の芸術も楽しめますし。' }], effects: ['aff(HYU,1)'] }),

  // ---------- 施設 ----------
  N('DLG_HYU_FAC_CAFE_001', { type: 'TALK', pool: 'FAC', cond: 'location == cafe', lines: [{ sp: 'HYU', text: 'ここのミックスジュース、お勧めですよ。色々混ざって良い味……私のようでしょう?' }], effects: ['aff(HYU,1)'] }),
  N('DLG_HYU_FAC_BARBER_001', { type: 'TALK', pool: 'FAC', cond: 'location == barber', lines: [{ sp: 'HYU', text: 'オヤジさんの腕は確かです。ただし私の前髪だけは、誰にも触らせません。聖域ですので。' }], effects: ['aff(HYU,1)'] }),
  N('DLG_HYU_FAC_KARAOKE_001', { type: 'TALK', pool: 'FAC', cond: 'location == karaoke', lines: [{ sp: 'HYU', text: '私の歌声を聴きたい? ……ふふ、順番待ちのリストに名前をどうぞ。' }], effects: ['aff(HYU,1)'] }),

  // ---------- 状態特化 ----------
  N('DLG_HYU_TASTE_001', {
    type: 'TALK', pool: 'STATE', cond: 'location == HOME_HYU and taste_score(HYU) >= 4', once: true,
    lines: [{ sp: 'HYU', text: 'この部屋……鏡と薔薇と気品。完璧です。大家さん、あなた、私の美学が分かってきましたね?' }],
    effects: ['aff(HYU,3)', 'log(DAILY)'],
  }),
  N('DLG_HYU_SLEEP_001', { type: 'TALK', pool: 'STATE', cond: 'activity(HYU) == SLEEP', weight: 20, lines: [{ sp: 'HYU', text: 'すぅ……。(寝顔まで完璧に整っている)' }] }),
  N('DLG_HYU_RUMOR_SRC_001', {
    type: 'TALK', pool: 'STATE', cond: 'rank(PC, HYU) >= 2 and not heard_rumor(RUM_LENNY_FAIRY)', weight: 6,
    lines: [{ sp: 'HYU', text: 'そういえば、ご存知ですか? レニィは屋上で妖精と話しているらしいですよ。……ふふ、素敵な噂でしょう? 出どころ? さあ、誰でしょうね。' }],
    effects: ['rumor(RUM_LENNY_FAIRY)', 'log(RUMOR)'],
  }),

  // ---------- バーク ----------
  N('BRK_HYU_001', { type: 'BARK', pool: 'BARK', lines: [{ sp: 'HYU', text: 'ふふ……今日も完璧' }] }),
  N('BRK_HYU_002', { type: 'BARK', pool: 'BARK', cond: 'weather == RAIN', lines: [{ sp: 'HYU', text: '前髪が、湿気に……!' }] }),
  N('BRK_HYU_003', { type: 'BARK', pool: 'BARK', cond: 'time == MORNING', lines: [{ sp: 'HYU', text: '本日の仕上がり、上々' }] }),
  N('BRK_HYU_004', { type: 'BARK', pool: 'BARK', cond: 'time in [NIGHT, MIDNIGHT]', lines: [{ sp: 'HYU', text: '夜風も私に見惚れている' }] }),
];
