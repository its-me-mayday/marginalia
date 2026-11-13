/* ============================================================
   MARGINALIA — mondo di gioco: Postilla, fisica, nemici, boss
   ============================================================ */
const GRAV = 1800, JUMP = 620, JUMP2 = 560, RUN = 250;

const G = {
  state: 'title', chapter: 0, li: 0, L: null, t: 0, cam: { x: 0, y: 0 }, layer: 1, shake: 0,
  cap: null, stormT: 0, autoT: 0, beatAcc: 0, beatPeriod: 1.7, lastHalf: -1, beatPh: 0, pulse: 0, cp: null,
  chaseX: 0, chaseOn: false, proj: [], dyn: [], rings: [], fly: [], boss: null,
  stats: { deaths: 0, time: 0, marks: 0, total: 0 }, cardT: 0, turn: null, flash: 0, paused: false, end: null
};
const P = { x: 0, y: 0, w: 20, h: 30, vx: 0, vy: 0, g: 1, ground: false, coy: 0, buf: 0, air: 0, face: 1, dead: 0, born: 0, sx: 1, sy: 1, cd: 0, light: 0, run: 0, blink: 0, cut: false, standOn: null, trail: [], idle: 0 };

function say(text) { G.cap = { text, t: 0, dur: 3.2 + text.length * .055 }; AU.sfx('whisper'); }

function loadLevel(i) {
  const ch = CHAPTERS[G.chapter];
  G.li = i;
  const L = G.L = ch.levels[i]();
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
  for (const p of L.plats) { x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x + p.w); y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y); p.frz = 0; p.rw = 0; p.gone = 0; p.tw = 0; p.fleeing = false; }
  for (const b of L.blocks) { x0 = Math.min(x0, b.x); x1 = Math.max(x1, b.x + b.w); if (b.tile) { y0 = Math.min(y0, b.y); y1 = Math.max(y1, b.y + b.h); } }
  L.b = L.fixed ? { x0: 0, x1: W, y0: 0, y1: H } : { x0: x0 - 260, x1: x1 + 320, y0: Math.min(0, y0 - 330), y1: Math.max(H, y1 + 230) };
  for (const b of L.bugs) { b.dead = 0; b.t = rnd(9); }
  for (const m of L.marks) m.got = false;
  for (const c of L.checks) c.got = false;
  G.layer = 1;
  G.cp = { x: L.spawn.x + 10, y: L.spawn.y + 30, inv: false, layer: 1, first: true };
  G.beatPeriod = L.beat || 1.7; G.beatAcc = 0; G.lastHalf = -1; G.beatPh = 0;
  G.proj = []; G.dyn = []; G.rings = []; G.fly = []; parts.length = 0;
  G.stats.total += L.marks.length; if (i === 0) G.stats.full = true;
  G.chaseOn = false; G.cardT = 0; G.cap = null; G.note = null; G.boss = null; G.flash = 0;
  P.light = 0; P.cd = 0;
  if (L.boss) initBoss();
  AU.setMood(L.mood);
  respawn(true);
}

function respawn(first) {
  const L = G.L, c = G.cp;
  P.x = c.x - P.w / 2; P.y = c.inv ? c.y : c.y - P.h; P.vx = P.vy = 0; P.g = c.inv ? -1 : 1;
  P.dead = 0; P.born = .6; P.air = 0; P.ground = false; P.cut = false; P.sx = .3; P.sy = .3; P.trail.length = 0; P.standOn = null;
  if (!first) P.cd = Math.min(P.cd, .2);
  G.layer = c.layer || 1;
  G.chaseX = c.x - 620; if (c.first) G.chaseOn = false;
  G.proj = []; G.dyn = []; G.stormT = 1.2; G.autoT = 2.7;
  for (const p of L.plats) { p.x = p.x0; p.frz = 0; p.rw = 0; p.gone = 0; p.fleeing = false; }
  for (const k of L.candles) k.cd = 0;
  for (const b of L.blocks) b.off = 0;
  if (G.boss && !first) { G.boss.hp = (G.boss.phase - 1) * 3; G.boss.intro = 1.1; G.boss.shoot = 1.6; G.boss.stainT = 2.6; nextTarget(); }
  camera(0, true);
}

