// v3: full game shell (home / levels / settings / shop / win-lose) in a purple-gold toy style,
// bus sizes by capacity, shared stations stay white, tunnel -> overpass bridge.
const fs = require('fs'), path = require('path');
const f = path.join(__dirname, '..', 'bus_loop_3d.html');
let t = fs.readFileSync(f, 'utf8');
const rep = (a, b, all = false) => { if (!t.includes(a)) throw new Error('missing: ' + a.slice(0, 70)); t = all ? t.split(a).join(b) : t.replace(a, b); };

/* ================= CSS: purple / gold toy theme (overrides) ================= */
rep('</style>', `
/* ===== v3 theme ===== */
:root { --ink: #3a1a6b; --line: #2e1259; --cream: #fff7e8; --purple1: #a46bff; --purple2: #6a2fd6; }
.shell { background: linear-gradient(180deg, #c9b3ff 0%, #f3c9e6 55%, #ffd9c4 100%) !important; }
.panel { background: linear-gradient(180deg, var(--purple1) 0%, var(--purple2) 100%); border: 3px solid var(--line); color: #fff;
  box-shadow: inset 0 3px 0 rgba(255,255,255,.35), inset 0 -4px 0 rgba(30,0,80,.35), 0 3px 0 var(--line); }
.pill.panel, .cnt.panel, .toast.panel { color: #fff; text-shadow: 0 2px 0 var(--line); }
.boost.panel, .rbtn.panel { color: #fff; }
.boost.on { background: linear-gradient(#ffe66b, #ffad0d); }
.level { background: linear-gradient(180deg, #ffd84a 0%, #ff9f1c 100%) !important; }
.play { background: linear-gradient(180deg, #7ff05c 0%, #24b33a 100%); }
.play.run { background: linear-gradient(180deg, #ffd84a 0%, #ff9f1c 100%); }
.card.panel { background: linear-gradient(180deg, #8b52f0 0%, #5a22c4 100%); }
.card p { color: #fff; text-shadow: 0 2px 0 var(--line); }
.mbtn { background: linear-gradient(180deg, #7ff05c 0%, #24b33a 100%); }
.mbtn.alt { background: linear-gradient(180deg, #ffd84a 0%, #ff9f1c 100%); color: #fff; text-shadow: 0 2px 0 var(--line); }
.mbtn.ghost { background: linear-gradient(180deg, #fff7e8, #f1dcc0); color: var(--ink); text-shadow: none; }
.ribbon { background: linear-gradient(180deg, #ff8a7a 0%, #e8473f 100%); border-radius: 12px; clip-path: polygon(0 0, 100% 0, 96% 50%, 100% 100%, 0 100%, 4% 50%); padding: 8px 34px; }
.ribbon.win { background: linear-gradient(180deg, #8ff06a 0%, #2cb83f 100%); }
.ribbon.info { background: linear-gradient(180deg, #ffd84a 0%, #ff9f1c 100%); }
.lv.panel { background: linear-gradient(180deg, #fff7e8, #f1dcc0); color: var(--ink); text-shadow: none; }
.lv.mech { background: linear-gradient(180deg, #e2cfff 0%, #b98cff 100%); }
.lv.intro { background: linear-gradient(180deg, #fff3a6 0%, #ffcc3a 100%); }
.legend { color: #fff; text-shadow: 0 2px 0 var(--line); }
.modal { background: rgba(40, 10, 80, .55); }
.inner { background: var(--cream); color: var(--ink); border: 3px solid var(--line); border-radius: 16px; padding: 10px; margin: 6px 0 10px; text-shadow: none; font-weight: 600; }

/* ----- home screen ----- */
.home { position: absolute; inset: 0; z-index: 7; display: flex; flex-direction: column; align-items: center;
  background: linear-gradient(180deg, rgba(150,100,255,.88) 0%, rgba(243,170,215,.82) 60%, rgba(255,200,170,.9) 100%); }
.home.hidden { display: none; }
.home .top { width: 100%; display: flex; justify-content: space-between; align-items: center; padding: max(12px, env(safe-area-inset-top)) 12px 0; }
.home .hearts { display: flex; align-items: center; gap: 6px; height: 38px; padding: 0 14px 0 4px; border-radius: 99px; font-weight: 700; font-size: 18px; }
.heart { font-size: 26px; margin-left: -6px; filter: drop-shadow(0 2px 0 var(--line)); }
.logo { margin-top: 9dvh; text-align: center; line-height: .95; transform: rotate(-4deg); }
.logo b { display: block; font-size: 64px; color: #ffd84a; letter-spacing: 2px; text-shadow: -4px -4px 0 var(--line), 4px -4px 0 var(--line), -4px 4px 0 var(--line), 4px 4px 0 var(--line), 0 9px 0 var(--line); }
.logo b + b { color: #7ff05c; font-size: 72px; }
.mascot { font-size: 96px; margin-top: 4dvh; animation: drive 1.6s ease-in-out infinite; filter: drop-shadow(0 8px 0 rgba(46,18,89,.35)); }
@keyframes drive { 0%,100% { transform: translateX(-24px) rotate(-3deg); } 50% { transform: translateX(24px) rotate(3deg); } }
.homeplay { margin-top: auto; margin-bottom: 18px; width: min(270px, 74%); padding: 10px 0 12px; border-radius: 26px; font-weight: 700; font-size: 34px; line-height: 1;
  background: linear-gradient(180deg, #7ff05c 0%, #24b33a 100%); border: 4px solid var(--line);
  box-shadow: inset 0 5px 0 rgba(255,255,255,.4), inset 0 -6px 0 rgba(0,70,10,.3), 0 6px 0 var(--line); animation: pulse 1.1s infinite ease-in-out; }
.homeplay small { display: block; font-size: 17px; opacity: .95; margin-bottom: 2px; }
.nav { width: calc(100% - 20px); margin: 0 10px max(10px, env(safe-area-inset-bottom)); display: flex; justify-content: space-around; align-items: flex-end;
  padding: 6px 4px; border-radius: 22px; }
.nav button { background: none; color: #fff; font-weight: 700; font-size: 13px; text-shadow: 0 2px 0 var(--line); display: flex; flex-direction: column; align-items: center; gap: 2px; width: 30%; padding: 4px 0; border-radius: 16px; }
.nav button i { font-style: normal; font-size: 34px; filter: drop-shadow(0 3px 0 var(--line)); }
.nav button.on { background: rgba(255,255,255,.18); transform: translateY(-6px); }
.nav button.on i { font-size: 42px; }

/* ----- settings / shop rows ----- */
.row { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 8px 4px; font-weight: 700; font-size: 18px; }
.sw { width: 64px; height: 34px; border-radius: 99px; border: 3px solid var(--line); background: #c9c0d8; position: relative; }
.sw::after { content: ''; position: absolute; top: 2px; left: 3px; width: 24px; height: 24px; border-radius: 50%; background: #fff; border: 2px solid var(--line); transition: left .15s; }
.sw.on { background: #45cf4f; }
.sw.on::after { left: 31px; }
.shopitem { display: flex; align-items: center; gap: 10px; text-align: left; }
.shopitem .ic { font-size: 34px; }
.shopitem .nm { flex: 1; font-size: 16px; line-height: 1.15; }
.shopitem .nm small { display: block; font-weight: 600; opacity: .7; font-size: 12px; }
.buy { padding: 6px 10px; border-radius: 12px; font-weight: 700; font-size: 15px; color: #fff; text-shadow: 0 2px 0 var(--line); border: 3px solid var(--line);
  background: linear-gradient(180deg, #7ff05c 0%, #24b33a 100%); white-space: nowrap; }
.buy:disabled { filter: grayscale(.8); opacity: .7; }
.reward { display: flex; justify-content: center; align-items: center; gap: 8px; font-size: 30px; font-weight: 700; color: #ffd84a; text-shadow: 0 3px 0 var(--line); }
</style>`);

