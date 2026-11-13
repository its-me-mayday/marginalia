# PROMPT — Marginalia: La casa di Vetrano

Questo documento contiene il prompt completo per generare il gioco, sempre allineato allo stato attuale del repository. Ogni modifica al gioco va riportata qui: nel prompt stesso e nel registro in fondo.

---

## Il prompt

Costruisci un platform 2D narrativo per browser, da pubblicare su un sito web statico. Deve essere un gioco completo, curato nei dettagli, visivamente bellissimo e fluido. Durata obiettivo: circa trenta minuti, mai prolissi. Regola fondamentale: nessun livello ripete le meccaniche del precedente; ogni livello introduce un'idea nuova e a metà la ribalta, così il giocatore non sa mai cosa aspettarsi.

### Vincoli tecnici

- Un unico file `index.html` autonomo: nessun server, nessuna dipendenza esterna, font incorporato. Deve funzionare aprendo il file o servendolo da GitHub Pages.
- HTML5 Canvas e JavaScript senza framework. Sorgente diviso in moduli (`src/core.js`, `levels.js`, `game.js`, `render.js`, `ui.js`) uniti da uno script di build (`node build.js`).
- Risoluzione logica 960×540, resa nitida alla densità del dispositivo. Simulazione a passo fisso (120 Hz).
- Comandi: tastiera (← → o A D, SPAZIO per saltare, X per lo sbianchetto, P pausa, M audio), gamepad, e tasti touch a schermo su telefono (in orizzontale sovrapposti, in verticale sotto il gioco).
- Salvataggio dei progressi in `localStorage` (livello raggiunto, indice dei livelli sbloccati), sempre dentro try/catch.
- Le storie sono moduli: `CHAPTERS` in `levels.js` è una lista, e ogni storia ha la propria lista di funzioni-livello costruite con lo stesso `builder()`.

### Concept

Una biblioteca infinita, la Biblioteca dei Margini, custodisce tutte le storie. Un'entità chiamata il Refuso le corrompe: nasce come una lettera sbagliata, diventa una parola, poi una frase, poi riscrive i finali. La protagonista è Postilla, una piccola figura d'inchiostro nata da una nota a margine scritta a matita da un lettore sconosciuto. Entra nei libri per ripararli.

Tema: chi legge un libro, lo cambia. Una nota lo arricchisce, un errore lo distorce, ma entrambi sono tracce di qualcuno che ha letto. Rivelazione finale: Refuso e Postilla sono nati dalla stessa mano. Domanda lasciata aperta: Postilla ha riparato il libro o lo ha riscritto a modo suo?

Il gioco non annuncia seguiti numerati: il finale lascia aperta la possibilità di altre storie nella stessa biblioteca.

### Protagonista

Postilla: goccia d'inchiostro nero con due occhi chiari, gambette, e un segno di matita grigio che le fluttua sopra la testa. Non parla. Abilità:

- salto e doppio salto (altezza variabile, coyote time, jump buffering);
- lo **sbianchetto**, a ricarica: cancella per pochi secondi il testo corrotto, corregge le parole sbagliate vicine, e in alcuni livelli assume un ruolo diverso (gela le righe che fuggono, cambia versione della pagina, restaura le frasi del boss).

Animazioni: squash e stretch su salto e atterraggio, scia d'inchiostro in corsa, gocce da ferma, battito di ciglia, morte in cui si scioglie in schizzi e rinascita dal capoverso.

### Antagonista

Il Refuso: non un mostro ma inchiostro più profondo, con riflessi viola. Si manifesta come macchie letali che gocciolano, pareti di lettere corrotte, parole storpiate con le zampette che camminano sulle righe (saltandoci sopra si correggono), una cancellatura che insegue, e infine come il padrone della villa: una pagina con un volto di macchia, senza riflesso.

### Stile visivo

