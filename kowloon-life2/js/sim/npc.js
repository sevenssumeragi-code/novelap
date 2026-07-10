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
    const facHome = { BARBER: 'barber', POSTMAN: 'post', CAFEGIRL: 'cafe' }[charId];
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
    return this.states;
  }

  locationOf(charId) { return this.states[charId]?.loc ?? this.homeOf(charId); }
  activityOf(charId) { return this.states[charId]?.activity ?? 'NONE'; }
}
