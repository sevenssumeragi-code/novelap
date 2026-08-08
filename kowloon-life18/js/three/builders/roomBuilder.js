import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import {
  checkerFloorTexture,
  dirtyConcreteTexture,
  oldWallTileTexture,
  rustyMetalTexture,
  shutterTexture,
  grimyCeilingTexture,
  grimeRoughnessTexture,
  cardboardTexture,
  crateWoodTexture,
  paintedBoardTexture,
  clothTexture,
} from './textures.js';

/**
 * 直方体ベースの部屋・通路を組むためのヘルパー群。
 *
 * 本番のマップは Blender で作ったモデルを読み込む想定だが、
 * レベルデザインの検証や当たり判定のブロックアウトはコードで組めたほうが速い。
 * 九龍城のような「箱を詰め込んだ」構造とも相性がよい。
 *
 * 座標系: Y が上。position は基本的にオブジェクトの中心。
 */

/** 共有マテリアル。エリアごとに作り直さないようここで保持する */
const materialCache = new Map();

export function getMaterial(key, params) {
  if (!materialCache.has(key)) {
    const material = new THREE.MeshStandardMaterial(params);
    // エリア破棄時に dispose されると次のエリアで壊れるので共有マークを付ける
    material.userData.shared = true;
    materialCache.set(key, material);
  }
  return materialCache.get(key);
}

/**
 * MeshStandardMaterial 以外（発光面・デカールなど）を共有キャッシュに載せる。
 * @param {string} key
 * @param {() => THREE.Material} factory
 */
export function getRawMaterial(key, factory) {
  if (!materialCache.has(key)) {
    const material = factory();
    material.userData.shared = true;
    materialCache.set(key, material);
  }
  return materialCache.get(key);
}