function die() {
  if (P.dead > 0) return;
  P.dead = .8; G.stats.deaths++; G.shake = 9; AU.sfx('die');
  puff(P.x + P.w / 2, P.y + P.h / 2, 40, { s0: 60, s1: 300, z0: 2, z1: 6, l0: .4, l1: 1, grav: 700 });
}

function solid(p) {
  if (p.kind === 'fake') return false;
  if (p.kind === 'beat') return beatOn(p);
  if (p.kind === 'rewind' && p.gone > 0) return false;
  if (p.layer && p.layer !== G.layer) return false;
  return true;
}
// ogni riga-battito vive un po' più del suo mezzo ciclo: piccola tolleranza per chi salta
function beatOn(p) { const f = ((G.beatAcc % 2) + 2) % 2; return p.phase === 0 ? (f < 1.22) : (f >= 1 || f < .22); }
function blockSolid(b) {
  if (b.off > 0) return false;
  if (b.layer && b.layer !== G.layer) return false;
  return true;
}
function onScreen(o, pad) { pad = pad || 80; return o.x + (o.w || 0) > G.cam.x - pad && o.x < G.cam.x + W + pad; }

/* ---------------- piattaforme vive ---------------- */
function updPlats(dt) {
  const L = G.L, pc = P.x + P.w / 2, feet = P.y + P.h;
  for (const p of L.plats) {
    if (p.kind === 'flee') {
      if (p.frz > 0) { p.frz -= dt; continue; }
      if (P.standOn === p || P.dead > 0) continue;
      const c = p.x + p.w / 2, d = Math.abs(pc - c), trig = p.w / 2 + 150;
      if (d < trig && Math.abs(feet - p.y) < 230) {
        const nx = clamp(p.x + sgn(c - pc) * 330 * dt, p.x0 - p.range, p.x0 + p.range);
        if (nx !== p.x) {
          if (!p.fleeing) { p.fleeing = true; AU.sfx('flee'); }
          p.x = nx;
          if (Math.random() < .3) puff(p.x + rnd(p.w), p.y + 18, 1, { s0: 10, s1: 40, grav: 60, col: 'rgba(60,40,20,.5)', z0: 1, z1: 2.4 });
        } else p.fleeing = false;
      } else {
        p.fleeing = false;
        if (d > trig + 90) { const dx = p.x0 - p.x; if (Math.abs(dx) > .5) p.x += sgn(dx) * Math.min(Math.abs(dx), 120 * dt); }
      }
    } else if (p.kind === 'ferry') {
      // riga curiosa: viene a prenderti e ti riporta a casa sua
      const on = P.standOn === p; let tx = p.x0;
      if (!on && P.dead <= 0 && Math.abs(pc - (p.x0 + p.w / 2)) < p.range + p.w / 2 + 340 && Math.abs(feet - p.y) < 260) tx = p.x0 - p.dirn * p.range;
      const sp = (on ? 135 : 220) * dt, dx = clamp(tx - p.x, -sp, sp);
      p.x += dx; if (on) P.x += dx; p.moving = Math.abs(dx) > .001;
    } else if (p.kind === 'rewind') {
      if (p.rw > 0) { p.rw -= dt; if (p.rw <= 0) { p.gone = 2.6; puff(p.x + p.w / 2, p.y + 10, 10, { jx: p.w / 2, s0: 10, s1: 60, grav: 0, col: 'rgba(30,20,10,.5)' }); AU.sfx('page'); } }
      else if (p.gone > 0) p.gone -= dt;
    }
  }
  for (const b of L.blocks) if (b.off > 0) { b.off -= dt; if (b.off <= 0 && overlap(P, b)) b.off = .2; }
}

