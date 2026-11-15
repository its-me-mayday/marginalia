// Ogni livello normale deve essere completabile: un giocatore automatico lo attraversa dall'inizio
// all'uscita usando solo i comandi (sinistra, destra, salto, sbianchetto).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { launch, openGame } from './helpers/game.mjs';

// livelli che richiedono un giocatore automatico dedicato
const SPECIAL = { '0:6': 'letters', '1:4': 'swim' };
const MAX_SECONDS = 300;

let browser, game, levels;
before(async () => {
  browser = await launch();
  game = await openGame(browser);
  levels = await game.page.evaluate(() =>
    CHAPTERS.flatMap((C, c) =>
      C.levels.map((f, i) => ({ c, i, book: C.title, name: f().name, boss: !!f().boss })).filter(l => !l.boss)
    )
  );
});
after(async () => {
  assert.deepEqual(game.errors, []);
  await browser.close();
});

test('tutti i livelli normali sono completabili', async t => {
  assert.ok(levels.length >= 30);
  for (const l of levels) {
    await t.test(`${l.book} › ${l.name}`, async () => {
      const bot = SPECIAL[`${l.c}:${l.i}`] || 'line';
      const r = await game.page.evaluate(
        ([bot, c, i, max]) => window.MarginaliaBots[bot](c, i, max),
        [bot, l.c, l.i, MAX_SECONDS]
      );
      assert.ok(r.done, `non completato (${JSON.stringify(r)})`);
    });
  }
});
