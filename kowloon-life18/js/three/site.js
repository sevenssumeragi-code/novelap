// ============================================================
// 九龍城の敷地 (新方式) — 最小構成
//
// 範囲: 路地1本(L字) + 小さな広場。施設区画そのものは lots.js が作り、
// site.addLot() で敷地に接続する (STEP 4 で book を1軒だけ配置)。
//
// 既存のタワー方式 (three/floors.js) とは独立している。
// このファイルを import するのは site_test.html だけ。
//
// 構成:
//
//        z=+10 ┌──────────┐  入口側の突き当り
//              │          │
//              │  路地A   │  幅1.8m / 天井2.35m / 長さ11.75m
//              │  (Z方向) │
//              │          │
//        z=-0.05├───┐      │
//              │   │ 路地B (X方向) 幅1.7m / 天井2.20m ← 低い
//        z=-1.75└───┴──────┴──── ... ──┐
//                   x=0.9        x=7.35 │ ← 18cmの段差
//                                       │   広場 5.85×6.0m / 天井3.4m
//                                       └── x=13.2 施設区画 (九龍書店)
//
// 曲がり角と洗濯物で、入口から奥は一度に見通せない。
// ============================================================
import * as THREE from 'three';
import {
  MATERIALS,
  createBox,
  createCorridorSegment,
  createHangingLamp,
  mergeGroupByMaterial,
} from './builders/roomBuilder.js';
import {
  createACUnits,
  createCable,
  createCableBundle,
  createClutter,
  createDecal,
  createFluorescentLamp,
  createLaundry,
  createLightSpill,
  createNeonSign,
  createPipe,
  createPipeBracket,
  createPipeJoint,
  createPottedPlants,
  createSignPlate,
  createStools,
  createTrashBags,
  createVentFan,
  DECAL_CELL,
} from './builders/propBuilder.js';

// ---- 敷地の寸法 ---------------------------------------------------------

const T = 0.25; // 壁厚

// 路地A: Z方向。入口(+Z)から曲がり角(-Z)へ
const A_W = 1.8;
const A_Z0 = -1.75;
const A_Z1 = 10.0;
const A_CEIL = 2.35;

// 路地B: X方向。曲がり角から広場へ。天井を下げて圧迫感を出す
const B_W = 1.7;
const B_X0 = A_W / 2; // 0.9 — 路地Aの東壁に接続
const B_X1 = 7.35;
const B_CZ = -0.9; // → 壁は z=-1.75 と z=-0.05
const B_CEIL = 2.2;

// 広場: 路地Bの先。18cmの段差を上がって入る
const P_X0 = B_X1; // 7.35 — 床は仕切り壁の下まで伸ばす
const P_X1 = 13.2;
const P_W = 6.0;
const P_CZ = B_CZ; // -0.9 → 壁は z=-3.9 と z=2.1
const P_FLOOR = 0.18;
const P_CEIL = 3.4;
const P_WALL_X = 7.475; // 路地Bと広場を仕切る壁の中心

const B_GAP = [B_CZ - B_W / 2, B_CZ + B_W / 2]; // [-1.75, -0.05]

// ---- STEP 7 で足した枝道 -------------------------------------------------
// 一本道にしないため、広場から北へ、路地Bから南へ枝を出し、
// 南の枝はさらに西へ折れる。どの直線区間も 9m 以下なので奥まで見通せない。

// 路地C: 広場の北壁から +Z へ伸びる奥路地。突き当りがカラオケ (袋小路)
const C_X = 10.2;
const C_W = 1.6;
const C_Z0 = P_CZ + P_W / 2; // 2.1 — 広場の北壁に接続
const C_Z1 = 6.4;
const C_CEIL = 2.25;
const C_FLOOR = P_FLOOR; // 広場と同じ高さ
const C_GAP = [C_X - C_W / 2, C_X + C_W / 2]; // [9.4, 11.0]

// 路地D: 路地Bの南壁から -Z へ伸びる袋小路。突き当りがラーメン
const D_X = 3.8;
const D_W = 1.6;
const D_Z0 = -7.2;
const D_Z1 = B_CZ - B_W / 2; // -1.75 — 路地Bの南壁に接続
const D_CEIL = 2.1; // いちばん低い
const D_GAP = [D_X - D_W / 2, D_X + D_W / 2]; // [3.0, 4.6]

// 路地E: 路地Dの西壁から -X へ折れる細道。15cm下がる。突き当りがケーキ屋
const E_CZ = -5.6;
const E_W = 1.5;
const E_X0 = -5.2;
const E_X1 = D_X - D_W / 2; // 3.0 — 路地Dの西壁に接続
const E_CEIL = 2.15;
const E_FLOOR = -0.15; // 路地Dから一段下がる
const E_GAP = [E_CZ - E_W / 2, E_CZ + E_W / 2]; // [-6.35, -4.85]

/** 新方式の各施設の床の高さ (siteMode がそのまま使う) */
export const SITE_LOT_FLOOR = {
  book: P_FLOOR,
  karaoke: C_FLOOR,
  donut: 0,
  ramen: 0,
  cake: E_FLOOR,
};

/** その地点の床の高さ */
function floorAtX(x) {
  return x >= B_X1 ? P_FLOOR : 0;
}

// ============================================================
// 生成
// ============================================================

/**
 * 敷地一式を生成する。
 * @returns {{ group: THREE.Group, colliders: THREE.Mesh[], interactables: THREE.Object3D[],
 *             dispose: () => void, update: (dt: number) => void, stats: object }}
 */
export function createSite() {
  const root = new THREE.Group();
  root.name = 'site';

  // 静的なものは用途別に積んでから、マテリアル単位で結合する
  const structure = new THREE.Group(); // 壁・床・天井 → 当たり判定になる
  const details = new THREE.Group(); // 配管・電線・看板板・シャッター等
  const grime = new THREE.Group(); // 汚し (乗算合成)
  const spill = new THREE.Group(); // 光の映り込み (加算合成)

  // 不可視の当たり判定専用ボックス。
  // 結合すると visible が引き継がれず見えてしまうので、結合対象から外す。
  const propColliders = new THREE.Group();
  propColliders.name = 'site_prop_colliders';

  buildShell(structure);
  buildPropColliders(propColliders);
  buildSurfaceDetails(details);
  buildPipes(details);
  buildCables(details);
  buildSignPlates(details);
  buildGrime(grime);
  buildLightSpill(spill);

  // 影は使わない (life17 と同じ方針。ポイントライトの影はキューブ6面ぶん描くため)
  const mergedStructure = mergeGroupByMaterial(structure, {
    name: 'site_structure',
    castShadow: false,
    receiveShadow: true,
  });
  const mergedDetails = mergeGroupByMaterial(details, {
    name: 'site_details',
    castShadow: false,
    receiveShadow: true,
  });
  const mergedGrime = orderLayer(
    mergeGroupByMaterial(grime, { name: 'site_grime', castShadow: false, receiveShadow: false }),
    1
  );
  const mergedSpill = orderLayer(
    mergeGroupByMaterial(spill, { name: 'site_spill', castShadow: false, receiveShadow: false }),
    2
  );

  root.add(mergedStructure, mergedDetails, mergedGrime, mergedSpill, propColliders);

  // 結合できないもの (ライト持ち / 動く / インスタンス化)
  const dynamic = { fans: [] };
  buildLights(root);
  buildNeon(root);
  buildFixtures(root, dynamic);
  buildClutter(root);
  buildLivingProps(root);

  // レイキャストは matrixWorld を使うため、初回フレーム前に確定させておく
  root.updateMatrixWorld(true);

  // --- 敷地そのものの当たり判定 ---
  // 結合済みの構造メッシュ (マテリアル単位なので数個) と、小物用の不可視ボックス。
  const baseColliders = [];
  for (const src of [mergedStructure, propColliders]) {
    src.traverse((o) => {
      if (o.isMesh) baseColliders.push(o);
    });
  }

  // --- 施設区画 ---
  // colliders / interactables は「配列の中身を入れ替える」方式にしてある。
  // 参照を保ったままにできるので、PlayerController に
  //   getColliders: () => site.colliders
  // と渡しておけば、区画の状態が変わっても差し替え不要。
  const lots = [];
  const colliders = [];
  const interactables = [];

  function refresh() {
    colliders.length = 0;
    colliders.push(...baseColliders);
    interactables.length = 0;
    for (const lot of lots) {
      colliders.push(...lot.colliders);
      interactables.push(...lot.interactables);
    }
  }

  const site = {
    group: root,
    colliders,
    interactables,
    lots,

    /** 施設区画を敷地に置く */
    addLot(lot) {
      root.add(lot.group);
      lots.push(lot);
      const prev = lot.onStateChange;
      lot.onStateChange = (state) => { refresh(); prev?.(state); };
      refresh();
      return lot;
    },

    /** 区画の状態を変えたあとに呼ぶ (addLot 経由なら自動) */
    refresh,

    /**
     * その位置がどのエリアかを返す。
     * 将来 game.currentLocation() をこれに差し替えれば、
     * 1398本の会話条件 (location == book など) がそのまま動く。
     * @returns {string} 施設ID または 'GROUND'
     */
    getAreaAt(position) {
      for (const lot of lots) {
        const id = lot.getAreaAt(position);
        if (id) return id;
      }
      return 'GROUND';
    },

    dispose: () => {
      for (const lot of lots) lot.dispose();
      lots.length = 0;
      disposeSite(root);
    },

    /** 換気扇の羽根など、毎フレーム動かすもの */
    update(dt) {
      for (const blades of dynamic.fans) blades.rotation.z += dt * 2.4;
    },

    /** 描画統計を取り直す (区画の状態を変えたあとに使う) */
    collectStats: () => collectStats(root, colliders),
  };

  refresh();
  site.stats = collectStats(root, colliders);
  return site;
}