export const MATERIALS = {
  // --- 単色（ブロックアウト用） ---
  concrete: () =>
    getMaterial('concrete', { color: 0x6f6a63, roughness: 0.94, metalness: 0.0 }),
  floor: () =>
    getMaterial('floor', { color: 0x4a4640, roughness: 0.88, metalness: 0.0 }),
  ceiling: () =>
    getMaterial('ceiling', { color: 0x37342f, roughness: 0.96, metalness: 0.0 }),
  metal: () =>
    getMaterial('metal', { color: 0x7d8489, roughness: 0.45, metalness: 0.85 }),
  wood: () =>
    getMaterial('wood', { color: 0x6b4f36, roughness: 0.82, metalness: 0.0 }),

  // --- テクスチャ付き（九龍城の雰囲気用） ---
  /** 古びた市松タイルの床 */
  tileFloor: () =>
    getMaterial('tex.tileFloor', {
      map: checkerFloorTexture(),
      roughnessMap: grimeRoughnessTexture(),
      roughness: 1.0,
      metalness: 0.04,
    }),
  /** 汚れたコンクリート壁 */
  dirtyConcrete: () =>
    getMaterial('tex.dirtyConcrete', {
      map: dirtyConcreteTexture(),
      roughnessMap: grimeRoughnessTexture(),
      roughness: 1.0,
      metalness: 0.0,
    }),
  /** 古い小口タイル壁 */
  wallTile: () =>
    getMaterial('tex.wallTile', {
      map: oldWallTileTexture(),
      roughnessMap: grimeRoughnessTexture(),
      roughness: 0.85,
      metalness: 0.05,
    }),
  /** 錆びた金属板 */
  rustyPanel: () =>
    getMaterial('tex.rustyPanel', {
      map: rustyMetalTexture(),
      roughnessMap: grimeRoughnessTexture(),
      roughness: 0.9,
      metalness: 0.55,
    }),
  /** 店舗のシャッター */
  shutter: () =>
    getMaterial('tex.shutter', {
      map: shutterTexture(),
      roughnessMap: grimeRoughnessTexture(),
      roughness: 0.82,
      metalness: 0.6,
    }),
  /** すすけた天井 */
  grimyCeiling: () =>
    getMaterial('tex.grimyCeiling', {
      map: grimyCeilingTexture(),
      roughnessMap: grimeRoughnessTexture(),
      roughness: 1.0,
      metalness: 0.0,
    }),

  /** 塗装が剥げた板。コンクリート・タイル・錆板に続く4つ目の壁素材 */
  paintedBoard: () =>
    getMaterial('tex.paintedBoard', {
      map: paintedBoardTexture(),
      roughnessMap: grimeRoughnessTexture(),
      roughness: 0.88,
      metalness: 0.12,
    }),

  // --- 配管（太さだけでなく色でも差をつける） ---
  pipePainted: () =>
    getMaterial('pipe.painted', { color: 0x5c6360, roughness: 0.62, metalness: 0.5 }),
  pipeRusty: () =>
    getMaterial('pipe.rusty', {
      map: rustyMetalTexture(),
      roughness: 0.85,
      metalness: 0.5,
    }),
  /** 消防系の赤い配管 */
  pipeRed: () =>
    getMaterial('pipe.red', { color: 0x6d2b26, roughness: 0.66, metalness: 0.4 }),
  /** 塗り直された緑の配管 */
  pipeGreen: () =>
    getMaterial('pipe.green', { color: 0x3f5a48, roughness: 0.7, metalness: 0.35 }),
  /** 亜鉛メッキのダクト */
  pipeGalvanized: () =>
    getMaterial('pipe.galvanized', { color: 0x9aa0a4, roughness: 0.38, metalness: 0.9 }),
  /** 古い銅管 */
  pipeCopper: () =>
    getMaterial('pipe.copper', { color: 0x6e4a30, roughness: 0.5, metalness: 0.8 }),
  cable: () =>
    getMaterial('prop.cable', { color: 0x18181a, roughness: 0.72, metalness: 0.1 }),
  darkMetal: () =>
    getMaterial('prop.darkMetal', { color: 0x2f3336, roughness: 0.55, metalness: 0.7 }),
  cardboard: () =>
    getMaterial('prop.cardboard', {
      map: cardboardTexture(),
      roughness: 0.95,
      metalness: 0.0,
    }),
  crateWood: () =>
    getMaterial('prop.crateWood', {
      map: crateWoodTexture(),
      roughness: 0.9,
      metalness: 0.0,
    }),
  plastic: () =>
    getMaterial('prop.plastic', { color: 0x3f5a6b, roughness: 0.55, metalness: 0.0 }),
  glassDark: () =>
    getMaterial('prop.glassDark', {
      color: 0x0e1216,
      roughness: 0.22,
      metalness: 0.3,
    }),
  /** 洗濯物。裏からも見えるので DoubleSide */
  cloth: () =>
    getMaterial('prop.cloth', {
      map: clothTexture(),
      roughness: 0.98,
      metalness: 0.0,
      side: THREE.DoubleSide,
    }),
  /** 植木の葉 */
  leaf: () =>
    getMaterial('prop.leaf', {
      color: 0x46603a,
      roughness: 0.85,
      metalness: 0.0,
      side: THREE.DoubleSide,
    }),
  /** 素焼きの鉢 */
  terracotta: () =>
    getMaterial('prop.terracotta', {
      color: 0x7c4a35,
      roughness: 0.92,
      metalness: 0.0,
    }),
  /** ゴミ袋 */
  trashBag: () =>
    getMaterial('prop.trashBag', {
      color: 0x1c1f22,
      roughness: 0.42,
      metalness: 0.0,
    }),
};

// ---- UV -----------------------------------------------------------------

/**
 * BoxGeometry の UV を実寸基準に焼き直す。
 *
 * マテリアルの repeat でタイリングすると、大きさの違う箱で texel 密度がばらつき、
 * さらにマテリアルを共有しているとジオメトリごとに変えられない。
 * UV 側に焼いておけばマテリアルは 1 つのまま実寸が揃い、マージもできる。
 *
 * @param {THREE.BufferGeometry} geometry セグメント 1 の BoxGeometry
 * @param {[number,number,number]} size
 * @param {number} scale テクスチャ 1 周期が何メートルに相当するか
 */
