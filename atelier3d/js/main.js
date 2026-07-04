// main.js — シーン管理・UI・画像認識連携・テストプレイ(ウォークモード)・GLB/OBJ書き出し
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { OBJExporter } from 'three/addons/exporters/OBJExporter.js';
import { parsePrompt, describeSpec, FURNITURE_NAMES } from './parser.js';
import { TextureFactory, fileToCanvas, dominantColor } from './textures.js';
import { buildModel, buildEnvironment } from './builders.js';
import { detectObjects, roomItemsFromDetections, guessExterior, describeDetections } from './detector.js';

const $ = (id) => document.getElementById(id);
const tick = (ms = 30) => new Promise(r => setTimeout(r, ms));

// ---------------- state ----------------
const state = {
  mode: 'auto',
  quality: 2048,
  images: [],           // {id, name, canvas, role, detections, detecting}
  model: null,          // 書き出し対象の Group
  env: null,
  spec: null,
  walking: false,
};
let imageIdSeq = 1;

// ---------------- three.js scene ----------------
const canvas = $('canvas3d');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace;

// GPU が一度に扱えるテクスチャの最大辺 (多くの環境で 8192 or 16384)
const MAX_TEX = renderer.capabilities.maxTextureSize || 4096;

// 8K などでGPUメモリを使い切った場合、白画面のまま固まらずに理由を表示する
canvas.addEventListener('webglcontextlost', (e) => {
  e.preventDefault();
  setStatus('⚠ GPUメモリが不足し描画が中断されました。テクスチャ品質を下げて再生成してください。', true);
});
canvas.addEventListener('webglcontextrestored', () => {
  setStatus('描画が復帰しました。もう一度「3Dモデルを生成」を押してください。');
});

const scene = new THREE.Scene();
{
  // 空のグラデーション背景
  const c = document.createElement('canvas');
  c.width = 4; c.height = 256;
  const ctx = c.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, '#7fb0dd');
  grad.addColorStop(0.55, '#cfe2ee');
  grad.addColorStop(1, '#eef0ea');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, 4, 256);
  const bg = new THREE.CanvasTexture(c);
  bg.colorSpace = THREE.SRGBColorSpace;
  scene.background = bg;
  scene.fog = new THREE.Fog(0xcfe2ee, 60, 260);

  // 空を環境マップ化してガラス・金属・画面などに自然な映り込みを与える
  try {
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envScene = new THREE.Scene();
    envScene.background = bg;
    scene.environment = pmrem.fromScene(envScene, 0.04).texture;
    pmrem.dispose();
  } catch (e) {
    console.warn('環境マップ生成をスキップ:', e);
  }
}

const camera = new THREE.PerspectiveCamera(55, 1, 0.05, 500);
camera.position.set(14, 10, 18);

const hemi = new THREE.HemisphereLight(0xcfe4ff, 0x8a7f6a, 0.9);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff2dd, 2.6);
sun.position.set(24, 36, 18);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.bias = -0.0004;
sun.shadow.normalBias = 0.02;
scene.add(sun);

const orbit = new OrbitControls(camera, canvas);
orbit.enableDamping = true;
orbit.dampingFactor = 0.08;
orbit.maxPolarAngle = Math.PI * 0.52;
orbit.target.set(0, 3, 0);

// ---------------- walk (テストプレイ) ----------------
const walk = new PointerLockControls(camera, canvas);
const keys = {};
let walkBounds = null;
let eyeHeight = 1.6;
let savedCam = null;

document.addEventListener('keydown', e => { keys[e.code] = true; });
document.addEventListener('keyup', e => { keys[e.code] = false; });

walk.addEventListener('unlock', () => { if (state.walking) exitWalk(); });
// ポインターロックが使えない環境(iframe等)でも Esc で必ず抜けられるように
document.addEventListener('pointerlockerror', () => { if (state.walking) exitWalk(); });
document.addEventListener('keydown', e => {
  if (e.code === 'Escape' && state.walking) exitWalk();
});

