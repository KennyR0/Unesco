/* ============================================================
   Juego 02 — EL GRUPO
   Simulador de chat familiar: cada mensaje es una decisión.
   Reenviar, verificar o frenar: tus actos tienen consecuencias.
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');

  const SCENES = [
    {
      from: 'Tía Marta', av: 'TM', color: '#FF2E7E',
      msgs: [
        { fwd: true, img: false, text: '🚨 URGENTE!! El limón con bicarbonato CURA el cáncer, lo confirmó la OMS!! Un doctor de Harvard lo publicó. Reenvía a todos tus contactos, puedes salvar una vida 🙏🍋', time: '10:02' }
      ],
      opts: [
        { l: '🔁 Reenviar', s: 0,
          out: ['Reenviaste el audio a 3 grupos.', 'Tu primo Luis, en tratamiento, pregunta si puede suspender la quimio y "probar lo natural".'],
          fb: '<b>La OMS nunca publicó eso.</b> Los "milagros de Harvard" sin enlace son el formato clásico de la cadena falsa de salud. Reenviarla puede costarle la vida a alguien.' },
        { l: '🔍 Verificar', s: 2,
          out: ['Buscas "OMS limón bicarbonato cáncer"…', 'En who.int no existe tal comunicado. En cambio, tres verificadores ya la desmintieron.', 'Respondes al grupo con el enlace del fact-check. ✅'],
          fb: '<b>Correcto.</b> Las afirmaciones de salud se verifican en la fuente oficial (OMS/Ministerio de Salud) y en verificadores certificados, no en el audio de un desconocido.' },
        { l: '❓ Pedir la fuente', s: 1,
          out: ['Preguntas: "¿Tía, dónde lo viste?"', 'Tía Marta: "Me lo mandó una amiga, no sé 🙈"'],
          fb: 'Bien encaminado: pedir la fuente frena la cadena. Pero el mensaje sigue circulando: lo ideal es <b>verificar y avisar al grupo</b> que es falso.' }
      ]
    },
    {
      from: 'Primo Diego', av: 'PD', color: '#21A0F7',
      msgs: [
        { img: true, text: 'ASÍ ESTÁ EL RÍO AHORA MISMO!! Se desbordó todo por el centro 😱😱 CORRAN LA VOZ', time: '10:14' }
      ],
      opts: [
        { l: '🔁 Reenviar', s: 0,
          out: ['Compartes la foto en tu grupo de la universidad.', 'Media clase cancela y se genera pánico… pero el centro está completamente seco.'],
          fb: 'La foto era real… <b>de una inundación de 2016</b>. Sacar imágenes de contexto es una de las trampas más comunes: la imagen no miente, el mensaje sí.' },
        { l: '🔍 Búsqueda inversa', s: 2,
          out: ['Subes la imagen a Google Lens…', 'Resultados: la misma foto aparece en noticias de 2016 y 2019.', 'Avisas: "Diego, esa foto tiene 10 años. No la sigan compartiendo." ✅'],
          fb: '<b>Exacto.</b> La búsqueda inversa de imágenes (Google Lens, TinEye) es la herramienta #1 contra el contenido fuera de contexto.' },
        { l: '❓ Preguntar de dónde la sacó', s: 1,
          out: ['Diego: "Me llegó reenviada, no sé de cuándo es 🤷"'],
          fb: 'Preguntar frena un poco la cadena, pero sin verificar la fecha real la duda queda abierta. Un paso más: <b>búsqueda inversa</b>.' }
      ]
    },
    {
      from: 'Número desconocido', av: '?', color: '#FFB020',
      msgs: [
        { text: '🎓 BECAS UNESCO 2026: $500 mensuales para jóvenes. ÚLTIMOS CUPOS. Regístrate aquí con tu DNI y tarjeta 👉 unesco-becas2026.xyz', time: '10:31' }
      ],
      opts: [
        { l: '📝 Ingresar mis datos', s: 0,
          out: ['Llenas el formulario con tu DNI y tarjeta…', 'A los dos días aparecen compras que no hiciste. El dominio ya no existe.'],
          fb: '<b>Phishing clásico:</b> dominio falso (unesco-becas2026<b>.xyz</b>), urgencia artificial y pedido de datos bancarios. La UNESCO real solo usa <b>unesco.org</b>.' },
        { l: '🚫 Reportar y avisar al grupo', s: 2,
          out: ['Reportas el número como estafa y escribes:', '"⚠️ OJO: ese enlace es FALSO. Nadie ingrese sus datos. Las becas reales solo se publican en unesco.org" ✅'],
          fb: '<b>Perfecto.</b> Reportar + advertir protege a todo el grupo. Señales de estafa: dominio extraño, urgencia, premio/beca fácil y solicitud de datos sensibles.' },
        { l: '🙈 Solo ignorarlo', s: 1,
          out: ['Eliminas el mensaje sin decir nada.', 'Pero la tía Marta ya está llenando el formulario…'],
          fb: 'Ignorar te protege a ti, pero no a los demás. En desinformación, <b>el silencio también comparte</b>: avisar cuesta 10 segundos.' }
      ]
    },
    {
      from: 'Amiga Vale', av: 'VA', color: '#7C5CFF',
      msgs: [
        { img: true, text: 'MIREN LO QUE DIJO ESTE POLÍTICO 🤬🤬 12 segundos y ya lo odio. RT si te indigna igual', time: '11:05' }
      ],
      opts: [
        { l: '🔁 Reenviar indignado', s: 0,
          out: ['Lo compartes con un "no puedo creerlo".', 'Horas después sale el video completo: la frase decía exactamente lo contrario. Te toca borrar y disculparte.'],
          fb: 'El clip estaba <b>cortado a propósito</b> en medio de la oración. La edición maliciosa cambia el sentido sin falsificar ni un solo fotograma.' },
        { l: '🔍 Buscar el video completo', s: 2,
          out: ['Buscas el discurso original de 40 minutos…', 'La frase completa dice lo contrario al clip. Compartes el enlace completo: "Contexto antes que indignación" ✅'],
          fb: '<b>Correcto.</b> Ante clips que generan indignación instantánea: busca la fuente completa. Pregunta clave: <b>¿qué dijo antes y después del corte?</b>' },
        { l: '🔁 Compartir con duda', s: 1,
          out: ['Lo compartes con un "no sé si es real, pero WTF".'],
          fb: 'El "no sé si es real" no te exime: el alcance del video falso ya creció gracias a ti. Si dudas, <b>no compartas: verifica primero</b>.' }
      ]
    },
    {
      from: 'Tío Carlos', av: 'TC', color: '#12B76A',
      msgs: [
        { text: '⚠️ ALERTA OFICIAL — Protección Civil: tormenta eléctrica fuerte esta noche 21h-02h. Aseguren ventanas y desconecten equipos. Fuente: gob.pe/proteccion-civil ✔️ (cuenta verificada)', time: '11:20' }
      ],
      opts: [
        { l: '🔁 Reenviar', s: 2,
          out: ['Verificas la cuenta: es oficial y la alerta coincide con la web.', 'Reenvías. Tu abuela desconecta todo a tiempo. ✅'],
          fb: '<b>¡Ojo a la trampa del juego!</b> No todo es falso. Compartir información verificada de fuentes oficiales también es alfabetización mediática. El objetivo no es no compartir nada: es <b>compartir lo verificado</b>.' },
        { l: '🙈 Ignorarla', s: 1,
          out: ['La dejas pasar. La tormenta llega y varios del grupo no se enteraron a tiempo.'],
          fb: 'Era una alerta <b>real y verificada</b>. Ignorar todo por defecto ("todo es fake") también es un sesgo: el escepticismo inteligente verifica y luego actúa.' },
        { l: '😒 "Seguro es fake"', s: 0,
          out: ['Respondes: "eso debe ser falso, no creo nada".', 'La alerta era oficial. Tu escepticismo automático dejó al grupo sin información útil.'],
          fb: 'El cinismo no es pensamiento crítico. Rechazar TODO sin verificar es tan dañino como creer TODO. La habilidad MIL es <b>evaluar la fuente</b>, no desconfiar por deporte.' }
      ]
    },
    {
      from: 'Cadena anónima', av: '⛓', color: '#B75D69',
      msgs: [
        { fwd: true, text: '😨 Si amas a tu mamá reenvía esto a 10 personas. Si lo ignoras, 7 años de mala suerte. A una vecina le llegó, no lo reenvió y a la semana perdió el trabajo… NO ROMPAS LA CADENA 🕯️', time: '11:42' }
      ],
      opts: [
        { l: '🔁 Reenviar "por si acaso"', s: 0,
          out: ['Lo reenvías "por si acaso" a 10 contactos.', 'La cadena acaba de ganar 10 nuevos replicadores gracias a tu miedo.'],
          fb: 'El "por si acaso" es el motor de las cadenas: apelan a la <b>culpa y al miedo</b> para replicarse. Ninguna app puede darte mala suerte… pero sí puede usar tu contacto para escalar a estafas.' },
        { l: '🛡 Romper la cadena y explicar', s: 2,
          out: ['Escribes al grupo:', '"Esto es una cadena de miedo: nadie pierde el trabajo por no reenviar un mensaje. Cortémosla aquí 🛑" ✅', 'Tía Marta: "gracias mijo, ya me había asustado 🥺"'],
          fb: '<b>Excelente.</b> Romper la cadena EN PÚBLICO vacuna al grupo entero. Señales de cadena manipuladora: chantaje emocional + orden de reenvío + anécdota anónima sin verificar.' },
        { l: '🙈 Solo ignorarla', s: 1,
          out: ['La ignoras. La cadena sigue dando vueltas por otros grupos de la familia.'],
          fb: 'Ignorarla te protege a ti, pero la cadena sigue viva. Un mensaje de 10 segundos explicando el truco <b>vacuna a todos</b> los que lo lean.' }
      ]
    }
  ];

  let scene = 0, score = 0, chat, actions;

  UI.intro({
    titulo: 'El Grupo',
    objetivo: 'Estás en el chat familiar. Seis mensajes llegarán hoy. Cada uno te pondrá a decidir: reenviar, verificar o frenar. Tus decisiones tienen consecuencias.',
    reglas: [
      'Lee cada mensaje como lo harías en la vida real… y luego decide.',
      '<b>🔁 Reenviar</b> casi nunca es la respuesta… pero no siempre: el cinismo también falla.',
      '<b>🔍 Verificar</b> te da pistas: observa qué herramienta se usa en cada caso.',
      'Máximo: 12 puntos = Guardián del Grupo.'
    ],
    onStart: start
  });

  function start() {
    scene = 0; score = 0; UI.setScore(0);
    app.innerHTML =
      '<div class="phone">' +
        '<div class="phone-top"><span class="avatar" style="background:#12B76A">❤</span><div><b>Familia ❤️</b><br><small style="opacity:.7">12 participantes · en línea</small></div></div>' +
        '<div class="chat" id="chat"></div>' +
        '<div class="chat-actions" id="actions"></div>' +
      '</div>';
    chat = document.getElementById('chat');
    actions = document.getElementById('actions');
    runScene();
  }

  function addMsg(html, cls) {
    const m = document.createElement('div');
    m.className = 'msg ' + (cls || '');
    m.innerHTML = html;
    chat.appendChild(m);
    chat.scrollTop = chat.scrollHeight;
    return m;
  }

  function typing(cb, ms) {
    const t = addMsg('escribiendo', 'typing');
    setTimeout(() => { t.remove(); cb(); }, ms || 750);
  }

  function runScene() {
    if (scene >= SCENES.length) return end();
    const s = SCENES[scene];
    actions.innerHTML = '';
    addMsg('— Escena ' + (scene + 1) + ' de ' + SCENES.length + ' —', 'msg--sys');
    typing(() => showMsgs(s, 0), 700);
  }

  function showMsgs(s, idx) {
    if (idx >= s.msgs.length) return showOpts(s);
    const m = s.msgs[idx];
    const tag = '<span class="scene-tag" style="background:' + s.color + '">' + s.from + '</span>';
    let html = (m.fwd ? '<span class="fwd-tag">↪ Reenviado muchas veces</span>' : '') +
               (m.img ? '<div class="msg--img"></div>' : '') + m.text +
               '<small>' + m.time + '</small>';
    addMsg(tag + html, m.fwd ? 'msg--fwd' : '');
    setTimeout(() => showMsgs(s, idx + 1), 850);
  }

  function showOpts(s) {
    actions.innerHTML = '';
    s.opts.forEach(o => {
      const b = document.createElement('button');
      b.className = 'btn btn--sm btn--white';
      b.innerHTML = o.l;
      b.addEventListener('click', () => resolve(s, o));
      actions.appendChild(b);
    });
  }

  function resolve(s, o) {
    actions.innerHTML = '';
    score += o.s; UI.setScore(score);
    addMsg(o.l, 'msg--me');
    typing(() => {
      o.out.forEach((line, k) => {
        setTimeout(() => {
          addMsg(line, k === o.out.length - 1 && o.s === 2 ? 'msg--sys' : (o.s === 0 ? 'msg--warn' : ''));
          if (k === o.out.length - 1) showFb(s, o);
        }, k * 800);
      });
    }, 650);
  }

  function showFb(s, o) {
    const fb = document.createElement('div');
    fb.className = 'fb ' + (o.s === 2 ? 'fb--good' : (o.s === 0 ? 'fb--bad' : ''));
    fb.style.margin = '.4rem .9rem';
    fb.innerHTML = o.fb;
    chat.appendChild(fb); chat.scrollTop = chat.scrollHeight;
    UI.toast(o.s === 2 ? '+2 · Decisión MIL 🛡️' : (o.s === 1 ? '+1 · A medias, pero algo es algo' : '+0 · Caíste en la trampa 😬'), o.s === 2 ? 'good' : (o.s === 0 ? 'bad' : ''));
    const nb = document.createElement('button');
    nb.className = 'btn btn--dark btn--sm';
    nb.style.margin = '0 auto';
    nb.innerHTML = scene + 1 >= SCENES.length ? 'Ver resultado →' : 'Siguiente mensaje →';
    nb.addEventListener('click', () => { scene++; runScene(); });
    actions.appendChild(nb);
  }

  function end() {
    const max = SCENES.length * 2;
    const rango = UI.rankFor(score / max, [
      { min: 0.75, label: '🛡️ Guardián del Grupo' },
      { min: 0.4, label: '🔍 Escéptico en práctica' },
      { min: 0, label: '😵 Reenviador serial' }
    ]);
    UI.save('grupo', rango);
    UI.finish({
      rango: rango,
      detalle: 'Puntaje: <b>' + score + ' / ' + max + '</b><ul>' +
        '<li>Cadenas de salud → verifica en la fuente oficial (OMS/Minsa).</li>' +
        '<li>Fotos impactantes → búsqueda inversa de imágenes.</li>' +
        '<li>Clips indignantes → busca el video completo.</li>' +
        '<li>Alertas oficiales verificadas → compartirlas también salva.</li></ul>',
      onRetry: start,
      next: { href: 'titulares.html', label: 'Clickbait Swipe' }
    });
  }
});
