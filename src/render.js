/* ============================================================
   MARGINALIA — rendering del mondo
   ============================================================ */
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
  let col = INK, a = 1, font = null, ox = 0, oy = 0, under = .22;
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
  if (p.gl2) { ctx.globalAlpha = .9; ctx.fillStyle = VIOLET; ctx.beginPath(); ctx.arc(p.x + p.w - 18, p.y + 20, 2 + Math.sin(t * 5) * .8, 0, TAU); ctx.fill(); }
  ctx.restore(); ctx.globalAlpha = 1;
}

function drawStain(s, ghost) {
  const t = G.t, cx = s.x + s.w / 2, cy = s.y + s.h / 2 + 2;
  ctx.globalAlpha = ghost ? .13 : 1;
  ctx.fillStyle = DEEP; blobPath(cx, cy, s.w / 2, s.h / 2 + 3, t, s.x * .01, .14); ctx.fill();
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
  ctx.strokeStyle = DEEP; ctx.lineWidth = 1.6; ctx.beginPath();
  for (let i = 0; i < 4; i++) { const lx = x0 + 6 + i * (b.w - 22) / 3, sw = Math.sin(t * 16 + i * 1.8) * 4; ctx.moveTo(lx, b.y + 14); ctx.lineTo(lx + sw, b.y + 22); }
  ctx.stroke();
  let x = x0;
  for (let i = 0; i < b.bad.length; i++) {
    const ch = b.bad[i], w = ctx.measureText(ch).width;
    ctx.fillStyle = i % 2 ? '#2a1244' : DEEP;
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
  ctx.save(); ctx.translate(x, y); ctx.scale(P.face * P.sx * born, P.g * P.sy * born);
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

function drawBoss() {
  const b = G.boss, t = G.t;
  if (b.phase < 3) drawBossPage(480, 104, 230, 180, 0, 9, true);
  else { drawBossPage(150, 104, 185, 170, 0, 9, true); drawBossPage(810, 104, 185, 170, 0, 9, true); }
  const tg = b.tgt;
  if (tg && b.intro <= .8 && !b.dead) {
    const near = Math.hypot(P.x + P.w / 2 - tg.x, P.y + P.h / 2 - tg.y) < 130;
    const a = Math.min(1, tg.t * 2 + .01);
    ctx.globalAlpha = a * (near ? .9 : .5); ctx.strokeStyle = near ? '#fffaf0' : VIOLET; ctx.lineWidth = near ? 2.5 : 1.5; ctx.setLineDash([6, 7]); ctx.lineDashOffset = -t * 30;
    ctx.beginPath(); ctx.arc(tg.x, tg.y, 62 + Math.sin(t * 4) * 4, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    ctx.font = 'bold 19px ' + SERIF; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    const w = ctx.measureText(tg.bad).width; let x = tg.x - w / 2;
    ctx.globalAlpha = a; ctx.fillStyle = 'rgba(12,6,20,.82)'; rr(x - 10, tg.y - 20, w + 20, 32, 8); ctx.fill();
    for (let i = 0; i < tg.bad.length; i++) { const ch = tg.bad[i]; ctx.fillStyle = i % 3 ? '#c9a2ff' : '#fff2ff'; ctx.fillText(ch, x, tg.y + 2 + Math.sin(t * 8 + i) * 1.8); x += ctx.measureText(ch).width; }
    ctx.globalAlpha = 1;
  }
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
  ctx.font = F_HAND; ctx.fillStyle = GRAPHITE; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
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
    ctx.fillStyle = c.got ? INK : 'rgba(125,120,114,.55)'; ctx.fillText('¶', c.x, y + (c.got ? Math.sin(t * 3) * 2 : 0));
  }
  ctx.textAlign = 'left';

  for (const p of L.plats) drawPlat(p, L, litK);
  drawTiles(L);
  for (const b of L.blocks) if (b.corrupt) drawWall(b);
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

  drawPostilla();
  drawParts();

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
  if (th.dark) {
    const fl = 1 + Math.sin(t * 13) * .025 + Math.sin(t * 7.3) * .02;
    const R = (P.light > 0 ? lerp(th.light, 340, clamp(P.light / .8, 0, 1)) : th.light) * fl;
    const X = DARKX; X.globalCompositeOperation = 'source-over'; X.clearRect(0, 0, 480, 270);
    X.fillStyle = 'rgba(12,7,4,' + th.dark + ')'; X.fillRect(0, 0, 480, 270);
    X.globalCompositeOperation = 'destination-out';
    const hole = (wx, wy, r) => { const x = (wx - G.cam.x) / 2, y = (wy - G.cam.y) / 2; if (x < -r || x > 480 + r) return; const g = X.createRadialGradient(x, y, 0, x, y, r / 2); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(.5, 'rgba(0,0,0,.8)'); g.addColorStop(1, 'rgba(0,0,0,0)'); X.fillStyle = g; X.fillRect(x - r / 2, y - r / 2, r, r); };
    hole(P.x + P.w / 2, P.y + P.h / 2, R * 2);
    for (const c of L.candles) if (c.cd <= 0) hole(c.x, c.y, 150 * fl);
    for (const c of L.checks) if (c.got) hole(c.x, c.y - 10, 110);
    if (L.exit) hole(L.exit.x + 20, L.exit.y + 30, 240);
    ctx.drawImage(DARKC, 0, 0, W, H);
    if (P.light > 0) { ctx.fillStyle = 'rgba(255,170,60,.06)'; ctx.fillRect(0, 0, W, H); }
  }
  if (G.flash > 0) { ctx.fillStyle = 'rgba(255,250,240,' + Math.min(.8, G.flash) + ')'; ctx.fillRect(0, 0, W, H); }
}
