// ============================================================
// 季節イベント (v4)
// calendar: 季節の「特定の日」(SEASON_DAYS=8日中の何日目か / 中頃に配置)
// object: その日だけ集会所に置くオブジェクト(翌日消去)
// gather: 主要人物みんなで集会所に集まる。仲良くなればカネも来る。
// tanabata は全員の「願い事」を笹に飾り、クリックで一人ずつ読める。
// ============================================================

export const EVENTS = {
  // --- 春 ---
  HINA:      { id: 'HINA',      name: 'ひな祭り',   emoji: '🎎', season: 'SPRING', dayOfSeason: 2, object: 'hinadolls' },
  HANAMI:    { id: 'HANAMI',    name: 'お花見',     emoji: '🌸', season: 'SPRING', dayOfSeason: 4, object: 'sakura' },
  BIRTHDAY_MUNI: { id: 'BIRTHDAY_MUNI', name: 'ムニの誕生日会', emoji: '🎂', season: 'SPRING', dayOfSeason: 6, object: 'birthdaycake', birthday: 'MUNI' },
  // --- 夏 ---
  KODOMO:    { id: 'KODOMO',    name: 'こどもの日', emoji: '🎏', season: 'SUMMER', dayOfSeason: 1, object: 'koinobori' },
  KAIDAN:    { id: 'KAIDAN',    name: '怪談クラブ', emoji: '👻', season: 'SUMMER', dayOfSeason: 2, object: 'kaidancandle' },
  HANABI:    { id: 'HANABI',    name: '花火大会',   emoji: '🎆', season: 'SUMMER', dayOfSeason: 8, venue: 'ROOF', bands: ['EVENING', 'NIGHT'] },
  BIRTHDAY_HYU: { id: 'BIRTHDAY_HYU', name: 'ヒュウの誕生日会', emoji: '🎂', season: 'SUMMER', dayOfSeason: 3, object: 'birthdaycake', birthday: 'HYU' },
  TANABATA:  { id: 'TANABATA',  name: '七夕',       emoji: '🎋', season: 'SUMMER', dayOfSeason: 4, object: 'bamboo', wishes: true },
  NATSUFES:  { id: 'NATSUFES',  name: 'ミニ夏祭り', emoji: '🏮', season: 'SUMMER', dayOfSeason: 6, object: 'natsustalls' },
  BIRTHDAY_LENNY: { id: 'BIRTHDAY_LENNY', name: 'レニィの誕生日会', emoji: '🎂', season: 'SUMMER', dayOfSeason: 7, object: 'birthdaycake', birthday: 'LENNY' },
  // --- 秋 ---
  BIRTHDAY_GERU: { id: 'BIRTHDAY_GERU', name: 'ゲルの誕生日会', emoji: '🎂', season: 'AUTUMN', dayOfSeason: 2, object: 'birthdaycake', birthday: 'GERU' },
  HALLOWEEN: { id: 'HALLOWEEN', name: 'ハロウィン', emoji: '🎃', season: 'AUTUMN', dayOfSeason: 5, object: 'pumpkin' },
  BIRTHDAY_JIN: { id: 'BIRTHDAY_JIN', name: 'ジンパチの誕生日会', emoji: '🎂', season: 'AUTUMN', dayOfSeason: 7, object: 'birthdaycake', birthday: 'JIN' },
  // --- 冬 ---
  BIRTHDAY_NEO: { id: 'BIRTHDAY_NEO', name: 'ネオの誕生日会', emoji: '🎂', season: 'WINTER', dayOfSeason: 1, object: 'birthdaycake', birthday: 'NEO' },
  CHRISTMAS: { id: 'CHRISTMAS', name: 'クリスマス', emoji: '🎄', season: 'WINTER', dayOfSeason: 3, object: 'xmastree' },
  NEWYEAR:   { id: 'NEWYEAR',   name: '正月',       emoji: '🎍', season: 'WINTER', dayOfSeason: 6, object: 'kadomatsu' },
  BIRTHDAY_KANE: { id: 'BIRTHDAY_KANE', name: '小暮カネの誕生日会', emoji: '🎂', season: 'WINTER', dayOfSeason: 8, object: 'birthdaycake', birthday: 'KANE' },
};

