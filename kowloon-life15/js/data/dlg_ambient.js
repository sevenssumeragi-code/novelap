// ============================================================
// NPC同士の会話 (AMBIENT) — NPC会話設計書 第12章
// v2: cast方式に刷新。cast は登場人物の配列(2人=雑談 / 3人=グループ会話)。
//     同じ場所に cast 全員がいると発火し、プレイヤーは盗み聞きできる。
//     ・主要人物どうしの2人会話を大幅増量
//     ・小暮カネ/床屋/郵便屋/看板娘 と主要6人の会話を増量
//     ・銭湯の男性グループ会話(cast 3人)
// cond 内の location は「cast がいる場所」を指す。
// ============================================================
const N = (id, node) => {
  const cast = node.cast;
  return { id, type: 'AMBIENT', pool: 'AMBIENT', owner: [...cast].sort().join('-'), ...node };
};

export const DLG_AMBIENT = [
  // ============ 主要人物 × 主要人物 ============
  // --- レニィ × ヒュウ ---
  N('DLG_AMB_LEN_HYU_001', { cast: ['LENNY', 'HYU'], lines: [
    { sp: 'HYU', text: 'レニィ、また屋上で寝ていたのですか。' },
    { sp: 'LENNY', text: 'んー……屋上の風が、僕を呼んだんだよ。' },
    { sp: 'HYU', text: '……まあ、絵にはなりますが。風邪をひいたら承知しませんよ。' },
  ], effects: ['mutual(HYU,LENNY,1)', 'log(AMBIENT)'] }),
  N('DLG_AMB_LEN_HYU_002', { cast: ['LENNY', 'HYU'], cond: 'weather == RAIN', lines: [
    { sp: 'LENNY', text: 'ヒュウ、前髪、だいじょうぶ?' },
    { sp: 'HYU', text: '……レニィ。その質問は、戦場の兵士に「怖くないか」と聞くようなものです。' },
    { sp: 'LENNY', text: 'つまり、だいじょうぶじゃないんだね。' },
  ], effects: ['mutual(HYU,LENNY,1)', 'log(AMBIENT)'] }),
  N('DLG_AMB_LEN_HYU_003', { cast: ['LENNY', 'HYU'], cond: 'location == cafe', lines: [
    { sp: 'HYU', text: 'レニィ、コーヒーで眠くなるのはあなたくらいですよ。' },
    { sp: 'LENNY', text: 'えへへ……コーヒー、こもりうただと思ってるのかも。' },
  ], effects: ['mutual(HYU,LENNY,1)', 'log(AMBIENT)'] }),

  // --- レニィ × ジンパチ ---
  N('DLG_AMB_LEN_JIN_001', { cast: ['LENNY', 'JIN'], lines: [
    { sp: 'JIN', text: 'レニィ! 走るぞ! 階段10往復!' },
    { sp: 'LENNY', text: 'いってらっしゃい。僕は心のなかで応援してるよ。' },
    { sp: 'JIN', text: '心のなかじゃ筋肉はつかねえんだよ! ……ま、おまえはそれでいいけどな!' },
  ], effects: ['mutual(JIN,LENNY,1)', 'log(AMBIENT)'] }),
  N('DLG_AMB_LEN_JIN_002', { cast: ['LENNY', 'JIN'], cond: 'time == DAY', lines: [
    { sp: 'JIN', text: 'おいレニィ、昼飯食ったか? ナポリタン大盛りおごってやるぜ!' },
    { sp: 'LENNY', text: 'ほんと? ジンパチはやさしいねえ。半分こでいいよ、僕、途中で寝ちゃうし。' },
    { sp: 'JIN', text: '飯の途中で寝るなよ!?' },
  ], effects: ['mutual(JIN,LENNY,1)', 'log(AMBIENT)'] }),

  // --- ヒュウ × ジンパチ ---
  N('DLG_AMB_HYU_JIN_001', { cast: ['HYU', 'JIN'], lines: [
    { sp: 'JIN', text: 'ヒュウ! てめえまた鏡見てんのか! 俺と勝負しろ!' },
    { sp: 'HYU', text: 'ジンパチくん、声が大きいですよ。私の優雅な午後が台無しでしょう?' },
    { sp: 'JIN', text: '優雅より筋肉だろ!' },
    { sp: 'HYU', text: 'その二択が既に敗北なのです。' },
  ], effects: ['mutual(HYU,JIN,1)', 'log(AMBIENT)'] }),
  N('DLG_AMB_HYU_JIN_002', { cast: ['HYU', 'JIN'], cond: 'built(game)', lines: [
    { sp: 'JIN', text: '昨日のゲーセンの点数、俺の勝ちだったよな!?' },
    { sp: 'HYU', text: '機械の調子が悪かったのです。私の実力はあんなものではありません。' },
    { sp: 'JIN', text: '負け惜しみだぜ! 今夜リベンジマッチだ!' },
    { sp: 'HYU', text: '……ふ。受けて立ちましょう。' },
  ], effects: ['mutual(HYU,JIN,2)', 'log(AMBIENT)'] }),

  // --- レニィ × ムニ ---
  N('DLG_AMB_LEN_MUN_001', { cast: ['LENNY', 'MUNI'], lines: [
    { sp: 'MUNI', text: 'レニィおにいちゃん、おきて〜。ムニとあそぶの!' },
    { sp: 'LENNY', text: 'んん……あと五分……いや、三分でいいよ……' },
    { sp: 'MUNI', text: 'じゃあムニもいっしょにねる! むにゅ〜。' },
    { sp: 'LENNY', text: '……それが一番かしこいね。' },
  ], effects: ['mutual(LENNY,MUNI,1)', 'log(AMBIENT)'] }),

  // --- ゲル × ムニ ---
  N('DLG_AMB_GER_MUN_001', { cast: ['GERU', 'MUNI'], cond: 'time in [NIGHT, MIDNIGHT]', lines: [
    { sp: 'GERU', text: 'ムニ、夜更かしはだめだ。……ほら、手を出せ。送ってやる。' },
    { sp: 'MUNI', text: 'ゲルおねえちゃんの手、あったかいの。' },
    { sp: 'GERU', text: '……そうか。なら、ゆっくり歩くとするか。' },
  ], effects: ['mutual(GERU,MUNI,1)', 'info(INFO_GERU_CARING)', 'log(AMBIENT)'] }),
  N('DLG_AMB_GER_MUN_002', { cast: ['GERU', 'MUNI'], lines: [
    { sp: 'MUNI', text: 'ゲルおねえちゃん、そのほん、なにがかいてあるの?' },
    { sp: 'GERU', text: '海の向こうの、遠い街の話だ。……読んでやろうか。' },
    { sp: 'MUNI', text: 'よむ! ムニ、おはなしすき!' },
  ], effects: ['mutual(GERU,MUNI,1)', 'log(AMBIENT)'] }),

  // --- ヒュウ × ネオ ---
  N('DLG_AMB_HYU_NEO_001', { cast: ['HYU', 'NEO'], lines: [
    { sp: 'NEO', text: '貴様の身だしなみ、認めてやろう。騎士に通じる美意識である。' },
    { sp: 'HYU', text: 'おや、ネオさんに褒められるとは。……そのマント、私が見立て直しましょうか?' },
    { sp: 'NEO', text: 'ぬ……。い、いや、結構である。これは戦装束であるからして。' },
  ], effects: ['mutual(HYU,NEO,1)', 'log(AMBIENT)'] }),

  // --- ジンパチ × ネオ ---
  N('DLG_AMB_JIN_NEO_001', { cast: ['JIN', 'NEO'], lines: [
    { sp: 'JIN', text: 'ネオ! その剣、飾りなんだろ? 俺の拳と勝負しようぜ!' },
    { sp: 'NEO', text: 'ふっ、血の気の多い男である。だが嫌いではない。……腕相撲でどうだ。' },
    { sp: 'JIN', text: 'おう! 望むところだぜ!' },
  ], effects: ['mutual(JIN,NEO,2)', 'log(AMBIENT)'] }),

  // --- ジンパチ × ムニ ---
  N('DLG_AMB_JIN_MUN_001', { cast: ['JIN', 'MUNI'], lines: [
    { sp: 'MUNI', text: 'ジンパチおにいちゃん、かたぐるま!' },
    { sp: 'JIN', text: 'おう! しっかりつかまってろよ! せーの、たかいたかーい!' },
    { sp: 'MUNI', text: 'せかいがおっきい! むにゅ〜!' },
  ], effects: ['mutual(JIN,MUNI,1)', 'log(AMBIENT)'] }),

  // --- ヒュウ × ムニ ---
  N('DLG_AMB_HYU_MUN_001', { cast: ['HYU', 'MUNI'], cond: 'weather == RAIN', lines: [
    { sp: 'HYU', text: 'ムニ、濡れますよ。ほら、私の傘に入りなさい。' },
    { sp: 'MUNI', text: 'ヒュウおにいちゃんのかさ、いいにおいするの。' },
    { sp: 'HYU', text: '……当然です。香りにも気を配っていますから。' },
  ], effects: ['mutual(HYU,MUNI,1)', 'info(INFO_HYU_KIND)', 'log(AMBIENT)'] }),

  // --- レニィ × ゲル ---
  N('DLG_AMB_LEN_GER_001', { cast: ['LENNY', 'GERU'], cond: 'location == book', lines: [
    { sp: 'LENNY', text: 'ゲル、その本おもしろい?' },
    { sp: 'GERU', text: 'ああ。……眠くなったら、そこのソファを使え。私が栞を挟んでおいてやる。' },
    { sp: 'LENNY', text: 'ゲルはやさしいねえ……zzz' },
    { sp: 'GERU', text: '……早いな。' },
  ], effects: ['mutual(LENNY,GERU,1)', 'log(AMBIENT)'] }),

  // --- ヒュウ × ゲル ---
  N('DLG_AMB_HYU_GER_001', { cast: ['HYU', 'GERU'], lines: [
    { sp: 'HYU', text: 'ゲル、あなたはなぜ自分を飾らないのですか。素材は良いのに。' },
    { sp: 'GERU', text: '飾る時間で本が一冊読める。私にはそっちの方が価値があるんだ。' },
    { sp: 'HYU', text: '……ふ。それはそれで、一つの美学ですね。認めましょう。' },
  ], effects: ['mutual(HYU,GERU,1)', 'log(AMBIENT)'] }),

  // --- ジンパチ × ゲル ---
  N('DLG_AMB_JIN_GER_001', { cast: ['JIN', 'GERU'], cond: 'built(izakaya) and time in [NIGHT, MIDNIGHT]', lines: [
    { sp: 'JIN', text: 'ゲル! なんでいつもジュースなんだよ! 飲もうぜ!' },
    { sp: 'GERU', text: '私は素面で人が酔っていくのを観察するのが好きなんだ。……お前は特に面白い。' },
    { sp: 'JIN', text: 'それ褒めてんのか!?' },
  ], effects: ['mutual(JIN,GERU,1)', 'log(AMBIENT)'] }),

  // --- ネオ × ムニ ---
  N('DLG_AMB_NEO_MUN_001', { cast: ['NEO', 'MUNI'], cond: 'location == dagashi', lines: [
    { sp: 'MUNI', text: 'ネオおにいちゃんも、だがしすきなの?' },
    { sp: 'NEO', text: 'ち、違う! これは貴様の付き添いである! ……ラムネ菓子は、その、毒見であるからして。' },
    { sp: 'MUNI', text: 'えへへ、ネオおにいちゃんもなかまなの。' },
  ], effects: ['mutual(NEO,MUNI,1)', 'log(AMBIENT)'] }),

  // ============ 銭湯・男湯グループ会話 (cast 3人) ============
  N('DLG_AMB_SENTO_TRIO_001', { cast: ['JIN', 'HYU', 'LENNY'], cond: 'location == sento', weight: 18, lines: [
    { sp: 'JIN', text: 'うおー! 一番風呂いただきだぜ! 富士山最高!' },
    { sp: 'HYU', text: 'ジンパチくん、湯船に飛び込まないでください。私の優雅な入浴が台無しです。' },
    { sp: 'LENNY', text: 'ふたりとも元気だねえ……僕はもう、のぼせて溶けそうだよぉ。' },
    { sp: 'JIN', text: 'レニィ、湯船で寝るなよ! おい、沈むぞ!' },
  ], effects: ['mutual(JIN,HYU,1)', 'mutual(JIN,LENNY,1)', 'mutual(HYU,LENNY,1)', 'log(AMBIENT)'] }),
  N('DLG_AMB_SENTO_TRIO_002', { cast: ['JIN', 'NEO', 'MUNI'], cond: 'location == sento', weight: 18, lines: [
    { sp: 'MUNI', text: 'せなかながしっこしよ! ジンパチおにいちゃん、つぎネオおにいちゃん!' },
    { sp: 'JIN', text: 'おう! ネオ、背中でかいな、洗いごたえあるぜ!' },
    { sp: 'NEO', text: 'ぬ……こ、これも一興である。だが力を込めすぎるな、庶民め!' },
    { sp: 'MUNI', text: 'ネオおにいちゃん、きんにくすごい! むにゅ〜!' },
  ], effects: ['mutual(JIN,NEO,1)', 'mutual(JIN,MUNI,1)', 'mutual(NEO,MUNI,1)', 'log(AMBIENT)'] }),
  N('DLG_AMB_SENTO_TRIO_003', { cast: ['HYU', 'NEO', 'JIN'], cond: 'location == sento', weight: 16, lines: [
    { sp: 'NEO', text: '湯に浸かり天井を仰ぐ……この時間、故郷の城にはなかった贅沢である。' },
    { sp: 'HYU', text: 'ネオさん、いいことを言いますね。美とは、こういう何気ない時間に宿るのです。' },
    { sp: 'JIN', text: 'お前ら難しいこと言ってるけど、要するに風呂は最高ってことだろ! フォー!' },
    { sp: 'NEO', text: '……身も蓋もないが、その通りである。' },
  ], effects: ['mutual(HYU,NEO,1)', 'mutual(JIN,NEO,1)', 'mutual(HYU,JIN,1)', 'log(AMBIENT)'] }),
  N('DLG_AMB_SENTO_PAIR_001', { cast: ['JIN', 'NEO'], cond: 'location == sento', lines: [
    { sp: 'JIN', text: 'ネオ、コーヒー牛乳飲むか? 風呂上がりはこれだぜ!' },
    { sp: 'NEO', text: 'ぬ……この小瓶の飲み物か。……ふむ、悪くない。腰に手を当てるのが作法か?' },
    { sp: 'JIN', text: 'わかってるじゃねえか! 一気にいけ!' },
  ], effects: ['mutual(JIN,NEO,1)', 'log(AMBIENT)'] }),

  // ============ 小暮カネ × 主要6人 ============
  N('DLG_AMB_KAN_MUN_001', { cast: ['KANE', 'MUNI'], lines: [
    { sp: 'KANE', text: 'ムニ、ほら飴だよ。ひとつだけだからね。' },
    { sp: 'MUNI', text: 'わーい! カネばあちゃん、だーいすき! むにゅ〜!' },
    { sp: 'KANE', text: 'まったく、現金な子だねぇ。……ふふ。' },
  ], effects: ['mutual(KANE,MUNI,2)', 'log(AMBIENT)'] }),
  N('DLG_AMB_KAN_LEN_001', { cast: ['KANE', 'LENNY'], lines: [
    { sp: 'KANE', text: 'レニィ、また路地で寝てたのかい。風邪ひくよ。' },
    { sp: 'LENNY', text: 'カネさんの声、あったかくて、もっと眠くなるんだよぉ。' },
    { sp: 'KANE', text: 'ほら、毛布かけてやるから、せめて端っこで寝な。' },
  ], effects: ['mutual(KANE,LENNY,2)', 'log(AMBIENT)'] }),
  N('DLG_AMB_KAN_JIN_001', { cast: ['KANE', 'JIN'], cond: 'location == market', lines: [
    { sp: 'KANE', text: 'ジンパチ、また甘いもん買い込んでるね。見たよ。' },
    { sp: 'JIN', text: 'ちっ……! カネ婆、口が軽いんだよ! 誰にも言うなよ!' },
    { sp: 'KANE', text: 'はいはい。ふふ、可愛いもんだねぇ。' },
  ], effects: ['mutual(KANE,JIN,1)', 'rumor(RUM_JIN_SWEETS)', 'log(AMBIENT)'] }),
  N('DLG_AMB_KAN_HYU_001', { cast: ['KANE', 'HYU'], lines: [
    { sp: 'HYU', text: 'カネさん、今日も路地に貫禄が満ちていますね。' },
    { sp: 'KANE', text: '口だけは達者だねぇ、色男。その減らず口、嫌いじゃないよ。' },
    { sp: 'HYU', text: 'ふふ。あなたには敵いません。' },
  ], effects: ['mutual(KANE,HYU,1)', 'log(AMBIENT)'] }),
  N('DLG_AMB_KAN_GER_001', { cast: ['KANE', 'GERU'], lines: [
    { sp: 'KANE', text: 'ゲルの嬢ちゃん。あんた、夜中にムニを送ってやってるだろ。見てるよ。' },
    { sp: 'GERU', text: '……通り道だっただけだ。' },
    { sp: 'KANE', text: 'そういうことにしといてやるさ。いい娘だよ、あんたは。' },
  ], effects: ['mutual(KANE,GERU,2)', 'info(INFO_GERU_CARING)', 'log(AMBIENT)'] }),
  N('DLG_AMB_NEO_KAN_001', { cast: ['KANE', 'NEO'], lines: [
    { sp: 'KANE', text: 'おや金ぴか。今日も無駄にキラキラしてるねぇ。目が痛いよ。' },
    { sp: 'NEO', text: 'ふん、婆。貴様こそ今日も舌が絶好調である。その毒で塔の錆でも落としたまえ。' },
    { sp: 'KANE', text: '言うようになったじゃないか、ひよっこ騎士。' },
    { sp: 'NEO', text: '(……なぜだ。この応酬、悪くないのである)' },
  ], effects: ['mutual(KANE,NEO,1)', 'log(AMBIENT)'] }),
  N('DLG_AMB_NEO_KAN_002', { cast: ['KANE', 'NEO'], cond: 'mutual(KANE,NEO) >= 40', lines: [
    { sp: 'KANE', text: 'ほら金ぴか、飴だよ。口喧嘩の駄賃さ。' },
    { sp: 'NEO', text: '……ふん。もらってやるのである。……昨日のより、いちご味が良い。' },
    { sp: 'KANE', text: '注文が多いね! ……ふふ、明日持ってきてやるよ。' },
  ], effects: ['mutual(KANE,NEO,2)', 'log(AMBIENT)'] }),

  // ============ 床屋 / 郵便屋 / 看板娘 × 主要人物 ============
  N('DLG_AMB_NEO_BRB_001', { cast: ['BARBER', 'NEO'], cond: 'location == barber', lines: [
    { sp: 'BARBER', text: '今日も手入れだけかい、ネオの坊や。' },
    { sp: 'NEO', text: '当然である。だが……オヤジ殿の櫛づかいは、認めてやってもよい。' },
    { sp: 'BARBER', text: 'そりゃ光栄じゃのう。ふぉっふぉ。' },
  ], effects: ['mutual(BARBER,NEO,1)', 'info(INFO_BARBER_NEO)', 'log(AMBIENT)'] }),
  N('DLG_AMB_JIN_BRB_001', { cast: ['BARBER', 'JIN'], cond: 'location == barber', lines: [
    { sp: 'JIN', text: 'オヤジ! いつもの短めで頼むぜ!' },
    { sp: 'BARBER', text: 'あんたの頭は刈りやすくて助かるよ。まっすぐ生えとるでのう。' },
    { sp: 'JIN', text: '性格もまっすぐだからな! ガハハ!' },
  ], effects: ['mutual(BARBER,JIN,1)', 'log(AMBIENT)'] }),
  N('DLG_AMB_LEN_PST_001', { cast: ['POSTMAN', 'LENNY'], lines: [
    { sp: 'POSTMAN', text: 'レニィさん、お手紙っす! ……あれ、寝てる。' },
    { sp: 'LENNY', text: 'ん……手紙? ありがと……zzz' },
    { sp: 'POSTMAN', text: 'せめて受け取ってから寝てほしいっす……ま、枕元に置いとくっす。' },
  ], effects: ['mutual(POSTMAN,LENNY,1)', 'log(AMBIENT)'] }),
  N('DLG_AMB_MUN_PST_001', { cast: ['POSTMAN', 'MUNI'], lines: [
    { sp: 'MUNI', text: 'ゆうびんやさん、はやい! ムニもいっしょにはしる!' },
    { sp: 'POSTMAN', text: 'おっ、ムニくん、いい走りっす! でも階段は気をつけるっすよ!' },
  ], effects: ['mutual(POSTMAN,MUNI,1)', 'log(AMBIENT)'] }),
  N('DLG_AMB_HYU_CFG_001', { cast: ['HYU', 'CAFEGIRL'], cond: 'location == cafe', lines: [
    { sp: 'HYU', text: 'サチさん、今日のコーヒーもあなたのように香り高いですね。' },
    { sp: 'CAFEGIRL', text: 'はいはい、100点満点の口説きです♪ おかわりはいかがです?' },
    { sp: 'HYU', text: '……この余裕。だから通ってしまうのですよ。' },
  ], effects: ['mutual(HYU,CAFEGIRL,1)', 'log(AMBIENT)'] }),
  N('DLG_AMB_GER_CFG_001', { cast: ['GERU', 'CAFEGIRL'], cond: 'location == cafe', lines: [
    { sp: 'CAFEGIRL', text: 'ゲルさん、今日のおすすめの新刊、店長が入れてましたよ。' },
    { sp: 'GERU', text: 'ほう。……気が利くな。じゃあ、いつものブレンドを長めで頼む。' },
    { sp: 'CAFEGIRL', text: 'かしこまりました♪ ごゆっくりどうぞ。' },
  ], effects: ['mutual(GERU,CAFEGIRL,1)', 'log(AMBIENT)'] }),
];