Inchiostro su carta ad alta definizione, disegnato dal codice. Palette ristretta: seppia, beige, avorio; nero per l'inchiostro; viola profondo per il Refuso; grafite per tutto ciò che è scritto a matita. Le piattaforme sono righe di testo vero e leggibile, in EB Garamond corsivo: il testo è la scenografia. Sfondi in parallasse per ogni livello (arcate, scaffali, travi, lettere enormi, specchi), righe di quaderno, margine rosso, grana di carta, vignettatura, pulviscolo. Nei livelli bui, luce di candela che tremola. Cambio livello come una pagina che si volta. Tono: elegante, inquietante, con momenti giocosi.

### Audio

Tutto generato con Web Audio, senza file. Progressione di accordi con archi e pianoforte arpeggiato, riverbero da stanza vuota. Ogni livello ha la sua voce: pizzicato buffo per le righe che fuggono, quasi solo battito sotto il pavimento, ostinato teso per l'inseguimento e il boss. Un tema di sette note, il tema di Postilla, ritorna in più livelli. Battito cardiaco che scandisce il ritmo dove serve, pioggia e tuoni nel temporale. Effetti: passi, salto, atterraggio, sbianchetto, sussurro quando il diario parla, vetro che s'incrina.

### La storia: «La casa di Vetrano»

Un romanzo gotico in forma di diario, nell'essenza della narrativa gotica ottocentesca (atmosfera alla Poe e Stoker, senza citarli né riprodurne testi). Un ospite arriva a una villa isolata, non riesce più a uscirne, e il padrone di casa non si riflette mai. Il narratore è inaffidabile: man mano che il Refuso lo corrompe, il diario mente.

Livelli (ogni riga-piattaforma è una frase del diario):

1. **L'arrivo** — tutorial: movimento, salto, doppio salto. La villa è accogliente. Sull'ultima riga, in silenzio, una lettera si corrompe («mattino» diventa «mattimo»).
2. **Le stanze** — lo sbianchetto apre le pareti di parole corrotte; parole storpiate da correggere saltandoci sopra; prime macchie. Seconda metà: due pareti in fila, da cancellare a tempo con la ricarica.
3. **Il diario mente** — buio. Il narratore scrive righe false (non reggono) e ne nasconde di vere (invisibili). La candela rivela per qualche secondo le une e le altre. Seconda metà: la candela si spegne e resta solo il lampo del temporale, a intervalli: guarda, ricorda, salta.
4. **Le righe fuggono** — momento comico: le frasi scappano quando Postilla si avvicina. Lo sbianchetto, usato da lontano, le gela dallo spavento. Seconda metà: righe curiose che vengono a prenderti e ti traghettano.
5. **Sotto il pavimento** — discesa nel buio; le piattaforme «tum» esistono solo sul loro mezzo battito (con una piccola tolleranza), e il ritmo accelera. Seconda metà: macchie che si gonfiano sul battito, da attraversare nel silenzio tra un colpo e l'altro.
6. **A ritroso** — il narratore racconta dalla fine: si gioca da destra a sinistra, le frasi hanno le parole in ordine inverso, alcune righe si riavvolgono dopo che le hai toccate. Nelle pagine capovolte la gravità si inverte e si cammina sul soffitto.
7. **Tra le lettere** — Postilla si fa piccola: la frase «lui non ha ombra e non ha nome ma io ho un nome e lui me lo ruba» diventa un paesaggio di lettere giganti da scalare, mentre una cancellatura la insegue e a metà accelera.
8. **Lo specchio** — due versioni sovrapposte della pagina, «ciò che è scritto» e «ciò che è vero»: lo sbianchetto passa dall'una all'altra, anche in volo. Seconda metà: lo specchio si incrina e la pagina cambia versione da sola, a intervalli.
9. **La pagina** (boss) — arena fissa. Tre fasi da tre frasi corrotte ciascuna: raggiungile e restaurale con lo sbianchetto. Fase 1: la pagina lancia parole storpiate. Fase 2: fa comparire macchie sotto i piedi. Fase 3: si sdoppia in due pagine specchiate.

