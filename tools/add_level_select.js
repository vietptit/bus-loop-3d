// Level select screen: tap the "Màn X" pill. All levels unlocked; levels with special mechanics get icons,
// the first level of each mechanic gets a gold "MỚI" highlight.
const fs = require('fs'), path = require('path');
const f = path.join(__dirname, '..', 'bus_loop_3d.html');
let t = fs.readFileSync(f, 'utf8');
const rep = (a, b) => { if (!t.includes(a)) throw new Error('missing: ' + a.slice(0, 60)); t = t.replace(a, b); };

rep('</style>', `
/* ---------- level select ---------- */
.level { cursor: pointer; }
.lsel .card { width: min(360px, 100%); max-height: 82dvh; display: flex; flex-direction: column; padding: 40px 12px 12px; }
.legend { display: flex; flex-wrap: wrap; justify-content: center; gap: 4px 10px; font-size: 13px; font-weight: 600; margin-bottom: 8px; }
.lgrid { overflow-y: auto; display: grid; grid-template-columns: repeat(5, 1fr); gap: 7px; padding: 4px 2px 6px; }
.lv { position: relative; aspect-ratio: 1; border-radius: 14px; font-weight: 700; font-size: 19px; color: var(--ink);
  display: flex; flex-direction: column; align-items: center; justify-content: center; line-height: 1.05; }
.lv small { font-size: 11px; letter-spacing: -1px; }
.lv.mech { background: linear-gradient(180deg, #e8d6ff 0%, #c9a8ff 100%); }
.lv.intro { background: linear-gradient(180deg, #fff3a6 0%, #ffcc3a 100%); box-shadow: 0 0 0 3px #ff9d2e, inset 0 3px 0 #fff, 0 3px 0 var(--line); }
.lv.cur { outline: 3px dashed #8f4fe8; outline-offset: 2px; }
.lv .new { position: absolute; top: -7px; right: -6px; font-size: 9px; padding: 1px 4px; border-radius: 6px; background: #ee5a55; color: #fff; border: 2px solid var(--line); }
</style>`);

rep('  <div class="loading" id="loading">', `  <div class="modal lsel hidden" id="lsel">
    <div class="card panel">
      <div class="ribbon outline">CHỌN MÀN</div>
      <div class="legend" id="legend"></div>
      <div class="lgrid" id="lgrid"></div>
      <button class="mbtn alt" id="lclose">ĐÓNG</button>
    </div>
  </div>

  <div class="loading" id="loading">`);

rep('/* =========================================================\n   INPUT', `/* =========================================================
   LEVEL SELECT
   ========================================================= */
const MECHS = [
  { key: 'cap', icon: '🚌', name: 'Xe khác sức chứa', has: q => new Set(q.buses.map(b => capOf(q, b))).size > 1 || q.buses.some(b => capOf(q, b) !== 2) },
  { key: 'col', icon: '🚩', name: 'Trạm màu', has: q => q.stationColors.some(Boolean) },
  { key: 'tun', icon: '🚇', name: 'Đường hầm', has: q => q.cross.length > 0 },
  { key: 'tp', icon: '🌀', name: 'Dịch chuyển', has: q => q.tp.length > 0 }
];
function openLevels() {
  const firstSeen = {};
  LEVELS.forEach((q, i) => MECHS.forEach(m => { if (firstSeen[m.key] === undefined && m.has(q)) firstSeen[m.key] = i; }));
  $('legend').innerHTML = MECHS.map(m => \`<span>\${m.icon} \${m.name}</span>\`).join('') + '<span><b style="color:#ee5a55">MỚI</b> = màn giới thiệu</span>';
  $('lgrid').innerHTML = LEVELS.map((q, i) => {
    const ms = MECHS.filter(m => m.has(q)), intro = MECHS.some(m => firstSeen[m.key] === i);
    const cls = ['lv', 'panel', ms.length ? 'mech' : '', intro ? 'intro' : '', i === lvl ? 'cur' : ''].join(' ');
    const tip = ms.map(m => m.name).join(', ') || 'Cơ bản';
    return \`<button class="\${cls}" data-l="\${i}" title="\${tip}">\${i + 1}<small>\${ms.map(m => m.icon).join('')}</small>\${intro ? '<span class="new">MỚI</span>' : ''}</button>\`;
  }).join('');
  $('lgrid').querySelectorAll('button').forEach(b => b.onclick = () => { audio(); $('lsel').classList.add('hidden'); reset(+b.dataset.l); });
  $('lsel').classList.remove('hidden');
  const cur = $('lgrid').querySelector('.cur'); if (cur) cur.scrollIntoView({ block: 'center' });
}

/* =========================================================
   INPUT`);

rep("  $('restart').onclick = () => { audio(); reset(lvl); };", `  $('restart').onclick = () => { audio(); reset(lvl); };
  $('level').onclick = () => { audio(); if (mode !== 'run') openLevels(); };
  $('lclose').onclick = () => $('lsel').classList.add('hidden');`);

fs.writeFileSync(f, t);
console.log('level select added');
