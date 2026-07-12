// ============================================================
// テストプレイ用ツール (削除可能)
// ------------------------------------------------------------
// このファイルは「テストプレイのための機能」です。
// ゲーム完成時は以下だけで完全に消えます:
//   1) このファイル(testtools.js)を削除
//   2) game.js の `export const TEST_MODE = true;` を false にするか削除
//   3) game.js 末尾の `if (TEST_MODE) { import('./testtools.js')... }` ブロックを削除
// 本体コードはこのモジュールに一切依存していません(window.__kl 経由でのみ操作)。
// ============================================================
import { MAIN_IDS, KEY_IDS, CHARS, RANKS } from './data/chars.js';
import { FACILITIES } from './data/facilities.js';

// 好感度レベルのスイッチ (知人〜特別な存在)
const LEVELS = [
  { label: '他人', v: 0 },
  { label: '知人', v: 25 },
  { label: '友人', v: 40 },
  { label: '親しい友人', v: 60 },
  { label: '特別な存在', v: 75 },
  { label: '唯一無二', v: 92 },
];

const NAMED_IDS = [...MAIN_IDS, ...KEY_IDS];

export function installTestTools(kl) {
  const { world, state } = kl;

  // ---- スタイル ----
  const style = document.createElement('style');
  style.textContent = `
    #testtools-btn { position: fixed; bottom: 14px; right: 14px; z-index: 40;
      background: #6a1030; color:#ffd; border:1px solid #ff8aa0; border-radius:8px;
      padding:8px 12px; font-size:13px; font-weight:700; cursor:pointer; font-family:inherit; }
    #testtools-panel { position: fixed; bottom: 56px; right: 14px; z-index: 40; width: 300px;
      max-height: 72vh; overflow-y:auto; display:none; padding:14px;
      background: rgba(18,10,20,0.95); border:1px solid #ff8aa0; border-radius:10px;
      color:#f0e8d8; font-family:inherit; box-shadow:0 6px 30px rgba(0,0,0,.6); }
    #testtools-panel h4 { color:#ff9ab0; font-size:13px; margin:12px 0 6px; letter-spacing:1px; }
    #testtools-panel h4:first-child { margin-top:0; }
    #testtools-panel .tt-note { font-size:10.5px; color:#b090a0; margin-bottom:8px; line-height:1.5; }
    #testtools-panel button { font-family:inherit; cursor:pointer; color:#f0e8d8;
      background:rgba(60,30,50,0.9); border:1px solid #a5607a; border-radius:6px;
      padding:5px 8px; font-size:11.5px; margin:2px; }
    #testtools-panel button:hover { background:rgba(100,50,80,0.95); }
    #testtools-panel .tt-row { display:flex; align-items:center; gap:4px; margin-bottom:3px; flex-wrap:wrap; }
    #testtools-panel .tt-name { width:120px; font-size:11.5px; }
    #testtools-panel .tt-lv { display:flex; flex-wrap:wrap; gap:2px; margin-bottom:8px; }
    #testtools-panel .tt-primary { background:linear-gradient(160deg,#a3283f,#6a1430); border-color:#ff8a9a; font-weight:700; }
  `;
  document.head.appendChild(style);

  // ---- ボタン + パネル ----
  const btn = document.createElement('button');
  btn.id = 'testtools-btn';
  btn.textContent = '🧪 テスト';
  document.body.appendChild(btn);

  const panel = document.createElement('div');
  panel.id = 'testtools-panel';
  document.body.appendChild(panel);
  btn.onclick = () => { panel.style.display = panel.style.display === 'block' ? 'none' : 'block'; };

  const refresh = () => {
    kl.updateHUD();
    kl.updateBadges?.();
    kl.saveGame();
    if (document.getElementById('dict-modal')?.style.display === 'flex') kl.renderDict?.();
  };

  function setAllAff(v) {
    for (const id of NAMED_IDS) world.affPC[id] = v;
    world.dailyAffGain = {};   // 日次上限をリセット(テスト用)
    refresh();
    kl.toast?.(`💞 全員の好感度を「${LEVELS.find(l => l.v === v)?.label ?? v}」に設定`);
  }
  function setAff(id, v) { world.affPC[id] = v; world.dailyAffGain = {}; refresh(); }

  // ---- セクション: 通貨 ----
  let html = '<h4>💰 通貨</h4><div class="tt-row">';
  html += '<button data-act="coin7000" class="tt-primary">🪙 コインを7000に</button>';
  html += '<button data-act="yen9000">圓を9000に</button></div>';

  // ---- セクション: 全員の好感度スイッチ ----
  html += '<h4>💞 好感度スイッチ (全キャラ一括)</h4>';
  html += '<div class="tt-note">スイッチひとつで全員の好感度を設定します。</div><div class="tt-lv">';
  for (const l of LEVELS) html += `<button data-all="${l.v}">${l.label}</button>`;
  html += '</div>';

  // ---- セクション: 施設 ----
  html += '<h4>🏗️ 施設</h4><div class="tt-row"><button data-act="buildall" class="tt-primary">全施設をアンロック&建設</button></div>';

  // ---- セクション: 個別好感度 ----
  html += '<h4>👤 個別 (キャラごと)</h4>';
  for (const id of NAMED_IDS) {
    html += `<div class="tt-row"><span class="tt-name">${CHARS[id].name}</span>` +
      `<button data-id="${id}" data-v="25">知</button>` +
      `<button data-id="${id}" data-v="40">友</button>` +
      `<button data-id="${id}" data-v="60">親</button>` +
      `<button data-id="${id}" data-v="75">特</button></div>`;
  }
  html += '<div class="tt-note" style="margin-top:10px">※ これらはテスト用機能です。ゲーム完成時は testtools.js の削除で消えます。</div>';
  panel.innerHTML = html;

  // ---- イベント ----
  panel.addEventListener('click', (ev) => {
    const t = ev.target;
    if (t.dataset.all !== undefined) { setAllAff(parseInt(t.dataset.all, 10)); return; }
    if (t.dataset.id) { setAff(t.dataset.id, parseInt(t.dataset.v, 10)); return; }
    switch (t.dataset.act) {
      case 'coin7000': state.coins = 7000; refresh(); kl.toast?.('🪙 コインを7000にした'); break;
      case 'yen9000': state.yen = 9000; refresh(); kl.toast?.('💴 圓を9000にした'); break;
      case 'buildall': {
        state.yen = 99999;
        for (const f of Object.values(FACILITIES)) {
          if (f.initial) continue;
          const built = state.tower.some(x => x.kind === 'shop' && x.id === f.id);
          if (!built) {
            if (!state.unlockedFacilities.includes(f.id)) state.unlockedFacilities.push(f.id);
          }
        }
        // buildFacility はタワーを作り直すので、未建設のものを順に建てる
        const toBuild = [...state.unlockedFacilities];
        for (const id of toBuild) kl.buildFacility(id);
        refresh();
        kl.toast?.('🏗️ 全施設を建設した');
        break;
      }
    }
  });

  console.log('%c[TEST MODE] テストツールを読み込みました (右下 🧪 ボタン)', 'color:#ff9ab0');
}
