import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { MATERIALS, createBox, getRawMaterial } from './roomBuilder.js';
import {
  neonSignTexture,
  signPlateTexture,
  grimeAtlasTexture,
  stainAtlasTexture,
  radialGlowTexture,
} from './textures.js';

/**
 * 九龍城の通路を埋めるための小物・照明・看板のビルダー。
 *
 * 方針:
 *   - 外部モデルは使わず、基本 Geometry の組み合わせだけで作る
 *   - 同じ形が並ぶものは InstancedMesh に寄せる
 *   - 動かないものは呼び出し側で mergeGroupByMaterial() に通せる形で返す
 */

const UP = new THREE.Vector3(0, 1, 0);

/** index から決まる 0..1 の擬似乱数。見た目のばらつきを毎回同じにするため */
function hashRandom(i, salt = 0) {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

// ---- 配管 ---------------------------------------------------------------

/**
 * 2点を結ぶ配管。任意の方向に引ける。
 * @param {{start: [number,number,number], end: [number,number,number],
 *          radius?: number, material?: THREE.Material,
 *          radialSegments?: number, name?: string}} options
 */
export function createPipe({
  start,
  end,
  radius = 0.05,
  material,
  radialSegments = 8,
  name = 'pipe',
}) {
  const a = new THREE.Vector3(...start);
  const b = new THREE.Vector3(...end);
  const dir = b.clone().sub(a);
  const length = dir.length();

  const geometry = new THREE.CylinderGeometry(radius, radius, length, radialSegments, 1);
  const mesh = new THREE.Mesh(geometry, material ?? MATERIALS.pipePainted());
  mesh.name = name;
  mesh.position.copy(a).addScaledVector(dir, 0.5);
  mesh.quaternion.setFromUnitVectors(UP, dir.normalize());
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/**
 * 配管の曲がり・継ぎ手を隠す玉。角に置くだけで一気に「配管らしく」なる。
 */
export function createPipeJoint({ position, radius = 0.065, material, name = 'pipe_joint' }) {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 10, 8),
    material ?? MATERIALS.pipePainted()
  );
  mesh.position.set(...position);
  mesh.name = name;
  mesh.castShadow = true;
  return mesh;
}

/**
 * 配管を壁に留めるバンド。
 * TorusGeometry は XY 平面のリングなので、Z 方向に走る配管ならそのまま、
 * X 方向なら Y 軸に 90 度回すと配管を囲める。
 * @param {{position: [number,number,number], axis?: 'x'|'z',
 *          radius?: number, name?: string}} options
 */
export function createPipeBracket({
  position,
  axis = 'z',
  radius = 0.07,
  name = 'pipe_bracket',
}) {
  const mesh = new THREE.Mesh(
    new THREE.TorusGeometry(radius, 0.014, 5, 10),
    MATERIALS.darkMetal()
  );
  mesh.position.set(...position);
  mesh.rotation.y = axis === 'x' ? Math.PI / 2 : 0;
  mesh.name = name;
  mesh.castShadow = false;
  return mesh;
}

// ---- 電線・ケーブル -----------------------------------------------------

/**
 * たわんだ電線。CatmullRom の制御点を下げてカテナリー風にする。
 * @param {{start: [number,number,number], end: [number,number,number],
 *          sag?: number, radius?: number, segments?: number,
 *          material?: THREE.Material, name?: string}} options
 */
/**
 * 2点間をたわませた曲線。電線にも物干しロープにも使う。
 * @returns {THREE.CatmullRomCurve3}
 */
export function buildSagCurve(start, end, sag = 0.22) {
  const a = new THREE.Vector3(...start);
  const b = new THREE.Vector3(...end);
  const at = (t, drop) => {
    const p = a.clone().lerp(b, t);
    p.y -= drop;
    return p;
  };
  return new THREE.CatmullRomCurve3([
    a,
    at(0.25, sag * 0.7),
    at(0.5, sag),
    at(0.75, sag * 0.7),
    b,
  ]);
}

export function createCable({
  start,
  end,
  sag = 0.22,
  radius = 0.012,
  segments = 18,
  material,
  name = 'cable',
}) {
  const curve = buildSagCurve(start, end, sag);
  const geometry = new THREE.TubeGeometry(curve, segments, radius, 5, false);
  const mesh = new THREE.Mesh(geometry, material ?? MATERIALS.cable());
  mesh.name = name;
  mesh.castShadow = false; // 細すぎて影が汚くなるだけなので落とさない
  return mesh;
}

