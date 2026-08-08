// ============================================================
// 施設区画 (lot) — 新方式「敷地 + 施設解禁」の中核
//
// 1つの区画が locked / unlocked / opened の3状態を持ち、
// 状態に応じて見た目・当たり判定・調べられる対象が切り替わる。
//
//   locked   … ガチャで開業権をまだ取っていない。シャッター全閉。入れない。
//   unlocked … 開業権はあるが未開店。シャッターが少し開き、中に工事灯。入れない。
//   opened   … 開店済み。シャッターが上がり、看板が点灯。中に入れる。
//
// FACILITIES[id] の lot / entrance / neon / name / sign / type を読むだけなので、
// 同じ関数で24施設すべてを扱える。STEP 4 では book のみ配置情報を持つ。
//
// 店内は既存の three/floors.js の INTERIORS をそのまま流用する
// (14 × 10 × 4 のシェル + 施設別の什器)。floors.js には手を加えていない。
// ============================================================
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// ?v= はブラウザキャッシュ対策。
// facilities.js は本体ゲーム (index.html) でも読まれるため、
// Cache-Control を送らないサーバーで先に本体を開いていると、
// lot を追加する前の版がキャッシュから返ってしまう。
// クエリを変えると URL が変わるので必ず取り直される。
//
// TODO(STEP 5): 本体ゲームと接続する際は、モジュール実体が二重になるのを避けるため
//               このクエリを外し、tools/serve.py (no-store) 前提に戻すこと。
import { FACILITIES } from '../data/facilities.js?v=step7';
import { FLOOR_W, FLOOR_D, FLOOR_H, makeShopInterior } from './floors.js';
import { MATERIALS, createBox, mergeGroupByMaterial } from './builders/roomBuilder.js';
import {
  createDecal,
  createLightSpill,
  createNeonSign,
  createPipe,
  createShutter,
  createSignPlate,
  DECAL_CELL,
} from './builders/propBuilder.js';

export const LOT_STATE = {
  LOCKED: 'locked',
  UNLOCKED: 'unlocked',
  OPENED: 'opened',
};

export const LOT_STATES = [LOT_STATE.LOCKED, LOT_STATE.UNLOCKED, LOT_STATE.OPENED];

const WALL_T = 0.25; // 店舗正面の壁厚

// ------------------------------------------------------------
// 店内の当たり判定 (施設タイプ別)
//
// INTERIORS の什器は見た目専用に作られているため、レイキャストで扱いやすい
// 形にはなっていない。ここで「ぶつかってほしい什器」だけをローカル座標の
// ボックスとして宣言する。座標は floors.js の各ジェネレータと対応させること。
//
// シェル(床・天井・左右壁・奥壁)は全施設共通なので自動生成する。
// ------------------------------------------------------------
const INTERIOR_COLLIDERS = {
  book: [
    // 壁面本棚 ×4 (floors.js: x = -4.5 / -1.5 / 1.5 / 4.5, z = -4.2, 2.6×2.6×0.5)
    { size: [2.6, 2.6, 0.5], position: [-4.5, 1.3, -4.2] },
    { size: [2.6, 2.6, 0.5], position: [-1.5, 1.3, -4.2] },
    { size: [2.6, 2.6, 0.5], position: [1.5, 1.3, -4.2] },
    { size: [2.6, 2.6, 0.5], position: [4.5, 1.3, -4.2] },
    // 平台 (z = +1.0, 2.4×0.7×1.2)
    { size: [2.4, 0.85, 1.2], position: [0, 0.42, 1.0] },
    // 読書席のテーブル (4.5, 2.2) — 椅子は当たり判定を付けない
    { size: [1.15, 0.78, 1.15], position: [4.5, 0.39, 2.2] },
  ],

  // --- STEP 7 で追加した4施設 ---
  // 方針は book と同じ: 体がぶつかって当然の大型什器だけに付ける。
  // 丸椅子・提灯・ドーナツ・皿などの小物には付けない (狭い店内で引っかかるため)。

  ramen: [
    // カウンター w=7 (floors.js: counter(7) を (0,0,-2.8) に配置。天板は +0.2 幅)
    { size: [7.2, 1.08, 0.95], position: [0, 0.54, -2.8] },
    // 券売機 (5.5, -3.5) 0.9×1.6×0.5
    { size: [0.9, 1.6, 0.5], position: [5.5, 0.8, -3.5] },
  ],

  donut: [
    // ショーケース兼カウンター w=5 を (-1,0,-2.5) に配置
    { size: [5.2, 1.45, 0.95], position: [-1, 0.72, -2.5] },
    // 丸テーブル ×2 (2.5,1.5) (-3.5,1.5) — スツールは小物扱い
    { size: [1.05, 0.96, 1.05], position: [2.5, 0.48, 1.5] },
    { size: [1.05, 0.96, 1.05], position: [-3.5, 0.48, 1.5] },
  ],

  karaoke: [
    // ステージ (-3,-3.2) 4×0.25×2.5 — 段差0.25mなので登れる (stepHeight 0.32)
    { size: [4.0, 0.25, 2.5], position: [-3, 0.125, -3.2] },
    // ソファ席 (3, 2.0) 背もたれ込み
    { size: [3.2, 1.0, 1.25], position: [3, 0.5, 2.22] },
    // ソファ前のテーブル (3, 0.6)
    { size: [1.6, 0.56, 0.8], position: [3, 0.28, 0.6] },
  ],

  cake: [
    // ショーケース (-1.5,-3.5) ガラス部分まで含める
    { size: [4.5, 1.55, 0.9], position: [-1.5, 0.78, -3.5] },
    // ホールケーキ台 (2.5,-3.8)
    { size: [1.1, 0.9, 1.1], position: [2.5, 0.45, -3.8] },
    // カフェテーブル ×2
    { size: [0.85, 0.78, 0.85], position: [2.5, 0.39, -0.5] },
    { size: [0.85, 0.78, 0.85], position: [4.5, 0.39, 1.5] },
  ],
};

