// ============================================================
// WorldContext (NPC会話設計書 第1.1節の世界状態層)
// フラグ / INFO / 親密度 / 相互親密度 / 噂 / カウンタ / クールダウン
// 条件DSLのコンテキスト(vars/fns)もここが提供する。
// ============================================================
import { CHARS, MAIN_IDS, RANKS, rankOf, PAIRS, pairKey, DAILY_AFF_CAP, ROMANCEABLE, GAY_TRIO } from '../data/chars.js';
import { FLAGS, INFOS, RUMORS } from '../data/registry.js';
import { FURNITURE } from '../data/furniture.js';

export class World {
  constructor(clock, save = null) {
    this.clock = clock;
    this.flags = new Set(save?.flags ?? []);
    this.infos = new Set(save?.infos ?? []);
    this.rumorsHeard = new Set(save?.rumorsHeard ?? []);
    this.affPC = { ...(save?.affPC ?? {}) };            // 対PC親密度
    this.affNN = { ...(save?.affNN ?? {}) };            // 相互親密度(定義済みペア)
    this.dialogueSeen = new Set(save?.dialogueSeen ?? []);
    this.cooldowns = { ...(save?.cooldowns ?? {}) };    // dlgId → 解禁時刻(絶対ゲーム分)
    this.dailyAffGain = { ...(save?.dailyAffGain ?? {}) };
    this.lastReply = { ...(save?.lastReply ?? {}) };    // charId → スタンプキー
    this.counters = { ...(save?.counters ?? {}) };
    this.log = save?.log ?? [];                          // 会話ログ(最大200)
    this.pendingToasts = [];
    // ---- 恋人システム ----
    this.lover = save?.lover ?? null;                    // プレイヤーの恋人(主要人物id or null)
    this.npcCouples = save?.npcCouples ?? [];            // NPC同士の恋人ペア(pairKey配列)
    // ---- 喧嘩システム: pairKey → 喧嘩を始めた日 ----
    this.quarrels = { ...(save?.quarrels ?? {}) };

    for (const id of Object.keys(CHARS)) {
      if (!(id in this.affPC)) this.affPC[id] = 0;
    }
    for (const p of PAIRS) {
      const k = pairKey(p.a, p.b);
      if (!(k in this.affNN)) this.affNN[k] = p.init;
    }
    // 日次リセット
    clock.on('day', () => { this.dailyAffGain = {}; });
  }

  // ---------- 絶対ゲーム分 ----------
  get absMinute() { return (this.clock.day - 1) * 1440 + this.clock.minute; }

  // ---------- 親密度 ----------
  aff(a, b) {
    if (a === 'PC') return this.affPC[b] ?? 0;
    if (b === 'PC') return this.affPC[a] ?? 0;
    return this.affNN[pairKey(a, b)] ?? 20;   // 未定義ペアは既定値20固定
  }
  rank(a, b) { return rankOf(this.aff(a, b)); }

  addAffPC(charId, base, { capped = true } = {}) {
    const def = CHARS[charId];
    if (!def) return 0;
    let amount = base * (def.growthRate ?? 1);
    if (capped && base > 0) {
      const used = this.dailyAffGain[charId] ?? 0;
      const room = Math.max(0, DAILY_AFF_CAP - used);
      amount = Math.min(amount, room);
      this.dailyAffGain[charId] = used + amount;
    }
    const before = this.affPC[charId] ?? 0;
    const beforeRank = rankOf(before);
    this.affPC[charId] = Math.max(0, Math.min(100, before + amount));
    const afterRank = rankOf(this.affPC[charId]);
    if (afterRank > beforeRank) {
      this.pendingToasts.push(`💞 ${def.name} と「${RANKS[afterRank].label}」になった!`);
    }
    return amount;
  }

  addAffNN(a, b, amount) {
    const k = pairKey(a, b);
    const pair = PAIRS.find(p => pairKey(p.a, p.b) === k);
    if (!pair) return;   // 定義済みペアのみ変動 (第6.4節)
    this.affNN[k] = Math.max(0, Math.min(100, (this.affNN[k] ?? pair.init) + amount * (pair.growth ?? 1)));
  }