Checkpoint frequenti (i capoversi ¶), vite infinite, nessun game over.

### Le annotazioni

In ogni livello sono sparsi asterischi a matita. Ognuno, raccolto, fa comparire un foglietto con una nota del lettore misterioso. Lette in ordine raccontano una storia parallela: un lettore che rilegge il libro sperando che l'ospite si salvi, prova a correggere il finale a penna, e macchia tutto. Chi le raccoglie tutte partendo dal primo livello vede un'ultima nota nel finale: «Questa volta, fallo uscire.»

### Finale

La pagina si ricompone e il diario ora finisce bene: l'ospite riparte al mattino. Accanto all'ultima riga compare un segno di matita identico a quello di Postilla. Poi, una schermata alla volta: «Lo stesso lettore.» — «Una nota a margine. Un errore di stampa. Due tracce della stessa mano: chi legge un libro, lo cambia.» — «Ora il libro finisce bene. Ma nessuno ricorda come finiva prima. Postilla lo ha riparato. O lo ha riscritto?» Si chiude sulla biblioteca: i libri non finiscono mai, e su un altro scaffale un'altra pagina comincia a macchiarsi. Riepilogo: tempo, annotazioni raccolte, cadute.

### Cornice

Schermata titolo: un libro aperto davanti agli scaffali, con Postilla accanto al titolo. Pulsanti per iniziare, continuare, ricominciare; indice dei livelli già raggiunti. HUD minimale: nome del livello, annotazioni, gomma con ricarica, barra della candela. Pausa («Segnalibro»). Pulsanti per audio, pausa e schermo intero.

### Qualità

Game feel curato: particelle d'inchiostro, screen shake calibrato, transizioni morbide. Ogni livello deve essere completabile: verificarlo con un giocatore automatico che lo percorre dall'inizio alla fine.

### Regole del repository

- Commit in formato Conventional Commits, senza righe di co-autore.
- `PROMPT.md` va aggiornato a ogni modifica del gioco.
- `index.html` alla radice è il gioco pubblicato: va rigenerato con `node build.js` prima di ogni commit che tocca `src/`.

---

## Registro delle modifiche al prompt

| # | Modifica | Motivo |
|---|---|---|
| 1 | Prima stesura: cinque livelli più boss, pixel art a bassa risoluzione, dieci minuti. | Concept iniziale definito a voce. |
| 2 | Grafica ad alta risoluzione, tante animazioni, tono «un po' pazzerello»; durata portata a mezz'ora; otto livelli, ognuno con una meccanica propria. | Richiesta dell'autore: più bello, più lungo, mai prevedibile. |
| 3 | Ogni livello ha una seconda metà che ribalta la meccanica (temporale, righe curiose, macchie pulsanti, specchio incrinato). | Allungare senza ripetere. |
| 4 | File unico autonomo al posto del progetto Vite/TypeScript; comandi touch. | Deve girare su un sito statico e sul telefono. |
| 5 | Lettere giganti squadrate, senza spalle basse; spazi tra le parole ridotti. | Le spalle erano trappole ingiuste scoperte in verifica. |
| 6 | Tolleranza sulle piattaforme a battito; macchie pulsanti più strette. | Tempi troppo stretti in verifica. |
| 7 | Colonna sonora riscritta: accordi, tema di Postilla, riverbero, pioggia, voce diversa per livello. | Richiesta dell'autore: migliorare il sonoro. |
| 8 | Rimosso «Capitolo II — prossimamente»; finale aperto su altre storie possibili. | Richiesta dell'autore. |
| 9 | Finale reso esplicito: «chi legge un libro, lo cambia» e il dubbio riparato/riscritto. | Il significato non arrivava. |
| 10 | Gli asterischi diventano annotazioni del lettore, con nota finale per chi le trova tutte. | Dare uno scopo ai collezionabili. |