// ============================================================
// 生成
// ============================================================

/**
 * 施設区画を生成する。
 *
 * @param {string} facilityId FACILITIES のキー (STEP 4 では 'book')
 * @param {{ state?: string, floorY?: number }} [options]
 * @returns {object} lot
 */
export function createFacilityLot(facilityId, options = {}) {
  // options.facility を渡せば FACILITIES を経由せずに配置できる (テスト・キャッシュ回避用)
  const fdef = options.facility ?? FACILITIES[facilityId];
  if (!fdef) throw new Error(`施設 "${facilityId}" は FACILITIES に存在しません`);
  if (!fdef.lot) {
    // ここに来る原因はほぼキャッシュ。実際に読めたキーを出して切り分けられるようにする。
    const keys = Object.keys(fdef).join(', ');
    throw new Error(
      `施設 "${facilityId}" に lot (敷地配置情報) がありません。\n` +
      `  読み込めたキー: ${keys}\n` +
      `  → lot / entrance が無い場合、ブラウザが古い facilities.js をキャッシュしています。\n` +
      `    Ctrl+Shift+R でハードリロードするか、python tools/serve.py で起動してください。`
    );
  }

  const lotDef = fdef.lot;
  const ent = fdef.entrance ?? { x: lotDef.x, z: lotDef.z, width: 1.8, height: 2.3 };
  const floorY = options.floorY ?? 0;

  const root = new THREE.Group();
  root.name = `lot_${facilityId}`;

  // 正面が向く方向 (ローカル +Z を rot だけ回した向き)
  const rot = lotDef.rot ?? 0;
  const outward = new THREE.Vector3(Math.sin(rot), 0, Math.cos(rot));

  // --- 常設: 店舗正面の壁 (入口の穴つき)。どの状態でも必要 ---
  const frontWall = buildFrontWall(lotDef, ent, floorY, rot, outward);
  root.add(frontWall.group);

  // --- 状態別の見た目 ---
  const stateGroups = {
    [LOT_STATE.LOCKED]: buildLockedVisual(fdef, ent, floorY, rot, outward),
    [LOT_STATE.UNLOCKED]: buildUnlockedVisual(fdef, ent, floorY, rot, outward),
    [LOT_STATE.OPENED]: buildOpenedVisual(fdef, ent, floorY, rot, outward),
  };
  for (const g of Object.values(stateGroups)) root.add(g.group);

  // --- 店内 (opened のときだけ見える) ---
  const interior = buildInterior(fdef, lotDef, floorY, rot, outward);
  root.add(interior.group);

  // --- 入口を塞ぐ当たり判定 (locked / unlocked のみ有効) ---
  // size は buildFrontWall と同じローカル規約で渡す:
  //   X = 壁に沿う方向 (間口の幅) / Y = 高さ / Z = 厚み。回転も同じ rot + PI。
  // 軸順や回転がずれると間口の一部しか塞げず、閉店中の店を通り抜けて
  // 敷地の外へ落ちてしまう。
  const blocker = createBox({
    size: [ent.width + 0.06, ent.height, WALL_T + 0.24],
    position: [ent.x, floorY + ent.height / 2, ent.z],
    rotationY: rot + Math.PI,
    material: MATERIALS.concrete(),
    name: `${facilityId}_entrance_blocker`,
    castShadow: false,
    receiveShadow: false,
  });
  blocker.visible = false;
  root.add(blocker);

  // --- 店内の領域 (エリア判定に使う) ---
  // ローカル空間の直方体をワールドの AABB に変換する。
  // rot は 90 度単位なので、軸に沿った箱のままで扱える。
  const areaBox = computeInteriorBox(lotDef, floorY, rot, outward);

  let state = null;

  const lot = {
    id: facilityId,
    facility: fdef,
    group: root,
    /** 現在有効な当たり判定 (状態で変わる) */
    colliders: [],
    /** 現在有効な調べられる対象 */
    interactables: [],
    areaId: fdef.areaId ?? facilityId,
    areaBox,
    /**
     * 店内のローカル空間そのもの。
     * floors.js の INTERIORS と同じ座標系なので、旧タワー用に作られた
     * オブジェクト (コインなど) を position を変えずにそのまま入れ替えられる。
     */
    interiorGroup: interior.group,

    getState: () => state,

    /**
     * 状態を切り替える。ページを再読み込みせずに見た目と当たり判定が入れ替わる。
     * @param {'locked'|'unlocked'|'opened'} next
     */
    setState(next) {
      if (!LOT_STATES.includes(next)) throw new Error(`不正な区画状態: ${next}`);
      if (state === next) return;
      state = next;

      for (const [key, g] of Object.entries(stateGroups)) {
        g.group.visible = key === next;
        for (const light of g.lights) light.visible = key === next;
      }

      const isOpen = next === LOT_STATE.OPENED;
      interior.group.visible = isOpen;
      if (!isOpen) for (const l of interior.lights) l.visible = false;
      blocker.visible = false; // 常に不可視。有効/無効はコライダー配列で表現する

      // --- 当たり判定 ---
      lot.colliders.length = 0;
      lot.colliders.push(...frontWall.colliders);
      if (isOpen) lot.colliders.push(...interior.colliders);
      else lot.colliders.push(blocker);

      // --- 調べられる対象 ---
      lot.interactables.length = 0;
      const target = stateGroups[next].interactable;
      if (target) {
        // どの施設の看板/シャッターを見ているかを siteMode 側で判別できるようにする。
        // 施設が1軒だった STEP 4〜6 では不要だったが、複数軒では必須。
        target.userData.interactable.fid = facilityId;
        lot.interactables.push(target);
      }

      lot.onStateChange?.(next);
    },

    /**
     * 店内のポイントライトを点ける/消す。
     * 開店していない店は常に消灯。開店中でも、近くにいないときは消しておく
     * (同時に点くライトを1軒ぶんに抑え、施設数に比例して重くならないようにする)。
     */
    setInteriorLights(on) {
      const want = on && state === LOT_STATE.OPENED;
      for (const l of interior.lights) l.visible = want;
    },

    /** 位置が店内なら areaId を、そうでなければ null を返す */
    getAreaAt(position) {
      if (state !== LOT_STATE.OPENED) return null;
      return areaBox.containsPoint(position) ? lot.areaId : null;
    },

    /** 状態変更時のフック (site_test.html から差し込む) */
    onStateChange: null,

    dispose() {
      root.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        const mats = Array.isArray(obj.material) ? obj.material : obj.material ? [obj.material] : [];
        for (const m of mats) {
          if (m.userData?.shared) continue;
          m.dispose();
        }
        if (obj.isLight) obj.dispose?.();
      });
      root.parent?.remove(root);
    },

    stats: {
      interiorMeshes: interior.meshCount,
      interiorMerged: interior.mergedCount,
      interiorColliders: interior.colliders.length,
    },
  };

  lot.setState(options.state ?? LOT_STATE.LOCKED);
  return lot;
}

