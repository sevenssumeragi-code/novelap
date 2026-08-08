// ============================================================
// v16 追加会話
//   ・ムニの「ダダこね」喧嘩(激しくない・相手が付き合わされる → 後日ムニが謝り、相手が優しく褒める)
//   ・集会所イベント(誕生日/クリスマス等)の会話を大幅増(バリエーション)
//   ・主要人物6人どうしの会話をさらに大幅増(施設/恋人/友人/時間季節天気)
// ============================================================
const T = (id, owner, node) => ({ id, owner, type: node.type ?? 'TALK', pool: node.pool ?? 'GENERIC', ...node });
const A = (id, cast, node) => ({ id, type: 'AMBIENT', pool: 'AMBIENT', owner: [...cast].sort().join('-'), cast, ...node });
const ALLMAIN = ['LENNY', 'HYU', 'JIN', 'GERU', 'MUNI', 'NEO'];
const ALLMAIN_K = ['LENNY', 'HYU', 'JIN', 'GERU', 'MUNI', 'NEO', 'KANE'];

export const DLG_V16 = [
  // ========================================================
  // ムニのダダこね(mutual < 40) — 激しくない喧嘩。相手が付き合わされる。
  //   翌日以降にムニが謝り、相手が優しく褒める(reconcile)。
  // ========================================================
  // --- ムニ × ヒュウ ---
  A('DLG_TANTRUM_MUN_HYU', ['MUNI', 'HYU'], { cond: 'mutual(MUNI, HYU) < 40 and not quarreling(MUNI, HYU)', weight: 48, lines: [
    { sp: 'MUNI', text: 'やだやだ! ムニ、まだかえりたくないの! もっとあそぶの! ……ヒュウおにいちゃんのばか!' },
    { sp: 'HYU', text: 'まあ、ばかとは。……ムニ、駄々をこねても、私の美しさは揺らぎませんよ。……はぁ、仕方ありませんね。あと少しだけ、付き合いましょう。' },
    { sp: 'MUNI', text: 'むー! ……ヒュウおにいちゃん、つきあってくれるまで、うごかないもん!' },
  ], effects: ['quarrel(MUNI,HYU)', 'log(AMBIENT)'] }),
  A('DLG_MUNPOLOGY_HYU', ['MUNI', 'HYU'], { cond: 'quarreling(MUNI, HYU) and quarrel_days(MUNI, HYU) >= 1', weight: 55, lines: [
    { sp: 'MUNI', text: 'ヒュウおにいちゃん……。きのうは、ばかっていって、ごめんなさい。ダダこねて、ごめんなさい。' },
    { sp: 'HYU', text: '……ふ。ちゃんと自分から謝れましたね。えらいですよ、ムニ。素直に謝れる子は、それだけで美しい。' },
    { sp: 'MUNI', text: 'ほんと? ムニ、うつくしい?' },
    { sp: 'HYU', text: 'ええ、とても。……さ、仲直りに、今日は私が一番きれいな髪飾りをつけてあげましょう。' },
  ], effects: ['reconcile(MUNI,HYU,10)', 'log(AMBIENT)'] }),
  // --- ムニ × ジンパチ ---
  A('DLG_TANTRUM_MUN_JIN', ['MUNI', 'JIN'], { cond: 'mutual(MUNI, JIN) < 40 and not quarreling(MUNI, JIN)', weight: 48, lines: [
    { sp: 'MUNI', text: 'ジンパチおにいちゃん、もっとたかいたかいして! やだ、まだやるの! いっぱいやってー!' },
    { sp: 'JIN', text: 'お、おう……もう50回やったぞ! ……ったく、しょうがねえな! あと10回だけだからな!' },
    { sp: 'MUNI', text: 'やだ、100かい! 100かいやってくれなきゃ、ムニおこるもん!' },
    { sp: 'JIN', text: 'ぐぬぬ……わ、分かったよ! 男に二言はねえ! ……腕がもげても知らねえぞ!' },
  ], effects: ['quarrel(MUNI,JIN)', 'log(AMBIENT)'] }),
  A('DLG_MUNPOLOGY_JIN', ['MUNI', 'JIN'], { cond: 'quarreling(MUNI, JIN) and quarrel_days(MUNI, JIN) >= 1', weight: 55, lines: [
    { sp: 'MUNI', text: 'ジンパチおにいちゃん……きのうは、いっぱいわがままいって、ごめんなさい。うでいたくなかった?' },
    { sp: 'JIN', text: 'はは! 気にすんな! ……つーか、自分から謝りに来るなんて、ムニ、成長したな! えらいぞ!' },
    { sp: 'MUNI', text: 'えへへ……。ムニ、おおきくなった?' },
    { sp: 'JIN', text: 'おう、でっかくなった! 心がな! ……よし、ごほうびに、今日は優しくたかいたかいしてやる! おいで!' },
  ], effects: ['reconcile(MUNI,JIN,10)', 'log(AMBIENT)'] }),
  // --- ムニ × ゲル ---
  A('DLG_TANTRUM_MUN_GER', ['MUNI', 'GERU'], { cond: 'mutual(MUNI, GERU) < 40 and not quarreling(MUNI, GERU)', weight: 48, lines: [
    { sp: 'MUNI', text: 'ゲルおねえちゃん、えほん、もういっかい! やだ、ねない! まだよんで! よんでよー!' },
    { sp: 'GERU', text: '……もう五回読んだぞ。ムニ、そろそろ眠る時間だ。……はぁ。仕方のない子だ。じゃあ、あと一回だけな。特別だぞ。' },
    { sp: 'MUNI', text: 'やだ、あとさんかい! ……ゲルおねえちゃん、よんでくれないと、ねないもん!' },
  ], effects: ['quarrel(MUNI,GERU)', 'log(AMBIENT)'] }),
  A('DLG_MUNPOLOGY_GER', ['MUNI', 'GERU'], { cond: 'quarreling(MUNI, GERU) and quarrel_days(MUNI, GERU) >= 1', weight: 55, lines: [
    { sp: 'MUNI', text: 'ゲルおねえちゃん、きのうは、ねないってダダこねて、ごめんなさい。……いっぱいよんでくれて、ありがとなの。' },
    { sp: 'GERU', text: '……ふ。自分の非を認めて謝る。大人でも、なかなかできないことだ。お前は、賢い子だな、ムニ。' },
    { sp: 'MUNI', text: 'ムニ、かしこい?' },
    { sp: 'GERU', text: 'ああ、とても。……ご褒美に、今夜は特別に長い物語を読んでやろう。ただし、ちゃんと眠るのが条件だぞ。ふ。' },
  ], effects: ['reconcile(MUNI,GERU,10)', 'log(AMBIENT)'] }),
  // --- ムニ × ネオ ---
  A('DLG_TANTRUM_MUN_NEO', ['MUNI', 'NEO'], { cond: 'mutual(MUNI, NEO) < 40 and not quarreling(MUNI, NEO)', weight: 48, lines: [
    { sp: 'MUNI', text: 'ネオおにいちゃん、けんのおはなし、もっと! やだ、まだきくの! つづきー!' },
    { sp: 'NEO', text: 'ぬ、もう三話も語ったぞ。……騎士とて、喉が渇く。少し休ませてくれ、ムニ。' },
    { sp: 'MUNI', text: 'やだやだ! ネオおにいちゃんがおはなししてくれないと、ムニ、ここからうごかないもん!' },
    { sp: 'NEO', text: '……はぁ。強情なところは、我に似ておるな。……よかろう、あと一話だけ。だが、これで最後だぞ。' },
  ], effects: ['quarrel(MUNI,NEO)', 'log(AMBIENT)'] }),
  A('DLG_MUNPOLOGY_NEO', ['MUNI', 'NEO'], { cond: 'quarreling(MUNI, NEO) and quarrel_days(MUNI, NEO) >= 1', weight: 55, lines: [
    { sp: 'MUNI', text: 'ネオおにいちゃん、きのうは、わがままいって、ごめんなさい。おのど、だいじょうぶだった?' },
    { sp: 'NEO', text: 'ふはは、案ずるな。……それより、自ら謝りに来るとは。見習い騎士として、天晴れな心がけである! 誇りに思うぞ、ムニ!' },
    { sp: 'MUNI', text: 'えへへ、ムニ、りっぱなきし?' },
    { sp: 'NEO', text: 'うむ、立派な騎士の卵よ! ……よし、褒美に今日は、とっておきの竜退治の物語を語ってやろう! 心して聞くがよい!' },
  ], effects: ['reconcile(MUNI,NEO,10)', 'log(AMBIENT)'] }),

  // ========================================================
  // 集会所イベントの会話を大幅増(バリエーション追加)
  // ========================================================
  // 七夕(別バージョン)
  A('DLG_EV_TANABATA_V16', ALLMAIN, { cond: 'event_active(TANABATA) and location == hall', weight: 28, lines: [
    { sp: 'MUNI', text: 'ムニのおねがい、ないしょなの! ……でも、みんながずっといっしょにいられますように、なの!' },
    { sp: 'GERU', text: '……ムニ。それは、口に出すと叶わなくなるぞ。だが、そういう願いは、笹より私たちの胸に刻んでおこう。' },
    { sp: 'HYU', text: '私の願いは、企業秘密。……ふふ、ですが、あなたたちと過ごすこの時間が、ずっと続きますように、とだけ。' },
    { sp: 'JIN', text: '俺は「もっと強くなれますように」だ! ……あと、みんなの願いが全部叶いますように、もな!' },
    { sp: 'LENNY', text: '短冊書いてたら眠くなってきた……。ぼくの願い? 「みんなが幸せでありますように」だよ。……zzz' },
    { sp: 'NEO', text: '天の川を挟んだ二つの星が、年に一度会う……。ロマンチックな伝説である。我が故郷の星々にも、聞かせてやりたい。' },
  ], effects: ['mutual(GERU,MUNI,1)', 'mutual(HYU,JIN,1)', 'log(AMBIENT)'] }),
  // ひな祭り(別バージョン)
  A('DLG_EV_HINA_V16', ALLMAIN, { cond: 'event_active(HINA) and location == hall', weight: 28, lines: [
    { sp: 'MUNI', text: 'おだいりさまとおひなさま、けっこんしきみたいなの! すてきー!' },
    { sp: 'HYU', text: '雛人形の十二単、あの重ねの色目は日本の美の極致ですね。……私も、いつか着てみたいものです。さぞ映えるでしょう。' },
    { sp: 'GERU', text: '一日で仕舞うのが習わしだ。……名残惜しいが、その潔さが、この節句の美しさでもある。' },
    { sp: 'LENNY', text: 'ひなあられ、色ごとに味がちがうんだよ。……ぜんぶ食べ比べてたら、お腹いっぱいで眠く……zzz' },
    { sp: 'JIN', text: '甘酒だ! ノンアルのやつな! ……体があったまるぜ! みんな、飲め飲め!' },
    { sp: 'NEO', text: '災いを人形に移し、健やかを願う……。異国ながら、心優しき魔除けの風習である。感じ入るぞ。' },
  ], effects: ['mutual(HYU,MUNI,1)', 'mutual(GERU,LENNY,1)', 'log(AMBIENT)'] }),
  // こどもの日(別バージョン)
  A('DLG_EV_KODOMO_V16', ALLMAIN, { cond: 'event_active(KODOMO) and location == hall', weight: 28, lines: [
    { sp: 'MUNI', text: 'ムニ、かぶとかぶったの! つよそうでしょ! えいっ!' },
    { sp: 'NEO', text: 'ほう、りりしい兜姿である! ムニ、貴様、なかなかの武者っぷりだ。……我が見習い騎士として、誇らしいぞ!' },
    { sp: 'JIN', text: '背比べだ、ムニ! 柱の傷、去年より伸びたか? ……おお、伸びてる伸びてる! でっかくなったな!' },
    { sp: 'HYU', text: '鯉のぼりの吹き流し、風に泳ぐ様が優美ですね。……私も、あの緋鯉のように、艶やかに泳いでみせましょうか。' },
    { sp: 'LENNY', text: '菖蒲湯、いい匂いだね。……あったかくて、ぼく、また湯船で寝ちゃいそう。' },
    { sp: 'GERU', text: '子供の日か。……ムニ、お前がまっすぐ、健やかに育つこと。それが、私たち皆の一番の願いだ。' },
  ], effects: ['mutual(MUNI,NEO,1)', 'mutual(JIN,MUNI,1)', 'mutual(GERU,MUNI,1)', 'log(AMBIENT)'] }),
  // 怪談クラブ(別バージョン)
  A('DLG_EV_KAIDAN_V16', ALLMAIN, { cond: 'event_active(KAIDAN) and location == hall', weight: 28, lines: [
    { sp: 'GERU', text: '……では、今宵の一話。この塔の、誰も使わない最上階の、開かずの間の話だ。……よく聞け。' },
    { sp: 'MUNI', text: 'ひぃ……! ムニ、レニィおにいちゃんのうしろにかくれるの!' },
    { sp: 'LENNY', text: 'ぼくの後ろは安全地帯だよ。……あ、でも、怖い話聞くと、ぼく逆に眠くなるんだ。不思議だね。zzz' },
    { sp: 'HYU', text: 'ろうそくの灯りに照らされた私……怪談の雰囲気すら、私を美しく演出しますね。ふふ。' },
    { sp: 'JIN', text: 'こ、怖くねえぞ俺は! ……い、いま、窓の外で何か動かなかったか!? 気のせいだよな!?' },
    { sp: 'NEO', text: '亡霊とて、我が剣の前には……ぬ、いや、実体なきものは斬れぬのだったな。……こ、これは武者震いである!' },
  ], effects: ['mutual(GERU,MUNI,1)', 'mutual(JIN,NEO,1)', 'log(AMBIENT)'] }),
  // ミニ夏祭り(別バージョン)
  A('DLG_EV_NATSUFES_V16', ALLMAIN, { cond: 'event_active(NATSUFES) and location == hall', weight: 28, lines: [
    { sp: 'MUNI', text: 'わたあめ! ふわふわのくもみたい! ムニ、これすきー!' },
    { sp: 'JIN', text: 'ヨーヨー釣り、俺に任せろ! ……って、糸が切れた! くそ、屋台の遊びは奥が深えな!' },
    { sp: 'HYU', text: '浴衣姿の私、いかがです? 夏祭りは、和の装いで魅せる絶好の舞台。……この帯の結び、完璧でしょう。' },
    { sp: 'GERU', text: '祭囃子と提灯の灯り。……喧騒の中にいると、かえって心が静かになる。不思議なものだな。' },
    { sp: 'NEO', text: '射的か! これぞ我が腕の見せどころ! ……ぬ、コルクの弾とは、勝手が違う。むむ、なかなか手ごわい!' },
    { sp: 'LENNY', text: 'かき氷、頭がキーンってなるけど、やめられないんだ。……ブルーハワイで舌が青くなったよ。えへへ。' },
  ], effects: ['mutual(JIN,MUNI,1)', 'mutual(GERU,HYU,1)', 'log(AMBIENT)'] }),
  // 花火大会(別バージョン・屋上)
  A('DLG_EV_HANABI_V16', ALLMAIN, { cond: 'event_active(HANABI) and location == ROOF', weight: 28, lines: [
    { sp: 'MUNI', text: 'たまやー! ……って、ジンパチおにいちゃんがおしえてくれたの! たまやー!' },
    { sp: 'JIN', text: 'そうだ、その調子だ、ムニ! 花火は掛け声も込みで楽しむんだぜ! せーの、たーまやー!' },
    { sp: 'HYU', text: '夜空に咲いて、一瞬で散る。……この儚さ。永遠を目指す私の美とは、対極にある美ですね。だからこそ、惹かれる。' },
    { sp: 'GERU', text: '光ってから、音が遅れて届く。……あの間が、私は好きだ。世界が息を止める、あの一瞬がな。' },
    { sp: 'NEO', text: '天を焦がす大輪の火……。誰も傷つけぬ、祝いの炎。この街の平和の象徴である。美しいのう。' },
    { sp: 'LENNY', text: '屋上から見る花火、街の灯りと重なって、宝石箱をひっくり返したみたい。……ずっと見てられるよ。' },
  ], effects: ['mutual(JIN,MUNI,1)', 'mutual(GERU,NEO,1)', 'log(AMBIENT)'] }),
  // 誕生日会(ヒュウ・別バージョン)
  A('DLG_BD_HYU_V16', ALLMAIN, { cond: 'event_active(BIRTHDAY_HYU) and location == hall', weight: 30, lines: [
    { sp: 'HYU', text: 'ふふ、今年も私の誕生日。……一年でまた一段、美しさに磨きがかかりました。祝福なさい。' },
    { sp: 'MUNI', text: 'ヒュウおにいちゃん、おめでとーなの! はい、ムニからおはな!' },
    { sp: 'HYU', text: '……ムニ、この一輪、私の集めたどんな宝石より輝いて見えます。ありがとう。一生の宝物にします。' },
    { sp: 'JIN', text: 'ヒュウ、誕生日おめでとう! 自信家だけど、根はいいやつだからな! ケーキ、一番でかいの取っといたぜ!' },
    { sp: 'GERU', text: 'おめでとう。……お前の「美」への一貫した姿勢は、一種の生き様だ。今年も、貫け。' },
    { sp: 'NEO', text: 'ヒュウよ、生誕を祝う! 美を追う執念、我が忠義に通ず。誇り高き好敵手に、乾杯である!' },
  ], effects: ['mutual(HYU,MUNI,1)', 'mutual(HYU,JIN,1)', 'mutual(GERU,HYU,1)', 'log(AMBIENT)'] }),
  // 誕生日会(レニィ・別バージョン)
  A('DLG_BD_LENNY_V16', ALLMAIN, { cond: 'event_active(BIRTHDAY_LENNY) and location == hall', weight: 30, lines: [
    { sp: 'LENNY', text: 'えっ、今日ぼくの誕生日? ……わ、みんなでお祝い? ねむ気、ちょっとだけ吹き飛んだよ。えへへ、ありがとう。' },
    { sp: 'MUNI', text: 'レニィおにいちゃん、おめでとーなの! きょうはムニがおひるねのばんをしてあげる!' },
    { sp: 'JIN', text: 'レニィ、おめでとう! お前がのんびりしてると、俺たちも肩の力抜けるんだ。今年もマイペースでいけよ!' },
    { sp: 'HYU', text: 'おめでとう、レニィ。あなたの安らかさは、この街の癒し。……たまには起きて、私の話も聞いてくださいね。ふふ。' },
    { sp: 'GERU', text: '誕生日おめでとう。……お前の隣は、時間がゆっくり流れる。得難い才能だ。大事にしろよ。' },
    { sp: 'NEO', text: 'レニィよ、生誕を祝う! 貴様の眠りは、戦なき平和の証! この街を、共に守っていこうぞ!' },
  ], effects: ['mutual(LENNY,MUNI,1)', 'mutual(JIN,LENNY,1)', 'mutual(GERU,LENNY,1)', 'log(AMBIENT)'] }),
  // 誕生日会(ジンパチ・別バージョン)
  A('DLG_BD_JIN_V16', ALLMAIN, { cond: 'event_active(BIRTHDAY_JIN) and location == hall', weight: 30, lines: [
    { sp: 'JIN', text: 'おう、今日は俺の誕生日だ! ……みんな集まってくれて、その、あ、ありがとうな! て、照れるぜ!' },
    { sp: 'MUNI', text: 'ジンパチおにいちゃん、おめでとーなの! ムニ、だっこしてほしいの!' },
    { sp: 'JIN', text: 'おう、来い! 誕生日だからな、特別に高い高いもしてやる! ……よし、いくぞ、たかいたかーい!' },
    { sp: 'HYU', text: 'おめでとう、ジンパチくん。あなたのまっすぐさは、時に眩しい。……ケーキの取り分けは、私が優雅に。' },
    { sp: 'LENNY', text: 'おめでとう、ジンパチ。……プレゼントは、ぐっすり眠れる枕だよ。鍛錬の疲れ、取れるといいな。' },
    { sp: 'GERU', text: '誕生日おめでとう。……お前の熱は、時々うっとうしいが、無いと寂しい。長生きしろよ、暑苦しい男。' },
  ], effects: ['mutual(JIN,MUNI,1)', 'mutual(HYU,JIN,1)', 'mutual(JIN,LENNY,1)', 'log(AMBIENT)'] }),
  // 誕生日会(カネ・別バージョン)
  A('DLG_BD_KANE_V16', ALLMAIN_K, { cond: 'event_active(BIRTHDAY_KANE) and location == hall', weight: 34, lines: [
    { sp: 'KANE', text: 'ふん、また祝ってくれるのかい。……年寄りの誕生日なんて、めでたくもないがねぇ。……ま、ありがとよ。' },
    { sp: 'MUNI', text: 'カネばあば、おめでとーなの! ずーっと、ずーっと、げんきでいてね!' },
    { sp: 'KANE', text: '……ムニ。あんたのその一言が、どんな長寿の薬より効くよ。……ああ、もう少し、生きてやるさ。' },
    { sp: 'JIN', text: 'カネ婆、おめでとう! あんたがいるから、この路地は締まるんだ! 長生きしてくれよ、頼むぜ!' },
    { sp: 'GERU', text: 'おめでとう、カネ婆さん。……あんたの昔語りは、この街の一番古い頁だ。まだまだ、聞かせてくれ。' },
    { sp: 'NEO', text: '婆殿、生誕を祝う! 口は悪いが、その心根、貴き女傑! 長寿を願うぞ!' },
  ], effects: ['mutual(KANE,MUNI,1)', 'mutual(KANE,JIN,1)', 'mutual(KANE,GERU,1)', 'log(AMBIENT)'] }),

  // ========================================================
  // 主要人物6人どうしの会話をさらに大幅増(施設・通常)
  // ========================================================
  A('DLG_F_GER_HYU_CAFE_V16', ['GERU', 'HYU'], { cond: 'location == cafe', lines: [
    { sp: 'HYU', text: 'ゲル、あなたの珈琲、いつもブラックですね。……苦くないのですか?' },
    { sp: 'GERU', text: 'ふ、苦味こそが目を覚まさせる。……甘くしてしまっては、活字がぼやける。お前の甘いカフェオレとは、正反対だな。ふ。' },
  ], effects: ['mutual(HYU,GERU,1)', 'log(AMBIENT)'] }),
  A('DLG_F_NEO_MUN_RAMEN_V16', ['NEO', 'MUNI'], { cond: 'location == ramen', lines: [
    { sp: 'MUNI', text: 'ネオおにいちゃん、ラーメン、フーフーして!' },
    { sp: 'NEO', text: 'うむ、任せよ。……熱きスープは、急いては火傷する。ゆっくり、な。ふぅ、ふぅ。……ほら、これでよい。召し上がれ、ムニ。' },
  ], effects: ['mutual(MUNI,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_F_HYU_LEN_CAKE_V16', ['HYU', 'LENNY'], { cond: 'location == cake', lines: [
    { sp: 'HYU', text: 'レニィ、いちごは最後に食べる派? それとも最初?' },
    { sp: 'LENNY', text: 'ぼくは……食べる前に寝ちゃう派かな。えへへ。……あ、でも、ヒュウが分けてくれるなら、ちゃんと起きて食べるよ。' },
  ], effects: ['mutual(HYU,LENNY,1)', 'log(AMBIENT)'] }),
  A('DLG_F_JIN_NEO_GAME_V16', ['JIN', 'NEO'], { cond: 'location == game', lines: [
    { sp: 'JIN', text: 'ネオ! ガンシューティングだ! お前の剣の腕、銃でも通用するか見せてみろ!' },
    { sp: 'NEO', text: 'ふはは、飛び道具か! 騎士の本分ではないが……ぬ、案外、性に合う! 見よ、このハイスコア! どうだ、ジンパチ!' },
  ], effects: ['mutual(JIN,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_F_GER_LEN_BOOK_V16', ['GERU', 'LENNY'], { cond: 'location == book', lines: [
    { sp: 'GERU', text: 'レニィ、詩集はどうだ。短くて、一篇ずつ、お前のペースで読める。……眠る前の一篇、というのも乙なものだ。' },
    { sp: 'LENNY', text: 'わ、それいいね。……ゲルのおすすめの詩、教えて? 今夜、寝る前に読んでみる。……あ、途中で寝ちゃうかもだけど。' },
  ], effects: ['mutual(LENNY,GERU,1)', 'log(AMBIENT)'] }),
  A('DLG_F_MUN_HYU_DONUT_V16', ['MUNI', 'HYU'], { cond: 'location == donut', lines: [
    { sp: 'MUNI', text: 'ヒュウおにいちゃん、ドーナツ、おくちのまわりべたべたなっちゃった!' },
    { sp: 'HYU', text: 'ふふ、仕方のない子ですね。ほら、じっとして。……はい、綺麗になりました。美しさは、口元の清潔から。覚えておきなさい、ムニ。' },
  ], effects: ['mutual(HYU,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_F_JIN_GER_IZAKAYA_V16', ['JIN', 'GERU'], { cond: 'location == izakaya', lines: [
    { sp: 'JIN', text: 'ゲル、たまには俺の武勇伝でも聞けよ! この前の階段20往復の話な!' },
    { sp: 'GERU', text: 'ふ、また階段か。……だが、お前の話は不思議と飽きんな。単純明快で、裏がない。……いい肴だ。もう一杯、付き合え。' },
  ], effects: ['mutual(JIN,GERU,1)', 'log(AMBIENT)'] }),
  A('DLG_F_LEN_NEO_SENTO_V16', ['LENNY', 'NEO'], { cond: 'location == sento', lines: [
    { sp: 'NEO', text: 'レニィ、湯船で寝るなと、何度言えば……ぬ、もう寝ておるか。ふ、仕方のない。我が見張っていてやろう。' },
    { sp: 'LENNY', text: 'ん……ネオが見ててくれるから、安心して湯船でも寝られるんだ。……ありがと、騎士さま。zzz' },
  ], effects: ['mutual(LENNY,NEO,1)', 'log(AMBIENT)'] }),

  // 恋人どうし(施設・別)
  A('DLG_LPAIR_RAMEN_V16', ['HYU', 'LENNY'], { cond: 'location == ramen and rel(HYU, LENNY) == LOVER', weight: 20, lines: [
    { sp: 'HYU', text: 'レニィ、恋人と食べるラーメン。……私が取り分けてあげます。麺が伸びないうちに、召し上がれ。' },
    { sp: 'LENNY', text: 'えへへ、ヒュウのお世話、しあわせだなあ。……恋人になっても、ぼくはやっぱり甘えん坊だね。ごめんね、うれしいけど。' },
  ], effects: ['mutual(HYU,LENNY,1)', 'log(AMBIENT)'] }),
  A('DLG_LPAIR_BOOK_V16', ['GERU', 'HYU'], { cond: 'location == book and rel(GERU, HYU) == LOVER', weight: 20, lines: [
    { sp: 'HYU', text: 'ゲル、恋人のあなたが選ぶ本なら、どんな難解なものでも読み通せる気がします。……一冊、選んでくださいな。' },
    { sp: 'GERU', text: '……ならば、この恋愛詩集を。柄ではないが、お前と出会って、こういう本の良さが、少し分かるようになった。……お前のせいだ。ふ。' },
  ], effects: ['mutual(GERU,HYU,1)', 'log(AMBIENT)'] }),
  A('DLG_LPAIR_SENTO_V16', ['JIN', 'NEO'], { cond: 'location == sento and rel(JIN, NEO) == LOVER', weight: 20, lines: [
    { sp: 'JIN', text: 'ネオ! 恋人どうし、背中の流しっこな! ……へへ、こういうの、悪くねえよな!' },
    { sp: 'NEO', text: 'うむ、悪くないどころか、至福である。……熱き湯と、愛する戦友。これ以上の夜が、あろうか。いや、ない! 断言できる!' },
  ], effects: ['mutual(JIN,NEO,1)', 'log(AMBIENT)'] }),

  // 友人どうし(施設・別)
  A('DLG_FPAIR_CAFE_V16', ['HYU', 'GERU'], { cond: 'location == cafe and mutual(HYU, GERU) >= 55 and rel(HYU, GERU) != LOVER', weight: 18, lines: [
    { sp: 'HYU', text: 'ゲル、友として一杯ご一緒に。……あなたと過ごす午後は、なぜか時間がゆっくり流れます。心地よい。' },
    { sp: 'GERU', text: 'ふ、同感だ。恋人ではないが、お前とは、沈黙も会話も、どちらも苦にならん。……得難い友だよ、お前は。' },
  ], effects: ['mutual(HYU,GERU,1)', 'log(AMBIENT)'] }),
  A('DLG_FPAIR_GAME_V16', ['LENNY', 'JIN'], { cond: 'location == game and mutual(LENNY, JIN) >= 55 and rel(LENNY, JIN) != LOVER', weight: 18, lines: [
    { sp: 'JIN', text: 'レニィ! メダルゲーム、親友どうし協力して大量獲得だ! ……って、お前、また見てるだけで寝てる!' },
    { sp: 'LENNY', text: 'ん……メダルが落ちそうで落ちないの、見てると眠くなるんだ。……ジンパチ、ぼくの分もがんばって。親友でしょ? えへへ。' },
  ], effects: ['mutual(JIN,LENNY,1)', 'log(AMBIENT)'] }),
  A('DLG_FPAIR_CHURCH_V16', ['GERU', 'NEO'], { cond: 'location == church and mutual(GERU, NEO) >= 55 and rel(GERU, NEO) != LOVER', weight: 18, lines: [
    { sp: 'NEO', text: 'ゲルよ、この聖堂の静けさ、貴様との語らいにふさわしい。……友と分かち合う沈黙は、言葉より雄弁である。' },
    { sp: 'GERU', text: 'ああ。……お前とは、恋人ではないが、この静寂を共にできる。それが、私には何より心地いいんだ。良き友だ、お前は。' },
  ], effects: ['mutual(GERU,NEO,1)', 'log(AMBIENT)'] }),

  // 通常(時間・季節・天気・別)
  A('DLG_N_HYU_NEO_EVENING_V16', ['HYU', 'NEO'], { cond: 'time == EVENING', lines: [
    { sp: 'HYU', text: 'ネオさん、黄昏の光の中のあなた、絵になりますね。……夕日は、美しい者を選んで照らすのでしょうか。' },
    { sp: 'NEO', text: 'ふ、ならば我らは選ばれし者よ。……この街を茜色に染める空、戦なき平和の色である。悪くない黄昏だ。' },
  ], effects: ['mutual(HYU,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_N_LEN_GER_MIDNIGHT_V16', ['LENNY', 'GERU'], { cond: 'time == MIDNIGHT', lines: [
    { sp: 'GERU', text: 'レニィ、こんな時間に起きているとは珍しい。……眠れないなら、私の朗読でも聞くか。すぐ眠くなるぞ。' },
    { sp: 'LENNY', text: 'うん、それがいい。……ゲルの声、世界一の子守唄なんだ。真夜中に聞けるなんて、贅沢だなあ。えへへ。' },
  ], effects: ['mutual(LENNY,GERU,1)', 'log(AMBIENT)'] }),
  A('DLG_N_JIN_MUN_SUMMER_V16', ['JIN', 'MUNI'], { cond: 'season == SUMMER', lines: [
    { sp: 'MUNI', text: 'ジンパチおにいちゃん、あついよー! みずでっぽうしよ!' },
    { sp: 'JIN', text: 'おう、やるか! ……でも手加減はしねえぞ! 夏は全力で遊ぶもんだ! ……よし、屋上で水浴び大会だ! いくぞ!' },
  ], effects: ['mutual(JIN,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_N_GER_NEO_AUTUMN_V16', ['GERU', 'NEO'], { cond: 'season == AUTUMN', lines: [
    { sp: 'GERU', text: 'ネオ、読書の秋だ。……お前の故郷の叙事詩、あれをもう一度、聞かせてくれないか。秋の夜長にふさわしい。' },
    { sp: 'NEO', text: '……よかろう。貴様が聞き手なら、いくらでも語ろう。紅葉の散る音を、伴奏にな。……我が故郷の、遠い物語を。' },
  ], effects: ['mutual(GERU,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_N_HYU_MUN_SUNNY_V16', ['HYU', 'MUNI'], { cond: 'weather == SUNNY', lines: [
    { sp: 'MUNI', text: 'ヒュウおにいちゃん、おてんき! おそとでしゃぼんだましよ!' },
    { sp: 'HYU', text: 'しゃぼん玉ですか。……ふふ、いいでしょう。虹色に光って、ふわりと消える。あの儚い美しさ、私も嫌いではありません。さ、吹いてごらんなさい。' },
  ], effects: ['mutual(HYU,MUNI,1)', 'log(AMBIENT)'] }),
];
