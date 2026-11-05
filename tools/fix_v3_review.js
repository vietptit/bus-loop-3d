// Fixes for Codex's review of v3.
const fs = require('fs'), path = require('path');
const f = path.join(__dirname, '..', 'bus_loop_3d.html');
let t = fs.readFileSync(f, 'utf8');
const rep = (a, b) => { if (!t.includes(a)) throw new Error('missing: ' + a.slice(0, 70)); t = t.replace(a, b); };

// 1. going home cancels a pending result card (reset() bumps the session so later() callbacks die)
rep("  if (mode === 'run' || demoQ) reset(lvl);", "  if (mode !== 'draw' || demoQ) reset(lvl);");

// 2. shop is a mock: no purchases until items really exist
rep("<button class=\"buy\" data-i=\"\${i}\" \${!s.price || coins < s.price ? 'disabled' : ''}>\${s.price ? '🪙 ' + s.price : 'Sắp có'}</button>",
    "<button class=\"buy\" disabled>\${s.price ? '🪙 ' + s.price + ' · Sắp có' : 'Sắp có'}</button>");

// 3. bridge height from distance along the route, not from heading
rep(`function tunnelY(x, z, heading) {
  if (Math.abs(Math.sin(heading)) > 0.7) return 0;          // moving along x: drives under the bridge
  for (const c of L.cross) {
    const w = W(c);
    if (Math.abs(x - w.x) > 0.3) continue;
    const d = Math.abs(z - w.z);
    if (d < 1.42) return BRIDGE_H * easeInOut(clamp((1.42 - d) / 0.92, 0, 1));
  }
  return 0;
}`, `function bridgeAnchors(r) {
  // distances along this runner's road where it crosses OVER a bridge (vertical pass through a cross cell)
  if (r.overs) return r.overs;
  r.overs = [];
  r.route.forEach((p, i) => {
    if (!isCross(L, p) || i === 0 || i === r.route.length - 1) return;
    if (r.route[i - 1][0] === p[0] && r.route[i + 1][0] === p[0]) r.overs.push(r.pl.anchors[i]);
  });
  return r.overs;
}
function tunnelY(r) {
  for (const a of bridgeAnchors(r)) {
    const d = Math.abs(r.dist - a);
    if (d < 1.42) return BRIDGE_H * easeInOut(clamp((1.42 - d) / 0.92, 0, 1));
  }
  return 0;
}`);
rep('bus.position.y = tunnelY(p.x, p.z, u.heading) +', 'bus.position.y = tunnelY(r) +');

// 4. ramps span exactly from the deck edge (z=0.5, top=BRIDGE_H) to the ground (z=1.42)
rep(`      const ramp = mk(RB(0.7, 0.07, 0.95, 0.03), deckM, g, 0, BRIDGE_H / 2 - 0.02, sz * 0.97);
      ramp.rotation.x = sz * Math.atan2(BRIDGE_H, 0.92);`, `      const run = 0.92, len = Math.hypot(run, BRIDGE_H), ang = Math.atan2(BRIDGE_H, run);
      const ramp = mk(RB(0.7, 0.07, len, 0.03), deckM, g, 0, BRIDGE_H / 2 - 0.035 * Math.cos(ang), sz * (0.5 + run / 2));
      ramp.rotation.x = sz * ang;`);

fs.writeFileSync(f, t);
console.log('review fixes applied');
