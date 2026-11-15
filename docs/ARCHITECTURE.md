# Architettura di Marginalia

Questo documento spiega come è fatto il gioco dentro: come si costruisce, come gira, come sono descritti libri e livelli, e come si verifica. Per il *cosa* e il *perché* di ogni scelta di design c'è [PROMPT.md](../PROMPT.md).

## In breve

- **Un solo file pubblicato.** `index.html` contiene font, stile e codice. Non carica nulla da fuori e funziona aperto da disco o servito da GitHub Pages.
- **Niente framework.** HTML5 Canvas 2D e Web Audio, JavaScript moderno senza dipendenze a runtime.
- **Sorgenti separati, bundle unico.** `src/` è diviso per responsabilità; `build.js` concatena i file in ordine dentro `index.tpl.html`.
- **Simulazione deterministica.** La fisica avanza a passi fissi di 1/120 di secondo, indipendenti dal frame rate. È ciò che permette ai test di giocare un livello intero in pochi millisecondi.

## File

| Percorso | Ruolo |
|---|---|
| `src/core.js` | canvas e scala, utilità matematiche, input (tastiera, touch, gamepad), audio generato (`AU`, `MUSIC`), particelle, texture di carta |
| `src/levels.js` | **solo dati**: temi, suggerimenti, costruttori di livelli, i quattro libri, l'epilogo, note, finali, prologhi |
| `src/game.js` | stato di gioco (`G`), Postilla (`P`), fisica, piattaforme vive, nemici, oggetti, sbianchetto, boss, telecamera, `update()` |
| `src/render.js` | disegno del mondo: sfondi per tema, righe, nemici, Postilla, Brina, boss, luci, effetti |
| `src/ui.js` | cornice: salvataggio, biblioteca, registro, HUD, prologhi, transizioni, finali, macchina a stati, ciclo principale, avvio |
| `index.tpl.html` | pagina, stile, tasti a schermo; segnaposto per font e codice |
| `build.js` | genera `index.html`; con `--check` verifica che sia aggiornato |
| `fonts/` | EB Garamond (SIL OFL 1.1), incorporato come base64 |
| `tests/` | test Node + Playwright e giocatori automatici |
| `scripts/lint-bundle.mjs` | lint del bundle completo |

L'ordine di concatenazione è `core → levels → game → render → ui`: ogni file può usare ciò che è dichiarato nei precedenti. Il build antepone `const VERSION` presa da `package.json`.

## Ciclo di esecuzione

```
requestAnimationFrame → frame()
  pollInput()                    legge tastiera, touch, gamepad in `inp`
  AU.tick()                      programma le note della musica
  finché c'è tempo accumulato:
    step(1/120)                  macchina a stati della cornice
      ├─ transizione di pagina in corso → avanza solo quella
      ├─ title   → updTitle()
      ├─ intro   → updIntro()
      ├─ play    → update()      (salvo pausa)
      └─ ending  → updEnding()
  draw()                         disegna lo stato corrente
```

I fronti d'ingresso (`jumpP`, `eraseP`, `startP`, `pauseP`) restano attivi finché un passo di simulazione non li consuma: così un tocco brevissimo non si perde anche se cade tra due fotogrammi.

`update(dt)` per un livello fa, in ordine: battito e ritmo, piattaforme vive (`updPlats`), Postilla (`updPlayer`), nemici-parola, oggetti e uscita (`updItems`), inseguimento, boss, proiettili, particelle, telecamera.

## Il modello dei dati

### Libro (`CHAPTERS[i]`)

| Campo | Contenuto |
|---|---|
| `title`, `roman`, `cover` | titolo, numero, colori della copertina `[fondo, inchiostro]` |
| `levels` | lista di funzioni che costruiscono ciascun livello |
| `notes` | per ogni livello, le note del lettore rivelate dagli asterischi (una per asterisco) |
| `intro`, `register` | prologo (pagine di righe) e registro grafico: `goth`, `fairy`, `noir`, `man`, `lib` |
| `ending`, `shelf`, `secret` | finale in quattro pagine, due righe della biblioteca, nota segreta per chi trova tutto |
| `epi`, `endings` | solo per l'epilogo: è dopo i libri, e ha un finale per ciascuna scelta |

