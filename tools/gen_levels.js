// Level generator for Bus Loop 3D.
// Builds each level backwards from a solution: random bus routes first, then pickups/stations
// along them, then filler obstacles. Every level is kept only if the shared rule simulator
// (same rules as the game) confirms the stored solution wins.
// Usage: node tools/gen_levels.js [count=42] [seed=2026] > tools/levels_generated.json

const COUNT = +process.argv[2] || 42;
let seed = +process.argv[3] || 2026;
const rand = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const ri = (a, b) => a + Math.floor(rand() * (b - a + 1));
const pick = a => a[Math.floor(rand() * a.length)];
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const eq = (a, b) => a[0] === b[0] && a[1] === b[1];
const near = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) === 1;
const K = p => p[0] + ',' + p[1];
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const COLORS = ['red', 'blue', 'yellow', 'green', 'purple', 'orange', 'pink', 'teal'];

/* ---------------- rules (mirror of the game) ---------------- */
const capOf = (q, b) => b.cap || q.cap;
const stAt = s => Array.isArray(s) ? s : s.at;
const stColor = s => Array.isArray(s) ? null : (s.color || null);
function simRoute(q, bus, route, tk) {
  let cargo = 0; const cap = capOf(q, bus);
  for (const p of route) {
    if (cargo > 0 && q.stations.some(s => near(stAt(s), p) && (!stColor(s) || stColor(s) === bus.color))) cargo = 0;
    q.pickups.forEach((pk, j) => {
      if (pk.color !== bus.color || !near(pk.at, p) || cargo >= cap) return;
      const n = Math.min(pk.count - tk[j], cap - cargo);
      if (n > 0) { cargo += n; tk[j] += n; }
    });
  }
  return cargo;
}
const pairOf = (q, p) => { for (const t of (q.tp || [])) { if (eq(t.a, p)) return t.b; if (eq(t.b, p)) return t.a; } return null; };
function verify(q) {
  const cross = new Set((q.cross || []).map(K));
  const use = new Map();
  for (const b of q.buses) {
    const r = b.solution;
    if (!eq(r[0], b.start) || !eq(r.at(-1), b.end)) return 'ends';
    const own = new Set();
    for (let i = 0; i < r.length; i++) {
      const p = r[i];
      const pr = i ? pairOf(q, r[i - 1]) : null;
      const jumped = i && pr && eq(pr, p);
      if (i && !near(p, r[i - 1]) && !jumped) return 'gap';
      const mine = pairOf(q, p);
      if (mine) { if (i === 0 || i === r.length - 1) return 'tpend'; const entered = !eq(pairOf(q, r[i - 1]) || [-9, -9], p); if (entered && !eq(r[i + 1], mine) && !(eq(r[i - 1], mine))) return 'tpskip'; }
      if (p[0] < 0 || p[1] < 0 || p[0] >= q.size || p[1] >= q.size) return 'oob';
      if (own.has(K(p))) return 'self';
      own.add(K(p));
      if (q.blocks.some(x => eq(x, p)) || q.stations.some(x => eq(stAt(x), p)) || q.pickups.some(x => eq(x.at, p))) return 'onitem';
      if (q.buses.some(o => o !== b && (eq(o.start, p) || eq(o.end, p)))) return 'onbus';
      const n = (use.get(K(p)) || 0) + 1; use.set(K(p), n);
      if (cross.has(K(p))) {
        if (i === 0 || i === r.length - 1) return 'crossend';
        const a = r[i - 1], c = r[i + 1];
        if (a[0] - p[0] !== p[0] - c[0] || a[1] - p[1] !== p[1] - c[1]) return 'crossturn';
        if (n > 2) return 'cross3';
      } else if (n > 1) return 'overlap';
    }
  }
  const tk = q.pickups.map(() => 0);
  for (const b of q.buses) if (simRoute(q, b, b.solution, tk) !== 0) return 'cargo';
  if (!q.pickups.every((p, j) => tk[j] === p.count)) return 'left';
  return true;
}