  // kane_softness = 主要6人の対PC親密度平均 (第17.1節を6人平均に調整)
  get kaneSoftness() {
    const total = MAIN_IDS.reduce((a, id) => a + (this.affPC[id] ?? 0), 0);
    return Math.max(0, Math.min(100, total / MAIN_IDS.length));
  }

  // ---------- 恋人・関係 (NPC会話設計書 第12.5節・第16章) ----------
  // rel(A,B): NONE / LOVER / FAMILY
  rel(a, b) {
    if (a === 'PC' || b === 'PC') {
      const m = a === 'PC' ? b : a;
      if (this.lover === m) return 'LOVER';
      if (m === 'MUNI' && (this.affPC.MUNI ?? 0) >= 90) return 'FAMILY';
      return 'NONE';
    }
    return this.npcCouples.includes(pairKey(a, b)) ? 'LOVER' : 'NONE';
  }

  npcInCouple(id) { return this.npcCouples.some(k => k.split('-').includes(id)); }

  // プレイヤーが m を恋人にできるか
  canBeLover(m) {
    if (!ROMANCEABLE.includes(m)) return false;   // ムニは対象外(家族)
    if (this.lover) return false;                 // 恋人は1人だけ
    if (this.npcInCouple(m)) return false;        // 既にNPC同士のカップル → 不可
    return true;
  }

  setLover(m) {
    if (!this.canBeLover(m)) return false;
    this.lover = m;
    this.pendingToasts.push(`💗 ${CHARS[m].name} と恋人になった!`);
    return true;
  }

  // NPC同士のカップル成立を試みる(日次)。制約:
  //  ・ゲイカップルは GAY_TRIO(レニィ/ヒュウ/ジンパチ)内のペアのみ
  //  ・ゲルは ROMANCEABLE(ムニ以外)と可
  //  ・当人が既にカップル or プレイヤーの恋人なら不可
  //  ・相互親密度 >= 85
  tryFormNpcCouples() {
    const cand = [];
    for (let i = 0; i < GAY_TRIO.length; i++)
      for (let j = i + 1; j < GAY_TRIO.length; j++)
        cand.push([GAY_TRIO[i], GAY_TRIO[j]]);
    for (const m of ['LENNY', 'HYU', 'JIN', 'NEO'])
      cand.push(['GERU', m]);
    for (const [a, b] of cand) {
      const k = pairKey(a, b);
      if (this.npcCouples.includes(k)) continue;
      if (this.npcInCouple(a) || this.npcInCouple(b)) continue;
      if (this.lover === a || this.lover === b) continue;   // プレイヤーの恋人は不可
      if ((this.affNN[k] ?? 0) >= 85) {
        this.npcCouples.push(k);
        this.pendingToasts.push(`💞 ${CHARS[a].name} と ${CHARS[b].name} が恋人同士になったらしい…`);
        return k;   // 1日1組まで
      }
    }
    return null;
  }

  // ---------- 好みタグ一致スコア (第6.6節) ----------
  tasteScore(charId, homes) {
    const def = CHARS[charId];
    if (!def || !homes?.[charId]) return 0;
    let score = 0;
    for (const rec of homes[charId]) {
      const f = FURNITURE[rec.item];
      if (!f) continue;
      for (const tag of f.tasteTags ?? []) {
        if (def.tasteTags.includes(tag)) score++;
      }
    }
    return score;
  }

  // ---------- ログ ----------
  addLog(entry) {
    this.log.push({ ...entry, day: this.clock.day, minute: this.clock.minute });
    if (this.log.length > 200) this.log.shift();
  }