/* ================= HTML: home, settings, shop ================= */
rep('<button class="rbtn panel" id="soundBtn" title="Âm thanh">🔊</button>', '<button class="rbtn panel" id="soundBtn" title="Cài đặt">⚙️</button>');
rep('<button class="rbtn panel" id="restart" title="Chơi lại">↻</button>', '<button class="rbtn panel" id="restart" title="Chơi lại">↻</button>\n      <button class="rbtn panel" id="homeBtn" title="Trang chủ">🏠</button>');
rep('<button class="mbtn alt" id="mRetry">↻ CHƠI LẠI</button>', '<button class="mbtn alt" id="mRetry">↻ CHƠI LẠI</button>\n      <button class="mbtn ghost" id="mHome">🏠 TRANG CHỦ</button>');
rep('<p id="mText"></p>', '<div class="reward" id="mReward">🪙 +30</div>\n      <p id="mText"></p>');
rep('  <div class="loading" id="loading">', `  <div class="home" id="home">
    <div class="top">
      <div class="pill panel"><span class="coin">$</span><span id="homeCoins">0</span></div>
      <div class="hearts panel"><span class="heart">❤️</span>5</div>
      <button class="rbtn panel" id="homeGear" title="Cài đặt">⚙️</button>
    </div>
    <div class="logo"><b>BUS</b><b>LOOP</b></div>
    <div class="mascot">🚌</div>
    <button class="homeplay outline" id="homePlay"><small id="homeLvl">Màn 1</small>CHƠI</button>
    <nav class="nav panel">
      <button id="navShop"><i>🏪</i>Cửa hàng</button>
      <button id="navHome" class="on"><i>🏠</i>Trang chủ</button>
      <button id="navLevels"><i>🗺️</i>Chọn màn</button>
    </nav>
  </div>

  <div class="modal hidden" id="settings">
    <div class="card panel">
      <div class="ribbon outline info">CÀI ĐẶT</div>
      <div class="inner">
        <div class="row">🔊 Âm thanh <button class="sw" id="swSound"></button></div>
        <div class="row">📳 Rung <button class="sw" id="swVib"></button></div>
      </div>
      <button class="mbtn ghost" id="setHome">🏠 TRANG CHỦ</button>
      <button class="mbtn alt" id="setReset">XOÁ TIẾN ĐỘ</button>
      <button class="mbtn" id="setClose">ĐÓNG</button>
    </div>
  </div>

  <div class="modal hidden" id="shop">
    <div class="card panel">
      <div class="ribbon outline info">CỬA HÀNG</div>
      <div class="inner" id="shopList"></div>
      <button class="mbtn" id="shopClose">ĐÓNG</button>
    </div>
  </div>

  <div class="loading" id="loading">`);