/**
 * 電線の束。少しずつずらした複数本をまとめて返す。
 */
export function createCableBundle({
  start,
  end,
  count = 3,
  sag = 0.22,
  spread = 0.05,
  seed = 0,
}) {
  const group = new THREE.Group();
  group.name = 'cable_bundle';
  for (let i = 0; i < count; i += 1) {
    const dx = (hashRandom(i, seed) - 0.5) * spread * 2;
    const dy = (hashRandom(i, seed + 1) - 0.5) * spread;
    const dz = (hashRandom(i, seed + 2) - 0.5) * spread * 2;
    group.add(
      createCable({
        start: [start[0] + dx, start[1] + dy, start[2] + dz],
        end: [end[0] + dx, end[1] + dy, end[2] + dz],
        sag: sag * (0.7 + hashRandom(i, seed + 3) * 0.7),
        radius: 0.009 + hashRandom(i, seed + 4) * 0.008,
      })
    );
  }
  return group;
}

// ---- 照明 ---------------------------------------------------------------

/**
 * 古い直管蛍光灯。
 *
 * 返り値の tube / light を保持しておけば、明滅アニメーションを掛けられる。
 * 明滅させる個体だけ shared でないマテリアルを持たせること（sharedTube: false）。
 *
 * emitLight: false にすると PointLight を作らない。
 * 「切れている蛍光灯」を置きたいときと、光源数を増やさずに器具だけ増やしたいときに使う。
 *
 * @param {{position: [number,number,number], rotationY?: number,
 *          length?: number, color?: number, intensity?: number,
 *          distance?: number, castShadow?: boolean, sharedTube?: boolean,
 *          emitLight?: boolean, tubeColor?: number}} options
 * @returns {{group: THREE.Group, light: THREE.PointLight|null, tube: THREE.Mesh,
 *            tubeMaterial: THREE.MeshBasicMaterial}}
 */
export function createFluorescentLamp({
  position,
  rotationY = 0,
  length = 1.2,
  color = 0xcfe4ff,
  intensity = 3.2,
  distance = 6.5,
  castShadow = false,
  sharedTube = true,
  emitLight = true,
  tubeColor,
}) {
  const group = new THREE.Group();
  group.name = 'fluorescent_lamp';
  group.position.set(...position);
  group.rotation.y = rotationY;

  // 笠（反射板）
  const housing = createBox({
    size: [length, 0.07, 0.13],
    position: [0, 0.05, 0],
    material: MATERIALS.darkMetal(),
    name: 'lamp_housing',
    castShadow: false,
  });
  group.add(housing);

  // 吊り金具
  for (const sx of [-1, 1]) {
    group.add(
      createBox({
        size: [0.02, 0.14, 0.02],
        position: [sx * length * 0.38, 0.15, 0],
        material: MATERIALS.darkMetal(),
        name: 'lamp_hanger',
        castShadow: false,
      })
    );
  }

  // 発光する管。トーンマッピングを切って白飛びさせ、蛍光灯らしくする
  const litColor = tubeColor ?? color;
  const tubeMaterial = sharedTube
    ? getSharedTubeMaterial(litColor)
    : new THREE.MeshBasicMaterial({ color: litColor, toneMapped: false });

  const tube = new THREE.Mesh(
    new THREE.CylinderGeometry(0.022, 0.022, length * 0.94, 8, 1),
    tubeMaterial
  );
  tube.rotation.z = Math.PI / 2;
  tube.name = 'lamp_tube';
  group.add(tube);

  let light = null;
  if (emitLight) {
    light = new THREE.PointLight(color, intensity, distance, 2);
    light.position.set(0, -0.05, 0);
    light.castShadow = castShadow;
    if (castShadow) {
      light.shadow.mapSize.set(512, 512);
      light.shadow.bias = -0.0025;
    }
    group.add(light);
  }

  return { group, light, tube, tubeMaterial };
}

const tubeMaterialCache = new Map();
function getSharedTubeMaterial(color) {
  if (!tubeMaterialCache.has(color)) {
    const mat = new THREE.MeshBasicMaterial({ color, toneMapped: false });
    mat.userData.shared = true;
    tubeMaterialCache.set(color, mat);
  }
  return tubeMaterialCache.get(color);
}

// ---- ネオン看板 ---------------------------------------------------------

/**
 * 壁付けのネオン看板。板 + 発光文字 + 小さな色付きライト。
 *
 * @param {{text: string, color?: number|string, position: [number,number,number],
 *          rotationY?: number, vertical?: boolean, size?: [number, number],
 *          light?: boolean, lightIntensity?: number, backing?: boolean}} options
 * @returns {THREE.Group}
 */
