// ============================================================
// v14 追加会話 — 主要人物6人どうしの会話を大幅増
//   (A) 各施設来店時の通常ペア会話
//   (B) 恋人どうしの通常会話 / (C) 恋人どうしの各施設来店時
//   (D) 友人どうしの通常会話 / (E) 友人どうしの各施設来店時
//   (F) 時間帯・季節・天気ごとのペア会話
// ※すべて主要人物2人のAMBIENT(立ち話)
// ============================================================
const A = (id, cast, node) => ({ id, type: 'AMBIENT', pool: 'AMBIENT', owner: [...cast].sort().join('-'), cast, ...node });

export const DLG_V14 = [
  // ========================================================
  // (A) 各施設来店時の通常ペア会話
  // ========================================================
  A('DLG_F_NEO_HYU_CAFE_V14', ['NEO', 'HYU'], { cond: 'location == cafe', lines: [
    { sp: 'NEO', text: 'ヒュウよ、この喫茶店の珈琲、深き森の香りがする。……貴様の淹れる紅茶とは、また違う趣であるな。' },
    { sp: 'HYU', text: 'ふふ、分かっていますね。珈琲は情熱の黒、紅茶は気品の琥珀。……どちらも、美を知る者の飲み物です。' },
  ], effects: ['mutual(HYU,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_F_MUN_JIN_RAMEN_V14', ['MUNI', 'JIN'], { cond: 'location == ramen', lines: [
    { sp: 'MUNI', text: 'ジンパチおにいちゃん、ムニもおおもりたべれる?' },
    { sp: 'JIN', text: 'おう! でも今日は普通盛りにしとけ! ちょっとずつでっかくなるんだ! ……残したら俺が食ってやるから、安心して挑戦しろ!' },
  ], effects: ['mutual(JIN,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_F_HYU_LEN_BOOK_V14', ['HYU', 'LENNY'], { cond: 'location == book', lines: [
    { sp: 'HYU', text: 'レニィ、写真集の棚で寝ないでください。……ほら、私の載っている雑誌、探すのを手伝ってくれるのでは?' },
    { sp: 'LENNY', text: 'ん……ヒュウの写真なら、目をつぶってても分かるよ。いちばんキラキラしてるページだもん。……zzz' },
  ], effects: ['mutual(HYU,LENNY,1)', 'log(AMBIENT)'] }),
  A('DLG_F_NEO_MUN_DAGASHI_V14', ['NEO', 'MUNI'], { cond: 'location == dagashi', lines: [
    { sp: 'MUNI', text: 'ネオおにいちゃん、このきしのカードだして! ムニ、コンプしたいの!' },
    { sp: 'NEO', text: 'ふはは、騎士のカードか! ならば我も引いてやろう。……ぬ、貴様と同じものが出た。これも縁である。交換して揃えるがよい、ムニ。' },
  ], effects: ['mutual(MUNI,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_F_LEN_JIN_CAKE_V14', ['LENNY', 'JIN'], { cond: 'location == cake', lines: [
    { sp: 'JIN', text: 'レニィ、甘いもんは疲れに効くぜ! ほら、このショートケーキ食え! ……あ、寝るな! 食ってから寝ろ!' },
    { sp: 'LENNY', text: 'ふわふわで、雲みたい……。ジンパチ、ありがとう。……甘いもの食べると、いい夢見られる気がするんだ。えへへ。' },
  ], effects: ['mutual(JIN,LENNY,1)', 'log(AMBIENT)'] }),
  A('DLG_F_HYU_GER_GAME_V14', ['HYU', 'GERU'], { cond: 'location == game', lines: [
    { sp: 'HYU', text: 'ゲル、あなたがゲームセンターとは。……クレーンの本を狙っているのですか?' },
    { sp: 'GERU', text: '……あの奥のぬいぐるみが、私の好きな作家のキャラでな。柄ではないが、つい。……お前も、笑わずに手伝え。二人がかりなら取れるだろう。' },
  ], effects: ['mutual(HYU,GERU,1)', 'log(AMBIENT)'] }),
  A('DLG_F_MUN_HYU_FLOWER_V14', ['MUNI', 'HYU'], { cond: 'location == flower', lines: [
    { sp: 'MUNI', text: 'ヒュウおにいちゃん、おはなのかんむり、ムニにもつくって!' },
    { sp: 'HYU', text: 'ふふ、いいでしょう。あなたには可憐な白い花で。……ほら、完成です。美しいものは、可愛いものを引き立てる。よく似合っていますよ、ムニ。' },
  ], effects: ['mutual(HYU,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_F_GER_JIN_SENTO_V14', ['GERU', 'JIN'], { cond: 'location == sento', lines: [
    { sp: 'JIN', text: 'おーいゲル! 壁の向こう、聞こえるか! 今日の湯加減、最高だぞー!' },
    { sp: 'GERU', text: '……大声を出すな、反響する。だが、まあ。女湯もいい湯だと言っておく。……ほら、のぼせる前に上がれ。お前は限界まで浸かるからな。' },
  ], effects: ['mutual(JIN,GERU,1)', 'log(AMBIENT)'] }),
  A('DLG_F_HYU_NEO_AQUA_V14', ['HYU', 'NEO'], { cond: 'location == aquarium', lines: [
    { sp: 'HYU', text: 'ネオさん、この水槽のガラスに映る私と、泳ぐ魚。どちらが優雅だと思います?' },
    { sp: 'NEO', text: 'ふ、愚問である。貴様に決まっておろう。……だが、あの深海魚の孤高もまた、捨てがたい美よ。美とは、一つではないのだな。' },
  ], effects: ['mutual(HYU,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_F_LEN_GER_IZAKAYA_V14', ['LENNY', 'GERU'], { cond: 'location == izakaya', lines: [
    { sp: 'GERU', text: 'レニィ、こんな夜更けの居酒屋で何をしている。……お前、ジュースを前に寝ているだけじゃないか。' },
    { sp: 'LENNY', text: 'ん……ここの隅っこ、灯りがやさしくて、落ち着くんだ。ゲルの指定席の隣、借りていい? しゃべらなくていいから。' },
  ], effects: ['mutual(LENNY,GERU,1)', 'log(AMBIENT)'] }),
  A('DLG_F_NEO_JIN_TOYSHOP_V14', ['NEO', 'JIN'], { cond: 'location == toyshop', lines: [
    { sp: 'JIN', text: 'ネオ! この騎士のプラモ、お前にそっくりだぜ! 買ってやろうか!' },
    { sp: 'NEO', text: 'ぬ……我に似ているだと? ……ふむ、この凛々しさ、確かに。……い、いや、別に欲しいわけではない。だが、貴様がそこまで言うなら、受け取らんこともない。' },
  ], effects: ['mutual(JIN,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_F_MUN_LEN_KONBINI_V14', ['MUNI', 'LENNY'], { cond: 'location == konbini', lines: [
    { sp: 'MUNI', text: 'レニィおにいちゃん、よふかしのおかいもの、どきどきするね!' },
    { sp: 'LENNY', text: 'ふふ、そうだね。……でも、ムニはもう寝る時間だよ。肉まんひとつ買ったら、おうち帰ろ。ぼくが送ってあげる。……あくび出た。' },
  ], effects: ['mutual(LENNY,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_F_GER_NEO_YAKINIKU_V14', ['GERU', 'NEO'], { cond: 'location == yakiniku', lines: [
    { sp: 'NEO', text: 'ゲルよ、この鉄板の上、肉が舞う様はまさに戦場である。……貴様はホルモン派か。意外である。' },
    { sp: 'GERU', text: 'ふ、人を見かけで判断するな。……こういう歯応えのあるものが、考え事の伴になる。お前も、黙って焼け。話はそれからだ。' },
  ], effects: ['mutual(GERU,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_F_JIN_GER_CINEMA_V14', ['JIN', 'GERU'], { cond: 'location == cinema', lines: [
    { sp: 'JIN', text: 'ゲル、この映画、原作読んだんだろ? ネタバレすんなよ! 俺、結末知らずに楽しみてえんだ!' },
    { sp: 'GERU', text: 'ふ、言わんさ。……お前が結末で驚く顔を見るのが、私の楽しみだからな。ほら、始まるぞ。しっかり見ておけ。' },
  ], effects: ['mutual(JIN,GERU,1)', 'log(AMBIENT)'] }),
  A('DLG_F_NEO_LEN_DONUT_V14', ['NEO', 'LENNY'], { cond: 'location == donut', lines: [
    { sp: 'LENNY', text: 'ネオ、ドーナツの穴、覗くと向こうが見えるよ。……小さな窓みたい。' },
    { sp: 'NEO', text: 'ほう、詩的である。……この輪の向こうに、貴様の夢見る海が見えるやもしれぬな。ふ、貴様といると、菓子ひとつも冒険になる。' },
  ], effects: ['mutual(LENNY,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_F_GER_MUN_CHURCH_V14', ['GERU', 'MUNI'], { cond: 'location == church', lines: [
    { sp: 'MUNI', text: 'ゲルおねえちゃん、しんぷさまのおはなし、むずかしいけど、なんかあったかいね。' },
    { sp: 'GERU', text: 'ああ。……言葉の意味が全部分からなくても、心に届くものはある。それが、祈りというものかもしれんな。……お前は、いい感性を持っている。' },
  ], effects: ['mutual(GERU,MUNI,1)', 'log(AMBIENT)'] }),

  // ========================================================
  // (B) 恋人どうしの通常会話(rel(A,B) == LOVER・場所を問わず)
  // ========================================================
  A('DLG_NPCPL_HYU_LEN_V14', ['HYU', 'LENNY'], { cond: 'rel(HYU, LENNY) == LOVER', weight: 17, lines: [
    { sp: 'LENNY', text: 'ヒュウ、恋人になってから、朝いちばんにヒュウの顔が見たくて、早起きしちゃうんだ。……ぼくにしては、大事件だよ?' },
    { sp: 'HYU', text: '……ふ、私もですよ。あなたの寝顔を一番に見られるのは、恋人の特権。……この幸せ、鏡には映せませんね。' },
  ], effects: ['mutual(HYU,LENNY,1)', 'log(AMBIENT)'] }),
  A('DLG_NPCPL_JIN_NEO_V14', ['JIN', 'NEO'], { cond: 'rel(JIN, NEO) == LOVER', weight: 17, lines: [
    { sp: 'JIN', text: 'ネオ、俺たちが恋人だって、みんな知ってるのかな。……なんか、隠すことでもねえよな! 堂々といこうぜ!' },
    { sp: 'NEO', text: 'うむ! 騎士は己の愛を恥じぬ! ……とはいえ、貴様が照れて赤くなるのは、我だけが知る秘密にしておこうか。ふはは!' },
  ], effects: ['mutual(JIN,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_NPCPL_GER_NEO_V14', ['GERU', 'NEO'], { cond: 'rel(GERU, NEO) == LOVER', weight: 17, lines: [
    { sp: 'GERU', text: 'ネオ、お前と過ごすようになって、私の物語の好みが変わった。……悲恋より、静かな幸福の話を、選ぶようになったんだ。' },
    { sp: 'NEO', text: '……それは、我らの物語が、幸福だからであろう。ゲル、貴様の隣で綴る日々、我が生涯で最も美しき章である。' },
  ], effects: ['mutual(GERU,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_NPCPL_HYU_JIN_V14', ['HYU', 'JIN'], { cond: 'rel(HYU, JIN) == LOVER', weight: 17, lines: [
    { sp: 'HYU', text: 'ジンパチくん、あなたの汗を拭くハンカチ、いつも持ち歩くようになりました。……恋人の習慣、というものですね。' },
    { sp: 'JIN', text: 'わ、悪いなヒュウ……。でも、お前のハンカチいい匂いだから、拭かれるたびドキドキすんだよ。……くっ、また言っちまった!' },
  ], effects: ['mutual(HYU,JIN,1)', 'log(AMBIENT)'] }),
  A('DLG_NPCPL_LEN_NEO_V14', ['LENNY', 'NEO'], { cond: 'rel(LENNY, NEO) == LOVER', weight: 17, lines: [
    { sp: 'NEO', text: 'レニィ、貴様が眠っている間、我は詩を一篇したためた。……目覚めたら、読んで聞かせよう。恋人に捧げる、騎士の詩である。' },
    { sp: 'LENNY', text: 'えへへ……ネオの詩、子守唄にしたいくらい好きなんだ。……あ、でも今度は、起きて聞くね。ちゃんと。約束。' },
  ], effects: ['mutual(LENNY,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_NPCPL_GER_HYU_V14', ['GERU', 'HYU'], { cond: 'rel(GERU, HYU) == LOVER', weight: 17, lines: [
    { sp: 'HYU', text: 'ゲル、あなたの本棚に、私の写真を一枚、飾ってもらえませんか。……あなたの世界の一部に、私も居たいのです。' },
    { sp: 'GERU', text: '……とうに飾ってある。一番よく目に入る、栞代わりの場所にな。……気づいていなかったのか。ふ、鈍いところも、悪くない。' },
  ], effects: ['mutual(GERU,HYU,1)', 'log(AMBIENT)'] }),
  A('DLG_NPCPL_JIN_LEN_V14', ['JIN', 'LENNY'], { cond: 'rel(JIN, LENNY) == LOVER', weight: 17, lines: [
    { sp: 'LENNY', text: 'ジンパチ、鍛錬のあとの背中、大きいね。……ぼく、その背中に寄りかかって寝るの、世界一好きなんだ。' },
    { sp: 'JIN', text: '……好きなだけ寄りかかれ! 俺の背中は、お前専用の枕だ! ……へへ、恋人にそう言われると、鍛えた甲斐があるぜ!' },
  ], effects: ['mutual(JIN,LENNY,1)', 'log(AMBIENT)'] }),

  // ========================================================
  // (C) 恋人どうしの各施設来店時(rel == LOVER + location)
  // ========================================================
  A('DLG_LPAIR_CAFE_V14', ['HYU', 'LENNY'], { cond: 'location == cafe and rel(HYU, LENNY) == LOVER', weight: 20, lines: [
    { sp: 'HYU', text: 'レニィ、恋人と飲むこの一杯、砂糖は要りませんね。……あなたが隣にいるだけで、十分に甘いですから。' },
    { sp: 'LENNY', text: 'ヒュウ、キザだなあ。……でも、うれしい。ぼくも、ヒュウとの珈琲がいちばん好きだよ。眠くならない魔法の一杯。' },
  ], effects: ['mutual(HYU,LENNY,1)', 'log(AMBIENT)'] }),
  A('DLG_LPAIR_BOOK_V14', ['GERU', 'NEO'], { cond: 'location == book and rel(GERU, NEO) == LOVER', weight: 20, lines: [
    { sp: 'GERU', text: 'ネオ、恋人と並んで本を選ぶ。……この静かな時間が、私の一番の幸せだ。お前はどの棚が好きだ?' },
    { sp: 'NEO', text: '騎士物語の棚である。……だが、貴様の隣なら、恋愛小説の棚も悪くない。ふ、貴様が我を、そこへ連れてきたのだ。' },
  ], effects: ['mutual(GERU,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_LPAIR_YAKINIKU_V14', ['JIN', 'NEO'], { cond: 'location == yakiniku and rel(JIN, NEO) == LOVER', weight: 20, lines: [
    { sp: 'JIN', text: 'ネオ! 恋人と食う焼肉は最高だな! 一番いいカルビ、お前に焼いてやる! たんと食え!' },
    { sp: 'NEO', text: 'かたじけない! ……貴様の焼く肉は、なぜこうも美味いのか。愛という調味料か。ふはは、我は幸せ者である!' },
  ], effects: ['mutual(JIN,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_LPAIR_SENTO_V14', ['HYU', 'JIN'], { cond: 'location == sento and rel(HYU, JIN) == LOVER', weight: 20, lines: [
    { sp: 'JIN', text: 'ヒュウ! 湯上がりのお前、いつもよりキラキラしてんな! ……こ、恋人だから言うけど、綺麗だぜ!' },
    { sp: 'HYU', text: '……ふふ、湯上がりの素肌を褒められるのは、あなただけに許した特権です。ええ、恋人ですから。……あなたも、いい男ぶりですよ。' },
  ], effects: ['mutual(HYU,JIN,1)', 'log(AMBIENT)'] }),
  A('DLG_LPAIR_CINEMA_V14', ['LENNY', 'NEO'], { cond: 'location == cinema and rel(LENNY, NEO) == LOVER', weight: 20, lines: [
    { sp: 'NEO', text: 'レニィ、暗闇ゆえ、そっと肩を寄せてもよいか。……恋人どうしの、映画館の作法である。' },
    { sp: 'LENNY', text: 'うん……ネオの肩、あったかい。このまま、映画より先に夢の中でネオに会っちゃいそう。……でも今日は、最後まで観るね。えへへ。' },
  ], effects: ['mutual(LENNY,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_LPAIR_FLOWER_V14', ['GERU', 'HYU'], { cond: 'location == flower and rel(GERU, HYU) == LOVER', weight: 20, lines: [
    { sp: 'HYU', text: 'ゲル、恋人に花を贈るなら、どれがいいと思います? ……いえ、贈る相手は、目の前にいるのですが。' },
    { sp: 'GERU', text: '……不意打ちはよせ。ならば、青い薔薇を。「不可能を叶える」花言葉だ。……本の中の私を、外へ連れ出したお前に、ふさわしい。' },
  ], effects: ['mutual(GERU,HYU,1)', 'log(AMBIENT)'] }),
  A('DLG_LPAIR_KARAOKE_V14', ['JIN', 'LENNY'], { cond: 'location == karaoke and rel(JIN, LENNY) == LOVER', weight: 20, lines: [
    { sp: 'JIN', text: 'レニィ! 恋人どうし、ラブソングでデュエットだ! ……お前、寝ないで最後まで歌えよ?' },
    { sp: 'LENNY', text: 'がんばる! ……ジンパチの声と重ねて歌うの、しあわせだもん。眠気なんて、吹き飛んじゃうよ。せーの♪' },
  ], effects: ['mutual(JIN,LENNY,1)', 'log(AMBIENT)'] }),
  A('DLG_LPAIR_DONUT_V14', ['HYU', 'NEO'], { cond: 'location == donut and rel(HYU, NEO) == LOVER', weight: 20, lines: [
    { sp: 'HYU', text: 'ネオさん、恋人どうし、このドーナツを半分こ。……穴の空いた輪、二人でひとつ。素敵な比喩だと思いませんか。' },
    { sp: 'NEO', text: 'うむ、美しき比喩である。……欠けた輪も、二人寄れば満ちる。貴様と我のようにな。ふ、砂糖が唇についておるぞ。……取ってやろう。' },
  ], effects: ['mutual(HYU,NEO,1)', 'log(AMBIENT)'] }),

  // ========================================================
  // (D) 友人どうしの通常会話(mutual >= 55 and rel != LOVER)
  // ========================================================
  A('DLG_FRND_HYU_GER_V14', ['HYU', 'GERU'], { cond: 'mutual(HYU, GERU) >= 55 and rel(HYU, GERU) != LOVER', weight: 15, lines: [
    { sp: 'HYU', text: 'ゲル、あなたとは恋にはなりませんが……こうして本音で語れる友は、貴重です。あなたの前では、鎧を脱げるのです。' },
    { sp: 'GERU', text: 'ふ、奇遇だな。私も、お前の前では気取らずにいられる。……着飾らない友情というやつだ。悪くないだろう?' },
  ], effects: ['mutual(HYU,GERU,1)', 'log(AMBIENT)'] }),
  A('DLG_FRND_JIN_LEN_V14', ['JIN', 'LENNY'], { cond: 'mutual(JIN, LENNY) >= 55 and rel(JIN, LENNY) != LOVER', weight: 15, lines: [
    { sp: 'JIN', text: 'レニィ、お前と俺、こんなに違うのに親友だもんな。人生って面白えよ!' },
    { sp: 'LENNY', text: 'ふふ、ジンパチが元気で、ぼくがのんびり。……足りないところ、埋め合ってるのかもね。いい親友って、そういうものだよ。' },
  ], effects: ['mutual(JIN,LENNY,1)', 'log(AMBIENT)'] }),
  A('DLG_FRND_GER_NEO_V14', ['GERU', 'NEO'], { cond: 'mutual(GERU, NEO) >= 55 and rel(GERU, NEO) != LOVER', weight: 15, lines: [
    { sp: 'NEO', text: 'ゲルよ、貴様との語らいは、恋でなくとも心満たされる。……知を分かち合える友、それが我には一番の宝である。' },
    { sp: 'GERU', text: 'ああ、同感だ。恋人ではない。だが、それ以上に気楽で、深い。……お前とは、一生こうして本の話をしていたいものだな。' },
  ], effects: ['mutual(GERU,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_FRND_HYU_MUN_V14', ['HYU', 'MUNI'], { cond: 'mutual(HYU, MUNI) >= 55 and rel(HYU, MUNI) != LOVER', weight: 15, lines: [
    { sp: 'MUNI', text: 'ヒュウおにいちゃん、ムニがおおきくなったら、ヒュウおにいちゃんみたいにきれいになれる?' },
    { sp: 'HYU', text: '……ふ。ムニ、美しさは、心の在り方が作るものです。あなたのその素直な心なら、きっと。……私の弟分として、太鼓判を押しましょう。' },
  ], effects: ['mutual(HYU,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_FRND_JIN_GER_V14', ['JIN', 'GERU'], { cond: 'mutual(JIN, GERU) >= 55 and rel(JIN, GERU) != LOVER', weight: 15, lines: [
    { sp: 'JIN', text: 'ゲル、お前がいると安心すんだよな。俺が突っ走っても、お前が止めてくれるって分かってるからよ!' },
    { sp: 'GERU', text: 'ふ、便利なブレーキ扱いか。……まあいい。お前のような直情径行を放っておけないのも、友情のうちだ。存分に走れ。見ていてやる。' },
  ], effects: ['mutual(JIN,GERU,1)', 'log(AMBIENT)'] }),
  A('DLG_FRND_LEN_MUN_V14', ['LENNY', 'MUNI'], { cond: 'mutual(LENNY, MUNI) >= 55 and rel(LENNY, MUNI) != LOVER', weight: 15, lines: [
    { sp: 'MUNI', text: 'レニィおにいちゃん、おひるねともだち、いっしょうつづける?' },
    { sp: 'LENNY', text: 'もちろん。……ぼくたち、世界一平和な親友だもんね。ゆびきりげんまん。……あ、その前に、ちょっとだけお昼寝しよ。zzz' },
  ], effects: ['mutual(LENNY,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_FRND_HYU_NEO_V14', ['HYU', 'NEO'], { cond: 'mutual(HYU, NEO) >= 55 and rel(HYU, NEO) != LOVER', weight: 15, lines: [
    { sp: 'HYU', text: 'ネオさん、あなたとは良き好敵手。美を競い合う友というのは、退屈しませんね。' },
    { sp: 'NEO', text: 'まさに! 貴様の美への執念、我が騎士道に通ず。恋にあらず、されど並び立つ同志。……この関係、我は誇りに思うぞ、ヒュウ!' },
  ], effects: ['mutual(HYU,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_FRND_MUN_NEO_V14', ['MUNI', 'NEO'], { cond: 'mutual(MUNI, NEO) >= 55 and rel(MUNI, NEO) != LOVER', weight: 15, lines: [
    { sp: 'MUNI', text: 'ネオおにいちゃん、ムニのこと、みならいきしっておもってくれてる?' },
    { sp: 'NEO', text: '無論である! 貴様は我が誇る、心優しき見習い騎士。……いつか立派な騎士になったら、我と肩を並べて戦おうぞ。楽しみにしておる!' },
  ], effects: ['mutual(MUNI,NEO,1)', 'log(AMBIENT)'] }),

  // ========================================================
  // (E) 友人どうしの各施設来店時(mutual >= 55 and rel != LOVER + location)
  // ========================================================
  A('DLG_FPAIR_CAFE_V14', ['GERU', 'NEO'], { cond: 'location == cafe and mutual(GERU, NEO) >= 55 and rel(GERU, NEO) != LOVER', weight: 18, lines: [
    { sp: 'NEO', text: 'ゲルよ、友として一杯どうだ。この喫茶店の落ち着きは、貴様との語らいにふさわしい。' },
    { sp: 'GERU', text: 'ふ、いいだろう。……お前と飲む珈琲は、なぜか話が弾む。恋人ではないから、気楽に議論できる。良い関係だ、これは。' },
  ], effects: ['mutual(GERU,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_FPAIR_RAMEN_V14', ['JIN', 'HYU'], { cond: 'location == ramen and mutual(JIN, HYU) >= 55 and rel(JIN, HYU) != LOVER', weight: 18, lines: [
    { sp: 'JIN', text: 'ヒュウ! 親友とすするラーメンは格別だな! ……お前、麺すするの下手くそだけど、そこがまた可笑しくていいぜ!' },
    { sp: 'HYU', text: '失礼な。私は優雅にすすっているのです。……ですが、あなたと来る店は、なぜか居心地がいい。友の力、というやつでしょうか。ふふ。' },
  ], effects: ['mutual(HYU,JIN,1)', 'log(AMBIENT)'] }),
  A('DLG_FPAIR_BOOK_V14', ['GERU', 'LENNY'], { cond: 'location == book and mutual(GERU, LENNY) >= 55 and rel(GERU, LENNY) != LOVER', weight: 18, lines: [
    { sp: 'GERU', text: 'レニィ、親友のお前には、この静かな一冊を。……読み終えなくてもいい。私の隣で、お前が眠るその時間が、私は好きなんだ。' },
    { sp: 'LENNY', text: 'えへへ、ゲル……。ぼくも、ゲルの隣がいちばん落ち着くんだ。しゃべらなくても、通じ合える。親友だね、ぼくたち。' },
  ], effects: ['mutual(GERU,LENNY,1)', 'log(AMBIENT)'] }),
  A('DLG_FPAIR_GAME_V14', ['HYU', 'JIN'], { cond: 'location == game and mutual(HYU, JIN) >= 55 and rel(HYU, JIN) != LOVER', weight: 18, lines: [
    { sp: 'JIN', text: 'ヒュウ! 親友対決だ! 格ゲーで勝負しようぜ! 手加減なしだ!' },
    { sp: 'HYU', text: 'いいでしょう。私の優雅な指先が、あなたの猪突猛進を捌いてみせます。……ふふ、こうして張り合えるのも、友あればこそ。負けませんよ。' },
  ], effects: ['mutual(HYU,JIN,1)', 'log(AMBIENT)'] }),
  A('DLG_FPAIR_SENTO_V14', ['JIN', 'NEO'], { cond: 'location == sento and mutual(JIN, NEO) >= 55 and rel(JIN, NEO) != LOVER', weight: 18, lines: [
    { sp: 'JIN', text: 'ネオ! 親友の背中、流してやるよ! 遠慮すんな!' },
    { sp: 'NEO', text: 'ふ、かたじけない。ならば次は我が番だ。……男の友情は、背中を流し合うことで深まる。……熱い湯と、熱い友。最高の夜であるな!' },
  ], effects: ['mutual(JIN,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_FPAIR_AQUA_V14', ['LENNY', 'NEO'], { cond: 'location == aquarium and mutual(LENNY, NEO) >= 55 and rel(LENNY, NEO) != LOVER', weight: 18, lines: [
    { sp: 'LENNY', text: 'ネオ、あの魚の群れ、みんなで泳いでる。……ひとりぼっちじゃないって、いいね。ぼくたちみたいで。' },
    { sp: 'NEO', text: '……うむ。かつて我は孤高の騎士であった。だが今は、良き友がおる。貴様のような。……この水槽が、少し我らに似ておるな、レニィ。' },
  ], effects: ['mutual(LENNY,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_FPAIR_CAKE_V14', ['GERU', 'HYU'], { cond: 'location == cake and mutual(GERU, HYU) >= 55 and rel(GERU, HYU) != LOVER', weight: 18, lines: [
    { sp: 'HYU', text: 'ゲル、友人としてケーキを半分こしましょう。……モンブランとショート、交換すれば、二つの美味が味わえます。' },
    { sp: 'GERU', text: 'ふ、名案だ。……甘いものを分け合える友は、貴重だからな。恋人でなくとも、この気安さは何物にも代えがたい。いただこう。' },
  ], effects: ['mutual(GERU,HYU,1)', 'log(AMBIENT)'] }),
  A('DLG_FPAIR_KARAOKE_V14', ['GERU', 'NEO'], { cond: 'location == karaoke and mutual(GERU, NEO) >= 55 and rel(GERU, NEO) != LOVER', weight: 18, lines: [
    { sp: 'NEO', text: 'ゲルよ、親友のよしみで、我が吟遊の歌に低音を重ねてくれ。デュエットである。' },
    { sp: 'GERU', text: '……柄ではないが、お前とならな。恋人ではないが、声を合わせるのは心地よい。ほら、キーは合わせてやる。歌え、騎士殿。' },
  ], effects: ['mutual(GERU,NEO,1)', 'log(AMBIENT)'] }),

  // ========================================================
  // (F) 時間帯・季節・天気ごとのペア会話
  // ========================================================
  A('DLG_N_HYU_GER_MORNING_V14', ['HYU', 'GERU'], { cond: 'time == MORNING', lines: [
    { sp: 'HYU', text: 'ゲル、朝からその隈は。……また徹夜で読書ですか。美容の敵ですよ。' },
    { sp: 'GERU', text: '大きなお世話だ。……だが、お前の朝の手入れは尊敬する。私にはできん芸当だ。ふ、お互い、こだわりの方向が違うだけだな。' },
  ], effects: ['mutual(HYU,GERU,1)', 'log(AMBIENT)'] }),
  A('DLG_N_JIN_MUN_DAY_V14', ['JIN', 'MUNI'], { cond: 'time == DAY', lines: [
    { sp: 'MUNI', text: 'ジンパチおにいちゃん、おひるだよ! おにごっこ、まだやる?' },
    { sp: 'JIN', text: 'おう、まだまだ! 昼間は体を動かす時間だ! ……ほら、鬼だぞー! 逃げろ、ムニ! 全力で追うからな、加減はするけど!' },
  ], effects: ['mutual(JIN,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_N_LEN_NEO_EVENING_V14', ['LENNY', 'NEO'], { cond: 'time == EVENING', lines: [
    { sp: 'LENNY', text: 'ネオ、夕焼け、きれいだね。……空がぜんぶ金色。' },
    { sp: 'NEO', text: 'うむ。戦の終わりを告げる、褒美の色だ。……貴様とこうして黄昏を眺める。この平和、我が守るべきものである。' },
  ], effects: ['mutual(LENNY,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_N_GER_HYU_NIGHT_V14', ['GERU', 'HYU'], { cond: 'time == NIGHT', lines: [
    { sp: 'HYU', text: 'ゲル、夜のあなたは饒舌ですね。月が舌をほどくのでしょうか。' },
    { sp: 'GERU', text: 'ふ、夜は世界の音量が下がる。……そのぶん、言葉が響く。お前のような聞き手がいれば、なおさらな。今夜は、語りすぎるかもな。' },
  ], effects: ['mutual(HYU,GERU,1)', 'log(AMBIENT)'] }),
  A('DLG_N_JIN_LEN_MIDNIGHT_V14', ['JIN', 'LENNY'], { cond: 'time == MIDNIGHT', lines: [
    { sp: 'JIN', text: 'レニィ、真夜中に起きてるなんて珍しいな! 眠れねえのか?' },
    { sp: 'LENNY', text: 'ん……昼に寝すぎたみたい。……ジンパチこそ、夜食? 真夜中に二人でいると、なんか秘密基地みたいで、わくわくするね。' },
  ], effects: ['mutual(JIN,LENNY,1)', 'log(AMBIENT)'] }),
  A('DLG_N_MUN_GER_SPRING_V14', ['MUNI', 'GERU'], { cond: 'season == SPRING', lines: [
    { sp: 'MUNI', text: 'ゲルおねえちゃん、つくしみつけたの! はるだね!' },
    { sp: 'GERU', text: 'ほう、よく見つけたな。……春は足元に小さな物語が芽吹く季節だ。お前の目は、それをよく見つける。詩人の目だな、ムニ。' },
  ], effects: ['mutual(GERU,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_N_JIN_NEO_SUMMER_V14', ['JIN', 'NEO'], { cond: 'season == SUMMER', lines: [
    { sp: 'JIN', text: 'ネオ! 暑いな! こういう日は滝行……じゃねえ、屋上で水浴びだ! 勝負しようぜ!' },
    { sp: 'NEO', text: 'ふはは、望むところ! 我が金髪が濡れるのも夏の風物詩! ……水をかけ合う騎士と熱血漢、傍から見れば童のようであろうな。だが、それでよい!' },
  ], effects: ['mutual(JIN,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_N_HYU_LEN_AUTUMN_V14', ['HYU', 'LENNY'], { cond: 'season == AUTUMN', lines: [
    { sp: 'LENNY', text: 'ヒュウ、落ち葉、きれいだね。……歩くとかさかさ鳴って、子守唄みたい。' },
    { sp: 'HYU', text: 'ふふ、あなたは何でも子守唄にしますね。……ですが、確かに。紅葉の中を歩く私、まるで一幅の絵画。秋は、美しい者に優しい季節です。' },
  ], effects: ['mutual(HYU,LENNY,1)', 'log(AMBIENT)'] }),
  A('DLG_N_GER_NEO_WINTER_V14', ['GERU', 'NEO'], { cond: 'season == WINTER', lines: [
    { sp: 'NEO', text: 'ゲルよ、冬の夜は長い。……貴様の部屋で、本と茶と、静かな時間を分かち合わぬか。' },
    { sp: 'GERU', text: '……いい提案だ。毛布も貸してやる。ただし、いびきはかくなよ、騎士殿。……ふ、冬は、誰かと過ごすのが、一番いい季節だな。' },
  ], effects: ['mutual(GERU,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_N_MUN_JIN_RAIN_V14', ['MUNI', 'JIN'], { cond: 'weather == RAIN', lines: [
    { sp: 'MUNI', text: 'ジンパチおにいちゃん、あめだからそといけないの……つまんない。' },
    { sp: 'JIN', text: 'なら室内トレーニングだ! 腕立て、腹筋、ムニも一緒にやるぞ! ……雨の日を退屈にするか、鍛錬の日にするかは、心意気次第だ!' },
  ], effects: ['mutual(JIN,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_N_LEN_GER_SUNNY_V14', ['LENNY', 'GERU'], { cond: 'weather == SUNNY', lines: [
    { sp: 'LENNY', text: 'ゲル、いいお天気。……お布団干したいけど、干したら絶対その上で寝ちゃうよね。' },
    { sp: 'GERU', text: 'ふ、干した布団での昼寝は至福だからな。……いいだろう、私も本を持って混ざる。日向で読む本と、お前の寝息。悪くない午後だ。' },
  ], effects: ['mutual(LENNY,GERU,1)', 'log(AMBIENT)'] }),
  A('DLG_N_HYU_NEO_CLOUD_V14', ['HYU', 'NEO'], { cond: 'weather == CLOUDY', lines: [
    { sp: 'HYU', text: 'ネオさん、曇りの日は、実は肌が一番美しく見える光なのですよ。今日の私たち、いつにも増して映えますね。' },
    { sp: 'NEO', text: 'ほう、そういうものか。……道理で、貴様の顔が今日はいっそう凛々しく見えるわけだ。曇天もまた、美を知る者の味方であるな。ふ。' },
  ], effects: ['mutual(HYU,NEO,1)', 'log(AMBIENT)'] }),
];
