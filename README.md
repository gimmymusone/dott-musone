# Sito Dott. Musone — bozza strutturale (2026-10-05)

Pagina unica, HTML/CSS/JS senza build. GSAP 3.13 + ScrollTrigger da cdnjs (stessi tag con SRI di Salzillo). Font Figtree e Noto Sans ospitati in `fonts/`.
Anteprima: `python3 -m http.server 8771` da questa cartella → http://localhost:8771/

## Com'è fatto
- `index.html` — hero + 4 zone dell'X-ray nella stessa sezione `#xray`, poi sezioni chiare (orienta, chi, visita, FAQ, contatto). **I testi mancanti sono segnati `[DA CONFERMARE]`** (classe `.da-confermare`, evidenziati in giallo): `grep -n "DA CONFERMARE" index.html`.
- `js/xray.js` — una sola timeline GSAP a scrub: scansione foto→X-ray, corpo intero, telecamera su reni → vescica → prostata → testicoli. Calibrazione in testa al file (`T0`, `DUR_ZONA`) e `data-x/-y/-s` di ogni `.zona`; altezza dello scroll: `--len` = `.is-scroll .xray{height:920svh}` in `css/style.css`.
- `js/guida.js` — scorrimento guidato desktop (da Salzillo): `VMAX`, `VMAX_XRAY`.
- `js/pagina.js` — caricamento, tema barra, pulsante fisso, modulo (in bozza **non invia nulla**).

