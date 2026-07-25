// ============================================================
// GameClock (設計書a 第2章§2.5 / NPC会話設計書 第10章)
// 1ゲーム日 = 実時間24分(既定, 1x)。倍速 0/1/3/10。
// 時間帯: MORNING(6-10) DAY(10-16) EVENING(16-19) NIGHT(19-24) MIDNIGHT(24-6)
// 天候: SUNNY/CLOUDY/RAIN (日次抽選・決定論)
// 季節: SPRING/SUMMER/AUTUMN/WINTER (SEASON_DAYS 日ごと)
// ============================================================
import { deriveRng } from './rng.js';

export const DAY_REAL_MINUTES = 24;      // 1ゲーム日=実24分 @1x
export const SEASON_DAYS = 8;            // 1季節=8ゲーム日 (バランス調整値)
export const SEASONS = ['SPRING', 'SUMMER', 'AUTUMN', 'WINTER'];
export const SEASON_LABEL = { SPRING: '春', SUMMER: '夏', AUTUMN: '秋', WINTER: '冬' };
export const WEATHER_LABEL = { SUNNY: '晴れ', CLOUDY: 'くもり', RAIN: '雨' };
export const BAND_LABEL = { MORNING: '朝', DAY: '昼', EVENING: '夕方', NIGHT: '夜', MIDNIGHT: '深夜' };

export class GameClock {
  constructor(worldSeed, save = null) {
    this.worldSeed = worldSeed;
    this.day = save?.day ?? 1;
    this.minute = save?.minute ?? 8 * 60;   // 8:00開始
    this.speed = 1;                          // 0/1/3/10
    this._listeners = { minute: [], hour: [], band: [], day: [] };
    this._acc = 0;
    this.weather = this._rollWeather(this.day);
  }

  on(kind, fn) { this._listeners[kind].push(fn); }
  _emit(kind, ...args) { for (const fn of this._listeners[kind]) fn(...args); }

  // 実時間dtSec進める
  tick(dtSec) {
    if (this.speed === 0) return;
    // 1ゲーム分 = (24*60)分 / (24分*60秒) = 1秒/ゲーム分 @1x
    this._acc += dtSec * this.speed * (1440 / (DAY_REAL_MINUTES * 60));
    while (this._acc >= 1) {
      this._acc -= 1;
      this._advanceMinute();
    }
  }

  _advanceMinute() {
    const prevBand = this.band;
    const prevHour = this.hour;
    this.minute++;
    if (this.minute >= 1440) {
      this.minute = 0;
      this.day++;
      this.weather = this._rollWeather(this.day);
      this._emit('day', this.day);
    }
    this._emit('minute', this.minute);
    if (this.hour !== prevHour) this._emit('hour', this.hour);
    if (this.band !== prevBand) this._emit('band', this.band);
  }

  _rollWeather(day) {
    const rng = deriveRng(this.worldSeed, 'weather', day);
    const r = rng();
    // 季節で雨率変動 (梅雨っぽく夏やや高め)
    const rainP = this.seasonOf(day) === 'SUMMER' ? 0.32 : 0.24;
    if (r < rainP) return 'RAIN';
    if (r < rainP + 0.26) return 'CLOUDY';
    return 'SUNNY';
  }

  get hour() { return Math.floor(this.minute / 60); }
  get min() { return this.minute % 60; }
  get band() {
    const h = this.hour;
    if (h >= 6 && h < 10) return 'MORNING';
    if (h >= 10 && h < 16) return 'DAY';
    if (h >= 16 && h < 19) return 'EVENING';
    if (h >= 19) return 'NIGHT';
    return 'MIDNIGHT';
  }
  seasonOf(day) { return SEASONS[Math.floor((day - 1) / SEASON_DAYS) % 4]; }
  get season() { return this.seasonOf(this.day); }

  // 0(真夜中)〜1(正午)の明るさ係数
  get daylight() {
    const h = this.minute / 60;
    if (h < 5 || h >= 20) return 0;
    if (h < 7) return (h - 5) / 2;
    if (h >= 18) return (20 - h) / 2;
    return 1;
  }

  get clockText() {
    return `${this.day}日目 ${String(this.hour).padStart(2, '0')}:${String(this.min).padStart(2, '0')}`;
  }

  serialize() { return { day: this.day, minute: this.minute }; }
}