// ------------------------------------------------------------
// 常設パーツ: 店舗正面の壁 (入口の穴つき)
// ------------------------------------------------------------
function buildFrontWall(lotDef, ent, floorY, rot, outward) {
  const group = new THREE.Group();
  group.name = 'lot_front_wall';

  const width = lotDef.w ?? FLOOR_W;
  const height = FLOOR_H;
  const half = width / 2;
  const gapHalf = ent.width / 2;

  // 壁はローカル空間 (X = 壁に沿う方向, Z = 厚み方向) で組んでから回す。
  const local = new THREE.Group();

  // 開口の左右
  for (const [a, b] of [[-half - WALL_T, -gapHalf], [gapHalf, half + WALL_T]]) {
    const len = b - a;
    if (len < 0.01) continue;
    local.add(
      createBox({
        size: [len, height, WALL_T],
        position: [(a + b) / 2, height / 2, WALL_T / 2],
        material: MATERIALS.dirtyConcrete(),
        uvScale: 2.6,
        name: 'front_wall',
      })
    );
  }
  // 開口の上のまぐさ
  if (height - ent.height > 0.01) {
    local.add(
      createBox({
        size: [ent.width, height - ent.height, WALL_T],
        position: [0, ent.height + (height - ent.height) / 2, WALL_T / 2],
        material: MATERIALS.dirtyConcrete(),
        uvScale: 2.6,
        name: 'front_lintel',
      })
    );
  }

  // 入口の敷居。
  // ここに床がないと、広場の床と店内の床の間に壁厚ぶんの穴が空いてしまう。
  local.add(
    createBox({
      size: [ent.width + 0.1, 0.26, WALL_T + 0.12],
      position: [0, -0.13, WALL_T / 2],
      material: MATERIALS.tileFloor(),
      uvScale: 2.0,
      name: 'entrance_threshold',
      castShadow: false,
    })
  );

  // ローカル +Z を outward の逆 (店内側) に向ける。
  // 壁の厚みは店内側へ伸ばしたいので、rot + PI で回す。
  local.rotation.y = rot + Math.PI;
  local.position.set(ent.x, floorY, ent.z);
  local.updateMatrixWorld(true);

  const merged = mergeGroupByMaterial(local, {
    name: 'lot_front_wall_merged',
    castShadow: false,
    receiveShadow: true,
  });
  group.add(merged);

  const colliders = [];
  merged.traverse((o) => { if (o.isMesh) colliders.push(o); });

  return { group, colliders };
}

