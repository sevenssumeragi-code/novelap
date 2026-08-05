// ============================================================
// v13 追加会話
//   ・こどもの日(集会所・鯉のぼり) / 花火大会(屋上)イベント
//   ・各施設での主要人物ペア会話(通常/恋人時/友人時)を大幅増
//   ・親密度が高いと互いの部屋に遊びに来た時の会話
//   ・カラオケの複数人デュエット/合唱
// ============================================================
const T = (id, owner, node) => ({ id, owner, type: node.type ?? 'TALK', pool: node.pool ?? 'GENERIC', ...node });
const A = (id, cast, node) => ({ id, type: 'AMBIENT', pool: 'AMBIENT', owner: [...cast].sort().join('-'), cast, ...node });
const ALLMAIN = ['LENNY', 'HYU', 'JIN', 'GERU', 'MUNI', 'NEO'];
const ALLMAIN_K = ['LENNY', 'HYU', 'JIN', 'GERU', 'MUNI', 'NEO', 'KANE'];

export const DLG_V13 = [
  // ========================================================
  // こどもの日(集会所・鯉のぼり)
  // ========================================================
  A('DLG_EV_KODOMO', ALLMAIN, { cond: 'event_active(KODOMO) and location == hall', weight: 30, lines: [
    { sp: 'MUNI', text: 'こいのぼり! おっきい! いちばんちっちゃいの、ムニのこいのぼりなの!' },
    { sp: 'JIN', text: 'よーしムニ! こどもの日は男の子の日だ! 柏餅食って、でっかく育て! 俺が背比べの相手になってやる!' },
    { sp: 'HYU', text: '鯉のぼりの吹き流し、五色の配色が美しいですね。……風になびく様、まるで私の髪のようです。' },
    { sp: 'LENNY', text: '菖蒲湯に入ると、風邪ひかないんだって。……あったかくて、ぼく、湯船で寝ちゃいそうだよぉ。' },
    { sp: 'NEO', text: '鯉が滝を登り、龍となる……「登竜門」の伝説か。武者人形といい、この節句、騎士の心得に通ずるものがあるな。感心である。' },
    { sp: 'GERU', text: '子供の健やかな成長を願う日、か。……ムニ、お前がまっすぐ育つよう、私も柏餅をひとつ、供えておくとしよう。' },
  ], effects: ['mutual(JIN,MUNI,1)', 'mutual(GERU,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_EV_KODOMO_K', ALLMAIN_K, { cond: 'event_active(KODOMO) and location == hall', weight: 34, lines: [
    { sp: 'KANE', text: 'おや、鯉のぼりかい。……あたしも昔は、子らのために揚げたもんさ。懐かしいねぇ。' },
    { sp: 'MUNI', text: 'カネばあば! ムニのこいのぼり、みて! いちばんちっちゃいの!' },
    { sp: 'KANE', text: 'ふふ、小さくても、いつか一番大きくなるさ。……元気にお育ち、ムニ。ばあばの願いだよ。' },
  ], effects: ['mutual(KANE,MUNI,1)', 'log(AMBIENT)'] }),

  // ========================================================
  // 花火大会(屋上) — 九龍城の外に花火が上がる
  // ========================================================
  A('DLG_EV_HANABI', ALLMAIN, { cond: 'event_active(HANABI) and location == ROOF', weight: 30, lines: [
    { sp: 'MUNI', text: 'はなび! おっきい! そらにおはながさいたの! きれー!' },
    { sp: 'JIN', text: 'うおおお! でっけえ花火だ! 屋上は特等席だな! ……次はもっとでかいの来るぜ! 見逃すなよ!' },
    { sp: 'HYU', text: '夜空のキャンバスに、一瞬だけ咲く大輪。……儚いからこそ美しい。私の美とは、また別種の美ですね。' },
    { sp: 'LENNY', text: 'ドーンって音のあと、しばらくして光が消えるんだよね。……この静けさが、ぼく、好きなんだ。' },
    { sp: 'NEO', text: '天を焦がす火の花……我が故郷の魔法の炎を思い出す。だが、これは誰も傷つけぬ火だ。……平和の火よ。美しいのう。' },
    { sp: 'GERU', text: '消えては咲き、咲いては消える。……この街と同じだな。だからこそ、今、この瞬間を目に焼き付けておきたい。' },
  ], effects: ['mutual(LENNY,MUNI,1)', 'mutual(GERU,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_EV_HANABI_K', ALLMAIN_K, { cond: 'event_active(HANABI) and location == ROOF', weight: 34, lines: [
    { sp: 'KANE', text: 'ほう、屋上から花火とは、乙なもんだねぇ。……この歳になると、一発一発が、身に沁みるよ。' },
    { sp: 'MUNI', text: 'カネばあば! いっしょにみよ! ほら、あそこ!' },
    { sp: 'KANE', text: 'ああ、見えてるよ。……あんたたちと見る花火は、格別だねぇ。長生きはするもんさ。' },
    { sp: 'NEO', text: '婆殿、隣を失礼する。……こうして皆で見上げる夜空、これぞ我らの故郷の景色である。' },
  ], effects: ['mutual(KANE,MUNI,1)', 'mutual(KANE,NEO,1)', 'log(AMBIENT)'] }),

  // ========================================================
  // 各施設での主要人物ペア会話(通常)をさらに増量
  // ========================================================
  A('DLG_F_HYU_GER_CAFE_V13', ['HYU', 'GERU'], { cond: 'location == cafe', lines: [
    { sp: 'HYU', text: 'ゲル、あなたいつも同じ席ですね。窓際の、あの一番光の入る席。' },
    { sp: 'GERU', text: 'ふ、よく見ているな。……あの席は、頁に一番いい影が落ちるんだ。活字を読むには、光より影が大事でな。……お前とは、こだわりの種類が違うだけだ。' },
  ], effects: ['mutual(HYU,GERU,1)', 'log(AMBIENT)'] }),
  A('DLG_F_JIN_LEN_RAMEN_V13', ['JIN', 'LENNY'], { cond: 'location == ramen', lines: [
    { sp: 'JIN', text: 'レニィ! ラーメンは伸びる前に食え! ほら、俺の替え玉、半分やるから!' },
    { sp: 'LENNY', text: 'ジンパチ、やさしいね……。あったかいスープで、ますます眠く……あ、食べる。ちゃんと食べるよ。ずずず。' },
  ], effects: ['mutual(JIN,LENNY,1)', 'log(AMBIENT)'] }),
  A('DLG_F_NEO_GER_BOOK_V13', ['NEO', 'GERU'], { cond: 'location == book', lines: [
    { sp: 'NEO', text: 'ゲルよ、この「武士道」なる書、異国の騎士道である。共に読み解いてみぬか。' },
    { sp: 'GERU', text: 'ほう、いい着眼だ。……騎士道と武士道、遠く離れた国で、同じ「誇り」に辿り着く。人の心は、面白いものだな。よし、付き合おう。' },
  ], effects: ['mutual(GERU,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_F_MUN_LEN_DAGASHI_V13', ['MUNI', 'LENNY'], { cond: 'location == dagashi', lines: [
    { sp: 'MUNI', text: 'レニィおにいちゃん、どれがおいしい? ムニ、まよっちゃう!' },
    { sp: 'LENNY', text: 'ぜんぶ美味しいよ。……迷ってる時間が、いちばん楽しいんだ。ゆっくり選ぼ。ぼく、待ってるから。……zzz。……あ、起きてるよ。' },
  ], effects: ['mutual(LENNY,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_F_HYU_JIN_CAKE_V13', ['HYU', 'JIN'], { cond: 'location == cake', lines: [
    { sp: 'JIN', text: 'ヒュウ、お前もケーキ食うのか! 甘いもん好きなんて意外だな!' },
    { sp: 'HYU', text: '美しいものは、目でも舌でも味わうものです。……ジンパチくん、あなたこそ「トレーニング後の糖質補給」と言い訳しながら、三個目でしょう。ふふ、お見通しですよ。' },
  ], effects: ['mutual(HYU,JIN,1)', 'log(AMBIENT)'] }),
  A('DLG_F_GER_NEO_GAME_V13', ['GERU', 'NEO'], { cond: 'location == game', lines: [
    { sp: 'NEO', text: 'ゲルよ、この対戦遊戯、貴様も挑むか。剣を交えるがごとし!' },
    { sp: 'GERU', text: '……私はレースゲームだ。静かに、確実に、コースを読む。お前の脳筋プレイとは相性が悪いな。ふ、だが、たまには童心に返るのも悪くない。' },
  ], effects: ['mutual(GERU,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_F_LEN_JIN_FLOWER_V13', ['LENNY', 'JIN'], { cond: 'location == flower', lines: [
    { sp: 'LENNY', text: 'ジンパチが花屋? めずらしいね。' },
    { sp: 'JIN', text: '……その、鍛錬の帰りに、ふと目に入ってな。ムニに一輪買ってやろうかと。……こういうの、柄じゃねえけど。悪いか!' },
    { sp: 'LENNY', text: 'ふふ、ジンパチ、やさしいね。ムニ、きっと喜ぶよ。' },
  ], effects: ['mutual(JIN,LENNY,1)', 'log(AMBIENT)'] }),
  A('DLG_F_HYU_MUN_SENTO_V13', ['HYU', 'MUNI'], { cond: 'location == sento', lines: [
    { sp: 'MUNI', text: 'ヒュウおにいちゃん、おふろでかずかぞえよ! いち、にー、さん……!' },
    { sp: 'HYU', text: 'ふふ、いいでしょう。ゆっくり百まで数えたら、湯上がりの私は、いっそう美しく仕上がっているはずです。……ムニ、のぼせないようにね。' },
  ], effects: ['mutual(HYU,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_F_GER_MUN_AQUA_V13', ['GERU', 'MUNI'], { cond: 'location == aquarium', lines: [
    { sp: 'MUNI', text: 'ゲルおねえちゃん、おさかな、ほんよんでるみたいにおよいでるね!' },
    { sp: 'GERU', text: 'ふ、詩人だな、お前は。……そうだな、魚たちは、水の中で毎日、違う物語を泳いでいる。私たちは、その頁を覗いているのかもしれん。' },
  ], effects: ['mutual(GERU,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_F_JIN_HYU_IZAKAYA_V13', ['JIN', 'HYU'], { cond: 'location == izakaya', lines: [
    { sp: 'JIN', text: 'ヒュウ! 今日は飲むぞ! ……って、お前カクテルばっかだな! たまには俺と生ビールいこうぜ!' },
    { sp: 'HYU', text: '私は色の美しい一杯を嗜むのです。……ですが、まあ、あなたに付き合って一杯だけ。乾杯くらいは、豪快にいきましょうか。ふふ。' },
  ], effects: ['mutual(HYU,JIN,1)', 'log(AMBIENT)'] }),
  A('DLG_F_LEN_NEO_TOYSHOP_V13', ['LENNY', 'NEO'], { cond: 'location == toyshop', lines: [
    { sp: 'NEO', text: 'レニィ、この剣の玩具……ぬ、別に欲しいわけではない。構造を観察しておるだけである。……悪くない造りだがな。' },
    { sp: 'LENNY', text: 'ネオ、目がキラキラしてるよ。……買ったらいいのに。騎士さまも、たまにはおもちゃで遊んでいいと思うんだ。えへへ。' },
  ], effects: ['mutual(LENNY,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_F_MUN_GER_KONBINI_V13', ['MUNI', 'GERU'], { cond: 'location == konbini', lines: [
    { sp: 'MUNI', text: 'ゲルおねえちゃん、よるにアイスたべるの、わるいこ?' },
    { sp: 'GERU', text: 'ふ、内緒でな。……夜のアイスは、大人だけが知る背徳の味だ。お前も、今日だけ大人にしてやろう。……誰にも言うなよ。' },
  ], effects: ['mutual(GERU,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_F_HYU_LEN_CINEMA_V13', ['HYU', 'LENNY'], { cond: 'location == cinema', lines: [
    { sp: 'HYU', text: 'レニィ、この映画、ラストが泣けるそうですよ。……あなた、起きていられますか?' },
    { sp: 'LENNY', text: 'がんばる……。でも、暗くてあったかいと、どうしても……zzz。……ヒュウ、感動シーンで起こしてね。えへへ。' },
  ], effects: ['mutual(HYU,LENNY,1)', 'log(AMBIENT)'] }),
  A('DLG_F_JIN_MUN_DONUT_V13', ['JIN', 'MUNI'], { cond: 'location == donut', lines: [
    { sp: 'MUNI', text: 'ジンパチおにいちゃん、ドーナツ、あなあいてるとこ、たべていい?' },
    { sp: 'JIN', text: 'あはは、穴は食えねえぞ! ……よし、じゃあ穴の分、俺のドーナツ半分やる! たくさん食って、でっかくなれ!' },
  ], effects: ['mutual(JIN,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_F_GER_HYU_CHURCH_V13', ['GERU', 'HYU'], { cond: 'location == church', lines: [
    { sp: 'HYU', text: 'ゲル、ステンドグラス越しのあなた、いつもより神秘的ですね。……聖堂は、人を少し謙虚にさせます。' },
    { sp: 'GERU', text: '……ああ。この静けさの中では、着飾った言葉も要らない。お前も、ここでは素の顔だな。……そういうお前も、悪くないぞ。' },
  ], effects: ['mutual(HYU,GERU,1)', 'log(AMBIENT)'] }),

  // ========================================================
  // 恋人どうしが施設に一緒にいるときの会話(rel == LOVER)
  // ========================================================
  A('DLG_LPAIR_RAMEN_V13', ['JIN', 'NEO'], { cond: 'location == ramen and rel(JIN, NEO) == LOVER', weight: 20, lines: [
    { sp: 'JIN', text: 'ネオ、恋人と食うラーメンは格別だな! ほら、俺のチャーシュー一枚やる! あーん!' },
    { sp: 'NEO', text: '……こ、公衆の面前で「あーん」とは。……ぬ、まあよい。恋人の施しである、ありがたく頂こう。……うむ、美味である。貴様の情けもな。' },
  ], effects: ['mutual(JIN,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_LPAIR_CAKE_V13', ['HYU', 'LENNY'], { cond: 'location == cake and rel(HYU, LENNY) == LOVER', weight: 20, lines: [
    { sp: 'HYU', text: 'レニィ、このケーキ、恋人どうし一つを分け合いましょう。……ほら、いちごはあなたに。恋人の特権です。' },
    { sp: 'LENNY', text: 'えへへ、ヒュウとはんぶんこ。……甘いね。ヒュウといると、世界ぜんぶが甘く見えるよぉ。' },
  ], effects: ['mutual(HYU,LENNY,1)', 'log(AMBIENT)'] }),
  A('DLG_LPAIR_IZAKAYA_V13', ['GERU', 'NEO'], { cond: 'location == izakaya and rel(GERU, NEO) == LOVER', weight: 20, lines: [
    { sp: 'GERU', text: 'ネオ、閉店間際のこの静けさで、恋人と杯を交わす。……これ以上の贅沢は、物語の中にもなかなか無い。' },
    { sp: 'NEO', text: 'うむ。……無言で酌み交わせる相手が恋人となる。これぞ、我が旅の終着点かもしれぬな。ゲル、貴様と出会えて、我は幸福である。' },
  ], effects: ['mutual(GERU,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_LPAIR_CINEMA_V13', ['LENNY', 'NEO'], { cond: 'location == cinema and rel(LENNY, NEO) == LOVER', weight: 20, lines: [
    { sp: 'NEO', text: 'レニィ、暗闇ゆえ、そっと手を握ってもよいか。……恋人どうしの、内緒の作法である。' },
    { sp: 'LENNY', text: 'うん……ネオの手、あったかい。……このまま、映画より先に、夢の中でネオと会えそうだよぉ。えへへ。' },
  ], effects: ['mutual(LENNY,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_LPAIR_KARAOKE_V13', ['HYU', 'JIN'], { cond: 'location == karaoke and rel(HYU, JIN) == LOVER', weight: 20, lines: [
    { sp: 'JIN', text: 'ヒュウ! 恋人になったんだ、ラブソングでデュエットしようぜ! ……は、恥ずかしいけど!' },
    { sp: 'HYU', text: 'ふふ、いいでしょう。あなたの熱い声と、私の美声のデュエット。……この一曲、私たちの思い出のテーマにしましょうか。' },
  ], effects: ['mutual(HYU,JIN,1)', 'log(AMBIENT)'] }),
  A('DLG_LPAIR_AQUA_V13', ['GERU', 'HYU'], { cond: 'location == aquarium and rel(GERU, HYU) == LOVER', weight: 20, lines: [
    { sp: 'HYU', text: 'ゲル、青い水槽の光に照らされたあなた……幻想的で、思わず見惚れてしまいます。恋人の欲目でしょうか。' },
    { sp: 'GERU', text: '……欲目で結構だ。私も、この光の中のお前を、綺麗だと思っている。……ふ、水族館は、恋人を口説くには、卑怯なくらい雰囲気がいいな。' },
  ], effects: ['mutual(GERU,HYU,1)', 'log(AMBIENT)'] }),
  A('DLG_LPAIR_DONUT_V13', ['JIN', 'LENNY'], { cond: 'location == donut and rel(JIN, LENNY) == LOVER', weight: 20, lines: [
    { sp: 'JIN', text: 'レニィ、恋人どうしお揃いのドーナツな! チョコがけ二つ! ……へへ、こういうの、憧れだったんだ。' },
    { sp: 'LENNY', text: 'えへへ、ジンパチとお揃い。……幸せの味だね。あ、ジンパチ、口に砂糖ついてる。……とってあげる。' },
  ], effects: ['mutual(JIN,LENNY,1)', 'log(AMBIENT)'] }),
  A('DLG_LPAIR_CHURCH_V13', ['HYU', 'NEO'], { cond: 'location == church and rel(HYU, NEO) == LOVER', weight: 20, lines: [
    { sp: 'NEO', text: 'ヒュウよ、この聖堂で、我が愛を改めて誓おう。騎士の愛は、神の前でこそ意味を持つ。' },
    { sp: 'HYU', text: '……ネオさん、あなたという人は。ステンドグラスの光の下で愛を誓うなんて、これ以上ないほど美しい演出です。ええ、私も、あなたに誓いましょう。' },
  ], effects: ['mutual(HYU,NEO,1)', 'log(AMBIENT)'] }),

  // ========================================================
  // 親しい友人(恋人でない)が施設に一緒にいるときの会話
  //   (mutual >= 55 and rel != LOVER)
  // ========================================================
  A('DLG_FPAIR_RAMEN_V13', ['JIN', 'GERU'], { cond: 'location == ramen and mutual(JIN, GERU) >= 55 and rel(JIN, GERU) != LOVER', weight: 18, lines: [
    { sp: 'JIN', text: 'ゲル、親友どうしラーメンすするのもいいもんだな! 替え玉勝負すっか!' },
    { sp: 'GERU', text: '……勝負ではないが、付き合ってやる。だが私は一杯で満足だ。お前の胃袋と競う気はない。……ふ、まあ、こういう時間も悪くないな、親友。' },
  ], effects: ['mutual(JIN,GERU,1)', 'log(AMBIENT)'] }),
  A('DLG_FPAIR_CAFE_V13', ['HYU', 'NEO'], { cond: 'location == cafe and mutual(HYU, NEO) >= 55 and rel(HYU, NEO) != LOVER', weight: 18, lines: [
    { sp: 'HYU', text: 'ネオさん、友として珈琲を一杯。恋敵ではなく、美を語り合う仲、というのは、案外心地よいものですね。' },
    { sp: 'NEO', text: 'うむ! 貴様とは、恋には落ちぬが、美という戦場で切磋琢磨する好敵手にして親友。この関係、我は気に入っておる。' },
  ], effects: ['mutual(HYU,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_FPAIR_BOOK_V13', ['GERU', 'LENNY'], { cond: 'location == book and mutual(GERU, LENNY) >= 55 and rel(GERU, LENNY) != LOVER', weight: 18, lines: [
    { sp: 'GERU', text: 'レニィ、親友のお前に一冊選んでやろう。……最後まで読めなくても構わん。栞を挟んだところまでが、お前の物語だ。' },
    { sp: 'LENNY', text: 'ありがとう、ゲル。……ゲルが選んでくれる本は、いつも、ぼくにちょうどいいんだ。親友って、そういうの分かってくれるんだね。' },
  ], effects: ['mutual(GERU,LENNY,1)', 'log(AMBIENT)'] }),
  A('DLG_FPAIR_SENTO_V13', ['JIN', 'LENNY'], { cond: 'location == sento and mutual(JIN, LENNY) >= 55 and rel(JIN, LENNY) != LOVER', weight: 18, lines: [
    { sp: 'JIN', text: 'レニィ、湯船で寝るなって! ……ったく、親友として見張っててやるから、安心して……いや、寝るなよ!' },
    { sp: 'LENNY', text: 'んー、ジンパチがいると、安心して寝られるんだ……。親友の特権だね。 zzz。……冗談だよ、ちゃんと起きてる。' },
  ], effects: ['mutual(JIN,LENNY,1)', 'log(AMBIENT)'] }),
  A('DLG_FPAIR_GAME_V13', ['HYU', 'JIN'], { cond: 'location == game and mutual(HYU, JIN) >= 55 and rel(HYU, JIN) != LOVER', weight: 18, lines: [
    { sp: 'JIN', text: 'ヒュウ! 音ゲー対決だ! 親友として、手加減はしねえぞ!' },
    { sp: 'HYU', text: '望むところです。私の優雅な指先の前に、ひれ伏しなさい。……ふふ、こうしてあなたと張り合うのも、友情ですね。負けませんよ。' },
  ], effects: ['mutual(HYU,JIN,1)', 'log(AMBIENT)'] }),
  A('DLG_FPAIR_AQUA_V13', ['LENNY', 'NEO'], { cond: 'location == aquarium and mutual(LENNY, NEO) >= 55 and rel(LENNY, NEO) != LOVER', weight: 18, lines: [
    { sp: 'LENNY', text: 'ネオ、あの深海魚、ひとりぼっちでも光ってるね。……でも、ネオはもう、ひとりじゃないよ。ぼくたち、親友だもん。' },
    { sp: 'NEO', text: '……レニィ。貴様の言葉は、時に剣より深く胸を貫く。うむ、我は独りではない。良き友がおる。……感謝する。' },
  ], effects: ['mutual(LENNY,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_FPAIR_DONUT_V13', ['GERU', 'HYU'], { cond: 'location == donut and mutual(GERU, HYU) >= 55 and rel(GERU, HYU) != LOVER', weight: 18, lines: [
    { sp: 'HYU', text: 'ゲル、友人としてドーナツを半分こ。……甘いものを分け合える友は、貴重ですよ。恋人でなくとも、ね。' },
    { sp: 'GERU', text: 'ふ、違いない。……お前とは、恋にはならんが、こうして甘いものをつまみながら本の話ができる。それで十分だ。良い友だよ、お前は。' },
  ], effects: ['mutual(GERU,HYU,1)', 'log(AMBIENT)'] }),
  A('DLG_FPAIR_KARAOKE_V13', ['GERU', 'NEO'], { cond: 'location == karaoke and mutual(GERU, NEO) >= 55 and rel(GERU, NEO) != LOVER', weight: 18, lines: [
    { sp: 'NEO', text: 'ゲルよ、親友のよしみだ。我が吟遊の歌に、貴様の低音を重ねてくれぬか。デュエットである。' },
    { sp: 'GERU', text: '……柄ではないが。まあ、お前とならいいだろう。恋人でなくとも、声を合わせるのは、悪くない。キーは私に合わせろよ、騎士殿。' },
  ], effects: ['mutual(GERU,NEO,1)', 'log(AMBIENT)'] }),

  // ========================================================
  // 親密度が高いと互いの部屋に遊びに来る(location == HOME_<host>)
  // ========================================================
  A('DLG_VISIT_LENNY_GERU_V13', ['LENNY', 'GERU'], { cond: 'location == HOME_LENNY and mutual(LENNY, GERU) >= 50', weight: 18, lines: [
    { sp: 'GERU', text: 'お邪魔する。……レニィ、相変わらず散らかった部屋だな。だが、この雑然とした感じ、不思議と落ち着く。' },
    { sp: 'LENNY', text: 'えへへ、ゲル、いらっしゃい。……ぼくのベッド、貸してあげる。ゲルが本読んでる横で、ぼく寝てるね。' },
    { sp: 'GERU', text: 'ふ、いつも通りだな。……いいだろう、静かに読ませてもらう。お前の寝息を、頁をめくる音の伴奏にしてな。' },
  ], effects: ['mutual(LENNY,GERU,1)', 'log(AMBIENT)'] }),
  A('DLG_VISIT_HYU_JIN_V13', ['HYU', 'JIN'], { cond: 'location == HOME_HYU and mutual(HYU, JIN) >= 50', weight: 18, lines: [
    { sp: 'JIN', text: 'お邪魔するぜヒュウ! ……うおっ、鏡だらけだな! どこ見ても自分がいるじゃねえか!' },
    { sp: 'HYU', text: 'ふふ、美を追求する者の部屋ですからね。……ジンパチくん、その鏡に映ったあなたも、なかなか悪くありませんよ。姿勢がいい。' },
    { sp: 'JIN', text: 'そ、そうか? へへ、お前に褒められると悪い気しねえな!' },
  ], effects: ['mutual(HYU,JIN,1)', 'log(AMBIENT)'] }),
  A('DLG_VISIT_JIN_NEO_V13', ['JIN', 'NEO'], { cond: 'location == HOME_JIN and mutual(JIN, NEO) >= 50', weight: 18, lines: [
    { sp: 'NEO', text: '邪魔をする、ジンパチ。……ほう、見事なプラモデルの数々。これは貴様の誇りの陳列棚であるな。' },
    { sp: 'JIN', text: 'おう! 一体ずつ、俺の魂こめて組んだんだ! ……ネオ、お前になら、自慢のコレクション見せてやるよ! こっち来い!' },
    { sp: 'NEO', text: 'ふはは、光栄である! ……この騎士のプラモ、なかなかの造形だ。貸してくれぬか。じっくり眺めたい。' },
  ], effects: ['mutual(JIN,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_VISIT_GERU_HYU_V13', ['GERU', 'HYU'], { cond: 'location == HOME_GERU and mutual(GERU, HYU) >= 50', weight: 18, lines: [
    { sp: 'HYU', text: 'お邪魔します、ゲル。……ふふ、壁一面の本棚。まるで小さな図書館ですね。あなたらしい、美しい部屋です。' },
    { sp: 'GERU', text: '……美しい、か。お前にそう言われると、悪くないな。適当に座れ。麦茶でも淹れよう。……本は、勝手に読んでいいぞ。栞のあるやつ以外な。' },
  ], effects: ['mutual(GERU,HYU,1)', 'log(AMBIENT)'] }),
  A('DLG_VISIT_MUNI_LENNY_V13', ['MUNI', 'LENNY'], { cond: 'location == HOME_MUNI and mutual(MUNI, LENNY) >= 50', weight: 18, lines: [
    { sp: 'MUNI', text: 'レニィおにいちゃん、ムニのおへや、きてくれたの! うれしいの! いっしょにおひるねしよ!' },
    { sp: 'LENNY', text: 'おじゃまします。……ムニの部屋、おもちゃがいっぱいだね。あったかい。……うん、いっしょにお昼寝しよっか。せーの。……zzz' },
  ], effects: ['mutual(LENNY,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_VISIT_NEO_GERU_V13', ['NEO', 'GERU'], { cond: 'location == HOME_NEO and mutual(NEO, GERU) >= 50', weight: 18, lines: [
    { sp: 'GERU', text: '邪魔する、ネオ。……ほう、剣に鎧に、騎士物語の書物。まるで異国の城の一室だな。趣味がいい。' },
    { sp: 'NEO', text: 'ふはは、よく来た、ゲル! 我が居城へようこそである! ……この故郷から持ってきた古書、貴様なら読めるであろう。共に紐解いてみぬか。' },
  ], effects: ['mutual(GERU,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_VISIT_LENNY_HYU_V13', ['LENNY', 'HYU'], { cond: 'location == HOME_LENNY and mutual(LENNY, HYU) >= 50', weight: 18, lines: [
    { sp: 'HYU', text: 'お邪魔しますよ、レニィ。……あら、雲みたいなベッドですね。あなたがいつも眠そうなのも、頷けます。' },
    { sp: 'LENNY', text: 'えへへ、ヒュウ、いらっしゃい。……この雲ベッド、ヒュウも寝てみる? ふわふわで、絶対気持ちいいよ。' },
    { sp: 'HYU', text: '……少しだけ。前髪が乱れない程度に。……ふ、なるほど。これは、危険な寝心地ですね。' },
  ], effects: ['mutual(HYU,LENNY,1)', 'log(AMBIENT)'] }),
  A('DLG_VISIT_JIN_MUNI_V13', ['JIN', 'MUNI'], { cond: 'location == HOME_JIN and mutual(JIN, MUNI) >= 50', weight: 18, lines: [
    { sp: 'MUNI', text: 'ジンパチおにいちゃんのおへや、プラモいっぱい! ムニ、さわっていい?' },
    { sp: 'JIN', text: 'こら、そーっとだぞ! ……よし、この頑丈なやつなら、触っていい。ムニ、大きくなったら一緒に組もうな! 弟子入り、許可する!' },
    { sp: 'MUNI', text: 'やった! ムニ、ジンパチおにいちゃんのおでしなの!' },
  ], effects: ['mutual(JIN,MUNI,1)', 'log(AMBIENT)'] }),

  // ========================================================
  // カラオケの複数人デュエット/合唱をさらに増量
  // ========================================================
  A('DLG_KARA_TRIO_V13', ['GERU', 'HYU', 'LENNY'], { cond: 'location == karaoke', weight: 22, lines: [
    { sp: 'HYU', text: '三人でハーモニーといきましょう。私が主旋律、ゲルが低音、レニィは……。' },
    { sp: 'GERU', text: 'レニィは寝ているな。……仕方ない、寝息もコーラスに数えてやろう。ふ、これはこれで、味のある三重唱だ。' },
    { sp: 'LENNY', text: 'んー……ちゃんと歌うよぉ……。サビだけ、いっしょに……♪ zzz' },
  ], effects: ['mutual(GERU,HYU,1)', 'mutual(HYU,LENNY,1)', 'log(AMBIENT)'] }),
  A('DLG_KARA_DUET_JIN_NEO_V13', ['JIN', 'NEO'], { cond: 'location == karaoke', weight: 18, lines: [
    { sp: 'JIN', text: 'ネオ! 男二人で魂のデュエットだ! アニソンの熱いやつ、いくぞ!' },
    { sp: 'NEO', text: 'ふはは、我が吟遊の血が騒ぐ! 貴様の熱唱と我が美声、この店を震わせようぞ! ……いざ、大熱唱である!' },
  ], effects: ['mutual(JIN,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_KARA_DUET_HYU_MUNI_V13', ['HYU', 'MUNI'], { cond: 'location == karaoke', weight: 18, lines: [
    { sp: 'MUNI', text: 'ヒュウおにいちゃん、アニメのうた、いっしょにうたお!' },
    { sp: 'HYU', text: 'ふふ、いいでしょう。ムニ、あなたが元気に、私が優雅に。……凸凹デュエットですが、これはこれで、愛らしいステージですね。' },
  ], effects: ['mutual(HYU,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_KARA_QUINTET_V13', ['LENNY', 'HYU', 'JIN', 'GERU', 'NEO'], { cond: 'location == karaoke', weight: 28, lines: [
    { sp: 'JIN', text: '五人揃ったなら大合唱だ! みんなで肩組んでいくぞ! せーの!' },
    { sp: 'NEO', text: '我が美声、この五重奏の要である! ……ぬ、ジンパチ、貴様、音程が外れておるぞ!' },
    { sp: 'HYU', text: '二人とも声が大きすぎます。……まあ、今日は特別。私の美声で、全体を包んであげましょう。' },
    { sp: 'GERU', text: 'やれやれ、賑やかなことだ。……だが、こういう夜も、悪くない。ほら、レニィ、お前もサビだけは歌え。' },
    { sp: 'LENNY', text: 'んー……みんなの声、あったかい……♪ このまま、いい夢見られそうだよぉ。……あ、歌う、歌うよ!' },
  ], effects: ['mutual(HYU,JIN,1)', 'mutual(GERU,NEO,1)', 'mutual(LENNY,HYU,1)', 'log(AMBIENT)'] }),
];
