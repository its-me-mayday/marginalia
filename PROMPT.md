# PROMPT — Marginalia

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

### Secondo libro: «C'era una volta, forse»

Si sblocca se e solo se il primo libro è stato finito. Stesso motore, stessa Postilla, ma un genere intero diverso: una fiaba illustrata.

- **Storia**: Brina, una bambina, deve portare una lanterna alla nonna oltre il bosco. Qui il Refuso non macchia: scambia. Il lupo fa la nonna, il bosco diventa mare, il giorno diventa notte.
- **Stile**: carta bianca, acquerelli vivaci (colline, alberi, sole e luna), testo in tondo e non in corsivo. Postilla è l'unica cosa nera.
- **Musica**: carillon e pizzicati in tonalità maggiori, una voce per livello.
- **Potere nuovo, il ricalco**: toccando una parola sospesa, Postilla la copia per qualche secondo. «Rana» salta altissimo, «piuma» cade lenta e plana, «sasso» sfonda i rovi (ma non può fare il doppio salto).
- **Brina**: non si gioca, si accompagna. Segue Postilla con mezzo secondo di ritardo. Deve essere dettagliata e molto animata: gambe a due segmenti con calzini e stivaletti, mantellina gialla che svolazza, sciarpa rossa, due trecce con fiocco e una lanterna che oscillano come pendoli a molla, camminata, salto, caduta, nuoto, atterraggio con squash, battito di ciglia, sguardo che segue Postilla, saluto quando sta ferma, spavento quando il lupo apre l'occhio.
- **Il viandante**: una figura a matita con il cappello che compare e svanisce. È il lettore, entrato nel libro come promesso nell'ultima nota del primo. Ambiguo: a volte commenta, a volte cambia una parola.
- **Filo con il primo libro**: è il libro che il lettore leggeva da bambino. Le annotazioni sono in stampatello infantile, e l'ultima rivela che la sua prima nota a margine, «ciao», è il momento in cui è nata Postilla.

Livelli:

1. **C'era una volta** — tutorial del ricalco: una salita che richiede «rana», un burrone che richiede «piuma».
2. **Parole scambiate** — righe che non reggono perché hanno la parola sbagliata («fumo» al posto di «ponte»): lo sbianchetto le rimette a posto. Primo incontro con il viandante.
3. **Un, due, tre, lupo** — un lupo dorme. Quando apre l'occhio (preavviso con le orecchie) bisogna essere immobili a terra.
4. **Giorno e notte** — sole e luna si alternano da soli a intervalli; alcune righe esistono solo di giorno, altre solo di notte. Lo sbianchetto cancella il sole o la luna.
5. **Il bosco allagato** — «bosco» è stato scambiato con «mare»: si nuota tra meduse d'inchiostro, ferme e mobili.
6. **Le rime** — ogni riga, quando ci atterri, fa comparire la sua rima per pochi secondi.
7. **La lanterna** — notte vera: la luce è la lanterna di Brina, che ti segue. Rovi da sfondare come «sasso», parole scambiate, e il viandante che confessa.
8. **Il Narratore** (boss) — tre fasi come nel primo, ma l'arena cambia: nella seconda si allaga, nella terza resta al buio con la sola lanterna.

Finale: «E vissero felici e contenti. Forse.» Il viandante chiude il libro dall'interno e si chiede se una storia che finisce come vuole lui sia ancora la storia di qualcun altro.

### Terzo libro: «Chi ha strappato l'ultima pagina»

Si sblocca a secondo libro finito. Un giallo: l'impianto è alla Agatha Christie (un treno di notte, un cerchio chiuso di sospettati, la riunione finale), l'investigatore è alla Sherlock Holmes in versione tipografica. Omaggi, non personaggi altrui.

- **Storia**: la vittima è il finale del libro, strappato via. Indaga il signor Corsivo, alto e deduttivo, con l'assistente dottor Tondo, lento e solido. I sospettati vengono dai primi due libri: il lupo, Brina, l'ospite di Vetrano, il viandante, il Narratore. A metà le prove portano a Postilla, che da investigatrice diventa indagata.
- **Soluzione**: sono stati tutti. Chi ci ha dormito sopra, chi ha piegato un angolo, chi ha scritto a margine, chi ha corretto: ogni lettura strappa via qualcosa. E la pagina ritrovata è bianca: il finale non era mai stato scritto.
- **Il Refuso censura**: barre nere di omissis su nomi e prove. Lo sbianchetto le toglie.
- **Stile**: notte, pioggia, lampioni; testo dattiloscritto chiaro su fondo scuro, un solo colore, il rosso. Postilla, nera su nero, ha un alone chiaro.
- **Musica**: contrabbasso che cammina, pianoforte rado, spazzole.
- **Potere nuovo, l'ombra**: Postilla è inchiostro, quindi nelle zone d'ombra non si vede.