export function createNeonSign({
  text,
  color = '#ff3b30',
  position,
  rotationY = 0,
  vertical = false,
  size,
  light = true,
  lightIntensity = 2.4,
  backing = true,
}) {
  const cssColor = typeof color === 'number'
    ? `#${color.toString(16).padStart(6, '0')}`
    : color;

  const [w, h] = size ?? (vertical ? [0.34, 0.86] : [0.86, 0.34]);

  const group = new THREE.Group();
  group.name = `neon_${text}`;
  group.position.set(...position);
  group.rotation.y = rotationY;

  if (backing) {
    group.add(
      createBox({
        size: [w + 0.06, h + 0.06, 0.05],
        position: [0, 0, -0.035],
        material: MATERIALS.darkMetal(),
        name: 'neon_backing',
        castShadow: false,
      })
    );
  }

  // 発光面。透過 PNG 相当のテクスチャを非トーンマップで貼る
  const face = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshBasicMaterial({
      map: neonSignTexture({ text, color: cssColor, vertical }),
      transparent: true,
      toneMapped: false,
      depthWrite: false,
    })
  );
  face.name = 'neon_face';
  group.add(face);

  if (light) {
    const pointLight = new THREE.PointLight(
      new THREE.Color(cssColor),
      lightIntensity,
      3.4,
      2
    );
    pointLight.position.set(0, 0, 0.25);
    pointLight.castShadow = false;
    group.add(pointLight);
  }

  return group;
}

// ---- 窓・換気扇・室外機 --------------------------------------------------

/**
 * 古い窓。格子入り、内側がほのかに灯っている想定。
 * @param {{position: [number,number,number], rotationY?: number,
 *          width?: number, height?: number, lit?: boolean, litColor?: number}} options
 */
export function createOldWindow({
  position,
  rotationY = 0,
  width = 0.8,
  height = 0.9,
  lit = true,
  litColor = 0xffb46a,
}) {
  const group = new THREE.Group();
  group.name = 'old_window';
  group.position.set(...position);
  group.rotation.y = rotationY;

  const frameT = 0.05;
  const frame = MATERIALS.darkMetal();

  // 枠（上下左右）
  group.add(
    createBox({
      size: [width + frameT * 2, frameT, 0.09],
      position: [0, height / 2 + frameT / 2, 0],
      material: frame,
      name: 'window_frame_top',
      castShadow: false,
    })
  );
  group.add(
    createBox({
      size: [width + frameT * 2, frameT, 0.09],
      position: [0, -height / 2 - frameT / 2, 0],
      material: frame,
      name: 'window_frame_bottom',
      castShadow: false,
    })
  );
  for (const sx of [-1, 1]) {
    group.add(
      createBox({
        size: [frameT, height, 0.09],
        position: [sx * (width / 2 + frameT / 2), 0, 0],
        material: frame,
        name: 'window_frame_side',
        castShadow: false,
      })
    );
  }

  // ガラス（暗い反射面）
  const glass = createBox({
    size: [width, height, 0.02],
    position: [0, 0, 0.01],
    material: MATERIALS.glassDark(),
    name: 'window_glass',
    castShadow: false,
  });
  group.add(glass);

  // 中から漏れる光。板を1枚置くだけで「人が住んでいる」感じが出る
  if (lit) {
    const inner = new THREE.Mesh(
      new THREE.PlaneGeometry(width * 0.94, height * 0.94),
      new THREE.MeshBasicMaterial({
        color: litColor,
        toneMapped: false,
        transparent: true,
        opacity: 0.5,
      })
    );
    inner.position.set(0, 0, -0.02);
    inner.name = 'window_inner_glow';
    group.add(inner);
  }

  // 防犯格子
  for (let i = 0; i < 3; i += 1) {
    group.add(
      createBox({
        size: [0.018, height, 0.018],
        position: [(i - 1) * (width / 3.2), 0, 0.04],
        material: frame,
        name: 'window_bar',
        castShadow: false,
      })
    );
  }

  return group;
}

/**
 * 壁付けの換気扇。返り値の blades を回すと動く。
 * @returns {{group: THREE.Group, blades: THREE.Group}}
 */
