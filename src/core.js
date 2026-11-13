'use strict';
/* ============================================================
   MARGINALIA — core: canvas, utilità, input, audio, particelle
   ============================================================ */
const W = 960, H = 540, TAU = Math.PI * 2;
const cv = document.getElementById('game');
const ctx = cv.getContext('2d');
let SCALE = 1;
let IS_TOUCH = false;

function fit() {
  const vw = window.innerWidth, vh = window.innerHeight;
  const portrait = vh > vw * 1.05;
  document.body.classList.toggle('portrait', portrait);
  let cw = vw, ch = vw * 9 / 16;
  if (ch > vh) { ch = vh; cw = vh * 16 / 9; }
  cv.style.width = Math.floor(cw) + 'px';
  cv.style.height = Math.floor(ch) + 'px';
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  let bw = Math.round(cw * dpr);
  bw = Math.max(960, Math.min(1920, bw));
  cv.width = bw; cv.height = Math.round(bw * 9 / 16);
  SCALE = bw / W;
}
window.addEventListener('resize', fit);
window.addEventListener('orientationchange', () => setTimeout(fit, 120));

/* ---------- utilità ---------- */
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const rnd = (a = 1, b) => b === undefined ? Math.random() * a : a + Math.random() * (b - a);
const pick = a => a[(Math.random() * a.length) | 0];
const easeOut = t => 1 - (1 - t) * (1 - t) * (1 - t);
const easeIO = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const sgn = v => v < 0 ? -1 : 1;
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

const SERIF = '"EB Garamond", Georgia, "Iowan Old Style", "Palatino Linotype", "Noto Serif", "Times New Roman", serif';
const F_LINE = 'italic 500 24px ' + SERIF;
const F_HAND = 'italic 500 19px ' + SERIF;
const INK = '#17120e', GRAPHITE = '#7d7872', VIOLET = '#3b1c5e', DEEP = '#07040c';

/* ---------- input ---------- */
const keys = {};
const touch = { left: false, right: false, jump: false, erase: false };
const inp = { left: false, right: false, jump: false, jumpP: false, erase: false, eraseP: false, startP: false, pauseP: false };
let prevJ = false, prevE = false, prevS = false, prevPz = false;
let uiTap = null; // {x,y} in coordinate logiche, consumato dalla UI

window.addEventListener('keydown', e => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
  if (!e.repeat) { keys[e.code] = true; AU.unlock(); }
});
window.addEventListener('keyup', e => { keys[e.code] = false; });
window.addEventListener('blur', () => { for (const k in keys) keys[k] = false; for (const k in touch) touch[k] = false; });

cv.addEventListener('pointerdown', e => {
  AU.unlock();
  const r = cv.getBoundingClientRect();
  uiTap = { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H };
  if (e.pointerType === 'touch') enableTouch();
});
function enableTouch() {
  if (IS_TOUCH) return;
  IS_TOUCH = true; document.body.classList.add('touch');
}
function bindPad() {
  document.querySelectorAll('[data-k]').forEach(el => {
    const k = el.getAttribute('data-k');
    const on = e => { e.preventDefault(); AU.unlock(); enableTouch(); touch[k] = true; el.classList.add('on'); };
    const off = e => { e.preventDefault(); touch[k] = false; el.classList.remove('on'); };
    el.addEventListener('pointerdown', on);
    el.addEventListener('pointerup', off);
    el.addEventListener('pointercancel', off);
    el.addEventListener('pointerleave', off);
    el.addEventListener('contextmenu', e => e.preventDefault());
  });
}
function pollInput() {
  let gl = false, gr = false, gj = false, ge = false, gs = false;
  try {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (const g of pads) {
      if (!g || !g.buttons) continue;
      const ax = g.axes && g.axes[0] || 0, b = i => g.buttons[i] && g.buttons[i].pressed;
      if (ax < -.35 || b(14)) gl = true;
      if (ax > .35 || b(15)) gr = true;
      if (b(0)) gj = true;
      if (b(2) || b(1) || b(5)) ge = true;
      if (b(9)) gs = true;
    }
  } catch (e) { /* gamepad non disponibile */ }
  inp.left = !!(keys.ArrowLeft || keys.KeyA || touch.left || gl);
  inp.right = !!(keys.ArrowRight || keys.KeyD || touch.right || gr);
  const j = !!(keys.Space || keys.ArrowUp || keys.KeyW || keys.KeyZ || touch.jump || gj);
  const er = !!(keys.KeyX || keys.ShiftLeft || keys.ShiftRight || keys.KeyK || touch.erase || ge);
  const st = !!(keys.Enter || keys.Space || gj || gs);
  const pz = !!(keys.KeyP || keys.Escape || gs);
  // i fronti restano "agganciati" finché un passo di simulazione non li consuma
  inp.jumpP = inp.jumpP || (j && !prevJ); inp.jump = j; prevJ = j;
  inp.eraseP = inp.eraseP || (er && !prevE); inp.erase = er; prevE = er;
  inp.startP = inp.startP || (st && !prevS); prevS = st;
  inp.pauseP = inp.pauseP || (pz && !prevPz); prevPz = pz;
}

