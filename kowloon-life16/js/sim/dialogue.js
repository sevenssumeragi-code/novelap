// ============================================================
// DialogueDirector / AmbientDirector (NPC会話設計書 第1章・第4章・第12章)
// - 全ノードはロード時に条件DSLコンパイル (実行時パース禁止)
// - プールスタック: EVENT(85) > FAC(65) > STATE(45) > COND(30) > GENERIC(10)
// - スコア = weight × (1 + 0.25 × 条件項数) → 特異性ボーナス (第4.2節)
// v2:
//   ・AMBIENT を cast方式に刷新 (2人=雑談 / 3人=グループ会話)
//   ・雑談を出やすく (クールダウン短縮 + フォーカス時に即スキャン)
//   ・施設専用会話 (facility_talk) と追加会話 (extra/furniture/cafegirl) を合流
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
import { DLG_CAFEGIRL } from '../data/dlg_cafegirl.js';
import { DLG_EXTRA } from '../data/dlg_extra.js';
import { DLG_FURNITURE } from '../data/dlg_furniture.js';
import { DLG_V3 } from '../data/dlg_v3.js';
import { DLG_V4 } from '../data/dlg_v4.js';
import { DLG_V5 } from '../data/dlg_v5.js';
import { DLG_V6 } from '../data/dlg_v6.js';
import { DLG_V7 } from '../data/dlg_v7.js';
import { DLG_V8 } from '../data/dlg_v8.js';
import { DLG_V9 } from '../data/dlg_v9.js';
import { DLG_V10 } from '../data/dlg_v10.js';
import { DLG_V11 } from '../data/dlg_v11.js';
import { DLG_V12 } from '../data/dlg_v12.js';
import { DLG_V13 } from '../data/dlg_v13.js';
import { DLG_V14 } from '../data/dlg_v14.js';
import { DLG_V15 } from '../data/dlg_v15.js';
import { DLG_V16 } from '../data/dlg_v16.js';
import { buildFacilityNodes } from '../data/facility_talk.js';

export const POOL_PRIORITY = { EVENT: 85, FAC: 65, STATE: 45, COND: 30, GENERIC: 10, BARK: 5, AMBIENT: 30 };
const DEFAULT_COOLDOWN = 120;      // ゲーム分 (第1.4節: cooldown_talk 既定2時間)
const AMBIENT_NODE_COOLDOWN = 150; // 同じ雑談ノードの再選択禁止(短縮)
const AMBIENT_POST_COOLDOWN = 20;  // 雑談完了後の全体クールダウン(短縮)

