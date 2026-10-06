/* ══════════════════════════════════════════════════════════════
   Hero → scheletro → corpo fermo con punti da cliccare.
   Scorrendo: la linea di scansione scopre lo scheletro sotto la foto, la
   telecamera lo porta al centro mentre le braccia si sciolgono (tre pose
   in dissolvenza), poi il corpo RESTA FERMO e compaiono i punti. Un punto
   porta la telecamera sulla zona e apre la scheda (come Vibrant Wellness).
   Lezioni da Salzillo applicate:
   · lo scroll muove tutto con UNA timeline a scrub; le zone si aprono con
     tween a parte e solo quando la timeline è a fine corsa;
   · niente fromTo+stagger: un `to` per elemento a tempo fisso;
   · senza JS o con «riduci movimento» la sezione resta una pagina normale
     (classe .is-scroll non applicata): è il fallback «a scatti»;
   · si ricalcola al resize e quando i font arrivano;
   · ogni querySelector è protetto: un elemento mancante spegne l'effetto,
     non l'intera pagina.
   ══════════════════════════════════════════════════════════════ */
(function(){
  const root = document.documentElement;
  const $ = (s, c=document) => c.querySelector(s);
  const xray = $('#xray'), stage = $('#stage'), pila = $('#pila'), corpo = $('#corpo'),
        hero = $('#heroTxt'), didascalie = $('.didascalie'), punti = $('#punti'), scan = pila && $('.scan', pila),
        vz = $('#vz'), vzEt = $('#vzEtichetta'), vzEtT = $('#vzEtichettaTesto'), vzNome = $('#vzNome'), vzIco = $('#vzIco'), vzTxt = $('#vzTxt'), elenco = $('#elenco'),
        cA = corpo && $('.c-a', corpo);
  const organi = corpo ? [...corpo.querySelectorAll('.organo')] : [];
  const zone = [...document.querySelectorAll('#zone .zona')];
  const dots = [...document.querySelectorAll('#punti .punto')];
  if(!window.gsap || !window.ScrollTrigger || !xray || !stage || !pila || !corpo || !hero || !scan || !punti || !vz || !vzEt || !vzEtT || !vzNome || !vzIco || !vzTxt || !cA || !elenco || !zone.length) return;

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  const mm = matchMedia('(prefers-reduced-motion: no-preference)');
  const RAPP = 3972 / 3200;              /* altezza/larghezza della master (assets/xray-a.jpg) */
  const SCHELETRO_X = .205;              /* asse dello scheletro (frazione della larghezza della master) */
  const FOTO = { w: 1200, h: 1600 };     /* assets/hero.jpg, il ritratto del telefono */
  /* centro e altezza della testa: nella foto (frazioni della foto) e nella master (x,y in frazioni, h in frazioni della larghezza) */
  const TESTA = { foto: { x: .275, y: .5125, h: .219 }, master: { x: .225, y: .172, h: .146 } };
  const FINESTRA = { y0: .44, y1: .87 };  /* tratto di scheletro mostrato a corpo fermo (frazione dell'altezza della master) */
  let tl = null, ultimaMisura = '', stato = null, corrente = null, scheda = false;

  const ANIM = 'opacity,visibility,transform,x,y,scale,xPercent,yPercent';

  function smonta(){
    if(tl){ tl.scrollTrigger && tl.scrollTrigger.kill(); tl.kill(); tl = null; }
    gsap.killTweensOf([corpo, punti, vz, vzEt, cA, ...organi, ...zone, ...corpo.querySelectorAll('.anello')]);
    /* solo le proprietà animate: 'all' cancellerebbe gli stili in linea che servono al fallback statico */
    gsap.set([pila, scan, hero, didascalie, punti, vz, vzEt, cA, ...organi, ...zone, ...corpo.querySelectorAll('.anello')], { clearProps: ANIM });
    gsap.set(corpo, { clearProps: ANIM + ',width,height,transformOrigin,--fl' });
    dots.forEach(d => { d.style.left = d.style.top = ''; });
    ['--scan', '--ox', '--oy', '--ow', '--y0'].forEach(p => pila.style.removeProperty(p));
    root.classList.remove('is-scroll', 'zona-aperta');
    corrente = null; scheda = false; stato = null; fermo = false;
    elenco.dataset.aperto = 'false';
  }

  function monta(){
    root.classList.add('is-scroll');
    const vw = stage.clientWidth, vh = stage.clientHeight;
    const mobile = vw <= 900;
    const barra = parseFloat(getComputedStyle(root).getPropertyValue('--barra-h')) || 64;

    /* La master è UNA sola immagine. Lo stato di partenza (scala 1) è identico alla hero:
       desktop = foto 16:9 a tutto schermo (object-fit: cover, object-position 18%),
       telefono = il ritaglio nel riquadro del ritratto. Così foto → scheletro non ha stacchi. */
    let W, x0, y0;
    if(!mobile){
      W = Math.max(vw, vh * 16 / 9);
      x0 = -(W - vw) * .18;
      y0 = -(W * 9 / 16 - vh) / 2;
    } else {
      /* telefono: la master si allinea alla foto del ritratto facendo coincidere la testa con il teschio
         (stessa altezza della testa, stesso centro). Foto: object-fit cover, object-position 18% 50%. */
      const pr = pila.getBoundingClientRect(), sr = stage.getBoundingClientRect();
      const k = Math.max(pr.width / FOTO.w, pr.height / FOTO.h), dw = FOTO.w * k, dh = FOTO.h * k;
      const fx = (pr.width - dw) * .18, fy = (pr.height - dh) / 2;
      W = TESTA.foto.h * dh / TESTA.master.h;
      const lx = fx + TESTA.foto.x * dw - TESTA.master.x * W;        /* bordo sinistro della master, coordinate del riquadro */
      const ly = fy + TESTA.foto.y * dh - TESTA.master.y * W * RAPP;
      pila.style.setProperty('--ox', lx + 'px'); pila.style.setProperty('--oy', ly + 'px'); pila.style.setProperty('--ow', W + 'px');
      pila.style.setProperty('--y0', Math.max(0, ly) + 'px');     /* la scansione parte dal bordo alto della radiografia: sopra resta la foto, niente fascia vuota */
      x0 = pr.left - sr.left + lx;
      y0 = pr.top - sr.top + ly;
    }
    const H = W * RAPP;
    const partenza = { x: x0, y: y0, scale: 1 };
    const cx = vw / 2;
    const cy = mobile ? barra + vh * .31 / 2 + 8 : vh * .52;      /* dove cade la zona aperta */
    const span = mobile ? vw * .7 : vh * .46;                    /* quanto spazio occupa */
    const vista = (tx, ty, s, px = cx, py = cy) => ({ x: px - tx * W * s, y: py - ty * H * s, scale: s });
    /* inquadratura del «corpo fermo»: solo da sotto il petto a metà coscia (reni → genitali), non tutto lo scheletro */
    const sInt = .92 * vh / ((FINESTRA.y1 - FINESTRA.y0) * H);
    const intero = vista(SCHELETRO_X, (FINESTRA.y0 + FINESTRA.y1) / 2, sInt, vw / 2, vh / 2);

    /* punti: posizione sullo schermo a corpo fermo (stato `intero`) */
    dots.forEach(d => {
      d.style.left = (intero.x + +d.dataset.x * W * intero.scale) + 'px';
      d.style.top  = (intero.y + +d.dataset.y * H * intero.scale) + 'px';
    });
    stato = { vista, span, W, intero, cx, cy, mobile };

    gsap.set(corpo, { width: W, height: H, transformOrigin: '0 0', opacity: mobile ? 0 : 1, '--fl': 0, ...partenza });
    gsap.set(organi, { opacity: 0 });
    gsap.set(zone, { autoAlpha: 0, ...(mobile ? { xPercent: 0, yPercent: 100 } : { xPercent: 100, yPercent: 0 }) });
    gsap.set(vz, { autoAlpha: 0 });
    gsap.set(corpo.querySelectorAll('.anello'), { opacity: 0, scale: .6 });
    gsap.set([scan, punti], { autoAlpha: 0 });
    pila.style.setProperty('--scan', 0);

    tl = gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      scrollTrigger: { trigger: xray, start: 'top top', end: 'bottom bottom', scrub: .5, invalidateOnRefresh: true, onUpdate: self => aggiornaFermo(self), onRefresh: self => aggiornaFermo(self) }
    });

    /* 1) hero → scansione: la linea scopre lo scheletro sotto la foto */
    tl.to([hero, didascalie], { autoAlpha: 0, y: mobile ? 20 : -24, duration: .25, ease: 'none' }, 0)
      .to(scan, { autoAlpha: 1, duration: .1, ease: 'none' }, .05)
      .to(pila, { '--scan': 100, duration: 1.2, ease: 'none' }, 0)
      .to(scan, { autoAlpha: 0, duration: .1, ease: 'none' }, 1.15)
      .to(pila, { autoAlpha: 0, duration: .6, ease: 'none' }, 1.3);
    if(mobile) tl.to(corpo, { opacity: 1, duration: .6, ease: 'none' }, 1.3);

    /* 2) la telecamera scende lungo lo scheletro e lo porta al centro (nessuna posa che cambia):
          dal petto di Michele fino al tratto reni → coscia */
    tl.to(corpo, { ...intero, duration: 2.6 }, 1.5)
      .to(corpo, { '--fl': 9, duration: 2.6, ease: 'none' }, 1.5);

    /* 3) il corpo si ferma: compaiono i punti; poi una sosta (lo scroll resta fermo qui) */
    tl.to({}, { duration: 3 }, 4.2);   /* sosta: lo scroll resta fermo su questo quadro */
  }

  /* pannello e punti compaiono (a tempo, non a scroll) solo quando il corpo è arrivato e fermo */
  let fermo = false;
  const T_FERMO = 4.15;
  function aggiornaFermo(self){
    if(!tl || corrente) return;
    /* si decide dalla posizione REALE dello scroll, non dal tempo ammorbidito della timeline:
       scorrendo in fretta verso l'alto il tempo arriva in ritardo e il pannello restava acceso sulla hero */
    const t = (self ? self.progress : tl.progress()) * tl.duration();
    const ora = t >= T_FERMO;
    if(ora === fermo) return;
    fermo = ora;
    gsap.to(punti, { autoAlpha: ora ? 1 : 0, duration: .45, ease: 'none', overwrite: 'auto' });
  }

  /* ── tre livelli, come Vibrant: corpo (punti) → zona (telecamera, etichetta, frecce) → scheda ── */
  const dotDi = n => dots.find(d => d.dataset.zona === n);
  const zonaDi = n => zone.find(e => e.dataset.zona === n);
  const anelliDi = n => corpo.querySelectorAll('.anello[data-zona="' + n + '"]');
  const nomeDi = n => { const s = $('[data-zona="' + n + '"] .nome span', elenco); return s ? s.textContent : n; };
  const organoDi = n => organi.find(o => o.dataset.zona === n);
  const fuori = () => stato && stato.mobile ? { xPercent: 0, yPercent: 100 } : { xPercent: 100, yPercent: 0 };

  let autoApri = null;                                /* apertura automatica della scheda (desktop): una sola in attesa */
  function mostraZona(n){
    if(!tl || !stato || scheda || n === corrente) return;
    const z = zonaDi(n); if(!z) return;
    const prima = corrente;
    corrente = n;
    root.classList.add('zona-aperta');
    elenco.dataset.aperto = 'false';
    /* premendo in fretta: si annullano tutte le animazioni di zona ancora in corso, così non si sovrappongono */
    autoApri && autoApri.kill(); autoApri = null;
    gsap.killTweensOf([...organi, vzEt, cA]);
    const mio = organoDi(n);
    organi.forEach(o => { if(o !== mio) gsap.to(o, { opacity: 0, duration: .25, ease: 'none', overwrite: 'auto' }); });
    const p = stato.vista(+z.dataset.x, +z.dataset.y, stato.span / (+z.dataset.f * stato.W));
    vzEtT.textContent = vzTxt.textContent = nomeDi(n);
    const ic = $('[data-zona="' + n + '"] .ico', elenco); vzIco.innerHTML = ic ? ic.outerHTML : '';
    /* telefono: etichetta sotto l'organo, si tocca per aprire la scheda; computer: a sinistra dell'organo, con la scheda già aperta di fianco */
    vzEt.style.left = (stato.mobile ? stato.cx : stato.cx - stato.span * .62) + 'px';
    vzEt.style.top = (stato.mobile ? stato.cy + stato.span * .3 : stato.cy) + 'px';
    gsap.to(punti, { autoAlpha: 0, duration: .3, ease: 'none', overwrite: 'auto' });
    gsap.to(vz, { autoAlpha: 1, duration: .3, ease: 'none', overwrite: 'auto' });
    gsap.set(vzEt, { autoAlpha: 0 });
    gsap.to(corpo, { ...p, duration: prima ? 1 : 1.1, ease: 'power2.inOut', overwrite: 'auto' });
    /* il corpo diventa un fantasma e l'organo compare a colori, come in Vibrant */
    gsap.to(cA, { opacity: .28, duration: .7, delay: .3, ease: 'none', overwrite: 'auto' });
    gsap.to(mio, { opacity: 1, duration: .8, delay: .5, ease: 'power2.out', overwrite: 'auto' });
    gsap.to(vzEt, { autoAlpha: 1, duration: .4, delay: .7, ease: 'none', overwrite: 'auto' });
    if(!stato.mobile) autoApri = gsap.delayedCall(1.3, () => { autoApri = null; if(corrente === n && !scheda) apriScheda(); });
  }

  function vaiVicina(passo){
    if(!corrente) return;
    const i = ordine.indexOf(corrente);
    const prossima = ordine[(i + passo + ordine.length) % ordine.length];
    const conScheda = scheda;
    if(scheda) chiudiScheda(true);
    corrente = null;                                   /* mostraZona rifiuta la stessa zona */
    mostraZona(prossima);
    if(conScheda && stato.mobile) autoApri = gsap.delayedCall(.9, () => { autoApri = null; if(corrente === prossima) apriScheda(); });   /* la scheda segue la zona */
  }

  function apriScheda(){
    if(!corrente || scheda) return;
    scheda = true;
    const z = zonaDi(corrente);
    if(stato.mobile) gsap.to(vzEt, { autoAlpha: 0, duration: .2, ease: 'none', overwrite: 'auto' });
    gsap.to(z, { autoAlpha: 1, xPercent: 0, yPercent: 0, duration: .5, ease: 'power3.out', overwrite: 'auto',
      onComplete: () => { const c = $('.z-chiudi', z); c && c.focus({ preventScroll: true }); } });
  }

  function chiudiScheda(senzaFocus){
    if(!scheda) return;
    scheda = false;
    const z = zonaDi(corrente);
    gsap.to(vzEt, { autoAlpha: 1, duration: .3, delay: .25, ease: 'none', overwrite: 'auto' });
    gsap.to(z, { ...fuori(), duration: .4, ease: 'power2.in', overwrite: 'auto',
      onComplete: () => { gsap.set(z, { autoAlpha: 0 }); if(senzaFocus !== true) vzNome.focus({ preventScroll: true }); } });
  }

  function tornaCorpo(){
    if(!corrente || !stato) return;
    if(scheda) chiudiScheda();
    const n = corrente;
    corrente = null;
    autoApri && autoApri.kill(); autoApri = null;
    gsap.killTweensOf([...organi, vzEt]);
    if(organoDi(n)) gsap.to(organoDi(n), { opacity: 0, duration: .4, overwrite: false });
    gsap.to(cA, { opacity: 1, duration: .6, ease: 'none', overwrite: false });
    gsap.to(vz, { autoAlpha: 0, duration: .25, ease: 'none', overwrite: false });
    gsap.to(corpo, { ...stato.intero, duration: .9, ease: 'power2.inOut', overwrite: false });
    gsap.to(punti, { autoAlpha: 1, duration: .4, delay: .6, ease: 'none', overwrite: false,
      onComplete: () => { if(!corrente){ root.classList.remove('zona-aperta'); const d = dotDi(n); d && d.focus({ preventScroll: true }); } } });
  }

  /* il pulsante della scheda porta ai contatti: si azzera subito tutto, così la pagina può scorrere */
  function azzeraSubito(){
    if(!stato) return;
    gsap.killTweensOf([corpo, punti, vz, vzEt, cA, ...organi, ...zone, ...corpo.querySelectorAll('.anello')]);
    gsap.set(corpo, { ...stato.intero });
    gsap.set(cA, { opacity: 1 }); gsap.set(organi, { opacity: 0 });
    gsap.set(corpo.querySelectorAll('.anello'), { opacity: 0, scale: .6 });
    gsap.set(zone, { autoAlpha: 0, ...fuori() });
    gsap.set(vz, { autoAlpha: 0 });
    gsap.set(punti, { autoAlpha: 1 });
    corrente = null; scheda = false;
    autoApri && autoApri.kill(); autoApri = null;
    root.classList.remove('zona-aperta');
  }

  dots.forEach(d => d.addEventListener('click', () => mostraZona(d.dataset.zona)));
  const testa = $('.elenco__testa', elenco);
  testa && testa.addEventListener('click', () => {
    const on = elenco.dataset.aperto !== 'true';
    elenco.dataset.aperto = String(on);
    testa.setAttribute('aria-expanded', String(on));
  });
  elenco.querySelectorAll('[data-zona]').forEach(b => b.addEventListener('click', () => mostraZona(b.dataset.zona)));
  const on = (el, f) => el && el.addEventListener('click', f);
  on($('#vzIndietro'), tornaCorpo);
  on(vzEt, apriScheda); on(vzNome, apriScheda);
  on($('#vzPrec'), () => vaiVicina(-1)); on($('#vzSucc'), () => vaiVicina(1));
  zone.forEach(z => {
    on($('.z-chiudi', z), chiudiScheda);
    on($('.z-domanda', z), azzeraSubito);
  });
  addEventListener('keydown', e => {
    if(e.key !== 'Escape') return;
    if(scheda) chiudiScheda(); else tornaCorpo();
  });
  /* telefono: con una zona aperta la pagina non scorre (overflow:hidden da solo non basta su iOS) */
  addEventListener('touchmove', e => { if(corrente && !e.target.closest('.zona')) e.preventDefault(); }, { passive: false });
  const ordine = zone.map(z => z.dataset.zona);

  function avvia(){
    smonta();
    if(!mm.matches) return;                  /* riduci movimento: resta la pagina statica */
    monta();
    ultimaMisura = innerWidth + 'x' + Math.round(innerHeight / 100);
    ScrollTrigger.refresh();
  }

  /* resize: si rifà solo se cambia davvero la larghezza o l'altezza (non la barra del browser del telefono) */
  let rt;
  addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      const m = innerWidth + 'x' + Math.round(innerHeight / 100);
      if(m !== ultimaMisura) avvia();
    }, 200);
  });
  mm.addEventListener('change', avvia);
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(() => tl && ScrollTrigger.refresh());
  addEventListener('load', () => tl && ScrollTrigger.refresh());

  /* «Le aree» / «Scopri le aree»: portano al corpo fermo con i punti, non all'inizio della scena */
  const aTempo = t => xray.offsetTop + t / tl.duration() * (xray.offsetHeight - innerHeight);
  window.XRAY = {
    vaiA(t){ if(tl) scrollTo(0, aTempo(t)); },    /* solo per le prove */
    apri: mostraZona, chiudi: tornaCorpo, apriScheda, chiudiScheda,
    /* logo: torna in cima SUBITO (azzera zona/scheda aperte, nessuna animazione di scroll) */
    tornaSu(){
      if(stato && (corrente || scheda)) azzeraSubito();
      scrollTo({ top: 0, left: 0, behavior: 'instant' });
      tl && ScrollTrigger.update();
    },
    vaiAllaPrimaZona(){
      if(!tl) return false;
      scrollTo({ top: aTempo(5), behavior: 'smooth' });
      return true;
    }
  };

  avvia();
})();
