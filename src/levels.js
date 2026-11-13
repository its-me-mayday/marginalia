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
  const L = mkLevel({ name: 'La pagina', date: '', theme: 'boss', mood: 8, boss: true, fixed: true, targets: BOSS_TARGETS, bossSay: ['«Tu correggi. Io riscrivo.»', '«Anche il pavimento è una frase. E le frasi si cambiano.»', '«Ci ha scritti la stessa mano. Guardami: sono te, senza la gomma.»'] });
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

/* ================= LIBRO SECONDO — C'era una volta, forse ================= */
Object.assign(THEMES, {
  meadow:  { p0: '#fffaf0', p1: '#e4f1c8', decor: 'hills', fairy: true },
  forest:  { p0: '#f6f7e4', p1: '#cfe3b4', decor: 'trees', fairy: true },
  wolf:    { p0: '#f3ecdb', p1: '#d9c9a4', decor: 'trees', fairy: true },
  sky:     { p0: '#fff3d6', p1: '#bfe3f2', decor: 'sky', fairy: true },
  sea:     { p0: '#d6f1f4', p1: '#63aebf', decor: 'waves', fairy: true },
  rhyme:   { p0: '#fdf0f7', p1: '#dcd3f2', decor: 'stars', fairy: true },
  lantern: { p0: '#b9c3d8', p1: '#59628a', decor: 'trees', fairy: true, dark: .9, light: 250, brinaLight: true },
  teller:  { p0: '#fbf3df', p1: '#e8c9a8', decor: 'boss', fairy: true }
});
Object.assign(HINTS, {
  copy:  ['tocca una parola: Postilla la ricalca per un po\'', 'tocca una parola: Postilla la ricalca per un po\''],
  swap:  ['X — rimetti a posto la parola scambiata', '✎ — rimetti a posto la parola scambiata'],
  wolf:  ['quando apre l\'occhio: immobile!', 'quando apre l\'occhio: immobile!'],
  sun:   ['X — cancella il sole (o la luna)', '✎ — cancella il sole (o la luna)'],
  swim:  ['qui si nuota: salta per risalire', 'qui si nuota: ▲ per risalire'],
  sasso: ['da sasso si sfondano i rovi', 'da sasso si sfondano i rovi']
});
// estensioni del costruttore per la fiaba
function fbuilder(L, x, y) {
  const b = builder(L, x, y, 1); let wx = null;
  L.words = L.words || []; L.wolves = L.wolves || []; L.npcs = L.npcs || [];
  b.word = (k, fx) => { const p = b.last; L.words.push({ x: p.x + p.w * (fx === undefined ? .5 : fx), y: p.y - 44, k, cd: 0 }); return b; };
  b.sw = (bad, good, gap, dy) => b.ln(bad, gap, dy, { kind: 'swap', good, w: Math.max(110, Math.round(good.length * 9.2 + 30)) });
  b.rh = (text, key, gap, dy, reveals) => b.ln(text, gap, dy, { kind: 'rhyme', key, reveals });
  b.rev = (key) => { b.last.reveals = key; return b; };
  b.rovi = (fx) => { const p = b.last; L.blocks.push({ x: p.x + p.w * fx - 20, y: p.y - 300, w: 40, h: 300, twig: true, off: 0 }); return b; };
  b.npc = (fx, text) => { const p = b.last; L.npcs.push({ x: p.x + p.w * (fx === undefined ? .7 : fx), y: p.y, text, seen: false, a: 1 }); return b; };
  b.wolfStart = () => { wx = b.last.x + b.last.w + 10; return b; };
  b.wolfEnd = () => { const p = b.last; L.wolves.push({ x0: wx, x1: p.x + p.w + 10, y: p.y, t: 0 }); return b; };
  return b;
}

