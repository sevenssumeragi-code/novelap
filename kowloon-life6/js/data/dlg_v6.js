// ============================================================
// v6 追加会話
//   ・喫茶店サチ × コンビニ店員リン の会話(複数)
//   ・ヒュウがコンビニのリンも口説く
//   ・各施設での主要人物ペア会話(通常/季節別/天気別)をさらに増量
//   ・通常の主要人物の会話をさらに増量
// ============================================================
const T = (id, owner, node) => ({ id, owner, type: node.type ?? 'TALK', pool: node.pool ?? 'GENERIC', ...node });
const A = (id, cast, node) => ({ id, type: 'AMBIENT', pool: 'AMBIENT', owner: [...cast].sort().join('-'), cast, ...node });

export const DLG_V6 = [
  // ========================================================
  // サチ(喫茶店の看板娘) × リン(コンビニ店員) — 看板娘どうし
  // ========================================================
  A('DLG_AMB_SACHI_RIN_1', ['CAFEGIRL', 'CLERK'], { cond: 'location == konbini', weight: 18, lines: [
    { sp: 'CAFEGIRL', text: 'リンちゃん、お仕事おつかれさま♪ 差し入れのプリン、持ってきたよ。' },
    { sp: 'CLERK', text: 'わあ、サチさん、いつもありがとうございます。……喫茶店のプリン、絶品なんですよね。' },
    { sp: 'CAFEGIRL', text: 'ふふ、うちの看板メニューだからね。今度はリンちゃんのおすすめ、教えて?' },
  ], effects: ['mutual(CAFEGIRL,CLERK,2)', 'log(AMBIENT)'] }),
  A('DLG_AMB_SACHI_RIN_2', ['CAFEGIRL', 'CLERK'], { weight: 16, lines: [
    { sp: 'CLERK', text: 'サチさん、聞いてくださいよ。今日もヒュウさんに口説かれました……。' },
    { sp: 'CAFEGIRL', text: 'あはは、うちにも来るよ〜。あの人、看板娘コレクターなのかな♪ 気にしない気にしない。' },
    { sp: 'CLERK', text: 'ふふ、サチさんがそう言うと、なんだか気が楽になります。' },
  ], effects: ['mutual(CAFEGIRL,CLERK,1)', 'log(AMBIENT)'] }),
  A('DLG_AMB_SACHI_RIN_3', ['CAFEGIRL', 'CLERK'], { cond: 'time in [NIGHT, MIDNIGHT]', weight: 16, lines: [
    { sp: 'CAFEGIRL', text: 'リンちゃん、夜勤大変でしょ? わたしも今日は遅番だったの。看板娘どうし、がんばろうね。' },
    { sp: 'CLERK', text: 'はい! ……こうして夜にサチさんとお話しできるの、実は楽しみなんです。' },
    { sp: 'CAFEGIRL', text: 'わたしもだよ♪ 今度、お休み合わせて遊びに行こ!' },
  ], effects: ['mutual(CAFEGIRL,CLERK,2)', 'log(AMBIENT)'] }),
  A('DLG_AMB_SACHI_RIN_4', ['CAFEGIRL', 'CLERK'], { cond: 'weather == RAIN', weight: 14, lines: [
    { sp: 'CLERK', text: '雨だと、お客様が少なくて……こういう日は、サチさんが来てくれると嬉しいです。' },
    { sp: 'CAFEGIRL', text: '雨の日はうちも暇なの。じゃあ、あったかいコーヒー淹れてくるね。傘、貸してあげる♪' },
  ], effects: ['mutual(CAFEGIRL,CLERK,1)', 'log(AMBIENT)'] }),
  T('DLG_SACHI_RIN_TALK', 'CAFEGIRL', { weight: 8, lines: [{ sp: 'CAFEGIRL', text: 'コンビニのリンちゃん? いい子だよ〜。看板娘どうし、悩みも似てるから、すっかり仲良しなんです♪' }], effects: ['aff(CAFEGIRL,1)'] }),
  T('DLG_RIN_SACHI_TALK', 'CLERK', { weight: 8, lines: [{ sp: 'CLERK', text: '喫茶店のサチさんですか? 明るくて素敵な先輩です。……この街で最初にできた、女友達なんですよ。' }], effects: ['aff(CLERK,1)'] }),

  // ========================================================
  // ヒュウがコンビニのリンも口説く(リンは丁寧に受け流す)
  // ========================================================
  T('DLG_HYU_FLIRT_RIN_1', 'CLERK', { type: 'TALK', pool: 'FAC', weight: 24, cond: 'location == konbini and npc_at(HYU) == konbini', lines: [
    { sp: 'HYU', text: 'リンさん。深夜のコンビニに佇むあなた……まるで、都会の夜に咲く一輪の花ですね。' },
    { sp: 'CLERK', text: '恐れ入ります、ヒュウ様。……肉まん、あたたまりましたよ。おひとつ150円です。' },
    { sp: 'HYU', text: '……見事な受け流し。喫茶店のサチさんといい、この街の看板娘は手強い。ふふ、だから通ってしまうのですが。' },
  ], effects: ['aff(CLERK,1)', 'mutual(CLERK,HYU,1)', 'log(DAILY)'] }),
  T('DLG_HYU_FLIRT_RIN_2', 'CLERK', { type: 'TALK', pool: 'FAC', weight: 20, cond: 'location == konbini and npc_at(HYU) == konbini', lines: [
    { sp: 'HYU', text: 'リンさん、あなたのレジ打ちの手つき、優雅ですね。私の隣で会計してみませんか?' },
    { sp: 'CLERK', text: 'ふふ、ヒュウ様は今日もお元気ですね。……ポイントカードはお持ちですか?' },
    { sp: 'HYU', text: 'つれない。……ですが、そのプロ意識、嫌いではありませんよ。' },
  ], effects: ['aff(CLERK,1)', 'mutual(CLERK,HYU,1)', 'log(DAILY)'] }),
  A('DLG_AMB_HYU_RIN', ['HYU', 'CLERK'], { cond: 'location == konbini', weight: 16, lines: [
    { sp: 'HYU', text: 'リンさん、今宵の月より、あなたの微笑みの方が明るい。' },
    { sp: 'CLERK', text: 'まあ。……お会計、324円になります、月より明るいお客様♪' },
    { sp: 'HYU', text: '……一本取られましたね。ふふ、また明日も来ます。' },
  ], effects: ['mutual(CLERK,HYU,1)', 'log(AMBIENT)'] }),

  // ========================================================
  // 主要人物ペア会話(季節別)をさらに増量
  // ========================================================
  // 春
  A('DLG_S_HYU_LEN_SPR', ['HYU', 'LENNY'], { cond: 'season == SPRING', lines: [
    { sp: 'HYU', text: 'レニィ、桜の花びらが髪についていますよ。……そのまま寝ないでくださいね。' },
    { sp: 'LENNY', text: 'ふぁ……花びらの毛布、あったかいんだよぉ。' },
  ], effects: ['mutual(HYU,LENNY,1)', 'log(AMBIENT)'] }),
  A('DLG_S_JIN_NEO_SPR', ['JIN', 'NEO'], { cond: 'season == SPRING', lines: [
    { sp: 'JIN', text: '春だぜネオ! 新しいこと始めるにはもってこいだ! 一緒に新メニュー開拓しようぜ!' },
    { sp: 'NEO', text: 'ふはは、良い心意気である! 春は騎士の門出の季節。共に新たな戦場へ繰り出そう!' },
  ], effects: ['mutual(JIN,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_S_GER_MUN_SPR', ['GERU', 'MUNI'], { cond: 'season == SPRING', lines: [
    { sp: 'MUNI', text: 'ゲルおねえちゃん、はるだね! つくしみつけたの!' },
    { sp: 'GERU', text: 'ほう、よく見つけたな。……春は足元に小さな発見が多い。お前は目がいいな、ムニ。' },
  ], effects: ['mutual(GERU,MUNI,1)', 'log(AMBIENT)'] }),
  // 夏
  A('DLG_S_JIN_LEN_SUM', ['JIN', 'LENNY'], { cond: 'season == SUMMER', lines: [
    { sp: 'JIN', text: 'レニィ! 夏だ! 屋上でスイカ割りしようぜ! 俺が棒持つ役な!' },
    { sp: 'LENNY', text: '僕はスイカ役……にはなりたくないなあ。じゃあ、日陰で応援するね。 zzz' },
  ], effects: ['mutual(JIN,LENNY,1)', 'log(AMBIENT)'] }),
  A('DLG_S_HYU_GER_SUM', ['HYU', 'GERU'], { cond: 'season == SUMMER', lines: [
    { sp: 'HYU', text: '夏の夜は蒸し暑い。……ゲル、あなたの部屋、冷房代わりに本の風でも起こしてくれませんか。' },
    { sp: 'GERU', text: '本は扇子じゃない。……まあ、来い。麦茶くらいは出す。夜風も入る、いい部屋だぞ。' },
  ], effects: ['mutual(HYU,GERU,1)', 'log(AMBIENT)'] }),
  A('DLG_S_NEO_MUN_SUM', ['NEO', 'MUNI'], { cond: 'season == SUMMER', lines: [
    { sp: 'MUNI', text: 'ネオおにいちゃん、はなび! みにいこ!' },
    { sp: 'NEO', text: '花火か。……我が故郷の魔法の火とは違うが、あの儚さ、悪くない。よかろう、共に見物といこう。' },
  ], effects: ['mutual(MUNI,NEO,1)', 'log(AMBIENT)'] }),
  // 秋
  A('DLG_S_LEN_GER_AUT', ['LENNY', 'GERU'], { cond: 'season == AUTUMN', lines: [
    { sp: 'GERU', text: 'レニィ、読書の秋だ。お前に一冊、選んでやろうか。……最後まで読めなくても構わん。' },
    { sp: 'LENNY', text: 'えへへ、ゲルが選んでくれるなら、がんばって読むよ。……三ページくらいは。' },
  ], effects: ['mutual(LENNY,GERU,1)', 'log(AMBIENT)'] }),
  A('DLG_S_JIN_MUN_AUT', ['JIN', 'MUNI'], { cond: 'season == AUTUMN', lines: [
    { sp: 'JIN', text: '食欲の秋だ、ムニ! 焼き芋、焼くぞ! ほくほくのやつ!' },
    { sp: 'MUNI', text: 'やきいも! ムニ、いちばんおおきいのがいいの!' },
  ], effects: ['mutual(JIN,MUNI,1)', 'log(AMBIENT)'] }),
  // 冬
  A('DLG_S_HYU_JIN_WIN', ['HYU', 'JIN'], { cond: 'season == WINTER', lines: [
    { sp: 'JIN', text: '寒いなヒュウ! こういう日は鍋だ! みんなで囲もうぜ!' },
    { sp: 'HYU', text: '賛成です。……ただし、取り分けは私が。あなたに任せると、鍋が戦場になりますから。' },
  ], effects: ['mutual(HYU,JIN,1)', 'log(AMBIENT)'] }),
  A('DLG_S_GER_NEO_WIN', ['GERU', 'NEO'], { cond: 'season == WINTER', lines: [
    { sp: 'NEO', text: '冬の夜は長い。……ゲルよ、貴様の部屋で、本と茶と、静かな時間を分かち合わぬか。' },
    { sp: 'GERU', text: '……いい提案だ。布団も貸してやる。ただし、いびきはかくなよ、騎士殿。' },
  ], effects: ['mutual(GERU,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_S_LEN_MUN_WIN', ['LENNY', 'MUNI'], { cond: 'season == WINTER', lines: [
    { sp: 'MUNI', text: 'レニィおにいちゃん、ゆきだ! ゆきだるまつくろ!' },
    { sp: 'LENNY', text: 'いいねえ。……あ、でも、こたつから出るのに、あと十分だけ待って。ね?' },
  ], effects: ['mutual(LENNY,MUNI,1)', 'log(AMBIENT)'] }),

  // ========================================================
  // 主要人物ペア会話(天気別)をさらに増量
  // ========================================================
  // 雨
  A('DLG_W_LEN_HYU_RAIN', ['LENNY', 'HYU'], { cond: 'weather == RAIN', lines: [
    { sp: 'LENNY', text: '雨だね、ヒュウ。……今日は前髪、あきらめた?' },
    { sp: 'HYU', text: '失礼な。フードという名の要塞で守り抜いています。……レニィ、あなたは雨も好きでしたね。羨ましい性分です。' },
  ], effects: ['mutual(HYU,LENNY,1)', 'log(AMBIENT)'] }),
  A('DLG_W_GER_NEO_RAIN', ['GERU', 'NEO'], { cond: 'weather == RAIN', lines: [
    { sp: 'GERU', text: '雨音は読書の友だ。……ネオ、お前もどうだ。傘は一本しかないが、貸してやる。' },
    { sp: 'NEO', text: 'ほう、相合い傘か。……ふ、悪くない。だが濡れるのは私で構わん。姫を濡らすわけにはいかぬ……いや、貴様は姫ではないな。ふはは。' },
  ], effects: ['mutual(GERU,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_W_JIN_MUN_RAIN', ['JIN', 'MUNI'], { cond: 'weather == RAIN', lines: [
    { sp: 'MUNI', text: 'ジンパチおにいちゃん、あめだからおそといけないの……つまんない。' },
    { sp: 'JIN', text: 'なら室内トレーニングだ! 腕立て勝負しようぜ! ……いや、ムニは腹筋10回な!' },
  ], effects: ['mutual(JIN,MUNI,1)', 'log(AMBIENT)'] }),
  // 晴れ
  A('DLG_W_JIN_HYU_SUN', ['JIN', 'HYU'], { cond: 'weather == SUNNY', lines: [
    { sp: 'JIN', text: '快晴だぜヒュウ! 屋上で日光浴しようぜ! ビタミンDだ!' },
    { sp: 'HYU', text: '日焼けは美の大敵です。……ですが、日傘の下でならお付き合いしましょう。あなたの隣は、退屈しませんから。' },
  ], effects: ['mutual(HYU,JIN,1)', 'log(AMBIENT)'] }),
  A('DLG_W_LEN_GER_SUN', ['LENNY', 'GERU'], { cond: 'weather == SUNNY', lines: [
    { sp: 'LENNY', text: 'いいお天気だね、ゲル。……お布団干したいけど、干したら寝ちゃうよぉ。' },
    { sp: 'GERU', text: 'ふ、干した布団で昼寝は、この世の至福だからな。……私も本を持って混ざろうか。' },
  ], effects: ['mutual(LENNY,GERU,1)', 'log(AMBIENT)'] }),
  // くもり
  A('DLG_W_NEO_GER_CLOUD', ['NEO', 'GERU'], { cond: 'weather == CLOUDY', lines: [
    { sp: 'NEO', text: '曇天か。……眩しくもなく、暗くもない。思索に向いた空である。' },
    { sp: 'GERU', text: '同感だ。こういう日は、言葉がよく降りてくる。……お前も、たまにいいことを言うな。' },
  ], effects: ['mutual(GERU,NEO,1)', 'log(AMBIENT)'] }),

  // ========================================================
  // 各施設での主要人物ペア会話(通常)をさらに増量
  // ========================================================
  A('DLG_F_HYU_MUN_CAFE2', ['HYU', 'MUNI'], { cond: 'location == cafe', lines: [
    { sp: 'MUNI', text: 'ヒュウおにいちゃん、なんでいつもきどってるの?' },
    { sp: 'HYU', text: '「気取る」ではなく「魅せる」と言ってください、ムニ。……ふふ、大きくなったら分かりますよ。' },
    { sp: 'MUNI', text: 'ふーん。……ムニ、きどらなくていいや。むにゅ〜。' },
  ], effects: ['mutual(HYU,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_F_JIN_GER_IZA2', ['JIN', 'GERU'], { cond: 'location == izakaya', lines: [
    { sp: 'JIN', text: 'ゲル、お前ほんとジュースばっかだな! たまには飲もうぜ!' },
    { sp: 'GERU', text: '酔ったお前の面倒を見るのは誰だと思ってる。……素面の相手は一人いた方がいい。だから私は飲まん。' },
    { sp: 'JIN', text: '……なんだよ、心配してくれてんのか。へへ、優しいとこあるじゃねえか!' },
  ], effects: ['mutual(JIN,GERU,1)', 'log(AMBIENT)'] }),
  A('DLG_F_NEO_LEN_BOOK', ['NEO', 'LENNY'], { cond: 'location == book', lines: [
    { sp: 'NEO', text: 'レニィ、この騎士物語を読んでみよ。……主人公が、少し貴様に似ておる。よく眠る勇者だ。' },
    { sp: 'LENNY', text: 'えー、そんな勇者いるの? ……じゃあ僕も勇者になれるかも。読んでみるね。zzz' },
    { sp: 'NEO', text: '早くも眠ったか。……まあ、これも勇者の休息である。ふ。' },
  ], effects: ['mutual(LENNY,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_F_HYU_NEO_BARBER', ['HYU', 'NEO'], { cond: 'location == barber', lines: [
    { sp: 'NEO', text: 'ヒュウよ、貴様も髪を切らぬ派か。……我らは、髪に誇りを持つ同志であるな。' },
    { sp: 'HYU', text: 'ええ。前髪は聖域、あなたの金髪は誇り。……オヤジさん泣かせの常連どうし、ですね。ふふ。' },
  ], effects: ['mutual(HYU,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_F_JIN_MUN_YAKI', ['JIN', 'MUNI'], { cond: 'location == yakiniku', lines: [
    { sp: 'JIN', text: 'ムニ! 肉焼けたぞ! ちゃんと野菜も食えよ!' },
    { sp: 'MUNI', text: 'おにくだけがいいの……でも、ジンパチおにいちゃんがいうなら、やさいもたべる!' },
    { sp: 'JIN', text: 'よし、いい子だ! 大きくなるぞー!' },
  ], effects: ['mutual(JIN,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_F_GER_HYU_PHARM', ['GERU', 'HYU'], { cond: 'location == pharmacy', lines: [
    { sp: 'HYU', text: 'ゲル、また目薬ですか。夜更かしは肌の大敵、そして目の敵ですよ。' },
    { sp: 'GERU', text: '分かっている。……お前の美容講座は、カネ婆の小言より効くから困る。' },
  ], effects: ['mutual(HYU,GERU,1)', 'log(AMBIENT)'] }),
  A('DLG_F_LEN_NEO_AQUA2', ['LENNY', 'NEO'], { cond: 'location == aquarium', lines: [
    { sp: 'LENNY', text: 'ネオ、あのおおきい魚、王様みたいだね。' },
    { sp: 'NEO', text: 'うむ、水槽の王か。……だが真の王とは、群れを守る者。あの魚、孤高すぎる。私が話し相手になってやろう。' },
    { sp: 'LENNY', text: 'ふふ、ネオはお魚とも友達になれるんだね。' },
  ], effects: ['mutual(LENNY,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_F_HYU_JIN_GAME2', ['HYU', 'JIN'], { cond: 'location == game', lines: [
    { sp: 'JIN', text: 'ヒュウ! 音ゲー対決だ! 今日こそ勝つぜ!' },
    { sp: 'HYU', text: '指先の優雅さで、私に勝てるとでも? ……いいでしょう。負けたらジュース、で。' },
    { sp: 'JIN', text: 'よっしゃ! ……くっ、また負けた! なんで指だけそんな綺麗に動くんだよ!' },
  ], effects: ['mutual(HYU,JIN,1)', 'log(AMBIENT)'] }),
  A('DLG_F_GER_LEN_SENTO', ['GERU', 'MUNI'], { cond: 'location == market', lines: [
    { sp: 'MUNI', text: 'ゲルおねえちゃん、おかいものてつだうの!' },
    { sp: 'GERU', text: 'ほう、頼もしいな。じゃあ、この卵を頼む。……割らないように、そっとだぞ。' },
    { sp: 'MUNI', text: 'まかせて! ……あ。……ごめんなさい。' },
  ], effects: ['mutual(GERU,MUNI,1)', 'log(AMBIENT)'] }),

  // ========================================================
  // 通常の主要人物の会話をさらに増量(時間帯/天気/季節)
  // ========================================================
  // レニィ
  T('DLG_LEN_V6_1', 'LENNY', { pool: 'COND', cond: 'time == DAY', lines: [{ sp: 'LENNY', text: 'お昼の光ってさ、あったかくて、だんだんまぶたが重くなるんだ。……これは自然現象だから、しょうがないよね。' }], effects: ['aff(LENNY,1)'] }),
  T('DLG_LEN_V6_2', 'LENNY', { pool: 'COND', cond: 'season == SUMMER', lines: [{ sp: 'LENNY', text: '夏はね、風鈴の音を数えながらお昼寝するのが最高なんだよぉ。ちりん、ちりん……zzz' }], effects: ['aff(LENNY,1)'] }),
  T('DLG_LEN_V6_3', 'LENNY', { pool: 'COND', cond: 'weather == CLOUDY', lines: [{ sp: 'LENNY', text: 'くもりの日は、空がお布団かぶってるみたいだね。だから街全体が、ちょっと眠そうだよ。' }], effects: ['aff(LENNY,1)'] }),
  T('DLG_LEN_V6_4', 'LENNY', { lines: [{ sp: 'LENNY', text: 'サチさんもリンさんも、いつも笑顔だよね。……笑顔って、伝染するんだよ。ふぁ、あくびも伝染するけどね。' }], effects: ['aff(LENNY,1)'] }),
  // ヒュウ
  T('DLG_HYU_V6_1', 'HYU', { pool: 'COND', cond: 'time == EVENING', lines: [{ sp: 'HYU', text: '黄昏時は「逢魔が時」とも言いますが……私にとっては「最も美しく撮れる時」です。夕日は私の専属カメラマンですね。' }], effects: ['aff(HYU,1)'] }),
  T('DLG_HYU_V6_2', 'HYU', { pool: 'COND', cond: 'weather == RAIN', lines: [{ sp: 'HYU', text: '雨の日は室内で優雅に。……鏡と紅茶と、私。完璧な三重奏です。' }], effects: ['aff(HYU,1)'] }),
  T('DLG_HYU_V6_3', 'HYU', { pool: 'COND', cond: 'season == WINTER', lines: [{ sp: 'HYU', text: '冬の吐息は白く美しい。……私の吐息だけ、少しキラキラしている気がするのは、気のせいではありませんね。' }], effects: ['aff(HYU,1)'] }),
  T('DLG_HYU_V6_4', 'HYU', { lines: [{ sp: 'HYU', text: 'サチさんとリンさん、あの二人が並ぶと絵になりますね。……私が加われば、傑作になりますが。ふふ。' }], effects: ['aff(HYU,1)'] }),
  // ジンパチ
  T('DLG_JIN_V6_1', 'JIN', { pool: 'COND', cond: 'time == NIGHT', lines: [{ sp: 'JIN', text: '夜のクールダウンも鍛錬のうちだぜ! ストレッチして、明日に備える! 継続は力なりってな!' }], effects: ['aff(JIN,1)'] }),
  T('DLG_JIN_V6_2', 'JIN', { pool: 'COND', cond: 'season == SUMMER', lines: [{ sp: 'JIN', text: '夏の汗は、努力の証だぜ! 塩分補給を忘れずにな! 麦茶がぶ飲みだ!' }], effects: ['aff(JIN,1)'] }),
  T('DLG_JIN_V6_3', 'JIN', { pool: 'COND', cond: 'weather == RAIN', lines: [{ sp: 'JIN', text: '雨の日はよ、なんか心が静かになるんだ。……こういう日は、プラモをじっくり組むに限るぜ。' }], effects: ['aff(JIN,1)', 'info(INFO_JIN_PLAMO)'] }),
  T('DLG_JIN_V6_4', 'JIN', { lines: [{ sp: 'JIN', text: 'コンビニのリンちゃん、夜勤も昼勤もこなして、すげえ働き者だよな。俺、ああいう頑張り屋は尊敬するぜ!' }], effects: ['aff(JIN,1)'] }),
  // ムニ
  T('DLG_MUN_V6_1', 'MUNI', { pool: 'COND', cond: 'time == MORNING', lines: [{ sp: 'MUNI', text: 'おはよ! ムニ、きょうもげんきなの! ……あさごはん、たまごやきだったの!' }], effects: ['aff(MUNI,1)'] }),
  T('DLG_MUN_V6_2', 'MUNI', { pool: 'COND', cond: 'season == WINTER', lines: [{ sp: 'MUNI', text: 'ふゆはね、みんなでおなべするの! ムニ、おもちすきー! むにゅ〜!' }], effects: ['aff(MUNI,1)'] }),
  T('DLG_MUN_V6_3', 'MUNI', { pool: 'COND', cond: 'weather == SUNNY', lines: [{ sp: 'MUNI', text: 'おてんき! みんなでこうえん……あ、こうえんないから、ろじうらたんけんなの!' }], effects: ['aff(MUNI,1)'] }),
  T('DLG_MUN_V6_4', 'MUNI', { lines: [{ sp: 'MUNI', text: 'サチおねえちゃん、さくらんぼ2こいれてくれるの! リンおねえちゃんは、おまけくれるの! やさしいの!' }], effects: ['aff(MUNI,1)'] }),
  // ゲル
  T('DLG_GER_V6_1', 'GERU', { pool: 'COND', cond: 'time == EVENING', lines: [{ sp: 'GERU', text: '夕暮れは、一日で最も物語がよく染みる時間だ。……昼の続きでも、夜の入口でもある。曖昧が心地いい。' }], effects: ['aff(GERU,1)'] }),
  T('DLG_GER_V6_2', 'GERU', { pool: 'COND', cond: 'season == AUTUMN', lines: [{ sp: 'GERU', text: '秋は、本を読むために生まれた季節だ。……いや、私にとっては全部の季節がそうだが、秋は言い訳が立つ。' }], effects: ['aff(GERU,1)'] }),
  T('DLG_GER_V6_3', 'GERU', { pool: 'COND', cond: 'weather == RAIN', lines: [{ sp: 'GERU', text: '雨。……世界の音量が下がって、活字の声だけが大きくなる。私の一番好きな設定だ。' }], effects: ['aff(GERU,1)'] }),
  T('DLG_GER_V6_4', 'GERU', { lines: [{ sp: 'GERU', text: '看板娘が二人か。……サチとリン。ああいう、人を明るくする才能は、私にはない。少し、羨ましいな。' }], effects: ['aff(GERU,1)'] }),
  // ネオ
  T('DLG_NEO_V6_1', 'NEO', { pool: 'COND', cond: 'time == MORNING', lines: [{ sp: 'NEO', text: '朝の光の中で剣を掲げる……のは、この街ではやめておこう。ジンパチの朝稽古に混ぜてもらうとするか。ふ。' }], effects: ['aff(NEO,1)'] }),
  T('DLG_NEO_V6_2', 'NEO', { pool: 'COND', cond: 'season == WINTER', lines: [{ sp: 'NEO', text: '冬の空気は刃のように澄んでいる。……この季節、我が魔剣も心なしか誇らしげである。飾りだがな。ふはは。' }], effects: ['aff(NEO,1)'] }),
  T('DLG_NEO_V6_3', 'NEO', { pool: 'COND', cond: 'weather == SUNNY', lines: [{ sp: 'NEO', text: '快晴! 我が金髪が最も輝く日である! 見よ、この光の反射……ぬ、少々眩しすぎるか。' }], effects: ['aff(NEO,1)'] }),
  T('DLG_NEO_V6_4', 'NEO', { lines: [{ sp: 'NEO', text: 'コンビニの店娘リン、あの受け答えの見事さ、一流の剣士の防御を思わせる。ヒュウの剣戟を、涼しい顔でいなすとはな。天晴れである。' }], effects: ['aff(NEO,1)'] }),
];