// ------------------------------------------------------------
// locked: 長期間閉ざされている
// ------------------------------------------------------------
function buildLockedVisual(fdef, ent, floorY, rot, outward) {
  const group = new THREE.Group();
  group.name = 'lot_locked';

  // 正面から少し手前 (通路側) に出した位置
  const front = (d) => [ent.x + outward.x * d, floorY, ent.z + outward.z * d];
  const at = (d, y, side = 0) => {
    const t = new THREE.Vector3(outward.z, 0, -outward.x); // 壁に沿う方向
    return [ent.x + outward.x * d + t.x * side, floorY + y, ent.z + outward.z * d + t.z * side];
  };

  // 完全に閉じたシャッター
  group.add(
    createShutter({
      position: front(0.04),
      rotationY: rot,
      width: ent.width + 0.1,
      height: ent.height - 0.05,
    })
  );

  // 打ち付けられた板 (斜め2本)
  for (const [y, tilt] of [[1.0, 0.2], [1.6, -0.16]]) {
    const board = createBox({
      size: [ent.width + 0.5, 0.16, 0.06],
      position: at(0.11, y),
      rotationY: rot + Math.PI / 2,
      material: MATERIALS.crateWood(),
      uvScale: 0.8,
      name: 'lot_board',
      castShadow: false,
    });
    board.rotation.x = tilt;
    group.add(board);
  }

  // 消灯した看板 (発光しない塗装板)
  group.add(
    createSignPlate({
      text: fdef.sign,
      position: at(0.07, ent.height + 0.32),
      rotationY: rot,
      size: [1.5, 0.44],
      bg: '#22222a',
      fg: '#4a4a52',
    })
  );

  // 立入禁止 / 工事中
  group.add(
    createSignPlate({
      text: '立入禁止',
      position: at(0.09, 1.32, -0.62),
      rotationY: rot,
      size: [0.62, 0.2],
      bg: '#d8cfb2',
      fg: '#3a2a24',
    })
  );
  group.add(
    createSignPlate({
      text: '工事中',
      position: at(0.09, 1.62, 0.66),
      rotationY: rot,
      size: [0.5, 0.2],
      bg: '#c8a83a',
      fg: '#241c10',
    })
  );

  // 剥がれかけた古い貼り紙 (色褪せた札を小さく傾けて貼る)
  const posters = [
    { text: '賃貸', y: 0.72, side: -0.78, bg: '#b8ae92', fg: '#4a3a2a', size: [0.34, 0.26] },
    { text: '連絡先', y: 1.05, side: 0.82, bg: '#a8a08a', fg: '#3a3226', size: [0.4, 0.22] },
  ];
  for (const p of posters) {
    const plate = createSignPlate({
      text: p.text,
      position: at(0.1, p.y, p.side),
      rotationY: rot,
      size: p.size,
      bg: p.bg,
      fg: p.fg,
      backing: false,
    });
    plate.rotation.z = (p.side > 0 ? -1 : 1) * 0.12;
    group.add(plate);
  }

  // 汚し: シャッター全面の錆と、足元の黒ずみ
  group.add(
    createDecal({
      atlas: 'grime',
      cell: DECAL_CELL.rust,
      size: [ent.width + 0.2, ent.height],
      position: at(0.13, ent.height / 2),
      rotationY: rot,
    })
  );
  group.add(
    createDecal({
      atlas: 'grime',
      cell: DECAL_CELL.base,
      size: [ent.width + 0.6, 0.8],
      position: at(0.14, 0.4),
      rotationY: rot,
      flipX: true,
    })
  );

  // 調べられる対象 (STEP 5 で E キーに接続する)
  const probe = makeInteractionProbe(
    'locked',
    at(0.2, ent.height / 2),
    rot,
    [ent.width + 0.2, ent.height],
    { prompt: '調べる', message: 'シャッターは固く閉ざされている' }
  );
  group.add(probe);

  return { group, lights: [], interactable: probe };
}

