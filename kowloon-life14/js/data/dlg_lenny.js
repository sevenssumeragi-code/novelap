// ============================================================
// レニィ会話DB — 口調正準: 一人称「僕」/「〜だよ」「〜だね」まれに「〜だよぉ」
// PC呼称:「大家さん」/ ジンパチ・ヒュウは呼び捨て
// ============================================================
const N = (id, node) => ({ id, owner: 'LENNY', ...node });

export const DLG_LENNY = [
  // ---------- 初対面 (EVENT, once) ----------
  N('DLG_LEN_FIRST_001', {
    type: 'EVENT', pool: 'EVENT', once: true,
    lines: [
      { sp: 'LENNY', text: 'ふわぁ……あれ、はじめて見る顔だね。' },
      { sp: 'LENNY', text: 'もしかして、この塔の大家さん? 僕はレニィ。5階に住んでるんだ。' },
      { sp: 'LENNY', text: 'よろしくね、大家さん。……ふぁ。ごめん、まだちょっと眠くて……' },
    ],
    effects: ['flag(FLG_MET_LENNY)', 'aff(LENNY,2)', 'log(EVENT)'],
  }),

  // ---------- ランク解放イベント ----------
  N('DLG_LEN_EV_S3', {
    type: 'EVENT', pool: 'EVENT', once: true,
    cond: 'rank(PC, LENNY) >= 3',
    lines: [
      { sp: 'LENNY', text: 'あのね、大家さん。僕、よく海の夢を見るんだ。' },
      { sp: 'LENNY', text: '青くて、しずかで、ゆらゆらしてて。……この街のネオンも、夜はちょっと海みたいだよね。' },
    ],
    choices: [
      { text: 'いつか本物の海を見に行こう', effects: ['aff(LENNY,3)'], lines: [{ sp: 'LENNY', text: 'ほんと? 約束だよ。……ふふ、楽しみで眠れなくなりそう……なんてね。多分すぐ寝ちゃうけど。' }] },
      { text: '夢の中で泳げるの?', effects: ['aff(LENNY,2)'], lines: [{ sp: 'LENNY', text: '泳げるよぉ。息もできるんだ。夢っていいよね。' }] },
    ],
    effects: ['flag(FLG_EV_LENNY_S3)', 'info(INFO_LENNY_SEA_DREAM)', 'log(EVENT)'],
  }),
  N('DLG_LEN_EV_S5', {
    type: 'EVENT', pool: 'EVENT', once: true,
    cond: 'rank(PC, LENNY) >= 5',
    lines: [
      { sp: 'LENNY', text: '大家さん、ここだけの話なんだけど。' },
      { sp: 'LENNY', text: '僕がいつも眠いのはね、夜、みんなの部屋の灯りを数えてるからなんだ。' },
      { sp: 'LENNY', text: 'ジンパチの部屋、ヒュウの部屋、ムニの部屋……全部ついてるのを確かめると、安心して眠れるんだよ。' },
      { sp: 'LENNY', text: '……大家さんが来てから、この塔、灯りが増えたね。ありがと。' },
    ],
    effects: ['flag(FLG_EV_LENNY_S5)', 'aff(LENNY,4)', 'log(EVENT)'],
  }),

  // ---------- 汎用 (フォールバック: 無条件) ----------
  N('DLG_LEN_GEN_001', { type: 'TALK', pool: 'GENERIC', lines: [{ sp: 'LENNY', text: 'ふぁ……おはよ、大家さん。あれ、今なんじだっけ。' }], effects: ['aff(LENNY,1)'] }),
  N('DLG_LEN_GEN_002', { type: 'TALK', pool: 'GENERIC', lines: [{ sp: 'LENNY', text: 'この塔、毎日ちょっとずつ形が変わるよね。生きてるみたいだよ。' }], effects: ['aff(LENNY,1)'] }),
  N('DLG_LEN_GEN_003', { type: 'TALK', pool: 'GENERIC', lines: [{ sp: 'LENNY', text: 'ジンパチの声はさ、三階下まで聞こえるんだよ。元気だねえ。' }], effects: ['aff(LENNY,1)'] }),
  N('DLG_LEN_GEN_004', { type: 'TALK', pool: 'GENERIC', lines: [{ sp: 'LENNY', text: 'ヒュウはまた鏡を見てたよ。よく飽きないよねぇ。……あ、本人には内緒だよ。' }], effects: ['aff(LENNY,1)'] }),
  N('DLG_LEN_GEN_005', { type: 'TALK', pool: 'GENERIC', lines: [{ sp: 'LENNY', text: 'コインなら、お店の物陰でキラッて光ってるのを見たことあるよ。夢だったかもだけど。' }], effects: ['aff(LENNY,1)'] }),
  N('DLG_LEN_GEN_006', { type: 'TALK', pool: 'GENERIC', lines: [{ sp: 'LENNY', text: 'むにゃ……あ、ごめん。立ったまま寝てた。' }], effects: ['aff(LENNY,1)'] }),

  // ---------- 時間帯 ----------
  N('DLG_LEN_TIME_MORN_001', { type: 'TALK', pool: 'COND', cond: 'time == MORNING', lines: [{ sp: 'LENNY', text: 'おはよ……。朝はね、世界がまだ半分夢の中にいる感じがして、好きだよ。' }], effects: ['aff(LENNY,1)'] }),
  N('DLG_LEN_TIME_MORN_002', { type: 'TALK', pool: 'COND', cond: 'time == MORNING', lines: [{ sp: 'LENNY', text: 'ふぁ……あと五分。……五分だけだよぉ……' }], effects: ['aff(LENNY,1)'] }),
  N('DLG_LEN_TIME_DAY_001', { type: 'TALK', pool: 'COND', cond: 'time == DAY', lines: [{ sp: 'LENNY', text: 'お昼のあとって、どうしてこんなに眠いんだろうね。世界の七不思議だよ。' }], effects: ['aff(LENNY,1)'] }),
  N('DLG_LEN_TIME_EVE_001', { type: 'TALK', pool: 'COND', cond: 'time == EVENING', lines: [{ sp: 'LENNY', text: '夕方の光って、はちみつみたいだね。塔がぜんぶ甘く見えるよ。' }], effects: ['aff(LENNY,1)'] }),
  N('DLG_LEN_TIME_NIGHT_001', { type: 'TALK', pool: 'COND', cond: 'time == NIGHT', lines: [{ sp: 'LENNY', text: '夜のネオンを見てると、水の中にいるみたいな気分になるんだ。……きれいだよぉ。' }], effects: ['aff(LENNY,1)'] }),
  N('DLG_LEN_TIME_NIGHT_002', { type: 'TALK', pool: 'COND', cond: 'time == NIGHT', lines: [{ sp: 'LENNY', text: 'ムニ、もう寝たかなあ。あの子、夜はさみしがるから。' }], effects: ['aff(LENNY,1)', 'info(INFO_MUNI_NIGHT)'] }),
  N('DLG_LEN_TIME_MID_001', { type: 'TALK', pool: 'COND', cond: 'time == MIDNIGHT', lines: [{ sp: 'LENNY', text: '……大家さん、まだ起きてるの? 夜ふかしはだめだよ。……僕? 僕はこれが夢の中かもしれないし。' }], effects: ['aff(LENNY,1)'] }),

  // ---------- 天候 ----------
  N('DLG_LEN_WX_RAIN_001', {
    type: 'TALK', pool: 'COND', cond: 'weather == RAIN', weight: 14,
    lines: [
      { sp: 'LENNY', text: '雨の音、聞こえる? 屋根とか看板とかにあたって、ぜんぶ違う音がするんだよ。' },
      { sp: 'LENNY', text: '雨の日の街はね、水槽の中みたいで……僕、けっこう好きなんだ。' },
    ],
    effects: ['aff(LENNY,1)', 'info(INFO_LENNY_LIKES_RAIN)'],
  }),
  N('DLG_LEN_WX_RAIN_002', { type: 'TALK', pool: 'COND', cond: '@rainy_night', weight: 14, lines: [{ sp: 'LENNY', text: '雨の夜は、いちばんよく眠れるんだよぉ……。ネオンが濡れて、にじんで……きれいだねえ。' }], effects: ['aff(LENNY,1)', 'info(INFO_LENNY_LIKES_RAIN)'] }),
  N('DLG_LEN_WX_SUN_001', { type: 'TALK', pool: 'COND', cond: 'weather == SUNNY and time in [DAY, MORNING]', lines: [{ sp: 'LENNY', text: 'いいお天気だね。お布団干したら、お日さまのにおいになるんだよ。……早く夜にならないかな。' }], effects: ['aff(LENNY,1)'] }),
  N('DLG_LEN_WX_CLOUD_001', { type: 'TALK', pool: 'COND', cond: 'weather == CLOUDY', lines: [{ sp: 'LENNY', text: 'くもりの日はね、空がお昼寝してるんだと思うよ。だから僕もお昼寝するんだ。理屈は完璧だね。' }], effects: ['aff(LENNY,1)'] }),

  // ---------- 季節 ----------
  N('DLG_LEN_SEA_SPR_001', { type: 'TALK', pool: 'COND', cond: 'season == SPRING', lines: [{ sp: 'LENNY', text: '春はねむいねえ……。花屋さんの前を通ると、いいにおいがして、もっとねむくなるよぉ。' }], effects: ['aff(LENNY,1)'] }),
  N('DLG_LEN_SEA_SUM_001', { type: 'TALK', pool: 'COND', cond: 'season == SUMMER', lines: [{ sp: 'LENNY', text: '夏の夜って、遠くでお祭りの音がしてる気がするんだ。耳をすませてみて。' }], effects: ['aff(LENNY,1)'] }),
  N('DLG_LEN_SEA_AUT_001', { type: 'TALK', pool: 'COND', cond: 'season == AUTUMN', lines: [{ sp: 'LENNY', text: '秋はお昼寝が一年でいちばんおいしい季節だよ。おふとんがちょうどいいんだ。' }], effects: ['aff(LENNY,1)'] }),
  N('DLG_LEN_SEA_WIN_001', { type: 'TALK', pool: 'COND', cond: 'season == WINTER', lines: [{ sp: 'LENNY', text: 'さむいねえ。こういう日は、みんなでお鍋がいいよね。ジンパチが騒いで、ヒュウが上品に取り分けるんだ。' }], effects: ['aff(LENNY,1)'] }),

  // ---------- 施設・場所 ----------
  N('DLG_LEN_FAC_CAFE_001', { type: 'TALK', pool: 'FAC', cond: 'location == cafe', lines: [{ sp: 'LENNY', text: 'ここのミルクコーヒー、飲むと体があったかくなって、いい感じに眠く……はっ。寝てないよ。' }], effects: ['aff(LENNY,1)'] }),
  N('DLG_LEN_FAC_ROOF_001', {
    type: 'TALK', pool: 'FAC', cond: 'location == ROOF',
    lines: [
      { sp: 'LENNY', text: '屋上の風、きもちいいよ。街の音がぜんぶ遠くなるんだ。' },
      { sp: 'LENNY', text: '……ちょっとだけ、ここで寝てもいいかな。ちょっとだけだよぉ。' },
    ],
    effects: ['aff(LENNY,1)'],
  }),
  N('DLG_LEN_FAC_FLOWER_001', { type: 'TALK', pool: 'FAC', cond: 'location == flower', lines: [{ sp: 'LENNY', text: '青いお花って、いいよね。ずっと見てられるよ。……買わないの? って? 見てるだけで幸せだからいいんだよ。' }], effects: ['aff(LENNY,1)'] }),

  // ---------- 状態特化 ----------
  N('DLG_LEN_SLEEP_001', {
    type: 'TALK', pool: 'STATE', cond: 'activity(LENNY) == SLEEP or activity(LENNY) == NAP', weight: 20,
    lines: [{ sp: 'LENNY', text: 'すぅ……すぅ……。……うみ……くらげがいっぱい……。' }],
    effects: ['info(INFO_LENNY_SEA_DREAM)'],
  }),
  N('DLG_LEN_TASTE_001', {
    type: 'TALK', pool: 'STATE', cond: 'location == HOME_LENNY and taste_score(LENNY) >= 4', once: true,
    lines: [{ sp: 'LENNY', text: 'ねえ、見て見て。僕の部屋、ふわふわで青いものだらけになったよ。大家さんのおかげだね。……最高のお昼寝ができそうだよぉ。' }],
    effects: ['aff(LENNY,3)', 'log(DAILY)'],
  }),
  N('DLG_LEN_RUMOR_FAIRY', {
    type: 'TALK', pool: 'STATE', cond: 'heard_rumor(RUM_LENNY_FAIRY) and not flag(FLG_RUM_LENNY_FAIRY_OK)', weight: 30,
    lines: [{ sp: 'LENNY', text: 'え? 屋上で妖精と話してる? ……あー、それ多分、洗濯物と話してた時のことだね。妖精さんだったのかなあ、あれ。' }],
    choices: [
      { text: '洗濯物だと思う', effects: ['aff(LENNY,1)'], lines: [{ sp: 'LENNY', text: 'だよねえ。でもヒュウの言うことのほうが、ちょっと素敵だね。' }] },
      { text: '妖精だったのかも', effects: ['aff(LENNY,2)'], lines: [{ sp: 'LENNY', text: 'ふふ、大家さんはそっち側なんだね。うん、僕もそっちがいいな。' }] },
    ],
    effects: ['flag(FLG_RUM_LENNY_FAIRY_OK)', 'log(RUMOR)'],
  }),

  // ---------- バーク ----------
  N('BRK_LEN_001', { type: 'BARK', pool: 'BARK', lines: [{ sp: 'LENNY', text: 'ふわぁ……' }] }),
  N('BRK_LEN_002', { type: 'BARK', pool: 'BARK', cond: 'weather == RAIN', lines: [{ sp: 'LENNY', text: '雨のにおいだ……' }] }),
  N('BRK_LEN_003', { type: 'BARK', pool: 'BARK', cond: 'time == MORNING', lines: [{ sp: 'LENNY', text: 'まだねむい……' }] }),
  N('BRK_LEN_004', { type: 'BARK', pool: 'BARK', cond: 'time in [NIGHT, MIDNIGHT]', lines: [{ sp: 'LENNY', text: 'ネオン、きれいだねえ' }] }),
  N('BRK_LEN_005', { type: 'BARK', pool: 'BARK', cond: 'activity(LENNY) in [SLEEP, NAP]', weight: 25, lines: [{ sp: 'LENNY', text: 'Zzz……' }] }),
];
