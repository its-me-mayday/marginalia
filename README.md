# Marginalia — La casa di Vetrano

Platform narrativo per browser. Postilla, una nota a margine fatta d'inchiostro, entra in un romanzo gotico per ripararlo dal Refuso.

- **Gioca online:** https://its-me-mayday.github.io/marginalia/
- **In locale:** apri `index.html` (file unico, autonomo: nessun server, nessuna dipendenza esterna).
- **Comandi:** ← → muovi · SPAZIO salta (due volte) · X sbianchetto · P pausa · M audio. Su telefono compaiono i tasti touch.

## Il gioco

Otto livelli e un boss dentro un diario gotico, «La casa di Vetrano». Le piattaforme sono le righe del testo, e ogni livello ha una meccanica propria: il diario che mente al buio, le righe che scappano, le piattaforme che esistono solo sul battito, la pagina letta al contrario, le lettere giganti, lo specchio a due versioni. Gli asterischi a matita nascondono le note del lettore che ha dato origine a tutto.

Durata: circa 20–30 minuti. I progressi si salvano nel browser.

## Come è nato

Il gioco è stato generato da un prompt, riportato per intero e tenuto aggiornato in [`PROMPT.md`](PROMPT.md) insieme al registro delle modifiche.

## Sviluppo

Il sorgente è in `src/`; `node build.js` rigenera `index.html` unendo i file e incorporando il font.

| File | Contenuto |
|---|---|
| `src/core.js` | canvas, input (tastiera, touch, gamepad), audio procedurale, particelle |
| `src/levels.js` | capitoli, livelli, testi, annotazioni |
| `src/game.js` | fisica, Postilla, nemici, boss |
| `src/render.js` | disegno del mondo |
| `src/ui.js` | biblioteca, HUD, transizioni, finale, salvataggio |

Regole: commit in formato Conventional Commits; a ogni modifica del gioco si aggiorna anche `PROMPT.md`.

### Aggiungere una storia

In `src/levels.js` aggiungi un oggetto a `CHAPTERS` con la sua lista di funzioni-livello, costruite con `builder()` come quelle esistenti.

## Crediti

Font: EB Garamond (SIL Open Font License 1.1, vedi `fonts/`).
