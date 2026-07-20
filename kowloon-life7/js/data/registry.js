// ============================================================
// フラグ / INFOトークン レジストリ (NPC会話設計書 第5章・第14章)
// 未登録IDの参照は tools/validate.js でエラーになる(タイポ防止)。
// INFOは「主人公が知ったこと」。複数ソースから取得可能にする(一本道防止)。
// ============================================================

export const FLAGS = {
  FLG_MET_LENNY: 'レニィと初対面',
  FLG_MET_HYU: 'ヒュウと初対面',
  FLG_MET_JIN: 'ジンパチと初対面',
  FLG_MET_MUNI: 'ムニと初対面',
  FLG_MET_GERU: 'ゲルと初対面',
  FLG_MET_NEO: 'ネオと初対面',
  FLG_MET_BARBER: '床屋のオヤジと初対面',
  FLG_MET_KANE: '小暮カネと初対面',
  FLG_MET_POSTMAN: '郵便屋サンと初対面',
  FLG_MET_CAFEGIRL: '看板娘サチと初対面',
  FLG_EV_LENNY_S3: 'レニィ友人イベント視聴',
  FLG_EV_LENNY_S5: 'レニィ特別イベント視聴',
  FLG_EV_HYU_S3: 'ヒュウ友人イベント視聴',
  FLG_EV_HYU_S5: 'ヒュウ特別イベント視聴',
  FLG_EV_JIN_S3: 'ジンパチ友人イベント視聴',
  FLG_EV_JIN_S5: 'ジンパチ特別イベント視聴',
  FLG_EV_MUNI_S3: 'ムニ友人イベント視聴',
  FLG_EV_MUNI_S5: 'ムニ特別イベント視聴',
  FLG_EV_GERU_S3: 'ゲル友人イベント視聴',
  FLG_EV_GERU_S5: 'ゲル特別イベント視聴',
  FLG_EV_NEO_S3: 'ネオ友人イベント視聴',
  FLG_EV_NEO_OPEN_1: 'ネオの過去(一)解放',
  FLG_EV_NEO_OPEN_2: 'ネオの過去(二)解放',
  FLG_Q_MUNI_LAMP: 'ムニのお願い「よるこわいの」受注',
  FLG_Q_MUNI_LAMP_DONE: 'ムニの部屋にランプを置いた',
  FLG_Q_JIN_TATAMI: 'ジンパチのお願い「畳が欲しい」受注',
  FLG_Q_JIN_TATAMI_DONE: 'ジンパチの部屋に畳を置いた',
  FLG_RUM_NEO_BARBER_OK: '噂「ネオと床屋」を本人に確認済み',
  FLG_RUM_JIN_SWEETS_OK: '噂「ジンパチの甘党」を本人に確認済み',
  FLG_RUM_LENNY_FAIRY_OK: '噂「レニィと妖精」を本人に確認済み',
  FLG_NEO_RAMEN_DEBUT: 'ネオ、初めてのラーメン',
  FLG_MET_DAGASHIYA: '駄菓子屋のおばあさんと初対面',
  FLG_MET_THIEF: 'コソ泥と遭遇した',
  FLG_MET_CLERK: 'コンビニ店員リンと初対面',
  FLG_MET_MARTIN: 'マルタン神父と初対面',
  FLG_CONFESS_LENNY: 'レニィの告白イベント視聴',
  FLG_CONFESS_HYU: 'ヒュウの告白イベント視聴',
  FLG_CONFESS_JIN: 'ジンパチの告白イベント視聴',
  FLG_CONFESS_GERU: 'ゲルの告白イベント視聴',
  FLG_CONFESS_NEO: 'ネオの告白イベント視聴',
  FLG_FAMILY_MUNI: 'ムニと家族の絆イベント視聴',
  FLG_Q_JIN_PLAMO: 'ジンパチのお願い「プラモを飾りたい」受注',
  FLG_Q_JIN_PLAMO_DONE: 'ジンパチの部屋にプラモデル展示棚を置いた',
  FLG_THIEF_REPELLED: 'コソ泥を撃退したことがある',
};