const stCol = s => Array.isArray(s) ? null : (s.color || null);
function simAll(q, routes) {
  const tk = q.pickups.map(() => 0);
  for (let i = 0; i < q.buses.length; i++) {
    const b = q.buses[i], cap = b.cap || q.cap; let cargo = 0;
    for (const p of routes[i]) {
      if (cargo > 0 && q.stations.some(s => near(stAt(s), p) && (!stCol(s) || stCol(s) === b.color))) cargo = 0;
      q.pickups.forEach((pk, j) => { if (pk.color !== b.color || !near(pk.at, p) || cargo >= cap) return; const n = Math.min(pk.count - tk[j], cap - cargo); if (n > 0) { cargo += n; tk[j] += n; } });
    }
    if (cargo) return false;
  }
  return q.pickups.every((p, j) => tk[j] === p.count);
}
function bfs(q, b, blocked) {
  const start = b.start, prev = new Map([[K(start), null]]), queue = [start];
  const pair = p => { for (const t of q.tp || []) { if (eq(t.a, p)) return t.b; if (eq(t.b, p)) return t.a; } return null; };
  while (queue.length) {
    const c = queue.shift();
    if (eq(c, b.end)) { const out = []; let k = K(c); while (k) { out.unshift(k.split(',').map(Number)); k = prev.get(k); } return out; }
    const nb = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(d => [c[0] + d[0], c[1] + d[1]]);
    const pc = pair(c); if (pc) nb.push(pc);
    for (const n of nb) {
      if (n[0] < 0 || n[1] < 0 || n[0] >= q.size || n[1] >= q.size || prev.has(K(n)) || blocked.has(K(n))) continue;
      prev.set(K(n), K(c)); queue.push(n);
    }
  }
  return null;
}

function isTrivial(q) {
  const items = new Set([...q.blocks.map(K), ...q.stations.map(s => K(stAt(s))), ...q.pickups.map(p => K(p.at))]);
  const routes = []; const used = new Set();
  for (const b of q.buses) {
    const blocked = new Set([...items, ...used, ...q.buses.filter(o => o !== b).flatMap(o => [K(o.start), K(o.end)])]);
    (q.cross || []).forEach(c => blocked.delete(K(c)));
    const r = bfs(q, b, blocked); if (!r) return false;
    routes.push(r); r.forEach(p => { if (!(q.cross || []).some(c => eq(c, p))) used.add(K(p)); });
  }
  return simAll(q, routes);
}

/* ---------------- generator ---------------- */
function edgeCells(n) { const e = []; for (let i = 0; i < n; i++) e.push([0, i], [n - 1, i], [i, 0], [i, n - 1]); return e; }
function onEdge(p, n) { return p[0] === 0 || p[1] === 0 || p[0] === n - 1 || p[1] === n - 1; }

function walk(n, start, minLen, maxLen, occupied, crossOK, tpOK) {
  // random self-avoiding walk ending on a board edge; may pass straight through another route (crossroad)
  let best = null;
  for (let attempt = 0; attempt < 60 && !best; attempt++) {
    const path = [start.slice()], seen = new Set([K(start)]), cross = [], tps = [];
    let dir = pick(DIRS);
    for (let step = 0; step < maxLen * 2; step++) {
      const t = path.at(-1);
      if (path.length >= minLen && onEdge(t, n) && !eq(t, start) && Math.abs(t[0] - start[0]) + Math.abs(t[1] - start[1]) > 2 && !occupied.has(K(t)) && !(tps.length && eq(tps.at(-1).b, t))) { best = { path, cross, tps }; break; }
      if (path.length >= maxLen) break;
      if (tpOK && !tps.length && path.length >= 3 && !onEdge(t, n) && !occupied.has(K(t)) && rand() < 0.35) {
        const far = []; for (let y = 1; y < n - 1; y++) for (let x = 1; x < n - 1; x++) { const c = [x, y]; if (Math.abs(x - t[0]) + Math.abs(y - t[1]) >= 4 && !seen.has(K(c)) && !occupied.has(K(c)) && ![...seen].some(s => { const [sx, sy] = s.split(',').map(Number); return Math.abs(sx - x) + Math.abs(sy - y) <= 1; })) far.push(c); }
        if (far.length) { const c = pick(far); tps.push({ a: t.slice(), b: c }); path.push(c); seen.add(K(c)); continue; }
      }
      const opts = shuffle(DIRS.slice()).sort((a, b) => (eq(b, dir) ? 0.6 : 0) - (eq(a, dir) ? 0.6 : 0) + (rand() - 0.5));
      let moved = false;
      for (const d of opts) {
        const c = [t[0] + d[0], t[1] + d[1]];
        if (c[0] < 0 || c[1] < 0 || c[0] >= n || c[1] >= n || seen.has(K(c))) continue;
        const occ = occupied.get(K(c));
        if (occ) {
          // crossroad: other route goes straight through c perpendicular to d, and we can continue straight
          if (!crossOK || occ.straight === null || occ.straight === (d[0] !== 0 ? 'h' : 'v')) continue;
          const c2 = [c[0] + d[0], c[1] + d[1]];
          if (c2[0] < 0 || c2[1] < 0 || c2[0] >= n || c2[1] >= n || occupied.has(K(c2)) || seen.has(K(c2))) continue;
          path.push(c, c2); seen.add(K(c)); seen.add(K(c2)); cross.push(c); dir = d; moved = true; break;
        }
        path.push(c); seen.add(K(c)); dir = d; moved = true; break;
      }
      if (!moved) break;
    }
  }
  return best;
}

