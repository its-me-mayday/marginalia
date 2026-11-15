/**
 * Giocatori automatici usati dai test di percorso.
 *
 * Girano dentro la pagina del gioco (vengono iniettati come script), pilotano gli stessi
 * input di un giocatore (`inp`) e fanno avanzare la simulazione a passo fisso con `update()`.
 * Non barano: non spostano Postilla e non toccano lo stato del livello, quindi se un bot
 * arriva all'uscita il livello è completabile con i comandi veri.
 *
 * - `line`: segue la catena di righe-piattaforma di quasi tutti i livelli.
 * - `letters`: «Tra le lettere» (libro I), dove le piattaforme sono lettere giganti.
 * - `swim`: «Il bosco allagato» (libro II), dove si nuota tra le meduse.
 */
(() => {
  const STEP = 1 / 120;

  function start(ch, li) {
    G.chapter = ch;
    G.state = 'play';
    G.turn = null;
    G.intro = null;
    G.stats = { deaths: 0, time: 0, marks: 0, total: 0, points: 0, fixed: 0 };
    loadLevel(li);
  }

  function finish(t, done, extra) {
    inp.left = inp.right = inp.jump = inp.erase = false;
    return Object.assign({ done, time: +t.toFixed(1), deaths: G.stats.deaths }, extra);
  }

  /** Bot generico: segue le righe nell'ordine del livello. */
  function line(ch, li, maxT) {
    start(ch, li);
    const L = G.L,
      dir = L.reverse ? -1 : 1;
    const path = L.plats.filter(p => p.kind !== 'fake');
    const K = { left: false, right: false, erase: false };
    const halfAt = dt => Math.floor(G.beatAcc + dt / (G.beatPeriod / 2)) % 2;
    let idx = 0,
      maxIdx = 0,
      t = 0,
      done = false,
      pj = false,
      pe = false,
      holdJ = 0,
      full = false;
    while (t < maxT) {
      K.left = K.right = K.erase = false;
      let wantJump = false;
      const cx = P.x + P.w / 2,
        feet = P.g > 0 ? P.y + P.h : P.y;
      const go = d => {
        if (d > 0) K.right = true;
        else if (d < 0) K.left = true;
      };
      if (P.dead <= 0) {
        if (P.standOn && path.indexOf(P.standOn) >= 0) idx = path.indexOf(P.standOn);
        maxIdx = Math.max(maxIdx, idx);
        const cur = path[idx],
          tg = path[idx + 1];
        if (!tg) {
          go(Math.sign(L.exit.x + 20 - cx));
        } else {
          const near = dir > 0 ? tg.x : tg.x + tg.w,
            curEdge = dir > 0 ? cur.x + cur.w : cur.x;
          const gap = dir * (near - curEdge);
          const lowG = (L.gAll || 1) < 0.9 || (L.planets && (P.gm || 1) < 0.9);
          // righe che scappano: gelarle prima di avvicinarsi
          if (L.flee && P.cd <= 0) {
            const nextFlee =
              tg.kind === 'flee' || (path[idx + 2] && path[idx + 2].kind === 'flee' && onScreen(path[idx + 2], 0));
            if (
              nextFlee &&
              L.plats.some(p => p.kind === 'flee' && onScreen(p, 0) && p.frz < 1 && Math.abs(p.x - p.x0) < 2)
            )
              K.erase = true;
          }
          if (P.ground) {
            let hold = false;
            // macchie che pulsano sul battito
            for (const s of L.stains) {
              if (s.beat === undefined) continue;
              const d = dir * ((dir > 0 ? s.x : s.x + s.w) - cx);
              if (Math.abs(s.y + 13 - cur.y) < 6 && d > -s.w && d < 40) {
                const left = ((1 - (G.beatAcc % 1)) * G.beatPeriod) / 2;
                if (d > 0 && (G.beatPh === s.beat || left < (s.w + 40) / 250)) hold = true;
              }
            }
            // macchie fisse e parole-nemico: saltarle
            for (const s of L.stains) {
              if (s.beat !== undefined || (s.layer && s.layer !== G.layer)) continue;
              const d = dir * ((dir > 0 ? s.x : s.x + s.w) - cx);
              if (Math.abs(s.y + 13 - cur.y) < 6 && d > 0 && d < 34) {
                if (s.w > 120 && L.mirror) K.erase = true;
                else wantJump = true;
              }
            }
            for (const b of L.bugs) {
              if (b.dead) continue;
              const d = dir * (b.x - cx);
              if (Math.abs(b.y + 22 - cur.y) < 6 && d > 0 && d < 75 + b.w / 2) wantJump = true;
            }
            // pareti corrotte: sbianchettarle
            for (const b of L.blocks) {
              if (!b.corrupt || !blockSolid(b)) continue;
              const d = dir * ((dir > 0 ? b.x : b.x + b.w) - cx);
              if (d > 0 && d < 120 && b.y < feet && b.y + b.h > feet - 40) {
                if (P.cd <= 0) K.erase = true;
                if (d < 30) hold = true;
              }
            }
            // specchio: cambiare versione se la prossima riga è dell'altra
            if (L.mirror && cur.layer === 0 && tg.layer && tg.layer !== G.layer) {
              const nl = tg.layer;
              let blocked = false;
              for (const s of L.stains)
                if (s.layer === nl && Math.abs(s.y + 13 - cur.y) < 6 && dir * (s.x + s.w - cx) > -20) blocked = true;
              for (const b of L.blocks)
                if (b.layer === nl && dir * (b.x + b.w - cx) > -20 && b.x < cur.x + cur.w) blocked = true;
              if (!blocked && P.cd <= 0) K.erase = true;
            }
            if (tg.kind === 'flee' && tg.frz <= 0.9) {
              if (Math.abs(cx - (tg.x + tg.w / 2)) < tg.w / 2 + 190) {
                hold = true;
                if (Math.abs(tg.x - tg.x0) > 2) go(-dir);
              }
            }
            if (tg.kind === 'swap' && !tg.fixed) {
              if (P.cd <= 0) K.erase = true;
              hold = dir * (curEdge - cx) < 16;
            }
            for (const w of L.wolves || []) {
              const ph = w.t % 4.8;
              const inZone = cx > w.x0 - 30 && cx < w.x1 + 10,
                approaching = curEdge + 200 > w.x0 && cx < w.x1;
              if ((inZone || approaching) && ph > 2.2) hold = true;
            }
            const port = (L.ports || []).find(q => q.plat === cur && q.to === tg);
            if (port) {
              hold = true;
              if (Math.abs(port.x - cx) > 6) go(Math.sign(port.x - cx));
              else if (port.y < feet - 60) {
                wantJump = true;
                full = true;
              }
            }
            if (tg.kind === 'sway' && gap > Math.min(400, 135 / (L.gAll || 1)) && dir * (curEdge - cx) < 16)
              hold = true;
            if (L.tunnel && L.tunnel.t % 5.8 > 2.8 && dir * (curEdge - cx) < 22) hold = true;
            if (L.beams && L.beams.length && P.hidden && beamAhead(L, cx)) hold = true;
            if (tg.kind === 'ferry' && gap > 150 && dir * (curEdge - cx) < 16) hold = true;
            if (cur.kind === 'ferry' && Math.abs(cur.x - cur.x0) > 2) hold = true;
            if (!hold) {
              const dEdge = dir * (curEdge - cx);
              if (gap < -20 || dEdge > 12) go(dir);
              else {
                // sulle righe-battito si salta solo se saranno ancora lì all'atterraggio
                const ok = tg.kind !== 'beat' || (halfAt(0.5) === tg.phase && halfAt(0.74) === tg.phase);
                if (ok) {
                  go(dir);
                  wantJump = true;
                  holdJ = 0.5;
                  if (lowG && gap > 200) full = true;
                } else if (dEdge < 4) go(-dir);
              }
            }
          } else {
            // in volo
            if (L.mirror && tg.layer && tg.layer !== G.layer && P.cd <= 0) K.erase = true;
            const port = (L.ports || []).find(q => q.plat === cur && q.to === tg);
            const aim =
              gap < -20 ? (dir * (cx - curEdge) < 75 ? cx + dir * 50 : cx) : near + dir * Math.min(46, tg.w / 2);
            if (port) {
              if (Math.abs(port.x - cx) > 4) go(Math.sign(port.x - cx));
            } else if (Math.abs(aim - cx) > 8) go(Math.sign(aim - cx));
            const above = dir * (cx - near) > 4 && dir * (cx - near) < tg.w - 4;
            if (!above && !port && P.born <= 0 && gap >= -20 && P.air < 1 && P.vy * P.g >= -40) {
              // previsione balistica con la gravità reale del punto in cui si trova
              const surf = P.g > 0 ? tg.y : tg.y + tg.h,
                dy = (surf - feet) * P.g,
                v = P.vy * P.g;
              let gm = L.gAll || 1;
              if (L.lowAll) gm = 0.3;
              for (const z of L.lows || []) if (cx > z.x && cx < z.x + z.w) gm = 0.3;
              if (L.planets) gm = P.gm || 1;
              if (L.theme === 'rocks') gm = 1; // stima prudente tra gli asteroidi in movimento
              const GE = 1800 * gm,
                disc = v * v + 2 * GE * dy;
              const tt = disc >= 0 ? (-v + Math.sqrt(disc)) / GE : -1;
              if (tt < 0 || dir * (cx + (dir * P.w) / 2 + dir * 250 * tt - near) < 10) {
                wantJump = true;
                if (gm < 0.9 && gap > 200) full = true;
              }
            }
          }
        }
      }
      holdJ -= STEP;
      if (P.ground && !wantJump) full = false;
      inp.left = K.left;
      inp.right = K.right;
      inp.jump = wantJump || (holdJ > 0 && !P.ground && P.vy * P.g < 0) || (full && !P.ground && P.vy * P.g < 0);
      inp.jumpP = wantJump && !pj;
      pj = wantJump;
      inp.erase = K.erase;
      inp.eraseP = K.erase && !pe;
      pe = K.erase;
      update(STEP);
      t += STEP;
      if (G.turn) {
        done = true;
        break;
      }
    }
    const at = path[maxIdx] ? path[maxIdx].text : '';
    return finish(t, done, { reached: maxIdx, of: path.length - 1, at });
  }

  /** Nel pedinamento: c'è un fascio di torcia sul tratto scoperto fino alla prossima ombra? */
  function beamAhead(L, cx) {
    const inShade = x => L.shades.some(s => x > s.x - 2 && x < s.x + s.w + 2);
    let next = 1e9;
    for (const s of L.shades) if (s.x > cx + 10 && s.x < next) next = s.x;
    if (next > 1e8) next = cx + 400;
    const T = (next + 40 - cx) / 235 + 0.35;
    for (let k = 0; k <= 14; k++) {
      const tt = (k / 14) * T,
        pos = Math.min(next + 40, cx + 250 * tt);
      if (inShade(pos)) continue;
      for (const b of L.beams) {
        const bx = b.x0 + (b.x1 - b.x0) * (0.5 + 0.5 * Math.sin((G.t + tt) * b.sp + b.ph));
        if (Math.abs(pos - bx) < b.w / 2 - 4) return true;
      }
    }
    return false;
  }

  /** «Tra le lettere»: sale e scende sulle lettere giganti mentre la cancellatura insegue. */
  function letters(ch, li, maxT) {
    start(ch, li);
    const L = G.L;
    const solidAt = (x, y) =>
      L.blocks.some(b => x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h) ||
      L.plats.some(p => x >= p.x && x < p.x + p.w && y >= p.y && y < p.y + p.h);
    const groundBelow = (x, y, d) => {
      for (let yy = y; yy < y + d; yy += 8) if (solidAt(x, yy)) return true;
      return false;
    };
    const colTop = x => {
      for (let y = 150; y < 520; y += 8) if (solidAt(x, y)) return Math.floor((y - 220) / 40) * 40 + 220;
      return null;
    };
    let t = 0,
      pj = false,
      done = false,
      tgtTop = 0,
      tgtX = 0;
    while (t < maxT) {
      let want = false;
      const feet = P.y + P.h,
        fx = P.x + P.w;
      if (P.dead <= 0) {
        inp.right = true;
        inp.left = false;
        if (P.ground) {
          const gapAhead = !groundBelow(fx + 10, feet + 2, 90),
            wallAhead = solidAt(fx + 14, feet - 12);
          if (gapAhead || wallAhead) {
            want = true;
            tgtTop = feet;
            tgtX = fx + 40;
            let x = fx + 12;
            if (gapAhead) while (x < fx + 300 && colTop(x) === null) x += 8;
            const ct = colTop(x + 4);
            if (ct !== null) {
              tgtTop = ct;
              tgtX = x;
            }
          }
        } else if (P.air < 1 && P.vy >= 0 && feet > tgtTop - 6 && fx < tgtX + 6) want = true;
      }
      inp.jump = want || (!P.ground && P.vy < 0);
      inp.jumpP = want && !pj;
      pj = want;
      update(STEP);
      t += STEP;
      if (G.turn) {
        done = true;
        break;
      }
    }
    return finish(t, done, { x: Math.round(P.x), exit: L.exit.x });
  }

  /** «Il bosco allagato»: nuota nella fascia più libera tra le meduse. */
  function swim(ch, li, maxT) {
    start(ch, li);
    const L = G.L,
      end = L.plats[1];
    let t = 0,
      pj = false,
      done = false;
    while (t < maxT) {
      let want = false;
      inp.right = true;
      inp.left = false;
      if (P.dead <= 0) {
        const cy = P.y + P.h / 2;
        if (P.ground) want = P.x > 400 && P.x < end.x;
        else {
          let ty = 270;
          const ahead = L.stains.filter(s => s.x + s.w > P.x - 10 && s.x < P.x + 190);
          if (ahead.length) {
            let bands = [[60, 500]];
            for (const s of ahead) {
              const a = s.y - 30,
                b = s.y + s.h + 30;
              bands = bands.flatMap(([p, q]) =>
                b <= p || a >= q ? [[p, q]] : [...(a > p ? [[p, a]] : []), ...(b < q ? [[b, q]] : [])]
              );
            }
            let best = null;
            for (const [p, q] of bands) {
              if (q - p < 60) continue;
              const mid = (p + q) / 2,
                score = q - p - Math.abs(mid - cy) * 0.6;
              if (!best || score > best.score) best = { score, mid };
            }
            if (best) ty = best.mid;
            inp.right = !!best;
            const close = L.stains.filter(s => s.x + s.w > P.x - 10 && s.x < P.x + 80);
            for (const s of close) if (cy > s.y - 34 && cy < s.y + s.h + 34 && s.x > P.x + 12) inp.right = false;
            if (Math.abs(cy - ty) > 60 && close.length) inp.right = false;
          }
          if (P.x > end.x - 260) {
            // in vista della riva: lasciarsi affondare fino alla riga d'arrivo
            ty = end.y - 20;
            if (P.x > L.exit.x - 80 && P.y + P.h < L.exit.y) inp.right = false;
          }
          if (cy > ty + 8 && P.vy > -60) want = true;
        }
      }
      inp.jump = want;
      inp.jumpP = want && !pj;
      pj = want;
      update(STEP);
      t += STEP;
      if (G.turn) {
        done = true;
        break;
      }
    }
    return finish(t, done, { x: Math.round(P.x), exit: L.exit.x });
  }

  window.MarginaliaBots = { line, letters, swim };
})();