// ------------------------------------------------------------
// unlocked: もうすぐ開く
// ------------------------------------------------------------
function buildUnlockedVisual(fdef, ent, floorY, rot, outward) {
  const group = new THREE.Group();
  group.name = 'lot_unlocked';
  const lights = [];

  const t = new THREE.Vector3(outward.z, 0, -outward.x);
  const at = (d, y, side = 0) => [
    ent.x + outward.x * d + t.x * side,
    floorY + y,
    ent.z + outward.z * d + t.z * side,
  ];

  const openGap = 0.55; // 下がこれだけ開いている

  group.add(
    createShutter({
      position: at(0.04, 0),
      rotationY: rot,
      width: ent.width + 0.1,
      height: ent.height - 0.05,
      openGap,
    })
  );

  // 隙間から漏れる工事灯 (暖色)。ライトは1灯だけ。
  const workLight = new THREE.PointLight(0xffb066, 3.0, 4.5, 2);
  workLight.position.set(
    ent.x - outward.x * 0.9,
    floorY + 0.9,
    ent.z - outward.z * 0.9
  );
  workLight.castShadow = false;
  group.add(workLight);
  lights.push(workLight);

  // 足元へ落ちる光 (加算合成の板。光源は増やさない)
  group.add(
    createLightSpill({
      position: at(0.5, 0.02),
      size: [2.2, 2.2],
      color: '#ffb066',
      opacity: 0.3,
      rotationX: -Math.PI / 2,
    })
  );
  group.add(
    createLightSpill({
      position: at(0.06, 0.35),
      size: [ent.width + 0.4, 1.0],
      color: '#ffb066',
      opacity: 0.3,
      rotationY: rot,
    })
  );

  // 近日開店の札
  group.add(
    createSignPlate({
      text: '近日開店',
      position: at(0.09, ent.height + 0.32),
      rotationY: rot,
      size: [1.3, 0.4],
      bg: '#8c1f1c',
      fg: '#e8d49a',
    })
  );
  group.add(
    createSignPlate({
      text: fdef.name,
      position: at(0.09, 1.5, -0.75),
      rotationY: rot,
      size: [0.7, 0.22],
      bg: '#d8cfb2',
      fg: '#3a2a24',
    })
  );

  // 足場パイプ
  for (const side of [-1, 1]) {
    group.add(
      createPipe({
        start: at(0.42, 0, side * (ent.width / 2 + 0.25)),
        end: at(0.42, ent.height + 0.4, side * (ent.width / 2 + 0.25)),
        radius: 0.035,
        material: MATERIALS.pipeGalvanized(),
      })
    );
  }
  group.add(
    createPipe({
      start: at(0.42, 1.35, -(ent.width / 2 + 0.25)),
      end: at(0.42, 1.35, ent.width / 2 + 0.25),
      radius: 0.035,
      material: MATERIALS.pipeGalvanized(),
    })
  );

  // 工具箱と塗料缶
  group.add(
    createBox({
      size: [0.52, 0.26, 0.3],
      position: at(0.62, 0.13, -0.68),
      rotationY: rot + 0.3,
      material: MATERIALS.darkMetal(),
      name: 'toolbox',
      castShadow: false,
    })
  );
  group.add(
    createBox({
      size: [0.26, 0.3, 0.26],
      position: at(0.58, 0.15, 0.72),
      rotationY: rot - 0.2,
      material: MATERIALS.plastic(),
      name: 'paint_can',
      castShadow: false,
    })
  );

  const probe = makeInteractionProbe(
    'unlocked',
    at(0.2, ent.height / 2),
    rot,
    [ent.width + 0.2, ent.height],
    { prompt: '調べる', message: '近日開店の札が出ている' }
  );
  group.add(probe);

  return { group, lights, interactable: probe };
}

