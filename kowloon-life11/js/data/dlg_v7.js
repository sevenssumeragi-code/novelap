// ============================================================
// v7 追加会話
//   ・マルタン神父(教会)— 主要6人の悩み/懺悔を聴く懺悔室会話
//   ・恋人会話(プレイヤー×主要5人 + ムニは家族)をさらに増量
//   ・NPCカップル(主要人物どうし)の会話をさらに増量
//   ・「親しい友人だが恋人ではない」二人組の会話を増量
//   ・通常の主要人物どうしの会話をさらに増量
//   ・各施設/店での会話バリエーションを増量
// ============================================================
const T = (id, owner, node) => ({ id, owner, type: node.type ?? 'TALK', pool: node.pool ?? 'GENERIC', ...node });
const A = (id, cast, node) => ({ id, type: 'AMBIENT', pool: 'AMBIENT', owner: [...cast].sort().join('-'), cast, ...node });

export const DLG_V7 = [
  // ========================================================
  // マルタン神父 初対面イベント
  // ========================================================
  T('DLG_MARTIN_FIRST', 'MARTIN', {
    type: 'EVENT', pool: 'EVENT', once: true, cond: 'location == church',
    lines: [
      { sp: 'MARTIN', text: 'おや、新しい顔ですな。ようこそ、九龍聖堂へ。わたしはマルタン。しがない老いぼれの神父ですぞ。' },
      { sp: 'MARTIN', text: 'この街には、笑っていても、胸の奥に小さな棘を抱えた者が多いですな。……あなたも、そうかもしれませんな。' },
      { sp: 'MARTIN', text: 'あの奥が懺悔室です。誰にも言えぬことがあれば、いつでもおいでなさい。わたしはただ、静かに耳を傾けるだけですぞ。' },
    ],
    effects: ['flag(FLG_MET_MARTIN)', 'aff(MARTIN,2)', 'log(EVENT)'],
  }),

  // マルタン神父 通常会話
  T('DLG_MARTIN_TALK_1', 'MARTIN', { pool: 'COND', cond: 'location == church', weight: 10, lines: [{ sp: 'MARTIN', text: '祭壇の蝋燭は、絶やさぬのが務めでしてな。小さな灯りでも、闇の中では道標になりますぞ。' }], effects: ['aff(MARTIN,1)'] }),
  T('DLG_MARTIN_TALK_2', 'MARTIN', { pool: 'COND', cond: 'location == church and time in [NIGHT, MIDNIGHT]', weight: 12, lines: [{ sp: 'MARTIN', text: '夜更けの聖堂は、しんと静かですな。……眠れぬ夜に訪ねてくる者もおります。わたしはいつでもここにおりますぞ。' }], effects: ['aff(MARTIN,1)'] }),
  T('DLG_MARTIN_TALK_3', 'MARTIN', { pool: 'COND', cond: 'location == church and weather == RAIN', weight: 10, lines: [{ sp: 'MARTIN', text: '雨の日は、傘代わりに立ち寄る者が増えますな。雨宿りついでの祈りも、立派な祈りですぞ。ふぉっふぉ。' }], effects: ['aff(MARTIN,1)'] }),
  T('DLG_MARTIN_TALK_4', 'MARTIN', { lines: [{ sp: 'MARTIN', text: 'わたしは裁く者ではありませんぞ。ただ聴くだけの、耳の大きな老いぼれですな。……荷物は、分ければ軽くなりますでな。' }], effects: ['aff(MARTIN,1)'] }),
  T('DLG_MARTIN_TALK_5', 'MARTIN', { lines: [{ sp: 'MARTIN', text: 'この白い法衣も、ずいぶん袖がくたびれましたな。……人と同じで、古びるほどに馴染むものですぞ。' }], effects: ['aff(MARTIN,1)'] }),

  // ========================================================
  // 懺悔室 — 主要6人の悩み/懺悔をマルタン神父が聴く
  // (cast [MARTIN, X] / location == church)
  // ========================================================
  // レニィ
  A('DLG_CONF_MARTIN_LENNY_1', ['MARTIN', 'LENNY'], { cond: 'location == church', weight: 20, lines: [
    { sp: 'LENNY', text: '神父さま……ぼく、いつも眠くて。みんなが頑張ってるのに、ぼくだけのんびりしてて。……これって、いけないことかな。' },
    { sp: 'MARTIN', text: 'ふむ。……あなたは、眠っている間も夢を見ておいででしょう。海の夢を、と聞きましたぞ。' },
    { sp: 'LENNY', text: 'うん……いつか本物の海を見たいんだ。' },
    { sp: 'MARTIN', text: 'ならば、それは怠けではありませんな。夢を抱いて眠る者は、いつか必ず、その岸辺に辿り着きますぞ。' },
  ], effects: ['mutual(MARTIN,LENNY,2)', 'info(INFO_LENNY_SEA_DREAM)', 'log(AMBIENT)'] }),
  A('DLG_CONF_MARTIN_LENNY_2', ['MARTIN', 'LENNY'], { cond: 'location == church', weight: 16, lines: [
    { sp: 'LENNY', text: '神父さま、懺悔します。……このまえ、おつかいのたまご、ひとつ割っちゃったんだ。ないしょにしちゃった。' },
    { sp: 'MARTIN', text: 'ふぉっふぉ。……それは大きな罪ですな。では、次は二つ、無事に持って帰る。それで帳消しですぞ。' },
    { sp: 'LENNY', text: 'えへへ……神父さま、やさしいね。' },
  ], effects: ['mutual(MARTIN,LENNY,1)', 'log(AMBIENT)'] }),
  // ヒュウ
  A('DLG_CONF_MARTIN_HYU_1', ['MARTIN', 'HYU'], { cond: 'location == church', weight: 20, lines: [
    { sp: 'HYU', text: '神父様。……こんなことを言うのは私くらいでしょうが。完璧な自分を保ち続けるのは、少しだけ、疲れるのですよ。' },
    { sp: 'MARTIN', text: 'ほう。……その前髪、毎朝二時間かけておいでとか。美とは、あなたにとって鎧なのですな。' },
    { sp: 'HYU', text: '……鎧、ですか。言い得て妙ですね。' },
    { sp: 'MARTIN', text: 'ここでは鎧を外してよろしいですぞ。神の前では、誰もが同じ裸の魂ですからな。……素のあなたも、悪くありませんぞ。' },
  ], effects: ['mutual(MARTIN,HYU,2)', 'info(INFO_HYU_MORNING)', 'log(AMBIENT)'] }),
  A('DLG_CONF_MARTIN_HYU_2', ['MARTIN', 'HYU'], { cond: 'location == church', weight: 16, lines: [
    { sp: 'HYU', text: '懺悔を、神父様。……雨の日、ムニに傘を差してやったこと、誰にも認めていないのです。柄ではない、と。' },
    { sp: 'MARTIN', text: 'ふむ。優しさを隠すのも、また一つの照れですな。……神は、隠れた善行こそ、よくご覧になっておられますぞ。' },
    { sp: 'HYU', text: '……ふふ。では、神様にだけは、知っておいてもらいましょうか。' },
  ], effects: ['mutual(MARTIN,HYU,1)', 'info(INFO_HYU_KIND)', 'log(AMBIENT)'] }),
  // ジンパチ
  A('DLG_CONF_MARTIN_JIN_1', ['MARTIN', 'JIN'], { cond: 'location == church', weight: 20, lines: [
    { sp: 'JIN', text: '神父さん、柄じゃねえけど聞いてくれ。……俺、いつも元気に見えるだろ? でも、たまに不安になるんだ。この鍛錬に、意味あんのかって。' },
    { sp: 'MARTIN', text: 'ほう。毎朝、塔の階段を十往復されるとか。……その汗は、誰かに見せるためのものですかな?' },
    { sp: 'JIN', text: 'いや……自分との約束、みたいなもんだ。' },
    { sp: 'MARTIN', text: 'ならば、意味を問う必要はありませんぞ。己との約束を守り続ける者を、人は「強い」と呼ぶのですからな。' },
    { sp: 'JIN', text: '……っ。神父さん、あんた、いいこと言うな! よし、明日は十五往復だ!' },
  ], effects: ['mutual(MARTIN,JIN,2)', 'info(INFO_JIN_STAIRS)', 'log(AMBIENT)'] }),
  A('DLG_CONF_MARTIN_JIN_2', ['MARTIN', 'JIN'], { cond: 'location == church', weight: 16, lines: [
    { sp: 'JIN', text: '神父さん、懺悔だ。……俺、実は甘党なんだ。駄菓子屋の常連なの、みんなには内緒にしてる。男らしくねえかな。' },
    { sp: 'MARTIN', text: 'ふぉっふぉ。甘いものを好む心に、男も女もありませんぞ。……わたしも、聖体拝領のあとの葡萄酒より、飴玉が好きでしてな。' },
    { sp: 'JIN', text: 'はは! 神父さんも隠れ甘党かよ! 今度、駄菓子屋でおごるぜ!' },
  ], effects: ['mutual(MARTIN,JIN,1)', 'info(INFO_JIN_SWEETS)', 'log(AMBIENT)'] }),
  // ムニ
  A('DLG_CONF_MARTIN_MUNI_1', ['MARTIN', 'MUNI'], { cond: 'location == church', weight: 20, lines: [
    { sp: 'MUNI', text: 'しんぷさま……ムニね、よるがこわいの。ひとりだと、へやがまっくらで、おばけがでそうなの。' },
    { sp: 'MARTIN', text: 'おお、おお。……夜が怖いのは、あなたが優しい心を持っている証ですぞ。強い子ほど、暗闇をよく見ておるのですな。' },
    { sp: 'MUNI', text: 'ムニ、つよい?' },
    { sp: 'MARTIN', text: 'とても強いですぞ。それに、この聖堂の灯りは一晩中消えませんでな。怖くなったら、この灯りを思い出しなされ。' },
    { sp: 'MUNI', text: 'うん! ……しんぷさま、ありがとなの!' },
  ], effects: ['mutual(MARTIN,MUNI,2)', 'info(INFO_MUNI_NIGHT)', 'log(AMBIENT)'] }),
  A('DLG_CONF_MARTIN_MUNI_2', ['MARTIN', 'MUNI'], { cond: 'location == church', weight: 16, lines: [
    { sp: 'MUNI', text: 'しんぷさま、ざんげします。……おかしのコーナー、みちゃだめっていわれたのに、みちゃったの。' },
    { sp: 'MARTIN', text: 'ふむ、ふむ。それは大変な罪ですな。……では、今日は一日、いい子でいられますかな?' },
    { sp: 'MUNI', text: 'できる! ムニ、いいこにするの!' },
    { sp: 'MARTIN', text: 'よろしい。それで、もう帳消しですぞ。ふぉっふぉ。' },
  ], effects: ['mutual(MARTIN,MUNI,1)', 'log(AMBIENT)'] }),
  // ゲル
  A('DLG_CONF_MARTIN_GERU_1', ['MARTIN', 'GERU'], { cond: 'location == church', weight: 20, lines: [
    { sp: 'GERU', text: '……神父殿。柄ではないが、少し話を聞いてもらえるか。私は、古い写真を一枚、本の栞にしている。……もう会えない人が写っているんだ。' },
    { sp: 'MARTIN', text: 'ふむ。……その方は、あなたの中で、今も生きておられますな。栞とは、よい選び方ですぞ。物語を進めるたび、共に頁をめくれる。' },
    { sp: 'GERU', text: '……そうか。そういう考え方も、あるのだな。' },
    { sp: 'MARTIN', text: '喪ったものを抱えて歩くのは、重うございます。だが、それはあなたが誰かを深く愛した証。……誇ってよいのですぞ。' },
  ], effects: ['mutual(MARTIN,GERU,2)', 'info(INFO_GERU_PHOTO)', 'log(AMBIENT)'] }),
  A('DLG_CONF_MARTIN_GERU_2', ['MARTIN', 'GERU'], { cond: 'location == church', weight: 16, lines: [
    { sp: 'GERU', text: '懺悔することがある。……私は夜遅く、ムニを部屋まで送っているんだが、それを誰にも言っていない。恩着せがましいのが、嫌でな。' },
    { sp: 'MARTIN', text: 'ふぉっふぉ。名を伏せた優しさこそ、最も美しい優しさですぞ。……あなたは、思っているより、ずっと温かい人ですな。' },
    { sp: 'GERU', text: '……買いかぶりだ。だが、悪い気はしないな。' },
  ], effects: ['mutual(MARTIN,GERU,1)', 'info(INFO_GERU_CARING)', 'log(AMBIENT)'] }),
  // ネオ
  A('DLG_CONF_MARTIN_NEO_1', ['MARTIN', 'NEO'], { cond: 'location == church', weight: 20, lines: [
    { sp: 'NEO', text: '神父殿。異国の聖堂とはいえ、祈りの場は懐かしい。……実を言えば、私は故郷の城を出て、遠い旅の果てにこの塔へ流れ着いた身である。' },
    { sp: 'MARTIN', text: 'ほう。……騎士殿は、帰る場所を失われたのですかな。' },
    { sp: 'NEO', text: '……失った、というより、捨てたのだ。守れなかったものから、逃げるようにな。……これが、私の懺悔である。' },
    { sp: 'MARTIN', text: 'ふむ。……逃げることは、時に最も勇気のいる決断ですぞ。生き延びて、こうして誰かの隣にいる。それだけで、あなたの旅は無駄ではありませんな。' },
    { sp: 'NEO', text: '……老いた神父殿。貴様の言葉、騎士の胸に沁みたぞ。感謝する。' },
  ], effects: ['mutual(MARTIN,NEO,2)', 'info(INFO_NEO_PAST_2)', 'log(AMBIENT)'] }),
  A('DLG_CONF_MARTIN_NEO_2', ['MARTIN', 'NEO'], { cond: 'location == church', weight: 16, lines: [
    { sp: 'NEO', text: 'この金髪は、騎士だった頃の誇りである。ゆえに切らぬ。……だが時折、この誇りが、ただの意地ではないかと思う夜がある。' },
    { sp: 'MARTIN', text: 'ふむ。誇りと意地は、紙一重ですな。……ですが、それを疑える者は、意地に呑まれることはありませんぞ。案じずとも、よろしい。' },
    { sp: 'NEO', text: 'ふ……そうか。ならば、この誇り、胸を張って背負うとしよう。' },
  ], effects: ['mutual(MARTIN,NEO,1)', 'info(INFO_NEO_PAST_1)', 'log(AMBIENT)'] }),

  // ========================================================
  // 恋人会話(プレイヤー×主要人物)をさらに増量
  // ========================================================
  // レニィ
  T('DLG_LOVER_LENNY_V7_1', 'LENNY', { pool: 'STATE', cond: 'rel(PC, LENNY) == LOVER', weight: 15, lines: [{ sp: 'LENNY', text: '恋人になってからね、朝起きるのがちょっとだけ楽しみになったんだ。……大家さんに会えるからね。えへへ。' }], effects: ['aff(LENNY,1)'] }),
  T('DLG_LOVER_LENNY_V7_2', 'LENNY', { pool: 'STATE', cond: 'rel(PC, LENNY) == LOVER', weight: 13, lines: [{ sp: 'LENNY', text: '屋上でさ、大家さんの膝で昼寝するの、世界一の贅沢だと思うんだ。……あ、いま予約していい? zzz' }], effects: ['aff(LENNY,1)'] }),
  T('DLG_LOVER_LENNY_V7_3', 'LENNY', { pool: 'STATE', cond: 'rel(PC, LENNY) == LOVER and weather == RAIN', weight: 14, lines: [{ sp: 'LENNY', text: '雨の夜はね、街が水槽の中みたいで好きなんだ。……今日は、その水槽をふたりで見られるんだね。しあわせだよぉ。' }], effects: ['aff(LENNY,1)'] }),
  // ヒュウ
  T('DLG_LOVER_HYU_V7_1', 'HYU', { pool: 'STATE', cond: 'rel(PC, HYU) == LOVER', weight: 15, lines: [{ sp: 'HYU', text: '鏡に映る私は完璧です。ですが、あなたの瞳に映る私は……それ以上ですね。恋人とは、最高の鏡なのですよ。' }], effects: ['aff(HYU,1)'] }),
  T('DLG_LOVER_HYU_V7_2', 'HYU', { pool: 'STATE', cond: 'rel(PC, HYU) == LOVER', weight: 13, lines: [{ sp: 'HYU', text: '今朝の前髪のセットは、いつもより気合が入りました。……理由? 恋人に会うのですから、当然でしょう。ふふ。' }], effects: ['aff(HYU,1)'] }),
  T('DLG_LOVER_HYU_V7_3', 'HYU', { pool: 'STATE', cond: 'rel(PC, HYU) == LOVER and season == WINTER', weight: 14, lines: [{ sp: 'HYU', text: '冬の吐息は白く美しい。……あなたと並ぶと、二つの白が重なる。これはもう、一枚の絵画ですね。額縁は私が用意しましょう。' }], effects: ['aff(HYU,1)'] }),
  // ジンパチ
  T('DLG_LOVER_JIN_V7_1', 'JIN', { pool: 'STATE', cond: 'rel(PC, JIN) == LOVER', weight: 15, lines: [{ sp: 'JIN', text: 'お前が見てると思うと、腕立ての回数が倍になるんだよな! ……愛の力ってやつか? くっ、口に出すと恥ずいな!' }], effects: ['aff(JIN,1)'] }),
  T('DLG_LOVER_JIN_V7_2', 'JIN', { pool: 'STATE', cond: 'rel(PC, JIN) == LOVER', weight: 13, lines: [{ sp: 'JIN', text: '今度の休み、朝日を見に屋上いこうぜ! 一番いい場所、俺が確保しとくからよ! ……デートってやつ、ちゃんとしたいんだ。' }], effects: ['aff(JIN,1)'] }),
  T('DLG_LOVER_JIN_V7_3', 'JIN', { pool: 'STATE', cond: 'rel(PC, JIN) == LOVER and season == SUMMER', weight: 14, lines: [{ sp: 'JIN', text: '夏だ! 花火大会いこうぜ! お前の浴衣姿……い、いや、なんでもねえ! とにかく、隣で見ような!' }], effects: ['aff(JIN,1)'] }),
  // ゲル
  T('DLG_LOVER_GERU_V7_1', 'GERU', { pool: 'STATE', cond: 'rel(PC, GERU) == LOVER', weight: 15, lines: [{ sp: 'GERU', text: '夜、本を読んでいると、あんたの寝息が聞こえる。……それだけで、活字がいつもより優しく見えるんだ。妙な話だがな。' }], effects: ['aff(GERU,1)'] }),
  T('DLG_LOVER_GERU_V7_2', 'GERU', { pool: 'STATE', cond: 'rel(PC, GERU) == LOVER', weight: 13, lines: [{ sp: 'GERU', text: '押し花の栞に、もう一枚増やそうと思ってな。……あんたと選んだ花だ。物語が終わっても、この頁だけは色褪せない。' }], effects: ['aff(GERU,1)'] }),
  T('DLG_LOVER_GERU_V7_3', 'GERU', { pool: 'STATE', cond: 'rel(PC, GERU) == LOVER and time in [NIGHT, MIDNIGHT]', weight: 14, lines: [{ sp: 'GERU', text: '夜更かしは相変わらずだが……一人の夜と、二人の夜は、まるで別物だな。同じ闇でも、こんなに温度が違うとは。' }], effects: ['aff(GERU,1)'] }),
  // ネオ
  T('DLG_LOVER_NEO_V7_1', 'NEO', { pool: 'STATE', cond: 'rel(PC, NEO) == LOVER', weight: 15, lines: [{ sp: 'NEO', text: '我が心の姫(王)よ。今朝、貴様の寝顔を守るように立っていた。……騎士とは、こういう時のためにあるのだと、今、わかったのである。' }], effects: ['aff(NEO,1)'] }),
  T('DLG_LOVER_NEO_V7_2', 'NEO', { pool: 'STATE', cond: 'rel(PC, NEO) == LOVER', weight: 13, lines: [{ sp: 'NEO', text: 'この魔剣に誓おう。貴様を泣かせる者あらば、たとえ竜であろうと斬り伏せてくれる。……飾りの剣だがな。心意気は本物である。ふ。' }], effects: ['aff(NEO,1)'] }),
  T('DLG_LOVER_NEO_V7_3', 'NEO', { pool: 'STATE', cond: 'rel(PC, NEO) == LOVER and weather == SUNNY', weight: 14, lines: [{ sp: 'NEO', text: '快晴! 我が金髪が輝く日、隣に貴様がいる。……これ以上の栄誉があろうか。いや、ない。断言できるのである。' }], effects: ['aff(NEO,1)'] }),
  // ムニ(家族)
  T('DLG_FAM_MUNI_V7_1', 'MUNI', { pool: 'STATE', cond: 'rel(PC, MUNI) == FAMILY', weight: 15, lines: [{ sp: 'MUNI', text: 'おおやさん、きょうもいっしょにねてくれる? ……かぞくだから、いいでしょ? ムニ、もうよるこわくないの!' }], effects: ['aff(MUNI,1)'] }),
  T('DLG_FAM_MUNI_V7_2', 'MUNI', { pool: 'STATE', cond: 'rel(PC, MUNI) == FAMILY', weight: 13, lines: [{ sp: 'MUNI', text: 'ムニね、おおきくなったら、おおやさんのこと、まもるひとになるの! かぞくは、まもりあうんだって、ゲルおねえちゃんがいってた!' }], effects: ['aff(MUNI,1)'] }),
  T('DLG_FAM_MUNI_V7_3', 'MUNI', { pool: 'STATE', cond: 'rel(PC, MUNI) == FAMILY and time == MORNING', weight: 14, lines: [{ sp: 'MUNI', text: 'おはよ、おおやさん! かぞくのあさは、いちばんげんきになるの! きょうもいっぱいあそぼ!' }], effects: ['aff(MUNI,1)'] }),

  // ========================================================
  // NPCカップル(主要人物どうし)の会話をさらに増量
  // (rel(A,B) == LOVER のとき = カップル成立時のみ発火)
  // ========================================================
  A('DLG_NPCPL_HYU_LEN_1', ['HYU', 'LENNY'], { cond: 'rel(HYU, LENNY) == LOVER', weight: 18, lines: [
    { sp: 'HYU', text: 'レニィ、また私の膝で寝ていますね。……まったく。前髪が乱れるので、動けないではありませんか。' },
    { sp: 'LENNY', text: 'ん……ヒュウの膝、あったかいんだもん。……あと五分だけ。 zzz' },
    { sp: 'HYU', text: '……ふ。仕方のない恋人ですね。まあ、この時間も、悪くはありませんが。' },
  ], effects: ['mutual(HYU,LENNY,1)', 'log(AMBIENT)'] }),
  A('DLG_NPCPL_JIN_NEO_1', ['JIN', 'NEO'], { cond: 'rel(JIN, NEO) == LOVER', weight: 18, lines: [
    { sp: 'JIN', text: 'ネオ! 今日の鍛錬、付き合えよ! 恋人なら背中預けられるだろ!' },
    { sp: 'NEO', text: 'ふはは、望むところである! 我が剣とお前の拳、背中合わせなら無敵であるな!' },
    { sp: 'JIN', text: 'だな! ……へへ、お前と組むと、なんでもできる気がすんだよ。' },
  ], effects: ['mutual(JIN,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_NPCPL_GER_NEO_1', ['GERU', 'NEO'], { cond: 'rel(GERU, NEO) == LOVER', weight: 18, lines: [
    { sp: 'NEO', text: 'ゲルよ、今宵も貴様の部屋で、本と茶を分かち合わぬか。……恋人どうしの、静かな夜である。' },
    { sp: 'GERU', text: '……いいだろう。ただし、頁をめくる音以外は立てるな。それが私の部屋の掟だ。……お前だから、許すんだぞ。' },
  ], effects: ['mutual(GERU,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_NPCPL_HYU_JIN_1', ['HYU', 'JIN'], { cond: 'rel(HYU, JIN) == LOVER', weight: 18, lines: [
    { sp: 'JIN', text: 'ヒュウ! 今日もキメてんな! ……お、お前のそういうとこ、かっこいいと思うぜ。' },
    { sp: 'HYU', text: 'あら、素直ですね。……あなたのその、まっすぐなところ。私の完璧さに、唯一勝てる武器ですよ。ふふ。' },
  ], effects: ['mutual(HYU,JIN,1)', 'log(AMBIENT)'] }),
  A('DLG_NPCPL_LEN_NEO_1', ['LENNY', 'NEO'], { cond: 'rel(LENNY, NEO) == LOVER', weight: 18, lines: [
    { sp: 'NEO', text: 'レニィよ。貴様が眠る間、私が見張りに立とう。……恋人を守るのは、騎士の本懐であるからな。' },
    { sp: 'LENNY', text: 'えへへ……ネオが見ててくれるなら、安心して眠れるよぉ。……おやすみ、ぼくの騎士さま。 zzz' },
  ], effects: ['mutual(LENNY,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_NPCPL_GER_HYU_1', ['GERU', 'HYU'], { cond: 'rel(GERU, HYU) == LOVER', weight: 18, lines: [
    { sp: 'HYU', text: 'ゲル。あなたの読む本の、その真剣な横顔……私の美とはまた違う、静かな美しさがありますね。' },
    { sp: 'GERU', text: '……口説き文句は聞き飽きたが。お前が言うと、少しだけ本物に聞こえるのが、癪だな。……隣、座れ。' },
  ], effects: ['mutual(GERU,HYU,1)', 'log(AMBIENT)'] }),

  // ========================================================
  // 「親しい友人だが恋人ではない」二人組の会話
  // (mutual >= 55 かつ rel != LOVER)
  // ========================================================
  A('DLG_FRND_JIN_LEN_1', ['JIN', 'LENNY'], { cond: 'mutual(JIN, LENNY) >= 55 and rel(JIN, LENNY) != LOVER', weight: 16, lines: [
    { sp: 'JIN', text: 'レニィ、お前とは不思議と気が合うよな。俺が暑苦しくても、お前は寝てるだけだしよ。はは!' },
    { sp: 'LENNY', text: 'ジンパチのそばはね、なんか安心して眠れるんだ。……親友って、そういうことでしょ?' },
    { sp: 'JIN', text: 'っ……! おう! 親友だ! 一生な!' },
  ], effects: ['mutual(JIN,LENNY,1)', 'log(AMBIENT)'] }),
  A('DLG_FRND_HYU_GER_1', ['HYU', 'GERU'], { cond: 'mutual(HYU, GERU) >= 55 and rel(HYU, GERU) != LOVER', weight: 16, lines: [
    { sp: 'HYU', text: 'ゲル。あなたとは恋には落ちませんが……不思議と、話が合いますね。美意識の方向が違うだけで、根は同じなのかもしれません。' },
    { sp: 'GERU', text: 'ふ、同感だ。お前の美学は表向き、私の美学は頁の中。……だが、こだわりを持つ者どうし、退屈はしないな。良き友だ。' },
  ], effects: ['mutual(HYU,GERU,1)', 'log(AMBIENT)'] }),
  A('DLG_FRND_NEO_JIN_1', ['NEO', 'JIN'], { cond: 'mutual(NEO, JIN) >= 55 and rel(NEO, JIN) != LOVER', weight: 16, lines: [
    { sp: 'NEO', text: 'ジンパチ。貴様は良き戦友である。恋ではないが、この背中を預けられる数少ない男よ。' },
    { sp: 'JIN', text: 'おう! 俺もお前を認めてるぜ、ネオ! 恋人じゃねえけど、いや、だからこそ、遠慮なくぶつかれる相棒だよな!' },
    { sp: 'NEO', text: 'ふはは、違いない! 親友とは、拳で語れる間柄であるからな!' },
  ], effects: ['mutual(NEO,JIN,1)', 'log(AMBIENT)'] }),
  A('DLG_FRND_GER_LEN_1', ['GERU', 'LENNY'], { cond: 'mutual(GERU, LENNY) >= 55 and rel(GERU, LENNY) != LOVER', weight: 16, lines: [
    { sp: 'GERU', text: 'レニィ。お前とは、恋人にはならんだろうな。……だが、同じ部屋で別々の時間を過ごせる。それが、私には一番心地いい間柄だ。' },
    { sp: 'LENNY', text: 'うん。ゲルが本を読んで、ぼくが寝てて。……なにも喋らなくても、さみしくないよね。いい友達だね。' },
  ], effects: ['mutual(GERU,LENNY,1)', 'log(AMBIENT)'] }),
  A('DLG_FRND_HYU_NEO_1', ['HYU', 'NEO'], { cond: 'mutual(HYU, NEO) >= 55 and rel(HYU, NEO) != LOVER', weight: 16, lines: [
    { sp: 'HYU', text: 'ネオさん、あなたとは良きライバルですね。髪に誇りを持つ者どうし……恋敵ではなく、美の同志、といったところでしょうか。' },
    { sp: 'NEO', text: 'ふ、認めよう。貴様の美への執念、騎士の忠義に通じるものがある。恋ではないが、並び立つに値する好敵手である。' },
  ], effects: ['mutual(HYU,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_FRND_JIN_MUN_1', ['JIN', 'MUNI'], { cond: 'mutual(JIN, MUNI) >= 55 and rel(JIN, MUNI) != LOVER', weight: 16, lines: [
    { sp: 'MUNI', text: 'ジンパチおにいちゃん、だいすき! おにいちゃんみたいに、つよくなりたいの!' },
    { sp: 'JIN', text: 'おう! なら毎日ちゃんと飯食って、よく寝ろ! それが一番の鍛錬だぞ! ……へへ、頼られると、燃えるぜ!' },
  ], effects: ['mutual(JIN,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_FRND_GER_MUN_1', ['GERU', 'MUNI'], { cond: 'mutual(GERU, MUNI) >= 55 and rel(GERU, MUNI) != LOVER', weight: 16, lines: [
    { sp: 'MUNI', text: 'ゲルおねえちゃん、こんやもえほんよんで? ムニ、おねえちゃんのこえ、すきなの。' },
    { sp: 'GERU', text: '……仕方のない子だ。いいだろう、一冊だけな。……お前が眠るまで、読んでやる。' },
  ], effects: ['mutual(GERU,MUNI,1)', 'log(AMBIENT)'] }),

  // ========================================================
  // 通常の主要人物どうしの会話をさらに増量(2人・場所/時間/季節)
  // ========================================================
  A('DLG_N_LEN_MUN_ROOF', ['LENNY', 'MUNI'], { cond: 'location == ROOF', lines: [
    { sp: 'MUNI', text: 'レニィおにいちゃん、くも、うさぎのかたちしてる!' },
    { sp: 'LENNY', text: 'ほんとだ……あ、あっちは、おふとんの形だよ。……見てたら眠くなってきた。一緒にお昼寝しよっか。' },
    { sp: 'MUNI', text: 'する〜! むにゅ〜。' },
  ], effects: ['mutual(LENNY,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_N_JIN_NEO_GROUND', ['JIN', 'NEO'], { cond: 'location == GROUND', lines: [
    { sp: 'JIN', text: 'ネオ! 素振り千回勝負だ! 負けたほうがラーメンおごりな!' },
    { sp: 'NEO', text: 'ふはは、受けて立とう! ……ぬ、だが待て。どちらが勝っても、貴様がラーメンを食いたいだけではないか?' },
    { sp: 'JIN', text: '……バレたか! はは! まあいい、勝負は勝負だ!' },
  ], effects: ['mutual(JIN,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_N_HYU_MUN_GROUND', ['HYU', 'MUNI'], { cond: 'location == GROUND', lines: [
    { sp: 'MUNI', text: 'ヒュウおにいちゃん、なんでいつもキラキラしてるの?' },
    { sp: 'HYU', text: '生まれつき、としか言いようがありませんね。……ですが、ムニ。あなたの笑顔も、なかなかキラキラしていますよ。' },
    { sp: 'MUNI', text: 'えへへ! ムニもキラキラなの!' },
  ], effects: ['mutual(HYU,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_N_GER_LEN_ROOF', ['GERU', 'LENNY'], { cond: 'location == ROOF', lines: [
    { sp: 'GERU', text: 'レニィ、屋上で読む本は格別だぞ。風が頁をめくってくれる。……お前は、風より先に寝ているがな。' },
    { sp: 'LENNY', text: 'えへへ……ゲルの読む声、子守唄みたいなんだもん。しあわせな眠りだよぉ。' },
  ], effects: ['mutual(GERU,LENNY,1)', 'log(AMBIENT)'] }),
  A('DLG_N_NEO_MUN_DAGASHI', ['NEO', 'MUNI'], { cond: 'location == dagashi', lines: [
    { sp: 'MUNI', text: 'ネオおにいちゃん、10えんゲームやろ! ムニ、あたりだすの!' },
    { sp: 'NEO', text: 'ほう、貴様も挑むか。……よかろう、この一戦、騎士の名にかけて見届けてやろう。ぬ……はずれか。運命とは、非情である。' },
    { sp: 'MUNI', text: 'ネオおにいちゃんも、はずれた! いっしょ!' },
  ], effects: ['mutual(MUNI,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_N_HYU_LEN_CAFE', ['HYU', 'LENNY'], { cond: 'location == cafe', lines: [
    { sp: 'HYU', text: 'レニィ、そのクリームソーダ、飲みかけで寝ないでくださいね。溶けたら、ただの緑の水ですよ。' },
    { sp: 'LENNY', text: 'ん……だいじょうぶ。海の色、見てるだけで満足だから……zzz' },
    { sp: 'HYU', text: '……もう寝ましたか。まったく。溶ける前に、私が飲んでおきましょう。ふ。' },
  ], effects: ['mutual(HYU,LENNY,1)', 'log(AMBIENT)'] }),
  A('DLG_N_JIN_GER_KARAOKE', ['JIN', 'GERU'], { cond: 'location == karaoke', lines: [
    { sp: 'JIN', text: 'ゲル! お前も一曲どうだ! 熱唱すればストレス発散になるぜ!' },
    { sp: 'GERU', text: '私は聴く側だと言っている。……だが、お前の暑苦しい熱唱は、嫌いじゃない。ほら、次の曲、入れてやったぞ。' },
    { sp: 'JIN', text: 'おっ、サンキュー! じゃ、お前のために歌うぜ! フォーッ!' },
  ], effects: ['mutual(JIN,GERU,1)', 'log(AMBIENT)'] }),
  // 季節/天気ものの追加
  A('DLG_N_NEO_LEN_SPR', ['NEO', 'LENNY'], { cond: 'season == SPRING', lines: [
    { sp: 'NEO', text: 'レニィよ、桜が散っておるぞ。……この花の潔さ、騎士の散り際のようで、胸を打つのである。' },
    { sp: 'LENNY', text: 'きれいだね……花びらのお布団で寝たら、きっといい夢見られるよぉ。' },
  ], effects: ['mutual(LENNY,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_N_HYU_MUN_SUM', ['HYU', 'MUNI'], { cond: 'season == SUMMER', lines: [
    { sp: 'MUNI', text: 'ヒュウおにいちゃん、あついよ〜。アイスたべたいの!' },
    { sp: 'HYU', text: 'では、私が涼しげに一本、選んであげましょう。……ただし、私の白い服に垂らさないように。約束ですよ、ムニ。' },
  ], effects: ['mutual(HYU,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_N_GER_JIN_AUT', ['GERU', 'JIN'], { cond: 'season == AUTUMN', lines: [
    { sp: 'JIN', text: 'ゲル! 秋だ! 読書もいいけど、たまには体動かせよ! 紅葉ランニングしようぜ!' },
    { sp: 'GERU', text: '走りながら本は読めん。……だが、落ち葉を踏む音は嫌いじゃない。歩きでなら、付き合ってやる。' },
  ], effects: ['mutual(JIN,GERU,1)', 'log(AMBIENT)'] }),
  A('DLG_N_LEN_HYU_WIN', ['LENNY', 'HYU'], { cond: 'season == WINTER', lines: [
    { sp: 'LENNY', text: 'ヒュウ、こたつって発明した人、天才だと思うんだ。……もう出られないよぉ。' },
    { sp: 'HYU', text: '同意しかねますが……まあ、あなたがそこで丸くなっている姿は、一幅の絵ではありますね。動けなくなる気持ち、少しだけ分かります。' },
  ], effects: ['mutual(HYU,LENNY,1)', 'log(AMBIENT)'] }),
  A('DLG_N_NEO_JIN_RAIN', ['NEO', 'JIN'], { cond: 'weather == RAIN', lines: [
    { sp: 'NEO', text: 'ジンパチ、雨で鍛錬ができぬな。……ならば、室内で剣技論を戦わせようではないか。' },
    { sp: 'JIN', text: 'おう、いいねえ! 雨の日の作戦会議ってやつだな! 熱く語り合おうぜ!' },
  ], effects: ['mutual(JIN,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_N_GER_MUN_SUN', ['GERU', 'MUNI'], { cond: 'weather == SUNNY', lines: [
    { sp: 'MUNI', text: 'ゲルおねえちゃん、おひさまきもちいいね! おそとであそぼ!' },
    { sp: 'GERU', text: 'ふ、いい天気だな。……日向で本を読むから、お前はその隣で好きに遊んでいろ。時々、見ていてやる。' },
  ], effects: ['mutual(GERU,MUNI,1)', 'log(AMBIENT)'] }),

  // ========================================================
  // 通常の主要人物の一人語りをさらに増量(COND中心)
  // ========================================================
  T('DLG_LEN_V7_1', 'LENNY', { pool: 'COND', cond: 'time == MIDNIGHT', lines: [{ sp: 'LENNY', text: '真夜中はね、街がぜんぶ眠ってて、ぼくだけ起きてる気がするんだ。……なんて、ぼくが一番寝てるんだけどね。えへへ。' }], effects: ['aff(LENNY,1)'] }),
  T('DLG_LEN_V7_2', 'LENNY', { pool: 'COND', cond: 'season == AUTUMN', lines: [{ sp: 'LENNY', text: '秋の風はね、ちょっとひんやりして、お昼寝がもっと気持ちよくなるんだ。……毛布、もう一枚出そうかな。' }], effects: ['aff(LENNY,1)'] }),
  T('DLG_HYU_V7_1', 'HYU', { pool: 'COND', cond: 'time == MORNING', lines: [{ sp: 'HYU', text: '朝は私の聖なる儀式の時間です。前髪二時間、肌の手入れ一時間。……美は一日にして成らず、毎日にして成る、ですよ。' }], effects: ['aff(HYU,1)'] }),
  T('DLG_HYU_V7_2', 'HYU', { pool: 'COND', cond: 'season == SPRING', lines: [{ sp: 'HYU', text: '春の日差しは柔らかく、私の肌を最も美しく見せます。……桜も私を引き立てるために咲いているのでしょうね。健気なものです。' }], effects: ['aff(HYU,1)'] }),
  T('DLG_JIN_V7_1', 'JIN', { pool: 'COND', cond: 'time == MORNING', lines: [{ sp: 'JIN', text: '朝の階段十往復、完了だぜ! 汗かいた後の朝飯は最高なんだ! さあ、今日も一日、全力でいくぞ!' }], effects: ['aff(JIN,1)'] }),
  T('DLG_JIN_V7_2', 'JIN', { pool: 'COND', cond: 'season == WINTER', lines: [{ sp: 'JIN', text: '寒い朝こそ鍛錬日和だぜ! 白い息はいて、体温めて……この一体感、たまらねえよな! ……え、俺だけ?' }], effects: ['aff(JIN,1)'] }),
  T('DLG_MUN_V7_1', 'MUNI', { pool: 'COND', cond: 'time == EVENING', lines: [{ sp: 'MUNI', text: 'ゆうやけ、まっかっかなの! ムニ、このいろ、すきー! ……おなかすいてきたの。' }], effects: ['aff(MUNI,1)'] }),
  T('DLG_MUN_V7_2', 'MUNI', { pool: 'COND', cond: 'season == AUTUMN', lines: [{ sp: 'MUNI', text: 'おちば、いっぱい! ムニ、はっぱのおふとんつくるの! ……レニィおにいちゃんもいっしょにねよ!' }], effects: ['aff(MUNI,1)'] }),
  T('DLG_GER_V7_1', 'GERU', { pool: 'COND', cond: 'time == NIGHT', lines: [{ sp: 'GERU', text: '夜が更けるほど、活字が澄んでくる。……昼間の私は仮の姿だ。本当の私は、この夜のページの中にいる。' }], effects: ['aff(GERU,1)'] }),
  T('DLG_GER_V7_2', 'GERU', { pool: 'COND', cond: 'season == SUMMER', lines: [{ sp: 'GERU', text: '夏の夜は、怪談本に限る。……暑さを忘れるのに、これほど効くものはない。背筋が冷えれば、冷房いらずだ。ふ。' }], effects: ['aff(GERU,1)'] }),
  T('DLG_NEO_V7_1', 'NEO', { pool: 'COND', cond: 'time == EVENING', lines: [{ sp: 'NEO', text: '黄昏か。……戦の終わりを告げる空の色である。この街に戦はないが、一日を戦い抜いた者には、ふさわしい褒美の色よ。' }], effects: ['aff(NEO,1)'] }),
  T('DLG_NEO_V7_2', 'NEO', { pool: 'COND', cond: 'season == AUTUMN', lines: [{ sp: 'NEO', text: '紅葉が炎のようである。……我が故郷にも、こうして山が燃える季節があった。ぬ……柄にもなく、感傷的になったな。ふ。' }], effects: ['aff(NEO,1)'] }),
  // マルタン神父への言及(主要人物の一人語り)
  T('DLG_LEN_MARTIN', 'LENNY', { cond: 'flag(FLG_MET_MARTIN)', lines: [{ sp: 'LENNY', text: 'マルタン神父さまってね、ぼくが話の途中で寝ちゃっても、ずっと待っててくれるんだ。……あんなにやさしい人、はじめてだよぉ。' }], effects: ['aff(LENNY,1)'] }),
  T('DLG_NEO_MARTIN', 'NEO', { cond: 'flag(FLG_MET_MARTIN)', lines: [{ sp: 'NEO', text: 'あの老神父、マルタン殿は、敬うべき御仁である。……剣を持たずして人の心を鎮める。あれもまた、一つの騎士道であろう。' }], effects: ['aff(NEO,1)'] }),
  T('DLG_GER_MARTIN', 'GERU', { cond: 'flag(FLG_MET_MARTIN)', lines: [{ sp: 'GERU', text: 'マルタン神父は、こちらが黙っていても急かさない。……そういう相手は、この饒舌な街には、驚くほど少ないんだ。貴重だな。' }], effects: ['aff(GERU,1)'] }),

  // ========================================================
  // 各施設/店での会話バリエーション増量(ペアAMBIENT)
  // ========================================================
  A('DLG_F_HYU_GER_BOOK', ['HYU', 'GERU'], { cond: 'location == book', lines: [
    { sp: 'HYU', text: 'ゲル、写真集の棚に私の載った雑誌はありませんか。……ないなら、そのうち置いてもらいましょう。' },
    { sp: 'GERU', text: 'ここは文芸の棚だ。お前のグラビアは、あっちの娯楽誌コーナーだな。……案内はせんぞ。自分で探せ。' },
  ], effects: ['mutual(HYU,GERU,1)', 'log(AMBIENT)'] }),
  A('DLG_F_NEO_JIN_RAMEN', ['NEO', 'JIN'], { cond: 'location == ramen', lines: [
    { sp: 'JIN', text: 'ネオ! 替え玉勝負だ! 先に音上げたほうが負けな!' },
    { sp: 'NEO', text: 'ふはは、この黄金のスープに勝負を挑むとは無粋であるが……よかろう! 騎士は、麺の一本まで残さぬ!' },
    { sp: 'JIN', text: 'その意気だ! 店主、替え玉ふたつ!' },
  ], effects: ['mutual(JIN,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_F_LEN_MUN_AQUA', ['LENNY', 'MUNI'], { cond: 'location == aquarium', lines: [
    { sp: 'MUNI', text: 'レニィおにいちゃん、くらげ、ふわふわしてる! きれいなの!' },
    { sp: 'LENNY', text: 'くらげはね、脳がないのに、あんなにきれいに生きてるんだ。……ぼく、尊敬してるんだよ。ムニも、なにも考えないで生きていいんだよぉ。' },
    { sp: 'MUNI', text: 'ムニ、なにもかんがえてないよ! ……あれ、ほめられてる?' },
  ], effects: ['mutual(LENNY,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_F_GER_NEO_IZA', ['GERU', 'NEO'], { cond: 'location == izakaya', lines: [
    { sp: 'NEO', text: 'ゲルよ、閉店間際のこの静けさ、貴様も好きであろう。無言で杯を交わせる相手は、得難いものである。' },
    { sp: 'GERU', text: '……ああ。喋らなくていい相手というのは、一番くつろげる。お前とは、沈黙が気まずくならない。それが、心地いいんだ。' },
  ], effects: ['mutual(GERU,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_F_HYU_NEO_CAKE', ['HYU', 'NEO'], { cond: 'location == cake', lines: [
    { sp: 'HYU', text: 'ネオさん、ショートケーキの断面美、分かりますか。この層の重なり、まるで芸術です。' },
    { sp: 'NEO', text: 'うむ、白き生クリームは騎士の甲冑の輝き……美しくして美味! 貴様とは、美の解釈で通じ合えるな。ふ。' },
    { sp: 'HYU', text: 'ふふ、あなたとは、いい菓子友だちになれそうです。' },
  ], effects: ['mutual(HYU,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_F_JIN_LEN_SENTO', ['JIN', 'LENNY'], { cond: 'location == sento', lines: [
    { sp: 'JIN', text: 'レニィ! 湯船で寝るなよ! 溺れるぞ! ……ほら、のぼせる前に上がるぞ!' },
    { sp: 'LENNY', text: 'ん……ジンパチの声、湯気の中だと遠くに聞こえるね……あったかい……zzz' },
    { sp: 'JIN', text: 'おい起きろって! しょうがねえな、おんぶしてやるよ! コーヒー牛乳おごるからよ!' },
  ], effects: ['mutual(JIN,LENNY,1)', 'log(AMBIENT)'] }),
  A('DLG_F_GER_HYU_FLOWER', ['GERU', 'HYU'], { cond: 'location == flower', lines: [
    { sp: 'HYU', text: 'ゲル、あなたも押し花ですか。私は薔薇の手入れの相談に。……美を保つ者どうし、こんな所で会いますね。' },
    { sp: 'GERU', text: 'お前の薔薇は「見せる」花、私の押し花は「残す」花だ。……方向は逆だが、花を愛でる気持ちは、同じらしいな。' },
  ], effects: ['mutual(HYU,GERU,1)', 'log(AMBIENT)'] }),
  A('DLG_F_NEO_MUN_TOYSHOP', ['NEO', 'MUNI'], { cond: 'location == toyshop', lines: [
    { sp: 'MUNI', text: 'ネオおにいちゃん、けんのおもちゃ! ネオおにいちゃんのとおそろい!' },
    { sp: 'NEO', text: 'ぬ……これは玩具の剣であるが、造りは悪くない。……ムニよ、剣とは振り回すものではなく、大切な者を守るためのものだぞ。忘れるな。' },
    { sp: 'MUNI', text: 'うん! ムニ、これでみんなまもるの!' },
  ], effects: ['mutual(MUNI,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_F_JIN_HYU_YAKI', ['JIN', 'HYU'], { cond: 'location == yakiniku', lines: [
    { sp: 'JIN', text: 'ヒュウ! 肉は俺が焼く! お前は取り分け担当な! その優雅な手つき、活かせよ!' },
    { sp: 'HYU', text: 'ええ、任されましょう。……あなたの豪快な焼き加減と、私の優雅な配膳。この組み合わせ、最強かもしれませんね。ふふ。' },
  ], effects: ['mutual(HYU,JIN,1)', 'log(AMBIENT)'] }),
  // カネ×NPCの追加(施設)
  A('DLG_F_KANE_MUN_MARKET', ['KANE', 'MUNI'], { cond: 'location == market and @kane_soft', lines: [
    { sp: 'MUNI', text: 'カネばあば! おつかい、じょうずにできたの! ほめて!' },
    { sp: 'KANE', text: 'おや、偉いじゃないか。……ほれ、飴玉ひとつ。誰にも言うんじゃないよ。ふん、可愛くないねぇ、まったく。' },
    { sp: 'MUNI', text: 'えへへ、カネばあば、だいすき!' },
  ], effects: ['mutual(KANE,MUNI,1)', 'log(AMBIENT)'] }),
];
