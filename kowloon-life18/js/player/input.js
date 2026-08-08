// ============================================================
// キーボード / マウス入力
//
// kowloon-threejs の core/Input.js の移植。
// EventBus 依存を外し、ポインタロックの変化はコールバックで通知する。
//
// ゲームロジック側は 'KeyW' ではなく 'moveForward' のような
// 「アクション名」で参照するので、後からキーコンフィグを足しやすい。
// ============================================================

export class Input {
  /**
   * @param {HTMLElement} domElement ポインタロック対象 (canvas)
   * @param {{ onPointerLockChange?: (locked: boolean) => void }} [options]
   */
  constructor(domElement, options = {}) {
    this.domElement = domElement;
    this.onPointerLockChange = options.onPointerLockChange ?? null;

    /**
     * アクション名 → キーコード配列
     *
     * 主操作は  W / ↑ = 前進、↓ = 後退、← = 左、→ = 右。
     * A / S / D も従来どおり効くが、あくまで予備。
     * (キーが物理的に反応しない環境向けに、矢印キーを主にしている)
     */
    this.bindings = {
      moveForward: ['KeyW', 'ArrowUp'],
      moveBackward: ['ArrowDown', 'KeyS'],
      moveLeft: ['ArrowLeft', 'KeyA'],
      moveRight: ['ArrowRight', 'KeyD'],
      run: ['ShiftLeft', 'ShiftRight'],
      jump: ['Space'],
      interact: ['KeyE'],
      cancel: ['Escape'],
    };

    this._down = new Set();
    this._pressed = new Set();
    this._released = new Set();
    this._mouseDelta = { x: 0, y: 0 };
    this.pointerLocked = false;
    this._lastUnlockAt = 0;   // 解除直後の再取得クールダウン用
    this.enabled = true;

    this._bind();
  }

  _bind() {
    // 移動に使うキーはブラウザ既定動作 (スクロール等) を止める。
    // これをしないと環境によって矢印キーが移動に届かないことがある。
    this._preventKeys = new Set([
      'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
    ]);

    this._onKeyDown = (e) => {
      if (!this.enabled) return;
      if (this._preventKeys.has(e.code)) e.preventDefault();
      if (e.repeat) return;
      this._down.add(e.code);
      this._pressed.add(e.code);
    };

    this._onKeyUp = (e) => {
      this._down.delete(e.code);
      this._released.add(e.code);
    };

    this._onMouseMove = (e) => {
      if (!this.pointerLocked) return;
      this._mouseDelta.x += e.movementX || 0;
      this._mouseDelta.y += e.movementY || 0;
    };

    this._onPointerLockChange = () => {
      const was = this.pointerLocked;
      this.pointerLocked = document.pointerLockElement === this.domElement;
      // ロックが外れたら押しっぱなしを解除 (Alt+Tab 対策)
      if (!this.pointerLocked) {
        this._down.clear();
        if (was) this._lastUnlockAt = performance.now();
      }
      this.onPointerLockChange?.(this.pointerLocked);
    };

    // ロック要求が拒否されたときのイベント (Chrome) も握りつぶす
    this._onPointerLockError = () => {
      this._lastUnlockAt = performance.now();
    };

    this._onBlur = () => this._down.clear();

    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
    window.addEventListener('mousemove', this._onMouseMove);
    window.addEventListener('blur', this._onBlur);
    document.addEventListener('pointerlockchange', this._onPointerLockChange);
    document.addEventListener('pointerlockerror', this._onPointerLockError);
  }

  /**
   * ポインタロックを要求する。
   *
   * ブラウザは Esc で解除した直後(約1秒)の再取得を拒否する。
   * 拒否は Promise の reject か例外で来るので、どちらも握りつぶす。
   * (握りつぶさないと index.html のエラー表示が埋まってしまう)
   */
  requestPointerLock() {
    if (this.pointerLocked) return;
    const now = performance.now();
    if (now - this._lastUnlockAt < 1300) return;   // クールダウン中は試みない
    try {
      const r = this.domElement.requestPointerLock?.();
      if (r && typeof r.catch === 'function') {
        r.catch(() => { /* 直後の再取得は拒否される。無視してよい */ });
      }
    } catch {
      /* 同上 */
    }
  }

  exitPointerLock() {
    document.exitPointerLock?.();
  }

  /** アクションが押されているか */
  isDown(action) {
    const codes = this.bindings[action];
    return codes ? codes.some((c) => this._down.has(c)) : false;
  }

  /** このフレームで押された瞬間か */
  wasPressed(action) {
    const codes = this.bindings[action];
    return codes ? codes.some((c) => this._pressed.has(c)) : false;
  }

  /** キーコード直指定で「押した瞬間」を見る */
  wasCodePressed(code) {
    return this._pressed.has(code);
  }

  /** マウス移動量を取り出してゼロに戻す */
  consumeMouseDelta() {
    const d = { x: this._mouseDelta.x, y: this._mouseDelta.y };
    this._mouseDelta.x = 0;
    this._mouseDelta.y = 0;
    return d;
  }

  /** 移動入力を -1..1 のベクトルで返す */
  getMoveAxis() {
    let x = 0;
    let z = 0;
    if (this.isDown('moveForward')) z -= 1;
    if (this.isDown('moveBackward')) z += 1;
    if (this.isDown('moveLeft')) x -= 1;
    if (this.isDown('moveRight')) x += 1;
    const len = Math.hypot(x, z);
    if (len > 1) { x /= len; z /= len; }
    return { x, z };
  }

  /** フレーム末尾で呼ぶ。押した瞬間 / 離した瞬間の状態をクリアする */
  endFrame() {
    this._pressed.clear();
    this._released.clear();
  }

  dispose() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
    window.removeEventListener('mousemove', this._onMouseMove);
    window.removeEventListener('blur', this._onBlur);
    document.removeEventListener('pointerlockchange', this._onPointerLockChange);
    document.removeEventListener('pointerlockerror', this._onPointerLockError);
  }
}
