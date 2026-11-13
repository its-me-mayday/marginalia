/* ============================================================
   MARGINALIA — cornice: biblioteca, HUD, transizioni, finale
   ============================================================ */
const SAVE_KEY = 'marginalia.v1';
let SAVE = { li: 0, max: 0, done: false };
function loadSave() { try { const s = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); if (s && typeof s.li === 'number') SAVE = Object.assign(SAVE, s); } catch (e) { } }
function writeSave() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(SAVE)); } catch (e) { } }

const LEVEL_NAMES = CHAPTERS[0].levels.map(f => f().name);
let BTN = []; // zone cliccabili della UI corrente
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
  for (const b of BTN) if (uiTap.x >= b.x && uiTap.x <= b.x + b.w && uiTap.y >= b.y && uiTap.y <= b.y + b.h) { uiTap = null; b.fn(); return true; }
  return false;
}

function startTurn(fn) { G.turn = { t: 0, dur: 1.15, mid: false, fn }; AU.sfx('page'); }
function startGame(i) {
  G.stats = { deaths: 0, time: 0, marks: 0, total: 0, full: false };
  startTurn(() => { G.state = 'play'; G.paused = false; loadLevel(i); SAVE.li = i; SAVE.max = Math.max(SAVE.max, i); writeSave(); });
}
function nextLevel() {
  const n = G.li + 1;
  startTurn(() => { loadLevel(n); SAVE.li = n; SAVE.max = Math.max(SAVE.max, n); writeSave(); });
}
function startEnding() {
  SAVE.done = true; SAVE.li = 0; SAVE.max = CHAPTERS[0].levels.length - 1; writeSave();
  startTurn(() => { G.state = 'ending'; G.end = { t: 0, page: 0 }; AU.setMood(0); parts.length = 0; });
}
function toTitle() { startTurn(() => { G.state = 'title'; G.paused = false; AU.setMood(0); }); }

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
  // lume
  const lg = ctx.createRadialGradient(W / 2, 250, 30, W / 2, 250, 520);
  lg.addColorStop(0, 'rgba(255,190,100,' + (.20 + Math.sin(t * 9) * .012) + ')'); lg.addColorStop(1, 'rgba(0,0,0,.55)');
  ctx.fillStyle = lg; ctx.fillRect(0, 0, W, H);
  if (stainK > 0) { ctx.fillStyle = DEEP; blobPath(700, 360, 60 * stainK, 46 * stainK, t, 3, .2); ctx.fill(); for (let i = 0; i < 4; i++) { const k = (t * .3 + i * .25) % 1; ctx.beginPath(); ctx.ellipse(670 + i * 20, 390 + k * 80 * stainK, 3, 6 * (1 - k), 0, 0, TAU); ctx.fill(); } }
}

function drawTitlePostilla(x, y) {
  const sv = { x: P.x, y: P.y, g: P.g, face: P.face, sx: P.sx, sy: P.sy, dead: P.dead, born: P.born, vx: P.vx, vy: P.vy, ground: P.ground };
  P.x = x - P.w / 2; P.y = y - P.h; P.g = 1; P.face = 1; P.sx = 1; P.sy = 1; P.dead = 0; P.born = 0; P.vx = 0; P.vy = 0; P.ground = true;
  P.blink -= 1 / 60; if (P.blink < -.12) P.blink = rnd(1.5, 4);
  ctx.save(); ctx.translate(x, y); ctx.scale(2.2, 2.2); ctx.translate(-x, -y); drawPostilla(); ctx.restore();
  Object.assign(P, sv);
}

