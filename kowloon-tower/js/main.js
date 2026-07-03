// ============================================================
// 九龍城タワー — メインゲームロジック
// ============================================================
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {
  CHARACTERS, FACILITIES, INITIAL_TOWER, FURNITURE, DEFAULT_HOME_LAYOUT,
  GACHA_COST, buildGachaPool, RARITY_LABEL, DUP_REFUND,
  COIN_MAX_ON_TOWER, COIN_SPAWN_SEC, COIN_INITIAL,
} from './data.js';
import { rand, pick, mat } from './prims.js';
import {
  FLOOR_W, FLOOR_D, FLOOR_H,
  makeFacade, makeHomeInterior, makeShopInterior, makeStairs, makeRoof, makeGround,
} from './floors.js';
import { createFurnitureMesh } from './furniture.js';
import { createCharacterMesh, makeZzzSprite } from './characters.js';

// ------------------------------------------------------------
// セーブデータ
// ------------------------------------------------------------
const SAVE_KEY = 'kowloon_tower_save_v1';

function defaultState() {
  const homes = {};
  for (const [cid, layout] of Object.entries(DEFAULT_HOME_LAYOUT)) {
    homes[cid] = layout.map(([item, x, z, rot]) => ({ item, x, z, rot }));
  }
  return {
    coins: 0,
    tower: INITIAL_TOWER.map(e => ({ ...e })),
    homes,
    inventory: { table_wood: 1, chair_wood: 2, plant_pot: 1 },
    unlockedFacilities: [],
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return defaultState();
    const s = JSON.parse(raw);
    if (!Array.isArray(s.tower) || !s.homes) return defaultState();
    return s;
  } catch { return defaultState(); }
}

const state = loadState();
function saveState() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch { /* 容量超過などは無視 */ }
}
window.addEventListener('beforeunload', saveState);

// ------------------------------------------------------------
// シーン
// ------------------------------------------------------------
const app = document.getElementById('app');
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
app.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0c18);
scene.fog = new THREE.Fog(0x0a0c18, 55, 150);

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 400);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.maxPolarAngle = Math.PI * 0.52;
controls.minDistance = 5;

scene.add(new THREE.HemisphereLight(0x8090c0, 0x2a2018, 0.9));
const sun = new THREE.DirectionalLight(0xbfd0ff, 0.55);
sun.position.set(25, 50, 35);
scene.add(sun);
const moonBack = new THREE.DirectionalLight(0xff9a6a, 0.18);
moonBack.position.set(-30, 20, -20);
scene.add(moonBack);
// フォーカス中の室内照明
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
  const stars = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xcfd8ff, size: 0.5, fog: false }));
  scene.add(stars);
}

// 地上
const groundBits = makeGround();
scene.add(groundBits.group);
const gachaMachine = groundBits.gachaMachine;

// ------------------------------------------------------------
// タワー構築
// ------------------------------------------------------------
let towerGroup = null;
let floors = [];        // { entry, group, facade, clickBox, hidingSpots, charMesh, furnitureGroup, homeId }
let charMeshes = [];    // クリック対象
let zzzSprite = null;

