// ============================================================
// v3 追加会話
//   ・ジンパチのプラモデル趣味(会話 + お願いクエスト)
//   ・駄菓子屋のおばあさん(新NPC)
//   ・コソ泥と主要人物の鉢合わせ(コンビニ)+ 撃退
//   ・各施設での主要人物どうしの会話(AMBIENT)を増量
//   ・薬局・カラオケでの会話を増量
// ============================================================
const T = (id, owner, node) => ({ id, owner, type: node.type ?? 'TALK', pool: node.pool ?? 'GENERIC', ...node });
const A = (id, cast, node) => ({ id, type: 'AMBIENT', pool: 'AMBIENT', owner: [...cast].sort().join('-'), cast, ...node });

export const DLG_V3 = [
  // ========================================================
  // ジンパチ プラモデル
  // ========================================================
  T('DLG_JIN_PLAMO_GEN1', 'JIN', { lines: [{ sp: 'JIN', text: '実はな……趣味でプラモを作ってんだ。拳を鍛えるのと、パーツを組むのは同じよ。集中と根気だぜ!' }], effects: ['aff(JIN,1)', 'info(INFO_JIN_PLAMO)'] }),
  T('DLG_JIN_PLAMO_GEN2', 'JIN', { lines: [{ sp: 'JIN', text: '昨日は徹夜でロボプラモの塗装だ。……筋トレより手が震えたぜ。繊細な作業ってやつは奥が深えな!' }], effects: ['aff(JIN,1)', 'info(INFO_JIN_PLAMO)'] }),
  T('DLG_JIN_PLAMO_GEN3', 'JIN', { pool: 'COND', cond: 'time == MIDNIGHT', lines: [{ sp: 'JIN', text: '……こんな時間まで? 俺か? 俺はプラモの合わせ目消しだ。あと一箇所……あと一箇所だけ……' }], effects: ['aff(JIN,1)', 'info(INFO_JIN_PLAMO)'] }),

  // お願いクエスト: プラモ展示棚を飾りたい
  T('DLG_JIN_EV_PLAMO', 'JIN', {
    type: 'EVENT', pool: 'EVENT', once: true,
    cond: 'info(INFO_JIN_PLAMO) and rank(PC, JIN) >= 2',
    lines: [
      { sp: 'JIN', text: 'なあ大家、折り入って頼みがある。……男の頼みだ、笑わずに聞いてくれ。' },
      { sp: 'JIN', text: '俺の部屋に、プラモを飾る展示棚が欲しいんだ! せっかくの力作、埃をかぶらせるのは忍びねえ!' },
      { sp: 'JIN', text: 'ガチャで「プラモデル展示棚」が出たら、俺の部屋に置いてくれ! 頼んだぜ!' },
    ],
    effects: ['flag(FLG_Q_JIN_PLAMO)', 'info(INFO_JIN_PLAMO)', 'log(EVENT)'],
  }),
  T('DLG_JIN_EV_PLAMO_DONE', 'JIN', {
    type: 'EVENT', pool: 'EVENT', once: true,
    cond: 'flag(FLG_Q_JIN_PLAMO_DONE)',
    lines: [
      { sp: 'JIN', text: 'うおおお!! これだよこれ! ガラスケース付きの展示棚! 完璧だぜ大家!!' },
      { sp: 'JIN', text: 'ロボは上段、戦艦は下段……ああ、俺の城が完成した……! じ、じいんとくるぜ……!' },
      { sp: 'JIN', text: 'こいつは礼だ、受け取ってくれ! 今度、俺のコレクション自慢させろよな!' },
    ],
    effects: ['aff(JIN,6)', 'coin(12)', 'log(EVENT)'],
  }),

  // ========================================================
  // 駄菓子屋のおばあさん
  // ========================================================
  T('DLG_DGS_FIRST', 'DAGASHIYA', {
    type: 'EVENT', pool: 'EVENT', once: true,
    lines: [
      { sp: 'DAGASHIYA', text: 'おや、いらっしゃい。新しい大家さんだねぇ。' },
      { sp: 'DAGASHIYA', text: 'わたしはこの駄菓子屋ムニ堂の店番。ムニがうちの常連でねぇ、看板娘ならぬ看板坊やだよ。ふふ。' },
      { sp: 'DAGASHIYA', text: '10円ゲームなら年季が違うよ。ぼうやも挑戦してみるかい?' },
    ],
    effects: ['flag(FLG_MET_DAGASHIYA)', 'aff(DAGASHIYA,2)', 'log(EVENT)'],
  }),
  T('DLG_DGS_GEN1', 'DAGASHIYA', { lines: [{ sp: 'DAGASHIYA', text: 'この店はねぇ、子供の駆け込み寺みたいなもんさ。10円握りしめて来る顔が、みんな宝物だよ。' }], effects: ['aff(DAGASHIYA,1)'] }),
  T('DLG_DGS_GEN2', 'DAGASHIYA', { lines: [{ sp: 'DAGASHIYA', text: 'ジンパチのぼうやも、こっそり甘いもん買いに来るんだよ。大きな体して、選ぶ顔は子供のままさ。ふふ。' }], effects: ['aff(DAGASHIYA,1)', 'info(INFO_JIN_SWEETS)'] }),
  T('DLG_DGS_GEN3', 'DAGASHIYA', { lines: [{ sp: 'DAGASHIYA', text: 'ネオのぼうやかい? あの子、駄菓子の値段に感動しててねぇ。「10圓とは錬金術である」だって。おかしな子だよ。' }], effects: ['aff(DAGASHIYA,1)'] }),
  T('DLG_DGS_MUNI', 'DAGASHIYA', { pool: 'STATE', cond: 'npc_at(MUNI) == dagashi', weight: 18, lines: [
    { sp: 'DAGASHIYA', text: 'ムニ、また来たのかい。ほら、おまけのラムネだよ。' },
    { sp: 'MUNI', text: 'わーい! おばあちゃん、だーいすき! むにゅ〜!' },
    { sp: 'DAGASHIYA', text: 'はいはい。……大家さん、この子はうちの宝だよ。' },
  ], effects: ['aff(DAGASHIYA,1)', 'mutual(DAGASHIYA,MUNI,1)', 'log(DAILY)'] }),
  T('DLG_DGS_TIME_MORN', 'DAGASHIYA', { pool: 'COND', cond: 'time == MORNING', lines: [{ sp: 'DAGASHIYA', text: '開店の支度中だよ。瓶の飴を並べるとね、一日が始まるって気がするのさ。' }], effects: ['aff(DAGASHIYA,1)'] }),
  T('DLG_DGS_WX_RAIN', 'DAGASHIYA', { pool: 'COND', cond: 'weather == RAIN', lines: [{ sp: 'DAGASHIYA', text: '雨だと子供が来なくてねぇ。……こういう日は、ムニが長っ尻でおしゃべりしていくよ。' }], effects: ['aff(DAGASHIYA,1)'] }),
  T('BRK_DGS_1', 'DAGASHIYA', { type: 'BARK', pool: 'BARK', lines: [{ sp: 'DAGASHIYA', text: 'いらっしゃい' }] }),

  // ========================================================
  // コソ泥(コンビニ) — 撃退TALK
  // ========================================================
  T('DLG_THIEF_FIRST', 'THIEF', {
    type: 'EVENT', pool: 'EVENT', once: true,
    lines: [
      { sp: 'THIEF', text: '……チッ、見つかったか。オレはただの通りすがりだぜ、あんた。' },
      { sp: 'THIEF', text: '(ポケットからおにぎりがこぼれ落ちる) ……こ、これは違う! 買ったんだ! 買ったんだよ!' },
      { sp: 'THIEF', text: 'う、うるせえ! 今日のところは見逃してくれ! ……じゃあな!' },
    ],
    effects: ['flag(FLG_MET_THIEF)', 'flag(FLG_THIEF_REPELLED)', 'count(CNT_THIEF_REPEL)', 'coin(3)', 'log(EVENT)'],
  }),
  T('DLG_THIEF_REPEL1', 'THIEF', { cond: 'count(CNT_THIEF_REPEL) < 5', lines: [
    { sp: 'THIEF', text: 'げっ、また大家か! ……最近あんたに見つかってばっかりだぜ。ツイてねえ!' },
    { sp: 'THIEF', text: '(退散する) 覚えてやがれ〜!' },
  ], effects: ['count(CNT_THIEF_REPEL)', 'coin(3)'] }),
  T('DLG_THIEF_REPEL2', 'THIEF', { cond: 'count(CNT_THIEF_REPEL) >= 5', weight: 14, lines: [
    { sp: 'THIEF', text: 'よう大家……もう何回目だっけな。あんたには敵わねえよ。' },
    { sp: 'THIEF', text: '……実はよ、オレも真面目に働こうかと思っててな。……なんてな。じゃあ、逃げるぜ!' },
  ], effects: ['count(CNT_THIEF_REPEL)', 'coin(4)'] }),
  T('BRK_THIEF_1', 'THIEF', { type: 'BARK', pool: 'BARK', lines: [{ sp: 'THIEF', text: '(きょろきょろ)' }] }),
  T('BRK_THIEF_2', 'THIEF', { type: 'BARK', pool: 'BARK', lines: [{ sp: 'THIEF', text: '……いける、か?' }] }),

  // ========================================================
  // コソ泥 × 主要人物 の鉢合わせ (コンビニ・AMBIENT)
  // ========================================================
  A('DLG_AMB_THIEF_JIN', ['THIEF', 'JIN'], { cond: 'location == konbini', weight: 16, lines: [
    { sp: 'JIN', text: 'おい! そこのお前! 今なんか懐に入れなかったか!?' },
    { sp: 'THIEF', text: 'ヒッ……! な、なんでもねえよ! ……く、来るな! そのガタイで来るな!' },
    { sp: 'JIN', text: '待てコラーッ! 逃がすかよ!' },
  ], effects: ['flag(FLG_MET_THIEF)', 'log(AMBIENT)'] }),
  A('DLG_AMB_THIEF_NEO', ['THIEF', 'NEO'], { cond: 'location == konbini', weight: 16, lines: [
    { sp: 'NEO', text: '待つのだ、そこの盗人。この街の平穏を乱すこと、この魔法剣士ネオが許さん!' },
    { sp: 'THIEF', text: 'う、うわ何だこいつ、コスプレか!? ……い、いや、なんか本物っぽい迫力が……!' },
    { sp: 'NEO', text: '去ね! そして二度と盗むでない! ……ふっ、騎士の務めである。' },
  ], effects: ['flag(FLG_MET_THIEF)', 'log(AMBIENT)'] }),
  A('DLG_AMB_THIEF_MUN', ['THIEF', 'MUNI'], { cond: 'location == konbini', weight: 14, lines: [
    { sp: 'MUNI', text: 'おじさん、なにしてるの? かくれんぼ?' },
    { sp: 'THIEF', text: 'ぼ、坊主……! しーっ! ……ああもう、その純粋な目で見るな! やりにくいだろ!' },
    { sp: 'MUNI', text: 'おじさん、へんなの。むにゅ〜。' },
  ], effects: ['flag(FLG_MET_THIEF)', 'log(AMBIENT)'] }),
  A('DLG_AMB_THIEF_GER', ['THIEF', 'GERU'], { cond: 'location == konbini', weight: 14, lines: [
    { sp: 'GERU', text: '……その手つき、素人だな。棚の死角も、店員の視線も読めてない。やめておけ。' },
    { sp: 'THIEF', text: 'な……! あ、あんた何モンだよ! 見透かすみたいに……!' },
    { sp: 'GERU', text: 'ただの本の読みすぎだ。……ほら、おにぎり代くらい貸してやる。真っ当に生きろ。' },
  ], effects: ['flag(FLG_MET_THIEF)', 'log(AMBIENT)'] }),
  A('DLG_AMB_THIEF_HYU', ['THIEF', 'HYU'], { cond: 'location == konbini', weight: 12, lines: [
    { sp: 'HYU', text: 'おや。盗みという行為、実に美しくないですね。あなたほどの体格なら、もっと映える生き方があるでしょうに。' },
    { sp: 'THIEF', text: 'う……なんか、説教より効くなそれ……。' },
    { sp: 'HYU', text: 'ふふ。分かればよろしい。' },
  ], effects: ['flag(FLG_MET_THIEF)', 'log(AMBIENT)'] }),
  A('DLG_AMB_THIEF_LEN', ['THIEF', 'LENNY'], { cond: 'location == konbini', weight: 12, lines: [
    { sp: 'LENNY', text: '……あ。おじさん、そこの棚のおにぎり、僕も好きなんだ。いっしょに食べる?' },
    { sp: 'THIEF', text: 'は……? い、いや、オレは……その……。' },
    { sp: 'LENNY', text: 'ふわぁ……。おごるよ。だから、盗まなくていいよ。' },
    { sp: 'THIEF', text: '……なんだよ、調子狂うな、あんた……。' },
  ], effects: ['flag(FLG_MET_THIEF)', 'log(AMBIENT)'] }),

  // ========================================================
  // 各施設での主要人物どうしの会話(AMBIENT)を増量
  // ========================================================
  // --- 喫茶店 ---
  A('DLG_AMB_HYU_GER_CAFE', ['HYU', 'GERU'], { cond: 'location == cafe', lines: [
    { sp: 'HYU', text: 'ゲル、そのブラックコーヒー、砂糖も入れずに。修行僧ですか。' },
    { sp: 'GERU', text: '苦さが集中を呼ぶんだ。……お前のその甘ったるいのよりましだろう。' },
    { sp: 'HYU', text: '甘さも私の魅力の一部なのですよ。ふふ。' },
  ], effects: ['mutual(HYU,GERU,1)', 'log(AMBIENT)'] }),
  // --- ラーメン ---
  A('DLG_AMB_JIN_NEO_RAMEN', ['JIN', 'NEO'], { cond: 'location == ramen', lines: [
    { sp: 'JIN', text: 'ネオ! 替え玉勝負だ! 何玉いける!?' },
    { sp: 'NEO', text: 'ふっ、愚問である。騎士の胃袋に限界などない。……三玉で頼む。' },
    { sp: 'JIN', text: '意外と少ねえ!? まあいい、勝負だぜ!' },
  ], effects: ['mutual(JIN,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_AMB_LEN_NEO_RAMEN', ['LENNY', 'NEO'], { cond: 'location == ramen', lines: [
    { sp: 'LENNY', text: 'ネオ、ラーメンの湯気で前が見えなくなってるよ。' },
    { sp: 'NEO', text: 'これでいいのである。湯気の向こうに、故郷の霧を見るのだ。……なんてな。すすらせろ。' },
  ], effects: ['mutual(LENNY,NEO,1)', 'log(AMBIENT)'] }),
  // --- ゲーセン ---
  A('DLG_AMB_JIN_NEO_GAME', ['JIN', 'NEO'], { cond: 'location == game', lines: [
    { sp: 'NEO', text: 'この剣戟の遊戯、なかなか本質を突いておる。だが私の間合いには及ばん。' },
    { sp: 'JIN', text: '御託はいいから対戦しようぜ! 負けたらジュース奢りな!' },
    { sp: 'NEO', text: '受けて立つ! 騎士に二言はない!' },
  ], effects: ['mutual(JIN,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_AMB_HYU_NEO_GAME', ['HYU', 'NEO'], { cond: 'location == game', lines: [
    { sp: 'HYU', text: 'ネオさん、その音ゲー、リズム感より優雅さです。ほら、指先はこう。' },
    { sp: 'NEO', text: 'ぬ……こうか? ……む、意外と楽しいではないか、これは。' },
  ], effects: ['mutual(HYU,NEO,1)', 'log(AMBIENT)'] }),
  // --- 本屋 ---
  A('DLG_AMB_HYU_NEO_BOOK', ['HYU', 'NEO'], { cond: 'location == book', lines: [
    { sp: 'NEO', text: '「武士道」なる異国の騎士道書、興味深い。貴様も読むか?' },
    { sp: 'HYU', text: '私は写真集専門です。……とはいえ、あなたが真剣に本を選ぶ姿、悪くない絵ですね。' },
  ], effects: ['mutual(HYU,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_AMB_GER_NEO_BOOK', ['GERU', 'NEO'], { cond: 'location == book', lines: [
    { sp: 'GERU', text: 'ネオ、その棚は歴史書だ。あんた向きだと思うぞ。……騎士の話、好きだろう。' },
    { sp: 'NEO', text: 'ほう、よく分かっているな。……貴様とは、良い読書仲間になれそうである。' },
  ], effects: ['mutual(GERU,NEO,1)', 'log(AMBIENT)'] }),
  // --- 花屋 ---
  A('DLG_AMB_LEN_NEO_FLOWER', ['LENNY', 'NEO'], { cond: 'location == flower', lines: [
    { sp: 'LENNY', text: 'ネオ、青いお花、似合うと思うよ。……あ、金髪だから金色のがいいのかな。' },
    { sp: 'NEO', text: 'ふむ……青も悪くない。一輪、部屋に飾るとしよう。貴様が選ぶなら、な。' },
  ], effects: ['mutual(LENNY,NEO,1)', 'log(AMBIENT)'] }),
  // --- 玩具屋 ---
  A('DLG_AMB_JIN_MUN_TOY', ['JIN', 'MUNI'], { cond: 'location == toyshop', weight: 16, lines: [
    { sp: 'MUNI', text: 'ジンパチおにいちゃん、このロボかっこいい! つくって!' },
    { sp: 'JIN', text: 'お、目が高いな坊主! これはな、上級者向けなんだぜ。よし、俺が組んでやる!' },
    { sp: 'MUNI', text: 'やったー! ジンパチおにいちゃん、てんさい!' },
    { sp: 'JIN', text: 'ハハッ! もっと言え! ……で、接着剤どこだ?' },
  ], effects: ['mutual(JIN,MUNI,1)', 'info(INFO_JIN_PLAMO)', 'log(AMBIENT)'] }),
  A('DLG_AMB_NEO_MUN_TOY', ['NEO', 'MUNI'], { cond: 'location == toyshop', lines: [
    { sp: 'MUNI', text: 'ネオおにいちゃん、けんのおもちゃ、ほしいの?' },
    { sp: 'NEO', text: 'ち、違う! 観察しているだけである! ……む、貴様がそう言うなら、一本くらい……' },
    { sp: 'MUNI', text: 'えへへ、ネオおにいちゃんもこどもなの。' },
  ], effects: ['mutual(NEO,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_AMB_JIN_HYU_TOY', ['JIN', 'HYU'], { cond: 'location == toyshop', lines: [
    { sp: 'HYU', text: 'ジンパチくん、プラモに夢中の横顔、いつもより三割増しでいい表情ですよ。' },
    { sp: 'JIN', text: 'う、うるせえ! 趣味を茶化すな! ……で、でも、まあ、悪い気はしねえけどよ。' },
  ], effects: ['mutual(HYU,JIN,1)', 'info(INFO_JIN_PLAMO)', 'log(AMBIENT)'] }),
  // --- 薬局 ---
  A('DLG_AMB_GER_NEO_PHARM', ['GERU', 'NEO'], { cond: 'location == pharmacy', lines: [
    { sp: 'GERU', text: 'ネオ、また栄養ドリンクか。……飲みすぎるなよ。あれは魔法じゃない。' },
    { sp: 'NEO', text: 'ぬ、心配してくれるのか。……ふ、殊勝である。だが騎士に休息は不要……いや、少し休むとしよう。' },
  ], effects: ['mutual(GERU,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_AMB_JIN_MUN_PHARM', ['JIN', 'MUNI'], { cond: 'location == pharmacy', lines: [
    { sp: 'MUNI', text: 'ジンパチおにいちゃん、ちゅうしゃこわい……' },
    { sp: 'JIN', text: '大丈夫だ坊主! 痛いのは一瞬! 男は歯ぁ食いしばれ! ……俺も横で握っててやるからよ!' },
    { sp: 'MUNI', text: 'うん! ムニ、がんばる!' },
  ], effects: ['mutual(JIN,MUNI,1)', 'log(AMBIENT)'] }),
  // --- カラオケ (ヒュウ以外も来て賑やかに / グループ含む) ---
  A('DLG_AMB_KARAOKE_TRIO', ['HYU', 'JIN', 'LENNY'], { cond: 'location == karaoke', weight: 18, lines: [
    { sp: 'HYU', text: 'では私のソロから。バラードで魅せましょう。' },
    { sp: 'JIN', text: '長え! 次、俺! 応援歌いくぜ! フレー! フレー!' },
    { sp: 'LENNY', text: '……zzz(ソファですでに寝ている)' },
    { sp: 'HYU', text: 'レニィ、私の熱唱を子守唄にしないでください。' },
  ], effects: ['mutual(HYU,JIN,1)', 'mutual(HYU,LENNY,1)', 'mutual(JIN,LENNY,1)', 'log(AMBIENT)'] }),
  A('DLG_AMB_NEO_GER_KARAOKE', ['NEO', 'GERU'], { cond: 'location == karaoke', lines: [
    { sp: 'NEO', text: '吟遊詩人の技、見せてやろう。……こほん。(朗々と歌い上げる)' },
    { sp: 'GERU', text: '……ほう。意外と上手いじゃないか。80点、いや85点だ。' },
    { sp: 'NEO', text: 'ふっ、当然である。だが貴様の採点、存外に楽しみだな。' },
  ], effects: ['mutual(GERU,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_AMB_MUN_JIN_KARAOKE', ['MUNI', 'JIN'], { cond: 'location == karaoke', lines: [
    { sp: 'MUNI', text: 'ジンパチおにいちゃん、いっしょにうたお! アニメのやつ!' },
    { sp: 'JIN', text: 'おう! 俺はサビしか知らねえけどな! そこは声のデカさでカバーだ!' },
  ], effects: ['mutual(JIN,MUNI,1)', 'log(AMBIENT)'] }),
  // --- 市場 追加 ---
  A('DLG_AMB_LEN_MUN_MARKET', ['LENNY', 'MUNI'], { cond: 'location == market', lines: [
    { sp: 'MUNI', text: 'レニィおにいちゃん、たまごおとさないでね!' },
    { sp: 'LENNY', text: 'だいじょうぶだよぉ……あ。……ムニ、見なかったことにして。' },
    { sp: 'MUNI', text: 'あーっ! われた! おばあちゃんにいってやるの!' },
  ], effects: ['mutual(LENNY,MUNI,1)', 'log(AMBIENT)'] }),
  // --- 居酒屋 追加 ---
  A('DLG_AMB_HYU_NEO_IZA', ['HYU', 'NEO'], { cond: 'location == izakaya and time in [NIGHT, MIDNIGHT]', lines: [
    { sp: 'HYU', text: 'ネオさん、今宵はいい飲みっぷりですね。悩みでも?' },
    { sp: 'NEO', text: '……貴様には敵わんな。少し、故郷を思い出しただけである。……もう一杯、付き合え。' },
    { sp: 'HYU', text: '喜んで。美しい夜には、美しい聞き役が必要でしょう?' },
  ], effects: ['mutual(HYU,NEO,1)', 'log(AMBIENT)'] }),
];
