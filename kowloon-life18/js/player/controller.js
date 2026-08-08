// ============================================================
// 一人称移動 ＋ 当たり判定
//
// kowloon-threejs の player/PlayerController.js の移植。
// 変更点:
//   ・Game / AreaManager 依存を外し、コライダーは getColliders() で受け取る
//   ・ヘッドボブを削除 (酔いの原因になるため)
//   ・床から落ちたときの復帰処理を追加
//
// 方式: レイキャストによる collide-and-slide。
// 物理エンジンを入れずとも、直方体の壁だらけの屋内なら十分に機能する。
// 狭い通路で引っかからないよう、膝・腰・目線の3高さからレイを出して判定する。
//
// 将来もっと複雑な形状を扱うなら three-mesh-bvh + Capsule に差し替える。
// その場合も外から見た使い方 (update を呼ぶだけ) は変えない。
// ============================================================
import * as THREE from 'three';
import { PLAYER_SETTINGS, WORLD_SETTINGS } from './settings.js';

const EPS = 0.001;

export class PlayerController {
  /**
   * @param {import('./player.js').Player} player
   * @param {import('./input.js').Input} input
   * @param {{ getColliders: () => THREE.Object3D[], onFall?: () => void }} options
   */
  constructor(player, input, options) {
    this.player = player;
    this.input = input;
    this.getColliders = options.getColliders;
    this.onFall = options.onFall ?? null;

    this.enabled = true;

    this._raycaster = new THREE.Raycaster();
    this._raycaster.firstHitOnly = true; // BVH 導入時に効く (未導入なら無視される)

    // 使い回し用の一時ベクトル (毎フレームの GC を避ける)
    this._tmpDir = new THREE.Vector3();
    this._tmpForward = new THREE.Vector3();
    this._tmpRight = new THREE.Vector3();
    this._desiredVel = new THREE.Vector3();
    this._delta = new THREE.Vector3();
    this._remaining = new THREE.Vector3();
    this._origin = new THREE.Vector3();
    this._normal = new THREE.Vector3();
    this._up = new THREE.Vector3(0, 1, 0);
    this._down = new THREE.Vector3(0, -1, 0);

    // 壁判定に使うレイの高さ (足元からの相対)。
    // ・一番下は stepHeight より上に置く — そうしないと乗り越えられるはずの
    //   低い段差を壁として弾いてしまう
    // ・一番上は目線より少し上。室外機のように頭の高さへ突き出す物に
    //   カメラがめり込むのを防ぐ (九龍城の路地では室外機が至る所にある)
    this._probeHeights = [
      PLAYER_SETTINGS.stepHeight + 0.05, // 0.37 膝
      1.0,                                // 腰
      PLAYER_SETTINGS.eyeHeight - 0.05,   // 1.55 胸〜目線
      PLAYER_SETTINGS.eyeHeight + 0.15,   // 1.75 頭上
    ];

    this._accumulator = 0;
  }

  /** マウス入力を視点角度に反映する。移動と違い可変 dt でよい */
  _updateLook() {
    if (!this.input.pointerLocked) {
      this.input.consumeMouseDelta();
      return;
    }
    const d = this.input.consumeMouseDelta();
    const s = PLAYER_SETTINGS.mouseSensitivity;
    this.player.yaw -= d.x * s;
    this.player.pitch -= d.y * s;
    this.player.pitch = THREE.MathUtils.clamp(
      this.player.pitch,
      -PLAYER_SETTINGS.maxPitch,
      PLAYER_SETTINGS.maxPitch
    );
  }

  /** @param {number} dt */
  update(dt) {
    if (!this.enabled) {
      // 操作不能中 (会話中など) でも視点入力は捨てておく
      this.input.consumeMouseDelta();
      return;
    }

    this._updateLook();

    // 移動は固定ステップで積分する (フレームレートによる挙動差・貫通を防ぐ)
    this._accumulator += dt;
    const step = WORLD_SETTINGS.fixedTimeStep;
    let steps = 0;
    while (this._accumulator >= step && steps < WORLD_SETTINGS.maxSubSteps) {
      this._step(step);
      this._accumulator -= step;
      steps += 1;
    }
    // 溜まりすぎた場合は捨てる (重い処理のあとに一気に進むのを防ぐ)
    if (steps >= WORLD_SETTINGS.maxSubSteps) this._accumulator = 0;

    // 床の外へ出て落下し続けた場合の保険
    if (this.player.position.y < WORLD_SETTINGS.fallResetY) this.onFall?.();
  }