## Cosa abbiamo preso da Salzillo
- `scrollRestoration='manual'` + ripartenza dall'inizio; `intro-lock` finché ritratto e font non ci sono.
- Un solo scrittore per lo stato di scroll (timeline unica); niente `fromTo`+`stagger`; ogni `querySelector` protetto (un elemento mancante spegne l'effetto, non la pagina).
- Fallback «a scatti»: senza JS o con `prefers-reduced-motion` la sezione è una pagina normale, con una figura ritagliata per zona.
- Ricalcolo al resize (solo se cambia davvero la misura) e quando arrivano i font; `ignoreMobileResize` per la barra del browser sul telefono.
- Scrolling guidato con velocità massima sul desktop; sul telefono resta lo scroll nativo.

## Hero (2026-10-05)
Foto panoramica 16:9 ottenuta con Gemini (outpainting della foto di Michele: lui a sinistra, sala a destra) e relativa versione X-ray con la stessa inquadratura: `assets/hero-16x9.jpg`, `assets/hero-xray-16x9.jpg`. Originali 2752×1536 in `../assets/images/hero-16x9-v1.png` e `hero-xray-16x9-v1.png`. Su telefono restano il ritratto verticale e l'X-ray a mezzo busto (`<picture>`). Testi a destra, menu in alto, didascalie in basso come nel riferimento rejuv. Titolo, sottotitolo e didascalie sono **bozze da validare con Michele**.

## Da fare
- Contenuti da Michele (lista domande inviata) e privacy policy; collegare il modulo al Worker dei contatti.
- X-ray a risoluzione più alta (ora 768×1376: a zoom 3× si vede morbido). Rigenerare/ingrandire **senza cambiare** l'immagine approvata, perché gli anelli sono posizionati su di essa (`data-x/-y` e `style` degli `.anello`).
- Wordmark in SVG, favicon, immagine social.
- Hero: l'X-ray a mezzo busto e la foto hanno pose diverse da quello a figura intera: la scansione le raccorda, da rivedere a occhio.
- WebP/AVIF per le immagini; `<meta name="robots" content="noindex">` finché non è approvato (da togliere alla pubblicazione).
- Pubblicazione: stesso schema di Salzillo (GitHub Pages + CNAME DNS only su x.3-lab.it; preservare il file `CNAME`).

## Contenuti tolti dalla pagina il 2026-10-05 (da reinserire quando arrivano da Michele)
Telefono (barra, contatti) · sede (didascalia hero, contatti) · orari · tempi di risposta · formazione e approccio («Chi sono») · numero Albo e Ordine dei Medici · P.IVA (piè di pagina: **obbligatori per legge prima di pubblicare**) · elenco prestazioni per zona (ora solo «Visita urologica») · FAQ (sezione e voce di menu rimosse) · «cosa portare alla visita» · testo della privacy policy · formula sul dolore improvviso (zona testicoli: ora senza il tag, da far validare).

## Chi è, mini blocchi di scroll, immagini (2026-10-05, sera)
- **«Chi è»** ora ha: ritratto, Formazione (master + tesi + relatore), Dove lavora, **Ricerca e pubblicazioni** (9 articoli PubMed 2025–2026 con link, 2 da primo autore, tag degli ambiti). Fonti e criteri (omonimie escluse) in `../assets/references/chi-e-fonti.md`. **Da far confermare a Michele**: ruolo/sede esatti, albo, specializzazione.
- **Mini blocco di scroll** a ogni sezione chiara (`.blocco`): su desktop `js/guida.js` ferma lo scroll 0,55 s alla testa di ogni blocco (`FERMA_MS`, `OFFSET`); su telefono `scroll-snap` proximity. Non verificato con la rotellata vera (il tab di prova era in background).
- **Prostata** rigenerata senza il guscio semitrasparente della vescica e senza le macchie scure; icone del pannello rifatte con inquadratura ampia e uniforme.
- Titoli di sezione e quadrato del risultato del questionario ridotti.
- **Logo:** nuove bozze «doppia M e reni» in `../assets/brand/proposte/reni-MM.html` (G1 reni che abbracciano MM · G2 «mm» di archi · G3 M e M capovolta).

## Codice del questionario nel messaggio (2026-10-05)
Finito il questionario, il messaggio del modulo si precompila con un **codice breve** (es. `Q: UR-GD-S > PR` = dove-cosa-durata > area; codici in `js/pagina.js`: FI/BV/UR/GE/NS · DO/BR/GD/SA/GO/ER/AL · G/S/M · RE/VE/PR/TE/GEN). Resta modificabile e cancellabile, con una riga che lo spiega; in caso di urgenza non si scrive nulla. Il codice è anche in `window.QUIZ_CODICE`. **Da decidere:** invio via mail o WhatsApp (oggi il modulo è in bozza e non invia). Tolta dalla barra la pillola «Raccontaci cosa senti» (ridondante col pulsante «Prenota»).

## Font, barra di vetro, hero, questionario, logo (2026-10-05, notte tarda)
- **Font:** Plus Jakarta Sans (variabile, ospitato in `fonts/`) per titoli e corpo; titoli in peso 500 con tracking stretto. Per cambiarlo: `@font-face` e `--f-titoli/--f-corpo` in testa a `css/style.css`.
- **Barra:** vetro bianco semitrasparente (`--vetro`), 52 px, menu **centrato** nella pagina (posizione assoluta al 50%), pillola «Raccontaci…» sotto che si ritira scorrendo.
- **Hero:** foto meno coperta, titolo grande sfalsato a destra (5 vw), testo e pulsanti allineati sotto la seconda riga.
- **Pannello «Esplora le aree»:** miniature degli organi con la stessa inquadratura in cerchi blu notte + riga di spiegazione (`assets/ico-*.png`).
- **«Non sai da dove iniziare?» = mini questionario** (4 domande, nessun dato salvato): urgenza → dove → cosa noti → da quanto. Se c'è urgenza: «Meglio non aspettare» (pronto soccorso/112). Altrimenti propone l'area (punteggi in `D` e `AREE` in `js/pagina.js`), con «Prenota una visita» e «Guarda l'area sul corpo» (apre la zona nel simulatore). Non è una diagnosi: i testi vanno approvati da Michele.
- **Logo:** sei proposte SVG in `../assets/brand/proposte/` (A punto+nome · B monogramma MM · C anello aperto · D M con scansione · E MUSONE con O a punto · F «Musone.»), con pagina di confronto `index.html` (chiaro/scuro). Il testo è in Plus Jakarta Sans (font incorporato negli SVG): sul logo scelto va fatto l'outline.

## Barra a pillole e sezioni a blocchi (2026-10-05, notte)
- **Barra** come il riferimento: cerchio con monogramma «MM», pillola grigia col menu (Le aree · Chi sono · La visita · Contatti), pillola sotto «Raccontaci cosa senti…» con freccia (si ritira appena si scorre), pulsante «Prenota una visita» a destra. Su telefono: cerchio + hamburger. Barra di scorrimento laterale nascosta (`scrollbar-width:none`).
- **Dopo il simulatore** (stile lovi.care): blocchi bianchi molto arrotondati su fondo `#F3F4F7` (`.pagina` > `.blocco` > `.blocco__in`), titoli grandi centrati, **carte arrotondate** dentro: giostra di carte con gli organi a colori («Non sai da dove iniziare?»), ritratto + formazione («Chi è»), quattro passi numerati («La visita»), carta scura + modulo («Prenota»). Per cambiare la grafica delle carte: classi `.card*`, `.cards`, `.passi`, `.chi`, `.contatto` in `css/style.css`.
- Il testo di «Formazione» viene dalla copertina della tesi di Michele (Master di II livello in Andrologia, Federico II); resta da confermare con lui.

## Rifiniture (2026-10-05, sera tardi)
- **Scheda e frecce:** la scheda lascia libera la barra in basso (desktop `inset: … 132px`), quindi le frecce si premono anche a scheda aperta; se la scheda è aperta, la nuova zona riapre la sua scheda dopo ~0,9 s (`vaiVicina` in `js/xray.js`).
- **Pannello/punti fissi:** non fanno più parte della timeline a scrub: compaiono *a tempo* (0,45 s) solo quando la telecamera è arrivata (`T_FERMO` = 4,15) e restano fermi; sosta di scroll sul quadro del corpo di 3 unità (`.to({}, {duration: 3}, 4.2)`), sezione alta 700svh in CSS (`.is-scroll .xray`).
- **Pannello bianco**, righe azzurre, **miniature a colori degli organi** come icone (`assets/ico-*.png`, ritagliate dai PNG degli organi).
- Prove automatiche: la scheda del browser deve essere attiva (`document.hidden === false`), altrimenti il ticker di GSAP è fermo.

## Stile Vibrant, versione desktop e organi a colori (2026-10-05, sera)
- **Corpo fermo:** punti senza nomi (cerchio con puntino, pulsante) + pannello **«Esplora le aree»** a destra con le quattro zone (icona, nome, freccia). Su telefono lo stesso elenco è il foglio in basso.
- **Zona:** zoom + il corpo diventa un fantasma (opacità .28) e compare l'**organo a colori**: reni con ureteri, vescica con ureteri, prostata con vescicole seminali, testicoli con epididimo (atlante medico). Immagini `assets/organo-*.png` (trasparenza vera, 1200 px): generate con Gemini a partire da un ritaglio della radiografia, così sono nella stessa posizione; il nero è stato tolto con `lumakey` (ffmpeg). Originali su nero in `../assets/images/organo-*-raw.png`. Posizione e dimensione (in % della master) nello `style` di ogni `<img class="organo">`.
- **Barra in basso (desktop):** a sinistra pillola grande con icona + nome della zona, a destra le due frecce; su telefono selettore centrato.
- Nota di prova: in questo ambiente il primo clic dopo uno scroll via script può essere ignorato (il pannello è ancora in dissolvenza).

## Hero → scheletro → corpo fermo con punti (2026-10-05)
**Tre livelli come Vibrant** (screenshot in `../assets/references/WhatsApp Image …`): 1) corpo con i punti (su telefono senza etichette + pannello «Esplora le aree»), 2) zona: telecamera sulla zona, anello, etichetta a pillola, selettore `‹ Nome ›` in basso e freccia indietro, 3) scheda: pannello a destra (desktop) o foglio dal basso (telefono), si apre toccando l'etichetta o il nome. Esc/× chiudono un livello alla volta. Logica in `js/xray.js` (`mostraZona`, `apriScheda`, `tornaCorpo`).

