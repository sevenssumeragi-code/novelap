// ============================================================
// 九龍城ライフシミュレーター — メインオーケストレータ
// 設計書a / NPC会話設計書 に基づく実装。
// ============================================================
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { GameClock, SEASON_LABEL, WEATHER_LABEL } from './core/clock.js';
import { deriveRng, pickR } from './core/rng.js';
import { compileCond } from './core/dsl.js';

import { CHARS, MAIN_IDS, ALL_IDS, RANKS, rankOf, ROMANCEABLE } from './data/chars.js';
import { FACILITIES, INITIAL_TOWER, ECON, isFacilityOpen, coinsForDay } from './data/facilities.js';
import { FURNITURE, DEFAULT_HOME_LAYOUT, GACHA, RARITY_ORDER, RARITY_COLOR, buildGachaPool } from './data/furniture.js';
import { INFOS, RUMORS, DICTIONARY } from './data/registry.js';
import { MACROS } from './data/schedules.js';
import { EVENTS, eventForDay, TANABATA_WISHES, EVENT_INTRO } from './data/events.js';

import { World } from './sim/world.js';
import { DialogueDirector, AmbientDirector } from './sim/dialogue.js';
import { ScheduleEngine } from './sim/npc.js';
import { LetterService } from './sim/letters.js';

import { rand, pick, mat } from './three/prims.js';
import { FLOOR_W, FLOOR_D, FLOOR_H, makeFacade, makeHomeInterior, makeShopInterior, makeStairs, makeRoof, makeGround } from './three/floors.js';
import { createFurnitureMesh } from './three/furnituregen.js';
import { createCharacterMesh, makeBarkSprite, makeZzzSprite } from './three/characters.js';
import { createEventObject } from './three/events3d.js';

// ============================================================
// セーブ
// ============================================================
const SAVE_KEY = 'kowloon_life7_save_v1';

// ★テストプレイ用フラグ。ゲーム完成時は false にするか、この行と
//   末尾の import('./testtools.js') ブロック + testtools.js を削除すれば完全に消えます。
export const TEST_MODE = true;

function defaultState() {
  const homes = {};
  for (const [cid, layout] of Object.entries(DEFAULT_HOME_LAYOUT)) {
    homes[cid] = layout.map(([item, x, z, rot]) => ({ item, x, z, rot }));
  }
  return {
    coins: TEST_MODE ? 7000 : 0,        // テスト時は初期コイン7000枚
    yen: TEST_MODE ? 9000 : 150,
    tower: INITIAL_TOWER.map(e => ({ ...e })),
    homes,
    inventory: { table_wood: 1, chair_wood: 1, plant_pot: 1 },
    unlockedFacilities: [],
    gacha: { pity: 0 },
    sick: null,               // 療養中の主要人物(病院)
    bondItems: 0, matchItems: 0,   // コンビニ購入アイテムの所持数
  };
}

let saveData = null;
try { saveData = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); } catch { }
const isNewGame = !saveData;
const worldSeed = saveData?.worldSeed ?? Math.floor(Math.random() * 1e9);
const state = saveData?.state ?? defaultState();

// ============================================================
// コアシステム
// ============================================================
const clock = new GameClock(worldSeed, saveData?.clock);
const world = new World(clock, saveData?.world);
const letters = new LetterService(world, saveData?.letters);
const director = new DialogueDirector(world);
const ambient = new AmbientDirector(world, director);

// game facade: DSLと効果適用から参照されるAPI
const game = {
  worldSeed,
  state,
  isBuilt: (fac) => state.tower.some(t => t.kind === 'shop' && t.id === fac),
  currentLocation: () => (mode === 'focus' ? focusLocId : 'NONE'),
  npcActivity: (c) => schedule.activityOf(c),
  npcLocation: (c) => schedule.locationOf(c),
  addCoins: (n) => { state.coins += n; updateHUD(); },
  addYen: (n) => { state.yen += n; updateHUD(); },
  currentEvent: () => eventForDay(clock.season, ((clock.day - 1) % 8) + 1) ?? null,
  eventActive: (id) => (game.currentEvent()?.id ?? null) === id,
};
const schedule = new ScheduleEngine(world, game);

function saveGame() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      version: 1, worldSeed,
      clock: clock.serialize(),
      world: world.serialize(),
      letters: letters.serialize(),
      state,
    }));
  } catch { }
}
window.addEventListener('beforeunload', saveGame);
setInterval(saveGame, 20000);

// ============================================================
// Three.js シーン
// ============================================================
const app = document.getElementById('app');
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
app.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0c18);
scene.fog = new THREE.Fog(0x0a0c18, 55, 160);

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 400);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.maxPolarAngle = Math.PI * 0.52;
controls.minDistance = 5;

const hemi = new THREE.HemisphereLight(0x8090c0, 0x2a2018, 0.9);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xbfd0ff, 0.5);
sun.position.set(25, 50, 35);
scene.add(sun);
const warmBack = new THREE.DirectionalLight(0xff9a6a, 0.15);
warmBack.position.set(-30, 20, -20);
scene.add(warmBack);
const roomLight = new THREE.PointLight(0xffe0b0, 0, 14, 1.6);
scene.add(roomLight);

// 星空
{
  const n = 420, pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const r = rand(90, 160), th = rand(0, Math.PI * 2), ph = rand(0.05, Math.PI * 0.45);
    pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
    pos[i * 3 + 1] = r * Math.cos(ph);
    pos[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const stars = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xcfd8ff, size: 0.5, fog: false, transparent: true }));
  stars.name = 'stars';
  scene.add(stars);
}

// 雨 (天候RAIN時のみ表示)
const rainGroup = (() => {
  const n = 900;
  const pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    pos[i * 3] = rand(-30, 30); pos[i * 3 + 1] = rand(0, 60); pos[i * 3 + 2] = rand(-25, 30);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0x8aa8d0, size: 0.14, transparent: true, opacity: 0.65 }));
  pts.visible = false;
  scene.add(pts);
  return pts;
})();

// 地上
const groundBits = makeGround();
scene.add(groundBits.group);
const gachaMachine = groundBits.gachaMachine;

// ============================================================
// タワー構築
// ============================================================
let towerGroup = null;
let floors = [];           // { entry, group, facade, clickBox, hidingSpots, furnitureGroup, locId, idx }
let roofGroup = null;
let roofClickBox = null;
let groundClickBox = null;
const locAnchors = {};     // locId → { y, points[][], idx? }

const FLOOR_POINTS = [[-3.4, 1.2], [0.2, 1.8], [3.2, 0.9], [-1.2, -0.6], [2.2, -1.8], [-4.5, -1.0]];
const ROOF_POINTS = [[1, 1], [3.4, -1], [-1, -2], [4, 2], [-3, 1.5]];
const GROUND_POINTS = [[3, 9], [7, 7], [-3, 9], [0.5, 12], [10, 5], [-6, 7.5], [5, 11]];

function rebuildHomeFurniture(charId, group) {
  while (group.children.length) {
    const c = group.children.pop();
    c.traverse(o => { if (o.isMesh) { o.geometry.dispose(); if (o.material.dispose) o.material.dispose(); } });
    group.remove(c);
  }
  (state.homes[charId] ?? []).forEach((rec, index) => {
    const m = createFurnitureMesh(rec.item);
    m.position.set(rec.x, 0, rec.z);
    m.rotation.y = (rec.rot ?? 0) * Math.PI / 2;
    m.userData.placed = { charId, index };
    group.add(m);
  });
}

