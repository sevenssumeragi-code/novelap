// ============================================================
// コンテンツ検証 (NPC会話設計書 第21章 CI検証 / 設計書a 第4章§4.9)
//   node tools/validate.mjs
// - 会話ID重複
// - 条件DSLの文法 (全会話・手紙・辞典)
// - 禁止語チェック (ゲルのセリフに「貴様」が含まれたら自動リジェクト)
// - フォールバック保証 (主要人物: 無条件GENERIC 5本以上)
// - 未登録フラグ/INFO/噂の参照
// ============================================================
import { compileCond } from '../js/core/dsl.js';
import { CHARS, MAIN_IDS } from '../js/data/chars.js';
import { MACROS } from '../js/data/schedules.js';
import { FLAGS, INFOS, RUMORS } from '../js/data/registry.js';
import { LETTERS } from '../js/data/letters.js';
import { DICTIONARY } from '../js/data/registry.js';
import { DLG_LENNY } from '../js/data/dlg_lenny.js';
import { DLG_HYU } from '../js/data/dlg_hyu.js';
import { DLG_JIN } from '../js/data/dlg_jin.js';
import { DLG_MUNI } from '../js/data/dlg_muni.js';
import { DLG_GERU } from '../js/data/dlg_geru.js';
import { DLG_NEO } from '../js/data/dlg_neo.js';
import { DLG_NPC } from '../js/data/dlg_npc.js';
import { DLG_AMBIENT } from '../js/data/dlg_ambient.js';

const ALL = [...DLG_LENNY, ...DLG_HYU, ...DLG_JIN, ...DLG_MUNI, ...DLG_GERU, ...DLG_NEO, ...DLG_NPC, ...DLG_AMBIENT];
const errors = [];
const warnings = [];

// 1. ID重複
const seen = new Set();
for (const n of ALL) {
  if (seen.has(n.id)) errors.push(`会話ID重複: ${n.id}`);
  seen.add(n.id);
}

// 2. 条件DSL文法
function tryCompile(src, where) {
  try { compileCond(src, MACROS); } catch (e) { errors.push(`DSL文法エラー [${where}]: ${e.message}`); }
}
for (const n of ALL) tryCompile(n.cond, n.id);
for (const t of LETTERS) {
  tryCompile(t.trigger, `${t.id}.trigger`);
  for (const [slot, vs] of Object.entries(t.slots)) vs.forEach((v, i) => tryCompile(v.cond, `${t.id}.${slot}[${i}]`));
}
for (const [cid, pars] of Object.entries(DICTIONARY)) pars.forEach((p, i) => tryCompile(p.cond, `DICT.${cid}[${i}]`));

// 3. 禁止語チェック (口調正準 第1章§1.8 → 第4章§4.9のValidator)
for (const n of ALL) {
  for (const line of n.lines ?? []) {
    const speech = CHARS[line.sp]?.speech;
    for (const token of speech?.forbiddenTokens ?? []) {
      if (line.text.includes(token)) errors.push(`禁止語「${token}」検出 [${n.id}] ${line.sp}:「${line.text}」`);
    }
  }
  for (const c of n.choices ?? []) {
    for (const line of c.lines ?? []) {
      const speech = CHARS[line.sp]?.speech;
      for (const token of speech?.forbiddenTokens ?? []) {
        if (line.text.includes(token)) errors.push(`禁止語「${token}」検出 [${n.id} choice] ${line.sp}:「${line.text}」`);
      }
    }
  }
}
for (const t of LETTERS) {
  const speech = CHARS[t.sender]?.speech;
  for (const [slot, vs] of Object.entries(t.slots)) {
    for (const v of vs) {
      for (const token of speech?.forbiddenTokens ?? []) {
        if (v.text.includes(token)) errors.push(`禁止語「${token}」検出 [${t.id}.${slot}]`);
      }
    }
  }
}

// 4. フォールバック保証 (第3.3節: 無条件GENERIC 5本以上)
for (const cid of MAIN_IDS) {
  const generic = ALL.filter(n => n.owner === cid && n.pool === 'GENERIC' && (!n.cond || n.cond === 'true') && !n.once);
  if (generic.length < 5) errors.push(`フォールバック不足: ${cid} のGENERIC無条件ノードが ${generic.length} 本 (最低5本)`);
}

// 5. 未登録フラグ/INFO/噂の参照 (第5.2節: レジストリ登録制)
const refPattern = /(FLG_[A-Z0-9_]+|INFO_[A-Z0-9_]+|RUM_[A-Z0-9_]+)/g;
function checkRefs(src, where) {
  if (!src) return;
  for (const m of src.matchAll(refPattern)) {
    const id = m[1];
    const ok = id.startsWith('FLG_') ? id in FLAGS : id.startsWith('INFO_') ? id in INFOS : id in RUMORS;
    if (!ok) errors.push(`未登録参照 ${id} [${where}]`);
  }
}
for (const n of ALL) {
  checkRefs(n.cond, n.id);
  for (const e of n.effects ?? []) checkRefs(e, `${n.id}.effects`);
  for (const c of n.choices ?? []) for (const e of c.effects ?? []) checkRefs(e, `${n.id}.choice`);
}
for (const t of LETTERS) {
  checkRefs(t.trigger, t.id);
  for (const e of t.effects ?? []) checkRefs(e, `${t.id}.effects`);
  for (const vs of Object.values(t.slots)) for (const v of vs) checkRefs(v.cond, t.id);
}
for (const [cid, pars] of Object.entries(DICTIONARY)) for (const p of pars) checkRefs(p.cond, `DICT.${cid}`);

// 6. 統計 + ムニの口癖頻度 (第16.3節: 乱用しない)
const stats = {};
for (const n of ALL) {
  const key = n.owner;
  stats[key] = (stats[key] ?? 0) + 1;
}
const muniNodes = ALL.filter(n => n.owner === 'MUNI');
const ticCount = muniNodes.filter(n => JSON.stringify(n).includes('むにゅ〜')).length;
if (ticCount / muniNodes.length > 0.5) warnings.push(`ムニの口癖「むにゅ〜」が多すぎる: ${ticCount}/${muniNodes.length} ノード (目安1/3)`);

console.log('=== コンテンツ検証 ===');
console.log(`会話ノード総数: ${ALL.length}`);
for (const [k, v] of Object.entries(stats).sort()) console.log(`  ${k}: ${v}本`);
console.log(`手紙テンプレート: ${LETTERS.length}`);
console.log(`ムニ口癖頻度: ${ticCount}/${muniNodes.length}`);
if (warnings.length) { console.log('\n⚠️ 警告:'); warnings.forEach(w => console.log('  ' + w)); }
if (errors.length) {
  console.log('\n❌ エラー:');
  errors.forEach(e => console.log('  ' + e));
  process.exit(1);
}
console.log('\n✅ 全チェック合格');