function fb1() {
  const L = mkLevel({ name: 'C\'era una volta', date: 'pagina 1', theme: 'meadow', mood: 9, brina: false });
  fbuilder(L, 120, 400)
    .ln('C\'era una volta una bambina di nome Brina,').spawn()
    .ln('che abitava dove finisce il prato', 100, -20)
    .ln('e comincia il bosco.', 110, -30).mark()
    .ln('Una sera la mamma le diede una lanterna:', 120, 40).check().say('In questo libro Postilla sa ricalcare le parole. Toccale.')
    .ln('«Portala alla nonna, prima che faccia notte.»', 120, 0).word('rana', .82).hint('copy', 120, -110)
    .ln('Il sentiero saliva,', 110, -235)
    .ln('saliva,', 100, -60).mark()
    .ln('e poi scendeva nella valle.', 110, 80).mark().check()
    .ln('Brina aveva paura dei burroni,', 120, 30).word('piuma', .82)
    .ln('ma quella sera si sentiva leggera come una piuma.', 430, 70)
    .ln('Attraversò il prato,', 120, -20).bug('parto', 'prato', 60)
    .ln('salutò le lucciole,', 110, -40).mark()
    .ln('e arrivò al limitare del bosco.', 120, 40).check()
    .ln('Fin qui, la fiaba andava come doveva.', 120, -20, { glitch: ['doveva', 'dolveva'] }).exit();
  return L;
}
function fb2() {
  const L = mkLevel({ name: 'Parole scambiate', date: 'pagina 7', theme: 'forest', mood: 10, brina: true });
  fbuilder(L, 120, 400)
    .ln('Nel bosco, però, qualcosa non tornava.').spawn()
    .ln('Brina cercò il ponte sul ruscello.', 110, -20).say('Qui il Refuso non macchia: scambia. E Brina si fida di ciò che legge.')
    .sw('fumo', 'ponte', 120, 0).hint('swap', -180, -100)
    .ln('Dall\'altra parte il sentiero continuava.', 120, 0).check().mark()
    .sw('nebbia', 'pietra', 110, -40).sw('sogno', 'gradino', 100, -50).mark()
    .ln('Un viandante, seduto su un ceppo, scriveva qualcosa.', 120, 40).npc(.8, '«Non badare a me», ha detto. E più avanti una parola è cambiata.')
    .ln('Quando Brina si avvicinò, non c\'era più.', 120, -20).check()
    .sw('vento', 'tronco', 120, 30)
    .ln('Gli scoiattoli si chiamavano sassi,', 120, -30).bug('scoiattloi', 'scoiattoli', 70)
    .sw('aria', 'radice', 120, -40).sw('eco', 'ramo', 110, -40).sw('nulla', 'foglia', 110, 40).mark()
    .ln('e i sassi non rispondevano.', 120, 40).check().mark()
    .ln('La civetta faceva chicchirichì,', 120, -30).bug('cicvetta', 'civetta', 80)
    .sw('ombra', 'sasso', 120, -30).sw('fiato', 'muschio', 110, 50).mark()
    .ln('In fondo al sentiero c\'era una casetta.', 120, 30).exit();
  return L;
}
function fb3() {
  const L = mkLevel({ name: 'Un, due, tre, lupo', date: 'pagina 12', theme: 'wolf', mood: 11, brina: true });
  fbuilder(L, 120, 400)
    .ln('Davanti alla casetta dormiva un lupo.').spawn()
    .ln('Brina si mise a camminare in punta di piedi.', 110, 0).say('Quando il lupo apre l\'occhio, resta immobile.').hint('wolf', 60, -100)
    .wolfStart()
    .ln('Un passo,', 80, 0).ln('un altro passo,', 80, -20).ln('e ferma.', 80, 0)
    .wolfEnd()
    .ln('Il lupo si girò dall\'altra parte.', 110, 30).check().mark()
    .wolfStart()
    .ln('Zitta zitta,', 90, -30).ln('piano piano,', 90, -30).mark().ln('col cuore in gola,', 90, 30).stain(.5, 46).ln('passò oltre.', 90, 30)
    .wolfEnd()
    .ln('Poi il lupo parlò, con la voce della nonna:', 120, 0).check().say('Nella fiaba che ricordo, il lupo non parlava così.')
    .wolfStart()
    .ln('«Vieni più vicino,', 90, -40).ln('bambina mia,', 90, -40).bug('bmabina', 'bambina', 50).ln('che non ti vedo bene.»', 100, 40).mark().ln('«E parla più forte.»', 90, 40)
    .wolfEnd()
    .ln('«Tu non sei la nonna», disse Brina.', 120, 30).check().mark()
    .ln('«E tu non sei sola», disse il lupo, guardando Postilla.', 120, -20).exit();
  return L;
}
function fb4() {
  const L = mkLevel({ name: 'Giorno e notte', date: 'pagina 19', theme: 'sky', mood: 12, brina: true, mirror: true, autoPeriod: 3.4, labels: ['— giorno —', '— notte —'] });
  const A = (w) => ({ layer: 1, w }), B = (w) => ({ layer: 2, w });
  fbuilder(L, 120, 400)
    .ln('Uscita dal bosco, Brina alzò gli occhi.').spawn().auto().say('Il sole e la luna si sono scambiati il turno. E non si mettono d\'accordo.')
    .ln('Il cielo cambiava idea ogni momento.', 110, -20).hint('sun', 40, -100).mark(.8)
    .ln('di giorno', 110, -30, A(130)).ln('di notte', 100, 0, B(130))
    .ln('Le ombre non sapevano da che parte stare.', 110, 30).check().mark()
    .ln('col sole', 110, -40, A(130)).ln('con la luna', 100, -40, B(130)).ln('col sole', 100, 30, A(130))
    .ln('I galli cantavano e i gufi rispondevano.', 110, 40).check().word('rana', .85)
    .ln('lassù', 110, -235).mark()
    .ln('di notte', 100, 0, B(130)).ln('di giorno', 100, 40, A(130))
    .ln('Brina rise: non aveva mai visto due albe in un minuto.', 120, 60).check().mark(.8)
    .ln('Di giorno il sentiero scottava. Di notte un cancello lo chiudeva.', 130, 30).stain(.3, 230, 1).wall('NOTTE', .78, 2)
    .ln('Poi il sole e la luna si misero in fila,', 130, -20).check()
    .ln('uno', 110, -40, A(110)).ln('due', 100, -40, B(110)).ln('uno', 100, -40, A(110)).mark()
    .ln('e il cielo tornò uno solo.', 120, 90).exit();
  return L;
}
function fb5() {
  const L = mkLevel({ name: 'Il bosco allagato', date: 'pagina 26', theme: 'sea', mood: 13, brina: true, water: true, flatY: true });
  const P0 = { kind: 'line', layer: 0, x: 120, x0: 120, y: 300, w: 400, h: LH, text: 'Dove doveva esserci il bosco, c\'era il mare.', say: 'Qualcuno ha scambiato «bosco» con «mare». Si nuota.' };
  L.plats.push(P0); L.spawn = { x: 160, y: 270 }; L.hints.push({ x: 300, y: 210, k: 'swim' });
  // meduse d'inchiostro: [x, y, w, h, ampiezza, velocità]
  const M = [[760, 60, 90, 190], [1020, 330, 90, 180], [1290, 50, 90, 150], [1290, 360, 90, 150], [1580, 190, 80, 110, 110, 1.3], [1880, 50, 100, 230], [2150, 300, 100, 210],
    [2450, 200, 80, 100, 130, 1.6], [2740, 40, 90, 170], [2740, 340, 90, 170], [3040, 150, 80, 100, 120, 2], [3320, 300, 90, 110, 110, 1.4], [3620, 50, 100, 250], [3900, 290, 100, 220],
    [4190, 60, 90, 170], [4190, 350, 90, 160], [4480, 200, 80, 100, 140, 2.1], [4770, 120, 80, 100, 100, 1.7], [5060, 60, 100, 240], [5330, 280, 100, 230]];
  for (const m of M) L.stains.push({ x: m[0], y: m[1], y0: m[1], w: m[2], h: m[3], layer: 0, amp: m[4] || 0, sp: m[5] || 0, jelly: true });
  [[1160, 270], [2020, 290], [2900, 270], [3780, 280], [4640, 300]].forEach(c => L.checks.push({ x: c[0], y: c[1], inv: false, float: true }));
  [[1290, 262], [2450, 80], [3620, 400], [4190, 285], [5200, 150]].forEach(m => L.marks.push({ x: m[0], y: m[1] }));
  const P1 = { kind: 'line', layer: 0, x: 5560, x0: 5560, y: 300, w: 480, h: LH, text: 'Brina toccò terra, bagnata fino alle trecce.' };
  L.plats.push(P1); L.exit = { x: P1.x + P1.w - 54, y: P1.y - 74, w: 40, h: 74 };
  return L;
}
function fb6() {
  const L = mkLevel({ name: 'Le rime', date: 'pagina 33', theme: 'rhyme', mood: 14, brina: true });
  fbuilder(L, 120, 400)
    .ln('Sull\'altra riva la fiaba parlava in rima.').spawn().say('Ogni riga chiama la sua rima. Ma la rima dura poco.')
    .ln('Brina guardò la luna,', 110, -20).rev('a')
    .rh('e non ne vide nessuna,', 'a', 110, -30, 'b').rh('né bianca né bruna.', 'b', 100, -30)
    .ln('Allora batté le mani,', 110, 40).check().rev('c')
    .rh('e i sassi si fecero pani,', 'c', 110, -40, 'd').rh('e i lupi si fecero cani', 'd', 100, -40).mark()
    .ln('che scodinzolavano piano.', 110, 50).check().mark()
    .ln('Poi volle passare il torrente,', 120, -20).word('piuma', .85).rev('e')
    .rh('leggera come niente,', 'e', 400, 60, 'f').rh('sopra la corrente.', 'f', 110, -30)
    .ln('Atterrò tra i girasoli,', 110, 30).check().mark().rev('g')
    .rh('che di notte restano soli,', 'g', 110, -40, 'h').rh('e di giorno prendono voli', 'h', 100, -40, 'i').rh('di parole.', 'i', 100, 40).mark()
    .ln('Il viandante applaudì, da dietro un albero.', 110, 40).check().npc(.75, '«Brava», ha detto. Poi ha cancellato un verso.')
    .ln('E una rima, da allora, non tornò più.', 120, -20).rev('j')
    .rh('Brina cercò l\'uscita,', 'j', 110, -30, 'k').rh('con la fiaba mezza sparita,', 'k', 100, 40, 'l').rh('e la trovò con le dita.', 'l', 100, -40).mark()
    .ln('Ormai faceva buio.', 110, 50).exit();
  return L;
}
function fb7() {
  const L = mkLevel({ name: 'La lanterna', date: 'pagina 41', theme: 'lantern', mood: 15, brina: true });
  fbuilder(L, 120, 400)
    .ln('Si fece notte davvero, e Brina accese la lanterna.').spawn().say('La luce è di Brina. Non correre troppo avanti.')
    .ln('La casa della nonna era oltre i rovi.', 110, -20).word('sasso', .3).rovi(.82).hint('sasso', 30, -100)
    .ln('Brina passò dove Postilla aveva aperto.', 120, 0).check().mark()
    .sw('paura', 'sentiero', 110, -30).sw('silenzio', 'scalino', 100, -40).mark()
    .ln('Una finestra accesa, laggiù.', 120, 50).stain(.6, 56).mark(.15)
    .ln('Ma tra lei e la finestra c\'era il viandante.', 120, -20).check().npc(.8, '«Questa fiaba la so a memoria. Finiva male. L\'ho cambiata io.»')
    .ln('«Da bambino piangevo sempre, a questo punto.»', 120, 30).word('sasso', .12).rovi(.5).rovi(.88)
    .ln('«Così ho preso la matita.»', 120, -30).mark()
    .sw('forse', 'ponte', 110, -40).sw('quasi', 'soglia', 100, 30).sw('mai', 'zerbino', 100, 30)
    .ln('Brina bussò alla porta della nonna.', 120, 0).check().bug('nnona', 'nonna', 60)
    .ln('«E la prima cosa che scrissi», disse lui, «sei tu.»', 120, -30).mark()
    .ln('Aprì qualcuno che voleva raccontarla a modo suo.', 120, 30).exit();
  return L;
}
const FB_TARGETS = [
  ['Il lupo abitava nel parto', 'Brina abitava oltre il prato', 235, 322],
  ['Il ponte era di fumo', 'Il ponte era di pietra', 725, 322],
  ['La nonna dormiva nel bosco', 'Il lupo dormiva nel bosco', 480, 236],
  ['Il mare era un bosco', 'Il bosco era un bosco', 480, 432],
  ['Di giorno faceva notte', 'Di notte faceva notte', 235, 322],
  ['Le rime non tornavano', 'Le rime tornavano tutte', 725, 322],
  ['La lanterna si spense', 'La lanterna restò accesa', 480, 236],
  ['Nessuno aprì la porta', 'La nonna aprì la porta', 150, 432],
  ['E vissero, forse', 'E vissero felici e contenti', 810, 432]
];
function fb8() {
  const L = mkLevel({ name: 'Il Narratore', date: '', theme: 'teller', mood: 16, boss: true, fixed: true, brina: true, fairyBoss: true, targets: FB_TARGETS,
    bossSay: ['«Le fiabe sono mie. Le racconto come mi pare.»', '«Vuoi il bosco? Eccoti il mare.»', '«Spengo la luce. Vediamo se la sai a memoria.»'] });
  const Pl = (x, y, w, text) => L.plats.push({ kind: 'line', layer: 0, x, x0: x, y, w, h: LH, text });
  Pl(60, 470, 840, 'C\'era una volta chi decideva come finiscono le storie. E non eri tu, piccola nota.');
  Pl(150, 360, 170, 'forse sì,'); Pl(640, 360, 170, 'forse no,'); Pl(395, 270, 170, 'forse.');
  L.spawn = { x: 110, y: 440 };
  return L;
}
const NOTES2 = [
  ['QUESTO LIBRO È MIO', 'BRINA È BRAVA', 'IO NON HO PAURA DEL BOSCO', 'UN PO\' SÌ'],
  ['QUI C\'È UNA PAROLA SBAGLIATA', 'L\'HO CORRETTA IO CON LA MATITA', 'LA MAESTRA DICE CHE NON SI SCRIVE SUI LIBRI', 'IO SCRIVO PIANO', 'COSÌ NON SI VEDE'],
  ['IL LUPO MI FA PAURA', 'GIRO LA PAGINA VELOCE', 'STANOTTE LA LEGGO CON LA LUCE ACCESA', 'IL LUPO NON È CATTIVO, HA SONNO'],
  ['HO DISEGNATO UN SOLE QUI', 'E UNA LUNA', 'MAMMA DICE CHE È ORA DI DORMIRE', 'ANCORA UNA PAGINA', 'UNA SOLA'],
  ['HO ROVESCIATO IL BICCHIERE SUL LIBRO', 'LE PAGINE SONO TUTTE ONDULATE', 'SCUSA LIBRO', 'L\'HO ASCIUGATO COL PHON', 'SI LEGGE ANCORA'],
  ['QUESTA LA SO A MEMORIA', 'LUNA, NESSUNA, BRUNA', 'HO INVENTATO UNA RIMA ANCH\'IO', 'NON È TANTO BELLA', 'MA È MIA'],
  ['NON MI PIACE COME FINISCE', 'LA NONNA NON APRE', 'SE POTESSI ENTRARE GLIELO DIREI', 'LA PRIMA COSA CHE HO SCRITTO: CIAO', 'E IL LIBRO, MI PARE, HA RISPOSTO'],
  []
];