/* ---------- audio procedurale ---------- */
const AU = {
  ctx: null, muted: false, next: 0, mood: 0, bar: 0, stepN: 0,
  unlock() {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') { try { this.ctx.resume(); } catch (e) { } }
  },
  init() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      const c = this.ctx = new AC();
      this.master = c.createGain(); this.master.gain.value = this.muted ? 0 : .8; this.master.connect(c.destination);
      this.music = c.createGain(); this.music.gain.value = .55; this.music.connect(this.master);
      this.fx = c.createGain(); this.fx.gain.value = .8; this.fx.connect(this.master);
      // eco morbida per dare spazio
      const d = c.createDelay(1); d.delayTime.value = .37;
      const fb = c.createGain(); fb.gain.value = .34;
      const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1800;
      d.connect(lp); lp.connect(fb); fb.connect(d); lp.connect(this.music);
      this.echo = d;
      // riverbero: una stanza vuota generata dal rumore
      const rl = Math.floor(c.sampleRate * 3), ib = c.createBuffer(2, rl, c.sampleRate);
      for (let k = 0; k < 2; k++) { const dd = ib.getChannelData(k); for (let i = 0; i < rl; i++) dd[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / rl, 2.8); }
      this.rev = c.createConvolver(); this.rev.buffer = ib;
      const rg = c.createGain(); rg.gain.value = .55; this.rev.connect(rg); rg.connect(this.master);
      this.music.connect(this.rev);
      const fxs = c.createGain(); fxs.gain.value = .25; this.fx.connect(fxs); fxs.connect(this.rev);
      // rumore
      const nb = c.createBuffer(1, c.sampleRate * 1.5, c.sampleRate), ch = nb.getChannelData(0);
      for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;
      this.nbuf = nb;
      // bordone
      this.dr = [];
      const dg = this.droneG = c.createGain(); dg.gain.value = 0;
      const dl = c.createBiquadFilter(); dl.type = 'lowpass'; dl.frequency.value = 420;
      dg.connect(dl); dl.connect(this.music);
      [1, 1.5, 2.005, 2.4].forEach((m, i) => {
        const o = c.createOscillator(); o.type = i === 3 ? 'triangle' : 'sine';
        const g = c.createGain(); g.gain.value = [.5, .22, .16, 0][i];
        o.frequency.value = 73.42 * m; o.connect(g); g.connect(dg); o.start();
        this.dr.push({ o, g, m });
      });
      dg.gain.setTargetAtTime(.22, c.currentTime, 2);
      // pioggia (temporale del livello III)
      const rs = c.createBufferSource(); rs.buffer = nb; rs.loop = true;
      const rf = c.createBiquadFilter(); rf.type = 'bandpass'; rf.frequency.value = 2400; rf.Q.value = .35;
      this.rainG = c.createGain(); this.rainG.gain.value = 0; rs.connect(rf); rf.connect(this.rainG); this.rainG.connect(this.master); rs.start();
      this.next = c.currentTime + .5;
    } catch (e) { this.ctx = null; }
  },
  setMute(m) { this.muted = m; if (this.master) this.master.gain.setTargetAtTime(m ? 0 : .8, this.ctx.currentTime, .05); },
  setMood(m) {
    this.mood = m; this.bar = 0; this.stepN = 0; this.rain(false);
    if (!this.ctx) return;
    const r = 440 * Math.pow(2, (MUSIC[m].root - 24 - 69) / 12), t = this.ctx.currentTime;
    this.dr.forEach(d => d.o.frequency.setTargetAtTime(r * d.m, t, 1.2));
    this.dr[3].g.gain.setTargetAtTime(m >= 2 ? .1 : 0, t, 1);
  },
  rain(on) { if (this.rainG) this.rainG.gain.setTargetAtTime(on ? .09 : 0, this.ctx.currentTime, .8); },
  // voci
  pad(f, dur, vol, when) {
    const c = this.ctx, o = c.createOscillator(), o2 = c.createOscillator(), g = c.createGain(), lp = c.createBiquadFilter();
    o.type = 'triangle'; o2.type = 'sine'; o.frequency.value = f; o2.frequency.value = f * 1.004; lp.type = 'lowpass'; lp.frequency.value = 900;
    g.gain.setValueAtTime(0, when); g.gain.linearRampToValueAtTime(vol, when + dur * .35); g.gain.linearRampToValueAtTime(vol * .7, when + dur * .8); g.gain.linearRampToValueAtTime(0, when + dur * 1.25);
    o.connect(lp); o2.connect(lp); lp.connect(g); g.connect(this.music); o.start(when); o2.start(when); o.stop(when + dur * 1.3); o2.stop(when + dur * 1.3);
  },
  piano(f, vol, when, dec) { this.tone(f, dec || 2.4, 'triangle', vol, this.echo, when); this.tone(f, (dec || 2.4) * .8, 'sine', vol * .8, this.music, when); this.tone(f * 2, 1.1, 'sine', vol * .25, this.music, when); },
  celesta(f, vol, when) { this.tone(f, 1.6, 'sine', vol, this.echo, when); this.tone(f, 1.3, 'sine', vol, this.music, when); this.tone(f * 3, .5, 'sine', vol * .22, this.music, when); },
  pluck(f, vol, when) { this.tone(f, .22, 'triangle', vol, this.music, when); this.tone(f * 2, .1, 'sine', vol * .3, this.echo, when); },
  tone(f, dur, type, vol, dest, when, slide) {
    if (!this.ctx) return;
    const c = this.ctx, t = (when || c.currentTime);
    const o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(f, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, slide), t + dur);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .008);
    g.gain.exponentialRampToValueAtTime(.0008, t + dur);
    o.connect(g); g.connect(dest || this.fx); o.start(t); o.stop(t + dur + .05);
    return g;
  },
  noise(dur, vol, type, f0, f1, q, when) {
    if (!this.ctx) return;
    const c = this.ctx, t = when || c.currentTime;
    const s = c.createBufferSource(); s.buffer = this.nbuf; s.loop = true;
    const f = c.createBiquadFilter(); f.type = type || 'bandpass'; f.Q.value = q || 1;
    f.frequency.setValueAtTime(f0, t); if (f1) f.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const g = c.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .01);
    g.gain.exponentialRampToValueAtTime(.0008, t + dur);
    s.connect(f); f.connect(g); g.connect(this.fx); s.start(t, Math.random()); s.stop(t + dur + .05);
  },
  sfx(n) {
    if (!this.ctx) return;
    switch (n) {
      case 'jump': this.noise(.09, .13, 'bandpass', 2600, 4200, 3); this.tone(392, .12, 'sine', .09, null, null, 700); break;
      case 'jump2': this.noise(.11, .12, 'bandpass', 3400, 5400, 4); this.tone(587, .14, 'sine', .09, null, null, 1050); this.tone(1175, .2, 'sine', .03, this.echo); break;
      case 'land': this.noise(.07, .12, 'lowpass', 500, 180, 1); this.tone(140, .08, 'sine', .08, null, null, 70); break;
      case 'step': this.noise(.035, .05, 'bandpass', 1500 + Math.random() * 900, 700, 1.5); break;
      case 'drip': this.tone(1500 + Math.random() * 500, .12, 'sine', .035, this.echo, null, 700); break;
      case 'erase': this.noise(.42, .3, 'bandpass', 900, 5200, 1.5); this.tone(880, .3, 'sine', .07, null, null, 1760); break;
      case 'nope': this.tone(180, .08, 'square', .04); break;
      case 'die': this.tone(330, .5, 'sawtooth', .09, null, null, 60); this.noise(.5, .18, 'lowpass', 1400, 120, 1); break;
      case 'mark': this.tone(1318, .5, 'sine', .09, this.echo); this.tone(1976, .6, 'sine', .06, this.echo, this.ctx.currentTime + .08); break;
      case 'check': this.tone(587, .6, 'triangle', .08, this.echo); this.tone(880, .8, 'sine', .06, this.echo, this.ctx.currentTime + .12); break;
      case 'stomp': this.tone(660, .18, 'triangle', .1, null, null, 990); this.noise(.1, .12, 'bandpass', 1800, 900, 2); break;
      case 'page': this.noise(.55, .22, 'bandpass', 500, 3200, .8); break;
      case 'whisper': this.noise(.9, .07, 'bandpass', 1900, 1300, 6); this.noise(.7, .05, 'bandpass', 3100, 2400, 8, this.ctx.currentTime + .15); break;
      case 'candle': this.tone(784, .7, 'sine', .08, this.echo); this.noise(.3, .08, 'highpass', 4000, 6000, 1); break;
      case 'flip': this.tone(220, .35, 'sine', .1, null, null, 440); this.tone(440, .35, 'sine', .06, null, null, 220); break;
      case 'flee': this.tone(900, .12, 'triangle', .04, null, null, 1500); break;
      case 'hit': this.tone(110, .5, 'sawtooth', .14, null, null, 40); this.noise(.35, .25, 'lowpass', 2400, 200, 1); break;
      case 'shoot': this.tone(240, .25, 'square', .035, null, null, 120); break;
      case 'thunder': this.noise(1.6, .5, 'lowpass', 900, 60, .7); this.tone(48, 1.2, 'sine', .3, null, null, 30); break;
      case 'crack': this.noise(.12, .2, 'highpass', 5000, 7000, 2); this.tone(2400, .1, 'square', .03); this.noise(.1, .16, 'highpass', 4200, 6400, 2, this.ctx.currentTime + .22); break;
      case 'swim': this.noise(.16, .1, 'lowpass', 700, 250, 1); this.tone(300, .12, 'sine', .04, null, null, 520); break;
      case 'growl': this.tone(70, .7, 'sawtooth', .12, null, null, 48); this.noise(.6, .1, 'lowpass', 300, 120, 2); break;
      case 'whistle': this.tone(1480, 1, 'square', .05, null, null, 1380); this.tone(1976, 1, 'sine', .05, null, null, 1860); this.noise(1, .08, 'bandpass', 3000, 2600, 3); break;
      case 'win': [293.66, 440, 587.33, 880].forEach((f, i) => this.tone(f, 2.2, 'sine', .08, this.echo, this.ctx.currentTime + i * .22)); break;
    }
  },
  heart(strong) {
    if (!this.ctx) return;
    this.tone(strong ? 62 : 50, .22, 'sine', strong ? .55 : .38, this.fx, null, 34);
  },
  // partitura: progressione di accordi, arpeggio di pianoforte e il tema di Postilla
  tick() {
    if (!this.ctx || this.ctx.state !== 'running') return;
    const c = this.ctx, t = c.currentTime, M = MUSIC[this.mood];
    if (this.next < t - 1) this.next = t + .05;
    const hz = n => 440 * Math.pow(2, (n - 69) / 12);
    while (this.next < t + .3) {
      const w = this.next, sN = this.stepN++, inBar = sN % 8;
      const prog = PROGS[M.prog], ch = CHORDS[prog[this.bar % prog.length]];
      if (inBar === 0) {
        const dur = M.st * 8;
        if (M.pad) for (const n of ch) this.pad(hz(M.root + n), dur, M.pad, w);
        this.tone(hz(M.root + ch[0] - 12), dur * 1.1, 'sine', M.bass, this.music, w);
      }
      if (M.walk) { const wn = [ch[0], ch[1], ch[2], ch[1] + (inBar % 3 ? 0 : 2)][inBar % 4] - 12; this.tone(hz(M.root + wn), M.st * 1.5, 'sine', .11, this.music, w); this.tone(hz(M.root + wn + 12), .12, 'triangle', .03, this.music, w); if (inBar % 2) this.noise(.05, .025, 'highpass', 7000, 9000, 1, w); }
      if (M.ost && inBar % 2 === 0) { const g = this.tone(hz(M.root + ch[0] - 12 + (inBar === 6 ? 7 : 0)), M.st * 1.6, 'sawtooth', M.ost, this.music, w); }
      // tema: sette note, ogni quattro battute
      const motifBar = this.bar % 4 === (M.motif || 0);
      if (M.motif !== undefined && motifBar && inBar < 7) { const mo = [7, 10, 12, 10, 15, 14, 12][inBar]; if (inBar !== 3 || true) this.celesta(hz(M.root + 12 + mo), .05, w); }
      else if (Math.random() < M.dens) {
        const tones = [ch[0], ch[1], ch[2], ch[0] + 12, ch[1] + 12];
        const n = M.style === 'pluck' ? tones[[0, 1, 2, 3, 2, 1, 4, 2][inBar]] : pick(tones);
        const f = hz(M.root + 12 + n + (M.sour && Math.random() < .12 ? 1 : 0));
        if (M.style === 'pluck') this.pluck(f, .07, w); else if (M.style === 'box') this.celesta(f * 2, .04, w); else this.piano(f, .045 + Math.random() * .02, w, M.dec);
      }
      if (inBar === 7) this.bar++;
      this.next += M.st * (M.style === 'pluck' || M.ost ? 1 : .92 + Math.random() * .16);
    }
  }
};
// accordi (semitoni dalla tonica) e progressioni
const CHORDS = { I: [0, 4, 7], IV: [5, 9, 12], Vm: [-5, -1, 2], vi: [-3, 0, 4], ii: [2, 5, 9], i: [0, 3, 7], VI: [-4, 0, 3], iv: [5, 8, 12], V: [-5, -1, 2], III: [3, 7, 10], VII: [-2, 2, 5], bII: [1, 5, 8] };
const PROGS = [['i', 'VI', 'iv', 'V'], ['i', 'iv', 'VII', 'III'], ['i', 'i', 'VI', 'V'], ['i', 'bII', 'i', 'V'], ['i', 'VII', 'VI', 'V'], ['I', 'vi', 'IV', 'Vm'], ['I', 'IV', 'I', 'Vm'], ['vi', 'IV', 'I', 'Vm'], ['I', 'ii', 'IV', 'Vm']];
// una voce diversa per ogni livello
const MUSIC = [
  { root: 50, st: .46, prog: 0, dens: .5, pad: .03, bass: .09, motif: 0 },                    // L'arrivo / biblioteca
  { root: 50, st: .42, prog: 1, dens: .6, pad: .028, bass: .09, motif: 2 },                   // Le stanze
  { root: 48, st: .56, prog: 3, dens: .28, pad: .034, bass: .1, sour: true, dec: 3 },         // Il diario mente
  { root: 53, st: .25, prog: 4, dens: .85, pad: .018, bass: .07, style: 'pluck' },            // Le righe fuggono
  { root: 45, st: .7, prog: 3, dens: .1, pad: .045, bass: .13, sour: true, dec: 3.4 },        // Sotto il pavimento
  { root: 49, st: .44, prog: 4, dens: .55, pad: .03, bass: .09, motif: 1 },                   // A ritroso
  { root: 47, st: .27, prog: 2, dens: .7, pad: .02, bass: .08, ost: .028 },                   // Tra le lettere
  { root: 48, st: .5, prog: 1, dens: .45, pad: .034, bass: .09, motif: 3, dec: 3 },           // Lo specchio
  { root: 44, st: .23, prog: 3, dens: .8, pad: .03, bass: .11, ost: .04, sour: true, dec: 1.2 }, // La pagina
  // libro secondo: carillon, pizzicati, tonalità maggiori
  { root: 60, st: .3, prog: 5, dens: .7, pad: .02, bass: .07, style: 'box', motif: 0 },          // C'era una volta
  { root: 62, st: .27, prog: 6, dens: .8, pad: .018, bass: .07, style: 'pluck', sour: true },    // Parole scambiate
  { root: 57, st: .5, prog: 7, dens: .22, pad: .03, bass: .09, style: 'box', dec: 2 },           // Un, due, tre, lupo
  { root: 65, st: .26, prog: 8, dens: .75, pad: .02, bass: .07, style: 'box', motif: 2 },        // Giorno e notte
  { root: 58, st: .4, prog: 7, dens: .45, pad: .04, bass: .08, style: 'box', dec: 3 },           // Il bosco allagato
  { root: 64, st: .3, prog: 5, dens: .7, pad: .02, bass: .07, style: 'pluck', motif: 1 },        // Le rime
  { root: 55, st: .48, prog: 7, dens: .35, pad: .034, bass: .09, style: 'box', motif: 3 },       // La lanterna
  { root: 52, st: .22, prog: 6, dens: .85, pad: .025, bass: .1, ost: .03, style: 'pluck', sour: true }, // Il Narratore
  // libro terzo: contrabbasso che cammina, piano rado, spazzole
  { root: 50, st: .36, prog: 0, dens: .3, pad: .02, bass: 0, walk: true, dec: 1.6 },               // La stazione
  { root: 48, st: .42, prog: 4, dens: .25, pad: .026, bass: 0, walk: true, dec: 2, sour: true },   // La scena del delitto
  { root: 53, st: .24, prog: 1, dens: .5, pad: .016, bass: 0, walk: true, dec: 1 },                // Sul tetto del treno
  { root: 50, st: .4, prog: 2, dens: .32, pad: .02, bass: 0, walk: true, dec: 1.8, motif: 3 },     // Gli interrogatori
  { root: 46, st: .46, prog: 3, dens: .15, pad: .03, bass: 0, walk: true, dec: 2.4, sour: true },  // Il pedinamento
  { root: 57, st: .3, prog: 1, dens: .6, pad: .018, bass: .06, style: 'box', motif: 1 },           // Il palazzo mentale
  { root: 49, st: .2, prog: 3, dens: .6, pad: .02, bass: 0, walk: true, ost: .02, dec: .9 },       // Le prove contro Postilla
  { root: 45, st: .22, prog: 4, dens: .7, pad: .026, bass: 0, walk: true, ost: .03, sour: true, dec: 1 } // Il vagone ristorante
];