function buildTower() {
  if (towerGroup) {
    scene.remove(towerGroup);
    towerGroup.traverse(o => { if (o.isMesh) { o.geometry.dispose(); if (o.material.dispose) o.material.dispose(); } });
  }
  towerGroup = new THREE.Group();
  floors = [];
  for (const k of Object.keys(locAnchors)) delete locAnchors[k];

  state.tower.forEach((entry, idx) => {
    const def = entry.kind === 'home' ? CHARS[entry.id] : FACILITIES[entry.id];
    const locId = entry.kind === 'home' ? `HOME_${entry.id}` : entry.id;
    const fg = new THREE.Group();
    fg.position.y = idx * FLOOR_H;

    const facade = makeFacade({ ...entry, def });
    fg.add(facade);

    const rec = { entry, group: fg, facade, hidingSpots: [], furnitureGroup: null, locId, idx };

    if (entry.kind === 'home') {
      fg.add(makeHomeInterior(entry.id));
      const furn = new THREE.Group();
      fg.add(furn);
      rebuildHomeFurniture(entry.id, furn);
      rec.furnitureGroup = furn;
    } else {
      const { group, hidingSpots } = makeShopInterior(def.type);
      fg.add(group);
      rec.hidingSpots = hidingSpots;
    }

    const cb = new THREE.Mesh(
      new THREE.BoxGeometry(FLOOR_W + 2.6, FLOOR_H - 0.1, FLOOR_D + 2.0),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
    );
    cb.position.set(0.6, FLOOR_H / 2, 0.2);
    cb.userData.loc = locId;
    fg.add(cb);
    rec.clickBox = cb;

    if (idx < state.tower.length - 1) fg.add(makeStairs(idx));
    towerGroup.add(fg);
    floors.push(rec);
    locAnchors[locId] = { y: idx * FLOOR_H, points: FLOOR_POINTS, idx };
  });

  const roofY = state.tower.length * FLOOR_H;
  roofGroup = makeRoof();
  roofGroup.position.y = roofY;
  towerGroup.add(roofGroup);
  roofClickBox = new THREE.Mesh(
    new THREE.BoxGeometry(FLOOR_W, 2.5, FLOOR_D),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
  );
  roofClickBox.position.set(0, roofY + 1.4, 0);
  roofClickBox.userData.loc = 'ROOF';
  towerGroup.add(roofClickBox);
  locAnchors.ROOF = { y: roofY + 0.25, points: ROOF_POINTS };

  if (!groundClickBox) {
    groundClickBox = new THREE.Mesh(
      new THREE.BoxGeometry(26, 1.2, 16),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
    );
    groundClickBox.position.set(2, 0.6, 9);
    groundClickBox.userData.loc = 'GROUND';
    scene.add(groundClickBox);
  }
  locAnchors.GROUND = { y: 0, points: GROUND_POINTS };

  scene.add(towerGroup);
  controls.maxDistance = 48 + state.tower.length * 2.5;
  respawnCoins();
  eventObjMesh = null; eventObjKey = null;   // タワー再構築でhallも作り直されるため
  updateEventObject();
  updateNpcPositions(true);
}

// ============================================================
// NPC
// ============================================================
const npcs = {};    // charId → { mesh, zzz?, from, to, t, loc, barkSprite, barkTimer }
for (const id of ALL_IDS) {
  const mesh = createCharacterMesh(CHARS[id]);
  scene.add(mesh);
  npcs[id] = { mesh, from: new THREE.Vector3(), to: new THREE.Vector3(), t: 1, loc: null };
  if (id === 'LENNY') {
    const z = makeZzzSprite();
    z.position.set(0.5, 2.2, 0);
    z.visible = false;
    mesh.add(z);
    npcs[id].zzz = z;
  }
}

function updateNpcPositions(instant = false) {
  schedule.update();
  // 病気の主要人物は病院へ(病院が建っていれば)
  if (state.sick && game.isBuilt('hospital')) schedule.states[state.sick] = { loc: 'hospital', activity: 'SICK' };
  // コソ泥は出現時間帯だけ登場。いない間はメッシュ非表示&配置しない
  const thiefHere = game.thiefPresent();
  npcs.THIEF.mesh.visible = thiefHere;
  if (!thiefHere) schedule.states.THIEF = { loc: 'HIDDEN', activity: 'HIDDEN' };
  // ロケーションごとにアンカー割当
  const byLoc = {};
  for (const id of ALL_IDS) {
    if (id === 'THIEF' && !thiefHere) continue;
    const loc = schedule.locationOf(id);
    (byLoc[loc] ??= []).push(id);
  }
  for (const [loc, ids] of Object.entries(byLoc)) {
    const anchor = locAnchors[loc] ?? locAnchors[`HOME_${ids[0]}`] ?? locAnchors.GROUND;
    ids.sort();
    ids.forEach((id, i) => {
      const n = npcs[id];
      const p = anchor.points[i % anchor.points.length];
      const target = new THREE.Vector3(p[0], anchor.y, p[1]);
      const changed = n.loc !== loc;
      n.loc = loc;
      if (instant) {
        n.mesh.position.copy(target);
        n.from.copy(target);
        n.to.copy(target);
        n.t = 1;
      } else if (changed) {
        n.from.copy(n.mesh.position);
        n.to.copy(target);
        n.t = 0;
      } else {
        n.to.copy(target);   // 同ロケ内のアンカー再割当
      }
    });
  }
}

// ============================================================
// コイン (毎日、決定論で隠し直す — 設計書a §1.9.1 / §5.11)
// ============================================================
const coins = [];   // { mesh, loc }
function coinMesh() {
  const g = new THREE.Group();
  const c = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.22, 0.06, 20),
    mat(0xffd44a, { metalness: 0.85, roughness: 0.25, emissive: 0xaa7a10, emissiveIntensity: 0.55 })
  );
  c.rotation.x = Math.PI / 2;
  g.add(c);
  g.userData.spin = rand(1.5, 2.5);
  return g;
}

function respawnCoins() {
  for (const c of coins) c.mesh.parent?.remove(c.mesh);
  coins.length = 0;
  const rng = deriveRng(worldSeed, 'coins', clock.day);
  const shopFloors = floors.filter(f => f.entry.kind === 'shop' && f.hidingSpots.length);
  if (!shopFloors.length) return;
  const slots = [];
  for (const f of shopFloors) f.hidingSpots.forEach((s, i) => slots.push({ f, s, key: `${f.idx}:${i}` }));
  // 施設が増えるほど1日に隠れるコインが増える (要望)
  const count = Math.min(slots.length, coinsForDay(shopFloors.length));
  // シャッフル(決定論)
  const shuffled = [...slots].sort(() => rng() - 0.5).slice(0, count);
  for (const { f, s } of shuffled) {
    const m = coinMesh();
    m.position.set(s[0], s[1] + 0.25, s[2]);
    m.userData.baseY = s[1] + 0.25;
    f.group.add(m);
    coins.push({ mesh: m, loc: f.locId });
  }
}

function collectCoin(entry) {
  entry.mesh.parent?.remove(entry.mesh);
  coins.splice(coins.indexOf(entry), 1);
  state.coins++;
  updateHUD();
  sfx('coin');
  toast('🪙 コインを見つけた!');
  saveGame();
}

// ============================================================
// 時計イベント
// ============================================================
clock.on('day', () => {
  respawnCoins();
  const delivered = letters.dailyBatch(game);
  if (delivered.length) {
    toast('📮 手紙が届いた!');
    sfx('letter');
    updateBadges();
  }
  // NPC同士のカップル成立判定 (第12.5節)
  world.tryFormNpcCouples();
  // 季節イベント: オブジェクトの設置/撤去、告知
  updateEventObject();
  const ev = game.currentEvent();
  if (ev) { toast(`${ev.emoji} 今日は${ev.name}!`); if (game.isBuilt('hall')) toast(EVENT_INTRO[ev.id]); }
  // 病気の抽選 (病院が建っていれば)
  rollSickness();
  computeThiefWindows();
  saveGame();
});
clock.on('hour', (h) => {
  if (h === 6) {
    const shops = state.tower.filter(t => t.kind === 'shop').length;
    const income = Math.max(ECON.minIncomePerDay, ECON.rentPerHomePerDay * 6 + ECON.shopTributePerDay * shops);
    state.yen += income;
    toast(`💴 家賃収入 +${income}圓`);
    updateHUD();
  }
});
function npcSnapshot() {
  return Object.fromEntries(ALL_IDS.map(id => [id, { loc: schedule.locationOf(id), activity: schedule.activityOf(id) }]));
}
clock.on('minute', (m) => {
  if (m % 5 === 0) {   // 5分ごとにスキャン(雑談を出やすく)。プレイヤーの居場所を優先
    updateNpcPositions();
    ambient.scan(npcSnapshot(), game, mode === 'focus' ? focusLocId : null);
  }
});
clock.on('band', () => updateHUD());

