// ============================================================
// v12 追加会話 — 会話バリエーションのさらなる増量
//   (1) プレイヤー×主要6人 恋人会話
//   (2) 主要人物どうしのNPCカップル会話
//   (3) 主要人物2人の通常会話
//   (4) 恋人ではないが仲良くなった2人の会話
//   (5) 各施設・店での会話
// ============================================================
const T = (id, owner, node) => ({ id, owner, type: node.type ?? 'TALK', pool: node.pool ?? 'GENERIC', ...node });
const A = (id, cast, node) => ({ id, type: 'AMBIENT', pool: 'AMBIENT', owner: [...cast].sort().join('-'), cast, ...node });

export const DLG_V12 = [
  // ========================================================
  // (1) プレイヤー×主要人物 恋人会話(rel(PC,X) == LOVER)
  // ========================================================
  // レニィ
  T('DLG_LOVER_LENNY_V12_1', 'LENNY', { pool: 'STATE', cond: 'rel(PC, LENNY) == LOVER', weight: 14, lines: [{ sp: 'LENNY', text: '大家さんとね、「せーの」で同時にあくびできたら、相性ぴったりの証拠なんだって。……やってみる? せーの……ふぁぁ。えへへ、やっぱりぼくたち恋人だね。' }], effects: ['aff(LENNY,1)'] }),
  T('DLG_LOVER_LENNY_V12_2', 'LENNY', { pool: 'STATE', cond: 'rel(PC, LENNY) == LOVER and time == DAY', weight: 13, lines: [{ sp: 'LENNY', text: 'お昼の陽だまりで、大家さんの肩を借りてうとうと……。これ、ぼくの人生の最高記録を更新中の幸せなんだよぉ。……あと、ずっと更新してていい?' }], effects: ['aff(LENNY,1)'] }),
  T('DLG_LOVER_LENNY_V12_3', 'LENNY', { pool: 'STATE', cond: 'rel(PC, LENNY) == LOVER and weather == RAIN', weight: 13, lines: [{ sp: 'LENNY', text: '雨の日はね、街が水槽の中みたいになるんだ。……その水槽を、大家さんと二人で泳いでる魚みたいに、のんびり過ごせたら最高だなあ。' }], effects: ['aff(LENNY,1)'] }),
  // ヒュウ
  T('DLG_LOVER_HYU_V12_1', 'HYU', { pool: 'STATE', cond: 'rel(PC, HYU) == LOVER', weight: 14, lines: [{ sp: 'HYU', text: 'あなたと出会う前、私の世界の中心は私でした。……今は、その隣にあなたがいる。私が「二人」で美しいと思える日が来るとは。恋とは、革命ですね。' }], effects: ['aff(HYU,1)'] }),
  T('DLG_LOVER_HYU_V12_2', 'HYU', { pool: 'STATE', cond: 'rel(PC, HYU) == LOVER and time == DAY', weight: 13, lines: [{ sp: 'HYU', text: '昼下がりの光の中、あなたと並んで歩く。……道行く人が振り返るのは、私の美しさゆえ。ですが今日は、隣のあなたも、少し誇らしげに見せてあげましょう。ふふ。' }], effects: ['aff(HYU,1)'] }),
  T('DLG_LOVER_HYU_V12_3', 'HYU', { pool: 'STATE', cond: 'rel(PC, HYU) == LOVER and season == WINTER', weight: 13, lines: [{ sp: 'HYU', text: '冬は、あなたの手をそっと握る口実ができる季節。……「寒いから」と言えば、恋人つなぎも許されるでしょう? ……ええ、私から言い出しました。それが、何か?' }], effects: ['aff(HYU,1)'] }),
  // ジンパチ
  T('DLG_LOVER_JIN_V12_1', 'JIN', { pool: 'STATE', cond: 'rel(PC, JIN) == LOVER', weight: 14, lines: [{ sp: 'JIN', text: '俺、鍛錬の理由がひとつ増えたんだ。……お前を守れる男でいたいからな! ……くうっ、口に出すと照れるけど、本気だぜ。ずっと、お前の盾でいる!' }], effects: ['aff(JIN,1)'] }),
  T('DLG_LOVER_JIN_V12_2', 'JIN', { pool: 'STATE', cond: 'rel(PC, JIN) == LOVER and time == EVENING', weight: 13, lines: [{ sp: 'JIN', text: '夕焼け、きれいだな。……こういうの、前は一人で見てたんだ。でも今は、お前と見てる。同じ景色でも、全然ちがって見えるから不思議だぜ。恋の魔法ってやつか?' }], effects: ['aff(JIN,1)'] }),
  T('DLG_LOVER_JIN_V12_3', 'JIN', { pool: 'STATE', cond: 'rel(PC, JIN) == LOVER and season == SUMMER', weight: 13, lines: [{ sp: 'JIN', text: '夏だ! 花火大会、いっしょに行こうぜ! ……お前と見る花火、絶対きれいに決まってる。一番いい場所、俺が根性で取っとくからな! 楽しみにしてろ!' }], effects: ['aff(JIN,1)'] }),
  // ゲル
  T('DLG_LOVER_GERU_V12_1', 'GERU', { pool: 'STATE', cond: 'rel(PC, GERU) == LOVER', weight: 14, lines: [{ sp: 'GERU', text: '本の登場人物に恋する読者は多いが……逆に、私が物語の側になる日が来るとはな。あんたという著者が書く続きを、私は毎日、心待ちにしているんだ。' }], effects: ['aff(GERU,1)'] }),
  T('DLG_LOVER_GERU_V12_2', 'GERU', { pool: 'STATE', cond: 'rel(PC, GERU) == LOVER and time == EVENING', weight: 13, lines: [{ sp: 'GERU', text: '夕暮れは、昼と夜の栞のようなものだ。……あんたと過ごすこの時間に、私はそっと指を挟んでおく。いつでも、この頁に戻ってこられるようにな。' }], effects: ['aff(GERU,1)'] }),
  T('DLG_LOVER_GERU_V12_3', 'GERU', { pool: 'STATE', cond: 'rel(PC, GERU) == LOVER and weather == CLOUDY', weight: 13, lines: [{ sp: 'GERU', text: '曇りの日は、言葉がよく降りてくる。……あんたに宛てた一節を、こっそり書き溜めているんだ。いつか、まとめて読ませてやる。……ふ、恋文とは呼ぶなよ。照れる。' }], effects: ['aff(GERU,1)'] }),
  // ネオ
  T('DLG_LOVER_NEO_V12_1', 'NEO', { pool: 'STATE', cond: 'rel(PC, NEO) == LOVER', weight: 14, lines: [{ sp: 'NEO', text: '我が誓いを新たにしよう。この剣は貴様のために、この盾も貴様のために、そしてこの心は……とうに、貴様のものである。騎士の愛に、二言はなし。永遠にな。' }], effects: ['aff(NEO,1)'] }),
  T('DLG_LOVER_NEO_V12_2', 'NEO', { pool: 'STATE', cond: 'rel(PC, NEO) == LOVER and time == NIGHT', weight: 13, lines: [{ sp: 'NEO', text: '夜だ。……我が故郷では、愛する者と同じ星を見て眠れば、夢の中で会えるという。ほら、あの一番輝く星を覚えておけ。今宵、夢で会おうぞ、我が主。' }], effects: ['aff(NEO,1)'] }),
  T('DLG_LOVER_NEO_V12_3', 'NEO', { pool: 'STATE', cond: 'rel(PC, NEO) == LOVER and season == AUTUMN', weight: 13, lines: [{ sp: 'NEO', text: '紅葉が舞い散る。……我が故郷にも、こうして山が燃える季節があった。だが今、隣に貴様がおる。故郷の秋より、この秋のほうが、遥かに美しいのである。' }], effects: ['aff(NEO,1)'] }),
  // ムニ(家族)
  T('DLG_FAM_MUNI_V12_1', 'MUNI', { pool: 'STATE', cond: 'rel(PC, MUNI) == FAMILY', weight: 14, lines: [{ sp: 'MUNI', text: 'おおやさん、あのね。ムニのたからものばこに、おおやさんとのおもいで、いっぱいしまってあるの。……かぞくのおもいでは、ぜったいなくならないんだって! えへへ。' }], effects: ['aff(MUNI,1)'] }),
  T('DLG_FAM_MUNI_V12_2', 'MUNI', { pool: 'STATE', cond: 'rel(PC, MUNI) == FAMILY and time == MORNING', weight: 13, lines: [{ sp: 'MUNI', text: 'おはよ、おおやさん! ムニね、まいあさおおやさんのかおみると、げんきモリモリになるの! かぞくのあさは、せかいでいちばんいいあさなの!' }], effects: ['aff(MUNI,1)'] }),

  // ========================================================
  // (2) 主要人物どうしのNPCカップル会話(rel(A,B) == LOVER)
  // ========================================================
  A('DLG_NPCPL_HYU_LEN_V12', ['HYU', 'LENNY'], { cond: 'rel(HYU, LENNY) == LOVER', weight: 17, lines: [
    { sp: 'HYU', text: 'レニィ、恋人どうしお揃いのものを持ちませんか。……そうですね、私が選んだ、この一番星のブローチなど。あなたの青い髪に映えますよ。' },
    { sp: 'LENNY', text: 'わあ、きれい……。ヒュウとお揃いなら、ぼく、寝てる間もつけてるね。……夢の中でも、ヒュウとつながってる気がするから。' },
  ], effects: ['mutual(HYU,LENNY,1)', 'log(AMBIENT)'] }),
  A('DLG_NPCPL_JIN_NEO_V12', ['JIN', 'NEO'], { cond: 'rel(JIN, NEO) == LOVER', weight: 17, lines: [
    { sp: 'NEO', text: 'ジンパチよ、我らの絆に名をつけるとすれば……「共に在る剣」であろうか。恋人にして戦友。この二つが揃った男は、この世に我らだけである。' },
    { sp: 'JIN', text: 'かっけえな、それ! じゃあ俺たち、無敵コンビだな! ……お前がいれば、どんな困難もぶっ壊せる気がするぜ! なあ、ずっと一緒だぞ、ネオ!' },
  ], effects: ['mutual(JIN,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_NPCPL_GER_NEO_V12', ['GERU', 'NEO'], { cond: 'rel(GERU, NEO) == LOVER', weight: 17, lines: [
    { sp: 'GERU', text: 'ネオ、この詩集を二人で回し読みしよう。……お前が読んだ頁の隅に、そっと感想を書き込んでおいてくれ。それを見つけるのが、私の密かな楽しみになる。' },
    { sp: 'NEO', text: '……良い趣向である。ならば我も、貴様の書き込みを探そう。一冊の本を通じて、言葉を交わす恋人……ふ、これほど貴様らしい愛の形もあるまい。' },
  ], effects: ['mutual(GERU,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_NPCPL_HYU_JIN_V12', ['HYU', 'JIN'], { cond: 'rel(HYU, JIN) == LOVER', weight: 17, lines: [
    { sp: 'JIN', text: 'ヒュウ、今度の休み、二人でどっか行こうぜ! ……お前の行きたいとこでいい。俺、お前が楽しそうにしてるの見るのが好きなんだ。' },
    { sp: 'HYU', text: '……あなた、たまに殺し文句を言いますね。いいでしょう、では美術館へ。美しいものに囲まれた私を、あなたの目に焼き付けさせてあげます。ふふ。' },
  ], effects: ['mutual(HYU,JIN,1)', 'log(AMBIENT)'] }),
  A('DLG_NPCPL_LEN_NEO_V12', ['LENNY', 'NEO'], { cond: 'rel(LENNY, NEO) == LOVER', weight: 17, lines: [
    { sp: 'LENNY', text: 'ネオ、昨日ね、ネオが騎士さまで、ぼくを助けにくる夢を見たんだ。……恋人になったから、夢にも出てきてくれたのかな。えへへ。' },
    { sp: 'NEO', text: '……ほう、我が夢の中まで貴様を守りに行ったか。ならば我が誓いは、寝ても覚めても揺るがぬということだな。うむ、騎士として、これ以上の誉れはない。' },
  ], effects: ['mutual(LENNY,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_NPCPL_GER_HYU_V12', ['GERU', 'HYU'], { cond: 'rel(GERU, HYU) == LOVER', weight: 17, lines: [
    { sp: 'HYU', text: 'ゲル、あなたの本の世界と、私の美の世界。……恋人になって、その二つが溶け合った気がします。あなたを通して、私は物語の美しさを知りました。' },
    { sp: 'GERU', text: '奇遇だな。私も、お前を通して、現実の華やかさを知った。……本の中に閉じこもっていた私を、外へ連れ出したのはお前だ。感謝しているんだ。本当だぞ。' },
  ], effects: ['mutual(GERU,HYU,1)', 'log(AMBIENT)'] }),
  A('DLG_NPCPL_JIN_LEN_V12', ['JIN', 'LENNY'], { cond: 'rel(JIN, LENNY) == LOVER', weight: 17, lines: [
    { sp: 'JIN', text: 'レニィ、俺な、お前が寝てる間に、そっと毛布かけてやるの、地味に好きなんだ。……お前の幸せそうな寝顔見ると、俺まで幸せになるんだよ。' },
    { sp: 'LENNY', text: 'えへへ……知ってたよ。いつも、あったかい毛布で目が覚めるんだ。……ジンパチのやさしさ、ちゃんと届いてるよ。ありがとう、大好き。' },
  ], effects: ['mutual(JIN,LENNY,1)', 'log(AMBIENT)'] }),

  // ========================================================
  // (3) 主要人物2人の通常会話(場所/時間/季節/天気)
  // ========================================================
  A('DLG_N_JIN_GER_ROOF_V12', ['JIN', 'GERU'], { cond: 'location == ROOF', lines: [
    { sp: 'JIN', text: 'ゲル、屋上で読書か! 気持ちいいだろ! ……俺は素振りするけど、邪魔だったら言えよ!' },
    { sp: 'GERU', text: 'ふ、お前の素振りの風で、ちょうどよく頁がめくれる。……邪魔どころか、いい読書のお供だ。そこで好きに振っていろ。' },
  ], effects: ['mutual(JIN,GERU,1)', 'log(AMBIENT)'] }),
  A('DLG_N_HYU_LEN_GROUND_V12', ['HYU', 'LENNY'], { cond: 'location == GROUND', lines: [
    { sp: 'LENNY', text: 'ヒュウ、路地の壁にもたれて寝ると、意外とよく眠れるんだよ。' },
    { sp: 'HYU', text: '……そんな場所で寝ないでください。服が汚れます。ほら、私のストールを敷いてあげますから、せめてその上で。……まったく、目が離せませんね。' },
  ], effects: ['mutual(HYU,LENNY,1)', 'log(AMBIENT)'] }),
  A('DLG_N_NEO_MUN_ROOF_V12', ['NEO', 'MUNI'], { cond: 'location == ROOF', lines: [
    { sp: 'MUNI', text: 'ネオおにいちゃん、くもがぞうさんのかたちしてる!' },
    { sp: 'NEO', text: 'ほう、真に象のようだ。……ムニよ、雲は刻一刻と姿を変える。今しか見られぬ形だ。目に焼き付けておけ。……ふ、消えたな。だが、我らは見た。それでよい。' },
  ], effects: ['mutual(MUNI,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_N_GER_LEN_GROUND_V12', ['GERU', 'LENNY'], { cond: 'location == GROUND', lines: [
    { sp: 'GERU', text: 'レニィ、路地裏の野良猫と一緒に寝るな。風邪をひくぞ。……ほら、起きろ。私の部屋なら、猫より暖かい場所を貸してやる。' },
    { sp: 'LENNY', text: 'ん……ゲルの部屋、本の匂いがして落ち着くんだ。……猫もいっしょに連れてっていい? だめ? ……えへへ、じょーだんだよ。' },
  ], effects: ['mutual(LENNY,GERU,1)', 'log(AMBIENT)'] }),
  A('DLG_N_HYU_NEO_MORNING_V12', ['HYU', 'NEO'], { cond: 'time == MORNING', lines: [
    { sp: 'HYU', text: 'ネオさん、朝の身支度、あなたも入念な方でしょう。その金髪、手入れが大変では?' },
    { sp: 'NEO', text: 'うむ、この誇りを保つには、朝の手入れは欠かせぬ。……貴様の前髪二時間には及ばぬがな。ふ、美を追う者どうし、朝は忙しいものよ。' },
  ], effects: ['mutual(HYU,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_N_JIN_MUN_DAY_V12', ['JIN', 'MUNI'], { cond: 'time == DAY', lines: [
    { sp: 'MUNI', text: 'ジンパチおにいちゃん、おひるまなのにねむい……。' },
    { sp: 'JIN', text: 'こら、昼寝はレニィの専売特許だぞ! ……ま、たまにはいいか。ほら、俺が見張っててやるから、ちょっとだけ寝ろ。……すぴー。……お、俺まで眠くなってきた!' },
  ], effects: ['mutual(JIN,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_N_GER_HYU_NIGHT_V12', ['GERU', 'HYU'], { cond: 'time == NIGHT', lines: [
    { sp: 'HYU', text: 'ゲル、夜のあなたは、昼より饒舌ですね。……夜型の人は、月の光で舌がほどけるのでしょうか。' },
    { sp: 'GERU', text: 'ふ、鋭いな。夜は世界の音量が下がる。……そのぶん、言葉が響くんだ。お前のような聞き手がいれば、なおさらな。今夜は、少し語りすぎるかもしれん。' },
  ], effects: ['mutual(GERU,HYU,1)', 'log(AMBIENT)'] }),
  A('DLG_N_LEN_JIN_MIDNIGHT_V12', ['LENNY', 'JIN'], { cond: 'time == MIDNIGHT', lines: [
    { sp: 'JIN', text: 'レニィ、こんな真夜中に起きてるなんて珍しいな! どうした!' },
    { sp: 'LENNY', text: 'んー、寝すぎて逆に目が覚めちゃった。……ジンパチこそ、夜中に何してるの?' },
    { sp: 'JIN', text: '夜食のラーメンだ! ……お前も食うか? 真夜中に二人で食うラーメン、なんか青春っぽくていいな!' },
  ], effects: ['mutual(JIN,LENNY,1)', 'log(AMBIENT)'] }),
  A('DLG_N_MUN_HYU_SPRING_V12', ['MUNI', 'HYU'], { cond: 'season == SPRING', lines: [
    { sp: 'MUNI', text: 'ヒュウおにいちゃん、たんぽぽのかんむりつくったの! かぶって!' },
    { sp: 'HYU', text: '……私に、たんぽぽの冠を? ふふ、いいでしょう。かぶってあげます。……どうです、野の花すら私を引き立てる。ムニ、あなたはセンスがいい。' },
  ], effects: ['mutual(HYU,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_N_GER_NEO_SUMMER_V12', ['GERU', 'NEO'], { cond: 'season == SUMMER', lines: [
    { sp: 'NEO', text: 'ゲルよ、夏の夜は寝苦しい。貴様、怪談の一つも語ってくれぬか。背筋が冷えれば、涼が取れよう。' },
    { sp: 'GERU', text: 'ふ、私の怪談は本物だぞ。……いいのか? 眠れなくなっても知らんぞ。……よし、では一つ。昔、この塔の地下にな……。' },
  ], effects: ['mutual(GERU,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_N_JIN_HYU_AUTUMN_V12', ['JIN', 'HYU'], { cond: 'season == AUTUMN', lines: [
    { sp: 'JIN', text: 'ヒュウ! 食欲の秋だ! 焼き芋食おうぜ! ほくほくの!' },
    { sp: 'HYU', text: '……芋で口の周りを汚すのは、美しくありませんが。まあ、秋の風情に免じて。ほら、あなたの分は私が半分に割ってあげます。熱いですから、気をつけて。' },
  ], effects: ['mutual(HYU,JIN,1)', 'log(AMBIENT)'] }),
  A('DLG_N_LEN_MUN_WINTER_V12', ['LENNY', 'MUNI'], { cond: 'season == WINTER', lines: [
    { sp: 'MUNI', text: 'レニィおにいちゃん、こたつでみかん! いっしょにたべよ!' },
    { sp: 'LENNY', text: 'こたつとみかん……冬の最強コンビだね。……あ、でも、こたつに入ると、ぼく絶対出られなくなるんだ。ムニ、覚悟はいい? 春まで出ないよ。えへへ。' },
  ], effects: ['mutual(LENNY,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_N_HYU_GER_RAIN_V12', ['HYU', 'GERU'], { cond: 'weather == RAIN', lines: [
    { sp: 'GERU', text: 'ヒュウ、雨だ。前髪の心配より、この雨音を楽しめ。……こういう日は、お前も少し、物思いにふけってみたらどうだ。' },
    { sp: 'HYU', text: '……あなたに言われると、そんな気もしてきますね。雨の窓辺に佇む私……ふふ、これはこれで、一枚の絵になりそうです。たまには悪くありませんね、雨も。' },
  ], effects: ['mutual(HYU,GERU,1)', 'log(AMBIENT)'] }),
  A('DLG_N_JIN_NEO_SUNNY_V12', ['JIN', 'NEO'], { cond: 'weather == SUNNY', lines: [
    { sp: 'JIN', text: 'ネオ! 快晴だ! こういう日は外で汗流すに限る! 手合わせ願おうか!' },
    { sp: 'NEO', text: 'ふはは、望むところ! 我が剣、貴様の拳、いざ尋常に! ……この青空の下で競い合う、これぞ男の浪漫であるな! いくぞ!' },
  ], effects: ['mutual(JIN,NEO,1)', 'log(AMBIENT)'] }),

  // ========================================================
  // (4) 恋人ではないが仲良くなった2人の会話
  //     (mutual >= 55 and rel != LOVER)
  // ========================================================
  A('DLG_FRND_HYU_GER_V12', ['HYU', 'GERU'], { cond: 'mutual(HYU, GERU) >= 55 and rel(HYU, GERU) != LOVER', weight: 15, lines: [
    { sp: 'HYU', text: 'ゲル、あなたとお茶をするこの時間、嫌いではありません。恋にはならずとも、美意識を語り合える友は、得難いものです。' },
    { sp: 'GERU', text: '同感だ。お前の話は華やかで、私の話は地味だが……不思議と噛み合う。表と裏、外と内。良き対の友人だな、私たちは。' },
  ], effects: ['mutual(HYU,GERU,1)', 'log(AMBIENT)'] }),
  A('DLG_FRND_JIN_NEO_V12', ['JIN', 'NEO'], { cond: 'mutual(JIN, NEO) >= 55 and rel(JIN, NEO) != LOVER', weight: 15, lines: [
    { sp: 'JIN', text: 'ネオ、お前とはよ、恋人とかじゃなくても、拳ひとつで通じ合えるよな! それが最高の友情だと思うぜ!' },
    { sp: 'NEO', text: 'まさに! 男の友情は、言葉より拳で語るもの。……貴様とは、生涯の戦友である。この絆、恋以上に固いと、我は思うておるぞ。ふはは!' },
  ], effects: ['mutual(JIN,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_FRND_LEN_GER_V12', ['LENNY', 'GERU'], { cond: 'mutual(LENNY, GERU) >= 55 and rel(LENNY, GERU) != LOVER', weight: 15, lines: [
    { sp: 'LENNY', text: 'ゲルとぼく、しゃべらなくても、いっしょにいられるよね。……それって、すごく仲良しの証拠だと思うんだ。' },
    { sp: 'GERU', text: 'ああ。沈黙が気まずくならない相手というのは、稀有だ。……お前が昼寝をし、私が本を読む。この静かな時間が、私は一番好きなんだ。良い友だよ、お前は。' },
  ], effects: ['mutual(LENNY,GERU,1)', 'log(AMBIENT)'] }),
  A('DLG_FRND_HYU_MUN_V12', ['HYU', 'MUNI'], { cond: 'mutual(HYU, MUNI) >= 55 and rel(HYU, MUNI) != LOVER', weight: 15, lines: [
    { sp: 'MUNI', text: 'ヒュウおにいちゃん、ムニ、ヒュウおにいちゃんのこと、じまんのおにいちゃんっておもってるの!' },
    { sp: 'HYU', text: '……ふ。ムニ、あなたのその素直さは、私の完璧な美よりも、よほど尊いものですよ。自慢の弟分です。……胸を張りなさい。あなたは、私の友人なのですから。' },
  ], effects: ['mutual(HYU,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_FRND_JIN_LEN_V12', ['JIN', 'LENNY'], { cond: 'mutual(JIN, LENNY) >= 55 and rel(JIN, LENNY) != LOVER', weight: 15, lines: [
    { sp: 'JIN', text: 'レニィ、お前と俺、正反対だよな。俺は動き回って、お前は寝てばっか。でも、なんか落ち着くんだよ、お前といると。' },
    { sp: 'LENNY', text: 'ふふ、ぼくもだよ。ジンパチがそばで動き回ってると、なんか安心して眠れるんだ。……ぼくたち、いい親友だね。バランスとれてる。' },
  ], effects: ['mutual(JIN,LENNY,1)', 'log(AMBIENT)'] }),
  A('DLG_FRND_GER_NEO_V12', ['GERU', 'NEO'], { cond: 'mutual(GERU, NEO) >= 55 and rel(GERU, NEO) != LOVER', weight: 15, lines: [
    { sp: 'GERU', text: 'ネオ、お前の故郷の話は、どんな物語よりも面白い。……恋人ではないが、私はお前の一番の聞き手でいたいと思っているんだ。' },
    { sp: 'NEO', text: '……光栄である。我が過去を、これほど熱心に聞いてくれる友は、貴様だけだ。語る相手がいるというのは、旅人にとって、何よりの救いなのである。感謝する。' },
  ], effects: ['mutual(GERU,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_FRND_MUN_NEO_V12', ['MUNI', 'NEO'], { cond: 'mutual(MUNI, NEO) >= 55 and rel(MUNI, NEO) != LOVER', weight: 15, lines: [
    { sp: 'MUNI', text: 'ネオおにいちゃん、ムニもきしになれる?' },
    { sp: 'NEO', text: 'なれるとも! 騎士に必要なのは、剣の腕より、優しい心だ。……ムニ、貴様はもう、その心を持っておる。我が認める、立派な見習い騎士である。ふはは!' },
  ], effects: ['mutual(MUNI,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_FRND_HYU_JIN_V12', ['HYU', 'JIN'], { cond: 'mutual(HYU, JIN) >= 55 and rel(HYU, JIN) != LOVER', weight: 15, lines: [
    { sp: 'JIN', text: 'ヒュウ、お前とつるむの、なんだかんだ一番多いよな。恋人じゃねえけど、一番の相棒だよ、お前は!' },
    { sp: 'HYU', text: 'ふふ、光栄ですね。……あなたのその裏表のなさ、私にはない美点です。だからこそ、隣にいて疲れない。最高の親友ですよ、あなたは。' },
  ], effects: ['mutual(HYU,JIN,1)', 'log(AMBIENT)'] }),

  // ========================================================
  // (5) 各施設・店での会話バリエーション
  // ========================================================
  A('DLG_F_GER_NEO_CAFE_V12', ['GERU', 'NEO'], { cond: 'location == cafe', lines: [
    { sp: 'NEO', text: 'ゲルよ、この喫茶店の珈琲、なかなかの深みである。貴様の読む物語に、よく合いそうだ。' },
    { sp: 'GERU', text: 'ふ、分かってるじゃないか。苦い珈琲と、重厚な物語。この組み合わせは至高だ。……お前も一冊、どうだ。付き合ってやるぞ。' },
  ], effects: ['mutual(GERU,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_F_JIN_LEN_BOOK_V12', ['JIN', 'LENNY'], { cond: 'location == book', lines: [
    { sp: 'JIN', text: 'レニィ、絵本コーナーで寝るなよ! ……って、ムニに読み聞かせしてる途中で自分が寝るパターンか!' },
    { sp: 'LENNY', text: 'えへへ……絵本って、読んでるとぼくが眠くなるんだ。……ジンパチ、続き読んでくれる? ぼくの代わりに。' },
    { sp: 'JIN', text: 'しょうがねえな! よーし、俺が熱く読んでやる! 桃太郎、いくぞー!' },
  ], effects: ['mutual(JIN,LENNY,1)', 'log(AMBIENT)'] }),
  A('DLG_F_HYU_MUN_RAMEN_V12', ['HYU', 'MUNI'], { cond: 'location == ramen', lines: [
    { sp: 'MUNI', text: 'ヒュウおにいちゃん、ラーメン、じょうずにたべれない……。' },
    { sp: 'HYU', text: 'ふふ、麺は静かにすすると美しいのですよ。……ほら、こうして。私を見て真似なさい。……上手です。美しい食べ方は、一生の財産ですよ、ムニ。' },
  ], effects: ['mutual(HYU,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_F_NEO_LEN_DAGASHI_V12', ['NEO', 'LENNY'], { cond: 'location == dagashi', lines: [
    { sp: 'NEO', text: 'レニィ、この10圓の菓子、庶民の錬金術である。……貴様はどれを選ぶ? 我はこの、青いラムネにする。空の色ゆえな。' },
    { sp: 'LENNY', text: 'ぼくは、眠くなる……じゃなくて、落ち着く味のやつ。……ネオ、青いの好きなんだね。ぼくの髪の色といっしょだ。えへへ。' },
  ], effects: ['mutual(LENNY,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_F_JIN_GER_CAKE_V12', ['JIN', 'GERU'], { cond: 'location == cake', lines: [
    { sp: 'JIN', text: 'ゲル、お前もケーキ食うのか? 意外と甘党だな!' },
    { sp: 'GERU', text: 'モンブランを一つな。……本を読みながら食べるのに、ちょうどいい甘さなんだ。お前こそ、鍛錬の後に甘いものとは。……ふ、人のことは言えんな、お互い。' },
  ], effects: ['mutual(JIN,GERU,1)', 'log(AMBIENT)'] }),
  A('DLG_F_LEN_MUN_GAME_V12', ['LENNY', 'MUNI'], { cond: 'location == game', lines: [
    { sp: 'MUNI', text: 'レニィおにいちゃん、メダルゲームやろ!' },
    { sp: 'LENNY', text: 'いいよぉ。……メダルが落ちそうで落ちないの、ずっと見てられるんだ。……あ、ムニ、ぼく寝てもメダル入れといてね。えへへ。' },
  ], effects: ['mutual(LENNY,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_F_HYU_GER_FLOWER_V12', ['HYU', 'GERU'], { cond: 'location == flower', lines: [
    { sp: 'HYU', text: 'ゲル、また押し花の材料探しですか。……私は飾る花、あなたは残す花。花屋での趣味も、私たちは対照的ですね。' },
    { sp: 'GERU', text: 'ふ、だが根は同じだ。美しいものを、手元に留めておきたい。……お前は鏡に、私は本に。……そう考えると、案外似た者どうしかもしれんな。' },
  ], effects: ['mutual(HYU,GERU,1)', 'log(AMBIENT)'] }),
  A('DLG_F_LEN_NEO_SENTO_V12', ['LENNY', 'NEO'], { cond: 'location == sento', lines: [
    { sp: 'LENNY', text: 'ネオ、お湯であったまると、ますます眠くなるね……。' },
    { sp: 'NEO', text: 'こら、湯船で寝るでない! ……ぬ、もう寝ておるか。仕方のない奴。ほれ、我が肩を貸そう。のぼせる前に上がるぞ、レニィ。……騎士は恋人でなくとも、友を守るのだ。' },
  ], effects: ['mutual(LENNY,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_F_GER_JIN_AQUA_V12', ['GERU', 'JIN'], { cond: 'location == aquarium', lines: [
    { sp: 'JIN', text: 'ゲル、あのサメかっけえな! あの筋肉……じゃねえ、あの推進力!' },
    { sp: 'GERU', text: 'ふ、お前はサメか。……私はあのクラゲだな。脳もなく、ただ漂う。……たまには、ああやって何も考えず生きるのも、いいのかもしれんな。' },
  ], effects: ['mutual(JIN,GERU,1)', 'log(AMBIENT)'] }),
  A('DLG_F_MUN_NEO_IZAKAYA_V12', ['MUNI', 'NEO'], { cond: 'location == izakaya', lines: [
    { sp: 'MUNI', text: 'ネオおにいちゃん、ここはこどもきちゃだめなの? ムニ、ジュースのむだけ!' },
    { sp: 'NEO', text: 'ふはは、ならば我が特別に、貴様を護衛しよう。……店主、この子にリンゴジュースを。騎士のおごりである! ……ムニ、大人の階段は、ゆっくり登るがよいぞ。' },
  ], effects: ['mutual(MUNI,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_F_HYU_JIN_TOYSHOP_V12', ['HYU', 'JIN'], { cond: 'location == toyshop', lines: [
    { sp: 'JIN', text: 'ヒュウ! このフィギュア見ろよ! かっけえだろ!' },
    { sp: 'HYU', text: '……ふむ、造形は悪くありませんね。ですが、私を模したフィギュアが出れば、これの百倍は売れるでしょう。メーカーに提案しておくべきですね。ふふ。' },
  ], effects: ['mutual(HYU,JIN,1)', 'log(AMBIENT)'] }),
  A('DLG_F_GER_MUN_KONBINI_V12', ['GERU', 'MUNI'], { cond: 'location == konbini', lines: [
    { sp: 'MUNI', text: 'ゲルおねえちゃん、よるのコンビニ、たんけんみたいでわくわくするの!' },
    { sp: 'GERU', text: 'ふ、分かるぞ、その気持ち。深夜のコンビニには、昼とは違う魔法がある。……ほら、プリンを一つ買ってやる。今日だけの、内緒の探検の記念だ。' },
  ], effects: ['mutual(GERU,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_F_LEN_JIN_YAKINIKU_V12', ['LENNY', 'JIN'], { cond: 'location == yakiniku', lines: [
    { sp: 'JIN', text: 'レニィ! 肉焼けたぞ! ……って、お肉が焼ける音で寝るなよ!' },
    { sp: 'LENNY', text: 'ん……お肉が焼ける音、子守唄みたいで……。あ、でも食べる。ジンパチが焼いてくれるお肉、世界一おいしいから。むにゃむにゃ。' },
  ], effects: ['mutual(JIN,LENNY,1)', 'log(AMBIENT)'] }),
  A('DLG_F_HYU_NEO_CINEMA_V12', ['HYU', 'NEO'], { cond: 'location == cinema', lines: [
    { sp: 'NEO', text: 'ヒュウよ、この騎士映画、剣戟の場面が見事である。……貴様も、美しき殺陣に見惚れておろう。' },
    { sp: 'HYU', text: 'ええ。ですが、私が見ているのは、スクリーンより、暗闇で光を浴びるあなたの横顔かもしれませんね。……なんて、映画の感想ですよ。ふふ。' },
  ], effects: ['mutual(HYU,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_F_LEN_GER_DONUT_V12', ['LENNY', 'GERU'], { cond: 'location == donut', lines: [
    { sp: 'LENNY', text: 'ゲル、ドーナツの穴って、なんであいてるのかな。' },
    { sp: 'GERU', text: 'ふ、諸説あるが……私はこう思う。あの穴は、余白だ。何もない空間があるから、人はそこに想像を詰められる。……お前の頭の中と、同じだな。ふ、褒めてるんだぞ。' },
  ], effects: ['mutual(LENNY,GERU,1)', 'log(AMBIENT)'] }),
  A('DLG_F_HYU_MUN_CHURCH_V12', ['HYU', 'MUNI'], { cond: 'location == church', lines: [
    { sp: 'MUNI', text: 'ヒュウおにいちゃん、ステンドグラス、キラキラきれいなの!' },
    { sp: 'HYU', text: 'ええ、美しいですね。……光が色ガラスを通ると、ただの白い光が、七色の宝石になる。ムニ、美しいものは、見る角度で姿を変えるのですよ。覚えておきなさい。' },
  ], effects: ['mutual(HYU,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_F_JIN_NEO_KARAOKE_V12', ['JIN', 'NEO'], { cond: 'location == karaoke', lines: [
    { sp: 'JIN', text: 'ネオ! 熱い曲でデュエットだ! お前の吟遊詩人の美声、聞かせてくれよ!' },
    { sp: 'NEO', text: 'ふはは、よかろう! 我が歌声、天まで届かせてくれる! ……貴様の熱唱と我が美声、この店を戦場に変えようぞ! さあ、いくぞジンパチ!' },
  ], effects: ['mutual(JIN,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_F_LEN_HYU_HALL_V12', ['LENNY', 'HYU'], { cond: 'location == hall', lines: [
    { sp: 'LENNY', text: 'ヒュウ、集会所って、誰もいなくてもなんだかあったかいね。みんなの気配が残ってるみたい。' },
    { sp: 'HYU', text: '……ふ、詩人ですね、あなたは。ええ、人が集う場所には、温もりが染みつくもの。……私が舞台に立てば、ここは一瞬で華やぐのですが。ふふ、冗談ですよ。' },
  ], effects: ['mutual(HYU,LENNY,1)', 'log(AMBIENT)'] }),
];