function straightness(path, i) {
  if (i === 0 || i === path.length - 1) return null;
  const a = path[i - 1], c = path[i + 1];
  if (a[1] === c[1] && Math.abs(a[0] - c[0]) === 2) return 'h';
  if (a[0] === c[0] && Math.abs(a[1] - c[1]) === 2) return 'v';
  return null;
}

function makeLevel(cfg) {
  const { n, buses: nb, caps, trips, colorStations, crossroads, teleports, blockDensity } = cfg;
  for (let tries = 0; tries < 900; tries++) {
    const occupied = new Map(), used = new Set(), buses = [], crossCells = [], tp = [];
    const colors = shuffle(COLORS.slice()).slice(0, nb);
    let ok = true;
    for (let b = 0; b < nb && ok; b++) {
      const starts = shuffle(edgeCells(n).filter(p => !occupied.has(K(p)) && !used.has(K(p))));
      let got = null;
      for (const s of starts.slice(0, 12)) {
        got = walk(n, s, Math.max(5, Math.floor(n * 1.1)), Math.floor(n * 2.6), occupied, crossroads > crossCells.length && b > 0, teleports > tp.length);
        if (got) break;
      }
      if (!got) { ok = false; break; }
      got.path.forEach((p, i) => { if (!occupied.has(K(p))) occupied.set(K(p), { bus: b, straight: straightness(got.path, i) }); });
      got.cross.forEach(c => crossCells.push(c));
      got.tps.forEach(x => { tp.push(x); occupied.get(K(x.a)).straight = null; occupied.get(K(x.b)).straight = null; });
      used.add(K(got.path[0])); used.add(K(got.path.at(-1)));
      buses.push({ id: String.fromCharCode(65 + b), color: colors[b], start: got.path[0], end: got.path.at(-1), solution: got.path, cap: caps[b] });
    }
    if (!ok) continue;
    if (crossroads && crossCells.length < 1) continue;
    if (teleports && tp.length < 1) continue;
    // crossroads must not touch each other
    if (crossCells.some((c, i) => crossCells.some((d, j) => i !== j && (near(c, d) || eq(c, d))))) continue;

    // items go on free cells next to routes
    const free = p => p[0] >= 0 && p[1] >= 0 && p[0] < n && p[1] < n && !occupied.has(K(p)) && !itemAt.has(K(p));
    const itemAt = new Set();
    const pickups = [], stations = [];
    for (const bus of buses) {
      const path = bus.solution, cap = bus.cap;
      const T = trips[buses.indexOf(bus)];
      // split the route into T trip windows: pickup in the first half of the window, drop in the second
      const L = path.length, win = L / T;
      for (let t = 0; t < T && ok; t++) {
        const a0 = Math.floor(t * win), a1 = Math.floor(t * win + win * 0.45), b1 = Math.floor((t + 1) * win) - 1;
        const pickIdx = shuffle([...Array(Math.max(1, a1 - a0 + 1)).keys()].map(k => a0 + k));
        let need = cap, placed = 0;
        const groups = need >= 2 && rand() < 0.4 ? [1, need - 1] : [need];
        for (const g of groups) {
          let done = false;
          for (const i of pickIdx) {
            const cells = shuffle(DIRS.map(d => [path[i][0] + d[0], path[i][1] + d[1]])).filter(free);
            if (!cells.length) continue;
            const c = cells[0]; itemAt.add(K(c)); pickups.push({ at: c, color: bus.color, count: g }); done = true; placed++; break;
          }
          if (!done) ok = false;
        }
        // station
        const dropIdx = shuffle([...Array(Math.max(1, b1 - a1)).keys()].map(k => a1 + 1 + k)).filter(i => i < L);
        let sdone = false;
        // reuse an existing station adjacent to this window if possible
        for (const i of dropIdx) {
          const ex = stations.find(s => near(s.at, path[i]) && (!s.color || s.color === bus.color));
          if (ex) { sdone = true; break; }
        }
        if (!sdone) for (const i of dropIdx) {
          const cells = shuffle(DIRS.map(d => [path[i][0] + d[0], path[i][1] + d[1]])).filter(free);
          if (!cells.length) continue;
          const c = cells[0]; itemAt.add(K(c));
          stations.push({ at: c, color: colorStations && rand() < 0.55 ? bus.color : null }); sdone = true; break;
        }
        if (!sdone) ok = false;
      }
    }
    if (!ok) continue;
    const blocks = [];
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const p = [x, y];
      if (free(p) && rand() < blockDensity) blocks.push(p);
    }
    const q = {
      size: n, cap: Math.max(...caps), buses, pickups,
      stations: stations.map(s => s.color ? { at: s.at, color: s.color } : s.at),
      blocks, cross: crossCells, tp
    };
    if (verify(q) === true && !(cfg.hard && isTrivial(q))) return q;
  }
  return null;
}