/* ---------------- Postilla ---------------- */
function updPlayer(dt) {
  const L = G.L;
  if (P.dead > 0) { P.dead -= dt; if (P.dead <= 0) respawn(); return; }
  if (P.born > 0) P.born -= dt;

  // pagine capovolte: gravità invertita
  let g = 1; const pcx = P.x + P.w / 2;
  for (const z of L.zones) if (pcx > z.x && pcx < z.x + z.w) { g = -1; break; }
  if (g !== P.g) { P.g = g; P.air = 0; P.ground = false; AU.sfx('flip'); puff(pcx, P.y + P.h / 2, 14, { s0: 30, s1: 140, grav: -300 * g, col: GRAPHITE }); }

  const dir = (inp.right ? 1 : 0) - (inp.left ? 1 : 0);
  if (dir) { P.vx = clamp(P.vx + dir * (P.ground ? 2700 : 2000) * dt, -RUN, RUN); P.face = dir; P.idle = 0; }
  else { const f = (P.ground ? 2500 : 900) * dt; P.vx = Math.abs(P.vx) <= f ? 0 : P.vx - sgn(P.vx) * f; P.idle += dt; }

  P.coy -= dt; P.buf -= dt; P.cd -= dt; if (P.light > 0) P.light -= dt;
  if (inp.jumpP) P.buf = .13;
  if (P.buf > 0) {
    const fx = P.x + P.w / 2, fy = P.g > 0 ? P.y + P.h : P.y;
    if (P.ground || P.coy > 0) {
      P.vy = -JUMP * P.g; P.ground = false; P.coy = 0; P.buf = 0; P.cut = false; P.sx = .7; P.sy = 1.34; AU.sfx('jump');
      puff(fx, fy, 7, { ang: -Math.PI / 2 * P.g, spread: 1.2, s0: 30, s1: 120, z0: 1.5, z1: 3.5, grav: 500 * P.g });
    } else if (P.air < 1) {
      P.air++; P.vy = -JUMP2 * P.g; P.buf = 0; P.cut = false; P.sx = .68; P.sy = 1.36; AU.sfx('jump2');
      for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; parts.push({ x: fx + Math.cos(a) * 10, y: fy + Math.sin(a) * 4, vx: Math.cos(a) * 90, vy: Math.sin(a) * 30 + 40 * P.g, life: 0, max: .4, size: 2.4, col: GRAPHITE, grav: 0, drag: 3, glow: 0 }); }
    }
  }
  if (!inp.jump && !P.cut && P.vy * P.g < -140) { P.vy *= .5; P.cut = true; }
  P.vy = clamp(P.vy + GRAV * P.g * dt, -950, 950);

  // asse X
  P.x += P.vx * dt;
  for (const b of L.blocks) {
    if (!blockSolid(b) || !overlap(P, b)) continue;
    if (P.vx > 0) P.x = b.x - P.w; else if (P.vx < 0) P.x = b.x + b.w;
    else P.x = (P.x + P.w / 2 < b.x + b.w / 2) ? b.x - P.w : b.x + b.w;
    P.vx = 0;
  }
  // asse Y
  const py = P.y, was = P.ground; P.y += P.vy * dt; P.ground = false; let stand = null;
  for (const b of L.blocks) {
    if (!blockSolid(b) || !overlap(P, b)) continue;
    if (P.vy > 0) { P.y = b.y - P.h; if (P.g > 0) { P.ground = true; stand = b; } }
    else { P.y = b.y + b.h; if (P.g < 0) { P.ground = true; stand = b; } }
    P.vy = 0;
  }
  for (const p of L.plats) {
    if (!solid(p) || P.x + P.w <= p.x + 2 || P.x >= p.x + p.w - 2) continue;
    if (P.g > 0) { if (P.vy >= 0 && py + P.h <= p.y + 1 && P.y + P.h >= p.y) { P.y = p.y - P.h; P.vy = 0; P.ground = true; stand = p; } }
    else if (P.vy <= 0 && py >= p.y + p.h - 1 && P.y <= p.y + p.h) { P.y = p.y + p.h; P.vy = 0; P.ground = true; stand = p; }
  }
  if (P.ground) {
    P.coy = .1; P.air = 0;
    if (!was) {
      P.sx = 1.32; P.sy = .68; AU.sfx('land');
      puff(P.x + P.w / 2, P.g > 0 ? P.y + P.h : P.y, 6, { ang: -Math.PI / 2 * P.g, spread: 1.4, s0: 30, s1: 110, z0: 1.2, z1: 3, grav: 600 * P.g });
    }
    if (stand && stand !== P.standOn && stand.text !== undefined && !stand.tile) onLand(stand);
  }
  P.standOn = stand;

  // limiti del foglio
  if (L.fixed) P.x = clamp(P.x, 4, W - P.w - 4); else P.x = clamp(P.x, L.b.x0 + 20, L.b.x1 - 40);
  if (P.y > L.b.y1 + 80 || P.y < L.b.y0 - 80) { die(); return; }

  // macchie del Refuso
  if (P.born <= 0) {
    for (const s of L.stains) { if (s.layer && s.layer !== G.layer) continue; if (s.beat !== undefined && s.beat !== G.beatPh) continue; if (overlap(P, { x: s.x + 8, y: s.y + 5, w: s.w - 16, h: s.h })) { die(); return; } }
    for (const s of G.dyn) if (s.t > .95 && s.t < 2.7 && overlap(P, { x: s.x + 8, y: s.y + 5, w: s.w - 16, h: s.h })) { die(); return; }
  }

  if (inp.eraseP) { if (P.cd <= 0) erase(); else AU.sfx('nope'); }

  // animazione
  P.sx = lerp(P.sx, 1, Math.min(1, dt * 11)); P.sy = lerp(P.sy, 1, Math.min(1, dt * 11));
  const r0 = Math.floor(P.run / Math.PI); P.run += Math.abs(P.vx) * dt * .075;
  if (P.ground && Math.floor(P.run / Math.PI) !== r0) AU.sfx('step');
  P.blink -= dt; if (P.blink < -.12) P.blink = rnd(1.5, 4.5);
  P.trail.push({ x: P.x + P.w / 2, y: P.y + P.h / 2 }); if (P.trail.length > 14) P.trail.shift();
  if (P.ground && Math.abs(P.vx) > 200 && Math.random() < .25) puff(P.x + P.w / 2 - P.face * 8, P.g > 0 ? P.y + P.h : P.y, 1, { s0: 5, s1: 40, z0: 1, z1: 2.6, grav: 200 * P.g });
  if (P.idle > 1.2 && Math.random() < .012) puff(P.x + P.w / 2 + rnd(-6, 6), P.y + P.h / 2, 1, { s0: 0, s1: 8, z0: 1.4, z1: 2.4, grav: 500 * P.g, l0: .5, l1: .9 });
}