/** 結合後のメッシュに描画順を付ける (乗算 → 加算の順で重ねたい) */
function orderLayer(group, renderOrder) {
  group.traverse((o) => {
    if (o.isMesh) o.renderOrder = renderOrder;
  });
  return group;
}

// ---- 構造 (床・壁・天井) --------------------------------------------------

function buildShell(target) {
  const concrete = MATERIALS.dirtyConcrete();
  const tile = MATERIALS.wallTile();

  // --- 路地A: 東壁に曲がり角の開口を空ける ---
  target.add(
    createCorridorSegment({
      axis: 'z',
      from: A_Z0,
      to: A_Z1,
      cross: 0,
      width: A_W,
      floorY: 0,
      ceilingY: A_CEIL,
      capFrom: true, // 曲がり角側の突き当り
      capTo: true, // 入口側の突き当り
      gapsPos: [B_GAP],
      // 西壁: ドーナツ屋の入口 (区画側が穴つきの壁を作る)
      gapsNeg: [[8.0, 9.8]],
      materials: { wallNeg: tile, wallPos: concrete },
      name: 'alley_a',
    })
  );

  // --- 路地B: 天井が低い ---
  target.add(
    createCorridorSegment({
      axis: 'x',
      from: B_X0,
      to: B_X1,
      cross: B_CZ,
      width: B_W,
      floorY: 0,
      ceilingY: B_CEIL,
      // 南壁: 路地D への分岐
      gapsNeg: [D_GAP],
      materials: { wallNeg: concrete, wallPos: tile },
      name: 'alley_b',
    })
  );

  // --- 広場: 段差を上がった先。天井が高くなり視界が開ける ---
  target.add(
    createCorridorSegment({
      axis: 'x',
      from: P_X0,
      to: P_X1,
      cross: P_CZ,
      width: P_W,
      floorY: P_FLOOR,
      ceilingY: P_CEIL,
      // 東側の壁は施設区画 (lots.js) が入口の穴つきで作るので、ここでは塞がない
      capTo: false,
      // 北壁: 奥路地C への分岐
      gapsPos: [C_GAP],
      materials: { wallNeg: concrete, wallPos: tile },
      uvScale: { floor: 2.0, wall: 2.8, ceiling: 3.0 },
      name: 'plaza',
    })
  );

  // --- 路地C: 広場から北へ。突き当りはカラオケ (袋小路) ---
  target.add(
    createCorridorSegment({
      axis: 'z',
      from: C_Z0,
      to: C_Z1,
      cross: C_X,
      width: C_W,
      floorY: C_FLOOR,
      ceilingY: C_CEIL,
      capFrom: false, // 広場へ開く
      capTo: false, // 突き当りはカラオケの区画が作る
      materials: { wallNeg: tile, wallPos: concrete },
      name: 'alley_c',
    })
  );
  // 広場(天井3.4)から路地C(2.25)へ下がるまぐさ
  target.add(
    createBox({
      size: [C_W, P_CEIL + T - C_CEIL, T],
      position: [C_X, (C_CEIL + P_CEIL + T) / 2, C_Z0 + T / 2],
      material: MATERIALS.dirtyConcrete(),
      uvScale: 2.5,
      name: 'alley_c_lintel',
    })
  );

  // --- 路地D: 路地Bから南へ。突き当りはラーメン (袋小路) ---
  target.add(
    createCorridorSegment({
      axis: 'z',
      from: D_Z0,
      to: D_Z1,
      cross: D_X,
      width: D_W,
      floorY: 0,
      ceilingY: D_CEIL,
      capFrom: false, // 突き当りはラーメンの区画が作る
      capTo: false, // 路地Bへ開く
      // 西壁: 細道E への分岐
      gapsNeg: [E_GAP],
      materials: { wallNeg: concrete, wallPos: tile },
      name: 'alley_d',
    })
  );
  // 路地B(2.2)から路地D(2.1)へ下がるまぐさ
  target.add(
    createBox({
      size: [D_W, B_CEIL + T - D_CEIL, T],
      position: [D_X, (D_CEIL + B_CEIL + T) / 2, D_Z1 - T / 2],
      material: MATERIALS.dirtyConcrete(),
      uvScale: 2.5,
      name: 'alley_d_lintel',
    })
  );

  // --- 路地E: 路地Dから西へ。15cm下がる細道。突き当りはケーキ屋 ---
  target.add(
    createCorridorSegment({
      axis: 'x',
      from: E_X0,
      to: E_X1,
      cross: E_CZ,
      width: E_W,
      floorY: E_FLOOR,
      ceilingY: E_CEIL,
      capFrom: false, // 突き当りはケーキ屋の区画が作る
      capTo: false, // 路地Dへ開く
      materials: { wallNeg: tile, wallPos: concrete },
      name: 'alley_e',
    })
  );
  // 路地D(2.1)から路地E(2.15/床-0.15)へのまぐさ
  target.add(
    createBox({
      size: [T, D_CEIL + T - E_CEIL, E_W],
      position: [E_X1 - T / 2, (E_CEIL + D_CEIL + T) / 2, E_CZ],
      material: MATERIALS.dirtyConcrete(),
      uvScale: 2.5,
      name: 'alley_e_lintel',
    })
  );
  // 15cm下がる段差の蹴込み + 見切り
  target.add(
    createBox({
      size: [0.3, 0.2, E_W],
      position: [E_X1 + 0.15, E_FLOOR - 0.1, E_CZ],
      material: MATERIALS.dirtyConcrete(),
      uvScale: 2.0,
      name: 'alley_e_step',
    })
  );
  target.add(
    createBox({
      size: [0.07, 0.035, E_W],
      position: [E_X1 + 0.035, -0.017, E_CZ],
      material: MATERIALS.darkMetal(),
      name: 'alley_e_step_trim',
    })
  );

  // --- 広場と路地Bを仕切る壁 (中央に通路ぶんの開口) ---
  const wallH = 3.7;
  const pieces = [
    { zFrom: P_CZ - P_W / 2 - T, zTo: B_GAP[0] },
    { zFrom: B_GAP[1], zTo: P_CZ + P_W / 2 + T },
  ];
  for (const p of pieces) {
    const len = p.zTo - p.zFrom;
    target.add(
      createBox({
        size: [T, wallH, len],
        position: [P_WALL_X, wallH / 2 - 0.15, (p.zFrom + p.zTo) / 2],
        material: MATERIALS.dirtyConcrete(),
        uvScale: 2.5,
        name: 'plaza_wall',
      })
    );
  }
  // 開口の上のまぐさ (路地Bの天井 → 広場の天井まで塞ぐ)
  target.add(
    createBox({
      size: [T, P_CEIL + T - B_CEIL, B_W],
      position: [P_WALL_X, (B_CEIL + P_CEIL + T) / 2, B_CZ],
      material: MATERIALS.dirtyConcrete(),
      uvScale: 2.5,
      name: 'plaza_lintel',
    })
  );

  // --- 路地A と 路地B の天井高の差を埋めるまぐさ ---
  target.add(
    createBox({
      size: [T, A_CEIL + T - B_CEIL, B_W],
      position: [B_X0 + T / 2, (B_CEIL + A_CEIL + T) / 2, B_CZ],
      material: MATERIALS.dirtyConcrete(),
      uvScale: 2.5,
      name: 'junction_lintel',
    })
  );

  // --- 段差の見切り (金属の角材) ---
  target.add(
    createBox({
      size: [0.07, 0.035, B_W],
      position: [B_X1 - 0.035, P_FLOOR - 0.017, B_CZ],
      material: MATERIALS.darkMetal(),
      name: 'step_nosing',
    })
  );

  // --- 広場の庇 (低い屋根が張り出している) ---
  for (const cfg of [
    { x: 9.2, z: P_CZ - P_W / 2 + 0.7, w: 3.0, d: 1.4, rot: 0 },
    { x: 11.6, z: P_CZ + P_W / 2 - 0.7, w: 2.6, d: 1.3, rot: 0 },
  ]) {
    target.add(
      createBox({
        size: [cfg.w, 0.08, cfg.d],
        position: [cfg.x, 2.42, cfg.z],
        material: MATERIALS.rustyPanel(),
        uvScale: 1.2,
        rotationY: cfg.rot,
        name: 'awning',
      })
    );
    // 吊り材
    for (const sx of [-1, 1]) {
      target.add(
        createBox({
          size: [0.04, 0.5, 0.04],
          position: [cfg.x + sx * (cfg.w / 2 - 0.2), 2.68, cfg.z],
          material: MATERIALS.darkMetal(),
          name: 'awning_rod',
        })
      );
    }
  }
}

// ---- 小物の当たり判定 ------------------------------------------------------
//
// 見た目は InstancedMesh / 結合メッシュで作っているが、レイキャストで扱いやすい
// 形にはなっていない。そこで「ぶつかってほしい大きさの物」だけ、
// 描画されない当たり判定専用ボックスを別に置く。
//
// three.js の Raycaster は visible=false のオブジェクトも判定するので、
// 描画コストはゼロ。
//
// 低い段ボール単体・丸椅子・植木鉢・ゴミ袋・洗濯物には意図的に付けていない。
// (狭い路地で引っかかる不快感のほうが、すり抜けより大きいため)

