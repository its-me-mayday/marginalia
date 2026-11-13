/* ============================================================
   MARGINALIA — capitoli e livelli
   Ogni capitolo è un modulo: per aggiungerne uno basta un nuovo
   oggetto in CHAPTERS con la sua lista di funzioni-livello.
   ============================================================ */
const LH = 20;      // spessore di una riga-piattaforma
const TILE = 40;    // lato delle tessere delle lettere giganti

const THEMES = {
  villa:   { p0: '#f1e6cc', p1: '#dcc9a0', decor: 'arches' },
  rooms:   { p0: '#eee0c2', p1: '#d4bd92', decor: 'shelves' },
  lies:    { p0: '#d6c49b', p1: '#a98f63', decor: 'arches', dark: .9, light: 105 },
  flee:    { p0: '#f4ebd5', p1: '#e2d2ad', decor: 'scribble' },
  under:   { p0: '#c4ad82', p1: '#7d6444', decor: 'beams', dark: .78, light: 210 },
  back:    { p0: '#e9e0cc', p1: '#cbbc9d', decor: 'arches' },
  letters: { p0: '#f5edd9', p1: '#e4d5b2', decor: 'glyphs' },
  mirror:  { p0: '#e8e2d2', p1: '#c2bba8', decor: 'mirrors' },
  boss:    { p0: '#cdb98f', p1: '#876c48', decor: 'boss' }
};

const HINTS = {
  move:  ['← → per muoverti', 'usa le frecce ◀ ▶'],
  jump:  ['SPAZIO per saltare', 'il tasto grande: salta'],
  dbl:   ['salta ancora, a mezz\'aria', 'salta ancora, a mezz\'aria'],
  erase: ['X — lo sbianchetto cancella ciò che è corrotto', 'il tasto ✎ — lo sbianchetto cancella ciò che è corrotto'],
  stomp: ['saltale sopra: una parola sbagliata si corregge', 'saltale sopra: una parola sbagliata si corregge'],
  candle:['la candela mostra ciò che il diario nasconde', 'la candela mostra ciò che il diario nasconde'],
  flee:  ['X da lontano: si gelano dallo spavento. Poi corri', '✎ da lontano: si gelano dallo spavento. Poi corri'],
  beat:  ['esistono solo sul loro battito', 'esistono solo sul loro battito'],
  flip:  ['X — passa da una versione all\'altra, anche in volo', '✎ — passa da una versione all\'altra, anche in volo']
};

