// ============================================================
// 手紙テンプレート (NPC会話設計書 第7章)
// 本文は固定文でなく「スロット×条件付きバリアント」で組み立てる。
// 同じ ltr_id でも送信時点の世界状態で文面が変わる (第7.3節)。
// 返信は3択の気持ちスタンプ (第7.5節)。last_reply(X) が次の手紙の条件になる。
// ============================================================

const L = (id, t) => ({ id, ...t });

export const LETTERS = [
  // ---------- ランク到達の便り (S3マイルストーン) ----------
  L('LTR_LENNY_S3', {
    sender: 'LENNY', trigger: 'rank(PC, LENNY) >= 3', onceFlag: true,
    slots: {
      GREETING: [
        { cond: 'weather == RAIN', text: 'やあ、大家さん。雨だね。屋根の音を聞きながらこれを書いてるよ。' },
        { cond: 'true', text: 'やあ、大家さん。手紙って初めて書くかも。字、へんじゃないかな。' },
      ],
      BODY: [
        { cond: 'true', text: 'いつも話しかけてくれてありがとう。僕、大家さんとしゃべったあとは、いい夢が見られる気がするんだ。' },
      ],
      CONTEXT: [
        { cond: 'info(INFO_LENNY_SEA_DREAM)', text: 'このあいだ話した海の夢、また見たよ。今度は大家さんも出てきたんだよぉ。' },
        { cond: 'season == SUMMER', text: '夏の夜は、遠くでお祭りの音がする気がするよ。今度いっしょに耳をすまそうね。' },
        { cond: 'true', text: '屋上のお昼寝スポット、いちばんいい場所を教えてあげる。ないしょだよ。' },
      ],
      CLOSING: [
        { cond: 'true', text: 'それじゃ、おやすみなさい。 レニィより' },
      ],
    },
    attachCoin: 2,
    replies: [
      { key: 'HAPPY', label: 'うれしい' },
      { key: 'WORRY', label: '寝すぎに注意…' },
      { key: 'TEASE', label: '字がねむそう' },
    ],
    effects: ['aff(LENNY,2)'],
  }),
  L('LTR_HYU_S3', {
    sender: 'HYU', trigger: 'rank(PC, HYU) >= 3', onceFlag: true,
    slots: {
      GREETING: [{ cond: 'true', text: '拝啓、大家さん。便箋の白は私の美しさを引き立てますね。' }],
      BODY: [{ cond: 'true', text: '日頃の感謝を、あえて手紙で。直接言うには、私は少々照れ屋ですので。……この一文は読まなかったことに。' }],
      CONTEXT: [
        { cond: 'info(INFO_HYU_MORNING)', text: '例の「2時間」の件、他言無用でお願いしますよ。美の舞台裏は秘するものです。' },
        { cond: 'true', text: '今度、喫茶店のミックスジュースをご馳走しましょう。私のような味がします。' },
      ],
      CLOSING: [{ cond: 'true', text: '敬具 ヒュウ (今日も完璧)' }],
    },
    attachCoin: 2,
    replies: [
      { key: 'HAPPY', label: 'ありがとう' },
      { key: 'TEASE', label: '照れ屋なんだ?' },
      { key: 'WORRY', label: '前髪お大事に' },
    ],
    effects: ['aff(HYU,2)'],
  }),
  L('LTR_JIN_S3', {
    sender: 'JIN', trigger: 'rank(PC, JIN) >= 3', onceFlag: true,
    slots: {
      GREETING: [{ cond: 'true', text: 'よう大家! 手紙なんて柄じゃねえけど、郵便屋に書けって言われたぜ!' }],
      BODY: [{ cond: 'true', text: 'あんたが来てから塔が賑やかでいいぜ。俺の朝の階段ダッシュも気合が入るってもんだ!' }],
      CONTEXT: [
        { cond: 'flag(FLG_Q_JIN_TATAMI_DONE)', text: '畳、まじで最高だぜ。あの上でやるストレッチは効きが違う!' },
        { cond: 'built(sento)', text: '銭湯建ててくれてありがとな! 一番風呂は譲らねえぜ!' },
        { cond: 'true', text: '今度メシおごるぜ。ナポリタン大盛り、覚悟しとけよな!' },
      ],
      CLOSING: [{ cond: 'true', text: '筋肉は裏切らねえ! ジンパチ' }],
    },
    attachCoin: 3,
    replies: [
      { key: 'HAPPY', label: '楽しみにしてる' },
      { key: 'TEASE', label: '字が意外ときれい' },
      { key: 'WORRY', label: '食べすぎ注意' },
    ],
    effects: ['aff(JIN,2)'],
  }),
  L('LTR_MUNI_S3', {
    sender: 'MUNI', trigger: 'rank(PC, MUNI) >= 3', onceFlag: true,
    slots: {
      GREETING: [{ cond: 'true', text: 'おおやさんへ。ムニだよ。じ、じょうずにかけてる?' }],
      BODY: [{ cond: 'true', text: 'いつもあそんでくれてありがとなの。ムニ、おおやさんがくるとうれしいの。' }],
      CONTEXT: [
        { cond: 'flag(FLG_Q_MUNI_LAMP_DONE)', text: 'ランプ、まいばんつけてるよ。おばけ、いっかいもこないの! すごいでしょ。' },
        { cond: 'built(dagashi)', text: 'だがしやさん、つくってくれてありがとなの! ラムネ、はんぶんこしてあげる。' },
        { cond: 'true', text: 'こんどね、ムニのたからもの、みせてあげるの。' },
      ],
      CLOSING: [{ cond: 'true', text: 'むにゅ〜。 ムニより (えもかいたよ)' }],
    },
    attachCoin: 1,
    replies: [
      { key: 'HAPPY', label: 'じょうずだよ' },
      { key: 'WORRY', label: 'はやくねてね' },
      { key: 'TEASE', label: 'えはなんのえ?' },
    ],
    effects: ['aff(MUNI,2)'],
  }),
  L('LTR_GERU_S3', {
    sender: 'GERU', trigger: 'rank(PC, GERU) >= 3', onceFlag: true,
    slots: {
      GREETING: [
        { cond: 'time in [NIGHT, MIDNIGHT]', text: '夜中に書いている。私の手紙はだいたい夜生まれだ。' },
        { cond: 'true', text: 'あんたに手紙とはな。私も焼きが回ったものだ。' },
      ],
      BODY: [{ cond: 'true', text: '面と向かっては言いにくいから書く。あんたの作るこの塔は、悪くない。……いや、良い。' }],
      CONTEXT: [
        { cond: 'built(book)', text: '本屋の棚の並び、私の趣味が反映されている気がするのは気のせいか? ……礼は言っておく。' },
        { cond: 'true', text: 'チェスの件、忘れていないだろうな。夜ならいつでも受けて立つ。' },
      ],
      CLOSING: [{ cond: 'true', text: '以上だ。 ゲル' }],
    },
    attachCoin: 2,
    replies: [
      { key: 'HAPPY', label: '嬉しい' },
      { key: 'TEASE', label: '焼きが回ったな' },
      { key: 'WORRY', label: '夜更かしはほどほどに' },
    ],
    effects: ['aff(GERU,2)'],
  }),
  L('LTR_NEO_S3', {
    sender: 'NEO', trigger: 'rank(PC, NEO) >= 3', onceFlag: true,
    slots: {
      GREETING: [{ cond: 'true', text: '大家殿。書簡というものは良い。声より、品位が残るのである。' }],
      BODY: [{ cond: 'true', text: '貴様の塔での日々、悪くない。騎士として、この街の灯を認めるものである。' }],
      CONTEXT: [
        { cond: 'flag(FLG_NEO_RAMEN_DEBUT)', text: '……ときに。拉麺の件は他言無用である。あれは我々だけの秘密であるからして。' },
        { cond: 'info(INFO_NEO_PAST_2)', text: '先夜の話、聞かせたことを後悔はしていない。貴様は、信ずるに足る。' },
        { cond: 'true', text: '私の部屋に黄金色の品を所望する件、進捗を期待しているのである。' },
      ],
      CLOSING: [{ cond: 'true', text: '誇り高くあれ。 ネオ' }],
    },
    attachCoin: 3,
    replies: [
      { key: 'HAPPY', label: '光栄です' },
      { key: 'TEASE', label: '意外と筆まめだね' },
      { key: 'WORRY', label: 'ラーメン食べすぎ注意' },
    ],
    effects: ['aff(NEO,2)'],
  }),

  // ---------- 季節の便り (季節毎1回・S3以上) ----------
  L('LTR_LENNY_SEASON', {
    sender: 'LENNY', trigger: 'rank(PC, LENNY) >= 3', oncePerSeason: true,
    slots: {
      GREETING: [
        { cond: 'last_reply(LENNY) == TEASE', text: 'やあ。このあいだ「字がねむそう」って言ったね。今回はがんばって書いたよ。' },
        { cond: 'true', text: 'やあ、大家さん。季節のお便りだよ。' },
      ],
      BODY: [
        { cond: 'season == SPRING', text: '春だね。お昼寝がいちばん気持ちいい季節だよ。花のにおいの夢が見られるんだ。' },
        { cond: 'season == SUMMER', text: '夏だね。夜のネオンが、なんだか花火みたいだよ。' },
        { cond: 'season == AUTUMN', text: '秋だね。おふとんがちょうどよくて、朝が来なければいいのにって思うよ。' },
        { cond: 'season == WINTER', text: '冬だね。さむいけど、みんなの部屋の灯りが、いつもよりあったかく見えるよ。' },
      ],
      CLOSING: [{ cond: 'true', text: 'またね。 レニィ' }],
    },
    attachCoin: 1,
    replies: [
      { key: 'HAPPY', label: 'いい季節だね' },
      { key: 'WORRY', label: '風邪ひかないで' },
      { key: 'TEASE', label: '字がねむそう' },
    ],
    effects: ['aff(LENNY,1)'],
  }),
  L('LTR_NEO_SEASON', {
    sender: 'NEO', trigger: 'rank(PC, NEO) >= 3', oncePerSeason: true,
    slots: {
      GREETING: [{ cond: 'true', text: '大家殿。季節の挨拶である。' }],
      BODY: [
        { cond: 'season == SPRING', text: '春である。花屋の店先が華やぐ。……一輪、部屋に飾った。誰にも言うでないぞ。' },
        { cond: 'season == SUMMER', text: '夏である。この装いには過酷な季節である。だが騎士は脱がん。意地である。' },
        { cond: 'season == AUTUMN', text: '秋である。焼き芋、栗、月見……この街の秋は、実に戦略的に美味である。' },
        { cond: 'season == WINTER', text: '冬である。銭湯の湯気の向こうの富士の壁画……あれは名画である。' },
      ],
      CLOSING: [{ cond: 'true', text: '健勝であれ。 ネオ' }],
    },
    attachCoin: 2,
    replies: [
      { key: 'HAPPY', label: '良い季節を' },
      { key: 'TEASE', label: '花、かわいいね' },
      { key: 'WORRY', label: '夏は薄着でいいのに' },
    ],
    effects: ['aff(NEO,1)'],
  }),
];