function buildPropColliders(target) {
  const boxes = [
    // --- 室外機 (頭の高さに突き出すので必須) ---
    { size: [0.3, 0.44, 0.62], position: [A_W / 2 - 0.19, 1.86, 6.8] },
    { size: [0.3, 0.44, 0.62], position: [-A_W / 2 + 0.19, 1.8, 0.4] },
    { size: [0.62, 0.44, 0.3], position: [2.9, 1.62, B_CZ - B_W / 2 + 0.17] },
    { size: [0.62, 0.44, 0.3], position: [6.5, 1.66, B_CZ + B_W / 2 - 0.17] },
    { size: [0.62, 0.44, 0.3], position: [9.6, P_FLOOR + 2.0, P_CZ - P_W / 2 + 0.17] },
    { size: [0.62, 0.44, 0.3], position: [11.8, P_FLOOR + 2.2, P_CZ + P_W / 2 - 0.17] },

    // --- 木箱 ---
    { size: [0.48, 0.92, 0.46], position: [0.57, 0.46, 6.61] }, // 2段積み
    { size: [0.5, 0.54, 0.48], position: [-0.59, 0.27, 3.0] },
    { size: [0.46, 0.5, 0.44], position: [-0.57, 0.25, -0.6] },
    { size: [0.46, 0.52, 0.44], position: [3.6, 0.26, -1.5] },
    { size: [0.5, 0.56, 0.48], position: [9.0, P_FLOOR + 0.28, 1.6] },
    { size: [0.46, 0.52, 0.44], position: [12.7, P_FLOOR + 0.26, -3.2] },

    // --- 段ボールの山 (2段積みのものだけ) ---
    { size: [0.42, 0.7, 0.42], position: [-0.57, 0.35, 9.18] },
    { size: [0.42, 0.7, 0.42], position: [-0.58, 0.35, 1.88] },
    { size: [0.44, 0.76, 0.42], position: [4.89, 0.38, -0.34] },
  ];

  for (const b of boxes) {
    const mesh = createBox({
      size: b.size,
      position: b.position,
      material: MATERIALS.concrete(),
      name: 'prop_collider',
      castShadow: false,
      receiveShadow: false,
    });
    mesh.visible = false;
    target.add(mesh);
  }
}

// ---- 壁面の作り込み -------------------------------------------------------

function buildSurfaceDetails(target) {
  const rusty = MATERIALS.rustyPanel();
  const painted = MATERIALS.paintedBoard();
  const tile = MATERIALS.wallTile();

  // 後から張られた板。素地の壁の均一さを崩す
  const panels = [
    // 路地A 西壁
    { m: painted, size: [0.03, 1.5, 1.6], position: [-A_W / 2 + 0.015, 1.0, 7.0] },
    { m: rusty, size: [0.03, 1.2, 1.3], position: [-A_W / 2 + 0.015, 1.4, 3.4] },
    { m: tile, size: [0.03, 1.1, 1.0], position: [-A_W / 2 + 0.015, 0.6, 0.6] },
    // 路地A 東壁
    { m: rusty, size: [0.03, 1.3, 1.5], position: [A_W / 2 - 0.015, 1.2, 8.2] },
    { m: painted, size: [0.03, 1.4, 1.4], position: [A_W / 2 - 0.015, 0.95, 2.2] },
    // 路地B
    { m: painted, size: [1.4, 1.2, 0.03], position: [2.6, 1.05, B_CZ - B_W / 2 + 0.015] },
    { m: rusty, size: [1.2, 1.0, 0.03], position: [5.4, 1.25, B_CZ + B_W / 2 - 0.015] },
    // 広場
    { m: rusty, size: [1.8, 1.4, 0.03], position: [10.0, P_FLOOR + 1.5, P_CZ - P_W / 2 + 0.015] },
    { m: painted, size: [2.0, 1.6, 0.03], position: [11.4, P_FLOOR + 1.3, P_CZ + P_W / 2 - 0.015] },
    // --- STEP 7 の枝道 ---
    // 路地C (カラオケへ)
    { m: rusty, size: [0.03, 1.3, 1.4], position: [C_X - C_W / 2 + 0.015, C_FLOOR + 1.2, 3.6] },
    { m: painted, size: [0.03, 1.1, 1.2], position: [C_X + C_W / 2 - 0.015, C_FLOOR + 1.5, 5.2] },
    // 路地D (ラーメンへ) — いちばん狭く低いので板もくたびれた鉄板中心
    { m: rusty, size: [0.03, 1.4, 1.6], position: [D_X - D_W / 2 + 0.015, 1.1, -3.2] },
    { m: rusty, size: [0.03, 1.0, 1.2], position: [D_X + D_W / 2 - 0.015, 1.35, -5.6] },
    { m: painted, size: [0.03, 1.2, 1.3], position: [D_X + D_W / 2 - 0.015, 0.9, -2.6] },
    // 路地E (ケーキ屋へ) — 一段下がった細道
    { m: painted, size: [1.5, 1.2, 0.03], position: [-1.0, E_FLOOR + 1.1, E_CZ - E_W / 2 + 0.015] },
    { m: rusty, size: [1.3, 1.0, 0.03], position: [-3.4, E_FLOOR + 1.4, E_CZ + E_W / 2 - 0.015] },
    { m: tile, size: [1.1, 0.9, 0.03], position: [1.2, E_FLOOR + 0.7, E_CZ + E_W / 2 - 0.015] },
  ];
  for (const p of panels) {
    target.add(
      createBox({
        size: p.size,
        position: p.position,
        material: p.m,
        uvScale: 1.1,
        name: 'wall_cladding',
        castShadow: false,
      })
    );
  }
}

// ---- 配管 -----------------------------------------------------------------

function buildPipes(target) {
  const painted = MATERIALS.pipePainted();
  const rusty = MATERIALS.pipeRusty();

  const zA = A_Z1 - 0.15;
  const zB = A_Z0 + 0.15;

  // 路地A の天井を走る本管 (太さと色を散らす)
  target.add(createPipe({ start: [-0.64, 2.2, zA], end: [-0.64, 2.2, zB], radius: 0.055, material: painted }));
  target.add(createPipe({ start: [-0.76, 2.05, zA], end: [-0.76, 2.05, zB], radius: 0.038, material: rusty }));
  target.add(createPipe({ start: [0.72, 2.24, zA], end: [0.72, 2.24, zB], radius: 0.045, material: rusty }));
  target.add(
    createPipe({ start: [0.8, 2.08, zA], end: [0.8, 2.08, zB], radius: 0.062, material: MATERIALS.pipeRed() })
  );

  // 腰高の細い配管
  target.add(createPipe({ start: [-0.83, 0.62, zA], end: [-0.83, 0.62, 2.0], radius: 0.028, material: MATERIALS.pipeGreen() }));
  target.add(createPipe({ start: [-0.85, 1.45, 8.6], end: [-0.85, 1.45, 6.4], radius: 0.017, material: MATERIALS.pipeCopper() }));
  target.add(createPipe({ start: [-0.85, 1.45, 6.4], end: [-0.85, 0.8, 6.4], radius: 0.017, material: MATERIALS.pipeCopper() }));
  target.add(createPipeJoint({ position: [-0.85, 1.45, 6.4], radius: 0.026, material: MATERIALS.pipeCopper() }));

  // 曲がり角の立ち上がり管
  target.add(createPipe({ start: [-0.76, 0.25, -1.5], end: [-0.76, 2.26, -1.5], radius: 0.05, material: painted }));
  target.add(createPipeJoint({ position: [-0.76, 2.22, -1.5], radius: 0.07, material: painted }));

  // 路地B
  target.add(createPipe({ start: [1.05, 2.08, -1.58], end: [B_X1 - 0.15, 2.08, -1.58], radius: 0.05, material: painted }));
  target.add(createPipe({ start: [1.05, 1.93, -1.63], end: [B_X1 - 0.15, 1.93, -1.63], radius: 0.034, material: rusty }));
  target.add(
    createPipe({ start: [1.05, 2.04, -0.24], end: [B_X1 - 0.15, 2.04, -0.24], radius: 0.088, material: MATERIALS.pipeGalvanized() })
  );
  target.add(createPipeJoint({ position: [1.05, 2.08, -1.58], radius: 0.068, material: painted }));

  // 広場 (天井が高いので高い位置を走る)
  target.add(createPipe({ start: [P_X0 + 0.3, 3.2, -3.7], end: [P_X1 - 0.2, 3.2, -3.7], radius: 0.055, material: rusty }));
  target.add(createPipe({ start: [P_X0 + 0.3, 3.05, 1.9], end: [P_X1 - 0.2, 3.05, 1.9], radius: 0.042, material: painted }));

  // --- STEP 7 の枝道 ---
  // 路地C: 天井が高くないので低めを走らせる
  target.add(createPipe({ start: [C_X - 0.62, C_FLOOR + 2.0, C_Z0 + 0.2], end: [C_X - 0.62, C_FLOOR + 2.0, C_Z1 - 0.2], radius: 0.048, material: rusty }));
  target.add(createPipe({ start: [C_X + 0.66, C_FLOOR + 1.88, C_Z0 + 0.2], end: [C_X + 0.66, C_FLOOR + 1.88, C_Z1 - 0.2], radius: 0.032, material: painted }));
  for (let z = C_Z0 + 0.8; z < C_Z1; z += 1.5) {
    target.add(createPipeBracket({ position: [C_X - 0.62, C_FLOOR + 2.0, z], axis: 'z', radius: 0.068 }));
  }

  // 路地D: いちばん低い。頭のすぐ上を太い管が走る
  target.add(createPipe({ start: [D_X - 0.6, 1.95, D_Z1 - 0.2], end: [D_X - 0.6, 1.95, D_Z0 + 0.2], radius: 0.085, material: MATERIALS.pipeGalvanized() }));
  target.add(createPipe({ start: [D_X + 0.62, 1.82, D_Z1 - 0.2], end: [D_X + 0.62, 1.82, D_Z0 + 0.2], radius: 0.036, material: MATERIALS.pipeRed() }));
  target.add(createPipe({ start: [D_X + 0.68, 0.55, -2.4], end: [D_X + 0.68, 0.55, -6.4], radius: 0.026, material: MATERIALS.pipeGreen() }));
  for (let z = D_Z1 - 0.9; z > D_Z0; z -= 1.5) {
    target.add(createPipeBracket({ position: [D_X - 0.6, 1.95, z], axis: 'z', radius: 0.105 }));
  }
  // 路地Dへ折れる立ち上がり
  target.add(createPipe({ start: [D_X - 0.6, 1.95, D_Z1 - 0.2], end: [D_X - 0.6, 1.2, D_Z1 - 0.2], radius: 0.085, material: MATERIALS.pipeGalvanized() }));
  target.add(createPipeJoint({ position: [D_X - 0.6, 1.95, D_Z1 - 0.2], radius: 0.11, material: MATERIALS.pipeGalvanized() }));

  // 路地E: 銅管と細管。段差で一度下がる
  target.add(createPipe({ start: [E_X1 - 0.2, E_FLOOR + 1.9, E_CZ - 0.5], end: [E_X0 + 0.2, E_FLOOR + 1.9, E_CZ - 0.5], radius: 0.042, material: rusty }));
  target.add(createPipe({ start: [E_X1 - 0.2, E_FLOOR + 1.35, E_CZ + 0.58], end: [E_X0 + 0.2, E_FLOOR + 1.35, E_CZ + 0.58], radius: 0.018, material: MATERIALS.pipeCopper() }));
  for (let x = E_X1 - 0.9; x > E_X0; x -= 1.6) {
    target.add(createPipeBracket({ position: [x, E_FLOOR + 1.9, E_CZ - 0.5], axis: 'x', radius: 0.062 }));
  }

  // 留め具
  for (let z = 9.2; z > A_Z0; z -= 1.7) {
    target.add(createPipeBracket({ position: [-0.64, 2.2, z], axis: 'z', radius: 0.075 }));
    target.add(createPipeBracket({ position: [0.72, 2.24, z - 0.7], axis: 'z', radius: 0.065 }));
  }
  for (let x = 1.5; x < B_X1; x += 1.6) {
    target.add(createPipeBracket({ position: [x, 2.08, -1.58], axis: 'x', radius: 0.07 }));
    target.add(createPipeBracket({ position: [x + 0.6, 2.04, -0.24], axis: 'x', radius: 0.108 }));
  }
}

