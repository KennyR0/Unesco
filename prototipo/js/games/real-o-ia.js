/* ============================================================
   Juego 01 — ¿REAL O IA?
   Detecta imágenes generadas por IA observando sus pistas:
   manos, textos, sombras, patrones.
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');

  const SVG_W = 400, SVG_H = 270;

  const ROUNDS = [
    {
      cap: '📷 subido hace 2 h · 12.4k compartidos', ai: true,
      titulo: 'Retrato en el parque',
      svg: `<svg viewBox="0 0 400 270" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="270" fill="#BFE3F0"/>
        <rect y="190" width="400" height="80" fill="#7FB069"/>
        <circle cx="330" cy="45" r="24" fill="#FFE45C"/>
        <rect x="18" y="150" width="110" height="34" fill="#fff" stroke="#0F0F0F" stroke-width="3"/>
        <text x="26" y="173" font-family="monospace" font-size="13" fill="#0F0F0F">P4RQE C3NTR∆L</text>
        <ellipse cx="200" cy="215" rx="70" ry="30" fill="#3B6EA5"/>
        <ellipse cx="200" cy="120" rx="52" ry="62" fill="#F2C9A0"/>
        <path d="M148 110 Q150 40 200 42 Q250 40 252 110 Q255 70 235 60 Q200 48 165 62 Q146 72 148 110Z" fill="#3B2A20"/>
        <ellipse cx="182" cy="118" rx="6" ry="7" fill="#0F0F0F"/>
        <ellipse cx="218" cy="118" rx="6" ry="7" fill="#0F0F0F"/>
        <path d="M185 152 Q200 163 216 152" stroke="#0F0F0F" stroke-width="3" fill="none"/>
        <circle cx="150" cy="150" r="5" fill="#FFD23F" stroke="#0F0F0F" stroke-width="2"/>
        <rect x="244" y="146" width="7" height="22" rx="3" fill="#FFD23F" stroke="#0F0F0F" stroke-width="2"/>
        <rect x="268" y="196" width="34" height="52" rx="6" fill="#222" stroke="#0F0F0F" stroke-width="3"/>
        <ellipse cx="262" cy="222" rx="16" ry="20" fill="#F2C9A0" stroke="#0F0F0F" stroke-width="2"/>
        <rect x="246" y="196" width="9" height="22" rx="4.5" fill="#F2C9A0" stroke="#0F0F0F" stroke-width="1.5"/>
        <rect x="254" y="192" width="9" height="24" rx="4.5" fill="#F2C9A0" stroke="#0F0F0F" stroke-width="1.5"/>
        <rect x="262" y="190" width="9" height="25" rx="4.5" fill="#F2C9A0" stroke="#0F0F0F" stroke-width="1.5"/>
        <rect x="270" y="192" width="9" height="24" rx="4.5" fill="#F2C9A0" stroke="#0F0F0F" stroke-width="1.5"/>
        <rect x="278" y="196" width="9" height="22" rx="4.5" fill="#F2C9A0" stroke="#0F0F0F" stroke-width="1.5"/>
        <rect x="238" y="200" width="9" height="20" rx="4.5" fill="#F2C9A0" stroke="#0F0F0F" stroke-width="1.5"/>
      </svg>`,
      pistas: ['La mano que sostiene el teléfono tiene <b>seis dedos</b>.', 'Los pendientes <b>no coinciden</b>: uno es circular y el otro rectangular.', 'El letrero del fondo dice "P4RQE C3NTR∆L": la IA suele fallar con el <b>texto</b>.', 'La piel está demasiado lisa, sin poros ni textura: exceso de "suavizado".']
    },
    {
      cap: '📷 Lago Azul · 2019 · cámara propia', ai: false,
      titulo: 'Atardecer en el lago',
      svg: `<svg viewBox="0 0 400 270" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#FF9A5C"/><stop offset="1" stop-color="#7C5CFF"/>
          </linearGradient>
          <linearGradient id="lake" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#6B4FD8"/><stop offset="1" stop-color="#2E2A6E"/>
          </linearGradient>
        </defs>
        <rect width="400" height="170" fill="url(#sky)"/>
        <rect y="170" width="400" height="100" fill="url(#lake)"/>
        <circle cx="200" cy="158" r="30" fill="#FFE45C"/>
        <rect x="172" y="170" width="56" height="10" fill="#FFE45C" opacity=".55"/>
        <polygon points="0,170 90,80 170,170" fill="#3E3566"/>
        <polygon points="120,170 230,60 340,170" fill="#322B55"/>
        <polygon points="280,170 360,100 400,170" fill="#3E3566"/>
        <path d="M120 60 q6 -8 12 0 M136 70 q6 -8 12 0" stroke="#0F0F0F" stroke-width="2.5" fill="none"/>
        <rect x="20" y="246" width="150" height="18" fill="#fff" stroke="#0F0F0F" stroke-width="2"/>
        <text x="28" y="259" font-family="monospace" font-size="11" fill="#0F0F0F">LAGO AZUL · 2019</text>
      </svg>`,
      pistas: ['Las sombras y el reflejo del sol son <b>coherentes</b> con su posición.', 'Las montañas y el agua tienen proporciones naturales.', 'El texto del rótulo es legible y tiene sentido.', 'Ningún elemento flota ni se deforma: anatomía del paisaje correcta.']
    },
    {
      cap: '📷 "Así amaneció mi ciudad" · 8.1k compartidos', ai: true,
      titulo: 'Plaza de la ciudad',
      svg: `<svg viewBox="0 0 400 270" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="270" fill="#D9D4C4"/>
        <rect y="210" width="400" height="60" fill="#8A8578"/>
        <rect x="20" y="70" width="90" height="140" fill="#B75D69" stroke="#0F0F0F" stroke-width="3"/>
        <rect x="130" y="40" width="110" height="170" fill="#4F7CAC" stroke="#0F0F0F" stroke-width="3"/>
        <rect x="260" y="90" width="120" height="120" fill="#C9A227" stroke="#0F0F0F" stroke-width="3"/>
        <g fill="#fff" stroke="#0F0F0F" stroke-width="2">
          <rect x="32" y="84" width="18" height="18"/><rect x="60" y="84" width="18" height="18"/><rect x="88" y="84" width="18" height="18"/>
          <rect x="32" y="112" width="18" height="18"/><rect x="60" y="112" width="18" height="18"/><rect x="88" y="112" width="18" height="18"/>
          <rect x="145" y="56" width="20" height="20"/><rect x="175" y="56" width="20" height="20"/><rect x="205" y="56" width="20" height="20"/>
          <rect x="145" y="86" width="20" height="20"/><rect x="175" y="86" width="20" height="20"/><rect x="205" y="86" width="20" height="20"/>
          <rect x="145" y="116" width="20" height="20"/><rect x="175" y="116" width="20" height="20"/>
          <rect x="275" y="104" width="22" height="22"/><rect x="307" y="104" width="22" height="22"/><rect x="339" y="104" width="22" height="22"/>
        </g>
        <rect x="196" y="140" width="20" height="20" fill="#fff" stroke="#0F0F0F" stroke-width="2" transform="rotate(12 206 150)"/>
        <rect x="40" y="176" width="160" height="26" fill="#fff" stroke="#0F0F0F" stroke-width="3"/>
        <text x="48" y="194" font-family="monospace" font-size="13" fill="#0F0F0F">BIENBENID0S A C1UD∆D JARDlN</text>
        <line x1="330" y1="182" x2="330" y2="238" stroke="#0F0F0F" stroke-width="5"/>
        <circle cx="330" cy="176" r="10" fill="#FFE45C" stroke="#0F0F0F" stroke-width="3"/>
        <ellipse cx="70" cy="232" rx="14" ry="20" fill="#3B2A20"/>
        <circle cx="70" cy="206" r="12" fill="#F2C9A0" stroke="#0F0F0F" stroke-width="2"/>
        <path d="M64 244 L60 262 M76 244 L84 260" stroke="#0F0F0F" stroke-width="5"/>
      </svg>`,
      pistas: ['El letrero dice "BIENBENID0S A C1UD∆D JARDlN": <b>texto incoherente</b>, clásico de la IA.', 'Hay una ventana <b>girada y desalineada</b> respecto a su edificio.', 'El poste de luz <b>flota</b>: no toca el suelo.', 'Las piernas del peatón se funden en una sola forma imposible.']
    },
    {
      cap: '📷 "El gato de mi abuela" · 342 likes', ai: false,
      titulo: 'Gato en la ventana',
      svg: `<svg viewBox="0 0 400 270" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="270" fill="#E8B4B8"/>
        <rect x="60" y="40" width="200" height="170" fill="#BFE3F0" stroke="#0F0F0F" stroke-width="5"/>
        <line x1="160" y1="40" x2="160" y2="210" stroke="#0F0F0F" stroke-width="5"/>
        <line x1="60" y1="125" x2="260" y2="125" stroke="#0F0F0F" stroke-width="5"/>
        <rect x="40" y="210" width="240" height="14" fill="#8A5A44" stroke="#0F0F0F" stroke-width="3"/>
        <ellipse cx="150" cy="196" rx="42" ry="20" fill="#F4A261" stroke="#0F0F0F" stroke-width="3"/>
        <circle cx="185" cy="176" r="22" fill="#F4A261" stroke="#0F0F0F" stroke-width="3"/>
        <polygon points="170,160 174,140 184,156" fill="#F4A261" stroke="#0F0F0F" stroke-width="3"/>
        <polygon points="188,156 198,140 202,160" fill="#F4A261" stroke="#0F0F0F" stroke-width="3"/>
        <circle cx="179" cy="176" r="3" fill="#0F0F0F"/><circle cx="193" cy="176" r="3" fill="#0F0F0F"/>
        <path d="M183 185 q3 3 6 0" stroke="#0F0F0F" stroke-width="2" fill="none"/>
        <path d="M112 190 q-22 -6 -26 -30" stroke="#F4A261" stroke-width="10" fill="none" stroke-linecap="round"/>
        <rect x="300" y="180" width="46" height="44" fill="#C75B39" stroke="#0F0F0F" stroke-width="3"/>
        <path d="M323 180 q0 -34 22 -44 M323 180 q-18 -22 -34 -18" stroke="#3A7D44" stroke-width="7" fill="none" stroke-linecap="round"/>
        <ellipse cx="322" cy="240" rx="40" ry="6" fill="#000" opacity=".12"/>
        <ellipse cx="150" cy="222" rx="52" ry="6" fill="#000" opacity=".12"/>
      </svg>`,
      pistas: ['Anatomía felina correcta: orejas, cola y patas donde deben estar.', 'Las sombras del gato y la maceta caen en la <b>misma dirección</b>.', 'Las proporciones y la perspectiva de la ventana son consistentes.', 'Las imperfecciones del trazo son <b>naturales</b>, no artefactos.']
    },
    {
      cap: '📷 "El perro nuevo del vecino 😍" · 5.7k compartidos', ai: true,
      titulo: 'Perro en el parque',
      svg: `<svg viewBox="0 0 400 270" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="270" fill="#CDEAC0"/>
        <rect y="200" width="400" height="70" fill="#7FB069"/>
        <circle cx="60" cy="50" r="22" fill="#FFE45C"/>
        <ellipse cx="200" cy="170" rx="70" ry="42" fill="#C8963E" stroke="#0F0F0F" stroke-width="3"/>
        <circle cx="270" cy="135" r="32" fill="#C8963E" stroke="#0F0F0F" stroke-width="3"/>
        <ellipse cx="256" cy="112" rx="10" ry="18" fill="#8A5A44" stroke="#0F0F0F" stroke-width="3"/>
        <ellipse cx="290" cy="108" rx="9" ry="15" fill="#8A5A44" stroke="#0F0F0F" stroke-width="3" transform="rotate(18 290 108)"/>
        <circle cx="262" cy="132" r="5" fill="#0F0F0F"/>
        <rect x="280" y="126" width="11" height="11" fill="#0F0F0F"/>
        <ellipse cx="286" cy="150" rx="9" ry="6" fill="#0F0F0F"/>
        <g fill="#C8963E" stroke="#0F0F0F" stroke-width="3">
          <rect x="150" y="200" width="14" height="40" rx="6"/>
          <rect x="175" y="204" width="14" height="40" rx="6"/>
          <rect x="200" y="206" width="14" height="40" rx="6"/>
          <rect x="225" y="204" width="14" height="40" rx="6"/>
          <rect x="248" y="200" width="14" height="40" rx="6"/>
        </g>
        <path d="M132 160 q-26 -14 -20 -42" stroke="#C8963E" stroke-width="11" fill="none" stroke-linecap="round"/>
        <path d="M140 172 q-30 4 -38 26" stroke="#C8963E" stroke-width="9" fill="none" stroke-linecap="round"/>
        <ellipse cx="200" cy="252" rx="90" ry="7" fill="#000" opacity=".14"/>
      </svg>`,
      pistas: ['El perro tiene <b>cinco patas</b> (y dos colas).', 'Un ojo es circular y el otro <b>cuadrado</b>: simetría rota.', 'Las orejas tienen formas y ángulos incompatibles.', 'La IA falla con la anatomía cuando hay "demasiadas partes" que contar.']
    },
    {
      cap: '📷 Mercado central · hoy 8:40', ai: false,
      titulo: 'Puesto de frutas',
      svg: `<svg viewBox="0 0 400 270" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="270" fill="#F6E7C1"/>
        <rect x="30" y="150" width="340" height="24" fill="#8A5A44" stroke="#0F0F0F" stroke-width="3"/>
        <rect x="50" y="174" width="14" height="80" fill="#8A5A44" stroke="#0F0F0F" stroke-width="3"/>
        <rect x="336" y="174" width="14" height="80" fill="#8A5A44" stroke="#0F0F0F" stroke-width="3"/>
        <g stroke="#0F0F0F" stroke-width="2.5">
          <circle cx="90" cy="138" r="16" fill="#FF9F1C"/><circle cx="120" cy="142" r="16" fill="#FF9F1C"/><circle cx="105" cy="122" r="16" fill="#FF9F1C"/>
          <circle cx="200" cy="140" r="14" fill="#E63946"/><circle cx="226" cy="142" r="14" fill="#E63946"/><circle cx="213" cy="124" r="14" fill="#E63946"/>
          <path d="M282 128 q26 -10 40 8 q-20 14 -40 -8Z" fill="#FFE45C"/>
          <path d="M290 146 q26 -10 40 8 q-20 14 -40 -8Z" fill="#FFE45C"/>
        </g>
        <rect x="60" y="40" width="280" height="52" fill="#fff" stroke="#0F0F0F" stroke-width="3"/>
        <text x="76" y="63" font-family="monospace" font-size="14" fill="#0F0F0F">MANGO $2.00 · FRESA $3.50</text>
        <text x="76" y="82" font-family="monospace" font-size="14" fill="#0F0F0F">PLÁTANO $1.50 · PAGO EN EFECTIVO</text>
        <ellipse cx="200" cy="260" rx="170" ry="6" fill="#000" opacity=".1"/>
      </svg>`,
      pistas: ['Los precios del cartel son <b>legibles y coherentes</b>.', 'Las frutas tienen formas y tamaños naturales (ninguna se fusiona).', 'La estructura del puesto es físicamente posible.', 'Una foto aburrida y perfectamente normal también es una señal: lo real no siempre espectacular.']
    },
    {
      cap: '📷 "Anoche en el concierto 🔥" · 21k compartidos', ai: true,
      titulo: 'Multitud en el concierto',
      svg: `<svg viewBox="0 0 400 270" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="270" fill="#1B1B3A"/>
        <rect x="120" y="20" width="160" height="60" fill="#FF2E7E" stroke="#0F0F0F" stroke-width="3"/>
        <path d="M150 80 L120 150 M200 80 L200 150 M250 80 L280 150" stroke="#C8FF16" stroke-width="4" opacity=".7"/>
        <g stroke="#0F0F0F" stroke-width="2.5">
          <circle cx="60" cy="180" r="20" fill="#F2C9A0"/><circle cx="110" cy="190" r="20" fill="#F2C9A0"/>
          <circle cx="160" cy="182" r="20" fill="#F2C9A0"/><circle cx="210" cy="192" r="20" fill="#F2C9A0"/>
          <circle cx="260" cy="184" r="20" fill="#F2C9A0"/><circle cx="310" cy="190" r="20" fill="#F2C9A0"/>
          <circle cx="358" cy="182" r="20" fill="#F2C9A0"/>
        </g>
        <g fill="#0F0F0F">
          <circle cx="54" cy="178" r="2.6"/><circle cx="66" cy="178" r="2.6"/><circle cx="104" cy="188" r="2.6"/><circle cx="116" cy="188" r="2.6"/>
          <circle cx="154" cy="180" r="2.6"/><circle cx="166" cy="180" r="2.6"/><circle cx="204" cy="190" r="2.6"/><circle cx="216" cy="190" r="2.6"/>
          <circle cx="254" cy="182" r="2.6"/><circle cx="266" cy="182" r="2.6"/><circle cx="304" cy="188" r="2.6"/><circle cx="316" cy="188" r="2.6"/>
        </g>
        <path d="M352 170 q14 10 2 26 q-12 12 -20 -2 q-4 -16 18 -24Z" fill="#E8B4B8" stroke="#0F0F0F" stroke-width="2.5"/>
        <path d="M84 200 q-6 26 10 34 M140 202 q0 24 16 30" stroke="#F2C9A0" stroke-width="10" stroke-linecap="round" fill="none"/>
        <rect x="228" y="150" width="16" height="26" rx="3" fill="#21E6F7" stroke="#0F0F0F" stroke-width="2.5"/>
        <rect x="230" y="146" width="8" height="14" rx="4" fill="#F2C9A0" stroke="#0F0F0F" stroke-width="2"/>
        <rect y="222" width="400" height="48" fill="#10102A"/>
        <g stroke="#0F0F0F" stroke-width="2.5">
          <circle cx="80" cy="246" r="17" fill="#F2C9A0"/><circle cx="150" cy="250" r="17" fill="#F2C9A0"/>
          <circle cx="220" cy="246" r="17" fill="#F2C9A0"/><circle cx="290" cy="250" r="17" fill="#F2C9A0"/>
        </g>
      </svg>`,
      pistas: ['Todas las caras son <b>idénticas</b>: la IA repite patrones en multitudes.', 'El rostro de la derecha está <b>derretido</b> y sin ojos.', 'Los brazos se fusionan entre sí sin manos definidas.', 'La mano que sostiene el teléfono es un solo bloque sin dedos.']
    },
    {
      cap: '📷 "Mi abuela en su cumpleaños 80" · familia', ai: false,
      titulo: 'Retrato de la abuela',
      svg: `<svg viewBox="0 0 400 270" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="270" fill="#B8B8D1"/>
        <rect x="0" y="0" width="400" height="270" fill="none"/>
        <g opacity=".5" stroke="#8F8FB8" stroke-width="3">
          <line x1="30" y1="0" x2="30" y2="270"/><line x1="370" y1="0" x2="370" y2="270"/>
        </g>
        <ellipse cx="200" cy="230" rx="80" ry="34" fill="#5B5F97"/>
        <ellipse cx="200" cy="128" rx="56" ry="66" fill="#EBC8A5" stroke="#0F0F0F" stroke-width="2"/>
        <path d="M144 118 Q140 40 200 44 Q260 40 256 118 Q262 60 232 52 Q200 44 168 52 Q138 60 144 118Z" fill="#D9D9D9" stroke="#0F0F0F" stroke-width="2"/>
        <circle cx="178" cy="126" r="13" fill="none" stroke="#0F0F0F" stroke-width="3"/>
        <circle cx="222" cy="126" r="13" fill="none" stroke="#0F0F0F" stroke-width="3"/>
        <line x1="191" y1="126" x2="209" y2="126" stroke="#0F0F0F" stroke-width="3"/>
        <circle cx="178" cy="126" r="3" fill="#0F0F0F"/><circle cx="222" cy="126" r="3" fill="#0F0F0F"/>
        <path d="M168 108 q10 -6 20 0 M212 108 q10 -6 20 0" stroke="#8A8A8A" stroke-width="2.5" fill="none"/>
        <path d="M186 160 q14 8 28 0" stroke="#0F0F0F" stroke-width="3" fill="none"/>
        <path d="M160 146 q6 4 0 10 M240 146 q-6 4 0 10" stroke="#B98A5E" stroke-width="2" fill="none"/>
        <path d="M172 176 q28 10 56 0" stroke="#B98A5E" stroke-width="2" fill="none" opacity=".7"/>
        <circle cx="166" cy="142" r="4" fill="#D9A066" opacity=".55"/>
        <circle cx="236" cy="150" r="3" fill="#D9A066" opacity=".55"/>
        <circle cx="150" cy="140" r="4" fill="#FFD23F" stroke="#0F0F0F" stroke-width="1.5"/>
        <circle cx="250" cy="140" r="4" fill="#FFD23F" stroke="#0F0F0F" stroke-width="1.5"/>
      </svg>`,
      pistas: ['Los lentes están <b>alineados</b> y las patillas coinciden.', 'Los pendientes son iguales en ambas orejas.', 'Arrugas, lunares y manchas: imperfecciones <b>naturales</b> y coherentes.', 'La iluminación del rostro y el fondo coinciden en dirección.']
    }
  ];

  let order = [], i = 0, ok = 0;

  UI.intro({
    titulo: '¿Real o IA?',
    objetivo: 'La IA genera imágenes cada vez más convincentes… pero siempre deja rastros. Analiza 8 imágenes y decide su origen.',
    reglas: [
      'Observa cada imagen con lupa: <b>manos, textos, sombras y simetrías</b> delatan a la IA.',
      'Responde <b>📷 Real</b> o <b>🤖 Generada por IA</b>.',
      'Después de responder verás las pistas que delataban (o protegían) la imagen.',
      'Puntuación final: 8 aciertos = Cazador de sintéticos.'
    ],
    onStart: start
  });

  function start() {
    order = UI.shuffle(ROUNDS.slice());
    i = 0; ok = 0; UI.setScore(0);
    render();
  }

  function render() {
    if (i >= order.length) return end();
    const r = order[i];
    app.innerHTML =
      '<div class="center-col">' +
        '<span class="round-label">Caso ' + (i + 1) + ' / ' + order.length + '</span>' +
        '<div class="art-frame">' + r.svg +
          '<div class="art-caption"><span>' + r.cap + '</span><span>❤ ' + (r.ai ? '12.4k' : '843') + '</span></div>' +
        '</div>' +
        '<p class="q">¿Real o generada por IA?</p>' +
        '<div class="verdict-btns">' +
          '<button class="btn" data-v="0">📷 Real</button>' +
          '<button class="btn btn--magenta" data-v="1">🤖 Generada por IA</button>' +
        '</div>' +
        '<div id="fbZone"></div>' +
      '</div>';
    UI.$$('#fbZone')[0];
    app.querySelectorAll('[data-v]').forEach(b =>
      b.addEventListener('click', () => answer(r, parseInt(b.dataset.v, 10), b))
    );
  }

  function answer(r, v, btn) {
    const guessedAI = v === 1;
    const good = guessedAI === r.ai;
    if (good) { ok++; UI.addScore(1); }
    app.querySelectorAll('[data-v]').forEach(b => b.disabled = true);
    btn.classList.add('btn--ok-flash');
    const zone = document.getElementById('fbZone');
    const listTitle = r.ai ? '🚩 Las pistas que la delataban:' : '✅ Señales de autenticidad:';
    zone.innerHTML =
      '<div class="fb tells ' + (good ? 'fb--good' : 'fb--bad') + '">' +
        '<b>' + (good ? '¡Correcto! ' : 'Incorrecto. ') + (r.ai ? 'La imagen fue GENERADA POR IA.' : 'La imagen era REAL.') + '</b>' +
        '<ul>' + r.pistas.map(p => '<li>' + p + '</li>').join('') + '</ul>' +
        '<div class="row-btns" style="margin-top:.9rem"><button class="btn btn--dark btn--sm" id="nextBtn">' + (i + 1 >= order.length ? 'Ver resultado →' : 'Siguiente imagen →') + '</button></div>' +
      '</div>';
    UI.toast(good ? '+1 · Buen ojo 🧐' : 'Fallaste · revisa las pistas 👇', good ? 'good' : 'bad');
    document.getElementById('nextBtn').addEventListener('click', () => { i++; render(); });
    zone.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function end() {
    const pct = ok / order.length;
    const rango = UI.rankFor(pct, [
      { min: 0.88, label: '🕵️ Cazador de sintéticos' },
      { min: 0.5, label: '🔍 Observador en entrenamiento' },
      { min: 0, label: '😵 Ojo despistado' }
    ]);
    UI.save('real-o-ia', rango);
    UI.finish({
      rango: rango,
      detalle: 'Acertaste <b>' + ok + ' de ' + order.length + '</b> imágenes.<ul>' +
        '<li>La IA falla con: manos, textos, dientes, joyas y multitudes.</li>' +
        '<li>Ante una imagen dudosa, haz <b>búsqueda inversa</b> (Google Lens / TinEye).</li>' +
        '<li>Si una imagen "perfecta" apela a tus emociones… verifica el doble.</li></ul>',
      onRetry: start,
      next: { href: 'grupo.html', label: 'El Grupo' }
    });
  }
});
