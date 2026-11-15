// Ogni boss ha una regola propria: qui si verifica che la regola funzioni in entrambi i versi
// (rifiuta il colpo quando non va bene, lo accetta quando va bene) e che il boss porti al finale.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { launch, openGame } from './helpers/game.mjs';

let browser, game;
before(async () => {
  browser = await launch();
  game = await openGame(browser);
  await game.page.evaluate(() => {
    const STEP = 1 / 120;
    window.T = {
      run(s) {
        for (let i = 0; i < s * 120; i++) {
          G.proj = [];
          G.dyn = [];
          update(STEP);
        }
      },
      start(c, li) {
        G.chapter = c;
        G.state = 'play';
        G.turn = null;
        G.intro = null;
        G.stats = { deaths: 0, time: 300, marks: 0, total: 0, points: 0, fixed: 0, full: true };
        loadLevel(li);
        T.run(3);
        G.boss.intro = 0;
      },
      // un colpo di sbianchetto, con la ricarica pronta
      erase() {
        P.cd = 0;
        inp.eraseP = true;
        update(STEP);
        inp.eraseP = false;
      },
      // mette Postilla in un punto, invulnerabile, per provare solo la regola del boss
      at(x, y) {
        P.x = x - P.w / 2;
        P.y = y - P.h / 2;
        P.vx = P.vy = 0;
        P.dead = 0;
        P.born = 1;
      },
      next() {
        G.boss.intro = 0;
        T.run(0.2);
      },
      ends() {
        for (let i = 0; i < 600 && !G.turn; i++) update(STEP);
        return !!G.turn && SAVE.books[G.chapter].done;
      },
    };
  });
});
after(async () => {
  assert.deepEqual(game.errors, []);
  await browser.close();
});

const bossIndex = c => game.page.evaluate(c => CHAPTERS[c].levels.length - 1, c);

test('I · La pagina: le frasi si restaurano solo sul battito', async () => {
  const li = await bossIndex(0);
  const r = await game.page.evaluate(li => {
    T.start(0, li);
    const out = [];
    for (let k = 0; k < 9; k++) {
      const tg = G.boss.tgt;
      // fuori tempo: rifiutato
      while (G.beatPh !== 1) update(1 / 120);
      T.at(tg.x, tg.y + 60);
      const before = G.boss.hp;
      if (G.beatPh === 1) T.erase();
      const refused = G.boss.hp === before;
      // sul battito: accettato
      while (G.beatPh !== 0) update(1 / 120);
      T.at(tg.x, tg.y + 60);
      T.erase();
      out.push({ refused, accepted: G.boss.hp === before + 1 });
      T.next();
    }
    return { out, ends: T.ends() };
  }, li);
  assert.ok(
    r.out.every(o => o.accepted),
    'ogni frase si restaura sul battito'
  );
  assert.ok(r.out.filter(o => o.refused).length >= 8, 'fuori tempo lo sbianchetto non fa presa');
  assert.ok(r.ends, 'il boss porta al finale');
});

test('II · Il Narratore: le righe vanno rimesse a posto, e lui le rimescola', async () => {
  const li = await bossIndex(1);
  const r = await game.page.evaluate(li => {
    T.start(1, li);
    const swaps = G.L.plats.filter(p => p.kind === 'swap');
    const initiallySolid = swaps.some(p => solid(p));
    const out = [];
    for (let k = 0; k < 9; k++) {
      const tg = G.boss.tgt;
      const pl = swaps.find(p => tg.x > p.x && tg.x < p.x + p.w && p.y - tg.y > 0 && p.y - tg.y < 60);
      if (pl) {
        T.at(pl.x + pl.w / 2, 455);
        T.erase();
        const fixed = pl.fixed && solid(pl);
        P.x = tg.x - 10;
        P.y = pl.y - 30;
        P.vy = 0;
        update(1 / 120);
        T.erase();
        out.push({ fixed, reshuffled: swaps.every(p => !p.fixed) });
      } else {
        T.at(tg.x, 455);
        T.erase();
      }
      G.L.water = false;
      T.next();
    }
    return { initiallySolid, out, hp: G.boss.hp, ends: T.ends() };
  }, li);
  assert.equal(r.initiallySolid, false, "all'inizio le parole scambiate non reggono");
  assert.ok(r.out.length >= 6);
  assert.ok(
    r.out.every(o => o.fixed),
    'lo sbianchetto rimette a posto la riga'
  );
  assert.ok(
    r.out.every(o => o.reshuffled),
    'a ogni frase restaurata il Narratore rimescola'
  );
  assert.ok(r.ends);
});

test('III · Il vagone ristorante: servono le prove', async () => {
  const li = await bossIndex(2);
  const r = await game.page.evaluate(li => {
    T.start(2, li);
    const out = [];
    for (let k = 0; k < 9; k++) {
      const tg = G.boss.tgt;
      T.at(tg.x, tg.y + 60);
      const before = G.boss.hp;
      T.erase();
      const refused = G.boss.hp === before;
      T.at(G.clue.x, G.clue.y);
      update(1 / 120);
      const got = P.clue;
      T.at(tg.x, tg.y + 60);
      T.erase();
      out.push({ refused, got, accepted: G.boss.hp === before + 1 });
      G.L.beamsOn = false;
      T.next();
    }
    return { out, ends: T.ends() };
  }, li);
  assert.ok(
    r.out.every(o => o.refused),
    'senza prova Corsivo rifiuta'
  );
  assert.ok(
    r.out.every(o => o.got),
    'la prova si raccoglie'
  );
  assert.ok(
    r.out.every(o => o.accepted),
    'con la prova la frase si restaura'
  );
  assert.ok(r.ends);
});

test('IV · MARGINE: le piastre portano davvero al soffitto e indietro', async () => {
  const li = await bossIndex(3);
  const r = await game.page.evaluate(li => {
    T.start(3, li);
    const up = G.L.plats.find(p => p.flipG && p.y > 400);
    P.x = up.x + 60;
    P.y = up.y - 30;
    P.vy = 0;
    P.born = 0;
    for (let i = 0; i < 240; i++) update(1 / 120);
    const onCeiling = G.gflip && P.ground && P.y < 200;
    const down = G.L.plats.find(p => p.flipG && p.y < 200);
    P.x = down.x + 60;
    for (let i = 0; i < 300; i++) update(1 / 120);
    const backOnFloor = !G.gflip && P.y > 400;
    const out = [];
    for (let k = 0; k < 9; k++) {
      const tg = G.boss.tgt,
        ceiling = tg.y < 200;
      G.gflip = ceiling;
      G.L.pull = 0;
      P.g = ceiling ? -1 : 1;
      T.at(tg.x, ceiling ? 115 : 455);
      const before = G.boss.hp;
      T.erase();
      out.push({ ceiling, accepted: G.boss.hp === before + 1 });
      T.next();
    }
    G.gflip = false;
    return { onCeiling, backOnFloor, out, ends: T.ends() };
  }, li);
  assert.ok(r.onCeiling, 'la piastra del pavimento porta al soffitto');
  assert.ok(r.backOnFloor, 'la piastra del soffitto riporta giù');
  assert.ok(r.out.some(o => o.ceiling) && r.out.some(o => !o.ceiling), 'frasi sia sul pavimento sia sul soffitto');
  assert.ok(r.out.every(o => o.accepted));
  assert.ok(r.ends);
});