export const INFOS = {
  INFO_LENNY_LIKES_RAIN: { label: 'レニィは雨の夜が好き', category: '人物' },
  INFO_LENNY_SEA_DREAM: { label: 'レニィはよく海の夢を見る', category: '人物' },
  INFO_HYU_MORNING: { label: 'ヒュウの前髪は毎朝2時間かかる', category: '人物' },
  INFO_HYU_KIND: { label: 'ヒュウは雨の日、ムニに傘を差してやっていた', category: '人物' },
  INFO_JIN_STAIRS: { label: 'ジンパチは毎朝タワーの階段を10往復している', category: '人物' },
  INFO_JIN_SWEETS: { label: 'ジンパチは実は甘党', category: '人物' },
  INFO_JIN_PLAMO: { label: 'ジンパチはプラモデル作りが趣味', category: '人物' },
  INFO_MUNI_NIGHT: { label: 'ムニは夜ひとりが怖い', category: '人物' },
  INFO_MUNI_LODGER: { label: 'ムニはタワーみんなで育てている下宿の子', category: '人物' },
  INFO_GERU_CARING: { label: 'ゲルは夜、ムニを部屋まで送っている', category: '人物' },
  INFO_GERU_PHOTO: { label: 'ゲルは古い写真を大切にしている', category: '人物' },
  INFO_NEO_PAST_1: { label: 'ネオの金髪は騎士だった頃の誇り', category: '人物' },
  INFO_NEO_PAST_2: { label: 'ネオは故郷の城を出てこの街に流れ着いた', category: '人物' },
  INFO_NEO_RAMEN: { label: 'ネオはラーメンに心を奪われている', category: '人物' },
  INFO_KANE_PAST: { label: 'カネはかつてこの塔の一階で食堂をやっていた', category: '人物' },
  INFO_BARBER_NEO: { label: '床屋のオヤジはネオの髪を「切るのが惜しい」と思っている', category: '人物' },
  INFO_POSTMAN_LETTERS: { label: '住民同士は今も手紙をやり取りしている', category: '街' },
};

// ------------------------------------------------------------
// 噂 (NPC会話設計書 第13章) — 簡易版: 発生源で聴取→本人確認でINFO昇格
// ------------------------------------------------------------
export const RUMORS = {
  RUM_NEO_BARBER: {
    id: 'RUM_NEO_BARBER', subject: 'NEO', origin: 'BARBER',
    text: '床屋のオヤジ、ネオの金髪を切るのは惜しいって言ってるらしい',
    confirmFlag: 'FLG_RUM_NEO_BARBER_OK',
  },
  RUM_JIN_SWEETS: {
    id: 'RUM_JIN_SWEETS', subject: 'JIN', origin: 'KANE',
    text: 'ジンパチが駄菓子屋で山ほど甘いものを買い込んでたらしいよ',
    confirmFlag: 'FLG_RUM_JIN_SWEETS_OK',
  },
  RUM_LENNY_FAIRY: {
    id: 'RUM_LENNY_FAIRY', subject: 'LENNY', origin: 'HYU',       // ヒュウの創作噂(第13.3節⑤)
    text: 'レニィは屋上で妖精と話しているらしいですよ。……ふふ、素敵でしょう?',
    confirmFlag: 'FLG_RUM_LENNY_FAIRY_OK',
  },
};