// ---- 電線 -----------------------------------------------------------------

function buildCables(target) {
  // 路地A の天井を伝う束。区間ごとにたわみを変える
  const spans = [
    { start: [0.36, 2.28, 9.7], end: [0.36, 2.28, 6.6], sag: 0.22 },
    { start: [0.36, 2.28, 6.6], end: [0.36, 2.28, 3.4], sag: 0.28 },
    { start: [0.36, 2.28, 3.4], end: [0.36, 2.28, 0.4], sag: 0.24 },
    { start: [0.36, 2.28, 0.4], end: [0.36, 2.28, -1.6], sag: 0.16 },
  ];
  spans.forEach((s, i) => target.add(createCableBundle({ ...s, count: 3, spread: 0.05, seed: i })));

  // 路地B
  target.add(createCableBundle({ start: [1.2, 2.12, -0.6], end: [4.2, 2.12, -0.6], count: 3, sag: 0.2, seed: 7 }));
  target.add(createCableBundle({ start: [4.2, 2.12, -0.6], end: [B_X1 - 0.2, 2.12, -0.6], count: 2, sag: 0.16, seed: 9 }));

  // 広場を横切る線 (高い位置)
  target.add(createCableBundle({ start: [P_X0 + 0.4, 3.25, -3.4], end: [P_X1 - 0.3, 3.1, 1.6], count: 3, sag: 0.42, seed: 11 }));
  target.add(createCableBundle({ start: [P_X0 + 0.4, 3.05, 1.6], end: [P_X1 - 0.3, 3.2, -3.4], count: 2, sag: 0.38, seed: 13 }));

  // --- STEP 7 の枝道 ---
  target.add(createCableBundle({ start: [C_X + 0.3, C_FLOOR + 2.12, C_Z0 + 0.3], end: [C_X + 0.3, C_FLOOR + 2.12, C_Z1 - 0.3], count: 3, sag: 0.2, seed: 21 }));
  target.add(createCableBundle({ start: [D_X + 0.25, 1.98, D_Z1 - 0.3], end: [D_X + 0.25, 1.98, -4.4], count: 4, spread: 0.05, sag: 0.24, seed: 23 }));
  target.add(createCableBundle({ start: [D_X + 0.25, 1.98, -4.4], end: [D_X + 0.25, 1.98, D_Z0 + 0.3], count: 2, sag: 0.18, seed: 25 }));
  target.add(createCableBundle({ start: [E_X1 - 0.3, E_FLOOR + 2.02, E_CZ + 0.2], end: [-1.4, E_FLOOR + 2.02, E_CZ + 0.2], count: 3, sag: 0.22, seed: 27 }));
  target.add(createCableBundle({ start: [-1.4, E_FLOOR + 2.02, E_CZ + 0.2], end: [E_X0 + 0.3, E_FLOOR + 2.02, E_CZ + 0.2], count: 2, sag: 0.17, seed: 29 }));

  // 通路を斜めに横切る線
  target.add(createCable({ start: [-0.85, 2.16, 5.4], end: [0.85, 2.26, 4.6], sag: 0.16, radius: 0.014 }));
  target.add(createCable({ start: [-0.85, 2.22, 1.8], end: [0.85, 2.1, 0.9], sag: 0.2, radius: 0.012 }));
  target.add(createCable({ start: [2.8, 2.14, -1.6], end: [3.8, 2.16, -0.3], sag: 0.14, radius: 0.011 }));

  // 看板への引き込み線
  target.add(createCable({ start: [0.36, 2.2, 5.8], end: [0.82, 1.95, 5.5], sag: 0.1, radius: 0.01 }));
  target.add(createCable({ start: [10.4, 3.1, -3.2], end: [10.4, 2.35, -3.75], sag: 0.08, radius: 0.01 }));
}

// ---- 古い看板 (塗装・非発光) -----------------------------------------------

function buildSignPlates(target) {
  const plates = [
    { text: '當舖', position: [-A_W / 2 + 0.05, 1.95, 6.2], rotationY: Math.PI / 2, size: [0.62, 0.24] },
    {
      text: '三樓陳',
      position: [A_W / 2 - 0.05, 1.35, 9.3],
      rotationY: -Math.PI / 2,
      size: [0.34, 0.16],
      bg: '#2f3a33',
      fg: '#d6cdb4',
    },
    {
      text: '請勿停放單車',
      position: [-A_W / 2 + 0.05, 1.72, 1.4],
      rotationY: Math.PI / 2,
      size: [0.72, 0.2],
      bg: '#d8cfb2',
      fg: '#3a2a24',
    },
    { text: '水電維修', position: [1.9, 1.28, B_CZ + B_W / 2 - 0.05], rotationY: Math.PI, size: [0.24, 0.62], vertical: true },
    {
      text: '一樓A座',
      position: [8.6, P_FLOOR + 1.05, P_CZ - P_W / 2 + 0.05],
      size: [0.4, 0.18],
      bg: '#2f3a33',
      fg: '#d6cdb4',
    },
  ];
  for (const p of plates) target.add(createSignPlate(p));
}

// ---- 汚し (乗算合成のデカール) ---------------------------------------------