/* ---------- particelle ---------- */
const parts = [];
function puff(x, y, n, o) {
  o = o || {};
  for (let i = 0; i < n; i++) {
    if (parts.length > 700) parts.shift();
    const a = o.ang !== undefined ? o.ang + rnd(-(o.spread || .5), o.spread || .5) : rnd(TAU);
    const sp = rnd(o.s0 || 20, o.s1 || 120);
    parts.push({
      x: x + rnd(-(o.jx || 0), o.jx || 0), y: y + rnd(-(o.jy || 0), o.jy || 0),
      vx: Math.cos(a) * sp + (o.vx || 0), vy: Math.sin(a) * sp + (o.vy || 0),
      life: 0, max: rnd(o.l0 || .3, o.l1 || .8), size: rnd(o.z0 || 1.5, o.z1 || 4),
      col: o.col || INK, grav: o.grav === undefined ? 500 : o.grav, drag: o.drag || 0, glow: o.glow || 0
    });
  }
}
function updParts(dt) {
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i]; p.life += dt;
    if (p.life >= p.max) { parts.splice(i, 1); continue; }
    p.vy += p.grav * dt;
    if (p.drag) { p.vx *= 1 - p.drag * dt; p.vy *= 1 - p.drag * dt; }
    p.x += p.vx * dt; p.y += p.vy * dt;
  }
}
function drawParts() {
  for (const p of parts) {
    const k = 1 - p.life / p.max;
    ctx.globalAlpha = Math.min(1, k * 1.6);
    ctx.fillStyle = p.col;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (.4 + .6 * k), 0, TAU); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/* ---------- forme d'inchiostro ---------- */
function blobPath(cx, cy, rx, ry, t, seed, wob) {
  const n = 12; ctx.beginPath();
  let px = [], py = [];
  for (let i = 0; i < n; i++) {
    const a = i / n * TAU;
    const k = 1 + wob * (Math.sin(a * 3 + t * 1.7 + seed) * .5 + Math.sin(a * 5 - t * 1.1 + seed * 2.3) * .3 + Math.sin(a * 2 + t * .6 + seed * .7) * .4);
    px.push(cx + Math.cos(a) * rx * k); py.push(cy + Math.sin(a) * ry * k);
  }
  ctx.moveTo((px[0] + px[n - 1]) / 2, (py[0] + py[n - 1]) / 2);
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    ctx.quadraticCurveTo(px[i], py[i], (px[i] + px[j]) / 2, (py[i] + py[j]) / 2);
  }
  ctx.closePath();
}
function rr(x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
}
function mkCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