function onLand(p) {
  if (p.say && !p.said) { p.said = true; say(p.say); }
  if (p.glitch && !p.glitched) { p.glitched = true; p.glitchT = .45; }
  if (p.kind === 'rewind' && p.rw <= 0 && p.gone <= 0) p.rw = .6;
  if (p.tempo) G.beatPeriod = p.tempo;
}

/* ---------------- lo sbianchetto ---------------- */
function erase() {
  const L = G.L, cx = P.x + P.w / 2, cy = P.y + P.h / 2;
  if (L.mirror) {
    const nl = G.layer === 1 ? 2 : 1;
    for (const b of L.blocks) if (b.layer === nl && overlap(P, b)) { AU.sfx('nope'); return; }
    G.layer = nl; G.flash = .4; P.cd = .32; AU.sfx('flip');
    G.rings.push({ x: cx, y: cy, t: 0, big: true });
    return;
  }
  P.cd = L.boss ? 1.0 : 1.7;
  AU.sfx('erase'); G.rings.push({ x: cx, y: cy, t: 0 });
  puff(cx, cy, 26, { s0: 80, s1: 320, z0: 2, z1: 5, col: '#fffaf0', grav: 100, l0: .3, l1: .7, drag: 2 });
  for (const b of L.blocks) {
    if (!b.corrupt) continue;
    const nx = clamp(cx, b.x, b.x + b.w), ny = clamp(cy, b.y, b.y + b.h);
    if (Math.hypot(cx - nx, cy - ny) < 200) { b.off = 3; puff(b.x + b.w / 2, ny, 24, { jy: 90, jx: 14, s0: 20, s1: 160, col: '#fffaf0', grav: 60 }); }
  }
  for (const b of L.bugs) if (!b.dead && Math.hypot(cx - b.x, cy - (b.y + 11)) < 175) killBug(b);
  for (const p of L.plats) if (p.kind === 'flee' && onScreen(p, 0)) { p.frz = 3.6; p.fleeing = false; }
  G.proj = G.proj.filter(q => { if (Math.hypot(cx - q.x, cy - q.y) < 185) { puff(q.x, q.y, 10, { col: '#fffaf0', grav: 0, s0: 20, s1: 120 }); return false; } return true; });
  if (G.boss) bossErase(cx, cy);
}
function killBug(b) {
  b.dead = .001; G.fly.push({ text: b.good, x: b.x, y: b.y + 8, t: 0, kind: 'fix' });
  puff(b.x, b.y + 10, 14, { s0: 30, s1: 160, col: VIOLET });
}