function buildGrime(target) {
  // --- 壁の足元の黒ずみ ---
  grimeAlongWall(target, {
    axis: 'z', from: A_Z0 + 0.1, to: A_Z1 - 0.1,
    cross: -A_W / 2, offset: 0.016, rotationY: Math.PI / 2, floorOf: () => 0,
    skips: [[8.0, 9.8]], // ドーナツ屋の入口
  });

  // --- STEP 7 の枝道。袋小路ほど汚れを濃く見せる ---
  grimeAlongWall(target, {
    axis: 'z', from: C_Z0 + 0.1, to: C_Z1 - 0.1,
    cross: C_X - C_W / 2, offset: 0.016, rotationY: Math.PI / 2, floorOf: () => C_FLOOR,
  });
  grimeAlongWall(target, {
    axis: 'z', from: C_Z0 + 0.1, to: C_Z1 - 0.1,
    cross: C_X + C_W / 2, offset: -0.016, rotationY: -Math.PI / 2, floorOf: () => C_FLOOR,
  });
  grimeAlongWall(target, {
    axis: 'z', from: D_Z0 + 0.1, to: D_Z1 - 0.1,
    cross: D_X - D_W / 2, offset: 0.016, rotationY: Math.PI / 2, floorOf: () => 0,
    skips: [E_GAP], height: 1.0,
  });
  grimeAlongWall(target, {
    axis: 'z', from: D_Z0 + 0.1, to: D_Z1 - 0.1,
    cross: D_X + D_W / 2, offset: -0.016, rotationY: -Math.PI / 2, floorOf: () => 0, height: 1.0,
  });
  grimeAlongWall(target, {
    axis: 'x', from: E_X0 + 0.1, to: E_X1 - 0.1,
    cross: E_CZ - E_W / 2, offset: 0.016, rotationY: 0, floorOf: () => E_FLOOR, height: 0.95,
  });
  grimeAlongWall(target, {
    axis: 'x', from: E_X0 + 0.1, to: E_X1 - 0.1,
    cross: E_CZ + E_W / 2, offset: -0.016, rotationY: Math.PI, floorOf: () => E_FLOOR, height: 0.95,
  });
  grimeAlongWall(target, {
    axis: 'z', from: A_Z0 + 0.1, to: A_Z1 - 0.1,
    cross: A_W / 2, offset: -0.016, rotationY: -Math.PI / 2, skips: [B_GAP], floorOf: () => 0,
  });
  grimeAlongWall(target, {
    axis: 'x', from: B_X0 + 0.1, to: B_X1 - 0.1,
    cross: B_CZ - B_W / 2, offset: 0.016, rotationY: 0, floorOf: () => 0,
  });
  grimeAlongWall(target, {
    axis: 'x', from: B_X0 + 0.1, to: B_X1 - 0.1,
    cross: B_CZ + B_W / 2, offset: -0.016, rotationY: Math.PI, floorOf: () => 0,
  });
  grimeAlongWall(target, {
    axis: 'x', from: P_X0 + 0.3, to: P_X1 - 0.1,
    cross: P_CZ - P_W / 2, offset: 0.016, rotationY: 0, floorOf: () => P_FLOOR,
  });
  grimeAlongWall(target, {
    axis: 'x', from: P_X0 + 0.3, to: P_X1 - 0.1,
    cross: P_CZ + P_W / 2, offset: -0.016, rotationY: Math.PI, floorOf: () => P_FLOOR,
  });

  // --- カビ (湿気の溜まる隅) ---
  const mold = [
    { size: [1.1, 1.3], position: [-A_W / 2 + 0.017, 1.0, -1.2], rotationY: Math.PI / 2 },
    { size: [0.9, 1.1], position: [A_W / 2 - 0.017, 1.2, 4.0], rotationY: -Math.PI / 2 },
    { size: [1.2, 1.0], position: [1.6, 1.0, B_CZ - B_W / 2 + 0.017], rotationY: 0 },
    { size: [1.0, 1.2], position: [6.4, 1.1, B_CZ + B_W / 2 - 0.017], rotationY: Math.PI },
    { size: [1.3, 1.4], position: [8.4, P_FLOOR + 1.0, P_CZ - P_W / 2 + 0.017], rotationY: 0 },
    { size: [1.1, 1.2], position: [12.3, P_FLOOR + 1.1, P_CZ + P_W / 2 - 0.017], rotationY: Math.PI },
  ];
  mold.forEach((m, i) =>
    target.add(createDecal({ atlas: 'grime', cell: DECAL_CELL.mold, ...m, flipX: i % 2 === 0 }))
  );

  // --- 錆の垂れ (室外機・換気扇・ボルトの下) ---
  const rust = [
    { size: [0.8, 1.2], position: [A_W / 2 - 0.017, 1.2, 7.4], rotationY: -Math.PI / 2 },
    { size: [0.7, 1.1], position: [-A_W / 2 + 0.017, 1.25, 4.6], rotationY: Math.PI / 2 },
    { size: [0.8, 1.0], position: [3.4, 1.15, B_CZ - B_W / 2 + 0.017], rotationY: 0 },
    { size: [0.7, 1.1], position: [5.0, 1.2, B_CZ + B_W / 2 - 0.017], rotationY: Math.PI },
    { size: [1.0, 1.6], position: [11.0, P_FLOOR + 1.5, P_CZ - P_W / 2 + 0.017], rotationY: 0 },
    { size: [0.9, 1.4], position: [P_X1 - 0.02, P_FLOOR + 1.6, P_CZ + 1.5], rotationY: -Math.PI / 2 },
  ];
  rust.forEach((r, i) =>
    target.add(createDecal({ atlas: 'grime', cell: DECAL_CELL.rust, ...r, flipX: i % 2 === 1 }))
  );

  // --- 雨染み (壁の上半分) ---
  const rain = [
    { size: [1.8, 1.5], position: [-A_W / 2 + 0.015, 1.5, 8.4], rotationY: Math.PI / 2 },
    { size: [1.6, 1.4], position: [A_W / 2 - 0.015, 1.5, 6.0], rotationY: -Math.PI / 2 },
    { size: [1.8, 1.4], position: [-A_W / 2 + 0.015, 1.6, 2.6], rotationY: Math.PI / 2 },
    { size: [1.6, 1.3], position: [4.6, 1.5, B_CZ - B_W / 2 + 0.015], rotationY: 0 },
    { size: [2.2, 2.0], position: [9.4, P_FLOOR + 1.9, P_CZ + P_W / 2 - 0.015], rotationY: Math.PI },
    { size: [2.0, 2.0], position: [12.0, P_FLOOR + 2.0, P_CZ - P_W / 2 + 0.015], rotationY: 0 },
  ];
  rain.forEach((r, i) =>
    target.add(createDecal({ atlas: 'grime', cell: DECAL_CELL.rain, ...r, flipX: i % 2 === 0 }))
  );

  // --- 天井と壁の取り合い (上下反転して貼る) ---
  const ceilingRuns = [
    { vals: [-1.0, 1.4, 3.8, 6.2, 8.8], cross: -(A_W / 2 - 0.017), rotationY: Math.PI / 2, y: A_CEIL - 0.25, axis: 'z' },
    { vals: [0.6, 3.0, 5.4, 7.8], cross: A_W / 2 - 0.017, rotationY: -Math.PI / 2, y: A_CEIL - 0.25, axis: 'z' },
    { vals: [2.0, 4.6, 6.6], cross: B_CZ - B_W / 2 + 0.017, rotationY: 0, y: B_CEIL - 0.24, axis: 'x' },
    { vals: [3.2, 5.8], cross: B_CZ + B_W / 2 - 0.017, rotationY: Math.PI, y: B_CEIL - 0.24, axis: 'x' },
    { vals: [9.0, 11.6], cross: P_CZ - P_W / 2 + 0.017, rotationY: 0, y: P_CEIL - 0.3, axis: 'x' },
    { vals: [9.8, 12.4], cross: P_CZ + P_W / 2 - 0.017, rotationY: Math.PI, y: P_CEIL - 0.3, axis: 'x' },
  ];
  for (const run of ceilingRuns) {
    run.vals.forEach((v, i) => {
      target.add(
        createDecal({
          atlas: 'grime',
          cell: DECAL_CELL.base,
          size: [1.6, 0.46],
          position: run.axis === 'z' ? [run.cross, run.y, v] : [v, run.y, run.cross],
          rotationY: run.rotationY,
          flipY: true,
          flipX: i % 2 === 0,
        })
      );
    });
  }

  // --- 床 (歩く筋の黒ずみ・油・水たまり跡) ---
  const floorSpots = [
    { cell: DECAL_CELL.dirt, size: [1.5, 2.6], position: [0, 0.014, 8.4] },
    { cell: DECAL_CELL.specks, size: [1.4, 2.2], position: [0.15, 0.014, 6.0] },
    { cell: DECAL_CELL.dirt, size: [1.6, 2.6], position: [-0.1, 0.014, 3.6] },
    { cell: DECAL_CELL.oil, size: [1.2, 1.4], position: [-0.25, 0.014, 1.2] },
    { cell: DECAL_CELL.puddle, size: [1.5, 1.5], position: [0.1, 0.014, -1.0] },
    { cell: DECAL_CELL.dirt, size: [2.4, 1.5], position: [2.4, 0.014, B_CZ] },
    { cell: DECAL_CELL.specks, size: [2.2, 1.5], position: [5.2, 0.014, B_CZ - 0.1] },
    { cell: DECAL_CELL.dirt, size: [2.6, 2.6], position: [9.2, P_FLOOR + 0.014, P_CZ - 0.6] },
    { cell: DECAL_CELL.puddle, size: [2.0, 2.0], position: [11.0, P_FLOOR + 0.014, P_CZ + 1.2] },
    { cell: DECAL_CELL.oil, size: [1.6, 1.6], position: [12.2, P_FLOOR + 0.014, P_CZ - 1.4] },
  ];
  floorSpots.forEach((s, i) =>
    target.add(
      createDecal({
        atlas: 'stain',
        cell: s.cell,
        size: s.size,
        position: s.position,
        rotationX: -Math.PI / 2,
        flipX: i % 2 === 0,
      })
    )
  );
}

/** 壁の足元に沿って黒ずみのデカールを並べる */
function grimeAlongWall(target, { axis, from, to, cross, offset, rotationY, skips = [], floorOf, height = 0.85 }) {
  let cursor = from;
  let i = 0;
  while (cursor < to - 0.3) {
    const len = 1.2 + ((i * 3) % 4) * 0.3;
    const a = cursor;
    const b = Math.min(cursor + len, to);
    cursor = b + 0.05;
    i += 1;
    if (skips.some(([s, e]) => b > s && a < e)) continue;
    const mid = (a + b) / 2;
    const h = height * (0.8 + ((i * 7) % 5) * 0.1);
    const y = floorOf(mid) + h / 2;
    target.add(
      createDecal({
        atlas: 'grime',
        cell: DECAL_CELL.base,
        size: [b - a, h],
        position: axis === 'z' ? [cross + offset, y, mid] : [mid, y, cross + offset],
        rotationY,
        flipX: i % 2 === 0,
        name: 'grime_base',
      })
    );
  }
}

// ---- 看板の光の映り込み ----------------------------------------------------
//
// 実光源を増やすと全マテリアルのフラグメント計算に効くので、
// 加算合成の板で「そこだけ光が当たっている」ように見せる。