export function createVentFan({ position, rotationY = 0, radius = 0.21 }) {
  const group = new THREE.Group();
  group.name = 'vent_fan';
  group.position.set(...position);
  group.rotation.y = rotationY;

  // 筐体
  const housing = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, 0.14, 14, 1, true),
    MATERIALS.rustyPanel()
  );
  housing.rotation.x = Math.PI / 2;
  housing.name = 'vent_housing';
  group.add(housing);

  // 奥の暗がり
  const back = new THREE.Mesh(
    new THREE.CircleGeometry(radius * 0.98, 14),
    MATERIALS.glassDark()
  );
  back.position.z = -0.07;
  group.add(back);

  // 羽根
  const blades = new THREE.Group();
  blades.name = 'vent_blades';
  for (let i = 0; i < 4; i += 1) {
    const blade = createBox({
      size: [radius * 1.55, 0.012, 0.05],
      position: [0, 0, 0],
      rotationY: 0,
      material: MATERIALS.darkMetal(),
      name: 'vent_blade',
      castShadow: false,
    });
    blade.rotation.z = (i * Math.PI) / 2;
    blades.add(blade);
  }
  blades.position.z = 0.01;
  group.add(blades);

  // 前面のリング
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(radius, 0.02, 6, 16),
    MATERIALS.darkMetal()
  );
  ring.position.z = 0.07;
  group.add(ring);

  return { group, blades };
}

/**
 * 室外機をまとめて作る。本体とグリルをそれぞれ InstancedMesh にする。
 * @param {Array<{position: [number,number,number], rotationY?: number}>} placements
 */
export function createACUnits(placements) {
  const group = new THREE.Group();
  group.name = 'ac_units';
  if (placements.length === 0) return group;

  const bodyGeo = new THREE.BoxGeometry(0.62, 0.44, 0.3);
  const grilleGeo = new THREE.TorusGeometry(0.13, 0.02, 6, 14);
  const bracketGeo = new THREE.BoxGeometry(0.56, 0.03, 0.26);

  const bodies = createInstancedProps({
    geometry: bodyGeo,
    material: MATERIALS.rustyPanel(),
    instances: placements.map((p) => ({
      position: p.position,
      rotationY: p.rotationY ?? 0,
    })),
    name: 'ac_body',
    colorVariation: 0.18,
  });
  group.add(bodies);

  // グリル（前面の丸い開口）
  const grilles = createInstancedProps({
    geometry: grilleGeo,
    material: MATERIALS.darkMetal(),
    instances: placements.map((p) => {
      const ry = p.rotationY ?? 0;
      const forward = new THREE.Vector3(0, 0, 0.16).applyAxisAngle(UP, ry);
      return {
        position: [
          p.position[0] + forward.x,
          p.position[1],
          p.position[2] + forward.z,
        ],
        rotationY: ry,
      };
    }),
    name: 'ac_grille',
    castShadow: false,
  });
  group.add(grilles);

  // 壁付けブラケット
  const brackets = createInstancedProps({
    geometry: bracketGeo,
    material: MATERIALS.darkMetal(),
    instances: placements.map((p) => ({
      position: [p.position[0], p.position[1] - 0.24, p.position[2]],
      rotationY: p.rotationY ?? 0,
    })),
    name: 'ac_bracket',
    castShadow: false,
  });
  group.add(brackets);

  return group;
}

// ---- 店構え -------------------------------------------------------------

/**
 * 閉まったシャッター。枠 + 波板 + 下の隙間。
 */
export function createShutter({
  position,
  rotationY = 0,
  width = 1.2,
  height = 2.0,
  openGap = 0.0,
}) {
  const group = new THREE.Group();
  group.name = 'shutter';
  group.position.set(...position);
  group.rotation.y = rotationY;

  const panelHeight = height - openGap;
  group.add(
    createBox({
      size: [width, panelHeight, 0.06],
      position: [0, openGap + panelHeight / 2, 0],
      material: MATERIALS.shutter(),
      uvScale: 1.0,
      name: 'shutter_panel',
    })
  );

  // 巻き取り箱
  group.add(
    createBox({
      size: [width + 0.12, 0.22, 0.16],
      position: [0, height + 0.11, 0],
      material: MATERIALS.darkMetal(),
      name: 'shutter_box',
    })
  );

  // ガイドレール
  for (const sx of [-1, 1]) {
    group.add(
      createBox({
        size: [0.06, height, 0.1],
        position: [sx * (width / 2 + 0.03), height / 2, 0],
        material: MATERIALS.darkMetal(),
        name: 'shutter_rail',
      })
    );
  }

  return group;
}

/**
 * 暖簾。細い布を並べただけだが、店先の印象がはっきり変わる。
 */
