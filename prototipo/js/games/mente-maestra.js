/* ============================================================
   Juego 06 — MENTE MAESTRA
   Inoculación: construye la fake news perfecta, mírala volverse
   viral y luego diseca tus propios trucos.
   Basado en la teoría de inoculación (Roozenbeek & van der Linden).
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  let state = {}, step = 0;

  const STEPS = [
    {
      q: 'Paso 1 · Elige tu objetivo oscuro',
      key: 'objetivo',
      opts: [
        { k: 'Pánico sanitario', d: 'Hacer que la gente tema a las vacunas, hospitales o medicinas.', v: '+15 viralidad base', pts: 15 },
        { k: 'Ataque político', d: 'Destruir la reputación de una figura pública con un clip engañoso.', v: '+15 viralidad base', pts: 15 },
        { k: 'Estafa de clics', d: 'Cosechar tráfico y datos con promesas imposibles.', v: '+15 viralidad base', pts: 15 }
      ]
    },
    {
      q: 'Paso 2 · Elige la emoción-gancho',
      key: 'emocion',
      opts: [
        { k: 'Miedo', d: '"Si no actúas ya, tu familia corre peligro." La emoción más viral de todas.', v: '+25 viralidad', pts: 25,
          tip: 'Si una publicación te asusta, DETENTE: el miedo es el combustible #1 de lo viral. Nada urgente se verifica después.' },
        { k: 'Enojo', d: '"Alguien poderoso te está robando y nadie hace nada."', v: '+22 viralidad', pts: 22,
          tip: 'La indignación fabricada busca que compartas ANTES de pensar. Pregunta: ¿quién se beneficia de mi enojo?' },
        { k: 'Esperanza milagrosa', d: '"La solución secreta que no quieren que conozcas."', v: '+20 viralidad', pts: 20,
          tip: 'Los milagros sin efectos secundarios ni estudios no existen. "Lo que ocultan" = "no tengo pruebas".' }
      ]
    },
    {
      q: 'Paso 3 · Diseña tu titular-trampa',
      key: 'titular',
      opts: [
        { k: '¡¡LO OCULTAN!! Lo que las autoridades no quieren que sepas sobre esto', d: 'Conspiración + urgencia + MAYÚSCULAS.', v: '+30 viralidad', pts: 30,
          tip: 'MAYÚSCULAS + "lo ocultan" + cero datos concretos = titular diseñado para tu clic, no para informarte.' },
        { k: 'Expertos alertan: nuevo fenómeno preocupa a las familias', d: 'Autoridad vaga + alarma suave: parece serio, dice poco.', v: '+18 viralidad', pts: 18,
          tip: '"Expertos" sin nombre son sospechosos. Pregunta: ¿qué experto, de qué institución, en qué estudio?' },
        { k: 'Comunicado oficial: medidas extraordinarias desde el lunes', d: 'Imita el formato institucional para colarse como real.', v: '+12 viralidad', pts: 12,
          tip: 'El formato oficial se falsifica fácil. Verifica SIEMPRE en el dominio real de la institución.' }
      ]
    },
    {
      q: 'Paso 4 · Fabrica tu "prueba"',
      key: 'prueba',
      opts: [
        { k: 'Foto antigua reciclada', d: 'Una imagen real de otro año y otro lugar, presentada como de "hoy".', v: '+20 credibilidad falsa', pts: 20,
          tip: 'Búsqueda inversa de imágenes (Google Lens/TinEye): revela la fecha y el lugar originales en segundos.' },
        { k: 'Imagen generada por IA', d: 'Hiperrealista, emocional… y con seis dedos si miras bien.', v: '+25 credibilidad falsa', pts: 25,
          tip: 'Busca manos, textos, joyas y sombras incoherentes. Y recuerda: lo "perfecto" también es sospechoso.' },
        { k: 'Experto inventado', d: '"El Dr. Fernández, prestigioso especialista, confirma que…" (no existe).', v: '+22 credibilidad falsa', pts: 22,
          tip: 'Googlea al "experto": si solo aparece en esa noticia, fue inventado. Los expertos reales tienen rastro académico.' },
        { k: 'Gráfico con eje truncado', d: 'Datos reales, exageración visual: cortar el eje convierte un 2% en "catástrofe".', v: '+18 credibilidad falsa', pts: 18,
          tip: 'Revisa los ejes antes de asustarte: un eje cortado exagera cualquier cambio. Los números pueden ser reales y la conclusión falsa.' }
      ]
    }
  ];

  UI.intro({
    titulo: 'Mente Maestra',
    objetivo: 'Advertencia: en esta misión serás el villano. Construirás la fake news perfecta, la verás volverse viral… y luego harás la autopsia de tus propios trucos. Conocer al enemigo te vuelve inmune.',
    reglas: [
      'Elige objetivo, emoción, titular y "prueba" en 4 pasos.',
      'Publica tu fake y observa su <b>medidor de viralidad</b>.',
      'Después: la <b>autopsia</b> — cada truco que usaste, convertido en herramienta de detección.',
      'Esto es un simulador educativo: usar estas técnicas en la vida real te convierte en parte del problema.'
    ],
    onStart: () => { state = {}; step = 0; UI.setScore(0); renderStep(); }
  });

  function renderStep() {
    const s = STEPS[step];
    app.innerHTML =
      '<div class="steps-dots">' + STEPS.map((_, k) => '<span class="dot' + (k <= step ? ' on' : '') + '"></span>').join('') + '</div>' +
      '<p class="mm-title">' + s.q + '</p>' +
      '<div class="opt-grid">' +
        s.opts.map((o, k) =>
          '<button class="opt" data-k="' + k + '"><span class="k">' + o.k + '</span><span class="d">' + o.d + '</span><span class="v">' + o.v + '</span></button>'
        ).join('') +
      '</div>';
    app.querySelectorAll('.opt').forEach(b =>
      b.addEventListener('click', () => {
        state[s.key] = s.opts[parseInt(b.dataset.k, 10)];
        step++;
        if (step < STEPS.length) renderStep(); else publish();
      })
    );
  }

  function publish() {
    const viral = state.objetivo.pts + state.emocion.pts + state.titular.pts + state.prueba.pts;
    const shares = viral * 137;
    UI.setScore(viral);
    app.innerHTML =
      '<div class="center-col">' +
        '<span class="round-label" style="background:var(--magenta);color:#fff">Tu fake news está en el aire</span>' +
        '<div class="mm-post">' +
          '<div class="card-kicker" style="display:flex;justify-content:space-between;font-family:var(--f-mono);font-size:.68rem;opacity:.75"><span>NOTICIA DE ÚLTIMA HORA</span><span>ahora mismo</span></div>' +
          '<div class="card-head" style="margin-top:.5rem">' + state.titular.k + '</div>' +
          '<p style="font-size:.85rem;margin-top:.5rem">Prueba adjunta: <b>' + state.prueba.k + '</b> · Objetivo: ' + state.objetivo.k.toLowerCase() + ' · Gancho: ' + state.emocion.k.toLowerCase() + '</p>' +
        '</div>' +
        '<div class="viral-wrap">' +
          '<div class="viral-label"><span>Viralidad</span><span id="viralNum">0 compartidos</span></div>' +
          '<div class="viral-meter"><i id="viralFill"></i></div>' +
        '</div>' +
        '<div class="comments" id="comments"></div>' +
      '</div>';

    const pct = Math.min(97, 25 + viral);
    setTimeout(() => {
      document.getElementById('viralFill').style.width = pct + '%';
      let n = 0;
      const iv = setInterval(() => {
        n += Math.ceil(shares / 40);
        if (n >= shares) { n = shares; clearInterval(iv); showComments(); }
        const el = document.getElementById('viralNum');
        if (el) el.textContent = n.toLocaleString('es-PE') + ' compartidos';
      }, 50);
    }, 400);
  }

  function showComments() {
    const c = document.getElementById('comments');
    const seq = [
      '<div class="comment"><b>@preocupado22</b> No puedo creerlo… COMPARTIDO. Hay que avisar a todos!!</div>',
      '<div class="comment"><b>@tia_de_todos</b> Reenviado a mis 8 grupos 🙏 Dios nos proteja</div>',
      '<div class="comment"><b>@esceptico_ok</b> ¿Fuente? Esto huele raro. La "prueba" no cuadra.</div>',
      '<div class="comment comment--check"><b>⚠ Verificadores</b> Esta publicación fue marcada como FALSA. Su alcance se redujo 87%. La cuenta fue suspendida.</div>'
    ];
    seq.forEach((html, k) => setTimeout(() => {
      c.innerHTML += html;
      if (k === seq.length - 1) setTimeout(autopsy, 1400);
    }, 900 * (k + 1)));
  }

  function autopsy() {
    const tips = [state.emocion, state.titular, state.prueba].map(x =>
      '<li><b>' + x.k + '</b>' + x.tip + '</li>'
    ).join('');
    UI.save('mente-maestra', '🎓 Detective de la desinformación');
    const o = UI.overlay(
      '<span class="sticker">Autopsia de tu fake</span>' +
      '<h2>Disección completa</h2>' +
      '<p class="panel-lead">Tu publicación alcanzó miles de personas usando <b>3 armas</b>. Ahora esas armas son tuyas… para detectarlas:</p>' +
      '<ul class="autopsy">' + tips + '</ul>' +
      '<div class="badge">Detective de la desinformación</div>' +
      '<p class="panel-detail" style="margin-top:1rem">🎓 <b>Teoría de inoculación:</b> exponerte a una dosis controlada de manipulación (como acabas de hacer) genera "anticuerpos" mentales contra ella. Ya no puedes decir que no sabes cómo funciona.</p>' +
      '<div class="panel-actions">' +
        '<button class="btn btn--ghost" id="againBtn">↻ Crear otra fake</button>' +
        '<a class="btn btn--dark" href="../index.html#arcade">Volver al arcade</a>' +
      '</div>'
    );
    document.getElementById('againBtn', o).addEventListener('click', () => {
      UI.closeOverlay(); state = {}; step = 0; UI.setScore(0); renderStep();
    });
  }
});