// ------------------------------------------------------------
// opened: 営業中
// ------------------------------------------------------------
function buildOpenedVisual(fdef, ent, floorY, rot, outward) {
  const group = new THREE.Group();
  group.name = 'lot_opened';
  const lights = [];

  const t = new THREE.Vector3(outward.z, 0, -outward.x);
  const at = (d, y, side = 0) => [
    ent.x + outward.x * d + t.x * side,
    floorY + y,
    ent.z + outward.z * d + t.z * side,
  ];

  const neonHex = '#' + (fdef.neon ?? 0xffca6a).toString(16).padStart(6, '0');

  // 巻き上がったシャッターの箱だけ残す
  group.add(
    createBox({
      size: [ent.width + 0.22, 0.24, 0.18],
      position: at(0.06, ent.height + 0.02),
      rotationY: rot,
      material: MATERIALS.darkMetal(),
      name: 'shutter_box',
      castShadow: false,
    })
  );

  // 点灯した看板 (施設データの neon 色を使う)。
  // 光源は持たせず、下の加算合成の板で「路地が照らされている」感じを出す。
  // ポイントライトを1灯足すと全マテリアルのフラグメント計算に効いてしまうため。
  group.add(
    createNeonSign({
      text: fdef.name,
      color: neonHex,
      position: at(0.1, ent.height + 0.4),
      rotationY: rot,
      size: [2.2, 0.5],
      light: false,
    })
  );
  // 突き出しの縦看板
  group.add(
    createNeonSign({
      text: fdef.sign,
      color: neonHex,
      position: at(0.34, 1.75, -(ent.width / 2 + 0.42)),
      rotationY: rot + Math.PI / 2,
      vertical: true,
      size: [0.34, 0.86],
      light: false,
    })
  );

  // 店の灯りが路地へ漏れる (加算合成の板。光源は増やさない)
  group.add(
    createLightSpill({
      position: at(0.55, 0.02),
      size: [3.0, 3.0],
      color: '#ffd9a0',
      opacity: 0.28,
      rotationX: -Math.PI / 2,
    })
  );
  group.add(
    createLightSpill({
      position: at(0.05, 1.1),
      size: [ent.width + 0.6, 2.2],
      color: '#ffd9a0',
      opacity: 0.3,
      rotationY: rot,
    })
  );

  // 暖簾がわりの日除け
  group.add(
    createBox({
      size: [ent.width + 0.9, 0.06, 0.9],
      position: at(0.52, ent.height + 0.34),
      rotationY: rot,
      material: MATERIALS.rustyPanel(),
      uvScale: 1.0,
      name: 'shop_awning',
      castShadow: false,
    })
  );

  // 店頭のワゴン (古本の平積み)
  const wagon = new THREE.Group();
  wagon.add(
    createBox({
      size: [1.1, 0.62, 0.5],
      position: [0, 0.31, 0],
      material: MATERIALS.crateWood(),
      uvScale: 0.8,
      name: 'shop_wagon',
      castShadow: false,
    })
  );
  const bookCols = [0x8a3a3a, 0x3a5a8a, 0x3a7a4a, 0xc8a03a, 0x6a4a8a];
  for (let i = 0; i < 7; i += 1) {
    wagon.add(
      createBox({
        size: [0.2, 0.05, 0.28],
        position: [-0.4 + (i % 4) * 0.26, 0.65 + Math.floor(i / 4) * 0.06, (i % 2) * 0.1 - 0.05],
        rotationY: (i % 3) * 0.12 - 0.12,
        material: getFlatMaterial(bookCols[i % bookCols.length]),
        name: 'shop_book',
        castShadow: false,
      })
    );
  }
  const wagonPos = at(0.72, 0, -0.9);
  wagon.position.set(wagonPos[0], wagonPos[1], wagonPos[2]);
  wagon.rotation.y = rot + 0.25;
  group.add(wagon);

  // 店頭のポスター
  for (const p of [
    { text: '新刊', y: 1.45, side: 0.82, bg: '#8c1f1c', fg: '#e8d49a' },
    { text: '古書買取', y: 1.1, side: -0.86, bg: '#2f3a33', fg: '#d6cdb4' },
  ]) {
    group.add(
      createSignPlate({
        text: p.text,
        position: at(0.09, p.y, p.side),
        rotationY: rot,
        size: [0.46, 0.26],
        bg: p.bg,
        fg: p.fg,
      })
    );
  }

  const probe = makeInteractionProbe(
    'opened',
    at(0.2, ent.height / 2),
    rot,
    [ent.width + 0.2, ent.height],
    { prompt: '入る', message: fdef.name }
  );
  group.add(probe);

  return { group, lights, interactable: probe };
}

