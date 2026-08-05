/**
 * Genera supabase/seed-content.sql desde los packs JSON editoriales.
 * Fuente normativa: src/features/game/content/game-items/*.v1.json
 */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const contentDir = join(root, "src/features/game/content/game-items");
const packs = [
  "real-o-ia.v1.json",
  "grupo.v1.json",
  "clickbait-swipe.v1.json",
  "radar-de-fuentes.v1.json",
  "feed-60.v1.json",
  "mente-maestra.v1.json",
];

function editorialUuid(editorialItemId) {
  const hex = createHash("md5")
    .update(`antidoto-item:${editorialItemId}`, "utf8")
    .digest("hex");
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join("-");
}

function sqlString(value) {
  if (value === null || value === undefined) return "null";
  return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlJson(value) {
  return sqlString(JSON.stringify(value));
}

const items = packs.flatMap((file) =>
  JSON.parse(readFileSync(join(contentDir, file), "utf8")),
);

const lines = [
  "-- Generado por scripts/generate-arcade-content-seed.mjs — no editar a mano.",
  "-- Materializa packs editoriales aprobados en private_arcade.",
  "",
];

for (const item of items) {
  if (item.editorialStatus !== "approved") continue;

  const itemId = editorialUuid(item.itemId);
  const publicPayload = item.publicItem;
  const nestedMessageMedia = Array.isArray(publicPayload.messages)
    ? publicPayload.messages.find((message) => message?.media)?.media
    : null;
  const media = publicPayload.media ?? nestedMessageMedia ?? { kind: "none" };

  lines.push(`insert into private_arcade.game_items (
  item_id, game_code, mechanic, sequence, prompt, public_payload,
  content_version, editorial_status, editorial_item_id
) values (
  '${itemId}'::uuid,
  ${sqlString(item.gameCode)},
  ${sqlString(item.mechanic)},
  ${Number(item.sequence)},
  ${sqlString(publicPayload.prompt ?? "")},
  ${sqlJson(publicPayload)}::jsonb,
  ${sqlString(item.contentVersion)},
  'approved',
  ${sqlString(item.itemId)}
) on conflict (item_id) do update set
  prompt = excluded.prompt,
  public_payload = excluded.public_payload,
  content_version = excluded.content_version,
  editorial_status = excluded.editorial_status,
  editorial_item_id = excluded.editorial_item_id,
  updated_at = now();`);

  lines.push(`insert into private_arcade.item_feedback (
  item_id, status, explanation, signals, recommendation, revealed_answer
) values (
  '${itemId}'::uuid,
  ${sqlString(item.feedback.status)},
  ${sqlString(item.feedback.explanation)},
  ${sqlJson(item.feedback.signals)}::jsonb,
  ${sqlString(item.feedback.recommendation)},
  ${sqlString(item.feedback.revealedAnswer ?? null)}
) on conflict (item_id) do update set
  status = excluded.status,
  explanation = excluded.explanation,
  signals = excluded.signals,
  recommendation = excluded.recommendation,
  revealed_answer = excluded.revealed_answer;`);

  lines.push(`insert into private_arcade.item_solution_private (
  item_id, solution_payload, evaluation_rule
) values (
  '${itemId}'::uuid,
  ${sqlJson(item.solutionPrivate)}::jsonb,
  ${sqlJson({ rule: "domain_mechanics" })}::jsonb
) on conflict (item_id) do update set
  solution_payload = excluded.solution_payload,
  evaluation_rule = excluded.evaluation_rule;`);

  const kind = media.kind ?? "none";
  const decorative =
    media.decorative === true ||
    (kind === "none" && !media.alt && !media.fallbackText);
  const fallbackText =
    media.fallbackText ??
    (kind === "none" ? "Sin media editorial." : null);
  lines.push(`insert into private_arcade.item_media (
  item_id, kind, src, alt, decorative, width, height, fallback_text
) values (
  '${itemId}'::uuid,
  ${sqlString(kind)},
  ${sqlString(media.src ?? null)},
  ${sqlString(media.alt ?? null)},
  ${decorative ? "true" : "false"},
  ${media.width == null ? "null" : Number(media.width)},
  ${media.height == null ? "null" : Number(media.height)},
  ${sqlString(fallbackText)}
) on conflict (item_id) do update set
  kind = excluded.kind,
  src = excluded.src,
  alt = excluded.alt,
  decorative = excluded.decorative,
  width = excluded.width,
  height = excluded.height,
  fallback_text = excluded.fallback_text;`);

  lines.push("");
}

const out = join(root, "supabase/seed-content.sql");
writeFileSync(out, `${lines.join("\n")}\n`, "utf8");
console.log(`Wrote ${out} (${items.length} pack items scanned)`);
