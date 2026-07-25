// ============================================================
// v4 追加会話
//   ・恋人システム(告白イベント / 恋人会話 / ムニ家族 / NPC同士カップル)
//   ・季節イベントの集合会話(集会所・カネ参加版あり)
//   ・新施設(ケーキ屋/病院/水族館/魚屋/焼肉屋/集会所)の主要人物ペア会話
//   ・カラオケのデュエット
//   ・ネオの魔法剣士設定を各所に
//   ・各施設の主要人物ペア会話をさらに増量
// ============================================================
const T = (id, owner, node) => ({ id, owner, type: node.type ?? 'TALK', pool: node.pool ?? 'GENERIC', ...node });
const A = (id, cast, node) => ({ id, type: 'AMBIENT', pool: 'AMBIENT', owner: [...cast].sort().join('-'), cast, ...node });
const ALLMAIN = ['LENNY', 'HYU', 'JIN', 'GERU', 'MUNI', 'NEO'];

export const DLG_V4 = [
  // ========================================================
  // 告白イベント (唯一無二=親密度90+ で発生 / 恋人は1人だけ)
  // ========================================================
  T('DLG_CONFESS_LENNY', 'LENNY', {
    type: 'EVENT', pool: 'EVENT', once: true, cond: 'rank(PC, LENNY) >= 6 and can_be_lover(LENNY)',
    lines: [
      { sp: 'LENNY', text: 'あのね、大家さん。……起きてるときにこんなこと言うの、はじめてかも。' },
      { sp: 'LENNY', text: '僕、大家さんの隣だと、いちばんよく眠れて……いちばん、起きていたいって思うんだ。' },
      { sp: 'LENNY', text: '……これって、好きってことだよね。大家さんは、どう思う?' },
    ],
    choices: [
      { text: '僕も君が好きだよ', effects: ['set_lover(LENNY)', 'flag(FLG_CONFESS_LENNY)', 'aff(LENNY,4)'], lines: [{ sp: 'LENNY', text: 'ほんと……? えへへ。じゃあ今日から、大家さんは僕の特別だ。……幸せで、また眠くなってきたよぉ。' }] },
      { text: '大切な友達でいたい', effects: ['flag(FLG_CONFESS_LENNY)'], lines: [{ sp: 'LENNY', text: 'そっか。……うん、それでもうれしいよ。ずっと友達だよ。ずっとね。' }] },
    ],
    effects: ['log(EVENT)'],
  }),
  T('DLG_CONFESS_HYU', 'HYU', {
    type: 'EVENT', pool: 'EVENT', once: true, cond: 'rank(PC, HYU) >= 6 and can_be_lover(HYU)',
    lines: [
      { sp: 'HYU', text: '大家さん。私は自分が世界で一番美しいと信じています。……ですが、最近気づいたのです。' },
      { sp: 'HYU', text: '鏡の中の私より、あなたに見つめられている私の方が、ずっと良い顔をしている。' },
      { sp: 'HYU', text: '……これは告白です。私の隣という特等席、あなたに差し上げましょう。受け取りますか?' },
    ],
    choices: [
      { text: '喜んで', effects: ['set_lover(HYU)', 'flag(FLG_CONFESS_HYU)', 'aff(HYU,4)'], lines: [{ sp: 'HYU', text: 'ふふ。良い返事です。……では、これからは私の美しさを、独り占めする権利を差し上げます。光栄に思ってくださいね。' }] },
      { text: '友達のままがいい', effects: ['flag(FLG_CONFESS_HYU)'], lines: [{ sp: 'HYU', text: '……なるほど。ふふ、フラれるのも、私には新鮮な経験です。友としては、これからも隣にいますよ。' }] },
    ],
    effects: ['log(EVENT)'],
  }),
  T('DLG_CONFESS_JIN', 'JIN', {
    type: 'EVENT', pool: 'EVENT', once: true, cond: 'rank(PC, JIN) >= 6 and can_be_lover(JIN)',
    lines: [
      { sp: 'JIN', text: '大家! ……ちょっと、真面目な話、いいか。柄じゃねえけど、逃げずに言うぜ。' },
      { sp: 'JIN', text: '俺は拳で世界と向き合ってきた。でもよ、お前の前だと、拳より先に胸が熱くなるんだ。' },
      { sp: 'JIN', text: '……好きだ! 俺と、その、恋人ってやつに、なってくれ!' },
    ],
    choices: [
      { text: 'こちらこそ!', effects: ['set_lover(JIN)', 'flag(FLG_CONFESS_JIN)', 'aff(JIN,4)'], lines: [{ sp: 'JIN', text: 'っ……! よっしゃあああ! 階段100往復する気分だぜ! 大事にするからな! 絶対だ!' }] },
      { text: '友達として大好きだ', effects: ['flag(FLG_CONFESS_JIN)'], lines: [{ sp: 'JIN', text: '……そうか! ならしょうがねえ! 友情も筋肉と同じ、裏切らねえからな! これからもよろしくだぜ!' }] },
    ],
    effects: ['log(EVENT)'],
  }),
  T('DLG_CONFESS_GERU', 'GERU', {
    type: 'EVENT', pool: 'EVENT', once: true, cond: 'rank(PC, GERU) >= 6 and can_be_lover(GERU)',
    lines: [
      { sp: 'GERU', text: '……あんたに、渡したいものがある。この本の栞だ。ずっと使ってた、古い写真の。' },
      { sp: 'GERU', text: '消えた街の写真を、私はずっと栞にしてきた。だが最近、栞にしたい今が、できたんだ。あんたとの今が。' },
      { sp: 'GERU', text: '……不器用な告白だな。笑っていい。だが、私は本気だ。' },
    ],
    choices: [
      { text: '私も君と今を刻みたい', effects: ['set_lover(GERU)', 'flag(FLG_CONFESS_GERU)', 'aff(GERU,4)'], lines: [{ sp: 'GERU', text: '……そうか。ふ、柄にもなく、手が震えている。……大事にする。あんたとの一日一日を、な。' }] },
      { text: 'かけがえのない友でいたい', effects: ['flag(FLG_CONFESS_GERU)'], lines: [{ sp: 'GERU', text: '……そうか。いや、いいんだ。あんたが隣にいてくれるなら、呼び名なんてどうでもいい。友でいてくれ。' }] },
    ],
    effects: ['log(EVENT)'],
  }),
  T('DLG_CONFESS_NEO', 'NEO', {
    type: 'EVENT', pool: 'EVENT', once: true, cond: 'rank(PC, NEO) >= 6 and can_be_lover(NEO)',
    lines: [
      { sp: 'NEO', text: '大家殿。魔法剣士たる私が、生涯で剣を捧げると決めた者は、ただ一人と誓ってきた。' },
      { sp: 'NEO', text: 'その誓いを、今日、貴様に捧げよう。……これは、我が心臓を差し出すに等しい告白である。' },
      { sp: 'NEO', text: '受けてくれるか。……この誇り高き剣士の、生まれて初めての、震える声を。' },
    ],
    choices: [
      { text: 'その剣、私が受け取ろう', effects: ['set_lover(NEO)', 'flag(FLG_CONFESS_NEO)', 'aff(NEO,4)'], lines: [{ sp: 'NEO', text: '……! ぬ、ぬぅ……! こ、この私が、こんなにも……! 良いだろう、貴様は今日より、我が唯一の姫(あるいは王)である! 生涯を懸けて守る!' }] },
      { text: '忠実な戦友でいよう', effects: ['flag(FLG_CONFESS_NEO)'], lines: [{ sp: 'NEO', text: '……ふ、戦友か。悪くない。むしろ騎士にとって、それは恋以上の絆やもしれぬ。良かろう、貴様は我が永遠の戦友である!' }] },
    ],
    effects: ['log(EVENT)'],
  }),

  // ムニは恋人になれない → 家族の絆イベント(親密度90+)
  T('DLG_FAMILY_MUNI', 'MUNI', {
    type: 'EVENT', pool: 'EVENT', once: true, cond: 'rank(PC, MUNI) >= 6',
    lines: [
      { sp: 'MUNI', text: 'おおやさん、あのね。ムニ、きめたことがあるの。' },
      { sp: 'MUNI', text: 'おおやさんは、ムニのかぞくなの! おにいちゃんでもいいし、おとうさんでもいいの!' },
      { sp: 'MUNI', text: 'かぞくって、ずっといっしょってことでしょ? だからムニ、ずっといっしょにいるの! むにゅ〜!' },
    ],
    effects: ['flag(FLG_FAMILY_MUNI)', 'aff(MUNI,4)', 'log(EVENT)'],
  }),

  // ========================================================
  // 恋人になった後の会話 (プレイヤー×恋人)
  // ========================================================
  T('DLG_LOVER_LENNY_1', 'LENNY', { pool: 'STATE', cond: 'rel(PC, LENNY) == LOVER', weight: 16, lines: [{ sp: 'LENNY', text: 'ねえ、恋人ってさ、隣で寝てても許される関係だよね。……じゃあ、ちょっとだけ、肩、貸してくれる? えへへ。' }], effects: ['aff(LENNY,1)'] }),
  T('DLG_LOVER_LENNY_2', 'LENNY', { pool: 'STATE', cond: 'rel(PC, LENNY) == LOVER', weight: 14, lines: [{ sp: 'LENNY', text: '今日ね、大家さんの夢を見たんだ。ふたりで海を見てた。……いつか、ほんとに行こうね。約束だよぉ。' }], effects: ['aff(LENNY,1)'] }),
  T('DLG_LOVER_HYU_1', 'HYU', { pool: 'STATE', cond: 'rel(PC, HYU) == LOVER', weight: 16, lines: [{ sp: 'HYU', text: '恋人特権として、今日の私の完璧な仕上がりを、一番に見せてあげましょう。……どうです? あなたのための美です。' }], effects: ['aff(HYU,1)'] }),
  T('DLG_LOVER_HYU_2', 'HYU', { pool: 'STATE', cond: 'rel(PC, HYU) == LOVER', weight: 14, lines: [{ sp: 'HYU', text: '鏡を見るより、あなたを見ている時間が増えました。……これは、私にとって大事件なのですよ。ふふ。' }], effects: ['aff(HYU,1)'] }),
  T('DLG_LOVER_JIN_1', 'JIN', { pool: 'STATE', cond: 'rel(PC, JIN) == LOVER', weight: 16, lines: [{ sp: 'JIN', text: '今日の鍛錬、お前のこと考えてたら1.5倍がんばれたぜ! 恋の力ってすげえな! ……て、照れるから笑うなよ!' }], effects: ['aff(JIN,1)'] }),
  T('DLG_LOVER_JIN_2', 'JIN', { pool: 'STATE', cond: 'rel(PC, JIN) == LOVER', weight: 14, lines: [{ sp: 'JIN', text: '今度の休み、焼肉デートだ! 一番いい肉、お前に焼いてやるからな! 楽しみにしとけ!' }], effects: ['aff(JIN,1)'] }),
  T('DLG_LOVER_GERU_1', 'GERU', { pool: 'STATE', cond: 'rel(PC, GERU) == LOVER', weight: 16, lines: [{ sp: 'GERU', text: '……恋人になっても、私は夜型のままだがな。だが、隣で本を読む相手がいるのは、悪くない。むしろ、いい。' }], effects: ['aff(GERU,1)'] }),
  T('DLG_LOVER_GERU_2', 'GERU', { pool: 'STATE', cond: 'rel(PC, GERU) == LOVER', weight: 14, lines: [{ sp: 'GERU', text: 'あんたを栞にした日から、私の物語は消えなくなった。……ふ、キザだったな。忘れろ。……いや、覚えておいてくれ。' }], effects: ['aff(GERU,1)'] }),
  T('DLG_LOVER_NEO_1', 'NEO', { pool: 'STATE', cond: 'rel(PC, NEO) == LOVER', weight: 16, lines: [{ sp: 'NEO', text: '我が姫(王)よ。魔法剣士の恋とは、生涯ただ一度。貴様に捧げたこの剣、他の誰にも向けはせん。誓おう。' }], effects: ['aff(NEO,1)'] }),
  T('DLG_LOVER_NEO_2', 'NEO', { pool: 'STATE', cond: 'rel(PC, NEO) == LOVER', weight: 14, lines: [{ sp: 'NEO', text: '故郷に帰る日が来たら……貴様も共に来てくれるか。……ぬ、返事は今でなくてよい。だが、考えておいてほしいのである。' }], effects: ['aff(NEO,1)'] }),

  // ムニ 家族会話
  T('DLG_FAM_MUNI_1', 'MUNI', { pool: 'STATE', cond: 'rel(PC, MUNI) == FAMILY', weight: 16, lines: [{ sp: 'MUNI', text: 'おおやさん、きょうもかぞくだね! ……ねえ、てをつないでおさんぽしよ? かぞくだから、いいでしょ?' }], effects: ['aff(MUNI,1)'] }),
  T('DLG_FAM_MUNI_2', 'MUNI', { pool: 'STATE', cond: 'rel(PC, MUNI) == FAMILY', weight: 14, lines: [{ sp: 'MUNI', text: 'ムニね、よるこわくなくなったの。かぞくがいるってわかったから。……おおやさん、ありがとなの。むにゅ〜。' }], effects: ['aff(MUNI,1)'] }),

  // ========================================================
  // NPC同士が恋人になった後の会話(AMBIENT)
  // ========================================================
  A('DLG_CPL_LEN_HYU', ['LENNY', 'HYU'], { cond: 'rel(LENNY, HYU) == LOVER', weight: 20, lines: [
    { sp: 'HYU', text: 'レニィ、また私の膝で寝て。……まあ、恋人の特権と思って、許しましょう。' },
    { sp: 'LENNY', text: 'えへへ……ヒュウの膝、いちばんよく眠れるんだよぉ。' },
  ], effects: ['mutual(HYU,LENNY,1)', 'log(AMBIENT)'] }),
  A('DLG_CPL_LEN_JIN', ['LENNY', 'JIN'], { cond: 'rel(LENNY, JIN) == LOVER', weight: 20, lines: [
    { sp: 'JIN', text: 'レニィ、俺が朝起こしてやるよ。恋人だからな! ……起きろー!' },
    { sp: 'LENNY', text: 'ふぁ……ジンパチの声、目覚まし時計より大きいねえ。でも、すきだよ。' },
  ], effects: ['mutual(JIN,LENNY,1)', 'log(AMBIENT)'] }),
  A('DLG_CPL_HYU_JIN', ['HYU', 'JIN'], { cond: 'rel(HYU, JIN) == LOVER', weight: 20, lines: [
    { sp: 'JIN', text: 'ヒュウ、今日もキメてるな! ……俺の恋人、世界一かっこいいぜ!' },
    { sp: 'HYU', text: 'ふふ、ジンパチくん。あなたの単純なところ、実は一番の美点なのですよ。' },
  ], effects: ['mutual(HYU,JIN,1)', 'log(AMBIENT)'] }),
  A('DLG_CPL_GER_LEN', ['GERU', 'LENNY'], { cond: 'rel(GERU, LENNY) == LOVER', weight: 20, lines: [
    { sp: 'GERU', text: 'レニィ、栞代わりにお前の寝顔をスケッチした。……文句あるか。' },
    { sp: 'LENNY', text: 'えー……はずかしいよぉ。でも、ゲルが描いたなら、いいや。えへへ。' },
  ], effects: ['mutual(GERU,LENNY,1)', 'log(AMBIENT)'] }),
  A('DLG_CPL_GER_HYU', ['GERU', 'HYU'], { cond: 'rel(GERU, HYU) == LOVER', weight: 20, lines: [
    { sp: 'HYU', text: 'ゲル、あなたと本を読む夜は、鏡を見る夜より満たされます。……惚気ですよ、これは。' },
    { sp: 'GERU', text: '……知っている。私も、同じだ。だから黙って本をめくれ。……肩は、貸してやる。' },
  ], effects: ['mutual(HYU,GERU,1)', 'log(AMBIENT)'] }),
  A('DLG_CPL_GER_JIN', ['GERU', 'JIN'], { cond: 'rel(GERU, JIN) == LOVER', weight: 20, lines: [
    { sp: 'JIN', text: 'ゲル! お前の好きなホルモン、焼いといたぜ! 恋人の特製だ!' },
    { sp: 'GERU', text: '……ふ、気が利くな。じゃあ私は、お前の好きな本を選んでおいた。等価交換だ。' },
  ], effects: ['mutual(JIN,GERU,1)', 'log(AMBIENT)'] }),
  A('DLG_CPL_GER_NEO', ['GERU', 'NEO'], { cond: 'rel(GERU, NEO) == LOVER', weight: 20, lines: [
    { sp: 'NEO', text: 'ゲルよ。魔法剣士が生涯捧げると決めた相手は、貴様である。……この歴史書、共に読まぬか。' },
    { sp: 'GERU', text: '……騎士の口説き文句は、回りくどいな。いいだろう。隣に座れ。' },
  ], effects: ['mutual(GERU,NEO,1)', 'log(AMBIENT)'] }),

  // ========================================================
  // 季節イベント: みんなで集会所に集合(集会所が建っている日)
  // ========================================================
  // --- お花見 ---
  A('DLG_EV_HANAMI', ALLMAIN, { cond: 'event_active(HANAMI) and location == hall', weight: 30, lines: [
    { sp: 'HYU', text: '桜の下の私……この一枚を、この街の宝にしてもいいでしょうね。' },
    { sp: 'JIN', text: '花見といえば団子だろ! ほら、みんな食え! 大盛りだぜ!' },
    { sp: 'LENNY', text: '桜の花びらが降ってくると……そのまま眠っちゃいそうだよぉ。' },
    { sp: 'MUNI', text: 'はなびら、キャッチするの! むにゅ〜! いっことれた!' },
    { sp: 'GERU', text: '……悪くない。散る花を惜しむ心は、消えた街を想う心に、少し似ている。' },
    { sp: 'NEO', text: '花の宴か。我が故郷にも似た風習があった。……この街も、悪くない故郷である。' },
  ], effects: ['mutual(HYU,JIN,1)', 'mutual(LENNY,MUNI,1)', 'mutual(GERU,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_EV_HANAMI_K', ['LENNY', 'HYU', 'JIN', 'GERU', 'MUNI', 'NEO', 'KANE'], { cond: 'event_active(HANAMI) and location == hall', weight: 34, lines: [
    { sp: 'KANE', text: 'おや、みんな揃って花見かい。……あたしも混ぜとくれ。花より団子、だけどね。' },
    { sp: 'MUNI', text: 'カネばあちゃん! いっしょにみようね!' },
    { sp: 'JIN', text: 'カネ婆! ほら、一番でかい団子やるよ!' },
    { sp: 'KANE', text: 'ふふ、あんたたちと見る桜は、また格別だねぇ。長生きはするもんさ。' },
  ], effects: ['mutual(KANE,MUNI,1)', 'mutual(KANE,JIN,1)', 'log(AMBIENT)'] }),
  // --- 七夕 ---
  A('DLG_EV_TANABATA', ALLMAIN, { cond: 'event_active(TANABATA) and location == hall', weight: 30, lines: [
    { sp: 'MUNI', text: 'たんざく、かいたの! ムニのおねがい、かなうかなあ?' },
    { sp: 'LENNY', text: '僕はね、「一年中お昼寝できますように」って書いたよ。……欲がなくてごめんね。' },
    { sp: 'HYU', text: '私の願いは企業秘密です。……ふふ、笹に聞いてごらんなさい。' },
    { sp: 'JIN', text: '俺は「限定プラモが当たりますように」だ! 願いは具体的にな!' },
    { sp: 'NEO', text: '私は……故郷に帰れる日を願った。それと、ラーメンの新作をな。' },
    { sp: 'GERU', text: '短冊は、消えない願いだな。……笹を見てみろ。みんなの想いが揺れている。' },
  ], effects: ['mutual(LENNY,MUNI,1)', 'mutual(GERU,NEO,1)', 'log(AMBIENT)'] }),
  // --- ハロウィン ---
  A('DLG_EV_HALLOWEEN', ALLMAIN, { cond: 'event_active(HALLOWEEN) and location == hall', weight: 30, lines: [
    { sp: 'MUNI', text: 'トリックオアトリート! おかしくれなきゃ、いたずらするの!' },
    { sp: 'JIN', text: '俺の仮装? 見ての通り「筋肉」だ! 一番怖えだろ!' },
    { sp: 'HYU', text: '私は吸血鬼の仮装を。……美しすぎて、鏡に映ってしまうのが難点ですが。' },
    { sp: 'NEO', text: '仮装だと? 私は普段から魔法剣士である。つまり毎日がハロウィンなのだ。ふはは!' },
    { sp: 'LENNY', text: '僕はおばけの仮装……あ、シーツかぶってたら、ほんとに寝ちゃった。' },
    { sp: 'GERU', text: '……子供っぽいと思っていたが、悪くないな。ムニ、ほら、お前のぶんの菓子だ。' },
  ], effects: ['mutual(HYU,NEO,1)', 'mutual(GERU,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_EV_HALLOWEEN_K', ['LENNY', 'HYU', 'JIN', 'GERU', 'MUNI', 'NEO', 'KANE'], { cond: 'event_active(HALLOWEEN) and location == hall', weight: 34, lines: [
    { sp: 'KANE', text: 'なんだい、この賑わいは。……ほら、あたしからも菓子だよ。いたずらはナシだからね。' },
    { sp: 'MUNI', text: 'カネばあちゃん、まじょのかそう、にあってるの!' },
    { sp: 'KANE', text: 'こら、地毛だよ! ……ふふ、まあ、今日は魔女でいてやるさ。' },
  ], effects: ['mutual(KANE,MUNI,1)', 'log(AMBIENT)'] }),
  // --- クリスマス ---
  A('DLG_EV_CHRISTMAS', ALLMAIN, { cond: 'event_active(CHRISTMAS) and location == hall', weight: 30, lines: [
    { sp: 'MUNI', text: 'ツリー、きれい! てっぺんのおほしさま、ムニがつけたの!' },
    { sp: 'HYU', text: 'イルミネーションと私、どちらが輝いているか……今日は引き分けにしておきましょう。聖夜ですから。' },
    { sp: 'JIN', text: 'クリスマスはチキンだ! 骨付きモモ肉! 俺が焼くぜ! メリークリスマス!' },
    { sp: 'LENNY', text: '暖炉みたいにあったかいね……プレゼント? 僕からはみんなに「ぐっすり眠れる枕」だよ。' },
    { sp: 'NEO', text: 'サンタなる存在……煙突から侵入する義賊か。ふむ、騎士道的に、嫌いではない。' },
    { sp: 'GERU', text: '……こういう夜が、毎年続けばいいと思う。消えないでほしい景色だ。メリークリスマス。' },
  ], effects: ['mutual(HYU,JIN,1)', 'mutual(LENNY,MUNI,1)', 'mutual(GERU,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_EV_CHRISTMAS_K', ['LENNY', 'HYU', 'JIN', 'GERU', 'MUNI', 'NEO', 'KANE'], { cond: 'event_active(CHRISTMAS) and location == hall', weight: 34, lines: [
    { sp: 'KANE', text: 'ホッホッホ。あたしがサンタってのは、どうだい。……ほら、あんたたちにプレゼントさ。' },
    { sp: 'MUNI', text: 'カネばあちゃんサンタ! だーいすき!' },
    { sp: 'NEO', text: '婆のサンタ……ぬ、この贈り物、温かいのである。感謝する。' },
    { sp: 'KANE', text: 'ふん、素直じゃないか金髪。……メリークリスマス、坊やたち。' },
  ], effects: ['mutual(KANE,MUNI,1)', 'mutual(KANE,NEO,1)', 'log(AMBIENT)'] }),
  // --- 正月 ---
  A('DLG_EV_NEWYEAR', ALLMAIN, { cond: 'event_active(NEWYEAR) and location == hall', weight: 30, lines: [
    { sp: 'JIN', text: 'あけましておめでとう! 今年こそ階段200往復が目標だぜ! おせち食ったら初詣だ!' },
    { sp: 'HYU', text: '新年最初の私も、完璧です。今年も世界を美しくしてまいりましょう。' },
    { sp: 'MUNI', text: 'おとしだま! ムニ、おとしだまもらえるの? やったー!' },
    { sp: 'LENNY', text: '初夢、見たよ。海と、みんなと……いい夢だったよぉ。今年もよろしくね。' },
    { sp: 'NEO', text: '新年か。我が故郷の暦とは違うが……新たな誓いを立てるには、良い節目である。' },
    { sp: 'GERU', text: '今年も、この街が消えませんように。……初詣の願いは、それでいい。あけましておめでとう。' },
  ], effects: ['mutual(HYU,JIN,1)', 'mutual(LENNY,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_EV_NEWYEAR_K', ['LENNY', 'HYU', 'JIN', 'GERU', 'MUNI', 'NEO', 'KANE'], { cond: 'event_active(NEWYEAR) and location == hall', weight: 34, lines: [
    { sp: 'KANE', text: 'あけましておめでとう。……ほら、みんなにお年玉だよ。今年もしっかりお生きな。' },
    { sp: 'MUNI', text: 'わーい! カネばあちゃん、ありがとなの!' },
    { sp: 'JIN', text: 'カネ婆、太っ腹だな! 今年もよろしくだぜ!' },
    { sp: 'KANE', text: 'ふふ、あんたたちの笑顔が、あたしのお年玉さ。' },
  ], effects: ['mutual(KANE,MUNI,1)', 'mutual(KANE,JIN,1)', 'log(AMBIENT)'] }),

  // ========================================================
  // カラオケのデュエット
  // ========================================================
  A('DLG_DUET_HYU_LEN', ['HYU', 'LENNY'], { cond: 'location == karaoke', weight: 16, lines: [
    { sp: 'HYU', text: 'レニィ、デュエットしましょう。あなたのパートは……夢見るように歌ってください。' },
    { sp: 'LENNY', text: 'ん……じゃあ、ゆっくりめでいい? ……♪ゆめの なかで〜' },
    { sp: 'HYU', text: '♪ふたり 巡り会う〜……ふふ、悪くないハーモニーですね。' },
  ], effects: ['mutual(HYU,LENNY,2)', 'log(AMBIENT)'] }),
  A('DLG_DUET_JIN_MUN', ['JIN', 'MUNI'], { cond: 'location == karaoke', weight: 16, lines: [
    { sp: 'JIN', text: 'よーしムニ! アニメソングデュエットだ! サビは声そろえるぜ!' },
    { sp: 'MUNI', text: 'うん! せーの……♪ゆけ〜! ムニレンジャー!' },
    { sp: 'JIN', text: '♪ゆけ〜! ドラゴォーン! ……ガハハ! 100点だな!' },
  ], effects: ['mutual(JIN,MUNI,2)', 'log(AMBIENT)'] }),
  A('DLG_DUET_NEO_GER', ['NEO', 'GERU'], { cond: 'location == karaoke', weight: 14, lines: [
    { sp: 'NEO', text: 'ゲルよ、我が吟遊の歌に、貴様の低音を重ねてみよ。……デュエットである。' },
    { sp: 'GERU', text: '……仕方ない。私のパートは短くしろよ。……♪夜の 底で〜' },
    { sp: 'NEO', text: '♪星は 歌う〜……ふ、悪くない。貴様の声は、夜に似合う。' },
  ], effects: ['mutual(GERU,NEO,2)', 'log(AMBIENT)'] }),
  A('DLG_DUET_HYU_JIN', ['HYU', 'JIN'], { cond: 'location == karaoke', weight: 14, lines: [
    { sp: 'JIN', text: 'ヒュウ! 相棒デュエットいくぜ! 俺が熱血、お前がクール担当だ!' },
    { sp: 'HYU', text: '……仕方ありませんね。あなたの暑苦しさを、私が三割ほど中和してあげましょう。' },
    { sp: 'JIN', text: '♪燃えろ〜!' }, { sp: 'HYU', text: '♪……ほどほどに、ね。ふふ。' },
  ], effects: ['mutual(HYU,JIN,2)', 'log(AMBIENT)'] }),

  // ========================================================
  // 新施設の主要人物ペア会話
  // ========================================================
  // ケーキ屋
  A('DLG_AMB_HYU_MUN_CAKE', ['HYU', 'MUNI'], { cond: 'location == cake', lines: [
    { sp: 'MUNI', text: 'ヒュウおにいちゃん、どのケーキがいい?' },
    { sp: 'HYU', text: '私はモンブランを。……ムニ、口の周りクリームだらけですよ。ほら、拭いてあげましょう。' },
    { sp: 'MUNI', text: 'えへへ、ヒュウおにいちゃん、やさしいの。' },
  ], effects: ['mutual(HYU,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_AMB_GER_JIN_CAKE', ['GERU', 'JIN'], { cond: 'location == cake', lines: [
    { sp: 'JIN', text: 'げっ、ゲル! お前もケーキ食いに来たのか!? い、いや俺は糖質補給で……' },
    { sp: 'GERU', text: '……安心しろ。私も内緒で来てる。お互い、見なかったことにしよう。' },
    { sp: 'JIN', text: '……取引成立だぜ。' },
  ], effects: ['mutual(JIN,GERU,1)', 'log(AMBIENT)'] }),
  // 病院(お見舞い)
  A('DLG_AMB_HOSP_VISIT', ['HYU', 'LENNY'], { cond: 'location == hospital', lines: [
    { sp: 'HYU', text: 'お見舞いの花、私が生けました。病室でも美は大切ですからね。' },
    { sp: 'LENNY', text: 'ヒュウ、やさしいねえ。……あ、この病室、お昼寝にちょうどいいよぉ。' },
    { sp: 'HYU', text: 'あなたはどこでも寝ますね……。' },
  ], effects: ['mutual(HYU,LENNY,1)', 'log(AMBIENT)'] }),
  // 水族館(レニィ中心)
  A('DLG_AMB_LEN_NEO_AQUA', ['LENNY', 'NEO'], { cond: 'location == aquarium', lines: [
    { sp: 'LENNY', text: 'ネオ、あの深海魚、暗いところで光ってるんだよ。かっこいいよね。' },
    { sp: 'NEO', text: 'うむ。孤高にして光を絶やさぬ……まるで騎士だ。あの魚、我が友としたい。' },
    { sp: 'LENNY', text: 'ふふ、ネオはなんでも騎士にしちゃうねえ。' },
  ], effects: ['mutual(LENNY,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_AMB_LEN_MUN_AQUA', ['LENNY', 'MUNI'], { cond: 'location == aquarium', lines: [
    { sp: 'MUNI', text: 'レニィおにいちゃん、おっきいおさかな、こわい……' },
    { sp: 'LENNY', text: 'だいじょうぶだよ。ガラスの向こうだもん。……ほら、あのクラゲ、手を振ってるみたいだよ。' },
    { sp: 'MUNI', text: 'ほんとだ! くらげさん、こんにちは!' },
  ], effects: ['mutual(LENNY,MUNI,1)', 'log(AMBIENT)'] }),
  // 魚屋(ネオ実演)
  A('DLG_AMB_NEO_JIN_FISH', ['NEO', 'JIN'], { cond: 'location == fishshop', lines: [
    { sp: 'NEO', text: '見ておれジンパチ。この鯛、一刀三枚おろしである。……ふっ、剣の冴え、健在なり。' },
    { sp: 'JIN', text: 'おおっ、鮮やか! ネオ、お前料理人にもなれるぜ! そのまま焼肉屋こいよ!' },
    { sp: 'NEO', text: '魚のあとに肉か。……貴様の食欲もまた、一種の武である。良かろう、付き合おう。' },
  ], effects: ['mutual(JIN,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_AMB_NEO_LEN_FISH', ['NEO', 'LENNY'], { cond: 'location == fishshop', lines: [
    { sp: 'LENNY', text: 'ネオが魚さばくの、シャッてしてかっこいいね。……でも、ちょっとお魚がかわいそうだよぉ。' },
    { sp: 'NEO', text: '案ずるな。命を頂くゆえ、一刀に礼を尽くす。それが騎士の作法である。無駄にはせぬ。' },
    { sp: 'LENNY', text: '……ネオって、やさしいんだね。' },
  ], effects: ['mutual(LENNY,NEO,1)', 'log(AMBIENT)'] }),
  // 焼肉屋(みんなで焼肉)
  A('DLG_YAKI_TRIO', ['JIN', 'NEO', 'HYU'], { cond: 'location == yakiniku', weight: 18, lines: [
    { sp: 'JIN', text: 'よし焼くぜ! カルビは俺に任せろ! 強火一気だ!' },
    { sp: 'NEO', text: '肉が舞う……これは戦である! 私はこの上ロースを制圧する!' },
    { sp: 'HYU', text: 'お二人とも、焼きすぎです。……美しい焼き加減は、私が管理しましょう。' },
    { sp: 'JIN', text: 'ヒュウの焼き加減、正直マジで上手いんだよな! よし、乾杯だ!' },
  ], effects: ['mutual(JIN,NEO,1)', 'mutual(JIN,HYU,1)', 'mutual(HYU,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_YAKI_JIN_MUN', ['JIN', 'MUNI'], { cond: 'location == yakiniku', lines: [
    { sp: 'MUNI', text: 'ジンパチおにいちゃん、おにく、やけた?' },
    { sp: 'JIN', text: 'もうちょいだ! ……よし! ほら、ふーふーして食え! 熱いからな!' },
    { sp: 'MUNI', text: 'あーん! ……おいしい! むにゅ〜!' },
  ], effects: ['mutual(JIN,MUNI,1)', 'log(AMBIENT)'] }),

  // ========================================================
  // ネオの魔法剣士設定を各所に(汎用+施設)
  // ========================================================
  T('DLG_NEO_KNIGHT_1', 'NEO', { lines: [{ sp: 'NEO', text: 'ふっ……この剣が唸るのを聞きたいか? 生憎、平和なこの街では鞘に納めたままである。それでよいのだ。' }], effects: ['aff(NEO,1)'] }),
  T('DLG_NEO_KNIGHT_2', 'NEO', { lines: [{ sp: 'NEO', text: '魔法剣士の心得、其の一。「守るべきは、剣で斬れぬものである」。……この街に来て、ようやく腑に落ちた。' }], effects: ['aff(NEO,1)'] }),
  T('DLG_NEO_KNIGHT_3', 'NEO', { pool: 'COND', cond: 'time == MIDNIGHT', lines: [{ sp: 'NEO', text: '……夜の見回りである。魔法剣士たる者、街の平穏を守るのは務め。……コソ泥の一匹くらい、私が斬り伏せてくれる。峰打ちでな。' }], effects: ['aff(NEO,1)'] }),
  T('DLG_NEO_KNIGHT_4', 'NEO', { pool: 'COND', cond: 'weather == RAIN', lines: [{ sp: 'NEO', text: '雨か。我が魔剣は水に濡れると輝きを増す……というのは、まあ、装飾用ゆえ錆びぬための加工である。ふっ、無粋を言うな。' }], effects: ['aff(NEO,1)'] }),

  // ========================================================
  // コンビニ店員リン & コソ泥の追加
  // ========================================================
  T('DLG_CLERK_FIRST', 'CLERK', {
    type: 'EVENT', pool: 'EVENT', once: true,
    lines: [
      { sp: 'CLERK', text: 'いらっしゃいませ、コンビニ九龍へ。店員のリンと申します。' },
      { sp: 'CLERK', text: 'この店、贈り物カウンターがありまして。絆が深まる品を扱っております。話しかけていただければ、いつでも。' },
      { sp: 'CLERK', text: '……あと、覆面の常連さんには、くれぐれもお気をつけを。悪い人ではないんですけどね。' },
    ],
    effects: ['flag(FLG_MET_CLERK)', 'aff(CLERK,2)', 'log(EVENT)'],
  }),
  A('DLG_AMB_CLERK_THIEF', ['CLERK', 'THIEF'], { cond: 'location == konbini', weight: 16, lines: [
    { sp: 'CLERK', text: '……お客様。そのおにぎり、まだ会計を済ませていませんよね?' },
    { sp: 'THIEF', text: 'ギクッ……! い、いや、これは今から払うところで……!' },
    { sp: 'CLERK', text: 'にっこり。……レジ、こちらです。逃げませんよね?' },
    { sp: 'THIEF', text: '……はい。(観念して財布を出す)' },
  ], effects: ['log(AMBIENT)'] }),

  // ========================================================
  // 各施設の主要人物ペア会話をさらに増量(特に要望)
  // ========================================================
  A('DLG_AMB_LEN_GER_CAFE2', ['LENNY', 'GERU'], { cond: 'location == cafe', lines: [
    { sp: 'LENNY', text: 'ゲル、コーヒーゼリー食べないの? ぷるぷるしてておいしいよ。' },
    { sp: 'GERU', text: '……本を読みながらだと、スプーンが手探りになる。だが、まあ、頼んでみるか。お前が言うなら。' },
  ], effects: ['mutual(LENNY,GERU,1)', 'log(AMBIENT)'] }),
  A('DLG_AMB_HYU_JIN_BARBER', ['HYU', 'JIN'], { cond: 'location == barber', lines: [
    { sp: 'JIN', text: 'ヒュウ、お前も散髪か? 前髪は聖域なんだろ?' },
    { sp: 'HYU', text: '当然です。今日は襟足の微調整のみ。……ジンパチくん、あなたの潔い刈り上げも、嫌いではありませんよ。' },
  ], effects: ['mutual(HYU,JIN,1)', 'log(AMBIENT)'] }),
  A('DLG_AMB_GER_NEO_IZA2', ['GERU', 'NEO'], { cond: 'location == izakaya and time in [NIGHT, MIDNIGHT]', lines: [
    { sp: 'NEO', text: 'ゲルよ、貴様のジュース、私の酒と乾杯せぬか。無粋か?' },
    { sp: 'GERU', text: '……いや。夜と、灯りと、隣に静かな相手。悪くない組み合わせだ。乾杯しよう。' },
  ], effects: ['mutual(GERU,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_AMB_LEN_MUN_ROOF', ['LENNY', 'MUNI'], { cond: 'location == ROOF', lines: [
    { sp: 'LENNY', text: 'ムニ、屋上の風、きもちいいねえ。星、数えられる?' },
    { sp: 'MUNI', text: 'いち、に、さん……いっぱい! ムニ、かぞえられないの!' },
    { sp: 'LENNY', text: 'ふふ、いっぱいでいいんだよ。……ちょっと、お昼寝しよっか。' },
  ], effects: ['mutual(LENNY,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_AMB_JIN_NEO_ROOF', ['JIN', 'NEO'], { cond: 'location == ROOF', lines: [
    { sp: 'JIN', text: 'ネオ! 屋上でトレーニングだ! 剣の素振り、付き合えよ!' },
    { sp: 'NEO', text: 'ふっ、良い誘いである。魔法剣士の朝稽古、見せてくれよう。……せーの!' },
  ], effects: ['mutual(JIN,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_AMB_HYU_GER_FLOWER', ['HYU', 'GERU'], { cond: 'location == flower', lines: [
    { sp: 'HYU', text: 'ゲル、あなたには青い花が似合います。……押し花にするのでしょう?' },
    { sp: 'GERU', text: '……よく分かったな。ああ、栞にする。お前のその観察眼、たまに鋭くて怖いぞ。' },
  ], effects: ['mutual(HYU,GERU,1)', 'log(AMBIENT)'] }),
  A('DLG_AMB_MUN_NEO_DAGASHI', ['MUNI', 'NEO'], { cond: 'location == dagashi', lines: [
    { sp: 'MUNI', text: 'ネオおにいちゃん、これ、あたりつきのやつ!' },
    { sp: 'NEO', text: 'ほう、運試しか。騎士たる者、運もまた実力のうち。……ぬ、当たった! ふはは、当然である!' },
    { sp: 'MUNI', text: 'ネオおにいちゃん、すごい! むにゅ〜!' },
  ], effects: ['mutual(MUNI,NEO,1)', 'log(AMBIENT)'] }),

  // ========================================================
  // 病気で入院中の主要人物のセリフ(お見舞い=話しかけで好感度+はコード側)
  // ========================================================
  T('DLG_SICK_LENNY', 'LENNY', { pool: 'STATE', cond: 'activity(LENNY) == SICK', weight: 30, lines: [{ sp: 'LENNY', text: 'ふぇ……大家さん、来てくれたの? ……熱でぼーっとするけど、顔見たら元気でたよぉ。ありがと……' }], effects: [] }),
  T('DLG_SICK_HYU', 'HYU', { pool: 'STATE', cond: 'activity(HYU) == SICK', weight: 30, lines: [{ sp: 'HYU', text: '……こんな青白い顔、見られたくなかったのですが。……ふふ、あなたが来てくれるなら、病も悪くありませんね。' }], effects: [] }),
  T('DLG_SICK_JIN', 'JIN', { pool: 'STATE', cond: 'activity(JIN) == SICK', weight: 30, lines: [{ sp: 'JIN', text: '俺が……熱で寝込むなんて……くっ。でも大家が来てくれた。よし、気合で治す! ……いてて、動くと頭が。' }], effects: [] }),
  T('DLG_SICK_MUNI', 'MUNI', { pool: 'STATE', cond: 'activity(MUNI) == SICK', weight: 30, lines: [{ sp: 'MUNI', text: 'おおやさぁん……ムニ、ねつでてつらいの……。でも、きてくれてうれしいの。てをにぎってて……' }], effects: [] }),
  T('DLG_SICK_GERU', 'GERU', { pool: 'STATE', cond: 'activity(GERU) == SICK', weight: 30, lines: [{ sp: 'GERU', text: '……無理して来なくてよかったのに。ふ、でも、来てくれて……その、嬉しい。柄にもなく、心細かったんだ。' }], effects: [] }),
  T('DLG_SICK_NEO', 'NEO', { pool: 'STATE', cond: 'activity(NEO) == SICK', weight: 30, lines: [{ sp: 'NEO', text: 'ぐ……騎士たる者が、風邪ごときに……! ……だが、貴様が見舞いに来るとは。ふ、この温情、忘れぬぞ。' }], effects: [] }),
];