// ------------------------------------------------------------
// 店内 (既存 INTERIORS の流用)
// ------------------------------------------------------------
function buildInterior(fdef, lotDef, floorY, rot, outward) {
  const group = new THREE.Group();
  group.name = `interior_${fdef.id}`;

  // 店の原点 = 正面の外側の面から、奥行きの半分 + 壁厚ぶん奥
  const depth = lotDef.d ?? FLOOR_D;
  const originX = lotDef.x - outward.x * (depth / 2 + WALL_T);
  const originZ = lotDef.z - outward.z * (depth / 2 + WALL_T);
  group.position.set(originX, floorY, originZ);
  group.rotation.y = rot;

  // --- 既存の内装ジェネレータをそのまま呼ぶ (floors.js は無改造) ---
  const { group: interior } = makeShopInterior(fdef.type);

  let meshCount = 0;
  interior.traverse((o) => { if (o.isMesh) meshCount += 1; });

  // 内装は 1メッシュ = 1マテリアル で作られているためドローコールが多い。
  // 同じ見た目のマテリアルを1つに寄せてから結合すると、大幅に減らせる。
  dedupeMaterials(interior);
  interior.updateMatrixWorld(true);
  const merged = mergeGroupByMaterial(interior, {
    name: `interior_${fdef.id}_merged`,
    castShadow: false,
    receiveShadow: true,
  });
  group.add(merged);

  let mergedCount = 0;
  merged.traverse((o) => { if (o.isMesh) mergedCount += 1; });

  // --- 店内の照明 (2灯だけ。天井の吊り下げ照明はメッシュの発光で見せる) ---
  //
  // ★ この2灯は「プレイヤーがその店にいる/入口を覗いている間」だけ有効にする。
  //   施設が増えるたびにポイントライトが2つずつ増えると、開店数に比例して
  //   シェーダのライトループが伸びる。lot.setInteriorLights() で切り替え、
  //   同時に点くのは常に1軒ぶんに抑える (siteMode が毎フレーム呼ぶ)。
  const lightA = new THREE.PointLight(0xffe0b0, 4.2, 12, 2);
  lightA.position.set(0, FLOOR_H - 1.0, 1.0);
  lightA.castShadow = false;
  group.add(lightA);

  const lightB = new THREE.PointLight(0xffd9a0, 3.0, 10, 2);
  lightB.position.set(4.5, FLOOR_H - 1.2, 2.2);
  lightB.castShadow = false;
  group.add(lightB);

  const lights = [lightA, lightB];
  for (const l of lights) l.visible = false;

  // --- 当たり判定 ---
  // シェル(床・天井・左右壁・奥壁)は全施設共通なので自動生成する。
  const width = lotDef.w ?? FLOOR_W;
  const shell = [
    { size: [width, 0.3, depth], position: [0, -0.15, 0] },                       // 床
    { size: [width, 0.3, depth], position: [0, FLOOR_H - 0.1, 0] },               // 天井
    { size: [0.3, FLOOR_H, depth], position: [-width / 2 + 0.15, FLOOR_H / 2, 0] }, // 左
    { size: [0.3, FLOOR_H, depth], position: [width / 2 - 0.15, FLOOR_H / 2, 0] },  // 右
    { size: [width, FLOOR_H, 0.3], position: [0, FLOOR_H / 2, -depth / 2 + 0.15] }, // 奥
  ];
  const colliders = [];
  const colliderGroup = new THREE.Group();
  colliderGroup.name = 'interior_colliders';
  for (const b of [...shell, ...(INTERIOR_COLLIDERS[fdef.type] ?? [])]) {
    const mesh = createBox({
      size: b.size,
      position: b.position,
      material: MATERIALS.concrete(),
      name: 'interior_collider',
      castShadow: false,
      receiveShadow: false,
    });
    mesh.visible = false;
    colliderGroup.add(mesh);
    colliders.push(mesh);
  }
  group.add(colliderGroup);
  group.updateMatrixWorld(true);

  return { group, colliders, lights, meshCount, mergedCount };
}