function updBugs(dt) {
  const L = G.L;
  for (const b of L.bugs) {
    if (b.dead) { b.dead += dt; continue; }
    b.t += dt; b.x += b.vx * dt;
    if (b.x - b.w / 2 < b.minX) { b.x = b.minX + b.w / 2; b.vx = Math.abs(b.vx); }
    if (b.x + b.w / 2 > b.maxX) { b.x = b.maxX - b.w / 2; b.vx = -Math.abs(b.vx); }
    if (P.dead > 0 || P.born > 0) continue;
    if (overlap(P, { x: b.x - b.w / 2 + 4, y: b.y + 3, w: b.w - 8, h: b.h - 3 })) {
      if (P.vy > 30 && P.y + P.h < b.y + 16) { killBug(b); P.vy = -440; P.air = 0; P.cut = true; AU.sfx('stomp'); P.sx = 1.25; P.sy = .75; }
      else die();
    }
  }
}

function updItems(dt) {
  const L = G.L, cx = P.x + P.w / 2, cy = P.y + P.h / 2;
  if (P.dead > 0) return;
  for (const m of L.marks) if (!m.got && Math.hypot(cx - m.x, cy - m.y) < 30) {
    m.got = true; G.stats.marks++; AU.sfx('mark');
    const N = NOTES[G.li] || [], n = L.marks.filter(q => q.got).length - 1; if (N.length) G.note = { text: N[n % N.length], t: 0 };
    puff(m.x, m.y, 14, { s0: 30, s1: 150, col: GRAPHITE, grav: 0, drag: 3, l0: .4, l1: .9 });
  }
  for (const c of L.candles) {
    if (c.cd > 0) { c.cd -= dt; continue; }
    if (Math.hypot(cx - c.x, cy - c.y) < 34) { P.light = 7.5; c.cd = 8.6; AU.sfx('candle'); puff(c.x, c.y - 10, 12, { s0: 20, s1: 100, col: '#ffcf7a', grav: -120, l0: .4, l1: .9 }); }
  }
  for (const c of L.checks) if (!c.got && Math.abs(cx - c.x) < 30 && Math.abs((c.inv ? P.y : P.y + P.h) - c.y) < 46) {
    c.got = true; G.cp = { x: c.x, y: c.y, inv: c.inv, layer: G.layer }; AU.sfx('check');
    puff(c.x, c.y + (c.inv ? 30 : -30), 16, { s0: 20, s1: 120, col: GRAPHITE, grav: -80, l0: .5, l1: 1 });
  }
  if (L.exit && overlap(P, L.exit) && !G.turn) nextLevel();
}

function updChase(dt) {
  if (!G.chaseOn) { if (P.x > 640) { G.chaseOn = true; } return; }
  if (P.dead > 0) return;
  const fast = G.L.fast && P.x > G.L.fast;
  if (fast && !G.L.fastSaid) { G.L.fastSaid = true; say('Ha sentito il mio nome. Ora corre.'); }
  G.chaseX += (fast ? 160 : 142) * dt; G.chaseX = Math.max(G.chaseX, P.x - 730);
  if (P.x < G.chaseX + 4 && P.born <= 0) die();
  if (Math.random() < .5) puff(G.chaseX + rnd(-10, 14), G.cam.y + rnd(H), 1, { s0: 20, s1: 90, ang: 0, spread: 1, col: DEEP, grav: 0, z0: 2, z1: 5 });
}