function startWalk() {
  if (!state.model) return;
  const r = state.lastResult;
  savedCam = { pos: camera.position.clone(), target: orbit.target.clone() };
  orbit.enabled = false;
  camera.position.copy(r.walkStart.pos);
  camera.lookAt(r.walkStart.lookAt);
  eyeHeight = r.walkStart.pos.y;
  const bb = new THREE.Box3().setFromObject(state.model);
  if (r.envKind === 'room') {
    walkBounds = bb.expandByScalar(-0.25);       // 部屋の中に留まる
  } else {
    walkBounds = bb.expandByScalar(r.envRadius);  // 敷地内を自由に
  }
  state.walking = true;
  $('walkHud').classList.remove('hidden');
  $('hudInfo').textContent = 'テストプレイ中 — Escで終了';
  walk.lock();
}

function exitWalk() {
  state.walking = false;
  $('walkHud').classList.add('hidden');
  if (walk.isLocked) walk.unlock();
  if (savedCam) {
    camera.position.copy(savedCam.pos);
    orbit.target.copy(savedCam.target);
  }
  orbit.enabled = true;
  updateHud();
}

const walkVel = new THREE.Vector3();
function stepWalk(dt) {
  const speed = (keys['ShiftLeft'] || keys['ShiftRight']) ? 7.5 : 3.2;
  const f = (keys['KeyW'] || keys['ArrowUp'] ? 1 : 0) - (keys['KeyS'] || keys['ArrowDown'] ? 1 : 0);
  const s = (keys['KeyD'] || keys['ArrowRight'] ? 1 : 0) - (keys['KeyA'] || keys['ArrowLeft'] ? 1 : 0);
  walkVel.set(s, 0, f).normalize().multiplyScalar(speed * dt);
  walk.moveRight(walkVel.x);
  walk.moveForward(walkVel.z);
  camera.position.y = eyeHeight;
  if (walkBounds) {
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, walkBounds.min.x, walkBounds.max.x);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, walkBounds.min.z, walkBounds.max.z);
  }
}

// ---------------- render loop ----------------
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.1);
  if (state.walking) stepWalk(dt);
  else orbit.update();
  renderer.render(scene, camera);
}

function resize() {
  const w = canvas.clientWidth || canvas.parentElement.clientWidth;
  const h = canvas.clientHeight || canvas.parentElement.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();
animate();

// ---------------- UI: モード / 品質 ----------------
function segInit(segId, attr, onPick) {
  const seg = $(segId);
  seg.addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (!btn) return;
    seg.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === btn));
    onPick(btn.dataset[attr]);
  });
}
segInit('modeSeg', 'mode', v => { state.mode = v; });
segInit('qualitySeg', 'q', v => {
  state.quality = parseInt(v, 10);
  if (state.quality > MAX_TEX) {
    $('qualityHint').textContent = `⚠ この端末のGPUは最大 ${MAX_TEX}px までのため、アップロード画像は ${MAX_TEX}px に制限されます(生成自体は可能)。`;
  } else if (state.quality >= 8192) {
    $('qualityHint').textContent = '8K: アップロード画像を最高精細で使用します。生成パターン(レンガ等)はタイリングにより8K相当の密度になります。';
  } else {
    $('qualityHint').textContent = '2Kで十分きれいです。8Kは高解像度の画像をアップロードした時に効果があります。';
  }
});

$('exampleChips').addEventListener('click', e => {
  const btn = e.target.closest('button');
  if (btn) $('prompt').value = btn.textContent;
});

// ---------------- UI: 画像アップロード ----------------
const ROLE_OPTIONS = [
  ['auto', '自動(写真→家具を認識 / 素材→質感)'],
  ['scene', 'シーン(写真の家具を3D化)'],
  ['wall', '外壁の質感'],
  ['roof', '屋根の質感'],
  ['sign', '看板・日よけ'],
  ['interiorWall', '内壁(壁紙)の質感'],
  ['floor', '床の質感'],
  ['furniture', '家具(木部)の質感'],
  ['fabric', '布(ソファ等)の質感'],
  ['tv', 'テレビ画面'],
];

