# Marginalia — La casa di Vetrano

Platform narrativo per browser. Postilla, una nota a margine fatta d'inchiostro, entra in un romanzo gotico per ripararlo dal Refuso.

- **Gioca:** apri `index.html` (file unico, autonomo: nessun server, nessuna dipendenza esterna).
- **Comandi:** ← → muovi · SPAZIO salta (due volte) · X sbianchetto · P pausa · M audio. Su telefono compaiono i tasti touch.

## Sviluppo

Il sorgente è in `src/`; `node build.js` rigenera `index.html` unendo i file e incorporando il font.

| File | Contenuto |
|---|---|
| `src/core.js` | canvas, input (tastiera, touch, gamepad), audio procedurale, particelle |
| `src/levels.js` | capitoli, livelli, testi, annotazioni |
| `src/game.js` | fisica, Postilla, nemici, boss |
| `src/render.js` | disegno del mondo |
| `src/ui.js` | biblioteca, HUD, transizioni, finale, salvataggio |

### Aggiungere una storia

In `src/levels.js` aggiungi un oggetto a `CHAPTERS` con la sua lista di funzioni-livello, costruite con `builder()` come quelle esistenti.

## Crediti

Font: EB Garamond (SIL Open Font License 1.1, vedi `fonts/`).