// ============================================================
// 季節イベントのオブジェクト(桜/笹/ツリー等)
// ============================================================
let eventObjMesh = null;
let eventObjKey = null;
function disposeObj(o) { o.traverse(c => { if (c.isMesh) { c.geometry.dispose(); c.material?.dispose?.(); } }); }

function updateEventObject() {
  const ev = game.currentEvent();
  const key = ev?.object ?? null;
  const hall = floors.find(f => f.entry.kind === 'shop' && f.entry.id === 'hall');
  if (eventObjMesh && (key !== eventObjKey || !hall)) {
    eventObjMesh.parent?.remove(eventObjMesh); disposeObj(eventObjMesh); eventObjMesh = null;
  }
  eventObjKey = key;
  if (!key || !hall || eventObjMesh) return;
  const obj = createEventObject(key);
  if (!obj) return;
  obj.position.set(0, 0.16, 0.3);
  obj.userData.eventKey = key;
  hall.group.add(obj);
  eventObjMesh = obj;
}

// ============================================================
// 病気システム (病院) — 主要人物が病気になり、話しかけるとお見舞い=好感度UP
// ============================================================
function rollSickness() {
  if (!game.isBuilt('hospital')) { state.sick = null; return; }
  if (state.sick) return;   // すでに誰か療養中
  const rng = deriveRng(worldSeed, 'sick', clock.day);
  if (rng() < 0.35) {
    state.sick = pick(MAIN_IDS);
    world.visitedSickToday = false;
    toast(`🏥 ${CHARS[state.sick].name} が体調を崩したみたい。病院へお見舞いに行こう`);
  }
}
game.sickOf = () => state.sick;
// お見舞い(病院で病気の主要人物に話しかけると発生)
function tryVisitSick(charId) {
  if (state.sick !== charId) return false;
  if (schedule.locationOf(charId) !== 'hospital') return false;
  world.addAffPC(charId, 6, { capped: false });
  toast(`💐 ${CHARS[charId].name} のお見舞いに行った (好感度+6)`);
  state.sick = null;
  saveGame();
  return true;
}

// ============================================================
// コソ泥の出現制御 — ランダムな時間帯だけ出現。いない時はメッシュ非表示。
// ============================================================
let thiefWindows = [];
function computeThiefWindows() {
  const rng = deriveRng(worldSeed, 'thief', clock.day);
  const n = 2 + Math.floor(rng() * 2);   // 1日2〜3回
  thiefWindows = [];
  for (let i = 0; i < n; i++) {
    const start = Math.floor(rng() * 1380);
    thiefWindows.push([start, start + 40 + Math.floor(rng() * 50)]);   // 40〜90分ずつ
  }
}
game.thiefPresent = () => thiefWindows.some(([a, b]) => clock.minute >= a && clock.minute < b);

// ============================================================
// カメラ / モード
// ============================================================
let mode = 'tower';
let focusLocId = null;
let editMode = false;
let savedCam = null;
const tween = { active: false, t: 0, dur: 0.7, fromP: new THREE.Vector3(), toP: new THREE.Vector3(), fromT: new THREE.Vector3(), toT: new THREE.Vector3() };

function startTween(toPos, toTarget, dur = 0.7) {
  tween.active = true; tween.t = 0; tween.dur = dur;
  tween.fromP.copy(camera.position);
  tween.fromT.copy(controls.target);
  tween.toP.copy(toPos);
  tween.toT.copy(toTarget);
  controls.enabled = false;
}

function towerCenterY() { return state.tower.length * FLOOR_H * 0.45; }

function focusLoc(locId) {
  if (mode === 'focus' && focusLocId === locId) return;
  if (mode === 'tower') savedCam = { p: camera.position.clone(), t: controls.target.clone() };
  exitEdit();
  const prev = floors.find(f => f.locId === focusLocId);
  if (prev) prev.facade.visible = true;
  mode = 'focus';
  focusLocId = locId;

  let label = '';
  if (locId === 'ROOF') {
    const y = locAnchors.ROOF.y;
    startTween(new THREE.Vector3(2, y + 5, 15), new THREE.Vector3(0, y + 1, 0));
    roomLight.intensity = 0;
    label = '屋上';
  } else if (locId === 'GROUND') {
    startTween(new THREE.Vector3(4, 5, 22), new THREE.Vector3(2, 1.2, 8));
    roomLight.intensity = 0;
    label = '路地';
  } else {
    const f = floors.find(fl => fl.locId === locId);
    if (!f) return;
    f.facade.visible = false;
    const y = f.idx * FLOOR_H + FLOOR_H * 0.52;
    startTween(new THREE.Vector3(0, y + 0.6, FLOOR_D / 2 + 9.2), new THREE.Vector3(0, y, 0));
    roomLight.position.set(0, f.idx * FLOOR_H + FLOOR_H - 0.5, 0);
    roomLight.intensity = 14;
    const isHome = f.entry.kind === 'home';
    const def = isHome ? CHARS[f.entry.id] : FACILITIES[f.entry.id];
    label = `${f.idx + 1}F ${isHome ? def.homeName : def.name}`;
    if (!isHome && !isFacilityOpen(def, clock.minute)) label += ' (閉店中)';
    el('btn-edit').style.display = isHome ? '' : 'none';
  }
  if (locId === 'ROOF' || locId === 'GROUND') el('btn-edit').style.display = 'none';
  el('focus-name').textContent = label;
  el('focus-bar').style.display = 'flex';
  setHint('住人クリックで会話 / 立ち話は近くで盗み聞き / 光るコインを探そう / Escで戻る');
  // 入った場所に2人以上いれば、その場の立ち話を試みる (雑談が見つかりやすく)
  ambient.scan(npcSnapshot(), game, locId);
}

function backToTower() {
  exitEdit();
  closeDialogue(true);
  const prev = floors.find(f => f.locId === focusLocId);
  if (prev) prev.facade.visible = true;
  mode = 'tower';
  focusLocId = null;
  roomLight.intensity = 0;
  el('focus-bar').style.display = 'none';
  const p = savedCam?.p ?? new THREE.Vector3(24, towerCenterY() + 12, 34);
  const t = savedCam?.t ?? new THREE.Vector3(0, towerCenterY(), 0);
  startTween(p, t);
  setHint('フロアをクリックで中へ / 住人クリックで会話 / ドラッグで視点回転');
}

// ============================================================
// 会話UI
// ============================================================
let dlg = null;   // { node, lineIdx, phase:'lines'|'choices'|'choiceLines', choice, charId }

function startDialogue(charId) {
  const node = director.pickTalk(charId, game);
  if (!node) return;
  dlg = { node, lineIdx: 0, phase: 'lines', charId };
  showDlgLine();
  sfx('talk');
}

function showDlgLine() {
  const lines = dlg.phase === 'choiceLines' ? dlg.choice.lines : dlg.node.lines;
  const line = lines[dlg.lineIdx];
  const def = CHARS[line.sp];
  el('dlg-name').textContent = def?.name ?? line.sp;
  el('dlg-name').style.color = def ? '#' + def.hair.toString(16).padStart(6, '0') : '#9ec2ff';
  el('dlg-text').textContent = line.text;
  el('dlg-choices').style.display = 'none';
  el('dlg-next').style.display = '';
  el('dlg').style.display = 'block';
}

function advanceDialogue() {
  if (!dlg) return;
  const lines = dlg.phase === 'choiceLines' ? dlg.choice.lines : dlg.node.lines;
  if (dlg.lineIdx < lines.length - 1) {
    dlg.lineIdx++;
    showDlgLine();
    return;
  }
  // 行が尽きた
  if (dlg.phase === 'lines' && dlg.node.choices?.length) {
    dlg.phase = 'choices';
    const box = el('dlg-choices');
    box.innerHTML = '';
    el('dlg-next').style.display = 'none';
    for (const c of dlg.node.choices) {
      const b = document.createElement('button');
      b.textContent = c.text;
      b.onclick = (ev) => {
        ev.stopPropagation();
        dlg.choice = c;
        if (c.lines?.length) {
          dlg.phase = 'choiceLines';
          dlg.lineIdx = 0;
          showDlgLine();
        } else {
          finishDialogue();
        }
      };
      box.appendChild(b);
    }
    box.style.display = 'flex';
    return;
  }
  finishDialogue();
}