/* ================= JS: shell logic ================= */
rep("const buzz = ms => { try { navigator.vibrate && navigator.vibrate(ms); } catch {} };",
    "let vibOn = store.get('bl_vib', true);\nconst buzz = ms => { if (!vibOn) return; try { navigator.vibrate && navigator.vibrate(ms); } catch {} };");
rep("  $('soundBtn').textContent = muted ? '🔇' : '🔊';", "  $('homeCoins').textContent = coins; $('homeLvl').textContent = 'Màn ' + (lvl + 1);\n  $('swSound').classList.toggle('on', !muted); $('swVib').classList.toggle('on', vibOn);");
rep("  $('soundBtn').onclick = () => { audio(); muted = !muted; store.set('bl_mute', muted); refreshUI(); };", `  $('soundBtn').onclick = () => { audio(); $('settings').classList.remove('hidden'); };
  $('homeGear').onclick = () => { audio(); $('settings').classList.remove('hidden'); };
  $('setClose').onclick = () => $('settings').classList.add('hidden');
  $('swSound').onclick = () => { audio(); muted = !muted; store.set('bl_mute', muted); refreshUI(); SFX.step(4); };
  $('swVib').onclick = () => { vibOn = !vibOn; store.set('bl_vib', vibOn); buzz(30); refreshUI(); };
  $('setHome').onclick = () => { $('settings').classList.add('hidden'); goHome(); };
  $('setReset').onclick = () => { coins = 120; store.set('bl_coins', coins); $('settings').classList.add('hidden'); reset(0); goHome(); toast('Đã xoá tiến độ', 'good'); };
  $('homeBtn').onclick = () => { audio(); goHome(); };
  $('homePlay').onclick = () => { audio(); SFX.go(); $('home').classList.add('hidden'); reset(lvl); };
  $('navLevels').onclick = () => { audio(); openLevels(); };
  $('navShop').onclick = () => { audio(); openShop(); };
  $('shopClose').onclick = () => $('shop').classList.add('hidden');
  $('mHome').onclick = () => { audio(); $('modal').classList.add('hidden'); goHome(); };`);