/** 店内の領域 (ワールド AABB)。rot は90度単位を前提とする */
function computeInteriorBox(lotDef, floorY, rot, outward) {
  const depth = lotDef.d ?? FLOOR_D;
  const width = lotDef.w ?? FLOOR_W;
  const originX = lotDef.x - outward.x * (depth / 2 + WALL_T);
  const originZ = lotDef.z - outward.z * (depth / 2 + WALL_T);

  // ローカル X(width) / Z(depth) がワールドのどちらの軸に乗るかを判定する
  const alongX = Math.abs(Math.cos(rot)) > 0.5; // rot が 0 / PI なら true
  const halfX = (alongX ? width : depth) / 2;
  const halfZ = (alongX ? depth : width) / 2;

  return new THREE.Box3(
    new THREE.Vector3(originX - halfX, floorY - 0.5, originZ - halfZ),
    new THREE.Vector3(originX + halfX, floorY + FLOOR_H + 0.5, originZ + halfZ)
  );
}

// ------------------------------------------------------------
// 補助
// ------------------------------------------------------------

/**
 * 調べられる対象の当たり判定板。
 * 描画されないが Raycaster には引っかかるので、
 * STEP 5 で InteractionSystem を挿すだけで動く。
 */
function makeInteractionProbe(state, position, rotationY, size, config) {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(size[0], size[1]),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  mesh.position.set(position[0], position[1], position[2]);
  mesh.rotation.y = rotationY;
  mesh.visible = false;
  mesh.name = `interaction_${state}`;
  mesh.userData.interactable = { ...config, lotState: state };
  return mesh;
}

const flatMaterials = new Map();
function getFlatMaterial(color) {
  if (!flatMaterials.has(color)) {
    const m = new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0.05 });
    m.userData.shared = true;
    flatMaterials.set(color, m);
  }
  return flatMaterials.get(color);
}

/**
 * 同じ見た目の MeshStandardMaterial を1つに寄せる。
 *
 * floors.js の prims.mat() は呼ばれるたびに新しいマテリアルを作るため、
 * 内装1つで100個近いマテリアルができてしまう。ここで畳んでおくと
 * このあとの結合が効き、ドローコールが1桁減る。
 */
function dedupeMaterials(root) {
  const pool = new Map();
  root.traverse((obj) => {
    if (!obj.isMesh || Array.isArray(obj.material)) return;
    const m = obj.material;
    // テクスチャ付き (看板など) は個別なので触らない
    if (m.map || m.emissiveMap) return;
    const key = [
      m.type,
      m.color?.getHexString(),
      m.emissive?.getHexString(),
      m.emissiveIntensity,
      m.roughness,
      m.metalness,
      m.transparent,
      m.opacity,
      m.side,
    ].join('|');
    if (!pool.has(key)) pool.set(key, m);
    else if (pool.get(key) !== m) {
      m.dispose();
      obj.material = pool.get(key);
    }
  });
  return pool.size;
}