function finishDialogue() {
  if (!dlg) return;
  director.applyEffects(dlg.node, game, dlg.choice?.effects ?? []);
  closeDialogue();
  updateHUD();
  saveGame();
}

function closeDialogue(silent = false) {
  dlg = null;
  el('dlg').style.display = 'none';
  if (!silent) checkQuests();
}

el('dlg').addEventListener('click', () => { if (dlg && dlg.phase !== 'choices') advanceDialogue(); });

// お願いクエストの達成チェック (会話→家具配置→報酬会話の連鎖)
function checkQuests() {
  const has = (cid, items) => (state.homes[cid] ?? []).some(r => items.includes(r.item));
  if (world.flags.has('FLG_Q_MUNI_LAMP') && !world.flags.has('FLG_Q_MUNI_LAMP_DONE') && has('MUNI', ['lenny_starlamp', 'lamp_floor'])) {
    world.flags.add('FLG_Q_MUNI_LAMP_DONE');
    toast('⭐ ムニのお願いを叶えた! 話しかけてみよう');
  }
  if (world.flags.has('FLG_Q_JIN_TATAMI') && !world.flags.has('FLG_Q_JIN_TATAMI_DONE') && has('JIN', ['jin_tatami'])) {
    world.flags.add('FLG_Q_JIN_TATAMI_DONE');
    toast('🟩 ジンパチのお願いを叶えた! 話しかけてみよう');
  }
  if (world.flags.has('FLG_Q_JIN_PLAMO') && !world.flags.has('FLG_Q_JIN_PLAMO_DONE') && has('JIN', ['jin_plamo'])) {
    world.flags.add('FLG_Q_JIN_PLAMO_DONE');
    toast('🤖 ジンパチのお願い(プラモ展示棚)を叶えた! 話しかけてみよう');
  }
}

// ============================================================
// バーク / 雑談の表示
// ============================================================
const activeBarks = [];   // { sprite, mesh, ttl }
let barkTimer = 0;
let ambientShownIdx = -1;

function removeBark(entry) {
  entry.mesh.remove(entry.sprite);
  entry.sprite.material.map?.dispose();
  entry.sprite.material.dispose();
  const i = activeBarks.indexOf(entry);
  if (i >= 0) activeBarks.splice(i, 1);
}

// 吹き出しは 1キャラ1つ(重なり防止)。雑談の吹き出しは isAmbient=true で少し高く出す。
function showBarkAbove(charId, text, ttl = 4, isAmbient = false) {
  const n = npcs[charId];
  if (!n) return;
  // 既存の吹き出しを消してから出す(同じキャラに重ねない)
  for (const b of activeBarks.filter(b => b.charId === charId)) removeBark(b);
  const sp = makeBarkSprite(text);
  const h = 2.4 * (CHARS[charId].scale ?? 1) + (isAmbient ? 0.5 : 0);
  sp.position.set(0, h, 0);
  n.mesh.add(sp);
  activeBarks.push({ sprite: sp, mesh: n.mesh, charId, ttl });
}

function npcVisibleToPlayer(charId) {
  const n = npcs[charId];
  if (n && !n.mesh.visible) return false;
  const loc = schedule.locationOf(charId);
  if (mode === 'focus') return loc === focusLocId;
  return loc === 'GROUND' || loc === 'ROOF';
}

function tryRandomBark() {
  // 雑談中は、その場所のNPCのランダムバークを抑制(会話の吹き出しと重ならないように)
  const ambLoc = ambient.active?.loc ?? null;
  const ambCast = ambient.active?.cast ?? [];
  const visible = ALL_IDS.filter(id =>
    npcVisibleToPlayer(id) && !ambCast.includes(id) && schedule.locationOf(id) !== ambLoc);
  if (!visible.length) return;
  const id = pick(visible);
  const node = director.pickBark(id, game);
  if (node) showBarkAbove(id, node.lines[0].text);
}

// ============================================================
// 入力
// ============================================================
const raycaster = new THREE.Raycaster();
const ndc = new THREE.Vector2();
function pointerRay(ev) {
  ndc.x = (ev.clientX / window.innerWidth) * 2 - 1;
  ndc.y = -(ev.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(ndc, camera);
  return raycaster;
}

let downPos = null, downTime = 0;
let dragging = false, selected = null, placingId = null, ghost = null;

const selRing = new THREE.Mesh(
  new THREE.TorusGeometry(0.85, 0.045, 8, 32),
  mat(0xffca6a, { emissive: 0xffb84d, emissiveIntensity: 1.2 })
);
selRing.rotation.x = Math.PI / 2;
selRing.visible = false;
scene.add(selRing);

function currentHomeId() {
  const f = floors.find(fl => fl.locId === focusLocId);
  return f && f.entry.kind === 'home' ? f.entry.id : null;
}

function floorPoint(ev) {
  const f = floors.find(fl => fl.locId === focusLocId);
  if (!f) return null;
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -(f.idx * FLOOR_H));
  const p = new THREE.Vector3();
  if (!pointerRay(ev).ray.intersectPlane(plane, p)) return null;
  const snap = v => Math.round(v * 4) / 4;
  return {
    x: THREE.MathUtils.clamp(snap(p.x), -FLOOR_W / 2 + 0.8, FLOOR_W / 2 - 0.8),
    z: THREE.MathUtils.clamp(snap(p.z), -FLOOR_D / 2 + 0.7, FLOOR_D / 2 - 0.5),
  };
}

renderer.domElement.addEventListener('pointerdown', (ev) => {
  downPos = { x: ev.clientX, y: ev.clientY };
  downTime = performance.now();
  if (editMode && !placingId) {
    const f = floors.find(fl => fl.locId === focusLocId);
    if (f?.furnitureGroup) {
      const hits = pointerRay(ev).intersectObjects(f.furnitureGroup.children, true);
      if (hits.length) {
        const root = hits[0].object.userData.furnitureRoot;
        if (root?.userData.placed) {
          setSelected(root);
          dragging = true;
          controls.enabled = false;
        }
      }
    }
  }
});

renderer.domElement.addEventListener('pointermove', (ev) => {
  if (dragging && selected) {
    const p = floorPoint(ev);
    if (p) { selected.position.x = p.x; selected.position.z = p.z; updateSelRing(); }
  } else if (placingId && ghost) {
    const p = floorPoint(ev);
    if (p) ghost.position.set(p.x, 0, p.z);
  }
});

renderer.domElement.addEventListener('pointerup', (ev) => {
  const wasDrag = dragging;
  if (dragging && selected) {
    const { charId, index } = selected.userData.placed;
    const rec = state.homes[charId][index];
    rec.x = selected.position.x;
    rec.z = selected.position.z;
    saveGame();
  }
  dragging = false;
  controls.enabled = !tween.active;
  const dist = downPos ? Math.hypot(ev.clientX - downPos.x, ev.clientY - downPos.y) : 99;
  const dt = performance.now() - downTime;
  downPos = null;
  if (!wasDrag && dist < 7 && dt < 600) handleClick(ev);
});

window.addEventListener('keydown', (ev) => {
  if (ev.key === 'Escape') {
    if (dlg) { closeDialogue(); return; }
    if (placingId && ghost) { ghost.parent?.remove(ghost); ghost = null; placingId = null; setHint('家具をクリックで選択、ドラッグで移動できます'); }
    else if (editMode) exitEdit();
    else if (mode === 'focus') backToTower();
    closeModals();
  }
});

