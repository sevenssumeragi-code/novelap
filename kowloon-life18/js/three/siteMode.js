// ============================================================
// 敷地探索モード — 本体ゲームへの接続層
//
// STEP 4 まで site_test.html だけで動いていた
//   敷地 (site.js) / 施設区画 (lots.js) / 一人称プレイヤー (js/player/*)
// を、既存ゲーム本体 (game.js) から使えるようにまとめたもの。
//
// 設計方針:
//   ・game.js 側の変更を最小にする。ここが窓口になって差分を吸収する。
//   ・既存のゲームロジック (会話・スケジュール・ガチャ・セーブ) は一切呼び変えない。
//     startDialogue / buildFacility など、既存の関数をそのまま呼ぶ。
//   ・旧タワー方式は消さない。SITE_MODE_ENABLED=false でそのまま戻せる。
//
// 接続しているのは book (九龍書店) 1軒だけ。他23施設は旧方式のまま。
// ============================================================
import * as THREE from 'three';

import { createSite, applySiteAtmosphere, SITE_SPAWN, SITE_LOT_FLOOR } from './site.js';
import { createFacilityLot, LOT_STATE } from './lots.js';
import { CAMERA_SETTINGS } from '../player/settings.js';
import { Input } from '../player/input.js';
import { Player } from '../player/player.js';
import { PlayerController } from '../player/controller.js';

/** 新方式へ接続済みの施設。ここに増やしていく (STEP 7) */
// STEP 7 前半: book に加えて donut / ramen / karaoke / cake の4軒を新方式へ。
// この配列に fid を足し、facilities.js に lot/entrance を書き、
// lots.js の INTERIOR_COLLIDERS と siteMode の LOCAL_ANCHORS を足せば1軒増える。
const MIGRATED_FACILITIES = ['book', 'donut', 'ramen', 'karaoke', 'cake'];

/** 敷地の床の高さ (広場 = 書店の床) */
const PLAZA_FLOOR = 0.18;

/** デバッグ表示で居場所を追う主要人物 */
const WATCHED = ['LENNY', 'HYU', 'JIN', 'MUNI', 'GERU', 'NEO', 'KANE'];

/**
 * 敷地モードでのNPCの表示倍率。
 *
 * characters.js は `scale × 1.35` でメッシュを組んでおり、
 * 標準体格 (chars.js の scale ≈ 1.0) だと頭頂まで約 1.8m ある。
 * プレイヤーの目線が 1.6m なので、一人称だと見上げる形になり大きすぎる。
 * ここで 0.8 倍にして頭頂 ≈ 1.45m にする。
 *
 * ★ chars.js の scale は変更しない (旧タワー方式の見た目を壊さないため)。
 *    敷地モードのときだけ、メッシュ側に倍率を掛ける。
 */
const NPC_SCALE = 0.8;

/** characters.js が内部で掛けている固定倍率 */
const CHAR_MESH_BASE_SCALE = 1.35;

// ------------------------------------------------------------
// NPC の立ち位置
//
// 既存 game.js の locAnchors と同じ形式:
//   locId → { y, points: [[x, z], ...] }
// 同じ場所に複数人いると points を順番に配るので、重ならない位置を選ぶ。
// ------------------------------------------------------------

/** 路地A・路地B (どちらも床 y=0) */
const GROUND_ANCHORS = {
  y: 0,
  points: [[0, 8.0], [0, 5.2], [0.2, 2.4], [-0.2, -0.6], [2.6, -0.9], [4.8, -0.9], [6.6, -0.9]],
};

/**
 * 店内の立ち位置は「店のローカル座標」で持つ。
 *
 * ローカル空間は floors.js の INTERIORS と同じで、
 *   x: 間口方向 ±7 / z: 奥行き方向 (-5 が奥の壁、+5 が入口側)
 * これを店ごとの原点と向きでワールドへ変換する (makeAnchors)。
 * 施設が増えてもワールド座標を手で書き直さなくて済む。
 *
 * 各点は floors.js の什器座標を避け、入口 (z ≈ +5) からも 1.8m 以上離してある。
 */
const LOCAL_ANCHORS = {
  // 本棚(z=-4.2) / 平台(z=+1.0) / 読書席(x=4.5,z=2.2) を避ける
  book: [[-4.5, -2.0], [-2.0, -1.0], [1.0, -2.2], [4.0, -1.5], [-3.5, 2.0], [2.5, 3.0]],
  // カウンター(z=-2.8, 幅7.2) / 券売機(5.5,-3.5) を避ける
  ramen: [[-4.5, -2.0], [-5.5, 0.5], [0, -0.6], [2.6, -0.6], [-2.0, 1.8], [4.0, 2.4]],
  // ショーケース(-1,-2.5, 幅5.2) / 丸テーブル(2.5,1.5)(-3.5,1.5) を避ける
  donut: [[-5.2, -3.0], [4.2, -2.2], [-1.0, -0.6], [1.0, 0.6], [-1.5, 2.6], [4.5, 3.2]],
  // ステージ(-3,-3.2, 4×2.5) / ソファ(3,2.22) / テーブル(3,0.6) を避ける
  karaoke: [[-5.5, 0.5], [-2.0, 0.5], [0.5, -3.0], [5.5, -3.0], [0.0, 2.5], [5.5, 2.5]],
  // ショーケース(-1.5,-3.5) / ホールケーキ台(2.5,-3.8) / カフェ席(2.5,-0.5)(4.5,1.5) を避ける
  cake: [[-5.2, -3.0], [-1.5, -1.8], [1.0, -1.5], [4.8, -3.0], [-2.5, 1.5], [1.0, 2.8]],
};