async function addFiles(files) {
  for (const file of files) {
    if (!file.type.startsWith('image/')) continue;
    try {
      const cv = await fileToCanvas(file);
      const img = { id: imageIdSeq++, name: file.name, canvas: cv, role: 'auto', detections: undefined, detecting: true };
      state.images.push(img);
      renderThumbs();
      setStatus('画像内の家具・物体を認識しています…(初回はモデル読み込みに数秒かかります)');
      detectObjects(cv).then(dets => {
        img.detecting = false;
        img.detections = dets;   // null = モデル利用不可
        renderThumbs();
        if (dets == null) {
          setStatus('この環境では画像認識を利用できないため、画像は質感(テクスチャ)として使用します。');
        } else {
          const summary = describeDetections(dets);
          setStatus(summary
            ? `✓ 画像から認識: ${summary} — 「3Dモデルを生成」で立体化します。`
            : '画像から家具は検出されませんでした。質感(テクスチャ)として使用します。');
        }
      }).catch(err => {
        console.warn(err);
        img.detecting = false;
        img.detections = null;
        renderThumbs();
      });
    } catch (err) {
      setStatus('画像の読み込みに失敗: ' + file.name, true);
    }
  }
  renderThumbs();
}

function detectionTagText(img) {
  if (img.detecting) return '🔍 認識中…';
  if (img.detections == null) return '素材として使用';
  const summary = describeDetections(img.detections);
  return summary ? '✓ ' + summary : '物体なし(素材として使用)';
}

function renderThumbs() {
  const wrap = $('thumbs');
  wrap.innerHTML = '';
  for (const img of state.images) {
    const div = document.createElement('div');
    div.className = 'thumb';
    const small = document.createElement('canvas');
    small.width = small.height = 56;
    small.getContext('2d').drawImage(img.canvas, 0, 0, 56, 56);
    const im = document.createElement('img');
    im.src = small.toDataURL();
    const meta = document.createElement('div');
    meta.className = 'meta';
    const name = document.createElement('div');
    name.className = 'name';
    name.textContent = `${img.name} (${img.canvas.width}×${img.canvas.height})`;
    const tag = document.createElement('div');
    tag.className = 'tag' + (img.detections && img.detections.length ? ' ok' : '');
    tag.textContent = detectionTagText(img);
    const sel = document.createElement('select');
    for (const [v, label] of ROLE_OPTIONS) {
      const o = document.createElement('option');
      o.value = v; o.textContent = label;
      sel.appendChild(o);
    }
    sel.value = img.role;
    sel.addEventListener('change', () => { img.role = sel.value; });
    meta.append(name, tag, sel);
    const del = document.createElement('button');
    del.className = 'del';
    del.textContent = '✕';
    del.addEventListener('click', () => {
      state.images = state.images.filter(i => i.id !== img.id);
      renderThumbs();
    });
    div.append(im, meta, del);
    wrap.appendChild(div);
  }
}

const drop = $('drop');
$('fileInput').addEventListener('change', e => addFiles([...e.target.files]));
drop.addEventListener('dragover', e => { e.preventDefault(); drop.classList.add('over'); });
drop.addEventListener('dragleave', () => drop.classList.remove('over'));
drop.addEventListener('drop', e => {
  e.preventDefault();
  drop.classList.remove('over');
  addFiles([...e.dataTransfer.files]);
});

// ---------------- status ----------------
function setStatus(msg, isErr = false) {
  const el = $('status');
  el.textContent = msg;
  el.classList.toggle('err', isErr);
}

function countTriangles(root) {
  let tri = 0;
  root.traverse(o => {
    if (o.isMesh && o.geometry) {
      const g = o.geometry;
      tri += (g.index ? g.index.count : g.attributes.position.count) / 3;
    }
  });
  return Math.round(tri);
}

function updateHud() {
  if (!state.model) return;
  const tri = countTriangles(state.model);
  $('hudInfo').textContent =
    `${describeSpec(state.spec)} / ${tri.toLocaleString()}三角形 / テクスチャ ${state.quality / 1024}K — ドラッグで回転・ホイールでズーム`;
}

// ---------------- 生成 ----------------
function rolesForAuto(mode) {
  if (mode === 'building') return ['wall', 'roof', 'sign'];
  if (mode === 'room') return ['floor', 'interiorWall', 'fabric', 'tv'];
  return ['furniture', 'fabric', 'tv'];
}