`NB` è il numero di libri veri; l'epilogo è l'elemento `CHAPTERS[NB]` e non compare tra le copertine.

### Livello

Ogni funzione-livello chiama `mkLevel({...})` e riempie il livello con un costruttore a catena:

```js
function esempio() {
  const L = mkLevel({ name: 'Le stanze', date: '4 novembre', theme: 'rooms', mood: 1 });
  builder(L, 120, 420)
    .ln('Mi sono svegliato tardi.').spawn()
    .ln('La porta è chiusa.', 110, -30).mark()          // riga a 110 px, 30 px più in alto; un asterisco sopra
    .ln('Oltre, la sala da musica.', 120, 0).check()    // capoverso: punto di ripartenza
    .ln('Un clavicembalo che nessuno suona;', 130, -50).bug('clavicenbalo', 'clavicembalo')
    .ln('La mia candela si è spenta da sola.', 140, 60).exit();
  return L;
}
```

Costruttori: `builder` (base), `fbuilder` (fiaba), `nbuilder` (noir), `mbuilder` (spazio). Ognuno estende il precedente.

**Opzioni del livello** (in `mkLevel`): `theme`, `mood`; e, per le meccaniche, `boss`, `fixed` (arena senza scorrimento), `beat`, `flee`, `reverse`, `chase`/`chaseSpeed`, `mirror`/`autoPeriod`/`labels`, `water`, `flatY`, `gAll` (gravità di tutto il livello), `pull` (spinta laterale), `wind`, `tunnel`, `noErase`, `brina`, `epi`.

**Tipi di riga-piattaforma** (`kind`):

| Tipo | Comportamento |
|---|---|
| `line` | riga normale, regge sempre |
| `fake` | riga scritta dal narratore che mente: non regge |
| `hidden` | riga vera ma invisibile, si vede solo alla luce della candela o del lampo |
| `beat` | esiste solo sul suo mezzo battito (con una piccola tolleranza) |
| `flee` | scappa quando Postilla si avvicina; lo sbianchetto la gela |
| `ferry` | riga curiosa che viene a prenderti e ti traghetta |
| `rewind` | dopo che l'hai toccata si riavvolge e sparisce per qualche secondo |
| `swap` | parola sbagliata, non regge finché lo sbianchetto non la rimette a posto |
| `rhyme` | compare per pochi secondi quando atterri sulla riga che la chiama |
| `sway` | ombra o pannello che oscilla e ti trasporta |
| `shelf` | scaffale di legno (epilogo) |

Le righe possono avere anche `layer` (1 o 2, versioni dello specchio), `flipG` (capovolge la gravità), `gm` (gravità del pianetino), `tempo`, `say`, `glitch`, `reveals`.

**Altri elementi del livello**: `bugs` (parole-nemico), `stains` (macchie; con `beat` pulsano, con `amp` si muovono, `jelly` meduse e meteore), `blocks` (pareti corrotte, rovi `twig`, lettere giganti `tile`), `marks` (asterischi), `checks` (capoversi), `candles`, `zones` (pagine capovolte), `words` (parole da ricalcare), `wolves`, `npcs`, `shades` e `beams` (ombre e torce), `pa`/`pb` (asterischi-portale, collegati per `id`), `lows` (gravità ridotta), `planets`, `memories`, `reader`, `refuso`.

### Boss

Un boss è un livello con `boss: true`, nove `targets` `[frase sbagliata, frase giusta, x, y]` e tre `bossSay`. Le frasi si restaurano con lo sbianchetto entro 130 px; ogni tre si passa di fase. La regola specifica è in `bossMode`:

| `bossMode` | Libro | Regola |
|---|---|---|
| `beat` | I | il colpo vale solo sul battito (`G.beatPh === 0`); il cuore accelera a ogni fase |
| `swap` | II | le righe sospese vanno rimesse a posto per salirci; a ogni frase restaurata vengono rimescolate |
| `clue` | III | serve la prova (`L.clues`) raccolta nel vagone |
| `grav` | IV | metà delle frasi sono sul soffitto; le piastre `flipG` capovolgono la gravità |

Gli effetti di fase per libro sono in `nextTarget()`: acqua e buio nella fiaba, torce e vento nel noir, gravità ridotta e spinta laterale nello spazio.

