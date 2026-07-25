// ============================================================
// v8 追加会話
//   ・映画館 星影幸太郎(館長)— 主要人物/床屋/郵便屋との会話
//   ・サチ×リン 喫茶店でのガールズトーク(恋人にするなら誰)
//   ・集会所イベント: ひな祭り/怪談クラブ/ミニ夏祭り/誕生日会6種
//   ・主要人物ペア会話を大幅増(各施設/恋人時/友人時)
//   ・カラオケの複数人デュエット
// ============================================================
const T = (id, owner, node) => ({ id, owner, type: node.type ?? 'TALK', pool: node.pool ?? 'GENERIC', ...node });
const A = (id, cast, node) => ({ id, type: 'AMBIENT', pool: 'AMBIENT', owner: [...cast].sort().join('-'), cast, ...node });
const ALLMAIN = ['LENNY', 'HYU', 'JIN', 'GERU', 'MUNI', 'NEO'];
const ALLMAIN_K = ['LENNY', 'HYU', 'JIN', 'GERU', 'MUNI', 'NEO', 'KANE'];

export const DLG_V8 = [
  // ========================================================
  // 映画館 星影幸太郎(館長)
  // ========================================================
  T('DLG_HOSHIKAGE_FIRST', 'HOSHIKAGE', {
    type: 'EVENT', pool: 'EVENT', once: true, cond: 'location == cinema',
    lines: [
      { sp: 'HOSHIKAGE', text: 'いらっしゃい! シネマ・ホシカゲへようこそ! 館長の星影幸太郎だよ、よろしくねえ。' },
      { sp: 'HOSHIKAGE', text: 'この街に映画館を建ててくれるとは、君、見どころがあるねえ! 映画は人生の全てだ。異論は認めるが、私は曲げない!' },
      { sp: 'HOSHIKAGE', text: 'さあ、今日は何を観る? ……おっと、語り出す前に。まずは一本、暗闇に身を委ねてみてくれよねえ。' },
    ],
    effects: ['flag(FLG_MET_HOSHIKAGE)', 'aff(HOSHIKAGE,2)', 'log(EVENT)'],
  }),
  T('DLG_HOSHIKAGE_TALK_1', 'HOSHIKAGE', { pool: 'COND', cond: 'location == cinema', weight: 10, lines: [{ sp: 'HOSHIKAGE', text: '今週の特集はねえ、雨の似合う映画ばかり集めたんだ。……レニィ君が気に入ってくれてねえ、途中で寝てたけど。' }], effects: ['aff(HOSHIKAGE,1)'] }),
  T('DLG_HOSHIKAGE_TALK_2', 'HOSHIKAGE', { pool: 'COND', cond: 'location == cinema and weather == RAIN', weight: 12, lines: [{ sp: 'HOSHIKAGE', text: '雨の日の映画館は、格別なんだよねえ。傘を畳んで暗闇に入る、あの背徳感。分かるかい?' }], effects: ['aff(HOSHIKAGE,1)'] }),
  T('DLG_HOSHIKAGE_TALK_3', 'HOSHIKAGE', { lines: [{ sp: 'HOSHIKAGE', text: '床屋の親父さんとは西部劇、郵便屋君とは最新作。……映画仲間がいるってのは、いいもんだよねえ。' }], effects: ['aff(HOSHIKAGE,1)'] }),

  // 星影 × 主要人物
  A('DLG_AMB_HOSHI_LENNY', ['HOSHIKAGE', 'LENNY'], { cond: 'location == cinema', weight: 16, lines: [
    { sp: 'HOSHIKAGE', text: 'レニィ君、また最前列で寝てるねえ。……いいんだよ、映画館は世界一贅沢な昼寝の場所さ。' },
    { sp: 'LENNY', text: 'えへへ……星影さんの映画館、暗くてあったかくて、ぼくの特等席なんだ。' },
    { sp: 'HOSHIKAGE', text: 'ふふ、そう言われると悪い気はしないねえ。今度、子守唄みたいな映画を用意しておくよ。' },
  ], effects: ['mutual(HOSHIKAGE,LENNY,1)', 'log(AMBIENT)'] }),
  A('DLG_AMB_HOSHI_HYU', ['HOSHIKAGE', 'HYU'], { cond: 'location == cinema', weight: 16, lines: [
    { sp: 'HYU', text: '館長。スクリーンの主演女優より、観ている私の方が美しいと思いませんか。' },
    { sp: 'HOSHIKAGE', text: 'ははは、君は自分自身が主演の映画を生きてるねえ! そういう客、私は嫌いじゃないよ。' },
  ], effects: ['mutual(HOSHIKAGE,HYU,1)', 'log(AMBIENT)'] }),
  A('DLG_AMB_HOSHI_JIN', ['HOSHIKAGE', 'JIN'], { cond: 'location == cinema', weight: 16, lines: [
    { sp: 'JIN', text: '館長! 今日はどのアクション映画がおすすめだ! 熱いやつ頼むぜ!' },
    { sp: 'HOSHIKAGE', text: 'ジンパチ君にはこれだねえ、拳で全てを語る名作! ……観たあと絶対に筋トレしたくなるから、覚悟してねえ。' },
    { sp: 'JIN', text: 'それだ! それが欲しかったんだよ館長! 燃えるぜ!' },
  ], effects: ['mutual(HOSHIKAGE,JIN,1)', 'log(AMBIENT)'] }),
  A('DLG_AMB_HOSHI_GERU', ['HOSHIKAGE', 'GERU'], { cond: 'location == cinema', weight: 16, lines: [
    { sp: 'GERU', text: '館長、原作のあの場面、映画では削られていたな。……あれは改悪だと思うが、どう見る?' },
    { sp: 'HOSHIKAGE', text: 'おおっ、そこに気づくとはねえ! いや実は監督にも意図があって……よし、朝まで語ろうか、ゲル君!' },
    { sp: 'GERU', text: '……朝は困る。だが、一時間なら付き合おう。こういう議論は、嫌いじゃない。' },
  ], effects: ['mutual(HOSHIKAGE,GERU,1)', 'log(AMBIENT)'] }),
  A('DLG_AMB_HOSHI_MUNI', ['HOSHIKAGE', 'MUNI'], { cond: 'location == cinema', weight: 16, lines: [
    { sp: 'MUNI', text: 'かんちょーさん! アニメみたいの! おっきいがめんで!' },
    { sp: 'HOSHIKAGE', text: 'よしきた、ムニ君! 特別に一番いい席を用意しよう。ポップコーンはこぼさないようにねえ。' },
    { sp: 'MUNI', text: 'やったー! かんちょーさん、だいすき!' },
  ], effects: ['mutual(HOSHIKAGE,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_AMB_HOSHI_NEO', ['HOSHIKAGE', 'NEO'], { cond: 'location == cinema', weight: 16, lines: [
    { sp: 'NEO', text: '星影殿。この光と影で紡ぐ物語、まさに現代の魔術である。騎士道の映画はあるか?' },
    { sp: 'HOSHIKAGE', text: 'あるともさ、ネオ君! 騎士が誇りのために剣を取る名作をねえ。君なら泣くよ、きっと。' },
    { sp: 'NEO', text: 'ぬ……騎士は泣かん。……いや、暗闇なら、少しは許されるか。よし、観よう。' },
  ], effects: ['mutual(HOSHIKAGE,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_AMB_HOSHI_BARBER', ['HOSHIKAGE', 'BARBER'], { cond: 'location == cinema', weight: 15, lines: [
    { sp: 'BARBER', text: '館長、閉館後に一本どうじゃ。例の古い西部劇、また観たくなってのう。' },
    { sp: 'HOSHIKAGE', text: 'いいねえ親父さん! あの決闘シーン、何度観ても痺れる。……酒とスルメ、用意しとくよ。' },
  ], effects: ['mutual(HOSHIKAGE,BARBER,1)', 'log(AMBIENT)'] }),
  A('DLG_AMB_HOSHI_POSTMAN', ['HOSHIKAGE', 'POSTMAN'], { cond: 'location == cinema', weight: 15, lines: [
    { sp: 'POSTMAN', text: '館長! 配達ついでっす! 例の話題作、もう入りました?' },
    { sp: 'HOSHIKAGE', text: '君は仕事より映画が早いねえ! ふふ、入ってるよ。配達が終わったら、こっそり試写といこうか。' },
    { sp: 'POSTMAN', text: 'やった! だから館長のこと、尊敬してるんすよ!' },
  ], effects: ['mutual(HOSHIKAGE,POSTMAN,1)', 'log(AMBIENT)'] }),
  // 主要人物の星影言及
  T('DLG_HYU_HOSHI', 'HYU', { cond: 'flag(FLG_MET_HOSHIKAGE)', lines: [{ sp: 'HYU', text: '星影館長は、私の美を正しく評価できる数少ない人物です。……映画を観る目がある人は、美を見る目もあるのですよ。' }], effects: ['aff(HYU,1)'] }),
  T('DLG_GER_HOSHI', 'GERU', { cond: 'flag(FLG_MET_HOSHIKAGE)', lines: [{ sp: 'GERU', text: '星影館長とは、原作と映画の話で朝まで語れる。……この街で、そんな相手はそう多くない。貴重だな。' }], effects: ['aff(GERU,1)'] }),

  // ========================================================
  // サチ × リン 喫茶店でのガールズトーク(恋人にするなら誰)
  // ========================================================
  A('DLG_AMB_SACHI_RIN_CAFE_1', ['CAFEGIRL', 'CLERK'], { cond: 'location == cafe', weight: 20, lines: [
    { sp: 'CAFEGIRL', text: 'リンちゃん、休憩でうちに来てくれるの嬉しい♪ 特製クリームソーダ、サービスしちゃう!' },
    { sp: 'CLERK', text: 'わあ、サチさん、いつもすみません。……ここのソファ、落ち着くんですよね。コンビニと違って。' },
    { sp: 'CAFEGIRL', text: 'ふふ、看板娘どうし、こういう時間も大事だよね。さ、ガールズトークしよ♪' },
  ], effects: ['mutual(CAFEGIRL,CLERK,2)', 'log(AMBIENT)'] }),
  A('DLG_AMB_SACHI_RIN_DATE_1', ['CAFEGIRL', 'CLERK'], { cond: 'location == cafe', weight: 22, lines: [
    { sp: 'CAFEGIRL', text: 'ねえリンちゃん、ここだけの話。……この街の6人の中で、恋人にするなら誰?(ムニちゃんは別ね♪)' },
    { sp: 'CLERK', text: 'えっ、そ、そういう話ですか……! う〜ん、ヒュウさんは毎日口説かれるので、逆にナシで(笑)。' },
    { sp: 'CAFEGIRL', text: 'あはは、分かる! じゃあ落ち着く人がいい? 私はね……ゲルちゃんかな。凛としてて、憧れちゃう♪' },
    { sp: 'CLERK', text: 'ゲルさん素敵ですよね! ……私は、ジンパチさんかも。まっすぐで、一緒にいて元気になれそうで。' },
  ], effects: ['mutual(CAFEGIRL,CLERK,2)', 'log(AMBIENT)'] }),
  A('DLG_AMB_SACHI_RIN_DATE_2', ['CAFEGIRL', 'CLERK'], { cond: 'location == cafe', weight: 20, lines: [
    { sp: 'CLERK', text: 'サチさん、この前の続き……恋人にするなら、の話。レニィさんはどうですか?' },
    { sp: 'CAFEGIRL', text: 'レニィくん! 癒し系だよね〜。でも一緒にいたら、私までお昼寝しちゃいそう(笑)。ネオさんは、意外とロマンチストらしいよ?' },
    { sp: 'CLERK', text: 'えっ、あの騎士様が? ……ふふ、ギャップですね。恋バナって、いくらでもできちゃいます。' },
    { sp: 'CAFEGIRL', text: 'でしょ〜? また休憩の時、続きしようね♪ 次はゲルちゃんの魅力を語り尽くすから!' },
  ], effects: ['mutual(CAFEGIRL,CLERK,2)', 'log(AMBIENT)'] }),
  A('DLG_AMB_SACHI_RIN_DATE_3', ['CAFEGIRL', 'CLERK'], { cond: 'location == cafe', weight: 18, lines: [
    { sp: 'CAFEGIRL', text: 'そういえばリンちゃん、大家さんのことはどう思ってるの? ……この街を大きくしてる、あの人。' },
    { sp: 'CLERK', text: 'えっ……! そ、それはまた別のお話ということで(赤面)。サチさんこそ、どうなんですか?' },
    { sp: 'CAFEGIRL', text: 'ふふ、ノーコメント♪ ……ガールズトークは、秘密があるから楽しいのよね。' },
  ], effects: ['mutual(CAFEGIRL,CLERK,1)', 'log(AMBIENT)'] }),

  // ========================================================
  // 集会所イベント — ひな祭り
  // ========================================================
  A('DLG_EV_HINA', ALLMAIN, { cond: 'event_active(HINA) and location == hall', weight: 30, lines: [
    { sp: 'MUNI', text: 'おひなさま、かわいいの! ムニ、およめさんのやつがすきー!' },
    { sp: 'GERU', text: 'ひな人形か。……一日限りで仕舞う、その儚さがいい。飾りすぎると幸せが逃げるというからな。' },
    { sp: 'HYU', text: 'お内裏様と私、どちらが雅か……今日は張り合わないでおきましょう。ムニのお祝いですからね。' },
    { sp: 'LENNY', text: 'ひなあられ、色とりどりで……食べてたら眠くなってきたよぉ。ひな祭りって平和だね。' },
    { sp: 'JIN', text: '甘酒だ! ……ノンアルコールのやつな! みんな、ぐいっといけ! 春の乾杯だぜ!' },
    { sp: 'NEO', text: '雛人形とは、災いを人形に移す風習と聞いた。……異国ながら、奥深い魔除けである。感心したぞ。' },
  ], effects: ['mutual(LENNY,MUNI,1)', 'mutual(GERU,HYU,1)', 'log(AMBIENT)'] }),
  A('DLG_EV_HINA_K', ALLMAIN_K, { cond: 'event_active(HINA) and location == hall', weight: 34, lines: [
    { sp: 'KANE', text: 'おや、雛祭りかい。……あたしも昔は、こうして飾ってもらったもんさ。懐かしいねぇ。' },
    { sp: 'MUNI', text: 'カネばあば! いっしょにおひなさま、みようね!' },
    { sp: 'KANE', text: 'ふふ、ああ。……あんたが元気に育つように、あたしも祈っとくよ。' },
  ], effects: ['mutual(KANE,MUNI,1)', 'log(AMBIENT)'] }),

  // 集会所イベント — 怪談クラブ
  A('DLG_EV_KAIDAN', ALLMAIN, { cond: 'event_active(KAIDAN) and location == hall', weight: 30, lines: [
    { sp: 'GERU', text: '灯りを落とせ。……今宵は怪談クラブだ。私が一番怖い話を知っている。覚悟はいいか。' },
    { sp: 'MUNI', text: 'ひぃ……ムニ、こわいの。でも、きくの! ……レニィおにいちゃん、てつないで。' },
    { sp: 'JIN', text: 'ふっ、俺は幽霊なんて怖くねえ! ……い、いま、なんか後ろで音がしなかったか?' },
    { sp: 'HYU', text: 'ろうそくに照らされた私……ぞっとするほど美しいでしょう? 怪談より私に見惚れなさい。' },
    { sp: 'NEO', text: '亡霊か。我が剣は実体なきものは斬れぬ……ぬ、この背筋の寒さ、武者震いである。断じて怖くはない。' },
    { sp: 'LENNY', text: '怖い話ってね、聞いてるうちに……zzz。……あ、ごめん、いいところで寝ちゃった?' },
  ], effects: ['mutual(GERU,MUNI,1)', 'mutual(JIN,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_EV_KAIDAN_K', ALLMAIN_K, { cond: 'event_active(KAIDAN) and location == hall', weight: 34, lines: [
    { sp: 'KANE', text: 'ふん、あんたたちの怪談なんて可愛いもんさ。……あたしが本物の昔話を、してやろうかい?' },
    { sp: 'JIN', text: 'う……カ、カネ婆の話が一番怖えよ! やめてくれ!' },
    { sp: 'KANE', text: 'ホッホッホ。冗談さ。……さ、灯りをつけな。怖がりんぼたち。' },
  ], effects: ['mutual(KANE,JIN,1)', 'log(AMBIENT)'] }),

  // 集会所イベント — ミニ夏祭り
  A('DLG_EV_NATSUFES', ALLMAIN, { cond: 'event_active(NATSUFES) and location == hall', weight: 30, lines: [
    { sp: 'MUNI', text: 'きんぎょすくい! ムニ、いっぴきとったの! ……あ、ポイやぶれた。むにゅ〜。' },
    { sp: 'JIN', text: '射的なら任せろ! ……って金魚すくいか! よし、俺が全部すくってやる! ポイ10枚くれ!' },
    { sp: 'HYU', text: 'りんご飴を持つ私……この赤い艶、私の唇と張り合いますね。写真映えする祭りです。' },
    { sp: 'GERU', text: '屋台の灯りと、遠くの祭囃子。……こういう夜は、本を閉じて、ただ眺めるに限る。' },
    { sp: 'NEO', text: 'この「金魚すくい」なる余興、獲物を傷つけず掬い取る技……ぬ、存外に難しい。騎士の名折れである!' },
    { sp: 'LENNY', text: 'りんご飴、あまくてつめたくて……夏の味だね。提灯の灯り、ずっと見てられるよぉ。' },
  ], effects: ['mutual(JIN,MUNI,1)', 'mutual(GERU,LENNY,1)', 'log(AMBIENT)'] }),
  A('DLG_EV_NATSUFES_K', ALLMAIN_K, { cond: 'event_active(NATSUFES) and location == hall', weight: 34, lines: [
    { sp: 'KANE', text: '夏祭りとはまた粋なことをするねぇ。……ほれ、あたしが焼いたとうもろこし、みんなでお食べ。' },
    { sp: 'MUNI', text: 'カネばあば、とうもろこし! ムニ、だいすき!' },
    { sp: 'KANE', text: 'ふふ、いっぱいお食べ。祭りの夜は、腹いっぱいが一番さ。' },
  ], effects: ['mutual(KANE,MUNI,1)', 'log(AMBIENT)'] }),

  // ========================================================
  // 集会所イベント — 誕生日会(春ムニ / 夏ヒュウ・レニィ / 秋ゲル・ジンパチ / 冬ネオ・カネ)
  // ========================================================
  // ムニ(春)
  A('DLG_BD_MUNI', ALLMAIN, { cond: 'event_active(BIRTHDAY_MUNI) and location == hall', weight: 32, lines: [
    { sp: 'JIN', text: 'ムニ、誕生日おめでとう! ほら、俺特製のでっかいケーキだ! ろうそく吹き消せ!' },
    { sp: 'MUNI', text: 'わーい! ムニ、おたんじょうびなの! ……ふー! けせたよ!' },
    { sp: 'HYU', text: 'おめでとう、ムニ。ひとつ大きくなりましたね。……プレゼントは、私の美的センスで選びました。' },
    { sp: 'LENNY', text: 'おめでとう、ムニ。ぼくからは……一緒にお昼寝する券だよ。世界一の贈り物でしょ?' },
    { sp: 'GERU', text: '誕生日おめでとう。……お前が笑っていると、この街全体が少し明るくなる。本当だぞ。' },
    { sp: 'NEO', text: '祝いの日である! ムニ、貴様の健やかなる成長に、騎士ネオ、剣を捧げよう! おめでとう!' },
  ], effects: ['mutual(JIN,MUNI,1)', 'mutual(LENNY,MUNI,1)', 'mutual(GERU,MUNI,1)', 'mutual(MUNI,NEO,1)', 'log(AMBIENT)'] }),
  // ヒュウ(夏)
  A('DLG_BD_HYU', ALLMAIN, { cond: 'event_active(BIRTHDAY_HYU) and location == hall', weight: 32, lines: [
    { sp: 'HYU', text: 'ふふ、今日は私の誕生日。……祝われる私も、当然、完璧に美しいでしょう?' },
    { sp: 'JIN', text: 'ヒュウ、誕生日おめでとう! お前は自信家だけど、根はいいやつだからな! ケーキ食え!' },
    { sp: 'MUNI', text: 'ヒュウおにいちゃん、おめでとーなの! ムニ、おえかきかいたの! はい!' },
    { sp: 'HYU', text: '……ムニ、この絵は一生の宝にします。ジンパチくんの言葉も。……ふふ、悪くない誕生日ですね。' },
    { sp: 'LENNY', text: 'おめでとう、ヒュウ。前髪、今日もばっちりだね。……ぼく、そこ尊敬してるんだ。' },
    { sp: 'NEO', text: 'ヒュウよ、生誕を祝う! 貴様の美への執念、騎士の忠義に通ずる。……誇り高き友に、乾杯である!' },
  ], effects: ['mutual(HYU,JIN,1)', 'mutual(HYU,MUNI,1)', 'mutual(HYU,LENNY,1)', 'mutual(HYU,NEO,1)', 'log(AMBIENT)'] }),
  // レニィ(夏)
  A('DLG_BD_LENNY', ALLMAIN, { cond: 'event_active(BIRTHDAY_LENNY) and location == hall', weight: 32, lines: [
    { sp: 'LENNY', text: 'えっ、今日ぼくの誕生日? ……わ、みんな集まってくれたの? ねむ気が吹き飛んじゃったよぉ。' },
    { sp: 'MUNI', text: 'レニィおにいちゃん、おめでとーなの! きょうはムニがおひるねつきあってあげる!' },
    { sp: 'HYU', text: 'おめでとう、レニィ。あなたの寝顔は、この街の平和の象徴です。……たまには起きていなさいね。' },
    { sp: 'JIN', text: 'レニィ誕生日おめでとう! お前が寝てると、なんか安心すんだよな! これからもよろしくな!' },
    { sp: 'GERU', text: '誕生日おめでとう。……お前の隣は、時間がゆっくり流れる。得難い才能だ。大事にしろ。' },
    { sp: 'NEO', text: 'レニィよ、生誕を祝う! 貴様の眠りは、戦なき平和の証。……この街を、共に守っていこうぞ!' },
  ], effects: ['mutual(LENNY,MUNI,1)', 'mutual(HYU,LENNY,1)', 'mutual(JIN,LENNY,1)', 'mutual(GERU,LENNY,1)', 'log(AMBIENT)'] }),
  // ゲル(秋)
  A('DLG_BD_GERU', ALLMAIN, { cond: 'event_active(BIRTHDAY_GERU) and location == hall', weight: 32, lines: [
    { sp: 'GERU', text: '……誕生日を祝われるのは、柄ではないんだがな。だが、悪い気はしない。ありがとう。' },
    { sp: 'MUNI', text: 'ゲルおねえちゃん、おめでとーなの! いつもえほんよんでくれて、ありがとなの!' },
    { sp: 'HYU', text: 'おめでとう、ゲル。あなたの静かな美しさに、今日は素直に敬意を。……プレゼントは稀覯本ですよ。' },
    { sp: 'JIN', text: 'ゲル、誕生日おめでとう! お前がいると、俺たちの暴走を止めてくれるからな! 感謝してるぜ!' },
    { sp: 'LENNY', text: 'おめでとう、ゲル。……いつもの本の栞に、押し花、一枚増やしたよ。ぼくからの贈り物。' },
    { sp: 'NEO', text: 'ゲルよ、生誕を祝う! 貴様の知性は、我が剣より鋭い。……得難き友の一年に、乾杯である!' },
  ], effects: ['mutual(GERU,MUNI,1)', 'mutual(GERU,HYU,1)', 'mutual(JIN,GERU,1)', 'mutual(GERU,LENNY,1)', 'log(AMBIENT)'] }),
  // ジンパチ(秋)
  A('DLG_BD_JIN', ALLMAIN, { cond: 'event_active(BIRTHDAY_JIN) and location == hall', weight: 32, lines: [
    { sp: 'JIN', text: 'おう! 今日は俺の誕生日だ! ……みんな集まってくれて、その、ありがとうな! 照れるぜ!' },
    { sp: 'MUNI', text: 'ジンパチおにいちゃん、おめでとーなの! ムニ、いっぱいだっこしてほしいの!' },
    { sp: 'HYU', text: 'おめでとう、ジンパチくん。あなたのまっすぐさは、私の美学とは違うけれど……眩しいですよ。' },
    { sp: 'LENNY', text: 'おめでとう、ジンパチ。……プレゼントは、ぐっすり眠れる枕だよ。鍛錬の疲れ、取れるといいな。' },
    { sp: 'GERU', text: '誕生日おめでとう。……お前の熱は、時々うっとうしいが、無いと寂しい。長生きしろよ、暑苦しい男。' },
    { sp: 'NEO', text: 'ジンパチよ、生誕を祝う! 背中を預け合った戦友の一年! ……共に、まだまだ強くなろうぞ!' },
  ], effects: ['mutual(JIN,MUNI,1)', 'mutual(HYU,JIN,1)', 'mutual(JIN,LENNY,1)', 'mutual(JIN,NEO,1)', 'log(AMBIENT)'] }),
  // ネオ(冬)
  A('DLG_BD_NEO', ALLMAIN, { cond: 'event_active(BIRTHDAY_NEO) and location == hall', weight: 32, lines: [
    { sp: 'NEO', text: '……我が生誕の日を、皆が祝ってくれるとは。故郷を出て以来、初めてである。……感謝する。' },
    { sp: 'MUNI', text: 'ネオおにいちゃん、おめでとーなの! きしさま、かっこいいの!' },
    { sp: 'JIN', text: 'ネオ、誕生日おめでとう! お前と出会えて、俺の毎日は熱くなったぜ! これからもよろしくな!' },
    { sp: 'HYU', text: 'おめでとう、ネオさん。あなたの金髪、今日も誇り高く輝いていますね。……好敵手として、乾杯を。' },
    { sp: 'LENNY', text: 'おめでとう、ネオ。……この街も、ネオの故郷のひとつになれたら、いいなあ。' },
    { sp: 'GERU', text: '誕生日おめでとう。……故郷を想う夜は、私の部屋に来い。本と茶くらいは、いつでも出す。' },
  ], effects: ['mutual(MUNI,NEO,1)', 'mutual(JIN,NEO,1)', 'mutual(HYU,NEO,1)', 'mutual(GERU,NEO,1)', 'log(AMBIENT)'] }),
  // カネ(冬・仲が良いとき本人が来る)
  A('DLG_BD_KANE', ALLMAIN_K, { cond: 'event_active(BIRTHDAY_KANE) and location == hall', weight: 36, lines: [
    { sp: 'KANE', text: 'なんだい、あたしの誕生日なんて祝ってくれるのかい。……物好きな子らだねぇ。' },
    { sp: 'MUNI', text: 'カネばあば、おめでとーなの! ずっとげんきでいてね!' },
    { sp: 'JIN', text: 'カネ婆、誕生日おめでとう! あんたがいるから、この路地は締まるんだ! 長生きしてくれよ!' },
    { sp: 'GERU', text: 'おめでとう、カネ婆さん。……あんたの昔語りは、この街の一番古い頁だ。まだまだ聞かせてくれ。' },
    { sp: 'NEO', text: '婆殿、生誕を祝う! 口は悪いが、その心根、貴き女傑である! ……長寿を願うぞ!' },
    { sp: 'KANE', text: '……ふん。長生きなんて柄じゃないが。あんたたちの顔を見てると、もう少し、生きてやってもいいかねぇ。' },
  ], effects: ['mutual(KANE,MUNI,1)', 'mutual(KANE,JIN,1)', 'mutual(KANE,NEO,1)', 'log(AMBIENT)'] }),

  // ========================================================
  // カラオケの複数人デュエット/トリオ
  // ========================================================
  A('DLG_KARA_TRIO_1', ['JIN', 'HYU', 'NEO'], { cond: 'location == karaoke', weight: 22, lines: [
    { sp: 'JIN', text: 'よーし、男三人でトリオだ! 俺が熱血パート!' },
    { sp: 'HYU', text: '私がクールに二番を。……主旋律はもちろん、一番美しい私が。' },
    { sp: 'NEO', text: 'ならば大サビは我が吟遊の美声で締めよう! ……三者三様、これぞ調和である!' },
  ], effects: ['mutual(HYU,JIN,1)', 'mutual(JIN,NEO,1)', 'mutual(HYU,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_KARA_DUET_LEN_MUN', ['LENNY', 'MUNI'], { cond: 'location == karaoke', weight: 18, lines: [
    { sp: 'MUNI', text: 'レニィおにいちゃん、アニメのうた、いっしょにうたお!' },
    { sp: 'LENNY', text: 'いいよぉ。……ぼく、サビだけがんばるね。あとはムニにおまかせ。ふぁ……♪' },
    { sp: 'MUNI', text: 'むにゅ〜♪ レニィおにいちゃん、ねちゃだめー!' },
  ], effects: ['mutual(LENNY,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_KARA_DUET_GER_HYU', ['GERU', 'HYU'], { cond: 'location == karaoke', weight: 16, lines: [
    { sp: 'HYU', text: 'ゲル、私とデュエットを。……あなたの低音と私の美声、意外と合うと思いませんか。' },
    { sp: 'GERU', text: '……柄ではないが。まあ、いいだろう。ただし、キーは私に合わせてもらうぞ。' },
    { sp: 'HYU', text: 'ふふ、交渉成立ですね。では、この街に響く名曲を、二人で。' },
  ], effects: ['mutual(GERU,HYU,1)', 'log(AMBIENT)'] }),
  A('DLG_KARA_QUARTET', ['LENNY', 'JIN', 'MUNI', 'HYU'], { cond: 'location == karaoke', weight: 26, lines: [
    { sp: 'JIN', text: '四人も集まったなら大合唱だ! みんなで肩組んで歌おうぜ!' },
    { sp: 'HYU', text: '肩を組むと衣装が皺に……まあ、今日は特別。声を合わせましょうか。' },
    { sp: 'MUNI', text: 'ムニもうたう! いちばんおおきいこえで!' },
    { sp: 'LENNY', text: 'みんなの声のなか、うとうとするの、最高だなあ……あ、ちゃんと歌うよ。ワンフレーズは。' },
  ], effects: ['mutual(HYU,JIN,1)', 'mutual(JIN,MUNI,1)', 'mutual(LENNY,MUNI,1)', 'log(AMBIENT)'] }),

  // ========================================================
  // 恋人どうしが施設に一緒にいるときの会話(rel == LOVER + location)
  // ========================================================
  A('DLG_LPAIR_CAFE', ['HYU', 'LENNY'], { cond: 'location == cafe and rel(HYU, LENNY) == LOVER', weight: 20, lines: [
    { sp: 'HYU', text: 'レニィ、恋人と飲む珈琲は、いつもより甘い気がしますね。……砂糖は入れていないのに。' },
    { sp: 'LENNY', text: 'えへへ……ヒュウとなら、苦いのも平気だよ。……あ、でも、やっぱり眠くなってきた。' },
  ], effects: ['mutual(HYU,LENNY,1)', 'log(AMBIENT)'] }),
  A('DLG_LPAIR_YAKI', ['JIN', 'NEO'], { cond: 'location == yakiniku and rel(JIN, NEO) == LOVER', weight: 20, lines: [
    { sp: 'JIN', text: 'ネオ! 恋人と食う焼肉が、世界一うまいんだ! ほら、一番いいカルビ、お前に焼いてやる!' },
    { sp: 'NEO', text: 'ふはは、かたじけない! ……貴様と分かち合う一皿、まさに宴である。この幸せ、故郷にも無かったぞ!' },
  ], effects: ['mutual(JIN,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_LPAIR_BOOK', ['GERU', 'NEO'], { cond: 'location == book and rel(GERU, NEO) == LOVER', weight: 20, lines: [
    { sp: 'GERU', text: 'ネオ、この棚の騎士物語、お前に読んでほしくてな。……恋人の薦める一冊は、格別だろう?' },
    { sp: 'NEO', text: '……貴様が選ぶ物語なら、一言一句、胸に刻もう。本屋で肩を並べる時間、これも我らの物語である。' },
  ], effects: ['mutual(GERU,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_LPAIR_CINEMA', ['HYU', 'JIN'], { cond: 'location == cinema and rel(HYU, JIN) == LOVER', weight: 20, lines: [
    { sp: 'JIN', text: 'ヒュウ、映画館デートだな! 暗いから……その、手、繋いでもバレねえよな?' },
    { sp: 'HYU', text: 'ふふ、大胆ですね。……いいでしょう。スクリーンの恋物語より、私たちの方がお似合いですよ。' },
  ], effects: ['mutual(HYU,JIN,1)', 'log(AMBIENT)'] }),
  A('DLG_LPAIR_AQUA', ['LENNY', 'NEO'], { cond: 'location == aquarium and rel(LENNY, NEO) == LOVER', weight: 20, lines: [
    { sp: 'LENNY', text: 'ネオ、青い光の中だと、ネオの金髪がきらきらして……綺麗だね。恋人の特権で、独り占め。' },
    { sp: 'NEO', text: 'ぬ……不意打ちである。……貴様といる水底は、我が故郷の星空より美しい。……惚れ直したぞ、レニィ。' },
  ], effects: ['mutual(LENNY,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_LPAIR_DONUT', ['GERU', 'HYU'], { cond: 'location == donut and rel(GERU, HYU) == LOVER', weight: 20, lines: [
    { sp: 'HYU', text: 'ゲル、恋人どうしで半分こ、なんていかがです? このドーナツの穴のように、二人でひとつ、ですね。' },
    { sp: 'GERU', text: '……うまいことを言う。まあ、いい。半分やる。……砂糖、口についてるぞ。ふ、拭いてやろう。' },
  ], effects: ['mutual(GERU,HYU,1)', 'log(AMBIENT)'] }),

  // ========================================================
  // 親しい友人(恋人ではない)が施設に一緒にいるときの会話
  //   cond: mutual >= 55 and rel != LOVER + location
  // ========================================================
  A('DLG_FPAIR_SENTO', ['JIN', 'NEO'], { cond: 'location == sento and mutual(JIN, NEO) >= 55 and rel(JIN, NEO) != LOVER', weight: 18, lines: [
    { sp: 'JIN', text: 'ネオ! 背中流してやるよ! 親友の特権だ、遠慮すんな!' },
    { sp: 'NEO', text: 'ふ、かたじけない。……では次は我が番だ。戦友の背中を流すのも、また一興である。' },
  ], effects: ['mutual(JIN,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_FPAIR_BOOK', ['GERU', 'HYU'], { cond: 'location == book and mutual(GERU, HYU) >= 55 and rel(GERU, HYU) != LOVER', weight: 18, lines: [
    { sp: 'HYU', text: 'ゲル、友人として一冊選んでくれませんか。恋の話ではなく、美しい文章が読みたい気分です。' },
    { sp: 'GERU', text: 'ならこれだ。……お前の美意識に、活字の美も加われば、少しは深みが出るだろう。友のよしみだ。' },
  ], effects: ['mutual(GERU,HYU,1)', 'log(AMBIENT)'] }),
  A('DLG_FPAIR_CAFE', ['JIN', 'LENNY'], { cond: 'location == cafe and mutual(JIN, LENNY) >= 55 and rel(JIN, LENNY) != LOVER', weight: 18, lines: [
    { sp: 'JIN', text: 'レニィ、たまには男二人で茶でもどうだ! ……って、お前もう寝てるし! 親友として、見守るか。' },
    { sp: 'LENNY', text: 'ん……ジンパチの声、あったかいから、つい……。友達っていいね。何もしなくても、隣にいられる。' },
  ], effects: ['mutual(JIN,LENNY,1)', 'log(AMBIENT)'] }),
  A('DLG_FPAIR_CINEMA', ['HYU', 'NEO'], { cond: 'location == cinema and mutual(HYU, NEO) >= 55 and rel(HYU, NEO) != LOVER', weight: 18, lines: [
    { sp: 'HYU', text: 'ネオさん、友として並んで映画を。……恋敵ではなく、美の同志として、名画を語りましょう。' },
    { sp: 'NEO', text: 'うむ! 貴様とは、恋には落ちぬが、良き映画仲間である。この暗闇での議論、心地よいぞ。' },
  ], effects: ['mutual(HYU,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_FPAIR_DONUT', ['GERU', 'MUNI'], { cond: 'location == donut and mutual(GERU, MUNI) >= 55 and rel(GERU, MUNI) != LOVER', weight: 18, lines: [
    { sp: 'MUNI', text: 'ゲルおねえちゃん、ドーナツはんぶんこ! なかよしだから!' },
    { sp: 'GERU', text: 'ふ、いいだろう。……お前と食べる甘いものは、なぜか本の味より記憶に残るな。不思議なものだ。' },
  ], effects: ['mutual(GERU,MUNI,1)', 'log(AMBIENT)'] }),

  // ========================================================
  // 各施設での主要人物ペア会話をさらに増量(通常)
  // ========================================================
  A('DLG_F_LEN_HYU_CINEMA', ['LENNY', 'HYU'], { cond: 'location == cinema', lines: [
    { sp: 'HYU', text: 'レニィ、また上映中に寝て。……いいでしょう、私の肩を貸してあげます。映画より絵になりますからね。' },
    { sp: 'LENNY', text: 'んん……ヒュウの肩、映画のクッションよりふかふかだよぉ……zzz' },
  ], effects: ['mutual(HYU,LENNY,1)', 'log(AMBIENT)'] }),
  A('DLG_F_JIN_MUN_DONUT', ['JIN', 'MUNI'], { cond: 'location == donut', lines: [
    { sp: 'MUNI', text: 'ジンパチおにいちゃん、ドーナツ! いっしょにたべよ!' },
    { sp: 'JIN', text: 'おう! 揚げ菓子は最高の補給だ! ……ムニ、砂糖ついてるぞ。ほら、拭いてやる。' },
    { sp: 'MUNI', text: 'えへへ、ジンパチおにいちゃん、やさしいの!' },
  ], effects: ['mutual(JIN,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_F_GER_NEO_CINEMA', ['GERU', 'NEO'], { cond: 'location == cinema', lines: [
    { sp: 'GERU', text: 'ネオ、この映画の騎士、少しお前に似ているな。……不器用で、誇り高くて。' },
    { sp: 'NEO', text: 'ぬ……そう見えるか。ならば、あの結末は他人事ではないな。……ゲル、続きは黙って観よう。' },
  ], effects: ['mutual(GERU,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_F_HYU_MUN_DONUT', ['HYU', 'MUNI'], { cond: 'location == donut', lines: [
    { sp: 'MUNI', text: 'ヒュウおにいちゃん、どのドーナツがいちばんきれい?' },
    { sp: 'HYU', text: 'ふむ、良い質問です。……この、いちばん丸くて艶のあるものですね。美は細部に宿るのですよ、ムニ。' },
  ], effects: ['mutual(HYU,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_F_NEO_LEN_CINEMA', ['NEO', 'LENNY'], { cond: 'location == cinema', lines: [
    { sp: 'NEO', text: 'レニィ、この大画面の海の映像を見よ。……貴様の夢見る本物の海も、いつかきっと。' },
    { sp: 'LENNY', text: 'わあ……ほんとだ、海だ。ネオ、ありがとう。……いつか、みんなで本物、見にいきたいなあ。' },
  ], effects: ['mutual(LENNY,NEO,1)', 'log(AMBIENT)'] }),
  A('DLG_F_GER_MUN_DONUT', ['GERU', 'MUNI'], { cond: 'location == donut', lines: [
    { sp: 'MUNI', text: 'ゲルおねえちゃんも、ドーナツすき?' },
    { sp: 'GERU', text: '……本を読みながらつまむには、ちょうどいい。だが、お前ほど夢中にはなれんな。ふ、羨ましいくらいだ。' },
  ], effects: ['mutual(GERU,MUNI,1)', 'log(AMBIENT)'] }),
  A('DLG_F_JIN_HYU_CINEMA', ['JIN', 'HYU'], { cond: 'location == cinema', lines: [
    { sp: 'JIN', text: 'ヒュウ! このアクション観たか! 今の跳び蹴り、真似できるか俺!' },
    { sp: 'HYU', text: '……あなたは映画の主役より声が大きい。静かに。ですが、その熱、嫌いではありませんよ。' },
  ], effects: ['mutual(HYU,JIN,1)', 'log(AMBIENT)'] }),
];
