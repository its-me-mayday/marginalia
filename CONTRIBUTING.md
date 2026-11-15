# Come si lavora su Marginalia

## Preparazione

Serve Node 20 o più recente.

```bash
npm ci
npx playwright install chromium   # il browser per i test, una volta sola
```

Se hai già Chrome installato puoi saltare il secondo comando e usare quello: `export CHROME_PATH=/percorso/di/chrome`.

## Il ciclo di lavoro

1. Modifica i sorgenti in `src/` (mai `index.html` a mano: è generato).
2. `npm run build` rigenera `index.html`; aprilo nel browser per provare.
3. `npm run check` prima di ogni commit: formattazione, build, lint e test. La CI esegue lo stesso comando e rifiuta un `index.html` non rigenerato.

| Comando | Cosa fa |
|---|---|
| `npm run build` | costruisce `index.html` da `src/`, font e template |
| `npm run format` | formatta il codice con Prettier |
| `npm run lint` | ESLint sui sorgenti e controllo del bundle completo |
| `npm test` | tutti i test (Node + Playwright) |
| `npm run check` | tutto quanto sopra, in ordine |

## Commit

Formato [Conventional Commits](https://www.conventionalcommits.org/it/v1.0.0/), in inglese, senza righe di co-autore:

- `feat:` un libro, un livello, una meccanica, una funzione nuova
- `fix:` una correzione (di gioco, di bilanciamento, di grafica)
- `docs:` solo documentazione
- `test:` solo test
- `refactor:`, `style:`, `chore:`, `ci:` per il resto

## Cosa aggiornare insieme al codice

Ogni modifica al gioco porta con sé:

- **`CHANGELOG.md`**: una riga nella sezione «Non rilasciato», sotto Aggiunto / Modificato / Corretto / Rimosso.
- **`PROMPT.md`**: il prompt deve continuare a descrivere il gioco così com'è, e il registro in fondo spiega il perché della modifica.
- **I test**, se cambia una regola: ogni livello normale deve restare completabile dal giocatore automatico, ogni boss deve avere la sua regola verificata.

## Rilasciare una versione

1. Scegli il numero: nuovo libro o meccanica → minore (`1.1.0`), correzione → patch (`1.0.1`).
2. Aggiorna `version` in `package.json` (`npm version --no-git-tag-version 1.1.0`).
3. In `CHANGELOG.md` sposta «Non rilasciato» sotto il nuovo numero con la data, e aggiorna i link in fondo.
4. `npm run check`, poi commit (`chore: release v1.1.0`) e tag annotato: `git tag -a v1.1.0 -m "v1.1.0"`.
5. `git push --follow-tags`.

## Aggiungere un libro o un livello

Il formato dei livelli, i tipi di piattaforma e i passi per un libro nuovo sono in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md#aggiungere-un-libro).