export function applyBoxUV(geometry, size, scale) {
  if (!scale) return geometry;
  const uv = geometry.attributes.uv;
  if (!uv || uv.count !== 24) return geometry; // 想定外の分割数なら触らない

  const [w, h, d] = size;
  // BoxGeometry の面順は +X, -X, +Y, -Y, +Z, -Z。各面 4 頂点。
  const spans = [
    [d, h],
    [d, h],
    [w, d],
    [w, d],
    [w, h],
    [w, h],
  ];

  for (let face = 0; face < 6; face += 1) {
    const [su, sv] = spans[face];
    for (let i = 0; i < 4; i += 1) {
      const idx = face * 4 + i;
      uv.setXY(idx, uv.getX(idx) * (su / scale), uv.getY(idx) * (sv / scale));
    }
  }
  uv.needsUpdate = true;
  return geometry;
}

// ---- 基本パーツ ---------------------------------------------------------

/**
 * 箱を1つ作る。
 * @param {{size: [number,number,number], position: [number,number,number],
 *          material?: THREE.Material, rotationY?: number, name?: string,
 *          uvScale?: number, castShadow?: boolean, receiveShadow?: boolean}} options
 */
export function createBox({
  size,
  position,
  material,
  rotationY = 0,
  name = 'box',
  uvScale,
  castShadow = true,
  receiveShadow = true,
}) {
  const geometry = new THREE.BoxGeometry(size[0], size[1], size[2]);
  applyBoxUV(geometry, size, uvScale);
  const mesh = new THREE.Mesh(geometry, material ?? MATERIALS.concrete());
  mesh.position.set(position[0], position[1], position[2]);
  mesh.rotation.y = rotationY;
  mesh.castShadow = castShadow;
  mesh.receiveShadow = receiveShadow;
  mesh.name = name;
  return mesh;
}

/**
 * 床・天井・四方の壁からなる箱型の部屋を作る。
 * 壁は厚みのあるソリッドな箱なので、法線が内側を向く問題が起きない。
 *
 * @param {{
 *   width: number, depth: number, height: number,
 *   position?: [number, number, number],   // 部屋の中心（床の高さ基準）
 *   wallThickness?: number,
 *   openings?: Array<'north'|'south'|'east'|'west'>,  // 壁を作らない方向
 *   ceiling?: boolean,
 * }} options
 * @returns {THREE.Group} 衝突対象としてそのまま addCollider() できる
 */
export function createRoom({
  width,
  depth,
  height,
  position = [0, 0, 0],
  wallThickness = 0.25,
  openings = [],
  ceiling = true,
}) {
  const group = new THREE.Group();
  group.name = 'room';
  const [cx, cy, cz] = position;
  const t = wallThickness;

  // 床
  group.add(
    createBox({
      size: [width, t, depth],
      position: [cx, cy - t / 2, cz],
      material: MATERIALS.floor(),
      name: 'floor',
    })
  );

  // 天井
  if (ceiling) {
    group.add(
      createBox({
        size: [width, t, depth],
        position: [cx, cy + height + t / 2, cz],
        material: MATERIALS.ceiling(),
        name: 'ceiling',
      })
    );
  }

  const wallY = cy + height / 2;
  const wall = (name, size, pos) =>
    group.add(
      createBox({ size, position: pos, material: MATERIALS.concrete(), name })
    );

  // north = -Z 側, south = +Z 側
  if (!openings.includes('north')) {
    wall('wall_north', [width + t * 2, height, t], [cx, wallY, cz - depth / 2 - t / 2]);
  }
  if (!openings.includes('south')) {
    wall('wall_south', [width + t * 2, height, t], [cx, wallY, cz + depth / 2 + t / 2]);
  }
  if (!openings.includes('west')) {
    wall('wall_west', [t, height, depth], [cx - width / 2 - t / 2, wallY, cz]);
  }
  if (!openings.includes('east')) {
    wall('wall_east', [t, height, depth], [cx + width / 2 + t / 2, wallY, cz]);
  }

  return group;
}