function rebuildHomeFurniture(charId, group) {
  while (group.children.length) {
    const c = group.children.pop();
    c.traverse(o => { if (o.isMesh) { o.geometry.dispose(); if (o.material.dispose) o.material.dispose(); } });
    group.remove(c);
  }
  const placed = state.homes[charId] ?? [];
  placed.forEach((rec, index) => {
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
  charMeshes = [];

  state.tower.forEach((entry, idx) => {
    const def = entry.kind === 'home' ? CHARACTERS[entry.id] : FACILITIES[entry.id];
    const fg = new THREE.Group();
    fg.position.y = idx * FLOOR_H;

    const facade = makeFacade({ ...entry, def });
    fg.add(facade);

    const rec = { entry, group: fg, facade, hidingSpots: [], charMesh: null, furnitureGroup: null, idx };

    if (entry.kind === 'home') {
      fg.add(makeHomeInterior(entry.id));
      const furn = new THREE.Group();
      fg.add(furn);
      rebuildHomeFurniture(entry.id, furn);
      rec.furnitureGroup = furn;

      const ch = createCharacterMesh(def);
      ch.position.set(rand(-1.5, 1.5), 0, rand(1.0, 2.2));
      ch.rotation.y = rand(-0.4, 0.4);
      ch.userData.baseY = 0;
      ch.userData.phase = Math.random() * Math.PI * 2;
      fg.add(ch);
      rec.charMesh = ch;
      charMeshes.push(ch);
      if (entry.id === 'lenny') {
        zzzSprite = makeZzzSprite();
        zzzSprite.position.set(0.5, 2.3, 0);
        ch.add(zzzSprite);
      }
    } else {
      const { group, hidingSpots } = makeShopInterior(def.type);
      fg.add(group);
      rec.hidingSpots = hidingSpots;
    }

    // クリック判定用の透明ボックス
    const cb = new THREE.Mesh(
      new THREE.BoxGeometry(FLOOR_W + 2.6, FLOOR_H - 0.1, FLOOR_D + 2.0),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
    );
    cb.position.set(0.6, FLOOR_H / 2, 0.2);
    cb.userData.floorIdx = idx;
    fg.add(cb);
    rec.clickBox = cb;

    // 外階段 (最上階以外)
    if (idx < state.tower.length - 1) fg.add(makeStairs(idx));

    towerGroup.add(fg);
    floors.push(rec);
  });

  const roof = makeRoof();
  roof.position.y = state.tower.length * FLOOR_H;
  towerGroup.add(roof);
  scene.add(towerGroup);

  controls.maxDistance = 45 + state.tower.length * 2.5;
  respawnAllCoins();
}

// ------------------------------------------------------------
// コイン
// ------------------------------------------------------------
const coins = []; // { mesh, floorIdx, spotIdx }
let coinTimer = 0;

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

function shopFloors() { return floors.filter(f => f.entry.kind === 'shop' && f.hidingSpots.length); }

function spawnCoin() {
  if (coins.length >= COIN_MAX_ON_TOWER) return;
  const candidates = [];
  for (const f of shopFloors()) {
    f.hidingSpots.forEach((s, i) => {
      if (!coins.some(c => c.floorIdx === f.idx && c.spotIdx === i)) candidates.push({ f, i, s });
    });
  }
  if (!candidates.length) return;
  const { f, i, s } = pick(candidates);
  const m = coinMesh();
  m.position.set(s[0], s[1] + 0.25, s[2]);
  m.userData.baseY = s[1] + 0.25;
  f.group.add(m);
  coins.push({ mesh: m, floorIdx: f.idx, spotIdx: i });
}

function respawnAllCoins() {
  coins.length = 0; // メッシュはタワーごと破棄済み
  for (let i = 0; i < COIN_INITIAL; i++) spawnCoin();
}

function collectCoin(entry) {
  entry.mesh.parent?.remove(entry.mesh);
  coins.splice(coins.indexOf(entry), 1);
  state.coins++;
  updateHUD();
  saveState();
  sfx('coin');
  toast('🪙 コインを見つけた!');
}

// ------------------------------------------------------------
// カメラ / モード
// ------------------------------------------------------------
let mode = 'tower';       // 'tower' | 'focus'
let focusIdx = -1;
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

function focusFloor(idx) {
  if (mode === 'focus' && focusIdx === idx) return;
  if (mode === 'tower') savedCam = { p: camera.position.clone(), t: controls.target.clone() };
  exitEdit();
  if (focusIdx >= 0 && floors[focusIdx]) floors[focusIdx].facade.visible = true;
  mode = 'focus';
  focusIdx = idx;
  const f = floors[idx];
  f.facade.visible = false;
  const y = idx * FLOOR_H + FLOOR_H * 0.52;
  startTween(new THREE.Vector3(0, y + 0.6, FLOOR_D / 2 + 9.2), new THREE.Vector3(0, y, 0));
  roomLight.position.set(0, idx * FLOOR_H + FLOOR_H - 0.5, 0);
  roomLight.intensity = 14;

  const isHome = f.entry.kind === 'home';
  const def = isHome ? CHARACTERS[f.entry.id] : FACILITIES[f.entry.id];
  el('focus-name').textContent = `${idx + 1}F ${isHome ? def.homeName : def.name}`;
  el('focus-bar').style.display = 'flex';
  el('btn-edit').style.display = isHome ? '' : 'none';
  setHint(isHome ? '住人をクリックで会話 / 「模様替え」で家具を動かせます'
                 : 'どこかにコインが隠れているかも…光るものを探してクリック!');
}

function backToTower() {
  exitEdit();
  if (focusIdx >= 0 && floors[focusIdx]) floors[focusIdx].facade.visible = true;
  mode = 'tower';
  focusIdx = -1;
  roomLight.intensity = 0;
  hideBubble();
  el('focus-bar').style.display = 'none';
  const p = savedCam?.p ?? new THREE.Vector3(20, towerCenterY() + 8, 28);
  const t = savedCam?.t ?? new THREE.Vector3(0, towerCenterY(), 0);
  startTween(p, t);
  setHint('クリック: フロアに入る / ドラッグ: 視点回転 / ホイール: ズーム');
}

// ------------------------------------------------------------
// 模様替え (家具編集)
// ------------------------------------------------------------
let selected = null;        // 選択中の家具グループ
let dragging = false;
let placingId = null;       // 配置中のアイテムid
let ghost = null;
const selRing = new THREE.Mesh(
  new THREE.TorusGeometry(0.85, 0.045, 8, 32),
  mat(0xffca6a, { emissive: 0xffb84d, emissiveIntensity: 1.2 })
);
selRing.rotation.x = Math.PI / 2;
selRing.visible = false;
scene.add(selRing);

function currentHomeId() {
  const f = floors[focusIdx];
  return f && f.entry.kind === 'home' ? f.entry.id : null;
}

function enterEdit() {
  if (!currentHomeId()) return;
  editMode = true;
  el('edit-bar').style.display = 'flex';
  el('focus-bar').style.display = 'none';
  setHint('家具をクリックで選択、ドラッグで移動 / 「もちもの」から新しい家具を置けます');
}

function exitEdit() {
  if (ghost) { ghost.parent?.remove(ghost); ghost = null; placingId = null; }
  editMode = false;
  setSelected(null);
  el('edit-bar').style.display = 'none';
  el('inv-panel').style.display = 'none';
  if (mode === 'focus') el('focus-bar').style.display = 'flex';
  saveState();
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
  const info = FURNITURE[state.homes[selected.userData.placed.charId][selected.userData.placed.index].item];
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
  saveState();
}

function storeSelected() {
  if (!selected) return;
  const { charId, index } = selected.userData.placed;
  const rec = state.homes[charId][index];
  state.inventory[rec.item] = (state.inventory[rec.item] ?? 0) + 1;
  state.homes[charId].splice(index, 1);
  const f = floors[focusIdx];
  rebuildHomeFurniture(charId, f.furnitureGroup);
  setSelected(null);
  renderInventory();
  sfx('click');
  toast('🎒 もちものにしまった');
  saveState();
}

function startPlacing(itemId) {
  const homeId = currentHomeId();
  if (!homeId) return;
  if (ghost) { ghost.parent?.remove(ghost); ghost = null; }
  placingId = itemId;
  ghost = createFurnitureMesh(itemId);
  ghost.traverse(o => {
    if (o.isMesh) { o.material.transparent = true; o.material.opacity = 0.55; }
  });
  ghost.position.set(0, 0, 0);
  floors[focusIdx].group.add(ghost);
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
  rebuildHomeFurniture(homeId, floors[focusIdx].furnitureGroup);
  renderInventory();
  sfx('place');
  toast('🛋️ 家具を置いた!');
  saveState();
  setHint('家具をクリックで選択、ドラッグで移動できます');
}

// 床平面との交点 (フォーカス中のフロアのローカル座標で返す)
const raycaster = new THREE.Raycaster();
const ndc = new THREE.Vector2();
function pointerRay(ev) {
  ndc.x = (ev.clientX / window.innerWidth) * 2 - 1;
  ndc.y = -(ev.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(ndc, camera);
  return raycaster;
}

function floorPoint(ev) {
  const f = floors[focusIdx];
  if (!f) return null;
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -(focusIdx * FLOOR_H));
  const p = new THREE.Vector3();
  if (!pointerRay(ev).ray.intersectPlane(plane, p)) return null;
  const snap = v => Math.round(v * 4) / 4;
  return {
    x: THREE.MathUtils.clamp(snap(p.x), -FLOOR_W / 2 + 0.8, FLOOR_W / 2 - 0.8),
    z: THREE.MathUtils.clamp(snap(p.z), -FLOOR_D / 2 + 0.7, FLOOR_D / 2 - 0.5),
  };
}

// ------------------------------------------------------------
// 入力
// ------------------------------------------------------------
let downPos = null;
let downTime = 0;

renderer.domElement.addEventListener('pointerdown', (ev) => {
  downPos = { x: ev.clientX, y: ev.clientY };
  downTime = performance.now();
  if (editMode && !placingId) {
    const f = floors[focusIdx];
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
    if (p) {
      selected.position.x = p.x;
      selected.position.z = p.z;
      updateSelRing();
    }
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
    saveState();
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
    if (placingId && ghost) { ghost.parent?.remove(ghost); ghost = null; placingId = null; setHint('家具をクリックで選択、ドラッグで移動できます'); }
    else if (editMode) exitEdit();
    else if (mode === 'focus') backToTower();
    closeModals();
  }
});

function handleClick(ev) {
  ensureAudio();
  const ray = pointerRay(ev);

  // 配置確定
  if (placingId && ghost) { confirmPlace(); return; }

  if (mode === 'focus') {
    const f = floors[focusIdx];
    // コイン
    for (const c of coins) {
      if (c.floorIdx !== focusIdx) continue;
      if (ray.intersectObject(c.mesh, true).length) { collectCoin(c); return; }
    }
    // キャラ
    if (f?.charMesh && ray.intersectObject(f.charMesh, true).length) {
      speak(f.entry.id);
      return;
    }
    // 編集モードで何もない所をクリック → 選択解除
    if (editMode) { setSelected(null); return; }
    // 他フロアをクリックしたら移動
    const boxes = floors.map(fl => fl.clickBox);
    const hit = ray.intersectObjects(boxes, false)[0];
    if (hit && hit.object.userData.floorIdx !== focusIdx) focusFloor(hit.object.userData.floorIdx);
    return;
  }

  // タワービュー: ガチャマシン
  if (ray.intersectObject(gachaMachine, true).length) { openGacha(); return; }
  // フロアをクリックで入る
  const boxes = floors.map(f => f.clickBox);
  const hit = ray.intersectObjects(boxes, false)[0];
  if (hit) focusFloor(hit.object.userData.floorIdx);
}

// ------------------------------------------------------------
// 会話
// ------------------------------------------------------------
let bubbleTimer = null;
function speak(charId) {
  const def = CHARACTERS[charId];
  el('bubble-name').textContent = def.name;
  el('bubble-name').style.color = '#' + def.hair.toString(16).padStart(6, '0');
  el('bubble-text').textContent = pick(def.lines);
  el('bubble').style.display = 'block';
  sfx('talk');
  clearTimeout(bubbleTimer);
  bubbleTimer = setTimeout(hideBubble, 5000);
}
function hideBubble() { el('bubble').style.display = 'none'; }

// ------------------------------------------------------------
// ガチャ
// ------------------------------------------------------------
const gachaPool = buildGachaPool();

function rollGacha() {
  const total = gachaPool.reduce((a, e) => a + e.weight, 0);
  let r = Math.random() * total;
  for (const e of gachaPool) { r -= e.weight; if (r <= 0) return e; }
  return gachaPool[0];
}

function openGacha() {
  el('gacha-cost').textContent = `1回 ${GACHA_COST} コイン (所持: ${state.coins})`;
  el('gacha-result').style.display = 'none';
  el('btn-roll').disabled = state.coins < GACHA_COST;
  el('gacha-modal').style.display = 'flex';
}

function doRoll() {
  if (state.coins < GACHA_COST) { toast('🪙 コインが足りない…お店の中を探そう!'); return; }
  state.coins -= GACHA_COST;
  updateHUD();
  el('btn-roll').disabled = true;
  el('gacha-result').style.display = 'none';
  el('gacha-art').classList.add('rolling');
  sfx('roll');

  setTimeout(() => {
    el('gacha-art').classList.remove('rolling');
    const drop = rollGacha();
    const res = el('gacha-result');
    let rarity, name, kindLabel, extra = '';

    if (drop.kind === 'facility') {
      const fdef = FACILITIES[drop.id];
      rarity = 3; name = fdef.name; kindLabel = '🏬 あたらしい商業施設!';
      const alreadyBuilt = state.tower.some(t => t.kind === 'shop' && t.id === drop.id);
      const alreadyOwned = state.unlockedFacilities.includes(drop.id);
      if (alreadyBuilt || alreadyOwned) {
        state.coins += DUP_REFUND;
        extra = `かぶってしまった… コイン${DUP_REFUND}枚に変わった`;
      } else {
        state.unlockedFacilities.push(drop.id);
        extra = '「増築」からタワーに積み上げよう!';
        sfx('fanfare');
      }
    } else {
      const idef = FURNITURE[drop.id];
      rarity = idef.rarity;
      name = idef.name;
      const owner = idef.char ? `${CHARACTERS[idef.char].name}イメージの家具` : 'ふつうの家具';
      kindLabel = `🛋️ ${owner}`;
      state.inventory[drop.id] = (state.inventory[drop.id] ?? 0) + 1;
      extra = '模様替えで家に置ける';
      if (rarity >= 3) sfx('fanfare');
    }

    res.className = rarity >= 3 ? 'r3' : '';
    res.innerHTML = `
      <div class="rarity">${RARITY_LABEL[rarity]}</div>
      <div class="rname">${name}</div>
      <div class="rkind">${kindLabel}</div>
      <div class="rkind" style="margin-top:6px">${extra}</div>`;
    res.style.display = 'block';
    el('gacha-cost').textContent = `1回 ${GACHA_COST} コイン (所持: ${state.coins})`;
    el('btn-roll').disabled = state.coins < GACHA_COST;
    updateHUD();
    renderInventory();
    updateBuildBadge();
    sfx('coin');
    saveState();
  }, 950);
}

// ------------------------------------------------------------
// 増築
// ------------------------------------------------------------
function updateBuildBadge() {
  const n = state.unlockedFacilities.length;
  const b = el('build-badge');
  b.style.display = n ? 'block' : 'none';
  b.textContent = n;
}

function openBuild() {
  const list = el('build-list');
  list.innerHTML = '';
  if (!state.unlockedFacilities.length) {
    list.innerHTML = '<div class="inv-empty">増築できる施設はまだない。ガチャで当てよう!</div>';
  }
  for (const fid of state.unlockedFacilities) {
    const fdef = FACILITIES[fid];
    const row = document.createElement('div');
    row.className = 'build-item';
    row.innerHTML = `<span>🏬 ${fdef.name}</span>`;
    const btn = document.createElement('button');
    btn.className = 'primary';
    btn.textContent = '積み上げる';
    btn.onclick = () => buildFacility(fid);
    row.appendChild(btn);
    list.appendChild(row);
  }
  el('build-modal').style.display = 'flex';
}

function buildFacility(fid) {
  state.unlockedFacilities = state.unlockedFacilities.filter(x => x !== fid);
  state.tower.push({ kind: 'shop', id: fid });
  closeModals();
  backToTowerHard();
  buildTower();
  updateBuildBadge();
  sfx('build');
  toast(`🏗️ ${FACILITIES[fid].name} がタワーに積み上がった!`);
  // 新フロアを見上げるカメラ
  const topY = (state.tower.length - 1) * FLOOR_H + FLOOR_H / 2;
  startTween(new THREE.Vector3(14, topY + 3, 24), new THREE.Vector3(0, topY, 0), 1.1);
  savedCam = null;
  saveState();
}

function backToTowerHard() {
  // buildTower() で floors が作り直されるため、参照を持たずに素早く戻す
  exitEdit();
  mode = 'tower';
  focusIdx = -1;
  roomLight.intensity = 0;
  hideBubble();
  el('focus-bar').style.display = 'none';
}

// ------------------------------------------------------------
// インベントリUI
// ------------------------------------------------------------
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
    const owner = def.char ? CHARACTERS[def.char].name : 'ふつう';
    const row = document.createElement('div');
    row.className = 'inv-item';
    row.innerHTML = `<span>${def.name}<br><span class="cnt">${RARITY_LABEL[def.rarity]} / ${owner}</span></span><span class="cnt">×${n}</span>`;
    const btn = document.createElement('button');
    btn.textContent = 'おく';
    btn.onclick = () => startPlacing(id);
    row.appendChild(btn);
    list.appendChild(row);
  }
}