function handleClick(ev) {
  ensureAudio();
  if (dlg) { if (dlg.phase !== 'choices') advanceDialogue(); return; }
  const ray = pointerRay(ev);
  if (placingId && ghost) { confirmPlace(); return; }

  // NPC (可視ロケーションにいる場合のみ会話可)
  const npcHits = ray.intersectObjects(ALL_IDS.filter(id => npcs[id].mesh.visible).map(id => npcs[id].mesh), true);
  if (npcHits.length) {
    const charId = npcHits[0].object.userData.charId;
    if (charId && npcVisibleToPlayer(charId)) {
      if (editMode) return;
      if (charId === 'CLERK') { openShop(); return; }              // コンビニ店員 → 店
      if (tryVisitSick(charId)) { startDialogue(charId); return; } // お見舞い(好感度+)後に会話
      startDialogue(charId);
      return;
    }
  }

  if (mode === 'focus') {
    // 七夕の笹をクリック → 願い事を見る
    if (eventObjMesh && eventObjKey === 'bamboo' && focusLocId === 'hall' && ray.intersectObject(eventObjMesh, true).length) {
      openWishes(); return;
    }
    // コイン
    for (const c of coins) {
      if (c.loc !== focusLocId) continue;
      if (ray.intersectObject(c.mesh, true).length) { collectCoin(c); return; }
    }
    if (editMode) { setSelected(null); return; }
    // 他フロアへ
    const boxes = [...floors.map(fl => fl.clickBox), roofClickBox, groundClickBox];
    const hit = ray.intersectObjects(boxes, false)[0];
    if (hit && hit.object.userData.loc !== focusLocId) focusLoc(hit.object.userData.loc);
    return;
  }

  // タワービュー
  if (ray.intersectObject(gachaMachine, true).length) { openGacha(); return; }
  const boxes = [...floors.map(fl => fl.clickBox), roofClickBox, groundClickBox];
  const hit = ray.intersectObjects(boxes, false)[0];
  if (hit) focusLoc(hit.object.userData.loc);
}

// ============================================================
// 模様替え
// ============================================================
function enterEdit() {
  if (!currentHomeId()) return;
  editMode = true;
  el('edit-bar').style.display = 'flex';
  el('focus-bar').style.display = 'none';
  setHint('家具をクリックで選択、ドラッグで移動 / 「もちもの」から配置');
}

function exitEdit() {
  if (ghost) { ghost.parent?.remove(ghost); ghost = null; placingId = null; }
  editMode = false;
  setSelected(null);
  el('edit-bar').style.display = 'none';
  el('inv-panel').style.display = 'none';
  if (mode === 'focus') el('focus-bar').style.display = 'flex';
  checkQuests();
  saveGame();
}

function setSelected(obj) {
  selected = obj;
  selRing.visible = !!obj;
  el('btn-rotate').disabled = !obj;
  el('btn-store').disabled = !obj;
  if (obj) updateSelRing();
}

function updateSelRing() {
  if (!selected) return;
  const wp = new THREE.Vector3();
  selected.getWorldPosition(wp);
  selRing.position.set(wp.x, wp.y + 0.06, wp.z);
  const rec = state.homes[selected.userData.placed.charId][selected.userData.placed.index];
  const info = FURNITURE[rec.item];
  const r = Math.max(info?.size?.[0] ?? 1, info?.size?.[1] ?? 1) * 0.62 + 0.25;
  selRing.scale.setScalar(r / 0.85);
}

function rotateSelected() {
  if (!selected) return;
  const { charId, index } = selected.userData.placed;
  const rec = state.homes[charId][index];
  rec.rot = ((rec.rot ?? 0) + 1) % 4;
  selected.rotation.y = rec.rot * Math.PI / 2;
  sfx('click');
  saveGame();
}

function storeSelected() {
  if (!selected) return;
  const { charId, index } = selected.userData.placed;
  const rec = state.homes[charId][index];
  state.inventory[rec.item] = (state.inventory[rec.item] ?? 0) + 1;
  state.homes[charId].splice(index, 1);
  const f = floors.find(fl => fl.locId === focusLocId);
  rebuildHomeFurniture(charId, f.furnitureGroup);
  setSelected(null);
  renderInventory();
  sfx('click');
  saveGame();
}

function startPlacing(itemId) {
  const homeId = currentHomeId();
  if (!homeId) { toast('家具は6人の家の中でだけ置けます'); return; }
  if (ghost) { ghost.parent?.remove(ghost); ghost = null; }
  placingId = itemId;
  ghost = createFurnitureMesh(itemId);
  ghost.traverse(o => { if (o.isMesh) { o.material.transparent = true; o.material.opacity = 0.55; } });
  floors.find(fl => fl.locId === focusLocId).group.add(ghost);
  el('inv-panel').style.display = 'none';
  setHint('置きたい場所をクリック (Escでキャンセル)');
}

function confirmPlace() {
  const homeId = currentHomeId();
  if (!homeId || !placingId || !ghost) return;
  const item = placingId;
  state.inventory[item]--;
  if (state.inventory[item] <= 0) delete state.inventory[item];
  state.homes[homeId].push({ item, x: ghost.position.x, z: ghost.position.z, rot: 0 });
  ghost.parent?.remove(ghost);
  ghost = null; placingId = null;
  const f = floors.find(fl => fl.locId === focusLocId);
  rebuildHomeFurniture(homeId, f.furnitureGroup);
  renderInventory();
  sfx('place');
  // 好みタグ一致で小ボーナス (第1.8.7節)
  const fdef = FURNITURE[item];
  const cdef = CHARS[homeId];
  const match = (fdef.tasteTags ?? []).filter(t => cdef.tasteTags.includes(t)).length;
  if (match > 0) {
    world.addAffPC(homeId, match, { capped: false });
    toast(`💖 ${cdef.name}の好みにぴったり! (親密度+${match})`);
  } else {
    toast('🛋️ 家具を置いた');
  }
  checkQuests();
  saveGame();
  setHint('家具をクリックで選択、ドラッグで移動できます');
}

// ============================================================
// ガチャ (N/R/SR/UR・天井・重複還元 — 設計書a §1.9.2)
// ============================================================
const gachaPool = buildGachaPool(FACILITIES);

function rollGacha() {
  state.gacha.pity++;
  let rarity;
  if (state.gacha.pity >= GACHA.pity.count) {
    rarity = GACHA.pity.rarity;
  } else {
    const total = Object.values(GACHA.rarityWeights).reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    for (const [k, w] of Object.entries(GACHA.rarityWeights)) { r -= w; if (r <= 0) { rarity = k; break; } }
    rarity ??= 'N';
  }
  if (rarity === 'UR') state.gacha.pity = 0;
  const cands = gachaPool.filter(e => e.rarity === rarity);
  return pick(cands.length ? cands : gachaPool);
}

function openGacha() {
  el('gacha-cost').textContent = `1回 ${GACHA.costCoin}コイン (所持: ${state.coins})`;
  el('gacha-pity').textContent = `天井まであと ${GACHA.pity.count - state.gacha.pity} 回 (UR確定)`;
  el('gacha-result').style.display = 'none';
  el('btn-roll').disabled = state.coins < GACHA.costCoin;
  el('gacha-modal').style.display = 'flex';
}

function doRoll() {
  if (state.coins < GACHA.costCoin) { toast('🪙 コインが足りない…お店の中を探そう!'); return; }
  state.coins -= GACHA.costCoin;
  updateHUD();
  el('btn-roll').disabled = true;
  el('gacha-result').style.display = 'none';
  el('gacha-art').classList.add('rolling');
  sfx('roll');

  setTimeout(() => {
    el('gacha-art').classList.remove('rolling');
    const drop = rollGacha();
    const res = el('gacha-result');
    let name, kindLabel, extra = '';
    const rarity = drop.rarity;

    if (drop.kind === 'facility') {
      const fdef = FACILITIES[drop.id];
      name = fdef.name; kindLabel = '🏬 商業施設の開業権!';
      const dup = state.tower.some(t => t.kind === 'shop' && t.id === drop.id) || state.unlockedFacilities.includes(drop.id);
      if (dup) {
        const refund = GACHA.duplicateRefund[rarity] ?? 5;
        state.coins += refund;
        extra = `かぶった… コイン${refund}枚に変換`;
      } else {
        state.unlockedFacilities.push(drop.id);
        extra = '「増築」から圓を払って建てられる!';
        sfx('fanfare');
      }
    } else {
      const idef = FURNITURE[drop.id];
      name = idef.name;
      const owner = idef.char ? `${CHARS[idef.char].name}イメージの家具` : 'ふつうの家具';
      kindLabel = `🛋️ ${owner}`;
      state.inventory[drop.id] = (state.inventory[drop.id] ?? 0) + 1;
      extra = '模様替えで家に置ける';
      if (rarity === 'UR' || rarity === 'SR') sfx('fanfare');
    }

    res.innerHTML = `
      <div class="rarity" style="color:${RARITY_COLOR[rarity]}">${rarity}</div>
      <div class="rname">${name}</div>
      <div class="rkind">${kindLabel}</div>
      <div class="rkind" style="margin-top:6px">${extra}</div>`;
    res.style.display = 'block';
    el('gacha-cost').textContent = `1回 ${GACHA.costCoin}コイン (所持: ${state.coins})`;
    el('gacha-pity').textContent = `天井まであと ${Math.max(0, GACHA.pity.count - state.gacha.pity)} 回 (UR確定)`;
    el('btn-roll').disabled = state.coins < GACHA.costCoin;
    updateHUD();
    renderInventory();
    updateBadges();
    sfx('coin');
    saveGame();
  }, 950);
}

