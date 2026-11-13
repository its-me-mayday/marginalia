/* ============================================================
   MARGINALIA — cornice: biblioteca, HUD, registro, transizioni, finali
   ============================================================ */
const SAVE_KEY = 'marginalia.v2';
const newBook = () => ({ li: 0, max: 0, done: false, best: null });
let SAVE = { books: CHAPTERS.map(newBook) };
function loadSave() {
  try {
    const s = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
    if (s && s.books) s.books.forEach((b, i) => { if (SAVE.books[i]) Object.assign(SAVE.books[i], b); });
    else { // salvataggio della prima versione
      const o = JSON.parse(localStorage.getItem('marginalia.v1') || 'null');
      if (o && typeof o.li === 'number') Object.assign(SAVE.books[0], { li: o.li, max: o.max || 0, done: !!o.done });
    }
  } catch (e) { }
}
function writeSave() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(SAVE)); } catch (e) { } }
const unlocked = c => c === 0 || SAVE.books[c - 1].done;
const LEVEL_NAMES = CHAPTERS.map(c => c.levels.map(f => f().name));
const TOTAL_MARKS = CHAPTERS.map(c => c.levels.reduce((n, f) => n + f().marks.length, 0));

let BTN = [], SEL = 0;
function button(x, y, w, h, label, fn, primary, paper) {
  BTN.push({ x, y, w, h, fn });
  ctx.fillStyle = paper ? (primary ? INK : 'rgba(60,40,20,.10)') : (primary ? 'rgba(244,232,205,.95)' : 'rgba(244,232,205,.12)');
  rr(x, y, w, h, 6); ctx.fill();
  ctx.strokeStyle = paper ? 'rgba(60,40,20,.55)' : 'rgba(244,232,205,.7)'; ctx.lineWidth = 1.2; ctx.stroke();
  ctx.fillStyle = paper ? (primary ? '#f3e9d0' : INK) : (primary ? INK : '#f1e6cc');
  ctx.font = 'italic 500 21px ' + SERIF; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(label, x + w / 2, y + h / 2 + 1, w - 22); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
}
function hitButtons() {
  if (!uiTap) return false;
  for (let i = BTN.length - 1; i >= 0; i--) { const b = BTN[i]; if (uiTap.x >= b.x && uiTap.x <= b.x + b.w && uiTap.y >= b.y && uiTap.y <= b.y + b.h) { uiTap = null; b.fn(); return true; } }
  return false;
}

function startTurn(fn) { G.turn = { t: 0, dur: 1.15, mid: false, fn }; AU.sfx('page'); }
function startGame(c, i) {
  if (!unlocked(c)) return;
  G.stats = { deaths: 0, time: 0, marks: 0, total: 0, points: 0, fixed: 0, full: false };
  startTurn(() => { G.chapter = c; G.state = 'play'; G.paused = false; loadLevel(i); const B = SAVE.books[c]; B.li = i; B.max = Math.max(B.max, i); writeSave(); });
}
function nextLevel() {
  const n = G.li + 1; G.stats.points += 200;
  startTurn(() => { loadLevel(n); const B = SAVE.books[G.chapter]; B.li = n; B.max = Math.max(B.max, n); writeSave(); });
}
function startEnding() {
  const B = SAVE.books[G.chapter], s = G.stats;
  s.points += 1200; if (s.full && s.deaths < 15) s.points += (15 - s.deaths) * 40;
  B.done = true; B.li = 0; B.max = CHAPTERS[G.chapter].levels.length - 1;
  if (s.full && (!B.best || s.points > B.best.points)) B.best = { points: s.points, marks: s.marks, time: Math.round(s.time), deaths: s.deaths };
  writeSave();
  startTurn(() => { G.state = 'ending'; G.end = { t: 0, page: 0 }; AU.setMood(G.chapter === 1 ? 9 : 0); parts.length = 0; });
}
function toTitle() { startTurn(() => { G.state = 'title'; G.paused = false; SEL = Math.min(G.chapter, CHAPTERS.length - 1); AU.setMood(0); }); }

