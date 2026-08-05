-- Antidoto Arcade MIL: datos de catálogo para entornos locales.
-- Este archivo contiene datos; el esquema vive en la migración T017.
-- No incluye secretos, soluciones ni respuestas de jugadores.

insert into private_arcade.game_catalog (
  game_code,
  mechanic,
  name,
  objective,
  route,
  content_version,
  available
)
values
  ('real-o-ia', 'image_verdict', '¿Real o IA?', 'Detectar señales visuales de imágenes sintéticas antes de darlas por reales.', '/games/real-o-ia', '2026-07-30.1', true),
  ('grupo', 'group_decision', 'El Grupo', 'Decidir con cuidado si reenviar, verificar o frenar mensajes en un chat familiar.', '/games/grupo', '2026-07-30.1', true),
  ('clickbait-swipe', 'headline_classification', 'Clickbait Swipe', 'Separar titulares periodísticos de clickbait en segundos.', '/games/clickbait-swipe', '2026-07-30.1', true),
  ('radar-de-fuentes', 'source_classification', 'Radar de Fuentes', 'Clasificar fuentes como confiables, dudosas o fraudulentas según señales observables.', '/games/radar-de-fuentes', '2026-07-30.1', true),
  ('feed-60', 'timed_feed', 'Feed 60”', 'Priorizar verificación, compartir o descartar bajo un límite de tiempo autoritativo.', '/games/feed-60', '2026-07-30.1', true),
  ('mente-maestra', 'guided_autopsy', 'Mente Maestra', 'Reconocer técnicas de manipulación desmontando una fake news sin producir daño real.', '/games/mente-maestra', '2026-07-30.1', true)
on conflict (game_code) do update set
  mechanic = excluded.mechanic,
  name = excluded.name,
  objective = excluded.objective,
  route = excluded.route,
  content_version = excluded.content_version,
  available = excluded.available;

-- Packs editoriales: ver seed-content.sql (db.seed.sql_paths en config.toml).
-- Regenerar con: pnpm seed:content