export function createNoren({
  position,
  rotationY = 0,
  width = 1.15,
  height = 0.5,
  strips = 5,
  color = 0x7c1f22,
}) {
  const group = new THREE.Group();
  group.name = 'noren';
  group.position.set(...position);
  group.rotation.y = rotationY;

  const material = getNorenMaterial(color);
  const stripWidth = (width / strips) * 0.88;

  for (let i = 0; i < strips; i += 1) {
    const x = -width / 2 + (width / strips) * (i + 0.5);
    const h = height * (0.88 + hashRandom(i, 7) * 0.18);
    group.add(
      createBox({
        size: [stripWidth, h, 0.012],
        position: [x, -h / 2, 0],
        material,
        name: 'noren_strip',
        castShadow: false,
      })
    );
  }

  // 竿
  const rod = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015, 0.015, width + 0.1, 6),
    MATERIALS.darkMetal()
  );
  rod.rotation.z = Math.PI / 2;
  group.add(rod);

  return group;
}

const norenMaterialCache = new Map();
function getNorenMaterial(color) {
  if (!norenMaterialCache.has(color)) {
    const mat = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.95,
      metalness: 0.0,
      side: THREE.DoubleSide,
    });
    mat.userData.shared = true;
    norenMaterialCache.set(color, mat);
  }
  return norenMaterialCache.get(color);
}

// ---- インスタンス化された小物 --------------------------------------------

/**
 * 同じ形の小物をまとめて1ドローコールにする。
 *
 * @param {{geometry: THREE.BufferGeometry, material: THREE.Material,
 *          instances: Array<{position:[number,number,number], rotationY?: number,
 *                            rotationX?: number, rotationZ?: number,
 *                            scale?: number|[number,number,number]}>,
 *          name?: string, colorVariation?: number, castShadow?: boolean}} options
 * @returns {THREE.InstancedMesh}
 */
export function createInstancedProps({
  geometry,
  material,
  instances,
  name = 'instanced_props',
  colorVariation = 0,
  castShadow = true,
}) {
  const mesh = new THREE.InstancedMesh(geometry, material, instances.length);
  mesh.name = name;

  const matrix = new THREE.Matrix4();
  const quat = new THREE.Quaternion();
  const euler = new THREE.Euler();
  const pos = new THREE.Vector3();
  const scale = new THREE.Vector3();
  const color = new THREE.Color();

  instances.forEach((inst, i) => {
    pos.set(inst.position[0], inst.position[1], inst.position[2]);
    euler.set(inst.rotationX ?? 0, inst.rotationY ?? 0, inst.rotationZ ?? 0);
    quat.setFromEuler(euler);
    const s = inst.scale ?? 1;
    if (Array.isArray(s)) scale.set(s[0], s[1], s[2]);
    else scale.setScalar(s);

    matrix.compose(pos, quat, scale);
    mesh.setMatrixAt(i, matrix);

    if (colorVariation > 0) {
      // 明度だけをばらつかせる。色相を変えると素材感が壊れる
      const t = 1 + (hashRandom(i, 13) - 0.5) * colorVariation * 2;
      color.setRGB(t, t, t);
      mesh.setColorAt(i, color);
    }
  });

  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

  mesh.castShadow = castShadow;
  mesh.receiveShadow = true;
  mesh.computeBoundingSphere();

  return mesh;
}

// ---- 汚しデカール -------------------------------------------------------

/**
 * 壁や床に重ねる汚し。
 *
 * MultiplyBlending なので「下の面の陰影を保ったまま暗くする」だけ。
 * ライト計算に一切参加しないため、枚数を増やしてもほぼ無料。
 * アトラスの4セルを使い分けるので、材質は種類ごとに1つで済む。
 */
const DECAL_CELL = {
  /** 壁アトラス */
  base: 0, // 下部の黒ずみ
  mold: 1, // カビ
  rust: 2, // 錆の垂れ
  rain: 3, // 雨染み
  /** 床アトラス */
  dirt: 0,
  oil: 1,
  puddle: 2,
  specks: 3,
};

export { DECAL_CELL };

function getDecalMaterial(atlas) {
  return getRawMaterial(`decal.${atlas}`, () => {
    const map = atlas === 'stain' ? stainAtlasTexture() : grimeAtlasTexture();
    return new THREE.MeshBasicMaterial({
      map,
      transparent: true,
      blending: THREE.MultiplyBlending,
      depthWrite: false,
      toneMapped: false,
      // 霧を適用してはいけない。
      // 乗算合成では「変化なし = 白」なので、霧の色（ほぼ黒）に寄せられると
      // 遠くの汚れが真っ黒な板になってしまう。霧は下地の壁側にかかれば足りる。
      fog: false,
      // 壁面と同一平面なので、わずかに手前へ寄せて Z ファイティングを避ける
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    });
  });
}

