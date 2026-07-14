// ============================================================
// NPCスケジュールエンジン (設計書a 第7章 層1 / NPC会話設計書 第9章)
// 各NPCの現在地(loc)と行動(activity)をゲーム時刻から決定論的に解決する。
// 施設が未建設・閉店中はフォールバック → HOME。
// exceptions は条件DSLで上書き。
// ============================================================
import { compileCond } from '../core/dsl.js';
import { SCHEDULES, MACROS } from '../data/schedules.js';
import { FACILITIES, isFacilityOpen } from '../data/facilities.js';
import { deriveRng, pickR } from '../core/rng.js';
import { MAIN_IDS, PAIRS, pairKey } from '../data/chars.js';

const EVENT_GATHER_BANDS = ['DAY', 'EVENING'];

const compiledEx = {};
for (const [charId, sch] of Object.entries(SCHEDULES)) {
  compiledEx[charId] = (sch.exceptions ?? []).map(ex => ({ ...ex, _cond: compileCond(ex.cond, MACROS) }));
}

export class ScheduleEngine {
  constructor(world, game) {
    this.world = world;
    this.game = game;
    this.states = {};    // charId → { loc, activity }
  }

  // loc候補 → 実在ロケーションに解決
  resolveLoc(charId, locSpec, block) {
    const { world, game } = this;
    let candidates = Array.isArray(locSpec) ? locSpec : [locSpec];
    // 日次シードで並びを決定論的に抽選 (第9.3節の個体オフセットと同思想)
    const rng = deriveRng(game.worldSeed, 'sched', charId, world.clock.day, block?.[0] ?? 0);
    candidates = [...candidates].sort(() => rng() - 0.5);
    for (const c of candidates) {
      if (c === 'HOME') return `HOME_${charId}`;
      if (c === 'FOLLOW') {
        const lennyLoc = this.states.LENNY?.loc;
        return lennyLoc ?? 'HOME_MUNI';
      }
      if (c === 'ROOF' || c === 'GROUND') return c;
      // 施設: 建っていて営業中(±60分の余裕)なら採用
      const fdef = FACILITIES[c];
      if (fdef && game.isBuilt(c) && isFacilityOpen(fdef, world.clock.minute)) return c;
    }
    // 全滅 → 自宅 (主要NPCは職場)
    const home = this.homeOf(charId);
    return home;
  }

  homeOf(charId) {
    const facHome = { BARBER: 'barber', POSTMAN: 'post', CAFEGIRL: 'cafe', DAGASHIYA: 'dagashi', THIEF: 'konbini', CLERK: 'konbini' }[charId];
    if (facHome) return facHome;
    if (charId === 'KANE') return 'GROUND';
    return `HOME_${charId}`;
  }

  // 全NPCの現在地を更新 (ゲーム内10分ごと想定)
  update() {
    const minute = this.world.clock.minute;
    const ctx = this.world.dslCtx(this.game);
    for (const [charId, sch] of Object.entries(SCHEDULES)) {
      const block = sch.blocks.find(([a, b]) => minute >= a && minute < b) ?? sch.blocks[0];
      let activity = block[2];
      let locSpec = block[3];
      // 例外の適用 (上から優先)
      for (const ex of compiledEx[charId]) {
        if (ex.onlyBands && !ex.onlyBands.includes(this.world.clock.band)) continue;
        let ok = false;
        try { ok = ex._cond.eval(ctx); } catch { }
        if (ok) { locSpec = ex.loc; activity = ex.act ?? activity; break; }
      }
      const loc = this.resolveLoc(charId, locSpec, block);
      this.states[charId] = { loc, activity };
    }

    // --- 季節イベント: 集会所にみんなで集まる(カネは仲良ければ) ---
    const ev = this.game.currentEvent?.();
    if (ev && this.game.isBuilt('hall') && EVENT_GATHER_BANDS.includes(this.world.clock.band)) {
      for (const id of MAIN_IDS) this.states[id] = { loc: 'hall', activity: 'GATHER' };
      if (this.world.kaneSoftness >= 40) this.states.KANE = { loc: 'hall', activity: 'GATHER' };
    } else {
      // --- 親密度が高いと相互訪問/一緒に出かける(第12.5節) ---
      this.socialize();
    }
    return this.states;
  }

  // 恋人・親しい間柄は、同じ施設へ一緒に行ったり、互いの部屋に遊びに来る
  socialize() {
    const day = this.world.clock.day, band = this.world.clock.band;
    // 恋人同士(NPCカップル)は強く引き合う
    for (const key of this.world.npcCouples) {
      const [a, b] = key.split('-');
      this.coLocate(a, b, day, band, 0.75, true);
    }
    // 相互親密度が高いペアは、たまに一緒に行動 / 部屋に遊びに来る
    for (const p of PAIRS) {
      const mu = this.world.affNN[pairKey(p.a, p.b)] ?? 0;
      if (mu >= 50) this.coLocate(p.a, p.b, day, band, 0.45, false);
    }
  }

  coLocate(a, b, day, band, prob, isCouple) {
    const sa = this.states[a], sb = this.states[b];
    if (!sa || !sb) return;
    const busy = s => s.activity === 'SLEEP' || s.activity === 'WORK' || s.activity === 'GATHER' || s.activity === 'VISIT';
    if (busy(sa) || busy(sb)) return;
    const rng = deriveRng(this.game.worldSeed, 'social', a, b, day, band);
    if (rng() > prob) return;
    const bothMain = MAIN_IDS.includes(a) && MAIN_IDS.includes(b);
    // 部屋に遊びに来る(両者主要人物のときのみ・自宅ベースなら)
    if (bothMain && rng() < (isCouple ? 0.45 : 0.55) && (sa.loc.startsWith('HOME_') || sb.loc.startsWith('HOME_'))) {
      const host = sa.loc.startsWith('HOME_') ? a : b;
      const guest = host === a ? b : a;
      this.states[guest] = { loc: `HOME_${host}`, activity: 'VISIT' };
      return;
    }
    // 一緒の施設へ(施設/屋上/路地にいる方に合わせる)
    const aFac = !sa.loc.startsWith('HOME_'), bFac = !sb.loc.startsWith('HOME_');
    if (aFac) this.states[b] = { loc: sa.loc, activity: sb.activity };
    else if (bFac) this.states[a] = { loc: sb.loc, activity: sa.activity };
  }

  locationOf(charId) { return this.states[charId]?.loc ?? this.homeOf(charId); }
  activityOf(charId) { return this.states[charId]?.activity ?? 'NONE'; }
}