function mkLevel(o) {
  return Object.assign({ plats: [], blocks: [], stains: [], bugs: [], marks: [], candles: [], checks: [], hints: [], zones: [], spawn: { x: 100, y: 300 }, exit: null }, o);
}
function builder(L, x, y, dir) {
  dir = dir || 1;
  let zx = null;
  const mk = (text, gap, dy, o) => {
    o = o || {};
    const w = o.w || Math.round(text.length * 9.2 + 14);
    let nx, ny;
    if (!b.last) { nx = dir > 0 ? b.cx : b.cx - w; ny = b.cy; }
    else { ny = b.last.y + (dy || 0); nx = dir > 0 ? b.last.x0 + b.last.w + (gap || 0) : b.last.x0 - (gap || 0) - w; }
    const p = Object.assign({ kind: 'line', layer: 0 }, o, { x: nx, y: ny, x0: nx, w, h: LH, text, dirn: dir });
    L.plats.push(p); return p;
  };
  const b = {
    last: null, cx: x, cy: y,
    ln(text, gap, dy, o) { b.last = mk(text, gap, dy, o); return b; },
    side(text, gap, dy, o) { mk(text, gap, dy, o); return b; },
    spawn() { const p = b.last; L.spawn = { x: dir > 0 ? p.x + 36 : p.x + p.w - 56, y: p.y - 30 }; return b; },
    mark(fx, up) { const p = b.last; L.marks.push({ x: p.x + p.w * (fx === undefined ? .5 : fx), y: p.y - (up === undefined ? 48 : up) }); return b; },
    check(inv) { const p = b.last; L.checks.push({ x: p.x + p.w / 2, y: inv ? p.y + LH : p.y, inv: !!inv }); return b; },
    bug(bad, good, sp) { const p = b.last; const w = bad.length * 9.6 + 10; L.bugs.push({ x: p.x + p.w * .5, y: p.y - 22, w, h: 22, minX: p.x + 4, maxX: p.x + p.w - 4, vx: sp || 55, bad, good }); return b; },
    stain(fx, w, layer, beat) { const p = b.last; const s = { x: p.x + p.w * fx - w / 2, y: p.y - 13, w, h: 18, layer: layer || 0 }; if (beat !== undefined) s.beat = beat; L.stains.push(s); return b; },
    storm() { L.storm = b.last.x; return b; },
    auto() { L.auto = b.last.x; return b; },
    wall(text, fx, layer) { const p = b.last; L.blocks.push({ x: p.x + p.w * (fx === undefined ? .6 : fx) - 23, y: p.y - 300, w: 46, h: 300, text, corrupt: true, off: 0, layer: layer || 0 }); return b; },
    candle(fx) { const p = b.last; L.candles.push({ x: p.x + p.w * (fx === undefined ? .5 : fx), y: p.y - 30, cd: 0 }); return b; },
    hint(k, dx, dy) { const p = b.last; L.hints.push({ x: p.x + (dx === undefined ? p.w / 2 : dx), y: p.y + (dy === undefined ? -84 : dy), k }); return b; },
    say(t) { b.last.say = t; return b; },
    exit() { const p = b.last; L.exit = { x: dir > 0 ? p.x + p.w - 54 : p.x + 14, y: p.y - 74, w: 40, h: 74 }; return b; },
    zoneStart() { zx = b.last.x - 40; return b; },
    zoneEnd() { const x0 = b.last.x + 8; L.zones.push({ x: x0, y: -99999, w: zx - x0, h: 199998 }); return b; }
  };
  return b;
}
const rev = s => s.split(' ').reverse().join(' ');

/* ---------------- CAPITOLO 1 — La casa di Vetrano ---------------- */

function lv1() {
  const L = mkLevel({ name: 'L\'arrivo', date: '3 novembre', theme: 'villa', mood: 0 });
  builder(L, 120, 400)
    .ln('Giunsi a villa Vetrano al calare della sera,').spawn().hint('move', 150, -92)
    .ln('quando la nebbia saliva dal fiume', 70, 0).hint('jump', -60, -100)
    .ln('e i cancelli si aprirono da soli.', 95, -30).mark()
    .ln('Il padrone di casa mi attendeva sulla soglia:', 105, 30)
    .ln('alto, cortese,', 110, -40)
    .ln('pallido come la cera.', 100, -40).mark()
    .ln('«Siete atteso da molto tempo», disse.', 120, 60).check().say('Non gli avevo scritto del mio arrivo.')
    .ln('La casa era calda,', 150, 0).hint('dbl', -110, -120)
    .ln('le lampade accese,', 195, -20)
    .ln('la tavola apparecchiata per uno soltanto.', 200, 20).mark()
    .ln('Egli non mangiò.', 120, -50)
    .ln('Mi mostrò la mia stanza in cima alle scale:', 110, 50).check()
    .ln('un gradino,', 70, -72).ln('poi un altro,', 60, -75).ln('poi un altro ancora,', 60, -75).mark()
    .ln('e mi augurò la buona notte.', 120, -40)
    .ln('Scrivo queste righe a lume di candela.', 130, 90)
    .ln('Tutto, qui, è quiete.', 140, -30).mark()
    .ln('Domani ripartirò di buon mattino.', 150, 30, { glitch: ['mattino', 'mattimo'] }).exit();
  return L;
}