/**
 * 開口部（ドア穴）付きの壁。壁を上・左・右の3ブロックに分けて作る。
 * @param {{
 *   width: number, height: number, thickness?: number,
 *   position: [number, number, number],  // 壁の中心（床基準の底辺）
 *   rotationY?: number,
 *   doorWidth?: number, doorHeight?: number, doorOffset?: number,
 *   material?: THREE.Material, uvScale?: number,
 * }} options
 */
export function createWallWithDoorway({
  width,
  height,
  thickness = 0.25,
  position,
  rotationY = 0,
  doorWidth = 1.0,
  doorHeight = 2.1,
  doorOffset = 0,
  material,
  uvScale,
}) {
  const group = new THREE.Group();
  group.name = 'wall_with_doorway';
  const mat = material ?? MATERIALS.concrete();

  const doorLeft = doorOffset - doorWidth / 2;
  const doorRight = doorOffset + doorWidth / 2;
  const leftWidth = doorLeft + width / 2;
  const rightWidth = width / 2 - doorRight;

  if (leftWidth > 0.01) {
    group.add(
      createBox({
        size: [leftWidth, height, thickness],
        position: [-width / 2 + leftWidth / 2, height / 2, 0],
        material: mat,
        uvScale,
        name: 'wall_left',
      })
    );
  }
  if (rightWidth > 0.01) {
    group.add(
      createBox({
        size: [rightWidth, height, thickness],
        position: [width / 2 - rightWidth / 2, height / 2, 0],
        material: mat,
        uvScale,
        name: 'wall_right',
      })
    );
  }
  if (height - doorHeight > 0.01) {
    group.add(
      createBox({
        size: [doorWidth, height - doorHeight, thickness],
        position: [doorOffset, doorHeight + (height - doorHeight) / 2, 0],
        material: mat,
        uvScale,
        name: 'wall_lintel',
      })
    );
  }

  group.position.set(position[0], position[1], position[2]);
  group.rotation.y = rotationY;
  return group;
}

// ---- 通路セグメント -----------------------------------------------------

/**
 * 範囲 [from, to] から gaps を差し引いた区間の一覧を返す。
 * 壁に開口（店の入口・曲がり角）を空けるのに使う。
 */
function splitRange(from, to, gaps) {
  const sorted = gaps
    .map(([a, b]) => [Math.min(a, b), Math.max(a, b)])
    .sort((p, q) => p[0] - q[0]);

  const out = [];
  let cursor = from;
  for (const [a, b] of sorted) {
    if (b <= cursor) continue;
    if (a > cursor) out.push([cursor, Math.min(a, to)]);
    cursor = Math.max(cursor, b);
    if (cursor >= to) break;
  }
  if (cursor < to) out.push([cursor, to]);
  return out.filter(([a, b]) => b - a > 0.01);
}

/**
 * 軸に沿った1本の通路を作る（床・天井・両側の壁・端の栓）。
 *
 * createRoom と違い、床の高さと天井の高さを別々に指定できるので、
 * 段差や天井高の変化を通路の途中で作れる。
 *
 * neg / pos は「その軸の座標が小さい側 / 大きい側」を指す。
 * axis:'z' なら neg = 西(-X)側の壁、axis:'x' なら neg = 北(-Z)側の壁。
 *
 * @param {{
 *   axis?: 'x'|'z', from: number, to: number, cross?: number,
 *   width?: number, floorY?: number, ceilingY?: number, thickness?: number,
 *   gapsNeg?: Array<[number,number]>, gapsPos?: Array<[number,number]>,
 *   floor?: boolean, ceiling?: boolean, capFrom?: boolean, capTo?: boolean,
 *   materials?: {floor?: THREE.Material, ceiling?: THREE.Material,
 *                wallNeg?: THREE.Material, wallPos?: THREE.Material,
 *                cap?: THREE.Material},
 *   uvScale?: {floor?: number, ceiling?: number, wall?: number},
 *   name?: string,
 * }} options
 * @returns {THREE.Group}
 */
