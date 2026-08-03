/**
 * Genera pack editorial, media-index y actualiza assets real-o-ia del manifiesto.
 */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
/** Misma versión activa del arcade (arcade-content.ts). */
const CONTENT_VERSION = "2026-07-30.1";
const INDEX_VERSION = "2026-08-03.1";
const MANIFEST_VERSION = "2026-08-03.1";

const editorial = [
  {
    kind: "ai",
    n: "01",
    slug: "lago-turquesa",
    prompt: "¿Paisaje de viaje real o generado por IA?",
    context:
      "«Moraine Lake, no exagero» · 18.2k compartidos · subida hace 40 minutos.",
    alt: "Lago turquesa entre montañas afiladas, bosque de coníferas a un lado y cielo azul con nubes.",
    explanation:
      "La escena parece una postal imposible de resistir. Fue generada por IA: el paisaje se siente «demasiado perfecto» y aparecen artefactos típicos del modelo.",
    signals: [
      "En el cielo hay manchas y nubes fragmentadas que no siguen una forma natural.",
      "La saturación y el contraste están empujados de forma uniforme en toda la foto.",
      "El reflejo del agua es casi un espejo perfecto, sin oleaje ni suciedad.",
      "Los árboles del borde se ven dentados y sobreprocesados contra el cielo.",
    ],
    recommendation:
      "Ante un paisaje viral «perfecto», busca la ubicación en mapas y compara con fotos de turistas reales antes de compartirla.",
    evaluationSignals: [
      "sky_artifacts",
      "hyper_saturation",
      "perfect_reflection",
      "overprocessed_edges",
    ],
  },
  {
    kind: "ai",
    n: "02",
    slug: "manada-de-perros",
    prompt: "¿Foto de campo real o escena generada por IA?",
    context:
      "«Todos los perros del refugio salieron a correr» · 9.4k likes · historia que se reenvía en grupos.",
    alt: "Ocho perros de distintas razas corriendo en fila por un prado verde con un lago al fondo.",
    explanation:
      "Da ternura y parece un reportaje. Es IA: alinear tantas razas a la vez, todas nítidas y «posando» hacia la cámara, es una composición típica de generadores.",
    signals: [
      "Todos los perros quedan enfocados a la vez en una fila demasiado ordenada.",
      "Las proporciones entre razas grandes y pequeñas se sienten de catálogo.",
      "El fondo de lago y colinas parece un decorado limpio, sin desorden real.",
      "Las sombras y el ritmo de carrera coinciden demasiado entre animales distintos.",
    ],
    recommendation:
      "Si una foto de animales «perfectos» se vuelve viral, verifica la cuenta original y busca fotogramas similares con búsqueda inversa.",
    evaluationSignals: [
      "too_ordered_group",
      "catalog_proportions",
      "clean_backdrop",
      "synced_motion",
    ],
  },
  {
    kind: "ai",
    n: "03",
    slug: "barista-cafeteria",
    prompt: "¿Momento de cafetería real o generado por IA?",
    context:
      "«Mi barista favorita haciendo latte art» · 6.1k compartidos · se celebra como foto del día.",
    alt: "Barista con delantal verde sirviendo latte art en una cafetería con ladrillo visto y pizarra de especiales.",
    explanation:
      "El ambiente se siente cálido y creíble. Es IA: el texto de las pizarras y carteles delata al modelo, que inventa palabras ilegibles.",
    signals: [
      "La pizarra de especiales mezcla días reales con palabras sin sentido.",
      "Otros carteles del fondo imitan letras pero no forman frases legibles.",
      "Algunos objetos de las estanterías se funden al mirarlos de cerca.",
      "El chorro de leche y la superficie del café se ven demasiado «pintados».",
    ],
    recommendation:
      "Cuando una foto de negocio incluye texto, amplía los carteles: si no se pueden leer, desconfía antes de compartir.",
    evaluationSignals: [
      "garbled_chalkboard",
      "illegible_signage",
      "melting_objects",
      "painted_liquid",
    ],
  },
  {
    kind: "ai",
    n: "04",
    slug: "poke-bowl",
    prompt: "¿Foodie real o plato generado por IA?",
    context:
      "«Poke bowl del mediodía» · 4.8k likes · luz de estudio y plato impecable.",
    alt: "Bowl negro con salmón, aguacate, edamame y arroz, rodeado de palillos y cuencos pequeños sobre fondo oscuro.",
    explanation:
      "Parece publicidad de restaurante. Es IA: el arroz y el corte «perfecto» del aguacate son señales clásicas de comida sintética.",
    signals: [
      "Los granos de arroz se ven tubulares y demasiado uniformes.",
      "Las láminas de aguacate están cortadas con simetría de catálogo.",
      "La luz dramática deja todo brillante sin manchas ni irregularidades reales.",
      "Los bordes del pescado y las semillas se repiten con un patrón demasiado limpio.",
    ],
    recommendation:
      "En fotos de comida hiperestilizadas, busca texturas imperfectas (granos, brillos irregulares) antes de creer que es una foto casera.",
    evaluationSignals: [
      "unnatural_rice",
      "perfect_avocado_fan",
      "studio_cleanliness",
      "repetitive_garnish",
    ],
  },
  {
    kind: "ai",
    n: "05",
    slug: "spaghetti-trattoria",
    prompt: "¿Cena en trattoria real o generada por IA?",
    context:
      "«Cena con la nonna en Roma» · 11k compartidos · historia sentimental adjunta.",
    alt: "Mujer sonriente con delantal floral alzando un tenedor de espagueti en un restaurante con paredes de ladrillo.",
    explanation:
      "La emoción vende la historia. Es IA: manos, pasta y cuadros del fondo fallan al mirarlos con calma.",
    signals: [
      "Los dedos de la mano sobre la mesa se ven gruesos o fusionados.",
      "El agarre del tenedor no encaja del todo con la anatomía de la mano.",
      "Los espaguetis del tenedor se funden en un solo bloque.",
      "Los cuadros del fondo imitan fotos o mapas sin detalle legible.",
    ],
    recommendation:
      "En retratos íntimos virales, revisa manos y objetos en contacto: ahí suelen aparecer los fallos de la IA.",
    evaluationSignals: [
      "fused_fingers",
      "awkward_grip",
      "melted_pasta",
      "illegible_wall_art",
    ],
  },
  {
    kind: "ai",
    n: "06",
    slug: "calle-de-colores",
    prompt: "¿Calle turística real o escenario generado por IA?",
    context:
      "«La calle más colorida del mundo» · 22k compartidos · sin ubicación exacta.",
    alt: "Calle empedrada flanqueada por casas de colores muy vivos bajo un cielo azul intenso.",
    explanation:
      "Parece el destino soñado de cualquier feed de viajes. Es IA: saturación extrema, vacío total y texturas demasiado limpias.",
    signals: [
      "Los colores de las fachadas parecen neón uniformes, sin desgaste real.",
      "No hay cables, gente ni desorden típico de una calle habitada.",
      "El cielo es un azul plano, sin variación ni contaminación visual.",
      "Las sombras son duras y perfectas, como en un render.",
    ],
    recommendation:
      "Si una calle «más colorida del mundo» no trae ubicación verificable, busca referencias geográficas antes de reenviar.",
    evaluationSignals: [
      "neon_facades",
      "sterile_street",
      "flat_sky",
      "render_shadows",
    ],
  },
  {
    kind: "ai",
    n: "07",
    slug: "faro-al-atardecer",
    prompt: "¿Foto de costa real o generada por IA?",
    context:
      "«Atardecer en el faro» · 7.3k likes · se comparte como postal del norte.",
    alt: "Faro blanco junto a casas de techo rojo sobre rocas oscuras, con oleaje y cielo rosado al atardecer.",
    explanation:
      "Tiene aire de postal clásica. Es IA: la composición «de catálogo» y algunas texturas delatan el origen sintético.",
    signals: [
      "La escena está demasiado limpia y simétrica para una costa real con clima.",
      "Las rocas del primer plano repiten patrones de textura poco naturales.",
      "La luz del faro y el cielo se combinan con un brillo de postal digital.",
      "Detalles finos de oleaje y tejados se suavizan de forma uniforme.",
    ],
    recommendation:
      "Compara postales virales de faros con fotos geotagueadas del mismo lugar: las diferencias de textura suelen delatar al generador.",
    evaluationSignals: [
      "catalog_composition",
      "repetitive_rock_texture",
      "postcard_glow",
      "uniform_smoothing",
    ],
  },
  {
    kind: "ai",
    n: "08",
    slug: "hamburguesa-estudio",
    prompt: "¿Anuncio real o comida generada por IA?",
    context:
      "«La mejor burger de la ciudad» · 5.9k compartidos · foto de menú sin restaurante claro.",
    alt: "Hamburguesa con queso derretido, tomate y lechuga sobre tabla de madera, con papas y bebida al fondo.",
    explanation:
      "Parece foto de menú profesional. Es IA: el «perfeccionismo» de semillas, capas y brillos es demasiado calculado.",
    signals: [
      "Las semillas de sésamo están repartidas con regularidad casi matemática.",
      "Las capas del sandwich se apilan con simetría de anuncio imposible en cocina real.",
      "El queso cae en pliegues demasiado limpios y repetidos.",
      "El fondo borroso parece un decorado genérico de restaurante digital.",
    ],
    recommendation:
      "Desconfía de platos «perfectos» sin restaurante, precio ni contexto: busca la cuenta del local o una foto menos retocada.",
    evaluationSignals: [
      "mathematical_sesame",
      "impossible_stack",
      "clean_cheese_drape",
      "generic_bokeh",
    ],
  },
  {
    kind: "ai",
    n: "09",
    slug: "gato-tabby",
    prompt: "¿Retrato de mascota real o generado por IA?",
    context:
      "«Mirada de mi gato esta mañana» · 14k likes · se reparte en grupos de animales.",
    alt: "Primer plano de un gato atigrado con ojos amarillo-verdosos sobre una manta texturizada y fondo difuminado.",
    explanation:
      "Es imposible no quererlo. Es IA: el pelaje y los bigotes lucen excesivamente limpios, como un render de estudio.",
    signals: [
      "El pelaje tiene un acabado demasiado uniforme, sin pelos sueltos ni imperfecciones.",
      "Los bigotes se funden con el desenfoque de forma demasiado suave.",
      "Los ojos brillan con catchlights «de estudio» en un entorno casero.",
      "El fondo bokeh es cálido y genérico, sin objetos reconocibles.",
    ],
    recommendation:
      "En retratos de mascotas virales, mira bordes de pelo y bigotes: la IA suele suavizarlos en exceso.",
    evaluationSignals: [
      "overly_clean_fur",
      "smoothed_whiskers",
      "studio_catchlights",
      "generic_bokeh",
    ],
  },
  {
    kind: "ai",
    n: "10",
    slug: "piano-nocturno",
    prompt: "¿Estudio musical real o escena generada por IA?",
    context:
      "«Ensayando Nocturne Op. 9 No. 2» · 3.2k compartidos · estética dark academia.",
    alt: "Partitura abierta sobre un piano de cola negro, con metrónomo y libros al fondo en luz cálida.",
    explanation:
      "La atmósfera convence. Es IA: atribuye un nocturno de Chopin a Beethoven y dibuja notación musical imposible.",
    signals: [
      "La partitura atribuye el Nocturne Op. 9 No. 2 a Beethoven (es de Chopin).",
      "Las claves y las notas están malformadas o incompletas.",
      "El metrónomo muestra marcas ilegibles en lugar de números claros.",
      "Algunos símbolos musicales flotan o se fusionan sin reglas reales.",
    ],
    recommendation:
      "Si una imagen incluye partituras, mapas o documentos, verifica hechos y legibilidad: la IA inventa texto «con pinta de verdadero».",
    evaluationSignals: [
      "wrong_composer",
      "malformed_notation",
      "illegible_metronome",
      "floating_symbols",
    ],
  },
  {
    kind: "real",
    n: "01",
    slug: "golden-retriever",
    prompt: "¿Foto casera real o perro generado por IA?",
    context:
      "«El nuevo de casa» · 890 likes · subida desde el patio sin filtros.",
    alt: "Golden retriever de pie en una esquina de paredes blancas sobre suelo de concreto, con la lengua fuera.",
    explanation:
      "Se siente sencilla y cercana… y lo es. Es una foto real: anatomía, texturas y desgaste del entorno encajan.",
    signals: [
      "El pelaje tiene variaciones naturales de color y densidad.",
      "Las patas y el contacto con el suelo son anatómicamente coherentes.",
      "La base del muro muestra manchas y desgaste reales.",
      "La luz natural deja sombras suaves sin brillo de estudio sintético.",
    ],
    recommendation:
      "No todo lo bonito es falso: busca inconsistencias concretas; si no aparecen, la duda también es parte del criterio.",
    evaluationSignals: [
      "natural_fur_variation",
      "coherent_paws",
      "weathered_surfaces",
      "soft_daylight",
    ],
  },
  {
    kind: "real",
    n: "02",
    slug: "dos-frutos",
    prompt: "¿Bodegón real o generado por IA?",
    context:
      "«Fruta del mercado» · 210 likes · foto minimalista de cocina.",
    alt: "Dos frutos redondos de tono marrón-oliva sobre una superficie clara con textura de piedra.",
    explanation:
      "Parece demasiado limpia para ser verdad, pero es real. Las microtexturas y la cicatriz del tallo no son patrones de IA.",
    signals: [
      "La piel muestra moteado irregular, no un patrón repetido.",
      "La cicatriz del tallo tiene detalle orgánico creíble.",
      "La sombra cae con degradado natural según la luz.",
      "La superficie de apoyo tiene imperfecciones no simétricas.",
    ],
    recommendation:
      "En fotos minimalistas, amplía texturas pequeñas: la IA suele repetir patrones; la foto real conserva ruido e irregularidad.",
    evaluationSignals: [
      "irregular_skin",
      "organic_stem_scar",
      "natural_shadow_falloff",
      "asymmetric_surface",
    ],
  },
  {
    kind: "real",
    n: "03",
    slug: "ciudad-costera",
    prompt: "¿Vista urbana real o paisaje generado por IA?",
    context:
      "«Mi ciudad entre la niebla» · 2.4k compartidos · foto en blanco y negro.",
    alt: "Vista en blanco y negro de un barrio denso en ladera, playa curva y edificios altos junto al mar bajo niebla.",
    explanation:
      "La densidad urbana asusta a cualquiera que busque fallos de IA… y sin embargo es real: el caos arquitectónico es coherente.",
    signals: [
      "Los edificios de la ladera muestran variedad caótica sin patrones repetidos.",
      "La geografía de playa y montaña encaja como un lugar real.",
      "La niebla y el cielo tienen gradientes fotográficos, no manchas sintéticas.",
      "No hay texto inventado ni estructuras que se fundan al acercarse.",
    ],
    recommendation:
      "En panorámicas complejas, busca repetición imposible o edificios «derretidos»; si el caos es coherente, puede ser auténtica.",
    evaluationSignals: [
      "chaotic_architecture",
      "coherent_geography",
      "photographic_haze",
      "no_melting_structures",
    ],
  },
  {
    kind: "real",
    n: "04",
    slug: "carette-paris",
    prompt: "¿Mesa de salón de té real o generada por IA?",
    context:
      "«Desayuno en Carette» · 1.1k likes · placemat y envoltorios a la vista.",
    alt: "Mesa de café con chocolate caliente, nata montada, tetera plateada y manteles con logo de Carette Paris.",
    explanation:
      "El branding perfecto hace dudar. Es real: direcciones, tipografía y reflejos de la tetera son coherentes y legibles.",
    signals: [
      "El texto del mantel es legible y coincide con un negocio real (Carette Paris).",
      "Los envoltorios muestran tipografía consistente, no garabatos.",
      "Los reflejos en la tetera deforman el entorno de forma física.",
      "La porcelana y la nata tienen texturas irregulares creíbles.",
    ],
    recommendation:
      "Cuando haya logos y direcciones, comprueba si existen: el texto correcto es una pista fuerte de autenticidad.",
    evaluationSignals: [
      "legible_branding",
      "consistent_labels",
      "physical_reflections",
      "irregular_food_texture",
    ],
  },
  {
    kind: "real",
    n: "05",
    slug: "santa-ventana",
    prompt: "¿Retrato navideño real o generado por IA?",
    context:
      "«Papá Noel en la ventana» · 3.6k compartidos · foto de evento local.",
    alt: "Hombre con barba y gorro rojo de Santa mirando por una ventana, con guirnalda y luces desenfocadas al frente.",
    explanation:
      "Parece campaña publicitaria. Es una foto real: piel, barba y cristal conservan textura fotográfica.",
    signals: [
      "La piel muestra poros y arrugas naturales alrededor de los ojos.",
      "La barba tiene pelos de distinto tono y dirección.",
      "El cristal de la ventana aporta reflejos sutiles coherentes.",
      "La guirnalda del primer plano se desenfoca de forma óptica real.",
    ],
    recommendation:
      "En retratos «de campaña», mira piel y bordes ópticos: la IA suele alisar de más o inventar brillos irreales.",
    evaluationSignals: [
      "natural_skin_texture",
      "varied_beard_hairs",
      "window_reflections",
      "optical_bokeh",
    ],
  },
  {
    kind: "real",
    n: "06",
    slug: "nino-acordeon",
    prompt: "¿Retrato callejero real o generado por IA?",
    context:
      "«Músico en la esquina» · 640 likes · foto tomada de paso.",
    alt: "Niño de pie tocando un acordeón pequeño junto a un cubo naranja sobre baldosas grises.",
    explanation:
      "Algunos detalles del cubo o del instrumento pueden confundir, pero la foto es real: el criterio no es «cualquier rareza = IA».",
    signals: [
      "La postura y el peso del cuerpo sobre el suelo se sienten fotográficos.",
      "La ropa y el calzado muestran texturas y costuras coherentes.",
      "La luz lateral crea sombras duras creíbles en el pavimento.",
      "Aunque haya elementos confusos, no hay anatomía imposible ni texto «falso perfecto».",
    ],
    recommendation:
      "No basta con encontrar un detalle raro: busca un conjunto de fallos sistemáticos (manos, texto, física) antes de concluir que es IA.",
    evaluationSignals: [
      "photographic_stance",
      "coherent_clothing",
      "hard_side_light",
      "no_systematic_artifacts",
    ],
  },
  {
    kind: "real",
    n: "07",
    slug: "partitura-cilindros",
    prompt: "¿Detalle musical real o generado por IA?",
    context:
      "«Regalo de papelería musical» · 180 likes · foto macro casera.",
    alt: "Superficies curvas color crema impresas con pentagramas y notas musicales, con desenfoque progresivo.",
    explanation:
      "La notación puede verse rara en un objeto decorativo, pero la foto es real: el desenfoque óptico y el papel impreso son fotográficos.",
    signals: [
      "Hay un plano nítido y un desenfoque óptico progresivo creíble.",
      "La textura del papel impreso se mantiene al acercarse.",
      "La curvatura de los cilindros deforma las líneas de forma física.",
      "No aparecen claves «flotando» ni brillos sintéticos de render.",
    ],
    recommendation:
      "Distingue el objeto (puede ser decorativo) de la foto: pregunta si la captura es real, no si la partitura es música válida.",
    evaluationSignals: [
      "optical_focus_falloff",
      "print_texture",
      "physical_curve_distortion",
      "no_render_glow",
    ],
  },
  {
    kind: "real",
    n: "08",
    slug: "jarron-hortensias",
    prompt: "¿Bodegón luminoso real o generado por IA?",
    context:
      "«Domingo en casa» · 720 likes · luz de ventana y flores blancas.",
    alt: "Jarrón oscuro con hortensias blancas sobre mantel de cuadros, frente a ventanas claras con jardín difuminado.",
    explanation:
      "La luz alta puede parecer «de IA», pero es una foto real: madera, pétalos y reflejos del cristal se comportan bien.",
    signals: [
      "Los pétalos tienen volumen irregular, no un patrón clonado.",
      "El jarrón muestra ranuras y reflejos metálicos coherentes.",
      "El marco de la ventana tiene imperfecciones de madera real.",
      "El contraluz produce un resplandor óptico, no manchas de artefacto.",
    ],
    recommendation:
      "La sobreexposición sola no prueba IA. Busca patrones repetidos o bordes derretidos antes de decidir.",
    evaluationSignals: [
      "irregular_petals",
      "coherent_vase_reflections",
      "wood_imperfections",
      "optical_backlight",
    ],
  },
  {
    kind: "real",
    n: "09",
    slug: "andamio-obra",
    prompt: "¿Escena de obra real o generada por IA?",
    context:
      "«Así va la calle esta semana» · 1.5k compartidos · foto desde la acera.",
    alt: "Trabajadores con chalecos reflectantes sobre un andamio metálico, con barreras YODOCK en primer plano.",
    explanation:
      "Hay mucha gente y metal: justo donde la IA suele fallar. Esta es real: arneses, texto de barreras y manos cuadrados.",
    signals: [
      "El texto «YODOCK» de las barreras es nítido y correcto.",
      "Los arneses y correas se cruzan de forma coherente, sin derretirse.",
      "Las manos del trabajador que señala tienen anatomía creíble.",
      "El fondo urbano borroso mantiene vehículos y árboles reconocibles.",
    ],
    recommendation:
      "En escenas con mucha gente y estructuras, busca texto legible y correas/manos coherentes: ahí se nota la diferencia.",
    evaluationSignals: [
      "legible_barrier_text",
      "coherent_harnesses",
      "plausible_hands",
      "recognizable_background",
    ],
  },
  {
    kind: "real",
    n: "10",
    slug: "sendero-jardin",
    prompt: "¿Paseo de jardín real o generado por IA?",
    context:
      "«Mañana en el botánico» · 980 likes · foto de espalda en el sendero.",
    alt: "Persona con sombrero de paja caminando por un sendero de grava entre plantas tropicales y palmeras.",
    explanation:
      "Parece escaparate de viaje. Es real: follaje complejo, grava imperfecta y sombras naturales del mediodía.",
    signals: [
      "Las hojas y palmeras tienen texturas no repetitivas.",
      "La grava del camino muestra irregularidades creíbles.",
      "Las sombras del mediodía son duras y coherentes con el sol.",
      "La figura humana tiene proporciones y ropa sin deformaciones.",
    ],
    recommendation:
      "En paisajes «de catálogo», mira el suelo y el follaje de cerca: la IA suele repetir hojas o alisar el terreno.",
    evaluationSignals: [
      "non_repeating_foliage",
      "irregular_gravel",
      "coherent_midday_shadows",
      "plausible_figure",
    ],
  },
];