function lv2() {
  const L = mkLevel({ name: 'Le stanze', date: '4 novembre', theme: 'rooms', mood: 1 });
  builder(L, 120, 420)
    .ln('Mi sono svegliato tardi. La porta d\'ingresso è chiusa.').spawn()
    .ln('«Una vecchia serratura», ha sorriso il mio ospite.', 110, -30)
    .ln('Ho visitato le stanze, una dopo l\'altra.', 120, 30).mark()
    .ln('La biblioteca: scaffali fino al soffitto,', 130, -40).say('C\'è una riga, qui, che non ricordo di avere scritto.')
    .ln('libri senza titolo sul dorso, e in fondo una parete di parole.', 110, 40).wall('PASAGIO CHIUSSO', .72).hint('erase', 250, -110)
    .ln('Oltre, la sala da musica.', 120, 0).check()
    .ln('Un clavicembalo che nessuno suona;', 130, -50).bug('clavicenbalo', 'clavicembalo').hint('stomp', 0, -110)
    .ln('eppure, di notte, suona.', 110, -40).mark()
    .ln('Il pavimento scricchiola sotto passi non miei.', 140, 70).bug('pavimneto', 'pavimento', 70)
    .ln('La galleria dei ritratti:', 120, -30).check()
    .ln('cento volti dipinti,', 100, -60)
    .ln('e nessuno gli somiglia.', 110, -50).mark()
    .ln('Ho chiesto chi fossero. «Ospiti», ha detto.', 150, 110).stain(.55, 70).say('Una macchia d\'inchiostro. Ieri non c\'era.')
    .ln('La sala degli specchi è chiusa a chiave.', 130, -20).wall('NULA DA VEDRE', .6)
    .ln('«Non c\'è nulla da vedere», dice lui.', 120, -40).stain(.36, 56).stain(.74, 56)
    .ln('Sono sceso in cucina: rame lucido, focolare freddo.', 140, 60).check()
    .ln('Nessuno cucina, in questa casa.', 120, -30).bug('cucnia', 'cucina', 80)
    .ln('Eppure la tavola è sempre apparecchiata, ogni sera.', 130, -30).wall('SEMPRE', .34).wall('SEMPER', .82).say('Due pareti. Lo sbianchetto ha bisogno di riprendere fiato.')
    .ln('In cantina, botti vuote e una porta di ferro.', 130, 70).stain(.42, 60).mark()
    .ln('Dietro la porta, qualcosa gratta.', 120, -40).bug('gartta', 'gratta', 90)
    .ln('Ho risalito le scale di corsa.', 110, -60)
    .ln('Stasera gli ho chiesto della carrozza.', 140, 40).check()
    .ln('«Domani», ha risposto.', 120, -50).bug('domnai', 'domani', 60)
    .ln('«Domani.»', 110, -50).mark()
    .ln('La mia candela si è spenta da sola.', 140, 60).exit();
  return L;
}