export function createCorridorSegment({
  axis = 'z',
  from,
  to,
  cross = 0,
  width = 1.7,
  floorY = 0,
  ceilingY = 2.4,
  thickness = 0.25,
  gapsNeg = [],
  gapsPos = [],
  floor = true,
  ceiling = true,
  capFrom = false,
  capTo = false,
  materials = {},
  uvScale = {},
  name = 'corridor',
}) {
  const group = new THREE.Group();
  group.name = name;

  const alongX = axis === 'x';
  const length = to - from;
  const mid = (from + to) / 2;
  const wallHeight = ceilingY - floorY;
  const wallMidY = (floorY + ceilingY) / 2;
  const t = thickness;

  const matFloor = materials.floor ?? MATERIALS.tileFloor();
  const matCeiling = materials.ceiling ?? MATERIALS.grimyCeiling();
  const matNeg = materials.wallNeg ?? MATERIALS.dirtyConcrete();
  const matPos = materials.wallPos ?? MATERIALS.dirtyConcrete();
  const matCap = materials.cap ?? matNeg;

  const uvFloor = uvScale.floor ?? 2.0;
  const uvCeil = uvScale.ceiling ?? 2.5;
  const uvWall = uvScale.wall ?? 2.5;

  /** 軸に応じて [長さ方向, 幅方向] を XZ に割り当てる */
  const sizeFor = (alongLen, crossLen, height) =>
    alongX ? [alongLen, height, crossLen] : [crossLen, height, alongLen];
  const posFor = (alongPos, crossPos, y) =>
    alongX ? [alongPos, y, crossPos] : [crossPos, y, alongPos];

  if (floor) {
    group.add(
      createBox({
        size: sizeFor(length, width, t),
        position: posFor(mid, cross, floorY - t / 2),
        material: matFloor,
        uvScale: uvFloor,
        name: `${name}_floor`,
      })
    );
  }

  if (ceiling) {
    group.add(
      createBox({
        size: sizeFor(length, width, t),
        position: posFor(mid, cross, ceilingY + t / 2),
        material: matCeiling,
        uvScale: uvCeil,
        name: `${name}_ceiling`,
      })
    );
  }

  // 両側の壁。開口を除いた区間ごとに箱を置く
  const sides = [
    { gaps: gapsNeg, offset: -(width / 2 + t / 2), material: matNeg, tag: 'neg' },
    { gaps: gapsPos, offset: width / 2 + t / 2, material: matPos, tag: 'pos' },
  ];

  for (const side of sides) {
    for (const [a, b] of splitRange(from, to, side.gaps)) {
      group.add(
        createBox({
          size: sizeFor(b - a, t, wallHeight),
          position: posFor((a + b) / 2, cross + side.offset, wallMidY),
          material: side.material,
          uvScale: uvWall,
          name: `${name}_wall_${side.tag}`,
        })
      );
    }
  }

  if (capFrom) {
    group.add(
      createBox({
        size: sizeFor(t, width + t * 2, wallHeight),
        position: posFor(from - t / 2, cross, wallMidY),
        material: matCap,
        uvScale: uvWall,
        name: `${name}_cap_from`,
      })
    );
  }
  if (capTo) {
    group.add(
      createBox({
        size: sizeFor(t, width + t * 2, wallHeight),
        position: posFor(to + t / 2, cross, wallMidY),
        material: matCap,
        uvScale: uvWall,
        name: `${name}_cap_to`,
      })
    );
  }

  return group;
}

// ---- 照明 ---------------------------------------------------------------

/**
 * 裸電球ふうのポイントライト。九龍城の雰囲気づくりの基本パーツ。
 * @param {{position: [number,number,number], color?: number,
 *          intensity?: number, distance?: number, bulb?: boolean,
 *          castShadow?: boolean}} options
 */
