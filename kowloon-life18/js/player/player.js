// ============================================================
// プレイヤーの「状態」
//
// kowloon-threejs の player/Player.js の移植。
// EventBus 依存とヘッドボブ (酔いの原因になるため今回は入れない) を外した。
//
// 入力の解釈と移動処理は controller.js が持つ (状態と操作の分離)。
// position は常に「足元」の座標。カメラは eyeHeight ぶん上に置く。
// ============================================================
import * as THREE from 'three';
import { PLAYER_SETTINGS } from './settings.js';

export class Player {
  constructor() {
    this.position = new THREE.Vector3(0, 0, 0);
    this.velocity = new THREE.Vector3(0, 0, 0);

    // 視点角度 (カメラの quaternion を直接いじらず yaw/pitch で持つ)
    this.yaw = 0;
    this.pitch = 0;

    this.isGrounded = false;
    this.isRunning = false;

    this.eyeHeight = PLAYER_SETTINGS.eyeHeight;
    this.radius = PLAYER_SETTINGS.radius;

    // 将来のステータス拡張用
    this.stats = { health: 100, stamina: 100 };
  }

  /** カメラ位置と向きを状態から反映する。毎フレーム最後に呼ぶ */
  syncCamera(camera) {
    camera.position.set(
      this.position.x,
      this.position.y + this.eyeHeight,
      this.position.z
    );
    camera.rotation.order = 'YXZ';
    camera.rotation.y = this.yaw;
    camera.rotation.x = this.pitch;
    camera.rotation.z = 0;
  }

  /** 視線方向 (水平成分のみ・正規化済み) */
  getForward(target = new THREE.Vector3()) {
    return target.set(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
  }

  getRight(target = new THREE.Vector3()) {
    return target.set(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
  }

  /** 水平方向の速さ (m/s) */
  get horizontalSpeed() {
    return Math.hypot(this.velocity.x, this.velocity.z);
  }

  /**
   * 指定位置へ瞬間移動する。
   * @param {number[]} position 足元座標 [x, y, z]
   * @param {number} [rotationY] ラジアン。yaw=0 が -Z 方向
   */
  teleport(position, rotationY = this.yaw) {
    this.position.set(position[0], position[1], position[2]);
    this.velocity.set(0, 0, 0);
    this.yaw = rotationY;
    this.pitch = 0;
    this.isGrounded = false;
  }

  serialize() {
    return {
      position: this.position.toArray(),
      yaw: this.yaw,
      pitch: this.pitch,
    };
  }

  deserialize(data) {
    if (!data) return;
    this.position.fromArray(data.position ?? [0, 0, 0]);
    this.yaw = data.yaw ?? 0;
    this.pitch = data.pitch ?? 0;
    this.velocity.set(0, 0, 0);
  }
}