/* ---------------- la biblioteca ---------------- */
function drawShelf(stainK) {
  const t = G.t;
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1c130d'); g.addColorStop(1, '#0d0806');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const r = rng(42);
  for (let row = 0; row < 4; row++) {
    const y = 20 + row * 135;
    ctx.fillStyle = '#2a1c12'; ctx.fillRect(0, y + 118, W, 12); ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(0, y + 130, W, 5);
    let x = -6;
    while (x < W) {
      const bw = 14 + r() * 22, bh = 70 + r() * 44, hue = r();
      const c = hue < .3 ? [70, 30, 26] : hue < .55 ? [38, 46, 40] : hue < .8 ? [62, 48, 28] : [36, 34, 52];
      const k = .7 + r() * .5; ctx.fillStyle = 'rgb(' + (c[0] * k | 0) + ',' + (c[1] * k | 0) + ',' + (c[2] * k | 0) + ')';
      const tilt = r() < .06 ? .12 : 0;
      ctx.save(); ctx.translate(x, y + 118); ctx.rotate(-tilt); ctx.fillRect(0, -bh, bw, bh);
      ctx.fillStyle = 'rgba(220,190,120,.22)'; ctx.fillRect(2, -bh + 10, bw - 4, 2); ctx.fillRect(2, -bh + 16, bw - 4, 1); if (r() < .5) ctx.fillRect(2, -18, bw - 4, 2);
      ctx.restore(); x += bw + 1 + (r() < .08 ? 18 : 0);
    }
  }
  const lg = ctx.createRadialGradient(W / 2, 250, 30, W / 2, 250, 520);
  lg.addColorStop(0, 'rgba(255,190,100,' + (.20 + Math.sin(t * 9) * .012) + ')'); lg.addColorStop(1, 'rgba(0,0,0,.6)');
  ctx.fillStyle = lg; ctx.fillRect(0, 0, W, H);
  if (stainK > 0) { ctx.fillStyle = DEEP; blobPath(790, 400, 46 * stainK, 34 * stainK, t, 3, .2); ctx.fill(); for (let i = 0; i < 4; i++) { const k = (t * .3 + i * .25) % 1; ctx.beginPath(); ctx.ellipse(766 + i * 18, 424 + k * 70 * stainK, 3, 6 * (1 - k), 0, 0, TAU); ctx.fill(); } }
}
function drawTitlePostilla(x, y, sc) {
  const sv = { x: P.x, y: P.y, g: P.g, face: P.face, sx: P.sx, sy: P.sy, dead: P.dead, born: P.born, vx: P.vx, vy: P.vy, ground: P.ground };
  P.x = x - P.w / 2; P.y = y - P.h; P.g = 1; P.face = 1; P.sx = 1; P.sy = 1; P.dead = 0; P.born = 0; P.vx = 0; P.vy = 0; P.ground = true;
  P.blink -= 1 / 60; if (P.blink < -.12) P.blink = rnd(1.5, 4);
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ctx.translate(-x, -y); drawPostilla(); ctx.restore();
  Object.assign(P, sv);
}
function drawCover(c, x, y, w, h, sel) {
  const C = CHAPTERS[c], open = unlocked(c), t = G.t, B = SAVE.books[c];
  ctx.save(); ctx.translate(x + w / 2, y + h / 2 + (sel ? Math.sin(t * 2) * 3 - 8 : 0)); ctx.rotate(sel ? -.02 : .015 * (c ? 1 : -1));
  ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillRect(-w / 2 + 8, -h / 2 + 10, w, h);
  ctx.fillStyle = '#efe3c6'; ctx.fillRect(-w / 2 + 6, -h / 2 + 4, w - 2, h - 4);
  ctx.fillStyle = open ? C.cover[0] : '#241b16'; ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.fillRect(-w / 2 + 10, -h / 2, 5, h);
  ctx.strokeStyle = open ? C.cover[1] : 'rgba(200,180,140,.25)'; ctx.lineWidth = sel ? 2.5 : 1.5; ctx.strokeRect(-w / 2 + 22, -h / 2 + 12, w - 34, h - 24);
  ctx.textAlign = 'center'; ctx.fillStyle = open ? C.cover[1] : 'rgba(200,180,140,.35)';
  ctx.font = '500 15px ' + SERIF; ctx.fillText('LIBRO ' + C.roman, 6, -h / 2 + 40);
  ctx.font = 'italic 500 25px ' + SERIF;
  const words = C.title.split(' '), lines = []; let cur = '';
  for (const wd of words) { if (cur && ctx.measureText(cur + ' ' + wd).width > w - 60) { lines.push(cur); cur = wd; } else cur = cur ? cur + ' ' + wd : wd; } lines.push(cur);
  lines.forEach((l, i) => ctx.fillText(l, 6, -44 + i * 30 - (lines.length - 1) * 10));
  if (open) {
    ctx.font = 'italic 15px ' + SERIF; ctx.globalAlpha = .9;
    ctx.fillText(B.done ? 'letto fino in fondo' : B.max > 0 ? 'segnalibro: ' + ROMAN[B.li] : 'mai aperto', 6, h / 2 - 48);
    if (B.best) ctx.fillText(B.best.points + ' punti', 6, h / 2 - 28);
    ctx.globalAlpha = .4; ctx.fillStyle = C.cover[1];
    if (c === 0) { ctx.beginPath(); ctx.moveTo(-12, 44); ctx.lineTo(-12, 20); ctx.quadraticCurveTo(6, -4, 24, 20); ctx.lineTo(24, 44); ctx.closePath(); ctx.fill(); }
    else { ctx.beginPath(); ctx.arc(6, 30, 15, 0, TAU); ctx.fill(); }
    ctx.globalAlpha = 1;
  } else {
    ctx.fillStyle = DEEP; blobPath(6, 26, 34, 26, t, 5, .2); ctx.fill();
    ctx.font = 'italic 14px ' + SERIF; ctx.fillStyle = 'rgba(220,200,160,.6)'; ctx.fillText('si apre quando avrai finito', 6, h / 2 - 48); ctx.fillText('«' + CHAPTERS[c - 1].title + '»', 6, h / 2 - 28);
  }
  ctx.restore(); ctx.textAlign = 'left';
}
function drawTitle() {
  const t = G.t; BTN = [];
  drawShelf(0);
  ctx.textAlign = 'center'; ctx.fillStyle = '#f1e6cc'; ctx.font = '500 58px ' + SERIF; ctx.fillText('MARGINALIA', W / 2, 70);
  ctx.font = F_HAND; ctx.fillStyle = 'rgba(241,230,204,.6)'; ctx.fillText('chi legge un libro, lo cambia', W / 2, 98); ctx.textAlign = 'left';
  const cw = 210, ch = 262, gap = 60, x0 = W / 2 - (CHAPTERS.length * cw + (CHAPTERS.length - 1) * gap) / 2, cy = 128;
  CHAPTERS.forEach((C, c) => { const x = x0 + c * (cw + gap); drawCover(c, x, cy, cw, ch, c === SEL); BTN.push({ x, y: cy, w: cw, h: ch, fn: () => { SEL = c; AU.sfx('page'); } }); });
  drawTitlePostilla(x0 + SEL * (cw + gap) + cw - 34, cy - 8 + Math.sin(t * 2) * 3, 1.5);
  const B = SAVE.books[SEL], open = unlocked(SEL), cont = B.li > 0 && !B.done;
  if (!open) { ctx.textAlign = 'center'; ctx.font = 'italic 19px ' + SERIF; ctx.fillStyle = 'rgba(241,230,204,.7)'; ctx.fillText('Questo libro è ancora chiuso.', W / 2, 446); ctx.textAlign = 'left'; }
  else if (cont) {
    button(W / 2 - 270, 418, 300, 44, 'Continua — ' + ROMAN[B.li] + '. ' + LEVEL_NAMES[SEL][B.li], () => startGame(SEL, B.li), true);
    button(W / 2 + 46, 418, 224, 44, 'Ricomincia da capo', () => startGame(SEL, 0), false);
  } else button(W / 2 - 130, 418, 260, 44, B.done ? 'Rileggi dall\'inizio' : 'Inizia a leggere', () => startGame(SEL, 0), true);
  if (open && B.max > 0) {
    const n = CHAPTERS[SEL].levels.length, bw = 40, xx = W / 2 - (n * (bw + 6) - 6) / 2;
    for (let i = 0; i < n; i++) {
      const x = xx + i * (bw + 6), op = i <= B.max;
      ctx.fillStyle = op ? 'rgba(244,232,205,.16)' : 'rgba(244,232,205,.05)'; rr(x, 472, bw, 28, 5); ctx.fill();
      ctx.fillStyle = op ? '#f1e6cc' : 'rgba(241,230,204,.25)'; ctx.font = '15px ' + SERIF; ctx.textAlign = 'center'; ctx.fillText(ROMAN[i], x + bw / 2, 491); ctx.textAlign = 'left';
      if (op) BTN.push({ x, y: 472, w: bw, h: 28, fn: () => startGame(SEL, i) });
    }
  }
  button(W - 172, 418, 144, 44, 'Registro', () => { G.reg = true; }, false);
  ctx.textAlign = 'center'; ctx.font = 'italic 15px ' + SERIF; ctx.fillStyle = 'rgba(241,230,204,.55)';
  ctx.fillText(IS_TOUCH ? '◀ ▶ muovi  ·  ▲ salta (due volte)  ·  ✎ sbianchetto' : '← → muovi  ·  SPAZIO salta (due volte)  ·  X sbianchetto  ·  P pausa  ·  M audio', W / 2, 526);
  ctx.textAlign = 'left';
  if (G.reg) { ctx.fillStyle = 'rgba(12,7,4,.86)'; ctx.fillRect(0, 0, W, H); BTN = []; drawRegister(84); button(W / 2 - 100, 440, 200, 44, 'Chiudi', () => { G.reg = false; }, true); }
}
function updTitle() {
  if (G.turn) return;
  if (hitButtons()) return;
  if (G.reg) { if (inp.startP) G.reg = false; return; }
  if (keys.ArrowLeft && SEL > 0) { SEL--; keys.ArrowLeft = false; } if (keys.ArrowRight && SEL < CHAPTERS.length - 1) { SEL++; keys.ArrowRight = false; }
  if (inp.startP && unlocked(SEL)) { const B = SAVE.books[SEL]; startGame(SEL, B.li > 0 && !B.done ? B.li : 0); }
}