// ------------------------------------------------------------
// UIユーティリティ
// ------------------------------------------------------------
function el(id) { return document.getElementById(id); }
function setHint(text) { el('hint').textContent = text; }
function updateHUD() { el('coin-count').textContent = state.coins; }

function toast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  el('toast-area').appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .4s'; }, 2200);
  setTimeout(() => t.remove(), 2700);
}

function closeModals() {
  for (const id of ['gacha-modal', 'build-modal', 'help-modal']) el(id).style.display = 'none';
}

el('btn-gacha').onclick = () => { ensureAudio(); openGacha(); };
el('btn-build').onclick = () => { ensureAudio(); openBuild(); };
el('btn-help').onclick = () => { el('help-modal').style.display = 'flex'; };
el('btn-roll').onclick = doRoll;
el('btn-back').onclick = backToTower;
el('btn-edit').onclick = enterEdit;
el('btn-done').onclick = exitEdit;
el('btn-rotate').onclick = rotateSelected;
el('btn-store').onclick = storeSelected;
el('btn-inv').onclick = () => {
  const p = el('inv-panel');
  p.style.display = p.style.display === 'flex' ? 'none' : 'flex';
  renderInventory();
};
document.querySelectorAll('[data-close]').forEach(b => b.onclick = closeModals);
document.querySelectorAll('.modal').forEach(m => {
  m.addEventListener('pointerdown', (ev) => { if (ev.target === m) closeModals(); });
});

