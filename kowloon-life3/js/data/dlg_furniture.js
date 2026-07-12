// ============================================================
// 家具設置トリガー会話 (v2追加) — 設計書a 第1.8.7節 / 第6.6節
// 特定の家具を本人の家に置くと、その家具についての専用会話が出る。
// cond: location == HOME_X and has_furniture(X, item)
// pool STATE (施設・状態特化層)。
// ============================================================
const N = (id, owner, node) => ({ id, owner, type: 'TALK', pool: 'STATE', weight: 14, ...node });

const hf = (owner, item) => `location == HOME_${owner} and has_furniture(${owner}, ${item})`;

export const DLG_FURNITURE = [
  // ---------- レニィ ----------
  N('DLG_FN_LEN_CLOUDBED', 'LENNY', { cond: hf('LENNY', 'lenny_cloudbed'), lines: [{ sp: 'LENNY', text: 'この雲のベッド、沈み込むとね、そのまま空に浮かんでいくみたいなんだよぉ……もう、起きられない。' }], effects: ['aff(LENNY,1)'] }),
  N('DLG_FN_LEN_STARLAMP', 'LENNY', { cond: hf('LENNY', 'lenny_starlamp'), lines: [{ sp: 'LENNY', text: '星のランプ、つけっぱなしで寝ちゃうんだ。夢の中まで星が続いてる気がするんだよ。' }], effects: ['aff(LENNY,1)'] }),
  N('DLG_FN_LEN_SHEEP', 'LENNY', { cond: hf('LENNY', 'lenny_sheep'), lines: [{ sp: 'LENNY', text: 'ひつじクッション、数えなくても眠くなる魔法のクッションなんだ。1匹……zzz' }], effects: ['aff(LENNY,1)'] }),
  N('DLG_FN_LEN_BEANBAG', 'LENNY', { cond: hf('LENNY', 'lenny_beanbag'), lines: [{ sp: 'LENNY', text: '青いビーズクッション、体の形にぴったりなるんだよ。海に浮かんでるみたい。' }], effects: ['aff(LENNY,1)'] }),

  // ---------- ヒュウ ----------
  N('DLG_FN_HYU_MIRROR', 'HYU', { cond: hf('HYU', 'hyu_mirror'), lines: [{ sp: 'HYU', text: 'この黄金の姿見、ようやく私を正しく映せる鏡に出会えました。感謝しますよ、大家さん。' }], effects: ['aff(HYU,1)'] }),
  N('DLG_FN_HYU_ROSE', 'HYU', { cond: hf('HYU', 'hyu_rose'), lines: [{ sp: 'HYU', text: '薔薇と私、どちらが美しいか。……野暮な問いですね。両方に決まっています。' }], effects: ['aff(HYU,1)'] }),
  N('DLG_FN_HYU_SOFA', 'HYU', { cond: hf('HYU', 'hyu_sofa'), lines: [{ sp: 'HYU', text: 'このワインレッドのソファ、私の緑髪との対比が完璧です。計算された美です。' }], effects: ['aff(HYU,1)'] }),

  // ---------- ジンパチ ----------
  N('DLG_FN_JIN_SANDBAG', 'JIN', { cond: hf('JIN', 'jin_sandbag'), lines: [{ sp: 'JIN', text: 'このサンドバッグ、朝晩1000発! 相棒みたいなもんだぜ。名前もつけてる。「ヒュウ2号」だ!' }], effects: ['aff(JIN,1)'] }),
  N('DLG_FN_JIN_TATAMI', 'JIN', { cond: hf('JIN', 'jin_tatami'), lines: [{ sp: 'JIN', text: '畳の上でやるストレッチは効きが違うんだよ! い草の匂いで気合が入るぜ!' }], effects: ['aff(JIN,1)'] }),
  N('DLG_FN_JIN_TROPHY', 'JIN', { cond: hf('JIN', 'jin_trophy'), lines: [{ sp: 'JIN', text: 'このトロフィー棚、いつか本物で埋め尽くすんだ! 今は空だけどな! 夢はでかく、だろ!' }], effects: ['aff(JIN,1)'] }),
  N('DLG_FN_JIN_DUMBBELL', 'JIN', { cond: hf('JIN', 'jin_dumbbell'), lines: [{ sp: 'JIN', text: 'ダンベルラック、重い順に並べるのが俺の美学だぜ! 一番重いの、持ってみるか大家?' }], effects: ['aff(JIN,1)'] }),

  // ---------- ムニ ----------
  N('DLG_FN_MUN_BEAR', 'MUNI', { cond: hf('MUNI', 'muni_bear'), lines: [{ sp: 'MUNI', text: 'くまさん、よるいっしょにねるの。おなまえはね、「くまきち」なの。むにゅ〜。' }], effects: ['aff(MUNI,1)'] }),
  N('DLG_FN_MUN_BLOCKS', 'MUNI', { cond: hf('MUNI', 'muni_blocks'), lines: [{ sp: 'MUNI', text: 'つみき、おしろつくったの! ネオおにいちゃんのおうちみたいでしょ!' }], effects: ['aff(MUNI,1)'] }),
  N('DLG_FN_MUN_TOYBOX', 'MUNI', { cond: hf('MUNI', 'muni_toybox'), lines: [{ sp: 'MUNI', text: 'おもちゃばこ、あけるとたからものがいっぱいなの! でもおかたづけはにがてなの……' }], effects: ['aff(MUNI,1)'] }),
  N('DLG_FN_MUN_CRAYON', 'MUNI', { cond: hf('MUNI', 'muni_crayon'), lines: [{ sp: 'MUNI', text: 'おえかきしたの! これおおやさん! これレニィおにいちゃん! じょうずでしょ!' }], effects: ['aff(MUNI,1)'] }),

  // ---------- ゲル ----------
  N('DLG_FN_GER_BOOKWALL', 'GERU', { cond: hf('GERU', 'gel_bookwall'), lines: [{ sp: 'GERU', text: 'この本棚が埋まっていくのを眺めるのが、私の一番の贅沢だ。……ありがとう、大家。' }], effects: ['aff(GERU,1)'] }),
  N('DLG_FN_GER_CHESS', 'GERU', { cond: hf('GERU', 'gel_chess'), lines: [{ sp: 'GERU', text: 'チェス盤を置いてくれたか。……対戦相手が、ようやくできそうだな。あんただ。逃げるなよ。' }], effects: ['aff(GERU,1)'] }),
  N('DLG_FN_GER_DESK', 'GERU', { cond: hf('GERU', 'gel_desk'), lines: [{ sp: 'GERU', text: 'この紫のデスク、夜に向いている。ランプの灯りが落ち着くんだ。仕事がはかどる。' }], effects: ['aff(GERU,1)'] }),
  N('DLG_FN_GER_AROMA', 'GERU', { cond: hf('GERU', 'gel_aroma'), lines: [{ sp: 'GERU', text: 'アロマか。……柄じゃないが、悪くない。夜の読書が少し深くなる。' }], effects: ['aff(GERU,1)'] }),

  // ---------- ネオ ----------
  N('DLG_FN_NEO_THRONE', 'NEO', { cond: hf('NEO', 'neo_throne'), lines: [{ sp: 'NEO', text: 'ふはは! 黄金の玉座! これでこそ私の居城である! 貴様、そこに跪くことを許そう!' }], effects: ['aff(NEO,2)'] }),
  N('DLG_FN_NEO_CARPET', 'NEO', { cond: hf('NEO', 'neo_carpet'), lines: [{ sp: 'NEO', text: '赤い絨毯……足音を吸い込むこの感触、王の帰還にふさわしい。良い趣味である。' }], effects: ['aff(NEO,1)'] }),
  N('DLG_FN_NEO_CANDELABRA', 'NEO', { cond: hf('NEO', 'neo_candelabra'), lines: [{ sp: 'NEO', text: '黄金の燭台の炎、揺らめきが影に物語を描く。……故郷の広間を思い出すのである。' }], effects: ['aff(NEO,1)'] }),
  N('DLG_FN_NEO_PORTRAIT', 'NEO', { cond: hf('NEO', 'neo_portrait'), lines: [{ sp: 'NEO', text: '私の肖像画! よくぞ我が威光を捉えた! ……少々、実物の方が凛々しいがな。ふっ。' }], effects: ['aff(NEO,1)'] }),

  // ---------- 好みタグ総合(たくさん置いたとき) ----------
  N('DLG_FN_LEN_FULL', 'LENNY', { cond: 'location == HOME_LENNY and taste_score(LENNY) >= 6', weight: 20, lines: [{ sp: 'LENNY', text: 'わあ……僕の部屋、ふわふわで青いものだらけになったよ。世界一のお昼寝部屋だね。ありがと、大家さん。' }], effects: ['aff(LENNY,2)', 'log(DAILY)'] }),
  N('DLG_FN_NEO_FULL', 'NEO', { cond: 'location == HOME_NEO and taste_score(NEO) >= 6', weight: 20, lines: [{ sp: 'NEO', text: 'ふはは! 黄金と大理石に囲まれ、私はついに玉座を取り戻した! 貴様を専属装飾官として正式に任命する! 誉れと思え!' }], effects: ['aff(NEO,2)', 'log(DAILY)'] }),
];
