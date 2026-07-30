/* ============================================================
   Juego 04 — RADAR DE FUENTES
   Clasifica 9 sitios en: Confiable / Dudosa / Fraudulenta.
   El dominio y las señales editoriales dicen más que el diseño.
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');

  const SOURCES = [
    { name: 'UNESCO — sitio oficial', url: 'https://www.unesco.org/es/articles', cat: 'ok',
      desc: 'Artículo con autor institucional, fecha de publicación y referencias a documentos oficiales.',
      meta: 'Autor: UNESCO · Fecha visible · Referencias', why: '<b>Confiable:</b> organismo internacional con dominio institucional, autoría clara, fecha y referencias verificables.' },
    { name: 'Agencia de noticias EFE-style', url: 'https://agencia-efe.example.com/economia', cat: 'ok',
      desc: 'Cable de agencia con redactor identificado, hora exacta y política pública de correcciones.',
      meta: 'Autor firmado · Hora exacta · Correcciones públicas', why: '<b>Confiable:</b> las agencias verifican antes de publicar y corrigen en público cuando fallan. Esa rendición de cuentas es la señal clave.' },
    { name: 'Artículo en revista científica', url: 'https://revista-ciencia.example.org/articulo/doi', cat: 'ok',
      desc: 'Estudio con DOI, metodología descrita, revisión por pares y declaración de conflictos de interés.',
      meta: 'DOI · Peer review · Metodología abierta', why: '<b>Confiable:</b> el DOI permite rastrearlo y la revisión por pares significa que otros expertos lo examinaron antes de publicarse.' },
    { name: 'Blog personal de opinión', url: 'https://miblogsincensura.exampleblog.com/post', cat: 'dud',
      desc: 'Columna de opinión sin fuentes citadas: "Yo digo la verdad que los medios ocultan".',
      meta: 'Sin fuentes · Opinión disfrazada de noticia', why: '<b>Dudosa:</b> no es necesariamente falsa, pero es opinión sin evidencia. Puede servir como punto de partida, nunca como prueba.' },
    { name: 'Agregador sin autor ni fecha', url: 'https://noticiasrapidas24.example.info/nota/4471', cat: 'dud',
      desc: 'Texto copiado de otros portales. No firma nadie, no tiene fecha y no enlaza a la fuente original.',
      meta: 'Sin autor · Sin fecha · Sin enlaces', why: '<b>Dudosa:</b> sin autor ni fecha no hay a quién pedirle cuentas. Rastrea la noticia original antes de creerla.' },
    { name: 'Cuenta de humor satírico', url: 'https://eldiariodelamedialuna.example.com', cat: 'dud',
      desc: 'Noticias inventadas con fines de humor. En su sección "Acerca de" lo declara abiertamente.',
      meta: 'Sátira declarada en "Acerca de"', why: '<b>Dudosa (sátira):</b> no busca engañar, pero sacada de contexto circula como noticia real. Lee siempre el "Acerca de" del sitio.' },
    { name: 'Portal de "becas" internacionales', url: 'https://unesco-becas2026.example.xyz', cat: 'fake',
      desc: 'Imita el logo de la UNESCO, promete dinero y pide DNI + datos bancarios para "registrarte".',
      meta: 'Dominio .xyz · Pide datos bancarios · Urgencia', why: '<b>Fraudulenta:</b> typosquatting + phishing. La UNESCO real es unesco.org. Ninguna beca real pide tu tarjeta para "registrarte".' },
    { name: 'Diario clonado', url: 'https://elpais-internacional.example.press', cat: 'fake',
      desc: 'Copia el diseño de un diario famoso, pero el dominio es .press y todas las noticias atacan al mismo partido.',
      meta: 'Suplantación de marca · Sesgo total', why: '<b>Fraudulenta:</b> suplanta una marca conocida cambiando el dominio. Mira SIEMPRE la barra de direcciones, no el logo.' },
    { name: 'Perfil "Noticias Verdaderas Oficial"', url: 'https://x.example.com/NoticiasVerdaderas_Oficial', cat: 'fake',
      desc: 'Cuenta creada hace 3 semanas, foto de perfil genérica, publica 40 veces al día y nunca enlaza fuentes.',
      meta: 'Cuenta nueva · 40 posts/día · Cero fuentes', why: '<b>Fraudulenta:</b> patrón de granja de desinformación: cuenta nueva, volumen inhumano de publicaciones y ninguna fuente enlazada.' }
  ];

  const BINS = [
    { id: 'ok', label: 'Confiable', sub: 'Verificable, con autor y rendición de cuentas', cls: 'bin--ok' },
    { id: 'dud', label: 'Dudosa', sub: 'Opinión, sátira o información incompleta', cls: 'bin--dud' },
    { id: 'fake', label: 'Fraudulenta', sub: 'Engaño deliberado: suplantación o estafa', cls: 'bin--fake' }
  ];

  let selected = null, placed = 0, okCount = 0;

  UI.intro({
    titulo: 'Radar de Fuentes',
    objetivo: 'En internet todo "parece" noticia. Tu trabajo: leer las señales (dominio, autor, fecha, referencias) y clasificar cada fuente en su categoría real.',
    reglas: [
      'Toca una <b>tarjeta-fuente</b> para seleccionarla.',
      'Luego toca el <b>radar</b> donde crees que pertenece: Confiable, Dudosa o Fraudulenta.',
      'Fíjate en la URL: el <b>dominio</b> revela más que el logo.',
      '9 fuentes, 3 categorías. Calibra tu radar.'
    ],
    onStart: start
  });

  function start() {
    selected = null; placed = 0; okCount = 0; UI.setScore(0);
    render();
  }

  function render() {
    app.innerHTML =
      '<div class="radar-layout">' +
        '<div class="sources" id="sources">' +
          SOURCES.map((s, i) =>
            '<div class="source-card" data-i="' + i + '" id="src' + i + '">' +
              '<div class="urlbar"><span class="lock' + (s.cat === 'ok' ? '' : ' lock--bad') + '"></span>' + s.url + '</div>' +
              '<h5>' + s.name + '</h5>' +
              '<p>' + s.desc + '</p>' +
              '<span class="meta">' + s.meta + '</span>' +
            '</div>'
          ).join('') +
        '</div>' +
        '<div class="bins" id="bins">' +
          BINS.map(b =>
            '<div class="bin ' + b.cls + '" data-bin="' + b.id + '">' +
              '<h4>' + b.label + '</h4><small>' + b.sub + '</small>' +
              '<span class="cnt" id="cnt-' + b.id + '">0 aquí</span>' +
            '</div>'
          ).join('') +
        '</div>' +
      '</div>';

    app.querySelectorAll('.source-card').forEach(c =>
      c.addEventListener('click', () => {
        app.querySelectorAll('.source-card').forEach(x => x.classList.remove('selected'));
        c.classList.add('selected');
        selected = parseInt(c.dataset.i, 10);
      })
    );
    app.querySelectorAll('.bin').forEach(b =>
      b.addEventListener('click', () => assign(b))
    );
  }

  function assign(binEl) {
    if (selected === null) { UI.toast('Primero selecciona una tarjeta-fuente 👆'); return; }
    const s = SOURCES[selected];
    const bin = binEl.dataset.bin;
    const card = document.getElementById('src' + selected);
    if (bin === s.cat) {
      okCount++; UI.addScore(1);
      card.classList.remove('selected');
      card.classList.add('placed');
      const tag = document.createElement('span');
      tag.className = 'placed-tag';
      tag.textContent = BINS.find(b => b.id === bin).label;
      card.appendChild(tag);
      const cnt = document.getElementById('cnt-' + bin);
      cnt.textContent = (parseInt(cnt.textContent, 10) + 1) + ' aquí';
      UI.toast('✔ ' + s.why, 'good', 4200);
      selected = null; placed++;
      if (placed >= SOURCES.length) setTimeout(end, 900);
    } else {
      binEl.classList.add('shake');
      setTimeout(() => binEl.classList.remove('shake'), 500);
      card.classList.remove('selected');
      selected = null;
      UI.toast('✘ No va ahí. ' + s.why, 'bad', 4600);
    }
  }

  function end() {
    const pct = okCount / SOURCES.length;
    const rango = UI.rankFor(pct, [
      { min: 0.9, label: '📡 Radar calibrado' },
      { min: 0.6, label: '🔎 Detector en ajuste' },
      { min: 0, label: '📻 Señal con interferencia' }
    ]);
    UI.save('radar', rango);
    UI.finish({
      rango: rango,
      detalle: 'Clasificaste bien <b>' + okCount + ' de ' + SOURCES.length + '</b> fuentes.<ul>' +
        '<li>Mira la <b>barra de direcciones</b>, no el logo: unesco.org ≠ unesco-becas.xyz.</li>' +
        '<li>Autor + fecha + referencias = mínimo aceptable para creer.</li>' +
        '<li>Sátira y opinión no son "fake", pero tampoco son evidencia.</li>' +
        '<li>Cuenta nueva + volumen inhumano + cero fuentes = granja de desinformación.</li></ul>',
      onRetry: start,
      next: { href: 'feed.html', label: 'Feed 60"' }
    });
  }
});