function lv3() {
  const L = mkLevel({ name: 'Il diario mente', date: '7 novembre (o forse l\'8)', theme: 'lies', mood: 2 });
  builder(L, 120, 400)
    .ln('Non è vero che ho paura.').spawn()
    .ln('Ho trovato una candela accesa sul davanzale.', 100, -20).candle(.6).hint('candle', 60, -100).say('Chi l\'ha lasciata accesa? Lui non ne ha bisogno.')
    .side('Il corridoio prosegue diritto, sicuro e ben illuminato.', 110, 0, { kind: 'fake' })
    .ln('non fidarti', 120, 70, { kind: 'hidden' })
    .ln('di ciò che scrive', 90, -20, { kind: 'hidden' })
    .ln('Ho contato le porte: sono dodici.', 110, -40).check().mark()
    .ln('(Ieri erano undici.)', 110, -50).candle()
    .side('Il pavimento è solido, lo giuro.', 120, 40, { kind: 'fake' })
    .ln('sopra', 130, -60, { kind: 'hidden', w: 96 })
    .ln('la riga vera', 100, -50, { kind: 'hidden' }).mark()
    .ln('è sempre altrove', 110, 30, { kind: 'hidden' })
    .ln('Non ho sentito alcun rumore, questa notte.', 120, 60).check().say('Il diario sussurra quando mente. Ascolta.')
    .ln('Il mio ospite è un uomo gentile.', 120, -30).candle(.3)
    .side('Non mi ha mai chiuso dentro.', 110, -10, { kind: 'fake' })
    .side('Potrei andarmene quando voglio.', 500, -30, { kind: 'fake' })
    .ln('lui non dorme', 120, 80, { kind: 'hidden' })
    .ln('lui non mangia', 110, 0, { kind: 'hidden' })
    .ln('lui non si riflette', 110, -40, { kind: 'hidden' }).mark()
    .ln('Oggi è il 7 novembre. O forse l\'8.', 130, -40).check().candle(.7)
    .side('Da qui vedo il cancello aperto.', 120, -70, { kind: 'fake' })
    .ln('il cancello è murato', 130, 50, { kind: 'hidden' })
    .side('Questa riga regge.', 110, -30, { kind: 'fake' })
    .ln('questa no: quella sotto', 120, 60, { kind: 'hidden' })
    .ln('Devo smettere di scrivere bugie.', 130, -50).mark().check()
    .ln('Poi la candela si è spenta, e fuori è scoppiato il temporale.', 120, 30).storm().say('Senza candela resta il lampo. Guarda, ricorda, salta.')
    .side('Di qui si passa.', 110, -20, { kind: 'fake' })
    .ln('a ogni lampo', 120, 60, { kind: 'hidden' })
    .ln('la casa cambia', 110, -30, { kind: 'hidden' })
    .ln('di posto', 110, -40, { kind: 'hidden', w: 110 })
    .ln('Ho visto il giardino, per un istante.', 120, 40).check()
    .side('C\'è un sentiero fino al cancello.', 110, 10, { kind: 'fake' })
    .ln('nessun sentiero', 120, -60, { kind: 'hidden' })
    .ln('solo lapidi', 110, -40, { kind: 'hidden' }).mark()
    .ln('con il mio nome', 110, 50, { kind: 'hidden' })
    .ln('Ma non sono io a scriverle.', 130, -30).exit();
  return L;
}

function lv4() {
  const L = mkLevel({ name: 'Le righe fuggono', date: '9 novembre?', theme: 'flee', mood: 3, flee: true });
  const F = r => ({ kind: 'flee', range: r });
  builder(L, 120, 400)
    .ln('Stanotte non riesco a scrivere.').spawn()
    .ln('Le parole non stanno ferme.', 110, -20).say('Ogni volta che poso la penna, la riga scappa.')
    .ln('ferma!', 110, 0, F(120))
    .ln('Ecco. Lo vedi?', 130, 0).check().hint('flee', 60, -100)
    .ln('non ora', 140, -40, F(170))
    .ln('lasciami stare', 130, -40, F(150))
    .ln('Ho provato a scrivere a mia sorella,', 130, 40).mark().check()
    .ln('ma la frase è corsa via prima del punto.', 120, -30).say('Smettila di spaventarle!')
    .ln('aiuto, una nota!', 150, -50, F(200))
    .ln('ops', 150, -40, Object.assign(F(190), { w: 90 })).mark()
    .ln('io qui non c\'ero', 150, 60, F(190))
    .ln('Persino il mio nome', 140, 30).check()
    .ln('oggi non vuole farsi scrivere.', 110, -40).bug('scirvere', 'scrivere')
    .ln('torno subito', 150, -30, F(210))
    .ln('no no no', 150, -50, F(210))
    .ln('sto solo passando', 150, 40, F(210)).mark()
    .ln('Non tutte fuggono, però.', 150, 40).check().say('Qualcuna è curiosa. Lasciala venire.')
    .ln('ti porto io', 390, 0, { kind: 'ferry', range: 250 })
    .ln('Grazie, ho detto. Non ha risposto.', 130, -20)
    .ln('vengo, vengo', 420, -30, { kind: 'ferry', range: 280 }).mark()
    .ln('via di qui', 140, -40, F(190))
    .ln('Quando finalmente le righe si sono fermate,', 150, 40).check()
    .ln('ho capito che non era di me che avevano paura.', 120, -30).say('Avevano paura di ciò che ti segue.')
    .ln('Avevano paura di ciò che mi seguiva.', 120, -40).exit();
  return L;
}