/* grana di carta e vignettatura (pre-renderizzate) */
let GRAIN = null, VIGN = null, DARKC = null, DARKX = null;
function buildTextures() {
  GRAIN = mkCanvas(256, 256);
  const g = GRAIN.getContext('2d'), r = rng(7);
  for (let i = 0; i < 5200; i++) {
    const v = r();
    g.fillStyle = v > .4 ? 'rgba(60,40,20,' + (.025 + r() * .05) + ')' : 'rgba(255,250,235,' + (.015 + r() * .03) + ')';
    g.fillRect(r() * 256, r() * 256, 1 + r() * 2.2, 1 + r() * 1.4);
  }
  for (let i = 0; i < 26; i++) { // fibre
    g.strokeStyle = 'rgba(90,60,30,' + (.03 + r() * .04) + ')'; g.lineWidth = .6;
    const x = r() * 256, y = r() * 256; g.beginPath(); g.moveTo(x, y); g.lineTo(x + r() * 30 - 15, y + r() * 12 - 6); g.stroke();
  }
  VIGN = mkCanvas(480, 270);
  const v = VIGN.getContext('2d');
  const gr = v.createRadialGradient(240, 135, 90, 240, 135, 300);
  gr.addColorStop(0, 'rgba(40,22,8,0)'); gr.addColorStop(.7, 'rgba(40,22,8,.16)'); gr.addColorStop(1, 'rgba(22,10,4,.55)');
  v.fillStyle = gr; v.fillRect(0, 0, 480, 270);
  DARKC = mkCanvas(480, 270); DARKX = DARKC.getContext('2d');
}