// TALK/EVENT/BARK/施設/家具/追加 は byOwner(=charId) で索引
const TALK_DIALOGUES = [
  ...DLG_LENNY, ...DLG_HYU, ...DLG_JIN, ...DLG_MUNI, ...DLG_GERU, ...DLG_NEO,
  ...DLG_NPC, ...DLG_CAFEGIRL, ...DLG_EXTRA, ...DLG_FURNITURE, ...buildFacilityNodes(),
];
// DLG_V3〜V7 は TALK/EVENT/BARK と AMBIENT が混在。type で自動振り分けされる。
export const ALL_DIALOGUES = [...TALK_DIALOGUES, ...DLG_AMBIENT, ...DLG_V3, ...DLG_V4, ...DLG_V5, ...DLG_V6, ...DLG_V7, ...DLG_V8, ...DLG_V9, ...DLG_V10, ...DLG_V11, ...DLG_V12, ...DLG_V13, ...DLG_V14, ...DLG_V15, ...DLG_V16];

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
    this.byOwner = new Map();     // charId → TALK/EVENT/BARK/FAC nodes
    this.ambient = [];            // cast方式の雑談ノード
    for (const node of compiled.values()) {
      if (node.type === 'AMBIENT') { this.ambient.push(node); continue; }
      if (!this.byOwner.has(node.owner)) this.byOwner.set(node.owner, []);
      this.byOwner.get(node.owner).push(node);
    }
  }

  pickTalk(charId, game) {
    const nodes = (this.byOwner.get(charId) ?? []).filter(n => n.type === 'TALK' || n.type === 'EVENT');
    return this._select(nodes, game);
  }

  pickBark(charId, game) {
    const nodes = (this.byOwner.get(charId) ?? []).filter(n => n.type === 'BARK');
    return this._select(nodes, game, { ignoreCooldownDefault: 30 });
  }

  // cast(登場人物集合) が present に全員含まれる雑談を、指定locで探す
  pickAmbientForGroup(present, loc, game) {
    const ctx = this.world.dslCtx(game, { location: loc });
    const w = this.world;
    const cand = [];
    for (const n of this.ambient) {
      if (!n.cast.every(id => present.includes(id))) continue;
      if ((w.cooldowns[n.id] ?? 0) > w.absMinute) continue;
      let ok = false;
      try { ok = n._cond.eval(ctx); } catch (e) { console.warn(`雑談条件エラー ${n.id}:`, e.message); }
      if (!ok) continue;
      cand.push(n);
    }
    if (!cand.length) return null;
    // 人数が多いグループ会話を優先 (銭湯の3人組など)
    const maxCast = Math.max(...cand.map(n => n.cast.length));
    const top = cand.filter(n => n.cast.length === maxCast);
    const score = n => (n.weight ?? 10) * (1 + 0.25 * n._cond.terms);
    const total = top.reduce((a, n) => a + score(n), 0);
    let r = Math.random() * total;
    let chosen = top[top.length - 1];
    for (const n of top) { r -= score(n); if (r <= 0) { chosen = n; break; } }
    w.cooldowns[chosen.id] = w.absMinute + AMBIENT_NODE_COOLDOWN;
    return chosen;
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
    const topPri = Math.max(...candidates.map(n => n.priority ?? POOL_PRIORITY[n.pool] ?? 10));
    const top = candidates.filter(n => (n.priority ?? POOL_PRIORITY[n.pool] ?? 10) === topPri);
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
// AmbientDirector (第12.1節): 同ロケーションのNPC群からグループ雑談を発火
// ------------------------------------------------------------
export class AmbientDirector {
  constructor(world, director) {
    this.world = world;
    this.director = director;
    this.active = null;       // { node, cast, loc, lineIdx, timer, heard }
    this.cooldownUntil = 0;
  }

  // npcs: { id: { loc, activity } }。preferLoc を渡すとその場所を最優先で探す。
  scan(npcs, game, preferLoc = null) {
    if (this.active) return null;
    if (this.world.absMinute < this.cooldownUntil) return null;
    const byLoc = {};
    for (const [id, st] of Object.entries(npcs)) {
      if (st.activity === 'SLEEP') continue;
      (byLoc[st.loc] ??= []).push(id);
    }
    // プレイヤーが見ている場所を最優先で試す
    const locs = Object.keys(byLoc).filter(l => byLoc[l].length >= 2);
    if (preferLoc && byLoc[preferLoc]?.length >= 2) {
      locs.splice(locs.indexOf(preferLoc), 1);
      locs.unshift(preferLoc);
    } else {
      locs.sort(() => Math.random() - 0.5);
    }
    for (const loc of locs) {
      const node = this.director.pickAmbientForGroup(byLoc[loc], loc, game);
      if (node) {
        this.active = { node, cast: node.cast, loc, lineIdx: 0, timer: 0, heard: false };
        return this.active;
      }
    }
    return null;
  }

  tick(dtSec, playerLoc, game) {
    if (!this.active) return null;
    const a = this.active;
    a.timer += dtSec;
    const watching = playerLoc === a.loc;
    if (watching) a.heard = true;
    let update = null;
    if (a.timer >= 3.6) {
      a.timer = 0;
      a.lineIdx++;
      if (a.lineIdx >= a.node.lines.length) {
        if (a.heard && watching) {
          this.director.applyEffects(a.node, game);
          this.world.pendingToasts.push('👂 立ち話を聞いた (ログに記録)');
        }
        this.cooldownUntil = this.world.absMinute + AMBIENT_POST_COOLDOWN;
        this.active = null;
        return { done: true };
      }
      update = { line: a.node.lines[a.lineIdx] };
    }
    return update;
  }
}