/**
 * 店のローカル座標を locAnchors 形式のワールド座標へ変換する。
 * 区画の原点 = areaBox の中心、向き = FACILITIES[fid].lot.rot。
 */
function makeAnchors(lot, floorY) {
  const c = lot.areaBox.getCenter(new THREE.Vector3());
  const rot = lot.facility.lot?.rot ?? 0;
  const cos = Math.cos(rot);
  const sin = Math.sin(rot);
  const pts = LOCAL_ANCHORS[lot.id] ?? LOCAL_ANCHORS.book;
  return {
    y: floorY,
    points: pts.map(([lx, lz]) => [c.x + lx * cos + lz * sin, c.z - lx * sin + lz * cos]),
  };
}

// ============================================================
// 生成
// ============================================================

/**
 * @param {{
 *   scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer,
 *   game: object, locAnchors: object, npcs: object, state: object, clock: object,
 *   chars: object, allIds: string[], testMode?: boolean,
 *   actions: { startDialogue: Function, buildFacility: Function, toast: Function,
 *              sfx: Function, isBuilt: Function, refreshNpcs: Function },
 * }} ctx
 */
export async function createSiteMode(ctx) {
  const { scene, camera, renderer, game, locAnchors, npcs, state, clock,
          chars, allIds, actions, testMode = false } = ctx;

  // ---- 敷地と施設区画 ----
  const site = createSite();
  /** 新方式へ接続済みの区画: fid → lot */
  const lots = {};
  for (const fid of MIGRATED_FACILITIES) {
    const lot = createFacilityLot(fid, { floorY: SITE_LOT_FLOOR[fid] ?? 0 });
    site.addLot(lot);
    lots[fid] = lot;
  }
  const bookLot = lots.book; // STEP 4〜6 のテストが参照している名前を残す
  scene.add(site.group);
  applySiteAtmosphere(scene); // 既存の昼夜処理は scene.fog.color を書き換えるだけなので共存できる

  // ---- カメラを一人称に合わせる ----
  camera.fov = CAMERA_SETTINGS.fov;
  camera.near = CAMERA_SETTINGS.near;
  camera.far = CAMERA_SETTINGS.far;
  camera.updateProjectionMatrix();

  // ---- プレイヤー ----
  const player = new Player();
  player.teleport(SITE_SPAWN.position, SITE_SPAWN.yaw);

  /** 会話中・モーダル中は操作を止める */
  let suspended = false;

  const ui = buildOverlay(testMode);

  const input = new Input(renderer.domElement, {
    onPointerLockChange: (locked) => {
      show(ui.crosshair, locked);
      if (!locked) show(ui.prompt, false);
      show(ui.resume, !locked && !suspended);
      show(ui.escHint, locked);
    },
  });

  const controller = new PlayerController(player, input, {
    getColliders: () => site.colliders,
    onFall: () => player.teleport(SITE_SPAWN.position, SITE_SPAWN.yaw),
  });

  // ---- 視線判定 ----
  //
  // ★ 必ず setFromCamera() を使うこと。ray.set() では Raycaster.camera が null のままで、
  //   NPC の子にある Sprite (レニィの zzz・会話の吹き出し) を判定した瞬間に
  //   Sprite.raycast の中で raycaster.camera.matrixWorld を読んで毎フレーム落ちる。
  const ray = new THREE.Raycaster();
  const NDC_CENTER = new THREE.Vector2(0, 0); // 画面中央 = クロスヘアの位置
  let target = null; // { kind, charId?, message, action }

  // ============================================================
  // 施設の状態を state から求める
  //
  // 新しいフラグは作らない。既存の
  //   state.tower              … 建っている (isBuilt の根拠)
  //   state.unlockedFacilities … 開業権あり・未開店
  // だけを見る。
  // ============================================================
  function facilityState(fid) {
    if (actions.isBuilt(fid)) return LOT_STATE.OPENED;
    if (state.unlockedFacilities?.includes(fid)) return LOT_STATE.UNLOCKED;
    return LOT_STATE.LOCKED;
  }

  function syncFacilities() {
    for (const fid of MIGRATED_FACILITIES) lots[fid].setState(facilityState(fid));
    applyAnchors();
  }

  /** 新方式へ接続済みの施設と GROUND の立ち位置を差し替える */
  function applyAnchors() {
    locAnchors.GROUND = { ...GROUND_ANCHORS };
    for (const fid of MIGRATED_FACILITIES) {
      locAnchors[fid] = makeAnchors(lots[fid], SITE_LOT_FLOOR[fid] ?? 0);
    }
  }

  // ============================================================
  // エリア判定 — これが game.currentLocation() の中身になる
  // ============================================================
  function getCurrentLocation() {
    return site.getAreaAt(player.position);
  }

  /** その場所のNPCがプレイヤーから見えるか */
  function isLocVisible(loc) {
    return loc === 'GROUND' || MIGRATED_FACILITIES.includes(loc);
  }

  // ============================================================
  // 旧タワーの隠蔽
  // ============================================================
  function onTowerRebuilt(towerObjects) {
    for (const o of towerObjects) if (o) o.visible = false;
    applyAnchors();
    for (const fid of MIGRATED_FACILITIES) lots[fid].setState(facilityState(fid));
  }

  // ============================================================
  // NPC
  // ============================================================

  /**
   * 一人称で見たときに大きすぎないよう、NPCメッシュを縮める。
   * 絶対値で設定するので、何度呼んでも倍率が累積しない。
   * 吹き出し・zzz はメッシュの子なので、一緒に比率どおり下がる。
   */
  function applyNpcScale() {
    for (const id of allIds) {
      const n = npcs[id];
      if (!n?.mesh) continue;
      const base = (chars[id]?.scale ?? 1) * CHAR_MESH_BASE_SCALE;
      n.mesh.scale.setScalar(base * NPC_SCALE);
    }
  }

  /**
   * そのNPCが今いる場所は敷地に出ているか。移動中かどうかはここでは見ない。
   */
  function shouldShowNpc(id, schedule) {
    if (id === 'THIEF' && !game.thiefPresent?.()) return false;
    const sch = schedule ?? lastSchedule;
    if (!sch) return false;
    return isLocVisible(sch.locationOf(id));
  }

  /**
   * NPCが移動中か。
   *
   * game.js は場所が変わったNPCを 1.2 秒かけて旧アンカーから新アンカーへ
   * 「直線で」lerp する (game.js の n.t / n.from / n.to)。
   * 旧タワー方式は階の外が見えないので問題にならなかったが、
   * 敷地モードでは壁も店も突き抜けて目の前を通り過ぎて見えてしまう。
   */
  function isNpcTraveling(n) {
    return n.t < 1;
  }

  function updateNpcVisibility(schedule) {
    lastSchedule = schedule ?? lastSchedule;
    for (const id of allIds) {
      const n = npcs[id];
      if (!n) continue;
      n.mesh.visible = !isNpcTraveling(n) && shouldShowNpc(id, schedule);
    }
  }

  /**
   * 移動中のNPCを消し、着いたら出す。毎フレーム呼ぶ。
   *
   * updateNpcVisibility はスケジュール更新時にしか呼ばれないため、
   * 移動の開始と終了に追随できるのはこちらだけ。
   *
   * ★ game.js の移動処理そのものには手を入れない。
   *   経路探索を入れるのは大掛かりで、旧タワー方式の見た目も変わってしまう。
   *   「移動中は見えない」だけなら、敷地モード側だけで完結する。
   */
  function updateNpcTravelVisibility() {
    for (const id of allIds) {
      const n = npcs[id];
      if (!n?.mesh) continue;
      const want = !isNpcTraveling(n) && shouldShowNpc(id);
      if (n.mesh.visible !== want) n.mesh.visible = want;
    }
  }

  /** 近くのNPCがプレイヤーの方を向く (演出のみ。ゲームロジックには影響しない) */
  function updateNpcFacing() {
    for (const id of allIds) {
      const n = npcs[id];
      if (!n?.mesh.visible) continue;
      const dx = player.position.x - n.mesh.position.x;
      const dz = player.position.z - n.mesh.position.z;
      const d2 = dx * dx + dz * dz;
      if (d2 > 25 || d2 < 0.04) continue; // 5m 以内
      let diff = Math.atan2(dx, dz) - n.mesh.rotation.y;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      n.mesh.rotation.y += diff * 0.12;
    }
  }

  // ============================================================
  // 視線の先の対象
  // ============================================================
  function updateTarget() {
    target = null;
    if (suspended || !input.pointerLocked) {
      ui.crosshair.classList.remove('sm-active');
      show(ui.prompt, false);
      return;
    }

    // 画面中央から前方へ。camera も一緒に設定されるので Sprite も安全に判定できる
    ray.setFromCamera(NDC_CENTER, camera);
    ray.near = 0;
    ray.far = 3.2;

    const charId = findNpcTarget();
    if (charId) {
      target = {
        kind: 'npc',
        charId,
        message: `${chars[charId]?.name ?? charId} と話す`,
        action: () => actions.startDialogue(charId),
      };
    }

    if (!target && site.interactables.length) {
      const hits = ray.intersectObjects(site.interactables, false);
      for (const h of hits) {
        let node = h.object;
        while (node && !node.userData.interactable) node = node.parent;
        if (!node) continue;
        target = buildLotTarget(node.userData.interactable);
        break;
      }
    }

    ui.crosshair.classList.toggle('sm-active', !!target);
    show(ui.prompt, !!target);
    if (target) ui.prompt.textContent = `[E] ${target.message}`;
  }

  /**
   * 視線の先にいるNPCを探す。
   *
   * ★ メッシュへのレイキャストは使わない。理由は2つ:
   *   1. NPCの子には Sprite (zzz・吹き出し) がぶら下がっており、
   *      Sprite へのレイキャストは Raycaster.camera を要求する。事故の温床だった。
   *   2. NPCを0.8倍にしたことで身長がプレイヤーの目線(1.6m)前後になった。
   *      水平に見ると頭の上を素通りしてしまう。
   *
   * 代わりに「NPCの体 = 足元から頭までの垂直な線分」とみなし、
   * 視線との最短距離が体の太さ以内なら狙っているとみなす。
   * 角度判定と違い、近距離でも自然に当たる
   * (1.5m先の相手の頭は視線から19度下がるため、角度判定では取りこぼす)。
   */
  const viewDir = new THREE.Vector3();
  const toNpcVec = new THREE.Vector3();
  const rayPoint = new THREE.Vector3();
  const bodyPoint = new THREE.Vector3();
  const INTERACT_DIST = 3.4;   // 話しかけられる距離 (m)
  const BODY_RADIUS = 0.6;     // 体の当たりの太さ (m)

  /** そのNPCのメッシュ倍率 (characters.js の内部倍率 × 敷地モードの縮小) */
  function meshScaleOf(id) {
    return (chars[id]?.scale ?? 1) * CHAR_MESH_BASE_SCALE * NPC_SCALE;
  }

  function findNpcTarget() {
    camera.getWorldDirection(viewDir);
    let best = null;

    for (const id of allIds) {
      const n = npcs[id];
      if (!n?.mesh.visible) continue;

      const feetY = n.mesh.position.y;
      const headY = feetY + 1.35 * meshScaleOf(id);   // ローカル y=1.0 が頭、+半径ぶん

      // 視線方向への投影距離
      toNpcVec.set(
        n.mesh.position.x - camera.position.x,
        (feetY + headY) / 2 - camera.position.y,
        n.mesh.position.z - camera.position.z
      );
      const t = toNpcVec.dot(viewDir);
      if (t < 0.2 || t > INTERACT_DIST) continue;

      // 視線上の最近点と、NPCの体(垂直線分)上の最近点の距離
      rayPoint.copy(camera.position).addScaledVector(viewDir, t);
      bodyPoint.set(
        n.mesh.position.x,
        THREE.MathUtils.clamp(rayPoint.y, feetY, headY),
        n.mesh.position.z
      );
      const gap = rayPoint.distanceTo(bodyPoint);
      if (gap > BODY_RADIUS) continue;
      if (best && gap >= best.gap) continue;   // より中央に近い相手を優先

      // 壁越しでないか
      toNpcVec.set(
        bodyPoint.x - camera.position.x,
        bodyPoint.y - camera.position.y,
        bodyPoint.z - camera.position.z
      );
      const dist = toNpcVec.length();
      ray.set(camera.position, toNpcVec.divideScalar(dist));
      ray.near = 0;
      ray.far = dist - 0.2;
      if (ray.far > 0 && ray.intersectObjects(site.colliders, false).length > 0) continue;

      best = { id, gap };
    }
    return best?.id ?? null;
  }

  function buildLotTarget(cfg) {
    // cfg.fid は lots.js が setState のときに埋める (どの店を見ているか)
    const fdef = (lots[cfg.fid] ?? bookLot).facility;
    if (cfg.lotState === LOT_STATE.UNLOCKED) {
      return {
        kind: 'lot',
        message: `${fdef.name} を開店する (${fdef.cost}圓)`,
        action: () => openConfirm(fdef),
      };
    }
    if (cfg.lotState === LOT_STATE.LOCKED) {
      return { kind: 'lot', message: cfg.message, action: () => actions.toast('🔒 ' + cfg.message) };
    }
    return null; // opened は素通りで入れるので何も出さない
  }

  // ============================================================
  // 開店の確認UI
  // ============================================================
  function openConfirm(fdef) {
    const enough = state.yen >= fdef.cost;
    ui.confirmBody.innerHTML =
      `<div class="sm-ttl">🏬 ${fdef.name}</div>` +
      `<div class="sm-sub">開業権を持っています。${fdef.cost}圓を払って開店しますか?</div>` +
      `<div class="sm-sub">所持: ${state.yen}圓</div>` +
      (enough ? '' : '<div class="sm-warn">圓が足りません</div>');
    ui.confirmOk.disabled = !enough;
    ui.confirmOk.onclick = () => {
      closeConfirm();
      actions.buildFacility(fdef.id); // ← 既存関数。state.tower の形式は変わらない
    };
    confirmSuspend = true;
    applySuspend();
    show(ui.confirm, true);
  }

  function closeConfirm() {
    show(ui.confirm, false);
    confirmSuspend = false;
    applySuspend();
  }
  ui.confirmCancel.onclick = closeConfirm;

  // ============================================================
  // 操作の停止 / 再開
  // ============================================================
  // 操作を止める理由は複数あり、同時に成り立つ。
  // どれか1つでも成立していれば止め、すべて解けたときだけ再開する。
  // (会話中にガチャ画面を開いて閉じても、会話が続く限り歩き出さない)
  let externalSuspend = false;  // game.js から: 会話中
  let modalSuspend = false;     // 既存UI (ガチャ/図鑑/手紙/ログ…) が開いている
  let confirmSuspend = false;   // 開店確認ダイアログ

  function applySuspend() {
    setSuspended(externalSuspend || modalSuspend || confirmSuspend);
  }

  // 既存の画面は el.style.display で開閉する。既存ファイルへ手を入れずに
  // 済ませるため、siteMode 側から表示状態を毎フレーム見に行く。
  const MODAL_IDS = [
    'gacha-modal', 'build-modal', 'dict-modal', 'help-modal', 'letters-modal',
    'log-modal', 'shop-modal', 'target-modal', 'wishes-modal', 'letter-view',
  ];
  const modalEls = MODAL_IDS
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  function anyModalOpen() {
    for (const el of modalEls) {
      const d = el.style.display;
      if (d && d !== 'none') return true;
    }
    return false;
  }

  function syncModalSuspend() {
    const open = anyModalOpen();
    if (open === modalSuspend) return;
    modalSuspend = open;
    applySuspend();
  }

  function setSuspended(next) {
    if (next === suspended) return;
    suspended = next;
    controller.enabled = !next;
    if (next) {
      input.exitPointerLock();
      show(ui.crosshair, false);
      show(ui.prompt, false);
      show(ui.resume, false);
      show(ui.escHint, false);
    } else {
      show(ui.resume, !input.pointerLocked);
    }
  }

  function setControlEnabled(enabled) { externalSuspend = !enabled; applySuspend(); }

  // ============================================================
  // 入力
  // ============================================================
  function toggleDebug(force) {
    const nowHidden = ui.debug.classList.contains('sm-hide');
    const wantVisible = force === undefined ? nowHidden : force;
    show(ui.debug, wantVisible);
    ui.toggle.classList.toggle('sm-on', wantVisible);
    if (wantVisible) renderDebug();
  }
  ui.toggle.onclick = (e) => { e.stopPropagation(); toggleDebug(); };

  window.addEventListener('keydown', (e) => {
    // F3 はブラウザの検索バーに取られることがあるので、F2 と F3 の両方を受ける
    if (e.code === 'F3' || e.code === 'F2') {
      e.preventDefault();
      e.stopPropagation();
      toggleDebug();
      return;
    }
    if (e.code === 'Escape' && !ui.confirm.classList.contains('sm-hide')) {
      closeConfirm();
      return;
    }
    if (e.code === 'KeyE' && !suspended && input.pointerLocked && target) {
      e.preventDefault();
      const t = target;
      target = null;
      show(ui.prompt, false);
      t.action();
    }
  }, true); // capture で先に受ける

  function onCanvasClick() {
    if (suspended) return;
    if (!input.pointerLocked) input.requestPointerLock();
  }
  ui.resume.addEventListener('click', () => input.requestPointerLock());

  // ============================================================
  // 開発用のテスト操作
  //
  // 既存の state フィールドだけを触る。新しいフラグは作らない。
  // ガチャで book が出る確率は 0.444%/回 (期待225回=2250コイン) なので、
  // 新方式の動作確認にはこの近道が要る。TEST_MODE のときだけ出る。
  // ============================================================
  function wireTools() {
    if (!ui.tools) return;
    const on = (id, fn) => {
      const b = ui.tools.querySelector('#' + id);
      if (b) b.onclick = (e) => { e.stopPropagation(); fn(); renderDebug(); };
    };
    // STEP 7: 移行済みの5軒すべてに効くようにした
    on('sm-t-unlock', () => {
      for (const fid of MIGRATED_FACILITIES) {
        if (!state.unlockedFacilities.includes(fid) && !actions.isBuilt(fid)) {
          state.unlockedFacilities.push(fid);
        }
      }
      syncFacilities();
      actions.toast(`🎰 移行済み${MIGRATED_FACILITIES.length}軒の開業権を入手した (テスト)`);
    });
    on('sm-t-open', () => {
      const todo = MIGRATED_FACILITIES.filter((fid) => !actions.isBuilt(fid));
      if (!todo.length) { actions.toast('すでに全部開店しています'); return; }
      for (const fid of todo) {
        if (!state.unlockedFacilities.includes(fid)) state.unlockedFacilities.push(fid);
        const need = lots[fid].facility.cost;
        if (state.yen < need) { state.yen = need; game.addYen?.(0); }
        actions.buildFacility(fid);   // ← 既存関数をそのまま呼ぶ
      }
    });
    on('sm-t-reset', () => {
      state.tower = state.tower.filter(
        (t) => !(t.kind === 'shop' && MIGRATED_FACILITIES.includes(t.id))
      );
      state.unlockedFacilities = state.unlockedFacilities.filter(
        (x) => !MIGRATED_FACILITIES.includes(x)
      );
      syncFacilities();
      actions.refreshNpcs?.(true);
      actions.toast('🔒 移行済みの店を未取得に戻した (テスト)');
    });
    on('sm-t-time', () => {
      if (clock) clock.minute = 960; // 16:00 — 住人が各店へ来る時間帯
      actions.refreshNpcs?.(true);
      actions.toast('🕐 16:00 にした (住人が店へ来る時間帯)');
    });
  }
  wireTools();

  // ============================================================
  // 毎フレーム
  // ============================================================
  let debugAcc = 0;
  let fps = 60;
  let lastSchedule = null;

  // ============================================================
  // コイン (STEP 6 で「敷地モードでは拾えない」と報告した問題への最小対応)
  //
  // 既存の respawnCoins() は、旧タワーの各店内の hidingSpots に
  // coinsForDay(店数) 枚を置き、クリックで collectCoin() する。
  // 敷地モードでは旧タワーが非表示なので拾えなかった。
  //
  // ここでは生成側に一切触れず、
  //   ・既にある coin メッシュを 3D店内 (同じローカル座標系) へ入れ替える
  //   ・一人称なのでクリックではなく「近づいたら拾う」
  // だけを行う。報酬量 (1枚=1コイン)・出現枚数・ガチャ価格は変更しない。
  // ============================================================
  // 拾える範囲は「目線から手を伸ばして届く距離」の3D距離で見る。
  //
  // 以前は水平75cmだけで判定していたが、什器の上に隠れたコインが
  // 永久に拾えなかった。什器には当たり判定があるので、その手前までしか
  // 近づけないため:
  //   ・書店の平台 (floors.js の [0, 0.82, 1.0]) … 最短 0.88m
  //   ・ラーメンのカウンター上 ([2.5, 1.1, -3.0]) … 最短 0.96m
  // どちらも 75cm には入れない。高さではなく水平距離が原因だった。
  //
  // 1.45m あれば、いちばん奥まった什器の上 (最短 1.03m) にも手が届き、
  // かつ「隣の什器のコインまで巻き込む」ほど広くはない。
  // 隠し場所の最も高い点は y=1.2 (+コインの浮き 0.25) なので、
  // 目線 1.6m から見下ろす形になり、ジャンプで乗る必要はない。
  const COIN_REACH = 1.45;
  const COIN_REACH2 = COIN_REACH * COIN_REACH;
  const coinList = actions.coins;
  const coinVec = new THREE.Vector3();
  const coinEye = new THREE.Vector3();

  function updateCoins(dt) {
    if (!coinList?.length) return;
    // 手の位置 (目線と同じ高さで扱う)
    coinEye.set(player.position.x, player.position.y + player.eyeHeight, player.position.z);
    for (let i = coinList.length - 1; i >= 0; i -= 1) {
      const c = coinList[i];
      const lot = lots[c.loc];
      if (!lot || lot.getState() !== LOT_STATE.OPENED) continue;

      // 旧タワーの階層に居るままなら、店内へ移す (position はそのまま使える)
      if (c.mesh.parent !== lot.interiorGroup) {
        lot.interiorGroup.add(c.mesh);
        c.mesh.visible = true;
      }
      c.mesh.rotation.y += (c.mesh.userData.spin ?? 2) * dt;

      // 接触で取得
      c.mesh.getWorldPosition(coinVec);
      // 店の中にいることを条件にする。壁越し・入口の外から吸い取るのを防ぐ。
      if (!lot.areaBox.containsPoint(player.position)) continue;
      if (coinVec.distanceToSquared(coinEye) < COIN_REACH2) {
        actions.collectCoin?.(c);
      }
    }
  }

  /**
   * 店内のポイントライトは、プレイヤーがその店にいる (or 入口を覗ける距離にいる)
   * ときだけ点ける。開店数が増えても同時に点くのは1〜2軒ぶんに収まる。
   */
  const lightProbe = new THREE.Vector3();
  function updateInteriorLights() {
    for (const fid of MIGRATED_FACILITIES) {
      const lot = lots[fid];
      const b = lot.areaBox;
      // 店内 + 入口の外 3m まで
      lightProbe.copy(player.position).clamp(b.min, b.max);
      lot.setInteriorLights(lightProbe.distanceToSquared(player.position) < 9);
    }
  }

  function update(dt, schedule) {
    lastSchedule = schedule ?? lastSchedule;
    syncModalSuspend();
    controller.update(dt);
    updateInteriorLights();
    updateCoins(dt);
    site.update(dt);
    player.syncCamera(camera);
    updateNpcTravelVisibility();  // ← 移動中のNPCを消す。updateTarget より前に置くこと
    updateNpcFacing();
    updateTarget();
    input.endFrame();

    fps = fps * 0.92 + (1 / Math.max(dt, 1e-6)) * 0.08;
    debugAcc += dt;
    if (debugAcc > 0.3) {
      debugAcc = 0;
      if (!ui.debug.classList.contains('sm-hide')) renderDebug();
    }
  }

  function renderDebug() {
    const info = renderer.info.render;
    const p = player;
    const sch = lastSchedule;

    // 近くのNPC
    const near = [];
    for (const id of allIds) {
      const n = npcs[id];
      if (!n?.mesh.visible) continue;
      const d = n.mesh.position.distanceTo(p.position);
      if (d < 10) near.push(`${chars[id]?.name ?? id} ${d.toFixed(1)}m`);
    }

    // 主要人物の現在地 (敷地に見えているかどうかも出す)
    let whereLines = '';
    if (sch) {
      for (const id of WATCHED) {
        const loc = sch.locationOf(id);
        const mark = isLocVisible(loc) ? '●' : '·';
        whereLines += `  ${mark} ${(chars[id]?.name ?? id).padEnd(6)} ${loc}\n`;
      }
    }

    const hh = clock ? String(Math.floor(clock.minute / 60)).padStart(2, '0') : '--';
    const mm = clock ? String(Math.floor(clock.minute % 60)).padStart(2, '0') : '--';

    ui.debugBody.innerHTML =
      `<b>敷地モード (STEP 7)</b>\n` +
      `時刻          ${hh}:${mm}\n` +
      `Current Area  ${getCurrentLocation()}\n` +
      `コイン/圓      ${state.coins} / ${state.yen}` +
      `   (未回収 ${coinList?.length ?? 0}枚)\n` +
      `\n` +
      `<b>移行済みの店</b> (状態 / 開業権)\n` +
      MIGRATED_FACILITIES.map((fid) =>
        `  ${lots[fid].facility.name.padEnd(9)} ${lots[fid].getState().padEnd(9)}` +
        ` ${state.unlockedFacilities?.includes(fid) ? '権あり' : '—'}\n`).join('') +
      `\n` +
      `X ${p.position.x.toFixed(2).padStart(7)}   Y ${p.position.y.toFixed(2).padStart(6)}\n` +
      `Z ${p.position.z.toFixed(2).padStart(7)}   速度 ${p.horizontalSpeed.toFixed(2)}\n` +
      `視点 ${input.pointerLocked ? 'LOCKED' : 'unlocked'}   接地 ${p.isGrounded ? 'y' : 'n'}\n` +
      `\n` +
      `FPS ${fps.toFixed(0)}   draw ${info.calls}   tri ${info.triangles.toLocaleString()}\n` +
      `\n` +
      `<b>主要人物の居場所</b> (●=敷地に出現)\n` +
      (whereLines || '  (スケジュール未取得)\n') +
      `\n` +
      `<b>近くのNPC</b>\n` +
      (near.length ? '  ' + near.join('\n  ') : '  (なし)');
  }

  // ---- 初期化 ----
  syncFacilities();
  applyNpcScale();     // 一人称に合わせてNPCを縮める
  toggleDebug(true);   // 開発中は最初から出しておく

  console.info('[siteMode] UI要素:', {
    crosshair: !!ui.crosshair, prompt: !!ui.prompt, debug: !!ui.debug,
    debugBody: !!ui.debugBody, toggle: !!ui.toggle, tools: !!ui.tools, confirm: !!ui.confirm,
  });
  console.info('[siteMode] 移行済みの店:',
    MIGRATED_FACILITIES.map((fid) => `${fid}=${lots[fid].getState()}`).join(' '));

  // 既存メニュー(ガチャ等)が存在するか自己点検し、無ければ画面に出す。
  // 「ガチャが無い」= 別ページを開いている、を切り分けるため。
  try {
    const path = globalThis.location?.pathname ?? '';
    const menuEl = document.getElementById('btn-gacha');
    if (!menuEl) {
      ui.tag.textContent = '⚠ ガチャボタンが見つかりません (index.html を開いていますか?)';
      ui.tag.style.background = 'rgba(90,20,32,0.95)';
      ui.tag.style.color = '#ffd0d8';
      console.warn('[siteMode] #btn-gacha が無い → site_test.html など別ページの可能性');
    } else {
      ui.tag.textContent = `✅ kowloon-life18 / 敷地モード / ガチャ検出OK`;
    }
    console.info('[siteMode] 表示中:', path || '(不明)');
  } catch (e) {
    console.warn('[siteMode] 自己点検をスキップ:', e.message);
  }

  return {
    site, bookLot, lots, migrated: MIGRATED_FACILITIES, player, input, controller,
    update, getCurrentLocation, isLocVisible, updateNpcVisibility,
    syncFacilities, onTowerRebuilt, setControlEnabled, onCanvasClick, facilityState,
    toggleDebug, applyNpcScale,
    /** NPCの表示倍率 (調整用) */
    setNpcScale(v) {
      for (const id of allIds) {
        const n = npcs[id];
        if (!n?.mesh) continue;
        n.mesh.scale.setScalar((chars[id]?.scale ?? 1) * CHAR_MESH_BASE_SCALE * v);
      }
    },
    isMigrated: (fid) => MIGRATED_FACILITIES.includes(fid),
    stats: () => site.collectStats(),
    dispose() { input.dispose(); site.dispose(); ui.root.remove(); },
  };
}