/* ---------------- il boss: La pagina ---------------- */
function initBoss() { G.boss = { phase: 1, hp: 0, t: 0, shoot: 2.4, stainT: 3, hurt: 0, dead: 0, tgt: null, intro: 2.6, src: 0, said: 0 }; nextTarget(); }
function nextTarget() {
  const b = G.boss;
  if (b.hp >= BOSS_TARGETS.length) { b.tgt = null; return; }
  const T = BOSS_TARGETS[b.hp]; b.tgt = { bad: T[0], good: T[1], x: T[2], y: T[3], t: 0 };
  b.phase = Math.floor(b.hp / 3) + 1;
}
function bossSources() { return G.boss.phase < 3 ? [{ x: 480, y: 104 }] : [{ x: 150, y: 104 }, { x: 810, y: 104 }]; }
const BOSS_SAY = ['«Tu correggi. Io riscrivo.»', '«Anche il pavimento è una frase. E le frasi si cambiano.»', '«Ci ha scritti la stessa mano. Guardami: sono te, senza la gomma.»'];
function updBoss(dt) {
  const b = G.boss; b.t += dt; if (b.hurt > 0) b.hurt -= dt;
  if (b.dead) {
    b.dead += dt;
    if (Math.random() < .6) puff(rnd(300, 660), rnd(40, 300), 2, { col: pick([DEEP, VIOLET, '#fffaf0']), s0: 40, s1: 240, grav: 200 });
    if (b.dead > 3.4 && G.state === 'play') startEnding();
    return;
  }
  if (b.said < b.phase && b.intro < 1.6) { b.said = b.phase; say(BOSS_SAY[b.phase - 1]); }
  if (b.intro > 0) { b.intro -= dt; return; }
  if (P.dead > 0) return;
  if (b.tgt) b.tgt.t += dt;
  b.shoot -= dt;
  if (b.shoot <= 0) {
    const S = bossSources(), s = S[b.src++ % S.length];
    const dx = P.x + P.w / 2 - s.x, dy = P.y + P.h / 2 - s.y, d = Math.hypot(dx, dy) || 1, sp = b.phase === 1 ? 190 : 225;
    const text = pick(['erorre', 'sbalgio', 'refsuo', 'mahcia', 'buiga', 'slienzio', 'nesusno']);
    G.proj.push({ x: s.x, y: s.y, vx: dx / d * sp, vy: dy / d * sp, text, w: text.length * 9 + 6, t: 0 });
    AU.sfx('shoot'); b.shoot = [2.0, 1.7, 1.25][b.phase - 1];
  }
  if (b.phase >= 2) {
    b.stainT -= dt;
    if (b.stainT <= 0) {
      b.stainT = b.phase === 3 ? 2.2 : 2.8;
      const pl = P.standOn && P.standOn.text !== undefined ? P.standOn : G.L.plats[0];
      const x = clamp(P.x + P.w / 2 + P.vx * .3, pl.x + 45, pl.x + pl.w - 45);
      G.dyn.push({ x: x - 45, y: pl.y - 13, w: 90, h: 18, t: 0, seed: rnd(99) });
    }
  }
}
function bossErase(cx, cy) {
  const b = G.boss, t = b.tgt;
  if (!t || b.dead || Math.hypot(cx - t.x, cy - t.y) > 130) return;
  b.hp++; b.hurt = .9; G.shake = 14; AU.sfx('hit');
  G.fly.push({ text: t.good, x: t.x, y: t.y, t: 0, kind: 'restore' });
  puff(t.x, t.y, 30, { col: '#fffaf0', s0: 40, s1: 260, grav: 0, drag: 2 });
  const old = b.phase;
  if (b.hp >= BOSS_TARGETS.length) { b.tgt = null; b.dead = .001; G.proj = []; G.dyn = []; AU.sfx('win'); G.flash = 1; return; }
  nextTarget();
  if (b.phase !== old) { G.proj = []; G.dyn = []; b.intro = 2; b.shoot = 1.4; b.stainT = 2.4; G.flash = .6; G.cp = { x: P.standOn && P.standOn.text !== undefined ? clamp(P.x + P.w / 2, 80, 880) : 110, y: P.standOn && P.standOn.text !== undefined ? P.standOn.y : 470, inv: false, layer: 1 }; }
}
function updProj(dt) {
  for (let i = G.proj.length - 1; i >= 0; i--) {
    const q = G.proj[i]; q.t += dt; q.x += q.vx * dt; q.y += q.vy * dt;
    if (q.t > 7 || q.x < -80 || q.x > W + 80 || q.y > H + 60 || q.y < -80) { G.proj.splice(i, 1); continue; }
    if (P.dead <= 0 && P.born <= 0 && overlap(P, { x: q.x - q.w / 2 + 4, y: q.y - 8, w: q.w - 8, h: 16 })) { die(); }
    if (Math.random() < .3) puff(q.x, q.y, 1, { s0: 0, s1: 20, col: VIOLET, grav: 0, z0: 1, z1: 3, l0: .2, l1: .5 });
  }
  for (let i = G.dyn.length - 1; i >= 0; i--) { G.dyn[i].t += dt; if (G.dyn[i].t > 2.9) G.dyn.splice(i, 1); }
}

