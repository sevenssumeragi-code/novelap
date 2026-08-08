// ============================================================
// v11 追加会話 — 会話バリエーションのさらなる増量
//   (1) プレイヤー×主要6人 恋人会話
//   (2) 主要人物どうしのNPCカップル会話
//   (3) 主要人物2人の通常会話
//   (4) 恋人ではないが仲良くなった2人の会話
//   (5) 各施設・店での会話
// ============================================================
const T = (id, owner, node) => ({ id, owner, type: node.type ?? 'TALK', pool: node.pool ?? 'GENERIC', ...node });
const A = (id, cast, node) => ({ id, type: 'AMBIENT', pool: 'AMBIENT', owner: [...cast].sort().join('-'), cast, ...node });

export const DLG_V11 = [
  // ========================================================
  // (1) プレイヤー×主要人物 恋人会話(rel(PC,X) == LOVER)
  // ========================================================
  // レニィ
  T('DLG_LOVER_LENNY_V11_1', 'LENNY', { pool: 'STATE', cond: 'rel(PC, LENNY) == LOVER', weight: 14, lines: [{ sp: 'LENNY', text: '大家さんと恋人になってから、目覚まし時計がいらなくなったんだ。……大家さんに会いたくて、自然と目が覚めるんだよぉ。ぼくにとっては、大事件だよ?' }], effects: ['aff(LENNY,1)'] }),
  T('DLG_LOVER_LENNY_V11_2', 'LENNY', { pool: 'STATE', cond: 'rel(PC, LENNY) == LOVER and time == NIGHT', weight: 13, lines: [{ sp: 'LENNY', text: '夜になるとね、大家さんの声を思い出しながら眠るんだ。……そうすると、こわい夢を見なくなったの。恋人って、お守りみたいだね。' }], effects: ['aff(LENNY,1)'] }),
  T('DLG_LOVER_LENNY_V11_3', 'LENNY', { pool: 'STATE', cond: 'rel(PC, LENNY) == LOVER and season == SUMMER', weight: 13, lines: [{ sp: 'LENNY', text: '夏の夜風、気持ちいいね。……屋上で大家さんと寝転んで、星を数えながら眠るの。これ、ぼくの夏のいちばんの贅沢なんだ。' }], effects: ['aff(LENNY,1)'] }),
  // ヒュウ
  T('DLG_LOVER_HYU_V11_1', 'HYU', { pool: 'STATE', cond: 'rel(PC, HYU) == LOVER', weight: 14, lines: [{ sp: 'HYU', text: '恋人のあなたに、ひとつ告白を。……実は、あなたの前でだけ、鏡を見る回数が減るのです。あなたの瞳が、一番正直な鏡ですから。ふふ。' }], effects: ['aff(HYU,1)'] }),
  T('DLG_LOVER_HYU_V11_2', 'HYU', { pool: 'STATE', cond: 'rel(PC, HYU) == LOVER and time == NIGHT', weight: 13, lines: [{ sp: 'HYU', text: '夜のスキンケアを、あなたに見られるのは、少し照れますね。……ですが、素の私を見せられるのは、恋人の特権。特別に、許可します。' }], effects: ['aff(HYU,1)'] }),
  T('DLG_LOVER_HYU_V11_3', 'HYU', { pool: 'STATE', cond: 'rel(PC, HYU) == LOVER and season == AUTUMN', weight: 13, lines: [{ sp: 'HYU', text: '秋の夕暮れは、私を最も美しく見せる季節です。……この絶景を、あなたと二人で独り占めできるなんて。恋人とは、贅沢なものですね。' }], effects: ['aff(HYU,1)'] }),
  // ジンパチ
  T('DLG_LOVER_JIN_V11_1', 'JIN', { pool: 'STATE', cond: 'rel(PC, JIN) == LOVER', weight: 14, lines: [{ sp: 'JIN', text: 'なあ、恋人ってのはよ、勝ち負けじゃねえんだな。……お前が隣で笑ってるだけで、俺、もう勝った気分になるんだ。……くうっ、また恥ずいこと言った!' }], effects: ['aff(JIN,1)'] }),
  T('DLG_LOVER_JIN_V11_2', 'JIN', { pool: 'STATE', cond: 'rel(PC, JIN) == LOVER and time == MORNING', weight: 13, lines: [{ sp: 'JIN', text: 'おはよう! 朝いちばんにお前の顔見ると、今日も一日いけるって気になるぜ! ……朝の鍛錬より、お前に会うほうが元気出るとか、内緒な!' }], effects: ['aff(JIN,1)'] }),
  T('DLG_LOVER_JIN_V11_3', 'JIN', { pool: 'STATE', cond: 'rel(PC, JIN) == LOVER and weather == SUNNY', weight: 13, lines: [{ sp: 'JIN', text: '快晴だ! こんな日はお前とどっか行きてえな! ……手つないで街を歩くだけでいい。それだけで、俺は世界一の幸せもんだぜ!' }], effects: ['aff(JIN,1)'] }),
  // ゲル
  T('DLG_LOVER_GERU_V11_1', 'GERU', { pool: 'STATE', cond: 'rel(PC, GERU) == LOVER', weight: 14, lines: [{ sp: 'GERU', text: 'あんたと恋人になって気づいた。……私はずっと、物語の中に逃げていたんだな。だが今は、現実のほうが、どんな名作より続きが気になる。あんたのせいだ。' }], effects: ['aff(GERU,1)'] }),
  T('DLG_LOVER_GERU_V11_2', 'GERU', { pool: 'STATE', cond: 'rel(PC, GERU) == LOVER and time == MORNING', weight: 13, lines: [{ sp: 'GERU', text: '朝が来るのが、少し楽しみになった。……夜型の私がこんなことを言うとはな。あんたの寝顔で始まる朝は、悪くない。……ふ、笑うなよ。' }], effects: ['aff(GERU,1)'] }),
  T('DLG_LOVER_GERU_V11_3', 'GERU', { pool: 'STATE', cond: 'rel(PC, GERU) == LOVER and season == SPRING', weight: 13, lines: [{ sp: 'GERU', text: '春だ。……あんたと桜の下で本を読むために、栞を新しくしたんだ。この一頁は、きっと一生色褪せない。恋人と過ごす春は、そういうものらしいな。' }], effects: ['aff(GERU,1)'] }),
  // ネオ
  T('DLG_LOVER_NEO_V11_1', 'NEO', { pool: 'STATE', cond: 'rel(PC, NEO) == LOVER', weight: 14, lines: [{ sp: 'NEO', text: '我が愛しき主よ。騎士とは孤独なものと思うておった。……だが貴様と出会い、その定めは覆った。孤高ではなく、共に在る。それが、真の強さであったのだな。' }], effects: ['aff(NEO,1)'] }),
  T('DLG_LOVER_NEO_V11_2', 'NEO', { pool: 'STATE', cond: 'rel(PC, NEO) == LOVER and time == EVENING', weight: 13, lines: [{ sp: 'NEO', text: '黄昏の空を、貴様と眺める。……我が故郷でも、こうして愛する者と夕陽を見た者は、幸福な一生を送るという。ならば、我らの未来も明るいな。ふ。' }], effects: ['aff(NEO,1)'] }),
  T('DLG_LOVER_NEO_V11_3', 'NEO', { pool: 'STATE', cond: 'rel(PC, NEO) == LOVER and weather == RAIN', weight: 13, lines: [{ sp: 'NEO', text: '雨か。……我が一本の傘、貴様に差そう。濡れるのは我で構わぬ。愛する者を雨に晒すなど、騎士の名折れであるからな。……そら、こちらへ来い。' }], effects: ['aff(NEO,1)'] }),
  // ムニ(家族)
  T('DLG_FAM_MUNI_V11_1', 'MUNI', { pool: 'STATE', cond: 'rel(PC, MUNI) == FAMILY', weight: 14, lines: [{ sp: 'MUNI', text: 'おおやさん、ムニね、きめたの! おおきくなったら、おおやさんみたいに、みんなにやさしいひとになるの! かぞくのおおやさんが、ムニのおてほんなの!' }], effects: ['aff(MUNI,1)'] }),
  T('DLG_FAM_MUNI_V11_2', 'MUNI', { pool: 'STATE', cond: 'rel(PC, MUNI) == FAMILY and season == WINTER', weight: 13, lines: [{ sp: 'MUNI', text: 'さむいねー。……おおやさん、てつないでいい? かぞくのては、あったかいって、ゲルおねえちゃんがいってたの。……ほんとだ、あったかい! えへへ。' }], effects: ['aff(MUNI,1)'] }),

  // ========================================================
  // (2) 主要人物どうしのNPCカップル会話(rel(A,B) == LOVER)
  // ========================================================
  A('DLG_NPCPL_HYU_LEN_V11', ['HYU', 'LENNY'], { cond: 'rel(HYU, LENNY) == LOVER', weight: 17, lines: [
    { sp: 'HYU', text: 'レニィ、あなたの寝顔をスケッチしてみました。……ほら、この安らかな表情。私の描く絵の中で、一番の傑作です。' },
    { sp: 'LENNY', text: 'えー、恥ずかしいよぉ。……でも、ヒュウが描いてくれたなら、宝物にする。ぼくたちの、はじめての合作だね。' },
  ], effects: ['mutual(HYU,LENNY,1)', 'log(AMBIENT)'] }),
  A('DLG_NPCPL_JIN_NEO_V11', ['JIN', 'NEO'], { cond: 'rel(JIN, NEO) == LOVER', weight: 17, lines: [
    { sp: 'JIN', text: 'ネオ、お前と付き合うようになって、鍛錬がもっと楽しくなったぜ! 隣に相棒がいるって、こんなに心強えんだな!' },
    { sp: 'NEO', text: 'うむ! 我も同じ思いである。剣を交える恋人など、この世に我らだけであろう。……ふはは、最強の二人であるな!' },
  ], effects: ['mutual(JIN,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_NPCPL_GER_NEO_V11', ['GERU', 'NEO'], { cond: 'rel(GERU, NEO) == LOVER', weight: 17, lines: [
    { sp: 'GERU', text: 'ネオ、お前の故郷の話、もっと聞かせてくれ。……恋人のことは、全部知っておきたいんだ。物語より、お前の過去のほうが、今は読みたい。' },
    { sp: 'NEO', text: '……いいだろう。貴様になら、全て語ろう。我が誇りも、我が後悔も。……こうして胸のうちを明かせる相手を得たこと、我が旅の最大の宝である。' },
  ], effects: ['mutual(GERU,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_NPCPL_HYU_JIN_V11', ['HYU', 'JIN'], { cond: 'rel(HYU, JIN) == LOVER', weight: 17, lines: [
    { sp: 'HYU', text: 'ジンパチくん、あなたの鍛錬を見ているのが、最近の私の楽しみです。……汗を流すあなたも、なかなか絵になりますよ。' },
    { sp: 'JIN', text: 'そ、そうか? ……お前に見られてると思うと、いつもより力が出るんだよな。……へへ、恋人の応援って、プロテインより効くぜ!' },
  ], effects: ['mutual(HYU,JIN,1)', 'log(AMBIENT)'] }),
  A('DLG_NPCPL_LEN_NEO_V11', ['LENNY', 'NEO'], { cond: 'rel(LENNY, NEO) == LOVER', weight: 17, lines: [
    { sp: 'NEO', text: 'レニィよ、貴様が眠るまで、我がそばにおろう。……騎士の見張りがあれば、悪夢も寄りつけまい。安心して夢の国へ発て。' },
    { sp: 'LENNY', text: 'えへへ……ネオがいると、いちばん深く眠れるんだ。……ぼくの夢の中にも、遊びに来てね。おやすみ、騎士さま……zzz' },
  ], effects: ['mutual(LENNY,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_NPCPL_GER_HYU_V11', ['GERU', 'HYU'], { cond: 'rel(GERU, HYU) == LOVER', weight: 17, lines: [
    { sp: 'HYU', text: 'ゲル、あなたと過ごす夜は、静かで満たされます。……あなたが本を読み、私がその横顔を眺める。これ以上、美しい時間はありません。' },
    { sp: 'GERU', text: '……ふ、私の横顔ばかり見ていて、退屈しないか。まあ、いい。お前という読者がいるなら、私の夜も、悪くない物語になりそうだ。' },
  ], effects: ['mutual(GERU,HYU,1)', 'log(AMBIENT)'] }),
  A('DLG_NPCPL_JIN_LEN_V11', ['JIN', 'LENNY'], { cond: 'rel(JIN, LENNY) == LOVER', weight: 17, lines: [
    { sp: 'LENNY', text: 'ジンパチ、いつもぼくが寝ちゃってごめんね。……起きてる時間、もっといっしょにいたいんだけど。' },
    { sp: 'JIN', text: 'バカ、気にすんな! お前が安心して寝てくれるのが、俺は嬉しいんだ。……寝顔を守るのも、恋人の役目だからな! どーんと任せろ!' },
  ], effects: ['mutual(JIN,LENNY,1)', 'log(AMBIENT)'] }),

  // ========================================================
  // (3) 主要人物2人の通常会話(場所/時間/季節/天気)
  // ========================================================
  A('DLG_N_HYU_NEO_ROOF_V11', ['HYU', 'NEO'], { cond: 'location == ROOF', lines: [
    { sp: 'NEO', text: 'ヒュウよ、屋上からの眺めは絶景である。この街を一望する気分、まさに城主のようであるな。' },
    { sp: 'HYU', text: 'ふふ、同感です。ただし、この絶景に立つ私自身が、最も見応えのある風景ですが。……あなたも、隣にいれば様になりますよ、ネオさん。' },
  ], effects: ['mutual(HYU,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_N_LEN_JIN_GROUND_V11', ['LENNY', 'JIN'], { cond: 'location == GROUND', lines: [
    { sp: 'JIN', text: 'レニィ! 路地でも寝るのか! せめて座って寝ろよ、危ねえだろ!' },
    { sp: 'LENNY', text: 'ん……ジンパチが見張っててくれるから、平気だよぉ。……あ、ちゃんとありがとうって思ってるよ。' },
    { sp: 'JIN', text: '……しょうがねえな。ほら、俺の膝貸してやる。ちゃんとしたとこで寝ろ。' },
  ], effects: ['mutual(JIN,LENNY,1)', 'log(AMBIENT)'] }),
  A('DLG_N_GER_MUN_ROOF_V11', ['GERU', 'MUNI'], { cond: 'location == ROOF', lines: [
    { sp: 'MUNI', text: 'ゲルおねえちゃん、おそらのほん、よんでるの?' },
    { sp: 'GERU', text: 'ふ、うまいことを言う。……空は、毎日ちがう物語を書く本だ。今日の頁は、羊の群れが横切っていくな。お前も一緒に読むか、ムニ。' },
  ], effects: ['mutual(GERU,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_N_HYU_JIN_GROUND_V11', ['HYU', 'JIN'], { cond: 'location == GROUND', lines: [
    { sp: 'JIN', text: 'ヒュウ! 路地でランニングしてたら、お前の後ろ姿とすれ違ったぜ! お前、歩き方まで決まってんな!' },
    { sp: 'HYU', text: '当然です。歩く姿すら作品ですから。……あなたの全力疾走も、それはそれで、清々しくて悪くありませんでしたよ。' },
  ], effects: ['mutual(HYU,JIN,1)', 'log(AMBIENT)'] }),
  A('DLG_N_LEN_GER_MORNING_V11', ['LENNY', 'GERU'], { cond: 'time == MORNING', lines: [
    { sp: 'GERU', text: 'レニィ、朝から眠そうだな。……夜、何時に寝た。' },
    { sp: 'LENNY', text: 'ん……たぶん、寝てないよ。ずっと寝てたから、いつ起きてたのか分かんないんだ。えへへ。' },
    { sp: 'GERU', text: '……哲学的だな。まあ、お前らしい朝の挨拶だ。ほら、コーヒーでも飲め。目が覚めるぞ。' },
  ], effects: ['mutual(LENNY,GERU,1)', 'log(AMBIENT)'] }),
  A('DLG_N_HYU_MUN_DAY_V11', ['HYU', 'MUNI'], { cond: 'time == DAY', lines: [
    { sp: 'MUNI', text: 'ヒュウおにいちゃん、おひるだよ! いっしょにあそぼ!' },
    { sp: 'HYU', text: 'ふふ、いいでしょう。ただし、私の服を汚さない遊びに限りますよ。……そうですね、影踏みでもしましょうか。優雅にね。' },
  ], effects: ['mutual(HYU,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_N_JIN_NEO_NIGHT_V11', ['JIN', 'NEO'], { cond: 'time == NIGHT', lines: [
    { sp: 'JIN', text: 'ネオ、夜の屋上で語り合うの、いいよな。星見ながら、明日の目標決めるんだ。' },
    { sp: 'NEO', text: 'うむ。星は騎士の道標。……貴様と見上げる夜空は、故郷のそれより、なぜか温かく感じるのである。不思議なものよ。' },
  ], effects: ['mutual(JIN,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_N_GER_HYU_MIDNIGHT_V11', ['GERU', 'HYU'], { cond: 'time == MIDNIGHT', lines: [
    { sp: 'HYU', text: 'ゲル、こんな時間まで起きているのは、美容に悪いですよ。……とはいえ、私も人のことは言えませんが。' },
    { sp: 'GERU', text: 'ふ、夜更かし仲間だな。……真夜中の静けさは、お前のような賑やかな者にも、たまには必要だろう。ほら、隣に座れ。茶を淹れる。' },
  ], effects: ['mutual(GERU,HYU,1)', 'log(AMBIENT)'] }),
  A('DLG_N_LEN_NEO_SPRING_V11', ['LENNY', 'NEO'], { cond: 'season == SPRING', lines: [
    { sp: 'LENNY', text: 'ネオ、桜のはなびら、剣についてるよ。……戦う騎士さまに、春がくっついてるみたい。' },
    { sp: 'NEO', text: 'ぬ、これは……。花の剣か。ふ、悪くない。今日ばかりは、この剣で花を散らすとしよう。……美しき春の一幕である。' },
  ], effects: ['mutual(LENNY,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_N_MUN_JIN_SUMMER_V11', ['MUNI', 'JIN'], { cond: 'season == SUMMER', lines: [
    { sp: 'MUNI', text: 'ジンパチおにいちゃん、せみ! つかまえて!' },
    { sp: 'JIN', text: 'よーし任せろ! ……そーっと、そーっと……よし、ゲット! ほら、ムニ! ……あ、逃がしてやれよ。夏はまだ長いからな!' },
  ], effects: ['mutual(JIN,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_N_HYU_GER_AUTUMN_V11', ['HYU', 'GERU'], { cond: 'season == AUTUMN', lines: [
    { sp: 'HYU', text: 'ゲル、紅葉が見頃ですね。あの赤、私の瞳の色に少し似ていると思いませんか。' },
    { sp: 'GERU', text: '……確かに、燃えるような赤だな。秋は、お前のような華やかな者が映える季節だ。ふ、たまには外に連れ出してやろうか。読書は後回しでな。' },
  ], effects: ['mutual(HYU,GERU,1)', 'log(AMBIENT)'] }),
  A('DLG_N_JIN_LEN_WINTER_V11', ['JIN', 'LENNY'], { cond: 'season == WINTER', lines: [
    { sp: 'JIN', text: 'レニィ! 寒いからって布団に潜ってばっかじゃダメだぞ! ……って、もう寝てるし! しょうがねえ、鍋作って起こしてやるか!' },
    { sp: 'LENNY', text: 'ん……鍋の匂い……。ジンパチ、やさしいね。……冬は、あったかい人のそばがいちばんだよぉ。' },
  ], effects: ['mutual(JIN,LENNY,1)', 'log(AMBIENT)'] }),
  A('DLG_N_GER_NEO_RAIN_V11', ['GERU', 'NEO'], { cond: 'weather == RAIN', lines: [
    { sp: 'GERU', text: 'ネオ、雨だ。……こういう日は、お前の故郷の話を聞くのに、ちょうどいい。雨音が、遠い国の物語を引き立てる。' },
    { sp: 'NEO', text: '……よかろう。雨の日は、我も口が軽くなる。我が城の、雨の日の思い出を語ろう。……貴様が聞き手なら、いくらでも話せるのである。' },
  ], effects: ['mutual(GERU,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_N_MUN_LEN_SUNNY_V11', ['MUNI', 'LENNY'], { cond: 'weather == SUNNY', lines: [
    { sp: 'MUNI', text: 'レニィおにいちゃん、おひさまぽかぽか! おひるねびよりなの!' },
    { sp: 'LENNY', text: 'わかってるね、ムニ。……こういう日は、なにもしないのが正解なんだ。ほら、いっしょにひなたぼっこしよ。……zzz' },
  ], effects: ['mutual(LENNY,MUNI,1)', 'log(AMBIENT)'] }),

  // ========================================================
  // (4) 恋人ではないが仲良くなった2人の会話
  //     (mutual >= 55 and rel != LOVER)
  // ========================================================
  A('DLG_FRND_GER_NEO_V11', ['GERU', 'NEO'], { cond: 'mutual(GERU, NEO) >= 55 and rel(GERU, NEO) != LOVER', weight: 15, lines: [
    { sp: 'NEO', text: 'ゲルよ、貴様とは恋には落ちぬが……無言で本を読み合える友は、得難い。この静寂を共にできる者は、貴様だけである。' },
    { sp: 'GERU', text: '同感だ。喋らなくても気まずくならない相手というのは、恋人よりも稀有かもしれん。……お前とは、いい読書仲間だ。長く続けたいものだな。' },
  ], effects: ['mutual(GERU,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_FRND_HYU_LEN_V11', ['HYU', 'LENNY'], { cond: 'mutual(HYU, LENNY) >= 55 and rel(HYU, LENNY) != LOVER', weight: 15, lines: [
    { sp: 'LENNY', text: 'ヒュウって、みんなの前だとキメてるのに、ぼくの前だとあくびするよね。……それって、気を許してる証拠でしょ? 親友の。' },
    { sp: 'HYU', text: '……ばれていましたか。ええ、あなたの前だと、なぜか鎧を脱いでしまう。不思議な友人ですよ、あなたは。心地よい、という意味で。' },
  ], effects: ['mutual(HYU,LENNY,1)', 'log(AMBIENT)'] }),
  A('DLG_FRND_JIN_GER_V11', ['JIN', 'GERU'], { cond: 'mutual(JIN, GERU) >= 55 and rel(JIN, GERU) != LOVER', weight: 15, lines: [
    { sp: 'JIN', text: 'ゲル、お前って俺と真逆なのに、なんか話が合うんだよな。恋人じゃねえけど、一番の親友だと思ってるぜ!' },
    { sp: 'GERU', text: 'ふ、静と動、というやつだな。……お前の無鉄砲を、私が止める。私の理屈を、お前が壊す。悪くない補完関係だ。良き友だよ、お前は。' },
  ], effects: ['mutual(JIN,GERU,1)', 'log(AMBIENT)'] }),
  A('DLG_FRND_LEN_MUN_V11', ['LENNY', 'MUNI'], { cond: 'mutual(LENNY, MUNI) >= 55 and rel(LENNY, MUNI) != LOVER', weight: 15, lines: [
    { sp: 'MUNI', text: 'レニィおにいちゃん、ムニがおおきくなっても、おひるねともだちでいてくれる?' },
    { sp: 'LENNY', text: 'もちろんだよ。……ぼくたちは、一生お昼寝仲間。世界でいちばん平和な親友だよぉ。約束、ゆびきりしよ。' },
  ], effects: ['mutual(LENNY,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_FRND_HYU_NEO_V11', ['HYU', 'NEO'], { cond: 'mutual(HYU, NEO) >= 55 and rel(HYU, NEO) != LOVER', weight: 15, lines: [
    { sp: 'HYU', text: 'ネオさん、あなたとは良き美の同志ですね。恋敵でも恋人でもなく……美を競い、認め合う、稀有な友です。' },
    { sp: 'NEO', text: 'うむ! 貴様の美への執念、我が騎士道に通ず。並び立つ好敵手にして親友……これほど心躍る関係もあるまい。ふはは!' },
  ], effects: ['mutual(HYU,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_FRND_GER_MUN_V11', ['GERU', 'MUNI'], { cond: 'mutual(GERU, MUNI) >= 55 and rel(GERU, MUNI) != LOVER', weight: 15, lines: [
    { sp: 'MUNI', text: 'ゲルおねえちゃん、こんやのえほん、ムニがえらんでいい?' },
    { sp: 'GERU', text: 'ああ、いいだろう。……お前が選ぶ本は、いつも意外で面白い。子供の感性というのは、侮れんな。今夜も楽しみにしているぞ、我が小さな親友。' },
  ], effects: ['mutual(GERU,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_FRND_JIN_LEN_V11', ['JIN', 'LENNY'], { cond: 'mutual(JIN, LENNY) >= 55 and rel(JIN, LENNY) != LOVER', weight: 15, lines: [
    { sp: 'LENNY', text: 'ジンパチはうるさいけど……いないと物足りないんだよね。それって、親友ってことでいいのかな。' },
    { sp: 'JIN', text: 'おう、間違いねえ! お前みたいなのんびり屋が隣にいると、俺も少し落ち着けるんだ。おあいこだな、親友!' },
  ], effects: ['mutual(JIN,LENNY,1)', 'log(AMBIENT)'] }),
  A('DLG_FRND_MUN_HYU_V11', ['MUNI', 'HYU'], { cond: 'mutual(MUNI, HYU) >= 55 and rel(MUNI, HYU) != LOVER', weight: 15, lines: [
    { sp: 'MUNI', text: 'ヒュウおにいちゃん、ムニのこと、いもうとみたいにおもってる?' },
    { sp: 'HYU', text: '……ええ、妹のように、ね。あなたが転ぶと、私の完璧な平静が、少しだけ乱れる。これは、大切な家族にしか起きない現象ですよ、ムニ。' },
  ], effects: ['mutual(HYU,MUNI,1)', 'log(AMBIENT)'] }),

  // ========================================================
  // (5) 各施設・店での会話バリエーション
  // ========================================================
  A('DLG_F_JIN_HYU_CAFE_V11', ['JIN', 'HYU'], { cond: 'location == cafe', lines: [
    { sp: 'JIN', text: 'ヒュウ、お前いつもここのコーヒー頼むよな。俺にはよく分かんねえ味だけど。' },
    { sp: 'HYU', text: 'この一杯の苦味と香りの調和が分からないとは……仕方のない人ですね。ほら、私のを一口。大人の味を教えてあげます。……どうです?' },
    { sp: 'JIN', text: '……にげえ! でも、なんか、クセになるな、これ!' },
  ], effects: ['mutual(HYU,JIN,1)', 'log(AMBIENT)'] }),
  A('DLG_F_NEO_MUN_BOOK_V11', ['NEO', 'MUNI'], { cond: 'location == book', lines: [
    { sp: 'MUNI', text: 'ネオおにいちゃん、きしさまのえほん、よんで!' },
    { sp: 'NEO', text: 'ふはは、よかろう! この騎士は竜を倒し、姫を救う……いや、ムニ。真の騎士は、力なき者を守る者だ。覚えておくがよい。さあ、続きを読もう。' },
  ], effects: ['mutual(MUNI,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_F_GER_LEN_RAMEN_V11', ['GERU', 'LENNY'], { cond: 'location == ramen', lines: [
    { sp: 'GERU', text: 'レニィ、湯気で眠るなよ。麺が伸びるぞ。……ほら、私が取り分けてやる。ふうふうして食え。' },
    { sp: 'LENNY', text: 'ゲル、やさしいね……。あったかいラーメンと、ゲルの声。……これ、最高の子守唄セットだよぉ。あ、ちゃんと食べるよ。' },
  ], effects: ['mutual(LENNY,GERU,1)', 'log(AMBIENT)'] }),
  A('DLG_F_JIN_NEO_DAGASHI_V11', ['JIN', 'NEO'], { cond: 'location == dagashi', lines: [
    { sp: 'JIN', text: 'ネオ、10円ゲームやろうぜ! ……って、お前、真剣な顔しすぎだろ! 駄菓子だぞ!' },
    { sp: 'NEO', text: '一戦は一戦である! 例え10圓の勝負であろうと、騎士は全力を尽くす! ……ぬ、外れた。運命とは非情なり!' },
  ], effects: ['mutual(JIN,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_F_LEN_HYU_CAKE_V11', ['LENNY', 'HYU'], { cond: 'location == cake', lines: [
    { sp: 'LENNY', text: 'ヒュウ、このケーキふわふわだね……雲みたい。食べたら夢見心地で眠くなりそう。' },
    { sp: 'HYU', text: 'ふふ、あなたは何を食べても眠くなりますね。……ですが、その幸せそうな顔を見ていると、私まで甘く満たされます。もう一つ、頼みましょうか。' },
  ], effects: ['mutual(HYU,LENNY,1)', 'log(AMBIENT)'] }),
  A('DLG_F_GER_MUN_GAME_V11', ['GERU', 'MUNI'], { cond: 'location == game', lines: [
    { sp: 'MUNI', text: 'ゲルおねえちゃん、クレーンゲーム! あのくまさん、とって!' },
    { sp: 'GERU', text: '……ふ、任せろ。こういうものは、狙いを定めて、一気にな。……む、惜しい。もう一回だ。お前のためなら、意地でも取ってやる。' },
  ], effects: ['mutual(GERU,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_F_HYU_NEO_FLOWER_V11', ['HYU', 'NEO'], { cond: 'location == flower', lines: [
    { sp: 'HYU', text: 'ネオさん、薔薇を選んでいるのですか。……美の探究者どうし、花の趣味も合いそうですね。' },
    { sp: 'NEO', text: 'うむ、この赤薔薇の凛々しさ、騎士の心に響く。……貴様は白薔薇が似合いそうだ。清廉にして高貴。ふ、一輪、贈ろうか。' },
  ], effects: ['mutual(HYU,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_F_JIN_GER_SENTO_V11', ['JIN', 'GERU'], { cond: 'location == sento', lines: [
    { sp: 'JIN', text: 'ゲルは女湯か! おーい、壁越しに聞こえるか! 湯加減どうだー!' },
    { sp: 'GERU', text: '……うるさい男だ。ちょうどいいと言っておく。ほら、のぼせる前に上がれよ。お前は限界まで浸かる悪癖があるからな。……心配してやってるんだぞ。' },
  ], effects: ['mutual(JIN,GERU,1)', 'log(AMBIENT)'] }),
  A('DLG_F_HYU_MUN_AQUA_V11', ['HYU', 'MUNI'], { cond: 'location == aquarium', lines: [
    { sp: 'MUNI', text: 'ヒュウおにいちゃん、くらげ、ひかってきれい!' },
    { sp: 'HYU', text: '本当ですね。……透き通って、揺らめいて。あの儚い美しさは、私にも真似できません。ムニ、美しいものを美しいと思える心は、宝物ですよ。' },
  ], effects: ['mutual(HYU,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_F_LEN_NEO_IZAKAYA_V11', ['LENNY', 'NEO'], { cond: 'location == izakaya', lines: [
    { sp: 'NEO', text: 'レニィ、閉店間際のこの静けさ、良いものであろう。……貴様のように、こういう時間を愛せる者は、話が合う。' },
    { sp: 'LENNY', text: 'うん……しずかで、灯りがやさしくて。ネオといると、ぼく、安心して……あ、寝そう。でも、いい時間だね。' },
  ], effects: ['mutual(LENNY,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_F_GER_JIN_TOYSHOP_V11', ['GERU', 'JIN'], { cond: 'location == toyshop', lines: [
    { sp: 'JIN', text: 'ゲル、お前もプラモ興味あんのか? 意外だな!' },
    { sp: 'GERU', text: '塗料の棚を見ていただけだ。……色の名前が、まるで詩でな。「夜明けの空」「深海の青」……眺めているだけで物語が浮かぶ。お前とは違う楽しみ方だ。ふ。' },
  ], effects: ['mutual(JIN,GERU,1)', 'log(AMBIENT)'] }),
  A('DLG_F_LEN_MUN_KONBINI_V11', ['LENNY', 'MUNI'], { cond: 'location == konbini', lines: [
    { sp: 'MUNI', text: 'レニィおにいちゃん、よるのコンビニ、あかるいね!' },
    { sp: 'LENNY', text: 'うん、水槽みたいだね。……夜なのに明るくて、なんだか安心する。ムニ、遅くまで起きてちゃダメだよ? ……って、ぼくが言えた義理じゃないか。えへへ。' },
  ], effects: ['mutual(LENNY,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_F_HYU_NEO_YAKINIKU_V11', ['HYU', 'NEO'], { cond: 'location == yakiniku', lines: [
    { sp: 'HYU', text: 'ネオさん、煙で髪が……。ですが、あなたの肉を焼く所作、なぜか品がありますね。悔しいですが。' },
    { sp: 'NEO', text: 'ふ、騎士は火の扱いも心得ておる。……見よ、この焼き加減。戦場の焚き火で鍛えた腕である。貴様の分も焼いてやろう。遠慮するな。' },
  ], effects: ['mutual(HYU,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_F_JIN_MUN_CINEMA_V11', ['JIN', 'MUNI'], { cond: 'location == cinema', lines: [
    { sp: 'MUNI', text: 'ジンパチおにいちゃん、あのヒーロー、つよいね! ジンパチおにいちゃんみたい!' },
    { sp: 'JIN', text: 'そうか!? はは、嬉しいこと言ってくれるな! ……よーし、俺もあのヒーローに負けねえよう、もっと鍛えるぜ! ムニ、応援してろよ!' },
  ], effects: ['mutual(JIN,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_F_GER_HYU_DONUT_V11', ['GERU', 'HYU'], { cond: 'location == donut', lines: [
    { sp: 'HYU', text: 'ゲル、あなたもドーナツを? 甘いものは、あなたの硬質なイメージには意外ですね。' },
    { sp: 'GERU', text: '……本を読みながらつまむのに、ちょうどいいんだ。悪いか。お前こそ、美容に甘いものは大敵だろう。……ふ、一つ、半分こするか。内緒でな。' },
  ], effects: ['mutual(GERU,HYU,1)', 'log(AMBIENT)'] }),
  A('DLG_F_JIN_NEO_CHURCH_V11', ['JIN', 'NEO'], { cond: 'location == church', lines: [
    { sp: 'JIN', text: 'ネオ、教会って静かで背筋が伸びるよな。……お前、こういうとこ似合うな。騎士だからか?' },
    { sp: 'NEO', text: 'うむ。騎士は戦の前に祈りを捧げるもの。……この静寂は、心を研ぎ澄ます。ジンパチ、貴様も隣で、しばし黙して祈ってみよ。悪くないぞ。' },
  ], effects: ['mutual(JIN,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_F_LEN_HYU_KARAOKE_V11', ['LENNY', 'HYU'], { cond: 'location == karaoke', lines: [
    { sp: 'HYU', text: 'レニィ、あなたの番ですよ。……って、もうソファで寝ている。まったく。では、あなたの子守唄がわりに、私がバラードを一曲。' },
    { sp: 'LENNY', text: 'ん……ヒュウの歌、きれいだね……。このまま、いい夢見られそう……zzz。……アンコール。' },
  ], effects: ['mutual(HYU,LENNY,1)', 'log(AMBIENT)'] }),
  A('DLG_F_GER_MUN_HALL_V11', ['GERU', 'MUNI'], { cond: 'location == hall', lines: [
    { sp: 'MUNI', text: 'ゲルおねえちゃん、しゅうかいじょ、ひろいね! こえ、ひびくの!' },
    { sp: 'GERU', text: 'ふ、何もない広間というのは、想像力を掻き立てるものだ。……ここでお前と二人、絵本を朗読するのも一興だな。声がよく響く。特等席だぞ、ムニ。' },
  ], effects: ['mutual(GERU,MUNI,1)', 'log(AMBIENT)'] }),
];