function disposeGroup(root) {
  root.traverse(o => {
    if (o.isMesh) {
      o.geometry?.dispose();
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      mats.forEach(m => { m.map?.dispose(); m.bumpMap?.dispose(); m.dispose(); });
    }
  });
}

const STYLE_JA = { brick: 'レンガ', stone: '石造り', tile: 'タイル', metal: '金属', wood: '木', concrete: 'コンクリート', glass: 'ガラス', plaster: '塗り壁', modern: 'モダン', japanese: '和風' };

/** シーン画像(=写っている物を3D化する画像)とテクスチャ素材画像に分ける */
function splitImages() {
  const sceneImgs = [];
  const texImgs = [];
  for (const im of state.images) {
    if (im.role === 'scene') sceneImgs.push(im);
    else if (im.role === 'auto' && im.detections && im.detections.some(d => d.type)) sceneImgs.push(im);
    else texImgs.push(im);
  }
  return { sceneImgs, texImgs };
}

async function generate() {
  const btn = $('generateBtn');
  btn.disabled = true;
  try {
    if (state.walking) exitWalk();
    const text = $('prompt').value;
    const spec = parsePrompt(text, state.mode);

    // ---- 画像認識の反映 ----
    const { sceneImgs, texImgs } = splitImages();
    let recognizedNote = '';

    if (sceneImgs.length > 0) {
      // 画像内の家具 → アイテム化
      let imgItems = [], floorC = null, wallC = null;
      for (const im of sceneImgs) {
        const rr = roomItemsFromDetections(im.canvas, im.detections || []);
        imgItems = imgItems.concat(rr.items);
        if (floorC == null) floorC = rr.floorColor;
        if (wallC == null) wallC = rr.wallColor;
      }

      // 建物モードが「明示的」な場合のみ外観推定。文章が空(自動判定の既定)で
      // 画像から家具が見つかったなら、部屋の再現を優先する。
      const buildingExplicit = state.mode === 'building' || spec.hasBuildingHint;
      if (spec.mode === 'building' && (buildingExplicit || imgItems.length === 0)) {
        // 外観モード: 画像から壁の質感と色を推定
        const gx = guessExterior(sceneImgs[0].canvas);
        if (spec.building.style == null) spec.building.style = gx.style;
        if (spec.color == null) spec.color = gx.color;
        recognizedNote = `外観を画像から推定(${STYLE_JA[spec.building.style] || spec.building.style}) `;
      } else if (imgItems.length > 0) {
        if (state.mode === 'furniture') {
          // 家具モード固定: 写真の家具を全て単体家具として並べる
          spec.furniture = spec.hasTextFurniture ? [...spec.furniture, ...imgItems] : imgItems;
        } else {
          // 部屋として、写真の家具を写真内の位置どおりに配置
          if (spec.mode !== 'room') spec.mode = 'room';
          spec.room.items = spec.hasTextFurniture ? [...spec.room.items, ...imgItems] : imgItems;
          spec.room.floorColor = floorC;
          spec.room.wallColor = wallC;
        }
        const names = imgItems.map(i => FURNITURE_NAMES[i.type] || i.type);
        const uniq = [...new Set(names)];
        recognizedNote = `画像から${imgItems.length}点の家具を認識(${uniq.join('・')}) `;
      }
    }

    // ---- テクスチャ素材画像 → 役割の解決 ----
    const imagesByRole = {};
    const autoQueue = rolesForAuto(spec.mode).filter(r => !texImgs.some(i => i.role === r));
    for (const img of texImgs) {
      let role = img.role;
      if (role === 'auto') role = autoQueue.shift();
      if (role && !imagesByRole[role]) imagesByRole[role] = img.canvas;
    }
    // 指示に色がなければ画像から代表色を抽出
    if (spec.color == null && texImgs.length > 0) {
      spec.color = dominantColor(texImgs[0].canvas).getHex();
    }

    setStatus(`${recognizedNote}テクスチャ生成中 (${Math.min(state.quality, MAX_TEX) / 1024}K)…${state.quality >= 4096 ? ' 高解像度のため時間がかかります' : ''}`);
    await tick(60);

    const T = new TextureFactory(state.quality, imagesByRole, renderer.capabilities.getMaxAnisotropy(), MAX_TEX);
    const result = buildModel(spec, T);

    setStatus('シーンを構築中…');
    await tick(30);

    if (state.model) { scene.remove(state.model); disposeGroup(state.model); }
    if (state.env) { scene.remove(state.env); disposeGroup(state.env); }

    state.model = result.model;
    state.env = buildEnvironment(result, T);
    state.spec = spec;
    state.lastResult = result;
    scene.add(state.model, state.env);

    // 影のカバー範囲をモデルに合わせる
    const ext = Math.max(result.envRadius, 12);
    sun.shadow.camera.left = -ext; sun.shadow.camera.right = ext;
    sun.shadow.camera.top = ext; sun.shadow.camera.bottom = -ext;
    sun.shadow.camera.far = 160;
    sun.shadow.camera.updateProjectionMatrix();

    // カメラフレーミング
    orbit.target.copy(result.camTarget);
    const d = result.camDist;
    camera.position.set(d * 0.75, d * 0.55, d * 0.95).add(result.camTarget);
    camera.near = 0.05; camera.far = Math.max(500, d * 10);
    camera.updateProjectionMatrix();

    $('afterGen').classList.remove('hidden');
    updateHud();
    const tri = countTriangles(state.model);
    setStatus(`✓ 生成完了: ${recognizedNote ? recognizedNote + '→ ' : ''}${describeSpec(spec)}(${tri.toLocaleString()}三角形)。テストプレイやダウンロードができます。`);
    window.__lastGenerated = { mode: spec.mode, triangles: tri, quality: state.quality, recognized: recognizedNote || null };
  } catch (err) {
    console.error(err);
    setStatus('生成に失敗しました: ' + err.message, true);
  } finally {
    btn.disabled = false;
  }
}
$('generateBtn').addEventListener('click', generate);