function lv5() {
  const L = mkLevel({ name: 'Sotto il pavimento', date: 'notte, senza data', theme: 'under', mood: 4, beat: 1.7 });
  const T = (ph) => ({ kind: 'beat', phase: ph, w: 100 });
  builder(L, 120, 220)
    .ln('C\'è un battito sotto le assi del pavimento.').spawn()
    .ln('Non è il mio.', 110, 40)
    .ln('Ho sollevato un\'asse.', 120, 60).say('Tum-tum. Tum-tum. Lo senti anche tu?')
    .ln('Sono sceso.', 110, 80).hint('beat', 150, -90)
    .ln('tum', 120, 50, T(0)).ln('tum', 110, 30, T(1))
    .ln('Sotto la casa c\'è un\'altra casa.', 120, 40).check().mark()
    .ln('tum', 120, 0, T(0)).ln('tum', 120, -30, T(1)).ln('tum', 120, 30, T(0))
    .ln('Più in basso, il buio ha un polso.', 120, 50).check()
    .ln('tum', 130, 30, T(0)).ln('tum', 120, 30, T(1)).ln('tum', 130, -40, T(0)).mark().ln('tum', 120, 40, T(1))
    .ln('Le travi si stringono e si allargano, come costole.', 120, 50, { tempo: 1.52 }).check().say('Più svelto. Si è accorto di te.')
    .ln('tum', 120, 20, T(0)).ln('tum', 120, -30, T(1)).ln('tum', 120, -30, T(0)).ln('tum', 120, 40, T(1)).mark().ln('tum', 120, 40, T(0))
    .ln('Qualcosa di vivo regge questa casa.', 120, 40).check()
    .ln('tum', 115, 0, T(1)).ln('tum', 115, -30, T(0)).ln('tum', 115, 40, T(1)).ln('tum', 115, 0, T(0))
    .ln('Qui sotto le macchie respirano con lui.', 115, 40).check().say('Si gonfiano sul battito. Passa nel silenzio tra un colpo e l\'altro.')
    .ln('Ho contato: uno, e passo. Due, e aspetto.', 120, 30).stain(.55, 110, 0, 0)
    .ln('Uno, e passo. Due, e aspetto. Uno, e passo. Due, e aspetto.', 120, -30).stain(.3, 110, 0, 0).stain(.74, 110, 0, 1)
    .ln('tum', 115, 30, T(0)).ln('tum', 115, -20, T(1))
    .ln('Poi ho smesso di contare, perché contava lui.', 115, 40).stain(.55, 110, 0, 1).mark().check()
    .ln('L\'ho visto.', 120, 40)
    .ln('Non lo scriverò.', 120, -30).exit();
  return L;
}