/** PlaneGeometry の UV をアトラスの1セルに割り当てる */
function setAtlasUV(geometry, cell, flipX, flipY) {
  const uv = geometry.attributes.uv;
  const col = cell % 2;
  const row = Math.floor(cell / 2);
  const u0 = col * 0.5;
  const u1 = u0 + 0.5;
  const vTop = 1 - row * 0.5; // Canvas の上側が v=1 側
  const vBottom = vTop - 0.5;
  const [left, right] = flipX ? [u1, u0] : [u0, u1];
  const [top, bottom] = flipY ? [vBottom, vTop] : [vTop, vBottom];
  uv.setXY(0, left, top);
  uv.setXY(1, right, top);
  uv.setXY(2, left, bottom);
  uv.setXY(3, right, bottom);
  uv.needsUpdate = true;
  return geometry;
}

/**
 * @param {{atlas?: 'grime'|'stain', cell?: number, size: [number, number],
 *          position: [number,number,number], rotationY?: number,
 *          rotationX?: number, flipX?: boolean, flipY?: boolean,
 *          name?: string}} options
 */
export function createDecal({
  atlas = 'grime',
  cell = 0,
  size,
  position,
  rotationY = 0,
  rotationX = 0,
  flipX = false,
  flipY = false,
  name = 'decal',
}) {
  const geometry = new THREE.PlaneGeometry(size[0], size[1]);
  setAtlasUV(geometry, cell, flipX, flipY);

  const mesh = new THREE.Mesh(geometry, getDecalMaterial(atlas));
  mesh.position.set(position[0], position[1], position[2]);
  mesh.rotation.set(rotationX, rotationY, 0);
  mesh.name = name;
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  mesh.renderOrder = 1;
  return mesh;
}

// ---- 光の映り込み -------------------------------------------------------

/**
 * 看板やランプの光が壁に落ちている表現。
 *
 * 実際のライトを増やすとフラグメントごとの計算が全体に効いてしまうので、
 * 加算合成の板で「そこだけ光が当たっている」ように見せる。
 *
 * @param {{position: [number,number,number], size: [number, number],
 *          color?: string, opacity?: number, rotationY?: number,
 *          rotationX?: number}} options
 */
export function createLightSpill({
  position,
  size,
  color = '#ffffff',
  opacity = 0.5,
  rotationY = 0,
  rotationX = 0,
}) {
  const material = getRawMaterial(`spill.${color}.${opacity}`, () =>
    new THREE.MeshBasicMaterial({
      map: radialGlowTexture(),
      color: new THREE.Color(color),
      opacity,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    })
  );

  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(size[0], size[1]), material);
  mesh.position.set(position[0], position[1], position[2]);
  mesh.rotation.set(rotationX, rotationY, 0);
  mesh.name = 'light_spill';
  mesh.castShadow = false;
  mesh.renderOrder = 2;
  return mesh;
}

// ---- 塗装された看板・店舗札 ----------------------------------------------

/**
 * ネオンではない古い看板。文字は塗装なので周囲の光を受けて見える。
 * @param {{text: string, position: [number,number,number], rotationY?: number,
 *          size?: [number, number], bg?: string, fg?: string,
 *          vertical?: boolean, backing?: boolean}} options
 */
export function createSignPlate({
  text,
  position,
  rotationY = 0,
  size,
  bg = '#8c1f1c',
  fg = '#e8d49a',
  vertical = false,
  backing = true,
}) {
  const [w, h] = size ?? (vertical ? [0.26, 0.7] : [0.7, 0.26]);
  const group = new THREE.Group();
  group.name = `plate_${text}`;
  group.position.set(position[0], position[1], position[2]);
  group.rotation.y = rotationY;

  if (backing) {
    group.add(
      createBox({
        size: [w + 0.03, h + 0.03, 0.03],
        position: [0, 0, -0.02],
        material: MATERIALS.darkMetal(),
        name: 'plate_backing',
        castShadow: false,
      })
    );
  }

  const material = getRawMaterial(`plate.${text}.${bg}`, () =>
    new THREE.MeshStandardMaterial({
      map: signPlateTexture({ text, bg, fg, vertical }),
      roughness: 0.9,
      metalness: 0.05,
    })
  );

  const face = new THREE.Mesh(new THREE.PlaneGeometry(w, h), material);
  face.name = 'plate_face';
  face.castShadow = false;
  group.add(face);

  return group;
}

