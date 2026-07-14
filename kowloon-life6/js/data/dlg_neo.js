// ============================================================
// ネオ会話DB — 口調正準: 一人称「私」/ 二人称「貴様」/ 尊大「〜である」「〜したまえ」
// 騎士風の装い。成長×0.5、INFO_NEO_PAST_* が「心を開く鍵」(第16.4節)
// ============================================================
const N = (id, node) => ({ id, owner: 'NEO', ...node });

export const DLG_NEO = [
  // ---------- 初対面 ----------
  N('DLG_NEO_FIRST_001', {
    type: 'EVENT', pool: 'EVENT', once: true,
    lines: [
      { sp: 'NEO', text: '止まりたまえ。……ふむ、貴様がこの塔の主か。' },
      { sp: 'NEO', text: '私はネオ。誇り高き魔法剣士である。……この剣? 装飾である。抜かぬ。平和な街だからな。' },
      { sp: 'NEO', text: 'この塔、混沌としているが……嫌いではない。精進したまえ、大家殿。' },
    ],
    effects: ['flag(FLG_MET_NEO)', 'aff(NEO,2)', 'log(EVENT)'],
  }),

  // ---------- ラーメンデビュー (第1.8.6節のセリフ例) ----------
  N('DLG_NEO_EV_RAMEN', {
    type: 'EVENT', pool: 'EVENT', once: true,
    cond: 'built(ramen) and location == ramen',
    lines: [
      { sp: 'NEO', text: 'な……なんだこの『ラーメン』なる料理は……!' },
      { sp: 'NEO', text: 'スープの黄金色、麺の輝き、チャーシューの威厳……私の知る美食を超えている……!' },
      { sp: 'NEO', text: '……こほん。貴様、見なかったことにしたまえ。だが、明日も来る。' },
    ],
    effects: ['flag(FLG_NEO_RAMEN_DEBUT)', 'info(INFO_NEO_RAMEN)', 'aff(NEO,3)', 'log(EVENT)'],
  }),

  // ---------- 心を開く鍵 (INFO収集で解放) ----------
  N('DLG_NEO_EV_OPEN_1', {
    type: 'EVENT', pool: 'EVENT', once: true,
    cond: 'info(INFO_NEO_PAST_1) and rank(PC, NEO) >= 2',
    lines: [
      { sp: 'NEO', text: '……床屋のオヤジから聞いたのか。私の髪のことを。' },
      { sp: 'NEO', text: 'そうだ。この金髪は、騎士であった頃の私に残された、最後の誇りである。' },
      { sp: 'NEO', text: '……ふん。知られたからには仕方ない。貴様には、少しだけ語ることを許そう。' },
    ],
    effects: ['flag(FLG_EV_NEO_OPEN_1)', 'aff(NEO,8)', 'log(EVENT)'],
  }),
  N('DLG_NEO_EV_OPEN_2', {
    type: 'EVENT', pool: 'EVENT', once: true,
    cond: 'flag(FLG_EV_NEO_OPEN_1) and rank(PC, NEO) >= 4 and (time == MIDNIGHT or @rainy_night)',
    lines: [
      { sp: 'NEO', text: '……こんな時間に来るとは。まあいい。夜は、少しだけ口が軽くなる。' },
      { sp: 'NEO', text: '私は故郷の城を出た身である。理由は……守るべきものを、守る順番を間違えたからだ。' },
      { sp: 'NEO', text: 'だがこの塔に来て分かった。守るべきものは、玉座ではなく、灯りのともる窓の数なのだと。' },
      { sp: 'NEO', text: '……貴様。このことを話したのは、貴様が初めてである。' },
    ],
    effects: ['flag(FLG_EV_NEO_OPEN_2)', 'info(INFO_NEO_PAST_2)', 'aff(NEO,8)', 'log(EVENT)'],
  }),

  // ---------- 汎用 ----------
  N('DLG_NEO_GEN_001', { type: 'TALK', pool: 'GENERIC', lines: [{ sp: 'NEO', text: 'ふん、貴様か。私の姿を拝みに来たのであれば、許可しよう。' }], effects: ['aff(NEO,1)'] }),
  N('DLG_NEO_GEN_002', { type: 'TALK', pool: 'GENERIC', lines: [{ sp: 'NEO', text: 'この塔は混沌である。だが、混沌には混沌の秩序がある。……最近わかってきた。' }], effects: ['aff(NEO,1)'] }),
  N('DLG_NEO_GEN_003', { type: 'TALK', pool: 'GENERIC', lines: [{ sp: 'NEO', text: 'ジンパチは騒がしすぎる。だが、あの熱意だけは認めてやろう。' }], effects: ['aff(NEO,1)'] }),
  N('DLG_NEO_GEN_004', { type: 'TALK', pool: 'GENERIC', lines: [{ sp: 'NEO', text: '貴様、ガチャとやらで私の部屋に相応しい品を探してくるのだ。黄金色のものを所望する。' }], effects: ['aff(NEO,1)'] }),
  N('DLG_NEO_GEN_005', { type: 'TALK', pool: 'GENERIC', lines: [{ sp: 'NEO', text: 'あの婆……小暮カネといったか。無礼極まりない。だが妙に、話しに行ってしまうのだ。なぜである。' }], effects: ['aff(NEO,1)'] }),
  N('DLG_NEO_GEN_006', { type: 'TALK', pool: 'GENERIC', lines: [{ sp: 'NEO', text: '駄菓子なる文化を知っているか。10圓であの満足感……この街の錬金術である。' }], effects: ['aff(NEO,1)'] }),

  // ---------- 時間帯 ----------
  N('DLG_NEO_TIME_MORN_001', { type: 'TALK', pool: 'COND', cond: 'time == MORNING', lines: [{ sp: 'NEO', text: '朝である。騎士の朝は早い。……というのは建前で、隣のジンパチの掛け声で起こされるのである。' }], effects: ['aff(NEO,1)'] }),
  N('DLG_NEO_TIME_DAY_001', { type: 'TALK', pool: 'COND', cond: 'time == DAY', lines: [{ sp: 'NEO', text: '昼は街の探索に充てている。今日は「ガチャガチャ」なる装置の観察である。あの回す瞬間の高揚……侮れん。' }], effects: ['aff(NEO,1)'] }),
  N('DLG_NEO_TIME_EVE_001', { type: 'TALK', pool: 'COND', cond: 'time == EVENING', lines: [{ sp: 'NEO', text: '夕暮れ時、ネオンがひとつずつ点る。……この瞬間だけは、故郷の星空より美しいと認めざるを得ん。' }], effects: ['aff(NEO,1)'] }),
  N('DLG_NEO_TIME_NIGHT_001', { type: 'TALK', pool: 'COND', cond: 'time == NIGHT', lines: [{ sp: 'NEO', text: 'ふっ……夜景と私、どちらが美しいかだと? 愚問である。' }], effects: ['aff(NEO,1)'] }),
  N('DLG_NEO_TIME_MID_001', { type: 'TALK', pool: 'COND', cond: 'time == MIDNIGHT', lines: [{ sp: 'NEO', text: '……眠れんのである。故郷の夢を見た。……貴様、少し付き合いたまえ。話は、しなくてよい。' }], effects: ['aff(NEO,1)'] }),

  // ---------- 天候 ----------
  N('DLG_NEO_WX_RAIN_001', { type: 'TALK', pool: 'COND', cond: 'weather == RAIN', lines: [{ sp: 'NEO', text: '雨である。マントが重くなるのが難点だが……雨に烟るネオンは、絵画のようであるな。' }], effects: ['aff(NEO,1)'] }),
  N('DLG_NEO_WX_SUN_001', { type: 'TALK', pool: 'COND', cond: 'weather == SUNNY', lines: [{ sp: 'NEO', text: '快晴である。私の金髪が最も輝く日である。心して見たまえ。' }], effects: ['aff(NEO,1)'] }),
  N('DLG_NEO_WX_CLOUD_001', { type: 'TALK', pool: 'COND', cond: 'weather == CLOUDY', lines: [{ sp: 'NEO', text: '曇天である。太陽が私に遠慮したのであろう。無理もない。' }], effects: ['aff(NEO,1)'] }),

  // ---------- 季節 ----------
  N('DLG_NEO_SEA_SPR_001', { type: 'TALK', pool: 'COND', cond: 'season == SPRING', lines: [{ sp: 'NEO', text: '春である。花屋の娘が私に花を勧めてきた。……一輪だけ買った。悪くない文化である。' }], effects: ['aff(NEO,1)'] }),
  N('DLG_NEO_SEA_SUM_001', { type: 'TALK', pool: 'COND', cond: 'season == SUMMER', lines: [{ sp: 'NEO', text: '夏である。この装いは正直、暑い。だが騎士たるもの、優雅さを捨てるわけにはいかんのである。' }], effects: ['aff(NEO,1)'] }),
  N('DLG_NEO_SEA_AUT_001', { type: 'TALK', pool: 'COND', cond: 'season == AUTUMN', lines: [{ sp: 'NEO', text: '秋である。焼き芋なるものを食した。……あの婆が寄越したのだ。ふん、美味であった。' }], effects: ['aff(NEO,1)'] }),
  N('DLG_NEO_SEA_WIN_001', { type: 'TALK', pool: 'COND', cond: 'season == WINTER', lines: [{ sp: 'NEO', text: '冬である。銭湯なる文化の真価を知った。あれは……玉座より良い。訂正はせん。事実である。' }], effects: ['aff(NEO,1)'] }),

  // ---------- 施設 ----------
  N('DLG_NEO_FAC_BARBER_001', { type: 'TALK', pool: 'FAC', cond: 'location == barber', lines: [{ sp: 'NEO', text: 'オヤジ殿には手入れだけを頼んでいる。この髪は切らん。……騎士の誇り、である。' }], effects: ['aff(NEO,1)', 'info(INFO_NEO_PAST_1)'] }),
  N('DLG_NEO_FAC_RAMEN_001', { type: 'TALK', pool: 'FAC', cond: 'location == ramen and flag(FLG_NEO_RAMEN_DEBUT)', lines: [{ sp: 'NEO', text: '……貴様も食べに来たのか。良い判断である。本日は味玉を追加した。私は学習する男である。' }], effects: ['aff(NEO,1)'] }),
  N('DLG_NEO_FAC_DAGASHI_001', { type: 'TALK', pool: 'FAC', cond: 'location == dagashi', lines: [{ sp: 'NEO', text: 'き、貴様……! これは違うのである! ムニに付き合って選んでやっているだけで……ラムネ菓子は私のではない! ……半分は私のである。' }], effects: ['aff(NEO,1)'] }),
  N('DLG_NEO_FAC_IZAKAYA_001', { type: 'TALK', pool: 'FAC', cond: 'location == izakaya and time == MIDNIGHT', weight: 14, lines: [{ sp: 'NEO', text: '閉店間際のこの店の静けさは良い。……貴様も座りたまえ。無言の時間を共有できる者は、貴重である。' }], effects: ['aff(NEO,2)'] }),

  // ---------- 状態特化 ----------
  N('DLG_NEO_TASTE_001', {
    type: 'TALK', pool: 'STATE', cond: 'location == HOME_NEO and taste_score(NEO) >= 4', once: true,
    lines: [{ sp: 'NEO', text: 'ほう……! 黄金、大理石、深紅の絨毯……! 見事である! 貴様を私の専属装飾官に任命しよう。誉れと思いたまえ!' }],
    effects: ['aff(NEO,3)', 'log(DAILY)'],
  }),
  N('DLG_NEO_SLEEP_001', { type: 'TALK', pool: 'STATE', cond: 'activity(NEO) == SLEEP', weight: 20, lines: [{ sp: 'NEO', text: 'すぅ……。(騎士の姿勢のまま眠っている。枕元にラムネ菓子の包みが見える)' }] }),
  N('DLG_NEO_RUMOR_BARBER', {
    type: 'TALK', pool: 'STATE', cond: 'heard_rumor(RUM_NEO_BARBER) and not flag(FLG_RUM_NEO_BARBER_OK)', weight: 30,
    lines: [
      { sp: 'NEO', text: '……む。オヤジ殿がそのようなことを? 私の髪を、惜しいと。' },
      { sp: 'NEO', text: '……ふ、ふん。当然である! この金髪の価値が分かるとは、さすがオヤジ殿である!' },
      { sp: 'NEO', text: '(明らかに嬉しそうである)' },
    ],
    effects: ['flag(FLG_RUM_NEO_BARBER_OK)', 'info(INFO_BARBER_NEO)', 'aff(NEO,2)', 'log(RUMOR)'],
  }),

  // ---------- バーク ----------
  N('BRK_NEO_001', { type: 'BARK', pool: 'BARK', lines: [{ sp: 'NEO', text: 'ふん、良い街である' }] }),
  N('BRK_NEO_002', { type: 'BARK', pool: 'BARK', cond: 'built(ramen)', lines: [{ sp: 'NEO', text: '今日も拉麺の香りが……' }] }),
  N('BRK_NEO_003', { type: 'BARK', pool: 'BARK', cond: 'weather == SUNNY', lines: [{ sp: 'NEO', text: '私の髪が輝く日である' }] }),
  N('BRK_NEO_004', { type: 'BARK', pool: 'BARK', cond: 'time == MIDNIGHT', lines: [{ sp: 'NEO', text: '……眠れんのである' }] }),
];