function buildLightSpill(target) {
  const WALL = 0.3;
  const FLOOR = 0.2;
  const RED = '#ff3340';
  const GREEN = '#3dff9a';

  const spills = [
    // 藥房 (緑・点灯) — 路地A
    { position: [-A_W / 2 + 0.02, 1.4, 5.5], size: [1.8, 1.8], color: GREEN, opacity: WALL, rotationY: Math.PI / 2 },
    { position: [0, 0.02, 5.5], size: [1.9, 1.9], color: GREEN, opacity: FLOOR, rotationX: -Math.PI / 2 },
    // 食堂 (黄・非点灯扱いだが映り込みは出す)
    { position: [A_W / 2 - 0.02, 1.9, 2.6], size: [1.6, 1.6], color: '#ffd23a', opacity: WALL, rotationY: -Math.PI / 2 },
    { position: [0, 0.02, 2.6], size: [1.7, 1.7], color: '#ffd23a', opacity: FLOOR, rotationX: -Math.PI / 2 },
    // 髮廊 (水色) — 路地B
    { position: [3.2, 1.5, B_CZ + B_W / 2 - 0.02], size: [1.4, 1.4], color: '#4fd9ff', opacity: WALL, rotationY: Math.PI },
    // 麻雀 (赤・点灯) — 広場
    { position: [10.4, P_FLOOR + 1.6, P_CZ + P_W / 2 - 0.02], size: [2.2, 2.2], color: RED, opacity: WALL, rotationY: Math.PI },
    { position: [10.4, P_FLOOR + 0.02, P_CZ], size: [2.4, 2.4], color: RED, opacity: FLOOR, rotationX: -Math.PI / 2 },
    // 涼茶 (緑) — 広場
    { position: [12.0, P_FLOOR + 1.7, P_CZ - P_W / 2 + 0.02], size: [1.6, 1.6], color: GREEN, opacity: WALL, rotationY: 0 },
    // --- STEP 7 の枝道。実光源を足さずにネオン色を回り込ませる ---
    // 歌廳 (桃) — 路地C
    { position: [C_X - C_W / 2 + 0.02, C_FLOOR + 1.5, 4.2], size: [1.6, 1.6], color: '#ff5ad0', opacity: WALL, rotationY: Math.PI / 2 },
    { position: [C_X, C_FLOOR + 0.02, 4.2], size: [1.7, 1.7], color: '#ff5ad0', opacity: FLOOR, rotationX: -Math.PI / 2 },
    // 麵 (橙) — 路地D。ここは実光源が無いので映り込みが主光源がわり
    { position: [D_X + D_W / 2 - 0.02, 1.45, -3.4], size: [1.5, 1.5], color: '#ff8a3a', opacity: WALL, rotationY: -Math.PI / 2 },
    { position: [D_X, 0.02, -3.4], size: [1.8, 1.8], color: '#ff8a3a', opacity: FLOOR + 0.06, rotationX: -Math.PI / 2 },
    { position: [D_X - D_W / 2 + 0.02, 1.3, -3.4], size: [1.2, 1.2], color: '#ff8a3a', opacity: WALL - 0.1, rotationY: Math.PI / 2 },
    // 西餅 (桃白) — 路地E
    { position: [-2.4, E_FLOOR + 1.5, E_CZ + E_W / 2 - 0.02], size: [1.5, 1.5], color: '#ff9ac8', opacity: WALL, rotationY: Math.PI },
    { position: [-2.4, E_FLOOR + 0.02, E_CZ], size: [1.7, 1.7], color: '#ff9ac8', opacity: FLOOR, rotationX: -Math.PI / 2 },
  ];
  for (const s of spills) target.add(createLightSpill(s));
}

// ---- 照明 -----------------------------------------------------------------
//
// ポイントライトは 7 灯まで。影は使わない。
// 冷たい蛍光灯と暖色の裸電球を混ぜ、色温度も個体ごとに変える。

function buildLights(root) {
  // 全体を持ち上げる環境光 (これがないと暗部が完全に潰れる)
  root.add(new THREE.AmbientLight(0x39434f, 0.55));

  const lamps = [
    // 路地A: 入口寄りは新しめの昼光色
    { position: [0, 2.27, 7.6], rotationY: Math.PI / 2, length: 1.2, color: 0xcfe4ff, intensity: 3.2, distance: 7.5 },
    // 路地A: 奥は古い管で緑に転んでいる
    { position: [0, 2.27, 2.2], rotationY: Math.PI / 2, length: 1.1, color: 0xdbe8c6, intensity: 2.4, distance: 6.0 },
    // 路地B
    { position: [4.4, 2.12, B_CZ], length: 1.2, color: 0xc8dcf0, intensity: 2.6, distance: 6.5 },
    // 広場 (天井が高いので少し強め)
    { position: [10.2, 3.3, P_CZ], length: 1.4, color: 0xcfe4ff, intensity: 3.6, distance: 9.0 },
    // 路地C: 奥路地。青白いが弱く、突き当りは暗い
    { position: [C_X, C_CEIL - 0.08, 3.4], rotationY: Math.PI / 2, length: 1.0, color: 0xc4d8ef, intensity: 2.2, distance: 5.5 },
    // 路地E: 一段下がった細道。古い管でかなり緑に転んでいる
    { position: [-1.2, E_CEIL - 0.08, E_CZ], length: 1.0, color: 0xd2e2bc, intensity: 2.0, distance: 5.0 },
  ];
  for (const cfg of lamps) root.add(createFluorescentLamp({ ...cfg, castShadow: false }).group);

  // 光源を持たない器具 = 暗い区間を作る
  for (const cfg of [
    { position: [0, 2.27, 4.9], rotationY: Math.PI / 2, tubeColor: 0x272c33 },
    { position: [2.2, 2.12, B_CZ], tubeColor: 0x2b3138 },
    { position: [12.4, 3.3, P_CZ + 1.6], tubeColor: 0x3a4048 },
    // 路地D は光源なしの器具だけ。ネオンの照り返しと路地Bからの漏れ光で見る
    { position: [D_X, D_CEIL - 0.08, -3.0], rotationY: Math.PI / 2, tubeColor: 0x2a3037 },
    { position: [D_X, D_CEIL - 0.08, -6.0], rotationY: Math.PI / 2, tubeColor: 0x262b31 },
    { position: [C_X, C_CEIL - 0.08, 5.8], rotationY: Math.PI / 2, tubeColor: 0x2d333b },
    { position: [-4.0, E_CEIL - 0.08, E_CZ], tubeColor: 0x2a3037 },
  ]) {
    root.add(createFluorescentLamp({ ...cfg, length: 1.1, emitLight: false }).group);
  }

  // 暖色の裸電球。蛍光灯の青白さと混ざるところが狙い
  root.add(
    createHangingLamp({
      position: [-0.35, 2.05, -0.9],
      color: 0xffb066,
      intensity: 3.6,
      distance: 5.0,
      castShadow: false,
    })
  );
  root.add(
    createHangingLamp({
      position: [8.4, 2.6, P_CZ - 1.8],
      color: 0xffc182,
      intensity: 3.4,
      distance: 6.0,
      castShadow: false,
    })
  );
}

// ---- ネオン看板 -------------------------------------------------------------

function buildNeon(root) {
  // 光源を持つのは2枚だけ。残りは発光面 + 加算合成の板で色を足す
  root.add(
    createNeonSign({
      text: '藥房',
      color: '#3dff9a',
      position: [A_W / 2 - 0.07, 1.5, 5.5],
      rotationY: -Math.PI / 2,
      vertical: true,
      size: [0.32, 0.8],
      lightIntensity: 2.2,
    })
  );
  root.add(
    createNeonSign({
      text: '麻雀',
      color: '#ff3340',
      position: [10.4, P_FLOOR + 1.7, P_CZ - P_W / 2 + 0.06],
      vertical: true,
      size: [0.36, 0.9],
      lightIntensity: 2.6,
    })
  );

  // 以下は光源なし
  const unlit = [
    { text: '食堂', color: '#ffd23a', position: [-A_W / 2 + 0.06, 1.95, 2.6], rotationY: Math.PI / 2, size: [0.8, 0.26] },
    { text: '髮廊', color: '#4fd9ff', position: [3.2, 1.72, B_CZ - B_W / 2 + 0.06], size: [0.8, 0.26] },
    { text: '涼茶', color: '#3dff9a', position: [12.0, P_FLOOR + 1.8, P_CZ + P_W / 2 - 0.06], rotationY: Math.PI, size: [0.75, 0.26] },
    // z=8.6 はドーナツ屋の入口になったので、看板は手前へずらす
    { text: '茶餐廳', color: '#ff3340', position: [-A_W / 2 + 0.06, 1.55, 6.9], rotationY: Math.PI / 2, vertical: true, size: [0.3, 0.9] },
    // 路地C (カラオケへ): 奥へ誘導する縦看板
    { text: '歌廳', color: '#ff5ad0', position: [C_X - C_W / 2 + 0.06, C_FLOOR + 1.6, 4.2], rotationY: Math.PI / 2, vertical: true, size: [0.3, 0.85] },
    // 路地D (ラーメンへ)
    { text: '麵', color: '#ff8a3a', position: [D_X + D_W / 2 - 0.06, 1.5, -3.4], rotationY: -Math.PI / 2, vertical: true, size: [0.28, 0.5] },
    // 路地E (ケーキ屋へ): 一段下がった細道
    { text: '西餅', color: '#ff9ac8', position: [-2.4, E_FLOOR + 1.6, E_CZ + E_W / 2 - 0.06], rotationY: Math.PI, size: [0.72, 0.26] },
  ];
  for (const sign of unlit) root.add(createNeonSign({ ...sign, light: false }));
}

// ---- 換気扇・室外機 ---------------------------------------------------------

function buildFixtures(root, dynamic) {
  // 回る換気扇 (update で羽根だけ回す)
  const fan1 = createVentFan({ position: [A_W / 2 - 0.07, 1.75, 3.6], rotationY: -Math.PI / 2, radius: 0.2 });
  root.add(fan1.group);
  dynamic.fans.push(fan1.blades);

  const fan2 = createVentFan({ position: [5.8, 1.7, B_CZ + B_W / 2 - 0.07], rotationY: Math.PI, radius: 0.17 });
  root.add(fan2.group);

  const fan3 = createVentFan({ position: [P_X1 - 0.07, P_FLOOR + 2.4, P_CZ - 2.0], rotationY: -Math.PI / 2, radius: 0.22 });
  root.add(fan3.group);
  dynamic.fans.push(fan3.blades);

  // 室外機 (本体・グリル・ブラケットがそれぞれ InstancedMesh 1つ)
  root.add(
    createACUnits([
      { position: [A_W / 2 - 0.19, 1.86, 6.8], rotationY: -Math.PI / 2 },
      { position: [-A_W / 2 + 0.19, 1.8, 0.4], rotationY: Math.PI / 2 },
      { position: [2.9, 1.62, B_CZ - B_W / 2 + 0.17], rotationY: 0 },
      { position: [6.5, 1.66, B_CZ + B_W / 2 - 0.17], rotationY: Math.PI },
      { position: [9.6, P_FLOOR + 2.0, P_CZ - P_W / 2 + 0.17], rotationY: 0 },
      { position: [11.8, P_FLOOR + 2.2, P_CZ + P_W / 2 - 0.17], rotationY: Math.PI },
      // --- STEP 7 の枝道 ---
      { position: [C_X - C_W / 2 + 0.19, C_FLOOR + 1.72, 4.8], rotationY: Math.PI / 2 },
      { position: [D_X + D_W / 2 - 0.19, 1.5, -4.6], rotationY: -Math.PI / 2 },
      { position: [D_X - D_W / 2 + 0.19, 1.46, -6.2], rotationY: Math.PI / 2 },
      { position: [-2.2, E_FLOOR + 1.58, E_CZ - E_W / 2 + 0.17], rotationY: 0 },
    ])
  );

  // 枝道の換気扇 (路地Dのは回す。狭いので音と動きが効く)
  const fan4 = createVentFan({ position: [D_X - D_W / 2 + 0.07, 1.55, -2.9], rotationY: Math.PI / 2, radius: 0.18 });
  root.add(fan4.group);
  dynamic.fans.push(fan4.blades);

  const fan5 = createVentFan({ position: [E_X0 + 0.9, E_FLOOR + 1.5, E_CZ + E_W / 2 - 0.07], rotationY: Math.PI, radius: 0.16 });
  root.add(fan5.group);
}

