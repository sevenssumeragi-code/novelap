// ============================================================
// DialogueDirector / AmbientDirector (NPC会話設計書 第1章・第4章・第12章)
// - 全ノードはロード時に条件DSLコンパイル (実行時パース禁止)
// - プールスタック: EVENT(85) > FAC(65) > STATE(45) > COND(30) > GENERIC(10)
// - スコア = weight × (1 + 0.25 × 条件項数) → 特異性ボーナス (第4.2節)
// ============================================================
import { compileCond } from '../core/dsl.js';
import { MACROS } from '../data/schedules.js';
import { DLG_LENNY } from '../data/dlg_lenny.js';
import { DLG_HYU } from '../data/dlg_hyu.js';
import { DLG_JIN } from '../data/dlg_jin.js';
import { DLG_MUNI } from '../data/dlg_muni.js';
import { DLG_GERU } from '../data/dlg_geru.js';
import { DLG_NEO } from '../data/dlg_neo.js';
import { DLG_NPC } from '../data/dlg_npc.js';
import { DLG_AMBIENT } from '../data/dlg_ambient.js';
import { pairKey } from '../data/chars.js';

export const POOL_PRIORITY = { EVENT: 85, FAC: 65, STATE: 45, COND: 30, GENERIC: 10, BARK: 5, AMBIENT: 30 };
const DEFAULT_COOLDOWN = 120;   // ゲーム分 (第1.4節: cooldown_talk 既定2時間)

export const ALL_DIALOGUES = [
  ...DLG_LENNY, ...DLG_HYU, ...DLG_JIN, ...DLG_MUNI, ...DLG_GERU, ...DLG_NEO,
  ...DLG_NPC, ...DLG_AMBIENT,
];

// ロード時コンパイル
const compiled = new Map();
for (const node of ALL_DIALOGUES) {
  if (compiled.has(node.id)) throw new Error(`会話ID重複: ${node.id}`);
  compiled.set(node.id, { ...node, _cond: compileCond(node.cond, MACROS) });
}

export function getNode(id) { return compiled.get(id); }

export class DialogueDirector {
  constructor(world) {
    this.world = world;
    this.byOwner = new Map();
    for (const node of compiled.values()) {
      if (!this.byOwner.has(node.owner)) this.byOwner.set(node.owner, []);
      this.byOwner.get(node.owner).push(node);
    }
  }

  // 話しかけ: 最上位プールから候補を選ぶ (第4.2節のアルゴリズム)
  pickTalk(charId, game) {
    const nodes = (this.byOwner.get(charId) ?? []).filter(n => n.type === 'TALK' || n.type === 'EVENT');
    return this._select(nodes, game);
  }

  pickBark(charId, game) {
    const nodes = (this.byOwner.get(charId) ?? []).filter(n => n.type === 'BARK');
    return this._select(nodes, game, { ignoreCooldownDefault: 30 });
  }

  pickAmbient(a, b, game) {
    const nodes = this.byOwner.get(pairKey(a, b)) ?? [];
    return this._select(nodes, game, { ignoreCooldownDefault: 360 });
  }

  _select(nodes, game, opts = {}) {
    const ctx = this.world.dslCtx(game);
    const w = this.world;
    const candidates = [];
    for (const n of nodes) {
      if (n.once && w.dialogueSeen.has(n.id)) continue;
      if ((w.cooldowns[n.id] ?? 0) > w.absMinute) continue;
      let ok = false;
      try { ok = n._cond.eval(ctx); } catch (e) { console.warn(`条件評価エラー ${n.id}:`, e.message); }
      if (!ok) continue;
      candidates.push(n);
    }
    if (!candidates.length) return null;
    // 最上位プールのみ採用
    const topPri = Math.max(...candidates.map(n => n.priority ?? POOL_PRIORITY[n.pool] ?? 10));
    const top = candidates.filter(n => (n.priority ?? POOL_PRIORITY[n.pool] ?? 10) === topPri);
    // 特異性ボーナス付き重み抽選
    const score = n => (n.weight ?? 10) * (1 + 0.25 * n._cond.terms);
    const total = top.reduce((a, n) => a + score(n), 0);
    let r = Math.random() * total;
    for (const n of top) { r -= score(n); if (r <= 0) return this._commit(n, opts); }
    return this._commit(top[top.length - 1], opts);
  }

  _commit(node, opts) {
    const w = this.world;
    w.dialogueSeen.add(node.id);
    const cd = node.cooldown ?? opts.ignoreCooldownDefault ?? DEFAULT_COOLDOWN;
    w.cooldowns[node.id] = w.absMinute + cd;
    return node;
  }

  // 再生完了時の事後処理 (第1.2節⑤)
  applyEffects(node, game, extraEffects = []) {
    const w = this.world;
    for (const e of [...(node.effects ?? []), ...extraEffects]) w.applyEffect(e, game);
    const logCat = (node.effects ?? []).find(e => e.startsWith('log('))?.match(/log\((\w+)\)/)?.[1];
    w.addLog({
      dlgId: node.id,
      category: logCat ?? (node.type === 'AMBIENT' ? 'AMBIENT' : 'TALK'),
      lines: node.lines.map(l => ({ sp: l.sp, text: l.text })),
    });
  }
}

// ------------------------------------------------------------
// AmbientDirector (第12.1節): 同ロケーションの定義済みペアを検出して雑談発火
// ------------------------------------------------------------
export class AmbientDirector {
  constructor(world, director) {
    this.world = world;
    this.director = director;
    this.active = null;       // { node, a, b, loc, lineIdx, timer }
    this.cooldownUntil = 0;
  }

  // ゲーム内10分ごとに呼ぶ
  scan(npcs, game) {
    if (this.active) return;
    if (this.world.absMinute < this.cooldownUntil) return;
    const byLoc = {};
    for (const [id, st] of Object.entries(npcs)) {
      if (st.activity === 'SLEEP') continue;
      (byLoc[st.loc] ??= []).push(id);
    }
    const pairsFound = [];
    for (const [loc, ids] of Object.entries(byLoc)) {
      for (let i = 0; i < ids.length; i++)
        for (let j = i + 1; j < ids.length; j++)
          pairsFound.push({ a: ids[i], b: ids[j], loc });
    }
    for (const p of pairsFound.sort(() => Math.random() - 0.5)) {
      const node = this.director.pickAmbient(p.a, p.b, game);
      if (node) {
        this.active = { node, a: p.a, b: p.b, loc: p.loc, lineIdx: 0, timer: 0, heard: false };
        return this.active;
      }
    }
    return null;
  }

  // 実時間tick: 進行。プレイヤーが見ていたら盗み聞き扱い。
  tick(dtSec, playerLoc, game) {
    if (!this.active) return null;
    const a = this.active;
    a.timer += dtSec;
    const watching = playerLoc === a.loc;
    if (watching) a.heard = true;
    let update = null;
    if (a.timer >= 3.6) {          // 1行 ≒ 3.6秒
      a.timer = 0;
      a.lineIdx++;
      if (a.lineIdx >= a.node.lines.length) {
        // 完了: 最後まで可聴域にいたら効果獲得 (第12.1節)
        if (a.heard && watching) {
          this.director.applyEffects(a.node, game);
          this.world.pendingToasts.push('👂 立ち話を聞いた (ログに記録)');
        }
        this.cooldownUntil = this.world.absMinute + 60;
        this.active = null;
        return { done: true };
      }
      update = { line: a.node.lines[a.lineIdx] };
    }
    return update;
  }
}