/* ---------------- camera e ciclo ---------------- */
function camera(dt, snap) {
  const L = G.L;
  if (L.fixed) { G.cam.x = 0; G.cam.y = 0; return; }
  const tx = clamp(P.x + P.w / 2 - W / 2 + P.face * 70, L.b.x0, L.b.x1 - W);
  const ty = clamp(P.y + P.h / 2 - H * .56, L.b.y0, L.b.y1 - H);
  if (snap) { G.cam.x = tx; G.cam.y = ty; }
  else { G.cam.x += (tx - G.cam.x) * Math.min(1, dt * 4.2); G.cam.y += (ty - G.cam.y) * Math.min(1, dt * 3.6); }
}

function update(dt) {
  const L = G.L;
  G.t += dt; G.stats.time += dt; G.cardT += dt;
  if (L.beat) {
    G.beatAcc += dt / (G.beatPeriod / 2);
    const half = Math.floor(G.beatAcc);
    if (half !== G.lastHalf) { G.lastHalf = half; G.beatPh = half % 2; AU.heart(G.beatPh === 0); G.pulse = 1; }
  } else if (L.boss || L.theme === 'lies') {
    G.beatAcc += dt / (L.boss ? .5 : .95);
    const half = Math.floor(G.beatAcc);
    if (half !== G.lastHalf) { G.lastHalf = half; if (half % 2 === 0 || L.boss) AU.heart(half % 2 === 0); G.pulse = .6; }
  }
  G.pulse = Math.max(0, G.pulse - dt * 3);
  if (L.storm !== undefined && P.dead <= 0 && P.x > L.storm) { G.stormT -= dt; if (G.stormT <= 0) { G.stormT = 3.2; AU.rain(true); P.light = Math.max(P.light, .95); G.flash = .45; AU.sfx('thunder'); } }
  if (L.auto !== undefined && P.dead <= 0 && P.x > L.auto) {
    const was = G.autoT; G.autoT -= dt;
    if (was > .7 && G.autoT <= .7) AU.sfx('crack');
    if (G.autoT <= 0) { G.autoT = 2.7; const nl = G.layer === 1 ? 2 : 1; let blocked = false; for (const b of L.blocks) if (b.layer === nl && overlap(P, b)) blocked = true; if (!blocked) { G.layer = nl; G.flash = .3; AU.sfx('flip'); G.rings.push({ x: P.x + P.w / 2, y: P.y + P.h / 2, t: 0, big: true }); } }
  }
  updPlats(dt); updPlayer(dt); updBugs(dt); updItems(dt);
  if (L.chase) updChase(dt);
  if (G.boss) updBoss(dt);
  updProj(dt); updParts(dt); camera(dt);
  for (let i = G.rings.length - 1; i >= 0; i--) { G.rings[i].t += dt; if (G.rings[i].t > .6) G.rings.splice(i, 1); }
  for (let i = G.fly.length - 1; i >= 0; i--) { G.fly[i].t += dt; if (G.fly[i].t > 1.6) G.fly.splice(i, 1); }
  for (const p of L.plats) if (p.glitchT > 0) { p.glitchT -= dt; if (p.glitchT <= 0) { p.text = p.text.replace(p.glitch[0], p.glitch[1]); p.tw = 0; p.gl2 = 1; AU.sfx('whisper'); } }
  if (G.note) { G.note.t += dt; if (G.note.t > 5) G.note = null; }
  if (G.cap) { G.cap.t += dt; if (G.cap.t > G.cap.dur) G.cap = null; }
  G.shake = Math.max(0, G.shake - dt * 30); G.flash = Math.max(0, G.flash - dt * 1.6);
}
