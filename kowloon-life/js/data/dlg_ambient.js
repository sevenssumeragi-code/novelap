// ============================================================
// NPC同士の雑談 (AMBIENT) — NPC会話設計書 第12章
// 同時刻・同ロケーションにいる定義済みペアで発火。
// プレイヤーがそのフロアを見ていると「盗み聞き」でき、
// 最後まで聞くと effects (INFO獲得・ログ登録) が発生する。
// owner はペアキー(アルファベット順ソート)。
// ============================================================
const N = (id, node) => ({ id, type: 'AMBIENT', pool: 'AMBIENT', ...node });

export const DLG_AMBIENT = [
  // ---------- レニィ × ヒュウ ----------
  N('DLG_AMB_LEN_HYU_001', {
    owner: 'HYU-LENNY',
    lines: [
      { sp: 'HYU', text: 'レニィ、また屋上で寝ていたのですか。' },
      { sp: 'LENNY', text: 'んー……屋上の風が、僕を呼んだんだよ。' },
      { sp: 'HYU', text: '……まあ、絵にはなりますが。風邪をひいたら承知しませんよ。' },
    ],
    effects: ['mutual(HYU,LENNY,1)', 'log(AMBIENT)'],
  }),
  N('DLG_AMB_LEN_HYU_002', {
    owner: 'HYU-LENNY', cond: 'weather == RAIN',
    lines: [
      { sp: 'LENNY', text: 'ヒュウ、前髪、だいじょうぶ?' },
      { sp: 'HYU', text: '……レニィ。その質問は、戦場で兵士に「怖くないか」と聞くようなものです。' },
      { sp: 'LENNY', text: 'つまり、だいじょうぶじゃないんだね。' },
    ],
    effects: ['mutual(HYU,LENNY,1)', 'log(AMBIENT)'],
  }),
  // ---------- レニィ × ジンパチ ----------
  N('DLG_AMB_LEN_JIN_001', {
    owner: 'JIN-LENNY',
    lines: [
      { sp: 'JIN', text: 'レニィ! 走るぞ! 階段10往復!' },
      { sp: 'LENNY', text: 'いってらっしゃい。僕は心のなかで応援してるよ。' },
      { sp: 'JIN', text: '心のなかじゃ筋肉はつかねえんだよ! ……ま、おまえはそれでいいけどな!' },
    ],
    effects: ['mutual(JIN,LENNY,1)', 'log(AMBIENT)'],
  }),
  N('DLG_AMB_LEN_JIN_002', {
    owner: 'JIN-LENNY', cond: 'time == DAY',
    lines: [
      { sp: 'JIN', text: 'おいレニィ、昼飯食ったか? ナポリタン大盛りおごってやるぜ!' },
      { sp: 'LENNY', text: 'ほんと? ジンパチはやさしいねえ。……半分こでいいよ、僕、途中で寝ちゃうかもだし。' },
      { sp: 'JIN', text: '飯の途中で寝るなよ!?' },
    ],
    effects: ['mutual(JIN,LENNY,1)', 'log(AMBIENT)'],
  }),
  // ---------- ヒュウ × ジンパチ ----------
  N('DLG_AMB_HYU_JIN_001', {
    owner: 'HYU-JIN',
    lines: [
      { sp: 'JIN', text: 'ヒュウ! てめえまた鏡見てんのか! 俺と勝負しろ!' },
      { sp: 'HYU', text: 'ジンパチくん、声が大きいですよ。私の優雅な午後が台無しでしょう?' },
      { sp: 'JIN', text: '優雅より筋肉だろ!' },
      { sp: 'HYU', text: 'その二択が既に敗北なのです。' },
    ],
    effects: ['mutual(HYU,JIN,1)', 'log(AMBIENT)'],
  }),
  N('DLG_AMB_HYU_JIN_002', {
    owner: 'HYU-JIN', cond: 'built(game)',
    lines: [
      { sp: 'JIN', text: '昨日のゲーセンの点数、俺の勝ちだったよな!?' },
      { sp: 'HYU', text: '機械の調子が悪かったのです。私の実力はあんなものではありませんね。' },
      { sp: 'JIN', text: '負け惜しみだぜ! 今夜リベンジマッチだ!' },
      { sp: 'HYU', text: '……ふ。受けて立ちましょう。' },
    ],
    effects: ['mutual(HYU,JIN,2)', 'log(AMBIENT)'],
  }),
  // ---------- レニィ × ムニ ----------
  N('DLG_AMB_LEN_MUN_001', {
    owner: 'LENNY-MUNI',
    lines: [
      { sp: 'MUNI', text: 'レニィおにいちゃん、おきて〜。ムニとあそぶの!' },
      { sp: 'LENNY', text: 'んん……あと五分……いや、三分でいいよ……' },
      { sp: 'MUNI', text: 'じゃあムニもいっしょにねる! むにゅ〜。' },
      { sp: 'LENNY', text: '……それが一番かしこいね。' },
    ],
    effects: ['mutual(LENNY,MUNI,1)', 'log(AMBIENT)'],
  }),
  // ---------- ゲル × ムニ ----------
  N('DLG_AMB_GER_MUN_001', {
    owner: 'GERU-MUNI', cond: 'time in [NIGHT, MIDNIGHT]',
    lines: [
      { sp: 'GERU', text: 'ムニ、夜更かしはだめだ。……ほら、手を出せ。送ってやる。' },
      { sp: 'MUNI', text: 'ゲルおねえちゃんの手、あったかいの。' },
      { sp: 'GERU', text: '……そうか。なら、ゆっくり歩くとするか。' },
    ],
    effects: ['mutual(GERU,MUNI,1)', 'info(INFO_GERU_CARING)', 'log(AMBIENT)'],
  }),
  N('DLG_AMB_GER_MUN_002', {
    owner: 'GERU-MUNI',
    lines: [
      { sp: 'MUNI', text: 'ゲルおねえちゃん、そのほん、なにがかいてあるの?' },
      { sp: 'GERU', text: '海の向こうの、遠い街の話だ。……読んでやろうか。' },
      { sp: 'MUNI', text: 'よむ! ムニ、おはなしすき!' },
    ],
    effects: ['mutual(GERU,MUNI,1)', 'log(AMBIENT)'],
  }),
  // ---------- ネオ × カネ (口喧嘩の様式美) ----------
  N('DLG_AMB_NEO_KAN_001', {
    owner: 'KANE-NEO',
    lines: [
      { sp: 'KANE', text: 'おや金ぴか。今日も無駄にキラキラしてるねぇ。目が痛いよ。' },
      { sp: 'NEO', text: 'ふん、婆。貴様こそ今日も舌が絶好調である。その毒で塔の錆でも落としたまえ。' },
      { sp: 'KANE', text: '言うようになったじゃないか、ひよっこ騎士。' },
      { sp: 'NEO', text: '(……なぜだ。この応酬、悪くないのである)' },
    ],
    effects: ['mutual(KANE,NEO,1)', 'log(AMBIENT)'],
  }),
  N('DLG_AMB_NEO_KAN_002', {
    owner: 'KANE-NEO', cond: 'mutual(KANE,NEO) >= 40',
    lines: [
      { sp: 'KANE', text: 'ほら金ぴか、飴だよ。口喧嘩の駄賃さ。' },
      { sp: 'NEO', text: '……ふん。もらってやるのである。……昨日のより、いちご味が良い。' },
      { sp: 'KANE', text: '注文が多いね! ……ふふ、明日持ってきてやるよ。' },
    ],
    effects: ['mutual(KANE,NEO,2)', 'log(AMBIENT)'],
  }),
  // ---------- ゲル × ネオ ----------
  N('DLG_AMB_GER_NEO_001', {
    owner: 'GERU-NEO', cond: 'built(izakaya) and time in [NIGHT, MIDNIGHT]',
    lines: [
      { sp: 'NEO', text: '貴様も静かに飲む派か。良い心がけである。' },
      { sp: 'GERU', text: '私のはジュースだがな。……あんたのその酒、強いんだろう。よく平気だな。' },
      { sp: 'NEO', text: '騎士のたしなみである。……少し、酔ってはいるがな。' },
    ],
    effects: ['mutual(GERU,NEO,1)', 'log(AMBIENT)'],
  }),
  // ---------- ネオ × 床屋 ----------
  N('DLG_AMB_NEO_BRB_001', {
    owner: 'BARBER-NEO',
    lines: [
      { sp: 'BARBER', text: '今日も手入れだけかい、ネオの坊や。' },
      { sp: 'NEO', text: '当然である。だが……オヤジ殿の櫛づかいは、認めてやってもよい。' },
      { sp: 'BARBER', text: 'そりゃ光栄じゃのう。ふぉっふぉ。' },
    ],
    effects: ['mutual(BARBER,NEO,1)', 'info(INFO_BARBER_NEO)', 'log(AMBIENT)'],
  }),
];