function drawTitle() {
  const t = G.t; BTN = [];
  drawShelf(SAVE.done ? .5 + Math.sin(t) * .05 : 0);
  // il libro aperto
  ctx.save(); ctx.translate(W / 2, 268);
  ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.fillRect(-338, -178, 690, 372);
  const pg = ctx.createLinearGradient(-340, 0, 340, 0); pg.addColorStop(0, '#e2d2a9'); pg.addColorStop(.47, '#f3e9d0'); pg.addColorStop(.5, '#c9b78d'); pg.addColorStop(.53, '#f3e9d0'); pg.addColorStop(1, '#e2d2a9');
  ctx.fillStyle = pg; ctx.fillRect(-340, -186, 680, 372);
  ctx.strokeStyle = 'rgba(160,60,50,.35)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-292, -186); ctx.lineTo(-292, 186); ctx.stroke();
  ctx.fillStyle = INK; ctx.textAlign = 'center';
  ctx.font = '500 76px ' + SERIF; ctx.fillText('MARGINALIA', -18, -72);
  // goccia dalla A
  const k = (t * .35) % 1; ctx.beginPath(); ctx.ellipse(288, -52 + k * 60, 2.6, 5 * (1 - k * .5), 0, 0, TAU); ctx.fill();
  ctx.font = 'italic 24px ' + SERIF; ctx.fillStyle = '#4a3a28'; ctx.fillText('La casa di Vetrano', 0, -34);
  ctx.strokeStyle = 'rgba(60,40,20,.4)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-120, -16); ctx.lineTo(120, -16); ctx.stroke();
  ctx.font = F_HAND; ctx.fillStyle = GRAPHITE;
  ctx.save(); ctx.translate(-205, 168); ctx.rotate(-.04); ctx.textAlign = 'left'; ctx.fillText('chi legge cambia la storia', 0, 0); ctx.restore(); ctx.textAlign = 'center';
  ctx.restore(); ctx.textAlign = 'left';
  drawTitlePostilla(W / 2 + 288, 200 + Math.sin(t * 1.5) * 2);

  const cont = SAVE.li > 0 && !SAVE.done;
  if (cont) {
    button(W / 2 - 270, 300, 300, 46, 'Continua — ' + ROMAN[SAVE.li] + '. ' + LEVEL_NAMES[SAVE.li], () => startGame(SAVE.li), true, true);
    button(W / 2 + 46, 300, 224, 46, 'Ricomincia da capo', () => startGame(0), false, true);
  } else button(W / 2 - 130, 300, 260, 46, SAVE.done ? 'Rileggi dall\'inizio' : 'Inizia a leggere', () => startGame(0), true, true);
  // indice dei livelli già letti
  if (SAVE.max > 0) {
    ctx.font = 'italic 15px ' + SERIF; ctx.fillStyle = '#5a4a36'; ctx.textAlign = 'center'; ctx.fillText('indice', W / 2, 376); ctx.textAlign = 'left';
    const n = CHAPTERS[0].levels.length, bw = 44, x0 = W / 2 - (n * (bw + 8) - 8) / 2;
    for (let i = 0; i < n; i++) {
      const x = x0 + i * (bw + 8), open = i <= SAVE.max;
      ctx.fillStyle = open ? 'rgba(60,40,20,.14)' : 'rgba(60,40,20,.05)'; rr(x, 386, bw, 34, 5); ctx.fill();
      ctx.fillStyle = open ? INK : 'rgba(60,40,20,.3)'; ctx.font = '17px ' + SERIF; ctx.textAlign = 'center'; ctx.fillText(ROMAN[i], x + bw / 2, 409); ctx.textAlign = 'left';
      if (open) BTN.push({ x, y: 386, w: bw, h: 34, fn: () => startGame(i) });
    }
  }
  ctx.textAlign = 'center'; ctx.font = 'italic 17px ' + SERIF; ctx.fillStyle = 'rgba(241,230,204,.7)';
  ctx.fillText(IS_TOUCH ? '◀ ▶ muovi   ·   tasto grande: salta (due volte)   ·   ✎ sbianchetto' : '← → muovi   ·   SPAZIO salta (due volte)   ·   X sbianchetto   ·   P pausa   ·   M audio', W / 2, 492);
  ctx.fillStyle = 'rgba(241,230,204,.4)'; ctx.fillText(SAVE.done ? 'sugli scaffali, altre storie aspettano di essere lette' : 'un racconto della Biblioteca dei Margini', W / 2, 516);
  ctx.textAlign = 'left';
}
function updTitle() {
  if (G.turn) return;
  if (hitButtons()) return;
  if (inp.startP) startGame(SAVE.li > 0 && !SAVE.done ? SAVE.li : 0);
}