Livelli:

1. **La stazione** — le ombre dei lampioni sono piattaforme che dondolano con la luce e ti trasportano.
2. **La scena del delitto** — righe coperte da omissis che non reggono finché non le scopri; cinque indizi da raccogliere.
3. **Sul tetto del treno** — il vento spinge indietro i salti; al fischio arriva la galleria e chi è in aria muore.
4. **Gli interrogatori** — per ogni sospettato tre versioni della risposta, una sopra l'altra: regge solo quella coerente con l'indizio.
5. **Il pedinamento** — la torcia del controllore spazza il corridoio; ci si sposta da un'ombra all'altra. Ogni fascio riposa su un'ombra a ciascun estremo, così l'attraversamento è sempre possibile.
6. **Il palazzo mentale** — sfondo bianco da schema: ogni deduzione fa comparire la successiva per pochi secondi.
7. **Le prove contro Postilla** — le sequestrano lo sbianchetto e fugge, inseguita, potendo solo saltare.
8. **Tutti nel vagone ristorante** (boss) — l'accusa di Corsivo: nove omissis da scoprire. Nella seconda fase entra la torcia, nella terza il vento della galleria.

### Quarto libro: «Manuale del passeggero interstellare smarrito»

Si sblocca a terzo libro finito. Fantascienza comica nello spirito di Douglas Adams, con invenzioni proprie: assurdo, burocrazia, un narratore impassibile che sbaglia quasi tutto.

- **Il libro è un manuale**: voci enciclopediche, avvertenze e note a piè di pagina. Motto: «È TUTTO PREVISTO».
- **Storia**: la Biblioteca dei Margini è un'astronave-archivio che ha sbagliato strada per colpa di MARGINE, navigatore permaloso. A ogni caduta di Postilla commenta: «Ricalcolo.»
- **Il Refuso rimanda**: «vedi alla voce…», in cerchio. Quarto verbo dopo macchia, scambia, cancella.
- **Stile**: colori da manuale anni '70 (crema, arancio, turchese), diagrammi inutili «non in scala»; nello spazio, testo da terminale su blu notte con un pianeta arancione.
- **Musica**: sintetizzatori allegri e un po' storti, da sala d'attesa.
- **Potere nuovo, il rimando**: Postilla entra in un asterisco e sbuca dalla sua nota.
- **Filo**: la voce «Finale» dice «vedi alla voce Lettore», che dice «vedi alla voce Finale». Il viandante è a bordo come autostoppista. Le note del lettore, per la prima volta, non correggono niente: aggiunge solo «vedi tu» e passa il libro a qualcun altro.

Livelli:

1. **Avvertenze** — un elenco di divieti che vanno infranti tutti; primi asterischi-portale.
2. **Gravità facoltativa** — zone a gravità ridotta: salti lunghissimi e lentissimi.
3. **L'ufficio moduli** — quattro timbri da raccogliere; sportelli che aprono e chiudono a tempo; lo sportello finale apre solo a pratica completa.
4. **Note a piè di pagina** — si rimbalza via asterisco tra il testo, in alto, e le note, in fondo.
5. **Il motore a coincidenze** — ogni riga diventa a turno un divano (si rimbalza) e una nuvola (non regge), con preavviso.
6. **Il traduttore letterale** — i modi di dire succedono davvero: «fare un salto» ti lancia, «prendere il volo» ti fa planare, «cadere dalle nuvole» fa comparire nuvole, «restare di sasso» ti fa sasso, «andare a rotoli», «in un batter d'occhio», «perdere il filo».
7. **Vedi alla voce** — ogni nodo ha tre rimandi in alto: due sono circolari e ti riportano indietro, è buono solo quello che non rimanda a niente.
8. **Il Servizio Clienti dell'Universo** (boss) — un reclamo in tre fasi; nella seconda la gravità è sospesa, nella terza le risposte automatiche arrivano a raffica.

### Prologhi