// ---- 生活感のある小物 -------------------------------------------------------

function buildClutter(root) {
  // すべて InstancedMesh。段ボール・木箱・バケツ・瓶で4ドローコール
  root.add(
    createClutter({
      cardboard: [
        { position: [-0.58, 0.19, 9.2], scale: [0.42, 0.38, 0.4], rotationY: 0.22 },
        { position: [-0.56, 0.53, 9.15], scale: [0.36, 0.3, 0.34], rotationY: -0.4 },
        { position: [0.6, 0.17, 8.0], scale: [0.4, 0.34, 0.36], rotationY: 0.5 },
        { position: [-0.6, 0.2, 5.9], scale: [0.44, 0.4, 0.4], rotationY: -0.18 },
        { position: [0.59, 0.18, 4.2], scale: [0.42, 0.36, 0.38], rotationY: 0.32 },
        { position: [-0.58, 0.19, 1.9], scale: [0.42, 0.38, 0.4], rotationY: 0.1 },
        { position: [-0.58, 0.53, 1.85], scale: [0.34, 0.3, 0.32], rotationY: -0.5 },
        { position: [2.0, 0.2, -1.45], scale: [0.42, 0.4, 0.38], rotationY: 0.15 },
        { position: [4.9, 0.21, -0.35], scale: [0.44, 0.42, 0.4], rotationY: -0.35 },
        { position: [4.88, 0.58, -0.32], scale: [0.36, 0.32, 0.34], rotationY: 0.2 },
        { position: [8.3, P_FLOOR + 0.19, -3.5], scale: [0.42, 0.38, 0.38], rotationY: 0.28 },
        { position: [12.6, P_FLOOR + 0.21, 1.5], scale: [0.44, 0.42, 0.4], rotationY: -0.22 },
        // --- STEP 7 の枝道 ---
        { position: [C_X - 0.55, C_FLOOR + 0.19, 5.6], scale: [0.42, 0.38, 0.38], rotationY: 0.2 },
        { position: [C_X + 0.54, C_FLOOR + 0.2, 3.0], scale: [0.44, 0.4, 0.4], rotationY: -0.3 },
        { position: [D_X - 0.52, 0.19, -2.6], scale: [0.42, 0.38, 0.38], rotationY: 0.35 },
        { position: [D_X + 0.54, 0.21, -5.2], scale: [0.44, 0.42, 0.4], rotationY: -0.15 },
        { position: [D_X + 0.52, 0.6, -5.18], scale: [0.34, 0.3, 0.32], rotationY: 0.4 },
        { position: [-3.0, E_FLOOR + 0.19, E_CZ - 0.48], scale: [0.42, 0.38, 0.38], rotationY: 0.12 },
        { position: [0.4, E_FLOOR + 0.2, E_CZ + 0.5], scale: [0.44, 0.4, 0.4], rotationY: -0.42 },
      ],
      crates: [
        { position: [0.58, 0.25, 6.6], scale: [0.48, 0.5, 0.46], rotationY: -0.12 },
        { position: [0.56, 0.71, 6.62], scale: [0.42, 0.42, 0.42], rotationY: 0.35 },
        { position: [-0.59, 0.27, 3.0], scale: [0.5, 0.54, 0.48], rotationY: 0.18 },
        { position: [-0.57, 0.25, -0.6], scale: [0.46, 0.5, 0.44], rotationY: -0.28 },
        { position: [3.6, 0.26, -1.5], scale: [0.46, 0.52, 0.44], rotationY: 0.22 },
        { position: [9.0, P_FLOOR + 0.28, 1.6], scale: [0.5, 0.56, 0.48], rotationY: -0.15 },
        { position: [12.7, P_FLOOR + 0.26, -3.2], scale: [0.46, 0.52, 0.44], rotationY: 0.4 },
        // --- STEP 7 の枝道 ---
        { position: [C_X + 0.55, C_FLOOR + 0.27, 5.9], scale: [0.48, 0.52, 0.46], rotationY: 0.24 },
        { position: [D_X - 0.55, 0.26, -6.5], scale: [0.46, 0.5, 0.44], rotationY: -0.2 },
        { position: [-4.2, E_FLOOR + 0.27, E_CZ + 0.46], scale: [0.48, 0.54, 0.46], rotationY: 0.3 },
      ],
      buckets: [
        { position: [0.64, 0.14, 9.5], rotationY: 0.3 },
        { position: [-0.64, 0.14, 7.2], rotationY: -0.2 },
        { position: [0.62, 0.14, 0.4], rotationY: 0.8 },
        { position: [1.7, 0.14, -0.3], rotationY: 0.1 },
        { position: [6.2, 0.14, -1.5], rotationY: -0.6 },
        { position: [8.0, P_FLOOR + 0.14, -2.2], rotationY: 0.4 },
        { position: [11.4, P_FLOOR + 0.14, -3.5], rotationY: -0.3 },
        // --- STEP 7 の枝道 ---
        { position: [C_X - 0.6, C_FLOOR + 0.14, 2.9], rotationY: 0.5 },
        { position: [D_X + 0.6, 0.14, -3.4], rotationY: -0.4 },
        { position: [D_X - 0.6, 0.14, -5.5], rotationY: 0.7 },
        { position: [-1.8, E_FLOOR + 0.14, E_CZ - 0.5], rotationY: 0.2 },
      ],
      bottles: [
        { position: [0.68, 0.12, 9.0] },
        { position: [0.73, 0.12, 8.85] },
        { position: [-0.72, 0.04, 6.4], rotationZ: Math.PI / 2 },
        { position: [-0.68, 0.12, 4.4] },
        { position: [0.7, 0.12, 1.6] },
        { position: [0.74, 0.12, 1.45] },
        { position: [-0.72, 0.12, -0.2] },
        { position: [2.6, 0.12, -1.62] },
        { position: [4.2, 0.12, -0.22] },
        { position: [6.8, 0.04, -1.55], rotationZ: Math.PI / 2 },
        { position: [8.6, P_FLOOR + 0.12, 1.7] },
        { position: [12.9, P_FLOOR + 0.12, 0.4] },
        { position: [12.86, P_FLOOR + 0.12, 0.6] },
        { position: [9.8, P_FLOOR + 0.12, -3.6] },
        // --- STEP 7 の枝道 ---
        { position: [C_X + 0.62, C_FLOOR + 0.12, 4.4] },
        { position: [C_X + 0.66, C_FLOOR + 0.12, 4.25] },
        { position: [D_X - 0.64, 0.12, -4.0] },
        { position: [D_X + 0.64, 0.04, -6.8], rotationZ: Math.PI / 2 },
        { position: [-0.6, E_FLOOR + 0.12, E_CZ - 0.52] },
        { position: [-3.8, E_FLOOR + 0.12, E_CZ + 0.5] },
      ],
    })
  );
}

