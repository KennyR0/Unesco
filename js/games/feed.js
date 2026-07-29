/* ============================================================
   Juego 05 — FEED 60"
   Un minuto de infoxicación: compartir, descartar o verificar.
   Verificar cuesta 4 segundos… como en la vida real.
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');

  const POSTS = [
    { big: 'Minsa: campaña de vacunación gratuita del 5 al 12 de agosto en todos los centros de salud', src: 'minsa.gob.pe · cuenta verificada ✔', v: 'true',
      checks: [['ok','Fuente: sitio oficial del Ministerio de Salud'], ['ok','Fecha: publicado hoy'], ['ok','Otros medios serios la replican']],
      fbShare: '✔ Información oficial y útil: compartirla ayuda a tu comunidad.',
      fbDisc: 'Descartaste una alerta real. El escepticismo automático también cuesta: era oficial y verificable.' },
    { big: '¡¡ESCÁNDALO!! Celebridad DESTRUYE su carrera en video FILTRADO 😱 No dura nada online', src: 'farandula-viral.top · sin autor', v: 'fake',
      checks: [['bad','Dominio .top sin autoría ni fecha'], ['bad','Titular 100% emocional, cero datos'], ['bad','Ningún medio serio lo reporta']],
      fbShare: '✘ Compartiste humo: urgencia + escándalo + cero datos. El video ni siquiera existe.',
      fbDisc: '✔ Bien descartado: dominio basura + titular emocional sin un solo dato.' },
    { big: 'Foto: "Así está AHORA el centro de la ciudad, todo inundado" — imagen dramática de una avenida bajo el agua', src: 'usuario anónimo · hace 20 min', v: 'context',
      checks: [['bad','Búsqueda inversa: la foto es de una inundación de 2018'], ['bad','Ningún medio reporta inundación hoy'], ['ok','La imagen es real… el contexto no']],
      fbShare: '✘ La foto era real pero de 2018: compartiste contexto falso con evidencia verdadera.',
      fbDisc: '✔ Bien: la imagen era real, pero reciclada de 2018. Contexto antes que foto.' },
    { big: 'Caminar 30 minutos al día reduce el riesgo cardiovascular, según estudio publicado en revista médica con revisión por pares', src: 'portal-salud.org · cita el DOI del estudio', v: 'true',
      checks: [['ok','Cita un estudio con DOI rastreable'], ['ok','Lenguaje prudente, sin promesas milagrosas'], ['ok','El estudio existe y dice eso']],
      fbShare: '✔ Ciencia con fuente rastreable y lenguaje prudente: compartible.',
      fbDisc: 'Era un estudio real y citado correctamente. Perdiste información útil.' },
    { big: 'AUDIO: "Las vacunas traen microchips, lo escuché de un enfermero que lo vio con sus propios ojos" — nota de voz de 4 minutos', src: 'reenviado muchas veces ↪', v: 'fake',
      checks: [['bad','Fuente: "un enfermero" anónimo e inubicable'], ['bad','Teoría desmentida por verificadores desde 2021'], ['bad','Apela al miedo, no a evidencia']],
      fbShare: '✘ Reenviaste un bulo desmentido hace años. El "lo escuché de alguien" no es una fuente.',
      fbDisc: '✔ Bien: anécdota anónima + miedo + ya desmentida = descarte directo.' },
    { big: 'Hombre se casa con su router wifi: "Nunca me falló, siempre estuvo ahí"', src: 'El Faro Satírico · humor', v: 'satire',
      checks: [['ok','El sitio se declara satírico en "Acerca de"'], ['bad','Compartida sin contexto, parece noticia real'], ['ok','No pretende engañar: es humor']],
      fbShare: '✘ Era SÁTIRA y la compartiste como noticia. Revisa el "Acerca de" del sitio antes.',
      fbDisc: '✔ Detectaste la sátira. Bien: no es maldad, es humor — pero fuera de contexto confunde.' },
    { big: 'El Banco Central mantiene la tasa de interés en 5,75%, según comunicado oficial publicado hoy', src: 'bcr.gob.pe · comunicado', v: 'true',
      checks: [['ok','Comunicado oficial con fecha'], ['ok','Dato exacto y verificable'], ['ok','Lenguaje institucional, sin emoción']],
      fbShare: '✔ Dato oficial y verificable: compartir informa.',
      fbDisc: 'Era un comunicado oficial. Descartarlo te dejó con menos información real.' },
    { big: 'GRÁFICO: "¡El desempleo se DISPARA! 📈" — el eje vertical empieza en 8% para que la suba de 8,1% a 8,4% parezca un salto gigante', src: 'blog-politico.anon', v: 'context',
      checks: [['bad','El eje Y está truncado para exagerar'], ['ok','Los números existen… la exageración también'], ['bad','El titular grita lo que el dato no dice']],
      fbShare: '✘ Compartiste un gráfico manipulado: eje truncado = exageración visual. Los números eran reales, el drama no.',
      fbDisc: '✔ Ojo fino: eje Y truncado detectado. Un gráfico puede mentir sin inventar números.' },
    { big: '🎁 FELICIDADES: fuiste seleccionado para ganar un iPhone 16. Solo comparte este enlace con 15 contactos para reclamarlo', src: 'premios-movil.xyz', v: 'fake',
      checks: [['bad','Nadie regala iPhones por reenviar enlaces'], ['bad','Esquema piramidal de captación de datos'], ['bad','Dominio recién registrado']],
      fbShare: '✘ Esquema piramidal: tu "compartir" es el producto. 15 contactos más acaban de recibir la estafa por tu culpa.',
      fbDisc: '✔ Correcto: premio imposible + obligación de reenviar = estafa piramidal.' },
    { big: 'Municipalidad: corte de agua programado mañana de 9:00 a 14:00 en los distritos 4 y 7 por mantenimiento', src: 'muni.gob.pe · cuenta oficial ✔', v: 'true',
      checks: [['ok','Fuente oficial municipal'], ['ok','Información de servicio, específica y accionable'], ['ok','Coincide con el aviso en la web oficial']],
      fbShare: '✔ Información de servicio verificada: compartirla es un favor a tus vecinos.',
      fbDisc: 'Era un aviso oficial útil. No todo en el feed es trampa.' }
  ];

  const PTS = {
    true:    { share: 10, discard: -2 },
    fake:    { share: -15, discard: 8 },
    context: { share: -10, discard: 8 },
    satire:  { share: -8,  discard: 6 }
  };
  const VERIFY_BONUS = 4; // extra si verificaste antes de decidir bien

  let order = [], idx = 0, timeLeft = 60, timer = null, score = 0;
  let verified = false, shared = 0, discarded = 0, verifiedCount = 0, running = false;

  UI.intro({
    titulo: 'Feed 60"',
    objetivo: 'Tienes 60 segundos y un feed que no perdona. Cada publicación es una decisión real: compartir, descartar… o invertir 4 segundos en verificar.',
    reglas: [
      '<b>✅ Compartir</b> solo lo verdadero y útil. Compartir una fake resta mucho.',
      '<b>🗑 Descartar</b> lo falso, lo dudoso y la sátira fuera de contexto.',
      '<b>🔍 Verificar</b> cuesta <b>4 segundos</b> del reloj, pero revela las pistas y da puntos extra.',
      'La infoxicación no se gana leyendo todo: se gana <b>priorizando</b>.'
    ],
    onStart: start
  });

  function start() {
    order = UI.shuffle(POSTS.slice());
    idx = 0; timeLeft = 60; score = 0;
    shared = 0; discarded = 0; verifiedCount = 0;
    UI.setScore(0);
    running = true;
    clearInterval(timer);
    timer = setInterval(tick, 100);
    render();
  }

  function tick() {
    timeLeft -= 0.1;
    const bar = document.getElementById('timerBar');
    const lbl = document.getElementById('timerLbl');
    if (bar) bar.style.transform = 'scaleX(' + Math.max(0, timeLeft / 60) + ')';
    if (lbl) lbl.textContent = Math.max(0, Math.ceil(timeLeft)) + 's';
    if (timeLeft <= 0) end(true);
  }

  function render() {
    if (idx >= order.length) return end(false);
    verified = false;
    const p = order[idx];
    app.innerHTML =
      '<div class="feed-top">' +
        '<span class="timer-label" id="timerLbl">60s</span>' +
        '<div class="timer"><i id="timerBar" style="transform:scaleX(' + (timeLeft / 60) + ')"></i></div>' +
        '<span class="timer-label">Post ' + (idx + 1) + '/' + order.length + '</span>' +
      '</div>' +
      '<div class="feed-card">' +
        '<div class="feed-meta"><span>' + p.src + '</span><span>❤ ' + (200 + Math.floor(Math.random() * 9000)) + '</span></div>' +
        '<div class="feed-body"><span class="big">' + p.big + '</span></div>' +
        '<div class="feed-stats">🔁 ' + (10 + Math.floor(Math.random() * 800)) + ' compartidos · 💬 ' + Math.floor(Math.random() * 90) + ' comentarios</div>' +
      '</div>' +
      '<div id="verifyZone"></div>' +
      '<div class="feed-actions" id="feedActions">' +
        '<button class="btn btn--white" id="actVerify">🔍 Verificar (-4s)</button>' +
        '<button class="btn" id="actShare">✅ Compartir</button>' +
        '<button class="btn btn--magenta" id="actDiscard">🗑 Descartar</button>' +
      '</div>';
    document.getElementById('actVerify').addEventListener('click', () => doVerify(p));
    document.getElementById('actShare').addEventListener('click', () => decide(p, 'share'));
    document.getElementById('actDiscard').addEventListener('click', () => decide(p, 'discard'));
  }

  function doVerify(p) {
    if (verified || !running) return;
    verified = true; verifiedCount++;
    timeLeft -= 4;
    document.getElementById('actVerify').disabled = true;
    document.getElementById('verifyZone').innerHTML =
      '<div class="verify-box"><h6>Verificación rápida · SIFT</h6><ul>' +
        p.checks.map(c => '<li class="' + c[0] + '">' + (c[0] === 'ok' ? '✓' : '✗') + ' ' + c[1] + '</li>').join('') +
      '</ul></div>';
    UI.toast('🔍 Verificado: revisa las pistas y decide', '', 2200);
  }

  function decide(p, action) {
    if (!running) return;
    let pts = PTS[p.v][action];
    if (verified && pts > 0) pts += VERIFY_BONUS;
    score += pts; UI.setScore(score);
    if (action === 'share') { shared++; UI.toast((pts > 0 ? '+' + pts + ' ' : pts + ' ') + p.fbShare, pts > 0 ? 'good' : 'bad', 3800); }
    else { discarded++; UI.toast((pts > 0 ? '+' + pts + ' ' : pts + ' ') + p.fbDisc, pts > 0 ? 'good' : 'bad', 3800); }
    idx++;
    setTimeout(() => { if (running) render(); }, 900);
  }

  function end(byTime) {
    if (!running) return;
    running = false;
    clearInterval(timer);
    const rango = score >= 70 ? '⚡ Editor jefe del feed' : score >= 35 ? '🔍 Verificador veloz' : score >= 0 ? '🐌 Víctima del doomscroll' : '📵 Desconecta un rato';
    UI.save('feed', rango);
    UI.finish({
      titulo: byTime ? '¡Se acabó el tiempo!' : 'Feed vacío',
      rango: rango,
      detalle: 'Puntaje: <b>' + score + '</b> · Compartiste ' + shared + ' · Descartaste ' + discarded + ' · Verificaste ' + verifiedCount + ' veces<ul>' +
        '<li>Método SIFT: <b>Detente · Investiga la fuente · Encuentra mejor cobertura · Rastrea el original</b>.</li>' +
        '<li>Verificar cuesta segundos; compartir una fake cuesta reputación (y puntos).</li>' +
        '<li>No todo es falso: compartir lo verificado también es tu trabajo.</li></ul>',
      onRetry: start,
      next: { href: 'mente-maestra.html', label: 'Mente Maestra' }
    });
  }
});