// ---------------- 書き出し ----------------
function downloadBlob(blob, filename) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 15000);
}

function fileStamp() {
  const d = new Date();
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}`;
}

$('glbBtn').addEventListener('click', () => {
  if (!state.model) return;
  setStatus('GLBを書き出し中…(テクスチャ埋め込み)');
  const exporter = new GLTFExporter();
  exporter.parse(state.model, (result) => {
    const blob = new Blob([result], { type: 'model/gltf-binary' });
    downloadBlob(blob, `atelier3d_${state.spec.mode}_${fileStamp()}.glb`);
    setStatus(`✓ GLBを保存しました (${(blob.size / 1024 / 1024).toFixed(1)} MB)`);
    window.__lastExport = { format: 'glb', bytes: blob.size };
  }, (err) => {
    console.error(err);
    setStatus('GLB書き出しに失敗: ' + err.message, true);
  }, { binary: true, maxTextureSize: Math.min(state.quality, MAX_TEX) });
});

$('objBtn').addEventListener('click', () => {
  if (!state.model) return;
  const exporter = new OBJExporter();
  const objText = exporter.parse(state.model);
  const blob = new Blob([objText], { type: 'text/plain' });
  downloadBlob(blob, `atelier3d_${state.spec.mode}_${fileStamp()}.obj`);
  setStatus('✓ OBJを保存しました(形状のみ。テクスチャ付きはGLBを推奨)');
  window.__lastExport = { format: 'obj', bytes: blob.size };
});

$('shotBtn').addEventListener('click', () => {
  // WebGLの描画バッファはフレーム後に消えるため、描画直後に同期で取得する
  renderer.render(scene, camera);
  const url = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = url;
  a.download = `atelier3d_shot_${fileStamp()}.png`;
  a.click();
  setStatus('✓ スクリーンショットを保存しました');
});

$('walkBtn').addEventListener('click', () => {
  if (state.walking) exitWalk();
  else startWalk();
});

// ---------------- テスト用フック ----------------
window.__atelier = {
  generate: async (text, mode = 'auto', quality = 1024) => {
    $('prompt').value = text;
    state.mode = mode;
    state.quality = quality;
    await generate();
    return window.__lastGenerated;
  },
  parsePrompt,
  state,
  maxTex: MAX_TEX,
};
setStatus('準備完了。指示を書くか、部屋・家具・建物の写真をアップロードして「3Dモデルを生成」を押してください。');