/* ---------------- il registro del lettore ---------------- */
const mmss = s => Math.floor(s / 60) + ':' + ('0' + Math.floor(s % 60)).slice(-2);
function drawRegister(y0) {
  ctx.textAlign = 'center'; ctx.fillStyle = '#f1e6cc'; ctx.font = 'italic 500 34px ' + SERIF; ctx.fillText('Registro del lettore', W / 2, y0);
  const cols = [110, 400, 520, 640, 740, 840], head = ['libro', 'punti', 'annotazioni', 'tempo', 'cadute', ''];
  ctx.font = 'italic 15px ' + SERIF; ctx.fillStyle = 'rgba(241,230,204,.55)';
  head.forEach((h, i) => { ctx.textAlign = i ? 'center' : 'left'; ctx.fillText(h, cols[i], y0 + 44); });
  ctx.strokeStyle = 'rgba(241,230,204,.25)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(100, y0 + 54); ctx.lineTo(880, y0 + 54); ctx.stroke();
  let y = y0 + 88, tot = 0, totM = 0;
  const row = (name, pts, mk, tm, de, note, col) => {
    ctx.fillStyle = col || '#f1e6cc'; ctx.font = '500 21px ' + SERIF; ctx.textAlign = 'left'; ctx.fillText(name, cols[0], y, 250);
    ctx.textAlign = 'center'; [pts, mk, tm, de].forEach((v, i) => ctx.fillText(v, cols[i + 1], y));
    ctx.font = 'italic 15px ' + SERIF; ctx.fillStyle = 'rgba(241,230,204,.55)'; ctx.fillText(note, cols[5], y); y += 38;
  };
  if (G.state === 'play') { const s = G.stats; row('questa lettura', s.points, s.marks + '/' + s.total, mmss(s.time), s.deaths, 'in corso', '#ffe9b0'); }
  CHAPTERS.forEach((C, c) => {
    const B = SAVE.books[c];
    if (!unlocked(c)) row('«' + C.title + '»', '—', '—', '—', '—', 'chiuso', 'rgba(241,230,204,.4)');
    else if (B.best) { row('«' + C.title + '»', B.best.points, B.best.marks + '/' + TOTAL_MARKS[c], mmss(B.best.time), B.best.deaths, 'migliore'); tot += B.best.points; totM += B.best.marks; }
    else row('«' + C.title + '»', '—', '—/' + TOTAL_MARKS[c], '—', '—', B.done ? 'finito' : 'da finire', 'rgba(241,230,204,.75)');
  });
  ctx.beginPath(); ctx.moveTo(100, y - 18); ctx.lineTo(880, y - 18); ctx.stroke(); y += 14;
  row('totale', tot, totM + '/' + TOTAL_MARKS.reduce((a, b) => a + b, 0), '', '', '', '#ffe9b0');
  ctx.font = 'italic 14px ' + SERIF; ctx.fillStyle = 'rgba(241,230,204,.45)'; ctx.textAlign = 'center';
  ctx.fillText('Entra nel registro la lettura migliore di ogni libro, fatta dal primo livello all\'ultimo.', W / 2, y + 6);
  ctx.textAlign = 'left';
}