// ============================================================
// 増築
// ============================================================
function openBuild() {
  const list = el('build-list');
  list.innerHTML = '';
  if (!state.unlockedFacilities.length) {
    list.innerHTML = '<div class="inv-empty">開業権がない。ガチャで当てよう!</div>';
  }
  for (const fid of state.unlockedFacilities) {
    const fdef = FACILITIES[fid];
    const row = document.createElement('div');
    row.className = 'build-item';
    row.innerHTML = `<span>🏬 ${fdef.name}<br><span class="sub">建設費 ${fdef.cost}圓 (所持 ${state.yen}圓)</span></span>`;
    const btn = document.createElement('button');
    btn.className = 'primary';
    btn.textContent = '積み上げる';
    btn.disabled = state.yen < fdef.cost;
    btn.onclick = () => buildFacility(fid);
    row.appendChild(btn);
    list.appendChild(row);
  }
  el('build-modal').style.display = 'flex';
}

function buildFacility(fid) {
  const fdef = FACILITIES[fid];
  if (state.yen < fdef.cost) return;
  state.yen -= fdef.cost;
  state.unlockedFacilities = state.unlockedFacilities.filter(x => x !== fid);
  state.tower.push({ kind: 'shop', id: fid });
  closeModals();
  // フォーカス解除してから再構築
  exitEdit();
  mode = 'tower';
  focusLocId = null;
  roomLight.intensity = 0;
  el('focus-bar').style.display = 'none';
  buildTower();
  updateBadges();
  updateHUD();
  sfx('build');
  toast(`🏗️ ${fdef.name} がタワーに積み上がった!`);
  const topY = (state.tower.length - 1) * FLOOR_H + FLOOR_H / 2;
  startTween(new THREE.Vector3(14, topY + 3, 24), new THREE.Vector3(0, topY, 0), 1.1);
  savedCam = null;
  saveGame();
}

// ============================================================
// UI: インベントリ / 辞典 / 手紙 / ログ
// ============================================================
function renderInventory() {
  const list = el('inv-list');
  list.innerHTML = '';
  const entries = Object.entries(state.inventory).filter(([, n]) => n > 0);
  if (!entries.length) {
    list.innerHTML = '<div class="inv-empty">家具を持っていない。ガチャで手に入れよう!</div>';
    return;
  }
  entries.sort((a, b) => a[0].localeCompare(b[0]));
  for (const [id, n] of entries) {
    const def = FURNITURE[id];
    if (!def) continue;
    const owner = def.char ? CHARS[def.char].name : 'ふつう';
    const row = document.createElement('div');
    row.className = 'inv-item';
    row.innerHTML = `<span>${def.name}<br><span class="cnt" style="color:${RARITY_COLOR[def.rarity]}">${def.rarity}</span> <span class="cnt">/ ${owner}</span></span><span class="cnt">×${n}</span>`;
    const btn = document.createElement('button');
    btn.textContent = 'おく';
    btn.onclick = () => startPlacing(id);
    row.appendChild(btn);
    list.appendChild(row);
  }
}

let dictTab = 'people';
const dictConds = {};
for (const [cid, pars] of Object.entries(DICTIONARY)) {
  dictConds[cid] = pars.map(p => ({ ...p, _cond: compileCond(p.cond, MACROS) }));
}

function renderDict() {
  const body = el('dict-body');
  body.innerHTML = '';
  const ctx = world.dslCtx(game);
  if (dictTab === 'people') {
    for (const cid of [...MAIN_IDS, 'BARBER', 'KANE', 'POSTMAN']) {
      const def = CHARS[cid];
      const aff = world.aff('PC', cid);
      const rk = rankOf(aff);
      const entry = document.createElement('div');
      entry.className = 'dict-entry';
      let parsHtml = '';
      for (const p of dictConds[cid] ?? []) {
        let ok = false;
        try { ok = p._cond.eval(ctx); } catch { }
        parsHtml += ok
          ? `<div class="dict-par">${p.text}<span class="src">— ${p.source}</span></div>`
          : `<div class="dict-par locked">??? <span class="src">(未解放)</span></div>`;
      }
      entry.innerHTML = `
        <h3><span>${def.name}</span><span class="rank-label">S${rk} ${RANKS[rk].label}</span></h3>
        <div class="aff-bar"><div style="width:${aff}%"></div></div>
        ${parsHtml}`;
      body.appendChild(entry);
    }
  } else {
    // 噂・情報タブ
    let any = false;
    for (const rid of world.rumorsHeard) {
      const r = RUMORS[rid];
      if (!r) continue;
      any = true;
      const confirmed = world.flags.has(r.confirmFlag);
      const div = document.createElement('div');
      div.className = 'rumor-item';
      div.innerHTML = `👂 ${r.text}<br><span class="st">${confirmed ? '✅ 本人に確認済み' : `❓ ${CHARS[r.subject].name}に確かめてみよう`}</span>`;
      body.appendChild(div);
    }
    for (const iid of world.infos) {
      const info = INFOS[iid];
      if (!info) continue;
      any = true;
      const div = document.createElement('div');
      div.className = 'rumor-item';
      div.style.background = 'rgba(52,60,76,0.5)';
      div.innerHTML = `📖 ${info.label} <span class="st">[${info.category}]</span>`;
      body.appendChild(div);
    }
    if (!any) body.innerHTML = '<div class="inv-empty">まだ何も知らない。街で話を聞き、立ち話に耳をすまそう。</div>';
  }
}

function renderLetters() {
  el('letter-view').style.display = 'none';
  const list = el('letter-list');
  list.style.display = '';
  list.innerHTML = '';
  if (!letters.inbox.length) {
    list.innerHTML = '<div class="inv-empty">まだ手紙は届いていない。住人と仲良くなろう (友人ランクで最初の手紙が来る)。</div>';
    return;
  }
  [...letters.inbox].reverse().forEach((l) => {
    const def = CHARS[l.sender];
    const row = document.createElement('div');
    row.className = 'ltr-item';
    row.innerHTML = `<span>${l.read ? '✉️' : '📩'} ${def.name} より <span class="cnt" style="font-size:11px;color:#8a8478">(${l.day}日目)</span></span><span class="${l.read ? '' : 'unread'}">${l.read ? '' : 'NEW'}</span>`;
    row.onclick = () => openLetter(l);
    list.appendChild(row);
  });
}

