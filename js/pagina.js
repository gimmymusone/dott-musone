/* Caricamento, tema della barra, pulsante fisso, modulo (bozza). */
(function(){
  const root = document.documentElement;
  const $ = (s, c=document) => c.querySelector(s);

  /* ── caricamento: finché ritratto, X-ray e font non ci sono la pagina non scorre
        (Salzillo: «intro-lock»). Tetto di 5 s: se qualcosa non arriva si parte lo stesso. ── */
  const decodifica = img => img && img.decode ? img.decode().catch(() => {}) : Promise.resolve();
  const font = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  const tetto = new Promise(r => setTimeout(r, 5000));
  Promise.race([
    Promise.all([decodifica($('.pila__foto img')), decodifica($('#corpo img')), font]),
    tetto
  ]).then(() => {
    root.classList.remove('intro-lock');
    const c = $('#caricamento'); c && c.classList.add('finito');
    if(window.ScrollTrigger) ScrollTrigger.refresh();
  });

  /* ── tema della barra: un solo scrittore (data-tema su <html>), deciso dalla sezione sotto la barra ── */
  const sezioni = [...document.querySelectorAll('.xray, .blocco, .piede')];
  if('IntersectionObserver' in window){
    const io = new IntersectionObserver(es => es.forEach(e => {
      if(e.isIntersecting) root.dataset.tema = e.target.classList.contains('xray') ? 'scuro' : 'chiaro';
    }), { rootMargin: '-100px 0px -' + Math.max(0, innerHeight - 101) + 'px 0px' });
    sezioni.forEach(s => io.observe(s));
  }

  /* ── barra: la pillola «Raccontaci…» si ritira appena si scorre ── */
  const barra = $('#barra');
  if(barra){
    const pag = $('#pagina');
    const agg = () => {
      barra.classList.toggle('barra--solo', scrollY > 60);
      /* quando i blocchi chiari salgono sulla scena, pannello e punti non devono restare sotto/accanto */
      if(pag) root.classList.toggle('scena-finita', pag.getBoundingClientRect().top < innerHeight * .9);
    };
    addEventListener('scroll', agg, { passive: true }); agg();
  }

  /* ── mini questionario «Da dove iniziare»: orienta verso un'area, non diagnostica, non salva nulla ── */
  const qc = $('#quizCorpo'), qConta = $('#quizConta'), qBarra = $('#quizBarra'), qInd = $('#quizIndietro');
  if(qc){
    const AREE = {
      reni:      { nome: 'Reni e vie urinarie', img: 'assets/organo-reni.png',      txt: 'Dolore al fianco, calcoli e disturbi delle vie urinarie sono tra i motivi per cui si parte da qui.' },
      vescica:   { nome: 'Vescica',             img: 'assets/organo-vescica.png',   txt: 'Bruciore, urgenza e perdite sono segnali che si possono valutare con una visita.' },
      prostata:  { nome: 'Prostata',            img: 'assets/organo-prostata.png?v=2',  txt: 'Difficoltà a urinare e controlli del PSA sono il tipico punto di partenza per la prostata.' },
      testicoli: { nome: 'Testicoli e genitali', img: 'assets/card-testicoli.png',  txt: 'Dolore, gonfiore o un cambiamento in questa zona meritano una valutazione, con riservatezza.' }
    };
    const D = [
      { k: 'urgenza', t: 'Hai in questo momento uno di questi segni?', s: 'Febbre alta con dolore, dolore fortissimo o improvviso, impossibilità di urinare, molto sangue nelle urine.',
        o: [['Sì, ne ho uno', 'si'], ['No, nessuno', 'no']] },
      { k: 'dove', t: 'Dove senti il fastidio?',
        o: [['Al fianco o nella schiena', { reni: 3 }, 'FI'], ['Nel basso ventre', { vescica: 2, prostata: 1 }, 'BV'], ['Quando urino', { vescica: 1, prostata: 2 }, 'UR'], ['Nella zona genitale', { testicoli: 3 }, 'GE'], ['Non saprei dirlo', {}, 'NS']] },
      { k: 'cosa', t: 'Cosa noti?',
        o: [['Dolore', { reni: 1, vescica: 1, testicoli: 1 }, 'DO'], ['Bruciore o continui stimoli', { vescica: 3, prostata: 1 }, 'BR'], ['Getto debole o alzarmi di notte', { prostata: 3 }, 'GD'],
            ['Sangue nelle urine', { reni: 2, vescica: 2 }, 'SA'], ['Gonfiore o un nodulo', { testicoli: 3 }, 'GO'], ['Difficoltà di erezione o di fertilità', { testicoli: 2, prostata: 1 }, 'ER'], ['Altro', {}, 'AL']] },
      { k: 'durata', t: 'Da quanto tempo?',
        o: [['Da pochi giorni', 0, 'G'], ['Da qualche settimana', 1, 'S'], ['Da mesi', 2, 'M']] }
    ];
    const NOTE = ['', 'Se continua, è utile parlarne con un medico.', 'Da mesi: è il momento giusto per farlo valutare.'];
    let passo = 0, risp = [], cods = [];

    const el = (tag, cls, html) => { const e = document.createElement(tag); if(cls) e.className = cls; if(html != null) e.innerHTML = html; return e; };
    function vai(f){ qc.classList.add('esce'); setTimeout(() => { f(); qc.classList.remove('esce'); }, 160); }

    function mostra(){
      const d = D[passo];
      qConta.textContent = 'Domanda ' + (passo + 1) + ' di ' + D.length;
      qBarra.style.width = ((passo + 1) / D.length * 100) + '%';
      qInd.hidden = passo === 0;
      qc.innerHTML = '';
      qc.appendChild(el('h3', 'quiz__dom', d.t));
      if(d.s) qc.appendChild(el('p', 'quiz__sub', d.s));
      const g = el('div', 'quiz__opz');
      d.o.forEach(([testo, val, cod]) => {
        const b = el('button', 'opz', '<span>' + testo + '</span><i aria-hidden="true">→</i>');
        b.type = 'button';
        b.addEventListener('click', () => { risp[passo] = val; cods[passo] = cod; vai(() => { passo++; passo < D.length ? mostra() : risultato(); }); });
        g.appendChild(b);
      });
      qc.appendChild(g);
    }

    function risultato(){
      qConta.textContent = 'Il tuo punto di partenza';
      qBarra.style.width = '100%';
      qInd.hidden = false;
      qc.innerHTML = '';
      if(risp[0] === 'si'){
        svuotaCodice();
        const r = el('div', 'quiz__ris quiz__ris--urgente');
        r.innerHTML = '<div><h3 class="quiz__dom">Meglio non aspettare</h3><p class="quiz__sub">Con questi segni è giusto rivolgersi subito al pronto soccorso o al 112. Questo sito non serve a decidere in urgenza.</p><button class="pillola" type="button" id="quizDaCapo">Ricomincia</button></div>';
        qc.appendChild(r);
        $('#quizDaCapo').addEventListener('click', daCapo);
        return;
      }
      const pt = { reni: 0, vescica: 0, prostata: 0, testicoli: 0 };
      [risp[1], risp[2]].forEach(v => v && Object.keys(v).forEach(k => pt[k] += v[k]));
      const ordine = Object.keys(pt).sort((a, b) => pt[b] - pt[a] || (risp[1] && risp[1][b] || 0) - (risp[1] && risp[1][a] || 0));
      const z = pt[ordine[0]] > 0 ? ordine[0] : null;
      const nota = NOTE[risp[3]] || '';
      codice(z);
      const r = el('div', 'quiz__ris');
      if(z){
        const A = AREE[z];
        r.innerHTML = '<span class="quiz__img"><img src="' + A.img + '" alt=""></span><div><p class="quiz__eti">Un buon punto di partenza</p><h3 class="quiz__dom">' + A.nome + '</h3><p class="quiz__sub">' + A.txt + (nota ? ' ' + nota : '') + '</p><div class="quiz__az"><a class="pillola pillola--primaria" href="#contatto">Prenota una visita</a><button class="pillola" type="button" id="quizArea">Guarda l\'area sul corpo</button></div></div>';
        qc.appendChild(r);
        $('#quizArea').addEventListener('click', () => {
          if(window.XRAY && window.XRAY.vaiAllaPrimaZona()){ window.XRAY.vaiAllaPrimaZona(); setTimeout(() => window.XRAY.apri(z), 1800); }
        });
      } else {
        r.innerHTML = '<div><p class="quiz__eti">Un buon punto di partenza</p><h3 class="quiz__dom">Una visita urologica generale</h3><p class="quiz__sub">Se non sai dire dove o cosa, è proprio il modo migliore per partire: ne parliamo insieme, con calma. ' + nota + '</p><div class="quiz__az"><a class="pillola pillola--primaria" href="#contatto">Prenota una visita</a></div></div>';
        qc.appendChild(r);
      }
    }

    /* il risultato diventa un codice breve e non esteso nel messaggio del modulo (poi si decide se mail o WhatsApp) */
    const msg = $('#f-msg'), nota = $('#moduloCodice');
    const AREA = { reni: 'RE', vescica: 'VE', prostata: 'PR', testicoli: 'TE' };
    function codice(z){
      const c = 'Q: ' + [cods[1], cods[2], cods[3]].filter(Boolean).join('-') + ' > ' + (z ? AREA[z] : 'GEN');
      window.QUIZ_CODICE = c;
      if(msg && (!msg.value.trim() || msg.dataset.auto === '1')){ msg.value = c; msg.dataset.auto = '1'; if(nota) nota.hidden = false; }
    }
    function svuotaCodice(){
      window.QUIZ_CODICE = '';
      if(msg && msg.dataset.auto === '1'){ msg.value = ''; msg.dataset.auto = ''; }
      if(nota) nota.hidden = true;
    }
    if(msg) msg.addEventListener('input', () => { msg.dataset.auto = ''; });

    function daCapo(){ passo = 0; risp = []; cods = []; svuotaCodice(); vai(mostra); }
    qInd.addEventListener('click', () => {
      if(passo >= D.length || risp[0] === 'si'){ daCapo(); return; }     /* dal risultato: si ricomincia */
      if(passo > 0){ passo--; vai(mostra); }
    });
    mostra();
  }

  /* ── giostra di carte: la freccia scorre di una carta ── */
  const cards = $('#cards'), nx = $('#giostraNext');
  if(cards && nx) nx.addEventListener('click', () => {
    const w = (cards.firstElementChild ? cards.firstElementChild.getBoundingClientRect().width : 320) + 20;
    const fine = cards.scrollLeft + cards.clientWidth >= cards.scrollWidth - 4;
    cards.scrollTo({ left: fine ? 0 : cards.scrollLeft + w, behavior: 'smooth' });
  });

  /* ── pulsante fisso: dopo l'X-ray, e non sopra il modulo di contatto ── */
  const cta = $('#ctaFissa'), xr = $('#xray'), ct = $('#contatto');
  if(cta && xr && ct && 'IntersectionObserver' in window){
    let oltreXray = false, suContatto = false;
    const agg = () => cta.classList.toggle('visibile', oltreXray && !suContatto);
    new IntersectionObserver(es => es.forEach(e => { oltreXray = !e.isIntersecting && e.boundingClientRect.top < 0; agg(); })).observe(xr);
    new IntersectionObserver(es => es.forEach(e => { suContatto = e.isIntersecting; agg(); })).observe(ct);
  }

  /* ── menu (telefono: pannello a tutto schermo) ── */
  const hb = $('#hamburger');
  const chiudi = () => { root.classList.remove('menu-aperto'); hb && hb.setAttribute('aria-expanded', 'false'); hb && hb.setAttribute('aria-label', 'Apri il menu'); };
  if(hb){
    hb.addEventListener('click', () => {
      const on = root.classList.toggle('menu-aperto');
      hb.setAttribute('aria-expanded', String(on));
      hb.setAttribute('aria-label', on ? 'Chiudi il menu' : 'Apri il menu');
    });
    addEventListener('keydown', e => { if(e.key === 'Escape') chiudi(); });
    document.querySelectorAll('#menu a').forEach(a => a.addEventListener('click', chiudi));
  }
  document.querySelectorAll('[data-vai-aree]').forEach(a => a.addEventListener('click', e => {
    if(window.XRAY && window.XRAY.vaiAllaPrimaZona()) e.preventDefault();
  }));

  /* ── modulo: in bozza non invia nulla ── */
  const f = $('#modulo'), esito = $('#esito');
  if(f && esito) f.addEventListener('submit', ev => {
    ev.preventDefault();
    const nome = f.nome, tel = f.telefono;
    [nome, tel].forEach(c => c.setAttribute('aria-invalid', String(!c.value.trim())));
    if(!nome.value.trim() || !tel.value.trim()){
      esito.textContent = 'Inserisci almeno nome e telefono.';
      (nome.value.trim() ? tel : nome).focus();
      return;
    }
    esito.textContent = 'Bozza: l\'invio non è ancora collegato, nessun dato è stato inviato.';
  });
})();