/* ---------------- HUD ---------------- */
function drawHUD() {
  const L = G.L, t = G.t, dark = THEMES[L.theme].dark || G.bossDark;
  ctx.textBaseline = 'alphabetic';
  ctx.font = 'italic 500 17px ' + SERIF; ctx.fillStyle = dark ? 'rgba(241,230,204,.8)' : 'rgba(40,28,16,.75)'; ctx.textAlign = 'left';
  ctx.fillText(ROMAN[G.li] + '. ' + L.name, 18, 26);
  const got = L.marks.filter(m => m.got).length;
  ctx.fillText((L.marks.length ? '✶ ' + got + '/' + L.marks.length + '   ' : '') + G.stats.points + ' pt', 18, 48);
  const max = L.mirror ? .32 : L.boss ? 1.0 : 1.7, k = clamp(1 - P.cd / max, 0, 1), ex = 230, ey = 30;
  ctx.save(); ctx.translate(ex, ey); ctx.rotate(-.5);
  ctx.fillStyle = 'rgba(30,20,12,.35)'; rr(-15, -8, 30, 16, 4); ctx.fill();
  ctx.fillStyle = k >= 1 ? '#fffaf0' : 'rgba(255,250,240,.55)'; rr(-15, -8, 30 * k, 16, 4); ctx.fill();
  ctx.fillStyle = '#c96a5a'; rr(-15, -8, 8, 16, 3); ctx.fill();
  ctx.restore();
  if (k >= 1) { ctx.globalAlpha = .5 + Math.sin(t * 5) * .3; ctx.strokeStyle = '#fffaf0'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(ex, ey, 21, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1; }
  if (P.light > 0) { const w = 90 * clamp(P.light / 7.5, 0, 1); ctx.fillStyle = 'rgba(30,20,12,.4)'; rr(266, 26, 94, 10, 5); ctx.fill(); ctx.fillStyle = '#ffb347'; rr(268, 28, Math.max(4, w), 6, 3); ctx.fill(); }
  if (L.auto !== undefined && P.x > L.auto) { const P0 = L.autoPeriod || 2.7, kk = clamp(G.autoT / P0, 0, 1); ctx.fillStyle = 'rgba(30,20,40,.3)'; rr(W / 2 - 60, 528, 120, 5, 2); ctx.fill(); ctx.fillStyle = G.autoT < .7 ? '#b0412f' : '#4a4660'; rr(W / 2 - 60, 528, Math.max(3, 120 * kk), 5, 2); ctx.fill(); }
  if (L.mirror) { const lb = L.labels || ['— ciò che è scritto —', '— ciò che è vero —']; ctx.font = 'italic 16px ' + SERIF; ctx.textAlign = 'center'; ctx.fillStyle = G.layer === 1 ? INK : (L.labels ? '#f1e6cc' : '#4a4660'); ctx.fillText(lb[G.layer - 1], W / 2, 520); ctx.textAlign = 'left'; }
  if (G.boss && !G.boss.dead) { for (let i = 0; i < 9; i++) { ctx.fillStyle = i < G.boss.hp ? '#fffaf0' : 'rgba(20,8,30,.6)'; rr(W / 2 - 108 + i * 24 + (i >= 3 ? 8 : 0) + (i >= 6 ? 8 : 0), 506, 18, 6, 3); ctx.fill(); } }
  if (G.cardT < 3.2) {
    const a = clamp(G.cardT / .5, 0, 1) * clamp((3.2 - G.cardT) / .7, 0, 1);
    ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.fillStyle = dark ? '#f1e6cc' : INK;
    ctx.font = '19px ' + SERIF; ctx.fillText(ROMAN[G.li], W / 2, 118);
    ctx.font = 'italic 44px ' + SERIF; ctx.fillText(L.name, W / 2, 166);
    if (L.date) { ctx.font = F_HAND; ctx.fillStyle = dark ? 'rgba(241,230,204,.8)' : GRAPHITE; ctx.fillText(L.date, W / 2, 196); }
    ctx.globalAlpha = 1; ctx.textAlign = 'left';
  }
  if (G.cap) {
    const c = G.cap, a = clamp(c.t / .35, 0, 1) * clamp((c.dur - c.t) / .5, 0, 1);
    ctx.globalAlpha = a; ctx.font = 'italic 500 21px ' + SERIF; ctx.textAlign = 'center';
    const w = Math.min(W - 80, ctx.measureText(c.text).width + 44);
    ctx.fillStyle = 'rgba(18,11,6,.78)'; rr(W / 2 - w / 2, 62, w, 38, 6); ctx.fill();
    ctx.fillStyle = '#f3e9d0'; ctx.fillText(c.text, W / 2, 87, W - 110);
    ctx.globalAlpha = 1; ctx.textAlign = 'left';
  }
  if (G.note) {
    const n = G.note, a = clamp(n.t / .3, 0, 1) * clamp((5 - n.t) / .6, 0, 1), kid = G.chapter === 1;
    ctx.save(); ctx.globalAlpha = a; ctx.translate(W / 2, 452 + (1 - easeOut(clamp(n.t / .4, 0, 1))) * 20); ctx.rotate(kid ? .03 : -.022);
    ctx.font = (kid ? '500 19px ' : 'italic 500 21px ') + SERIF; const w = Math.min(640, ctx.measureText(n.text).width + 70);
    ctx.fillStyle = 'rgba(20,10,4,.3)'; ctx.fillRect(-w / 2 + 4, -22, w, 44);
    ctx.fillStyle = '#f7f0dc'; ctx.fillRect(-w / 2, -26, w, 44);
    ctx.strokeStyle = 'rgba(160,60,50,.4)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-w / 2 + 28, -26); ctx.lineTo(-w / 2 + 28, 18); ctx.stroke();
    ctx.fillStyle = GRAPHITE; ctx.textAlign = 'left'; ctx.fillText('✶', -w / 2 + 8, 3);
    ctx.fillStyle = kid ? '#3f6fa8' : '#5d5852'; ctx.textAlign = 'center'; ctx.fillText(n.text, 14, 3, w - 60);
    ctx.restore(); ctx.textAlign = 'left';
  }
  if (G.paused) {
    ctx.fillStyle = 'rgba(12,7,4,.86)'; ctx.fillRect(0, 0, W, H); BTN = [];
    drawRegister(70);
    button(W / 2 - 250, 446, 240, 46, 'Riprendi la lettura', () => { G.paused = false; }, true);
    button(W / 2 + 10, 446, 240, 46, 'Torna alla biblioteca', () => { G.paused = false; toTitle(); }, false);
  }
}

/* ---------------- voltare pagina ---------------- */
function drawTurn() {
  const T = G.turn; if (!T) return;
  const k = T.t / T.dur;
  let l, r;
  if (k < .5) { l = lerp(W + 40, -40, easeIO(k * 2)); r = W + 40; }
  else { l = -40; r = lerp(W + 40, -40, easeIO((k - .5) * 2)); }
  const g = ctx.createLinearGradient(l, 0, r, 0); g.addColorStop(0, '#e4d5ae'); g.addColorStop(1, '#f3e9d0');
  ctx.fillStyle = g; ctx.fillRect(l, 0, r - l, H);
  const sh = ctx.createLinearGradient(l - 70, 0, l, 0); sh.addColorStop(0, 'rgba(20,10,4,0)'); sh.addColorStop(1, 'rgba(20,10,4,.45)');
  ctx.fillStyle = sh; ctx.fillRect(l - 70, 0, 70, H);
  if (k >= .5) { const s2 = ctx.createLinearGradient(r, 0, r + 60, 0); s2.addColorStop(0, 'rgba(20,10,4,.4)'); s2.addColorStop(1, 'rgba(20,10,4,0)'); ctx.fillStyle = s2; ctx.fillRect(r, 0, 60, H); }
}

/* ---------------- finali ---------------- */
function fadeText(s, x, y, t, t0, font, col) { const a = clamp((t - t0) / 1.2, 0, 1); if (a <= 0) return; ctx.globalAlpha = a; ctx.font = font; ctx.fillStyle = col || INK; ctx.fillText(s, x, y, W - 80); ctx.globalAlpha = 1; }
function drawEnding() {
  const E = G.end, t = E.t, C = CHAPTERS[G.chapter], pages = C.ending; BTN = [];
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  if (E.page < pages.length) {
    const pg = pages[E.page];
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#f6eed9'); g.addColorStop(1, '#e6d8b4'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(160,60,50,.35)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(150, 0); ctx.lineTo(150, H); ctx.moveTo(155, 0); ctx.lineTo(155, H); ctx.stroke();
    const n = pg.lines.length, sz = pg.big ? 46 : pg.left ? 27 : 29, lh = pg.left ? 50 : 56, y0 = 270 - (n - 1) * lh / 2;
    ctx.textAlign = pg.left ? 'left' : 'center';
    pg.lines.forEach((ln, i) => fadeText(ln[0], pg.left ? 200 : W / 2, y0 + i * lh, t, ln[1], 'italic ' + sz + 'px ' + SERIF, ln[2]));
    if (pg.mark && t > 5) { // il segno di matita, identico a quello di Postilla
      const k = clamp((t - 5) / .9, 0, 1), X = 100, Y = y0 + (n - 1) * lh - 6; ctx.strokeStyle = GRAPHITE; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(X - 16, Y + 4);
      for (let i = 1; i <= 24 * k; i++) { const u = i / 24; ctx.lineTo(X - 16 + u * 34, Y + 4 - Math.sin(u * TAU) * 9 * (u < .5 ? 1.3 : .9) - u * 6); } ctx.stroke();
    }
    if (t > 2.5) { ctx.textAlign = 'center'; ctx.globalAlpha = .45 + Math.sin(t * 3) * .2; ctx.font = F_HAND; ctx.fillStyle = GRAPHITE; ctx.fillText(IS_TOUCH ? 'tocca per voltare pagina' : 'SPAZIO per voltare pagina', W / 2, 500); ctx.globalAlpha = 1; }
  } else {
    const last = G.chapter === CHAPTERS.length - 1;
    drawShelf(last ? clamp((t - 1.5) / 6, 0, 1) : 0);
    ctx.textAlign = 'center';
    fadeText(C.shelf[0], W / 2, 120, t, .5, 'italic 25px ' + SERIF, '#f1e6cc');
    fadeText(C.shelf[1], W / 2, 164, t, 3, 'italic 23px ' + SERIF, '#f1e6cc');
    const s = G.stats;
    fadeText(s.points + ' punti', W / 2, 240, t, 4.5, '500 40px ' + SERIF, '#ffe9b0');
    fadeText('tempo ' + mmss(s.time) + '   ·   annotazioni ' + s.marks + '/' + s.total + '   ·   parole corrette ' + s.fixed + '   ·   cadute ' + s.deaths, W / 2, 274, t, 4.5, F_HAND, 'rgba(241,230,204,.75)');
    if (s.full && s.marks >= s.total) fadeText(C.secret, W / 2, 322, t, 5.5, 'italic 500 24px ' + SERIF, '#ffe9b0');
    else fadeText('Il lettore ha lasciato altre note a margine. Non le hai trovate tutte.', W / 2, 322, t, 5.5, F_HAND, 'rgba(241,230,204,.6)');
    if (!last) fadeText('Sullo scaffale, un altro libro si è aperto.', W / 2, 362, t, 6, F_HAND, '#ffe9b0');
    if (t > 5.5) button(W / 2 - 130, 400, 260, 46, 'Torna alla biblioteca', () => { if (!last) G.chapter++; toTitle(); }, true);
  }
  ctx.textAlign = 'left';
}
function updEnding(dt) {
  const E = G.end, pages = CHAPTERS[G.chapter].ending; E.t += dt;
  if (G.turn) return;
  if (hitButtons()) return;
  const skip = (inp.startP || uiTap) && E.t > 1.2;
  if (E.page < pages.length && (E.t > pages[E.page].dur || skip)) { uiTap = null; E.page++; E.t = 0; AU.sfx('page'); }
}

/* ---------------- ciclo principale ---------------- */
const STEP = 1 / 120;
let lastTs = 0, acc = 0, GPAT = null;
function step(dt) {
  if (G.turn) {
    const T = G.turn; T.t += dt;
    if (!T.mid && T.t >= T.dur / 2) { T.mid = true; T.fn(); }
    if (T.t >= T.dur) G.turn = null;
    if (G.state !== 'play') G.t += dt;
    return;
  }
  if (keys.KeyM && !step.m) { AU.setMute(!AU.muted); syncMute(); } step.m = keys.KeyM;
  if (G.state === 'title') { G.t += dt; updTitle(); }
  else if (G.state === 'ending') { G.t += dt; updEnding(dt); }
  else if (G.state === 'play') {
    if (inp.pauseP) G.paused = !G.paused;
    if (G.paused) { hitButtons(); return; }
    update(dt);
  }
}
function draw() {
  ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
  ctx.globalAlpha = 1; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  if (G.state === 'title') drawTitle();
  else if (G.state === 'ending') drawEnding();
  else drawWorld();
  if (!GPAT) GPAT = ctx.createPattern(GRAIN, 'repeat');
  if (GPAT) { ctx.fillStyle = GPAT; ctx.fillRect(0, 0, W, H); }
  if (G.state === 'play') { ctx.drawImage(VIGN, 0, 0, W, H); drawHUD(); }
  drawTurn();
}
function frame(ts) {
  requestAnimationFrame(frame);
  const now = ts / 1000; let d = Math.min(.1, now - lastTs); lastTs = now; if (!(d > 0)) d = 0;
  pollInput(); AU.tick();
  acc += d; let n = 0;
  while (acc >= STEP && n < 14) { step(STEP); acc -= STEP; n++; inp.jumpP = inp.eraseP = inp.startP = inp.pauseP = false; uiTap = null; }
  if (acc > STEP * 14) acc = 0;
  draw();
}
function syncMute() { const b = document.getElementById('bMute'); if (b) b.classList.toggle('off', AU.muted); }
function boot() {
  loadSave(); buildTextures(); fit(); bindPad();
  for (let c = CHAPTERS.length - 1; c >= 0; c--) if (unlocked(c) && !SAVE.books[c].done) SEL = c;
  const bm = document.getElementById('bMute'), bp = document.getElementById('bPause'), bf = document.getElementById('bFull');
  bm.addEventListener('click', () => { AU.unlock(); AU.setMute(!AU.muted); syncMute(); bm.blur(); });
  bp.addEventListener('click', () => { AU.unlock(); if (G.state === 'play' && !G.turn) G.paused = !G.paused; bp.blur(); });
  const el = document.documentElement;
  if (!el.requestFullscreen) bf.style.display = 'none';
  bf.addEventListener('click', () => { try { if (document.fullscreenElement) document.exitFullscreen(); else { const p = el.requestFullscreen(); if (p && p.catch) p.catch(() => { }); } } catch (e) { } bf.blur(); });
  if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) enableTouch();
  requestAnimationFrame(frame);
}
let booted = false;
function bootOnce() { if (booted) return; booted = true; boot(); }
try {
  if (document.fonts && document.fonts.load) {
    Promise.all([document.fonts.load('italic 500 24px "EB Garamond"'), document.fonts.load('500 24px "EB Garamond"')]).then(bootOnce, bootOnce);
    setTimeout(bootOnce, 1500);
  } else bootOnce();
} catch (e) { bootOnce(); }