function buildLivingProps(root) {
  // 洗濯物。通路を横切らせて視線を切る
  root.add(
    createLaundry({
      lines: [
        {
          start: [-A_W / 2 + 0.05, 2.08, 6.4],
          end: [A_W / 2 - 0.05, 2.04, 5.8],
          sag: 0.14,
          items: [
            { t: 0.18, width: 0.42, height: 0.52 },
            { t: 0.45, width: 0.36, height: 0.66 },
            { t: 0.74, width: 0.44, height: 0.46 },
          ],
        },
        {
          start: [-A_W / 2 + 0.05, 2.12, 1.0],
          end: [A_W / 2 - 0.05, 2.06, 0.3],
          sag: 0.16,
          items: [
            { t: 0.2, width: 0.4, height: 0.6 },
            { t: 0.5, width: 0.46, height: 0.5 },
            { t: 0.78, width: 0.34, height: 0.62 },
          ],
        },
        {
          // 路地Bを横断 (ロープがZ方向なので布もZに沿わせる)
          start: [3.9, 1.98, B_CZ - B_W / 2 + 0.05],
          end: [3.9, 1.98, B_CZ + B_W / 2 - 0.05],
          sag: 0.1,
          rotationY: Math.PI / 2,
          items: [
            { t: 0.3, width: 0.4, height: 0.42 },
            { t: 0.68, width: 0.34, height: 0.36 },
          ],
        },
        {
          // 広場の高い位置
          start: [8.2, 3.0, P_CZ - 2.6],
          end: [12.8, 2.85, P_CZ - 2.2],
          sag: 0.3,
          items: [
            { t: 0.25, width: 0.5, height: 0.7 },
            { t: 0.55, width: 0.44, height: 0.8 },
            { t: 0.8, width: 0.5, height: 0.6 },
          ],
        },
        // --- STEP 7 の枝道。奥を見通せないよう、入口寄りに1本ずつ渡す ---
        {
          // 路地C を横断
          start: [C_X - C_W / 2 + 0.05, C_FLOOR + 2.02, 3.1],
          end: [C_X + C_W / 2 - 0.05, C_FLOOR + 1.98, 3.1],
          sag: 0.1,
          rotationY: Math.PI / 2,
          items: [
            { t: 0.28, width: 0.38, height: 0.5 },
            { t: 0.66, width: 0.34, height: 0.44 },
          ],
        },
        {
          // 路地D を横断 (低いので短め)
          start: [D_X - D_W / 2 + 0.05, 1.86, -3.8],
          end: [D_X + D_W / 2 - 0.05, 1.84, -3.8],
          sag: 0.08,
          rotationY: Math.PI / 2,
          items: [
            { t: 0.3, width: 0.36, height: 0.4 },
            { t: 0.7, width: 0.32, height: 0.34 },
          ],
        },
        {
          // 路地E を横断
          start: [-2.6, E_FLOOR + 1.94, E_CZ - E_W / 2 + 0.05],
          end: [-2.6, E_FLOOR + 1.92, E_CZ + E_W / 2 - 0.05],
          sag: 0.09,
          items: [
            { t: 0.32, width: 0.36, height: 0.46 },
            { t: 0.7, width: 0.32, height: 0.38 },
          ],
        },
      ],
    })
  );

  root.add(
    createStools([
      { position: [-0.5, 0, 7.9], rotationY: 0.4 },
      { position: [2.6, 0, B_CZ + 0.35], rotationY: -0.3 },
      { position: [9.6, P_FLOOR, P_CZ + 1.9], rotationY: 0.8 },
      { position: [10.3, P_FLOOR, P_CZ + 2.1], rotationY: -0.5 },
      // --- STEP 7 の枝道 ---
      { position: [D_X - 0.45, 0, -2.2], rotationY: -0.2 },   // ラーメン待ちの席
      { position: [-2.0, E_FLOOR, E_CZ + 0.4], rotationY: 0.6 },
    ])
  );

  root.add(
    createTrashBags([
      { position: [0.55, 0.187, 9.7], rotationY: 0.3 },
      { position: [0.5, 0.187, 9.4], rotationY: -0.5, scale: 0.85 },
      { position: [-0.5, 0.187, -1.3], rotationY: 0.2 },
      { position: [5.5, 0.187, -1.45], rotationY: 0.6, scale: 0.9 },
      { position: [8.1, P_FLOOR + 0.187, 1.4], rotationY: 0.1 },
      // --- STEP 7 の枝道。袋小路の突き当りにまとめて置かれている ---
      { position: [D_X + 0.5, 0.187, -6.6], rotationY: 0.4 },
      { position: [D_X + 0.42, 0.187, -6.3], rotationY: -0.3, scale: 0.85 },
      { position: [C_X - 0.5, C_FLOOR + 0.187, 5.9], rotationY: 0.2 },
      { position: [-4.6, E_FLOOR + 0.187, E_CZ - 0.45], rotationY: 0.7, scale: 0.9 },
    ])
  );

  root.add(
    createPottedPlants([
      { position: [-0.62, 0, 2.6], rotationY: 0.2 },
      { position: [0.62, 0, -1.2], rotationY: -0.6 },
      { position: [9.4, P_FLOOR, -3.5], rotationY: 0.9, scale: 0.9 },
      { position: [12.5, P_FLOOR, -1.0], rotationY: 0.4 },
      // --- STEP 7 の枝道 ---
      { position: [C_X + 0.6, C_FLOOR, 2.7], rotationY: 0.3 },
      { position: [0.8, E_FLOOR, E_CZ - 0.5], rotationY: -0.4, scale: 0.9 },
    ])
  );
}

// ---- 破棄 -------------------------------------------------------------------

/**
 * 敷地をまるごと破棄する。
 * builders の共有マテリアル (userData.shared) は他所でも使うので破棄しない。
 */
export function disposeSite(root) {
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
}

// ---- 統計 -------------------------------------------------------------------

function collectStats(root, colliders = []) {
  const s = {
    drawCalls: 0,
    transparentDraws: 0,
    triangles: 0,
    meshes: 0,        // 実際に描かれるメッシュ
    meshesTotal: 0,   // 非表示ぶんも含む総数
    instancedMeshes: 0,
    instances: 0,
    lights: 0,
    pointLights: 0,
    shadowLights: 0,
    materials: 0,
    colliders: colliders.length,
    colliderTriangles: 0,
  };
  const mats = new Set();

  for (const c of colliders) {
    const g = c.geometry;
    s.colliderTriangles += g.index ? g.index.count / 3 : g.attributes.position.count / 3;
  }
  s.colliderTriangles = Math.round(s.colliderTriangles);

  // 実際にレンダラが描くのは「自分も祖先もすべて visible」なものだけ。
  // 施設区画は状態ごとにグループ単位で visible を切り替えるので、
  // ここを見ないと locked と opened で同じ数字になってしまう。
  const renderable = (obj) => {
    let n = obj;
    while (n) {
      if (!n.visible) return false;
      if (n === root) return true;
      n = n.parent;
    }
    return true;
  };

  root.traverse((o) => {
    if (o.isLight) {
      if (!renderable(o)) return;
      s.lights += 1;
      if (o.isPointLight) s.pointLights += 1;
      if (o.castShadow) s.shadowLights += 1;
      return;
    }
    if (!o.isMesh) return;

    if (o.isInstancedMesh) s.instancedMeshes += 1;
    else s.meshesTotal += 1;

    if (!renderable(o)) return;

    const g = o.geometry;
    const tri = g.index ? g.index.count / 3 : g.attributes.position.count / 3;
    if (o.isInstancedMesh) {
      s.instances += o.count;
      s.triangles += tri * o.count;
    } else {
      s.meshes += 1;
      s.triangles += tri;
    }
    s.drawCalls += 1;
    if (o.material.transparent) s.transparentDraws += 1;
    mats.add(o.material);
  });

  s.triangles = Math.round(s.triangles);
  s.materials = mats.size;
  return s;
}

// ---- スポーン地点 -------------------------------------------------------------
//
// position は「足元」の座標。yaw=0 が -Z 方向を向く。
// STEP 3 ではプレイヤーがここへワープして歩き始める。

/** ゲーム開始位置 (路地Aの入口、奥を向いている) */
export const SITE_SPAWN = { position: [0, 0, 8.6], yaw: 0 };

/** 確認用のワープ地点。site_test.html のボタン / 数字キーから使う */
export const SITE_WAYPOINTS = [
  {
    name: '① 路地A 入口',
    position: [0, 0, 8.6],
    yaw: 0,
    hint: '幅1.8m / 天井2.35m。奥は曲がり角と洗濯物で見通せない',
  },
  {
    name: '② 曲がり角',
    position: [0, 0, 0.6],
    yaw: -0.9,
    hint: '路地Bへ折れる。天井が2.20mに下がる',
  },
  {
    name: '③ 路地B',
    position: [2.4, 0, B_CZ],
    yaw: -Math.PI / 2,
    hint: '幅1.7m。室外機と換気扇が頭の高さに突き出す',
  },
  {
    name: '④ 広場',
    position: [9.6, P_FLOOR, P_CZ + 0.6],
    yaw: -Math.PI / 2 + 0.4,
    hint: '18cmの段差を上がった先。天井3.4mで視界が開ける',
  },
  {
    name: '⑤ 九龍書店の前',
    position: [11.4, P_FLOOR, P_CZ],
    yaw: -Math.PI / 2,
    hint: 'locked/unlocked では入れない。opened なら中へ入れる',
  },
  {
    name: '⑥ 書店の中',
    position: [17.5, P_FLOOR, P_CZ],
    yaw: Math.PI / 2,
    hint: 'opened のときだけ有効。入口(-X)を向いている',
    indoor: 'book',
  },
  {
    name: '⑦ ドーナツ屋の前 (路地A西)',
    position: [0.2, 0, 8.9],
    yaw: Math.PI / 2,
    hint: '入口を入ってすぐ左手。奥まった入口',
  },
  {
    name: '⑧ 路地C (カラオケへ)',
    position: [C_X, C_FLOOR, 4.0],
    yaw: Math.PI,
    hint: '広場の北壁から入る奥路地。突き当りが袋小路',
  },
  {
    name: '⑨ 路地D (ラーメンへ)',
    position: [D_X, 0, -4.2],
    yaw: 0,
    hint: '路地Bから南へ。天井2.1mでいちばん低い',
  },
  {
    name: '⑩ 路地E (ケーキ屋へ)',
    position: [-1.6, E_FLOOR, E_CZ],
    yaw: Math.PI / 2,
    hint: '路地Dから西へ折れて15cm下がる細道',
  },
  {
    name: '⑪ ドーナツ屋の中',
    position: [-6.2, 0, 8.9],
    yaw: -Math.PI / 2,
    hint: 'opened のときだけ有効',
    indoor: 'donut',
  },
  {
    name: '⑫ カラオケの中',
    position: [10.2, C_FLOOR, 11.6],
    yaw: 0,
    hint: 'opened のときだけ有効',
    indoor: 'karaoke',
  },
  {
    name: '⑬ ラーメン屋の中',
    position: [3.8, 0, -12.4],
    yaw: Math.PI,
    hint: 'opened のときだけ有効',
    indoor: 'ramen',
  },
  {
    name: '⑭ ケーキ屋の中',
    position: [-10.4, E_FLOOR, -5.6],
    yaw: Math.PI / 2,
    hint: 'opened のときだけ有効',
    indoor: 'cake',
  },
];

/** シーンに敷地用の霧と背景を設定する */
export function applySiteAtmosphere(scene) {
  // 軽い霧。曲がり角まで11.75mなので、そこで5割ほど霞む程度に留める
  scene.fog = new THREE.FogExp2(0x0c1013, 0.07);
  scene.background = new THREE.Color(0x080a0d);
}
