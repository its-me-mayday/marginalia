# Marginalia

Platform narrativo per browser. Postilla, una nota a margine fatta d'inchiostro, entra nei libri per ripararli dal Refuso.

- **Gioca online:** https://its-me-mayday.github.io/marginalia/
- **In locale:** apri `index.html` (file unico, autonomo: nessun server, nessuna dipendenza esterna).
- **Comandi:** ← → muovi · SPAZIO salta (due volte) · X sbianchetto · P pausa · M audio. Su telefono compaiono i tasti touch.

## Il gioco

Le piattaforme sono le righe del testo. Ogni libro è un genere, e ogni livello ha una meccanica propria.

- **Libro I — «La casa di Vetrano»**: un diario gotico. Otto livelli e un boss: il diario che mente al buio, le righe che scappano, le piattaforme che esistono solo sul battito, la pagina letta al contrario, le lettere giganti, lo specchio a due versioni.
- **Libro II — «C'era una volta, forse»**: una fiaba illustrata, che si apre solo a primo libro finito. Sette livelli e un boss: le parole da ricalcare (rana, piuma, sasso), le parole scambiate, il lupo che non va svegliato, il giorno e la notte che si alternano, il bosco allagato, le rime, la lanterna di Brina.
- **Libro III — «Chi ha strappato l'ultima pagina»**: un giallo su un treno di notte, che si apre a secondo libro finito. Sette livelli e un boss: le ombre dei lampioni, gli omissis, il tetto del treno, gli interrogatori a tre versioni, il pedinamento nell'ombra, il palazzo mentale, la fuga senza sbianchetto.

Gli asterischi a matita nascondono le note del lettore che ha dato origine a tutto. In pausa c'è il registro del lettore, con punti e statistiche di ogni libro. I progressi si salvano nel browser.

## Come è nato

Il gioco è stato generato da un prompt, riportato per intero e tenuto aggiornato in [`PROMPT.md`](PROMPT.md) insieme al registro delle modifiche.

## Sviluppo

Il sorgente è in `src/`; `node build.js` rigenera `index.html` unendo i file e incorporando il font.

| File | Contenuto |
|---|---|
| `src/core.js` | canvas, input (tastiera, touch, gamepad), audio procedurale, particelle |
| `src/levels.js` | libri, livelli, testi, annotazioni, finali |
| `src/game.js` | fisica, Postilla, nemici, boss |
| `src/render.js` | disegno del mondo |
| `src/ui.js` | biblioteca, HUD, registro, transizioni, finali, salvataggio |

Regole: commit in formato Conventional Commits; a ogni modifica del gioco si aggiorna anche `PROMPT.md`.

### Aggiungere una storia

In `src/levels.js` aggiungi un oggetto a `CHAPTERS` con la sua lista di funzioni-livello, costruite con `builder()` come quelle esistenti.

## Licenza

Codice e testi: licenza MIT (vedi `LICENSE`).

## Crediti

Font: EB Garamond (SIL Open Font License 1.1, vedi `fonts/`).
