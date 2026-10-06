/* ══════════════════════════════════════════════════════════════
   Scorrimento guidato (desktop, rotella/trackpad) — dal sito Salzillo.
   Il gesto sposta un bersaglio e la pagina lo insegue con una velocità
   MASSIMA: una rotellata veloce non salta le zone dell'X-ray, la discesa
   si fa sempre per intero. Tastiera, barra, menu e telefono restano nativi.
   Calibrazione (px/s): VMAX fuori dall'X-ray, VMAX_XRAY dentro.
   ══════════════════════════════════════════════════════════════ */
(function(){
  if(!matchMedia('(min-width: 901px) and (hover: hover) and (prefers-reduced-motion: no-preference)').matches) return;

  const VMAX = 2000, VMAX_XRAY = 1200;
  const INSEGUI = .12;
  const TACCA = 240;
  const root = document.documentElement;
  const xray = document.getElementById('xray');
  if(!xray) return;

  /* «mini blocco»: a ogni sezione chiara lo scroll si ferma un attimo (0,5 s), poi riparte.
     Le fermate sono le teste dei blocchi dopo la scena X-ray, a 96 px dal bordo (sotto la barra). */
  const FERMA_MS = 550, OFFSET = 96;
  const fermate = () => [...document.querySelectorAll('.blocco')].map(b => Math.round(b.getBoundingClientRect().top + scrollY - OFFSET));
  let tieni = 0;

  let target = 0, cur = 0, ultimo = 0, raf = 0, tPrec = 0;
  const max = () => root.scrollHeight - innerHeight;
  const bloccato = () => root.classList.contains('intro-lock') || root.classList.contains('zona-aperta');

  function tick(t){
    const dt = Math.min((t - tPrec) / 1000, .05) || .016;
    tPrec = t;
    /* un salto esterno (tastiera, ancora, barra) ci scavalca: si molla */
    if(Math.abs(scrollY - ultimo) > 3){ raf = 0; return; }
    const dentro = scrollY < xray.offsetTop + xray.offsetHeight;
    const lim = (dentro ? VMAX_XRAY : VMAX) * dt;
    const passo = Math.max(-lim, Math.min(lim, (target - cur) * INSEGUI));
    cur += passo;
    if(Math.abs(target - cur) < .5) cur = target;
    scrollTo(0, cur);
    ultimo = scrollY;
    raf = cur === target ? 0 : requestAnimationFrame(tick);
  }

  addEventListener('wheel', e => {
    if(e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY) || bloccato()) return;
    e.preventDefault();
    if(performance.now() < tieni) return;                       /* durante la fermata la rotella non conta */
    if(!raf){ cur = target = ultimo = scrollY; tPrec = performance.now(); }
    const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? innerHeight : 1);
    const prima = target;
    target = Math.max(0, Math.min(max(), target + Math.max(-TACCA, Math.min(TACCA, dy))));
    /* se il bersaglio attraversa la testa di un blocco, ci si ferma lì per un attimo */
    const f = fermate().filter(y => dy > 0 ? (y > prima + 4 && y <= target) : (y < prima - 4 && y >= target));
    if(f.length){
      target = dy > 0 ? Math.min(...f) : Math.max(...f);
      tieni = performance.now() + FERMA_MS;
    }
    if(!raf) raf = requestAnimationFrame(tick);
  }, { passive: false });
})();
