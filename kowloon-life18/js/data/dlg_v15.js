// ============================================================
// v15 追加会話
//   ・喧嘩システム(親密度が一定以下のペア → 喧嘩、翌日以降に会うと仲直り)
//   ・クリスマス深夜: 誰かがムニの部屋にプレゼント / 翌朝ムニが開ける
//   ・集会所イベント(誕生日/クリスマス等)の会話を大幅増(バリエーション)
//   ・主要人物6人どうしの会話をさらに大幅増(施設/恋人/友人/時間季節天気)
// ============================================================
const T = (id, owner, node) => ({ id, owner, type: node.type ?? 'TALK', pool: node.pool ?? 'GENERIC', ...node });
const A = (id, cast, node) => ({ id, type: 'AMBIENT', pool: 'AMBIENT', owner: [...cast].sort().join('-'), cast, ...node });
const ALLMAIN = ['LENNY', 'HYU', 'JIN', 'GERU', 'MUNI', 'NEO'];
const ALLMAIN_K = ['LENNY', 'HYU', 'JIN', 'GERU', 'MUNI', 'NEO', 'KANE'];

export const DLG_V15 = [
  // ========================================================
  // 喧嘩システム — 親密度が一定以下(<28)のペアは衝突する
  //   quarrel(A,B) で喧嘩を記録。翌日以降に会うと reconcile(A,B) で仲直り。
  // ========================================================
  // --- ゲル × ネオ ---
  A('DLG_QUARREL_GER_NEO', ['GERU', 'NEO'], { cond: 'mutual(GERU, NEO) < 28 and not quarreling(GERU, NEO)', weight: 55, lines: [
    { sp: 'NEO', text: 'ゲルよ、貴様、また私を「脳筋の騎士かぶれ」と評したそうだな。聞き捨てならぬ!' },
    { sp: 'GERU', text: '……事実だろう。本の一冊も読まず、剣を振るだけの男に、私の何が分かる。' },
    { sp: 'NEO', text: 'ぬうっ、言わせておけば! ……もうよい! 貴様とは二度と口をきかん!' },
    { sp: 'GERU', text: '……ふん。こちらこそ、願い下げだ。' },
  ], effects: ['quarrel(GERU,NEO)', 'log(AMBIENT)'] }),
  A('DLG_RECON_GER_NEO', ['GERU', 'NEO'], { cond: 'quarreling(GERU, NEO) and quarrel_days(GERU, NEO) >= 1', weight: 60, lines: [
    { sp: 'NEO', text: '……ゲル。先日は、言い過ぎた。貴様の言葉、一晩考えて……確かに、我にも直すべき点があった。' },
    { sp: 'GERU', text: '……こちらもだ。お前の剣にかける想いを、頭ごなしに否定した。悪かったな。' },
    { sp: 'NEO', text: 'ふ。……今度、貴様の薦める騎士物語を、一冊読んでみよう。歩み寄り、というやつだ。' },
    { sp: 'GERU', text: '……ああ。楽しみにしている。仲直り、だな、これは。' },
  ], effects: ['reconcile(GERU,NEO,10)', 'log(AMBIENT)'] }),
  // --- ヒュウ × ネオ ---
  A('DLG_QUARREL_HYU_NEO', ['HYU', 'NEO'], { cond: 'mutual(HYU, NEO) < 28 and not quarreling(HYU, NEO)', weight: 55, lines: [
    { sp: 'HYU', text: 'ネオさん。その手入れもしない金髪、私の美学からすれば、宝の持ち腐れですよ。' },
    { sp: 'NEO', text: 'なんだと? この髪は騎士の誇りである! 貴様の薄っぺらな「美」と一緒にするな!' },
    { sp: 'HYU', text: '……薄っぺら? 撤回なさい。私の美は、一日にして成らぬ研鑽の結晶です。' },
    { sp: 'NEO', text: 'ふん! 話にならん! しばらく顔も見たくないわ!' },
  ], effects: ['quarrel(HYU,NEO)', 'log(AMBIENT)'] }),
  A('DLG_RECON_HYU_NEO', ['HYU', 'NEO'], { cond: 'quarreling(HYU, NEO) and quarrel_days(HYU, NEO) >= 1', weight: 60, lines: [
    { sp: 'HYU', text: 'ネオさん。……「薄っぺら」は言い過ぎました。あなたの髪への誇り、あれも一つの美意識ですね。認めます。' },
    { sp: 'NEO', text: '……我も、貴様の美を軽んじた。すまぬ。貴様の研鑽、確かに騎士の鍛錬に通ずるものがある。' },
    { sp: 'HYU', text: 'ふふ、では、美を追う者どうし、仲直りといきましょう。今度、髪の手入れを伝授してさしあげます。' },
    { sp: 'NEO', text: 'ふはは、それは心強い! ……うむ、貴様とは、良き好敵手になれそうだ。' },
  ], effects: ['reconcile(HYU,NEO,10)', 'log(AMBIENT)'] }),
  // --- ジンパチ × ネオ ---
  A('DLG_QUARREL_JIN_NEO', ['JIN', 'NEO'], { cond: 'mutual(JIN, NEO) < 28 and not quarreling(JIN, NEO)', weight: 55, lines: [
    { sp: 'JIN', text: 'おいネオ! 素振りの音がうるせえって、お前がクレーム入れたんだって? 鍛錬にケチつけんじゃねえ!' },
    { sp: 'NEO', text: '真夜中に千回も振れば、誰でも眠れぬわ! 加減を知らぬ蛮勇め!' },
    { sp: 'JIN', text: '蛮勇だと!? 剣ばっか気取ってるお前に言われたくねえ!' },
    { sp: 'NEO', text: 'なにを! ……もうよい、貴様とは当分、口をきかん!' },
  ], effects: ['quarrel(JIN,NEO)', 'log(AMBIENT)'] }),
  A('DLG_RECON_JIN_NEO', ['JIN', 'NEO'], { cond: 'quarreling(JIN, NEO) and quarrel_days(JIN, NEO) >= 1', weight: 60, lines: [
    { sp: 'JIN', text: 'ネオ……。夜中の素振り、確かにうるさかったよな。悪かった。今度から昼にする。' },
    { sp: 'NEO', text: '……いや、我も言い方がきつかった。貴様の鍛錬への情熱、本当は、認めておるのだ。' },
    { sp: 'JIN', text: 'へへ、じゃあ今度、昼に一緒に稽古するか! 背中預け合える相手、欲しかったんだ!' },
    { sp: 'NEO', text: 'ふはは、望むところ! 我ら、良き戦友になれそうだな! 仲直りの手合わせといこう!' },
  ], effects: ['reconcile(JIN,NEO,10)', 'log(AMBIENT)'] }),
  // --- レニィ × ネオ ---
  A('DLG_QUARREL_LEN_NEO', ['LENNY', 'NEO'], { cond: 'mutual(LENNY, NEO) < 28 and not quarreling(LENNY, NEO)', weight: 55, lines: [
    { sp: 'NEO', text: 'レニィ! 貴様、我が大切な騎士物語の本に、寝ぼけて茶をこぼしたであろう!' },
    { sp: 'LENNY', text: 'えっ……あ、ごめん。わざとじゃ、ないんだけど……。' },
    { sp: 'NEO', text: 'あれは故郷から持ってきた一冊なのだ! ……はぁ。貴様のその、締まりのなさには、ほとほと呆れる!' },
    { sp: 'LENNY', text: '……そんな怒らなくても。……もう、いい。' },
  ], effects: ['quarrel(LENNY,NEO)', 'log(AMBIENT)'] }),
  A('DLG_RECON_LEN_NEO', ['LENNY', 'NEO'], { cond: 'quarreling(LENNY, NEO) and quarrel_days(LENNY, NEO) >= 1', weight: 60, lines: [
    { sp: 'NEO', text: 'レニィ……。あの本のこと、あれほど怒ることはなかった。すまぬ。貴様も、わざとではないものな。' },
    { sp: 'LENNY', text: 'ううん、ぼくが悪かったんだ。……あのね、乾かして、シミも目立たなくしておいたよ。ほら。' },
    { sp: 'NEO', text: '……! わざわざ、手当てを。……かたじけない、レニィ。貴様は、優しい奴だな。' },
    { sp: 'LENNY', text: 'えへへ、仲直りだね。……今度、その騎士のお話、ぼくにも読んでよ。ネオの声で。' },
  ], effects: ['reconcile(LENNY,NEO,10)', 'log(AMBIENT)'] }),
  // --- ヒュウ × ゲル ---
  A('DLG_QUARREL_HYU_GER', ['HYU', 'GERU'], { cond: 'mutual(HYU, GERU) < 28 and not quarreling(HYU, GERU)', weight: 55, lines: [
    { sp: 'HYU', text: 'ゲル、あなたいつも本ばかり。たまには顔を上げて、外の美しいものを見たらどうです?' },
    { sp: 'GERU', text: '……余計なお世話だ。お前こそ、鏡ばかり見て、中身が伴っているのか?' },
    { sp: 'HYU', text: 'なっ……! 私の中身を疑うのですか。撤回なさい。' },
    { sp: 'GERU', text: 'ふん。事実を言ったまでだ。……もういい、話にならん。' },
  ], effects: ['quarrel(HYU,GERU)', 'log(AMBIENT)'] }),
  A('DLG_RECON_HYU_GER', ['HYU', 'GERU'], { cond: 'quarreling(HYU, GERU) and quarrel_days(HYU, GERU) >= 1', weight: 60, lines: [
    { sp: 'GERU', text: 'ヒュウ……。この前は、お前の中身を疑うようなことを言った。悪かった。お前の美へのこだわりは、本物だ。' },
    { sp: 'HYU', text: '……私も、あなたの読書を軽んじました。ごめんなさい。あなたの内なる世界、私には無いものです。羨ましくもある。' },
    { sp: 'GERU', text: 'ふ。外の美と、内の美。私たちは、案外似た者どうしかもしれんな。' },
    { sp: 'HYU', text: 'ふふ、そうかもしれません。……仲直りに、今度お茶でも。あなたの好きな本の話、聞かせてください。' },
  ], effects: ['reconcile(HYU,GERU,10)', 'log(AMBIENT)'] }),

  // ========================================================
  // クリスマス深夜 — 5人のうち誰かがムニの部屋にプレゼントを届ける
  //   (npc.js が深夜に giver + MUNI を HOME_MUNI へ配置)
  // ========================================================
  A('DLG_XMAS_GIFT_LENNY', ['MUNI', 'LENNY'], { cond: 'event_active(CHRISTMAS) and time == MIDNIGHT and location == HOME_MUNI', weight: 40, lines: [
    { sp: 'LENNY', text: '(そーっと……)ムニ、よく寝てるね。……はい、クリスマスプレゼント。枕元に置いておくよ。' },
    { sp: 'MUNI', text: 'んん……サンタ、さん……?' },
    { sp: 'LENNY', text: 'ふふ、そうだよ。……いい夢見てね、ムニ。メリークリスマス。(そーっと出ていく)' },
  ], effects: ['mutual(LENNY,MUNI,2)', 'log(AMBIENT)'] }),
  A('DLG_XMAS_GIFT_HYU', ['MUNI', 'HYU'], { cond: 'event_active(CHRISTMAS) and time == MIDNIGHT and location == HOME_MUNI', weight: 40, lines: [
    { sp: 'HYU', text: '(足音を忍ばせて……)ムニ、あなたに一番美しいリボンのプレゼントを。……枕元に、そっと。' },
    { sp: 'MUNI', text: 'んー……いいにおい……。' },
    { sp: 'HYU', text: 'ふふ、私の香水ですよ。……メリークリスマス、ムニ。朝が楽しみですね。(静かに退室)' },
  ], effects: ['mutual(HYU,MUNI,2)', 'log(AMBIENT)'] }),
  A('DLG_XMAS_GIFT_JIN', ['MUNI', 'JIN'], { cond: 'event_active(CHRISTMAS) and time == MIDNIGHT and location == HOME_MUNI', weight: 40, lines: [
    { sp: 'JIN', text: '(そーっと……よし)ムニ、でっかいプレゼントだぞ。……起こさねえように、そっとな……。' },
    { sp: 'MUNI', text: 'むにゃ……ジンパチ、おにいちゃん……?' },
    { sp: 'JIN', text: '……っ。し、サンタだよサンタ! ……へへ、メリークリスマス、ムニ。でっかく育てよ。(足音を忍ばせて出る)' },
  ], effects: ['mutual(JIN,MUNI,2)', 'log(AMBIENT)'] }),
  A('DLG_XMAS_GIFT_GERU', ['MUNI', 'GERU'], { cond: 'event_active(CHRISTMAS) and time == MIDNIGHT and location == HOME_MUNI', weight: 40, lines: [
    { sp: 'GERU', text: '(静かに……)ムニ、お前に絵本を一冊。……夜が怖くなくなる、優しいお話だ。枕元に置いておく。' },
    { sp: 'MUNI', text: 'んん……ゲル、おねえちゃん……?' },
    { sp: 'GERU', text: '……ふ。夢の中まで、来てしまったか。おやすみ、ムニ。メリークリスマス。(そっと毛布を直して出ていく)' },
  ], effects: ['mutual(GERU,MUNI,2)', 'log(AMBIENT)'] }),
  A('DLG_XMAS_GIFT_NEO', ['MUNI', 'NEO'], { cond: 'event_active(CHRISTMAS) and time == MIDNIGHT and location == HOME_MUNI', weight: 40, lines: [
    { sp: 'NEO', text: '(騎士の足音は、忍ばせても優雅である……)ムニよ、我が贈り物だ。木彫りの小さな剣。お前を守る御守りである。' },
    { sp: 'MUNI', text: 'むにゃ……きしさま……?' },
    { sp: 'NEO', text: 'ふ、サンタと呼べ。……よい夢を、見習い騎士よ。メリークリスマスである。(音もなく退室)' },
  ], effects: ['mutual(MUNI,NEO,2)', 'log(AMBIENT)'] }),
  // 翌朝: ムニが喜んでプレゼントを開ける
  T('DLG_XMAS_MUNI_OPEN', 'MUNI', { pool: 'STATE', weight: 30, cond: 'event_active(CHRISTMAS) and time == MORNING and location == HOME_MUNI', lines: [
    { sp: 'MUNI', text: 'あっ……! まくらもとに、プレゼント! サンタさん、きてくれたんだ!' },
    { sp: 'MUNI', text: 'えへへ、あけるね! ……わあ! すてきー! だいじにするの!' },
    { sp: 'MUNI', text: 'ゆうべ、だれかのこえがきこえたきがするの……。ムニ、しってるんだから。みんな、やさしいね。ありがとなの!' },
  ], effects: ['aff(MUNI,2)', 'log(DAILY)'] }),

  // ========================================================
  // 集会所イベントの会話を大幅増(バリエーション追加)
  // ========================================================
  // お花見(別バージョン)
  A('DLG_EV_HANAMI_V15', ALLMAIN, { cond: 'event_active(HANAMI) and location == hall', weight: 28, lines: [
    { sp: 'MUNI', text: 'はなびら、ゆきみたいにふってくるの! ムニ、きゃっちするの!' },
    { sp: 'JIN', text: '花より団子だ! ……いや、今日は花も団子も両方だ! 欲張っていこうぜ!' },
    { sp: 'GERU', text: '一年でこの数日だけ咲いて、散る。……だからこそ、みんなで見上げる価値がある。今を、刻もう。' },
    { sp: 'HYU', text: '桜の薄紅は、私の頬の色に少し似ていますね。……自然も、私に寄せてくるとは。健気です。' },
    { sp: 'LENNY', text: '花の下でお昼寝すると、桜の夢を見るんだって。……ぼく、試してみるね。 zzz' },
    { sp: 'NEO', text: '花の宴、我が故郷にもあった。……こうして皆で春を祝う。この街も、良き故郷である。' },
  ], effects: ['mutual(JIN,MUNI,1)', 'mutual(GERU,HYU,1)', 'log(AMBIENT)'] }),
  // クリスマス(別バージョン)
  A('DLG_EV_CHRISTMAS_V15', ALLMAIN, { cond: 'event_active(CHRISTMAS) and location == hall', weight: 28, lines: [
    { sp: 'MUNI', text: 'サンタさん、こんやくるかな! ムニ、いいこにしてたの!' },
    { sp: 'LENNY', text: 'きっと来るよ。……ムニがいい子なの、みんな知ってるからね。ふふ。' },
    { sp: 'HYU', text: 'ツリーの飾りつけ、私のセンスで完璧に。……この星の位置、黄金比です。美しいでしょう?' },
    { sp: 'JIN', text: 'クリスマスチキン、俺が焼くぜ! 骨付きモモ肉、こんがりな! みんな腹すかせて待ってろ!' },
    { sp: 'GERU', text: '聖夜か。……こういう、みんなが誰かを想う夜は、悪くない。ムニのプレゼント、誰が届けるんだろうな。ふ。' },
    { sp: 'NEO', text: '煙突から侵入する義賊、サンタか。騎士道的に、嫌いではない。……今宵は、良き夜になりそうである。' },
  ], effects: ['mutual(LENNY,MUNI,1)', 'mutual(HYU,JIN,1)', 'log(AMBIENT)'] }),
  // 正月(別バージョン)
  A('DLG_EV_NEWYEAR_V15', ALLMAIN, { cond: 'event_active(NEWYEAR) and location == hall', weight: 28, lines: [
    { sp: 'JIN', text: '書き初めだ! 俺は「筋肉」って書くぜ! 今年の目標、シンプルイズベストだ!' },
    { sp: 'HYU', text: '私は「美」の一字を。……墨の黒と紙の白、そこに立つ私。新年から一幅の芸術です。' },
    { sp: 'GERU', text: '私は「積読」……いや、「読破」と書くとしよう。今年こそ、あの山を崩す。……たぶんな。' },
    { sp: 'MUNI', text: 'ムニは「むに」ってかいたの! じょうずでしょ!' },
    { sp: 'LENNY', text: 'ぼくは「快眠」……zzz。あ、書いてる途中で寝ちゃった。今年もぼくらしいや。' },
    { sp: 'NEO', text: '我は「忠」の一字。……この街と、皆への忠義。新年の誓いである。' },
  ], effects: ['mutual(HYU,GERU,1)', 'mutual(LENNY,MUNI,1)', 'log(AMBIENT)'] }),
  // 誕生日会(ムニ・別バージョン)
  A('DLG_BD_MUNI_V15', ALLMAIN, { cond: 'event_active(BIRTHDAY_MUNI) and location == hall', weight: 30, lines: [
    { sp: 'MUNI', text: 'ムニ、また ひとつ おおきくなったの! みんな、ありがとなの!' },
    { sp: 'GERU', text: 'おめでとう、ムニ。……去年より、少し背が伸びたな。ちゃんと見ているぞ。' },
    { sp: 'NEO', text: '見習い騎士の生誕を祝う! ムニ、貴様の成長は、我らの誇りである!' },
    { sp: 'HYU', text: 'おめでとう、ムニ。今日のあなたは主役。一番美しく飾ってあげましょう。' },
    { sp: 'JIN', text: 'ケーキのろうそく、一息で消せるか勝負だ! ……いや、今日は主役に譲るぜ! ほら、ムニ、いけ!' },
    { sp: 'LENNY', text: 'おめでとう、ムニ。……プレゼントは、一緒にお昼寝する権利、今年も更新だよ。えへへ。' },
  ], effects: ['mutual(GERU,MUNI,1)', 'mutual(MUNI,NEO,1)', 'mutual(JIN,MUNI,1)', 'log(AMBIENT)'] }),
  // 誕生日会(ネオ・別バージョン)
  A('DLG_BD_NEO_V15', ALLMAIN, { cond: 'event_active(BIRTHDAY_NEO) and location == hall', weight: 30, lines: [
    { sp: 'JIN', text: 'ネオ、誕生日おめでとう! ……この街に来てくれて、ありがとうな。お前は俺の最高の戦友だ!' },
    { sp: 'NEO', text: '……ジンパチ。かたじけない。故郷を出て、この地で祝われる日が来るとは。……幸せ者である、我は。' },
    { sp: 'MUNI', text: 'きしさま、おめでとーなの! ムニ、けんのおえかきかいたの!' },
    { sp: 'GERU', text: '誕生日おめでとう。……お前の故郷の話、今年もまた聞かせてくれ。それが、私からの祝いの受け取り方だ。' },
    { sp: 'HYU', text: 'おめでとう、ネオさん。あなたの金髪、今年も誇り高く。……好敵手の一年に、乾杯を。' },
    { sp: 'LENNY', text: 'おめでとう、ネオ。……この街が、ネオのもうひとつの故郷になれてたら、いいな。' },
  ], effects: ['mutual(JIN,NEO,1)', 'mutual(MUNI,NEO,1)', 'mutual(GERU,NEO,1)', 'log(AMBIENT)'] }),
  // 誕生日会(ゲル・別バージョン)
  A('DLG_BD_GERU_V15', ALLMAIN, { cond: 'event_active(BIRTHDAY_GERU) and location == hall', weight: 30, lines: [
    { sp: 'GERU', text: '……また祝われるのか。柄ではないんだがな。だが、ありがとう。悪い気は、しない。' },
    { sp: 'LENNY', text: 'おめでとう、ゲル。……いつも本、読んでくれてありがとう。ゲルの声、ぼくの宝物だよ。' },
    { sp: 'HYU', text: 'おめでとう、ゲル。今日は本を閉じて、主役として輝きなさい。プレゼントは稀覯本ですよ。ふふ。' },
    { sp: 'MUNI', text: 'ゲルおねえちゃん、おめでとーなの! ずっとなかよしでいてね!' },
    { sp: 'NEO', text: 'ゲルよ、生誕を祝う! 貴様の知性は我が剣より鋭い。得難き友の一年に、乾杯である!' },
    { sp: 'JIN', text: 'ゲル、おめでとう! お前がいると、俺たちの暴走が止まる。今年も頼りにしてるぜ!' },
  ], effects: ['mutual(GERU,LENNY,1)', 'mutual(GERU,HYU,1)', 'mutual(GERU,MUNI,1)', 'log(AMBIENT)'] }),
  // ハロウィン(別バージョン)
  A('DLG_EV_HALLOWEEN_V15', ALLMAIN, { cond: 'event_active(HALLOWEEN) and location == hall', weight: 28, lines: [
    { sp: 'MUNI', text: 'トリックオアトリート! おかしくれなきゃ、いたずらしちゃうぞ!' },
    { sp: 'GERU', text: 'ふ、脅し文句が可愛いな。……ほら、お前のぶんの菓子だ。いたずらは無しにしてもらおうか。' },
    { sp: 'HYU', text: '今年の私は、妖艶な吸血鬼。……美しすぎて、鏡に映ってしまうのが、唯一の誤算ですね。' },
    { sp: 'JIN', text: '俺の仮装は今年も「筋肉」だ! 一番怖えだろ! ……え、去年と同じ? 完成された恐怖に変化は要らねえ!' },
    { sp: 'NEO', text: '我は普段から魔法剣士。毎日がハロウィンである。……だが、この菓子を配る風習、悪くないな。ふはは!' },
    { sp: 'LENNY', text: 'ぼくはおばけの仮装……シーツかぶってたら、やっぱり寝ちゃった。ふぁ、これはこれで本物っぽい?' },
  ], effects: ['mutual(GERU,MUNI,1)', 'mutual(HYU,NEO,1)', 'log(AMBIENT)'] }),

  // ========================================================
  // 主要人物6人どうしの会話をさらに大幅増(施設)
  // ========================================================
  A('DLG_F_JIN_NEO_CAFE_V15', ['JIN', 'NEO'], { cond: 'location == cafe', lines: [
    { sp: 'JIN', text: 'ネオ、喫茶店とかお前も来るんだな! 意外と似合うじゃねえか!' },
    { sp: 'NEO', text: 'ふ、騎士も休息は必要である。……この一杯の香り、戦の合間の安らぎに似ておる。貴様も、たまには落ち着け。' },
  ], effects: ['mutual(JIN,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_F_LEN_HYU_RAMEN_V15', ['LENNY', 'HYU'], { cond: 'location == ramen', lines: [
    { sp: 'HYU', text: 'レニィ、麺は美しくすすりなさい。……って、また湯気で寝ていますね。まったく、世話が焼ける。' },
    { sp: 'LENNY', text: 'ん……ヒュウが取り分けてくれると思って、つい……。えへへ、あったかいね。' },
  ], effects: ['mutual(HYU,LENNY,1)', 'log(AMBIENT)'] }),
  A('DLG_F_GER_JIN_BOOK_V15', ['GERU', 'JIN'], { cond: 'location == book', lines: [
    { sp: 'JIN', text: 'ゲル、また熱い本ないか? この前の冒険小説、最高だったぜ! 主人公が俺みたいで!' },
    { sp: 'GERU', text: 'ふ、気に入ったか。……なら続編がある。前作以上に暑苦しいぞ。お前向きだ。ほら、貸してやる。感想を聞かせろよ。' },
  ], effects: ['mutual(JIN,GERU,1)', 'log(AMBIENT)'] }),
  A('DLG_F_HYU_NEO_SENTO_V15', ['HYU', 'NEO'], { cond: 'location == sento', lines: [
    { sp: 'HYU', text: 'ネオさん、湯上がりのその肌艶……悔しいですが、認めましょう。銭湯は美の聖地ですね。' },
    { sp: 'NEO', text: 'うむ、この熱き湯、玉座より良いと言い続けておる。……貴様と美を語る湯もまた、一興である。ふ。' },
  ], effects: ['mutual(HYU,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_F_MUN_NEO_AQUA_V15', ['MUNI', 'NEO'], { cond: 'location == aquarium', lines: [
    { sp: 'MUNI', text: 'ネオおにいちゃん、あのおおきいおさかな、ドラゴンみたい!' },
    { sp: 'NEO', text: 'ほう、確かに! 水中の竜か。……我が剣で挑む相手には、些か大きすぎるがな。ふはは! よき眼力である、ムニ!' },
  ], effects: ['mutual(MUNI,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_F_LEN_GER_CINEMA_V15', ['LENNY', 'GERU'], { cond: 'location == cinema', lines: [
    { sp: 'GERU', text: 'レニィ、この監督の映画は、間の取り方が絶妙でな。……ほら、この静かな場面。……お前、案の定寝ているな。' },
    { sp: 'LENNY', text: 'ん……ゲルの解説、映画より心地いいんだ。……あとで、どんな話だったか、ぜんぶ教えて? えへへ。' },
  ], effects: ['mutual(LENNY,GERU,1)', 'log(AMBIENT)'] }),
  A('DLG_F_HYU_MUN_DONUT_V15', ['HYU', 'MUNI'], { cond: 'location == donut', lines: [
    { sp: 'MUNI', text: 'ヒュウおにいちゃん、いちばんきれいなドーナツ、どれ?' },
    { sp: 'HYU', text: 'ふむ……この、艶やかなピンクの一つですね。美は細部に宿る。……あなたに、この一番美しいのをあげましょう。ふふ。' },
  ], effects: ['mutual(HYU,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_F_JIN_LEN_CHURCH_V15', ['JIN', 'LENNY'], { cond: 'location == church', lines: [
    { sp: 'JIN', text: 'レニィ、教会は静かだな……。こういうとこだと、俺でも自然と声が小さくなるぜ。' },
    { sp: 'LENNY', text: 'うん……。神父さまの前だと、なんだか心が落ち着くんだ。……あ、でも、静かすぎて眠く……zzz。' },
  ], effects: ['mutual(JIN,LENNY,1)', 'log(AMBIENT)'] }),

  // 恋人どうし(施設・別)
  A('DLG_LPAIR_GAME_V15', ['HYU', 'JIN'], { cond: 'location == game and rel(HYU, JIN) == LOVER', weight: 20, lines: [
    { sp: 'JIN', text: 'ヒュウ! 恋人どうしペアで協力プレイだ! 息を合わせていくぜ!' },
    { sp: 'HYU', text: 'ふふ、いいでしょう。あなたの熱と私の技、二人で最高記録を。……こういうデートも、悪くありませんね。' },
  ], effects: ['mutual(HYU,JIN,1)', 'log(AMBIENT)'] }),
  A('DLG_LPAIR_AQUA_V15', ['LENNY', 'NEO'], { cond: 'location == aquarium and rel(LENNY, NEO) == LOVER', weight: 20, lines: [
    { sp: 'LENNY', text: 'ネオ、青い光の中のネオ、きれいだね。……恋人だから、独り占めしちゃお。' },
    { sp: 'NEO', text: '……不意打ちがうまくなったな、レニィ。ふ、我も、この水底で貴様と二人、悪くない。……いや、最高である。' },
  ], effects: ['mutual(LENNY,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_LPAIR_CHURCH_V15', ['GERU', 'NEO'], { cond: 'location == church and rel(GERU, NEO) == LOVER', weight: 20, lines: [
    { sp: 'NEO', text: 'ゲルよ、この聖なる場で、改めて我が愛を誓おう。騎士の誓いは、生涯ただ一度である。' },
    { sp: 'GERU', text: '……こういう時、お前は本当にキザだな。だが、嫌いじゃない。……私も、誓おう。この物語の続きは、お前と紡ぐ。' },
  ], effects: ['mutual(GERU,NEO,1)', 'log(AMBIENT)'] }),

  // 友人どうし(施設・別)
  A('DLG_FPAIR_CINEMA_V15', ['JIN', 'NEO'], { cond: 'location == cinema and mutual(JIN, NEO) >= 55 and rel(JIN, NEO) != LOVER', weight: 18, lines: [
    { sp: 'JIN', text: 'ネオ! この騎士映画、お前と観ると熱さ倍増だな! 名シーンで一緒に拳握っちまったぜ!' },
    { sp: 'NEO', text: 'ふはは、我もである! 良き友と観る名画は、格別! ……次は貴様の好きなアクションを観ようぞ。親友のよしみだ。' },
  ], effects: ['mutual(JIN,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_FPAIR_DONUT_V15', ['HYU', 'GERU'], { cond: 'location == donut and mutual(HYU, GERU) >= 55 and rel(HYU, GERU) != LOVER', weight: 18, lines: [
    { sp: 'HYU', text: 'ゲル、友としてドーナツを半分こ。……甘いものを分け合える友は、案外貴重なのですよ。' },
    { sp: 'GERU', text: 'ふ、違いない。……恋人ではないが、こうして気楽に甘いものをつまめる。それで十分だ。良い友だよ、お前は。' },
  ], effects: ['mutual(HYU,GERU,1)', 'log(AMBIENT)'] }),

  // 通常(時間・季節・天気・別)
  A('DLG_N_LEN_HYU_MORNING_V15', ['LENNY', 'HYU'], { cond: 'time == MORNING', lines: [
    { sp: 'HYU', text: 'レニィ、朝から寝ぼけ眼ですね。……ほら、前髪くらい整えてあげます。じっとなさい。' },
    { sp: 'LENNY', text: 'えへへ、ヒュウにセットしてもらうと、なんか一日いいことありそう。……ありがと。' },
  ], effects: ['mutual(HYU,LENNY,1)', 'log(AMBIENT)'] }),
  A('DLG_N_JIN_GER_NIGHT_V15', ['JIN', 'GERU'], { cond: 'time == NIGHT', lines: [
    { sp: 'JIN', text: 'ゲル、夜更かしか? 体に悪いぜ! ……って、俺も夜のストレッチ中だから人のこと言えねえか!' },
    { sp: 'GERU', text: 'ふ、お互いさまだな。……夜は、それぞれのやり方で、一日を締めくくる時間だ。お前は体で、私は活字で。悪くない夜だ。' },
  ], effects: ['mutual(JIN,GERU,1)', 'log(AMBIENT)'] }),
  A('DLG_N_MUN_NEO_WINTER_V15', ['MUNI', 'NEO'], { cond: 'season == WINTER', lines: [
    { sp: 'MUNI', text: 'ネオおにいちゃん、ゆきだるまつくろ! おっきいの!' },
    { sp: 'NEO', text: 'よかろう! 騎士の技で、堂々たる雪の城を築いてやろう! ……ぬ、まずは雪玉から、だな。ふはは、いくぞムニ!' },
  ], effects: ['mutual(MUNI,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_N_HYU_GER_SPRING_V15', ['HYU', 'GERU'], { cond: 'season == SPRING', lines: [
    { sp: 'HYU', text: 'ゲル、春です。本ばかりでなく、たまには桜の下でお茶でも。……美しい季節を逃すのは、罪ですよ。' },
    { sp: 'GERU', text: 'ふ、では桜の下で読書といくか。……お前も一緒に来るなら、たまには本を閉じて、花を眺めてやってもいい。' },
  ], effects: ['mutual(HYU,GERU,1)', 'log(AMBIENT)'] }),
  A('DLG_N_LEN_JIN_RAIN_V15', ['LENNY', 'JIN'], { cond: 'weather == RAIN', lines: [
    { sp: 'LENNY', text: 'ジンパチ、雨だね。……こういう日は、ぼくの部屋でゴロゴロしない? 雨音、子守唄みたいだよ。' },
    { sp: 'JIN', text: '……たまにはいいか! 雨の日くらい、鍛錬休んでダラダラしても。……お前といると、そういう時間も悪くねえって思えるな。' },
  ], effects: ['mutual(JIN,LENNY,1)', 'log(AMBIENT)'] }),
];
