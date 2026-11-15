// Controlli sui dati: ogni libro e ogni livello devono essere costruiti in modo coerente.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { launch, openGame } from './helpers/game.mjs';

let browser, game, data;
before(async () => {
  browser = await launch();
  game = await openGame(browser);
  data = await game.page.evaluate(() => {
    const kinds = new Set([
      'line',
      'fake',
      'hidden',
      'beat',
      'flee',
      'ferry',
      'rewind',
      'swap',
      'rhyme',
      'sway',
      'shelf',
    ]);
    return CHAPTERS.map((C, c) => ({
      c,
      title: C.title,
      epi: !!C.epi,
      hasIntro: Array.isArray(C.intro) && C.intro.length > 0,
      register: C.register,
      endings: C.epi ? Object.values(C.endings).map(e => e.ending.length) : [C.ending ? C.ending.length : 0],
      shelf: C.epi ? Object.values(C.endings).every(e => e.shelf.length === 2) : !!(C.shelf && C.shelf.length === 2),
      secret: C.epi ? Object.values(C.endings).every(e => !!e.secret) : !!C.secret,
      levels: C.levels.map((f, i) => {
        const L = f();
        const ids = new Set((L.pb || []).map(q => q.id));
        return {
          i,
          name: L.name,
          theme: !!THEMES[L.theme],
          mood: !!MUSIC[L.mood],
          spawn: Number.isFinite(L.spawn.x) && Number.isFinite(L.spawn.y),
          exit: !!L.exit,
          boss: !!L.boss,
          targets: L.boss ? L.targets.length : 0,
          bossSay: L.boss ? L.bossSay.length : 0,
          bossMode: L.bossMode || null,
          marks: L.marks.length,
          notes: ((C.notes || [])[i] || []).length,
          hints: L.hints.every(h => !!HINTS[h.k]),
          plats: L.plats.length,
          badPlats: L.plats.filter(
            p => !(p.w > 0) || !Number.isFinite(p.x) || !Number.isFinite(p.y) || !kinds.has(p.kind)
          ).length,
          ports: (L.pa || []).every(a => ids.has(a.id)),
          clues: L.clues ? L.clues.length : 0,
        };
      }),
    }));
  });
});
after(async () => {
  assert.deepEqual(game.errors, []);
  await browser.close();
});

test("ci sono quattro libri e un epilogo, in quest'ordine", () => {
  assert.equal(data.length, 5);
  assert.deepEqual(
    data.map(d => d.epi),
    [false, false, false, false, true]
  );
});

test('ogni libro ha prologo, finale completo e nota segreta', () => {
  for (const C of data) {
    assert.ok(C.hasIntro, `${C.title}: prologo mancante`);
    assert.ok(
      ['goth', 'fairy', 'noir', 'man', 'lib'].includes(C.register),
      `${C.title}: registro del prologo sconosciuto`
    );
    for (const pages of C.endings) assert.equal(pages, 4, `${C.title}: il finale deve avere quattro pagine`);
    assert.ok(C.shelf, `${C.title}: righe della biblioteca finale mancanti`);
    assert.ok(C.secret, `${C.title}: nota segreta mancante`);
  }
});

test('ogni livello è costruito in modo valido', () => {
  for (const C of data)
    for (const L of C.levels) {
      const where = `${C.title} › ${L.name}`;
      assert.ok(L.theme, `${where}: tema inesistente`);
      assert.ok(L.mood, `${where}: musica inesistente`);
      assert.ok(L.spawn, `${where}: punto di partenza non valido`);
      assert.ok(L.boss || L.exit, `${where}: manca l'uscita`);
      assert.ok(L.plats > 0, `${where}: nessuna piattaforma`);
      assert.equal(L.badPlats, 0, `${where}: piattaforme con dimensioni o tipo non validi`);
      assert.ok(L.hints, `${where}: suggerimento senza testo`);
      assert.ok(L.ports, `${where}: asterisco-portale senza la sua uscita`);
    }
});

test('ogni asterisco ha la sua nota del lettore', () => {
  for (const C of data)
    for (const L of C.levels)
      if (L.marks) assert.ok(L.notes >= L.marks, `${C.title} › ${L.name}: ${L.marks} asterischi ma ${L.notes} note`);
});

test('ogni libro ha esattamente un boss, in fondo, con nove frasi e tre fasi', () => {
  const modes = [];
  for (const C of data.filter(d => !d.epi)) {
    const bosses = C.levels.filter(L => L.boss);
    assert.equal(bosses.length, 1, `${C.title}: un boss per libro`);
    assert.ok(C.levels.at(-1).boss, `${C.title}: il boss è l'ultimo livello`);
    assert.equal(bosses[0].targets, 9);
    assert.equal(bosses[0].bossSay, 3);
    modes.push(bosses[0].bossMode);
  }
  assert.deepEqual(modes, ['beat', 'swap', 'clue', 'grav'], 'ogni boss ha una regola diversa');
  const noir = data[2].levels.at(-1);
  assert.equal(noir.clues, 9, 'il boss del noir ha una prova per ogni frase');
});