/* ---------------- HUD ---------------- */
function drawHUD() {
  const L = G.L, t = G.t;
  ctx.textBaseline = 'alphabetic';
  // intestazione
  ctx.font = 'italic 500 17px ' + SERIF; ctx.fillStyle = THEMES[L.theme].dark ? 'rgba(241,230,204,.75)' : 'rgba(40,28,16,.7)'; ctx.textAlign = 'left';
  ctx.fillText(ROMAN[G.li] + '. ' + L.name, 18, 26);
  // annotazioni
  const got = L.marks.filter(m => m.got).length;
  if (L.marks.length) { ctx.fillText('✶ ' + got + '/' + L.marks.length, 18, 48); }
  // sbianchetto
  const max = L.mirror ? .32 : L.boss ? 1.0 : 1.7, k = clamp(1 - P.cd / max, 0, 1), ex = 150, ey = 38;
  ctx.save(); ctx.translate(ex, ey); ctx.rotate(-.5);
  ctx.fillStyle = 'rgba(30,20,12,.35)'; rr(-15, -8, 30, 16, 4); ctx.fill();
  ctx.fillStyle = k >= 1 ? '#fffaf0' : 'rgba(255,250,240,.55)'; rr(-15, -8, 30 * k, 16, 4); ctx.fill();
  ctx.fillStyle = '#c96a5a'; rr(-15, -8, 8, 16, 3); ctx.fill();
  ctx.restore();
  if (k >= 1) { ctx.globalAlpha = .5 + Math.sin(t * 5) * .3; ctx.strokeStyle = '#fffaf0'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(ex, ey, 21, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1; }
  // candela
  if (P.light > 0) { const w = 90 * clamp(P.light / 7.5, 0, 1); ctx.fillStyle = 'rgba(30,20,12,.4)'; rr(190, 32, 94, 10, 5); ctx.fill(); ctx.fillStyle = '#ffb347'; rr(192, 34, Math.max(4, w), 6, 3); ctx.fill(); }
  // specchio: quale versione
  if (L.auto !== undefined && P.x > L.auto) { const k = clamp(G.autoT / 2.7, 0, 1); ctx.fillStyle = 'rgba(30,20,40,.3)'; rr(W / 2 - 60, 528, 120, 5, 2); ctx.fill(); ctx.fillStyle = G.autoT < .7 ? '#b0412f' : '#4a4660'; rr(W / 2 - 60, 528, Math.max(3, 120 * k), 5, 2); ctx.fill(); }
  if (L.mirror) { ctx.font = 'italic 16px ' + SERIF; ctx.textAlign = 'center'; ctx.fillStyle = G.layer === 1 ? INK : '#4a4660'; ctx.fillText(G.layer === 1 ? '— ciò che è scritto —' : '— ciò che è vero —', W / 2, 520); ctx.textAlign = 'left'; }
  // boss: righe restaurate
  if (G.boss && !G.boss.dead) { for (let i = 0; i < 9; i++) { ctx.fillStyle = i < G.boss.hp ? '#fffaf0' : 'rgba(20,8,30,.6)'; rr(W / 2 - 108 + i * 24 + (i >= 3 ? 8 : 0) + (i >= 6 ? 8 : 0), 506, 18, 6, 3); ctx.fill(); } }
  // cartiglio del livello
  if (G.cardT < 3.2) {
    const a = clamp(G.cardT / .5, 0, 1) * clamp((3.2 - G.cardT) / .7, 0, 1);
    ctx.globalAlpha = a; ctx.textAlign = 'center';
    const dark = THEMES[L.theme].dark;
    ctx.fillStyle = dark ? '#f1e6cc' : INK;
    ctx.font = '19px ' + SERIF; ctx.fillText(ROMAN[G.li], W / 2, 118);
    ctx.font = 'italic 44px ' + SERIF; ctx.fillText(L.name, W / 2, 166);
    if (L.date) { ctx.font = F_HAND; ctx.fillStyle = dark ? 'rgba(241,230,204,.8)' : GRAPHITE; ctx.fillText(L.date, W / 2, 196); }
    ctx.globalAlpha = 1; ctx.textAlign = 'left';
  }
  // voce del diario
  if (G.cap) {
    const c = G.cap, a = clamp(c.t / .35, 0, 1) * clamp((c.dur - c.t) / .5, 0, 1);
    ctx.globalAlpha = a; ctx.font = 'italic 500 21px ' + SERIF; ctx.textAlign = 'center';
    const w = Math.min(W - 80, ctx.measureText(c.text).width + 44);
    ctx.fillStyle = 'rgba(18,11,6,.78)'; rr(W / 2 - w / 2, 62, w, 38, 6); ctx.fill();
    ctx.fillStyle = '#f3e9d0'; ctx.fillText(c.text, W / 2, 87, W - 110);
    ctx.globalAlpha = 1; ctx.textAlign = 'left';
  }
  // annotazione del lettore: un foglietto a matita
  if (G.note) {
    const n = G.note, a = clamp(n.t / .3, 0, 1) * clamp((5 - n.t) / .6, 0, 1);
    ctx.save(); ctx.globalAlpha = a; ctx.translate(W / 2, 452 + (1 - easeOut(clamp(n.t / .4, 0, 1))) * 20); ctx.rotate(-.022);
    ctx.font = 'italic 500 21px ' + SERIF; const w = Math.min(620, ctx.measureText(n.text).width + 70);
    ctx.fillStyle = 'rgba(20,10,4,.3)'; ctx.fillRect(-w / 2 + 4, -22, w, 44);
    ctx.fillStyle = '#f7f0dc'; ctx.fillRect(-w / 2, -26, w, 44);
    ctx.strokeStyle = 'rgba(160,60,50,.4)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-w / 2 + 28, -26); ctx.lineTo(-w / 2 + 28, 18); ctx.stroke();
    ctx.fillStyle = GRAPHITE; ctx.textAlign = 'left'; ctx.fillText('✶', -w / 2 + 8, 3);
    ctx.fillStyle = '#5d5852'; ctx.textAlign = 'center'; ctx.fillText(n.text, 14, 3, w - 60);
    ctx.restore(); ctx.textAlign = 'left';
  }
  if (G.paused) {
    ctx.fillStyle = 'rgba(12,7,4,.72)'; ctx.fillRect(0, 0, W, H); BTN = [];
    ctx.textAlign = 'center'; ctx.fillStyle = '#f1e6cc'; ctx.font = 'italic 40px ' + SERIF; ctx.fillText('Segnalibro', W / 2, 200);
    ctx.font = F_HAND; ctx.fillStyle = 'rgba(241,230,204,.7)'; ctx.fillText('la pagina ti aspetta', W / 2, 232); ctx.textAlign = 'left';
    button(W / 2 - 250, 270, 240, 46, 'Riprendi la lettura', () => { G.paused = false; }, true);
    button(W / 2 + 10, 270, 240, 46, 'Torna alla biblioteca', () => { G.paused = false; toTitle(); }, false);
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

/* ---------------- finale ---------------- */
const END_DUR = [8.5, 4.2, 6.5, 9, 1e9];
function fadeText(s, x, y, t, t0, font, col) { const a = clamp((t - t0) / 1.2, 0, 1); if (a <= 0) return; ctx.globalAlpha = a; ctx.font = font; ctx.fillStyle = col || INK; ctx.fillText(s, x, y); ctx.globalAlpha = 1; }
function drawEnding() {
  const E = G.end, t = E.t; BTN = [];
  if (E.page < 4) {
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#f6eed9'); g.addColorStop(1, '#e6d8b4'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(160,60,50,.35)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(150, 0); ctx.lineTo(150, H); ctx.moveTo(155, 0); ctx.lineTo(155, H); ctx.stroke();
  }
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  if (E.page === 0) {
    fadeText('Giunsi a villa Vetrano al calare della sera.', 200, 190, t, .4, 'italic 27px ' + SERIF);
    fadeText('Fui accolto con ogni cortesia.', 200, 240, t, 1.8, 'italic 27px ' + SERIF);
    fadeText('Ripartii di buon mattino.', 200, 290, t, 3.2, 'italic 27px ' + SERIF);
    if (t > 5) { // il segno di matita, identico a quello di Postilla
      const k = clamp((t - 5) / .9, 0, 1); ctx.strokeStyle = GRAPHITE; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath();
      const X = 100, Y = 284; ctx.moveTo(X - 16, Y + 4);
      const pts = 24; for (let i = 1; i <= pts * k; i++) { const u = i / pts; const x = X - 16 + u * 34, y = Y + 4 - Math.sin(u * Math.PI * 2) * 9 * (u < .5 ? 1.3 : .9) - u * 6; ctx.lineTo(x, y); } ctx.stroke();
    }
  } else if (E.page === 1) {
    ctx.textAlign = 'center'; fadeText('Lo stesso lettore.', W / 2, 280, t, .3, 'italic 46px ' + SERIF);
  } else if (E.page === 2) {
    ctx.textAlign = 'center';
    fadeText('Una nota a margine. Un errore di stampa.', W / 2, 220, t, .3, 'italic 30px ' + SERIF);
    fadeText('Due tracce della stessa mano:', W / 2, 275, t, 2.2, 'italic 30px ' + SERIF);
    fadeText('chi legge un libro, lo cambia.', W / 2, 330, t, 3.8, 'italic 30px ' + SERIF);
  } else if (E.page === 3) {
    ctx.textAlign = 'center';
    fadeText('Ora il libro finisce bene: l\'ospite riparte al mattino.', W / 2, 200, t, .3, 'italic 28px ' + SERIF);
    fadeText('Ma nessuno ricorda come finiva prima.', W / 2, 250, t, 2.4, 'italic 28px ' + SERIF);
    fadeText('Postilla lo ha riparato. O lo ha riscritto?', W / 2, 320, t, 4.6, 'italic 30px ' + SERIF, VIOLET);
  } else {
    drawShelf(clamp((t - 1.5) / 6, 0, 1));
    ctx.textAlign = 'center';
    fadeText('Nella Biblioteca dei Margini i libri non finiscono mai.', W / 2, 150, t, .5, 'italic 25px ' + SERIF, '#f1e6cc');
    fadeText('E da qualche parte, su un altro scaffale, un\'altra pagina comincia a macchiarsi.', W / 2, 200, t, 3, 'italic 23px ' + SERIF, '#f1e6cc');
    const s = G.stats, mm = Math.floor(s.time / 60), ss = ('0' + Math.floor(s.time % 60)).slice(-2);
    fadeText('tempo di lettura ' + mm + ':' + ss + '   ·   annotazioni ' + s.marks + '/' + s.total + '   ·   volte riscritta ' + s.deaths, W / 2, 470, t, 4.5, F_HAND, 'rgba(241,230,204,.75)');
    if (s.full && s.marks >= s.total) fadeText('✶  Ultima nota a margine: «Questa volta, fallo uscire.»', W / 2, 270, t, 5.5, 'italic 500 24px ' + SERIF, '#ffe9b0');
    else fadeText('Il lettore ha lasciato altre note a margine. Non le hai trovate tutte.', W / 2, 270, t, 5.5, F_HAND, 'rgba(241,230,204,.6)');
    if (t > 5.5) button(W / 2 - 130, 370, 260, 46, 'Torna alla biblioteca', () => toTitle(), true);
  }
  if (E.page < 4 && t > 2.5) { ctx.textAlign = 'center'; ctx.globalAlpha = .45 + Math.sin(t * 3) * .2; ctx.font = F_HAND; ctx.fillStyle = GRAPHITE; ctx.fillText(IS_TOUCH ? 'tocca per voltare pagina' : 'SPAZIO per voltare pagina', W / 2, 500); ctx.globalAlpha = 1; }
  ctx.textAlign = 'left';
}
function updEnding(dt) {
  const E = G.end; E.t += dt;
  if (G.turn) return;
  if (hitButtons()) return;
  const skip = (inp.startP || uiTap) && E.t > 1.2;
  if (E.page < 4 && (E.t > END_DUR[E.page] || skip)) { uiTap = null; E.page++; E.t = 0; AU.sfx('page'); }
  else if (E.page === 4 && inp.startP && E.t > 5.5) toTitle();
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
    if (G.paused) { hitButtons(); if (inp.startP && !inp.jumpP) { } return; }
    update(dt);
  }
}
function draw() {
  ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
  ctx.globalAlpha = 1; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  if (G.state === 'title') drawTitle();
  else if (G.state === 'ending') drawEnding();
  else { drawWorld(); }
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
