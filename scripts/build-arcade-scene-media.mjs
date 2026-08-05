/**
 * Descarga fotos Pexels, genera variantes webp y actualiza el media-manifest
 * para escenas de El Grupo y Feed 60”.
 */
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const MANIFEST_VERSION = "2026-08-04.3";
const WIDTHS = [480, 768, 1280];

const FALLBACK =
  "La imagen no está disponible. La pregunta sigue abierta y las pistas educativas se conservan en el feedback.";

/**
 * Fuentes Pexels con licencia permisiva; se citan en rights.locator.
 * IDs verificados visualmente (los IDs antiguos apuntaban a castillo/tornado/hoguera).
 */
const SCENES = [
  {
    id: "grupo-rio-inundacion",
    gameCode: "grupo",
    folder: "grupo",
    fileBase: "rio-inundacion",
    alt: "Calle inundada junto a un río crecido, con agua cubriendo la calzada y edificios al fondo.",
    // Flooded urban street — Pexels photo 25189241
    url: "https://images.pexels.com/photos/25189241/pexels-photo-25189241.jpeg?auto=compress&cs=tinysrgb&w=1600",
    locator: "https://www.pexels.com/photo/flood-on-street-in-city-in-india-25189241/",
  },
  {
    id: "grupo-clip-politico",
    gameCode: "grupo",
    folder: "grupo",
    fileBase: "clip-politico",
    alt: "Persona hablando ante un atril con micrófonos en un acto público; fotograma de un clip corto.",
    // Speaker at podium — Pexels photo 6950215
    url: "https://images.pexels.com/photos/6950215/pexels-photo-6950215.jpeg?auto=compress&cs=tinysrgb&w=1600",
    locator: "https://www.pexels.com/photo/woman-giving-speech-6950215/",
  },
  {
    id: "feed-60-avenida-inundada",
    gameCode: "feed-60",
    folder: "feed-60",
    fileBase: "avenida-inundada",
    alt: "Avenida urbana bajo el agua después de una inundación, con vehículos parcialmente sumergidos.",
    // Cars on flooded street — Pexels photo 26202090
    url: "https://images.pexels.com/photos/26202090/pexels-photo-26202090.jpeg?auto=compress&cs=tinysrgb&w=1600",
    locator: "https://www.pexels.com/photo/cars-on-street-in-water-during-flood-26202090/",
  },
  {
    id: "feed-60-incendio-humo",
    gameCode: "feed-60",
    folder: "feed-60",
    fileBase: "incendio-humo",
    alt: "Columna de humo denso sobre un paisaje urbano al atardecer.",
    // Industrial smoke / haze at dusk — Pexels photo 221012
    url: "https://images.pexels.com/photos/221012/pexels-photo-221012.jpeg?auto=compress&cs=tinysrgb&w=1600",
    locator: "https://www.pexels.com/photo/221012/",
  },
];

async function download(url) {
  const response = await fetch(url, {
    headers: { "User-Agent": "AntidotoArcadeMediaBot/1.0" },
  });
  if (!response.ok) {
    throw new Error(`Download failed ${response.status}: ${url}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

async function writeVariants(scene, sourceBuffer) {
  const outDir = join(root, "public", "media", scene.folder);
  mkdirSync(outDir, { recursive: true });

  const variants = {};
  for (const width of WIDTHS) {
    const rel = `/media/${scene.folder}/${scene.fileBase}-${width}.webp`;
    const abs = join(root, "public", rel.slice(1));
    const buf = await sharp(sourceBuffer)
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
  return variants;
}

function publicMedia(scene, variants) {
  const m768 = variants[768];
  return {
    kind: "image",
    src: m768.src,
    alt: scene.alt,
    decorative: false,
    width: m768.width,
    height: m768.height,
    fallbackText: FALLBACK,
    srcSet: {
      "480": variants[480].src,
      "768": variants[768].src,
      "1280": variants[1280].src,
    },
  };
}

const manifestAssets = [];
const mediaById = {};

for (const scene of SCENES) {
  console.log(`Fetching ${scene.id}...`);
  const source = await download(scene.url);
  const variants = await writeVariants(scene, source);
  const media = publicMedia(scene, variants);
  mediaById[scene.id] = media;

  const m768 = variants[768];
  manifestAssets.push({
    id: scene.id,
    version: "1",
    gameCode: scene.gameCode,
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
    fingerprint: {
      type: "sha256",
      value: m768.sha256,
    },
  });
}

const manifestPath = join(
  root,
  "src/features/game/content/media-manifest.v1.json",
);
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
manifest.manifestVersion = MANIFEST_VERSION;
const keep = manifest.assets.filter(
  (asset) => asset.gameCode !== "grupo" && asset.gameCode !== "feed-60",
);
manifest.assets = [...keep, ...manifestAssets];
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

const indexPath = join(root, "public/media/arcade-scene-media-index.v1.json");
writeFileSync(
  indexPath,
  `${JSON.stringify(
    {
      schemaVersion: 1,
      indexVersion: MANIFEST_VERSION,
      notes:
        "Escenas Pexels para El Grupo y Feed 60”. Variantes 480/768/1280. provisional=false.",
      mediaById,
    },
    null,
    2,
  )}\n`,
);

/** Keep inline PublicMedia in game packs aligned with regenerated variants. */
function syncPackMedia(relPath, fileBases) {
  const abs = join(root, relPath);
  const pack = JSON.parse(readFileSync(abs, "utf8"));
  let touched = 0;
  for (const item of pack) {
    const publicItem = item.publicItem ?? item;
    const mediaSlots = [];
    if (publicItem.media) mediaSlots.push(publicItem.media);
    if (Array.isArray(publicItem.messages)) {
      for (const message of publicItem.messages) {
        if (message.media) mediaSlots.push(message.media);
      }
    }
    for (const media of mediaSlots) {
      const src = media?.src ?? "";
      for (const scene of SCENES) {
        if (!fileBases.has(scene.fileBase)) continue;
        if (!src.includes(`/${scene.fileBase}-`)) continue;
        const next = mediaById[scene.id];
        if (!next) continue;
        media.src = next.src;
        media.alt = next.alt;
        media.width = next.width;
        media.height = next.height;
        media.srcSet = { ...next.srcSet };
        media.fallbackText = next.fallbackText;
        media.decorative = next.decorative;
        media.kind = next.kind;
        touched += 1;
      }
    }
  }
  writeFileSync(abs, `${JSON.stringify(pack, null, 2)}\n`);
  console.log(`Synced ${touched} media slots in ${relPath}`);
}

syncPackMedia("src/features/game/content/game-items/grupo.v1.json", new Set(["rio-inundacion", "clip-politico"]));
syncPackMedia(
  "src/features/game/content/game-items/feed-60.v1.json",
  new Set(["avenida-inundada", "incendio-humo"]),
);

console.log(`Wrote ${manifestAssets.length} scene assets`);
for (const asset of manifestAssets) {
  if (asset.bytes > 1_048_576) {
    console.error("OVER LIMIT", asset.id, asset.bytes);
    process.exitCode = 1;
  }
}