/* ---------------- difficulty curve: levels 9..50 ---------------- */
const out = [];
for (let i = 0; i < COUNT; i++) {
  const lv = 9 + i;
  const n = Math.min(9, 6 + Math.floor(i / 10));
  const nb = i >= 1 && i < 5 ? 2 : Math.min(4, 1 + Math.floor((i + 4) / 9));
  const caps = [...Array(nb)].map(() => (i < 3 ? [1, 3][ri(0, 1)] : pick([1, 2, 2, 3])));
  const trips = caps.map(() => (i < 6 ? ri(1, 2) : ri(1, 3)));
  const colorStations = lv >= 15;
  const crossroads = lv >= 25 && nb >= 2 && (lv < 33 || lv % 2 === 0) ? (lv >= 40 ? 2 : 1) : 0;
  const teleports = lv >= 33 && (lv % 2 === 1 || lv >= 44) ? (lv >= 46 ? 2 : 1) : 0;
  let q = null;
  for (let t = 0; t < 150 && !q; t++) q = makeLevel({ n, buses: nb, caps, trips, colorStations, crossroads, teleports, hard: lv >= 10, blockDensity: 0.1 + Math.min(0.12, i * 0.004) });
  if (!q) { console.error('failed level', lv); continue; }
  const tips = [];
  if (lv === 9) tips.push('Xe nhỏ chở 1 nhóm, xe to chở 3 nhóm — nhìn số trên xe!');
  if (lv === 15) tips.push('Trạm cắm cờ màu chỉ nhận khách cùng màu 🚩');
  if (lv === 25) tips.push('Đường hầm: 2 xe được đi chung ô, nhưng phải đi thẳng!');
  if (lv === 33) tips.push('Vẽ vào ống dịch chuyển để sang ống cùng màu 🌀');
  q.name = 'Màn ' + lv;
  q.tip = tips[0] || pick(['Đón đủ khách rồi về cổng nhé!', 'Ghé trạm trả khách khi xe đầy.', 'Tìm đường cho từng xe!', 'Đừng để khách bị bỏ lại!']);
  out.push(q);
}
console.error('generated', out.length, 'levels; verify:', out.map(verify).every(v => v === true));
process.stdout.write(JSON.stringify(out));
