// ============================================================
// 季節イベント (v4)
// calendar: 季節の「特定の日」(SEASON_DAYS=8日中の何日目か / 中頃に配置)
// object: その日だけ集会所に置くオブジェクト(翌日消去)
// gather: 主要人物みんなで集会所に集まる。仲良くなればカネも来る。
// tanabata は全員の「願い事」を笹に飾り、クリックで一人ずつ読める。
// ============================================================

export const EVENTS = {
  HANAMI:    { id: 'HANAMI',    name: 'お花見',     emoji: '🌸', season: 'SPRING', dayOfSeason: 4, object: 'sakura' },
  TANABATA:  { id: 'TANABATA',  name: '七夕',       emoji: '🎋', season: 'SUMMER', dayOfSeason: 4, object: 'bamboo', wishes: true },
  HALLOWEEN: { id: 'HALLOWEEN', name: 'ハロウィン', emoji: '🎃', season: 'AUTUMN', dayOfSeason: 5, object: 'pumpkin' },
  CHRISTMAS: { id: 'CHRISTMAS', name: 'クリスマス', emoji: '🎄', season: 'WINTER', dayOfSeason: 3, object: 'xmastree' },
  NEWYEAR:   { id: 'NEWYEAR',   name: '正月',       emoji: '🎍', season: 'WINTER', dayOfSeason: 6, object: 'kadomatsu' },
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
  HANAMI:    '🌸 桜が満開! 集会所に主要人物たちが花見に集まっている',
  TANABATA:  '🎋 七夕! 集会所の笹に、みんなの願い事が飾られている(笹をクリック)',
  HALLOWEEN: '🎃 ハロウィン! 集会所が仮装で賑わっている',
  CHRISTMAS: '🎄 クリスマス! 集会所にツリーが飾られ、みんなが集まっている',
  NEWYEAR:   '🎍 あけましておめでとう! 集会所で新年会が始まっている',
};