export function createHangingLamp({
  position,
  color = 0xffd9a0,
  intensity = 6,
  distance = 7,
  bulb = true,
  castShadow = true,
}) {
  const group = new THREE.Group();
  group.name = 'hanging_lamp';
  group.position.set(position[0], position[1], position[2]);

  const light = new THREE.PointLight(color, intensity, distance, 2);
  // 影付きポイントライトは1灯あたり6面のレンダーになる。数を絞ること。
  light.castShadow = castShadow;
  if (castShadow) {
    light.shadow.mapSize.set(512, 512);
    light.shadow.bias = -0.002;
  }
  group.add(light);

  if (bulb) {
    const bulbMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.045, 10, 8),
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: new THREE.Color(color),
        emissiveIntensity: 3,
      })
    );
    bulbMesh.name = 'bulb';
    group.add(bulbMesh);
  }

  return group;
}

// ---- 最適化 -------------------------------------------------------------

/**
 * グループ内の Mesh をマテリアル単位で1つに結合する。
 *
 * 壁・床・配管のような「動かない箱の集合」はドローコールがそのまま無駄になるので、
 * ワールド行列を焼いてから結合してしまう。
 * UV は applyBoxUV で実寸に焼いてあるため、結合してもタイリングは崩れない。
 *
 * 結合後もレイキャストは面法線から正しく取れるので、当たり判定にそのまま使える。
 *
 * @param {THREE.Object3D} group 結合したいメッシュを含むグループ（破棄される）
 * @param {{name?: string, castShadow?: boolean, receiveShadow?: boolean}} [options]
 * @returns {THREE.Group} マテリアルごとに1メッシュだけを含むグループ
 */
export function mergeGroupByMaterial(group, options = {}) {
  const { name = 'merged', castShadow = true, receiveShadow = true } = options;

  group.updateMatrixWorld(true);

  /** @type {Map<THREE.Material, THREE.BufferGeometry[]>} */
  const buckets = new Map();
  /** @type {THREE.Mesh[]} */
  const sources = [];

  group.traverse((obj) => {
    if (!obj.isMesh || obj.isInstancedMesh || !obj.geometry) return;
    if (Array.isArray(obj.material)) return; // マルチマテリアルは対象外
    sources.push(obj);
    const geo = obj.geometry.clone();
    geo.applyMatrix4(obj.matrixWorld);
    if (!buckets.has(obj.material)) buckets.set(obj.material, []);
    buckets.get(obj.material).push(geo);
  });

  const out = new THREE.Group();
  out.name = name;

  for (const [material, geometries] of buckets) {
    let merged = null;
    try {
      merged = mergeGeometries(geometries, false);
    } catch (err) {
      console.warn('[roomBuilder] ジオメトリの結合に失敗。非結合で継続します:', err);
    }

    if (merged) {
      const mesh = new THREE.Mesh(merged, material);
      mesh.name = `${name}_${material.name || 'mat'}`;
      mesh.castShadow = castShadow;
      mesh.receiveShadow = receiveShadow;
      out.add(mesh);
      for (const g of geometries) g.dispose();
    } else {
      // 結合できなかったぶんはクローンをそのまま個別メッシュとして残す
      for (const g of geometries) {
        const mesh = new THREE.Mesh(g, material);
        mesh.castShadow = castShadow;
        mesh.receiveShadow = receiveShadow;
        out.add(mesh);
      }
    }
  }

  // 元のジオメトリはもう使わないので解放する
  for (const mesh of sources) mesh.geometry.dispose();

  return out;
}

/**
 * 見た目を持たない当たり判定専用のボックス。
 *
 * three.js の Raycaster は visible=false でも判定するため、
 * 描画コストゼロで「小物にぶつかる」を実現できる。
 */
export function createInvisibleCollider({ size, position, rotationY = 0, name = 'collider' }) {
  const mesh = createBox({
    size,
    position,
    rotationY,
    name,
    material: MATERIALS.concrete(),
    castShadow: false,
    receiveShadow: false,
  });
  mesh.visible = false;
  return mesh;
}