// ------------------------------------------------------------
// サウンド (WebAudioで自動生成)
// ------------------------------------------------------------
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
    case 'roll': for (let i = 0; i < 8; i++) note(300 + i * 90, i * 0.09, 0.07, 'sawtooth', 0.025); break;
    case 'fanfare': note(523, 0, 0.12); note(659, 0.12, 0.12); note(784, 0.24, 0.12); note(1047, 0.36, 0.3); break;
    case 'build': note(262, 0, 0.1, 'sawtooth'); note(330, 0.1, 0.1, 'sawtooth'); note(392, 0.2, 0.1, 'sawtooth'); note(523, 0.3, 0.25, 'sawtooth'); break;
  }
}

// ------------------------------------------------------------
// メインループ
// ------------------------------------------------------------
const clock = new THREE.Clock();
let time = 0;

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.1);
  time += dt;

  // カメラtween
  if (tween.active) {
    tween.t += dt / tween.dur;
    const k = tween.t >= 1 ? 1 : 1 - Math.pow(1 - tween.t, 3);
    camera.position.lerpVectors(tween.fromP, tween.toP, k);
    controls.target.lerpVectors(tween.fromT, tween.toT, k);
    if (tween.t >= 1) { tween.active = false; controls.enabled = true; }
  }
  controls.update();

  // コイン回転 & 出現
  for (const c of coins) {
    c.mesh.rotation.y += dt * c.mesh.userData.spin;
    c.mesh.position.y = c.mesh.userData.baseY + Math.sin(time * 3 + c.spotIdx) * 0.03;
  }
  coinTimer += dt;
  if (coinTimer >= COIN_SPAWN_SEC) { coinTimer = 0; spawnCoin(); }

  // キャラの息づかい
  for (const ch of charMeshes) {
    const ph = ch.userData.phase;
    ch.position.y = ch.userData.baseY + Math.abs(Math.sin(time * 1.6 + ph)) * 0.035;
    if (ch.userData.headGroup) ch.userData.headGroup.rotation.z = Math.sin(time * 0.8 + ph) * 0.05;
  }
  // レニィのZzz
  if (zzzSprite) {
    const cycle = (time % 9);
    zzzSprite.visible = cycle > 5;
    if (zzzSprite.visible) zzzSprite.position.y = 2.3 + Math.sin(time * 2) * 0.06;
  }
  // ガチャマシンをちょっと揺らす
  gachaMachine.rotation.y = Math.sin(time * 0.7) * 0.04;

  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ------------------------------------------------------------
// 起動
// ------------------------------------------------------------
buildTower();
updateHUD();
updateBuildBadge();
renderInventory();
camera.position.set(24, towerCenterY() + 12, 34);
controls.target.set(0, towerCenterY(), 0);
controls.update();
animate();

// 初回だけ遊び方を表示
if (!localStorage.getItem(SAVE_KEY)) {
  el('help-modal').style.display = 'flex';
  saveState();
}

// デバッグ/テスト用フック
window.__kt = {
  state, floors: () => floors, coins, camera,
  focusFloor, backToTower, enterEdit, exitEdit,
  openGacha, doRoll, buildFacility, updateHUD, renderInventory, speak,
  screenPos(obj) {
    const v = obj.getWorldPosition(new THREE.Vector3());
    v.project(camera);
    return { x: (v.x + 1) / 2 * window.innerWidth, y: (1 - v.y) / 2 * window.innerHeight };
  },
};
