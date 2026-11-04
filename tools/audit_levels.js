// Audits generated levels: flags levels that are won by just drawing the shortest road for every bus
// (no thinking needed), and reports how much detour the intended solution needs.
// Usage: node tools/audit_levels.js [levels_generated.json]
const fs = require('fs'), path = require('path');
const L = JSON.parse(fs.readFileSync(process.argv[2] || path.join(__dirname, 'levels_generated.json'), 'utf8'));
const eq = (a, b) => a[0] === b[0] && a[1] === b[1];
const near = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) === 1;
const K = p => p + '';
const stAt = s => Array.isArray(s) ? s : s.at, stCol = s => Array.isArray(s) ? null : s.color || null;

function sim(q, routes) {
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
const rows = [];
L.forEach((q, i) => {
  const items = new Set([...q.blocks.map(K), ...q.stations.map(s => K(stAt(s))), ...q.pickups.map(p => K(p.at))]);
  const routes = []; let used = new Set();
  for (const b of q.buses) {
    const blocked = new Set([...items, ...used, ...q.buses.filter(o => o !== b).flatMap(o => [K(o.start), K(o.end)])]);
    (q.cross || []).forEach(c => blocked.delete(K(c)));
    const r = bfs(q, b, blocked); if (!r) { routes.push(null); break; }
    routes.push(r); r.forEach(p => { if (!(q.cross || []).some(c => eq(c, p))) used.add(K(p)); });
  }
  const trivial = routes.every(Boolean) && sim(q, routes);
  const detour = q.buses.reduce((s, b, k) => s + b.solution.length - (routes[k] ? routes[k].length : b.solution.length), 0);
  rows.push({ lv: 9 + i, trivial, detour, buses: q.buses.length, groups: q.pickups.reduce((s, p) => s + p.count, 0) });
});
console.log(rows.map(r => `M${r.lv}${r.trivial ? ' DỄ' : ''} vòng+${r.detour} xe${r.buses} nhóm${r.groups}`).join('\n'));
console.log('trivial:', rows.filter(r => r.trivial).map(r => r.lv).join(', ') || 'none');
