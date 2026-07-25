// ============================================================
// v9 追加会話 — 会話バリエーションのさらなる増量
//   (1) プレイヤー×主要6人 恋人会話
//   (2) 主要人物どうしのNPCカップル会話
//   (3) 主要人物2人の通常会話
//   (4) 恋人ではないが仲良くなった2人の会話
//   (5) 各施設・店での会話
// ============================================================
const T = (id, owner, node) => ({ id, owner, type: node.type ?? 'TALK', pool: node.pool ?? 'GENERIC', ...node });
const A = (id, cast, node) => ({ id, type: 'AMBIENT', pool: 'AMBIENT', owner: [...cast].sort().join('-'), cast, ...node });

export const DLG_V9 = [
  // ========================================================
  // (1) プレイヤー×主要人物 恋人会話(rel(PC,X) == LOVER)
  // ========================================================
  // レニィ
  T('DLG_LOVER_LENNY_V9_1', 'LENNY', { pool: 'STATE', cond: 'rel(PC, LENNY) == LOVER', weight: 14, lines: [{ sp: 'LENNY', text: 'ねえ、恋人になっても、大家さんはやっぱり忙しそうだね。……たまには僕の隣で、いっしょにサボろ? 特別に許可するよ。えへへ。' }], effects: ['aff(LENNY,1)'] }),
  T('DLG_LOVER_LENNY_V9_2', 'LENNY', { pool: 'STATE', cond: 'rel(PC, LENNY) == LOVER and time == MORNING', weight: 14, lines: [{ sp: 'LENNY', text: 'おはよ……朝いちばんに大家さんの顔が見られると、それだけで今日はいい日になる気がするんだ。……あと五分、このままでいい?' }], effects: ['aff(LENNY,1)'] }),
  T('DLG_LOVER_LENNY_V9_3', 'LENNY', { pool: 'STATE', cond: 'rel(PC, LENNY) == LOVER and season == SPRING', weight: 13, lines: [{ sp: 'LENNY', text: '春の陽だまりで、大家さんと並んでお昼寝。……これ、ぼくの叶っちゃった夢のひとつなんだよぉ。' }], effects: ['aff(LENNY,1)'] }),
  // ヒュウ
  T('DLG_LOVER_HYU_V9_1', 'HYU', { pool: 'STATE', cond: 'rel(PC, HYU) == LOVER', weight: 14, lines: [{ sp: 'HYU', text: 'あなたと恋人になってから、鏡を見る時間が少し減りました。……その分、あなたを見ているのですから、当然でしょう?' }], effects: ['aff(HYU,1)'] }),
  T('DLG_LOVER_HYU_V9_2', 'HYU', { pool: 'STATE', cond: 'rel(PC, HYU) == LOVER and time == EVENING', weight: 14, lines: [{ sp: 'HYU', text: '黄昏はもっとも美しく撮れる時間。……ですが今は、あなたの横顔を焼きつけるので忙しくて。写真より確かなものですからね。' }], effects: ['aff(HYU,1)'] }),
  T('DLG_LOVER_HYU_V9_3', 'HYU', { pool: 'STATE', cond: 'rel(PC, HYU) == LOVER and weather == RAIN', weight: 13, lines: [{ sp: 'HYU', text: '雨で前髪が崩れても、今日は気になりません。……あなたが隣にいれば、乱れた髪すら愛おしく思えるのですから。ふふ、私も変わったものです。' }], effects: ['aff(HYU,1)'] }),
  // ジンパチ
  T('DLG_LOVER_JIN_V9_1', 'JIN', { pool: 'STATE', cond: 'rel(PC, JIN) == LOVER', weight: 14, lines: [{ sp: 'JIN', text: 'なあ、恋人ってのはよ……こう、困った時に真っ先に顔が浮かぶんだな! お前のことばっか考えて、鍛錬に集中できねえの、責任取れよ!' }], effects: ['aff(JIN,1)'] }),
  T('DLG_LOVER_JIN_V9_2', 'JIN', { pool: 'STATE', cond: 'rel(PC, JIN) == LOVER and time == NIGHT', weight: 14, lines: [{ sp: 'JIN', text: '夜のクールダウン、お前も付き合えよ。……別に鍛錬じゃなくてもいいんだ。ただ、隣で星でも見ようぜ。……こういうの、悪くねえだろ?' }], effects: ['aff(JIN,1)'] }),
  T('DLG_LOVER_JIN_V9_3', 'JIN', { pool: 'STATE', cond: 'rel(PC, JIN) == LOVER and season == WINTER', weight: 13, lines: [{ sp: 'JIN', text: '寒いなら俺の隣に来い! 鍛えてるからな、湯たんぽより温かいぜ! ……へへ、こういう時だけは、筋肉が役に立つだろ?' }], effects: ['aff(JIN,1)'] }),
  // ゲル
  T('DLG_LOVER_GERU_V9_1', 'GERU', { pool: 'STATE', cond: 'rel(PC, GERU) == LOVER', weight: 14, lines: [{ sp: 'GERU', text: '恋人か。……物語の登場人物なら何百人も知っているが、自分がその一人になるとはな。悪くない。むしろ、続きが気になる展開だ。' }], effects: ['aff(GERU,1)'] }),
  T('DLG_LOVER_GERU_V9_2', 'GERU', { pool: 'STATE', cond: 'rel(PC, GERU) == LOVER and time in [NIGHT, MIDNIGHT]', weight: 14, lines: [{ sp: 'GERU', text: '夜更かしの相棒ができるとは思わなかった。……本を読む手を止めて、あんたの寝顔を眺める時間。これが、今の私の一番贅沢な栞だ。' }], effects: ['aff(GERU,1)'] }),
  T('DLG_LOVER_GERU_V9_3', 'GERU', { pool: 'STATE', cond: 'rel(PC, GERU) == LOVER and season == AUTUMN', weight: 13, lines: [{ sp: 'GERU', text: '読書の秋だ。……お前に朗読してやろうか。私の声で聞く物語は、格別だと言っておく。……恋人の特権だ、遠慮するな。' }], effects: ['aff(GERU,1)'] }),
  // ネオ
  T('DLG_LOVER_NEO_V9_1', 'NEO', { pool: 'STATE', cond: 'rel(PC, NEO) == LOVER', weight: 14, lines: [{ sp: 'NEO', text: '我が心の主よ。騎士の愛は一途にして永遠。……この胸の高鳴りは、いかなる戦場でも感じたことのなきもの。貴様のせいであるぞ。責任は重い。ふ。' }], effects: ['aff(NEO,1)'] }),
  T('DLG_LOVER_NEO_V9_2', 'NEO', { pool: 'STATE', cond: 'rel(PC, NEO) == LOVER and time == MORNING', weight: 14, lines: [{ sp: 'NEO', text: '朝ぞ。……貴様の目覚めを、こうして隣で見届けるのが、我が一日の始まりの儀式となった。……悪くない習慣である。いや、最良の習慣であるな。' }], effects: ['aff(NEO,1)'] }),
  T('DLG_LOVER_NEO_V9_3', 'NEO', { pool: 'STATE', cond: 'rel(PC, NEO) == LOVER and weather == SUNNY', weight: 13, lines: [{ sp: 'NEO', text: '快晴なり! 我が金髪が輝く日、貴様の手を引いて城下……いや、この街を歩こうではないか。騎士のエスコート、心して受けるがよい。ふはは!' }], effects: ['aff(NEO,1)'] }),
  // ムニ(家族)
  T('DLG_FAM_MUNI_V9_1', 'MUNI', { pool: 'STATE', cond: 'rel(PC, MUNI) == FAMILY', weight: 14, lines: [{ sp: 'MUNI', text: 'おおやさん、かぞくってさ、けんかしてもすぐなかなおりできるんだって! ……だからムニ、いっぱいわがままいっても、いい? えへへ。' }], effects: ['aff(MUNI,1)'] }),
  T('DLG_FAM_MUNI_V9_2', 'MUNI', { pool: 'STATE', cond: 'rel(PC, MUNI) == FAMILY and time == NIGHT', weight: 14, lines: [{ sp: 'MUNI', text: 'おおやさんがいると、よるもぜんぜんこわくないの。……かぞくって、まほうみたいだね。ムニ、まいにちしあわせなの。' }], effects: ['aff(MUNI,1)'] }),

  // ========================================================
  // (2) 主要人物どうしのNPCカップル会話(rel(A,B) == LOVER)
  // ========================================================
  A('DLG_NPCPL_HYU_LEN_V9', ['HYU', 'LENNY'], { cond: 'rel(HYU, LENNY) == LOVER', weight: 17, lines: [
    { sp: 'LENNY', text: 'ヒュウ、今日の前髪もきまってるね。……ぼくの恋人、世界一かっこいいよ。' },
    { sp: 'HYU', text: '……不意打ちはずるいですよ、レニィ。ほら、そんなことを言うと、耳が赤くなるでしょう。あなたの前でだけは、崩れてしまう。' },
  ], effects: ['mutual(HYU,LENNY,1)', 'log(AMBIENT)'] }),
  A('DLG_NPCPL_JIN_NEO_V9', ['JIN', 'NEO'], { cond: 'rel(JIN, NEO) == LOVER', weight: 17, lines: [
    { sp: 'JIN', text: 'ネオ、今日も一日お疲れさん! ……恋人になっても、お前と過ごす夜は特別に燃えるぜ!' },
    { sp: 'NEO', text: 'ふはは、同感である! 戦友にして恋人……これほど心強き絆があろうか。いや、ない! さあ、共に明日へ挑もうぞ!' },
  ], effects: ['mutual(JIN,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_NPCPL_GER_NEO_V9', ['GERU', 'NEO'], { cond: 'rel(GERU, NEO) == LOVER', weight: 17, lines: [
    { sp: 'GERU', text: 'ネオ、この一節を聞け。……「星は遠くとも、二人で見上げれば近くなる」。……ふ、今の私たちのことだと思わないか。' },
    { sp: 'NEO', text: '……美しい言葉である。貴様の声で聞くと、いっそう沁みる。故郷の星空も、貴様と見れば、また違って見えるであろうな。' },
  ], effects: ['mutual(GERU,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_NPCPL_HYU_JIN_V9', ['HYU', 'JIN'], { cond: 'rel(HYU, JIN) == LOVER', weight: 17, lines: [
    { sp: 'HYU', text: 'ジンパチくん、また汗だくで。……ほら、じっとして。私のハンカチで拭いてあげます。恋人の役目ですからね。' },
    { sp: 'JIN', text: 'わ、悪いなヒュウ……。お前、意外と世話焼きだよな。……そういうとこ、す、好きだぜ。……くっ、言っちまった!' },
  ], effects: ['mutual(HYU,JIN,1)', 'log(AMBIENT)'] }),
  A('DLG_NPCPL_LEN_NEO_V9', ['LENNY', 'NEO'], { cond: 'rel(LENNY, NEO) == LOVER', weight: 17, lines: [
    { sp: 'LENNY', text: 'ネオ、騎士さまってさ、恋人にはどんな誓いを立てるの?' },
    { sp: 'NEO', text: 'ふむ……「その眠りを、生涯守り抜く」。これが我が誓いである。安心して眠れ、レニィ。貴様の夢は、この騎士が見張っておる。' },
    { sp: 'LENNY', text: 'えへへ……じゃあ、安心して寝られるね。おやすみ、ぼくの騎士さま……zzz' },
  ], effects: ['mutual(LENNY,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_NPCPL_GER_HYU_V9', ['GERU', 'HYU'], { cond: 'rel(GERU, HYU) == LOVER', weight: 17, lines: [
    { sp: 'HYU', text: 'ゲル、あなたの本に挟まった押し花……そこに私の名前を、そっと書き足してもいいですか。あなたの物語の一頁に、私も残りたいのです。' },
    { sp: 'GERU', text: '……許す。いや、むしろ望むところだ。お前という頁は、私の物語で一番、色鮮やかだからな。' },
  ], effects: ['mutual(GERU,HYU,1)', 'log(AMBIENT)'] }),
  A('DLG_NPCPL_JIN_LEN_V9', ['JIN', 'LENNY'], { cond: 'rel(JIN, LENNY) == LOVER', weight: 17, lines: [
    { sp: 'JIN', text: 'レニィ、お前が寝てる時間、俺はこっそり隣で見てんだ。……安心しきった顔で寝るからよ、こっちまで幸せになるんだよな。' },
    { sp: 'LENNY', text: 'えへへ……ジンパチのそばだと、いちばんよく眠れるんだ。……それって、いちばんの愛情表現でしょ?' },
  ], effects: ['mutual(JIN,LENNY,1)', 'log(AMBIENT)'] }),

  // ========================================================
  // (3) 主要人物2人の通常会話(場所/時間/季節/天気)
  // ========================================================
  A('DLG_N_HYU_JIN_ROOF_V9', ['HYU', 'JIN'], { cond: 'location == ROOF', lines: [
    { sp: 'JIN', text: 'ヒュウ! 屋上からの眺め最高だな! 街ぜんぶ見下ろせるぜ!' },
    { sp: 'HYU', text: 'ええ。ただし、一番の絶景は、この景色をバックに立つ私自身ですが。……ふふ、あなたも少しは絵になりますよ、ジンパチくん。' },
  ], effects: ['mutual(HYU,JIN,1)', 'log(AMBIENT)'] }),
  A('DLG_N_GER_JIN_GROUND_V9', ['GERU', 'JIN'], { cond: 'location == GROUND', lines: [
    { sp: 'JIN', text: 'ゲル、路地で立ち読みか? 目が悪くなるぜ!' },
    { sp: 'GERU', text: '大きなお世話だ。……だが、心配してくれるのは、まあ、悪くない。お前は暑苦しいが、根は優しいからな。知ってるぞ。' },
  ], effects: ['mutual(JIN,GERU,1)', 'log(AMBIENT)'] }),
  A('DLG_N_LEN_NEO_ROOF_V9', ['LENNY', 'NEO'], { cond: 'location == ROOF', lines: [
    { sp: 'LENNY', text: 'ネオ、屋上でお昼寝すると、空に浮かんでるみたいなんだよ。……ネオも、いっしょにどう?' },
    { sp: 'NEO', text: 'ぬ、騎士が昼日中に眠るなど……いや。貴様の隣でなら、そういう平和も、悪くないか。……少しだけだぞ。ふ。' },
  ], effects: ['mutual(LENNY,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_N_MUN_GER_GROUND_V9', ['MUNI', 'GERU'], { cond: 'location == GROUND', lines: [
    { sp: 'MUNI', text: 'ゲルおねえちゃん、みてみて! ねこがいるの! なでていい?' },
    { sp: 'GERU', text: 'そっとな。……猫は、静かな者にしか気を許さない。ふ、お前、意外と向いてるかもしれんぞ。' },
  ], effects: ['mutual(GERU,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_N_HYU_NEO_MORNING_V9', ['HYU', 'NEO'], { cond: 'time == MORNING', lines: [
    { sp: 'HYU', text: 'ネオさん、朝の光の中でその金髪……悔しいですが、絵になりますね。私の緑髪と並べば、さぞ映えるでしょう。' },
    { sp: 'NEO', text: 'ふ、貴様と並び立つとは光栄である。金と緑、まさに紋章の配色よ。……朝から良い気分であるな。' },
  ], effects: ['mutual(HYU,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_N_JIN_LEN_DAY_V9', ['JIN', 'LENNY'], { cond: 'time == DAY', lines: [
    { sp: 'JIN', text: 'レニィ! 昼間から寝るな! 太陽が出てるうちは動くもんだぜ!' },
    { sp: 'LENNY', text: 'えー……お日さまが気持ちいいから、寝るんだよぉ。ジンパチも、たまには止まってみたら? 見えるもの、変わるよ。' },
    { sp: 'JIN', text: '……なるほどな。じゃあ五分だけ、隣で止まってみるか。……お、意外と悪くねえな。' },
  ], effects: ['mutual(JIN,LENNY,1)', 'log(AMBIENT)'] }),
  A('DLG_N_GER_NEO_MIDNIGHT_V9', ['GERU', 'NEO'], { cond: 'time == MIDNIGHT', lines: [
    { sp: 'NEO', text: 'ゲルよ、まだ起きておるか。……真夜中に灯る貴様の部屋の明かり、なぜか安心するのである。' },
    { sp: 'GERU', text: 'お前の見回りも、いつものことだな。……夜更かし仲間がいるというのは、悪くない。茶でも淹れるか。' },
  ], effects: ['mutual(GERU,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_N_HYU_MUN_SPRING_V9', ['HYU', 'MUNI'], { cond: 'season == SPRING', lines: [
    { sp: 'MUNI', text: 'ヒュウおにいちゃん、はなびらがかみについてるの! とってあげる!' },
    { sp: 'HYU', text: 'おや、ありがとうムニ。……あなたに整えてもらう髪も、たまには一興ですね。ふふ、優しい手ですこと。' },
  ], effects: ['mutual(HYU,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_N_JIN_NEO_SUMMER_V9', ['JIN', 'NEO'], { cond: 'season == SUMMER', lines: [
    { sp: 'JIN', text: '暑いなネオ! こういう日は滝行……じゃねえ、水浴びだ! 屋上で水かけ合おうぜ!' },
    { sp: 'NEO', text: 'ふはは、望むところ! 我が金髪が濡れるのも、夏の風物詩か! いざ、尋常に勝負である!' },
  ], effects: ['mutual(JIN,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_N_LEN_GER_AUTUMN_V9', ['LENNY', 'GERU'], { cond: 'season == AUTUMN', lines: [
    { sp: 'GERU', text: 'レニィ、落ち葉の絨毯だ。……歩くたびに音がする。この静かな賑やかさ、お前は好きだろう?' },
    { sp: 'LENNY', text: 'うん、大好き。……かさかさって、子守唄みたい。ゲルの声も、この音も、ぼくを眠くさせる魔法だね。' },
  ], effects: ['mutual(LENNY,GERU,1)', 'log(AMBIENT)'] }),
  A('DLG_N_MUN_NEO_WINTER_V9', ['MUNI', 'NEO'], { cond: 'season == WINTER', lines: [
    { sp: 'MUNI', text: 'ネオおにいちゃん、ゆき! ゆきがっせんしよ!' },
    { sp: 'NEO', text: '雪の礫か! よかろう、騎士も童心に返る時がある! ……ぬ、油断した! 一本取られたわ! やるな、ムニ!' },
  ], effects: ['mutual(MUNI,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_N_HYU_GER_RAIN_V9', ['HYU', 'GERU'], { cond: 'weather == RAIN', lines: [
    { sp: 'HYU', text: 'ゲル、雨宿りにあなたの部屋を借りても? ……前髪が崩れるのは困りますが、あなたの本の匂いは、嫌いではありません。' },
    { sp: 'GERU', text: '……好きにしろ。ただし、濡れた傘は入口に置け。本が湿気るのは、私が困る。……茶は、出してやる。' },
  ], effects: ['mutual(HYU,GERU,1)', 'log(AMBIENT)'] }),
  A('DLG_N_JIN_MUN_SUNNY_V9', ['JIN', 'MUNI'], { cond: 'weather == SUNNY', lines: [
    { sp: 'MUNI', text: 'ジンパチおにいちゃん、いいてんき! おにごっこしよ!' },
    { sp: 'JIN', text: 'よーし! 俺が鬼だ! ……って、手加減してやるからな! ほら、逃げろー!' },
  ], effects: ['mutual(JIN,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_N_LEN_HYU_CLOUD_V9', ['LENNY', 'HYU'], { cond: 'weather == CLOUDY', lines: [
    { sp: 'LENNY', text: 'くもりの日って、影がやわらかいね。ヒュウの顔、いつもよりやさしく見えるよ。' },
    { sp: 'HYU', text: '……曇天は、実は最も肌が美しく見える光なのですよ。よく気づきましたね、レニィ。あなた、審美眼があります。' },
  ], effects: ['mutual(HYU,LENNY,1)', 'log(AMBIENT)'] }),

  // ========================================================
  // (4) 恋人ではないが仲良くなった2人の会話
  //     (mutual >= 55 and rel != LOVER)
  // ========================================================
  A('DLG_FRND_HYU_LEN_V9', ['HYU', 'LENNY'], { cond: 'mutual(HYU, LENNY) >= 55 and rel(HYU, LENNY) != LOVER', weight: 15, lines: [
    { sp: 'HYU', text: 'レニィ、あなたとは恋にはなりませんが……そばにいると、なぜか肩の力が抜けるのですよね。不思議な親友です。' },
    { sp: 'LENNY', text: 'えへへ、ヒュウも、ぼくの前だと素になるもんね。……そういうの、いい友達の証拠だと思うんだ。' },
  ], effects: ['mutual(HYU,LENNY,1)', 'log(AMBIENT)'] }),
  A('DLG_FRND_GER_NEO_V9', ['GERU', 'NEO'], { cond: 'mutual(GERU, NEO) >= 55 and rel(GERU, NEO) != LOVER', weight: 15, lines: [
    { sp: 'NEO', text: 'ゲルよ、貴様とは恋には落ちぬが……無言で夜を分かち合える、得難き友である。この静寂、心地よい。' },
    { sp: 'GERU', text: '……同感だ。喋らずとも通じる相手は貴重だからな。恋人ではない。だが、それ以上に、気楽な間柄かもしれん。' },
  ], effects: ['mutual(GERU,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_FRND_JIN_HYU_V9', ['JIN', 'HYU'], { cond: 'mutual(JIN, HYU) >= 55 and rel(JIN, HYU) != LOVER', weight: 15, lines: [
    { sp: 'JIN', text: 'ヒュウ、お前とは全然タイプ違うのに、なんでこんな気が合うんだろな! 親友ってやつか!' },
    { sp: 'HYU', text: 'ふふ、正反対だからこそ、でしょう。あなたの熱と私の美学。……並ぶと、案外バランスがいいのですよ、相棒。' },
  ], effects: ['mutual(JIN,HYU,1)', 'log(AMBIENT)'] }),
  A('DLG_FRND_LEN_MUN_V9', ['LENNY', 'MUNI'], { cond: 'mutual(LENNY, MUNI) >= 55 and rel(LENNY, MUNI) != LOVER', weight: 15, lines: [
    { sp: 'MUNI', text: 'レニィおにいちゃん、だいすき! いっしょにおひるねすると、いちばんよくねむれるの!' },
    { sp: 'LENNY', text: 'ぼくもだよ、ムニ。……ぼくたち、お昼寝仲間だね。世界一の親友の証だよぉ。' },
  ], effects: ['mutual(LENNY,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_FRND_GER_JIN_V9', ['GERU', 'JIN'], { cond: 'mutual(GERU, JIN) >= 55 and rel(GERU, JIN) != LOVER', weight: 15, lines: [
    { sp: 'JIN', text: 'ゲル、お前がいると場が締まるんだよな。俺が暴走しても、お前が一言でブレーキかけてくれる。……信頼してるぜ、親友!' },
    { sp: 'GERU', text: 'ふ、ブレーキ役は疲れるんだがな。……だが、お前のような無鉄砲を放っておけないのも事実だ。まあ、良い友だ。認めよう。' },
  ], effects: ['mutual(GERU,JIN,1)', 'log(AMBIENT)'] }),
  A('DLG_FRND_HYU_MUN_V9', ['HYU', 'MUNI'], { cond: 'mutual(HYU, MUNI) >= 55 and rel(HYU, MUNI) != LOVER', weight: 15, lines: [
    { sp: 'MUNI', text: 'ヒュウおにいちゃん、ムニのこと、かぞくみたいにおもってる?' },
    { sp: 'HYU', text: '……ええ、弟のように、ね。あなたが泣くと、私の完璧な心が少し乱れる。……これは、家族にしか起きない現象なのですよ。' },
  ], effects: ['mutual(HYU,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_FRND_LEN_JIN_V9', ['LENNY', 'JIN'], { cond: 'mutual(LENNY, JIN) >= 55 and rel(LENNY, JIN) != LOVER', weight: 15, lines: [
    { sp: 'LENNY', text: 'ジンパチって、うるさいけど……いなくなると、静かすぎて寂しいんだよね。親友って、そういうものかな。' },
    { sp: 'JIN', text: 'おい、それ褒めてんのか! ……まあいい、俺もお前がいねえと調子出ねえからな。おあいこだ、親友!' },
  ], effects: ['mutual(LENNY,JIN,1)', 'log(AMBIENT)'] }),
  A('DLG_FRND_MUN_NEO_V9', ['MUNI', 'NEO'], { cond: 'mutual(MUNI, NEO) >= 55 and rel(MUNI, NEO) != LOVER', weight: 15, lines: [
    { sp: 'MUNI', text: 'ネオおにいちゃん、きしのおはなし、もっときかせて! ムニ、だいすきなの!' },
    { sp: 'NEO', text: 'ふはは、良き聞き手よ! ならば今宵は、竜と戦った騎士の物語を語ろう。……我が親友ムニに、特別にな。' },
  ], effects: ['mutual(MUNI,NEO,1)', 'log(AMBIENT)'] }),

  // ========================================================
  // (5) 各施設・店での会話バリエーション
  // ========================================================
  A('DLG_F_LEN_GER_CAFE_V9', ['LENNY', 'GERU'], { cond: 'location == cafe', lines: [
    { sp: 'GERU', text: 'レニィ、その席は日当たりが良すぎる。……ほら、案の定寝ているな。コーヒーが冷めるぞ。' },
    { sp: 'LENNY', text: 'ん……ゲルが起こしてくれるから、安心して寝られるんだよぉ。……あと三分だけ。' },
  ], effects: ['mutual(LENNY,GERU,1)', 'log(AMBIENT)'] }),
  A('DLG_F_HYU_NEO_BARBER_V9', ['HYU', 'NEO'], { cond: 'location == barber', lines: [
    { sp: 'HYU', text: 'ネオさん、また手入れだけですか。切らない主義の者どうし、オヤジさん泣かせですね。' },
    { sp: 'NEO', text: 'ふ、我らは髪に誇りを持つ同志である。……オヤジ殿には、手入れの腕を存分に振るってもらおう。それが礼儀であろう。' },
  ], effects: ['mutual(HYU,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_F_JIN_GER_RAMEN_V9', ['JIN', 'GERU'], { cond: 'location == ramen', lines: [
    { sp: 'JIN', text: 'ゲル、お前も替え玉いっとけ! 育ち盛り……じゃねえけど、食は活力だぜ!' },
    { sp: 'GERU', text: '私は一杯で十分だ。……だが、お前の食べっぷりを肴にすると、なぜか麺が進むな。ふ、不思議なものだ。' },
  ], effects: ['mutual(JIN,GERU,1)', 'log(AMBIENT)'] }),
  A('DLG_F_LEN_MUN_DAGASHI_V9', ['LENNY', 'MUNI'], { cond: 'location == dagashi', lines: [
    { sp: 'MUNI', text: 'レニィおにいちゃん、どれがいい? ムニ、えらんであげる!' },
    { sp: 'LENNY', text: 'じゃあ、ムニのおすすめで。……眠くならないラムネ、あるかな。えへへ。' },
  ], effects: ['mutual(LENNY,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_F_HYU_GER_CAKE_V9', ['HYU', 'GERU'], { cond: 'location == cake', lines: [
    { sp: 'HYU', text: 'ゲル、あなたモンブラン派でしたね。私はやはりショートケーキ。断面の美しさが違います。' },
    { sp: 'GERU', text: 'お前は見た目、私は味と余韻だ。……まあ、それぞれの美学があっていい。ひとくち、交換するか?' },
  ], effects: ['mutual(HYU,GERU,1)', 'log(AMBIENT)'] }),
  A('DLG_F_NEO_JIN_GAME_V9', ['NEO', 'JIN'], { cond: 'location == game', lines: [
    { sp: 'JIN', text: 'ネオ! 対戦格闘だ! 剣の腕、ゲームでも通用するか見せてみろよ!' },
    { sp: 'NEO', text: 'ふはは、受けて立とう! ……ぬ、この飛び道具なる卑怯な技は何だ! 騎士道に反するぞ、ジンパチ!' },
    { sp: 'JIN', text: 'ゲームに騎士道はねえんだよ! ほら、もう一本!' },
  ], effects: ['mutual(JIN,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_F_GER_LEN_BOOK_V9', ['GERU', 'LENNY'], { cond: 'location == book', lines: [
    { sp: 'GERU', text: 'レニィ、この絵本、お前が好きそうだ。……絵が多くて、字が少ない。お前向きだろう。ふ。' },
    { sp: 'LENNY', text: 'わ、ほんとだ。……ゲルって、ぼくの好み、よくわかってるね。ありがとう。今夜、ムニに読んであげよ。' },
  ], effects: ['mutual(GERU,LENNY,1)', 'log(AMBIENT)'] }),
  A('DLG_F_HYU_MUN_FLOWER_V9', ['HYU', 'MUNI'], { cond: 'location == flower', lines: [
    { sp: 'MUNI', text: 'ヒュウおにいちゃん、このおはな、ヒュウおにいちゃんににてる! きれいだから!' },
    { sp: 'HYU', text: '……ムニ、あなたは世界一のお世辞の名人ですね。ふふ、では、このバラをあなたに。美しい者から、可愛い者への贈り物です。' },
  ], effects: ['mutual(HYU,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_F_JIN_NEO_SENTO_V9', ['JIN', 'NEO'], { cond: 'location == sento', lines: [
    { sp: 'JIN', text: 'ネオ! 熱い湯だぜ! 男は黙って肩まで浸かる! ……ぷはー! 生き返るな!' },
    { sp: 'NEO', text: 'うむ、この銭湯なる文化、玉座より良いと言い続けておる。……湯上がりのコーヒー牛乳、貴様の分も買ってやろう。' },
  ], effects: ['mutual(JIN,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_F_LEN_NEO_AQUA_V9', ['LENNY', 'NEO'], { cond: 'location == aquarium', lines: [
    { sp: 'LENNY', text: 'ネオ、あの深海魚、暗いところで光ってるね。ひとりぼっちでも、きれい。' },
    { sp: 'NEO', text: '孤高の光か。……我が旅路にも似ておる。だがレニィ、今の私は独りではない。あの魚も、いつか仲間を見つけるであろう。' },
  ], effects: ['mutual(LENNY,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_F_GER_HYU_IZAKAYA_V9', ['GERU', 'HYU'], { cond: 'location == izakaya', lines: [
    { sp: 'HYU', text: 'ゲル、あなたジュース派でしたね。……こんな夜くらい、私の作った特製ノンアルカクテル、いかがです? 私色の一杯を。' },
    { sp: 'GERU', text: '……もらおう。お前の自信作なら、味も期待できるだろう。ふ、隅の席で、静かに味わうとするか。' },
  ], effects: ['mutual(GERU,HYU,1)', 'log(AMBIENT)'] }),
  A('DLG_F_JIN_MUN_TOYSHOP_V9', ['JIN', 'MUNI'], { cond: 'location == toyshop', lines: [
    { sp: 'MUNI', text: 'ジンパチおにいちゃん、プラモ、いっしょにつくろ!' },
    { sp: 'JIN', text: 'おう! でもプラモは繊細な作業だぞ。……よし、俺が教えてやる。ニッパーの使い方からな! 弟子入りを許可する!' },
  ], effects: ['mutual(JIN,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_F_NEO_GER_KONBINI_V9', ['NEO', 'GERU'], { cond: 'location == konbini', lines: [
    { sp: 'NEO', text: 'ゲルよ、深夜のコンビニで貴様に会うとはな。……夜更かし者の宿命であるか。' },
    { sp: 'GERU', text: 'ふ、お前もな。……肉まんを買うつもりが、つい新刊の立ち読みだ。この店は、夜型には危険だな。' },
  ], effects: ['mutual(GERU,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_F_HYU_JIN_YAKINIKU_V9', ['HYU', 'JIN'], { cond: 'location == yakiniku', lines: [
    { sp: 'JIN', text: 'ヒュウ! カルビ焼けたぞ! お前、煙気にすんなよ! 肉の前では美もへったくれもねえ!' },
    { sp: 'HYU', text: '……髪に匂いがつくのが難点ですが。まあ、あなたの焼く手際だけは認めます。いただきましょう。ふふ、美味しい。' },
  ], effects: ['mutual(HYU,JIN,1)', 'log(AMBIENT)'] }),
  A('DLG_F_LEN_HYU_CINEMA_V9', ['LENNY', 'HYU'], { cond: 'location == cinema', lines: [
    { sp: 'HYU', text: 'レニィ、今日の映画は感動作らしいですよ。……泣く準備はいいですか。私は、涙も美しく流せますが。' },
    { sp: 'LENNY', text: 'ぼくは……たぶん途中で寝ちゃうから、感動シーンでヒュウがつついて起こして? えへへ。' },
  ], effects: ['mutual(HYU,LENNY,1)', 'log(AMBIENT)'] }),
  A('DLG_F_MUN_GER_DONUT_V9', ['MUNI', 'GERU'], { cond: 'location == donut', lines: [
    { sp: 'MUNI', text: 'ゲルおねえちゃん、チョコドーナツはんぶんこしよ!' },
    { sp: 'GERU', text: 'ふ、いいだろう。……甘いものは、本を読む手をベタつかせるのが難点だが。お前と食べるなら、それも許せるな。' },
  ], effects: ['mutual(GERU,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_F_NEO_MUN_CHURCH_V9', ['NEO', 'MUNI'], { cond: 'location == church', lines: [
    { sp: 'MUNI', text: 'ネオおにいちゃん、きょうかいってなんかしずかだね。こえがわんわんするの。' },
    { sp: 'NEO', text: 'うむ、聖なる場ゆえな。……ムニ、ここでは小さな声で話すのが作法である。ほら、こうしてな。……ふ、内緒話のようで、悪くなかろう?' },
  ], effects: ['mutual(MUNI,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_F_JIN_LEN_KARAOKE_V9', ['JIN', 'LENNY'], { cond: 'location == karaoke', lines: [
    { sp: 'JIN', text: 'レニィ! 次お前の番だぞ! ……って、もう寝てるし! しょうがねえ、俺が二人分歌ってやる!' },
    { sp: 'LENNY', text: 'ん……ジンパチの歌、子守唄にちょうどいいんだ……zzz。……いい声だね、ほんと。' },
  ], effects: ['mutual(JIN,LENNY,1)', 'log(AMBIENT)'] }),
  A('DLG_F_GER_NEO_HALL_V9', ['GERU', 'NEO'], { cond: 'location == hall', lines: [
    { sp: 'NEO', text: 'ゲルよ、この円卓、騎士の対等の証と言ったであろう。……貴様と囲むと、なぜか話が弾むのである。' },
    { sp: 'GERU', text: '広い場所は、二人だと妙に落ち着くな。……人が集まる前の、この静けさ。私は嫌いじゃない。お前とだから、かもしれんが。' },
  ], effects: ['mutual(GERU,NEO,1)', 'log(AMBIENT)'] }),
];
