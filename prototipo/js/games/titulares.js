/* ============================================================
   Juego 03 — CLICKBAIT SWIPE
   Desliza: izquierda = periodismo, derecha = clickbait.
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');

  const DECK = [
    { t: '¡¡URGENTE!! Los médicos ODIAN este truco para bajar 10 kilos en una semana', cb: true, src: 'salud-milagrosa.xyz', why: '<b>Truco:</b> urgencia + MAYÚSCULAS + "los médicos odian" (autoridad falsa) + promesa imposible. Todo diseñado para tu clic, no para informarte.' },
    { t: 'El Banco Central sube la tasa de interés 0,25 puntos por inflación', cb: false, src: 'diario-economia.com', why: '<b>Periodismo:</b> dato concreto, cifra exacta y causa. Sin adjetivos, sin drama: te informa y te deja pensar.' },
    { t: 'Lo que hizo esta niña dejó a todos EN SHOCK (video)', cb: true, src: 'viral-videos.blog', why: '<b>Truco:</b> el "curiosity gap": te oculta QUÉ pasó para que entres. Si el titular no te dice nada, es porque no hay nada.' },
    { t: 'Municipalidad anuncia cierre vial por obras hasta diciembre', cb: false, src: 'portal-ciudadano.org', why: '<b>Periodismo:</b> quién, qué y hasta cuándo. Utilidad directa sin emoción fabricada.' },
    { t: 'No vas a CREER lo que encontraron en el agua de tu ciudad 😱', cb: true, src: 'alerta-vecinal.info', why: '<b>Truco:</b> miedo + vaguedad ("lo que encontraron") + apunta a "tu" ciudad. El miedo local es el clickbait más eficaz.' },
    { t: 'Estudio universitario evalúa calidad del aire en 12 distritos', cb: false, src: 'agencia-noticias.pe', why: '<b>Periodismo:</b> atribuye la información a un estudio identificable. Puedes ir a la fuente y comprobarla.' },
    { t: 'El 99% de la gente FALLA este test de inteligencia, ¿eres del 1%?', cb: true, src: 'tests-virales.fun', why: '<b>Truco:</b> cebo de ego. Nadie quiere ser del 99%. El "test" solo existe para llenarte de anuncios.' },
    { t: 'Inflación cerró en 3,1% anual, informó el instituto de estadística', cb: false, src: 'reuters-agencia.com', why: '<b>Periodismo:</b> cifra + fuente oficial citada. Cero adjetivos: el dato habla solo.' },
    { t: 'Famoso actor DESTRUYE a crítico y el internet ENLOQUECE 😤🔥', cb: true, src: 'farandula-total.com', why: '<b>Truco:</b> verbos de guerra ("DESTRUYE", "ENLOQUECE") que convierten una discusión menor en batalla épica.' },
    { t: 'Aerolínea reporta retrasos por mantenimiento: reprogramaciones sin costo', cb: false, src: 'portal-viajero.net', why: '<b>Periodismo:</b> información de servicio, accionable y sin dramatizar.' },
    { t: 'Esta fruta común podría estar MATÁNDOTE lentamente y no lo sabes', cb: true, src: 'secretos-salud.top', why: '<b>Truco:</b> miedo + secreto ("no lo sabes") + amenaza cotidiana. La salud-es-el-cebo es el nicho #1 de la desinformación.' },
    { t: 'La selección jugará amistoso el 12 de setiembre en el estadio Nacional', cb: false, src: 'deportes-diario.com', why: '<b>Periodismo:</b> quién, cuándo, dónde. Verificable en un minuto.' }
  ];

  let deck = [], idx = 0, streak = 0, best = 0, okCount = 0;
  let dragging = false, startX = 0, curX = 0, topCard = null;

  UI.intro({
    titulo: 'Clickbait Swipe',
    objetivo: 'Los titulares pelean por tu atención. Algunos informan; otros solo te quieren adentro. Aprende a separarlos en segundos.',
    reglas: [
      'Arrastra la tarjeta a la <b>IZQUIERDA</b> si es periodismo real.',
      'Arrastra a la <b>DERECHA</b> si huele a clickbait.',
      'También puedes usar los botones o las flechas ← → del teclado.',
      'Racha de 3+: desbloqueas el sello <b>🧠 cerebro antimufa</b>.'
    ],
    onStart: start
  });

  function start() {
    deck = UI.shuffle(DECK.slice());
    idx = 0; streak = 0; best = 0; okCount = 0; UI.setScore(0);
    render();
  }

  function render() {
    if (idx >= deck.length) return end();
    const c = deck[idx];
    const next = deck[idx + 1];
    app.innerHTML =
      '<div class="progress-bar"><i style="width:' + (idx / deck.length * 100) + '%"></i></div>' +
      '<div class="center-col">' +
        '<div class="deck" id="deck">' +
          (next ? cardHTML(next, true) : '') +
          cardHTML(c, false) +
        '</div>' +
        '<div class="deck-controls">' +
          '<button class="btn btn--cyan" id="btnNews">← Periodismo</button>' +
          '<span class="streak" id="streak">Racha: 0</span>' +
          '<button class="btn btn--magenta" id="btnCb">Clickbait →</button>' +
        '</div>' +
      '</div>';
    topCard = app.querySelectorAll('.swipe-card')[app.querySelectorAll('.swipe-card').length - 1];
    attachDrag(topCard);
    document.getElementById('btnNews').addEventListener('click', () => classify(false));
    document.getElementById('btnCb').addEventListener('click', () => classify(true));
  }

  function cardHTML(c, under) {
    return '<div class="swipe-card' + (under ? ' under' : '') + '">' +
      '<div class="card-kicker"><span>ÚLTIMA HORA</span><span>hace ' + (2 + Math.floor(Math.random() * 8)) + ' h</span></div>' +
      '<div class="card-head">' + c.t + '</div>' +
      '<div class="card-src">fuente: ' + c.src + '</div>' +
      '<span class="swipe-stamp swipe-stamp--cb">CLICKBAIT</span>' +
      '<span class="swipe-stamp swipe-stamp--ok" style="left:1rem;right:auto;transform:rotate(-9deg)">PERIODISMO</span>' +
    '</div>';
  }

  function attachDrag(card) {
    if (!card) return;
    card.addEventListener('pointerdown', e => {
      dragging = true; startX = e.clientX; curX = 0;
      card.setPointerCapture(e.pointerId);
    });
    card.addEventListener('pointermove', e => {
      if (!dragging) return;
      curX = e.clientX - startX;
      card.style.transform = 'translateX(' + curX + 'px) rotate(' + curX / 14 + 'deg)';
      const cb = card.querySelector('.swipe-stamp--cb');
      const okS = card.querySelector('.swipe-stamp--ok');
      cb.style.opacity = Math.max(0, Math.min(1, curX / 90));
      okS.style.opacity = Math.max(0, Math.min(1, -curX / 90));
    });
    card.addEventListener('pointerup', () => {
      if (!dragging) return;
      dragging = false;
      if (Math.abs(curX) > 110) classify(curX > 0);
      else {
        card.style.transition = 'transform .25s';
        card.style.transform = '';
        card.querySelectorAll('.swipe-stamp').forEach(s => s.style.opacity = 0);
        setTimeout(() => card.style.transition = '', 260);
      }
    });
  }

  document.addEventListener('keydown', e => {
    if (!topCard || document.querySelector('.overlay')) return;
    if (e.key === 'ArrowRight') classify(true);
    if (e.key === 'ArrowLeft') classify(false);
  });

  function classify(saidCb) {
    const c = deck[idx];
    const good = saidCb === c.cb;
    if (good) {
      okCount++; streak++; best = Math.max(best, streak); UI.addScore(1);
    } else streak = 0;
    document.getElementById('streak').textContent = 'Racha: ' + streak + (streak >= 3 ? ' 🔥' : '');
    if (topCard) {
      topCard.style.transition = 'transform .3s, opacity .3s';
      topCard.style.transform = 'translateX(' + (saidCb ? 520 : -520) + 'px) rotate(' + (saidCb ? 24 : -24) + 'deg)';
      topCard.style.opacity = 0;
    }
    UI.toast((good ? '✔ Correcto. ' : '✘ Te la colaron. ') + c.why, good ? 'good' : 'bad', 4200);
    idx++;
    setTimeout(render, good ? 850 : 1200);
  }

  function end() {
    const pct = okCount / deck.length;
    const rango = UI.rankFor(pct, [
      { min: 0.85, label: '🧠 Cerebro antimufa' },
      { min: 0.55, label: '🔍 Nariz periodística' },
      { min: 0, label: '🐭 Presa del clic' }
    ]);
    UI.save('titulares', rango);
    UI.finish({
      rango: rango + (best >= 5 ? ' · racha máx. ' + best + ' 🔥' : ''),
      detalle: 'Clasificaste bien <b>' + okCount + ' de ' + deck.length + '</b> titulares.<ul>' +
        '<li>Señales de clickbait: MAYÚSCULAS, urgencia, emociones extremas.</li>' +
        '<li>"Curiosity gap": si el titular oculta lo esencial, es una trampa.</li>' +
        '<li>El buen titular te dice QUÉ pasó; el clickbait solo te dice QUÉ sentir.</li></ul>',
      onRetry: start,
      next: { href: 'radar.html', label: 'Radar de Fuentes' }
    });
  }
});