CHAPTERS[0].notes = NOTES; CHAPTERS[0].secret = '✶  Ultima nota a margine: «Questa volta, fallo uscire.»';
CHAPTERS[0].cover = ['#3a2a1c', '#c9a86a'];
CHAPTERS[0].ending = [
  { left: true, mark: true, dur: 8.5, lines: [['Giunsi a villa Vetrano al calare della sera.', .4], ['Fui accolto con ogni cortesia.', 1.8], ['Ripartii di buon mattino.', 3.2]] },
  { dur: 4.2, big: true, lines: [['Lo stesso lettore.', .3]] },
  { dur: 7, lines: [['Una nota a margine. Un errore di stampa.', .3], ['Due tracce della stessa mano:', 2.2], ['chi legge un libro, lo cambia.', 3.8]] },
  { dur: 9, lines: [['Ora il libro finisce bene: l\'ospite riparte al mattino.', .3], ['Ma nessuno ricorda come finiva prima.', 2.4], ['Postilla lo ha riparato. O lo ha riscritto?', 4.6, VIOLET]] }
];
CHAPTERS[0].shelf = ['Nella Biblioteca dei Margini i libri non finiscono mai.', 'E su un altro scaffale, un\'altra pagina comincia a macchiarsi.'];
CHAPTERS.push({
  id: 2, roman: 'II', title: 'C\'era una volta, forse', levels: [fb1, fb2, fb3, fb4, fb5, fb6, fb7, fb8], notes: NOTES2,
  secret: '✶  Ultima nota a margine: «CIAO. — Ciao.»', cover: ['#b8433a', '#ffe9a8'],
  ending: [
    { left: true, mark: true, dur: 8.5, lines: [['Brina arrivò dalla nonna prima di notte.', .4], ['La lanterna restò accesa sul davanzale.', 1.8], ['E vissero felici e contenti.', 3.2]] },
    { dur: 4.2, big: true, lines: [['Forse.', .3]] },
    { dur: 8, lines: [['Il viandante chiuse il libro dall\'interno.', .3], ['«Avevo sei anni», disse a Postilla.', 2.2], ['«La mia prima nota a margine fu: ciao.»', 4]] },
    { dur: 9, lines: [['«Volevo solo che le storie finissero bene.»', .3], ['«Ma una storia che finisce come voglio io', 2.4], ['è ancora la storia di qualcun altro?»', 3.6, VIOLET]] }
  ],
  shelf: ['Due libri riparati. O riscritti.', 'Tra gli scaffali, il lettore e la sua nota cercano il prossimo.']
});