// ---- 洗濯物 -------------------------------------------------------------

/**
 * 物干しロープと吊るされた洗濯物。
 * 通路を横切らせると視線が切れて、奥まで見通せなくなる。
 *
 * 布はすべて1つの InstancedMesh にまとめ、色だけ振る。
 *
 * @param {{lines: Array<{start: [number,number,number], end: [number,number,number],
 *          sag?: number, rotationY?: number,
 *          items: Array<{t: number, width: number, height: number, tilt?: number}>}>}} options
 */
export function createLaundry({ lines }) {
  const group = new THREE.Group();
  group.name = 'laundry';

  const instances = [];

  lines.forEach((line, li) => {
    const curve = buildSagCurve(line.start, line.end, line.sag ?? 0.16);

    const rope = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 14, 0.008, 4, false),
      MATERIALS.cable()
    );
    rope.name = 'laundry_rope';
    rope.castShadow = false;
    group.add(rope);

    for (const item of line.items) {
      const p = curve.getPoint(item.t);
      instances.push({
        position: [p.x, p.y - item.height / 2 - 0.02, p.z],
        rotationY: line.rotationY ?? 0,
        rotationZ: item.tilt ?? (hashRandom(li * 7 + instances.length, 5) - 0.5) * 0.14,
        scale: [item.width, item.height, 1],
      });
    }
  });

  if (instances.length > 0) {
    group.add(
      createInstancedProps({
        geometry: new THREE.PlaneGeometry(1, 1),
        material: MATERIALS.cloth(),
        instances,
        name: 'laundry_cloth',
        colorVariation: 0.4,
        castShadow: false,
      })
    );
  }

  return group;
}

// ---- 追加の生活小物 -----------------------------------------------------

/** プラスチックの丸椅子。座面と3本脚をまとめて1ジオメトリにしてから並べる */
function buildStoolGeometry() {
  const seat = new THREE.CylinderGeometry(0.145, 0.13, 0.035, 12);
  seat.translate(0, 0.42, 0);

  const parts = [seat];
  for (let i = 0; i < 3; i += 1) {
    const a = (i / 3) * Math.PI * 2;
    const leg = new THREE.CylinderGeometry(0.016, 0.02, 0.42, 6);
    leg.translate(Math.cos(a) * 0.1, 0.21, Math.sin(a) * 0.1);
    parts.push(leg);
  }
  const merged = mergeGeometries(parts, false);
  for (const p of parts) p.dispose();
  return merged;
}

export function createStools(placements) {
  return createInstancedProps({
    geometry: buildStoolGeometry(),
    material: MATERIALS.plastic(),
    instances: placements,
    name: 'stools',
    colorVariation: 0.3,
  });
}

/** ゴミ袋。潰れた球を転がすだけでかなり生活感が出る */
export function createTrashBags(placements) {
  const geometry = new THREE.SphereGeometry(0.24, 10, 8);
  geometry.scale(1, 0.78, 0.92);
  return createInstancedProps({
    geometry,
    material: MATERIALS.trashBag(),
    instances: placements,
    name: 'trash_bags',
    colorVariation: 0.28,
  });
}

/** 植木鉢。鉢と葉で materials が違うので2つの InstancedMesh を返す */
function buildLeafClusterGeometry() {
  const parts = [];
  for (let i = 0; i < 5; i += 1) {
    const leaf = new THREE.PlaneGeometry(0.1, 0.34);
    leaf.translate(0, 0.17, 0);
    const m = new THREE.Matrix4();
    m.makeRotationY((i / 5) * Math.PI * 2);
    const tilt = new THREE.Matrix4().makeRotationX(0.35 + (i % 2) * 0.25);
    leaf.applyMatrix4(m.multiply(tilt));
    leaf.translate(0, 0.2, 0);
    parts.push(leaf);
  }
  const merged = mergeGeometries(parts, false);
  for (const p of parts) p.dispose();
  return merged;
}

export function createPottedPlants(placements) {
  const group = new THREE.Group();
  group.name = 'potted_plants';

  const pot = new THREE.CylinderGeometry(0.13, 0.1, 0.2, 10);
  pot.translate(0, 0.1, 0);
  group.add(
    createInstancedProps({
      geometry: pot,
      material: MATERIALS.terracotta(),
      instances: placements,
      name: 'plant_pots',
      colorVariation: 0.22,
    })
  );

  group.add(
    createInstancedProps({
      geometry: buildLeafClusterGeometry(),
      material: MATERIALS.leaf(),
      instances: placements,
      name: 'plant_leaves',
      colorVariation: 0.35,
      castShadow: false,
    })
  );

  return group;
}