**Cambio di direzione (2026-10-05, sera):** niente più braccia che si sciolgono né corpo intero. Dopo la scansione la telecamera **scende lungo lo scheletro** (stessa immagine, `assets/xray-a.jpg`) e si ferma sul tratto **da sotto il petto a metà coscia** (`FINESTRA` in `js/xray.js`: y .44→.87 della master). Lì il corpo resta fermo (sosta di scroll) con i punti su reni, vescica, prostata, testicoli/genitali. Come Vibrant Wellness, ma con lo scroll per arrivarci.
- Come sono state fatte le immagini: Gemini ha completato lo scheletro verso il basso partendo dalla hero X-ray (v1→v2 senza cucitura), poi pose delle braccia (`arms-mid`, `arms-down`) dalla v4; il bacino e le gambe sono stati **restretti con un filtro ffmpeg** identico sulle tre (script nel scratchpad della sessione, ramp tra 52% e 64% dell'altezza, fattore 0,80, asse x = 0,205) perché Gemini non riusciva a snellirli; leggera tinta blu (`hue -24`). Originali in `../assets/images/` (`xray-master-v1…v4`, `arms-*`, `slim-*` non conservati).
- Limite noto: nella fascia del restringimento (bacino) le ossa hanno bordi appena seghettati se si guarda a 1:1; a zoom forte sul bacino conviene rifarla con un warp vero (o rigenerare).
- Coordinate: punti `data-x/-y` in `.punti`, zone `data-x/-y/-f` in `.zona`, anelli (`style` %) in `#corpo`; `SCHELETRO_X`, `RITAGLIO` in testa a `js/xray.js`. Timeline: scansione 0–1,9 · discesa della telecamera 1,5–4,1 · punti 4,2 · sosta 4,7–6,3.
- Fondo `#161B41` = `--xray-bg`; bordi della master sfumati con maschera (`--fl`, `--fr` in CSS).
- Lo scroll si blocca (solo `overflow:hidden` su `<html>`, **non** sul body: romperebbe il `sticky`) mentre una zona è aperta.
- Ricordarsi di aumentare i `?v=` in `index.html` a ogni modifica di CSS/JS (Chrome tiene in cache).
- Le prove automatiche in questo ambiente vanno fatte con clic veri e attese: il ticker di GSAP non avanza se la scheda non disegna.

## Contenuti tolti dalla pagina il 2026-10-05 (da reinserire quando arrivano da Michele)
Telefono (barra, contatti) · sede (didascalia hero, contatti) · orari · tempi di risposta · formazione e approccio («Chi sono») · numero Albo e Ordine dei Medici · P.IVA (piè di pagina: **obbligatori per legge prima di pubblicare**) · elenco prestazioni per zona (ora solo «Visita urologica») · FAQ (sezione e voce di menu rimosse) · «cosa portare alla visita» · testo della privacy policy · formula sul dolore improvviso (zona testicoli: ora senza il tag, da far validare).

## Transizione hero → scheletro (2026-10-05)
Un'unica immagine X-ray a figura intera, `assets/xray-master.jpg` (3200×3972): è lo scheletro di Michele con la stessa posa della hero, completato verso il basso con Gemini in due passaggi (originali 3712×4608 in `../assets/images/xray-master-v1.png` e `-v2.png`; la v2 è senza cucitura ed è quella in uso). La hero parte con lo scheletro a sinistra sotto la foto (scala 1 = identico all'inquadratura 16:9), la scansione lo scopre, poi la telecamera lo porta al centro e si avvicina alle zone: tutto a scrub, nessuna immagine che «compare».
- Coordinate delle zone nella master: `data-x/-y/-f` di ogni `.zona` e `style` degli `.anello` (in % della master). `SCHELETRO_X`, `RITAGLIO` (telefono) e `T0`/`DUR_ZONA` in testa a `js/xray.js`.
- Colore di fondo della master `#151636` = `--xray-bg` (stage e sezione): se si cambia l'immagine, ricampionarlo.
- File non più usati in `assets/`: `xray-busto.jpg`, `xray-intero.jpg`, `hero-xray-16x9.jpg` (si possono cancellare).
- Ricordarsi di aumentare i `?v=` in `index.html` ogni volta che si cambia CSS/JS: il browser tiene in cache.