function openLetter(l) {
  letters.open(l, game);
  updateBadges();
  updateHUD();
  el('letter-list').style.display = 'none';
  el('letter-view').style.display = 'block';
  const paper = el('letter-paper');
  paper.innerHTML = l.texts.map(t => `<p>${t.text}</p>`).join('');
  el('letter-meta').textContent = `${l.day}日目に受領${l.coin ? ` / 🪙${l.coin}枚が同封されていた` : ''}`;
  const rep = el('letter-replies');
  rep.innerHTML = '';
  const t = letters.template(l.ltr);
  if (!l.replied && t?.replies) {
    const label = document.createElement('span');
    label.style.cssText = 'font-size:12px;color:#b8b0a0;align-self:center';
    label.textContent = '返事のスタンプ: ';
    rep.appendChild(label);
    for (const r of t.replies) {
      const b = document.createElement('button');
      b.textContent = r.label;
      b.onclick = () => {
        letters.reply(l, r.key, game);
        toast(`💌 ${CHARS[l.sender].name}に気持ちを送った (+2)`);
        rep.innerHTML = `<span style="font-size:12px;color:#8a8478">「${r.label}」と返事した</span>`;
        updateHUD();
        saveGame();
      };
      rep.appendChild(b);
    }
  } else if (l.replied) {
    rep.innerHTML = '<span style="font-size:12px;color:#8a8478">返信済み</span>';
  }
  saveGame();
}

function renderLog() {
  const body = el('log-body');
  body.innerHTML = '';
  if (!world.log.length) {
    body.innerHTML = '<div class="inv-empty">まだログがない。</div>';
    return;
  }
  [...world.log].reverse().slice(0, 60).forEach(entry => {
    const div = document.createElement('div');
    div.className = 'log-item';
    const lines = entry.lines.map(l => `<span class="sp">${CHARS[l.sp]?.name ?? l.sp}:</span> ${l.text}`).join('<br>');
    div.innerHTML = `<div class="meta">${entry.day}日目 ${String(Math.floor(entry.minute / 60)).padStart(2, '0')}:${String(entry.minute % 60).padStart(2, '0')} [${entry.category}]</div>${lines}`;
    body.appendChild(div);
  });
}

// ============================================================
// HUD / 汎用UI
// ============================================================
function el(id) { return document.getElementById(id); }
function setHint(t) { el('hint').textContent = t; }

function updateHUD() {
  el('clock-text').textContent = clock.clockText;
  const wIco = { SUNNY: '☀️', CLOUDY: '☁️', RAIN: '🌧️' }[clock.weather];
  el('weather-text').textContent = `${wIco} ${WEATHER_LABEL[clock.weather]}`;
  el('season-text').textContent = SEASON_LABEL[clock.season];
  el('coin-count').textContent = state.coins;
  el('yen-count').textContent = state.yen;
}

function updateBadges() {
  const b1 = el('build-badge');
  b1.style.display = state.unlockedFacilities.length ? 'block' : 'none';
  b1.textContent = state.unlockedFacilities.length;
  const b2 = el('ltr-badge');
  b2.style.display = letters.unreadCount ? 'block' : 'none';
  b2.textContent = letters.unreadCount;
}

function toast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  el('toast-area').appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .4s'; }, 2400);
  setTimeout(() => t.remove(), 2900);
}

function closeModals() {
  for (const id of ['gacha-modal', 'build-modal', 'help-modal', 'dict-modal', 'letters-modal', 'log-modal', 'wishes-modal', 'shop-modal', 'target-modal']) el(id).style.display = 'none';
}

// ---------- 七夕: 願い事ビューア ----------
const WISH_LIST = Object.keys(TANABATA_WISHES);
let wishIdx = 0;
function showWish() {
  const id = WISH_LIST[wishIdx];
  const col = '#' + CHARS[id].hair.toString(16).padStart(6, '0');
  el('wishes-body').innerHTML = `<div style="text-align:center;padding:8px">
    <div style="font-size:40px">🎋</div>
    <div style="font-size:15px;color:${col};font-weight:700;margin:6px 0">${CHARS[id].name}</div>
    <div style="font-size:14px;line-height:1.9">${TANABATA_WISHES[id]}</div></div>`;
  el('wish-idx').textContent = `${wishIdx + 1} / ${WISH_LIST.length}`;
}
function openWishes() { wishIdx = 0; showWish(); el('wishes-modal').style.display = 'flex'; sfx('talk'); }
el('wish-prev').onclick = () => { wishIdx = (wishIdx - 1 + WISH_LIST.length) % WISH_LIST.length; showWish(); };
el('wish-next').onclick = () => { wishIdx = (wishIdx + 1) % WISH_LIST.length; showWish(); };

// ---------- コンビニの店(絆アイテム/仲人アイテム) ----------
const SHOP_BOND_COST = 30, SHOP_MATCH_COST = 40, SHOP_BOND_AMT = 8, SHOP_MATCH_AMT = 8;
const GIFTABLE = [...MAIN_IDS, 'BARBER', 'KANE', 'POSTMAN', 'CAFEGIRL', 'DAGASHIYA', 'CLERK'];
function openShop() {
  ensureAudio();
  el('shop-body').innerHTML = `
    <div class="build-item"><span>💝 絆の贈り物<br><span class="sub">プレイヤーと選んだ相手の親密度 +${SHOP_BOND_AMT}</span></span><button id="buy-bond" class="primary">🪙${SHOP_BOND_COST}</button></div>
    <div class="build-item"><span>🎁 仲人の贈り物<br><span class="sub">主要人物2人を選び、その2人の相互親密度 +${SHOP_MATCH_AMT}</span></span><button id="buy-match" class="primary">🪙${SHOP_MATCH_COST}</button></div>
    <div style="font-size:11.5px;color:#8a8478;margin-top:8px">所持コイン: ${state.coins}</div>`;
  el('buy-bond').onclick = () => { if (state.coins < SHOP_BOND_COST) { toast('🪙 コインが足りない'); return; } chooseBondTarget(); };
  el('buy-match').onclick = () => { if (state.coins < SHOP_MATCH_COST) { toast('🪙 コインが足りない'); return; } chooseMatchA(); };
  el('shop-modal').style.display = 'flex';
}
function openTargetPicker(title, ids, cb) {
  el('target-title').textContent = title;
  const body = el('target-body');
  body.innerHTML = '';
  for (const id of ids) {
    const b = document.createElement('button');
    b.textContent = CHARS[id].name;
    b.onclick = () => cb(id);
    body.appendChild(b);
  }
  el('shop-modal').style.display = 'none';
  el('target-modal').style.display = 'flex';
}
function chooseBondTarget() {
  openTargetPicker('💝 贈り物を渡す相手をえらぶ', GIFTABLE, (id) => {
    state.coins -= SHOP_BOND_COST;
    world.addAffPC(id, SHOP_BOND_AMT, { capped: false });
    updateHUD(); saveGame(); sfx('coin');
    toast(`💝 ${CHARS[id].name}に贈り物を渡した (親密度+${SHOP_BOND_AMT})`);
    closeModals();
  });
}
function chooseMatchA() {
  openTargetPicker('🎁 仲を取り持つ 1人目', MAIN_IDS, (a) => {
    openTargetPicker('🎁 仲を取り持つ 2人目', MAIN_IDS.filter(x => x !== a), (b) => {
      state.coins -= SHOP_MATCH_COST;
      world.addAffNN(a, b, SHOP_MATCH_AMT);
      updateHUD(); saveGame(); sfx('coin');
      toast(`🎁 ${CHARS[a].name} と ${CHARS[b].name} の仲が深まった (+${SHOP_MATCH_AMT})`);
      closeModals();
    });
  });
}

el('btn-gacha').onclick = () => { ensureAudio(); openGacha(); };
el('btn-build').onclick = () => { ensureAudio(); openBuild(); };
el('btn-help').onclick = () => { el('help-modal').style.display = 'flex'; };
el('btn-dict').onclick = () => { renderDict(); el('dict-modal').style.display = 'flex'; };
el('btn-letters').onclick = () => { renderLetters(); el('letters-modal').style.display = 'flex'; };
el('btn-log').onclick = () => { renderLog(); el('log-modal').style.display = 'flex'; };
el('btn-roll').onclick = doRoll;
el('btn-back').onclick = backToTower;
el('btn-edit').onclick = enterEdit;
el('btn-done').onclick = exitEdit;
el('btn-rotate').onclick = rotateSelected;
el('btn-store').onclick = storeSelected;
el('btn-ltr-back').onclick = renderLetters;
el('dict-tab-people').onclick = () => { dictTab = 'people'; renderDict(); };
el('dict-tab-rumor').onclick = () => { dictTab = 'rumor'; renderDict(); };
el('btn-inv').onclick = () => {
  const p = el('inv-panel');
  p.style.display = p.style.display === 'flex' ? 'none' : 'flex';
  renderInventory();
};
document.querySelectorAll('[data-close]').forEach(b => b.onclick = closeModals);
document.querySelectorAll('.modal').forEach(m => {
  m.addEventListener('pointerdown', (ev) => { if (ev.target === m) closeModals(); });
});
document.querySelectorAll('.speed').forEach(b => {
  b.onclick = () => {
    clock.speed = parseInt(b.dataset.speed, 10);
    document.querySelectorAll('.speed').forEach(x => x.classList.toggle('active', x === b));
  };
});