/** 電気メーター。本体＋上に伸びる電線管をまとめ、ガラス面だけ別マテリアル */
function buildMeterBodyGeometry() {
  const body = new THREE.BoxGeometry(0.17, 0.24, 0.11);
  body.translate(0, 0, 0.055);
  const conduit = new THREE.CylinderGeometry(0.016, 0.016, 0.45, 6);
  conduit.translate(0, 0.32, 0.03);
  const merged = mergeGeometries([body, conduit], false);
  body.dispose();
  conduit.dispose();
  return merged;
}

export function createElectricMeters(placements) {
  const group = new THREE.Group();
  group.name = 'electric_meters';

  group.add(
    createInstancedProps({
      geometry: buildMeterBodyGeometry(),
      material: MATERIALS.darkMetal(),
      instances: placements,
      name: 'meter_bodies',
      colorVariation: 0.24,
    })
  );

  const glass = new THREE.CylinderGeometry(0.055, 0.055, 0.02, 10);
  glass.rotateX(Math.PI / 2);
  glass.translate(0, 0.02, 0.115);
  group.add(
    createInstancedProps({
      geometry: glass,
      material: MATERIALS.glassDark(),
      instances: placements,
      name: 'meter_glass',
      castShadow: false,
    })
  );

  return group;
}

/** 配電箱。扉の段差と電線管まで含めて1ジオメトリ */
function buildBreakerBoxGeometry() {
  const body = new THREE.BoxGeometry(0.34, 0.44, 0.15);
  body.translate(0, 0, 0.075);
  const door = new THREE.BoxGeometry(0.28, 0.38, 0.02);
  door.translate(0, 0, 0.16);
  const conduitUp = new THREE.CylinderGeometry(0.022, 0.022, 0.5, 6);
  conduitUp.translate(0.1, 0.44, 0.04);
  const conduitDown = new THREE.CylinderGeometry(0.022, 0.022, 0.36, 6);
  conduitDown.translate(-0.1, -0.38, 0.04);

  const parts = [body, door, conduitUp, conduitDown];
  const merged = mergeGeometries(parts, false);
  for (const p of parts) p.dispose();
  return merged;
}

export function createBreakerBoxes(placements) {
  return createInstancedProps({
    geometry: buildBreakerBoxGeometry(),
    material: MATERIALS.paintedBoard(),
    instances: placements,
    name: 'breaker_boxes',
    colorVariation: 0.2,
  });
}

/**
 * 生活感のある小物一式（段ボール・木箱・バケツ・瓶）をまとめて作る。
 * それぞれ InstancedMesh 1つ = 1ドローコール。
 *
 * @param {{cardboard?: Array, crates?: Array, buckets?: Array, bottles?: Array}} placements
 * @returns {THREE.Group}
 */
export function createClutter({
  cardboard = [],
  crates = [],
  buckets = [],
  bottles = [],
}) {
  const group = new THREE.Group();
  group.name = 'clutter';

  if (cardboard.length > 0) {
    group.add(
      createInstancedProps({
        geometry: new THREE.BoxGeometry(1, 1, 1),
        material: MATERIALS.cardboard(),
        instances: cardboard,
        name: 'clutter_cardboard',
        colorVariation: 0.22,
      })
    );
  }

  if (crates.length > 0) {
    group.add(
      createInstancedProps({
        geometry: new THREE.BoxGeometry(1, 1, 1),
        material: MATERIALS.crateWood(),
        instances: crates,
        name: 'clutter_crates',
        colorVariation: 0.2,
      })
    );
  }

  if (buckets.length > 0) {
    group.add(
      createInstancedProps({
        geometry: new THREE.CylinderGeometry(0.15, 0.115, 0.28, 12, 1),
        material: MATERIALS.plastic(),
        instances: buckets,
        name: 'clutter_buckets',
        colorVariation: 0.3,
      })
    );
  }

  if (bottles.length > 0) {
    group.add(
      createInstancedProps({
        geometry: new THREE.CylinderGeometry(0.035, 0.038, 0.24, 8, 1),
        material: MATERIALS.glassDark(),
        instances: bottles,
        name: 'clutter_bottles',
        colorVariation: 0.35,
        castShadow: false,
      })
    );
  }

  return group;
}