rep("$('lgrid').querySelectorAll('button').forEach(b => b.onclick = () => { audio(); $('lsel').classList.add('hidden'); reset(+b.dataset.l); });",
    "$('lgrid').querySelectorAll('button').forEach(b => b.onclick = () => { audio(); $('lsel').classList.add('hidden'); $('home').classList.add('hidden'); reset(+b.dataset.l); });");
rep('/* =========================================================\n   LEVEL SELECT', `/* =========================================================
   SHELL: home / shop
   ========================================================= */
function goHome() {
  clearTimeout(autoT); autoT = null;
  if (mode === 'run' || demoQ) reset(lvl);
  $('modal').classList.add('hidden'); $('lsel').classList.add('hidden');
  $('home').classList.remove('hidden'); refreshUI();
}
const SHOP = [
  { ic: '💡', nm: 'Gợi ý x3', sub: 'Hiện đường đi mẫu', price: 90 },
  { ic: '↶', nm: 'Lùi bước x5', sub: 'Hoàn tác khi vẽ', price: 60 },
  { ic: '🚌', nm: 'Skin xe Cầu vồng', sub: 'Sắp ra mắt', price: 0 },
  { ic: '❤️', nm: 'Đầy tim', sub: 'Chơi tiếp ngay', price: 150 }
];
function openShop() {
  $('shopList').innerHTML = SHOP.map((s, i) => \`<div class="row shopitem"><span class="ic">\${s.ic}</span><span class="nm">\${s.nm}<small>\${s.sub}</small></span>
    <button class="buy" data-i="\${i}" \${!s.price || coins < s.price ? 'disabled' : ''}>\${s.price ? '🪙 ' + s.price : 'Sắp có'}</button></div>\`).join('');
  $('shopList').querySelectorAll('.buy').forEach(b => b.onclick = () => {
    const s = SHOP[+b.dataset.i]; if (coins < s.price) return;
    coins -= s.price; store.set('bl_coins', coins); SFX.coin(); refreshUI(); openShop(); toast('Đã mua ' + s.nm + ' (bản thử)', 'good');
  });
  $('shop').classList.remove('hidden');
}

/* =========================================================
   LEVEL SELECT`);
// win / lose card
rep("  $('mTitle').textContent = won ? 'TUYỆT VỜI!' : 'ÔI KHÔNG!';", "  $('mTitle').textContent = won ? 'HOÀN THÀNH!' : 'THẤT BẠI!';\n  $('mReward').style.display = won ? 'flex' : 'none';");
// level label inside the level select opener also from home
rep("  $('level').onclick = () => { audio(); if (mode !== 'run') openLevels(); };", "  $('level').onclick = () => { audio(); if (mode !== 'run') openLevels(); };\n  $('lclose').onclick = () => $('lsel').classList.add('hidden');");

