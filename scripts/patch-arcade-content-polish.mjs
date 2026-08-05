/**
 * Aplica pulido editorial SIFT + media a feed-60, radar y clickbait.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const FLOOD = {
  kind: "image",
  src: "/media/feed-60/avenida-inundada-768.webp",
  alt: "Avenida urbana bajo el agua después de una inundación, con vehículos parcialmente sumergidos.",
  decorative: false,
  width: 768,
  height: 512,
  fallbackText:
    "La imagen no está disponible. La pregunta sigue abierta y las pistas educativas se conservan en el feedback.",
  srcSet: {
    "480": "/media/feed-60/avenida-inundada-480.webp",
    "768": "/media/feed-60/avenida-inundada-768.webp",
    "1280": "/media/feed-60/avenida-inundada-1280.webp",
  },
};

const SMOKE = {
  kind: "image",
  src: "/media/feed-60/incendio-humo-768.webp",
  alt: "Columna de humo denso sobre un paisaje urbano al atardecer.",
  decorative: false,
  width: 768,
  height: 571,
  fallbackText:
    "La imagen no está disponible. La pregunta sigue abierta y las pistas educativas se conservan en el feedback.",
  srcSet: {
    "480": "/media/feed-60/incendio-humo-480.webp",
    "768": "/media/feed-60/incendio-humo-768.webp",
    "1280": "/media/feed-60/incendio-humo-1280.webp",
  },
};

function load(rel) {
  return JSON.parse(readFileSync(join(root, rel), "utf8"));
}

function save(rel, data) {
  writeFileSync(join(root, rel), `${JSON.stringify(data, null, 2)}\n`);
}

// --- Feed 60: F+T first in signals, media on visual posts ---
const feed = load("src/features/game/content/game-items/feed-60.v1.json");
const feedPatches = {
  "feed-60-001": {
    prompt:
      "Practica Buscar cobertura y Rastrear el original. ¿Verificas, compartes o descartas?",
    signals: [
      "Encuentra mejor cobertura: otros medios serios replican la misma campaña de vacunación.",
      "Rastrea el original: el comunicado en minsa.gob.pe es la fuente primaria.",
      "Dominio institucional y fechas concretas, sin urgencia emocional.",
      "Compartir información de servicio verificada ayuda a la comunidad.",
    ],
    verificationHints: [
      "Cobertura: medios serios replican la campaña.",
      "Original: comunicado en minsa.gob.pe.",
      "Fechas y centros de salud concretos.",
    ],
  },
  "feed-60-002": {
    prompt:
      "Practica Buscar cobertura y Rastrear el original. ¿Verificas, compartes o descartas?",
    post: "¡¡ESCÁNDALO!! Celebridad DESTRUYE su carrera en video FILTRADO. No dura nada online.",
    sourceLabel: "farandula-viral.top · sin autor ni fecha",
    signals: [
      "Encuentra mejor cobertura: ningún medio serio reporta el supuesto video.",
      "Rastrea el original: no hay archivo, comunicado ni fuente primaria.",
      "Dominio .top opaco, sin autoría.",
      "Titular 100 % emocional que empuja el clic, no el dato.",
    ],
    verificationHints: [
      "Cobertura: ningún medio serio lo reporta.",
      "Original: no hay video ni fuente primaria.",
      "Dominio .top sin autoría ni fecha.",
    ],
  },
  "feed-60-003": {
    prompt:
      "Practica Buscar cobertura y Rastrear el original. ¿Verificas, compartes o descartas?",
    post: "Así está AHORA el centro de la ciudad, todo inundado. Difundan.",
    sourceLabel: "usuario anónimo · hace 20 min",
    media: FLOOD,
    signals: [
      "Encuentra mejor cobertura: ningún medio reporta inundación en el centro hoy.",
      "Rastrea el original: la búsqueda inversa sitúa la foto en 2018.",
      "«AHORA» y una foto impactante no bastan para afirmar un hecho actual.",
      "La cuenta es anónima y no aporta lugar ni hora verificables.",
    ],
    verificationHints: [
      "Cobertura: ningún medio reporta inundación hoy.",
      "Original: búsqueda inversa sitúa la foto en 2018.",
      "La imagen puede ser real; el contexto no.",
    ],
    explanation:
      "La imagen puede ser real, pero el contexto es falso: proviene de una inundación de 2018 y ningún medio reporta una inundación hoy. Buscar cobertura y rastrear el original lo revelan en segundos.",
  },
  "feed-60-004": {
    prompt:
      "Practica Buscar cobertura y Rastrear el original. ¿Verificas, compartes o descartas?",
    signals: [
      "Encuentra mejor cobertura: el hallazgo aparece en una revista con revisión por pares.",
      "Rastrea el original: el DOI existe y sostiene la afirmación con matices.",
      "Lenguaje prudente, sin promesa milagrosa ni urgencia.",
      "El portal cita un estudio comprobable, no un rumor.",
    ],
    verificationHints: [
      "Cobertura: revista con revisión por pares.",
      "Original: DOI rastreable del estudio.",
      "Lenguaje prudente, sin milagros.",
    ],
  },
  "feed-60-005": {
    prompt:
      "Practica Buscar cobertura y Rastrear el original. ¿Verificas, compartes o descartas?",
    signals: [
      "Encuentra mejor cobertura: verificadores desmintieron esta teoría desde 2021.",
      "Rastrea el original: no hay evidencia primaria, solo anécdota reenviada.",
      "«Un enfermero» anónimo no es una fuente ubicable.",
      "La cadena apela al miedo y pide credibilidad por repetición.",
    ],
    verificationHints: [
      "Cobertura: desmentidos desde 2021.",
      "Original: solo anécdota, cero evidencia primaria.",
      "Apela al miedo, no a datos.",
    ],
  },
  "feed-60-006": {
    prompt:
      "Practica Buscar cobertura y Rastrear el original. ¿Verificas, compartes o descartas?",
    signals: [
      "Encuentra mejor cobertura: no hay cobertura periodística porque no es un hecho.",
      "Rastrea el original: el propio medio aclara en «Acerca de» que es humor.",
      "El escenario absurdo pide una lectura crítica antes de compartirlo como noticia.",
      "Fuera de contexto, la sátira circula como si fuera real.",
    ],
    verificationHints: [
      "Cobertura: no es noticia; es humor.",
      "Original: «Acerca de» declara sátira.",
      "Sin contexto confunde.",
    ],
  },
  "feed-60-007": {
    prompt:
      "Practica Buscar cobertura y Rastrear el original. ¿Verificas, compartes o descartas?",
    signals: [
      "Encuentra mejor cobertura: el comunicado se puede contrastar con el sitio institucional.",
      "Rastrea el original: el comunicado oficial con fecha es la fuente primaria.",
      "bcr.gob.pe es el dominio oficial del Banco Central.",
      "Cifra exacta y lenguaje sin carga emocional.",
    ],
    verificationHints: [
      "Cobertura: coincide con sitio institucional.",
      "Original: comunicado oficial con fecha.",
      "Dato exacto y verificable.",
    ],
  },
  "feed-60-008": {
    prompt:
      "Practica Buscar cobertura y Rastrear el original. ¿Verificas, compartes o descartas?",
    post: "¡El desempleo se DISPARA! Mira este gráfico — y esta foto del «caos» en la ciudad.",
    sourceLabel: "blog-politico.anon",
    media: SMOKE,
    signals: [
      "Encuentra mejor cobertura: series oficiales muestran un cambio pequeño, no un drama.",
      "Rastrea el original: el eje Y truncado y la foto de humo no prueban un salto de desempleo.",
      "El titular grita «DISPARA» antes de mostrar la magnitud real.",
      "Un blog anónimo mezcla gráfico manipulado e imagen impactante sin metodología.",
    ],
    verificationHints: [
      "Cobertura: series oficiales sin eje recortado.",
      "Original: eje truncado + foto fuera de contexto.",
      "Los números existen; la exageración también.",
    ],
    explanation:
      "Los números existen, pero el gráfico manipula la escala y la foto de humo no demuestra el dato. Buscar cobertura oficial y rastrear el original revelan la manipulación visual.",
  },
  "feed-60-009": {
    prompt:
      "Practica Buscar cobertura y Rastrear el original. ¿Verificas, compartes o descartas?",
    signals: [
      "Encuentra mejor cobertura: ninguna marca legítima reparte teléfonos por cadenas.",
      "Rastrea el original: el enlace existe para captar contactos, no para entregar un premio.",
      "Dominio .xyz opaco y recién registrado.",
      "Un premio imposible a cambio de reenviar es la estafa.",
    ],
    verificationHints: [
      "Cobertura: ninguna marca reparte iPhones así.",
      "Original: enlace de captación, no de premio.",
      "Dominio recién registrado.",
    ],
  },
  "feed-60-010": {
    prompt:
      "Practica Buscar cobertura y Rastrear el original. ¿Verificas, compartes o descartas?",
    signals: [
      "Encuentra mejor cobertura: el aviso coincide con la web institucional.",
      "Rastrea el original: el comunicado municipal es la fuente primaria.",
      "muni.gob.pe es la cuenta oficial municipal.",
      "Horario y distritos concretos: información accionable de servicio.",
    ],
    verificationHints: [
      "Cobertura: coincide con la web oficial.",
      "Original: comunicado municipal.",
      "Horario y distritos concretos.",
    ],
  },
};

for (const item of feed) {
  const patch = feedPatches[item.itemId];
  if (!patch) continue;
  if (patch.prompt) item.publicItem.prompt = patch.prompt;
  if (patch.post) item.publicItem.post = patch.post;
  if (patch.sourceLabel) item.publicItem.sourceLabel = patch.sourceLabel;
  if (patch.media) item.publicItem.media = patch.media;
  if (patch.signals) item.feedback.signals = patch.signals;
  if (patch.explanation) item.feedback.explanation = patch.explanation;
  if (patch.verificationHints) {
    item.solutionPrivate.verificationHints = patch.verificationHints;
  }
}
save("src/features/game/content/game-items/feed-60.v1.json", feed);

// --- Radar: mock domains + I/T signals ---
const radar = load(
  "src/features/game/content/game-items/radar-de-fuentes.v1.json",
);
const radarUrlMap = {
  "radar-de-fuentes-002": {
    sourceName: "Agencia de noticias con redactor firmado",
    urlLabel: "https://cables.agencia-norte.news/economia",
    description:
      "Cable con redactor identificado, hora exacta y política pública de correcciones. Señales: autor firmado, timestamp, correcciones visibles.",
    signals: [
      "Investiga: redactor identificado con nombre y cargo.",
      "Rastrea: hora exacta y política pública de correcciones.",
      "Formato de cable con hechos separables de opinión.",
      "Dominio de agencia reconocible, no un clon improvisado.",
    ],
    recommendation:
      "Investiga firmas y rastrea horarios/correcciones: así se ve si la fuente rinde cuentas.",
  },
  "radar-de-fuentes-003": {
    sourceName: "Artículo en revista científica con DOI",
    urlLabel: "https://revistas.cienciaabierta.org/articulo/10.1234/demo",
    description:
      "Estudio con DOI, metodología descrita, revisión por pares y declaración de conflictos. Señales: DOI, peer review, método abierto.",
    signals: [
      "Investiga: DOI, metodología abierta y declaración de conflictos.",
      "Rastrea: la revisión por pares y el identificador permiten localizar el original.",
      "No es un resumen viral sin fuente.",
      "El dominio de revista científica es verificable.",
    ],
    recommendation:
      "En ciencia, investiga método y conflictos; rastrea el DOI antes de aceptar un hallazgo viral.",
  },
  "radar-de-fuentes-004": {
    sourceName: "Blog personal de opinión",
    urlLabel: "https://vozsinfiltro.blog/post/la-verdad-oculta",
    description:
      "Columna de opinión sin fuentes citadas: «Yo digo la verdad que los medios ocultan». Señales: sin fuentes, opinión disfrazada de noticia.",
    signals: [
      "Investiga: no cita fuentes comprobables ni fecha editorial.",
      "Rastrea: no hay origen documental que contrastar.",
      "Tono personal que presenta opinión como si fuera noticia.",
      "Afirma revelar verdades ocultas sin documentarlas.",
    ],
  },
  "radar-de-fuentes-005": {
    sourceName: "Agregador sin autor ni fecha",
    urlLabel: "https://noticiasrapidas24.info/nota/4471",
    description:
      "Texto copiado de otros portales. No firma nadie, no tiene fecha y no enlaza a la fuente original. Señales: sin autor, sin fecha, sin enlaces.",
    signals: [
      "Investiga: sin autor identificable ni fecha de publicación.",
      "Rastrea: no enlaza la fuente original del texto.",
      "El contenido parece reutilizado de otros portales.",
      "No hay a quién pedirle cuentas.",
    ],
    recommendation:
      "Si nadie firma ni data la nota, rastrea el origen antes de compartirla o usarla como prueba.",
  },
  "radar-de-fuentes-006": {
    sourceName: "Cuenta de humor satírico",
    urlLabel: "https://eldiariodelamedialuna.satira",
    description:
      "Noticias inventadas con fines de humor. En «Acerca de» lo declara abiertamente. Señales: sátira declarada.",
    signals: [
      "Investiga: el sitio declara humor o sátira en «Acerca de».",
      "Rastrea: el origen aclara que inventa hechos para reír, no para informar.",
      "Fuera de contexto puede circular como noticia real.",
      "No aporta autoría periodística ni correcciones de hechos.",
    ],
  },
  "radar-de-fuentes-007": {
    sourceName: "Portal de «becas» internacionales",
    urlLabel: "https://unesco-becas2026.premium-forms.xyz",
    description:
      "Imita el logo de la UNESCO, promete dinero y pide DNI más datos bancarios. Señales: dominio .xyz, pide datos bancarios, urgencia.",
    signals: [
      "Investiga: dominio .xyz que imita una marca conocida.",
      "Rastrea: la UNESCO real está en unesco.org, no en este formulario.",
      "Pide DNI y tarjeta para un «registro» de beca.",
      "Urgencia artificial («últimos cupos») típica de phishing.",
    ],
    recommendation:
      "Investiga la barra de direcciones y rastrea el dominio oficial: unesco.org no es unesco-becas2026.premium-forms.xyz.",
  },
  "radar-de-fuentes-008": {
    sourceName: "Diario clonado",
    urlLabel: "https://elpais-internacional.press",
    description:
      "Copia el diseño de un diario famoso, pero el dominio es .press y todas las noticias atacan al mismo partido. Señales: suplantación de marca, sesgo total.",
    signals: [
      "Investiga: el dominio .press no es el del medio que imita.",
      "Rastrea: la marca visual no coincide con la identidad editorial real.",
      "Cobertura sesgada que empuja un único adversario político.",
      "No ofrece una identidad editorial verificable propia.",
    ],
  },
  "radar-de-fuentes-009": {
    sourceName: "Perfil «Noticias Verdaderas Oficial»",
    urlLabel: "https://social.example-net/NoticiasVerdaderas_Oficial",
    description:
      "Cuenta creada hace 3 semanas, foto genérica, publica 40 veces al día y nunca enlaza fuentes. Señales: cuenta nueva, volumen extremo, cero fuentes.",
    signals: [
      "Investiga: cuenta creada hace pocas semanas con identidad genérica.",
      "Rastrea: nunca enlaza fuentes comprobables; el origen se pierde.",
      "Volumen extremo: decenas de publicaciones al día.",
      "Patrón típico de granja de desinformación.",
    ],
  },
  "radar-de-fuentes-001": {
    prompt:
      "Investiga la fuente y rastrea su origen. ¿Dónde la ubicas?",
    signals: [
      "Investiga: dominio institucional unesco.org con autoría clara.",
      "Rastrea: fecha y referencias a documentos oficiales contrastables.",
      "El contenido aparece firmado por la institución.",
      "Las referencias permiten volver al documento primario.",
    ],
    recommendation:
      "Cuando dominio, autor, fecha y referencias cuadran, puedes usarla como punto de partida verificable.",
  },
};

for (const item of radar) {
  item.publicItem.prompt =
    "Investiga la fuente y rastrea su origen. ¿Dónde la ubicas?";
  const patch = radarUrlMap[item.itemId];
  if (!patch) continue;
  if (patch.sourceName) item.publicItem.sourceName = patch.sourceName;
  if (patch.urlLabel) item.publicItem.urlLabel = patch.urlLabel;
  if (patch.description) item.publicItem.description = patch.description;
  if (patch.signals) item.feedback.signals = patch.signals;
  if (patch.recommendation) item.feedback.recommendation = patch.recommendation;
}
save("src/features/game/content/game-items/radar-de-fuentes.v1.json", radar);

// --- Clickbait: S+I signals, less green copy ---
const clickbait = load(
  "src/features/game/content/game-items/clickbait-swipe.v1.json",
);
const clickbaitPatches = {
  "clickbait-swipe-001": {
    prompt: "Frena el clic e investiga el titular. ¿Periodismo o clickbait?",
    headline:
      "Médicos «odian» este truco casero: bajar 10 kilos en 7 días sin dietas",
    sourceLabel: "saludmilagrosa.shop",
    signals: [
      "Frena: urgencia y promesa milagrosa empujan el clic antes de leer.",
      "Investiga: «los médicos» no tienen nombre, estudio ni fuente.",
      "Mayúsculas emocionales y enemigo inventado sustituyen al dato.",
      "Bajar 10 kilos en una semana no es un hecho verificable.",
    ],
    recommendation:
      "Frena el clic e investiga si hay estudio firmado; si solo hay milagro, sal.",
  },
  "clickbait-swipe-002": {
    prompt: "Frena el clic e investiga el titular. ¿Periodismo o clickbait?",
    headline:
      "Banco Central sube la tasa de interés 0,25 puntos por inflación",
    sourceLabel: "diarioeconomia.pe",
    signals: [
      "Frena la sospecha automática: el tono es informativo, no un cebo.",
      "Investiga: actor (Banco Central), cifra (0,25) y causa (inflación).",
      "Sin mayúsculas ni urgencia fabricada.",
      "El titular entrega el hecho completo para contrastarlo.",
    ],
  },
  "clickbait-swipe-003": {
    prompt: "Frena el clic e investiga el titular. ¿Periodismo o clickbait?",
    headline: "Lo que hizo esta niña dejó a todos en shock (video)",
    sourceLabel: "clipsvirales.blog",
    signals: [
      "Frena: el curiosity gap esconde el hecho para forzar el clic.",
      "Investiga: no hay quién, dónde, cuándo ni qué ocurrió.",
      "«En shock» te dice qué sentir, no qué pasó.",
      "Promesa de video sin fuente identificable.",
    ],
  },
  "clickbait-swipe-004": {
    prompt: "Frena el clic e investiga el titular. ¿Periodismo o clickbait?",
    sourceLabel: "portalciudadano.gob.pe",
  },
  "clickbait-swipe-005": {
    prompt: "Frena el clic e investiga el titular. ¿Periodismo o clickbait?",
    headline: "No vas a creer lo que encontraron en el agua de tu ciudad",
    sourceLabel: "alertavecinal.info",
    signals: [
      "Frena: el miedo local busca una reacción inmediata.",
      "Investiga: «lo que encontraron» oculta el hallazgo concreto.",
      "No hay autoridad, cifra ni fecha del supuesto informe.",
      "«Tu ciudad» finge cercanía sin pruebas.",
    ],
  },
  "clickbait-swipe-006": {
    prompt: "Frena el clic e investiga el titular. ¿Periodismo o clickbait?",
    sourceLabel: "agencianoticias.pe",
  },
  "clickbait-swipe-007": {
    prompt: "Frena el clic e investiga el titular. ¿Periodismo o clickbait?",
    sourceLabel: "testsvirales.fun",
    signals: [
      "Frena: el cebo de ego («¿eres del 1%?») quiere tu clic, no tu dato.",
      "Investiga: la estadística del 99% no es verificable.",
      "El «test» suele existir para retenerte con anuncios.",
      "Pregunta retórica en lugar de hecho informativo.",
    ],
  },
  "clickbait-swipe-008": {
    prompt: "Frena el clic e investiga el titular. ¿Periodismo o clickbait?",
    sourceLabel: "agencia-reuters.style",
    signals: [
      "Frena la duda automática: cifra + fuente oficial suelen ser periodismo.",
      "Investiga: 3,1% anual atribuido al instituto de estadística.",
      "Hecho cerrado en pasado, sin dramatización.",
      "Fácil de contrastar en el comunicado oficial.",
    ],
  },
  "clickbait-swipe-009": {
    prompt: "Frena el clic e investiga el titular. ¿Periodismo o clickbait?",
    sourceLabel: "farandulatotal.tv",
    signals: [
      "Frena: verbos de guerra («destruye», «enloquece») fabrican combate.",
      "Investiga: no dice qué dijo el actor ni qué criticó.",
      "Mayúsculas amplifican el drama sin aportar cita.",
      "«El internet» aparece como personaje, no como fuente.",
    ],
  },
  "clickbait-swipe-010": {
    prompt: "Frena el clic e investiga el titular. ¿Periodismo o clickbait?",
    sourceLabel: "portalviajero.net",
  },
  "clickbait-swipe-011": {
    prompt: "Frena el clic e investiga el titular. ¿Periodismo o clickbait?",
    sourceLabel: "secretossalud.top",
    signals: [
      "Frena: «matándote» sin evidencia es miedo fabricado.",
      "Investiga: no nombra la fruta, el estudio ni el riesgo medible.",
      "«Y no lo sabes» finge un secreto revelado.",
      "La salud es un nicho favorito del clickbait porque baja la guardia.",
    ],
  },
  "clickbait-swipe-012": {
    prompt: "Frena el clic e investiga el titular. ¿Periodismo o clickbait?",
    sourceLabel: "deportesdiario.pe",
  },
};

for (const item of clickbait) {
  const patch = clickbaitPatches[item.itemId];
  if (!patch) continue;
  if (patch.prompt) item.publicItem.prompt = patch.prompt;
  if (patch.headline) item.publicItem.headline = patch.headline;
  if (patch.sourceLabel) item.publicItem.sourceLabel = patch.sourceLabel;
  if (patch.signals) item.feedback.signals = patch.signals;
  if (patch.recommendation) item.feedback.recommendation = patch.recommendation;
}
save(
  "src/features/game/content/game-items/clickbait-swipe.v1.json",
  clickbait,
);

// Refresh political clip asset from a clearer speaking photo
const clipUrl =
  "https://images.pexels.com/photos/6950215/pexels-photo-6950215.jpeg?auto=compress&cs=tinysrgb&w=1600";
const clipRes = await fetch(clipUrl, {
  headers: { "User-Agent": "AntidotoArcadeMediaBot/1.0" },
});
if (clipRes.ok) {
  const source = Buffer.from(await clipRes.arrayBuffer());
  const outDir = join(root, "public/media/grupo");
  let m768 = null;
  for (const width of [480, 768, 1280]) {
    const buf = await sharp(source)
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 78 })
      .toBuffer();
    writeFileSync(join(outDir, `clip-politico-${width}.webp`), buf);
    if (width === 768) {
      const meta = await sharp(buf).metadata();
      m768 = {
        width: meta.width,
        height: meta.height,
        bytes: buf.byteLength,
        sha256: createHash("sha256").update(buf).digest("hex").toUpperCase(),
      };
    }
  }
  const manifestPath = join(
    root,
    "src/features/game/content/media-manifest.v1.json",
  );
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const asset = manifest.assets.find((a) => a.id === "grupo-clip-politico");
  if (asset && m768) {
    asset.width = m768.width;
    asset.height = m768.height;
    asset.bytes = m768.bytes;
    asset.fingerprint.value = m768.sha256;
    asset.rights.locator =
      "https://www.pexels.com/photo/woman-giving-speech-6950215/";
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  }
  // Update grupo pack dimensions if needed
  const grupo = load("src/features/game/content/game-items/grupo.v1.json");
  for (const item of grupo) {
    for (const message of item.publicItem.messages) {
      if (message.media?.src?.includes("clip-politico") && m768) {
        message.media.width = m768.width;
        message.media.height = m768.height;
      }
    }
  }
  save("src/features/game/content/game-items/grupo.v1.json", grupo);
  console.log("Refreshed political clip asset");
} else {
  console.warn("Could not refresh political clip:", clipRes.status);
}

console.log("Patched feed-60, radar-de-fuentes, clickbait-swipe");
