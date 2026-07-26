// ============================================================
// v10 追加会話 — 会話バリエーションのさらなる増量
//   (1) プレイヤー×主要6人 恋人会話
//   (2) 主要人物どうしのNPCカップル会話
//   (3) 主要人物2人の通常会話
//   (4) 恋人ではないが仲良くなった2人の会話
//   (5) 各施設・店での会話
// ============================================================
const T = (id, owner, node) => ({ id, owner, type: node.type ?? 'TALK', pool: node.pool ?? 'GENERIC', ...node });
const A = (id, cast, node) => ({ id, type: 'AMBIENT', pool: 'AMBIENT', owner: [...cast].sort().join('-'), cast, ...node });

export const DLG_V10 = [
  // ========================================================
  // (1) プレイヤー×主要人物 恋人会話(rel(PC,X) == LOVER)
  // ========================================================
  // レニィ
  T('DLG_LOVER_LENNY_V10_1', 'LENNY', { pool: 'STATE', cond: 'rel(PC, LENNY) == LOVER', weight: 14, lines: [{ sp: 'LENNY', text: '大家さん、あのね。……ぼくの寝言に大家さんの名前が出てたって、ムニに言われちゃった。……えへへ、恥ずかしいけど、ほんとのことだから、いっか。' }], effects: ['aff(LENNY,1)'] }),
  T('DLG_LOVER_LENNY_V10_2', 'LENNY', { pool: 'STATE', cond: 'rel(PC, LENNY) == LOVER and weather == CLOUDY', weight: 13, lines: [{ sp: 'LENNY', text: 'くもりの日はね、世界がやさしい色になるんだ。……こういう日に大家さんと手をつないでると、ぼく、いちばん安心するんだよぉ。' }], effects: ['aff(LENNY,1)'] }),
  T('DLG_LOVER_LENNY_V10_3', 'LENNY', { pool: 'STATE', cond: 'rel(PC, LENNY) == LOVER and time == EVENING', weight: 13, lines: [{ sp: 'LENNY', text: '夕方の空、金色でとろけそうだね。……ねえ、このままふたりで、時間が止まればいいのに。恋人になると、欲張りになっちゃうね。' }], effects: ['aff(LENNY,1)'] }),
  // ヒュウ
  T('DLG_LOVER_HYU_V10_1', 'HYU', { pool: 'STATE', cond: 'rel(PC, HYU) == LOVER', weight: 14, lines: [{ sp: 'HYU', text: '私が誰かのために鏡以外を磨くなんて。……ええ、あなたと過ごす部屋を、隅々まで美しくしてしまいました。恋とは、人を変えるものですね。' }], effects: ['aff(HYU,1)'] }),
  T('DLG_LOVER_HYU_V10_2', 'HYU', { pool: 'STATE', cond: 'rel(PC, HYU) == LOVER and season == SUMMER', weight: 13, lines: [{ sp: 'HYU', text: '夏の日差しは美白の敵。……ですが、あなたと日傘をひとつ分け合うためなら、少しの日焼けも許しましょう。ふふ、大きな譲歩ですよ?' }], effects: ['aff(HYU,1)'] }),
  T('DLG_LOVER_HYU_V10_3', 'HYU', { pool: 'STATE', cond: 'rel(PC, HYU) == LOVER and time == MORNING', weight: 13, lines: [{ sp: 'HYU', text: 'おはようございます。……寝起きの私を見せられるのは、後にも先にもあなただけ。これがどれほど特別なことか、分かっていますね?' }], effects: ['aff(HYU,1)'] }),
  // ジンパチ
  T('DLG_LOVER_JIN_V10_1', 'JIN', { pool: 'STATE', cond: 'rel(PC, JIN) == LOVER', weight: 14, lines: [{ sp: 'JIN', text: '恋人だから言うけどよ……お前が笑ってると、俺、なんでもできる気がするんだ。お前が俺の一番の原動力だぜ! ……くっ、恥ずいこと言わせんな!' }], effects: ['aff(JIN,1)'] }),
  T('DLG_LOVER_JIN_V10_2', 'JIN', { pool: 'STATE', cond: 'rel(PC, JIN) == LOVER and weather == RAIN', weight: 13, lines: [{ sp: 'JIN', text: '雨で鍛錬は休みだ。……だからよ、今日はお前とゴロゴロして過ごすぜ! ……こういう日があってもいいよな。恋人だし。へへ。' }], effects: ['aff(JIN,1)'] }),
  T('DLG_LOVER_JIN_V10_3', 'JIN', { pool: 'STATE', cond: 'rel(PC, JIN) == LOVER and season == AUTUMN', weight: 13, lines: [{ sp: 'JIN', text: '食欲の秋だ! お前のために焼き芋、たくさん焼いたぜ! ……いっしょに食おう。半分こな。一番ほくほくのとこは、お前にやるよ。' }], effects: ['aff(JIN,1)'] }),
  // ゲル
  T('DLG_LOVER_GERU_V10_1', 'GERU', { pool: 'STATE', cond: 'rel(PC, GERU) == LOVER', weight: 14, lines: [{ sp: 'GERU', text: 'あんたと恋人になってから、物語のハッピーエンドが、他人事に思えなくなってな。……自分にもこんな結末が来るとは。悪くない誤算だ。' }], effects: ['aff(GERU,1)'] }),
  T('DLG_LOVER_GERU_V10_2', 'GERU', { pool: 'STATE', cond: 'rel(PC, GERU) == LOVER and weather == RAIN', weight: 13, lines: [{ sp: 'GERU', text: '雨音と、ページをめくる音と、あんたの息づかい。……この三重奏が、今の私の一番好きな読書環境だ。……贅沢になったものだな、私も。' }], effects: ['aff(GERU,1)'] }),
  T('DLG_LOVER_GERU_V10_3', 'GERU', { pool: 'STATE', cond: 'rel(PC, GERU) == LOVER and season == WINTER', weight: 13, lines: [{ sp: 'GERU', text: '冬の夜は長い。……だが、あんたと同じ毛布で本を読む夜なら、いくら長くても足りないくらいだ。……ふ、キザだったか? 忘れてくれ。……いや、覚えていろ。' }], effects: ['aff(GERU,1)'] }),
  // ネオ
  T('DLG_LOVER_NEO_V10_1', 'NEO', { pool: 'STATE', cond: 'rel(PC, NEO) == LOVER', weight: 14, lines: [{ sp: 'NEO', text: '我が主よ。騎士の忠義と、男の恋。この二つが貴様の中でひとつになった。……もはや我が剣は、貴様のためだけに振るわれる。永遠にな。' }], effects: ['aff(NEO,1)'] }),
  T('DLG_LOVER_NEO_V10_2', 'NEO', { pool: 'STATE', cond: 'rel(PC, NEO) == LOVER and time in [NIGHT, MIDNIGHT]', weight: 13, lines: [{ sp: 'NEO', text: '夜警の途中で、貴様の寝顔を見に立ち寄った。……安らかな寝息よ。この平和を守るためなら、我は幾度でも夜を歩こう。……おやすみ、我が愛しき者。' }], effects: ['aff(NEO,1)'] }),
  T('DLG_LOVER_NEO_V10_3', 'NEO', { pool: 'STATE', cond: 'rel(PC, NEO) == LOVER and season == SPRING', weight: 13, lines: [{ sp: 'NEO', text: '春の花が咲き乱れておる。……我が故郷では、騎士は愛する者に花を捧げる風習があった。ほら、貴様に一輪。……受け取ってくれるか。' }], effects: ['aff(NEO,1)'] }),
  // ムニ(家族)
  T('DLG_FAM_MUNI_V10_1', 'MUNI', { pool: 'STATE', cond: 'rel(PC, MUNI) == FAMILY', weight: 14, lines: [{ sp: 'MUNI', text: 'おおやさん、しってる? かぞくってね、はなれててもこころはつながってるんだって! ……だからムニ、さみしくないの。おおやさんがいるから!' }], effects: ['aff(MUNI,1)'] }),
  T('DLG_FAM_MUNI_V10_2', 'MUNI', { pool: 'STATE', cond: 'rel(PC, MUNI) == FAMILY and weather == RAIN', weight: 13, lines: [{ sp: 'MUNI', text: 'あめのおと、こわくないの。だって、おおやさんがそばにいてくれるもん。……かぞくって、あめよけのかさみたいだね。えへへ。' }], effects: ['aff(MUNI,1)'] }),

  // ========================================================
  // (2) 主要人物どうしのNPCカップル会話(rel(A,B) == LOVER)
  // ========================================================
  A('DLG_NPCPL_HYU_LEN_V10', ['HYU', 'LENNY'], { cond: 'rel(HYU, LENNY) == LOVER', weight: 17, lines: [
    { sp: 'HYU', text: 'レニィ、また私の鏡の前で寝て。……いいでしょう、あなたの寝顔も、今日は私の鏡に映る最高の芸術ということで。' },
    { sp: 'LENNY', text: 'ん……ヒュウの鏡、あったかい光がさすから、つい……。恋人の特等席だよぉ。' },
  ], effects: ['mutual(HYU,LENNY,1)', 'log(AMBIENT)'] }),
  A('DLG_NPCPL_JIN_NEO_V10', ['JIN', 'NEO'], { cond: 'rel(JIN, NEO) == LOVER', weight: 17, lines: [
    { sp: 'NEO', text: 'ジンパチよ、今宵の鍛錬、我と競い合おうではないか。恋人どうしの手合わせ……熱くならぬわけがない!' },
    { sp: 'JIN', text: 'そうこなくっちゃな! 手加減はナシだぜ! ……勝ったほうが、負けたほうの好きなもん奢る! どうだ!' },
    { sp: 'NEO', text: 'ふはは、乗った! ……どちらが勝っても、二人で同じ卓を囲むのだがな。ふ、それでよいのだ。' },
  ], effects: ['mutual(JIN,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_NPCPL_GER_NEO_V10', ['GERU', 'NEO'], { cond: 'rel(GERU, NEO) == LOVER', weight: 17, lines: [
    { sp: 'NEO', text: 'ゲルよ、貴様の朗読で眠りにつくのが、近頃の我が至福である。……騎士が子守唄で眠るなど、誰にも言えぬがな。' },
    { sp: 'GERU', text: 'ふ、秘密にしておいてやる。……だが、お前が寝入るまで読むのは、私も嫌いじゃない。それが、私の一番静かな幸せだ。' },
  ], effects: ['mutual(GERU,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_NPCPL_HYU_JIN_V10', ['HYU', 'JIN'], { cond: 'rel(HYU, JIN) == LOVER', weight: 17, lines: [
    { sp: 'JIN', text: 'ヒュウ、お前が隣にいると、俺、もっと強くなれる気がするんだ。……恋の力ってやつ、バカにできねえな!' },
    { sp: 'HYU', text: 'ふふ、単純ですね。……ですが、そのまっすぐさに、私も強くしてもらっているのですよ。お互いさま、ということです。' },
  ], effects: ['mutual(HYU,JIN,1)', 'log(AMBIENT)'] }),
  A('DLG_NPCPL_LEN_NEO_V10', ['LENNY', 'NEO'], { cond: 'rel(LENNY, NEO) == LOVER', weight: 17, lines: [
    { sp: 'LENNY', text: 'ネオ、いつか本物の海、いっしょに見にいこうね。……騎士さまと見る海、きっときれいだよ。' },
    { sp: 'NEO', text: '約束しよう。我が剣に懸けて、必ず貴様を海へ連れて行く。……その日まで、この夢を二人で温めておこうぞ、レニィ。' },
  ], effects: ['mutual(LENNY,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_NPCPL_GER_HYU_V10', ['GERU', 'HYU'], { cond: 'rel(GERU, HYU) == LOVER', weight: 17, lines: [
    { sp: 'GERU', text: 'ヒュウ、お前の「美」の話、昔は聞き流していたが……恋人になると、その情熱が愛おしく思えてくるから不思議だ。' },
    { sp: 'HYU', text: 'あら、素直ですね。では特別に、私の美の秘訣を全て教えましょう。……恋人にだけ明かす、門外不出の奥義です。ふふ。' },
  ], effects: ['mutual(GERU,HYU,1)', 'log(AMBIENT)'] }),
  A('DLG_NPCPL_JIN_LEN_V10', ['JIN', 'LENNY'], { cond: 'rel(JIN, LENNY) == LOVER', weight: 17, lines: [
    { sp: 'JIN', text: 'レニィ、鍛錬の後にお前の顔見ると、疲れが吹き飛ぶんだよな。……お前、俺の栄養ドリンクより効くぜ!' },
    { sp: 'LENNY', text: 'ふふ、ぼくは何もしてないのに。……でも、ジンパチが元気になるなら、いくらでも顔見せてあげるよ。恋人だもんね。' },
  ], effects: ['mutual(JIN,LENNY,1)', 'log(AMBIENT)'] }),

  // ========================================================
  // (3) 主要人物2人の通常会話(場所/時間/季節/天気)
  // ========================================================
  A('DLG_N_GER_HYU_ROOF_V10', ['GERU', 'HYU'], { cond: 'location == ROOF', lines: [
    { sp: 'HYU', text: 'ゲル、屋上で本ですか。風でページが乱れないので?' },
    { sp: 'GERU', text: '乱れたところで読む。……風が勝手にめくる頁に、思わぬ一節を見つけることもある。偶然も、また読書の醍醐味だ。' },
  ], effects: ['mutual(GERU,HYU,1)', 'log(AMBIENT)'] }),
  A('DLG_N_JIN_MUN_GROUND_V10', ['JIN', 'MUNI'], { cond: 'location == GROUND', lines: [
    { sp: 'MUNI', text: 'ジンパチおにいちゃん、だっこして! たかいたかいして!' },
    { sp: 'JIN', text: 'よーし来い! たかいたかーい! ……どうだ、街が見渡せるだろ! ……お、重くなったな、ムニ! 育ってる証拠だ!' },
  ], effects: ['mutual(JIN,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_N_LEN_HYU_ROOF_V10', ['LENNY', 'HYU'], { cond: 'location == ROOF', lines: [
    { sp: 'LENNY', text: 'ヒュウ、屋上の風、気持ちいいね。……あ、前髪が乱れちゃうか。' },
    { sp: 'HYU', text: '……いいのですよ、今日は。屋上の風に吹かれる私も、なかなか絵になるでしょう? 完璧の中の、ひとかけらの自然、ですね。' },
  ], effects: ['mutual(HYU,LENNY,1)', 'log(AMBIENT)'] }),
  A('DLG_N_GER_MUN_GROUND_V10', ['GERU', 'MUNI'], { cond: 'location == GROUND', lines: [
    { sp: 'MUNI', text: 'ゲルおねえちゃん、みてみて! みずたまりにおそらがうつってるの!' },
    { sp: 'GERU', text: 'ほう……足元に空か。よく見つけたな、ムニ。お前の目は、詩人のそれだ。……その感性、大事にしろよ。' },
  ], effects: ['mutual(GERU,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_N_JIN_NEO_MORNING_V10', ['JIN', 'NEO'], { cond: 'time == MORNING', lines: [
    { sp: 'JIN', text: 'ネオ! 朝稽古いくぜ! 朝日に向かって素振り千回だ!' },
    { sp: 'NEO', text: 'ふはは、良い心意気! 朝の空気は刃のごとく澄んでおる。……我が剣も、この時刻が一番冴えるのである!' },
  ], effects: ['mutual(JIN,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_N_LEN_MUN_DAY_V10', ['LENNY', 'MUNI'], { cond: 'time == DAY', lines: [
    { sp: 'MUNI', text: 'レニィおにいちゃん、おひるねのじかんだよ! いっしょにねよ!' },
    { sp: 'LENNY', text: 'えへへ、ムニはお昼寝の名人だね。……じゃあ、どっちが先に夢の国につくか、競争しよっか。よーい、ドン。……zzz' },
  ], effects: ['mutual(LENNY,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_N_HYU_GER_EVENING_V10', ['HYU', 'GERU'], { cond: 'time == EVENING', lines: [
    { sp: 'HYU', text: '黄昏時のあなた、いつもより物憂げで……ええ、認めましょう。少しだけ、詩的な美しさがありますね。' },
    { sp: 'GERU', text: '……夕暮れは、昼と夜の狭間だからな。曖昧な光は、人を少し素直にさせる。……お前の世辞も、今なら受け取ってやる。' },
  ], effects: ['mutual(HYU,GERU,1)', 'log(AMBIENT)'] }),
  A('DLG_N_JIN_GER_SPRING_V10', ['JIN', 'GERU'], { cond: 'season == SPRING', lines: [
    { sp: 'JIN', text: 'ゲル! 春だぜ! 新しい本、たくさん読めよ! ……って、お前は季節関係なく読んでるか!' },
    { sp: 'GERU', text: 'ふ、よく分かってるじゃないか。……だが、春の陽気は、外で読むのに向いている。今日はお前の稽古を眺めながら、一冊いくとするか。' },
  ], effects: ['mutual(JIN,GERU,1)', 'log(AMBIENT)'] }),
  A('DLG_N_HYU_LEN_SUMMER_V10', ['HYU', 'LENNY'], { cond: 'season == SUMMER', lines: [
    { sp: 'LENNY', text: 'ヒュウ、あついね……。かき氷たべたい。れにぃ、いちご味。' },
    { sp: 'HYU', text: 'では私はブルーハワイを。……青いかき氷を口にする私、涼やかで美しいでしょう? ほら、あなたも溶ける前に召し上がれ。' },
  ], effects: ['mutual(HYU,LENNY,1)', 'log(AMBIENT)'] }),
  A('DLG_N_MUN_NEO_AUTUMN_V10', ['MUNI', 'NEO'], { cond: 'season == AUTUMN', lines: [
    { sp: 'MUNI', text: 'ネオおにいちゃん、どんぐりいっぱい! ぼうしかぶってるの、かわいいの!' },
    { sp: 'NEO', text: 'ほう、団栗の帽子か。……小さきものにも兜あり。自然とは、細部まで武装を怠らぬな。ふ、集めるか、ムニ。二人で宝探しである!' },
  ], effects: ['mutual(MUNI,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_N_LEN_GER_WINTER_V10', ['LENNY', 'GERU'], { cond: 'season == WINTER', lines: [
    { sp: 'LENNY', text: 'ゲル、こたつ入っていい? ……本、読んでていいから。ぼく、丸くなって寝てるだけだから。' },
    { sp: 'GERU', text: '……好きにしろ。だが、私の足を枕にするな。前も、それで身動きが取れなくなった。……ふ、まあ、温かいから、いいか。' },
  ], effects: ['mutual(LENNY,GERU,1)', 'log(AMBIENT)'] }),
  A('DLG_N_JIN_HYU_RAIN_V10', ['JIN', 'HYU'], { cond: 'weather == RAIN', lines: [
    { sp: 'JIN', text: '雨か……鍛錬できねえのは残念だが、こういう日はヒュウの美容講座でも聞くとするか! なあ、肌の手入れって効果あんのか?' },
    { sp: 'HYU', text: 'あら、あなたが美に興味を? ……いいでしょう、特別に教えます。まずは、その豪快に洗う癖を直すところから、ですね。' },
  ], effects: ['mutual(HYU,JIN,1)', 'log(AMBIENT)'] }),
  A('DLG_N_GER_NEO_SUNNY_V10', ['GERU', 'NEO'], { cond: 'weather == SUNNY', lines: [
    { sp: 'NEO', text: 'ゲルよ、快晴である。たまには日の下で本を読むのも良いぞ。我が金髪が、貴様の頁を照らす灯りとなろう。' },
    { sp: 'GERU', text: 'その灯りは眩しすぎる。……だが、まあ、悪くない申し出だ。日向で読む本は、夜とはまた違う顔を見せる。付き合ってやろう。' },
  ], effects: ['mutual(GERU,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_N_MUN_HYU_CLOUD_V10', ['MUNI', 'HYU'], { cond: 'weather == CLOUDY', lines: [
    { sp: 'MUNI', text: 'ヒュウおにいちゃん、きょうはおひさまかくれんぼしてるの。' },
    { sp: 'HYU', text: 'ふふ、詩的な表現ですね、ムニ。……曇りの日はね、実は肌が一番美しく見える光なのですよ。今日の私は、いつにも増して完璧、ということです。' },
  ], effects: ['mutual(HYU,MUNI,1)', 'log(AMBIENT)'] }),

  // ========================================================
  // (4) 恋人ではないが仲良くなった2人の会話
  //     (mutual >= 55 and rel != LOVER)
  // ========================================================
  A('DLG_FRND_HYU_JIN_V10', ['HYU', 'JIN'], { cond: 'mutual(HYU, JIN) >= 55 and rel(HYU, JIN) != LOVER', weight: 15, lines: [
    { sp: 'JIN', text: 'ヒュウ、お前とつるむようになって長いよな。恋人とかじゃねえけど、お前ほど気の合う相棒はいねえよ!' },
    { sp: 'HYU', text: 'ふふ、私もですよ。……正反対だからこそ、飽きない。あなたは私の一番の親友です。これは、世辞ではありませんよ。' },
  ], effects: ['mutual(HYU,JIN,1)', 'log(AMBIENT)'] }),
  A('DLG_FRND_LEN_NEO_V10', ['LENNY', 'NEO'], { cond: 'mutual(LENNY, NEO) >= 55 and rel(LENNY, NEO) != LOVER', weight: 15, lines: [
    { sp: 'LENNY', text: 'ネオって、こわそうに見えて、すごくやさしいよね。……ぼく、ネオといると安心して眠れるんだ。親友の証だよ。' },
    { sp: 'NEO', text: 'ふ、我を安眠の守護者と見込むか。……よかろう。友の眠りを守るのも、騎士の誉れである。安心して眠れ、レニィ。' },
  ], effects: ['mutual(LENNY,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_FRND_GER_MUN_V10', ['GERU', 'MUNI'], { cond: 'mutual(GERU, MUNI) >= 55 and rel(GERU, MUNI) != LOVER', weight: 15, lines: [
    { sp: 'MUNI', text: 'ゲルおねえちゃん、ムニのいちばんのなかよしだよね?' },
    { sp: 'GERU', text: '……ああ。恋人でも家族でもないが。お前は、私が心を許した数少ない相手だ。それを、友情と呼ぶんだろうな。大事にするさ。' },
  ], effects: ['mutual(GERU,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_FRND_JIN_NEO_V10', ['JIN', 'NEO'], { cond: 'mutual(JIN, NEO) >= 55 and rel(JIN, NEO) != LOVER', weight: 15, lines: [
    { sp: 'JIN', text: 'ネオ、お前とは恋人じゃねえけど、背中を預けられる。それって、最高の関係だと思うんだよな!' },
    { sp: 'NEO', text: 'まさに戦友である! 恋にあらず、されど生涯の絆。……この関係を、我は誇りに思うぞ、ジンパチ。拳を合わせようぞ!' },
  ], effects: ['mutual(JIN,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_FRND_HYU_GER_V10', ['HYU', 'GERU'], { cond: 'mutual(HYU, GERU) >= 55 and rel(HYU, GERU) != LOVER', weight: 15, lines: [
    { sp: 'HYU', text: 'ゲル、あなたとは恋にはなりませんが……美学を語り合える友は、貴重です。表の美と、内なる美。私たちは、良い対だ。' },
    { sp: 'GERU', text: 'ふ、同感だ。お前の話は、時々うるさいが……嫌いではない。こだわりを持つ者どうし、退屈しない友情というやつだな。' },
  ], effects: ['mutual(HYU,GERU,1)', 'log(AMBIENT)'] }),
  A('DLG_FRND_LEN_HYU_V10', ['LENNY', 'HYU'], { cond: 'mutual(LENNY, HYU) >= 55 and rel(LENNY, HYU) != LOVER', weight: 15, lines: [
    { sp: 'LENNY', text: 'ヒュウはね、キラキラしてるけど、ぼくの前だと、ちょっとだけ肩の力が抜けるでしょ。……それって、親友だからだよね。' },
    { sp: 'HYU', text: '……鋭いですね、レニィ。ええ、あなたの前だけは、完璧でいなくてもいい気がするのです。不思議な安心感です。友の力、ですかね。' },
  ], effects: ['mutual(HYU,LENNY,1)', 'log(AMBIENT)'] }),
  A('DLG_FRND_JIN_MUN_V10', ['JIN', 'MUNI'], { cond: 'mutual(JIN, MUNI) >= 55 and rel(JIN, MUNI) != LOVER', weight: 15, lines: [
    { sp: 'MUNI', text: 'ジンパチおにいちゃん、ムニがおおきくなったら、けんかしてもかつよ!' },
    { sp: 'JIN', text: 'はは! いい意気込みだ! なら、それまで俺がしっかり鍛えてやる! ……でも、俺もまだまだ負けねえからな、親友!' },
  ], effects: ['mutual(JIN,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_FRND_GER_LEN_V10', ['GERU', 'LENNY'], { cond: 'mutual(GERU, LENNY) >= 55 and rel(GERU, LENNY) != LOVER', weight: 15, lines: [
    { sp: 'GERU', text: 'レニィ、お前と過ごす時間は、静かで心地いい。……何も喋らず、私は本を、お前は昼寝を。これが、私たちの友情の形だな。' },
    { sp: 'LENNY', text: 'うん。……ゲルとなら、しゃべらなくても、さみしくないんだ。いっしょにいるだけで、いい親友だよぉ。' },
  ], effects: ['mutual(GERU,LENNY,1)', 'log(AMBIENT)'] }),

  // ========================================================
  // (5) 各施設・店での会話バリエーション
  // ========================================================
  A('DLG_F_MUN_HYU_CAFE_V10', ['MUNI', 'HYU'], { cond: 'location == cafe', lines: [
    { sp: 'MUNI', text: 'ヒュウおにいちゃん、ムニもおとなのジュースのみたい!' },
    { sp: 'HYU', text: 'ふふ、では、あなたには特製のミックスジュースを。……大人の階段は、一段ずつですよ、ムニ。優雅に登りなさい。' },
  ], effects: ['mutual(HYU,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_F_GER_JIN_BOOK_V10', ['GERU', 'JIN'], { cond: 'location == book', lines: [
    { sp: 'JIN', text: 'ゲル、俺でも読める熱い本ってあるか? こう、燃えるやつ!' },
    { sp: 'GERU', text: '熱血漢向けか。……ならこの冒険小説だ。主人公が、お前によく似た暑苦しい男でな。……ふ、感情移入しすぎて泣くなよ。' },
  ], effects: ['mutual(JIN,GERU,1)', 'log(AMBIENT)'] }),
  A('DLG_F_LEN_NEO_RAMEN_V10', ['LENNY', 'NEO'], { cond: 'location == ramen', lines: [
    { sp: 'NEO', text: 'レニィ、この黄金のスープを見よ。……我はこれに敗れた男である。貴様も味わうがよい。' },
    { sp: 'LENNY', text: 'いただきまーす。……あったかくて、湯気で、ねむく……あ、寝る前に食べきるね。おいしいねぇ、ネオ。' },
  ], effects: ['mutual(LENNY,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_F_HYU_MUN_DAGASHI_V10', ['HYU', 'MUNI'], { cond: 'location == dagashi', lines: [
    { sp: 'MUNI', text: 'ヒュウおにいちゃん、10えんゲームやろ! ムニ、あたりだすの!' },
    { sp: 'HYU', text: 'ふふ、では私も一勝負。……美しく当てて見せましょう。……あら、外れ。まあ、たまには、こういう不完全も一興ですね。' },
  ], effects: ['mutual(HYU,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_F_GER_MUN_CAKE_V10', ['GERU', 'MUNI'], { cond: 'location == cake', lines: [
    { sp: 'MUNI', text: 'ゲルおねえちゃん、いちごのケーキ、はんぶんこ!' },
    { sp: 'GERU', text: 'ふ、いいだろう。……いちごはお前にやる。私はスポンジで十分だ。……そんなに嬉しそうな顔をするな。こっちまで笑ってしまう。' },
  ], effects: ['mutual(GERU,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_F_HYU_LEN_GAME_V10', ['HYU', 'LENNY'], { cond: 'location == game', lines: [
    { sp: 'HYU', text: 'レニィ、音ゲーで対決を。……私の優雅な指先に、あなたはついてこられますか?' },
    { sp: 'LENNY', text: 'ぼく、リズムに合わせてると、だんだん眠く……あ、寝ながらでも押せるかも。……zzz。……あれ、フルコンボ出てる?' },
  ], effects: ['mutual(HYU,LENNY,1)', 'log(AMBIENT)'] }),
  A('DLG_F_JIN_NEO_FLOWER_V10', ['JIN', 'NEO'], { cond: 'location == flower', lines: [
    { sp: 'JIN', text: 'ネオ、お前が花屋? 意外だな!' },
    { sp: 'NEO', text: 'ふ、騎士は愛する者に花を捧げるもの。……いや、今日はただ、この赤い薔薇の凛々しさに惹かれてな。武人の花である。' },
  ], effects: ['mutual(JIN,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_F_LEN_GER_SENTO_V10', ['LENNY', 'GERU'], { cond: 'location == sento', lines: [
    { sp: 'LENNY', text: 'ゲル、お湯、きもちいいね……。あ、女湯だから、ゲルはあっちか。壁越しにおしゃべりしよ。' },
    { sp: 'GERU', text: 'ふ、湯気越しの会話も乙なものだ。……レニィ、湯船で寝るなよ。溺れたら、私が助けに行かねばならん。面倒をかけるな。' },
  ], effects: ['mutual(LENNY,GERU,1)', 'log(AMBIENT)'] }),
  A('DLG_F_MUN_JIN_AQUA_V10', ['MUNI', 'JIN'], { cond: 'location == aquarium', lines: [
    { sp: 'MUNI', text: 'ジンパチおにいちゃん、サメ! おっきいの! こわくないの?' },
    { sp: 'JIN', text: 'こわくねえ! むしろかっこいいだろ! あの筋肉……じゃねえ、あの流線型! 俺も見習いてえぜ! ……ムニ、俺の後ろに隠れてていいぞ。' },
  ], effects: ['mutual(JIN,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_F_HYU_NEO_IZAKAYA_V10', ['HYU', 'NEO'], { cond: 'location == izakaya', lines: [
    { sp: 'HYU', text: 'ネオさん、今宵は私の作るカクテルを。……美しき騎士に、美しき一杯を。似合いすぎて、絵になりますね。' },
    { sp: 'NEO', text: 'かたじけない。……貴様の一杯、色まで美しい。ふ、我ら二人、この店で最も華のある客であろうな。' },
  ], effects: ['mutual(HYU,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_F_LEN_MUN_TOYSHOP_V10', ['LENNY', 'MUNI'], { cond: 'location == toyshop', lines: [
    { sp: 'MUNI', text: 'レニィおにいちゃん、このぬいぐるみ、ふわふわ! さわってみて!' },
    { sp: 'LENNY', text: 'わ、ほんとだ……ふかふか。……これ抱いて寝たら、最高の夢見られそうだよぉ。ムニ、いい物みつけたね。' },
  ], effects: ['mutual(LENNY,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_F_GER_HYU_KONBINI_V10', ['GERU', 'HYU'], { cond: 'location == konbini', lines: [
    { sp: 'HYU', text: 'ゲル、こんな夜更けに? ……ふふ、深夜のコンビニで会うとは、夜型どうしですね。' },
    { sp: 'GERU', text: 'お前もな。……プリンを買いに来ただけだ。誰にも言うなよ。……お前の分も、一つ買っておいてやる。夜の共犯者だな。' },
  ], effects: ['mutual(GERU,HYU,1)', 'log(AMBIENT)'] }),
  A('DLG_F_JIN_MUN_YAKINIKU_V10', ['JIN', 'MUNI'], { cond: 'location == yakiniku', lines: [
    { sp: 'JIN', text: 'ムニ! 肉焼けたぞ! ……熱いから気をつけろよ! ほら、フーフーしてやる!' },
    { sp: 'MUNI', text: 'ジンパチおにいちゃん、ありがとなの! ……おにく、ほっぺおちそう!' },
  ], effects: ['mutual(JIN,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_F_GER_LEN_CINEMA_V10', ['GERU', 'LENNY'], { cond: 'location == cinema', lines: [
    { sp: 'GERU', text: 'レニィ、この映画は静かな名作だ。……派手さはないが、余韻が長い。お前は……案の定、もう寝ているな。ふ。' },
    { sp: 'LENNY', text: 'ん……ゲルの選ぶ映画、子守唄みたいで好きなんだ。……あとで、どんな話だったか教えて? えへへ。' },
  ], effects: ['mutual(GERU,LENNY,1)', 'log(AMBIENT)'] }),
  A('DLG_F_HYU_NEO_DONUT_V10', ['HYU', 'NEO'], { cond: 'location == donut', lines: [
    { sp: 'HYU', text: 'ネオさん、このドーナツの艶やかな照り……美の探究者として、見逃せませんね。' },
    { sp: 'NEO', text: 'うむ、輪状の菓子ながら、その光沢、甲冑の輝きに通ず。……貴様とは、美の話が尽きぬな。もう一つ、頼むとするか。' },
  ], effects: ['mutual(HYU,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_F_LEN_MUN_CHURCH_V10', ['LENNY', 'MUNI'], { cond: 'location == church', lines: [
    { sp: 'MUNI', text: 'レニィおにいちゃん、きょうかいってしずかだから、ねむくなるね。' },
    { sp: 'LENNY', text: 'うん……神父さまも、ぼくが寝てても怒らないんだ。……ここ、世界一やさしいお昼寝スポットかもしれないよぉ。' },
  ], effects: ['mutual(LENNY,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_F_HYU_GER_KARAOKE_V10', ['HYU', 'GERU'], { cond: 'location == karaoke', lines: [
    { sp: 'HYU', text: 'ゲル、今日はあなたの低音を聞かせてください。……私の美声と重ねれば、極上のハーモニーになりますよ。' },
    { sp: 'GERU', text: '……仕方ないな。一曲だけだぞ。……ふ、お前と歌うのも、たまには悪くない。キーは合わせてやる。' },
  ], effects: ['mutual(GERU,HYU,1)', 'log(AMBIENT)'] }),
  A('DLG_F_JIN_LEN_HALL_V10', ['JIN', 'LENNY'], { cond: 'location == hall', lines: [
    { sp: 'JIN', text: 'レニィ、集会所は広くて気持ちいいだろ! ……宴会やるとき、お前はいつも隅で寝てるけどな!' },
    { sp: 'LENNY', text: 'えへへ、みんなの声を聞きながら寝るの、最高なんだ。……ジンパチの笑い声が、いちばんの子守唄だよ。' },
  ], effects: ['mutual(JIN,LENNY,1)', 'log(AMBIENT)'] }),
];