function lv6() {
  const L = mkLevel({ name: 'A ritroso', date: 'novembre 3', theme: 'back', mood: 5, reverse: true });
  const R = { kind: 'rewind' };
  builder(L, 6400, 400, -1)
    .ln(rev('Racconterò tutto dalla fine, così forse ne uscirò.')).spawn()
    .ln(rev('Alla fine ero prigioniero.'), 110, -30).say('Si legge al contrario. Va\' a sinistra: verso l\'inizio.')
    .ln(rev('Prima ancora, le porte erano dodici.'), 120, 30)
    .ln(rev('prima ancora'), 120, -40, R)
    .ln(rev('ancora prima'), 110, -40, R).mark()
    .ln(rev('Prima ancora, avevo una sorella a cui scrivere.'), 120, 60).check()
    .ln(rev('Poi il pavimento divenne soffitto.'), 120, 0).say('Dove la pagina è capovolta, si cade verso l\'alto.')
    .zoneStart()
    .ln(rev('Camminavo sul soffitto e non mi parve strano.'), -60, -230)
    .ln(rev('Le lampade pendevano all\'insù.'), 110, 30).mark(.5, -68)
    .ln(rev('all\'insù, all\'insù'), 110, -30, R)
    .ln(rev('Il padrone sorrideva, capovolto.'), 120, 20).check(true)
    .zoneEnd()
    .ln(rev('Prima ancora, la tavola era apparecchiata per uno.'), -60, 230)
    .ln(rev('per uno'), 120, -40, R).ln(rev('per uno soltanto'), 110, -40, R).ln(rev('e non ero io'), 110, -40, R).mark()
    .ln(rev('Prima ancora, i cancelli si chiusero da soli.'), 130, 80).check()
    .ln(rev('La nebbia rientrò nel fiume.'), 120, -30).bug('neiba', 'nebbia', 60)
    .zoneStart()
    .ln(rev('La carrozza correva all\'indietro,'), -60, -200)
    .ln(rev('all\'indietro'), 120, 30, R)
    .ln(rev('i cavalli con gli occhi chiusi,'), 120, -30).mark(.5, -68)
    .ln(rev('sempre più indietro'), 120, 0, R)
    .ln(rev('verso una casa che non avevo ancora visto.'), 120, 20).check(true)
    .zoneEnd()
    .ln(rev('Qui il racconto perse il filo:'), -60, 230).check()
    .zoneStart().ln(rev('su,'), -60, -200, { w: 170 }).zoneEnd()
    .ln(rev('giù,'), -60, 210, { w: 170 })
    .zoneStart().ln(rev('su ancora,'), -60, -190, { w: 190 }).mark(.5, -68).zoneEnd()
    .ln(rev('e giù.'), -60, 200, { w: 170 })
    .ln(rev('E all\'inizio, prima di ogni cosa,'), 120, -20).check()
    .ln(rev('c\'era una pagina bianca.'), 120, -30)
    .ln(rev('E una macchia.'), 120, -30).exit();
  return L;
}

