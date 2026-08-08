// ============================================================
// v5 追加会話
//   ・小暮カネ × 駄菓子屋のおばあさん の会話
//   ・親密度が高い主要人物が「互いの部屋に遊びに来た」ときの会話(自宅)
//   ・各施設での主要人物ペア会話をさらに増量
//   ・通常の主要人物の会話(GENERIC/COND)をさらに増量
// ============================================================
const T = (id, owner, node) => ({ id, owner, type: node.type ?? 'TALK', pool: node.pool ?? 'GENERIC', ...node });
const A = (id, cast, node) => ({ id, type: 'AMBIENT', pool: 'AMBIENT', owner: [...cast].sort().join('-'), cast, ...node });

export const DLG_V5 = [
  // ========================================================
  // 小暮カネ × 駄菓子屋のおばあさん(旧知の仲)
  // ========================================================
  A('DLG_AMB_KAN_DGS_1', ['KANE', 'DAGASHIYA'], { cond: 'location == dagashi', weight: 18, lines: [
    { sp: 'KANE', text: 'よう、達者にしてるかい。あんたの店、今日も子供らで賑わってるねぇ。' },
    { sp: 'DAGASHIYA', text: 'おかげさまでねぇ。カネさんこそ、路地の見張り番、ご苦労さま。お茶でもどうだい。' },
    { sp: 'KANE', text: 'いただくよ。……あんたと駄弁るのが、あたしの一日の楽しみさ。' },
  ], effects: ['mutual(DAGASHIYA,KANE,2)', 'log(AMBIENT)'] }),
  A('DLG_AMB_KAN_DGS_2', ['KANE', 'DAGASHIYA'], { weight: 14, lines: [
    { sp: 'DAGASHIYA', text: 'カネさん、ムニがまた飴をねだってきたよ。あんたに似て、口が達者になってきてねぇ。' },
    { sp: 'KANE', text: 'あたしに似てだと? ……ふん、まあ、悪かない育ち方だ。あの子は、この街の宝さ。' },
    { sp: 'DAGASHIYA', text: 'ほんとにねぇ。……あたしたちも、長いこと生きたもんだ。' },
  ], effects: ['mutual(DAGASHIYA,KANE,1)', 'info(INFO_MUNI_LODGER)', 'log(AMBIENT)'] }),
  A('DLG_AMB_KAN_DGS_3', ['KANE', 'DAGASHIYA'], { cond: 'season == AUTUMN', weight: 14, lines: [
    { sp: 'DAGASHIYA', text: 'カネさん、焼き芋の季節だねぇ。今年も一緒に、子供らに配ろうかね。' },
    { sp: 'KANE', text: 'いいねぇ。あんたの芋は甘くてほくほくだ。……昔から、変わらないねぇ。' },
    { sp: 'DAGASHIYA', text: 'ふふ、変わらないのが、あたしらの取り柄さ。' },
  ], effects: ['mutual(DAGASHIYA,KANE,1)', 'log(AMBIENT)'] }),
  T('DLG_KAN_DGS_TALK', 'KANE', { weight: 8, lines: [{ sp: 'KANE', text: '駄菓子屋の婆さんとは、かれこれ何十年の付き合いさ。……あの店の飴の減り具合で、ムニの機嫌がわかるんだよ。ふふ。' }], effects: ['aff(KANE,1)'] }),
  T('DLG_DGS_KAN_TALK', 'DAGASHIYA', { weight: 8, lines: [{ sp: 'DAGASHIYA', text: 'カネさんかい? ふふ、口は悪いけど、根はやさしい人だよ。あの人がいるから、この路地は安心なのさ。' }], effects: ['aff(DAGASHIYA,1)'] }),

  // ========================================================
  // 部屋に遊びに来たときの会話(自宅 HOME_x)
  // 相互親密度が高い主要人物が訪問すると発生
  // ========================================================
  // --- レニィの部屋 ---
  A('DLG_VISIT_LEN_MUN', ['LENNY', 'MUNI'], { cond: 'location == HOME_LENNY', weight: 16, lines: [
    { sp: 'MUNI', text: 'レニィおにいちゃんのおへや、きたの! くものベッド、ふわふわ!' },
    { sp: 'LENNY', text: 'いらっしゃい、ムニ。……いっしょにお昼寝しよっか。ここのベッドは世界一だよぉ。' },
    { sp: 'MUNI', text: 'やったー! ムニ、まんなかがいいの!' },
  ], effects: ['mutual(LENNY,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_VISIT_LEN_HYU', ['LENNY', 'HYU'], { cond: 'location == HOME_LENNY', weight: 14, lines: [
    { sp: 'HYU', text: 'お邪魔しますよ、レニィ。……相変わらず、青いものばかりの部屋ですね。落ち着くのは認めますが。' },
    { sp: 'LENNY', text: 'ヒュウ、いらっしゃい。お茶いれるね。……あ、その前に、ちょっとだけ寝ていい?' },
    { sp: 'HYU', text: '客を前に寝る人は、あなたくらいですよ。……まあ、それも味ですね。' },
  ], effects: ['mutual(HYU,LENNY,1)', 'log(AMBIENT)'] }),
  A('DLG_VISIT_LEN_GER', ['LENNY', 'GERU'], { cond: 'location == HOME_LENNY', weight: 14, lines: [
    { sp: 'GERU', text: '邪魔するぞ。……お前の部屋は、昼寝には理想的だな。私も一冊持ってくればよかった。' },
    { sp: 'LENNY', text: 'ゲル、いらっしゃい。本、貸そうか? ……あ、僕、最後まで読めた試しがないんだけどね。' },
    { sp: 'GERU', text: 'ふ、それでいい。読みかけの本が一番、想像がふくらむんだ。' },
  ], effects: ['mutual(LENNY,GERU,1)', 'log(AMBIENT)'] }),
  // --- ヒュウの部屋 ---
  A('DLG_VISIT_HYU_JIN', ['HYU', 'JIN'], { cond: 'location == HOME_HYU', weight: 14, lines: [
    { sp: 'JIN', text: 'お邪魔するぜ! うおっ、鏡だらけだな! どこ見ても俺が映ってるぜ!' },
    { sp: 'HYU', text: 'ジンパチくん、その鏡たちはあなたではなく私を映すためのものです。……ですが、まあ、座ってください。' },
    { sp: 'JIN', text: 'へへ、悪いな! ……お前んち、いい匂いすんな。' },
  ], effects: ['mutual(HYU,JIN,1)', 'log(AMBIENT)'] }),
  A('DLG_VISIT_HYU_GER', ['HYU', 'GERU'], { cond: 'location == HOME_HYU', weight: 12, lines: [
    { sp: 'GERU', text: '相変わらず、隙のない部屋だな。……本を置く場所が、一冊ぶんもない。' },
    { sp: 'HYU', text: 'ふふ、では、あなたのために特等席を一つ空けておきましょう。いつでも来ていいように。' },
    { sp: 'GERU', text: '……気が利くじゃないか。じゃあ、遠慮なく通わせてもらう。' },
  ], effects: ['mutual(HYU,GERU,1)', 'log(AMBIENT)'] }),
  // --- ジンパチの部屋 ---
  A('DLG_VISIT_JIN_LEN', ['JIN', 'LENNY'], { cond: 'location == HOME_JIN', weight: 14, lines: [
    { sp: 'LENNY', text: 'ジンパチのお部屋、器具がいっぱいだねえ。……この畳、寝心地よさそうだよぉ。' },
    { sp: 'JIN', text: '寝るな寝るな! せっかく来たんだ、軽く体でも動かそうぜ! ……いや、お前は見てるだけでいいか。' },
    { sp: 'LENNY', text: 'うん、応援は得意だよ。がんばれー……zzz' },
  ], effects: ['mutual(JIN,LENNY,1)', 'log(AMBIENT)'] }),
  A('DLG_VISIT_JIN_NEO', ['JIN', 'NEO'], { cond: 'location == HOME_JIN', weight: 12, lines: [
    { sp: 'NEO', text: '邪魔するぞジンパチ。……ほう、このプラモ、見事な出来である。貴様、手先も器用なのだな。' },
    { sp: 'JIN', text: 'だろ!? ネオ、お前もやってみろよ! 集中力は剣術と一緒だぜ!' },
    { sp: 'NEO', text: 'ふむ、一理ある。……今度、一体組ませてもらおう。魔法剣士の手並み、見せてくれる。' },
  ], effects: ['mutual(JIN,NEO,1)', 'info(INFO_JIN_PLAMO)', 'log(AMBIENT)'] }),
  // --- ムニの部屋 ---
  A('DLG_VISIT_MUN_GER', ['MUNI', 'GERU'], { cond: 'location == HOME_MUNI', weight: 14, lines: [
    { sp: 'MUNI', text: 'ゲルおねえちゃん、きてくれたの! えほん、よんで?' },
    { sp: 'GERU', text: 'ああ。……どれ、この海の絵本か。いい趣味だな。ほら、こっちに来い。' },
    { sp: 'MUNI', text: 'えへへ、ゲルおねえちゃんのこえ、ねむくなるの……' },
  ], effects: ['mutual(GERU,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_VISIT_MUN_LEN', ['MUNI', 'LENNY'], { cond: 'location == HOME_MUNI', weight: 14, lines: [
    { sp: 'LENNY', text: 'ムニのお部屋、おもちゃがいっぱいだねえ。くまさん、こんにちは。' },
    { sp: 'MUNI', text: 'くまきちだよ! レニィおにいちゃん、いっしょにあそぼ!' },
    { sp: 'LENNY', text: 'いいよ。……あ、でもその前に、このビーズクッション、借りて……zzz' },
  ], effects: ['mutual(LENNY,MUNI,1)', 'log(AMBIENT)'] }),
  // --- ゲルの部屋 ---
  A('DLG_VISIT_GER_NEO', ['GERU', 'NEO'], { cond: 'location == HOME_GERU', weight: 14, lines: [
    { sp: 'NEO', text: '邪魔する。……ほう、見事な蔵書である。この歴史書、借りてもよいか。' },
    { sp: 'GERU', text: 'ああ。……ただし、丁寧に扱えよ。それは私の宝の一つだ。……お前になら、貸せる。' },
    { sp: 'NEO', text: '心得た。騎士は、借りたものを傷つけぬ。……良い夜になりそうである。' },
  ], effects: ['mutual(GERU,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_VISIT_GER_HYU', ['GERU', 'HYU'], { cond: 'location == HOME_GERU', weight: 12, lines: [
    { sp: 'HYU', text: 'お邪魔しますよ。……本に埋もれたこの部屋、あなたらしくて、悪くない眺めですね。' },
    { sp: 'GERU', text: '散らかってて悪いな。……そこの椅子の本、どければ座れる。茶を淹れよう。' },
    { sp: 'HYU', text: 'ふふ、あなたの淹れる茶は、なぜか落ち着くのですよね。' },
  ], effects: ['mutual(HYU,GERU,1)', 'log(AMBIENT)'] }),
  // --- ネオの部屋 ---
  A('DLG_VISIT_NEO_JIN', ['NEO', 'JIN'], { cond: 'location == HOME_NEO', weight: 14, lines: [
    { sp: 'JIN', text: 'お邪魔するぜ! ……うおっ、金ぴかだな! 玉座まであんのか! さすが騎士様だぜ!' },
    { sp: 'NEO', text: 'ふはは、そうであろう! 座ってみるか? ……特別に許可しよう。' },
    { sp: 'JIN', text: 'マジか! ……お、意外と座り心地いいな、この玉座!' },
  ], effects: ['mutual(JIN,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_VISIT_NEO_GER', ['NEO', 'GERU'], { cond: 'location == HOME_NEO', weight: 12, lines: [
    { sp: 'GERU', text: '相変わらず、豪奢な部屋だな。……この肖像画、本人より凛々しく描けているぞ。' },
    { sp: 'NEO', text: 'ぬ、それは……画家の腕である! ……いや、待て、それは私を貶しているのか、褒めているのか。' },
    { sp: 'GERU', text: 'さあ、どっちだろうな。ふ。' },
  ], effects: ['mutual(GERU,NEO,1)', 'log(AMBIENT)'] }),

  // ========================================================
  // 各施設での主要人物ペア会話(さらに増量)
  // ========================================================
  // 喫茶店
  A('DLG_AMB_JIN_MUN_CAFE', ['JIN', 'MUNI'], { cond: 'location == cafe', lines: [
    { sp: 'MUNI', text: 'ジンパチおにいちゃん、クリームソーダのアイス、たべていい?' },
    { sp: 'JIN', text: 'おう、食え食え! ……あ、俺のプリンも半分やるよ。ここだけの話な!' },
    { sp: 'MUNI', text: 'ジンパチおにいちゃん、あまいのすきなの? むにゅ〜、ないしょね!' },
  ], effects: ['mutual(JIN,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_AMB_NEO_HYU_CAFE', ['NEO', 'HYU'], { cond: 'location == cafe', lines: [
    { sp: 'NEO', text: 'ヒュウよ、貴様のその優雅な午後の過ごし方、騎士の休息に通じるものがある。認めよう。' },
    { sp: 'HYU', text: 'おや、光栄です。では今度、あなたの言う「優雅な戦い方」とやらを、ぜひ拝見したいですね。' },
  ], effects: ['mutual(HYU,NEO,1)', 'log(AMBIENT)'] }),
  // 市場
  A('DLG_AMB_HYU_GER_MARKET', ['HYU', 'GERU'], { cond: 'location == market', lines: [
    { sp: 'HYU', text: 'ゲル、その日持ちのする乾物ばかり。……たまには生鮮を、彩りとして。' },
    { sp: 'GERU', text: '彩りで腹は膨れん。……だが、まあ、お前が選ぶなら一つ買ってみるか。' },
  ], effects: ['mutual(HYU,GERU,1)', 'log(AMBIENT)'] }),
  A('DLG_AMB_NEO_JIN_MARKET', ['NEO', 'JIN'], { cond: 'location == market', lines: [
    { sp: 'JIN', text: 'ネオ! 今日のタイムセール、肉が安いぜ! 買い占めるぞ!' },
    { sp: 'NEO', text: 'ふはは、良い戦果である! 我らで市場を制圧するのだ! ……ぬ、婆どもの視線が痛いが。' },
  ], effects: ['mutual(JIN,NEO,1)', 'log(AMBIENT)'] }),
  // ゲーセン
  A('DLG_AMB_LEN_MUN_GAME', ['LENNY', 'MUNI'], { cond: 'location == game', lines: [
    { sp: 'MUNI', text: 'レニィおにいちゃん、クレーンゲーム、とって!' },
    { sp: 'LENNY', text: 'んー……やってみるよ。えいっ。……あ、とれた。ラッキーだねえ。' },
    { sp: 'MUNI', text: 'すごい! レニィおにいちゃん、てんさい! むにゅ〜!' },
  ], effects: ['mutual(LENNY,MUNI,1)', 'log(AMBIENT)'] }),
  // 本屋
  A('DLG_AMB_LEN_GER_BOOK', ['LENNY', 'GERU'], { cond: 'location == book', lines: [
    { sp: 'GERU', text: 'レニィ、その絵本、いい選択だ。……海の話は、お前に合うだろう。' },
    { sp: 'LENNY', text: 'えへへ、ゲルとおそろいで海の本だね。……いっしょに読もっか。' },
  ], effects: ['mutual(LENNY,GERU,1)', 'log(AMBIENT)'] }),
  // ラーメン
  A('DLG_AMB_HYU_JIN_RAMEN', ['HYU', 'JIN'], { cond: 'location == ramen', lines: [
    { sp: 'JIN', text: 'ヒュウ! ラーメンは豪快にすすってこそだぜ! ずぞぞぞーっ!' },
    { sp: 'HYU', text: '……ジンパチくん。私は美しくいただきます。ほら、こうやって、麺を三本ずつ。' },
    { sp: 'JIN', text: 'まどろっこしい食い方だな! でも……なんか品があるのは認めるぜ!' },
  ], effects: ['mutual(HYU,JIN,1)', 'log(AMBIENT)'] }),
  // 銭湯(男湯)追加
  A('DLG_AMB_LEN_NEO_SENTO', ['LENNY', 'NEO'], { cond: 'location == sento', lines: [
    { sp: 'NEO', text: 'レニィよ、湯の中で眠るでない。溺れるぞ。……ほら、肩を貸してやる。' },
    { sp: 'LENNY', text: 'ネオ、やさしいねえ……あったかくて、もう、ほんとに、ねむい……' },
    { sp: 'NEO', text: 'ぬ、本当に寝おった! ……仕方のない奴である。番台! 手を貸せ!' },
  ], effects: ['mutual(LENNY,NEO,1)', 'log(AMBIENT)'] }),
  // 水族館
  A('DLG_AMB_HYU_LEN_AQUA', ['HYU', 'LENNY'], { cond: 'location == aquarium', lines: [
    { sp: 'HYU', text: 'この水槽のガラス、私を映すのに絶好の角度ですね。……ん? レニィ、聞いていますか?' },
    { sp: 'LENNY', text: '……クラゲ、きれいだね。ヒュウの髪の色みたいだよ。' },
    { sp: 'HYU', text: '……ふふ。クラゲに例えられるとは。まあ、あの優雅さなら、悪くありません。' },
  ], effects: ['mutual(HYU,LENNY,1)', 'log(AMBIENT)'] }),
  // ケーキ屋
  A('DLG_AMB_LEN_GER_CAKE', ['LENNY', 'GERU'], { cond: 'location == cake', lines: [
    { sp: 'LENNY', text: 'ゲル、モンブラン食べるんだね。似合うよ。……大人の味って感じ。' },
    { sp: 'GERU', text: '……こら、内緒だと言っただろう。まあ、お前になら、ばれてもいいか。半分やる。' },
  ], effects: ['mutual(LENNY,GERU,1)', 'log(AMBIENT)'] }),
  // 焼肉屋
  A('DLG_AMB_GER_NEO_YAKI', ['GERU', 'NEO'], { cond: 'location == yakiniku', lines: [
    { sp: 'GERU', text: 'ネオ、そのホルモン、焼きすぎだ。……よこせ、私が焼く。焼肉は理論だ。' },
    { sp: 'NEO', text: 'ぬ、火加減も戦略か。……さすがである。では焼きは任せた。私は肉を運ぶ係を担おう。' },
  ], effects: ['mutual(GERU,NEO,1)', 'log(AMBIENT)'] }),
  // 居酒屋
  A('DLG_AMB_JIN_HYU_IZA', ['JIN', 'HYU'], { cond: 'location == izakaya and time in [NIGHT, MIDNIGHT]', lines: [
    { sp: 'JIN', text: 'ヒュウ! 今日も一日おつかれ! 乾杯だ! ……お前、酒強えのな。意外だぜ。' },
    { sp: 'HYU', text: 'ふふ、酔って崩れる姿は美しくありませんからね。……ですが、あなたとの酒は、悪くない。' },
  ], effects: ['mutual(HYU,JIN,1)', 'log(AMBIENT)'] }),
  // 花屋
  A('DLG_AMB_LEN_MUN_FLOWER', ['LENNY', 'MUNI'], { cond: 'location == flower', lines: [
    { sp: 'MUNI', text: 'レニィおにいちゃん、あおいおはな、レニィおにいちゃんのめみたいなの!' },
    { sp: 'LENNY', text: 'えへへ、そう? じゃあ、ムニに一輪あげる。……髪にさすと、かわいいよ。' },
    { sp: 'MUNI', text: 'わーい! ムニ、おはなのおうじさま!' },
  ], effects: ['mutual(LENNY,MUNI,1)', 'log(AMBIENT)'] }),
  // 屋上
  A('DLG_AMB_HYU_GER_ROOF', ['HYU', 'GERU'], { cond: 'location == ROOF', lines: [
    { sp: 'HYU', text: '夜風で髪が乱れます。……ですが、この夜景と、隣にあなた。悪くない一枚ですね。' },
    { sp: 'GERU', text: '……お前でも、夜景を綺麗と思うんだな。少し、意外だ。……いや、悪くない意外だ。' },
  ], effects: ['mutual(HYU,GERU,1)', 'log(AMBIENT)'] }),
  // 路地
  A('DLG_AMB_JIN_MUN_GROUND', ['JIN', 'MUNI'], { cond: 'location == GROUND', lines: [
    { sp: 'MUNI', text: 'ジンパチおにいちゃん、かけっこしよ!' },
    { sp: 'JIN', text: 'おう! でも手加減してやるからな! ……よーい、どん!' },
    { sp: 'MUNI', text: 'まって〜! ジンパチおにいちゃん、はやいの〜!' },
  ], effects: ['mutual(JIN,MUNI,1)', 'log(AMBIENT)'] }),

  // ========================================================
  // 通常の主要人物の会話をさらに増量
  // ========================================================
  // レニィ
  T('DLG_LEN_V5_1', 'LENNY', { lines: [{ sp: 'LENNY', text: 'ねえ大家さん、昨日の夢の続き、今日見れるかな。……途中で起きちゃったんだ。もったいないよぉ。' }], effects: ['aff(LENNY,1)'] }),
  T('DLG_LEN_V5_2', 'LENNY', { lines: [{ sp: 'LENNY', text: '最近ね、みんなが仲良さそうで、見てるだけで幸せなんだ。……この塔、あったかくなったね。' }], effects: ['aff(LENNY,1)'] }),
  T('DLG_LEN_V5_3', 'LENNY', { pool: 'COND', cond: 'time == EVENING', lines: [{ sp: 'LENNY', text: '夕方の鐘の音って、聞こえる? ……あれを聞くと、一日ぶん、上手にサボれた気がするんだ。' }], effects: ['aff(LENNY,1)'] }),
  // ヒュウ
  T('DLG_HYU_V5_1', 'HYU', { lines: [{ sp: 'HYU', text: '今日の私の完成度は、控えめに言って120点です。……あなたの採点も、聞かせてくださいね?' }], effects: ['aff(HYU,1)'] }),
  T('DLG_HYU_V5_2', 'HYU', { lines: [{ sp: 'HYU', text: 'この街に来たばかりの頃は、雑多で下品だと思っていました。……今は、この密度こそが美だと分かります。人が変わりましたね、私も。' }], effects: ['aff(HYU,1)'] }),
  T('DLG_HYU_V5_3', 'HYU', { pool: 'COND', cond: 'season == SPRING', lines: [{ sp: 'HYU', text: '春風はいいですね。私の髪を、最高のスタイリストのように整えてくれます。無料で、ですよ。' }], effects: ['aff(HYU,1)'] }),
  // ジンパチ
  T('DLG_JIN_V5_1', 'JIN', { lines: [{ sp: 'JIN', text: '今日の目標は決めたか大家! 俺は「笑顔で挨拶100回」だ! 筋肉だけじゃねえんだぜ、俺は!' }], effects: ['aff(JIN,1)'] }),
  T('DLG_JIN_V5_2', 'JIN', { lines: [{ sp: 'JIN', text: 'ムニのやつ、この前かけっこで転んでな。泣くかと思ったら、立ち上がって走り続けたんだ。……あいつ、いい漢になるぜ!' }], effects: ['aff(JIN,1)'] }),
  T('DLG_JIN_V5_3', 'JIN', { pool: 'COND', cond: 'weather == SUNNY', lines: [{ sp: 'JIN', text: 'この青空、見てるだけで拳が鳴るぜ! よし、屋上ダッシュ追加だ! 大家も来るか!?' }], effects: ['aff(JIN,1)'] }),
  // ムニ
  T('DLG_MUN_V5_1', 'MUNI', { lines: [{ sp: 'MUNI', text: 'きょうね、あたらしいことばおぼえたの! 「おつかれさま」! ……つかってみたの、みんなよろこんだ!' }], effects: ['aff(MUNI,1)'] }),
  T('DLG_MUN_V5_2', 'MUNI', { lines: [{ sp: 'MUNI', text: 'おおやさん、ムニのたからものみせてあげる。……これ、みんなからもらったものなの。ぜんぶ、たからものなの。' }], effects: ['aff(MUNI,1)'] }),
  T('DLG_MUN_V5_3', 'MUNI', { pool: 'COND', cond: 'weather == RAIN', lines: [{ sp: 'MUNI', text: 'あめのおと、たいこみたいなの。ムニ、まどからずっときいてるの。むにゅ〜。' }], effects: ['aff(MUNI,1)'] }),
  // ゲル
  T('DLG_GER_V5_1', 'GERU', { lines: [{ sp: 'GERU', text: 'この街の音は、不思議と本の邪魔をしない。……いや、むしろページの隙間を埋めてくれる。いい街だ。' }], effects: ['aff(GERU,1)'] }),
  T('DLG_GER_V5_2', 'GERU', { lines: [{ sp: 'GERU', text: 'あんたが来てから、住人たちの距離が近くなった。……人と人をつなぐのは、案外、大家の仕事なのかもな。' }], effects: ['aff(GERU,1)'] }),
  T('DLG_GER_V5_3', 'GERU', { pool: 'COND', cond: 'time == MIDNIGHT', lines: [{ sp: 'GERU', text: '深夜のこの静けさは、私だけの図書館だ。……あんたも一冊どうだ。おすすめを選んでやる。' }], effects: ['aff(GERU,1)'] }),
  // ネオ
  T('DLG_NEO_V5_1', 'NEO', { lines: [{ sp: 'NEO', text: '魔法剣士の朝は、剣の手入れから始まる。……この街では抜くことはないがな。だが、心の刃は研ぎ続ける。' }], effects: ['aff(NEO,1)'] }),
  T('DLG_NEO_V5_2', 'NEO', { lines: [{ sp: 'NEO', text: 'この塔の者たちは、身分も出自もばらばらだ。だが、円卓のように対等に笑い合う。……我が理想の国が、ここにある。' }], effects: ['aff(NEO,1)'] }),
  T('DLG_NEO_V5_3', 'NEO', { pool: 'COND', cond: 'time == NIGHT', lines: [{ sp: 'NEO', text: '夜のネオンは、魔法の灯火のようである。……我が故郷の魔導灯を思い出す。ふ、悪くない郷愁だ。' }], effects: ['aff(NEO,1)'] }),
];