async function metaFor(kind, n, width) {
  const rel = `/media/real-o-ia/${kind}/imagen-${n}-${width}.webp`;
  const abs = join(root, "public", rel.slice(1));
  const buf = readFileSync(abs);
  const m = await sharp(buf).metadata();
  return {
    src: rel,
    width: m.width,
    height: m.height,
    bytes: buf.byteLength,
    sha256: createHash("sha256").update(buf).digest("hex").toUpperCase(),
  };
}

const items = [];
const indexEntries = [];
const manifestAssets = [];

let sequence = 1;
for (const entry of editorial) {
  const itemId = `real-o-ia-${String(sequence).padStart(3, "0")}`;
  const m480 = await metaFor(entry.kind, entry.n, 480);
  const m768 = await metaFor(entry.kind, entry.n, 768);
  const m1280 = await metaFor(entry.kind, entry.n, 1280);
  const verdict = entry.kind === "ai" ? "ai" : "real";
  const revealed = verdict === "ai" ? "Generada por IA" : "Real";
  const assetId = `real-o-ia-${entry.slug}`;

  const media = {
    kind: "image",
    src: m768.src,
    alt: entry.alt,
    decorative: false,
    width: m768.width,
    height: m768.height,
    fallbackText: `La imagen no está disponible. La pregunta sigue abierta y las pistas educativas se conservan en el feedback.`,
    srcSet: {
      "480": m480.src,
      "768": m768.src,
      "1280": m1280.src,
    },
  };

  items.push({
    itemId,
    gameCode: "real-o-ia",
    mechanic: "image_verdict",
    sequence,
    contentVersion: CONTENT_VERSION,
    editorialStatus: "approved",
    publicItem: {
      gameCode: "real-o-ia",
      mechanic: "image_verdict",
      itemId,
      prompt: entry.prompt,
      context: entry.context,
      media,
      choices: ["real", "ai"],
    },
    feedback: {
      status: "instructive",
      explanation: entry.explanation,
      signals: entry.signals,
      recommendation: entry.recommendation,
      revealedAnswer: revealed,
    },
    solutionPrivate: {
      verdict,
      evaluationSignals: entry.evaluationSignals,
    },
  });

  indexEntries.push({
    itemId,
    assetId,
    assetVersion: "1",
    src: m768.src,
    provisional: false,
    width: m768.width,
    height: m768.height,
    format: "webp",
    bytes: m768.bytes,
    alt: entry.alt,
    fallbackText: media.fallbackText,
    rights: {
      provenanceType: "pexels",
      license: "Pexels License",
      locator: "https://www.pexels.com/",
    },
  });

  manifestAssets.push({
    id: assetId,
    version: "1",
    gameCode: "real-o-ia",
    kind: "image",
    src: m768.src,
    width: m768.width,
    height: m768.height,
    format: "webp",
    bytes: m768.bytes,
    alt: entry.alt,
    decorative: false,
    fallbackText: media.fallbackText,
    responsive: true,
    provisional: false,
    editorialStatus: "approved",
    rights: {
      provenanceType: "pexels",
      license: "Pexels License",
      locator: "https://www.pexels.com/",
    },
    fingerprint: {
      type: "sha256",
      value: m768.sha256,
    },
  });

  sequence += 1;
}

writeFileSync(
  join(root, "src/features/game/content/game-items/real-o-ia.v1.json"),
  `${JSON.stringify(items, null, 2)}\n`,
);

writeFileSync(
  join(root, "public/media/real-o-ia/media-index.v1.json"),
  `${JSON.stringify(
    {
      schemaVersion: 1,
      gameCode: "real-o-ia",
      indexVersion: INDEX_VERSION,
      contentVersion: CONTENT_VERSION,
      notes:
        "Pool editorial Pexels (10 IA + 10 reales) con variantes 480/768/1280. Mencionar Pexels en créditos del arcade. provisional=false.",
      entries: indexEntries,
    },
    null,
    2,
  )}\n`,
);

const manifestPath = join(
  root,
  "src/features/game/content/media-manifest.v1.json",
);
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
manifest.manifestVersion = MANIFEST_VERSION;
manifest.assets = [
  ...manifest.assets.filter((asset) => asset.gameCode !== "real-o-ia"),
  ...manifestAssets,
];
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`Wrote ${items.length} items, ${manifestAssets.length} assets`);
for (const asset of manifestAssets) {
  if (asset.bytes > 1_048_576) {
    console.error("OVER LIMIT", asset.id, asset.bytes);
    process.exitCode = 1;
  }
}