// clock.season / dayOfSeason(1-8) から今日のイベントを返す
export function eventForDay(season, dayOfSeason) {
  return Object.values(EVENTS).find(e => e.season === season && e.dayOfSeason === dayOfSeason) ?? null;
}

// 七夕の願い事 (主要6人 + 主要NPC全員)
export const TANABATA_WISHES = {
  LENNY: '「一年中、お昼寝できますように。あと、いつか本物の海を見られますように」',
  HYU:   '「世界が私の美しさに追いつきますように。前髪が一生崩れませんように」',
  JIN:   '「筋肉がもっとつきますように! プラモの限定版が当たりますように!」',
  MUNI:  '「ずっとみんなといっしょにいられますように。だがしがいっぱいたべられますように。むにゅ〜」',
  GERU:  '「積読が減りますように。……いや、増えてもいい。消えない街でありますように」',
  NEO:   '「我が故郷に、いつか胸を張って帰れますように。……あと、ラーメンの新作が出ますように」',
  BARBER:'「わしのハサミがまだまだ現役でありますように」',
  KANE:  '「あの子らが、みんな元気でいますように。……あたしの膝が痛みませんように」',
  POSTMAN:'「今日も一通残らず届けられますように! 階段が減りますように!」',
  CAFEGIRL:'「常連さんが増えますように。ヒュウさんの口説きのネタが尽きませんように♪」',
  DAGASHIYA:'「子供たちの笑顔が絶えませんように。10円が値上がりしませんように」',
  CLERK: '「今日も無事にレジが締まりますように。コソ泥さんが真面目に働きますように」',
  THIEF: '「……見つかりませんように。……いや、真面目に、働けますように」',
};

// イベント別の集合ナレーション(集会所入場時の一言・pendingToast)
export const EVENT_INTRO = {
  HINA:      '🎎 ひな祭り! 集会所に雛人形が飾られ、みんなが集まっている(今日だけ)',
  HANAMI:    '🌸 桜が満開! 集会所に主要人物たちが花見に集まっている',
  BIRTHDAY_MUNI:  '🎂 今日はムニの誕生日会! 集会所でみんながお祝いしている',
  KODOMO:    '🎏 こどもの日! 集会所に鯉のぼりが飾られ、みんなが集まっている',
  KAIDAN:    '👻 怪談クラブの日! 集会所の灯りを落として、みんなで怖い話をしている',
  HANABI:    '🎆 花火大会! 屋上に上がると、九龍城の外に花火が打ち上がっている',
  BIRTHDAY_HYU:   '🎂 今日はヒュウの誕生日会! 集会所でみんながお祝いしている',
  TANABATA:  '🎋 七夕! 集会所の笹に、みんなの願い事が飾られている(笹をクリック)',
  NATSUFES:  '🏮 ミニ夏祭り! 集会所に金魚すくいやりんご飴の屋台が出ている',
  BIRTHDAY_LENNY: '🎂 今日はレニィの誕生日会! 集会所でみんながお祝いしている',
  BIRTHDAY_GERU:  '🎂 今日はゲルの誕生日会! 集会所でみんながお祝いしている',
  HALLOWEEN: '🎃 ハロウィン! 集会所が仮装で賑わっている',
  BIRTHDAY_JIN:   '🎂 今日はジンパチの誕生日会! 集会所でみんながお祝いしている',
  BIRTHDAY_NEO:   '🎂 今日はネオの誕生日会! 集会所でみんながお祝いしている',
  CHRISTMAS: '🎄 クリスマス! 集会所にツリーが飾られ、みんなが集まっている',
  NEWYEAR:   '🎍 あけましておめでとう! 集会所で新年会が始まっている',
  BIRTHDAY_KANE:  '🎂 今日は小暮カネの誕生日会! 仲が良ければ、カネも顔を出す',
};