  // ---------- DSLコンテキスト ----------
  // override.location: 雑談評価時に cast のいる場所で上書きする
  dslCtx(game, override = {}) {
    const world = this;
    return {
      vars: {
        time: this.clock.band,
        weather: this.clock.weather,
        season: this.clock.season,
        day: this.clock.day,
        hour: this.clock.hour,
        story: 0,
        kane_softness: this.kaneSoftness,
        location: override.location ?? game?.currentLocation?.() ?? 'NONE',
      },
      fns: {
        aff: (a, b) => world.aff(a, b),
        rank: (a, b) => world.rank(a, b),
        mutual: (a, b) => world.aff(a, b),
        flag: (f) => world.flags.has(f),
        info: (i) => world.infos.has(i),
        heard_rumor: (r) => world.rumorsHeard.has(r),
        random: (p) => Math.random() < p,
        built: (fac) => game?.isBuilt?.(fac) ?? false,
        taste_score: (c) => world.tasteScore(c, game?.state?.homes),
        activity: (c) => game?.npcActivity?.(c) ?? 'NONE',
        npc_at: (c) => game?.npcLocation?.(c) ?? 'NONE',
        last_reply: (c) => world.lastReply[c] ?? 'NONE',
        count: (c) => world.counters[c] ?? 0,
        has_furniture: (c, item) => (game?.state?.homes?.[c] ?? []).some(r => r.item === item),
        rel: (a, b) => world.rel(a, b),
        can_be_lover: (m) => world.canBeLover(m),
        event_active: (id) => game?.eventActive?.(id) ?? false,
        quarreling: (a, b) => (pairKey(a, b) in world.quarrels),
        quarrel_days: (a, b) => {
          const d = world.quarrels[pairKey(a, b)];
          return d == null ? 0 : world.clock.day - d;
        },
      },
    };
  }

  // ---------- 効果適用 (会話effects: 'aff(LENNY,2)' 等の文字列) ----------
  applyEffect(effect, game) {
    const m = effect.match(/^(\w+)\(([^)]*)\)$/);
    if (!m) return;
    const [, fn, argStr] = m;
    const args = argStr.split(',').map(s => s.trim()).filter(Boolean);
    switch (fn) {
      case 'aff': this.addAffPC(args[0], parseFloat(args[1])); break;
      case 'mutual': this.addAffNN(args[0], args[1], parseFloat(args[2])); break;
      case 'flag':
        if (!(args[0] in FLAGS)) console.warn(`未登録フラグ: ${args[0]}`);
        this.flags.add(args[0]);
        break;
      case 'info':
        if (!(args[0] in INFOS)) console.warn(`未登録INFO: ${args[0]}`);
        if (!this.infos.has(args[0])) {
          this.infos.add(args[0]);
          this.pendingToasts.push(`📖 情報を得た: ${INFOS[args[0]]?.label ?? args[0]}`);
        }
        break;
      case 'rumor':
        if (!(args[0] in RUMORS)) console.warn(`未登録の噂: ${args[0]}`);
        if (!this.rumorsHeard.has(args[0])) {
          this.rumorsHeard.add(args[0]);
          this.pendingToasts.push(`👂 噂を聞いた… (辞典で確認)`);
        }
        break;
      case 'coin': game?.addCoins?.(parseInt(args[0], 10)); break;
      case 'yen': game?.addYen?.(parseInt(args[0], 10)); break;
      case 'count': this.counters[args[0]] = (this.counters[args[0]] ?? 0) + 1; break;
      case 'set_lover': this.setLover(args[0]); break;   // 告白イベントでOKした時
      case 'quarrel': this.quarrels[pairKey(args[0], args[1])] = this.clock.day; break;   // 喧嘩開始(その日を記録)
      case 'reconcile':                                   // 仲直り: 喧嘩解消 + 相互親密度アップ
        delete this.quarrels[pairKey(args[0], args[1])];
        this.addAffNN(args[0], args[1], parseFloat(args[2] ?? '8'));
        break;
      case 'log': break;   // ログカテゴリ指定(addLogで処理済み)
      default: console.warn(`未知の効果: ${effect}`);
    }
  }

  serialize() {
    return {
      flags: [...this.flags],
      infos: [...this.infos],
      rumorsHeard: [...this.rumorsHeard],
      affPC: this.affPC,
      affNN: this.affNN,
      dialogueSeen: [...this.dialogueSeen],
      cooldowns: this.cooldowns,
      dailyAffGain: this.dailyAffGain,
      lastReply: this.lastReply,
      counters: this.counters,
      log: this.log.slice(-200),
      lover: this.lover,
      npcCouples: this.npcCouples,
      quarrels: this.quarrels,
    };
  }
}
