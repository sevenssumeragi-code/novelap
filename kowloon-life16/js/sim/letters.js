// ============================================================
// LetterService (NPC会話設計書 第7章)
// 日次バッチ(日付変更時)で trigger を条件DSL評価 → スロット組立 → 配達。
// 手紙は「当時のスロット選択」ごと保存され、いつでも同じ文面で再読できる。
// ============================================================
import { compileCond } from '../core/dsl.js';
import { MACROS } from '../data/schedules.js';
import { LETTERS } from '../data/letters.js';

const compiledLetters = LETTERS.map(t => ({
  ...t,
  _trigger: compileCond(t.trigger, MACROS),
  _slots: Object.fromEntries(
    Object.entries(t.slots).map(([slot, variants]) => [
      slot,
      variants.map(v => ({ ...v, _cond: compileCond(v.cond, MACROS) })),
    ])
  ),
}));

export class LetterService {
  constructor(world, save = null) {
    this.world = world;
    this.inbox = save?.inbox ?? [];                 // {ltr, sender, day, season, texts[], read, replied, coin}
    this.sentOnce = new Set(save?.sentOnce ?? []);  // onceFlag 済み
    this.sentSeason = { ...(save?.sentSeason ?? {}) }; // ltrId → 最終送信シーズンキー
  }

  get unreadCount() { return this.inbox.filter(l => !l.read).length; }

  // 日付変更時に呼ぶ (第7.1節: 日次バッチ)
  dailyBatch(game) {
    const ctx = this.world.dslCtx(game);
    const delivered = [];
    for (const t of compiledLetters) {
      if (t.onceFlag && this.sentOnce.has(t.id)) continue;
      const seasonKey = `${this.world.clock.season}_${Math.floor((this.world.clock.day - 1) / 32)}`;
      if (t.oncePerSeason && this.sentSeason[t.id] === seasonKey) continue;
      let ok = false;
      try { ok = t._trigger.eval(ctx); } catch (e) { console.warn(`手紙trigger評価エラー ${t.id}:`, e.message); }
      if (!ok) continue;
      // 1日1通まで (ペーシング)
      if (delivered.length >= 1) continue;

      // スロット組立 (第7.3節): 各スロットで条件成立する最初のバリアント
      const texts = [];
      for (const [slot, variants] of Object.entries(t._slots)) {
        for (const v of variants) {
          let vok = false;
          try { vok = v._cond.eval(ctx); } catch { }
          if (vok) { texts.push({ slot, text: v.text }); break; }
        }
      }
      const coin = t.attachCoin ?? 0;
      this.inbox.push({
        ltr: t.id, sender: t.sender, day: this.world.clock.day,
        season: this.world.clock.season, texts, read: false, replied: false, coin,
      });
      if (t.onceFlag) this.sentOnce.add(t.id);
      if (t.oncePerSeason) this.sentSeason[t.id] = seasonKey;
      delivered.push(t.id);
    }
    return delivered;
  }

  template(ltrId) { return compiledLetters.find(t => t.id === ltrId); }

  // 開封: 添付コイン獲得 + effects
  open(letter, game) {
    if (letter.read) return;
    letter.read = true;
    const t = this.template(letter.ltr);
    if (letter.coin) game.addCoins(letter.coin);
    for (const e of t?.effects ?? []) this.world.applyEffect(e, game);
  }

  // 返信 (第7.5節: 3択スタンプ)。次の手紙の last_reply 条件になる。
  reply(letter, replyKey, game) {
    if (letter.replied) return;
    letter.replied = true;
    letter.replyKey = replyKey;
    this.world.lastReply[letter.sender] = replyKey;
    this.world.addAffPC(letter.sender, 2, { capped: false });   // 手紙返信+2 (第6.1節)
  }

  serialize() {
    return { inbox: this.inbox, sentOnce: [...this.sentOnce], sentSeason: this.sentSeason };
  }
}
