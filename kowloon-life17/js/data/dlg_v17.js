// ============================================================
// v17 追加会話
//   ・屋上の猫/鳥・地上の犬に対する主要人物6人の会話
//   ・集会所イベント(誕生日/クリスマス等)の会話を大幅増
//   ・主要人物6人どうしの会話をさらに大幅増(施設/恋人/友人/時間季節天気)
// ============================================================
const T = (id, owner, node) => ({ id, owner, type: node.type ?? 'TALK', pool: node.pool ?? 'GENERIC', ...node });
const A = (id, cast, node) => ({ id, type: 'AMBIENT', pool: 'AMBIENT', owner: [...cast].sort().join('-'), cast, ...node });
const ALLMAIN = ['LENNY', 'HYU', 'JIN', 'GERU', 'MUNI', 'NEO'];
const ALLMAIN_K = ['LENNY', 'HYU', 'JIN', 'GERU', 'MUNI', 'NEO', 'KANE'];
const DAY = 'time in [MORNING, DAY, EVENING]';

export const DLG_V17 = [
  // ========================================================
  // 屋上の猫・鳥に対する主要人物の会話(昼のみ・猫鳥がいる)
  // ========================================================
  T('DLG_ROOF_CAT_LENNY', 'LENNY', { pool: 'FAC', weight: 20, cond: `location == ROOF and ${DAY}`, lines: [{ sp: 'LENNY', text: 'あ、猫だ……。屋上に遊びに来たんだね。……となりで丸くなってお昼寝しよ。猫って、眠りの先輩だからね。ふぁ……zzz' }], effects: ['aff(LENNY,1)'] }),
  T('DLG_ROOF_BIRD_NEO', 'NEO', { pool: 'FAC', weight: 20, cond: `location == ROOF and ${DAY}`, lines: [{ sp: 'NEO', text: '小鳥が一羽。……ほう、我が肩に止まるか。ふ、鳥に気に入られるとは、騎士の徳の証。……達者でな、小さき友よ。' }], effects: ['aff(NEO,1)'] }),
  T('DLG_ROOF_CAT_HYU', 'HYU', { pool: 'FAC', weight: 20, cond: `location == ROOF and ${DAY}`, lines: [{ sp: 'HYU', text: '三毛猫……その毛並みの艶、なかなかのものですね。美を解する者どうし、気が合いそうです。……ほら、こちらへ。撫でてあげましょう。' }], effects: ['aff(HYU,1)'] }),
  T('DLG_ROOF_BIRD_MUNI', 'MUNI', { pool: 'FAC', weight: 20, cond: `location == ROOF and ${DAY}`, lines: [{ sp: 'MUNI', text: 'ことりさん! ちゅんちゅんっていってる! ……ムニのおはなし、わかるかな? こんにちは、なの!' }], effects: ['aff(MUNI,1)'] }),
  T('DLG_ROOF_CAT_GERU', 'GERU', { pool: 'FAC', weight: 20, cond: `location == ROOF and ${DAY}`, lines: [{ sp: 'GERU', text: '猫か。……気ままで、誰にも媚びず、好きな時に去る。……ふ、私は嫌いじゃない。似た者どうし、静かに日向ぼっこといこう。' }], effects: ['aff(GERU,1)'] }),
  T('DLG_ROOF_BIRD_JIN', 'JIN', { pool: 'FAC', weight: 20, cond: `location == ROOF and ${DAY}`, lines: [{ sp: 'JIN', text: 'お、鳥だ! 自由に空飛べていいよなあ! ……よし、俺も見習って屋上ダッシュだ! 鳥に負けねえ躍動感でな!' }], effects: ['aff(JIN,1)'] }),
  A('DLG_ROOF_ANIMAL_LEN_MUN', ['LENNY', 'MUNI'], { weight: 22, cond: `location == ROOF and ${DAY}`, lines: [
    { sp: 'MUNI', text: 'レニィおにいちゃん! ねこさんと、ことりさんがきてる! みてみて!' },
    { sp: 'LENNY', text: 'ほんとだ……。猫はお昼寝仲間、鳥はお目覚め係だね。……屋上、にぎやかになったなあ。ふふ。' },
    { sp: 'MUNI', text: 'えへへ、みんなでおひるねしよ! ねこさんも、ムニも、レニィおにいちゃんも!' },
  ], effects: ['mutual(LENNY,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_ROOF_ANIMAL_NEO_GER', ['NEO', 'GERU'], { weight: 22, cond: `location == ROOF and ${DAY}`, lines: [
    { sp: 'NEO', text: 'ゲルよ、あの猫と鳥、屋上の主のように寛いでおるな。……我らより先に、ここの平和を味わっておるわ。' },
    { sp: 'GERU', text: 'ふ、動物は正直だ。居心地のいい場所を、ちゃんと知っている。……この屋上が、それだけ穏やかだという証拠だな。悪くない。' },
  ], effects: ['mutual(GERU,NEO,1)', 'log(AMBIENT)'] }),

  // ========================================================
  // 地上(一階の外)の犬に対する主要人物の会話
  // ========================================================
  T('DLG_GROUND_DOG_JIN', 'JIN', { pool: 'FAC', weight: 20, cond: `location == GROUND and ${DAY}`, lines: [{ sp: 'JIN', text: '犬が来てるな! よーし、一緒に走るか! ……お、ついてくる! いい相棒じゃねえか! おら、こっちだ、ワンコ!' }], effects: ['aff(JIN,1)'] }),
  T('DLG_GROUND_DOG_MUNI', 'MUNI', { pool: 'FAC', weight: 20, cond: `location == GROUND and ${DAY}`, lines: [{ sp: 'MUNI', text: 'わんちゃん! おおきい! ……こわくないよ。ムニ、なかよくなりたいの。おて、できる? えへへ!' }], effects: ['aff(MUNI,1)'] }),
  T('DLG_GROUND_DOG_LENNY', 'LENNY', { pool: 'FAC', weight: 20, cond: `location == GROUND and ${DAY}`, lines: [{ sp: 'LENNY', text: '犬だ……。しっぽ振ってる。うれしいのかな。……ぼくのこと、お昼寝の邪魔しないでくれる優しい子だといいな。よしよし。' }], effects: ['aff(LENNY,1)'] }),
  T('DLG_GROUND_DOG_HYU', 'HYU', { pool: 'FAC', weight: 20, cond: `location == GROUND and ${DAY}`, lines: [{ sp: 'HYU', text: '犬ですか。……無邪気にじゃれてきますね。服が汚れるのは困りますが……ふ、この純粋な瞳には、勝てません。少しだけ、撫でてあげましょう。' }], effects: ['aff(HYU,1)'] }),
  T('DLG_GROUND_DOG_NEO', 'NEO', { pool: 'FAC', weight: 20, cond: `location == GROUND and ${DAY}`, lines: [{ sp: 'NEO', text: '忠犬か! ……騎士は犬を友とする。忠義に厚き獣よ。ふはは、我の足元を守るように寄り添うか。よき従者である!' }], effects: ['aff(NEO,1)'] }),
  T('DLG_GROUND_DOG_GERU', 'GERU', { pool: 'FAC', weight: 20, cond: `location == GROUND and ${DAY}`, lines: [{ sp: 'GERU', text: '犬は、感情を隠さないな。……嬉しければ尾を振り、寂しければ鳴く。……その素直さ、少し羨ましい。ほら、おいで。撫でてやる。' }], effects: ['aff(GERU,1)'] }),
  A('DLG_GROUND_DOG_JIN_MUN', ['JIN', 'MUNI'], { weight: 22, cond: `location == GROUND and ${DAY}`, lines: [
    { sp: 'MUNI', text: 'ジンパチおにいちゃん! わんちゃんとあそぼ! ボールなげて!' },
    { sp: 'JIN', text: 'よーし任せろ! ……そーれ! ……お、ちゃんと取ってきた! 賢い犬だな! ムニ、次はお前が投げてみろ!' },
    { sp: 'MUNI', text: 'うん! ……えいっ! わんちゃん、はやーい!' },
  ], effects: ['mutual(JIN,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_GROUND_DOG_NEO_LEN', ['NEO', 'LENNY'], { weight: 22, cond: `location == GROUND and ${DAY}`, lines: [
    { sp: 'NEO', text: 'レニィ、この犬、貴様の足元で丸くなっておるぞ。……気を許した相手にしか、腹は見せぬものだ。好かれておるな。' },
    { sp: 'LENNY', text: 'えへへ、そうかな。……犬も猫も、ぼくのそばだと安心して寝ちゃうんだ。……ぼく、動物の子守唄係なのかもね。' },
  ], effects: ['mutual(LENNY,NEO,1)', 'log(AMBIENT)'] }),

  // ========================================================
  // 集会所イベントの会話を大幅増(バリエーション追加)
  // ========================================================
  // クリスマス(別バージョン3)
  A('DLG_EV_CHRISTMAS_V17', ALLMAIN, { cond: 'event_active(CHRISTMAS) and location == hall', weight: 27, lines: [
    { sp: 'MUNI', text: 'ケーキ! おっきいケーキ! サンタさんのぶんも、のこしておくの!' },
    { sp: 'HYU', text: 'ふふ、ムニは優しいですね。……さ、今夜は聖夜。私が一番美しく着飾って、この宴に華を添えましょう。' },
    { sp: 'LENNY', text: '暖炉の火みたいに、みんなの笑顔があったかいね。……こういう夜が、ずっと続くといいなあ。' },
    { sp: 'JIN', text: 'チキン焼けたぞー! 骨付きモモ肉、こんがりだ! さあ、聖なる肉祭りの始まりだぜ!' },
    { sp: 'GERU', text: '一年でこの夜だけは、皆が誰かの幸せを願う。……悪くない習慣だ。メリークリスマス、みんな。' },
    { sp: 'NEO', text: '聖夜に、皆で食卓を囲む。……我が故郷にも似た祝祭があった。この街は、我が第二の故郷である。感謝する。' },
  ], effects: ['mutual(HYU,MUNI,1)', 'mutual(LENNY,JIN,1)', 'mutual(GERU,NEO,1)', 'log(AMBIENT)'] }),
  // 正月(別バージョン2)
  A('DLG_EV_NEWYEAR_V17', ALLMAIN, { cond: 'event_active(NEWYEAR) and location == hall', weight: 27, lines: [
    { sp: 'MUNI', text: 'あけましておめでとーなの! ムニ、おとしだま、たのしみー!' },
    { sp: 'JIN', text: 'あけおめ! 今年も鍛錬に燃えるぜ! ……初詣で「筋肉増強」祈願だ! 神頼みも鍛錬のうちだ!' },
    { sp: 'HYU', text: '新年、明けましておめでとうございます。今年も、私の美しさで、この街を照らしてまいりましょう。' },
    { sp: 'GERU', text: '雑煮の餅は、いくつ食べた? ……私は三つだ。今年も、静かに本を積んでいく所存だ。あけおめ。' },
    { sp: 'LENNY', text: '初夢、見たよ。……みんなと、猫と犬と、屋上でお昼寝してる夢。すごく幸せだった。今年もよろしくね。' },
    { sp: 'NEO', text: '新たな年の幕開けである! 我が剣に懸けて、今年もこの街と皆を守り抜こう! 新年の誓いなり!' },
  ], effects: ['mutual(JIN,HYU,1)', 'mutual(GERU,LENNY,1)', 'log(AMBIENT)'] }),
  // お花見(別バージョン2)
  A('DLG_EV_HANAMI_V17', ALLMAIN, { cond: 'event_active(HANAMI) and location == hall', weight: 27, lines: [
    { sp: 'JIN', text: '花見だ! 場所取りは俺に任せろ! 一番いい桜の下、確保しといたぜ!' },
    { sp: 'MUNI', text: 'はなびら、おべんとうにはいっちゃった! ……でも、いいにおいだからおいしそうなの!' },
    { sp: 'GERU', text: '花の下で読む本は、格別だ。……散る花びらが栞になる。今日だけの、贅沢な一冊だな。' },
    { sp: 'HYU', text: '桜と私、どちらが美しいか。……今日は引き分けにしておきましょう。花に恥をかかせるのは、無粋ですから。' },
    { sp: 'LENNY', text: '桜の花びらの布団で、お昼寝……。あ、想像しただけで眠く……zzz。' },
    { sp: 'NEO', text: '花の宴、良きかな。……散りゆく花の潔さ、騎士の散り際に通ず。だが今は、ただ、この春を愛でよう。' },
  ], effects: ['mutual(JIN,MUNI,1)', 'mutual(GERU,HYU,1)', 'log(AMBIENT)'] }),
  // 誕生日会(ムニ・別バージョン2)
  A('DLG_BD_MUNI_V17', ALLMAIN, { cond: 'event_active(BIRTHDAY_MUNI) and location == hall', weight: 30, lines: [
    { sp: 'MUNI', text: 'ムニ、おたんじょうび! ……ことしは、ねこさんとわんちゃんもおいわいにきてくれたの!' },
    { sp: 'LENNY', text: 'おめでとう、ムニ。……ほら、猫も屋上から降りてきたよ。ムニのこと、お祝いしたいんだって。' },
    { sp: 'JIN', text: 'ムニ、誕生日おめでとう! 今年も背比べだ! ……お、また伸びてる! でっかくなったなあ!' },
    { sp: 'GERU', text: 'おめでとう、ムニ。……一年で、ずいぶんお姉さん、お兄さんらしくなった。ちゃんと見ているぞ。' },
    { sp: 'HYU', text: 'おめでとう、ムニ。今日の主役に、私の一番美しいリボンを。……ふふ、よく似合っています。' },
    { sp: 'NEO', text: '見習い騎士の生誕を祝う! ムニ、また一つ大人に近づいたな。誇らしいぞ! さあ、ろうそくを吹き消せ!' },
  ], effects: ['mutual(LENNY,MUNI,1)', 'mutual(JIN,MUNI,1)', 'mutual(HYU,MUNI,1)', 'log(AMBIENT)'] }),
  // 誕生日会(ネオ・別バージョン2)
  A('DLG_BD_NEO_V17', ALLMAIN, { cond: 'event_active(BIRTHDAY_NEO) and location == hall', weight: 30, lines: [
    { sp: 'NEO', text: '……皆が我の生誕を祝ってくれる。故郷を捨てた身に、これほどの温もりが。……幸せである。心から。' },
    { sp: 'MUNI', text: 'きしさま、おめでとーなの! ムニ、きょうはいっぱいけんのおはなし、きくの!' },
    { sp: 'JIN', text: 'ネオ、誕生日おめでとう! お前は最高の戦友だ! 今年も背中預け合って、突き進もうぜ!' },
    { sp: 'GERU', text: '誕生日おめでとう。……お前の故郷の話は、私の一番の楽しみだ。今年も、たくさん聞かせてくれ。' },
    { sp: 'HYU', text: 'おめでとう、ネオさん。あなたの金髪、今年も誇り高く。好敵手の一年に、乾杯を。' },
    { sp: 'LENNY', text: 'おめでとう、ネオ。……この街が、ネオの本当の故郷になれてたら、うれしいな。ずっといてね。' },
  ], effects: ['mutual(MUNI,NEO,1)', 'mutual(JIN,NEO,1)', 'mutual(GERU,NEO,1)', 'log(AMBIENT)'] }),

  // ========================================================
  // 主要人物6人どうしの会話をさらに大幅増(施設・通常)
  // ========================================================
  A('DLG_F_NEO_HYU_CAFE_V17', ['NEO', 'HYU'], { cond: 'location == cafe', lines: [
    { sp: 'NEO', text: 'ヒュウよ、この店の紅茶、琥珀色が美しいな。……貴様の好みそうな一杯である。' },
    { sp: 'HYU', text: 'あら、私の好みを覚えていたのですか。……ふふ、美を解する者どうし、通じ合うものがありますね。ご一緒しましょう。' },
  ], effects: ['mutual(HYU,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_F_LEN_MUN_RAMEN_V17', ['LENNY', 'MUNI'], { cond: 'location == ramen', lines: [
    { sp: 'MUNI', text: 'レニィおにいちゃん、ラーメンのたまご、はんぶんこ!' },
    { sp: 'LENNY', text: 'いいよ。……はい、ムニに大きいほう。ぼくは小さいほうでいいんだ。……あ、でも、寝ないうちに食べなきゃね。ずずず。' },
  ], effects: ['mutual(LENNY,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_F_JIN_HYU_BOOK_V17', ['JIN', 'HYU'], { cond: 'location == book', lines: [
    { sp: 'JIN', text: 'ヒュウ、お前が本屋? 意外だな! 何読むんだ?' },
    { sp: 'HYU', text: '写真集ですよ。……美しいものを見る目を養うのです。あなたも一冊いかが? 筋肉の付け方の本より、役立つかもしれませんよ。ふふ。' },
  ], effects: ['mutual(HYU,JIN,1)', 'log(AMBIENT)'] }),
  A('DLG_F_GER_NEO_CAKE_V17', ['GERU', 'NEO'], { cond: 'location == cake', lines: [
    { sp: 'NEO', text: 'ゲルよ、この白きショートケーキ、騎士の甲冑の輝きのごとし。……貴様も一つどうだ。' },
    { sp: 'GERU', text: 'ふ、お前は何でも騎士に例えるな。……だが、悪くない。私はモンブランにしよう。読書のお供に、ちょうどいい甘さだ。' },
  ], effects: ['mutual(GERU,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_F_MUN_JIN_GAME_V17', ['MUNI', 'JIN'], { cond: 'location == game', lines: [
    { sp: 'MUNI', text: 'ジンパチおにいちゃん、パンチマシン、ムニもやりたい!' },
    { sp: 'JIN', text: 'よーし、ムニ! 全力でパンチだ! ……お、いいパンチだ! 才能あるぞ! ……いてて、俺の記録は抜かせねえけどな!' },
  ], effects: ['mutual(JIN,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_F_HYU_GER_FLOWER_V17', ['HYU', 'GERU'], { cond: 'location == flower', lines: [
    { sp: 'HYU', text: 'ゲル、あなたは押し花、私は生花。……同じ花を愛でても、飾り方は正反対ですね。' },
    { sp: 'GERU', text: 'ふ、だが根は同じだ。美しい一瞬を、手元に留めたい。……お前は咲かせて、私は残す。悪くない対比だな。' },
  ], effects: ['mutual(HYU,GERU,1)', 'log(AMBIENT)'] }),
  A('DLG_F_LEN_NEO_AQUA_V17', ['LENNY', 'NEO'], { cond: 'location == aquarium', lines: [
    { sp: 'LENNY', text: 'ネオ、クラゲって脳がないのに、あんなにきれいに生きてるんだよ。……すごいと思わない?' },
    { sp: 'NEO', text: '……うむ。考えずとも、あるがままに漂い、光を放つ。……我ら騎士には、真似できぬ境地よ。深いな、レニィ。' },
  ], effects: ['mutual(LENNY,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_F_JIN_GER_YAKINIKU_V17', ['JIN', 'GERU'], { cond: 'location == yakiniku', lines: [
    { sp: 'JIN', text: 'ゲル、お前ホルモン派なんだってな! 意外! よーし、今日は俺が焼きまくるぜ!' },
    { sp: 'GERU', text: 'ふ、人を見かけで判断するなと言っただろう。……お前の焼き加減、悪くない。黙って焼いていろ。私は、食う専門だ。' },
  ], effects: ['mutual(JIN,GERU,1)', 'log(AMBIENT)'] }),

  // 恋人どうし(施設・別)
  A('DLG_LPAIR_CAFE_V17', ['GERU', 'NEO'], { cond: 'location == cafe and rel(GERU, NEO) == LOVER', weight: 20, lines: [
    { sp: 'NEO', text: 'ゲルよ、恋人と飲む珈琲は、いつもより深き味わいである。……貴様がいるだけで、世界の解像度が上がる心地よ。' },
    { sp: 'GERU', text: '……相変わらず、キザだな。だが、同感だ。お前と過ごすと、いつもの喫茶店が、特別な一頁になる。……ふ、惚れた弱みか。' },
  ], effects: ['mutual(GERU,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_LPAIR_DONUT_V17', ['HYU', 'LENNY'], { cond: 'location == donut and rel(HYU, LENNY) == LOVER', weight: 20, lines: [
    { sp: 'LENNY', text: 'ヒュウ、恋人どうしドーナツはんぶんこ。……穴のところ、どっちが食べる?' },
    { sp: 'HYU', text: 'ふふ、穴は二人で分けましょう。……何もない空間すら、あなたとなら愛おしい。恋とは、不思議なものですね。' },
  ], effects: ['mutual(HYU,LENNY,1)', 'log(AMBIENT)'] }),
  A('DLG_LPAIR_CINEMA_V17', ['JIN', 'NEO'], { cond: 'location == cinema and rel(JIN, NEO) == LOVER', weight: 20, lines: [
    { sp: 'JIN', text: 'ネオ、恋人と観る映画デート、なんか照れるな! ……暗いから、手ぇ繋いでもバレねえよな?' },
    { sp: 'NEO', text: 'ふ、望むところである。……スクリーンの英雄譚より、貴様と過ごすこの二時間の方が、我には価値がある。……握るぞ、その手。' },
  ], effects: ['mutual(JIN,NEO,1)', 'log(AMBIENT)'] }),

  // 友人どうし(施設・別)
  A('DLG_FPAIR_RAMEN_V17', ['GERU', 'NEO'], { cond: 'location == ramen and mutual(GERU, NEO) >= 55 and rel(GERU, NEO) != LOVER', weight: 18, lines: [
    { sp: 'NEO', text: 'ゲルよ、親友とすするラーメン、格別である! ……替え玉、貴様の分も頼んでおいたぞ。' },
    { sp: 'GERU', text: 'ふ、気が利くな。……恋人ではないが、こうして黙って一杯を分け合える。それが、私には心地いいんだ。良き友だよ、お前は。' },
  ], effects: ['mutual(GERU,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_FPAIR_AQUA_V17', ['HYU', 'GERU'], { cond: 'location == aquarium and mutual(HYU, GERU) >= 55 and rel(HYU, GERU) != LOVER', weight: 18, lines: [
    { sp: 'HYU', text: 'ゲル、この青い光、あなたの静かな美しさを引き立てますね。……友として、素直にそう思います。' },
    { sp: 'GERU', text: '……お前に美を褒められると、悪い気はしないな。恋人ではないが、美意識を認め合える友。それも、得難いものだ。' },
  ], effects: ['mutual(HYU,GERU,1)', 'log(AMBIENT)'] }),
  A('DLG_FPAIR_SENTO_V17', ['LENNY', 'JIN'], { cond: 'location == sento and mutual(LENNY, JIN) >= 55 and rel(LENNY, JIN) != LOVER', weight: 18, lines: [
    { sp: 'JIN', text: 'レニィ、親友と入る風呂は最高だな! ……って、また湯船で寝てる! おい、溺れるぞ! ……しょうがねえ、見張っててやる。' },
    { sp: 'LENNY', text: 'ん……ジンパチがいると、安心して寝られるんだ。……親友って、こういうことだよね。ありがと。zzz' },
  ], effects: ['mutual(JIN,LENNY,1)', 'log(AMBIENT)'] }),

  // 通常(時間・季節・天気・別)
  A('DLG_N_GER_HYU_MORNING_V17', ['GERU', 'HYU'], { cond: 'time == MORNING', lines: [
    { sp: 'HYU', text: 'ゲル、朝の光の中でも本ですか。……たまには顔を上げて、朝日を浴びなさい。美容にも、心にもいいですよ。' },
    { sp: 'GERU', text: 'ふ、余計なお世話だ。……だが、そうだな。お前と眺める朝日も、一度くらいは悪くないか。……ほら、隣に座れ。' },
  ], effects: ['mutual(HYU,GERU,1)', 'log(AMBIENT)'] }),
  A('DLG_N_JIN_NEO_NIGHT_V17', ['JIN', 'NEO'], { cond: 'time == NIGHT', lines: [
    { sp: 'JIN', text: 'ネオ、夜の屋上で語り合うの、いいよな。星見ながら、明日の目標決めるんだ。' },
    { sp: 'NEO', text: 'うむ。星は騎士の道標。……貴様と見上げる夜空は、なぜか故郷のそれより、温かく感じる。良き夜だ。' },
  ], effects: ['mutual(JIN,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_N_LEN_MUN_SPRING_V17', ['LENNY', 'MUNI'], { cond: 'season == SPRING', lines: [
    { sp: 'MUNI', text: 'レニィおにいちゃん、ちょうちょ! おっかけよ!' },
    { sp: 'LENNY', text: 'いいよぉ。……でも、蝶を追いかけてると、なんだかぼくまでふわふわ眠く……あ、ムニ、待って、走らないで。zzz' },
  ], effects: ['mutual(LENNY,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_N_HYU_NEO_WINTER_V17', ['HYU', 'NEO'], { cond: 'season == WINTER', lines: [
    { sp: 'HYU', text: 'ネオさん、冬の澄んだ空気は、美しいものをより美しく見せます。……あなたの金髪も、いつにも増して輝いていますね。' },
    { sp: 'NEO', text: 'ふ、貴様の白い吐息も、氷の宝石のようである。……冬は、我ら美を追う者にとって、味方の季節だな。' },
  ], effects: ['mutual(HYU,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_N_GER_JIN_RAIN_V17', ['GERU', 'JIN'], { cond: 'weather == RAIN', lines: [
    { sp: 'JIN', text: 'ゲル、雨で鍛錬できねえ! ……お前、雨の日って何してんだ?' },
    { sp: 'GERU', text: '本を読む。……雨音は、活字の一番の友だ。お前も、たまには濡れずに、頁をめくってみろ。案外、性に合うかもしれんぞ。ふ。' },
  ], effects: ['mutual(JIN,GERU,1)', 'log(AMBIENT)'] }),
];
