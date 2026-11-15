/* ============================================================
   MARGINALIA — rendering del mondo
   ============================================================ */
const MONO = 'bold 17px "Courier New", Courier, "Liberation Mono", monospace';
function hintText(k) { return HINTS[k][IS_TOUCH ? 1 : 0]; }

function drawBackground(th, L) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, th.p0); g.addColorStop(1, th.p1);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const cx = G.cam.x, cy = G.cam.y, t = G.t;
  // righe del quaderno
  ctx.strokeStyle = 'rgba(110,80,45,.09)'; ctx.lineWidth = 1; ctx.beginPath();
  const oy = -((cy * .5) % 34 + 34) % 34;
  for (let y = oy; y < H; y += 34) { ctx.moveTo(0, y + .5); ctx.lineTo(W, y + .5); }
  ctx.stroke();
  const d = th.decor;
  if (d === 'arches') {
    const sp = 420, ox = -((cx * .3) % sp + sp) % sp, by = 70 - cy * .15;
    for (let x = ox - sp; x < W + sp; x += sp) {
      ctx.fillStyle = 'rgba(120,85,40,.075)'; ctx.strokeStyle = 'rgba(100,70,35,.13)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x + 90, by + 330); ctx.lineTo(x + 90, by + 110); ctx.quadraticCurveTo(x + 90, by, x + 170, by - 30);
      ctx.quadraticCurveTo(x + 250, by, x + 250, by + 110); ctx.lineTo(x + 250, by + 330); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + 170, by - 30); ctx.lineTo(x + 170, by + 330); ctx.moveTo(x + 90, by + 150); ctx.lineTo(x + 250, by + 150); ctx.stroke();
      ctx.fillStyle = 'rgba(90,60,30,.06)'; ctx.fillRect(x + 320, by - 60, 26, 600); ctx.fillRect(x + 310, by - 60, 46, 14);
    }
  } else if (d === 'shelves') {
    const sp = 60, ox = -((cx * .3) % sp + sp) % sp, base = Math.floor(cx * .3 / sp);
    for (let row = 0; row < 4; row++) {
      const y = 40 + row * 130 - cy * .15;
      ctx.fillStyle = 'rgba(90,60,30,.10)'; ctx.fillRect(0, y + 100, W, 7);
      for (let i = -1; i < W / sp + 2; i++) {
        const r = rng((base + i) * 31 + row * 977);
        let bx = ox + i * sp;
        for (let k = 0; k < 3; k++) { const bw = 10 + r() * 12, bh = 55 + r() * 42; ctx.fillStyle = 'rgba(' + (90 + r() * 50 | 0) + ',' + (60 + r() * 30 | 0) + ',35,' + (.07 + r() * .06) + ')'; ctx.fillRect(bx, y + 100 - bh, bw, bh); bx += bw + 2; }
      }
    }
  } else if (d === 'scribble') {
    ctx.strokeStyle = 'rgba(90,65,35,.10)'; ctx.lineWidth = 1.6;
    for (let k = 0; k < 5; k++) {
      ctx.beginPath(); const yy = 80 + k * 95 - cy * .1;
      for (let x = -20; x < W + 20; x += 8) { const u = (x + cx * (.2 + k * .05)) * .03; const y = yy + Math.sin(u * 1.7 + k) * 12 + Math.sin(u * 5.1 + t * (.6 + k * .2)) * 7; x === -20 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
      ctx.stroke();
    }
  } else if (d === 'beams') {
    const sp = 300, ox = -((cx * .35) % sp + sp) % sp;
    ctx.fillStyle = 'rgba(40,24,10,.16)';
    for (let x = ox - sp; x < W + sp; x += sp) { ctx.beginPath(); ctx.moveTo(x, -10); ctx.lineTo(x + 34, -10); ctx.lineTo(x + 130, H + 10); ctx.lineTo(x + 96, H + 10); ctx.closePath(); ctx.fill(); }
    // il cuore sotto la casa
    const prog = clamp((cx - L.b.x0) / Math.max(1, L.b.x1 - W - L.b.x0), 0, 1);
    const hx = W * .78, hy = H * .62, r = 60 + prog * 190 + G.pulse * 26;
    const hg = ctx.createRadialGradient(hx, hy, 6, hx, hy, r);
    hg.addColorStop(0, 'rgba(90,20,60,' + (.25 + prog * .4) + ')'); hg.addColorStop(.5, 'rgba(60,15,50,' + (.12 + prog * .2) + ')'); hg.addColorStop(1, 'rgba(40,10,40,0)');
    ctx.fillStyle = hg; ctx.fillRect(0, 0, W, H);
  } else if (d === 'glyphs') {
    ctx.font = '460px ' + SERIF; ctx.fillStyle = 'rgba(100,75,40,.06)'; ctx.textBaseline = 'alphabetic';
    const sp = 520, ox = -((cx * .18) % sp + sp) % sp, base = Math.floor(cx * .18 / sp), S = 'aRg&eQfy';
    for (let i = -1; i < 3; i++) ctx.fillText(S[(((base + i) % 8) + 8) % 8], ox + i * sp, 430);
  } else if (d === 'mirrors') {
    const sp = 360, ox = -((cx * .3) % sp + sp) % sp;
    for (let x = ox - sp; x < W + sp; x += sp) {
      ctx.strokeStyle = 'rgba(90,80,70,.2)'; ctx.lineWidth = 5; rr(x + 80, 50 - cy * .15, 170, 330, 80); ctx.stroke();
      ctx.fillStyle = G.layer === 2 ? 'rgba(70,60,110,.10)' : 'rgba(255,255,255,.16)'; ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + 110, 300 - cy * .15); ctx.lineTo(x + 200, 110 - cy * .15); ctx.moveTo(x + 130, 320 - cy * .15); ctx.lineTo(x + 170, 236 - cy * .15); ctx.stroke();
    }
    if (G.layer === 2) { ctx.fillStyle = 'rgba(50,40,90,.16)'; ctx.fillRect(0, 0, W, H); }
  }
  if (d === 'hills' || d === 'trees' || d === 'sky' || d === 'stars') {
    const night = (d === 'sky' && G.layer === 2) || th.dark;
    if (d === 'sky') { if (night) { ctx.fillStyle = 'rgba(30,34,80,.55)'; ctx.fillRect(0, 0, W, H); } }
    if (d === 'sky' || d === 'stars' || th.dark) { ctx.fillStyle = night || d === 'stars' ? 'rgba(255,250,220,.8)' : 'rgba(255,255,255,0)'; for (let i = 0; i < 40; i++) { const x = (i * 197.3 - cx * .05) % W, y = (i * 83.7) % 300; ctx.globalAlpha = .3 + .5 * Math.sin(t * 2 + i) ** 2; ctx.fillRect((x + W) % W, y, 2, 2); } ctx.globalAlpha = 1; }
    // sole o luna
    const sx = W * .78 - cx * .02, sy = 96;
    if (night || d === 'stars') { ctx.fillStyle = '#fff6cf'; ctx.beginPath(); ctx.arc(sx, sy, 36, 0, TAU); ctx.fill(); ctx.fillStyle = night && d === 'sky' ? '#3b3f7a' : th.p0; ctx.beginPath(); ctx.arc(sx + 15, sy - 8, 31, 0, TAU); ctx.fill(); }
    else { ctx.fillStyle = 'rgba(255,196,60,.35)'; ctx.beginPath(); ctx.arc(sx, sy, 60 + Math.sin(t * 2) * 4, 0, TAU); ctx.fill(); ctx.fillStyle = '#ffc93c'; ctx.beginPath(); ctx.arc(sx, sy, 38, 0, TAU); ctx.fill(); }
    // colline ad acquerello
    const cols = th.dark ? ['rgba(40,50,90,.5)', 'rgba(30,40,75,.6)', 'rgba(22,30,60,.7)'] : d === 'stars' ? ['rgba(200,170,230,.5)', 'rgba(170,150,220,.5)', 'rgba(150,135,205,.55)'] : ['rgba(170,210,130,.55)', 'rgba(130,190,110,.55)', 'rgba(100,165,95,.6)'];
    for (let k = 0; k < 3; k++) {
      ctx.fillStyle = cols[k]; ctx.beginPath(); ctx.moveTo(0, H);
      for (let x = 0; x <= W; x += 16) { const u = (x + cx * (.1 + k * .1)) * .004; ctx.lineTo(x, 330 + k * 55 + Math.sin(u * (1.3 + k * .5) + k * 2) * 46 + Math.sin(u * 3.1 + k) * 14 - cy * .1); }
      ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
    }
    if (d === 'trees') {
      const sp = 210, ox = -((cx * .4) % sp + sp) % sp, base = Math.floor(cx * .4 / sp);
      for (let i = -1; i < W / sp + 2; i++) {
        const r = rng((base + i) * 53 + 7), x = ox + i * sp + r() * 60, hgt = 250 + r() * 150, rad = 60 + r() * 40;
        ctx.fillStyle = th.dark ? 'rgba(20,24,50,.55)' : 'rgba(120,85,50,.35)'; ctx.fillRect(x - 9, H - hgt - cy * .2, 18, hgt + 40);
        ctx.fillStyle = th.dark ? 'rgba(24,36,60,.6)' : ['rgba(90,160,90,.4)', 'rgba(120,180,90,.4)', 'rgba(70,140,100,.4)'][(r() * 3) | 0];
        for (const q of [[0, 0, 1], [-.6, .5, .7], [.6, .4, .75]]) { ctx.beginPath(); ctx.arc(x + rad * q[0], H - hgt + rad * q[1] - cy * .2, rad * q[2], 0, TAU); ctx.fill(); }
      }
    }
  } else if (d === 'waves') {
    for (let k = 0; k < 5; k++) { ctx.strokeStyle = 'rgba(255,255,255,' + (.35 - k * .05) + ')'; ctx.lineWidth = 3; ctx.beginPath(); for (let x = -10; x <= W + 10; x += 10) { const y = 60 + k * 100 + Math.sin((x + cx * (.3 + k * .1)) * .02 + t * (1.2 + k * .2)) * 9; x === -10 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke(); }
    // tronchi sommersi e fondale
    const sp = 260, ox = -((cx * .5) % sp + sp) % sp;
    ctx.fillStyle = 'rgba(40,80,90,.3)'; for (let x = ox - sp; x < W + sp; x += sp) { ctx.fillRect(x + 40, 120, 22, 420); ctx.beginPath(); ctx.arc(x + 51, 110, 60, 0, TAU); ctx.fill(); }
  }
  if (d === 'manual' || d === 'office') {
    const sp = 480, ox = -((cx * .3) % sp + sp) % sp, base = Math.floor(cx * .3 / sp);
    for (let i = -1; i < 3; i++) {
      const x = ox + i * sp, r = rng((base + i) * 91 + 3);
      if (d === 'manual') { ctx.strokeStyle = 'rgba(63,127,140,.22)'; ctx.lineWidth = 2; ctx.setLineDash([6, 8]); ctx.beginPath(); ctx.arc(x + 200, 200 + r() * 120, 90 + r() * 60, 0, TAU); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = 'rgba(226,103,42,.16)'; ctx.beginPath(); ctx.arc(x + 200 + Math.cos(t * .3 + i) * 120, 240 + Math.sin(t * .3 + i) * 60, 22, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(63,127,140,.4)'; ctx.font = 'italic 13px ' + SERIF; ctx.fillText('fig. ' + (((base + i) % 9 + 9) % 9 + 1) + ' — non in scala', x + 120, 380); ctx.strokeStyle = 'rgba(226,103,42,.3)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + 330, 150); ctx.lineTo(x + 410, 150); ctx.lineTo(x + 400, 143); ctx.moveTo(x + 410, 150); ctx.lineTo(x + 400, 157); ctx.stroke(); }
      else { ctx.fillStyle = 'rgba(120,95,60,.14)'; ctx.fillRect(x + 60, 150, 300, 230); ctx.fillStyle = 'rgba(63,127,140,.18)'; ctx.fillRect(x + 80, 170, 260, 120); ctx.fillStyle = 'rgba(120,95,60,.3)'; ctx.fillRect(x + 50, 290, 320, 10); ctx.font = 'bold 15px ' + SERIF; ctx.fillStyle = 'rgba(120,95,60,.4)'; ctx.fillText('SPORTELLO ' + 'ABCDEFGH'[(((base + i) % 8) + 8) % 8], x + 150, 142); ctx.fillStyle = 'rgba(184,67,58,.25)'; ctx.fillRect(x + 380, 330, 70, 5); ctx.fillRect(x + 380, 300, 5, 80); ctx.fillRect(x + 445, 300, 5, 80); }
    }
  }
  if (d === 'space' || d === 'ship' || d === 'hull' || d === 'rocks' || d === 'hole') {
    ctx.fillStyle = '#fff'; for (let i = 0; i < 70; i++) { const x = ((i * 137.5 - cx * (.04 + (i % 3) * .03)) % W + W) % W, y = (i * 71.9) % H; ctx.globalAlpha = .25 + .6 * Math.sin(t * (1 + i % 3) + i) ** 2; ctx.fillRect(x, y, 1.5 + (i % 3) * .6, 1.5 + (i % 3) * .6); } ctx.globalAlpha = 1;
    if (d === 'ship') { const sp = 320, ox = -((cx * .5) % sp + sp) % sp; ctx.fillStyle = 'rgba(20,28,46,.82)'; ctx.fillRect(0, 0, W, H); for (let x = ox - sp; x < W + sp; x += sp) { ctx.fillStyle = 'rgba(90,110,150,.22)'; ctx.fillRect(x, 0, 10, H); ctx.fillRect(x, 60, sp, 6); ctx.fillRect(x, 470, sp, 6); ctx.fillStyle = '#070b18'; ctx.beginPath(); ctx.arc(x + 165, 250, 64, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(160,185,220,.5)'; ctx.lineWidth = 7; ctx.stroke(); ctx.fillStyle = '#fff'; for (let k = 0; k < 7; k++) { const a2 = k * 2.4 + x, rr2 = (k * 17) % 52; ctx.globalAlpha = .4 + .5 * Math.sin(t * 2 + k) ** 2; ctx.fillRect(x + 165 + Math.cos(a2) * rr2, 250 + Math.sin(a2) * rr2, 2, 2); } ctx.globalAlpha = 1; ctx.fillStyle = '#e2672a'; ctx.fillRect(x + 40, 100, 34, 8); ctx.fillStyle = '#3fbf8c'; ctx.fillRect(x + 80, 100, 14, 8); } }
    if (d === 'hull') { ctx.fillStyle = 'rgba(70,84,116,.55)'; ctx.fillRect(0, 430 - cy * .2, W, 200); const sp = 180, ox = -((cx * .6) % sp + sp) % sp; ctx.strokeStyle = 'rgba(20,26,44,.8)'; ctx.lineWidth = 3; for (let x = ox - sp; x < W + sp; x += sp) { ctx.strokeRect(x, 430 - cy * .2, sp, 120); ctx.fillStyle = 'rgba(226,103,42,.5)'; ctx.fillRect(x + 20, 446 - cy * .2, 40, 6); } }
    if (d === 'rocks') { const sp = 300, ox = -((cx * .3) % sp + sp) % sp, base = Math.floor(cx * .3 / sp); for (let i = -1; i < 5; i++) { const r = rng((base + i) * 71 + 9), x = ox + i * sp + r() * 120, y = 60 + r() * 400, rad = 20 + r() * 46; ctx.fillStyle = 'rgba(90,96,124,.4)'; blobPath(x, y + Math.sin(t * .4 + i) * 10, rad, rad * .8, 0, (base + i) * 3.1, .22); ctx.fill(); } }
    if (d === 'hole') { const hx = 90 - (cx - (L.b ? L.b.x0 : 0)) * .01, hy = 270; for (let k = 5; k >= 0; k--) { ctx.strokeStyle = 'rgba(' + (255 - k * 20) + ',' + (140 + k * 10) + ',80,' + (.5 - k * .07) + ')'; ctx.lineWidth = 10; ctx.beginPath(); ctx.ellipse(hx, hy, 150 + k * 46 + Math.sin(t * 2 + k) * 6, 46 + k * 16, -.25, 0, TAU); ctx.stroke(); } ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(hx, hy, 120, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(255,220,170,.7)'; ctx.lineWidth = 3; ctx.stroke(); ctx.strokeStyle = 'rgba(255,200,150,.25)'; ctx.lineWidth = 1.5; for (let i = 0; i < 16; i++) { const y = (i * 37 + 20) % H, x = W - ((t * 420 + i * 131) % (W + 200)); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 60, y + (hy - y) * -.04); ctx.stroke(); } }
    if (d !== 'space') { } else {
    const px3 = W * .72 - cx * .03, py3 = 150; ctx.fillStyle = '#e2672a'; ctx.beginPath(); ctx.arc(px3, py3, 54, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.arc(px3 + 16, py3 + 10, 54, 0, TAU); ctx.save(); ctx.beginPath(); ctx.arc(px3, py3, 54, 0, TAU); ctx.clip(); ctx.fillRect(px3 - 20, py3 - 60, 120, 140); ctx.restore(); ctx.strokeStyle = 'rgba(255,243,214,.7)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(px3, py3, 92, 18, -.3, 0, TAU); ctx.stroke(); }
  }
  if (th.noir && !th.man) {
    if (d === 'rain' || d === 'roof') {
      const sp = 340, ox = -((cx * .45 + (d === 'roof' ? t * 700 : 0)) % sp + sp) % sp;
      for (let x = ox - sp; x < W + sp; x += sp) { ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(x + 100, 70, 7, 480); ctx.fillRect(x + 100, 70, 46, 6); if (d === 'rain') { const g2 = ctx.createLinearGradient(0, 80, 0, 470); g2.addColorStop(0, 'rgba(255,230,160,.30)'); g2.addColorStop(1, 'rgba(255,230,160,0)'); ctx.fillStyle = g2; ctx.beginPath(); ctx.moveTo(x + 134, 78); ctx.lineTo(x + 152, 78); ctx.lineTo(x + 262, 470); ctx.lineTo(x + 24, 470); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#ffe9a8'; ctx.beginPath(); ctx.arc(x + 143, 80, 6, 0, TAU); ctx.fill(); } }
      ctx.strokeStyle = 'rgba(200,215,235,.28)'; ctx.lineWidth = 1.2; ctx.beginPath();
      for (let i = 0; i < 90; i++) { const x = ((i * 53.7 - cx * .3 - t * (d === 'roof' ? 900 : 180)) % (W + 80) + W + 80) % (W + 80) - 40, y = ((i * 97.1 + t * 760) % (H + 60)) - 30; ctx.moveTo(x, y); ctx.lineTo(x - (d === 'roof' ? 26 : 7), y + 22); }
      ctx.stroke();
    } else if (d === 'car') {
      const sp = 260, ox = -((cx * .5) % sp + sp) % sp;
      ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.fillRect(0, 300, W, 240); ctx.fillStyle = 'rgba(120,90,60,.25)'; ctx.fillRect(0, 296, W, 5);
      for (let x = ox - sp; x < W + sp; x += sp) { ctx.fillStyle = '#0c0f16'; rr(x + 40, 70, 180, 190, 14); ctx.fill(); ctx.strokeStyle = 'rgba(160,120,80,.5)'; ctx.lineWidth = 4; ctx.stroke(); ctx.save(); ctx.beginPath(); rr(x + 40, 70, 180, 190, 14); ctx.clip(); ctx.fillStyle = 'rgba(255,230,160,.5)'; for (let k = 0; k < 3; k++) { const lx = x + 40 + ((t * 420 + k * 170 + x) % 400) - 100; ctx.fillRect(lx, 90 + k * 50, 26, 5); } ctx.strokeStyle = 'rgba(200,215,235,.3)'; ctx.lineWidth = 1; ctx.beginPath(); for (let k = 0; k < 9; k++) { const rx = x + 50 + k * 20, ry = 70 + ((t * 300 + k * 47) % 190); ctx.moveTo(rx, ry); ctx.lineTo(rx - 8, ry + 14); } ctx.stroke(); ctx.restore(); }
    } else if (d === 'mind') {
      ctx.strokeStyle = 'rgba(40,60,110,.10)'; ctx.lineWidth = 1; ctx.beginPath(); const ox2 = -((cx * .3) % 60 + 60) % 60, oy2 = -((cy * .3) % 60 + 60) % 60; for (let x = ox2; x < W; x += 60) { ctx.moveTo(x, 0); ctx.lineTo(x, H); } for (let y = oy2; y < H; y += 60) { ctx.moveTo(0, y); ctx.lineTo(W, y); } ctx.stroke();
      ctx.strokeStyle = 'rgba(176,54,46,.35)'; ctx.fillStyle = 'rgba(176,54,46,.5)'; ctx.lineWidth = 1.4; let px2 = null, py2 = null; for (let i = 0; i < 9; i++) { const x = ((i * 173 - cx * .25) % (W + 100) + W + 100) % (W + 100) - 50, y = 70 + ((i * 131) % 380) + Math.sin(t + i) * 8; ctx.beginPath(); ctx.arc(x, y, 5, 0, TAU); ctx.fill(); if (px2 !== null && Math.abs(px2 - x) < 400) { ctx.beginPath(); ctx.moveTo(px2, py2); ctx.lineTo(x, y); ctx.stroke(); } px2 = x; py2 = y; }
    }
  }
  // pulviscolo
  ctx.fillStyle = 'rgba(255,248,225,.5)';
  for (let i = 0; i < 26; i++) {
    const x = ((i * 137.5 + t * (6 + i % 5) - cx * .5) % (W + 40) + W + 40) % (W + 40) - 20;
    const y = ((i * 71.3 + Math.sin(t * .4 + i) * 22 + t * (3 + i % 4) - cy * .5) % (H + 40) + H + 40) % (H + 40) - 20;
    ctx.globalAlpha = .15 + .2 * Math.sin(t + i * 2.1) ** 2; ctx.beginPath(); ctx.arc(x, y, 1 + (i % 3) * .5, 0, TAU); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawLineText(p, col, alpha, font) {
  ctx.font = font || F_LINE;
  if (!p.tw) p.tw = ctx.measureText(p.text).width || 1;
  const sx = Math.min(1.2, (p.w - 8) / p.tw);
  ctx.globalAlpha = alpha; ctx.fillStyle = col;
  ctx.save(); ctx.translate(p.x + 4, p.y + 18); ctx.scale(sx, 1); ctx.fillText(p.text, 0, 0); ctx.restore();
}
function drawPlat(p, L, litK) {
  if (!onScreen(p, 60)) return;
  const t = G.t;
  const fairy = THEMES[L.theme].fairy, TH = THEMES[L.theme], noir = TH.noir;
  let col = noir ? (TH.lightBg ? '#1b2130' : '#ece6d8') : TH.man ? '#1c4a55' : fairy ? '#2a2018' : INK, a = 1, font = noir ? MONO : (fairy || TH.man) ? '500 25px ' + SERIF : null, ox = 0, oy = 0, under = .22;
  if (THEMES[L.theme].dark && fairy) col = '#f4ecd6';
  if (p.layer) { if (p.layer === 2) { col = '#4a4660'; font = '500 24px ' + SERIF; } if (p.layer !== G.layer) { a = .17; under = .1; } }
  if (p.kind === 'fake') { a = 1 - litK * .68; }
  else if (p.kind === 'hidden') { if (litK <= 0) return; a = litK * .95; col = GRAPHITE; font = F_HAND; under = 0; }
  else if (p.kind === 'beat') {
    const on = beatOn(p);
    a = on ? 1 : .16; under = on ? .5 : .12; col = on ? '#3a1220' : INK;
    if (on) oy = -G.pulse * 4;
  } else if (p.kind === 'flee') {
    if (p.frz > 0) { col = '#5a7389'; ox = 0; if (p.frz < .8) ox = Math.sin(t * 40) * 1.5; }
    else if (p.fleeing) { ox = Math.sin(t * 60) * 1.5; oy = Math.sin(t * 47) * 1.5; }
    else oy = Math.sin(t * 3 + p.x0) * 1.2;
  } else if (p.kind === 'swap') {
    if (!p.fixed && p.omissis) { ctx.save(); ctx.translate(Math.sin(t * 30 + p.x0) * .8, 0); ctx.fillStyle = '#050608'; ctx.fillRect(p.x, p.y + 1, p.w, 19); ctx.fillStyle = '#d8433a'; ctx.fillRect(p.x, p.y + 20, p.w, 2); ctx.restore(); return; }
    if (!p.fixed) { col = '#6f9fc0'; a = .75; oy = Math.sin(t * 2.4 + p.x0) * 4; ox = Math.sin(t * 1.7 + p.x0) * 3; under = 0; font = 'italic 500 25px ' + SERIF; }
  } else if (p.kind === 'rhyme') {
    if (p.live <= 0) { a = .16; under = .08; } else { col = noir ? '#b0362e' : '#8a5a12'; if (p.live < 1.2) a = .45 + .5 * Math.sin(t * 22) ** 2; under = .5; }
  } else if (p.kind === 'coin') {
    const st = coinState(p), left = 1 - (G.coinAcc % 1), nx = (st + 1) % 3; const lab = [p.orig, 'un divano', 'una nuvola'][st];
    if (p.text !== lab) { p.text = lab; p.tw = 0; }
    if (st === 1) { col = '#ffb347'; ctx.fillStyle = '#c0592b'; rr(p.x, p.y, p.w, 22, 9); ctx.fill(); ctx.fillStyle = '#e2672a'; rr(p.x - 6, p.y - 10, 16, 32, 6); ctx.fill(); rr(p.x + p.w - 10, p.y - 10, 16, 32, 6); ctx.fill(); col = '#fff3d6'; under = 0; }
    else if (st === 2) { a = .3; under = 0; col = '#9fd0e6'; oy = Math.sin(t * 2 + p.x0) * 4; ctx.fillStyle = 'rgba(190,225,240,.25)'; ctx.beginPath(); ctx.ellipse(p.x + p.w / 2, p.y + 10, p.w / 2, 16, 0, 0, TAU); ctx.fill(); }
    if (left < .25) { ox = Math.sin(t * 50) * 2; ctx.fillStyle = nx === 2 ? '#d8433a' : '#ffb347'; ctx.beginPath(); ctx.arc(p.x + p.w / 2, p.y - 12, 4, 0, TAU); ctx.fill(); }
  } else if (p.kind === 'sway') {
    a = .9; under = 0; ctx.fillStyle = TH.man ? 'rgba(96,104,136,.9)' : 'rgba(0,0,0,.55)'; ctx.beginPath(); ctx.ellipse(p.x + p.w / 2, p.y + 11, p.w / 2 + 8, 13, 0, 0, TAU); ctx.fill();
  } else if (p.kind === 'ferry') {
    col = '#5b3413'; oy = Math.sin(t * 2.2 + p.x0) * 2; under = .5;
  } else if (p.kind === 'rewind') {
    if (p.gone > 0) { a = .12; ox = 40 * Math.min(1, (2.6 - p.gone) * 4); under = .06; }
    else if (p.rw > 0) { ox = Math.sin(t * 70) * 2; col = '#5a3a20'; }
  }
  ctx.save(); ctx.translate(ox, oy);
  ctx.textBaseline = 'alphabetic';
  drawLineText(p, col, a, font);
  if (p.kind === 'fake' && litK > 0) { ctx.globalAlpha = litK * .7; ctx.strokeStyle = GRAPHITE; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(p.x, p.y + 12); for (let x = p.x; x <= p.x + p.w; x += 14) ctx.lineTo(x, p.y + 11 + Math.sin(x * .3) * 2); ctx.stroke(); }
  if (under > 0) { ctx.globalAlpha = under * (a < .5 ? .6 : 1); ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.beginPath(); if (p.kind === 'beat' || (p.layer && p.layer !== G.layer)) ctx.setLineDash([4, 5]); ctx.moveTo(p.x, p.y + .5); ctx.lineTo(p.x + p.w, p.y + .5); ctx.stroke(); ctx.setLineDash([]); }
  if (p.kind === 'flee' && p.frz > 0) { ctx.globalAlpha = .8; ctx.strokeStyle = '#8fb0c8'; ctx.lineWidth = 1.5; ctx.beginPath(); for (let x = p.x + 6; x < p.x + p.w; x += 22) { ctx.moveTo(x, p.y + LH); ctx.lineTo(x + 2, p.y + LH + 7 + (x % 5)); } ctx.stroke(); }
  if (p.kind === 'flee' && p.fleeing) { ctx.globalAlpha = 1; ctx.fillStyle = INK; ctx.font = 'bold 20px ' + SERIF; ctx.fillText('!', p.x + p.w / 2, p.y - 8); }
  if (p.kind === 'ferry') { ctx.globalAlpha = .8; ctx.strokeStyle = '#5b3413'; ctx.lineWidth = 1.6; ctx.beginPath(); for (let i = 0; i < 3; i++) { const lx = p.x + p.w * (.25 + i * .25), sw = p.moving ? Math.sin(t * 14 + i * 2) * 5 : 0; ctx.moveTo(lx, p.y + LH + 2); ctx.lineTo(lx + sw, p.y + LH + 11); } ctx.stroke(); }
  if (p.kind === 'swap' && !p.fixed) { ctx.globalAlpha = .7; ctx.strokeStyle = '#6f9fc0'; ctx.lineWidth = 1.5; ctx.setLineDash([2, 6]); ctx.beginPath(); ctx.ellipse(p.x + p.w / 2, p.y + 10, p.w / 2 + 6, 17, 0, 0, TAU); ctx.stroke(); ctx.setLineDash([]); }
  if (p.gl2) { ctx.globalAlpha = .9; ctx.fillStyle = VIOLET; ctx.beginPath(); ctx.arc(p.x + p.w - 18, p.y + 20, 2 + Math.sin(t * 5) * .8, 0, TAU); ctx.fill(); }
  ctx.restore(); ctx.globalAlpha = 1;
}

function drawStain(s, ghost) {
  const t = G.t, cx = s.x + s.w / 2, cy = s.y + s.h / 2 + 2;
  ctx.globalAlpha = ghost ? .13 : 1;
  ctx.fillStyle = DEEP; blobPath(cx, cy, s.w / 2, s.h / 2 + 3, t, s.x * .01, .14); ctx.fill();
  if (!ghost && THEMES[G.L.theme].noir && !THEMES[G.L.theme].lightBg) { ctx.strokeStyle = '#b98cff'; ctx.lineWidth = 2; ctx.stroke(); }
  if (!ghost) {
    const g = ctx.createRadialGradient(cx - s.w * .15, cy - 3, 1, cx, cy, s.w * .5);
    g.addColorStop(0, 'rgba(110,60,170,.55)'); g.addColorStop(1, 'rgba(60,30,100,0)');
    ctx.fillStyle = g; blobPath(cx, cy, s.w / 2 - 4, s.h / 2, t, s.x * .01, .14); ctx.fill();
    ctx.fillStyle = DEEP;
    for (let i = 0; i < 3; i++) { const dx = s.x + s.w * (.2 + i * .3), k = (t * .5 + i * .37) % 1; ctx.beginPath(); ctx.ellipse(dx, s.y + s.h + k * 22, 2.4 * (1 - k * .5), 4 * (1 - k * .3), 0, 0, TAU); ctx.fill(); }
    // bolle
    ctx.fillStyle = 'rgba(120,70,180,.5)';
    for (let i = 0; i < 2; i++) { const k = (t * .8 + i * .5 + s.x * .1) % 1; ctx.beginPath(); ctx.arc(s.x + s.w * (.3 + i * .35), s.y + 6 - k * 10, 2.2 * (1 - k), 0, TAU); ctx.fill(); }
  }
  ctx.globalAlpha = 1;
}

function drawWall(b) {
  if (!onScreen(b, 40)) return;
  const t = G.t, ghost = b.off > 0 || (b.layer && b.layer !== G.layer);
  if (ghost) {
    ctx.globalAlpha = .22; ctx.strokeStyle = VIOLET; ctx.setLineDash([5, 6]); ctx.lineWidth = 1.5; ctx.strokeRect(b.x, b.y, b.w, b.h); ctx.setLineDash([]); ctx.globalAlpha = 1; return;
  }
  const g = ctx.createLinearGradient(b.x, 0, b.x + b.w, 0);
  g.addColorStop(0, 'rgba(10,5,18,.0)'); g.addColorStop(.25, 'rgba(10,5,18,.88)'); g.addColorStop(.75, 'rgba(10,5,18,.88)'); g.addColorStop(1, 'rgba(10,5,18,0)');
  ctx.fillStyle = g; ctx.fillRect(b.x - 10, b.y, b.w + 20, b.h);
  ctx.fillStyle = DEEP;
  for (let i = 0; i < 9; i++) { const yy = b.y + i * b.h / 9 + 16; blobPath(b.x + b.w / 2 + Math.sin(t * 1.3 + i) * 3, yy, 20 + Math.sin(i * 2.1) * 4, 22, t * 1.4, i, .2); ctx.fill(); }
  ctx.font = 'bold 19px ' + SERIF; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const s = b.text;
  for (let i = 0; i < 13; i++) {
    const ch = s[(i + ((t * 1.5) | 0)) % s.length];
    ctx.fillStyle = i % 3 ? 'rgba(170,120,230,.85)' : 'rgba(240,225,255,.9)';
    ctx.save(); ctx.translate(b.x + b.w / 2 + Math.sin(t * 6 + i * 1.7) * 3, b.y + 14 + i * 22.5 + Math.cos(t * 5 + i) * 2); ctx.rotate(Math.sin(t * 2 + i * 3) * .35); ctx.fillText(ch, 0, 0); ctx.restore();
  }
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
}

function drawTiles(L) {
  ctx.fillStyle = INK;
  for (const b of L.blocks) if (b.tile && onScreen(b, 10)) ctx.fillRect(b.x - .5, b.y - .5, b.w + 1, b.h + 1);
  ctx.fillStyle = 'rgba(255,240,210,.07)';
  for (const b of L.blocks) if (b.tile && onScreen(b, 10)) ctx.fillRect(b.x + 3, b.y + 3, b.w - 6, 4);
}

function drawBug(b) {
  const t = G.t;
  if (b.dead) return;
  ctx.font = 'bold 19px ' + SERIF; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
  const x0 = b.x - b.w / 2 + 5;
  const dk = THEMES[G.L.theme].noir && !THEMES[G.L.theme].lightBg;
  if (dk) { ctx.fillStyle = 'rgba(216,67,58,.28)'; rr(b.x - b.w / 2 - 4, b.y - 6, b.w + 8, 26, 10); ctx.fill(); ctx.strokeStyle = '#ff7b6e'; ctx.lineWidth = 1.5; ctx.stroke(); }
  ctx.strokeStyle = dk ? '#ff7b6e' : DEEP; ctx.lineWidth = 1.6; ctx.beginPath();
  for (let i = 0; i < 4; i++) { const lx = x0 + 6 + i * (b.w - 22) / 3, sw = Math.sin(t * 16 + i * 1.8) * 4; ctx.moveTo(lx, b.y + 14); ctx.lineTo(lx + sw, b.y + 22); }
  ctx.stroke();
  let x = x0;
  for (let i = 0; i < b.bad.length; i++) {
    const ch = b.bad[i], w = ctx.measureText(ch).width;
    ctx.fillStyle = dk ? (i % 2 ? '#ffd9d2' : '#ff9a8f') : (i % 2 ? '#2a1244' : DEEP);
    ctx.save(); ctx.translate(x, b.y + 15 + Math.sin(t * 9 + i * 1.3) * 2.2); ctx.rotate(Math.sin(t * 7 + i * 2) * .13); ctx.fillText(ch, 0, 0); ctx.restore();
    x += w * Math.min(1, (b.w - 10) / (b.bad.length * 9.6));
  }
}

function drawPostilla() {
  const t = G.t;
  if (P.dead > 0) return;
  const x = P.x + P.w / 2, y = P.g > 0 ? P.y + P.h : P.y;
  // scia d'inchiostro
  const sp = Math.hypot(P.vx, P.vy);
  if (sp > 180) {
    ctx.fillStyle = INK;
    for (let i = 0; i < P.trail.length - 2; i += 2) { const q = P.trail[i], k = i / P.trail.length; ctx.globalAlpha = k * .28; ctx.beginPath(); ctx.arc(q.x, q.y - 4 * P.g, 3 + k * 6, 0, TAU); ctx.fill(); }
    ctx.globalAlpha = 1;
  }
  const born = P.born > 0 ? easeOut(1 - P.born / .6) : 1;
  const nd = G.state === 'play' && G.L && THEMES[G.L.theme].noir && !THEMES[G.L.theme].lightBg;
  if (nd && !P.hidden) { const hg = ctx.createRadialGradient(x, y - 22, 4, x, y - 22, 46); hg.addColorStop(0, 'rgba(236,230,216,.34)'); hg.addColorStop(1, 'rgba(236,230,216,0)'); ctx.fillStyle = hg; ctx.fillRect(x - 50, y - 70, 100, 100); }
  ctx.save(); ctx.translate(x, y); if (P.hidden && G.state === 'play') ctx.globalAlpha = .45; ctx.scale(P.face * P.sx * born, P.g * P.sy * born);
  const moving = Math.abs(P.vx) > 20, vyn = P.vy * P.g;
  ctx.strokeStyle = INK; ctx.lineWidth = 3.4; ctx.lineCap = 'round';
  ctx.beginPath();
  if (P.ground) { const sw = moving ? Math.sin(P.run) * 7 : 0; ctx.moveTo(-4, -9); ctx.lineTo(-4 + sw, -.5); ctx.moveTo(4, -9); ctx.lineTo(4 - sw, -.5); }
  else if (vyn < 0) { ctx.moveTo(-4, -9); ctx.lineTo(-7, 1); ctx.moveTo(4, -9); ctx.lineTo(2, 2); }
  else { ctx.moveTo(-4, -9); ctx.lineTo(-8, -3); ctx.moveTo(4, -9); ctx.lineTo(8, -3); }
  ctx.stroke();
  const bob = P.ground && !moving ? Math.sin(t * 2.6) * 1.2 : P.ground ? Math.abs(Math.sin(P.run)) * 2 : 0;
  const lean = clamp(-Math.abs(P.vx) / RUN * 6, -6, 0), tipx = lean - 1, tipy = -45 - bob + clamp(vyn * .012, -5, 6);
  ctx.fillStyle = INK; ctx.beginPath(); ctx.moveTo(tipx, tipy);
  ctx.bezierCurveTo(8, -38 - bob, 13.5, -29 - bob, 12.5, -19 - bob);
  ctx.bezierCurveTo(12, -9, 6, -6.5, 0, -6.5);
  ctx.bezierCurveTo(-7, -6.5, -12.5, -10, -12.5, -19 - bob);
  ctx.bezierCurveTo(-12.5, -29 - bob, -6, -36 - bob, tipx, tipy); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.14)'; ctx.beginPath(); ctx.ellipse(-6, -25 - bob, 2.2, 5.5, -.35, 0, TAU); ctx.fill();
  if (P.blink > 0) { ctx.fillStyle = '#f7efdb'; ctx.beginPath(); ctx.ellipse(2.5, -21 - bob, 2.7, 3.6, 0, 0, TAU); ctx.ellipse(9, -21 - bob, 2.2, 3.3, 0, 0, TAU); ctx.fill(); ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(3.4, -20.6 - bob, 1.1, 0, TAU); ctx.arc(9.7, -20.6 - bob, 1, 0, TAU); ctx.fill(); }
  else { ctx.strokeStyle = '#f7efdb'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(0, -21 - bob); ctx.lineTo(5, -21 - bob); ctx.moveTo(7, -21 - bob); ctx.lineTo(11, -21 - bob); ctx.stroke(); }
  // il segno di matita
  const by = tipy - 8 + Math.sin(t * 3.2) * 1.6;
  ctx.strokeStyle = GRAPHITE; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(tipx - 8, by + 2); ctx.quadraticCurveTo(tipx - 4, by - 7, tipx, by); ctx.quadraticCurveTo(tipx + 4, by + 6, tipx + 9, by - 3); ctx.stroke();
  // ricarica dello sbianchetto: alone bianco quando è pronto
  ctx.restore();
}

function brinaPos() { const b = G.br; return b ? { x: b.x, y: b.y, face: b.face } : null; }
/* Brina: segue Postilla con mezzo secondo di ritardo. Lanterna e trecce sono pendoli a molla. */
function updBrina(dt) {
  const L = G.L; if (!L.brina) { G.br = null; return; }
  const h = G.hist; let tx, ty, tf;
  if (h.length >= 204) { const i = h.length - 204; tx = h[i]; ty = h[i + 1]; tf = h[i + 2]; } else { tx = P.x + P.w / 2; ty = P.y + P.h; tf = P.face; }
  tx -= tf * 40;
  if (!G.br) G.br = { x: tx, y: ty, vx: 0, vy: 0, face: tf, run: 0, lan: 0, lanV: 0, bd: 0, bdV: 0, sq: 1, blink: 2, idle: 0, air: false, look: 0, hop: 0 };
  const b = G.br, ox = b.x, oy = b.y;
  b.x += (tx - b.x) * Math.min(1, dt * 12); b.y += (ty - b.y) * Math.min(1, dt * 20);
  const nvx = (b.x - ox) / dt, nvy = (b.y - oy) / dt;
  b.vx += (nvx - b.vx) * Math.min(1, dt * 18); b.vy += (nvy - b.vy) * Math.min(1, dt * 18);
  if (Math.abs(b.vx) > 20) { b.face = b.vx > 0 ? 1 : -1; b.idle = 0; } else { b.idle += dt; if (b.idle > .5) b.face = P.x + P.w / 2 >= b.x ? 1 : -1; }
  const air = Math.abs(b.vy) > 70 || (L.water && h.length > 3 && !P.ground);
  if (b.air && !air) { b.sq = .72; if (!L.water) puff(b.x, b.y, 4, { ang: -Math.PI / 2, spread: 1.4, s0: 20, s1: 70, z0: 1, z1: 2.4, col: 'rgba(120,100,70,.5)' }); }
  b.air = air; b.sq += (1 - b.sq) * Math.min(1, dt * 9);
  b.run += Math.abs(b.vx) * dt * .085;
  const tgL = clamp(-b.vx * b.face * .0028 + b.vy * .0012, -1.1, 1.1), tgB = clamp(Math.abs(b.vx) * .0042 - b.vy * .0022, -.5, 1.9);
  b.lanV += ((tgL - b.lan) * 55 - b.lanV * 4.5) * dt; b.lan += b.lanV * dt;
  b.bdV += ((tgB - b.bd) * 46 - b.bdV * 6) * dt; b.bd += b.bdV * dt;
  b.blink -= dt; if (b.blink < -.13) b.blink = rnd(1.6, 4.2);
  b.look += ((clamp((P.y - b.y + 30) / 120, -1, 1)) - b.look) * Math.min(1, dt * 5);
  if (b.idle > 3 && !air) { b.hop += dt; if (b.hop > 5.5) b.hop = 0; } else b.hop = 0;
}
function drawBrina() {
  const b = G.br; if (!b) return;
  const t = G.t, L = G.L, wet = !!L.water, sp = Math.abs(b.vx), walking = sp > 25 && !b.air, up = b.air && b.vy < 0, down = b.air && b.vy >= 0;
  const scared = (L.wolves || []).some(w => (w.t % 4.8) >= 3.3 && b.x > w.x0 - 60 && b.x < w.x1 + 60) || (G.boss && G.boss.hurt > 0);
  const cyc = b.run, breathe = Math.sin(t * 2.4);
  const bob = walking ? Math.abs(Math.sin(cyc)) * 2.4 : b.air ? 0 : breathe * .8;
  const wave = b.hop > 4.2 && b.hop < 5.4; // ogni tanto saluta Postilla
  const skin = '#f7d9bc', skinD = '#e6c1a0', coat = '#f4c531', coatD = '#d9a31a', hair = '#70411f', hairD = '#59311a', boot = '#bb4439', ink = '#2a2018';
  ctx.save(); ctx.translate(b.x, b.y + (wet && b.air ? Math.sin(t * 3) * 2 : 0));
  if (!b.air && !wet) { ctx.fillStyle = 'rgba(40,30,20,.16)'; ctx.beginPath(); ctx.ellipse(0, 1.5, 14, 3.2, 0, 0, TAU); ctx.fill(); }
  ctx.scale(b.face * 1.24 * (2 - b.sq), 1.24 * b.sq);
  ctx.rotate(wet && b.air ? .55 : clamp(sp / 250, 0, 1) * .09 + (up ? -.06 : down ? .08 : 0));
  ctx.translate(0, -bob); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  // ---- gambe a due segmenti ----
  const leg = (hx, ph, back) => {
    let a, k;
    if (wet && b.air) { a = Math.sin(t * 8 + ph) * .65; k = .35 + Math.cos(t * 8 + ph) * .3; }
    else if (up) { a = back ? -.35 : .75; k = back ? .5 : 1.25; }
    else if (down) { a = back ? .3 : -.25; k = .25; }
    else if (walking) { a = Math.sin(cyc + ph) * .72; k = Math.max(0, -Math.cos(cyc + ph)) * 1.0; }
    else { a = (back ? -.06 : .06); k = 0; }
    const kx = hx + Math.sin(a) * 7.5, ky = -17 + Math.cos(a) * 7.5, fx = kx + Math.sin(a - k) * 8, fy = ky + Math.cos(a - k) * 8;
    ctx.strokeStyle = back ? skinD : skin; ctx.lineWidth = 3.3; ctx.beginPath(); ctx.moveTo(hx, -17); ctx.lineTo(kx, ky); ctx.lineTo(fx, fy); ctx.stroke();
    ctx.strokeStyle = back ? '#e9e2d0' : '#fffaf0'; ctx.lineWidth = 3.7; ctx.beginPath(); ctx.moveTo(lerp(kx, fx, .5), lerp(ky, fy, .5)); ctx.lineTo(fx, fy); ctx.stroke();
    ctx.strokeStyle = '#c9c2b0'; ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(lerp(kx, fx, .5) - 1.8, lerp(ky, fy, .5)); ctx.lineTo(lerp(kx, fx, .5) + 1.8, lerp(ky, fy, .5)); ctx.stroke();
    ctx.save(); ctx.translate(fx, fy); ctx.rotate(-(a - k) * .6); ctx.fillStyle = back ? '#963630' : boot; ctx.beginPath(); ctx.ellipse(2.2, .3, 4.8, 2.9, 0, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.ellipse(3.4, -.6, 1.4, .8, 0, 0, TAU); ctx.fill(); ctx.restore();
  };
  leg(-2.6, Math.PI, true); leg(2.4, 0, false);
  // ---- braccio dietro ----
  const arm = (sx, sy, a, k, back) => { const ex = sx + Math.sin(a) * 6.5, ey = sy + Math.cos(a) * 6.5, hx = ex + Math.sin(a - k) * 6, hy = ey + Math.cos(a - k) * 6; ctx.strokeStyle = back ? coatD : coat; ctx.lineWidth = 4.2; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.lineTo(hx, hy); ctx.stroke(); ctx.fillStyle = back ? skinD : skin; ctx.beginPath(); ctx.arc(hx, hy, 2.3, 0, TAU); ctx.fill(); return [hx, hy]; };
  if (wave) arm(-3, -33, -2.5 + Math.sin(t * 14) * .35, -.5, true);
  else if (scared) arm(-3, -33, 2.2, -1.9, true);
  else arm(-3, -33, up ? -2.3 : down ? -1.3 : walking ? -Math.sin(cyc) * .85 : .12 + breathe * .03, up ? -.4 : walking ? -.5 : -.15, true);
  // ---- mantellina ----
  const lift = down ? -5 : up ? 2 : 0, tr = clamp(sp / 250, 0, 1) * 4, f = Math.sin(t * 7 + b.x * .06) * (walking || b.air ? 1.8 : .5);
  ctx.fillStyle = coat; ctx.beginPath(); ctx.moveTo(-5.5, -37);
  ctx.quadraticCurveTo(-10, -28, -12 - tr, -16 + lift + f);
  ctx.quadraticCurveTo(-8 - tr * .5, -12.5 + lift - f, -4, -14 + lift * .6 + f * .6);
  ctx.quadraticCurveTo(0, -12 + lift * .5 - f, 4, -14 + lift * .6 + f * .5);
  ctx.quadraticCurveTo(8, -12.5 + lift - f * .6, 11, -16 + lift);
  ctx.quadraticCurveTo(9, -28, 5.5, -37); ctx.closePath(); ctx.fill();
  ctx.fillStyle = coatD; ctx.beginPath(); ctx.moveTo(-5.5, -37); ctx.quadraticCurveTo(-10, -28, -12 - tr, -16 + lift + f); ctx.quadraticCurveTo(-9 - tr * .5, -13 + lift, -6.5, -14.5 + lift * .7); ctx.quadraticCurveTo(-6, -27, -3, -37); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(120,80,10,.5)'; ctx.lineWidth = .9; ctx.beginPath(); ctx.moveTo(2.5, -35); ctx.lineTo(3.2, -15 + lift * .5); ctx.stroke();
  ctx.fillStyle = '#8a5a12'; for (const yy of [-31, -26, -21]) { ctx.beginPath(); ctx.arc(4.6, yy, .95, 0, TAU); ctx.fill(); }
  ctx.strokeStyle = 'rgba(120,80,10,.55)'; ctx.lineWidth = .9; ctx.beginPath(); ctx.moveTo(-3, -22); ctx.lineTo(.5, -22); ctx.lineTo(.3, -18.5); ctx.stroke();
  // sciarpa rossa
  ctx.fillStyle = '#c9483e'; ctx.beginPath(); ctx.ellipse(.5, -37, 6.4, 2.6, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#c9483e'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-4.5, -36.5); ctx.quadraticCurveTo(-9 - b.bd * 4, -34 + Math.sin(t * 6) * 1.2, -11 - b.bd * 7, -31 - b.bd * 3 + Math.sin(t * 7) * 1.5); ctx.stroke();
  // ---- trecce (dietro la testa) ----
  const braid = (ax, ay, ph) => { let x = ax, y = ay, a = b.bd * .9 + Math.sin(t * 2.6 + ph) * .06; for (let i = 0; i < 4; i++) { const r = 2.7 - i * .32; a += b.bd * .22 + Math.sin(t * 5 + i + ph) * .03 * (1 + sp / 100); x -= Math.sin(a) * 3.6; y += Math.cos(a) * 3.6; ctx.fillStyle = i % 2 ? hairD : hair; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); } ctx.fillStyle = '#c9483e'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 3.4, y - 2.4); ctx.lineTo(x - 3.4, y + 2.4); ctx.closePath(); ctx.moveTo(x, y); ctx.lineTo(x + 3.2, y - 2.2); ctx.lineTo(x + 3.2, y + 2.6); ctx.closePath(); ctx.fill(); };
  braid(-6.5, -45, 0);
  // ---- testa ----
  const hy = -46.5 + (walking ? Math.sin(cyc * 2) * .5 : breathe * .4), tilt = b.look * -.12 + (scared ? -.1 : 0);
  ctx.save(); ctx.translate(.8, hy); ctx.rotate(tilt);
  ctx.fillStyle = hair; ctx.beginPath(); ctx.arc(-1.2, -.6, 9.3, 0, TAU); ctx.fill();
  ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(.6, .4, 8.3, 0, TAU); ctx.fill();
  ctx.fillStyle = skinD; ctx.beginPath(); ctx.arc(-4.6, 1.4, 1.9, 0, TAU); ctx.fill();
  ctx.fillStyle = hair; ctx.beginPath(); ctx.moveTo(-8.6, .5); ctx.quadraticCurveTo(-9.5, -9.5, .5, -9.4); ctx.quadraticCurveTo(8.2, -9.2, 9, -2.4); ctx.quadraticCurveTo(5.5, -5.6, 2.4, -4.2); ctx.quadraticCurveTo(-.5, -6.4, -3.6, -3.2); ctx.quadraticCurveTo(-5.6, -1.6, -6.4, 3.4); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = hairD; ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(-.5, -9.2); ctx.quadraticCurveTo(-1.5, -6.5, -3.6, -3.4); ctx.stroke();
  ctx.fillStyle = 'rgba(235,120,110,.45)'; ctx.beginPath(); ctx.ellipse(5.2, 3.3, 2.5, 1.6, 0, 0, TAU); ctx.fill();
  const ey = .4 + b.look * 1.2;
  if (scared) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(4.4, ey, 2.5, 0, TAU); ctx.fill(); ctx.fillStyle = ink; ctx.beginPath(); ctx.arc(4.7, ey, 1.1, 0, TAU); ctx.fill(); }
  else if (b.blink > 0) { ctx.fillStyle = ink; ctx.beginPath(); ctx.ellipse(4.6, ey, 1.25, 1.9, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(5, ey - .7, .5, 0, TAU); ctx.fill(); }
  else { ctx.strokeStyle = ink; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(3.2, ey + .4); ctx.quadraticCurveTo(4.6, ey + 1.4, 6, ey + .4); ctx.stroke(); }
  ctx.strokeStyle = hairD; ctx.lineWidth = .9; ctx.beginPath(); ctx.moveTo(3, ey - 3.4 - (scared ? 1.2 : 0)); ctx.lineTo(6.2, ey - 3 - (scared ? 1.6 : 0)); ctx.stroke();
  ctx.fillStyle = skinD; ctx.beginPath(); ctx.arc(8.4, 2, 1, 0, TAU); ctx.fill();
  if (scared || up) { ctx.fillStyle = '#8a3a34'; ctx.beginPath(); ctx.ellipse(6.2, 5.3, 1.2, 1.6, 0, 0, TAU); ctx.fill(); }
  else { ctx.strokeStyle = '#8a3a34'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(4.4, 4.9); ctx.quadraticCurveTo(6, 6.3 + (wave ? .6 : 0), 7.4, 4.7); ctx.stroke(); }
  ctx.restore();
  braid(-3.6, -43.5, 1.7);
  // ---- braccio davanti e lanterna ----
  const hnd = arm(3.4, -33, up ? 1.7 : 1.05 + (walking ? Math.sin(cyc) * .12 : breathe * .02), up ? .5 : .35, false);
  ctx.save(); ctx.translate(hnd[0], hnd[1]); ctx.rotate(b.lan);
  const fl = 1 + Math.sin(t * 19) * .1 + Math.sin(t * 31) * .06;
  const g = ctx.createRadialGradient(0, 9, 1, 0, 9, 26 * fl); g.addColorStop(0, 'rgba(255,224,130,.85)'); g.addColorStop(.4, 'rgba(255,205,100,.28)'); g.addColorStop(1, 'rgba(255,205,100,0)');
  ctx.fillStyle = g; ctx.fillRect(-28, -19, 56, 56);
  ctx.strokeStyle = '#4a3521'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(0, 3.2, 3.2, Math.PI, TAU); ctx.stroke();
  ctx.fillStyle = '#4a3521'; ctx.beginPath(); ctx.moveTo(-4.6, 4.6); ctx.lineTo(0, 1.6); ctx.lineTo(4.6, 4.6); ctx.closePath(); ctx.fill(); rr(-4.2, 13.4, 8.4, 2.2, 1); ctx.fill();
  ctx.fillStyle = '#fff1bf'; ctx.fillRect(-3.4, 4.6, 6.8, 8.8);
  ctx.fillStyle = '#ffab2e'; ctx.beginPath(); ctx.ellipse(0, 10.2, 1.7 * fl, 3 * fl, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#fff6d6'; ctx.beginPath(); ctx.ellipse(0, 11, .8, 1.5, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#4a3521'; ctx.lineWidth = 1; ctx.strokeRect(-3.4, 4.6, 6.8, 8.8); ctx.beginPath(); ctx.moveTo(0, 4.6); ctx.lineTo(0, 6.5); ctx.stroke();
  ctx.restore();
  ctx.restore();
  if (Math.random() < .05) puff(b.x + b.face * 16, b.y - 30, 1, { s0: 2, s1: 14, grav: -40, col: 'rgba(255,214,120,.8)', z0: .8, z1: 1.8, l0: .5, l1: 1.1 });
}
function drawBossPage(cx, cy, w, h, from, to, big) {
  const b = G.boss, t = G.t;
  const sh = b.hurt > 0 ? Math.sin(t * 90) * 7 * b.hurt : 0, bob = Math.sin(t * 1.3 + cx) * 7;
  ctx.save(); ctx.translate(cx + sh, cy + bob); ctx.rotate(Math.sin(t * .7 + cx) * .035);
  if (b.dead) { ctx.globalAlpha = Math.max(0, 1 - b.dead / 3); }
  ctx.fillStyle = 'rgba(20,8,30,.35)'; ctx.fillRect(-w / 2 + 10, -h / 2 + 14, w, h);
  const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2); g.addColorStop(0, '#e9dcbb'); g.addColorStop(1, '#bca679');
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-w / 2, -h / 2);
  for (let x = -w / 2; x <= w / 2; x += 12) ctx.lineTo(x, -h / 2 + Math.sin(x * .4 + t) * 2);
  ctx.lineTo(w / 2, h / 2); for (let x = w / 2; x >= -w / 2; x -= 12) ctx.lineTo(x, h / 2 + Math.sin(x * .5 + t * 1.3) * 3); ctx.closePath(); ctx.fill();
  const n = to - from, lh = (h - 40) / 9;
  for (let i = 0; i < 9; i++) {
    const y = -h / 2 + 26 + i * lh, idx = big ? i : from + (i % n);
    const ok = big ? i < b.hp : idx < b.hp;
    if (ok) { ctx.strokeStyle = 'rgba(30,22,14,.75)'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-w / 2 + 16, y); ctx.lineTo(w / 2 - 16 - (i % 3) * 14, y); ctx.stroke(); }
    else { ctx.strokeStyle = i % 2 ? 'rgba(60,25,100,.9)' : 'rgba(8,4,14,.95)'; ctx.lineWidth = 2.6; ctx.beginPath(); for (let x = -w / 2 + 16; x <= w / 2 - 16; x += 7) { const yy = y + Math.sin(x * .45 + t * 7 + i * 2) * 3.5 + Math.sin(x * .13 - t * 3 + i) * 2; x === -w / 2 + 16 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy); } ctx.stroke(); }
  }
  // il volto: una macchia senza riflesso
  const fr = Math.min(w, h) * .27 * (b.hurt > 0 ? 1.15 : 1) + G.pulse * 4;
  ctx.fillStyle = DEEP; blobPath(0, -4, fr, fr * 1.08, t * 1.6, cx, .16); ctx.fill();
  const vg = ctx.createRadialGradient(-fr * .3, -fr * .4, 2, 0, 0, fr); vg.addColorStop(0, 'rgba(120,70,190,.55)'); vg.addColorStop(1, 'rgba(60,20,100,0)');
  ctx.fillStyle = vg; blobPath(0, -4, fr * .9, fr, t * 1.6, cx, .16); ctx.fill();
  const ex = clamp((P.x - cx) / 90, -1, 1) * 5, ey = clamp((P.y - cy) / 90, -1, 1) * 4;
  ctx.fillStyle = b.hurt > 0 ? '#fff' : '#e9dcbb';
  ctx.beginPath(); ctx.ellipse(-fr * .36 + ex, -10 + ey, fr * .13, fr * (b.hurt > 0 ? .05 : .2), 0, 0, TAU); ctx.ellipse(fr * .36 + ex, -10 + ey, fr * .13, fr * (b.hurt > 0 ? .05 : .2), 0, 0, TAU); ctx.fill();
  ctx.restore(); ctx.globalAlpha = 1;
}

function drawMargine() {
  const b = G.boss, t = G.t, x = 480, y = 270 + Math.sin(t * 1.2) * 6, hurt = b.hurt > 0 ? Math.sin(t * 80) * 6 * b.hurt : 0;
  ctx.save(); ctx.translate(x + hurt, y); if (b.dead) ctx.globalAlpha = Math.max(0, 1 - b.dead / 3);
  ctx.strokeStyle = 'rgba(160,185,220,.35)'; ctx.lineWidth = 2; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc(0, 0, 86 + k * 16 + Math.sin(t * 2 + k) * 3, 0, TAU); ctx.stroke(); }
  ctx.fillStyle = '#0d1424'; ctx.beginPath(); ctx.arc(0, 0, 78, 0, TAU); ctx.fill(); ctx.strokeStyle = '#8fa6c8'; ctx.lineWidth = 6; ctx.stroke();
  const g = ctx.createRadialGradient(0, 0, 4, 0, 0, 52); const col = b.phase === 3 ? '255,90,60' : b.phase === 2 ? '255,170,60' : '255,120,60';
  g.addColorStop(0, 'rgba(255,240,210,1)'); g.addColorStop(.25, 'rgba(' + col + ',1)'); g.addColorStop(1, 'rgba(' + col + ',0)');
  const ex = clamp((P.x - x) / 60, -1, 1) * 14, ey = clamp((P.y - y) / 60, -1, 1) * 14, pr = 1 + G.pulse * .2 + (b.hurt > 0 ? .4 : 0);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(ex, ey, 52 * pr, 0, TAU); ctx.fill();
  ctx.fillStyle = '#fff6e0'; ctx.beginPath(); ctx.arc(ex, ey, 9, 0, TAU); ctx.fill();
  ctx.fillStyle = '#8fa6c8'; ctx.font = 'bold 13px "Courier New", monospace'; ctx.textAlign = 'center'; ctx.fillText('MARGINE', 0, 104);
  ctx.fillStyle = '#e2672a'; ctx.fillText(G.gflip ? '▲ GRAVITÀ ▲' : '▼ GRAVITÀ ▼', 0, -94);
  ctx.restore(); ctx.textAlign = 'left';
}
function drawBoss() {
  const b = G.boss, t = G.t;
  const M = G.L.bossMode;
  if (M === 'grav') drawMargine();
  else if (b.phase < 3) drawBossPage(480, 104, 230, 180, 0, 9, true);
  else { drawBossPage(150, 104, 185, 170, 0, 9, true); drawBossPage(810, 104, 185, 170, 0, 9, true); }
  const tg = b.tgt;
  if (tg && b.intro <= .8 && !b.dead) {
    const near = Math.hypot(P.x + P.w / 2 - tg.x, P.y + P.h / 2 - tg.y) < 130;
    const a = Math.min(1, tg.t * 2 + .01) * (M === 'beat' && G.beatPh !== 0 ? .3 : 1);
    ctx.globalAlpha = a * (near ? .9 : .5); ctx.strokeStyle = near ? '#fffaf0' : VIOLET; ctx.lineWidth = near ? 2.5 : 1.5; ctx.setLineDash([6, 7]); ctx.lineDashOffset = -t * 30;
    ctx.beginPath(); ctx.arc(tg.x, tg.y, 62 + Math.sin(t * 4) * 4, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    ctx.font = 'bold 19px ' + SERIF; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    const w = ctx.measureText(tg.bad).width; let x = tg.x - w / 2;
    ctx.globalAlpha = a; ctx.fillStyle = 'rgba(12,6,20,.82)'; rr(x - 10, tg.y - 20, w + 20, 32, 8); ctx.fill();
    for (let i = 0; i < tg.bad.length; i++) { const ch = tg.bad[i]; ctx.fillStyle = i % 3 ? '#c9a2ff' : '#fff2ff'; ctx.fillText(ch, x, tg.y + 2 + Math.sin(t * 8 + i) * 1.8); x += ctx.measureText(ch).width; }
    ctx.globalAlpha = 1;
    if (M === 'beat') { ctx.font = 'italic 15px ' + SERIF; ctx.textAlign = 'center'; ctx.fillStyle = G.beatPh === 0 ? '#fffaf0' : 'rgba(255,250,240,.45)'; ctx.fillText(G.beatPh === 0 ? 'ora!' : 'aspetta il battito', tg.x, tg.y + 34); ctx.textAlign = 'left'; }
  }
  if (G.clue && !G.clue.got && b.intro <= .8 && !b.dead) {
    const c = G.clue, y = c.y + Math.sin(t * 3) * 4; ctx.save(); ctx.translate(c.x, y);
    const gl = ctx.createRadialGradient(0, 0, 2, 0, 0, 34); gl.addColorStop(0, 'rgba(216,67,58,.6)'); gl.addColorStop(1, 'rgba(216,67,58,0)'); ctx.fillStyle = gl; ctx.fillRect(-36, -36, 72, 72);
    ctx.rotate(-.12); ctx.fillStyle = '#ece6d8'; ctx.fillRect(-15, -11, 30, 22); ctx.strokeStyle = '#d8433a'; ctx.lineWidth = 2; ctx.strokeRect(-15, -11, 30, 22); ctx.beginPath(); ctx.moveTo(-15, -11); ctx.lineTo(0, 2); ctx.lineTo(15, -11); ctx.stroke();
    ctx.rotate(.12); ctx.font = 'bold 13px "Courier New", monospace'; ctx.fillStyle = '#ece6d8'; ctx.textAlign = 'center'; ctx.fillText('PROVA: ' + c.name, 0, -24); ctx.restore(); ctx.textAlign = 'left';
  }
  if (P.clue && P.dead <= 0) { ctx.fillStyle = '#ece6d8'; ctx.fillRect(P.x + P.w / 2 - 9, P.y - 40, 18, 13); ctx.strokeStyle = '#d8433a'; ctx.lineWidth = 1.5; ctx.strokeRect(P.x + P.w / 2 - 9, P.y - 40, 18, 13); }
}

function drawWorld() {
  const L = G.L, th = THEMES[L.theme], t = G.t;
  const litK = th.dark && L.theme === 'lies' ? clamp(P.light / .7, 0, 1) : 0;
  drawBackground(th, L);
  const shx = G.shake ? rnd(-G.shake, G.shake) * .5 : 0, shy = G.shake ? rnd(-G.shake, G.shake) * .5 : 0;
  ctx.save(); ctx.translate(Math.round((-G.cam.x + shx) * 2) / 2, Math.round((-G.cam.y + shy) * 2) / 2);

  // margine della pagina: da qui nasce Postilla
  if (!L.fixed) {
    const mx = L.reverse ? L.b.x1 - 250 : L.b.x0 + 200;
    ctx.strokeStyle = 'rgba(160,60,50,.35)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(mx, L.b.y0 - 200); ctx.lineTo(mx, L.b.y1 + 200); ctx.moveTo(mx + 5, L.b.y0 - 200); ctx.lineTo(mx + 5, L.b.y1 + 200); ctx.stroke();
  }
  // pagine capovolte
  for (const z of L.zones) {
    ctx.fillStyle = 'rgba(70,55,110,.10)'; ctx.fillRect(z.x, G.cam.y - 20, z.w, H + 40);
    ctx.strokeStyle = 'rgba(70,55,110,.35)'; ctx.setLineDash([3, 9]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(z.x, G.cam.y - 20); ctx.lineTo(z.x, G.cam.y + H + 20); ctx.moveTo(z.x + z.w, G.cam.y - 20); ctx.lineTo(z.x + z.w, G.cam.y + H + 20); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(70,55,110,.35)';
    for (let i = 0; i < 16; i++) { const x = z.x + ((i * 97.3) % z.w), y = G.cam.y + H - ((t * (40 + i * 5) + i * 53) % (H + 40)); ctx.fillRect(x, y, 1.5, 9); }
  }
  // note a matita
  // ombre e torce
  for (const sh of (L.shades || [])) { if (!onScreen(sh, 20)) continue; const g = ctx.createLinearGradient(sh.x, 0, sh.x + sh.w, 0); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(.2, 'rgba(0,0,0,.72)'); g.addColorStop(.8, 'rgba(0,0,0,.72)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(sh.x, sh.y - 170, sh.w, 172); ctx.fillStyle = 'rgba(20,14,10,.9)'; ctx.fillRect(sh.x + sh.w * .2, sh.y - 150, sh.w * .6, 8); ctx.fillRect(sh.x + sh.w * .25, sh.y - 142, 6, 142); ctx.fillRect(sh.x + sh.w * .75 - 6, sh.y - 142, 6, 142); }
  if (L.beams && (!L.boss || L.beamsOn)) for (const b of L.beams) { const bx = lerp(b.x0, b.x1, .5 + .5 * Math.sin(t * b.sp + b.ph)); if (bx < G.cam.x - 200 || bx > G.cam.x + W + 200) continue; const g = ctx.createLinearGradient(0, b.y - 330, 0, b.y); g.addColorStop(0, 'rgba(255,236,170,0)'); g.addColorStop(1, 'rgba(255,236,170,.42)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(bx - 14, b.y - 330); ctx.lineTo(bx + 14, b.y - 330); ctx.lineTo(bx + b.w / 2, b.y); ctx.lineTo(bx - b.w / 2, b.y); ctx.closePath(); ctx.fill(); ctx.fillStyle = 'rgba(255,240,190,.5)'; ctx.beginPath(); ctx.ellipse(bx, b.y + 2, b.w / 2, 6, 0, 0, TAU); ctx.fill(); }
  ctx.font = F_HAND; ctx.fillStyle = THEMES[L.theme].noir && !THEMES[L.theme].lightBg ? '#b9b2a2' : GRAPHITE; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  for (const h of L.hints) { if (!onScreen({ x: h.x, w: 300 })) continue; ctx.save(); ctx.translate(h.x, h.y); ctx.rotate(-.035); const s = hintText(h.k); ctx.globalAlpha = .9; ctx.fillText(s, 0, 0); const w = ctx.measureText(s).width; ctx.strokeStyle = GRAPHITE; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(0, 7); ctx.quadraticCurveTo(w * .5, 11, w, 6); ctx.stroke(); ctx.restore(); }
  ctx.globalAlpha = 1;

  // uscita: il bordo della pagina
  if (L.exit && onScreen(L.exit, 200)) {
    const e = L.exit, cx = e.x + e.w / 2;
    const gg = ctx.createRadialGradient(cx, e.y + 30, 4, cx, e.y + 30, 120); gg.addColorStop(0, 'rgba(255,236,170,.75)'); gg.addColorStop(1, 'rgba(255,236,170,0)');
    ctx.fillStyle = gg; ctx.fillRect(cx - 130, e.y - 100, 260, 260);
    ctx.strokeStyle = GRAPHITE; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(e.x, e.y + e.h); ctx.lineTo(e.x, e.y + 22); ctx.quadraticCurveTo(cx, e.y - 18, e.x + e.w, e.y + 22); ctx.lineTo(e.x + e.w, e.y + e.h); ctx.stroke();
    ctx.fillStyle = 'rgba(255,248,220,.75)'; ctx.fill();
    ctx.font = 'italic 22px ' + SERIF; ctx.fillStyle = GRAPHITE; ctx.textAlign = 'center'; ctx.fillText(L.reverse ? '←' : '→', cx + Math.sin(t * 4) * 3, e.y + 52); ctx.textAlign = 'left';
  }
  // capoversi (checkpoint)
  ctx.font = '26px ' + SERIF; ctx.textAlign = 'center';
  for (const c of L.checks) {
    if (!onScreen({ x: c.x - 20, w: 40 })) continue;
    const y = c.inv ? c.y + 34 : c.y - 12;
    if (c.got) { const gg = ctx.createRadialGradient(c.x, y - 8, 2, c.x, y - 8, 34); gg.addColorStop(0, 'rgba(255,230,150,.7)'); gg.addColorStop(1, 'rgba(255,230,150,0)'); ctx.fillStyle = gg; ctx.fillRect(c.x - 40, y - 50, 80, 80); }
    ctx.fillStyle = c.got ? (THEMES[L.theme].noir && !THEMES[L.theme].lightBg ? '#ece6d8' : INK) : 'rgba(125,120,114,.55)'; ctx.fillText('¶', c.x, y + (c.got ? Math.sin(t * 3) * 2 : 0));
  }
  ctx.textAlign = 'left';

  for (const pn of (L.planets || [])) { if (pn.x + pn.r < G.cam.x - 20 || pn.x - pn.r > G.cam.x + W + 20) continue; const g3 = ctx.createRadialGradient(pn.x - pn.r * .3, pn.y - pn.r * .4, pn.r * .1, pn.x, pn.y, pn.r); g3.addColorStop(0, pn.col); g3.addColorStop(1, 'rgba(10,12,28,.95)'); ctx.fillStyle = g3; ctx.beginPath(); ctx.arc(pn.x, pn.y, pn.r, 0, TAU); ctx.fill(); ctx.strokeStyle = pn.col; ctx.globalAlpha = .5; ctx.lineWidth = 2; ctx.stroke(); ctx.globalAlpha = .25; ctx.setLineDash([3, 7]); for (let k = 1; k <= (pn.m > 1.5 ? 3 : pn.m < .5 ? 1 : 2); k++) { ctx.beginPath(); ctx.arc(pn.x, pn.y, pn.r + k * 16 + Math.sin(t * 2 + k) * 2, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); } ctx.setLineDash([]); ctx.globalAlpha = 1; }
  for (const p of L.plats) if (p.flipG && onScreen(p, 40)) { ctx.fillStyle = '#e2672a'; rr(p.x, p.y - 2, p.w, 24, 6); ctx.fill(); ctx.fillStyle = 'rgba(255,243,214,.9)'; const up = G.gflip ? 1 : -1; for (let k = 0; k < 3; k++) { const ax = p.x + p.w * (.2 + k * .3), ay = p.y + (up < 0 ? -12 : 34) + Math.sin(t * 6 + k) * 3 * up; ctx.beginPath(); ctx.moveTo(ax - 7, ay); ctx.lineTo(ax + 7, ay); ctx.lineTo(ax, ay + 10 * up); ctx.closePath(); ctx.fill(); } }
  for (const p of L.plats) drawPlat(p, L, litK);
  drawTiles(L);
  for (const b of L.blocks) if (b.corrupt) drawWall(b);
  for (const b of L.blocks) if (b.twig && b.off <= 0 && onScreen(b, 40)) {
    ctx.strokeStyle = '#4a2f18'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    for (let k = 0; k < 3; k++) { ctx.beginPath(); for (let y = b.y + b.h; y >= b.y; y -= 20) { const x = b.x + b.w / 2 + Math.sin(y * .07 + k * 2.1) * 13 + (k - 1) * 7; y === b.y + b.h ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke(); }
    ctx.strokeStyle = '#6b4424'; ctx.lineWidth = 2; ctx.beginPath(); for (let y = b.y + 10; y < b.y + b.h; y += 22) { const x = b.x + b.w / 2 + Math.sin(y * .07) * 13; ctx.moveTo(x, y); ctx.lineTo(x + ((y / 22 | 0) % 2 ? 16 : -16), y - 9); } ctx.stroke();
  }
  // sportelli, cancello finale, timbri, asterischi
  for (const b of L.blocks) if ((b.door || b.gate) && onScreen(b, 40)) {
    const open = !blockSolid(b), k = b.door ? ((G.t / b.per + b.ph) % 1) : 0;
    ctx.fillStyle = '#7a5a36'; ctx.fillRect(b.x - 6, b.y + b.h - 170, 6, 170); ctx.fillRect(b.x + b.w, b.y + b.h - 170, 6, 170); ctx.fillRect(b.x - 10, b.y + b.h - 178, b.w + 20, 10);
    if (!open) { ctx.fillStyle = b.gate ? '#b8433a' : '#3f7f8c'; ctx.fillRect(b.x, b.y + b.h - 168, b.w, 168); ctx.fillStyle = 'rgba(0,0,0,.18)'; for (let y = b.y + b.h - 160; y < b.y + b.h; y += 14) ctx.fillRect(b.x, y, b.w, 3); if (b.door && k > .38) { ctx.fillStyle = '#fff3d6'; ctx.globalAlpha = .5 + .5 * Math.sin(t * 20) ** 2; ctx.fillRect(b.x, b.y + b.h - 168, b.w, 6); ctx.globalAlpha = 1; } }
    else { ctx.fillStyle = b.gate ? '#b8433a' : '#3f7f8c'; ctx.fillRect(b.x, b.y + b.h - 168, b.w, 14); if (b.door && k > .88) { ctx.fillStyle = '#d8433a'; ctx.globalAlpha = .5 + .5 * Math.sin(t * 24) ** 2; ctx.fillRect(b.x, b.y + b.h - 154, b.w, 5); ctx.globalAlpha = 1; } }
    ctx.font = 'bold 11px ' + SERIF; ctx.fillStyle = '#fff3d6'; ctx.textAlign = 'center'; ctx.fillText(open ? 'APERTO' : b.gate ? (L.stamps.filter(s => s.got).length + '/' + L.stamps.length) : 'CHIUSO', b.x + b.w / 2, b.y + b.h - 181); ctx.textAlign = 'left';
  }
  for (const st of (L.stamps || [])) if (!st.got && onScreen({ x: st.x - 30, w: 60 })) { const y = st.y + Math.sin(t * 2.4 + st.x) * 3; ctx.save(); ctx.translate(st.x, y); ctx.rotate(-.2); ctx.strokeStyle = '#c0392b'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(0, 0, 15, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, 11, 0, TAU); ctx.lineWidth = 1; ctx.stroke(); ctx.fillStyle = '#c0392b'; ctx.font = 'bold 9px ' + SERIF; ctx.textAlign = 'center'; ctx.fillText('VISTO', 0, 3); ctx.restore(); ctx.textAlign = 'left'; }
  for (const q of (L.ports || [])) if (onScreen({ x: q.x - 30, w: 60 })) { const y = q.y + Math.sin(t * 3 + q.x) * 3; const g2 = ctx.createRadialGradient(q.x, y, 1, q.x, y, 24); g2.addColorStop(0, 'rgba(255,170,90,.8)'); g2.addColorStop(1, 'rgba(255,170,90,0)'); ctx.fillStyle = g2; ctx.fillRect(q.x - 26, y - 26, 52, 52); ctx.save(); ctx.translate(q.x, y); ctx.rotate(t * 1.4); ctx.fillStyle = '#e2672a'; ctx.font = 'bold 34px ' + SERIF; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('*', 0, 7); ctx.restore(); ctx.textBaseline = 'alphabetic'; if (q.stars > 1 || (L.pa || []).some(a => a.stars > 1)) { ctx.fillStyle = '#e2672a'; ctx.font = 'bold 15px ' + SERIF; ctx.textAlign = 'center'; ctx.fillText('*'.repeat(q.stars), q.x, y - 22); } ctx.textAlign = 'left'; }
  for (const z of (L.lows || [])) { ctx.fillStyle = 'rgba(120,200,220,.08)'; ctx.fillRect(z.x, G.cam.y - 20, z.w, H + 40); ctx.fillStyle = 'rgba(160,220,235,.5)'; for (let i = 0; i < 14; i++) { const x = z.x + ((i * 173.3) % z.w), y = G.cam.y + H - ((t * (14 + i * 3) + i * 61) % (H + 40)); if (x > G.cam.x - 10 && x < G.cam.x + W + 10) { ctx.beginPath(); ctx.arc(x, y, 2.5, 0, TAU); ctx.fill(); } } }
  // parole da ricalcare
  for (const w of (L.words || [])) if (w.cd <= 0 && onScreen({ x: w.x - 40, w: 80 })) {
    const y = w.y + Math.sin(t * 2.6 + w.x) * 4; ctx.font = 'italic 500 22px ' + SERIF; const tw = ctx.measureText(w.k).width;
    ctx.fillStyle = FORMCOL[w.k]; rr(w.x - tw / 2 - 10, y - 17, tw + 20, 26, 13); ctx.fill();
    ctx.fillStyle = '#fffaf0'; ctx.textAlign = 'center'; ctx.fillText(w.k, w.x, y + 2); ctx.textAlign = 'left';
  }
  // il viandante
  for (const n of (L.npcs || [])) if (n.a > 0 && onScreen({ x: n.x - 40, w: 80 })) {
    ctx.save(); ctx.globalAlpha = n.a * .85; ctx.translate(n.x, n.y); ctx.strokeStyle = THEMES[L.theme].dark ? '#d8d2c4' : GRAPHITE; ctx.lineWidth = 2.6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(-9, 0); ctx.lineTo(-5, -26); ctx.lineTo(-12, -58); ctx.lineTo(12, -58); ctx.lineTo(7, -26); ctx.lineTo(10, 0); ctx.moveTo(-12, -58); ctx.quadraticCurveTo(0, -42, 14, -30); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, -68, 9, 0, TAU); ctx.moveTo(-17, -74); ctx.lineTo(17, -74); ctx.moveTo(-10, -75); ctx.quadraticCurveTo(0, -93, 10, -75); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(14, -30); ctx.lineTo(24, -44); ctx.stroke(); ctx.restore();
  }
  // i lupi
  for (const w of (L.wolves || [])) {
    const cxw = (w.x0 + w.x1) / 2; if (!onScreen({ x: w.x0 - 100, w: w.x1 - w.x0 + 200 })) continue;
    const ph = w.t % 4.8, open = ph >= 3.4, warn = ph >= 2.7 && !open, wy = w.y - 150;
    if (open) { ctx.fillStyle = 'rgba(200,60,40,.10)'; ctx.fillRect(w.x0, G.cam.y, w.x1 - w.x0, H); }
    ctx.strokeStyle = open ? 'rgba(200,60,40,.7)' : 'rgba(90,70,50,.3)'; ctx.setLineDash([4, 8]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(w.x0, G.cam.y); ctx.lineTo(w.x0, G.cam.y + H); ctx.moveTo(w.x1, G.cam.y); ctx.lineTo(w.x1, G.cam.y + H); ctx.stroke(); ctx.setLineDash([]);
    ctx.save(); ctx.translate(cxw, wy + Math.sin(t * 1.5) * 2);
    ctx.fillStyle = '#6b6258'; ctx.beginPath(); ctx.ellipse(0, 0, 74, 34 + Math.sin(t * 1.5) * 2, 0, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(-70, 6, 30, 22, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(-98, 12, 16, 10, 0, 0, TAU); ctx.fill();
    const ear = warn ? Math.sin(t * 40) * 4 : 0; ctx.beginPath(); ctx.moveTo(-82, -10); ctx.lineTo(-76 + ear, -36); ctx.lineTo(-66, -12); ctx.moveTo(-64, -12); ctx.lineTo(-56 + ear, -34); ctx.lineTo(-50, -8); ctx.fill();
    ctx.fillStyle = '#4f4840'; ctx.beginPath(); ctx.ellipse(76, 10, 30, 9, .4, 0, TAU); ctx.fill(); ctx.fillStyle = '#2a2018'; ctx.beginPath(); ctx.arc(-112, 10, 4, 0, TAU); ctx.fill();
    if (open) { ctx.fillStyle = '#ffd23c'; ctx.beginPath(); ctx.ellipse(-74, 0, 8, 7, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#1a120c'; ctx.beginPath(); ctx.ellipse(-74, 0, 2.5, 6, 0, 0, TAU); ctx.fill(); }
    else { ctx.strokeStyle = '#2a2018'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(-81, 0); ctx.quadraticCurveTo(-74, warn ? -4 : 4, -67, 0); ctx.stroke(); }
    ctx.font = 'italic 22px ' + SERIF; ctx.fillStyle = warn ? '#c0392b' : 'rgba(60,50,40,.6)'; ctx.textAlign = 'center';
    if (warn) ctx.fillText('!', -74, -44); else if (!open) { const k = (t * .6) % 1; ctx.globalAlpha = 1 - k; ctx.fillText('z', -60 + k * 20, -40 - k * 30); ctx.globalAlpha = 1; }
    ctx.restore(); ctx.textAlign = 'left';
  }
  for (const s of L.stains) if (onScreen(s)) { if (s.beat !== undefined && s.beat !== G.beatPh) { ctx.fillStyle = DEEP; ctx.globalAlpha = .55; ctx.beginPath(); ctx.ellipse(s.x + s.w / 2, s.y + s.h - 2, s.w * .3, 3.5, 0, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; } else drawStain(s, s.layer && s.layer !== G.layer); }
  for (const s of G.dyn) {
    if (s.t < .95) { ctx.globalAlpha = .35 + .4 * Math.sin(s.t * 30) ** 2; ctx.strokeStyle = VIOLET; ctx.lineWidth = 2; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.ellipse(s.x + s.w / 2, s.y + s.h / 2 + 2, s.w / 2 * (s.t / .95), s.h / 2 + 2, 0, 0, TAU); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1; }
    else if (s.t < 2.7) drawStain(s, false);
  }
  // candele
  for (const c of L.candles) {
    ctx.fillStyle = '#efe3c6'; ctx.fillRect(c.x - 4, c.y + 6, 8, 24); ctx.fillStyle = 'rgba(90,60,30,.5)'; ctx.fillRect(c.x - 7, c.y + 28, 14, 3);
    if (c.cd <= 0) { const f = 1 + Math.sin(t * 17) * .12 + Math.sin(t * 29) * .08; ctx.fillStyle = '#ffb347'; ctx.beginPath(); ctx.ellipse(c.x, c.y - 2, 4.5 * f, 9 * f, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#fff3c4'; ctx.beginPath(); ctx.ellipse(c.x, c.y + 1, 2, 4.5, 0, 0, TAU); ctx.fill(); }
  }
  // annotazioni da raccogliere
  for (const m of L.marks) if (!m.got && onScreen({ x: m.x - 20, w: 40 })) {
    const y = m.y + Math.sin(t * 2.4 + m.x) * 4;
    const gg = ctx.createRadialGradient(m.x, y, 1, m.x, y, 22); gg.addColorStop(0, 'rgba(255,240,190,.8)'); gg.addColorStop(1, 'rgba(255,240,190,0)'); ctx.fillStyle = gg; ctx.fillRect(m.x - 24, y - 24, 48, 48);
    ctx.save(); ctx.translate(m.x, y); ctx.rotate(t * .8); ctx.strokeStyle = GRAPHITE; ctx.lineWidth = 2.4; ctx.lineCap = 'round'; ctx.beginPath(); for (let i = 0; i < 3; i++) { const a = i * Math.PI / 3; ctx.moveTo(Math.cos(a) * 8, Math.sin(a) * 8); ctx.lineTo(-Math.cos(a) * 8, -Math.sin(a) * 8); } ctx.stroke(); ctx.restore();
  }
  for (const b of L.bugs) if (onScreen({ x: b.x - b.w, w: b.w * 2 })) drawBug(b);
  if (G.boss) drawBoss();
  // parole lanciate dal Refuso
  ctx.font = 'bold 18px ' + SERIF; ctx.textAlign = 'center';
  for (const q of G.proj) { ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(Math.sin(q.t * 9) * .2); ctx.fillStyle = 'rgba(8,4,14,.85)'; rr(-q.w / 2 - 3, -13, q.w + 6, 24, 8); ctx.fill(); ctx.fillStyle = '#d7b8ff'; ctx.fillText(q.text, 0, 5); ctx.restore(); }
  ctx.textAlign = 'left';

  drawBrina();
  drawPostilla();
  if (G.seenT > 0 && P.dead <= 0) { ctx.fillStyle = '#d8433a'; ctx.font = 'bold 26px ' + SERIF; ctx.textAlign = 'center'; ctx.globalAlpha = Math.min(1, G.seenT / .2); ctx.fillText('!', P.x + P.w / 2, P.y - 28); ctx.globalAlpha = 1; ctx.textAlign = 'left'; }
  if (P.form && P.dead <= 0) { const k = P.form.t / P.form.max, x = P.x + P.w / 2, y = P.y - 30; ctx.font = 'italic 500 16px ' + SERIF; ctx.textAlign = 'center'; ctx.fillStyle = FORMCOL[P.form.k]; ctx.globalAlpha = k < .25 ? .4 + .6 * Math.sin(t * 20) ** 2 : 1; ctx.fillText(P.form.k, x, y); ctx.strokeStyle = FORMCOL[P.form.k]; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(x, P.y + P.h / 2 - 4, 27, -Math.PI / 2, -Math.PI / 2 + TAU * k); ctx.stroke(); ctx.globalAlpha = 1; ctx.textAlign = 'left'; }
  drawParts();

  if (L.tunnel) { const ph = L.tunnel.t % 5.8; if (ph >= 3.5 && ph < 4.5) { ctx.fillStyle = '#d8433a'; ctx.font = 'bold 30px ' + SERIF; ctx.textAlign = 'center'; ctx.globalAlpha = .5 + .5 * Math.sin(t * 24) ** 2; ctx.fillText('GALLERIA!', G.cam.x + W / 2, G.cam.y + 150); ctx.globalAlpha = 1; ctx.textAlign = 'left'; } else if (ph >= 4.5) { const yb = P.standOn ? P.standOn.y : P.y + P.h; ctx.fillStyle = '#050608'; ctx.fillRect(G.cam.x - 20, G.cam.y - 20, W + 40, yb - 62 - G.cam.y + 20); ctx.fillStyle = '#2a1a16'; for (let x = G.cam.x - ((t * 900) % 80); x < G.cam.x + W; x += 80) ctx.fillRect(x, yb - 74, 40, 12); } }
  // la cancellatura che insegue
  if (L.chase && G.chaseOn) {
    const x = G.chaseX, y0 = G.cam.y - 20, y1 = G.cam.y + H + 20;
    if (x > G.cam.x - 60) {
      ctx.fillStyle = DEEP; ctx.beginPath(); ctx.moveTo(G.cam.x - 80, y0); ctx.lineTo(x, y0);
      for (let y = y0; y <= y1; y += 14) ctx.lineTo(x + Math.sin(y * .09 + t * 9) * 12 + Math.sin(y * .31 - t * 13) * 7, y);
      ctx.lineTo(G.cam.x - 80, y1); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(120,70,190,.7)'; ctx.lineWidth = 3;
      for (let k = 0; k < 6; k++) { ctx.beginPath(); const yy = y0 + ((k * 97 + t * 160) % (H + 40)); ctx.moveTo(x - 30, yy); for (let i = 0; i < 6; i++) ctx.lineTo(x - 30 + i * 14 + (i % 2) * 10, yy + (i % 2 ? -16 : 16)); ctx.stroke(); }
    }
  }
  // onde dello sbianchetto
  for (const r of G.rings) { const k = r.t / .6; ctx.globalAlpha = (1 - k) * .9; ctx.strokeStyle = '#fffaf0'; ctx.lineWidth = 7 * (1 - k) + 1; ctx.beginPath(); ctx.arc(r.x, r.y, 20 + easeOut(k) * (r.big ? 420 : 190), 0, TAU); ctx.stroke(); }
  ctx.globalAlpha = 1;
  // parole corrette che tornano al loro posto
  ctx.textAlign = 'center';
  for (const f of G.fly) {
    const k = f.t / 1.6;
    if (f.kind === 'restore') { const tx = G.boss && G.boss.phase === 3 ? (f.x < 480 ? 150 : 810) : 480, e = easeIO(Math.min(1, k * 1.3)); ctx.globalAlpha = 1 - k * k; ctx.font = 'italic 20px ' + SERIF; ctx.fillStyle = INK; ctx.fillText(f.text, lerp(f.x, tx, e), lerp(f.y, 104, e)); }
    else { ctx.globalAlpha = 1 - k; ctx.font = 'italic 18px ' + SERIF; ctx.fillStyle = INK; ctx.fillText(f.text, f.x, f.y - k * 46); }
  }
  ctx.textAlign = 'left'; ctx.globalAlpha = 1;
  ctx.restore();

  // buio e lume di candela
  if (L.water) { ctx.fillStyle = 'rgba(60,150,180,.16)'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = 'rgba(255,255,255,.5)'; for (let i = 0; i < 18; i++) { const x = (i * 131 - G.cam.x * .7) % W, y = H - ((t * (30 + i * 4) + i * 77) % (H + 20)); ctx.beginPath(); ctx.arc((x + W) % W, y, 2 + i % 3, 0, TAU); ctx.fill(); } if (!L.fixed) { ctx.fillStyle = DEEP; ctx.beginPath(); ctx.moveTo(0, H); for (let x = 0; x <= W; x += 20) ctx.lineTo(x, 516 + Math.sin((x + G.cam.x) * .05 + t * 2) * 6); ctx.lineTo(W, H); ctx.fill(); } }
  if (th.dark || G.bossDark) {
    const fl = 1 + Math.sin(t * 13) * .025 + Math.sin(t * 7.3) * .02;
    const LR = th.light || 240, R = (P.light > 0 ? lerp(LR, 340, clamp(P.light / .8, 0, 1)) : LR) * fl;
    const X = DARKX; X.globalCompositeOperation = 'source-over'; X.clearRect(0, 0, 480, 270);
    X.fillStyle = 'rgba(12,7,4,' + (th.dark || .88) + ')'; X.fillRect(0, 0, 480, 270);
    X.globalCompositeOperation = 'destination-out';
    const hole = (wx, wy, r) => { const x = (wx - G.cam.x) / 2, y = (wy - G.cam.y) / 2; if (x < -r || x > 480 + r) return; const g = X.createRadialGradient(x, y, 0, x, y, r / 2); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(.5, 'rgba(0,0,0,.8)'); g.addColorStop(1, 'rgba(0,0,0,0)'); X.fillStyle = g; X.fillRect(x - r / 2, y - r / 2, r, r); };
    const bp = (th.brinaLight || G.bossDark) ? brinaPos() : null;
    if (bp) { hole(bp.x, bp.y - 24, R * 2); hole(P.x + P.w / 2, P.y + P.h / 2, 120); } else hole(P.x + P.w / 2, P.y + P.h / 2, R * 2);
    for (const c of L.candles) if (c.cd <= 0) hole(c.x, c.y, 150 * fl);
    for (const c of L.checks) if (c.got) hole(c.x, c.y - 10, 110);
    if (L.exit) hole(L.exit.x + 20, L.exit.y + 30, 240);
    ctx.drawImage(DARKC, 0, 0, W, H);
    if (P.light > 0) { ctx.fillStyle = 'rgba(255,170,60,.06)'; ctx.fillRect(0, 0, W, H); }
  }
  if (G.flash > 0) { ctx.fillStyle = 'rgba(255,250,240,' + Math.min(.8, G.flash) + ')'; ctx.fillRect(0, 0, W, H); }
}