// ============================================================
// サウンド (WebAudio合成)
// ============================================================
let actx = null;
function ensureAudio() {
  if (!actx) { try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch { } }
  if (actx?.state === 'suspended') actx.resume();
}
function note(freq, start, dur, type = 'square', vol = 0.05) {
  if (!actx) return;
  const o = actx.createOscillator();
  const g = actx.createGain();
  o.type = type; o.frequency.value = freq;
  g.gain.setValueAtTime(vol, actx.currentTime + start);
  g.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + start + dur);
  o.connect(g).connect(actx.destination);
  o.start(actx.currentTime + start);
  o.stop(actx.currentTime + start + dur + 0.02);
}
function sfx(name) {
  if (!actx) return;
  switch (name) {
    case 'coin': note(988, 0, 0.09); note(1319, 0.08, 0.18); break;
    case 'click': note(660, 0, 0.05, 'sine', 0.04); break;
    case 'place': note(440, 0, 0.06, 'sine'); note(660, 0.06, 0.1, 'sine'); break;
    case 'talk': note(520, 0, 0.05, 'sine', 0.03); note(640, 0.05, 0.06, 'sine', 0.03); break;
    case 'letter': note(784, 0, 0.1, 'sine', 0.04); note(988, 0.1, 0.15, 'sine', 0.04); break;
    case 'roll': for (let i = 0; i < 8; i++) note(300 + i * 90, i * 0.09, 0.07, 'sawtooth', 0.025); break;
    case 'fanfare': note(523, 0, 0.12); note(659, 0.12, 0.12); note(784, 0.24, 0.12); note(1047, 0.36, 0.3); break;
    case 'build': note(262, 0, 0.1, 'sawtooth'); note(330, 0.1, 0.1, 'sawtooth'); note(392, 0.2, 0.1, 'sawtooth'); note(523, 0.3, 0.25, 'sawtooth'); break;
  }
}

// ============================================================
// メインループ
// ============================================================
const threeClock = new THREE.Clock();
let time = 0;
const nightBg = new THREE.Color(0x0a0c18);
const dayBg = new THREE.Color(0x3d5068);

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(threeClock.getDelta(), 0.1);
  time += dt;

  // ゲーム時計
  const prevBand = clock.band;
  clock.tick(dt);
  if (Math.floor(time * 2) % 2 === 0) updateHUD();

  // 昼夜ライティング
  const d = clock.daylight * (clock.weather === 'RAIN' ? 0.55 : 1);
  hemi.intensity = 0.4 + 0.8 * d;
  sun.intensity = 0.1 + 0.6 * d;
  scene.background.copy(nightBg).lerp(dayBg, d);
  scene.fog.color.copy(scene.background);
  const stars = scene.getObjectByName('stars');
  if (stars) stars.material.opacity = 1 - d;
  rainGroup.visible = clock.weather === 'RAIN';
  if (rainGroup.visible) {
    const pos = rainGroup.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let y = pos.getY(i) - dt * 28;
      if (y < 0) y = 60;
      pos.setY(i, y);
    }
    pos.needsUpdate = true;
  }

  // カメラtween
  if (tween.active) {
    tween.t += dt / tween.dur;
    const k = tween.t >= 1 ? 1 : 1 - Math.pow(1 - tween.t, 3);
    camera.position.lerpVectors(tween.fromP, tween.toP, k);
    controls.target.lerpVectors(tween.fromT, tween.toT, k);
    if (tween.t >= 1) { tween.active = false; controls.enabled = true; }
  }
  controls.update();

  // コイン
  for (const c of coins) {
    c.mesh.rotation.y += dt * c.mesh.userData.spin;
    c.mesh.position.y = c.mesh.userData.baseY + Math.sin(time * 3) * 0.03;
  }

  // NPC移動・アニメーション
  for (const id of ALL_IDS) {
    const n = npcs[id];
    if (n.t < 1) {
      n.t = Math.min(1, n.t + dt / 1.2);
      const k = 1 - Math.pow(1 - n.t, 2);
      n.mesh.position.lerpVectors(n.from, n.to, k);
      // 移動中ぴょこぴょこ
      n.mesh.position.y += Math.abs(Math.sin(n.t * Math.PI * 6)) * 0.15;
    } else {
      // 待機: アンカーへゆっくり寄せつつ、息づかいの上下
      n.mesh.position.x += (n.to.x - n.mesh.position.x) * dt * 2;
      n.mesh.position.z += (n.to.z - n.mesh.position.z) * dt * 2;
      const act = schedule.activityOf(id);
      n.mesh.position.y = n.to.y + (act === 'SLEEP' ? 0 : Math.abs(Math.sin(time * 1.6 + id.length)) * 0.03);
    }
    if (n.zzz) {
      const act = schedule.activityOf(id);
      n.zzz.visible = (act === 'SLEEP' || act === 'NAP');
    }
  }

  // バーク
  barkTimer += dt;
  if (barkTimer > 7) {
    barkTimer = 0;
    if (Math.random() < 0.55 && !dlg) tryRandomBark();
  }
  for (let i = activeBarks.length - 1; i >= 0; i--) {
    const b = activeBarks[i];
    b.ttl -= dt;
    if (b.ttl <= 0) removeBark(b);
  }

  // 雑談 (AmbientDirector) — 会話の吹き出しは少し高い位置に出す(バークと区別)
  if (ambient.active && ambientShownIdx !== ambient.active.lineIdx) {
    ambientShownIdx = ambient.active.lineIdx;
    const line = ambient.active.node.lines[ambient.active.lineIdx];
    if (line && npcVisibleToPlayer(line.sp)) showBarkAbove(line.sp, line.text, 3.6, true);
  }
  const ambResult = ambient.tick(dt, mode === 'focus' ? focusLocId : 'NONE', game);
  if (ambResult?.done) ambientShownIdx = -1;

  // トースト排出
  while (world.pendingToasts.length) toast(world.pendingToasts.shift());

  // ガチャマシンゆらゆら
  gachaMachine.rotation.y = Math.sin(time * 0.7) * 0.04;

  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ============================================================
// 起動
// ============================================================
computeThiefWindows();
buildTower();
updateHUD();
updateBadges();
renderInventory();
camera.position.set(24, towerCenterY() + 12, 34);
controls.target.set(0, towerCenterY(), 0);
controls.update();
animate();

if (isNewGame) {
  el('help-modal').style.display = 'flex';
  saveGame();
}

// デバッグ/テスト用フック
window.__kl = {
  state, world, clock, letters, schedule, director, ambient, game,
  focusLoc, backToTower, startDialogue, advanceDialogue, finishDialogue,
  openGacha, doRoll, buildFacility, updateHUD, renderInventory, updateNpcPositions,
  saveGame, toast, updateBadges, renderDict, buildTower,
  updateEventObject, openWishes, openShop, computeThiefWindows, rollSickness,
  coins, npcs, camera,
  get eventObj() { return eventObjMesh; },
  screenPos(obj) {
    const v = obj.getWorldPosition(new THREE.Vector3());
    v.project(camera);
    return { x: (v.x + 1) / 2 * window.innerWidth, y: (1 - v.y) / 2 * window.innerHeight };
  },
};

// ★テストプレイ用ツール(好感度スイッチ等)。TEST_MODE のときだけ読み込む。
//   ゲーム完成時はこのブロックと testtools.js を削除すれば完全に消えます。
if (TEST_MODE) {
  import('./testtools.js').then(m => m.installTestTools(window.__kl)).catch(e => console.warn('testtools:', e));
}