/* ================= bus size by capacity ================= */
rep('  g.scale.setScalar(0.9);\n  return g;', '  const bs = cap <= 1 ? 0.7 : cap === 2 ? 0.82 : 0.96;\n  g.userData.baseScale = bs; g.scale.setScalar(bs);\n  return g;');
rep('bus.scale.setScalar(0.9 * (1 - easeInOut(k)))', 'bus.scale.setScalar(u.baseScale * (1 - easeInOut(k)))');
rep('bus.scale.setScalar(0.9 * Math.max(0.001, back))', 'bus.scale.setScalar(u.baseScale * Math.max(0.001, back))');
rep("if (s >= 1) { bus.scale.setScalar(0.9);", "if (s >= 1) { bus.scale.setScalar(u.baseScale);");
rep('bus.scale.setScalar(0.9 * (1 - e * e));', 'bus.scale.setScalar(u.baseScale * (1 - e * e));');

/* ================= shared stations stay white ================= */
rep('      if (idx === 0) paintStation(st, color);', '      if (idx === 0) st.open = Math.max(st.open, 0.6);');

/* ================= tunnel -> overpass ================= */
const cs = t.indexOf('/* ---------- tunnel: x-direction'), ce = t.indexOf('\n}\n', cs) + 3;
t = t.slice(0, cs) + `/* ---------- overpass: z-direction drives over the bridge, x-direction passes underneath ---------- */
const BRIDGE_H = 0.82;
function createCross(p) {
  const g = new THREE.Group(); g.position.copy(W(p)); root.add(g);
  const deckM = M(0xfff1dc), sideM = M(0x9b7bd8), railM = M(0xffffff);
  mk(RB(0.7, 0.1, 1.0, 0.04), deckM, g, 0, BRIDGE_H - 0.05, 0);
  mk(RB(0.74, 0.08, 1.02, 0.03), sideM, g, 0, BRIDGE_H - 0.13, 0);
  for (const sx of [-1, 1]) {
    mk(RB(0.05, 0.1, 1.0, 0.02), railM, g, sx * 0.36, BRIDGE_H + 0.04, 0);
    for (const sz of [-1, 1]) {
      mk(RB(0.1, BRIDGE_H - 0.15, 0.1, 0.03), sideM, g, sx * 0.4, (BRIDGE_H - 0.15) / 2, sz * 0.46);
      // ramps reaching into the neighbouring cells along z
      const ramp = mk(RB(0.7, 0.07, 0.95, 0.03), deckM, g, 0, BRIDGE_H / 2 - 0.02, sz * 0.97);
      ramp.rotation.x = sz * Math.atan2(BRIDGE_H, 0.92);
    }
  }
}
` + t.slice(ce);
const ts = t.indexOf('function tunnelY('), te = t.indexOf('\n}\n', ts) + 3;
t = t.slice(0, ts) + `function tunnelY(x, z, heading) {
  if (Math.abs(Math.sin(heading)) > 0.7) return 0;          // moving along x: drives under the bridge
  for (const c of L.cross) {
    const w = W(c);
    if (Math.abs(x - w.x) > 0.3) continue;
    const d = Math.abs(z - w.z);
    if (d < 1.42) return BRIDGE_H * easeInOut(clamp((1.42 - d) / 0.92, 0, 1));
  }
  return 0;
}
` + t.slice(te);
rep("why = 'Phải đi thẳng qua ngã tư ➡️'", "why = 'Phải đi thẳng qua cầu vượt ➡️'");
rep("why = 'Không dừng ở ngã tư'", "why = 'Không dừng trên cầu vượt'");
rep("{ key: 'tun', icon: '🚇', name: 'Đường hầm',", "{ key: 'tun', icon: '🌉', name: 'Cầu vượt',");
rep('Đường hầm: 2 xe được đi chung ô, nhưng phải đi thẳng!', 'Cầu vượt: 1 xe chạy trên cầu, 1 xe chui dưới — phải đi thẳng!', true);

/* boot: start on the home screen */
rep('  $(\'loading\').classList.add(\'hidden\');', '  $(\'loading\').classList.add(\'hidden\');\n  $(\'home\').classList.remove(\'hidden\'); refreshUI();');

fs.writeFileSync(f, t);
console.log('v3 applied');