  _step(dt) {
    const p = this.player;
    const colliders = this.getColliders();

    // --- 入力 → 目標速度 ---
    const axis = this.input.getMoveAxis();
    p.isRunning = this.input.isDown('run') && (axis.x !== 0 || axis.z !== 0);
    const targetSpeed = p.isRunning ? PLAYER_SETTINGS.runSpeed : PLAYER_SETTINGS.walkSpeed;

    p.getForward(this._tmpForward);
    p.getRight(this._tmpRight);

    this._desiredVel
      .set(0, 0, 0)
      .addScaledVector(this._tmpForward, -axis.z)
      .addScaledVector(this._tmpRight, axis.x);
    if (this._desiredVel.lengthSq() > 0) {
      this._desiredVel.normalize().multiplyScalar(targetSpeed);
    }

    // 加速 / 減速 (空中では効きを落として慣性を残す)
    const control = p.isGrounded ? 1 : 0.35;
    const accel = PLAYER_SETTINGS.acceleration * control * dt;
    const damping = 1 - Math.min(1, PLAYER_SETTINGS.damping * control * dt);

    p.velocity.x += (this._desiredVel.x - p.velocity.x) * Math.min(1, accel);
    p.velocity.z += (this._desiredVel.z - p.velocity.z) * Math.min(1, accel);
    if (this._desiredVel.lengthSq() === 0) {
      p.velocity.x *= damping;
      p.velocity.z *= damping;
      if (Math.abs(p.velocity.x) < 0.01) p.velocity.x = 0;
      if (Math.abs(p.velocity.z) < 0.01) p.velocity.z = 0;
    }

    // --- ジャンプと重力 ---
    if (p.isGrounded && this.input.isDown('jump')) {
      p.velocity.y = PLAYER_SETTINGS.jumpSpeed;
      p.isGrounded = false;
    }
    p.velocity.y += PLAYER_SETTINGS.gravity * dt;
    p.velocity.y = Math.max(p.velocity.y, -PLAYER_SETTINGS.maxFallSpeed);

    // --- 水平移動 (壁に沿って滑る) ---
    this._delta.set(p.velocity.x * dt, 0, p.velocity.z * dt);
    this._moveHorizontal(this._delta, colliders);

    // --- 垂直移動 (床・天井) ---
    this._moveVertical(p.velocity.y * dt, colliders);
  }

  /**
   * 水平方向に動かす。壁に当たったら法線方向の成分を削って滑らせる。
   * これがないと、壁に斜めに当たった瞬間に完全停止して「引っかかる」。
   */
  _moveHorizontal(delta, colliders) {
    const p = this.player;
    if (delta.lengthSq() < 1e-12) return;
    if (colliders.length === 0) {
      p.position.add(delta);
      return;
    }

    const remaining = this._remaining.copy(delta);

    // 最大3回まで「進む→壁で滑る」を繰り返す (角に挟まった場合の収束用)
    for (let iter = 0; iter < 3; iter += 1) {
      const dist = remaining.length();
      if (dist < 1e-6) break;

      this._tmpDir.copy(remaining).divideScalar(dist);

      const hit = this._castHorizontal(this._tmpDir, dist + p.radius, colliders);
      if (!hit) {
        p.position.add(remaining);
        return;
      }

      // 壁の手前 radius ぶんで止める
      const allowed = Math.max(0, hit.distance - p.radius - EPS);
      p.position.addScaledVector(this._tmpDir, allowed);

      // 残りの移動量を壁に沿わせる
      remaining.addScaledVector(this._tmpDir, -allowed);
      this._normal.copy(hit.face.normal).transformDirection(hit.object.matrixWorld);
      this._normal.y = 0;
      if (this._normal.lengthSq() < 1e-8) return;
      this._normal.normalize();
      remaining.addScaledVector(this._normal, -remaining.dot(this._normal));
    }
  }

  /** 複数の高さから前方レイを出し、最も近いヒットを返す */
  _castHorizontal(direction, far, colliders) {
    const p = this.player;
    let closest = null;

    for (const h of this._probeHeights) {
      this._origin.set(p.position.x, p.position.y + h, p.position.z);
      this._raycaster.set(this._origin, direction);
      this._raycaster.near = 0;
      this._raycaster.far = far;

      const hits = this._raycaster.intersectObjects(colliders, false);
      for (const hit of hits) {
        if (!hit.face) continue;
        // 背面 (法線が進行方向と同じ向き) は無視 = 壁の内側から出るのは許す
        this._normal.copy(hit.face.normal).transformDirection(hit.object.matrixWorld);
        if (this._normal.dot(direction) > 0) continue;
        if (!closest || hit.distance < closest.distance) closest = hit;
        break;
      }
    }
    return closest;
  }

  /** 上下に動かす。床に着いたら isGrounded を立て、天井に当たったら速度を殺す */
  _moveVertical(dy, colliders) {
    const p = this.player;
    if (colliders.length === 0) {
      p.position.y += dy;
      if (p.position.y <= 0) {
        p.position.y = 0;
        p.velocity.y = 0;
        p.isGrounded = true;
      } else {
        p.isGrounded = false;
      }
      return;
    }

    if (dy > 0) {
      // 上昇: 頭上をチェック
      this._origin.set(p.position.x, p.position.y + PLAYER_SETTINGS.eyeHeight, p.position.z);
      this._raycaster.set(this._origin, this._up);
      this._raycaster.near = 0;
      this._raycaster.far = dy + 0.2;
      const hits = this._raycaster.intersectObjects(colliders, false);
      if (hits.length > 0 && hits[0].distance < dy + 0.2) {
        p.position.y += Math.max(0, hits[0].distance - 0.2 - EPS);
        p.velocity.y = 0;
      } else {
        p.position.y += dy;
      }
      p.isGrounded = false;
      return;
    }

    // 下降 / 接地判定: 少し上から下向きにレイを出す。
    // 原点を stepHeight ぶん上げてあるので、低い段差はここで自動的に登る。
    const probeUp = PLAYER_SETTINGS.stepHeight;
    this._origin.set(p.position.x, p.position.y + probeUp, p.position.z);
    this._raycaster.set(this._origin, this._down);
    this._raycaster.near = 0;
    this._raycaster.far = probeUp - dy + EPS; // dy は負

    const hits = this._raycaster.intersectObjects(colliders, false);
    const ground = hits.find((h) => h.face);

    if (ground) {
      p.position.y = this._origin.y - ground.distance;
      p.velocity.y = 0;
      p.isGrounded = true;
    } else {
      p.position.y += dy;
      p.isGrounded = false;
    }
  }
}