- **All'apertura del gioco**, la prima volta, un prologo in quattro schermate presenta la Biblioteca dei Margini, il Refuso e Postilla. Si può rivedere dal pulsante «Prologo» e saltare in qualsiasi momento.
- **Ogni libro**, quando lo si comincia dal primo livello, si apre con il suo prologo: racconta la storia e, dal secondo in poi, i legami con i libri precedenti.
- **Il registro segue il genere**, nel testo e nell'aspetto: il gotico è un diario in corsivo su carta seppia a lume di candela, in seconda persona solenne; la fiaba è in tondo su carta bianca con colline e sole, e comincia con «C'era una volta»; il noir è un verbale battuto a macchina sotto la pioggia, in prima persona asciutta, lettera per lettera; il manuale è una prefazione a punti, burocratica e impassibile, con timbro e diagramma.

### Punti e registro del lettore

- Punti: 100 per annotazione, 50 per parola corretta, 20 per parola rimessa a posto, 200 per livello finito, 1200 per libro finito, 40 per ogni caduta in meno di 15; ogni caduta toglie 10.
- Il **registro del lettore** si vede in pausa e dalla biblioteca: la lettura in corso, la lettura migliore di ogni libro (punti, annotazioni, tempo, cadute) e il totale. Entra nel registro solo una lettura fatta dal primo all'ultimo livello.
- I punti correnti sono sempre visibili nell'HUD.
- **Modalità prova**: dal registro, in biblioteca, un pulsante apre tutti i libri e tutti i livelli senza doverli finire in ordine. Serve a provare e a far provare; si disattiva dallo stesso pulsante.

### Cornice

Schermata titolo: la biblioteca, con le copertine dei libri affiancate e Postilla seduta su quello selezionato. Un libro chiuso è scuro, macchiato, e dice cosa serve per aprirlo. Se in un libro c'è una lettura a metà, dalla copertina sporge un segnalibro a nastro con il numero del livello, lungo quanto la strada fatta. Cambiando libro (frecce, tocco o tasti) Postilla salta ad arco da una copertina all'altra, con scia, atterraggio e schizzo. Pulsanti per iniziare, continuare, ricominciare; indice dei livelli già raggiunti; registro del lettore. HUD minimale: nome del livello, annotazioni, gomma con ricarica, barra della candela. In pausa compare il registro del lettore. Pulsanti per audio, pausa e schermo intero.

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
| 11 | Secondo libro, la fiaba «C'era una volta, forse», sbloccato solo a primo libro finito; potere del ricalco; Brina e il viandante. | Richiesta dell'autore: una seconda storia con un filo che la lega alla prima. |
| 12 | Punti e registro del lettore, visibile in pausa e dalla biblioteca, con il totale su tutti i libri. | Richiesta dell'autore. |
| 13 | Brina ridisegnata: più dettagli, molte animazioni, lanterna e trecce a molla. | Richiesta dell'autore: era poco dettagliata. |
| 14 | La forma «sasso» pesa meno e si esaurisce dopo aver sfondato i rovi. | In verifica, da sasso il salto successivo era impossibile. |
| 15 | Segnalibro a nastro sulle copertine e salto animato di Postilla da un libro all'altro nella biblioteca. | Richiesta dell'autore. |
| 16 | Terzo libro, il giallo «Chi ha strappato l'ultima pagina»: treno, Corsivo e Tondo, Postilla indagata, soluzione «sono stati tutti». | Richiesta dell'autore: noir con sapore di Sherlock Holmes e Agatha Christie. |
| 17 | Nel pedinamento ogni fascio di torcia riposa su un'ombra ai due estremi. | In verifica, con fasci a metà corridoio l'attraversamento era impossibile. |
| 18 | Quarto libro progettato come fantascienza comica alla Douglas Adams, al posto della versione seria. | Scelta dell'autore. |
| 19 | Pedinamento semplificato: torce più lente, ombre più larghe, un solo fascio per tratto, e mezzo secondo di tolleranza prima di essere scoperti. | Richiesta dell'autore: era troppo difficile. |
| 20 | Quarto libro costruito: «Manuale del passeggero interstellare smarrito». | Come da progetto. |
| 21 | Prologo del gioco e prologo di ogni libro, ciascuno nel registro del proprio genere e con i legami ai libri precedenti. | Richiesta dell'autore. |
| 22 | Nel traduttore letterale le piattaforme di lancio sono corte; in «Vedi alla voce» i rimandi stanno in alto e ci si salta dentro. | In verifica: il lancio da lontano non arrivava, e i rimandi a terra non si potevano evitare. |
| 23 | I tocchi brevissimi dei tasti non vanno più persi. | Emerso provando i prologhi. |
| 24 | Modalità prova: apre tutti i libri e i livelli dal registro. | Per poter provare ogni livello senza rifare i precedenti. |