/* ================= LIBRO TERZO — Chi ha strappato l'ultima pagina ================= */
Object.assign(THEMES, {
  rain:   { p0: '#2c3342', p1: '#11141c', decor: 'rain', noir: true },
  car:    { p0: '#3b3027', p1: '#16110d', decor: 'car', noir: true },
  roof:   { p0: '#3a4254', p1: '#0e1117', decor: 'roof', noir: true },
  mind:   { p0: '#f6f6f2', p1: '#d7dce4', decor: 'mind', noir: true, lightBg: true },
  accuse: { p0: '#3d1f23', p1: '#12090b', decor: 'rain', noir: true },
  dining: { p0: '#352a20', p1: '#120d09', decor: 'car', noir: true }
});
Object.assign(HINTS, {
  sway:    ['le ombre dondolano con i lampioni: aspetta che si avvicinino', 'le ombre dondolano con i lampioni: aspetta che si avvicinino'],
  omissis: ['X — togli l\'omissis', '✎ — togli l\'omissis'],
  tunnel:  ['al fischio: piedi sul tetto, niente salti', 'al fischio: piedi sul tetto, niente salti'],
  shade:   ['nell\'ombra Postilla non si vede', 'nell\'ombra Postilla non si vede'],
  tri:     ['una sola versione regge', 'una sola versione regge']
});
function nbuilder(L, x, y) {
  const b = fbuilder(L, x, y);
  L.shades = L.shades || []; L.beams = L.beams || [];
  b.sway = (text, gap, dy, amp, sp, ph) => b.ln(text, gap, dy, { kind: 'sway', amp: amp || 50, sp: sp || 1.5, ph: ph || 0, w: Math.max(120, Math.round(text.length * 9.2 + 30)) });
  b.om = (good, gap, dy) => b.ln('█'.repeat(Math.max(5, good.length - 2)), gap, dy, { kind: 'swap', good, omissis: true, w: Math.max(120, Math.round(good.length * 9.2 + 30)) });
  b.shade = (fx, w) => { const p = b.last; L.shades.push({ x: p.x + p.w * fx - w / 2, w, y: p.y }); return b; };
  b.beam = (fa, fb, sp, ph) => { const p = b.last; L.beams.push({ x0: p.x + p.w * fa, x1: p.x + p.w * fb, sp: sp || 1.1, ph: ph || 0, w: 110, y: p.y }); return b; };
  // interrogatorio: tre versioni, una sola regge. pos = -1 sopra, 0 in mezzo, 1 sotto
  b.tri = (truth, lies, pos) => {
    const offs = [-72, 0, 72], ty = offs[pos + 1], rest = offs.filter(o => o !== ty);
    b.side(lies[0], 120, rest[0], { kind: 'fake' }); b.side(lies[1], 120, rest[1], { kind: 'fake' });
    return b.ln(truth, 120, ty);
  };
  return b;
}
function nr1() {
  const L = mkLevel({ name: 'La stazione', date: 'ore 23:31', theme: 'rain', mood: 17 });
  nbuilder(L, 120, 400)
    .ln('Pioveva sulla stazione di Margine Centrale.').spawn()
    .ln('Il rapido delle 23:40 aspettava al binario tre.', 100, -20).mark()
    .ln('Sotto i lampioni le ombre andavano e venivano.', 110, 30).say('Le ombre dondolano con la luce. Reggono, finché restano ombre.').hint('sway', 40, -100)
    .sway('un\'ombra', 120, -20, 50, 1.4, 0).sway('un\'altra', 120, -30, 50, 1.6, 2)
    .ln('Qualcuno aveva fretta di partire.', 110, 40).check()
    .sway('lunga', 120, -40, 55, 1.3, 1).sway('storta', 120, 30, 55, 1.8, 3).sway('sottile', 120, -40, 55, 1.5, 5).mark()
    .ln('Sul marciapiede, un biglietto strappato a metà.', 110, 60).check().bug('bigiletto', 'biglietto', 60)
    .ln('Un uomo alto, col bavero alzato, mi guardò passare.', 120, -30).npc(.8, '«Corsivo», si è presentato. «E lei è già nei miei appunti.»')
    .sway('la sua', 120, -30, 60, 1.2, 0).sway('la mia', 120, 0, 60, 1.9, 2).mark()
    .ln('Il capotreno fischiò.', 110, 40).check()
    .sway('l\'ultima', 120, -30, 60, 2.1, 4).mark()
    .ln('Salii per ultima. Lo ricordo bene. O così ho dichiarato.', 110, 30).exit();
  return L;
}
function nr2() {
  const L = mkLevel({ name: 'La scena del delitto', date: 'ore 23:58', theme: 'car', mood: 18 });
  nbuilder(L, 120, 400)
    .ln('Vagone letto numero sette. La porta era socchiusa.').spawn()
    .ln('Sul tavolino, un libro aperto in fondo.', 110, -20).say('L\'ultima pagina non c\'era. Qualcuno l\'aveva strappata.')
    .om('strappata di netto', 120, 0).hint('omissis', -160, -100)
    .ln('Il dottor Tondo prendeva appunti, lentamente.', 120, 0).check().npc(.8, '«Niente impronte», ha detto Tondo. «Solo inchiostro. Curioso, no?»')
    .ln('Primo indizio: un pelo grigio sul cuscino.', 120, -30).mark()
    .om('nessuno ha visto', 110, -40).om('nessuno ha sentito', 100, 40)
    .ln('Secondo indizio: un filo di lana gialla.', 120, 30).check().mark().wall('OMISSIS', .85)
    .ln('Terzo indizio: una goccia di cera.', 120, -30).mark().bug('ceera', 'cera', 60)
    .om('il nome del', 110, -40).om('proprietario', 100, -30)
    .ln('Quarto indizio: grafite sul margine.', 120, 50).check().mark().stain(.75, 50)
    .ln('Corsivo si chinò con la lente.', 120, -20).wall('RISERVATO', .5)
    .om('e sorrise', 110, -40)
    .ln('Quinto indizio: una goccia d\'inchiostro, ancora fresca.', 120, 40).mark()
    .ln('Cinque indizi, cinque passeggeri. E io ero la sesta.', 120, -20).exit();
  return L;
}
function nr3() {
  const L = mkLevel({ name: 'Sul tetto del treno', date: 'ore 00:20', theme: 'roof', mood: 19, wind: -70, tunnel: { t: 0 } });
  nbuilder(L, 120, 380)
    .ln('Il rapido correva nella pioggia, e io sul tetto.').spawn().say('Al fischio arriva la galleria: piedi sul tetto, niente salti.').hint('tunnel', 60, -100)
    .ln('Il vento spingeva indietro ogni frase.', 90, 0).mark()
    .ln('Vagone ristorante,', 90, -20).ln('vagone letto,', 90, 20).bug('lteto', 'letto', 60)
    .ln('Da quassù si vedeva chi cambiava scompartimento.', 90, 0).check()
    .ln('Una mantellina gialla.', 90, -30).ln('Un bavero alzato.', 90, 30).mark()
    .ln('Un\'ombra a quattro zampe.', 90, 0).stain(.5, 46)
    .ln('Poi il fischio, e il buio della galleria.', 90, 0).check()
    .ln('Nel buio qualcuno camminava', 90, -30).ln('sopra di me.', 90, -30).mark()
    .ln('O ero io', 90, 30).ln('sopra di lui.', 90, 30).bug('loui', 'lui', 50)
    .ln('Quando tornò la luce, il tetto era vuoto.', 90, 0).check().mark()
    .ln('Scesi dal lucernario del vagone sette.', 90, 0).exit();
  return L;
}
function nr4() {
  const L = mkLevel({ name: 'Gli interrogatori', date: 'ore 01:05', theme: 'car', mood: 20 });
  nbuilder(L, 120, 400)
    .ln('Corsivo interrogò i passeggeri uno alla volta.').spawn().say('Tre versioni per ogni risposta. Regge solo quella che combacia con gli indizi.')
    .ln('Il lupo aveva sonno, e un pelo grigio sul cuscino.', 110, 0).hint('tri', 60, -110)
    .tri('«Dormivo nel vagone letto.»', ['«Ero al ristorante.»', '«Non ho mai preso un treno.»'], 0)
    .ln('Corsivo annotò: «Dice il vero. Ma dormiva sopra il libro.»', 120, 0).check().mark()
    .ln('Brina aveva perso un filo dalla mantellina gialla.', 120, 0)
    .tri('«Sono entrata a guardare le figure.»', ['«Io sono vestita di blu.»', '«Non sono mai stata lì.»'], -1)
    .ln('Annotò: «Ha sfogliato. E ha piegato un angolo.»', 120, 72).check().mark()
    .ln('L\'ospite di Vetrano profumava di cera.', 120, 0)
    .tri('«Cercavo come finiva la mia storia.»', ['«Viaggio senza candele.»', '«Io non ho una storia.»'], 1)
    .ln('Annotò: «Ha letto la fine prima dell\'inizio.»', 120, -72).check()
    .ln('Il viandante aveva le dita grigie di grafite.', 120, 0)
    .tri('«Ho scritto a margine. Tante volte.»', ['«La matita non è mia.»', '«Non tocco mai i libri.»'], -1)
    .ln('Annotò: «Ha aggiunto. Che è un altro modo di togliere.»', 120, 72).check().mark()
    .ln('Il Narratore sorrideva.', 120, 0)
    .tri('«L\'ho raccontata diversa ogni sera.»', ['«L\'ho sempre letta uguale.»', '«Non la conosco.»'], 0)
    .ln('Poi Corsivo si voltò verso di me.', 120, 0).check().mark()
    .ln('«E lei, signorina? La goccia d\'inchiostro è sua.»', 120, -20).exit();
  return L;
}
function nr5() {
  const L = mkLevel({ name: 'Il pedinamento', date: 'ore 01:40', theme: 'rain', mood: 21 });
  nbuilder(L, 120, 400)
    .ln('Qualcuno lasciò lo scompartimento in punta di piedi.').spawn().shade(.85, 110).say('Postilla è inchiostro: nell\'ombra non si vede. La torcia del controllore, invece, vede tutto.').hint('shade', 120, -100)
    .ln('Lo seguii lungo il corridoio, da un\'ombra all\'altra, senza fare rumore.', 80, 0).shade(.08, 100).shade(.5, 100).shade(.92, 100).beam(.08, .92, 1.0, 0).mark(.3)
    .ln('Il controllore passava con la torcia, avanti e indietro, avanti e indietro.', 80, 0).shade(.08, 100).shade(.5, 100).shade(.92, 100).beam(.08, .92, 1.25, 1).check()
    .ln('Chi seguivo si fermò davanti al vagone sette e si guardò alle spalle.', 80, -30).shade(.08, 100).shade(.5, 100).shade(.92, 100).beam(.08, .92, 1.4, 2).mark(.7)
    .ln('Io non c\'ero. Cioè: c\'ero, ma ero dello stesso colore del buio.', 80, 30).shade(.08, 100).shade(.5, 140).shade(.92, 100).beam(.08, .5, 1.5, 0).beam(.5, .92, 1.5, 3.14).check()
    .ln('Entrò. Uscì dopo un minuto con qualcosa sotto il cappotto.', 80, 0).shade(.08, 100).shade(.36, 90).shade(.64, 90).shade(.92, 100).beam(.08, .92, 1.6, 1).mark(.5)
    .ln('Lo seguii fino in fondo al treno, dove finiscono i vagoni e comincia la notte.', 80, -20).shade(.08, 100).shade(.36, 110).shade(.64, 110).shade(.94, 100).beam(.08, .36, 1.6, 0).beam(.64, .94, 1.3, 2).check().mark(.5)
    .ln('Si voltò. Aveva la mia faccia. Cioè: non ne aveva nessuna, come me.', 80, 0).exit();
  return L;
}
function nr6() {
  const L = mkLevel({ name: 'Il palazzo mentale', date: 'ore 02:15', theme: 'mind', mood: 22 });
  nbuilder(L, 120, 440)
    .ln('Corsivo chiuse gli occhi. «Ricostruiamo.»').spawn().say('Ogni deduzione poggia sulla precedente. E non resta in piedi a lungo.')
    .ln('Un pelo grigio:', 110, -20).rev('a')
    .rh('il lupo dormiva lì.', 'a', 110, -50, 'b').rh('Ma chi dorme non strappa.', 'b', 100, -50).mark()
    .ln('Un filo giallo:', 110, -30).check().rev('c')
    .rh('la bambina ha sfogliato.', 'c', 110, -50, 'd').rh('Ma chi sfoglia non ruba.', 'd', 100, -50, 'e').rh('Piega soltanto.', 'e', 100, 40).mark()
    .ln('Una goccia di cera:', 110, -30).check().rev('f')
    .rh('l\'ospite ha letto la fine.', 'f', 110, -50, 'g').rh('Ma leggere non è reato.', 'g', 100, -50)
    .sway('forse', 120, -30, 50, 1.5, 0).sway('quasi', 120, -30, 50, 1.9, 2).mark()
    .ln('Grafite sul margine:', 110, 40).check().rev('h')
    .rh('il viandante ha scritto.', 'h', 110, -50, 'i').rh('E chi scrive a margine', 'i', 100, -50, 'j').rh('cambia il libro di tutti.', 'j', 100, 40).mark()
    .ln('«Restava una goccia d\'inchiostro.»', 110, -30).check()
    .ln('«E l\'inchiostro, signori, cammina.»', 120, -30).exit();
  return L;
}
function nr7() {
  const L = mkLevel({ name: 'Le prove contro Postilla', date: 'ore 02:50', theme: 'accuse', mood: 23, chase: true, noErase: true });
  nbuilder(L, 120, 400)
    .ln('«Lei cancella», disse Corsivo. «È il suo mestiere.»').spawn().say('Ti hanno sequestrato lo sbianchetto. Corri.')
    .ln('«Dove passa lei, il testo cambia.»', 100, -20).mark()
    .ln('«Ha corretto un diario gotico.»', 100, -30).bug('gotcio', 'gotico', 60)
    .ln('«Ha riscritto una fiaba.»', 100, 30)
    .ln('«E adesso manca una pagina.»', 100, 30).check().stain(.55, 46)
    .ln('Non avevo un alibi.', 100, -40).ln('Non avevo lo sbianchetto.', 100, -40).mark()
    .ln('Avevo solo le gambe.', 100, 40).bug('gmabe', 'gambe', 70)
    .ln('Corsi per tutto il treno,', 100, 30).check()
    .ln('vagone dopo vagone,', 100, -30).ln('accusa dopo accusa,', 100, -30).stain(.5, 40).ln('finché il treno finì.', 100, 40).mark()
    .ln('«È stata lei?», chiese Tondo.', 100, 30).check().bug('letti', 'lei', 60)
    .ln('Mi fermai.', 100, -30).ln('Perché non lo sapevo.', 100, -30).mark()
    .ln('«Portateli tutti nel vagone ristorante», disse Corsivo.', 100, 50).exit();
  return L;
}
const NR_TARGETS = [
  ['Il lupo è ████████', 'Il lupo ci ha dormito sopra', 235, 322],
  ['Brina è ████████', 'Brina ha piegato un angolo', 725, 322],
  ['L\'ospite è ████████', 'L\'ospite cercava la sua fine', 480, 236],
  ['Il viandante è ████████', 'Il viandante ha scritto a margine', 480, 432],
  ['Il Narratore è ████████', 'Il Narratore la cambiava ogni sera', 235, 322],
  ['Il Refuso è ████████', 'Il Refuso l\'ha coperta', 725, 322],
  ['Postilla è ████████', 'Postilla l\'ha corretta', 480, 236],
  ['Colpevole: ████████', 'Colpevoli: tutti', 150, 432],
  ['L\'ultima pagina era ████████', 'L\'ultima pagina era bianca', 810, 432]
];
function nr8() {
  const L = mkLevel({ name: 'Tutti nel vagone ristorante', date: '', theme: 'dining', mood: 24, boss: true, fixed: true, noirBoss: true, targets: NR_TARGETS,
    bossSay: ['«Signori, il colpevole è in questo vagone.»', '«Controllore, faccia luce.»', '«Entriamo in galleria. Che peccato.»'] });
  const Pl = (x, y, w, text) => L.plats.push({ kind: 'line', layer: 0, x, x0: x, y, w, h: LH, text });
  Pl(60, 470, 840, 'Uno di voi ha strappato l\'ultima pagina. E io so chi. O almeno, so da dove cominciare.');
  Pl(150, 360, 170, 'forse lei,'); Pl(640, 360, 170, 'forse lui,'); Pl(395, 270, 170, 'forse io.');
  L.shades = [{ x: 150, w: 170, y: 470 }, { x: 640, w: 170, y: 470 }]; L.beams = [{ x0: 80, x1: 880, sp: .9, ph: 0, w: 120, y: 470 }];
  L.spawn = { x: 110, y: 440 };
  return L;
}
const NOTES3 = [
  ['L\'ho comprato in stazione, a vent\'anni.', 'Mancava già l\'ultima pagina.', 'Ho chiesto il rimborso. Hanno riso.', 'L\'ho letto lo stesso. Tre volte.', 'La quarta ho preso la matita.'],
  ['Sospetto del lupo.', 'No: di Brina.', 'No: di tutti.', 'E se il colpevole fosse chi legge?', 'Cioè io.'],
  ['Letto in treno, appunto.', 'In galleria non si vede niente.', 'Ho perso il segno due volte.', 'Forse la pagina l\'ho persa io.'],
  ['Tutti dicono mezza verità.', 'Anch\'io, quando annoto.', 'Sottolineo solo ciò che mi dà ragione.', 'Un lettore non è un testimone attendibile.'],
  ['Seguire una storia è pedinarla.', 'Lei lo sa, e cambia strada.', 'Ho smesso di fidarmi delle mie note.', 'Questa compresa.'],
  ['Ho provato a dedurre il finale.', 'Ne ho scritti undici.', 'Nessuno era quello giusto.', 'Forse non ce n\'è uno giusto.'],
  ['Le prove portano alla mia matita.', 'Non mi difendo.', 'Ho corretto perché volevo bene al libro.', 'Non è un alibi. È il movente.'],
  []
];
CHAPTERS.push({
  id: 3, roman: 'III', title: 'Chi ha strappato l\'ultima pagina', levels: [nr1, nr2, nr3, nr4, nr5, nr6, nr7, nr8], notes: NOTES3,
  secret: '✶  Ultima nota a margine: «La pagina bianca l\'ho lasciata io. Per te.»', cover: ['#1b2130', '#d8433a'],
  ending: [
    { left: true, mark: true, dur: 8.5, lines: [['Il rapido arrivò in orario, con sette passeggeri.', .4], ['Nessuno fu arrestato.', 1.8], ['L\'ultima pagina fu rimessa al suo posto. Bianca.', 3.2]] },
    { dur: 4.2, big: true, lines: [['Tutti.', .3]] },
    { dur: 8, lines: [['Chi ci dorme sopra, chi piega un angolo,', .3], ['chi scrive a margine, chi corregge:', 2.2], ['ogni lettura ne strappa un pezzo.', 4]] },
    { dur: 9, lines: [['«E il finale?», chiese Tondo.', .3], ['«Non c\'è mai stato», disse Corsivo.', 2.4], ['«Ecco perché continuano a scriverlo.»', 4.4, VIOLET]] }
  ],
  shelf: ['Tre libri riparati. O riscritti. O soltanto letti.', 'Sullo scaffale più alto, un manuale si è messo a lampeggiare.']
});
