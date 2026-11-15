// Disegno: ogni schermata e ogni livello si disegnano senza errori, anche su telefono.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { launch, openGame } from './helpers/game.mjs';

let browser;
before(async () => {
  browser = await launch();
});
after(async () => {
  await browser.close();
});

test('ogni livello si disegna e si gioca qualche secondo senza errori', async () => {
  const { page, errors, context } = await openGame(browser);
  const count = await page.evaluate(() => {
    let n = 0;
    CHAPTERS.forEach((C, c) =>
      C.levels.forEach((f, i) => {
        G.chapter = c;
        G.state = 'play';
        G.turn = null;
        G.intro = null;
        G.stats = { deaths: 0, time: 0, marks: 0, total: 0, points: 0, fixed: 0 };
        loadLevel(i);
        for (let k = 0; k < 360; k++) {
          inp.right = k % 90 < 70;
          inp.jumpP = k % 40 === 0;
          inp.eraseP = k % 150 === 0;
          step(1 / 120);
          if (k % 30 === 0) draw();
        }
        G.paused = true;
        draw();
        G.paused = false;
        n++;
      })
    );
    return n;
  });
  assert.equal(count, await page.evaluate(() => CHAPTERS.reduce((n, C) => n + C.levels.length, 0)));
  assert.deepEqual(errors, []);
  await context.close();
});

test('prologhi, biblioteca, registro e finali si disegnano senza errori', async () => {
  const { page, errors, context } = await openGame(browser);
  await page.evaluate(() => {
    for (const c of [0, 1, 2, 3, 4]) {
      startIntro(CHAPTERS[c].intro, CHAPTERS[c].register, () => {});
      for (let p = 0; p < CHAPTERS[c].intro.length; p++) {
        G.intro.page = p;
        G.intro.t = 5;
        draw();
      }
    }
    G.state = 'title';
    SAVE.all = true;
    for (let s = 0; s < 4; s++) {
      SEL = s;
      draw();
    }
    G.reg = true;
    draw();
    G.reg = false;
    for (const c of [0, 1, 2, 3, 4]) {
      G.chapter = c;
      G.epiChoice = 'keep';
      G.state = 'ending';
      if (CHAPTERS[c].epi) {
        const E = CHAPTERS[c].endings.keep;
        Object.assign(CHAPTERS[c], { ending: E.ending, shelf: E.shelf, secret: E.secret });
      }
      for (let p = 0; p <= 4; p++) {
        G.end = { t: 8, page: p };
        draw();
      }
    }
  });
  assert.deepEqual(errors, []);
  await context.close();
});

test('su telefono compaiono i tasti a schermo', async () => {
  const { page, errors, context } = await openGame(browser, { viewport: { width: 844, height: 390 }, touch: true });
  const visible = await page.evaluate(() => getComputedStyle(document.getElementById('pad')).display !== 'none');
  assert.ok(visible);
  assert.deepEqual(errors, []);
  await context.close();
});