const GLY = {
  l: ['##', '##', '##', '##', '##', '##', '##'],
  u: ['', '', '##.##', '##.##', '##.##', '##.##', '#####'],
  i: ['##', '..', '##', '##', '##', '##', '##'],
  n: ['', '', '#####', '##.##', '##.##', '##.##', '##.##'],
  o: ['', '', '#####', '##.##', '##.##', '##.##', '#####'],
  h: ['##...', '##...', '#####', '##.##', '##.##', '##.##', '##.##'],
  a: ['', '', '#####', '...##', '#####', '##.##', '#####'],
  m: ['', '', '#######', '##.#.##', '##.#.##', '##.#.##', '##.#.##'],
  b: ['##...', '##...', '#####', '##.##', '##.##', '##.##', '#####'],
  r: ['', '', '####', '##..', '##..', '##..', '##..'],
  e: ['', '', '#####', '##.##', '#####', '##...', '#####']
};
function lv7() {
  const L = mkLevel({ name: 'Tra le lettere', date: '—', theme: 'letters', mood: 6, chase: true });
  const top = 220;
  const first = { kind: 'line', layer: 0, x: 120, x0: 120, y: 262, w: 440, h: LH, text: 'Mi faccio piccolo. Mi nascondo tra le lettere,', say: 'Dove lui non guarda. Ma la cancellatura non legge: cancella.' };
  L.plats.push(first); L.spawn = { x: 160, y: 232 };
  const words = 'lui non ha ombra e non ha nome ma io ho un nome e lui me lo ruba'.split(' ');
  const MK = { '0,2': 1, '3,2': 1, '4,0': 1, '8,1': 1, '12,2': 1, '17,2': 1 };
  let x = 626;
  words.forEach((wd, wi) => {
    [...wd].forEach((ch, ci) => {
      const g = GLY[ch]; let gw = 0;
      g.forEach(r => gw = Math.max(gw, r.length));
      g.forEach((row, r) => {
        let c = 0;
        while (c < row.length) {
          if (row[c] === '#') { let c1 = c; while (c1 < row.length && row[c1] === '#') c1++; L.blocks.push({ x: x + c * TILE, y: top + r * TILE, w: (c1 - c) * TILE, h: TILE, tile: true }); c = c1; }
          else c++;
        }
      });
      const colTop = col => { for (let r = 0; r < 7; r++) if (g[r][col] === '#') return top + r * TILE; return top + 7 * TILE; };
      if (ci === 0 && wd.length > 1 && (wi % 2 === 1 || wi === 14)) L.checks.push({ x: x + TILE * 1.5, y: colTop(1), inv: false });
      if (wi === 8 && ci === 0) L.fast = x;
      if (MK[wi + ',' + ci]) L.marks.push({ x: x + TILE, y: colTop(0) - 50 });
      x += (gw + 1) * TILE;
    });
    x += TILE;
  });
  const end = { kind: 'line', layer: 0, x: x - 30, x0: x - 30, y: 330, w: 420, h: LH, text: 'Trattengo il respiro. È passata oltre.' };
  L.plats.push(end); L.exit = { x: end.x + end.w - 54, y: end.y - 74, w: 40, h: 74 };
  return L;
}

function lv8() {
  const L = mkLevel({ name: 'Lo specchio', date: 'oggi', theme: 'mirror', mood: 7, mirror: true });
  const A = (w) => ({ layer: 1, w }), B = (w) => ({ layer: 2, w });
  builder(L, 120, 400)
    .ln('La sala degli specchi era aperta.').spawn()
    .ln('Nello specchio c\'ero io.', 110, -30).say('Due versioni della stessa pagina: ciò che è scritto, ciò che è vero.').hint('flip', 40, -100)
    .ln('Lui era accanto a me.', 120, 0, A())
    .ln('Nello specchio non c\'era.', 120, 0, B())
    .ln('Ho guardato meglio.', 120, -30).check()
    .ln('scritto', 110, -40, A(120)).ln('vero', 100, -40, B(120)).ln('scritto', 100, -40, A(120)).mark()
    .ln('C\'erano due stanze nella stessa stanza.', 120, 80).check()
    .ln('In una delle due io scrivevo. Nell\'altra, qualcuno scriveva me.', 130, 30).stain(.3, 250, 1).wall('MURATA', .78, 2)
    .ln('L\'ospite che arriva,', 130, -30).check()
    .ln('vero', 110, -40, B(120)).ln('scritto', 110, 30, A(120)).ln('vero', 110, -40, B(120)).ln('scritto', 110, -30, A(120)).mark()
    .ln('la casa che lo attende,', 120, 60).check()
    .ln('il padrone senza riflesso:', 120, -30, A())
    .ln('li avevo già letti.', 120, -30, B())
    .ln('Li avevo già letti tutti. Tante volte.', 130, 40).stain(.5, 210, 2).say('Non è un diario. È un romanzo. E io ci sono dentro.')
    .ln('Poi lo specchio si è incrinato.', 130, -20).check().auto().say('Ora la pagina cambia versione da sola. Ascolta il vetro.')
    .ln('scritto', 110, -30, A(130)).ln('vero', 100, 0, B(130))
    .ln('qui si respira', 110, 30).mark()
    .ln('vero', 110, -40, B(130)).ln('scritto', 100, -30, A(130)).ln('vero', 100, 30, B(130))
    .ln('Non sono un ospite.', 130, 30).check()
    .ln('Sono', 110, -40, B(110)).ln('una', 100, -40, A(110)).ln('pagina.', 100, -40, B(120)).mark()
    .ln('E qualcuno mi sta rileggendo.', 130, 90).exit();
  return L;
}