// ------------------------------------------------------------
// 人物辞典 (NPC会話設計書 第18.1節) — アンロック段落+出典表示
// ------------------------------------------------------------
export const DICTIONARY = {
  LENNY: [
    { cond: 'true', text: '青い髪と青い瞳の男子学生。いつも眠そう。', source: 'プロフィール' },
    { cond: 'rank(PC, LENNY) >= 2', text: '喫茶店と屋上がお気に入り。花屋の花をよく眺めている。', source: '本人の話' },
    { cond: 'info(INFO_LENNY_LIKES_RAIN)', text: '雨の夜は「街全体が水槽の中みたい」で好きらしい。', source: '雨の夜の会話' },
    { cond: 'info(INFO_LENNY_SEA_DREAM)', text: 'よく海の夢を見る。いつか本物の海を見に行きたいと思っている。', source: '屋上での話' },
    { cond: 'heard_rumor(RUM_LENNY_FAIRY)', text: '屋上で妖精と話している……という噂がある(真偽不明)。', source: 'ヒュウの噂話' },
  ],
  HYU: [
    { cond: 'true', text: '緑髪に赤い瞳。前髪で片目が隠れた長身のナルシスト。常に敬語。', source: 'プロフィール' },
    { cond: 'rank(PC, HYU) >= 2', text: 'レニィは呼び捨て、ジンパチは「ジンパチくん」と呼ぶ。', source: '観察' },
    { cond: 'info(INFO_HYU_MORNING)', text: '完璧な前髪のセットには毎朝2時間かかっている。', source: '本人の告白' },
    { cond: 'info(INFO_HYU_KIND)', text: '雨の日、ムニにそっと傘を差してやっていた。本人は認めない。', source: 'カネの目撃談' },
  ],
  JIN: [
    { cond: 'true', text: '茶髪ツンツンヘアーの熱血漢。一人称は俺。声が大きい。', source: 'プロフィール' },
    { cond: 'info(INFO_JIN_STAIRS)', text: '毎朝タワーの外階段を10往復する。本人いわく「鍛錬」。', source: '本人の自慢' },
    { cond: 'info(INFO_JIN_SWEETS)', text: '実は大の甘党。駄菓子屋の常連であることを隠している。', source: '噂の確認' },
    { cond: 'info(INFO_JIN_PLAMO)', text: 'プラモデル作りが趣味。玩具屋に新作が入ると人が変わったようにはしゃぐ。', source: '玩具屋での目撃' },
    { cond: 'rank(PC, JIN) >= 4', text: '面倒見が良く、ムニの遊び相手を頼まれると断れない。', source: '親しくなって' },
  ],
  MUNI: [
    { cond: 'true', text: '5歳の男の子。青い髪。甘えん坊で寂しがり屋。', source: 'プロフィール' },
    { cond: 'info(INFO_MUNI_LODGER)', text: 'タワーのみんなで育てている「下宿の子」。', source: 'カネの話' },
    { cond: 'info(INFO_MUNI_NIGHT)', text: '夜ひとりでいるのが怖い。灯りがあると安心する。', source: '本人のお願い' },
    { cond: 'rank(PC, MUNI) >= 4', text: 'レニィのベッドでお昼寝するのが世界で一番好き。', source: '本人の話' },
  ],
  GERU: [
    { cond: 'true', text: '紫髪セミロングボブ。6人で唯一の女性。硬質な話し方をする。', source: 'プロフィール' },
    { cond: 'rank(PC, GERU) >= 2', text: '夜型。本屋と居酒屋が行きつけ。', source: '観察' },
    { cond: 'info(INFO_GERU_CARING)', text: '夜遅くなったムニを、何も言わずに部屋まで送っている。', source: '深夜の目撃' },
    { cond: 'info(INFO_GERU_PHOTO)', text: '古い写真を一枚、本の栞にしている。写っているのは……', source: '本人の話(S5)' },
  ],
  NEO: [
    { cond: 'true', text: '金髪ロングに騎士風の装い。自称魔法剣士。二人称は「貴様」。', source: 'プロフィール' },
    { cond: 'flag(FLG_NEO_RAMEN_DEBUT)', text: 'ラーメンなる庶民の美食に衝撃を受けていた。', source: '目撃' },
    { cond: 'info(INFO_NEO_PAST_1)', text: 'あの金髪は騎士だった頃の誇りそのもの。だから絶対に切らない。', source: '床屋の話' },
    { cond: 'info(INFO_NEO_PAST_2)', text: '故郷の城を出て、遠い旅の果てにこの塔へ流れ着いたらしい。', source: '深夜の告白' },
  ],
  BARBER: [
    { cond: 'true', text: 'バーバー飛龍の店主。腕は確か。', source: 'プロフィール' },
    { cond: 'info(INFO_BARBER_NEO)', text: 'ネオの金髪を「切るのは惜しい」と手入れだけしている。', source: '本人の話' },
  ],
  KANE: [
    { cond: 'true', text: '路地の主のような毒舌ばあさん。', source: 'プロフィール' },
    { cond: 'kane_softness >= 40', text: '口は悪いが、ムニとレニィには自分から声をかける。', source: '観察' },
    { cond: 'info(INFO_KANE_PAST)', text: 'かつてこの塔の一階で小さな食堂をやっていた。', source: '本人の昔語り' },
  ],
  POSTMAN: [
    { cond: 'true', text: '九龍郵便局の配達員。今日も塔を駆け回る。', source: 'プロフィール' },
    { cond: 'info(INFO_POSTMAN_LETTERS)', text: '住民たちの文通事情に(守秘義務の範囲で)詳しい。', source: '本人の話' },
  ],
  MARTIN: [
    { cond: 'true', text: '九龍聖堂の老神父。黒髪に白い法衣。真面目で心優しく、話し方は「〜ですな」「〜ですぞ」。', source: 'プロフィール' },
    { cond: 'flag(FLG_MET_MARTIN)', text: '懺悔室で、住民たちの悩みや後悔に静かに耳を傾けている。裁かず、ただ聴く人。', source: '聖堂での出会い' },
  ],
};