## Audio

Tutto generato con Web Audio, senza file. `MUSIC[mood]` descrive la musica di un livello: tonica (`root`), durata del passo (`st`), progressione di accordi (`prog`), densità delle note, volumi di archi e basso, strumento (`piano`, `box` carillon, `pluck` pizzicato), ostinato, contrabbasso che cammina (`walk`), note stonate (`sour`), tema di Postilla (`motif`). Gli effetti sono in `AU.sfx(nome)`.

## Salvataggio

`localStorage['marginalia.v2']`:

```json
{
  "books": [{ "li": 3, "max": 5, "done": false, "best": { "points": 5230, "marks": 30, "time": 1280, "deaths": 22 } }],
  "pro": true,
  "all": false
}
```

`li` è il segnalibro, `max` il livello più avanzato raggiunto, `best` la lettura migliore fatta dall'inizio alla fine, `pro` se il prologo è già stato visto, `all` la modalità prova. Il formato della prima versione (`marginalia.v1`) viene recuperato. Ogni accesso è protetto: con lo storage bloccato o un dato rovinato il gioco riparte da zero senza errori.

## Test

`npm test` lancia i test con il runner di Node. I test aprono `index.html` in Chromium (Playwright), fermano il ciclo di gioco reale e fanno avanzare la simulazione a mano, in modo deterministico.

| File | Cosa verifica |
|---|---|
| `build.test.mjs` | `index.html` allineato ai sorgenti, autonomo, con la versione giusta |
| `levels.test.mjs` | ogni libro e livello è costruito in modo valido; ogni asterisco ha la sua nota; un boss per libro, ciascuno con la sua regola |
| `playthrough.test.mjs` | un giocatore automatico completa **ogni livello normale** usando solo sinistra, destra, salto e sbianchetto |
| `bosses.test.mjs` | per ogni boss, la regola rifiuta il colpo quando deve e lo accetta quando deve; il boss porta al finale |
| `flow.test.mjs` | prologo al primo avvio, prologo dei libri, sblocchi in ordine, modalità prova, salvataggio dopo un ricaricamento, salvataggi vecchi o rovinati, passaggio di livello, pausa, entrambi i finali dell'epilogo |
| `render.test.mjs` | ogni livello, prologo, biblioteca, registro e finale si disegnano senza errori; i tasti a schermo compaiono su telefono |

I giocatori automatici (`tests/helpers/bots.js`) non barano: non spostano Postilla e non modificano il livello. Se uno arriva all'uscita, il livello è completabile con i comandi veri. Ce ne sono tre: `line` per i livelli a righe, `letters` per le lettere giganti, `swim` per il bosco allagato.

Il lint ha due livelli: ESLint sui singoli sorgenti, e `scripts/lint-bundle.mjs` sul bundle intero, dove ogni simbolo è visibile e si possono quindi segnalare variabili non definite e codice mai usato.

## Aggiungere un libro

1. In `src/levels.js`, prima della sezione dell'epilogo:
   - aggiungi i temi in `THEMES` e, se servono, i suggerimenti in `HINTS`;
   - scrivi le funzioni-livello con un costruttore (o estendine uno per le meccaniche nuove);
   - l'ultimo livello è il boss: `boss: true`, `fixed: true`, nove `targets`, tre `bossSay`, un `bossMode`;
   - fai `CHAPTERS.push({...})` con titolo, copertina, note (una per asterisco), prologo e `register`, finale, `shelf`, `secret`.
2. In `src/core.js` aggiungi una voce a `MUSIC` per ogni livello nuovo; in `src/ui.js` il `mood` del finale in `BOOK_MOOD`.
3. Se il boss ha una regola nuova, implementala in `nextTarget()` e `bossErase()` (`src/game.js`) e il suo disegno in `drawBoss()`.
4. Se il prologo ha un registro nuovo, aggiungilo in `drawIntro()`.
5. Test: aggiorna il conteggio dei libri in `levels.test.mjs` e l'elenco delle regole dei boss; aggiungi il caso del nuovo boss in `bosses.test.mjs`. Se un livello richiede un modo di giocare nuovo, insegnalo al bot o aggiungine uno.
6. `npm run check`, poi `CHANGELOG.md` e `PROMPT.md`.