/** クラス名の衝突を避けるため、表示切替は専用クラスで行う */
function show(el, visible) {
  if (el) el.classList.toggle('sm-hide', !visible);
}

// ============================================================
// DOM オーバーレイ
//
// index.html には手を入れず、必要な要素をここで作る。
// 既存の HUD / メニュー / 会話パネルとは重ならない位置に置く。
// クラス名は sm- 接頭辞で統一し、既存CSSと衝突しないようにしてある。
// ============================================================
function buildOverlay(testMode) {
  // 既存UIの配置 (index.html):
  //   #hud     左上      #menu   右上 (🎰ガチャ等)   #inv-panel 右side
  //   #hint    左下      #testtools-btn 右下
  // → 敷地モードのUIは「左下から上へ伸ばす単一パネル」に集約し、
  //   右側の既存メニューを絶対に覆わないようにする。
  const root = document.createElement('div');
  root.id = 'site-mode-ui';
  root.innerHTML = `
    <style>
      #site-mode-ui .sm-hide { display: none !important; }
      #sm-crosshair {
        position: fixed; top: 50%; left: 50%; width: 5px; height: 5px;
        margin: -2.5px 0 0 -2.5px; border-radius: 50%;
        background: rgba(255,255,255,0.6); box-shadow: 0 0 4px rgba(0,0,0,0.9);
        pointer-events: none; z-index: 14; transition: transform .12s, background .12s;
      }
      #sm-crosshair.sm-active { background: #ffca6a; transform: scale(1.8); }
      #sm-prompt {
        position: fixed; top: calc(50% + 26px); left: 50%; transform: translateX(-50%);
        padding: 6px 14px; font-size: 13px; white-space: nowrap; z-index: 14;
        background: rgba(14,14,22,0.9); border: 1px solid rgba(255,200,106,0.45);
        border-radius: 5px; pointer-events: none; color: #f0e8d8;
      }
      #sm-resume {
        position: fixed; bottom: 54px; left: 50%; transform: translateX(-50%);
        padding: 9px 22px; font-size: 13px; z-index: 14; cursor: pointer; color: #f0e8d8;
        background: rgba(14,14,22,0.9); border: 1px solid rgba(255,200,106,0.45);
        border-radius: 20px;
      }
      #sm-eschint {
        position: fixed; bottom: 16px; left: 50%; transform: translateX(-50%);
        font-size: 11.5px; color: #b8b0a0; z-index: 13; pointer-events: none;
        background: rgba(14,14,22,0.72); padding: 4px 12px; border-radius: 12px;
      }
      /* --- 左下の縦積み。右上の #menu (ガチャ等) を絶対に覆わない --- */
      #sm-tag {
        position: fixed; left: 10px; bottom: 46px; z-index: 16;
        font-size: 11px; padding: 4px 10px; color: #cfe4ff; pointer-events: none;
        background: rgba(20,34,56,0.92); border: 1px solid rgba(140,190,255,0.45);
        border-radius: 12px;
      }
      #sm-toggle {
        position: fixed; left: 10px; bottom: 74px; z-index: 16; cursor: pointer;
        font-family: inherit; font-size: 11.5px; padding: 5px 10px; color: #f0e8d8;
        background: rgba(30,40,60,0.92); border: 1px solid rgba(140,190,255,0.5);
        border-radius: 6px;
      }
      #sm-toggle.sm-on { background: #2a4a70; border-color: #8cbeff; }
      #sm-debug {
        position: fixed; left: 10px; bottom: 106px; z-index: 15; padding: 10px 12px;
        width: 268px; max-height: 52vh; overflow-y: auto;
        font-family: ui-monospace, Consolas, monospace; font-size: 11px; line-height: 1.6;
        white-space: pre; color: #cfd8e4; background: rgba(10,14,22,0.94);
        border: 1px solid rgba(140,190,255,0.4); border-radius: 8px;
      }
      #sm-debug b { color: #8cbeff; }
      #sm-tools {
        display: flex; flex-direction: column; gap: 4px; margin-top: 8px;
        padding-top: 8px; border-top: 1px dashed rgba(140,190,255,0.3);
      }
      #sm-tools button {
        font-family: inherit; font-size: 11px; padding: 5px 9px; cursor: pointer;
        color: #f0e8d8; background: rgba(60,30,50,0.92);
        border: 1px solid #a5607a; border-radius: 6px; white-space: nowrap; text-align: left;
      }
      #sm-tools button:hover { background: rgba(100,50,80,0.96); }
      #sm-confirm {
        position: fixed; inset: 0; display: grid; place-items: center;
        background: rgba(4,4,12,0.72); z-index: 26;
      }
      #sm-confirm .sm-box {
        width: min(420px, 92vw); padding: 22px; text-align: center; color: #f0e8d8;
        background: rgba(16,16,28,0.96); border: 1px solid rgba(255,200,106,0.45);
        border-radius: 10px;
      }
      #sm-confirm .sm-ttl { font-size: 17px; color: #ffca6a; margin-bottom: 10px; }
      #sm-confirm .sm-sub { font-size: 13px; color: #d8d0c0; margin-bottom: 4px; }
      #sm-confirm .sm-warn { font-size: 12px; color: #ff8a9a; margin-top: 8px; }
      #sm-confirm .sm-btns { display: flex; gap: 10px; justify-content: center; margin-top: 18px; }
      #sm-confirm button {
        font-family: inherit; font-size: 13px; padding: 8px 18px; cursor: pointer;
        color: #f0e8d8; background: rgba(40,36,56,0.95);
        border: 1px solid rgba(255,200,106,0.45); border-radius: 8px;
      }
      #sm-confirm button:disabled { opacity: .4; cursor: default; }
    </style>
    <div id="sm-crosshair" class="sm-hide"></div>
    <div id="sm-prompt" class="sm-hide"></div>
    <div id="sm-resume">クリックして操作を開始</div>
    <div id="sm-eschint" class="sm-hide">W・↑前進 / ↓後退 / ←→左右 / Shift ダッシュ / E 調べる / Esc カーソル</div>
    <div id="sm-tag">kowloon-life18 / 敷地モード</div>
    <button id="sm-toggle">🛠 敷地デバッグ (F3/F2)</button>
    <div id="sm-debug" class="sm-hide">
      <div id="sm-debug-body"></div>
      ${testMode ? `
      <div id="sm-tools">
        <button id="sm-t-unlock">📜 book 開業権を得る</button>
        <button id="sm-t-open">🏬 book を開店する</button>
        <button id="sm-t-reset">🔒 book を未取得に戻す</button>
        <button id="sm-t-time">🕐 16:00 へ (住人が来る)</button>
      </div>` : ''}
    </div>
    <div id="sm-confirm" class="sm-hide">
      <div class="sm-box">
        <div id="sm-confirm-body"></div>
        <div class="sm-btns">
          <button id="sm-confirm-ok">開店する</button>
          <button id="sm-confirm-cancel">やめる</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(root);

  const q = (sel) => root.querySelector(sel);

  return {
    root,
    crosshair: q('#sm-crosshair'),
    prompt: q('#sm-prompt'),
    resume: q('#sm-resume'),
    escHint: q('#sm-eschint'),
    tag: q('#sm-tag'),
    toggle: q('#sm-toggle'),
    debug: q('#sm-debug'),
    debugBody: q('#sm-debug-body'),
    tools: q('#sm-tools'),
    confirm: q('#sm-confirm'),
    confirmBody: q('#sm-confirm-body'),
    confirmOk: q('#sm-confirm-ok'),
    confirmCancel: q('#sm-confirm-cancel'),
  };
}
