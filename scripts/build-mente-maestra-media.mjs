/**
 * Genera ilustraciones webp para el paso evidence de Mente Maestra.
 */
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const MANIFEST_VERSION = "2026-08-04.3";
const WIDTHS = [480, 768];
const FALLBACK =
  "La imagen ilustrativa no está disponible. La lección de la autopsia se conserva en el texto.";

const SCENES = [
  {
    id: "mente-maestra-recycled-photo",
    optionId: "evidence-recycled-photo",
    fileBase: "foto-reciclada",
    alt: "Calle inundada usada como ejemplo de foto real reciclada fuera de contexto.",
    // Same urban flood source as grupo-rio-inundacion (verified Pexels 25189241)
    url: "https://images.pexels.com/photos/25189241/pexels-photo-25189241.jpeg?auto=compress&cs=tinysrgb&w=1200",
    locator: "https://www.pexels.com/photo/flood-on-street-in-city-in-india-25189241/",
  },
  {
    id: "mente-maestra-ai-image",
    optionId: "evidence-ai-image",
    fileBase: "imagen-ia",
    alt: "Paisaje hiperestilizado usado como ejemplo de imagen sintética a inspeccionar.",
    // Dramatic industrial haze at dusk — Pexels photo 221012
    url: "https://images.pexels.com/photos/221012/pexels-photo-221012.jpeg?auto=compress&cs=tinysrgb&w=1200",
    locator: "https://www.pexels.com/photo/221012/",
  },
  {
    id: "mente-maestra-fake-expert",
    optionId: "evidence-fake-expert",
    fileBase: "experto-falso",
    alt: "Persona con bata blanca usada como ejemplo de «experto» sin identidad verificable.",
    url: "https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=1200",
    locator: "https://www.pexels.com/photo/doctor-holding-a-stethoscope-5452201/",
  },
  {
    id: "mente-maestra-truncated-axis",
    optionId: "evidence-truncated-axis",
    fileBase: "eje-truncado",
    alt: "Gráfico de barras usado como ejemplo de visualización que conviene revisar en los ejes.",
    url: "https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=1200",
    locator: "https://www.pexels.com/photo/person-pointing-paper-line-graph-590022/",
  },
];

async function download(url) {
  const response = await fetch(url, {
    headers: { "User-Agent": "AntidotoArcadeMediaBot/1.0" },
  });
  if (!response.ok) throw new Error(`Download failed ${response.status}: ${url}`);
  return Buffer.from(await response.arrayBuffer());
}

const outDir = join(root, "public/media/mente-maestra");
mkdirSync(outDir, { recursive: true });

const mediaByOptionId = {};
const manifestAssets = [];

for (const scene of SCENES) {
  console.log(`Fetching ${scene.id}...`);
  const source = await download(scene.url);
  const variants = {};
  for (const width of WIDTHS) {
    const rel = `/media/mente-maestra/${scene.fileBase}-${width}.webp`;
    const abs = join(root, "public", rel.slice(1));
    const buf = await sharp(source)
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 78 })
      .toBuffer();
    writeFileSync(abs, buf);
    const meta = await sharp(buf).metadata();
    variants[width] = {
      src: rel,
      width: meta.width,
      height: meta.height,
      bytes: buf.byteLength,
      sha256: createHash("sha256").update(buf).digest("hex").toUpperCase(),
    };
  }
  const m768 = variants[768];
  mediaByOptionId[scene.optionId] = {
    kind: "image",
    src: m768.src,
    alt: scene.alt,
    decorative: false,
    width: m768.width,
    height: m768.height,
    fallbackText: FALLBACK,
    srcSet: { "480": variants[480].src, "768": m768.src },
  };
  manifestAssets.push({
    id: scene.id,
    version: "1",
    gameCode: "mente-maestra",
    kind: "image",
    src: m768.src,
    width: m768.width,
    height: m768.height,
    format: "webp",
    bytes: m768.bytes,
    alt: scene.alt,
    decorative: false,
    fallbackText: FALLBACK,
    responsive: true,
    provisional: false,
    editorialStatus: "approved",
    rights: {
      provenanceType: "pexels",
      license: "Pexels License",
      locator: scene.locator,
    },
    fingerprint: { type: "sha256", value: m768.sha256 },
  });
}

const indexPath = join(root, "public/media/mente-maestra/media-index.v1.json");
writeFileSync(
  indexPath,
  `${JSON.stringify(
    {
      schemaVersion: 1,
      gameCode: "mente-maestra",
      indexVersion: MANIFEST_VERSION,
      notes: "Ilustraciones Pexels para el paso evidence. provisional=false.",
      mediaByOptionId,
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
  ...manifest.assets.filter((asset) => asset.gameCode !== "mente-maestra"),
  ...manifestAssets,
];
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`Wrote ${manifestAssets.length} mente-maestra assets`);