const BOSS_TARGETS = [
  ['Egli mi atese sula solia', 'Egli mi attese sulla soglia', 235, 322],
  ['La tavola era aparechiata', 'La tavola era apparecchiata', 725, 322],
  ['Scrivo a lume di candlea', 'Scrivo a lume di candela', 480, 236],
  ['Nesuno gli somilgia', 'Nessuno gli somiglia', 480, 432],
  ['Lui non si rilfette', 'Lui non si riflette', 235, 322],
  ['Il batitto non è mio', 'Il battito non è mio', 725, 322],
  ['Non sono un opsite', 'Non sono un ospite', 480, 236],
  ['Sono una paigna', 'Sono una pagina', 150, 432],
  ['Qualcnuo mi rielgge', 'Qualcuno mi rilegge', 810, 432]
];
function lv9() {
  const L = mkLevel({ name: 'La pagina', date: '', theme: 'boss', mood: 8, boss: true, fixed: true });
  const P = (x, y, w, text) => L.plats.push({ kind: 'line', layer: 0, x, x0: x, y, w, h: LH, text });
  P(60, 470, 840, 'Questa è la mia casa. Questa è la mia pagina. Tu sei soltanto una nota a margine.');
  P(150, 360, 170, 'un margine,');
  P(640, 360, 170, 'una svista,');
  P(395, 270, 170, 'una macchia.');
  L.spawn = { x: 110, y: 440 };
  return L;
}

// le annotazioni del lettore: una per ogni asterisco raccolto
const NOTES = [
  ['Che bella casa. Io non ci entrerei.', '«Atteso»? E da chi?', 'Non mangia. Da ricordare.', 'Troppa gentilezza. Non mi fido.', 'Va tutto troppo bene.'],
  ['Chiusa da fuori, scommetto.', 'Chi suona, di notte?', 'Nessun ritratto gli somiglia. Perché?', 'Vattene. Vattene finché puoi.', 'Seconda volta che lo leggo. Spero sempre che esca.'],
  ['Qui il narratore comincia a mentire.', 'O è il libro, a mentire?', 'Sottolineato tre volte: non si riflette.', 'Le date non tornano più.', 'Vorrei poterlo avvisare.'],
  ['Questa pagina mi è caduta di mano.', 'Ho sbavato l\'inchiostro. Scusa.', 'Anche le parole hanno paura.', 'Qualcuna, però, si fida.'],
  ['Lo sento anch\'io, mentre leggo.', 'Non voltare pagina. Non voltare.', 'Ho voltato pagina.', 'Terza rilettura. Finisce sempre uguale.'],
  ['E se lo leggessi al contrario?', 'Partendo dalla fine, forse si salva.', 'No. Arriva comunque alla villa.', 'All\'inizio c\'era una macchia. È mia?', 'Non ricordo di averla fatta.'],
  ['Da vicino, le lettere fanno paura.', 'Lui non ha nome. Gliene ho dato uno io.', 'Qui ho scritto a penna. Non dovevo.', 'Volevo solo cambiare il finale.', 'La penna ha macchiato tutto.', 'La matita, almeno, si può cancellare.'],
  ['Due libri: quello stampato e quello che ricordo.', 'Quale dei due è vero?', 'Ho corretto una parola. Poi un\'altra.', 'Se lui non può uscire, entrerò io.'],
  []
];
const CHAPTERS = [
  { id: 1, roman: 'I', title: 'La casa di Vetrano', levels: [lv1, lv2, lv3, lv4, lv5, lv6, lv7, lv8, lv9] }
];
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];
