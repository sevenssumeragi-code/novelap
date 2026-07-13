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

  // ---------- v4追加: 季節の便り(ヒュウ/ジンパチ/ムニ/ゲル) ----------
  L('LTR_HYU_SEASON', {
    sender: 'HYU', trigger: 'rank(PC, HYU) >= 3', oncePerSeason: true,
    slots: {
      GREETING: [{ cond: 'true', text: '拝啓、大家さん。今日の私も、便箋越しに美しいでしょう?' }],
      BODY: [
        { cond: 'season == SPRING', text: '春です。桜と私、どちらが主役か。……野暮な問いでしたね。' },
        { cond: 'season == SUMMER', text: '夏は汗との戦い。涼しげに見せる技術こそ、私の真骨頂です。' },
        { cond: 'season == AUTUMN', text: '読書の秋。本を持つ私の横顔が、最も映える季節です。' },
        { cond: 'season == WINTER', text: 'マフラーという名の芸術を纏う季節。私に巻かれる布は幸せ者です。' },
      ],
      CLOSING: [{ cond: 'true', text: '敬具 ヒュウ (完璧)' }],
    },
    attachCoin: 1,
    replies: [{ key: 'HAPPY', label: '素敵だね' }, { key: 'TEASE', label: '自信家だね' }, { key: 'WORRY', label: '湯冷めしないで' }],
    effects: ['aff(HYU,1)'],
  }),
  L('LTR_JIN_SEASON', {
    sender: 'JIN', trigger: 'rank(PC, JIN) >= 3', oncePerSeason: true,
    slots: {
      GREETING: [{ cond: 'true', text: 'よう大家! 手紙二通目だぜ! 少しは字がうまくなったろ!' }],
      BODY: [
        { cond: 'season == SPRING', text: '春は新記録の季節! 階段往復、また一本増やしたぜ!' },
        { cond: 'season == SUMMER', text: '夏だ! 汗! 焼肉! 最高だろ! 今度一緒に肉食おうぜ!' },
        { cond: 'season == AUTUMN', text: '食欲の秋! プラモの新作も秋に出るんだ! 完璧な季節だぜ!' },
        { cond: 'season == WINTER', text: '冬は鍋! みんなで囲むと燃えるよな! お前も来いよ!' },
      ],
      CLOSING: [{ cond: 'true', text: '筋肉は裏切らねえ! ジンパチ' }],
    },
    attachCoin: 2,
    replies: [{ key: 'HAPPY', label: '楽しみ!' }, { key: 'TEASE', label: '暑苦しいね' }, { key: 'WORRY', label: '無理しないで' }],
    effects: ['aff(JIN,1)'],
  }),
  L('LTR_MUNI_SEASON', {
    sender: 'MUNI', trigger: 'rank(PC, MUNI) >= 3', oncePerSeason: true,
    slots: {
      GREETING: [{ cond: 'true', text: 'おおやさんへ。ムニだよ。おてがみのれんしゅうなの。' }],
      BODY: [
        { cond: 'season == SPRING', text: 'はるはね、おはながさくの。ムニ、いっこだけつんだの。ないしょね。' },
        { cond: 'season == SUMMER', text: 'なつはアイス! みどりのソーダのやつ! むにゅ〜!' },
        { cond: 'season == AUTUMN', text: 'あきはおいも! カネばあちゃんがやきいもくれたの!' },
        { cond: 'season == WINTER', text: 'ふゆはさむいの。おおやさんのポケット、かして?' },
      ],
      CLOSING: [{ cond: 'true', text: 'むにゅ〜。 ムニより (えもかいたよ)' }],
    },
    attachCoin: 1,
    replies: [{ key: 'HAPPY', label: 'じょうずだね' }, { key: 'TEASE', label: 'えがかわいい' }, { key: 'WORRY', label: 'かぜひかないで' }],
    effects: ['aff(MUNI,1)'],
  }),
  L('LTR_GERU_SEASON', {
    sender: 'GERU', trigger: 'rank(PC, GERU) >= 3', oncePerSeason: true,
    slots: {
      GREETING: [{ cond: 'time in [NIGHT, MIDNIGHT]', text: '夜中に書いている。私の手紙はいつも夜生まれだ。' }, { cond: 'true', text: 'あんたに手紙。……二度目ともなると、少し慣れたな。' }],
      BODY: [
        { cond: 'season == SPRING', text: '春は新刊ラッシュだ。財布が春の嵐に見舞われている。' },
        { cond: 'season == SUMMER', text: '夏の夜は窓を開ける。街の音が、生きてる音がする。悪くない。' },
        { cond: 'season == AUTUMN', text: '読書の秋。……私には一年中そうだが、秋は特に言い訳が立つ。' },
        { cond: 'season == WINTER', text: '布団と本と熱い茶。それで私の宇宙は完成する。あんたも呼びたいくらいだ。' },
      ],
      CLOSING: [{ cond: 'true', text: '以上だ。 ゲル' }],
    },
    attachCoin: 2,
    replies: [{ key: 'HAPPY', label: '嬉しい' }, { key: 'TEASE', label: '素直だね' }, { key: 'WORRY', label: '夜更かし注意' }],
    effects: ['aff(GERU,1)'],
  }),

  // ---------- v4追加: 恋人からの手紙 ----------
  L('LTR_LOVER_LENNY', {
    sender: 'LENNY', trigger: 'rel(PC, LENNY) == LOVER', oncePerSeason: true,
    slots: {
      GREETING: [{ cond: 'true', text: 'だいすきな大家さんへ。……こういうの、恋人っぽくて、書いてて照れるね。' }],
      BODY: [{ cond: 'true', text: '大家さんの隣は、世界でいちばんよく眠れる場所だよ。そして、いちばん起きていたい場所なんだ。' }],
      CLOSING: [{ cond: 'true', text: 'ずっといっしょにいてね。 レニィより♡' }],
    },
    attachCoin: 2,
    replies: [{ key: 'HAPPY', label: '私も大好き' }, { key: 'TEASE', label: '照れんぼ' }, { key: 'WORRY', label: '風邪ひかないで' }],
    effects: ['aff(LENNY,2)'],
  }),
  L('LTR_LOVER_HYU', {
    sender: 'HYU', trigger: 'rel(PC, HYU) == LOVER', oncePerSeason: true,
    slots: {
      GREETING: [{ cond: 'true', text: '私の唯一の人へ。この便箋は、あなたのために特別に選びました。' }],
      BODY: [{ cond: 'true', text: '鏡より、あなたに映る私が好きです。……これ以上の告白は、直接、あなたの前で。' }],
      CLOSING: [{ cond: 'true', text: '永遠に美しく、あなたのものです。 ヒュウ♡' }],
    },
    attachCoin: 2,
    replies: [{ key: 'HAPPY', label: 'ときめく' }, { key: 'TEASE', label: 'キザだね' }, { key: 'WORRY', label: '無理しないで' }],
    effects: ['aff(HYU,2)'],
  }),
  L('LTR_LOVER_JIN', {
    sender: 'JIN', trigger: 'rel(PC, JIN) == LOVER', oncePerSeason: true,
    slots: {
      GREETING: [{ cond: 'true', text: '俺の恋人へ! ……手紙で改めて言うのは照れるが、逃げねえぜ!' }],
      BODY: [{ cond: 'true', text: 'お前のこと考えると、鍛錬が1.5倍がんばれる。恋の力ってのは本物だな! 今度、焼肉デートしようぜ!' }],
      CLOSING: [{ cond: 'true', text: '一生かけて大事にする! ジンパチ' }],
    },
    attachCoin: 3,
    replies: [{ key: 'HAPPY', label: '楽しみ!' }, { key: 'TEASE', label: '熱いね' }, { key: 'WORRY', label: '食べ過ぎ注意' }],
    effects: ['aff(JIN,2)'],
  }),
  L('LTR_LOVER_GERU', {
    sender: 'GERU', trigger: 'rel(PC, GERU) == LOVER', oncePerSeason: true,
    slots: {
      GREETING: [{ cond: 'true', text: 'あんたへ。……手紙なら、面と向かって言えないことも書ける。ずるいな、手紙は。' }],
      BODY: [{ cond: 'true', text: 'あんたを栞にした日から、私の物語は消えなくなった。今日という一日を、また一枚、あんたと栞にする。' }],
      CLOSING: [{ cond: 'true', text: '……好きだ。 ゲル' }],
    },
    attachCoin: 2,
    replies: [{ key: 'HAPPY', label: '私もだよ' }, { key: 'TEASE', label: 'ロマンチスト' }, { key: 'WORRY', label: '夜更かし注意' }],
    effects: ['aff(GERU,2)'],
  }),
  L('LTR_LOVER_NEO', {
    sender: 'NEO', trigger: 'rel(PC, NEO) == LOVER', oncePerSeason: true,
    slots: {
      GREETING: [{ cond: 'true', text: '我が姫(あるいは王)へ。魔法剣士ネオ、生涯ただ一度の筆を執る。' }],
      BODY: [{ cond: 'true', text: 'この剣は貴様を守るためにある。この心臓は貴様のために鳴る。……ぬ、書いていて熱くなってきた。これが恋というものか。' }],
      CLOSING: [{ cond: 'true', text: '永遠の忠誠を。 ネオ' }],
    },
    attachCoin: 3,
    replies: [{ key: 'HAPPY', label: '頼もしい' }, { key: 'TEASE', label: '大げさだね' }, { key: 'WORRY', label: '風邪ひかないで' }],
    effects: ['aff(NEO,2)'],
  }),

  // ---------- v4追加: 郵便屋からの「NPC同士の文通」お知らせ ----------
  L('LTR_POSTMAN_NEWS', {
    sender: 'POSTMAN', trigger: 'rank(PC, POSTMAN) >= 3', oncePerSeason: true,
    slots: {
      GREETING: [{ cond: 'true', text: 'どうもっす、大家さん! 配達員リポートっす!' }],
      BODY: [
        { cond: 'rel(LENNY, HYU) == LOVER', text: 'レニィさんとヒュウさん、最近やたら手紙のやり取りが多いんすよ。……お幸せそうで何よりっす!' },
        { cond: 'rel(GERU, NEO) == LOVER', text: 'ゲルさんとネオさん、分厚い封筒を交換してるっす。中身は……守秘義務っす!' },
        { cond: 'true', text: 'この塔の皆さん、今日も元気に手紙を書いてるっす。声より残る、いいもんすよね。' },
      ],
      CLOSING: [{ cond: 'true', text: '本日も定時配達! 郵便屋サン' }],
    },
    attachCoin: 1,
    replies: [{ key: 'HAPPY', label: 'ありがとう' }, { key: 'TEASE', label: 'のぞき見だね' }, { key: 'WORRY', label: '無理しないで' }],
    effects: ['aff(POSTMAN,1)', 'info(INFO_POSTMAN_LETTERS)'],
  }),
];
