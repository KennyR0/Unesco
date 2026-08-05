-- Generado por scripts/generate-arcade-content-seed.mjs — no editar a mano.
-- Materializa packs editoriales aprobados en private_arcade.

insert into private_arcade.game_items (
  item_id, game_code, mechanic, sequence, prompt, public_payload,
  content_version, editorial_status, editorial_item_id
) values (
  '23147740-a355-236c-9b09-dc90fa4747df'::uuid,
  'real-o-ia',
  'image_verdict',
  1,
  '¿Paisaje de viaje real o generado por IA?',
  '{"gameCode":"real-o-ia","mechanic":"image_verdict","itemId":"real-o-ia-001","prompt":"¿Paisaje de viaje real o generado por IA?","context":"«Moraine Lake, no exagero» · 18.2k compartidos · subida hace 40 minutos.","media":{"kind":"image","src":"/media/real-o-ia/ai/imagen-01-768.webp","alt":"Lago turquesa entre montañas afiladas, bosque de coníferas a un lado y cielo azul con nubes.","decorative":false,"width":768,"height":434,"fallbackText":"La imagen no está disponible. La pregunta sigue abierta y las pistas educativas se conservan en el feedback.","srcSet":{"480":"/media/real-o-ia/ai/imagen-01-480.webp","768":"/media/real-o-ia/ai/imagen-01-768.webp","1280":"/media/real-o-ia/ai/imagen-01-1280.webp"}},"choices":["real","ai"]}'::jsonb,
  '2026-07-30.1',
  'approved',
  'real-o-ia-001'
) on conflict (item_id) do update set
  prompt = excluded.prompt,
  public_payload = excluded.public_payload,
  content_version = excluded.content_version,
  editorial_status = excluded.editorial_status,
  editorial_item_id = excluded.editorial_item_id,
  updated_at = now();
insert into private_arcade.item_feedback (
  item_id, status, explanation, signals, recommendation, revealed_answer
) values (
  '23147740-a355-236c-9b09-dc90fa4747df'::uuid,
  'instructive',
  'La escena parece una postal imposible de resistir. Fue generada por IA: el paisaje se siente «demasiado perfecto» y aparecen artefactos típicos del modelo.',
  '["En el cielo hay manchas y nubes fragmentadas que no siguen una forma natural.","La saturación y el contraste están empujados de forma uniforme en toda la foto.","El reflejo del agua es casi un espejo perfecto, sin oleaje ni suciedad.","Los árboles del borde se ven dentados y sobreprocesados contra el cielo."]'::jsonb,
  'Ante un paisaje viral «perfecto», busca la ubicación en mapas y compara con fotos de turistas reales antes de compartirla.',
  'Generada por IA'
) on conflict (item_id) do update set
  status = excluded.status,
  explanation = excluded.explanation,
  signals = excluded.signals,
  recommendation = excluded.recommendation,
  revealed_answer = excluded.revealed_answer;
insert into private_arcade.item_solution_private (
  item_id, solution_payload, evaluation_rule
) values (
  '23147740-a355-236c-9b09-dc90fa4747df'::uuid,
  '{"verdict":"ai","evaluationSignals":["sky_artifacts","hyper_saturation","perfect_reflection","overprocessed_edges"]}'::jsonb,
  '{"rule":"domain_mechanics"}'::jsonb
) on conflict (item_id) do update set
  solution_payload = excluded.solution_payload,
  evaluation_rule = excluded.evaluation_rule;
insert into private_arcade.item_media (
  item_id, kind, src, alt, decorative, width, height, fallback_text
) values (
  '23147740-a355-236c-9b09-dc90fa4747df'::uuid,
  'image',
  '/media/real-o-ia/ai/imagen-01-768.webp',
  'Lago turquesa entre montañas afiladas, bosque de coníferas a un lado y cielo azul con nubes.',
  false,
  768,
  434,
  'La imagen no está disponible. La pregunta sigue abierta y las pistas educativas se conservan en el feedback.'
) on conflict (item_id) do update set
  kind = excluded.kind,
  src = excluded.src,
  alt = excluded.alt,
  decorative = excluded.decorative,
  width = excluded.width,
  height = excluded.height,
  fallback_text = excluded.fallback_text;

insert into private_arcade.game_items (
  item_id, game_code, mechanic, sequence, prompt, public_payload,
  content_version, editorial_status, editorial_item_id
) values (
  'e0201df9-6875-ecbb-970f-faca65131281'::uuid,
  'real-o-ia',
  'image_verdict',
  2,
  '¿Foto de campo real o escena generada por IA?',
  '{"gameCode":"real-o-ia","mechanic":"image_verdict","itemId":"real-o-ia-002","prompt":"¿Foto de campo real o escena generada por IA?","context":"«Todos los perros del refugio salieron a correr» · 9.4k likes · historia que se reenvía en grupos.","media":{"kind":"image","src":"/media/real-o-ia/ai/imagen-02-768.webp","alt":"Ocho perros de distintas razas corriendo en fila por un prado verde con un lago al fondo.","decorative":false,"width":768,"height":338,"fallbackText":"La imagen no está disponible. La pregunta sigue abierta y las pistas educativas se conservan en el feedback.","srcSet":{"480":"/media/real-o-ia/ai/imagen-02-480.webp","768":"/media/real-o-ia/ai/imagen-02-768.webp","1280":"/media/real-o-ia/ai/imagen-02-1280.webp"}},"choices":["real","ai"]}'::jsonb,
  '2026-07-30.1',
  'approved',
  'real-o-ia-002'
) on conflict (item_id) do update set
  prompt = excluded.prompt,
  public_payload = excluded.public_payload,
  content_version = excluded.content_version,
  editorial_status = excluded.editorial_status,
  editorial_item_id = excluded.editorial_item_id,
  updated_at = now();
insert into private_arcade.item_feedback (
  item_id, status, explanation, signals, recommendation, revealed_answer
) values (
  'e0201df9-6875-ecbb-970f-faca65131281'::uuid,
  'instructive',
  'Da ternura y parece un reportaje. Es IA: alinear tantas razas a la vez, todas nítidas y «posando» hacia la cámara, es una composición típica de generadores.',
  '["Todos los perros quedan enfocados a la vez en una fila demasiado ordenada.","Las proporciones entre razas grandes y pequeñas se sienten de catálogo.","El fondo de lago y colinas parece un decorado limpio, sin desorden real.","Las sombras y el ritmo de carrera coinciden demasiado entre animales distintos."]'::jsonb,
  'Si una foto de animales «perfectos» se vuelve viral, verifica la cuenta original y busca fotogramas similares con búsqueda inversa.',
  'Generada por IA'
) on conflict (item_id) do update set
  status = excluded.status,
  explanation = excluded.explanation,
  signals = excluded.signals,
  recommendation = excluded.recommendation,
  revealed_answer = excluded.revealed_answer;
insert into private_arcade.item_solution_private (
  item_id, solution_payload, evaluation_rule
) values (
  'e0201df9-6875-ecbb-970f-faca65131281'::uuid,
  '{"verdict":"ai","evaluationSignals":["too_ordered_group","catalog_proportions","clean_backdrop","synced_motion"]}'::jsonb,
  '{"rule":"domain_mechanics"}'::jsonb
) on conflict (item_id) do update set
  solution_payload = excluded.solution_payload,
  evaluation_rule = excluded.evaluation_rule;
insert into private_arcade.item_media (
  item_id, kind, src, alt, decorative, width, height, fallback_text
) values (
  'e0201df9-6875-ecbb-970f-faca65131281'::uuid,
  'image',
  '/media/real-o-ia/ai/imagen-02-768.webp',
  'Ocho perros de distintas razas corriendo en fila por un prado verde con un lago al fondo.',
  false,
  768,
  338,
  'La imagen no está disponible. La pregunta sigue abierta y las pistas educativas se conservan en el feedback.'
) on conflict (item_id) do update set
  kind = excluded.kind,
  src = excluded.src,
  alt = excluded.alt,
  decorative = excluded.decorative,
  width = excluded.width,
  height = excluded.height,
  fallback_text = excluded.fallback_text;

insert into private_arcade.game_items (
  item_id, game_code, mechanic, sequence, prompt, public_payload,
  content_version, editorial_status, editorial_item_id
) values (
  '0f4bc9d8-9a3a-e405-76bd-8934dc9c7dbd'::uuid,
  'real-o-ia',
  'image_verdict',
  3,
  '¿Momento de cafetería real o generado por IA?',
  '{"gameCode":"real-o-ia","mechanic":"image_verdict","itemId":"real-o-ia-003","prompt":"¿Momento de cafetería real o generado por IA?","context":"«Mi barista favorita haciendo latte art» · 6.1k compartidos · se celebra como foto del día.","media":{"kind":"image","src":"/media/real-o-ia/ai/imagen-03-768.webp","alt":"Barista con delantal verde sirviendo latte art en una cafetería con ladrillo visto y pizarra de especiales.","decorative":false,"width":689,"height":419,"fallbackText":"La imagen no está disponible. La pregunta sigue abierta y las pistas educativas se conservan en el feedback.","srcSet":{"480":"/media/real-o-ia/ai/imagen-03-480.webp","768":"/media/real-o-ia/ai/imagen-03-768.webp","1280":"/media/real-o-ia/ai/imagen-03-1280.webp"}},"choices":["real","ai"]}'::jsonb,
  '2026-07-30.1',
  'approved',
  'real-o-ia-003'
) on conflict (item_id) do update set
  prompt = excluded.prompt,
  public_payload = excluded.public_payload,
  content_version = excluded.content_version,
  editorial_status = excluded.editorial_status,
  editorial_item_id = excluded.editorial_item_id,
  updated_at = now();
insert into private_arcade.item_feedback (
  item_id, status, explanation, signals, recommendation, revealed_answer
) values (
  '0f4bc9d8-9a3a-e405-76bd-8934dc9c7dbd'::uuid,
  'instructive',
  'El ambiente se siente cálido y creíble. Es IA: el texto de las pizarras y carteles delata al modelo, que inventa palabras ilegibles.',
  '["La pizarra de especiales mezcla días reales con palabras sin sentido.","Otros carteles del fondo imitan letras pero no forman frases legibles.","Algunos objetos de las estanterías se funden al mirarlos de cerca.","El chorro de leche y la superficie del café se ven demasiado «pintados»."]'::jsonb,
  'Cuando una foto de negocio incluye texto, amplía los carteles: si no se pueden leer, desconfía antes de compartir.',
  'Generada por IA'
) on conflict (item_id) do update set
  status = excluded.status,
  explanation = excluded.explanation,
  signals = excluded.signals,
  recommendation = excluded.recommendation,
  revealed_answer = excluded.revealed_answer;
insert into private_arcade.item_solution_private (
  item_id, solution_payload, evaluation_rule
) values (
  '0f4bc9d8-9a3a-e405-76bd-8934dc9c7dbd'::uuid,
  '{"verdict":"ai","evaluationSignals":["garbled_chalkboard","illegible_signage","melting_objects","painted_liquid"]}'::jsonb,
  '{"rule":"domain_mechanics"}'::jsonb
) on conflict (item_id) do update set
  solution_payload = excluded.solution_payload,
  evaluation_rule = excluded.evaluation_rule;
insert into private_arcade.item_media (
  item_id, kind, src, alt, decorative, width, height, fallback_text
) values (
  '0f4bc9d8-9a3a-e405-76bd-8934dc9c7dbd'::uuid,
  'image',
  '/media/real-o-ia/ai/imagen-03-768.webp',
  'Barista con delantal verde sirviendo latte art en una cafetería con ladrillo visto y pizarra de especiales.',
  false,
  689,
  419,
  'La imagen no está disponible. La pregunta sigue abierta y las pistas educativas se conservan en el feedback.'
) on conflict (item_id) do update set
  kind = excluded.kind,
  src = excluded.src,
  alt = excluded.alt,
  decorative = excluded.decorative,
  width = excluded.width,
  height = excluded.height,
  fallback_text = excluded.fallback_text;

insert into private_arcade.game_items (
  item_id, game_code, mechanic, sequence, prompt, public_payload,
  content_version, editorial_status, editorial_item_id
) values (
  '6c2b011d-a4fb-c284-e954-13f942c85703'::uuid,
  'real-o-ia',
  'image_verdict',
  4,
  '¿Foodie real o plato generado por IA?',
  '{"gameCode":"real-o-ia","mechanic":"image_verdict","itemId":"real-o-ia-004","prompt":"¿Foodie real o plato generado por IA?","context":"«Poke bowl del mediodía» · 4.8k likes · luz de estudio y plato impecable.","media":{"kind":"image","src":"/media/real-o-ia/ai/imagen-04-768.webp","alt":"Bowl negro con salmón, aguacate, edamame y arroz, rodeado de palillos y cuencos pequeños sobre fondo oscuro.","decorative":false,"width":768,"height":434,"fallbackText":"La imagen no está disponible. La pregunta sigue abierta y las pistas educativas se conservan en el feedback.","srcSet":{"480":"/media/real-o-ia/ai/imagen-04-480.webp","768":"/media/real-o-ia/ai/imagen-04-768.webp","1280":"/media/real-o-ia/ai/imagen-04-1280.webp"}},"choices":["real","ai"]}'::jsonb,
  '2026-07-30.1',
  'approved',
  'real-o-ia-004'
) on conflict (item_id) do update set
  prompt = excluded.prompt,
  public_payload = excluded.public_payload,
  content_version = excluded.content_version,
  editorial_status = excluded.editorial_status,
  editorial_item_id = excluded.editorial_item_id,
  updated_at = now();
insert into private_arcade.item_feedback (
  item_id, status, explanation, signals, recommendation, revealed_answer
) values (
  '6c2b011d-a4fb-c284-e954-13f942c85703'::uuid,
  'instructive',
  'Parece publicidad de restaurante. Es IA: el arroz y el corte «perfecto» del aguacate son señales clásicas de comida sintética.',
  '["Los granos de arroz se ven tubulares y demasiado uniformes.","Las láminas de aguacate están cortadas con simetría de catálogo.","La luz dramática deja todo brillante sin manchas ni irregularidades reales.","Los bordes del pescado y las semillas se repiten con un patrón demasiado limpio."]'::jsonb,
  'En fotos de comida hiperestilizadas, busca texturas imperfectas (granos, brillos irregulares) antes de creer que es una foto casera.',
  'Generada por IA'
) on conflict (item_id) do update set
  status = excluded.status,
  explanation = excluded.explanation,
  signals = excluded.signals,
  recommendation = excluded.recommendation,
  revealed_answer = excluded.revealed_answer;
insert into private_arcade.item_solution_private (
  item_id, solution_payload, evaluation_rule
) values (
  '6c2b011d-a4fb-c284-e954-13f942c85703'::uuid,
  '{"verdict":"ai","evaluationSignals":["unnatural_rice","perfect_avocado_fan","studio_cleanliness","repetitive_garnish"]}'::jsonb,
  '{"rule":"domain_mechanics"}'::jsonb
) on conflict (item_id) do update set
  solution_payload = excluded.solution_payload,
  evaluation_rule = excluded.evaluation_rule;
insert into private_arcade.item_media (
  item_id, kind, src, alt, decorative, width, height, fallback_text
) values (
  '6c2b011d-a4fb-c284-e954-13f942c85703'::uuid,
  'image',
  '/media/real-o-ia/ai/imagen-04-768.webp',
  'Bowl negro con salmón, aguacate, edamame y arroz, rodeado de palillos y cuencos pequeños sobre fondo oscuro.',
  false,
  768,
  434,
  'La imagen no está disponible. La pregunta sigue abierta y las pistas educativas se conservan en el feedback.'
) on conflict (item_id) do update set
  kind = excluded.kind,
  src = excluded.src,
  alt = excluded.alt,
  decorative = excluded.decorative,
  width = excluded.width,
  height = excluded.height,
  fallback_text = excluded.fallback_text;

insert into private_arcade.game_items (
  item_id, game_code, mechanic, sequence, prompt, public_payload,
  content_version, editorial_status, editorial_item_id
) values (
  '470f6b5e-7575-3b76-184c-de0629698805'::uuid,
  'real-o-ia',
  'image_verdict',
  5,
  '¿Cena en trattoria real o generada por IA?',
  '{"gameCode":"real-o-ia","mechanic":"image_verdict","itemId":"real-o-ia-005","prompt":"¿Cena en trattoria real o generada por IA?","context":"«Cena con la nonna en Roma» · 11k compartidos · historia sentimental adjunta.","media":{"kind":"image","src":"/media/real-o-ia/ai/imagen-05-768.webp","alt":"Mujer sonriente con delantal floral alzando un tenedor de espagueti en un restaurante con paredes de ladrillo.","decorative":false,"width":768,"height":468,"fallbackText":"La imagen no está disponible. La pregunta sigue abierta y las pistas educativas se conservan en el feedback.","srcSet":{"480":"/media/real-o-ia/ai/imagen-05-480.webp","768":"/media/real-o-ia/ai/imagen-05-768.webp","1280":"/media/real-o-ia/ai/imagen-05-1280.webp"}},"choices":["real","ai"]}'::jsonb,
  '2026-07-30.1',
  'approved',
  'real-o-ia-005'
) on conflict (item_id) do update set
  prompt = excluded.prompt,
  public_payload = excluded.public_payload,
  content_version = excluded.content_version,
  editorial_status = excluded.editorial_status,
  editorial_item_id = excluded.editorial_item_id,
  updated_at = now();
insert into private_arcade.item_feedback (
  item_id, status, explanation, signals, recommendation, revealed_answer
) values (
  '470f6b5e-7575-3b76-184c-de0629698805'::uuid,
  'instructive',
  'La emoción vende la historia. Es IA: manos, pasta y cuadros del fondo fallan al mirarlos con calma.',
  '["Los dedos de la mano sobre la mesa se ven gruesos o fusionados.","El agarre del tenedor no encaja del todo con la anatomía de la mano.","Los espaguetis del tenedor se funden en un solo bloque.","Los cuadros del fondo imitan fotos o mapas sin detalle legible."]'::jsonb,
  'En retratos íntimos virales, revisa manos y objetos en contacto: ahí suelen aparecer los fallos de la IA.',
  'Generada por IA'
) on conflict (item_id) do update set
  status = excluded.status,
  explanation = excluded.explanation,
  signals = excluded.signals,
  recommendation = excluded.recommendation,
  revealed_answer = excluded.revealed_answer;
insert into private_arcade.item_solution_private (
  item_id, solution_payload, evaluation_rule
) values (
  '470f6b5e-7575-3b76-184c-de0629698805'::uuid,
  '{"verdict":"ai","evaluationSignals":["fused_fingers","awkward_grip","melted_pasta","illegible_wall_art"]}'::jsonb,
  '{"rule":"domain_mechanics"}'::jsonb
) on conflict (item_id) do update set
  solution_payload = excluded.solution_payload,
  evaluation_rule = excluded.evaluation_rule;
insert into private_arcade.item_media (
  item_id, kind, src, alt, decorative, width, height, fallback_text
) values (
  '470f6b5e-7575-3b76-184c-de0629698805'::uuid,
  'image',
  '/media/real-o-ia/ai/imagen-05-768.webp',
  'Mujer sonriente con delantal floral alzando un tenedor de espagueti en un restaurante con paredes de ladrillo.',
  false,
  768,
  468,
  'La imagen no está disponible. La pregunta sigue abierta y las pistas educativas se conservan en el feedback.'
) on conflict (item_id) do update set
  kind = excluded.kind,
  src = excluded.src,
  alt = excluded.alt,
  decorative = excluded.decorative,
  width = excluded.width,
  height = excluded.height,
  fallback_text = excluded.fallback_text;

insert into private_arcade.game_items (
  item_id, game_code, mechanic, sequence, prompt, public_payload,
  content_version, editorial_status, editorial_item_id
) values (
  '8ad190a1-c6c2-2e19-3bd2-2fe88572a954'::uuid,
  'real-o-ia',
  'image_verdict',
  6,
  '¿Calle turística real o escenario generado por IA?',
  '{"gameCode":"real-o-ia","mechanic":"image_verdict","itemId":"real-o-ia-006","prompt":"¿Calle turística real o escenario generado por IA?","context":"«La calle más colorida del mundo» · 22k compartidos · sin ubicación exacta.","media":{"kind":"image","src":"/media/real-o-ia/ai/imagen-06-768.webp","alt":"Calle empedrada flanqueada por casas de colores muy vivos bajo un cielo azul intenso.","decorative":false,"width":768,"height":434,"fallbackText":"La imagen no está disponible. La pregunta sigue abierta y las pistas educativas se conservan en el feedback.","srcSet":{"480":"/media/real-o-ia/ai/imagen-06-480.webp","768":"/media/real-o-ia/ai/imagen-06-768.webp","1280":"/media/real-o-ia/ai/imagen-06-1280.webp"}},"choices":["real","ai"]}'::jsonb,
  '2026-07-30.1',
  'approved',
  'real-o-ia-006'
) on conflict (item_id) do update set
  prompt = excluded.prompt,
  public_payload = excluded.public_payload,
  content_version = excluded.content_version,
  editorial_status = excluded.editorial_status,
  editorial_item_id = excluded.editorial_item_id,
  updated_at = now();
insert into private_arcade.item_feedback (
  item_id, status, explanation, signals, recommendation, revealed_answer
) values (
  '8ad190a1-c6c2-2e19-3bd2-2fe88572a954'::uuid,
  'instructive',
  'Parece el destino soñado de cualquier feed de viajes. Es IA: saturación extrema, vacío total y texturas demasiado limpias.',
  '["Los colores de las fachadas parecen neón uniformes, sin desgaste real.","No hay cables, gente ni desorden típico de una calle habitada.","El cielo es un azul plano, sin variación ni contaminación visual.","Las sombras son duras y perfectas, como en un render."]'::jsonb,
  'Si una calle «más colorida del mundo» no trae ubicación verificable, busca referencias geográficas antes de reenviar.',
  'Generada por IA'
) on conflict (item_id) do update set
  status = excluded.status,
  explanation = excluded.explanation,
  signals = excluded.signals,
  recommendation = excluded.recommendation,
  revealed_answer = excluded.revealed_answer;
insert into private_arcade.item_solution_private (
  item_id, solution_payload, evaluation_rule
) values (
  '8ad190a1-c6c2-2e19-3bd2-2fe88572a954'::uuid,
  '{"verdict":"ai","evaluationSignals":["neon_facades","sterile_street","flat_sky","render_shadows"]}'::jsonb,
  '{"rule":"domain_mechanics"}'::jsonb
) on conflict (item_id) do update set
  solution_payload = excluded.solution_payload,
  evaluation_rule = excluded.evaluation_rule;
insert into private_arcade.item_media (
  item_id, kind, src, alt, decorative, width, height, fallback_text
) values (
  '8ad190a1-c6c2-2e19-3bd2-2fe88572a954'::uuid,
  'image',
  '/media/real-o-ia/ai/imagen-06-768.webp',
  'Calle empedrada flanqueada por casas de colores muy vivos bajo un cielo azul intenso.',
  false,
  768,
  434,
  'La imagen no está disponible. La pregunta sigue abierta y las pistas educativas se conservan en el feedback.'
) on conflict (item_id) do update set
  kind = excluded.kind,
  src = excluded.src,
  alt = excluded.alt,
  decorative = excluded.decorative,
  width = excluded.width,
  height = excluded.height,
  fallback_text = excluded.fallback_text;

insert into private_arcade.game_items (
  item_id, game_code, mechanic, sequence, prompt, public_payload,
  content_version, editorial_status, editorial_item_id
) values (
  '3781831a-e1fe-4e9c-1f4f-3003bf027485'::uuid,
  'real-o-ia',
  'image_verdict',
  7,
  '¿Foto de costa real o generada por IA?',
  '{"gameCode":"real-o-ia","mechanic":"image_verdict","itemId":"real-o-ia-007","prompt":"¿Foto de costa real o generada por IA?","context":"«Atardecer en el faro» · 7.3k likes · se comparte como postal del norte.","media":{"kind":"image","src":"/media/real-o-ia/ai/imagen-07-768.webp","alt":"Faro blanco junto a casas de techo rojo sobre rocas oscuras, con oleaje y cielo rosado al atardecer.","decorative":false,"width":768,"height":434,"fallbackText":"La imagen no está disponible. La pregunta sigue abierta y las pistas educativas se conservan en el feedback.","srcSet":{"480":"/media/real-o-ia/ai/imagen-07-480.webp","768":"/media/real-o-ia/ai/imagen-07-768.webp","1280":"/media/real-o-ia/ai/imagen-07-1280.webp"}},"choices":["real","ai"]}'::jsonb,
  '2026-07-30.1',
  'approved',
  'real-o-ia-007'
) on conflict (item_id) do update set
  prompt = excluded.prompt,
  public_payload = excluded.public_payload,
  content_version = excluded.content_version,
  editorial_status = excluded.editorial_status,
  editorial_item_id = excluded.editorial_item_id,
  updated_at = now();
insert into private_arcade.item_feedback (
  item_id, status, explanation, signals, recommendation, revealed_answer
) values (
  '3781831a-e1fe-4e9c-1f4f-3003bf027485'::uuid,
  'instructive',
  'Tiene aire de postal clásica. Es IA: la composición «de catálogo» y algunas texturas delatan el origen sintético.',
  '["La escena está demasiado limpia y simétrica para una costa real con clima.","Las rocas del primer plano repiten patrones de textura poco naturales.","La luz del faro y el cielo se combinan con un brillo de postal digital.","Detalles finos de oleaje y tejados se suavizan de forma uniforme."]'::jsonb,
  'Compara postales virales de faros con fotos geotagueadas del mismo lugar: las diferencias de textura suelen delatar al generador.',
  'Generada por IA'
) on conflict (item_id) do update set
  status = excluded.status,
  explanation = excluded.explanation,
  signals = excluded.signals,
  recommendation = excluded.recommendation,
  revealed_answer = excluded.revealed_answer;
insert into private_arcade.item_solution_private (
  item_id, solution_payload, evaluation_rule
) values (
  '3781831a-e1fe-4e9c-1f4f-3003bf027485'::uuid,
  '{"verdict":"ai","evaluationSignals":["catalog_composition","repetitive_rock_texture","postcard_glow","uniform_smoothing"]}'::jsonb,
  '{"rule":"domain_mechanics"}'::jsonb
) on conflict (item_id) do update set
  solution_payload = excluded.solution_payload,
  evaluation_rule = excluded.evaluation_rule;
insert into private_arcade.item_media (
  item_id, kind, src, alt, decorative, width, height, fallback_text
) values (
  '3781831a-e1fe-4e9c-1f4f-3003bf027485'::uuid,
  'image',
  '/media/real-o-ia/ai/imagen-07-768.webp',
  'Faro blanco junto a casas de techo rojo sobre rocas oscuras, con oleaje y cielo rosado al atardecer.',
  false,
  768,
  434,
  'La imagen no está disponible. La pregunta sigue abierta y las pistas educativas se conservan en el feedback.'
) on conflict (item_id) do update set
  kind = excluded.kind,
  src = excluded.src,
  alt = excluded.alt,
  decorative = excluded.decorative,
  width = excluded.width,
  height = excluded.height,
  fallback_text = excluded.fallback_text;

insert into private_arcade.game_items (
  item_id, game_code, mechanic, sequence, prompt, public_payload,
  content_version, editorial_status, editorial_item_id
) values (
  '6d50deee-f8b4-538c-335c-57cfcf2033f4'::uuid,
  'real-o-ia',
  'image_verdict',
  8,
  '¿Anuncio real o comida generada por IA?',
  '{"gameCode":"real-o-ia","mechanic":"image_verdict","itemId":"real-o-ia-008","prompt":"¿Anuncio real o comida generada por IA?","context":"«La mejor burger de la ciudad» · 5.9k compartidos · foto de menú sin restaurante claro.","media":{"kind":"image","src":"/media/real-o-ia/ai/imagen-08-768.webp","alt":"Hamburguesa con queso derretido, tomate y lechuga sobre tabla de madera, con papas y bebida al fondo.","decorative":false,"width":768,"height":512,"fallbackText":"La imagen no está disponible. La pregunta sigue abierta y las pistas educativas se conservan en el feedback.","srcSet":{"480":"/media/real-o-ia/ai/imagen-08-480.webp","768":"/media/real-o-ia/ai/imagen-08-768.webp","1280":"/media/real-o-ia/ai/imagen-08-1280.webp"}},"choices":["real","ai"]}'::jsonb,
  '2026-07-30.1',
  'approved',
  'real-o-ia-008'
) on conflict (item_id) do update set
  prompt = excluded.prompt,
  public_payload = excluded.public_payload,
  content_version = excluded.content_version,
  editorial_status = excluded.editorial_status,
  editorial_item_id = excluded.editorial_item_id,
  updated_at = now();
insert into private_arcade.item_feedback (
  item_id, status, explanation, signals, recommendation, revealed_answer
) values (
  '6d50deee-f8b4-538c-335c-57cfcf2033f4'::uuid,
  'instructive',
  'Parece foto de menú profesional. Es IA: el «perfeccionismo» de semillas, capas y brillos es demasiado calculado.',
  '["Las semillas de sésamo están repartidas con regularidad casi matemática.","Las capas del sandwich se apilan con simetría de anuncio imposible en cocina real.","El queso cae en pliegues demasiado limpios y repetidos.","El fondo borroso parece un decorado genérico de restaurante digital."]'::jsonb,
  'Desconfía de platos «perfectos» sin restaurante, precio ni contexto: busca la cuenta del local o una foto menos retocada.',
  'Generada por IA'
) on conflict (item_id) do update set
  status = excluded.status,
  explanation = excluded.explanation,
  signals = excluded.signals,
  recommendation = excluded.recommendation,
  revealed_answer = excluded.revealed_answer;
insert into private_arcade.item_solution_private (
  item_id, solution_payload, evaluation_rule
) values (
  '6d50deee-f8b4-538c-335c-57cfcf2033f4'::uuid,
  '{"verdict":"ai","evaluationSignals":["mathematical_sesame","impossible_stack","clean_cheese_drape","generic_bokeh"]}'::jsonb,
  '{"rule":"domain_mechanics"}'::jsonb
) on conflict (item_id) do update set
  solution_payload = excluded.solution_payload,
  evaluation_rule = excluded.evaluation_rule;
insert into private_arcade.item_media (
  item_id, kind, src, alt, decorative, width, height, fallback_text
) values (
  '6d50deee-f8b4-538c-335c-57cfcf2033f4'::uuid,
  'image',
  '/media/real-o-ia/ai/imagen-08-768.webp',
  'Hamburguesa con queso derretido, tomate y lechuga sobre tabla de madera, con papas y bebida al fondo.',
  false,
  768,
  512,
  'La imagen no está disponible. La pregunta sigue abierta y las pistas educativas se conservan en el feedback.'
) on conflict (item_id) do update set
  kind = excluded.kind,
  src = excluded.src,
  alt = excluded.alt,
  decorative = excluded.decorative,
  width = excluded.width,
  height = excluded.height,
  fallback_text = excluded.fallback_text;

insert into private_arcade.game_items (
  item_id, game_code, mechanic, sequence, prompt, public_payload,
  content_version, editorial_status, editorial_item_id
) values (
  'f0da0edc-232c-ce1d-9427-63e159575468'::uuid,
  'real-o-ia',
  'image_verdict',
  9,
  '¿Retrato de mascota real o generado por IA?',
  '{"gameCode":"real-o-ia","mechanic":"image_verdict","itemId":"real-o-ia-009","prompt":"¿Retrato de mascota real o generado por IA?","context":"«Mirada de mi gato esta mañana» · 14k likes · se reparte en grupos de animales.","media":{"kind":"image","src":"/media/real-o-ia/ai/imagen-09-768.webp","alt":"Primer plano de un gato atigrado con ojos amarillo-verdosos sobre una manta texturizada y fondo difuminado.","decorative":false,"width":768,"height":512,"fallbackText":"La imagen no está disponible. La pregunta sigue abierta y las pistas educativas se conservan en el feedback.","srcSet":{"480":"/media/real-o-ia/ai/imagen-09-480.webp","768":"/media/real-o-ia/ai/imagen-09-768.webp","1280":"/media/real-o-ia/ai/imagen-09-1280.webp"}},"choices":["real","ai"]}'::jsonb,
  '2026-07-30.1',
  'approved',
  'real-o-ia-009'
) on conflict (item_id) do update set
  prompt = excluded.prompt,
  public_payload = excluded.public_payload,
  content_version = excluded.content_version,
  editorial_status = excluded.editorial_status,
  editorial_item_id = excluded.editorial_item_id,
  updated_at = now();
insert into private_arcade.item_feedback (
  item_id, status, explanation, signals, recommendation, revealed_answer
) values (
  'f0da0edc-232c-ce1d-9427-63e159575468'::uuid,
  'instructive',
  'Es imposible no quererlo. Es IA: el pelaje y los bigotes lucen excesivamente limpios, como un render de estudio.',
  '["El pelaje tiene un acabado demasiado uniforme, sin pelos sueltos ni imperfecciones.","Los bigotes se funden con el desenfoque de forma demasiado suave.","Los ojos brillan con catchlights «de estudio» en un entorno casero.","El fondo bokeh es cálido y genérico, sin objetos reconocibles."]'::jsonb,
  'En retratos de mascotas virales, mira bordes de pelo y bigotes: la IA suele suavizarlos en exceso.',
  'Generada por IA'
) on conflict (item_id) do update set
  status = excluded.status,
  explanation = excluded.explanation,
  signals = excluded.signals,
  recommendation = excluded.recommendation,
  revealed_answer = excluded.revealed_answer;
insert into private_arcade.item_solution_private (
  item_id, solution_payload, evaluation_rule
) values (
  'f0da0edc-232c-ce1d-9427-63e159575468'::uuid,
  '{"verdict":"ai","evaluationSignals":["overly_clean_fur","smoothed_whiskers","studio_catchlights","generic_bokeh"]}'::jsonb,
  '{"rule":"domain_mechanics"}'::jsonb
) on conflict (item_id) do update set
  solution_payload = excluded.solution_payload,
  evaluation_rule = excluded.evaluation_rule;
insert into private_arcade.item_media (
  item_id, kind, src, alt, decorative, width, height, fallback_text
) values (
  'f0da0edc-232c-ce1d-9427-63e159575468'::uuid,
  'image',
  '/media/real-o-ia/ai/imagen-09-768.webp',
  'Primer plano de un gato atigrado con ojos amarillo-verdosos sobre una manta texturizada y fondo difuminado.',
  false,
  768,
  512,
  'La imagen no está disponible. La pregunta sigue abierta y las pistas educativas se conservan en el feedback.'
) on conflict (item_id) do update set
  kind = excluded.kind,
  src = excluded.src,
  alt = excluded.alt,
  decorative = excluded.decorative,
  width = excluded.width,
  height = excluded.height,
  fallback_text = excluded.fallback_text;

insert into private_arcade.game_items (
  item_id, game_code, mechanic, sequence, prompt, public_payload,
  content_version, editorial_status, editorial_item_id
) values (
  '63d6b673-56e8-b6c3-39ea-879c65e71e0b'::uuid,
  'real-o-ia',
  'image_verdict',
  10,
  '¿Estudio musical real o escena generada por IA?',
  '{"gameCode":"real-o-ia","mechanic":"image_verdict","itemId":"real-o-ia-010","prompt":"¿Estudio musical real o escena generada por IA?","context":"«Ensayando Nocturne Op. 9 No. 2» · 3.2k compartidos · estética dark academia.","media":{"kind":"image","src":"/media/real-o-ia/ai/imagen-10-768.webp","alt":"Partitura abierta sobre un piano de cola negro, con metrónomo y libros al fondo en luz cálida.","decorative":false,"width":768,"height":434,"fallbackText":"La imagen no está disponible. La pregunta sigue abierta y las pistas educativas se conservan en el feedback.","srcSet":{"480":"/media/real-o-ia/ai/imagen-10-480.webp","768":"/media/real-o-ia/ai/imagen-10-768.webp","1280":"/media/real-o-ia/ai/imagen-10-1280.webp"}},"choices":["real","ai"]}'::jsonb,
  '2026-07-30.1',
  'approved',
  'real-o-ia-010'
) on conflict (item_id) do update set
  prompt = excluded.prompt,
  public_payload = excluded.public_payload,
  content_version = excluded.content_version,
  editorial_status = excluded.editorial_status,
  editorial_item_id = excluded.editorial_item_id,
  updated_at = now();
insert into private_arcade.item_feedback (
  item_id, status, explanation, signals, recommendation, revealed_answer
) values (
  '63d6b673-56e8-b6c3-39ea-879c65e71e0b'::uuid,
  'instructive',
  'La atmósfera convence. Es IA: atribuye un nocturno de Chopin a Beethoven y dibuja notación musical imposible.',
  '["La partitura atribuye el Nocturne Op. 9 No. 2 a Beethoven (es de Chopin).","Las claves y las notas están malformadas o incompletas.","El metrónomo muestra marcas ilegibles en lugar de números claros.","Algunos símbolos musicales flotan o se fusionan sin reglas reales."]'::jsonb,
  'Si una imagen incluye partituras, mapas o documentos, verifica hechos y legibilidad: la IA inventa texto «con pinta de verdadero».',
  'Generada por IA'
) on conflict (item_id) do update set
  status = excluded.status,
  explanation = excluded.explanation,
  signals = excluded.signals,
  recommendation = excluded.recommendation,
  revealed_answer = excluded.revealed_answer;
insert into private_arcade.item_solution_private (
  item_id, solution_payload, evaluation_rule
) values (
  '63d6b673-56e8-b6c3-39ea-879c65e71e0b'::uuid,
  '{"verdict":"ai","evaluationSignals":["wrong_composer","malformed_notation","illegible_metronome","floating_symbols"]}'::jsonb,
  '{"rule":"domain_mechanics"}'::jsonb
) on conflict (item_id) do update set
  solution_payload = excluded.solution_payload,
  evaluation_rule = excluded.evaluation_rule;
insert into private_arcade.item_media (
  item_id, kind, src, alt, decorative, width, height, fallback_text
) values (
  '63d6b673-56e8-b6c3-39ea-879c65e71e0b'::uuid,
  'image',
  '/media/real-o-ia/ai/imagen-10-768.webp',
  'Partitura abierta sobre un piano de cola negro, con metrónomo y libros al fondo en luz cálida.',
  false,
  768,
  434,
  'La imagen no está disponible. La pregunta sigue abierta y las pistas educativas se conservan en el feedback.'
) on conflict (item_id) do update set
  kind = excluded.kind,
  src = excluded.src,
  alt = excluded.alt,
  decorative = excluded.decorative,
  width = excluded.width,
  height = excluded.height,
  fallback_text = excluded.fallback_text;

insert into private_arcade.game_items (
  item_id, game_code, mechanic, sequence, prompt, public_payload,
  content_version, editorial_status, editorial_item_id
) values (
  '1ca56a6f-767c-fa5e-8a8c-1ba3645db03f'::uuid,
  'real-o-ia',
  'image_verdict',
  11,
  '¿Foto casera real o perro generado por IA?',
  '{"gameCode":"real-o-ia","mechanic":"image_verdict","itemId":"real-o-ia-011","prompt":"¿Foto casera real o perro generado por IA?","context":"«El nuevo de casa» · 890 likes · subida desde el patio sin filtros.","media":{"kind":"image","src":"/media/real-o-ia/real/imagen-01-768.webp","alt":"Golden retriever de pie en una esquina de paredes blancas sobre suelo de concreto, con la lengua fuera.","decorative":false,"width":768,"height":1158,"fallbackText":"La imagen no está disponible. La pregunta sigue abierta y las pistas educativas se conservan en el feedback.","srcSet":{"480":"/media/real-o-ia/real/imagen-01-480.webp","768":"/media/real-o-ia/real/imagen-01-768.webp","1280":"/media/real-o-ia/real/imagen-01-1280.webp"}},"choices":["real","ai"]}'::jsonb,
  '2026-07-30.1',
  'approved',
  'real-o-ia-011'
) on conflict (item_id) do update set
  prompt = excluded.prompt,
  public_payload = excluded.public_payload,
  content_version = excluded.content_version,
  editorial_status = excluded.editorial_status,
  editorial_item_id = excluded.editorial_item_id,
  updated_at = now();
insert into private_arcade.item_feedback (
  item_id, status, explanation, signals, recommendation, revealed_answer
) values (
  '1ca56a6f-767c-fa5e-8a8c-1ba3645db03f'::uuid,
  'instructive',
  'Se siente sencilla y cercana… y lo es. Es una foto real: anatomía, texturas y desgaste del entorno encajan.',
  '["El pelaje tiene variaciones naturales de color y densidad.","Las patas y el contacto con el suelo son anatómicamente coherentes.","La base del muro muestra manchas y desgaste reales.","La luz natural deja sombras suaves sin brillo de estudio sintético."]'::jsonb,
  'No todo lo bonito es falso: busca inconsistencias concretas; si no aparecen, la duda también es parte del criterio.',
  'Real'
) on conflict (item_id) do update set
  status = excluded.status,
  explanation = excluded.explanation,
  signals = excluded.signals,
  recommendation = excluded.recommendation,
  revealed_answer = excluded.revealed_answer;
insert into private_arcade.item_solution_private (
  item_id, solution_payload, evaluation_rule
) values (
  '1ca56a6f-767c-fa5e-8a8c-1ba3645db03f'::uuid,
  '{"verdict":"real","evaluationSignals":["natural_fur_variation","coherent_paws","weathered_surfaces","soft_daylight"]}'::jsonb,
  '{"rule":"domain_mechanics"}'::jsonb
) on conflict (item_id) do update set
  solution_payload = excluded.solution_payload,
  evaluation_rule = excluded.evaluation_rule;
insert into private_arcade.item_media (
  item_id, kind, src, alt, decorative, width, height, fallback_text
) values (
  '1ca56a6f-767c-fa5e-8a8c-1ba3645db03f'::uuid,
  'image',
  '/media/real-o-ia/real/imagen-01-768.webp',
  'Golden retriever de pie en una esquina de paredes blancas sobre suelo de concreto, con la lengua fuera.',
  false,
  768,
  1158,
  'La imagen no está disponible. La pregunta sigue abierta y las pistas educativas se conservan en el feedback.'
) on conflict (item_id) do update set
  kind = excluded.kind,
  src = excluded.src,
  alt = excluded.alt,
  decorative = excluded.decorative,
  width = excluded.width,
  height = excluded.height,
  fallback_text = excluded.fallback_text;

insert into private_arcade.game_items (
  item_id, game_code, mechanic, sequence, prompt, public_payload,
  content_version, editorial_status, editorial_item_id
) values (
  '58f345c9-8683-7d0f-57d6-9b2f41f78bbe'::uuid,
  'real-o-ia',
  'image_verdict',
  12,
  '¿Bodegón real o generado por IA?',
  '{"gameCode":"real-o-ia","mechanic":"image_verdict","itemId":"real-o-ia-012","prompt":"¿Bodegón real o generado por IA?","context":"«Fruta del mercado» · 210 likes · foto minimalista de cocina.","media":{"kind":"image","src":"/media/real-o-ia/real/imagen-02-768.webp","alt":"Dos frutos redondos de tono marrón-oliva sobre una superficie clara con textura de piedra.","decorative":false,"width":768,"height":1152,"fallbackText":"La imagen no está disponible. La pregunta sigue abierta y las pistas educativas se conservan en el feedback.","srcSet":{"480":"/media/real-o-ia/real/imagen-02-480.webp","768":"/media/real-o-ia/real/imagen-02-768.webp","1280":"/media/real-o-ia/real/imagen-02-1280.webp"}},"choices":["real","ai"]}'::jsonb,
  '2026-07-30.1',
  'approved',
  'real-o-ia-012'
) on conflict (item_id) do update set
  prompt = excluded.prompt,
  public_payload = excluded.public_payload,
  content_version = excluded.content_version,
  editorial_status = excluded.editorial_status,
  editorial_item_id = excluded.editorial_item_id,
  updated_at = now();
insert into private_arcade.item_feedback (
  item_id, status, explanation, signals, recommendation, revealed_answer
) values (
  '58f345c9-8683-7d0f-57d6-9b2f41f78bbe'::uuid,
  'instructive',
  'Parece demasiado limpia para ser verdad, pero es real. Las microtexturas y la cicatriz del tallo no son patrones de IA.',
  '["La piel muestra moteado irregular, no un patrón repetido.","La cicatriz del tallo tiene detalle orgánico creíble.","La sombra cae con degradado natural según la luz.","La superficie de apoyo tiene imperfecciones no simétricas."]'::jsonb,
  'En fotos minimalistas, amplía texturas pequeñas: la IA suele repetir patrones; la foto real conserva ruido e irregularidad.',
  'Real'
) on conflict (item_id) do update set
  status = excluded.status,
  explanation = excluded.explanation,
  signals = excluded.signals,
  recommendation = excluded.recommendation,
  revealed_answer = excluded.revealed_answer;
insert into private_arcade.item_solution_private (
  item_id, solution_payload, evaluation_rule
) values (
  '58f345c9-8683-7d0f-57d6-9b2f41f78bbe'::uuid,
  '{"verdict":"real","evaluationSignals":["irregular_skin","organic_stem_scar","natural_shadow_falloff","asymmetric_surface"]}'::jsonb,
  '{"rule":"domain_mechanics"}'::jsonb
) on conflict (item_id) do update set
  solution_payload = excluded.solution_payload,
  evaluation_rule = excluded.evaluation_rule;
insert into private_arcade.item_media (
  item_id, kind, src, alt, decorative, width, height, fallback_text
) values (
  '58f345c9-8683-7d0f-57d6-9b2f41f78bbe'::uuid,
  'image',
  '/media/real-o-ia/real/imagen-02-768.webp',
  'Dos frutos redondos de tono marrón-oliva sobre una superficie clara con textura de piedra.',
  false,
  768,
  1152,
  'La imagen no está disponible. La pregunta sigue abierta y las pistas educativas se conservan en el feedback.'
) on conflict (item_id) do update set
  kind = excluded.kind,
  src = excluded.src,
  alt = excluded.alt,
  decorative = excluded.decorative,
  width = excluded.width,
  height = excluded.height,
  fallback_text = excluded.fallback_text;

insert into private_arcade.game_items (
  item_id, game_code, mechanic, sequence, prompt, public_payload,
  content_version, editorial_status, editorial_item_id
) values (
  '56825ab9-c748-1a96-5f6d-6f9b82fdad19'::uuid,
  'real-o-ia',
  'image_verdict',
  13,
  '¿Vista urbana real o paisaje generado por IA?',
  '{"gameCode":"real-o-ia","mechanic":"image_verdict","itemId":"real-o-ia-013","prompt":"¿Vista urbana real o paisaje generado por IA?","context":"«Mi ciudad entre la niebla» · 2.4k compartidos · foto en blanco y negro.","media":{"kind":"image","src":"/media/real-o-ia/real/imagen-03-768.webp","alt":"Vista en blanco y negro de un barrio denso en ladera, playa curva y edificios altos junto al mar bajo niebla.","decorative":false,"width":768,"height":1365,"fallbackText":"La imagen no está disponible. La pregunta sigue abierta y las pistas educativas se conservan en el feedback.","srcSet":{"480":"/media/real-o-ia/real/imagen-03-480.webp","768":"/media/real-o-ia/real/imagen-03-768.webp","1280":"/media/real-o-ia/real/imagen-03-1280.webp"}},"choices":["real","ai"]}'::jsonb,
  '2026-07-30.1',
  'approved',
  'real-o-ia-013'
) on conflict (item_id) do update set
  prompt = excluded.prompt,
  public_payload = excluded.public_payload,
  content_version = excluded.content_version,
  editorial_status = excluded.editorial_status,
  editorial_item_id = excluded.editorial_item_id,
  updated_at = now();
insert into private_arcade.item_feedback (
  item_id, status, explanation, signals, recommendation, revealed_answer
) values (
  '56825ab9-c748-1a96-5f6d-6f9b82fdad19'::uuid,
  'instructive',
  'La densidad urbana asusta a cualquiera que busque fallos de IA… y sin embargo es real: el caos arquitectónico es coherente.',
  '["Los edificios de la ladera muestran variedad caótica sin patrones repetidos.","La geografía de playa y montaña encaja como un lugar real.","La niebla y el cielo tienen gradientes fotográficos, no manchas sintéticas.","No hay texto inventado ni estructuras que se fundan al acercarse."]'::jsonb,
  'En panorámicas complejas, busca repetición imposible o edificios «derretidos»; si el caos es coherente, puede ser auténtica.',
  'Real'
) on conflict (item_id) do update set
  status = excluded.status,
  explanation = excluded.explanation,
  signals = excluded.signals,
  recommendation = excluded.recommendation,
  revealed_answer = excluded.revealed_answer;
insert into private_arcade.item_solution_private (
  item_id, solution_payload, evaluation_rule
) values (
  '56825ab9-c748-1a96-5f6d-6f9b82fdad19'::uuid,
  '{"verdict":"real","evaluationSignals":["chaotic_architecture","coherent_geography","photographic_haze","no_melting_structures"]}'::jsonb,
  '{"rule":"domain_mechanics"}'::jsonb
) on conflict (item_id) do update set
  solution_payload = excluded.solution_payload,
  evaluation_rule = excluded.evaluation_rule;
insert into private_arcade.item_media (
  item_id, kind, src, alt, decorative, width, height, fallback_text
) values (
  '56825ab9-c748-1a96-5f6d-6f9b82fdad19'::uuid,
  'image',
  '/media/real-o-ia/real/imagen-03-768.webp',
  'Vista en blanco y negro de un barrio denso en ladera, playa curva y edificios altos junto al mar bajo niebla.',
  false,
  768,
  1365,
  'La imagen no está disponible. La pregunta sigue abierta y las pistas educativas se conservan en el feedback.'
) on conflict (item_id) do update set
  kind = excluded.kind,
  src = excluded.src,
  alt = excluded.alt,
  decorative = excluded.decorative,
  width = excluded.width,
  height = excluded.height,
  fallback_text = excluded.fallback_text;

insert into private_arcade.game_items (
  item_id, game_code, mechanic, sequence, prompt, public_payload,
  content_version, editorial_status, editorial_item_id
) values (
  'e8c13e1e-52fd-e73e-35f1-6081e2f05fe4'::uuid,
  'real-o-ia',
  'image_verdict',
  14,
  '¿Mesa de salón de té real o generada por IA?',
  '{"gameCode":"real-o-ia","mechanic":"image_verdict","itemId":"real-o-ia-014","prompt":"¿Mesa de salón de té real o generada por IA?","context":"«Desayuno en Carette» · 1.1k likes · placemat y envoltorios a la vista.","media":{"kind":"image","src":"/media/real-o-ia/real/imagen-04-768.webp","alt":"Mesa de café con chocolate caliente, nata montada, tetera plateada y manteles con logo de Carette Paris.","decorative":false,"width":768,"height":1194,"fallbackText":"La imagen no está disponible. La pregunta sigue abierta y las pistas educativas se conservan en el feedback.","srcSet":{"480":"/media/real-o-ia/real/imagen-04-480.webp","768":"/media/real-o-ia/real/imagen-04-768.webp","1280":"/media/real-o-ia/real/imagen-04-1280.webp"}},"choices":["real","ai"]}'::jsonb,
  '2026-07-30.1',
  'approved',
  'real-o-ia-014'
) on conflict (item_id) do update set
  prompt = excluded.prompt,
  public_payload = excluded.public_payload,
  content_version = excluded.content_version,
  editorial_status = excluded.editorial_status,
  editorial_item_id = excluded.editorial_item_id,
  updated_at = now();
insert into private_arcade.item_feedback (
  item_id, status, explanation, signals, recommendation, revealed_answer
) values (
  'e8c13e1e-52fd-e73e-35f1-6081e2f05fe4'::uuid,
  'instructive',
  'El branding perfecto hace dudar. Es real: direcciones, tipografía y reflejos de la tetera son coherentes y legibles.',
  '["El texto del mantel es legible y coincide con un negocio real (Carette Paris).","Los envoltorios muestran tipografía consistente, no garabatos.","Los reflejos en la tetera deforman el entorno de forma física.","La porcelana y la nata tienen texturas irregulares creíbles."]'::jsonb,
  'Cuando haya logos y direcciones, comprueba si existen: el texto correcto es una pista fuerte de autenticidad.',
  'Real'
) on conflict (item_id) do update set
  status = excluded.status,
  explanation = excluded.explanation,
  signals = excluded.signals,
  recommendation = excluded.recommendation,
  revealed_answer = excluded.revealed_answer;
insert into private_arcade.item_solution_private (
  item_id, solution_payload, evaluation_rule
) values (
  'e8c13e1e-52fd-e73e-35f1-6081e2f05fe4'::uuid,
  '{"verdict":"real","evaluationSignals":["legible_branding","consistent_labels","physical_reflections","irregular_food_texture"]}'::jsonb,
  '{"rule":"domain_mechanics"}'::jsonb
) on conflict (item_id) do update set
  solution_payload = excluded.solution_payload,
  evaluation_rule = excluded.evaluation_rule;
insert into private_arcade.item_media (
  item_id, kind, src, alt, decorative, width, height, fallback_text
) values (
  'e8c13e1e-52fd-e73e-35f1-6081e2f05fe4'::uuid,
  'image',
  '/media/real-o-ia/real/imagen-04-768.webp',
  'Mesa de café con chocolate caliente, nata montada, tetera plateada y manteles con logo de Carette Paris.',
  false,
  768,
  1194,
  'La imagen no está disponible. La pregunta sigue abierta y las pistas educativas se conservan en el feedback.'
) on conflict (item_id) do update set
  kind = excluded.kind,
  src = excluded.src,
  alt = excluded.alt,
  decorative = excluded.decorative,
  width = excluded.width,
  height = excluded.height,
  fallback_text = excluded.fallback_text;

insert into private_arcade.game_items (
  item_id, game_code, mechanic, sequence, prompt, public_payload,
  content_version, editorial_status, editorial_item_id
) values (
  '66365f9a-48d4-aeac-e1db-a35d7f7a7b16'::uuid,
  'real-o-ia',
  'image_verdict',
  15,
  '¿Retrato navideño real o generado por IA?',
  '{"gameCode":"real-o-ia","mechanic":"image_verdict","itemId":"real-o-ia-015","prompt":"¿Retrato navideño real o generado por IA?","context":"«Papá Noel en la ventana» · 3.6k compartidos · foto de evento local.","media":{"kind":"image","src":"/media/real-o-ia/real/imagen-05-768.webp","alt":"Hombre con barba y gorro rojo de Santa mirando por una ventana, con guirnalda y luces desenfocadas al frente.","decorative":false,"width":768,"height":1150,"fallbackText":"La imagen no está disponible. La pregunta sigue abierta y las pistas educativas se conservan en el feedback.","srcSet":{"480":"/media/real-o-ia/real/imagen-05-480.webp","768":"/media/real-o-ia/real/imagen-05-768.webp","1280":"/media/real-o-ia/real/imagen-05-1280.webp"}},"choices":["real","ai"]}'::jsonb,
  '2026-07-30.1',
  'approved',
  'real-o-ia-015'
) on conflict (item_id) do update set
  prompt = excluded.prompt,
  public_payload = excluded.public_payload,
  content_version = excluded.content_version,
  editorial_status = excluded.editorial_status,
  editorial_item_id = excluded.editorial_item_id,
  updated_at = now();
insert into private_arcade.item_feedback (
  item_id, status, explanation, signals, recommendation, revealed_answer
) values (
  '66365f9a-48d4-aeac-e1db-a35d7f7a7b16'::uuid,
  'instructive',
  'Parece campaña publicitaria. Es una foto real: piel, barba y cristal conservan textura fotográfica.',
  '["La piel muestra poros y arrugas naturales alrededor de los ojos.","La barba tiene pelos de distinto tono y dirección.","El cristal de la ventana aporta reflejos sutiles coherentes.","La guirnalda del primer plano se desenfoca de forma óptica real."]'::jsonb,
  'En retratos «de campaña», mira piel y bordes ópticos: la IA suele alisar de más o inventar brillos irreales.',
  'Real'
) on conflict (item_id) do update set
  status = excluded.status,
  explanation = excluded.explanation,
  signals = excluded.signals,
  recommendation = excluded.recommendation,
  revealed_answer = excluded.revealed_answer;
insert into private_arcade.item_solution_private (
  item_id, solution_payload, evaluation_rule
) values (
  '66365f9a-48d4-aeac-e1db-a35d7f7a7b16'::uuid,
  '{"verdict":"real","evaluationSignals":["natural_skin_texture","varied_beard_hairs","window_reflections","optical_bokeh"]}'::jsonb,
  '{"rule":"domain_mechanics"}'::jsonb
) on conflict (item_id) do update set
  solution_payload = excluded.solution_payload,
  evaluation_rule = excluded.evaluation_rule;
insert into private_arcade.item_media (
  item_id, kind, src, alt, decorative, width, height, fallback_text
) values (
  '66365f9a-48d4-aeac-e1db-a35d7f7a7b16'::uuid,
  'image',
  '/media/real-o-ia/real/imagen-05-768.webp',
  'Hombre con barba y gorro rojo de Santa mirando por una ventana, con guirnalda y luces desenfocadas al frente.',
  false,
  768,
  1150,
  'La imagen no está disponible. La pregunta sigue abierta y las pistas educativas se conservan en el feedback.'
) on conflict (item_id) do update set
  kind = excluded.kind,
  src = excluded.src,
  alt = excluded.alt,
  decorative = excluded.decorative,
  width = excluded.width,
  height = excluded.height,
  fallback_text = excluded.fallback_text;

insert into private_arcade.game_items (
  item_id, game_code, mechanic, sequence, prompt, public_payload,
  content_version, editorial_status, editorial_item_id
) values (
  '35a67894-8dfd-dd9e-8de6-ad870e24fae4'::uuid,
  'real-o-ia',
  'image_verdict',
  16,
  '¿Retrato callejero real o generado por IA?',
  '{"gameCode":"real-o-ia","mechanic":"image_verdict","itemId":"real-o-ia-016","prompt":"¿Retrato callejero real o generado por IA?","context":"«Músico en la esquina» · 640 likes · foto tomada de paso.","media":{"kind":"image","src":"/media/real-o-ia/real/imagen-06-768.webp","alt":"Niño de pie tocando un acordeón pequeño junto a un cubo naranja sobre baldosas grises.","decorative":false,"width":768,"height":1432,"fallbackText":"La imagen no está disponible. La pregunta sigue abierta y las pistas educativas se conservan en el feedback.","srcSet":{"480":"/media/real-o-ia/real/imagen-06-480.webp","768":"/media/real-o-ia/real/imagen-06-768.webp","1280":"/media/real-o-ia/real/imagen-06-1280.webp"}},"choices":["real","ai"]}'::jsonb,
  '2026-07-30.1',
  'approved',
  'real-o-ia-016'
) on conflict (item_id) do update set
  prompt = excluded.prompt,
  public_payload = excluded.public_payload,
  content_version = excluded.content_version,
  editorial_status = excluded.editorial_status,
  editorial_item_id = excluded.editorial_item_id,
  updated_at = now();
insert into private_arcade.item_feedback (
  item_id, status, explanation, signals, recommendation, revealed_answer
) values (
  '35a67894-8dfd-dd9e-8de6-ad870e24fae4'::uuid,
  'instructive',
  'Algunos detalles del cubo o del instrumento pueden confundir, pero la foto es real: el criterio no es «cualquier rareza = IA».',
  '["La postura y el peso del cuerpo sobre el suelo se sienten fotográficos.","La ropa y el calzado muestran texturas y costuras coherentes.","La luz lateral crea sombras duras creíbles en el pavimento.","Aunque haya elementos confusos, no hay anatomía imposible ni texto «falso perfecto»."]'::jsonb,
  'No basta con encontrar un detalle raro: busca un conjunto de fallos sistemáticos (manos, texto, física) antes de concluir que es IA.',
  'Real'
) on conflict (item_id) do update set
  status = excluded.status,
  explanation = excluded.explanation,
  signals = excluded.signals,
  recommendation = excluded.recommendation,
  revealed_answer = excluded.revealed_answer;
insert into private_arcade.item_solution_private (
  item_id, solution_payload, evaluation_rule
) values (
  '35a67894-8dfd-dd9e-8de6-ad870e24fae4'::uuid,
  '{"verdict":"real","evaluationSignals":["photographic_stance","coherent_clothing","hard_side_light","no_systematic_artifacts"]}'::jsonb,
  '{"rule":"domain_mechanics"}'::jsonb
) on conflict (item_id) do update set
  solution_payload = excluded.solution_payload,
  evaluation_rule = excluded.evaluation_rule;
insert into private_arcade.item_media (
  item_id, kind, src, alt, decorative, width, height, fallback_text
) values (
  '35a67894-8dfd-dd9e-8de6-ad870e24fae4'::uuid,
  'image',
  '/media/real-o-ia/real/imagen-06-768.webp',
  'Niño de pie tocando un acordeón pequeño junto a un cubo naranja sobre baldosas grises.',
  false,
  768,
  1432,
  'La imagen no está disponible. La pregunta sigue abierta y las pistas educativas se conservan en el feedback.'
) on conflict (item_id) do update set
  kind = excluded.kind,
  src = excluded.src,
  alt = excluded.alt,
  decorative = excluded.decorative,
  width = excluded.width,
  height = excluded.height,
  fallback_text = excluded.fallback_text;

insert into private_arcade.game_items (
  item_id, game_code, mechanic, sequence, prompt, public_payload,
  content_version, editorial_status, editorial_item_id
) values (
  'cb3bc532-12bb-1316-6ef2-404b8041456c'::uuid,
  'real-o-ia',
  'image_verdict',
  17,
  '¿Detalle musical real o generado por IA?',
  '{"gameCode":"real-o-ia","mechanic":"image_verdict","itemId":"real-o-ia-017","prompt":"¿Detalle musical real o generado por IA?","context":"«Regalo de papelería musical» · 180 likes · foto macro casera.","media":{"kind":"image","src":"/media/real-o-ia/real/imagen-07-768.webp","alt":"Superficies curvas color crema impresas con pentagramas y notas musicales, con desenfoque progresivo.","decorative":false,"width":768,"height":1024,"fallbackText":"La imagen no está disponible. La pregunta sigue abierta y las pistas educativas se conservan en el feedback.","srcSet":{"480":"/media/real-o-ia/real/imagen-07-480.webp","768":"/media/real-o-ia/real/imagen-07-768.webp","1280":"/media/real-o-ia/real/imagen-07-1280.webp"}},"choices":["real","ai"]}'::jsonb,
  '2026-07-30.1',
  'approved',
  'real-o-ia-017'
) on conflict (item_id) do update set
  prompt = excluded.prompt,
  public_payload = excluded.public_payload,
  content_version = excluded.content_version,
  editorial_status = excluded.editorial_status,
  editorial_item_id = excluded.editorial_item_id,
  updated_at = now();
insert into private_arcade.item_feedback (
  item_id, status, explanation, signals, recommendation, revealed_answer
) values (
  'cb3bc532-12bb-1316-6ef2-404b8041456c'::uuid,
  'instructive',
  'La notación puede verse rara en un objeto decorativo, pero la foto es real: el desenfoque óptico y el papel impreso son fotográficos.',
  '["Hay un plano nítido y un desenfoque óptico progresivo creíble.","La textura del papel impreso se mantiene al acercarse.","La curvatura de los cilindros deforma las líneas de forma física.","No aparecen claves «flotando» ni brillos sintéticos de render."]'::jsonb,
  'Distingue el objeto (puede ser decorativo) de la foto: pregunta si la captura es real, no si la partitura es música válida.',
  'Real'
) on conflict (item_id) do update set
  status = excluded.status,
  explanation = excluded.explanation,
  signals = excluded.signals,
  recommendation = excluded.recommendation,
  revealed_answer = excluded.revealed_answer;
insert into private_arcade.item_solution_private (
  item_id, solution_payload, evaluation_rule
) values (
  'cb3bc532-12bb-1316-6ef2-404b8041456c'::uuid,
  '{"verdict":"real","evaluationSignals":["optical_focus_falloff","print_texture","physical_curve_distortion","no_render_glow"]}'::jsonb,
  '{"rule":"domain_mechanics"}'::jsonb
) on conflict (item_id) do update set
  solution_payload = excluded.solution_payload,
  evaluation_rule = excluded.evaluation_rule;
insert into private_arcade.item_media (
  item_id, kind, src, alt, decorative, width, height, fallback_text
) values (
  'cb3bc532-12bb-1316-6ef2-404b8041456c'::uuid,
  'image',
  '/media/real-o-ia/real/imagen-07-768.webp',
  'Superficies curvas color crema impresas con pentagramas y notas musicales, con desenfoque progresivo.',
  false,
  768,
  1024,
  'La imagen no está disponible. La pregunta sigue abierta y las pistas educativas se conservan en el feedback.'
) on conflict (item_id) do update set
  kind = excluded.kind,
  src = excluded.src,
  alt = excluded.alt,
  decorative = excluded.decorative,
  width = excluded.width,
  height = excluded.height,
  fallback_text = excluded.fallback_text;

insert into private_arcade.game_items (
  item_id, game_code, mechanic, sequence, prompt, public_payload,
  content_version, editorial_status, editorial_item_id
) values (
  'f4f24541-c095-c9e0-a088-852658df50c9'::uuid,
  'real-o-ia',
  'image_verdict',
  18,
  '¿Bodegón luminoso real o generado por IA?',
  '{"gameCode":"real-o-ia","mechanic":"image_verdict","itemId":"real-o-ia-018","prompt":"¿Bodegón luminoso real o generado por IA?","context":"«Domingo en casa» · 720 likes · luz de ventana y flores blancas.","media":{"kind":"image","src":"/media/real-o-ia/real/imagen-08-768.webp","alt":"Jarrón oscuro con hortensias blancas sobre mantel de cuadros, frente a ventanas claras con jardín difuminado.","decorative":false,"width":768,"height":1152,"fallbackText":"La imagen no está disponible. La pregunta sigue abierta y las pistas educativas se conservan en el feedback.","srcSet":{"480":"/media/real-o-ia/real/imagen-08-480.webp","768":"/media/real-o-ia/real/imagen-08-768.webp","1280":"/media/real-o-ia/real/imagen-08-1280.webp"}},"choices":["real","ai"]}'::jsonb,
  '2026-07-30.1',
  'approved',
  'real-o-ia-018'
) on conflict (item_id) do update set
  prompt = excluded.prompt,
  public_payload = excluded.public_payload,
  content_version = excluded.content_version,
  editorial_status = excluded.editorial_status,
  editorial_item_id = excluded.editorial_item_id,
  updated_at = now();
insert into private_arcade.item_feedback (
  item_id, status, explanation, signals, recommendation, revealed_answer
) values (
  'f4f24541-c095-c9e0-a088-852658df50c9'::uuid,
  'instructive',
  'La luz alta puede parecer «de IA», pero es una foto real: madera, pétalos y reflejos del cristal se comportan bien.',
  '["Los pétalos tienen volumen irregular, no un patrón clonado.","El jarrón muestra ranuras y reflejos metálicos coherentes.","El marco de la ventana tiene imperfecciones de madera real.","El contraluz produce un resplandor óptico, no manchas de artefacto."]'::jsonb,
  'La sobreexposición sola no prueba IA. Busca patrones repetidos o bordes derretidos antes de decidir.',
  'Real'
) on conflict (item_id) do update set
  status = excluded.status,
  explanation = excluded.explanation,
  signals = excluded.signals,
  recommendation = excluded.recommendation,
  revealed_answer = excluded.revealed_answer;
insert into private_arcade.item_solution_private (
  item_id, solution_payload, evaluation_rule
) values (
  'f4f24541-c095-c9e0-a088-852658df50c9'::uuid,
  '{"verdict":"real","evaluationSignals":["irregular_petals","coherent_vase_reflections","wood_imperfections","optical_backlight"]}'::jsonb,
  '{"rule":"domain_mechanics"}'::jsonb
) on conflict (item_id) do update set
  solution_payload = excluded.solution_payload,
  evaluation_rule = excluded.evaluation_rule;
insert into private_arcade.item_media (
  item_id, kind, src, alt, decorative, width, height, fallback_text
) values (
  'f4f24541-c095-c9e0-a088-852658df50c9'::uuid,
  'image',
  '/media/real-o-ia/real/imagen-08-768.webp',
  'Jarrón oscuro con hortensias blancas sobre mantel de cuadros, frente a ventanas claras con jardín difuminado.',
  false,
  768,
  1152,
  'La imagen no está disponible. La pregunta sigue abierta y las pistas educativas se conservan en el feedback.'
) on conflict (item_id) do update set
  kind = excluded.kind,
  src = excluded.src,
  alt = excluded.alt,
  decorative = excluded.decorative,
  width = excluded.width,
  height = excluded.height,
  fallback_text = excluded.fallback_text;

insert into private_arcade.game_items (
  item_id, game_code, mechanic, sequence, prompt, public_payload,
  content_version, editorial_status, editorial_item_id
) values (
  '94310af6-0029-4df2-5a63-1b9b5632394c'::uuid,
  'real-o-ia',
  'image_verdict',
  19,
  '¿Escena de obra real o generada por IA?',
  '{"gameCode":"real-o-ia","mechanic":"image_verdict","itemId":"real-o-ia-019","prompt":"¿Escena de obra real o generada por IA?","context":"«Así va la calle esta semana» · 1.5k compartidos · foto desde la acera.","media":{"kind":"image","src":"/media/real-o-ia/real/imagen-09-768.webp","alt":"Trabajadores con chalecos reflectantes sobre un andamio metálico, con barreras YODOCK en primer plano.","decorative":false,"width":768,"height":1024,"fallbackText":"La imagen no está disponible. La pregunta sigue abierta y las pistas educativas se conservan en el feedback.","srcSet":{"480":"/media/real-o-ia/real/imagen-09-480.webp","768":"/media/real-o-ia/real/imagen-09-768.webp","1280":"/media/real-o-ia/real/imagen-09-1280.webp"}},"choices":["real","ai"]}'::jsonb,
  '2026-07-30.1',
  'approved',
  'real-o-ia-019'
) on conflict (item_id) do update set
  prompt = excluded.prompt,
  public_payload = excluded.public_payload,
  content_version = excluded.content_version,
  editorial_status = excluded.editorial_status,
  editorial_item_id = excluded.editorial_item_id,
  updated_at = now();
insert into private_arcade.item_feedback (
  item_id, status, explanation, signals, recommendation, revealed_answer
) values (
  '94310af6-0029-4df2-5a63-1b9b5632394c'::uuid,
  'instructive',
  'Hay mucha gente y metal: justo donde la IA suele fallar. Esta es real: arneses, texto de barreras y manos cuadrados.',
  '["El texto «YODOCK» de las barreras es nítido y correcto.","Los arneses y correas se cruzan de forma coherente, sin derretirse.","Las manos del trabajador que señala tienen anatomía creíble.","El fondo urbano borroso mantiene vehículos y árboles reconocibles."]'::jsonb,
  'En escenas con mucha gente y estructuras, busca texto legible y correas/manos coherentes: ahí se nota la diferencia.',
  'Real'
) on conflict (item_id) do update set
  status = excluded.status,
  explanation = excluded.explanation,
  signals = excluded.signals,
  recommendation = excluded.recommendation,
  revealed_answer = excluded.revealed_answer;
insert into private_arcade.item_solution_private (
  item_id, solution_payload, evaluation_rule
) values (
  '94310af6-0029-4df2-5a63-1b9b5632394c'::uuid,
  '{"verdict":"real","evaluationSignals":["legible_barrier_text","coherent_harnesses","plausible_hands","recognizable_background"]}'::jsonb,
  '{"rule":"domain_mechanics"}'::jsonb
) on conflict (item_id) do update set
  solution_payload = excluded.solution_payload,
  evaluation_rule = excluded.evaluation_rule;
insert into private_arcade.item_media (
  item_id, kind, src, alt, decorative, width, height, fallback_text
) values (
  '94310af6-0029-4df2-5a63-1b9b5632394c'::uuid,
  'image',
  '/media/real-o-ia/real/imagen-09-768.webp',
  'Trabajadores con chalecos reflectantes sobre un andamio metálico, con barreras YODOCK en primer plano.',
  false,
  768,
  1024,
  'La imagen no está disponible. La pregunta sigue abierta y las pistas educativas se conservan en el feedback.'
) on conflict (item_id) do update set
  kind = excluded.kind,
  src = excluded.src,
  alt = excluded.alt,
  decorative = excluded.decorative,
  width = excluded.width,
  height = excluded.height,
  fallback_text = excluded.fallback_text;

insert into private_arcade.game_items (
  item_id, game_code, mechanic, sequence, prompt, public_payload,
  content_version, editorial_status, editorial_item_id
) values (
  'e4750489-41cc-c0fa-beb7-8b7a9a3a58e6'::uuid,
  'real-o-ia',
  'image_verdict',
  20,
  '¿Paseo de jardín real o generado por IA?',
  '{"gameCode":"real-o-ia","mechanic":"image_verdict","itemId":"real-o-ia-020","prompt":"¿Paseo de jardín real o generado por IA?","context":"«Mañana en el botánico» · 980 likes · foto de espalda en el sendero.","media":{"kind":"image","src":"/media/real-o-ia/real/imagen-10-768.webp","alt":"Persona con sombrero de paja caminando por un sendero de grava entre plantas tropicales y palmeras.","decorative":false,"width":768,"height":1152,"fallbackText":"La imagen no está disponible. La pregunta sigue abierta y las pistas educativas se conservan en el feedback.","srcSet":{"480":"/media/real-o-ia/real/imagen-10-480.webp","768":"/media/real-o-ia/real/imagen-10-768.webp","1280":"/media/real-o-ia/real/imagen-10-1280.webp"}},"choices":["real","ai"]}'::jsonb,
  '2026-07-30.1',
  'approved',
  'real-o-ia-020'
) on conflict (item_id) do update set
  prompt = excluded.prompt,
  public_payload = excluded.public_payload,
  content_version = excluded.content_version,
  editorial_status = excluded.editorial_status,
  editorial_item_id = excluded.editorial_item_id,
  updated_at = now();
insert into private_arcade.item_feedback (
  item_id, status, explanation, signals, recommendation, revealed_answer
) values (
  'e4750489-41cc-c0fa-beb7-8b7a9a3a58e6'::uuid,
  'instructive',
  'Parece escaparate de viaje. Es real: follaje complejo, grava imperfecta y sombras naturales del mediodía.',
  '["Las hojas y palmeras tienen texturas no repetitivas.","La grava del camino muestra irregularidades creíbles.","Las sombras del mediodía son duras y coherentes con el sol.","La figura humana tiene proporciones y ropa sin deformaciones."]'::jsonb,
  'En paisajes «de catálogo», mira el suelo y el follaje de cerca: la IA suele repetir hojas o alisar el terreno.',
  'Real'
) on conflict (item_id) do update set
  status = excluded.status,
  explanation = excluded.explanation,
  signals = excluded.signals,
  recommendation = excluded.recommendation,
  revealed_answer = excluded.revealed_answer;
insert into private_arcade.item_solution_private (
  item_id, solution_payload, evaluation_rule
) values (
  'e4750489-41cc-c0fa-beb7-8b7a9a3a58e6'::uuid,
  '{"verdict":"real","evaluationSignals":["non_repeating_foliage","irregular_gravel","coherent_midday_shadows","plausible_figure"]}'::jsonb,
  '{"rule":"domain_mechanics"}'::jsonb
) on conflict (item_id) do update set
  solution_payload = excluded.solution_payload,
  evaluation_rule = excluded.evaluation_rule;
insert into private_arcade.item_media (
  item_id, kind, src, alt, decorative, width, height, fallback_text
) values (
  'e4750489-41cc-c0fa-beb7-8b7a9a3a58e6'::uuid,
  'image',
  '/media/real-o-ia/real/imagen-10-768.webp',
  'Persona con sombrero de paja caminando por un sendero de grava entre plantas tropicales y palmeras.',
  false,
  768,
  1152,
  'La imagen no está disponible. La pregunta sigue abierta y las pistas educativas se conservan en el feedback.'
) on conflict (item_id) do update set
  kind = excluded.kind,
  src = excluded.src,
  alt = excluded.alt,
  decorative = excluded.decorative,
  width = excluded.width,
  height = excluded.height,
  fallback_text = excluded.fallback_text;

insert into private_arcade.game_items (
  item_id, game_code, mechanic, sequence, prompt, public_payload,
  content_version, editorial_status, editorial_item_id
) values (
  'f31b32b2-ad69-c012-b9dc-b2877d758d60'::uuid,
  'grupo',
  'group_decision',
  1,
  'En el chat familiar llega un supuesto remedio de salud atribuido a la OMS. Practica Frenar e Investigar antes de que alguien abandone su tratamiento.',
  '{"gameCode":"grupo","mechanic":"group_decision","itemId":"grupo-001","prompt":"En el chat familiar llega un supuesto remedio de salud atribuido a la OMS. Practica Frenar e Investigar antes de que alguien abandone su tratamiento.","messages":[{"sender":"Tía Marta","text":"⚠️ URGENTE familia: limón con bicarbonato CURA el cáncer, lo dijo la OMS. Reenvíen YA, pueden salvar una vida 🙏🍋","timeLabel":"10:02"},{"sender":"Primo Luis","text":"¿En serio? Mi oncólogo me dijo seguir el tratamiento, pero este mensaje me dejó con miedo.","timeLabel":"10:03"}],"actions":["forward","verify","pause"]}'::jsonb,
  '2026-07-30.1',
  'approved',
  'grupo-001'
) on conflict (item_id) do update set
  prompt = excluded.prompt,
  public_payload = excluded.public_payload,
  content_version = excluded.content_version,
  editorial_status = excluded.editorial_status,
  editorial_item_id = excluded.editorial_item_id,
  updated_at = now();
insert into private_arcade.item_feedback (
  item_id, status, explanation, signals, recommendation, revealed_answer
) values (
  'f31b32b2-ad69-c012-b9dc-b2877d758d60'::uuid,
  'instructive',
  'La OMS no confirmó ese remedio. Frenar el reenvío y luego investigar la autoridad citada evita que una cadena de salud empuje una decisión médica peligrosa.',
  '["Frena: la urgencia y el «reenvía YA» buscan que actúes sin pensar.","Investiga: la OMS aparece citada, pero no hay comunicado comprobable.","Promesa de curación rápida sin evidencia clínica ni profesional identificable.","Una decisión de salud requiere fuente sanitaria, no un mensaje de chat."]'::jsonb,
  'Frena la cadena, investiga en el canal oficial de salud y avisa al grupo con lo que encontraste.',
  'No es una recomendación de la OMS; hay que frenar e investigar antes de actuar.'
) on conflict (item_id) do update set
  status = excluded.status,
  explanation = excluded.explanation,
  signals = excluded.signals,
  recommendation = excluded.recommendation,
  revealed_answer = excluded.revealed_answer;
insert into private_arcade.item_solution_private (
  item_id, solution_payload, evaluation_rule
) values (
  'f31b32b2-ad69-c012-b9dc-b2877d758d60'::uuid,
  '{"actionEvaluations":{"forward":{"score":0,"narrativeResult":"Reenvías el supuesto remedio a tres chats antes de comprobarlo.","consequences":["El mensaje gana alcance.","Luis considera abandonar una indicación médica segura."],"feedback":"Reenviar una promesa de salud sin evidencia puede causar daño. La mención de la OMS no reemplaza una comprobación real."},"verify":{"score":2,"narrativeResult":"Contrastas la afirmación en los canales oficiales de salud y avisas al chat que no existe ese respaldo.","consequences":["La cadena se detiene.","Luis conserva la indicación de su profesional y el grupo aprende dónde comprobarla."],"feedback":"Verificar la autoridad citada y corregir públicamente protege a las personas que podrían tomar una decisión médica por el mensaje."},"pause":{"score":1,"narrativeResult":"Pides que nadie lo reenvíe mientras buscas más información.","consequences":["La difusión se frena por el momento.","La afirmación sigue sin una corrección clara para el grupo."],"feedback":"Pausar es un buen primer freno, pero conviene verificar y explicar por qué el mensaje no tiene respaldo."}}}'::jsonb,
  '{"rule":"domain_mechanics"}'::jsonb
) on conflict (item_id) do update set
  solution_payload = excluded.solution_payload,
  evaluation_rule = excluded.evaluation_rule;
insert into private_arcade.item_media (
  item_id, kind, src, alt, decorative, width, height, fallback_text
) values (
  'f31b32b2-ad69-c012-b9dc-b2877d758d60'::uuid,
  'none',
  null,
  null,
  true,
  null,
  null,
  'Sin media editorial.'
) on conflict (item_id) do update set
  kind = excluded.kind,
  src = excluded.src,
  alt = excluded.alt,
  decorative = excluded.decorative,
  width = excluded.width,
  height = excluded.height,
  fallback_text = excluded.fallback_text;

insert into private_arcade.game_items (
  item_id, game_code, mechanic, sequence, prompt, public_payload,
  content_version, editorial_status, editorial_item_id
) values (
  'b932825b-30b4-9dd0-c690-04efeb1cceee'::uuid,
  'grupo',
  'group_decision',
  2,
  'Una foto real llega al chat como si mostrara una inundación de hoy. Frena el pánico e investiga el contexto de la imagen.',
  '{"gameCode":"grupo","mechanic":"group_decision","itemId":"grupo-002","prompt":"Una foto real llega al chat como si mostrara una inundación de hoy. Frena el pánico e investiga el contexto de la imagen.","messages":[{"sender":"Primo Diego","text":"ASÍ ESTÁ EL RÍO AHORA MISMO. Se desbordó por el centro; corran la voz 😱","timeLabel":"10:14","attachmentPresentation":"photo","media":{"kind":"image","src":"/media/grupo/rio-inundacion-768.webp","alt":"Calle inundada junto a un río crecido, con agua cubriendo la calzada y edificios al fondo.","decorative":false,"width":768,"height":511,"fallbackText":"La imagen no está disponible. La pregunta sigue abierta y las pistas educativas se conservan en el feedback.","srcSet":{"480":"/media/grupo/rio-inundacion-480.webp","768":"/media/grupo/rio-inundacion-768.webp","1280":"/media/grupo/rio-inundacion-1280.webp"}}},{"sender":"Amiga Vale","text":"¿Alguien sabe cuándo se tomó? Mi hermana tiene que pasar por esa zona.","timeLabel":"10:15"}],"actions":["forward","verify","pause"]}'::jsonb,
  '2026-07-30.1',
  'approved',
  'grupo-002'
) on conflict (item_id) do update set
  prompt = excluded.prompt,
  public_payload = excluded.public_payload,
  content_version = excluded.content_version,
  editorial_status = excluded.editorial_status,
  editorial_item_id = excluded.editorial_item_id,
  updated_at = now();
insert into private_arcade.item_feedback (
  item_id, status, explanation, signals, recommendation, revealed_answer
) values (
  'b932825b-30b4-9dd0-c690-04efeb1cceee'::uuid,
  'instructive',
  'La foto es real, pero pertenece a una inundación de 2016. Frenar el reenvío e investigar origen y fecha evita convertir una imagen antigua en una emergencia falsa.',
  '["Frena: «ahora mismo» y el pánico empujan a reenviar sin comprobar.","Investiga: no hay fecha, lugar confirmado ni autor de la foto.","Una búsqueda inversa puede revelar publicaciones anteriores de la misma imagen.","Que la foto sea real no prueba que el texto que la acompaña también lo sea."]'::jsonb,
  'Frena, haz una búsqueda inversa y comprueba fecha y lugar antes de compartir una imagen de emergencia.',
  'La foto es real, pero está fuera de contexto y no muestra una inundación actual.'
) on conflict (item_id) do update set
  status = excluded.status,
  explanation = excluded.explanation,
  signals = excluded.signals,
  recommendation = excluded.recommendation,
  revealed_answer = excluded.revealed_answer;
insert into private_arcade.item_solution_private (
  item_id, solution_payload, evaluation_rule
) values (
  'b932825b-30b4-9dd0-c690-04efeb1cceee'::uuid,
  '{"actionEvaluations":{"forward":{"score":0,"narrativeResult":"Reenvías la foto con el aviso de que el río se desbordó hoy.","consequences":["Se cancelan planes y aumenta el pánico.","La información falsa sobre la emergencia llega a más personas."],"feedback":"Que una imagen sea real no demuestra que el texto que la acompaña también lo sea. Compartirla sin fecha amplifica el engaño."},"verify":{"score":2,"narrativeResult":"Usas una búsqueda inversa y descubres que la misma foto corresponde a una inundación de 2016.","consequences":["Avisas al grupo con la fecha real.","Vale deja de preocuparse por una emergencia inventada."],"feedback":"La búsqueda inversa comprueba el origen y el contexto de una imagen; es la herramienta adecuada cuando una foto impactante llega sin fecha."},"pause":{"score":1,"narrativeResult":"Pides que nadie la reenvíe hasta confirmar cuándo se tomó.","consequences":["El grupo evita una difusión inmediata.","Todavía falta explicar que la foto es antigua."],"feedback":"Pausar corta el pánico; el siguiente paso es investigar el origen de la imagen."}}}'::jsonb,
  '{"rule":"domain_mechanics"}'::jsonb
) on conflict (item_id) do update set
  solution_payload = excluded.solution_payload,
  evaluation_rule = excluded.evaluation_rule;
insert into private_arcade.item_media (
  item_id, kind, src, alt, decorative, width, height, fallback_text
) values (
  'b932825b-30b4-9dd0-c690-04efeb1cceee'::uuid,
  'image',
  '/media/grupo/rio-inundacion-768.webp',
  'Calle inundada junto a un río crecido, con agua cubriendo la calzada y edificios al fondo.',
  false,
  768,
  511,
  'La imagen no está disponible. La pregunta sigue abierta y las pistas educativas se conservan en el feedback.'
) on conflict (item_id) do update set
  kind = excluded.kind,
  src = excluded.src,
  alt = excluded.alt,
  decorative = excluded.decorative,
  width = excluded.width,
  height = excluded.height,
  fallback_text = excluded.fallback_text;

insert into private_arcade.game_items (
  item_id, game_code, mechanic, sequence, prompt, public_payload,
  content_version, editorial_status, editorial_item_id
) values (
  '25c64cb4-6cc1-fd3c-1f76-2393057af2a6'::uuid,
  'grupo',
  'group_decision',
  3,
  'Un mensaje ofrece falsas becas UNESCO y pide datos sensibles. Frena el clic e investiga el canal oficial.',
  '{"gameCode":"grupo","mechanic":"group_decision","itemId":"grupo-003","prompt":"Un mensaje ofrece falsas becas UNESCO y pide datos sensibles. Frena el clic e investiga el canal oficial.","messages":[{"sender":"Número no guardado","text":"🎓 BECAS UNESCO 2026: 500 USD mensuales para jóvenes. ÚLTIMOS CUPOS HOY. Completa el formulario con tu DNI y tarjeta en el enlace.","timeLabel":"10:31"},{"sender":"Tía Marta","text":"¿Será cierto? Dice que si no lo llenamos hoy perdemos la oportunidad…","timeLabel":"10:32"}],"actions":["forward","verify","pause"]}'::jsonb,
  '2026-07-30.1',
  'approved',
  'grupo-003'
) on conflict (item_id) do update set
  prompt = excluded.prompt,
  public_payload = excluded.public_payload,
  content_version = excluded.content_version,
  editorial_status = excluded.editorial_status,
  editorial_item_id = excluded.editorial_item_id,
  updated_at = now();
insert into private_arcade.item_feedback (
  item_id, status, explanation, signals, recommendation, revealed_answer
) values (
  '25c64cb4-6cc1-fd3c-1f76-2393057af2a6'::uuid,
  'instructive',
  'Es phishing. Frenar el enlace e investigar la convocatoria en unesco.org evita entregar datos bancarios a un formulario falso.',
  '["Frena: «últimos cupos hoy» y el pedido de tarjeta buscan una decisión impulsiva.","Investiga: un número desconocido no es un canal institucional de UNESCO.","Pide documento y tarjeta mediante un enlace no verificable.","Una convocatoria real se contrasta en el dominio oficial, no en un chat."]'::jsonb,
  'No abras el enlace ni entregues datos; investiga en el canal oficial, reporta el mensaje y avisa al grupo.',
  'La oferta es phishing y no es una convocatoria oficial de becas UNESCO.'
) on conflict (item_id) do update set
  status = excluded.status,
  explanation = excluded.explanation,
  signals = excluded.signals,
  recommendation = excluded.recommendation,
  revealed_answer = excluded.revealed_answer;
insert into private_arcade.item_solution_private (
  item_id, solution_payload, evaluation_rule
) values (
  '25c64cb4-6cc1-fd3c-1f76-2393057af2a6'::uuid,
  '{"actionEvaluations":{"forward":{"score":0,"narrativeResult":"Reenvías la supuesta beca para que otras personas aprovechen los últimos cupos.","consequences":["Más personas abren el formulario falso.","El intento de robo de datos obtiene nuevos objetivos."],"feedback":"Reenviar un premio urgente ayuda al phishing a ganar credibilidad y alcance, aunque tú no hayas entregado datos."},"verify":{"score":2,"narrativeResult":"Compruebas la convocatoria en el canal institucional de UNESCO, reportas el mensaje y explicas la estafa.","consequences":["El grupo evita abrir el formulario.","La alerta ayuda a que nadie entregue datos sensibles."],"feedback":"Comparar la convocatoria con el canal institucional y reportar el mensaje corta el phishing antes de que capture información."},"pause":{"score":1,"narrativeResult":"Pides que nadie abra el enlace ni entregue datos mientras confirmas la convocatoria.","consequences":["Se detienen los clics impulsivos.","El grupo aún necesita una advertencia y un reporte para cerrar el riesgo."],"feedback":"Pausar protege de inmediato, pero la verificación y el aviso explícito evitan que otra persona caiga después."}}}'::jsonb,
  '{"rule":"domain_mechanics"}'::jsonb
) on conflict (item_id) do update set
  solution_payload = excluded.solution_payload,
  evaluation_rule = excluded.evaluation_rule;
insert into private_arcade.item_media (
  item_id, kind, src, alt, decorative, width, height, fallback_text
) values (
  '25c64cb4-6cc1-fd3c-1f76-2393057af2a6'::uuid,
  'none',
  null,
  null,
  true,
  null,
  null,
  'Sin media editorial.'
) on conflict (item_id) do update set
  kind = excluded.kind,
  src = excluded.src,
  alt = excluded.alt,
  decorative = excluded.decorative,
  width = excluded.width,
  height = excluded.height,
  fallback_text = excluded.fallback_text;

insert into private_arcade.game_items (
  item_id, game_code, mechanic, sequence, prompt, public_payload,
  content_version, editorial_status, editorial_item_id
) values (
  '1bd4bf89-dc06-1104-06b8-24688389a8a6'::uuid,
  'grupo',
  'group_decision',
  4,
  'Un clip político de doce segundos provoca indignación. Frena el juicio e investiga la intervención completa.',
  '{"gameCode":"grupo","mechanic":"group_decision","itemId":"grupo-004","prompt":"Un clip político de doce segundos provoca indignación. Frena el juicio e investiga la intervención completa.","messages":[{"sender":"Amiga Vale","text":"MIREN LO QUE DIJO 😡 Son doce segundos y ya me indigné. Compártanlo para que todos sepan cómo piensa.","timeLabel":"11:05","attachmentPresentation":"video_clip","media":{"kind":"image","src":"/media/grupo/clip-politico-768.webp","alt":"Persona hablando ante un atril con micrófonos en un acto público; fotograma de un clip corto.","decorative":false,"width":768,"height":512,"fallbackText":"La imagen no está disponible. La pregunta sigue abierta y las pistas educativas se conservan en el feedback.","srcSet":{"480":"/media/grupo/clip-politico-480.webp","768":"/media/grupo/clip-politico-768.webp","1280":"/media/grupo/clip-politico-1280.webp"}}},{"sender":"Primo Diego","text":"El video corta a mitad de frase y no dice quién lo publicó. ¿Alguien tiene la intervención completa?","timeLabel":"11:06"}],"actions":["forward","verify","pause"]}'::jsonb,
  '2026-07-30.1',
  'approved',
  'grupo-004'
) on conflict (item_id) do update set
  prompt = excluded.prompt,
  public_payload = excluded.public_payload,
  content_version = excluded.content_version,
  editorial_status = excluded.editorial_status,
  editorial_item_id = excluded.editorial_item_id,
  updated_at = now();
insert into private_arcade.item_feedback (
  item_id, status, explanation, signals, recommendation, revealed_answer
) values (
  '1bd4bf89-dc06-1104-06b8-24688389a8a6'::uuid,
  'instructive',
  'El clip está recortado a mitad de una oración y cambia el sentido. Frenar e investigar la fuente completa evita difundir un montaje emocional.',
  '["Frena: la indignación del clip corto empuja a compartir antes de pensar.","Investiga: falta la fuente de la grabación y lo que se dijo antes y después.","Un fragmento de doce segundos puede empezar o terminar a mitad de frase.","El contexto completo puede cambiar por completo la interpretación."]'::jsonb,
  'Frena el reenvío, busca la intervención completa y compara el fragmento con la fuente original.',
  'El clip está recortado y no permite conocer el sentido completo de la declaración.'
) on conflict (item_id) do update set
  status = excluded.status,
  explanation = excluded.explanation,
  signals = excluded.signals,
  recommendation = excluded.recommendation,
  revealed_answer = excluded.revealed_answer;
insert into private_arcade.item_solution_private (
  item_id, solution_payload, evaluation_rule
) values (
  '1bd4bf89-dc06-1104-06b8-24688389a8a6'::uuid,
  '{"actionEvaluations":{"forward":{"score":0,"narrativeResult":"Reenvías el clip con un comentario indignado antes de buscar la declaración completa.","consequences":["El recorte se vuelve parte de la conversación pública.","Luego debes corregir una interpretación que ayudaste a difundir."],"feedback":"La duda no compensa el alcance: compartir un clip fuera de contexto también amplifica una manipulación."},"verify":{"score":2,"narrativeResult":"Localizas la intervención completa y compruebas que la frase continúa en un sentido distinto al del recorte.","consequences":["Avisas al grupo con el contexto completo.","La conversación puede evaluar las palabras sin depender del montaje."],"feedback":"Comparar el fragmento con la fuente completa revela qué se omitió y evita confundir edición con evidencia."},"pause":{"score":1,"narrativeResult":"Pides que nadie lo comparta hasta encontrar la grabación completa.","consequences":["La indignación no se expande por el chat.","La interpretación queda pendiente de contexto."],"feedback":"Pausar es responsable cuando falta contexto; el paso siguiente es verificar qué se dijo antes y después del corte."}}}'::jsonb,
  '{"rule":"domain_mechanics"}'::jsonb
) on conflict (item_id) do update set
  solution_payload = excluded.solution_payload,
  evaluation_rule = excluded.evaluation_rule;
insert into private_arcade.item_media (
  item_id, kind, src, alt, decorative, width, height, fallback_text
) values (
  '1bd4bf89-dc06-1104-06b8-24688389a8a6'::uuid,
  'image',
  '/media/grupo/clip-politico-768.webp',
  'Persona hablando ante un atril con micrófonos en un acto público; fotograma de un clip corto.',
  false,
  768,
  512,
  'La imagen no está disponible. La pregunta sigue abierta y las pistas educativas se conservan en el feedback.'
) on conflict (item_id) do update set
  kind = excluded.kind,
  src = excluded.src,
  alt = excluded.alt,
  decorative = excluded.decorative,
  width = excluded.width,
  height = excluded.height,
  fallback_text = excluded.fallback_text;

insert into private_arcade.game_items (
  item_id, game_code, mechanic, sequence, prompt, public_payload,
  content_version, editorial_status, editorial_item_id
) values (
  '190db2e7-44bb-d9a3-6384-afc6fd3b1e57'::uuid,
  'grupo',
  'group_decision',
  5,
  'Llega una alerta meteorológica oficial ya verificada. Investiga la fuente y, si cuadra, compartir también es cuidar.',
  '{"gameCode":"grupo","mechanic":"group_decision","itemId":"grupo-005","prompt":"Llega una alerta meteorológica oficial ya verificada. Investiga la fuente y, si cuadra, compartir también es cuidar.","messages":[{"sender":"Tío Carlos","text":"⚠️ ALERTA OFICIAL: Protección Civil informa tormenta eléctrica fuerte de 21:00 a 02:00. Aseguren ventanas y desconecten equipos.","timeLabel":"11:20"},{"sender":"Tío Carlos","text":"La cuenta institucional está verificada y el aviso coincide con el boletín. Lo comparto para que el grupo se prepare.","timeLabel":"11:21"}],"actions":["forward","verify","pause"]}'::jsonb,
  '2026-07-30.1',
  'approved',
  'grupo-005'
) on conflict (item_id) do update set
  prompt = excluded.prompt,
  public_payload = excluded.public_payload,
  content_version = excluded.content_version,
  editorial_status = excluded.editorial_status,
  editorial_item_id = excluded.editorial_item_id,
  updated_at = now();
insert into private_arcade.item_feedback (
  item_id, status, explanation, signals, recommendation, revealed_answer
) values (
  '190db2e7-44bb-d9a3-6384-afc6fd3b1e57'::uuid,
  'instructive',
  'Esta alerta sí es oficial. Frenar el escepticismo automático e investigar la cuenta institucional permite compartir información que cuida al grupo.',
  '["Investiga: la autoridad responsable está identificada y la cuenta verificada.","El aviso coincide con un boletín oficial y da horario y medidas concretas.","Frena el impulso de dudar de todo: el pensamiento crítico también confirma lo útil.","Una alerta confirmada puede ser una acción de cuidado para la familia."]'::jsonb,
  'Investiga la fuente y, si la alerta es auténtica y útil, compártela con el contexto y las medidas concretas.',
  'Es una alerta oficial verificada que sí conviene compartir.'
) on conflict (item_id) do update set
  status = excluded.status,
  explanation = excluded.explanation,
  signals = excluded.signals,
  recommendation = excluded.recommendation,
  revealed_answer = excluded.revealed_answer;
insert into private_arcade.item_solution_private (
  item_id, solution_payload, evaluation_rule
) values (
  '190db2e7-44bb-d9a3-6384-afc6fd3b1e57'::uuid,
  '{"actionEvaluations":{"forward":{"score":2,"narrativeResult":"Compruebas la cuenta y el boletín, y reenvías la alerta con sus horarios y recomendaciones.","consequences":["El grupo recibe tiempo para prepararse.","Las personas desconectan equipos y reducen riesgos durante la tormenta."],"feedback":"Compartir sí es una decisión protectora cuando la alerta viene de una fuente oficial comprobada y conserva su contexto."},"verify":{"score":2,"narrativeResult":"Confirmas la cuenta y el boletín, y respondes al chat que la alerta es auténtica.","consequences":["El grupo puede actuar con confianza.","La información queda lista para que las personas decidan si deben reenviarla."],"feedback":"Verificar también es una acción completa y cuidadosa; no obliga a compartir, pero confirma que el aviso merece confianza."},"pause":{"score":1,"narrativeResult":"Pides una comprobación adicional antes de reenviar la alerta.","consequences":["Evitas compartir una alerta sin revisar.","El grupo puede perder tiempo útil si la confirmación ya estaba disponible."],"feedback":"Pausar evita el reenvío automático, pero ante una alerta oficial ya verificada conviene reconocer su utilidad y actuar a tiempo."}}}'::jsonb,
  '{"rule":"domain_mechanics"}'::jsonb
) on conflict (item_id) do update set
  solution_payload = excluded.solution_payload,
  evaluation_rule = excluded.evaluation_rule;
insert into private_arcade.item_media (
  item_id, kind, src, alt, decorative, width, height, fallback_text
) values (
  '190db2e7-44bb-d9a3-6384-afc6fd3b1e57'::uuid,
  'none',
  null,
  null,
  true,
  null,
  null,
  'Sin media editorial.'
) on conflict (item_id) do update set
  kind = excluded.kind,
  src = excluded.src,
  alt = excluded.alt,
  decorative = excluded.decorative,
  width = excluded.width,
  height = excluded.height,
  fallback_text = excluded.fallback_text;

insert into private_arcade.game_items (
  item_id, game_code, mechanic, sequence, prompt, public_payload,
  content_version, editorial_status, editorial_item_id
) values (
  '89987998-4ff5-9b01-e492-297964a5e469'::uuid,
  'grupo',
  'group_decision',
  6,
  'Una cadena apela a la culpa y al miedo para exigir diez reenvíos. Frena la presión e investiga si hay alguna evidencia real.',
  '{"gameCode":"grupo","mechanic":"group_decision","itemId":"grupo-006","prompt":"Una cadena apela a la culpa y al miedo para exigir diez reenvíos. Frena la presión e investiga si hay alguna evidencia real.","messages":[{"sender":"Cadena anónima","text":"😨 Si amas a tu mamá, reenvía esto a 10 personas. Si lo ignoras tendrás 7 años de mala suerte. A una vecina le pasó; ¡NO ROMPAS LA CADENA!","timeLabel":"11:42"},{"sender":"Tía Marta","text":"Me asusté un poco… ¿lo mando por si acaso?","timeLabel":"11:43"}],"actions":["forward","verify","pause"]}'::jsonb,
  '2026-07-30.1',
  'approved',
  'grupo-006'
) on conflict (item_id) do update set
  prompt = excluded.prompt,
  public_payload = excluded.public_payload,
  content_version = excluded.content_version,
  editorial_status = excluded.editorial_status,
  editorial_item_id = excluded.editorial_item_id,
  updated_at = now();
insert into private_arcade.item_feedback (
  item_id, status, explanation, signals, recommendation, revealed_answer
) values (
  '89987998-4ff5-9b01-e492-297964a5e469'::uuid,
  'instructive',
  'La cadena usa culpa y miedo para replicarse. Frenar el reenvío e investigar la amenaza (inexistente) corta la manipulación emocional.',
  '["Frena: relacionar el cariño con obedecer una orden de reenvío es presión emocional.","Investiga: la amenaza de mala suerte y la anécdota anónima no tienen evidencia.","Pide un número concreto de reenvíos para multiplicar su alcance.","No existe una consecuencia real por romper una cadena de chat."]'::jsonb,
  'Frena, no la reenvíes y explica con calma que es una cadena emocional sin evidencia.',
  'Es una cadena emocional basada en culpa y miedo; lo responsable es romperla.'
) on conflict (item_id) do update set
  status = excluded.status,
  explanation = excluded.explanation,
  signals = excluded.signals,
  recommendation = excluded.recommendation,
  revealed_answer = excluded.revealed_answer;
insert into private_arcade.item_solution_private (
  item_id, solution_payload, evaluation_rule
) values (
  '89987998-4ff5-9b01-e492-297964a5e469'::uuid,
  '{"actionEvaluations":{"forward":{"score":0,"narrativeResult":"Reenvías el mensaje por si acaso a diez contactos.","consequences":["La cadena obtiene diez nuevos replicadores.","La culpa y el miedo siguen presionando a más personas."],"feedback":"El por si acaso es precisamente el mecanismo de la cadena: una amenaza imposible se convierte en difusión real."},"verify":{"score":2,"narrativeResult":"Compruebas que no hay fuente ni evidencia y explicas en el grupo cómo funciona la cadena.","consequences":["La familia identifica la manipulación.","El mensaje deja de circular como una obligación."],"feedback":"Verificar la afirmación y nombrar la táctica de culpa y miedo ayuda a que el grupo pueda romper la cadena en lugar de obedecerla."},"pause":{"score":1,"narrativeResult":"No lo reenvías y pides tiempo para pensar antes de responder.","consequences":["La cadena no crece desde tu cuenta.","Otras personas todavía pueden reenviarla porque nadie explicó el engaño."],"feedback":"Pausar te protege y corta un eslabón; una explicación breve al grupo protege también a quienes aún sienten miedo."}}}'::jsonb,
  '{"rule":"domain_mechanics"}'::jsonb
) on conflict (item_id) do update set
  solution_payload = excluded.solution_payload,
  evaluation_rule = excluded.evaluation_rule;
insert into private_arcade.item_media (
  item_id, kind, src, alt, decorative, width, height, fallback_text
) values (
  '89987998-4ff5-9b01-e492-297964a5e469'::uuid,
  'none',
  null,
  null,
  true,
  null,
  null,
  'Sin media editorial.'
) on conflict (item_id) do update set
  kind = excluded.kind,
  src = excluded.src,
  alt = excluded.alt,
  decorative = excluded.decorative,
  width = excluded.width,
  height = excluded.height,
  fallback_text = excluded.fallback_text;

insert into private_arcade.game_items (
  item_id, game_code, mechanic, sequence, prompt, public_payload,
  content_version, editorial_status, editorial_item_id
) values (
  '9dbd59c0-e846-6761-b684-1fc7fb4f424e'::uuid,
  'clickbait-swipe',
  'headline_classification',
  1,
  'Frena el clic e investiga el titular. ¿Periodismo o clickbait?',
  '{"gameCode":"clickbait-swipe","mechanic":"headline_classification","itemId":"clickbait-swipe-001","prompt":"Frena el clic e investiga el titular. ¿Periodismo o clickbait?","headline":"Médicos «odian» este truco casero: bajar 10 kilos en 7 días sin dietas","sourceLabel":"saludmilagrosa.shop","actions":["journalism","clickbait"],"keyboardEquivalent":true}'::jsonb,
  '2026-07-30.1',
  'approved',
  'clickbait-swipe-001'
) on conflict (item_id) do update set
  prompt = excluded.prompt,
  public_payload = excluded.public_payload,
  content_version = excluded.content_version,
  editorial_status = excluded.editorial_status,
  editorial_item_id = excluded.editorial_item_id,
  updated_at = now();
insert into private_arcade.item_feedback (
  item_id, status, explanation, signals, recommendation, revealed_answer
) values (
  '9dbd59c0-e846-6761-b684-1fc7fb4f424e'::uuid,
  'instructive',
  'Este titular no informa: empuja el clic. Junta urgencia, mayúsculas, una autoridad inventada y una promesa imposible.',
  '["Frena: urgencia y promesa milagrosa empujan el clic antes de leer.","Investiga: «los médicos» no tienen nombre, estudio ni fuente.","Mayúsculas emocionales y enemigo inventado sustituyen al dato.","Bajar 10 kilos en una semana no es un hecho verificable."]'::jsonb,
  'Frena el clic e investiga si hay estudio firmado; si solo hay milagro, sal.',
  'Clickbait'
) on conflict (item_id) do update set
  status = excluded.status,
  explanation = excluded.explanation,
  signals = excluded.signals,
  recommendation = excluded.recommendation,
  revealed_answer = excluded.revealed_answer;
insert into private_arcade.item_solution_private (
  item_id, solution_payload, evaluation_rule
) values (
  '9dbd59c0-e846-6761-b684-1fc7fb4f424e'::uuid,
  '{"classification":"clickbait","evaluationSignals":["urgency","all_caps","false_authority","impossible_promise"]}'::jsonb,
  '{"rule":"domain_mechanics"}'::jsonb
) on conflict (item_id) do update set
  solution_payload = excluded.solution_payload,
  evaluation_rule = excluded.evaluation_rule;
insert into private_arcade.item_media (
  item_id, kind, src, alt, decorative, width, height, fallback_text
) values (
  '9dbd59c0-e846-6761-b684-1fc7fb4f424e'::uuid,
  'none',
  null,
  null,
  true,
  null,
  null,
  'Sin media editorial.'
) on conflict (item_id) do update set
  kind = excluded.kind,
  src = excluded.src,
  alt = excluded.alt,
  decorative = excluded.decorative,
  width = excluded.width,
  height = excluded.height,
  fallback_text = excluded.fallback_text;

insert into private_arcade.game_items (
  item_id, game_code, mechanic, sequence, prompt, public_payload,
  content_version, editorial_status, editorial_item_id
) values (
  '1735ca09-a452-4620-ebfa-c62e8f2a31bb'::uuid,
  'clickbait-swipe',
  'headline_classification',
  2,
  'Frena el clic e investiga el titular. ¿Periodismo o clickbait?',
  '{"gameCode":"clickbait-swipe","mechanic":"headline_classification","itemId":"clickbait-swipe-002","prompt":"Frena el clic e investiga el titular. ¿Periodismo o clickbait?","headline":"Banco Central sube la tasa de interés 0,25 puntos por inflación","sourceLabel":"diarioeconomia.pe","actions":["journalism","clickbait"],"keyboardEquivalent":true}'::jsonb,
  '2026-07-30.1',
  'approved',
  'clickbait-swipe-002'
) on conflict (item_id) do update set
  prompt = excluded.prompt,
  public_payload = excluded.public_payload,
  content_version = excluded.content_version,
  editorial_status = excluded.editorial_status,
  editorial_item_id = excluded.editorial_item_id,
  updated_at = now();
insert into private_arcade.item_feedback (
  item_id, status, explanation, signals, recommendation, revealed_answer
) values (
  '1735ca09-a452-4620-ebfa-c62e8f2a31bb'::uuid,
  'instructive',
  'Aquí hay periodismo: un actor identificable, una cifra exacta y una causa. Sin adjetivos ni drama, el titular te deja pensar.',
  '["Frena la sospecha automática: el tono es informativo, no un cebo.","Investiga: actor (Banco Central), cifra (0,25) y causa (inflación).","Sin mayúsculas ni urgencia fabricada.","El titular entrega el hecho completo para contrastarlo."]'::jsonb,
  'Un buen titular te dice qué pasó con precisión suficiente para comprobarlo en la fuente original.',
  'Periodismo'
) on conflict (item_id) do update set
  status = excluded.status,
  explanation = excluded.explanation,
  signals = excluded.signals,
  recommendation = excluded.recommendation,
  revealed_answer = excluded.revealed_answer;
insert into private_arcade.item_solution_private (
  item_id, solution_payload, evaluation_rule
) values (
  '1735ca09-a452-4620-ebfa-c62e8f2a31bb'::uuid,
  '{"classification":"journalism","evaluationSignals":["named_actor","concrete_figure","stated_cause","neutral_tone"]}'::jsonb,
  '{"rule":"domain_mechanics"}'::jsonb
) on conflict (item_id) do update set
  solution_payload = excluded.solution_payload,
  evaluation_rule = excluded.evaluation_rule;
insert into private_arcade.item_media (
  item_id, kind, src, alt, decorative, width, height, fallback_text
) values (
  '1735ca09-a452-4620-ebfa-c62e8f2a31bb'::uuid,
  'none',
  null,
  null,
  true,
  null,
  null,
  'Sin media editorial.'
) on conflict (item_id) do update set
  kind = excluded.kind,
  src = excluded.src,
  alt = excluded.alt,
  decorative = excluded.decorative,
  width = excluded.width,
  height = excluded.height,
  fallback_text = excluded.fallback_text;

insert into private_arcade.game_items (
  item_id, game_code, mechanic, sequence, prompt, public_payload,
  content_version, editorial_status, editorial_item_id
) values (
  '1d25dd84-5e31-293e-5282-1f6c0dbc6ce0'::uuid,
  'clickbait-swipe',
  'headline_classification',
  3,
  'Frena el clic e investiga el titular. ¿Periodismo o clickbait?',
  '{"gameCode":"clickbait-swipe","mechanic":"headline_classification","itemId":"clickbait-swipe-003","prompt":"Frena el clic e investiga el titular. ¿Periodismo o clickbait?","headline":"Lo que hizo esta niña dejó a todos en shock (video)","sourceLabel":"clipsvirales.blog","actions":["journalism","clickbait"],"keyboardEquivalent":true}'::jsonb,
  '2026-07-30.1',
  'approved',
  'clickbait-swipe-003'
) on conflict (item_id) do update set
  prompt = excluded.prompt,
  public_payload = excluded.public_payload,
  content_version = excluded.content_version,
  editorial_status = excluded.editorial_status,
  editorial_item_id = excluded.editorial_item_id,
  updated_at = now();
insert into private_arcade.item_feedback (
  item_id, status, explanation, signals, recommendation, revealed_answer
) values (
  '1d25dd84-5e31-293e-5282-1f6c0dbc6ce0'::uuid,
  'instructive',
  'Es un curiosity gap clásico: te oculta qué pasó para que entres. Si el titular no dice nada concreto, casi seguro no hay nada que informar.',
  '["Frena: el curiosity gap esconde el hecho para forzar el clic.","Investiga: no hay quién, dónde, cuándo ni qué ocurrió.","«En shock» te dice qué sentir, no qué pasó.","Promesa de video sin fuente identificable."]'::jsonb,
  'Si el titular solo te dice qué sentir y no qué pasó, sal sin hacer clic: esa curiosidad es la trampa.',
  'Clickbait'
) on conflict (item_id) do update set
  status = excluded.status,
  explanation = excluded.explanation,
  signals = excluded.signals,
  recommendation = excluded.recommendation,
  revealed_answer = excluded.revealed_answer;
insert into private_arcade.item_solution_private (
  item_id, solution_payload, evaluation_rule
) values (
  '1d25dd84-5e31-293e-5282-1f6c0dbc6ce0'::uuid,
  '{"classification":"clickbait","evaluationSignals":["curiosity_gap","extreme_emotion","missing_facts","video_bait"]}'::jsonb,
  '{"rule":"domain_mechanics"}'::jsonb
) on conflict (item_id) do update set
  solution_payload = excluded.solution_payload,
  evaluation_rule = excluded.evaluation_rule;
insert into private_arcade.item_media (
  item_id, kind, src, alt, decorative, width, height, fallback_text
) values (
  '1d25dd84-5e31-293e-5282-1f6c0dbc6ce0'::uuid,
  'none',
  null,
  null,
  true,
  null,
  null,
  'Sin media editorial.'
) on conflict (item_id) do update set
  kind = excluded.kind,
  src = excluded.src,
  alt = excluded.alt,
  decorative = excluded.decorative,
  width = excluded.width,
  height = excluded.height,
  fallback_text = excluded.fallback_text;

insert into private_arcade.game_items (
  item_id, game_code, mechanic, sequence, prompt, public_payload,
  content_version, editorial_status, editorial_item_id
) values (
  '81ea832b-b810-41e2-544a-62ba6abfdade'::uuid,
  'clickbait-swipe',
  'headline_classification',
  4,
  'Frena el clic e investiga el titular. ¿Periodismo o clickbait?',
  '{"gameCode":"clickbait-swipe","mechanic":"headline_classification","itemId":"clickbait-swipe-004","prompt":"Frena el clic e investiga el titular. ¿Periodismo o clickbait?","headline":"Municipalidad anuncia cierre vial por obras hasta diciembre","sourceLabel":"portalciudadano.gob.pe","actions":["journalism","clickbait"],"keyboardEquivalent":true}'::jsonb,
  '2026-07-30.1',
  'approved',
  'clickbait-swipe-004'
) on conflict (item_id) do update set
  prompt = excluded.prompt,
  public_payload = excluded.public_payload,
  content_version = excluded.content_version,
  editorial_status = excluded.editorial_status,
  editorial_item_id = excluded.editorial_item_id,
  updated_at = now();
insert into private_arcade.item_feedback (
  item_id, status, explanation, signals, recommendation, revealed_answer
) values (
  '81ea832b-b810-41e2-544a-62ba6abfdade'::uuid,
  'instructive',
  'Titular de servicio: dice quién, qué y hasta cuándo. La utilidad directa reemplaza la emoción fabricada.',
  '["Quién informa: la municipalidad queda identificada.","Qué ocurre: un cierre vial por obras.","Hasta cuándo: el plazo llega hasta diciembre.","Utilidad práctica: puedes planificar sin drama."]'::jsonb,
  'Cuando el titular responde quién, qué y cuándo, suele estar hecho para informar, no para secuestrar el clic.',
  'Periodismo'
) on conflict (item_id) do update set
  status = excluded.status,
  explanation = excluded.explanation,
  signals = excluded.signals,
  recommendation = excluded.recommendation,
  revealed_answer = excluded.revealed_answer;
insert into private_arcade.item_solution_private (
  item_id, solution_payload, evaluation_rule
) values (
  '81ea832b-b810-41e2-544a-62ba6abfdade'::uuid,
  '{"classification":"journalism","evaluationSignals":["named_actor","concrete_event","time_bound","service_utility"]}'::jsonb,
  '{"rule":"domain_mechanics"}'::jsonb
) on conflict (item_id) do update set
  solution_payload = excluded.solution_payload,
  evaluation_rule = excluded.evaluation_rule;
insert into private_arcade.item_media (
  item_id, kind, src, alt, decorative, width, height, fallback_text
) values (
  '81ea832b-b810-41e2-544a-62ba6abfdade'::uuid,
  'none',
  null,
  null,
  true,
  null,
  null,
  'Sin media editorial.'
) on conflict (item_id) do update set
  kind = excluded.kind,
  src = excluded.src,
  alt = excluded.alt,
  decorative = excluded.decorative,
  width = excluded.width,
  height = excluded.height,
  fallback_text = excluded.fallback_text;

insert into private_arcade.game_items (
  item_id, game_code, mechanic, sequence, prompt, public_payload,
  content_version, editorial_status, editorial_item_id
) values (
  '536712dd-b555-52ee-289e-a72dac0ac62d'::uuid,
  'clickbait-swipe',
  'headline_classification',
  5,
  'Frena el clic e investiga el titular. ¿Periodismo o clickbait?',
  '{"gameCode":"clickbait-swipe","mechanic":"headline_classification","itemId":"clickbait-swipe-005","prompt":"Frena el clic e investiga el titular. ¿Periodismo o clickbait?","headline":"No vas a creer lo que encontraron en el agua de tu ciudad","sourceLabel":"alertavecinal.info","actions":["journalism","clickbait"],"keyboardEquivalent":true}'::jsonb,
  '2026-07-30.1',
  'approved',
  'clickbait-swipe-005'
) on conflict (item_id) do update set
  prompt = excluded.prompt,
  public_payload = excluded.public_payload,
  content_version = excluded.content_version,
  editorial_status = excluded.editorial_status,
  editorial_item_id = excluded.editorial_item_id,
  updated_at = now();
insert into private_arcade.item_feedback (
  item_id, status, explanation, signals, recommendation, revealed_answer
) values (
  '536712dd-b555-52ee-289e-a72dac0ac62d'::uuid,
  'instructive',
  'Miedo local más vaguedad: te apunta a «tu» ciudad sin decir qué encontraron. El miedo cercano es uno de los cebos más eficaces.',
  '["Frena: el miedo local busca una reacción inmediata.","Investiga: «lo que encontraron» oculta el hallazgo concreto.","No hay autoridad, cifra ni fecha del supuesto informe.","«Tu ciudad» finge cercanía sin pruebas."]'::jsonb,
  'Ante un aviso de peligro local, exige el hallazgo concreto, la autoridad que lo midió y la fecha del informe.',
  'Clickbait'
) on conflict (item_id) do update set
  status = excluded.status,
  explanation = excluded.explanation,
  signals = excluded.signals,
  recommendation = excluded.recommendation,
  revealed_answer = excluded.revealed_answer;
insert into private_arcade.item_solution_private (
  item_id, solution_payload, evaluation_rule
) values (
  '536712dd-b555-52ee-289e-a72dac0ac62d'::uuid,
  '{"classification":"clickbait","evaluationSignals":["vagueness","fear_appeal","false_local_proximity","all_caps"]}'::jsonb,
  '{"rule":"domain_mechanics"}'::jsonb
) on conflict (item_id) do update set
  solution_payload = excluded.solution_payload,
  evaluation_rule = excluded.evaluation_rule;
insert into private_arcade.item_media (
  item_id, kind, src, alt, decorative, width, height, fallback_text
) values (
  '536712dd-b555-52ee-289e-a72dac0ac62d'::uuid,
  'none',
  null,
  null,
  true,
  null,
  null,
  'Sin media editorial.'
) on conflict (item_id) do update set
  kind = excluded.kind,
  src = excluded.src,
  alt = excluded.alt,
  decorative = excluded.decorative,
  width = excluded.width,
  height = excluded.height,
  fallback_text = excluded.fallback_text;

insert into private_arcade.game_items (
  item_id, game_code, mechanic, sequence, prompt, public_payload,
  content_version, editorial_status, editorial_item_id
) values (
  'ab158c37-a33d-f6f3-95b8-bb7f1dd6905f'::uuid,
  'clickbait-swipe',
  'headline_classification',
  6,
  'Frena el clic e investiga el titular. ¿Periodismo o clickbait?',
  '{"gameCode":"clickbait-swipe","mechanic":"headline_classification","itemId":"clickbait-swipe-006","prompt":"Frena el clic e investiga el titular. ¿Periodismo o clickbait?","headline":"Estudio universitario evalúa calidad del aire en 12 distritos","sourceLabel":"agencianoticias.pe","actions":["journalism","clickbait"],"keyboardEquivalent":true}'::jsonb,
  '2026-07-30.1',
  'approved',
  'clickbait-swipe-006'
) on conflict (item_id) do update set
  prompt = excluded.prompt,
  public_payload = excluded.public_payload,
  content_version = excluded.content_version,
  editorial_status = excluded.editorial_status,
  editorial_item_id = excluded.editorial_item_id,
  updated_at = now();
insert into private_arcade.item_feedback (
  item_id, status, explanation, signals, recommendation, revealed_answer
) values (
  'ab158c37-a33d-f6f3-95b8-bb7f1dd6905f'::uuid,
  'instructive',
  'El titular atribuye la información a un estudio identificable y acota el alcance. Puedes ir a la fuente y comprobarla.',
  '["Fuente atribuida: un estudio universitario, no un rumor anónimo.","Alcance medible: 12 distritos.","Tema concreto: calidad del aire.","Sin cebo emocional: no hay mayúsculas ni amenaza personal."]'::jsonb,
  'Cuando un titular cite un estudio, busca el nombre de la institución y el resumen metodológico antes de compartirlo.',
  'Periodismo'
) on conflict (item_id) do update set
  status = excluded.status,
  explanation = excluded.explanation,
  signals = excluded.signals,
  recommendation = excluded.recommendation,
  revealed_answer = excluded.revealed_answer;
insert into private_arcade.item_solution_private (
  item_id, solution_payload, evaluation_rule
) values (
  'ab158c37-a33d-f6f3-95b8-bb7f1dd6905f'::uuid,
  '{"classification":"journalism","evaluationSignals":["attributed_study","measurable_scope","concrete_topic","neutral_tone"]}'::jsonb,
  '{"rule":"domain_mechanics"}'::jsonb
) on conflict (item_id) do update set
  solution_payload = excluded.solution_payload,
  evaluation_rule = excluded.evaluation_rule;
insert into private_arcade.item_media (
  item_id, kind, src, alt, decorative, width, height, fallback_text
) values (
  'ab158c37-a33d-f6f3-95b8-bb7f1dd6905f'::uuid,
  'none',
  null,
  null,
  true,
  null,
  null,
  'Sin media editorial.'
) on conflict (item_id) do update set
  kind = excluded.kind,
  src = excluded.src,
  alt = excluded.alt,
  decorative = excluded.decorative,
  width = excluded.width,
  height = excluded.height,
  fallback_text = excluded.fallback_text;

insert into private_arcade.game_items (
  item_id, game_code, mechanic, sequence, prompt, public_payload,
  content_version, editorial_status, editorial_item_id
) values (
  'f1ef87c5-ea36-366c-b7ce-2de1f916d3b0'::uuid,
  'clickbait-swipe',
  'headline_classification',
  7,
  'Frena el clic e investiga el titular. ¿Periodismo o clickbait?',
  '{"gameCode":"clickbait-swipe","mechanic":"headline_classification","itemId":"clickbait-swipe-007","prompt":"Frena el clic e investiga el titular. ¿Periodismo o clickbait?","headline":"El 99% de la gente FALLA este test de inteligencia, ¿eres del 1%?","sourceLabel":"testsvirales.fun","actions":["journalism","clickbait"],"keyboardEquivalent":true}'::jsonb,
  '2026-07-30.1',
  'approved',
  'clickbait-swipe-007'
) on conflict (item_id) do update set
  prompt = excluded.prompt,
  public_payload = excluded.public_payload,
  content_version = excluded.content_version,
  editorial_status = excluded.editorial_status,
  editorial_item_id = excluded.editorial_item_id,
  updated_at = now();
insert into private_arcade.item_feedback (
  item_id, status, explanation, signals, recommendation, revealed_answer
) values (
  'f1ef87c5-ea36-366c-b7ce-2de1f916d3b0'::uuid,
  'instructive',
  'Es un cebo de ego: nadie quiere ser del 99%. El «test» existe para retenerte con anuncios, no para medir inteligencia.',
  '["Frena: el cebo de ego («¿eres del 1%?») quiere tu clic, no tu dato.","Investiga: la estadística del 99% no es verificable.","El «test» suele existir para retenerte con anuncios.","Pregunta retórica en lugar de hecho informativo."]'::jsonb,
  'Si un titular te reta a demostrar que eres especial, asume que el producto es tu atención, no el resultado del test.',
  'Clickbait'
) on conflict (item_id) do update set
  status = excluded.status,
  explanation = excluded.explanation,
  signals = excluded.signals,
  recommendation = excluded.recommendation,
  revealed_answer = excluded.revealed_answer;
insert into private_arcade.item_solution_private (
  item_id, solution_payload, evaluation_rule
) values (
  'f1ef87c5-ea36-366c-b7ce-2de1f916d3b0'::uuid,
  '{"classification":"clickbait","evaluationSignals":["ego_bait","unverifiable_statistic","all_caps","rhetorical_hook"]}'::jsonb,
  '{"rule":"domain_mechanics"}'::jsonb
) on conflict (item_id) do update set
  solution_payload = excluded.solution_payload,
  evaluation_rule = excluded.evaluation_rule;
insert into private_arcade.item_media (
  item_id, kind, src, alt, decorative, width, height, fallback_text
) values (
  'f1ef87c5-ea36-366c-b7ce-2de1f916d3b0'::uuid,
  'none',
  null,
  null,
  true,
  null,
  null,
  'Sin media editorial.'
) on conflict (item_id) do update set
  kind = excluded.kind,
  src = excluded.src,
  alt = excluded.alt,
  decorative = excluded.decorative,
  width = excluded.width,
  height = excluded.height,
  fallback_text = excluded.fallback_text;

insert into private_arcade.game_items (
  item_id, game_code, mechanic, sequence, prompt, public_payload,
  content_version, editorial_status, editorial_item_id
) values (
  'c9884c52-2807-e391-d455-360afe6554db'::uuid,
  'clickbait-swipe',
  'headline_classification',
  8,
  'Frena el clic e investiga el titular. ¿Periodismo o clickbait?',
  '{"gameCode":"clickbait-swipe","mechanic":"headline_classification","itemId":"clickbait-swipe-008","prompt":"Frena el clic e investiga el titular. ¿Periodismo o clickbait?","headline":"Inflación cerró en 3,1% anual, informó el instituto de estadística","sourceLabel":"agencia-reuters.style","actions":["journalism","clickbait"],"keyboardEquivalent":true}'::jsonb,
  '2026-07-30.1',
  'approved',
  'clickbait-swipe-008'
) on conflict (item_id) do update set
  prompt = excluded.prompt,
  public_payload = excluded.public_payload,
  content_version = excluded.content_version,
  editorial_status = excluded.editorial_status,
  editorial_item_id = excluded.editorial_item_id,
  updated_at = now();
insert into private_arcade.item_feedback (
  item_id, status, explanation, signals, recommendation, revealed_answer
) values (
  'c9884c52-2807-e391-d455-360afe6554db'::uuid,
  'instructive',
  'Cifra más fuente oficial citada. El dato habla solo: no necesita adjetivos para ser útil.',
  '["Frena la duda automática: cifra + fuente oficial suelen ser periodismo.","Investiga: 3,1% anual atribuido al instituto de estadística.","Hecho cerrado en pasado, sin dramatización.","Fácil de contrastar en el comunicado oficial."]'::jsonb,
  'Prioriza titulares que combinen cifra y fuente oficial; son los más fáciles de contrastar.',
  'Periodismo'
) on conflict (item_id) do update set
  status = excluded.status,
  explanation = excluded.explanation,
  signals = excluded.signals,
  recommendation = excluded.recommendation,
  revealed_answer = excluded.revealed_answer;
insert into private_arcade.item_solution_private (
  item_id, solution_payload, evaluation_rule
) values (
  'c9884c52-2807-e391-d455-360afe6554db'::uuid,
  '{"classification":"journalism","evaluationSignals":["concrete_figure","official_source","completed_fact","neutral_tone"]}'::jsonb,
  '{"rule":"domain_mechanics"}'::jsonb
) on conflict (item_id) do update set
  solution_payload = excluded.solution_payload,
  evaluation_rule = excluded.evaluation_rule;
insert into private_arcade.item_media (
  item_id, kind, src, alt, decorative, width, height, fallback_text
) values (
  'c9884c52-2807-e391-d455-360afe6554db'::uuid,
  'none',
  null,
  null,
  true,
  null,
  null,
  'Sin media editorial.'
) on conflict (item_id) do update set
  kind = excluded.kind,
  src = excluded.src,
  alt = excluded.alt,
  decorative = excluded.decorative,
  width = excluded.width,
  height = excluded.height,
  fallback_text = excluded.fallback_text;

insert into private_arcade.game_items (
  item_id, game_code, mechanic, sequence, prompt, public_payload,
  content_version, editorial_status, editorial_item_id
) values (
  'ee3dd56a-92b8-2cbe-1cbc-d6a98bc41aa8'::uuid,
  'clickbait-swipe',
  'headline_classification',
  9,
  'Frena el clic e investiga el titular. ¿Periodismo o clickbait?',
  '{"gameCode":"clickbait-swipe","mechanic":"headline_classification","itemId":"clickbait-swipe-009","prompt":"Frena el clic e investiga el titular. ¿Periodismo o clickbait?","headline":"Famoso actor DESTRUYE a crítico y el internet ENLOQUECE","sourceLabel":"farandulatotal.tv","actions":["journalism","clickbait"],"keyboardEquivalent":true}'::jsonb,
  '2026-07-30.1',
  'approved',
  'clickbait-swipe-009'
) on conflict (item_id) do update set
  prompt = excluded.prompt,
  public_payload = excluded.public_payload,
  content_version = excluded.content_version,
  editorial_status = excluded.editorial_status,
  editorial_item_id = excluded.editorial_item_id,
  updated_at = now();
insert into private_arcade.item_feedback (
  item_id, status, explanation, signals, recommendation, revealed_answer
) values (
  'ee3dd56a-92b8-2cbe-1cbc-d6a98bc41aa8'::uuid,
  'instructive',
  'Verbos de guerra convierten una discusión menor en batalla épica. La emoción extrema reemplaza el hecho.',
  '["Frena: verbos de guerra («destruye», «enloquece») fabrican combate.","Investiga: no dice qué dijo el actor ni qué criticó.","Mayúsculas amplifican el drama sin aportar cita.","«El internet» aparece como personaje, no como fuente."]'::jsonb,
  'Si el titular suena a combate, busca la cita textual y el contexto antes de sumarte a la pelea.',
  'Clickbait'
) on conflict (item_id) do update set
  status = excluded.status,
  explanation = excluded.explanation,
  signals = excluded.signals,
  recommendation = excluded.recommendation,
  revealed_answer = excluded.revealed_answer;
insert into private_arcade.item_solution_private (
  item_id, solution_payload, evaluation_rule
) values (
  'ee3dd56a-92b8-2cbe-1cbc-d6a98bc41aa8'::uuid,
  '{"classification":"clickbait","evaluationSignals":["extreme_emotion","all_caps","vagueness","collective_reaction_bait"]}'::jsonb,
  '{"rule":"domain_mechanics"}'::jsonb
) on conflict (item_id) do update set
  solution_payload = excluded.solution_payload,
  evaluation_rule = excluded.evaluation_rule;
insert into private_arcade.item_media (
  item_id, kind, src, alt, decorative, width, height, fallback_text
) values (
  'ee3dd56a-92b8-2cbe-1cbc-d6a98bc41aa8'::uuid,
  'none',
  null,
  null,
  true,
  null,
  null,
  'Sin media editorial.'
) on conflict (item_id) do update set
  kind = excluded.kind,
  src = excluded.src,
  alt = excluded.alt,
  decorative = excluded.decorative,
  width = excluded.width,
  height = excluded.height,
  fallback_text = excluded.fallback_text;

insert into private_arcade.game_items (
  item_id, game_code, mechanic, sequence, prompt, public_payload,
  content_version, editorial_status, editorial_item_id
) values (
  'aab76050-00b8-88ae-051b-a9f73a26b0cf'::uuid,
  'clickbait-swipe',
  'headline_classification',
  10,
  'Frena el clic e investiga el titular. ¿Periodismo o clickbait?',
  '{"gameCode":"clickbait-swipe","mechanic":"headline_classification","itemId":"clickbait-swipe-010","prompt":"Frena el clic e investiga el titular. ¿Periodismo o clickbait?","headline":"Aerolínea reporta retrasos por mantenimiento: reprogramaciones sin costo","sourceLabel":"portalviajero.net","actions":["journalism","clickbait"],"keyboardEquivalent":true}'::jsonb,
  '2026-07-30.1',
  'approved',
  'clickbait-swipe-010'
) on conflict (item_id) do update set
  prompt = excluded.prompt,
  public_payload = excluded.public_payload,
  content_version = excluded.content_version,
  editorial_status = excluded.editorial_status,
  editorial_item_id = excluded.editorial_item_id,
  updated_at = now();
insert into private_arcade.item_feedback (
  item_id, status, explanation, signals, recommendation, revealed_answer
) values (
  'aab76050-00b8-88ae-051b-a9f73a26b0cf'::uuid,
  'instructive',
  'Información de servicio: qué ocurre, por qué y qué puedes hacer. Es accionable y no dramatiza.',
  '["Hecho operativo: retrasos por mantenimiento.","Consecuencia útil: reprogramaciones sin costo.","Lenguaje de servicio, no de espectáculo.","Sin curiosity gap: el titular entrega la noticia completa."]'::jsonb,
  'Los titulares de servicio suelen ser periodismo útil: conserva el dato y verifica en el canal oficial de la empresa.',
  'Periodismo'
) on conflict (item_id) do update set
  status = excluded.status,
  explanation = excluded.explanation,
  signals = excluded.signals,
  recommendation = excluded.recommendation,
  revealed_answer = excluded.revealed_answer;
insert into private_arcade.item_solution_private (
  item_id, solution_payload, evaluation_rule
) values (
  'aab76050-00b8-88ae-051b-a9f73a26b0cf'::uuid,
  '{"classification":"journalism","evaluationSignals":["service_update","actionable_detail","neutral_tone","complete_news"]}'::jsonb,
  '{"rule":"domain_mechanics"}'::jsonb
) on conflict (item_id) do update set
  solution_payload = excluded.solution_payload,
  evaluation_rule = excluded.evaluation_rule;
insert into private_arcade.item_media (
  item_id, kind, src, alt, decorative, width, height, fallback_text
) values (
  'aab76050-00b8-88ae-051b-a9f73a26b0cf'::uuid,
  'none',
  null,
  null,
  true,
  null,
  null,
  'Sin media editorial.'
) on conflict (item_id) do update set
  kind = excluded.kind,
  src = excluded.src,
  alt = excluded.alt,
  decorative = excluded.decorative,
  width = excluded.width,
  height = excluded.height,
  fallback_text = excluded.fallback_text;

insert into private_arcade.game_items (
  item_id, game_code, mechanic, sequence, prompt, public_payload,
  content_version, editorial_status, editorial_item_id
) values (
  '36c1fa9f-549c-d54c-611b-f8d29333937f'::uuid,
  'clickbait-swipe',
  'headline_classification',
  11,
  'Frena el clic e investiga el titular. ¿Periodismo o clickbait?',
  '{"gameCode":"clickbait-swipe","mechanic":"headline_classification","itemId":"clickbait-swipe-011","prompt":"Frena el clic e investiga el titular. ¿Periodismo o clickbait?","headline":"Esta fruta común podría estar MATÁNDOTE lentamente y no lo sabes","sourceLabel":"secretossalud.top","actions":["journalism","clickbait"],"keyboardEquivalent":true}'::jsonb,
  '2026-07-30.1',
  'approved',
  'clickbait-swipe-011'
) on conflict (item_id) do update set
  prompt = excluded.prompt,
  public_payload = excluded.public_payload,
  content_version = excluded.content_version,
  editorial_status = excluded.editorial_status,
  editorial_item_id = excluded.editorial_item_id,
  updated_at = now();
insert into private_arcade.item_feedback (
  item_id, status, explanation, signals, recommendation, revealed_answer
) values (
  '36c1fa9f-549c-d54c-611b-f8d29333937f'::uuid,
  'instructive',
  'Miedo más secreto más amenaza cotidiana. La salud es el nicho favorito de este cebo porque baja la guardia.',
  '["Frena: «matándote» sin evidencia es miedo fabricado.","Investiga: no nombra la fruta, el estudio ni el riesgo medible.","«Y no lo sabes» finge un secreto revelado.","La salud es un nicho favorito del clickbait porque baja la guardia."]'::jsonb,
  'En salud, exige el nombre del estudio, la institución y el riesgo concreto; si solo hay amenaza, no hagas clic.',
  'Clickbait'
) on conflict (item_id) do update set
  status = excluded.status,
  explanation = excluded.explanation,
  signals = excluded.signals,
  recommendation = excluded.recommendation,
  revealed_answer = excluded.revealed_answer;
insert into private_arcade.item_solution_private (
  item_id, solution_payload, evaluation_rule
) values (
  '36c1fa9f-549c-d54c-611b-f8d29333937f'::uuid,
  '{"classification":"clickbait","evaluationSignals":["fear_appeal","secret_reveal","everyday_threat","vagueness"]}'::jsonb,
  '{"rule":"domain_mechanics"}'::jsonb
) on conflict (item_id) do update set
  solution_payload = excluded.solution_payload,
  evaluation_rule = excluded.evaluation_rule;
insert into private_arcade.item_media (
  item_id, kind, src, alt, decorative, width, height, fallback_text
) values (
  '36c1fa9f-549c-d54c-611b-f8d29333937f'::uuid,
  'none',
  null,
  null,
  true,
  null,
  null,
  'Sin media editorial.'
) on conflict (item_id) do update set
  kind = excluded.kind,
  src = excluded.src,
  alt = excluded.alt,
  decorative = excluded.decorative,
  width = excluded.width,
  height = excluded.height,
  fallback_text = excluded.fallback_text;

insert into private_arcade.game_items (
  item_id, game_code, mechanic, sequence, prompt, public_payload,
  content_version, editorial_status, editorial_item_id
) values (
  'bec97add-acf9-47b8-03ff-91458c90d0a0'::uuid,
  'clickbait-swipe',
  'headline_classification',
  12,
  'Frena el clic e investiga el titular. ¿Periodismo o clickbait?',
  '{"gameCode":"clickbait-swipe","mechanic":"headline_classification","itemId":"clickbait-swipe-012","prompt":"Frena el clic e investiga el titular. ¿Periodismo o clickbait?","headline":"La selección jugará amistoso el 12 de setiembre en el estadio Nacional","sourceLabel":"deportesdiario.pe","actions":["journalism","clickbait"],"keyboardEquivalent":true}'::jsonb,
  '2026-07-30.1',
  'approved',
  'clickbait-swipe-012'
) on conflict (item_id) do update set
  prompt = excluded.prompt,
  public_payload = excluded.public_payload,
  content_version = excluded.content_version,
  editorial_status = excluded.editorial_status,
  editorial_item_id = excluded.editorial_item_id,
  updated_at = now();
insert into private_arcade.item_feedback (
  item_id, status, explanation, signals, recommendation, revealed_answer
) values (
  'bec97add-acf9-47b8-03ff-91458c90d0a0'::uuid,
  'instructive',
  'Quién, cuándo y dónde. Es verificable en un minuto y no necesita emoción para ser noticia.',
  '["Quién: la selección.","Cuándo: el 12 de setiembre.","Dónde: el estadio Nacional.","Hecho completo: tipo de partido incluido (amistoso)."]'::jsonb,
  'Si el titular ya responde quién, cuándo y dónde, puedes contrastarlo en la agenda oficial sin caer en el cebo emocional.',
  'Periodismo'
) on conflict (item_id) do update set
  status = excluded.status,
  explanation = excluded.explanation,
  signals = excluded.signals,
  recommendation = excluded.recommendation,
  revealed_answer = excluded.revealed_answer;
insert into private_arcade.item_solution_private (
  item_id, solution_payload, evaluation_rule
) values (
  'bec97add-acf9-47b8-03ff-91458c90d0a0'::uuid,
  '{"classification":"journalism","evaluationSignals":["named_actor","time_bound","place_bound","complete_news"]}'::jsonb,
  '{"rule":"domain_mechanics"}'::jsonb
) on conflict (item_id) do update set
  solution_payload = excluded.solution_payload,
  evaluation_rule = excluded.evaluation_rule;
insert into private_arcade.item_media (
  item_id, kind, src, alt, decorative, width, height, fallback_text
) values (
  'bec97add-acf9-47b8-03ff-91458c90d0a0'::uuid,
  'none',
  null,
  null,
  true,
  null,
  null,
  'Sin media editorial.'
) on conflict (item_id) do update set
  kind = excluded.kind,
  src = excluded.src,
  alt = excluded.alt,
  decorative = excluded.decorative,
  width = excluded.width,
  height = excluded.height,
  fallback_text = excluded.fallback_text;

insert into private_arcade.game_items (
  item_id, game_code, mechanic, sequence, prompt, public_payload,
  content_version, editorial_status, editorial_item_id
) values (
  'd84c49f8-4ae6-375a-53de-9b7630f62291'::uuid,
  'radar-de-fuentes',
  'source_classification',
  1,
  'Investiga la fuente y rastrea su origen. ¿Dónde la ubicas?',
  '{"gameCode":"radar-de-fuentes","mechanic":"source_classification","itemId":"radar-de-fuentes-001","prompt":"Investiga la fuente y rastrea su origen. ¿Dónde la ubicas?","sourceName":"UNESCO — sitio oficial","urlLabel":"https://www.unesco.org/es/articles","description":"Artículo con autor institucional, fecha de publicación y referencias a documentos oficiales. Señales visibles: autor UNESCO, fecha visible, referencias.","categories":["reliable","doubtful","fraudulent"]}'::jsonb,
  '2026-07-30.1',
  'approved',
  'radar-de-fuentes-001'
) on conflict (item_id) do update set
  prompt = excluded.prompt,
  public_payload = excluded.public_payload,
  content_version = excluded.content_version,
  editorial_status = excluded.editorial_status,
  editorial_item_id = excluded.editorial_item_id,
  updated_at = now();
insert into private_arcade.item_feedback (
  item_id, status, explanation, signals, recommendation, revealed_answer
) values (
  'd84c49f8-4ae6-375a-53de-9b7630f62291'::uuid,
  'instructive',
  'Es una fuente confiable: organismo internacional con dominio institucional, autoría clara, fecha y referencias verificables.',
  '["Investiga: dominio institucional unesco.org con autoría clara.","Rastrea: fecha y referencias a documentos oficiales contrastables.","El contenido aparece firmado por la institución.","Las referencias permiten volver al documento primario."]'::jsonb,
  'Cuando dominio, autor, fecha y referencias cuadran, puedes usarla como punto de partida verificable.',
  'Confiable'
) on conflict (item_id) do update set
  status = excluded.status,
  explanation = excluded.explanation,
  signals = excluded.signals,
  recommendation = excluded.recommendation,
  revealed_answer = excluded.revealed_answer;
insert into private_arcade.item_solution_private (
  item_id, solution_payload, evaluation_rule
) values (
  'd84c49f8-4ae6-375a-53de-9b7630f62291'::uuid,
  '{"classification":"reliable","evaluationSignals":["institutional_domain","clear_authorship","publication_date","verifiable_references"]}'::jsonb,
  '{"rule":"domain_mechanics"}'::jsonb
) on conflict (item_id) do update set
  solution_payload = excluded.solution_payload,
  evaluation_rule = excluded.evaluation_rule;
insert into private_arcade.item_media (
  item_id, kind, src, alt, decorative, width, height, fallback_text
) values (
  'd84c49f8-4ae6-375a-53de-9b7630f62291'::uuid,
  'none',
  null,
  null,
  true,
  null,
  null,
  'Sin media editorial.'
) on conflict (item_id) do update set
  kind = excluded.kind,
  src = excluded.src,
  alt = excluded.alt,
  decorative = excluded.decorative,
  width = excluded.width,
  height = excluded.height,
  fallback_text = excluded.fallback_text;

insert into private_arcade.game_items (
  item_id, game_code, mechanic, sequence, prompt, public_payload,
  content_version, editorial_status, editorial_item_id
) values (
  '5a81a58f-2425-3a2e-2afc-9fbdca7214da'::uuid,
  'radar-de-fuentes',
  'source_classification',
  2,
  'Investiga la fuente y rastrea su origen. ¿Dónde la ubicas?',
  '{"gameCode":"radar-de-fuentes","mechanic":"source_classification","itemId":"radar-de-fuentes-004","prompt":"Investiga la fuente y rastrea su origen. ¿Dónde la ubicas?","sourceName":"Blog personal de opinión","urlLabel":"https://vozsinfiltro.blog/post/la-verdad-oculta","description":"Columna de opinión sin fuentes citadas: «Yo digo la verdad que los medios ocultan». Señales: sin fuentes, opinión disfrazada de noticia.","categories":["reliable","doubtful","fraudulent"]}'::jsonb,
  '2026-07-30.1',
  'approved',
  'radar-de-fuentes-004'
) on conflict (item_id) do update set
  prompt = excluded.prompt,
  public_payload = excluded.public_payload,
  content_version = excluded.content_version,
  editorial_status = excluded.editorial_status,
  editorial_item_id = excluded.editorial_item_id,
  updated_at = now();
insert into private_arcade.item_feedback (
  item_id, status, explanation, signals, recommendation, revealed_answer
) values (
  '5a81a58f-2425-3a2e-2afc-9fbdca7214da'::uuid,
  'instructive',
  'Es dudosa: no es necesariamente falsa, pero es opinión sin evidencia. Puede servir como punto de partida, nunca como prueba.',
  '["Investiga: no cita fuentes comprobables ni fecha editorial.","Rastrea: no hay origen documental que contrastar.","Tono personal que presenta opinión como si fuera noticia.","Afirma revelar verdades ocultas sin documentarlas."]'::jsonb,
  'Separa opinión de evidencia: un blog puede orientar la búsqueda, pero no sustituye una fuente verificable.',
  'Dudosa'
) on conflict (item_id) do update set
  status = excluded.status,
  explanation = excluded.explanation,
  signals = excluded.signals,
  recommendation = excluded.recommendation,
  revealed_answer = excluded.revealed_answer;
insert into private_arcade.item_solution_private (
  item_id, solution_payload, evaluation_rule
) values (
  '5a81a58f-2425-3a2e-2afc-9fbdca7214da'::uuid,
  '{"classification":"doubtful","evaluationSignals":["opinion_without_sources","opinion_as_news","unverified_claim","no_accountability"]}'::jsonb,
  '{"rule":"domain_mechanics"}'::jsonb
) on conflict (item_id) do update set
  solution_payload = excluded.solution_payload,
  evaluation_rule = excluded.evaluation_rule;
insert into private_arcade.item_media (
  item_id, kind, src, alt, decorative, width, height, fallback_text
) values (
  '5a81a58f-2425-3a2e-2afc-9fbdca7214da'::uuid,
  'none',
  null,
  null,
  true,
  null,
  null,
  'Sin media editorial.'
) on conflict (item_id) do update set
  kind = excluded.kind,
  src = excluded.src,
  alt = excluded.alt,
  decorative = excluded.decorative,
  width = excluded.width,
  height = excluded.height,
  fallback_text = excluded.fallback_text;

insert into private_arcade.game_items (
  item_id, game_code, mechanic, sequence, prompt, public_payload,
  content_version, editorial_status, editorial_item_id
) values (
  'f00967a4-f6bb-b507-0bf1-59a6bd238388'::uuid,
  'radar-de-fuentes',
  'source_classification',
  3,
  'Investiga la fuente y rastrea su origen. ¿Dónde la ubicas?',
  '{"gameCode":"radar-de-fuentes","mechanic":"source_classification","itemId":"radar-de-fuentes-007","prompt":"Investiga la fuente y rastrea su origen. ¿Dónde la ubicas?","sourceName":"Portal de «becas» internacionales","urlLabel":"https://unesco-becas2026.premium-forms.xyz","description":"Imita el logo de la UNESCO, promete dinero y pide DNI más datos bancarios. Señales: dominio .xyz, pide datos bancarios, urgencia.","categories":["reliable","doubtful","fraudulent"]}'::jsonb,
  '2026-07-30.1',
  'approved',
  'radar-de-fuentes-007'
) on conflict (item_id) do update set
  prompt = excluded.prompt,
  public_payload = excluded.public_payload,
  content_version = excluded.content_version,
  editorial_status = excluded.editorial_status,
  editorial_item_id = excluded.editorial_item_id,
  updated_at = now();
insert into private_arcade.item_feedback (
  item_id, status, explanation, signals, recommendation, revealed_answer
) values (
  'f00967a4-f6bb-b507-0bf1-59a6bd238388'::uuid,
  'instructive',
  'Es fraudulenta: typosquatting y phishing. La UNESCO real es unesco.org. Ninguna beca real pide tu tarjeta para «registrarte».',
  '["Investiga: dominio .xyz que imita una marca conocida.","Rastrea: la UNESCO real está en unesco.org, no en este formulario.","Pide DNI y tarjeta para un «registro» de beca.","Urgencia artificial («últimos cupos») típica de phishing."]'::jsonb,
  'Investiga la barra de direcciones y rastrea el dominio oficial: unesco.org no es unesco-becas2026.premium-forms.xyz.',
  'Fraudulenta'
) on conflict (item_id) do update set
  status = excluded.status,
  explanation = excluded.explanation,
  signals = excluded.signals,
  recommendation = excluded.recommendation,
  revealed_answer = excluded.revealed_answer;
insert into private_arcade.item_solution_private (
  item_id, solution_payload, evaluation_rule
) values (
  'f00967a4-f6bb-b507-0bf1-59a6bd238388'::uuid,
  '{"classification":"fraudulent","evaluationSignals":["typosquatting","phishing_data_request","brand_impersonation","urgency_scam"]}'::jsonb,
  '{"rule":"domain_mechanics"}'::jsonb
) on conflict (item_id) do update set
  solution_payload = excluded.solution_payload,
  evaluation_rule = excluded.evaluation_rule;
insert into private_arcade.item_media (
  item_id, kind, src, alt, decorative, width, height, fallback_text
) values (
  'f00967a4-f6bb-b507-0bf1-59a6bd238388'::uuid,
  'none',
  null,
  null,
  true,
  null,
  null,
  'Sin media editorial.'
) on conflict (item_id) do update set
  kind = excluded.kind,
  src = excluded.src,
  alt = excluded.alt,
  decorative = excluded.decorative,
  width = excluded.width,
  height = excluded.height,
  fallback_text = excluded.fallback_text;

insert into private_arcade.game_items (
  item_id, game_code, mechanic, sequence, prompt, public_payload,
  content_version, editorial_status, editorial_item_id
) values (
  'b19efc06-57ef-0828-450b-529e4bbd5b33'::uuid,
  'radar-de-fuentes',
  'source_classification',
  4,
  'Investiga la fuente y rastrea su origen. ¿Dónde la ubicas?',
  '{"gameCode":"radar-de-fuentes","mechanic":"source_classification","itemId":"radar-de-fuentes-002","prompt":"Investiga la fuente y rastrea su origen. ¿Dónde la ubicas?","sourceName":"Agencia de noticias con redactor firmado","urlLabel":"https://cables.agencia-norte.news/economia","description":"Cable con redactor identificado, hora exacta y política pública de correcciones. Señales: autor firmado, timestamp, correcciones visibles.","categories":["reliable","doubtful","fraudulent"]}'::jsonb,
  '2026-07-30.1',
  'approved',
  'radar-de-fuentes-002'
) on conflict (item_id) do update set
  prompt = excluded.prompt,
  public_payload = excluded.public_payload,
  content_version = excluded.content_version,
  editorial_status = excluded.editorial_status,
  editorial_item_id = excluded.editorial_item_id,
  updated_at = now();
insert into private_arcade.item_feedback (
  item_id, status, explanation, signals, recommendation, revealed_answer
) values (
  'b19efc06-57ef-0828-450b-529e4bbd5b33'::uuid,
  'instructive',
  'Es confiable porque las agencias verifican antes de publicar y corrigen en público cuando fallan. Esa rendición de cuentas es la señal clave.',
  '["Investiga: redactor identificado con nombre y cargo.","Rastrea: hora exacta y política pública de correcciones.","Formato de cable con hechos separables de opinión.","Dominio de agencia reconocible, no un clon improvisado."]'::jsonb,
  'Investiga firmas y rastrea horarios/correcciones: así se ve si la fuente rinde cuentas.',
  'Confiable'
) on conflict (item_id) do update set
  status = excluded.status,
  explanation = excluded.explanation,
  signals = excluded.signals,
  recommendation = excluded.recommendation,
  revealed_answer = excluded.revealed_answer;
insert into private_arcade.item_solution_private (
  item_id, solution_payload, evaluation_rule
) values (
  'b19efc06-57ef-0828-450b-529e4bbd5b33'::uuid,
  '{"classification":"reliable","evaluationSignals":["signed_reporter","exact_timestamp","public_corrections","agency_accountability"]}'::jsonb,
  '{"rule":"domain_mechanics"}'::jsonb
) on conflict (item_id) do update set
  solution_payload = excluded.solution_payload,
  evaluation_rule = excluded.evaluation_rule;
insert into private_arcade.item_media (
  item_id, kind, src, alt, decorative, width, height, fallback_text
) values (
  'b19efc06-57ef-0828-450b-529e4bbd5b33'::uuid,
  'none',
  null,
  null,
  true,
  null,
  null,
  'Sin media editorial.'
) on conflict (item_id) do update set
  kind = excluded.kind,
  src = excluded.src,
  alt = excluded.alt,
  decorative = excluded.decorative,
  width = excluded.width,
  height = excluded.height,
  fallback_text = excluded.fallback_text;

insert into private_arcade.game_items (
  item_id, game_code, mechanic, sequence, prompt, public_payload,
  content_version, editorial_status, editorial_item_id
) values (
  '2bab147b-b2a4-f02a-fabd-7c1fca23f9a6'::uuid,
  'radar-de-fuentes',
  'source_classification',
  5,
  'Investiga la fuente y rastrea su origen. ¿Dónde la ubicas?',
  '{"gameCode":"radar-de-fuentes","mechanic":"source_classification","itemId":"radar-de-fuentes-005","prompt":"Investiga la fuente y rastrea su origen. ¿Dónde la ubicas?","sourceName":"Agregador sin autor ni fecha","urlLabel":"https://noticiasrapidas24.info/nota/4471","description":"Texto copiado de otros portales. No firma nadie, no tiene fecha y no enlaza a la fuente original. Señales: sin autor, sin fecha, sin enlaces.","categories":["reliable","doubtful","fraudulent"]}'::jsonb,
  '2026-07-30.1',
  'approved',
  'radar-de-fuentes-005'
) on conflict (item_id) do update set
  prompt = excluded.prompt,
  public_payload = excluded.public_payload,
  content_version = excluded.content_version,
  editorial_status = excluded.editorial_status,
  editorial_item_id = excluded.editorial_item_id,
  updated_at = now();
insert into private_arcade.item_feedback (
  item_id, status, explanation, signals, recommendation, revealed_answer
) values (
  '2bab147b-b2a4-f02a-fabd-7c1fca23f9a6'::uuid,
  'instructive',
  'Es dudosa: sin autor ni fecha no hay a quién pedirle cuentas. Rastrea la noticia original antes de creerla.',
  '["Investiga: sin autor identificable ni fecha de publicación.","Rastrea: no enlaza la fuente original del texto.","El contenido parece reutilizado de otros portales.","No hay a quién pedirle cuentas."]'::jsonb,
  'Si nadie firma ni data la nota, rastrea el origen antes de compartirla o usarla como prueba.',
  'Dudosa'
) on conflict (item_id) do update set
  status = excluded.status,
  explanation = excluded.explanation,
  signals = excluded.signals,
  recommendation = excluded.recommendation,
  revealed_answer = excluded.revealed_answer;
insert into private_arcade.item_solution_private (
  item_id, solution_payload, evaluation_rule
) values (
  '2bab147b-b2a4-f02a-fabd-7c1fca23f9a6'::uuid,
  '{"classification":"doubtful","evaluationSignals":["missing_author","missing_date","no_source_links","aggregated_copy"]}'::jsonb,
  '{"rule":"domain_mechanics"}'::jsonb
) on conflict (item_id) do update set
  solution_payload = excluded.solution_payload,
  evaluation_rule = excluded.evaluation_rule;
insert into private_arcade.item_media (
  item_id, kind, src, alt, decorative, width, height, fallback_text
) values (
  '2bab147b-b2a4-f02a-fabd-7c1fca23f9a6'::uuid,
  'none',
  null,
  null,
  true,
  null,
  null,
  'Sin media editorial.'
) on conflict (item_id) do update set
  kind = excluded.kind,
  src = excluded.src,
  alt = excluded.alt,
  decorative = excluded.decorative,
  width = excluded.width,
  height = excluded.height,
  fallback_text = excluded.fallback_text;

insert into private_arcade.game_items (
  item_id, game_code, mechanic, sequence, prompt, public_payload,
  content_version, editorial_status, editorial_item_id
) values (
  'b388b7ff-264c-1ee8-a691-224d0619afdf'::uuid,
  'radar-de-fuentes',
  'source_classification',
  6,
  'Investiga la fuente y rastrea su origen. ¿Dónde la ubicas?',
  '{"gameCode":"radar-de-fuentes","mechanic":"source_classification","itemId":"radar-de-fuentes-008","prompt":"Investiga la fuente y rastrea su origen. ¿Dónde la ubicas?","sourceName":"Diario clonado","urlLabel":"https://elpais-internacional.press","description":"Copia el diseño de un diario famoso, pero el dominio es .press y todas las noticias atacan al mismo partido. Señales: suplantación de marca, sesgo total.","categories":["reliable","doubtful","fraudulent"]}'::jsonb,
  '2026-07-30.1',
  'approved',
  'radar-de-fuentes-008'
) on conflict (item_id) do update set
  prompt = excluded.prompt,
  public_payload = excluded.public_payload,
  content_version = excluded.content_version,
  editorial_status = excluded.editorial_status,
  editorial_item_id = excluded.editorial_item_id,
  updated_at = now();
insert into private_arcade.item_feedback (
  item_id, status, explanation, signals, recommendation, revealed_answer
) values (
  'b388b7ff-264c-1ee8-a691-224d0619afdf'::uuid,
  'instructive',
  'Es fraudulenta: suplanta una marca conocida cambiando el dominio. Mira siempre la barra de direcciones, no el logo.',
  '["Investiga: el dominio .press no es el del medio que imita.","Rastrea: la marca visual no coincide con la identidad editorial real.","Cobertura sesgada que empuja un único adversario político.","No ofrece una identidad editorial verificable propia."]'::jsonb,
  'Si el logo parece familiar, confirma el dominio oficial antes de creer o compartir la nota.',
  'Fraudulenta'
) on conflict (item_id) do update set
  status = excluded.status,
  explanation = excluded.explanation,
  signals = excluded.signals,
  recommendation = excluded.recommendation,
  revealed_answer = excluded.revealed_answer;
insert into private_arcade.item_solution_private (
  item_id, solution_payload, evaluation_rule
) values (
  'b388b7ff-264c-1ee8-a691-224d0619afdf'::uuid,
  '{"classification":"fraudulent","evaluationSignals":["brand_impersonation","lookalike_domain","coordinated_bias","fake_newsroom"]}'::jsonb,
  '{"rule":"domain_mechanics"}'::jsonb
) on conflict (item_id) do update set
  solution_payload = excluded.solution_payload,
  evaluation_rule = excluded.evaluation_rule;
insert into private_arcade.item_media (
  item_id, kind, src, alt, decorative, width, height, fallback_text
) values (
  'b388b7ff-264c-1ee8-a691-224d0619afdf'::uuid,
  'none',
  null,
  null,
  true,
  null,
  null,
  'Sin media editorial.'
) on conflict (item_id) do update set
  kind = excluded.kind,
  src = excluded.src,
  alt = excluded.alt,
  decorative = excluded.decorative,
  width = excluded.width,
  height = excluded.height,
  fallback_text = excluded.fallback_text;

insert into private_arcade.game_items (
  item_id, game_code, mechanic, sequence, prompt, public_payload,
  content_version, editorial_status, editorial_item_id
) values (
  'a9d1a0cd-21ab-4946-6549-fa0aa6ccbe76'::uuid,
  'radar-de-fuentes',
  'source_classification',
  7,
  'Investiga la fuente y rastrea su origen. ¿Dónde la ubicas?',
  '{"gameCode":"radar-de-fuentes","mechanic":"source_classification","itemId":"radar-de-fuentes-003","prompt":"Investiga la fuente y rastrea su origen. ¿Dónde la ubicas?","sourceName":"Artículo en revista científica con DOI","urlLabel":"https://revistas.cienciaabierta.org/articulo/10.1234/demo","description":"Estudio con DOI, metodología descrita, revisión por pares y declaración de conflictos. Señales: DOI, peer review, método abierto.","categories":["reliable","doubtful","fraudulent"]}'::jsonb,
  '2026-07-30.1',
  'approved',
  'radar-de-fuentes-003'
) on conflict (item_id) do update set
  prompt = excluded.prompt,
  public_payload = excluded.public_payload,
  content_version = excluded.content_version,
  editorial_status = excluded.editorial_status,
  editorial_item_id = excluded.editorial_item_id,
  updated_at = now();
insert into private_arcade.item_feedback (
  item_id, status, explanation, signals, recommendation, revealed_answer
) values (
  'a9d1a0cd-21ab-4946-6549-fa0aa6ccbe76'::uuid,
  'instructive',
  'Es confiable: el DOI permite rastrearlo y la revisión por pares indica que otros expertos lo examinaron antes de publicarse.',
  '["Investiga: DOI, metodología abierta y declaración de conflictos.","Rastrea: la revisión por pares y el identificador permiten localizar el original.","No es un resumen viral sin fuente.","El dominio de revista científica es verificable."]'::jsonb,
  'En ciencia, investiga método y conflictos; rastrea el DOI antes de aceptar un hallazgo viral.',
  'Confiable'
) on conflict (item_id) do update set
  status = excluded.status,
  explanation = excluded.explanation,
  signals = excluded.signals,
  recommendation = excluded.recommendation,
  revealed_answer = excluded.revealed_answer;
insert into private_arcade.item_solution_private (
  item_id, solution_payload, evaluation_rule
) values (
  'a9d1a0cd-21ab-4946-6549-fa0aa6ccbe76'::uuid,
  '{"classification":"reliable","evaluationSignals":["doi_present","peer_review","open_methodology","conflict_disclosure"]}'::jsonb,
  '{"rule":"domain_mechanics"}'::jsonb
) on conflict (item_id) do update set
  solution_payload = excluded.solution_payload,
  evaluation_rule = excluded.evaluation_rule;
insert into private_arcade.item_media (
  item_id, kind, src, alt, decorative, width, height, fallback_text
) values (
  'a9d1a0cd-21ab-4946-6549-fa0aa6ccbe76'::uuid,
  'none',
  null,
  null,
  true,
  null,
  null,
  'Sin media editorial.'
) on conflict (item_id) do update set
  kind = excluded.kind,
  src = excluded.src,
  alt = excluded.alt,
  decorative = excluded.decorative,
  width = excluded.width,
  height = excluded.height,
  fallback_text = excluded.fallback_text;

insert into private_arcade.game_items (
  item_id, game_code, mechanic, sequence, prompt, public_payload,
  content_version, editorial_status, editorial_item_id
) values (
  '9da30bcb-66d9-5218-e933-fab64ecd8d5d'::uuid,
  'radar-de-fuentes',
  'source_classification',
  8,
  'Investiga la fuente y rastrea su origen. ¿Dónde la ubicas?',
  '{"gameCode":"radar-de-fuentes","mechanic":"source_classification","itemId":"radar-de-fuentes-006","prompt":"Investiga la fuente y rastrea su origen. ¿Dónde la ubicas?","sourceName":"Cuenta de humor satírico","urlLabel":"https://eldiariodelamedialuna.satira","description":"Noticias inventadas con fines de humor. En «Acerca de» lo declara abiertamente. Señales: sátira declarada.","categories":["reliable","doubtful","fraudulent"]}'::jsonb,
  '2026-07-30.1',
  'approved',
  'radar-de-fuentes-006'
) on conflict (item_id) do update set
  prompt = excluded.prompt,
  public_payload = excluded.public_payload,
  content_version = excluded.content_version,
  editorial_status = excluded.editorial_status,
  editorial_item_id = excluded.editorial_item_id,
  updated_at = now();
insert into private_arcade.item_feedback (
  item_id, status, explanation, signals, recommendation, revealed_answer
) values (
  '9da30bcb-66d9-5218-e933-fab64ecd8d5d'::uuid,
  'instructive',
  'Es dudosa por sátira: no busca engañar, pero sacada de contexto circula como noticia real. Lee siempre el «Acerca de» del sitio.',
  '["Investiga: el sitio declara humor o sátira en «Acerca de».","Rastrea: el origen aclara que inventa hechos para reír, no para informar.","Fuera de contexto puede circular como noticia real.","No aporta autoría periodística ni correcciones de hechos."]'::jsonb,
  'La sátira no es fraude, pero tampoco es evidencia: comprueba el «Acerca de» antes de tomarla en serio.',
  'Dudosa'
) on conflict (item_id) do update set
  status = excluded.status,
  explanation = excluded.explanation,
  signals = excluded.signals,
  recommendation = excluded.recommendation,
  revealed_answer = excluded.revealed_answer;
insert into private_arcade.item_solution_private (
  item_id, solution_payload, evaluation_rule
) values (
  '9da30bcb-66d9-5218-e933-fab64ecd8d5d'::uuid,
  '{"classification":"doubtful","evaluationSignals":["declared_satire","humor_not_reporting","context_collapse_risk","not_evidence"]}'::jsonb,
  '{"rule":"domain_mechanics"}'::jsonb
) on conflict (item_id) do update set
  solution_payload = excluded.solution_payload,
  evaluation_rule = excluded.evaluation_rule;
insert into private_arcade.item_media (
  item_id, kind, src, alt, decorative, width, height, fallback_text
) values (
  '9da30bcb-66d9-5218-e933-fab64ecd8d5d'::uuid,
  'none',
  null,
  null,
  true,
  null,
  null,
  'Sin media editorial.'
) on conflict (item_id) do update set
  kind = excluded.kind,
  src = excluded.src,
  alt = excluded.alt,
  decorative = excluded.decorative,
  width = excluded.width,
  height = excluded.height,
  fallback_text = excluded.fallback_text;

insert into private_arcade.game_items (
  item_id, game_code, mechanic, sequence, prompt, public_payload,
  content_version, editorial_status, editorial_item_id
) values (
  '251c8e85-1b80-4ae7-3fe3-1c17635046e0'::uuid,
  'radar-de-fuentes',
  'source_classification',
  9,
  'Investiga la fuente y rastrea su origen. ¿Dónde la ubicas?',
  '{"gameCode":"radar-de-fuentes","mechanic":"source_classification","itemId":"radar-de-fuentes-009","prompt":"Investiga la fuente y rastrea su origen. ¿Dónde la ubicas?","sourceName":"Perfil «Noticias Verdaderas Oficial»","urlLabel":"https://social.example-net/NoticiasVerdaderas_Oficial","description":"Cuenta creada hace 3 semanas, foto genérica, publica 40 veces al día y nunca enlaza fuentes. Señales: cuenta nueva, volumen extremo, cero fuentes.","categories":["reliable","doubtful","fraudulent"]}'::jsonb,
  '2026-07-30.1',
  'approved',
  'radar-de-fuentes-009'
) on conflict (item_id) do update set
  prompt = excluded.prompt,
  public_payload = excluded.public_payload,
  content_version = excluded.content_version,
  editorial_status = excluded.editorial_status,
  editorial_item_id = excluded.editorial_item_id,
  updated_at = now();
insert into private_arcade.item_feedback (
  item_id, status, explanation, signals, recommendation, revealed_answer
) values (
  '251c8e85-1b80-4ae7-3fe3-1c17635046e0'::uuid,
  'instructive',
  'Es fraudulenta: patrón de granja de desinformación con cuenta nueva, volumen inhumano de publicaciones y ninguna fuente enlazada.',
  '["Investiga: cuenta creada hace pocas semanas con identidad genérica.","Rastrea: nunca enlaza fuentes comprobables; el origen se pierde.","Volumen extremo: decenas de publicaciones al día.","Patrón típico de granja de desinformación."]'::jsonb,
  'Cuenta nueva + volumen inhumano + cero fuentes suele ser una granja de desinformación, no un medio.',
  'Fraudulenta'
) on conflict (item_id) do update set
  status = excluded.status,
  explanation = excluded.explanation,
  signals = excluded.signals,
  recommendation = excluded.recommendation,
  revealed_answer = excluded.revealed_answer;
insert into private_arcade.item_solution_private (
  item_id, solution_payload, evaluation_rule
) values (
  '251c8e85-1b80-4ae7-3fe3-1c17635046e0'::uuid,
  '{"classification":"fraudulent","evaluationSignals":["new_account","inhuman_volume","generic_identity","zero_sources"]}'::jsonb,
  '{"rule":"domain_mechanics"}'::jsonb
) on conflict (item_id) do update set
  solution_payload = excluded.solution_payload,
  evaluation_rule = excluded.evaluation_rule;
insert into private_arcade.item_media (
  item_id, kind, src, alt, decorative, width, height, fallback_text
) values (
  '251c8e85-1b80-4ae7-3fe3-1c17635046e0'::uuid,
  'none',
  null,
  null,
  true,
  null,
  null,
  'Sin media editorial.'
) on conflict (item_id) do update set
  kind = excluded.kind,
  src = excluded.src,
  alt = excluded.alt,
  decorative = excluded.decorative,
  width = excluded.width,
  height = excluded.height,
  fallback_text = excluded.fallback_text;

insert into private_arcade.game_items (
  item_id, game_code, mechanic, sequence, prompt, public_payload,
  content_version, editorial_status, editorial_item_id
) values (
  '28f8702c-d247-b417-5bb9-5aa4a57c199f'::uuid,
  'feed-60',
  'timed_feed',
  1,
  'Minsa: campaña de vacunación gratuita del 5 al 12 de agosto en todos los centros de salud.',
  '{"gameCode":"feed-60","mechanic":"timed_feed","itemId":"feed-60-001","prompt":"Minsa: campaña de vacunación gratuita del 5 al 12 de agosto en todos los centros de salud.","post":"Comunicado con fechas concretas y cobertura en medios serios.","sourceLabel":"minsa.gob.pe · cuenta verificada","actions":["verify","share","discard"],"remainingSeconds":60,"verificationAvailable":true}'::jsonb,
  '2026-07-30.1',
  'approved',
  'feed-60-001'
) on conflict (item_id) do update set
  prompt = excluded.prompt,
  public_payload = excluded.public_payload,
  content_version = excluded.content_version,
  editorial_status = excluded.editorial_status,
  editorial_item_id = excluded.editorial_item_id,
  updated_at = now();
insert into private_arcade.item_feedback (
  item_id, status, explanation, signals, recommendation, revealed_answer
) values (
  '28f8702c-d247-b417-5bb9-5aa4a57c199f'::uuid,
  'instructive',
  'Es un aviso oficial útil: dominio institucional, fecha concreta y cobertura en medios serios. Compartirlo ayuda a la comunidad.',
  '["Encuentra mejor cobertura: otros medios serios replican la misma campaña de vacunación.","Rastrea el original: el comunicado en minsa.gob.pe es la fuente primaria.","Dominio institucional y fechas concretas, sin urgencia emocional.","Compartir información de servicio verificada ayuda a la comunidad."]'::jsonb,
  'Cuando la fuente oficial, la fecha y la cobertura coinciden, compartir información de servicio es una decisión responsable.',
  'Compartir'
) on conflict (item_id) do update set
  status = excluded.status,
  explanation = excluded.explanation,
  signals = excluded.signals,
  recommendation = excluded.recommendation,
  revealed_answer = excluded.revealed_answer;
insert into private_arcade.item_solution_private (
  item_id, solution_payload, evaluation_rule
) values (
  '28f8702c-d247-b417-5bb9-5aa4a57c199f'::uuid,
  '{"appropriateDecision":"share","postKind":"reliable","evaluationSignals":["official_domain","concrete_dates","serious_corroboration","service_information"],"verificationHints":["Cobertura: medios serios replican la campaña.","Original: comunicado en minsa.gob.pe.","Fechas y centros de salud concretos."]}'::jsonb,
  '{"rule":"domain_mechanics"}'::jsonb
) on conflict (item_id) do update set
  solution_payload = excluded.solution_payload,
  evaluation_rule = excluded.evaluation_rule;
insert into private_arcade.item_media (
  item_id, kind, src, alt, decorative, width, height, fallback_text
) values (
  '28f8702c-d247-b417-5bb9-5aa4a57c199f'::uuid,
  'none',
  null,
  null,
  true,
  null,
  null,
  'Sin media editorial.'
) on conflict (item_id) do update set
  kind = excluded.kind,
  src = excluded.src,
  alt = excluded.alt,
  decorative = excluded.decorative,
  width = excluded.width,
  height = excluded.height,
  fallback_text = excluded.fallback_text;

insert into private_arcade.game_items (
  item_id, game_code, mechanic, sequence, prompt, public_payload,
  content_version, editorial_status, editorial_item_id
) values (
  '9bdfa9a0-0627-164c-3024-dea9f9717a3c'::uuid,
  'feed-60',
  'timed_feed',
  2,
  '¡¡ESCÁNDALO!! Celebridad DESTRUYE su carrera en video FILTRADO. No dura nada online.',
  '{"gameCode":"feed-60","mechanic":"timed_feed","itemId":"feed-60-002","prompt":"¡¡ESCÁNDALO!! Celebridad DESTRUYE su carrera en video FILTRADO. No dura nada online.","post":"Sin autor, sin fecha y dominio dudoso. ¿Lo amplificas?","sourceLabel":"farandula-viral.top · sin autor ni fecha","actions":["verify","share","discard"],"remainingSeconds":60,"verificationAvailable":true}'::jsonb,
  '2026-07-30.1',
  'approved',
  'feed-60-002'
) on conflict (item_id) do update set
  prompt = excluded.prompt,
  public_payload = excluded.public_payload,
  content_version = excluded.content_version,
  editorial_status = excluded.editorial_status,
  editorial_item_id = excluded.editorial_item_id,
  updated_at = now();
insert into private_arcade.item_feedback (
  item_id, status, explanation, signals, recommendation, revealed_answer
) values (
  '9bdfa9a0-0627-164c-3024-dea9f9717a3c'::uuid,
  'instructive',
  'Es humo: dominio dudoso, cero autoría, titular 100 % emocional y ningún medio serio lo reporta. Descartarlo evita amplificar un rumor.',
  '["Encuentra mejor cobertura: ningún medio serio reporta el supuesto video.","Rastrea el original: no hay archivo, comunicado ni fuente primaria.","Dominio .top opaco, sin autoría.","Titular 100 % emocional que empuja el clic, no el dato."]'::jsonb,
  'Si solo hay emoción y un dominio opaco, descarta antes de compartir.',
  'Descartar'
) on conflict (item_id) do update set
  status = excluded.status,
  explanation = excluded.explanation,
  signals = excluded.signals,
  recommendation = excluded.recommendation,
  revealed_answer = excluded.revealed_answer;
insert into private_arcade.item_solution_private (
  item_id, solution_payload, evaluation_rule
) values (
  '9bdfa9a0-0627-164c-3024-dea9f9717a3c'::uuid,
  '{"appropriateDecision":"discard","postKind":"false","evaluationSignals":["opaque_domain","no_authorship","emotional_headline","no_serious_coverage"],"verificationHints":["Cobertura: ningún medio serio lo reporta.","Original: no hay video ni fuente primaria.","Dominio .top sin autoría ni fecha."]}'::jsonb,
  '{"rule":"domain_mechanics"}'::jsonb
) on conflict (item_id) do update set
  solution_payload = excluded.solution_payload,
  evaluation_rule = excluded.evaluation_rule;
insert into private_arcade.item_media (
  item_id, kind, src, alt, decorative, width, height, fallback_text
) values (
  '9bdfa9a0-0627-164c-3024-dea9f9717a3c'::uuid,
  'none',
  null,
  null,
  true,
  null,
  null,
  'Sin media editorial.'
) on conflict (item_id) do update set
  kind = excluded.kind,
  src = excluded.src,
  alt = excluded.alt,
  decorative = excluded.decorative,
  width = excluded.width,
  height = excluded.height,
  fallback_text = excluded.fallback_text;

insert into private_arcade.game_items (
  item_id, game_code, mechanic, sequence, prompt, public_payload,
  content_version, editorial_status, editorial_item_id
) values (
  '4b86f175-9235-451b-b71d-46d06cb3d9f4'::uuid,
  'feed-60',
  'timed_feed',
  3,
  'Así está AHORA el centro de la ciudad, todo inundado. Difundan.',
  '{"gameCode":"feed-60","mechanic":"timed_feed","itemId":"feed-60-003","prompt":"Así está AHORA el centro de la ciudad, todo inundado. Difundan.","post":"Foto impactante reenviada por una cuenta anónima.","sourceLabel":"usuario anónimo · hace 20 min","actions":["verify","share","discard"],"remainingSeconds":60,"verificationAvailable":true,"media":{"kind":"image","src":"/media/feed-60/avenida-inundada-768.webp","alt":"Avenida urbana bajo el agua después de una inundación, con vehículos parcialmente sumergidos.","decorative":false,"width":768,"height":511,"fallbackText":"La imagen no está disponible. La pregunta sigue abierta y las pistas educativas se conservan en el feedback.","srcSet":{"480":"/media/feed-60/avenida-inundada-480.webp","768":"/media/feed-60/avenida-inundada-768.webp","1280":"/media/feed-60/avenida-inundada-1280.webp"}}}'::jsonb,
  '2026-07-30.1',
  'approved',
  'feed-60-003'
) on conflict (item_id) do update set
  prompt = excluded.prompt,
  public_payload = excluded.public_payload,
  content_version = excluded.content_version,
  editorial_status = excluded.editorial_status,
  editorial_item_id = excluded.editorial_item_id,
  updated_at = now();
insert into private_arcade.item_feedback (
  item_id, status, explanation, signals, recommendation, revealed_answer
) values (
  '4b86f175-9235-451b-b71d-46d06cb3d9f4'::uuid,
  'instructive',
  'La imagen puede ser real, pero el contexto es falso: proviene de una inundación de 2018 y ningún medio reporta una inundación hoy. Buscar cobertura y rastrear el original lo revelan en segundos.',
  '["Encuentra mejor cobertura: ningún medio reporta inundación en el centro hoy.","Rastrea el original: la búsqueda inversa sitúa la foto en 2018.","«AHORA» y una foto impactante no bastan para afirmar un hecho actual.","La cuenta es anónima y no aporta lugar ni hora verificables."]'::jsonb,
  'Antes de compartir una imagen viral, rastrea si el contexto y la fecha coinciden con el presente.',
  'Descartar'
) on conflict (item_id) do update set
  status = excluded.status,
  explanation = excluded.explanation,
  signals = excluded.signals,
  recommendation = excluded.recommendation,
  revealed_answer = excluded.revealed_answer;
insert into private_arcade.item_solution_private (
  item_id, solution_payload, evaluation_rule
) values (
  '4b86f175-9235-451b-b71d-46d06cb3d9f4'::uuid,
  '{"appropriateDecision":"discard","postKind":"out_of_context","evaluationSignals":["recycled_image","anonymous_source","false_present_tense","no_current_coverage"],"verificationHints":["Cobertura: ningún medio reporta inundación hoy.","Original: búsqueda inversa sitúa la foto en 2018.","La imagen puede ser real; el contexto no."]}'::jsonb,
  '{"rule":"domain_mechanics"}'::jsonb
) on conflict (item_id) do update set
  solution_payload = excluded.solution_payload,
  evaluation_rule = excluded.evaluation_rule;
insert into private_arcade.item_media (
  item_id, kind, src, alt, decorative, width, height, fallback_text
) values (
  '4b86f175-9235-451b-b71d-46d06cb3d9f4'::uuid,
  'image',
  '/media/feed-60/avenida-inundada-768.webp',
  'Avenida urbana bajo el agua después de una inundación, con vehículos parcialmente sumergidos.',
  false,
  768,
  511,
  'La imagen no está disponible. La pregunta sigue abierta y las pistas educativas se conservan en el feedback.'
) on conflict (item_id) do update set
  kind = excluded.kind,
  src = excluded.src,
  alt = excluded.alt,
  decorative = excluded.decorative,
  width = excluded.width,
  height = excluded.height,
  fallback_text = excluded.fallback_text;

insert into private_arcade.game_items (
  item_id, game_code, mechanic, sequence, prompt, public_payload,
  content_version, editorial_status, editorial_item_id
) values (
  '1de6b5b6-1c41-5e22-bf3a-3da3596bee70'::uuid,
  'feed-60',
  'timed_feed',
  4,
  'Caminar 30 minutos al día reduce el riesgo cardiovascular, según estudio con revisión por pares.',
  '{"gameCode":"feed-60","mechanic":"timed_feed","itemId":"feed-60-004","prompt":"Caminar 30 minutos al día reduce el riesgo cardiovascular, según estudio con revisión por pares.","post":"El portal cita el DOI del estudio y usa lenguaje prudente.","sourceLabel":"portal-salud.org · cita el DOI del estudio","actions":["verify","share","discard"],"remainingSeconds":60,"verificationAvailable":true}'::jsonb,
  '2026-07-30.1',
  'approved',
  'feed-60-004'
) on conflict (item_id) do update set
  prompt = excluded.prompt,
  public_payload = excluded.public_payload,
  content_version = excluded.content_version,
  editorial_status = excluded.editorial_status,
  editorial_item_id = excluded.editorial_item_id,
  updated_at = now();
insert into private_arcade.item_feedback (
  item_id, status, explanation, signals, recommendation, revealed_answer
) values (
  '1de6b5b6-1c41-5e22-bf3a-3da3596bee70'::uuid,
  'instructive',
  'Ciencia con fuente rastreable y lenguaje prudente: el DOI existe, el estudio dice eso y no promete milagros.',
  '["Encuentra mejor cobertura: el hallazgo aparece en una revista con revisión por pares.","Rastrea el original: el DOI existe y sostiene la afirmación con matices.","Lenguaje prudente, sin promesa milagrosa ni urgencia.","El portal cita un estudio comprobable, no un rumor."]'::jsonb,
  'Cuando hay DOI, revisión por pares y lenguaje mesurado, compartir información útil es adecuado.',
  'Compartir'
) on conflict (item_id) do update set
  status = excluded.status,
  explanation = excluded.explanation,
  signals = excluded.signals,
  recommendation = excluded.recommendation,
  revealed_answer = excluded.revealed_answer;
insert into private_arcade.item_solution_private (
  item_id, solution_payload, evaluation_rule
) values (
  '1de6b5b6-1c41-5e22-bf3a-3da3596bee70'::uuid,
  '{"appropriateDecision":"share","postKind":"reliable","evaluationSignals":["doi_cited","peer_reviewed","prudent_language","study_exists"],"verificationHints":["Cobertura: revista con revisión por pares.","Original: DOI rastreable del estudio.","Lenguaje prudente, sin milagros."]}'::jsonb,
  '{"rule":"domain_mechanics"}'::jsonb
) on conflict (item_id) do update set
  solution_payload = excluded.solution_payload,
  evaluation_rule = excluded.evaluation_rule;
insert into private_arcade.item_media (
  item_id, kind, src, alt, decorative, width, height, fallback_text
) values (
  '1de6b5b6-1c41-5e22-bf3a-3da3596bee70'::uuid,
  'none',
  null,
  null,
  true,
  null,
  null,
  'Sin media editorial.'
) on conflict (item_id) do update set
  kind = excluded.kind,
  src = excluded.src,
  alt = excluded.alt,
  decorative = excluded.decorative,
  width = excluded.width,
  height = excluded.height,
  fallback_text = excluded.fallback_text;

insert into private_arcade.game_items (
  item_id, game_code, mechanic, sequence, prompt, public_payload,
  content_version, editorial_status, editorial_item_id
) values (
  '42b97789-dd01-4ed7-78ca-a77f71063491'::uuid,
  'feed-60',
  'timed_feed',
  5,
  'AUDIO: «Las vacunas traen microchips, lo escuché de un enfermero que lo vio con sus propios ojos».',
  '{"gameCode":"feed-60","mechanic":"timed_feed","itemId":"feed-60-005","prompt":"AUDIO: «Las vacunas traen microchips, lo escuché de un enfermero que lo vio con sus propios ojos».","post":"Nota de voz de 4 minutos, reenviada muchas veces.","sourceLabel":"reenviado muchas veces","actions":["verify","share","discard"],"remainingSeconds":60,"verificationAvailable":true}'::jsonb,
  '2026-07-30.1',
  'approved',
  'feed-60-005'
) on conflict (item_id) do update set
  prompt = excluded.prompt,
  public_payload = excluded.public_payload,
  content_version = excluded.content_version,
  editorial_status = excluded.editorial_status,
  editorial_item_id = excluded.editorial_item_id,
  updated_at = now();
insert into private_arcade.item_feedback (
  item_id, status, explanation, signals, recommendation, revealed_answer
) values (
  '42b97789-dd01-4ed7-78ca-a77f71063491'::uuid,
  'instructive',
  'Es un bulo desmentido: la fuente es «un enfermero» anónimo, apela al miedo y verificadores lo desmintieron hace años.',
  '["Encuentra mejor cobertura: verificadores desmintieron esta teoría desde 2021.","Rastrea el original: no hay evidencia primaria, solo anécdota reenviada.","«Un enfermero» anónimo no es una fuente ubicable.","La cadena apela al miedo y pide credibilidad por repetición."]'::jsonb,
  'Si la prueba es «lo escuché de alguien», descarta y busca un desmentido o una fuente sanitaria.',
  'Descartar'
) on conflict (item_id) do update set
  status = excluded.status,
  explanation = excluded.explanation,
  signals = excluded.signals,
  recommendation = excluded.recommendation,
  revealed_answer = excluded.revealed_answer;
insert into private_arcade.item_solution_private (
  item_id, solution_payload, evaluation_rule
) values (
  '42b97789-dd01-4ed7-78ca-a77f71063491'::uuid,
  '{"appropriateDecision":"discard","postKind":"false","evaluationSignals":["anonymous_anecdote","fear_appeal","debunked_claim","chain_forwarding"],"verificationHints":["Cobertura: desmentidos desde 2021.","Original: solo anécdota, cero evidencia primaria.","Apela al miedo, no a datos."]}'::jsonb,
  '{"rule":"domain_mechanics"}'::jsonb
) on conflict (item_id) do update set
  solution_payload = excluded.solution_payload,
  evaluation_rule = excluded.evaluation_rule;
insert into private_arcade.item_media (
  item_id, kind, src, alt, decorative, width, height, fallback_text
) values (
  '42b97789-dd01-4ed7-78ca-a77f71063491'::uuid,
  'none',
  null,
  null,
  true,
  null,
  null,
  'Sin media editorial.'
) on conflict (item_id) do update set
  kind = excluded.kind,
  src = excluded.src,
  alt = excluded.alt,
  decorative = excluded.decorative,
  width = excluded.width,
  height = excluded.height,
  fallback_text = excluded.fallback_text;

insert into private_arcade.game_items (
  item_id, game_code, mechanic, sequence, prompt, public_payload,
  content_version, editorial_status, editorial_item_id
) values (
  '7f3fb3ff-a508-16dc-46ec-94c8ee71a928'::uuid,
  'feed-60',
  'timed_feed',
  6,
  'Hombre se casa con su router wifi: «Nunca me falló, siempre estuvo ahí».',
  '{"gameCode":"feed-60","mechanic":"timed_feed","itemId":"feed-60-006","prompt":"Hombre se casa con su router wifi: «Nunca me falló, siempre estuvo ahí».","post":"Titular absurdo publicado en un medio que se declara humorístico.","sourceLabel":"El Faro Satírico · humor","actions":["verify","share","discard"],"remainingSeconds":60,"verificationAvailable":true}'::jsonb,
  '2026-07-30.1',
  'approved',
  'feed-60-006'
) on conflict (item_id) do update set
  prompt = excluded.prompt,
  public_payload = excluded.public_payload,
  content_version = excluded.content_version,
  editorial_status = excluded.editorial_status,
  editorial_item_id = excluded.editorial_item_id,
  updated_at = now();
insert into private_arcade.item_feedback (
  item_id, status, explanation, signals, recommendation, revealed_answer
) values (
  '7f3fb3ff-a508-16dc-46ec-94c8ee71a928'::uuid,
  'instructive',
  'Es sátira: el sitio se declara humorístico. Compartirla como noticia confunde; descartarla como hecho es la decisión adecuada.',
  '["Encuentra mejor cobertura: no hay cobertura periodística porque no es un hecho.","Rastrea el original: el propio medio aclara en «Acerca de» que es humor.","El escenario absurdo pide una lectura crítica antes de compartirlo como noticia.","Fuera de contexto, la sátira circula como si fuera real."]'::jsonb,
  'Antes de compartir un titular raro, revisa si el medio es satírico; fuera de contexto confunde.',
  'Descartar'
) on conflict (item_id) do update set
  status = excluded.status,
  explanation = excluded.explanation,
  signals = excluded.signals,
  recommendation = excluded.recommendation,
  revealed_answer = excluded.revealed_answer;
insert into private_arcade.item_solution_private (
  item_id, solution_payload, evaluation_rule
) values (
  '7f3fb3ff-a508-16dc-46ec-94c8ee71a928'::uuid,
  '{"appropriateDecision":"discard","postKind":"satire","evaluationSignals":["declared_satire","absurd_scenario","missing_news_context","humor_not_report"],"verificationHints":["Cobertura: no es noticia; es humor.","Original: «Acerca de» declara sátira.","Sin contexto confunde."]}'::jsonb,
  '{"rule":"domain_mechanics"}'::jsonb
) on conflict (item_id) do update set
  solution_payload = excluded.solution_payload,
  evaluation_rule = excluded.evaluation_rule;
insert into private_arcade.item_media (
  item_id, kind, src, alt, decorative, width, height, fallback_text
) values (
  '7f3fb3ff-a508-16dc-46ec-94c8ee71a928'::uuid,
  'none',
  null,
  null,
  true,
  null,
  null,
  'Sin media editorial.'
) on conflict (item_id) do update set
  kind = excluded.kind,
  src = excluded.src,
  alt = excluded.alt,
  decorative = excluded.decorative,
  width = excluded.width,
  height = excluded.height,
  fallback_text = excluded.fallback_text;

insert into private_arcade.game_items (
  item_id, game_code, mechanic, sequence, prompt, public_payload,
  content_version, editorial_status, editorial_item_id
) values (
  '80c72000-6c1e-7665-1b5b-0ddffdecf480'::uuid,
  'feed-60',
  'timed_feed',
  7,
  'El Banco Central mantiene la tasa de interés en 5,75 %, según comunicado oficial publicado hoy.',
  '{"gameCode":"feed-60","mechanic":"timed_feed","itemId":"feed-60-007","prompt":"El Banco Central mantiene la tasa de interés en 5,75 %, según comunicado oficial publicado hoy.","post":"Cifra exacta y lenguaje institucional, sin carga emocional.","sourceLabel":"bcr.gob.pe · comunicado","actions":["verify","share","discard"],"remainingSeconds":60,"verificationAvailable":true}'::jsonb,
  '2026-07-30.1',
  'approved',
  'feed-60-007'
) on conflict (item_id) do update set
  prompt = excluded.prompt,
  public_payload = excluded.public_payload,
  content_version = excluded.content_version,
  editorial_status = excluded.editorial_status,
  editorial_item_id = excluded.editorial_item_id,
  updated_at = now();
insert into private_arcade.item_feedback (
  item_id, status, explanation, signals, recommendation, revealed_answer
) values (
  '80c72000-6c1e-7665-1b5b-0ddffdecf480'::uuid,
  'instructive',
  'Es un dato oficial y verificable: comunicado institucional, cifra exacta y lenguaje sin carga emocional.',
  '["Encuentra mejor cobertura: el comunicado se puede contrastar con el sitio institucional.","Rastrea el original: el comunicado oficial con fecha es la fuente primaria.","bcr.gob.pe es el dominio oficial del Banco Central.","Cifra exacta y lenguaje sin carga emocional."]'::jsonb,
  'Compartir un comunicado oficial con cifra y fecha ayuda a informar sin distorsionar.',
  'Compartir'
) on conflict (item_id) do update set
  status = excluded.status,
  explanation = excluded.explanation,
  signals = excluded.signals,
  recommendation = excluded.recommendation,
  revealed_answer = excluded.revealed_answer;
insert into private_arcade.item_solution_private (
  item_id, solution_payload, evaluation_rule
) values (
  '80c72000-6c1e-7665-1b5b-0ddffdecf480'::uuid,
  '{"appropriateDecision":"share","postKind":"reliable","evaluationSignals":["official_communique","exact_figure","institutional_language","dated_source"],"verificationHints":["Cobertura: coincide con sitio institucional.","Original: comunicado oficial con fecha.","Dato exacto y verificable."]}'::jsonb,
  '{"rule":"domain_mechanics"}'::jsonb
) on conflict (item_id) do update set
  solution_payload = excluded.solution_payload,
  evaluation_rule = excluded.evaluation_rule;
insert into private_arcade.item_media (
  item_id, kind, src, alt, decorative, width, height, fallback_text
) values (
  '80c72000-6c1e-7665-1b5b-0ddffdecf480'::uuid,
  'none',
  null,
  null,
  true,
  null,
  null,
  'Sin media editorial.'
) on conflict (item_id) do update set
  kind = excluded.kind,
  src = excluded.src,
  alt = excluded.alt,
  decorative = excluded.decorative,
  width = excluded.width,
  height = excluded.height,
  fallback_text = excluded.fallback_text;

insert into private_arcade.game_items (
  item_id, game_code, mechanic, sequence, prompt, public_payload,
  content_version, editorial_status, editorial_item_id
) values (
  '815cd37c-4be7-d462-3c22-a52715586596'::uuid,
  'feed-60',
  'timed_feed',
  8,
  '¡El desempleo se DISPARA! Mira este gráfico — y esta foto del «caos» en la ciudad.',
  '{"gameCode":"feed-60","mechanic":"timed_feed","itemId":"feed-60-008","prompt":"¡El desempleo se DISPARA! Mira este gráfico — y esta foto del «caos» en la ciudad.","post":"Blog anónimo mezcla un gráfico y una imagen impactante.","sourceLabel":"blog-politico.anon","actions":["verify","share","discard"],"remainingSeconds":60,"verificationAvailable":true,"media":{"kind":"image","src":"/media/feed-60/incendio-humo-768.webp","alt":"Columna de humo denso sobre un paisaje urbano al atardecer.","decorative":false,"width":768,"height":512,"fallbackText":"La imagen no está disponible. La pregunta sigue abierta y las pistas educativas se conservan en el feedback.","srcSet":{"480":"/media/feed-60/incendio-humo-480.webp","768":"/media/feed-60/incendio-humo-768.webp","1280":"/media/feed-60/incendio-humo-1280.webp"}}}'::jsonb,
  '2026-07-30.1',
  'approved',
  'feed-60-008'
) on conflict (item_id) do update set
  prompt = excluded.prompt,
  public_payload = excluded.public_payload,
  content_version = excluded.content_version,
  editorial_status = excluded.editorial_status,
  editorial_item_id = excluded.editorial_item_id,
  updated_at = now();
insert into private_arcade.item_feedback (
  item_id, status, explanation, signals, recommendation, revealed_answer
) values (
  '815cd37c-4be7-d462-3c22-a52715586596'::uuid,
  'instructive',
  'Los números existen, pero el gráfico manipula la escala y la foto de humo no demuestra el dato. Buscar cobertura oficial y rastrear el original revelan la manipulación visual.',
  '["Encuentra mejor cobertura: series oficiales muestran un cambio pequeño, no un drama.","Rastrea el original: el eje Y truncado y la foto de humo no prueban un salto de desempleo.","El titular grita «DISPARA» antes de mostrar la magnitud real.","Un blog anónimo mezcla gráfico manipulado e imagen impactante sin metodología."]'::jsonb,
  'Antes de compartir un gráfico viral, mira la escala: un eje truncado puede mentir sin inventar números.',
  'Descartar'
) on conflict (item_id) do update set
  status = excluded.status,
  explanation = excluded.explanation,
  signals = excluded.signals,
  recommendation = excluded.recommendation,
  revealed_answer = excluded.revealed_answer;
insert into private_arcade.item_solution_private (
  item_id, solution_payload, evaluation_rule
) values (
  '815cd37c-4be7-d462-3c22-a52715586596'::uuid,
  '{"appropriateDecision":"discard","postKind":"out_of_context","evaluationSignals":["truncated_axis","exaggerated_headline","anonymous_blog","visual_manipulation"],"verificationHints":["Cobertura: series oficiales sin eje recortado.","Original: eje truncado + foto fuera de contexto.","Los números existen; la exageración también."]}'::jsonb,
  '{"rule":"domain_mechanics"}'::jsonb
) on conflict (item_id) do update set
  solution_payload = excluded.solution_payload,
  evaluation_rule = excluded.evaluation_rule;
insert into private_arcade.item_media (
  item_id, kind, src, alt, decorative, width, height, fallback_text
) values (
  '815cd37c-4be7-d462-3c22-a52715586596'::uuid,
  'image',
  '/media/feed-60/incendio-humo-768.webp',
  'Columna de humo denso sobre un paisaje urbano al atardecer.',
  false,
  768,
  512,
  'La imagen no está disponible. La pregunta sigue abierta y las pistas educativas se conservan en el feedback.'
) on conflict (item_id) do update set
  kind = excluded.kind,
  src = excluded.src,
  alt = excluded.alt,
  decorative = excluded.decorative,
  width = excluded.width,
  height = excluded.height,
  fallback_text = excluded.fallback_text;

insert into private_arcade.game_items (
  item_id, game_code, mechanic, sequence, prompt, public_payload,
  content_version, editorial_status, editorial_item_id
) values (
  '4c584d45-b07d-fe94-8ad4-b09c9b255af2'::uuid,
  'feed-60',
  'timed_feed',
  9,
  'FELICIDADES: fuiste seleccionado para ganar un iPhone. Solo comparte este enlace con 15 contactos.',
  '{"gameCode":"feed-60","mechanic":"timed_feed","itemId":"feed-60-009","prompt":"FELICIDADES: fuiste seleccionado para ganar un iPhone. Solo comparte este enlace con 15 contactos.","post":"Premio a cambio de reenviar: dominio .xyz opaco.","sourceLabel":"premios-movil.xyz","actions":["verify","share","discard"],"remainingSeconds":60,"verificationAvailable":true}'::jsonb,
  '2026-07-30.1',
  'approved',
  'feed-60-009'
) on conflict (item_id) do update set
  prompt = excluded.prompt,
  public_payload = excluded.public_payload,
  content_version = excluded.content_version,
  editorial_status = excluded.editorial_status,
  editorial_item_id = excluded.editorial_item_id,
  updated_at = now();
insert into private_arcade.item_feedback (
  item_id, status, explanation, signals, recommendation, revealed_answer
) values (
  '4c584d45-b07d-fe94-8ad4-b09c9b255af2'::uuid,
  'instructive',
  'Es un esquema piramidal de captación: el «premio» no existe y tu obligación de reenviar es el producto.',
  '["Encuentra mejor cobertura: ninguna marca legítima reparte teléfonos por cadenas.","Rastrea el original: el enlace existe para captar contactos, no para entregar un premio.","Dominio .xyz opaco y recién registrado.","Un premio imposible a cambio de reenviar es la estafa."]'::jsonb,
  'Si te piden reenviar a cambio de un regalo imposible, descarta: el compartir es la estafa.',
  'Descartar'
) on conflict (item_id) do update set
  status = excluded.status,
  explanation = excluded.explanation,
  signals = excluded.signals,
  recommendation = excluded.recommendation,
  revealed_answer = excluded.revealed_answer;
insert into private_arcade.item_solution_private (
  item_id, solution_payload, evaluation_rule
) values (
  '4c584d45-b07d-fe94-8ad4-b09c9b255af2'::uuid,
  '{"appropriateDecision":"discard","postKind":"false","evaluationSignals":["impossible_prize","forced_forwarding","new_domain","data_harvesting"],"verificationHints":["Cobertura: ninguna marca reparte iPhones así.","Original: enlace de captación, no de premio.","Dominio recién registrado."]}'::jsonb,
  '{"rule":"domain_mechanics"}'::jsonb
) on conflict (item_id) do update set
  solution_payload = excluded.solution_payload,
  evaluation_rule = excluded.evaluation_rule;
insert into private_arcade.item_media (
  item_id, kind, src, alt, decorative, width, height, fallback_text
) values (
  '4c584d45-b07d-fe94-8ad4-b09c9b255af2'::uuid,
  'none',
  null,
  null,
  true,
  null,
  null,
  'Sin media editorial.'
) on conflict (item_id) do update set
  kind = excluded.kind,
  src = excluded.src,
  alt = excluded.alt,
  decorative = excluded.decorative,
  width = excluded.width,
  height = excluded.height,
  fallback_text = excluded.fallback_text;

insert into private_arcade.game_items (
  item_id, game_code, mechanic, sequence, prompt, public_payload,
  content_version, editorial_status, editorial_item_id
) values (
  '271c1ed2-53b6-c338-67c6-879bd6ec0d7d'::uuid,
  'feed-60',
  'timed_feed',
  10,
  'Municipalidad: corte de agua programado mañana de 9:00 a 14:00 en los distritos 4 y 7.',
  '{"gameCode":"feed-60","mechanic":"timed_feed","itemId":"feed-60-010","prompt":"Municipalidad: corte de agua programado mañana de 9:00 a 14:00 en los distritos 4 y 7.","post":"Aviso de mantenimiento publicado por la cuenta oficial.","sourceLabel":"muni.gob.pe · cuenta oficial","actions":["verify","share","discard"],"remainingSeconds":60,"verificationAvailable":true}'::jsonb,
  '2026-07-30.1',
  'approved',
  'feed-60-010'
) on conflict (item_id) do update set
  prompt = excluded.prompt,
  public_payload = excluded.public_payload,
  content_version = excluded.content_version,
  editorial_status = excluded.editorial_status,
  editorial_item_id = excluded.editorial_item_id,
  updated_at = now();
insert into private_arcade.item_feedback (
  item_id, status, explanation, signals, recommendation, revealed_answer
) values (
  '271c1ed2-53b6-c338-67c6-879bd6ec0d7d'::uuid,
  'instructive',
  'Es un aviso oficial de servicio: fuente municipal, horario concreto y coincide con la web institucional. Compartirlo ayuda a los vecinos.',
  '["Encuentra mejor cobertura: el aviso coincide con la web institucional.","Rastrea el original: el comunicado municipal es la fuente primaria.","muni.gob.pe es la cuenta oficial municipal.","Horario y distritos concretos: información accionable de servicio."]'::jsonb,
  'No todo en el feed es trampa: compartir avisos oficiales verificados es un favor a tu comunidad.',
  'Compartir'
) on conflict (item_id) do update set
  status = excluded.status,
  explanation = excluded.explanation,
  signals = excluded.signals,
  recommendation = excluded.recommendation,
  revealed_answer = excluded.revealed_answer;
insert into private_arcade.item_solution_private (
  item_id, solution_payload, evaluation_rule
) values (
  '271c1ed2-53b6-c338-67c6-879bd6ec0d7d'::uuid,
  '{"appropriateDecision":"share","postKind":"reliable","evaluationSignals":["municipal_official","actionable_schedule","web_corroboration","service_notice"],"verificationHints":["Cobertura: coincide con la web oficial.","Original: comunicado municipal.","Horario y distritos concretos."]}'::jsonb,
  '{"rule":"domain_mechanics"}'::jsonb
) on conflict (item_id) do update set
  solution_payload = excluded.solution_payload,
  evaluation_rule = excluded.evaluation_rule;
insert into private_arcade.item_media (
  item_id, kind, src, alt, decorative, width, height, fallback_text
) values (
  '271c1ed2-53b6-c338-67c6-879bd6ec0d7d'::uuid,
  'none',
  null,
  null,
  true,
  null,
  null,
  'Sin media editorial.'
) on conflict (item_id) do update set
  kind = excluded.kind,
  src = excluded.src,
  alt = excluded.alt,
  decorative = excluded.decorative,
  width = excluded.width,
  height = excluded.height,
  fallback_text = excluded.fallback_text;

insert into private_arcade.game_items (
  item_id, game_code, mechanic, sequence, prompt, public_payload,
  content_version, editorial_status, editorial_item_id
) values (
  'f17c6d48-acd6-e5ec-bb61-dcd239a2dadf'::uuid,
  'mente-maestra',
  'guided_autopsy',
  1,
  'Paso 1 · Investiga la intención: ¿qué quiere lograr esta fake news contigo? Elige el objetivo de la simulación.',
  '{"gameCode":"mente-maestra","mechanic":"guided_autopsy","itemId":"mente-maestra-001","step":"objective","prompt":"Paso 1 · Investiga la intención: ¿qué quiere lograr esta fake news contigo? Elige el objetivo de la simulación.","options":[{"optionId":"objective-health-panic","label":"Pánico sanitario","description":"Hacer que la gente tema a las vacunas, hospitales o medicinas con una alarma fabricada."},{"optionId":"objective-political-attack","label":"Ataque político","description":"Destruir la reputación de una figura pública con un clip o dato engañoso."},{"optionId":"objective-click-scam","label":"Estafa de clics","description":"Cosechar tráfico y datos con promesas imposibles o beneficios inventados."}]}'::jsonb,
  '2026-07-30.1',
  'approved',
  'mente-maestra-001'
) on conflict (item_id) do update set
  prompt = excluded.prompt,
  public_payload = excluded.public_payload,
  content_version = excluded.content_version,
  editorial_status = excluded.editorial_status,
  editorial_item_id = excluded.editorial_item_id,
  updated_at = now();
insert into private_arcade.item_feedback (
  item_id, status, explanation, signals, recommendation, revealed_answer
) values (
  'f17c6d48-acd6-e5ec-bb61-dcd239a2dadf'::uuid,
  'instructive',
  'Investiga siempre la intención: asustar, indignar o engañar para obtener atención. Reconocer el objetivo es el primer paso para no alimentar la cadena.',
  '["Investiga: la pieza busca una reacción rápida, no un dato comprobable.","El beneficio lo obtiene quien amplifica el mensaje, no quien lo recibe.","Ningún objetivo de esta simulación se publica ni se convierte en una cuenta real."]'::jsonb,
  'Antes de compartir, investiga qué quiere lograr el mensaje contigo: miedo, voto, clic o dinero.',
  'Objetivo de manipulación identificado'
) on conflict (item_id) do update set
  status = excluded.status,
  explanation = excluded.explanation,
  signals = excluded.signals,
  recommendation = excluded.recommendation,
  revealed_answer = excluded.revealed_answer;
insert into private_arcade.item_solution_private (
  item_id, solution_payload, evaluation_rule
) values (
  'f17c6d48-acd6-e5ec-bb61-dcd239a2dadf'::uuid,
  '{"step":"objective","optionEvaluations":{"objective-health-panic":{"reachWeight":15,"techniqueId":"health_panic","autopsyTitle":"Pánico sanitario","autopsyTip":"Investiga: si un mensaje te pide abandonar un tratamiento o temer a la salud pública sin fuente oficial, comprueba el canal institucional.","includeInAutopsy":true},"objective-political-attack":{"reachWeight":15,"techniqueId":"political_attack","autopsyTitle":"Ataque político","autopsyTip":"Investiga el clip completo y la fuente primaria antes de indignarte: un fragmento fuera de contexto puede fabricar un escándalo.","includeInAutopsy":true},"objective-click-scam":{"reachWeight":15,"techniqueId":"click_scam","autopsyTitle":"Estafa de clics","autopsyTip":"Investiga la institución en su dominio real: las promesas imposibles y los formularios urgentes suelen buscar datos o tráfico.","includeInAutopsy":true}}}'::jsonb,
  '{"rule":"domain_mechanics"}'::jsonb
) on conflict (item_id) do update set
  solution_payload = excluded.solution_payload,
  evaluation_rule = excluded.evaluation_rule;
insert into private_arcade.item_media (
  item_id, kind, src, alt, decorative, width, height, fallback_text
) values (
  'f17c6d48-acd6-e5ec-bb61-dcd239a2dadf'::uuid,
  'none',
  null,
  null,
  true,
  null,
  null,
  'Sin media editorial.'
) on conflict (item_id) do update set
  kind = excluded.kind,
  src = excluded.src,
  alt = excluded.alt,
  decorative = excluded.decorative,
  width = excluded.width,
  height = excluded.height,
  fallback_text = excluded.fallback_text;

insert into private_arcade.game_items (
  item_id, game_code, mechanic, sequence, prompt, public_payload,
  content_version, editorial_status, editorial_item_id
) values (
  '3cbc6600-82e7-6ede-9710-99590161f793'::uuid,
  'mente-maestra',
  'guided_autopsy',
  2,
  'Paso 2 · Investiga el gancho emocional: ¿qué sentimiento empuja a compartir sin verificar?',
  '{"gameCode":"mente-maestra","mechanic":"guided_autopsy","itemId":"mente-maestra-002","step":"emotion","prompt":"Paso 2 · Investiga el gancho emocional: ¿qué sentimiento empuja a compartir sin verificar?","options":[{"optionId":"emotion-fear","label":"Miedo","description":"«Si no actúas ya, tu familia corre peligro.» La emoción más usada para saltarse la verificación."},{"optionId":"emotion-anger","label":"Enojo","description":"«Alguien poderoso te está robando y nadie hace nada.» La indignación fabricada busca el reenvío inmediato."},{"optionId":"emotion-miracle-hope","label":"Esperanza milagrosa","description":"«La solución secreta que no quieren que conozcas.» Promete un milagro sin pruebas."}]}'::jsonb,
  '2026-07-30.1',
  'approved',
  'mente-maestra-002'
) on conflict (item_id) do update set
  prompt = excluded.prompt,
  public_payload = excluded.public_payload,
  content_version = excluded.content_version,
  editorial_status = excluded.editorial_status,
  editorial_item_id = excluded.editorial_item_id,
  updated_at = now();
insert into private_arcade.item_feedback (
  item_id, status, explanation, signals, recommendation, revealed_answer
) values (
  '3cbc6600-82e7-6ede-9710-99590161f793'::uuid,
  'instructive',
  'Investiga la emoción antes de reaccionar: miedo, enojo y esperanza milagrosa aceleran el clic y no prueban un hecho.',
  '["Investiga: el texto te dice qué sentir antes de qué ocurrió.","La urgencia emocional sustituye a la evidencia.","Quien se beneficia de tu reacción no siempre es quien aparece en el mensaje."]'::jsonb,
  'Si una publicación te asusta, indigna o promete un milagro, investiga primero y comparte después — o no compartas.',
  'Emoción-gancho reconocida'
) on conflict (item_id) do update set
  status = excluded.status,
  explanation = excluded.explanation,
  signals = excluded.signals,
  recommendation = excluded.recommendation,
  revealed_answer = excluded.revealed_answer;
insert into private_arcade.item_solution_private (
  item_id, solution_payload, evaluation_rule
) values (
  '3cbc6600-82e7-6ede-9710-99590161f793'::uuid,
  '{"step":"emotion","optionEvaluations":{"emotion-fear":{"reachWeight":25,"techniqueId":"fear","autopsyTitle":"Miedo","autopsyTip":"Investiga antes de reenviar: el miedo es el combustible principal de lo viral. Nada urgente se verifica después de compartir.","includeInAutopsy":true},"emotion-anger":{"reachWeight":22,"techniqueId":"anger","autopsyTitle":"Enojo","autopsyTip":"Investiga quién se beneficia de tu enojo: la indignación fabricada busca que compartas antes de pensar.","includeInAutopsy":true},"emotion-miracle-hope":{"reachWeight":20,"techniqueId":"miracle_hope","autopsyTitle":"Esperanza milagrosa","autopsyTip":"Investiga la promesa: los milagros sin estudios no existen. «Lo que ocultan» casi siempre significa «no tengo pruebas».","includeInAutopsy":true}}}'::jsonb,
  '{"rule":"domain_mechanics"}'::jsonb
) on conflict (item_id) do update set
  solution_payload = excluded.solution_payload,
  evaluation_rule = excluded.evaluation_rule;
insert into private_arcade.item_media (
  item_id, kind, src, alt, decorative, width, height, fallback_text
) values (
  '3cbc6600-82e7-6ede-9710-99590161f793'::uuid,
  'none',
  null,
  null,
  true,
  null,
  null,
  'Sin media editorial.'
) on conflict (item_id) do update set
  kind = excluded.kind,
  src = excluded.src,
  alt = excluded.alt,
  decorative = excluded.decorative,
  width = excluded.width,
  height = excluded.height,
  fallback_text = excluded.fallback_text;

insert into private_arcade.game_items (
  item_id, game_code, mechanic, sequence, prompt, public_payload,
  content_version, editorial_status, editorial_item_id
) values (
  '9cdc6735-36c5-0992-156a-ff23a096316c'::uuid,
  'mente-maestra',
  'guided_autopsy',
  3,
  'Paso 3 · Investiga el titular: diseña la trampa que haría creíble la pieza falsa.',
  '{"gameCode":"mente-maestra","mechanic":"guided_autopsy","itemId":"mente-maestra-003","step":"headline","prompt":"Paso 3 · Investiga el titular: diseña la trampa que haría creíble la pieza falsa.","options":[{"optionId":"headline-conspiracy-caps","label":"¡¡LO OCULTAN!! Lo que las autoridades no quieren que sepas sobre esto","description":"Conspiración, urgencia y mayúsculas: diseñado para el clic, no para informar."},{"optionId":"headline-vague-experts","label":"Expertos alertan: nuevo fenómeno preocupa a las familias","description":"Autoridad vaga y alarma suave: parece serio, pero no nombra a nadie ni a ningún estudio."},{"optionId":"headline-fake-official","label":"Comunicado oficial: medidas extraordinarias desde el lunes","description":"Imita el formato institucional para colarse como información real."}]}'::jsonb,
  '2026-07-30.1',
  'approved',
  'mente-maestra-003'
) on conflict (item_id) do update set
  prompt = excluded.prompt,
  public_payload = excluded.public_payload,
  content_version = excluded.content_version,
  editorial_status = excluded.editorial_status,
  editorial_item_id = excluded.editorial_item_id,
  updated_at = now();
insert into private_arcade.item_feedback (
  item_id, status, explanation, signals, recommendation, revealed_answer
) values (
  '9cdc6735-36c5-0992-156a-ff23a096316c'::uuid,
  'instructive',
  'Investiga el titular: mayúsculas, autoridad falsa o formatos oficiales te dicen qué sentir en lugar de qué ocurrió.',
  '["Investiga: mayúsculas, «lo ocultan» o cero datos concretos apuntan a cebo.","«Expertos» sin nombre ni institución son una autoridad vacía.","El formato de comunicado se falsifica: hay que verificar el dominio real."]'::jsonb,
  'Exige nombre, institución y dato concreto. Si el titular solo grita, sal sin compartir.',
  'Titular-trampa diseccionado'
) on conflict (item_id) do update set
  status = excluded.status,
  explanation = excluded.explanation,
  signals = excluded.signals,
  recommendation = excluded.recommendation,
  revealed_answer = excluded.revealed_answer;
insert into private_arcade.item_solution_private (
  item_id, solution_payload, evaluation_rule
) values (
  '9cdc6735-36c5-0992-156a-ff23a096316c'::uuid,
  '{"step":"headline","optionEvaluations":{"headline-conspiracy-caps":{"reachWeight":30,"techniqueId":"conspiracy_caps","autopsyTitle":"Conspiración con mayúsculas","autopsyTip":"Investiga el dato concreto: mayúsculas + «lo ocultan» + cero hechos = titular para tu clic, no para informarte.","includeInAutopsy":true},"headline-vague-experts":{"reachWeight":18,"techniqueId":"vague_experts","autopsyTitle":"Autoridad vaga","autopsyTip":"Investiga al «experto»: ¿qué nombre, de qué institución, en qué estudio?","includeInAutopsy":true},"headline-fake-official":{"reachWeight":12,"techniqueId":"fake_official_format","autopsyTitle":"Formato oficial falso","autopsyTip":"Investiga el dominio real de la institución: el formato oficial se falsifica con facilidad.","includeInAutopsy":true}}}'::jsonb,
  '{"rule":"domain_mechanics"}'::jsonb
) on conflict (item_id) do update set
  solution_payload = excluded.solution_payload,
  evaluation_rule = excluded.evaluation_rule;
insert into private_arcade.item_media (
  item_id, kind, src, alt, decorative, width, height, fallback_text
) values (
  '9cdc6735-36c5-0992-156a-ff23a096316c'::uuid,
  'none',
  null,
  null,
  true,
  null,
  null,
  'Sin media editorial.'
) on conflict (item_id) do update set
  kind = excluded.kind,
  src = excluded.src,
  alt = excluded.alt,
  decorative = excluded.decorative,
  width = excluded.width,
  height = excluded.height,
  fallback_text = excluded.fallback_text;

insert into private_arcade.game_items (
  item_id, game_code, mechanic, sequence, prompt, public_payload,
  content_version, editorial_status, editorial_item_id
) values (
  'b5f4da28-2f18-8da5-2674-b5c86831de55'::uuid,
  'mente-maestra',
  'guided_autopsy',
  4,
  'Paso 4 · Rastrea la «prueba»: elige la evidencia falsa. Luego verás la noticia armada y su autopsia.',
  '{"gameCode":"mente-maestra","mechanic":"guided_autopsy","itemId":"mente-maestra-004","step":"evidence","prompt":"Paso 4 · Rastrea la «prueba»: elige la evidencia falsa. Luego verás la noticia armada y su autopsia.","options":[{"optionId":"evidence-recycled-photo","label":"Foto antigua reciclada","description":"Una imagen real de otro año y otro lugar, presentada como de «hoy»."},{"optionId":"evidence-ai-image","label":"Imagen generada por IA","description":"Hiperrealista y emocional… con manos, textos o sombras incoherentes si miras con calma."},{"optionId":"evidence-fake-expert","label":"Experto inventado","description":"«El Dr. Fernández, prestigioso especialista, confirma que…» — pero no existe."},{"optionId":"evidence-truncated-axis","label":"Gráfico con eje truncado","description":"Datos reales con exageración visual: cortar el eje convierte un cambio pequeño en «catástrofe»."}]}'::jsonb,
  '2026-07-30.1',
  'approved',
  'mente-maestra-004'
) on conflict (item_id) do update set
  prompt = excluded.prompt,
  public_payload = excluded.public_payload,
  content_version = excluded.content_version,
  editorial_status = excluded.editorial_status,
  editorial_item_id = excluded.editorial_item_id,
  updated_at = now();
insert into private_arcade.item_feedback (
  item_id, status, explanation, signals, recommendation, revealed_answer
) values (
  'b5f4da28-2f18-8da5-2674-b5c86831de55'::uuid,
  'instructive',
  'Rastrea el original: la «prueba» suele ser una imagen reciclada, IA, un experto inventado o un gráfico manipulado. La autopsia convierte esas técnicas en señales de detección.',
  '["Rastrea: una foto real también engaña si cambia la fecha o el lugar.","Las manos, textos y sombras incoherentes delatan imágenes sintéticas.","Un experto sin rastro académico o un eje truncado fabrican credibilidad falsa."]'::jsonb,
  'Rastrea con búsqueda inversa, comprueba al autor citado y revisa los ejes antes de creer o compartir.',
  'Falsa prueba y autopsia listas'
) on conflict (item_id) do update set
  status = excluded.status,
  explanation = excluded.explanation,
  signals = excluded.signals,
  recommendation = excluded.recommendation,
  revealed_answer = excluded.revealed_answer;
insert into private_arcade.item_solution_private (
  item_id, solution_payload, evaluation_rule
) values (
  'b5f4da28-2f18-8da5-2674-b5c86831de55'::uuid,
  '{"step":"evidence","optionEvaluations":{"evidence-recycled-photo":{"reachWeight":20,"techniqueId":"recycled_photo","autopsyTitle":"Foto antigua reciclada","autopsyTip":"Rastrea con búsqueda inversa: revela la fecha y el lugar originales en segundos.","includeInAutopsy":true},"evidence-ai-image":{"reachWeight":25,"techniqueId":"ai_image","autopsyTitle":"Imagen generada por IA","autopsyTip":"Rastrea artefactos: manos, textos, joyas y sombras incoherentes. Lo «perfecto» también puede ser sospechoso.","includeInAutopsy":true},"evidence-fake-expert":{"reachWeight":22,"techniqueId":"fake_expert","autopsyTitle":"Experto inventado","autopsyTip":"Rastrea al «experto»: si solo aparece en esa noticia, fue inventado. Los especialistas reales tienen rastro académico.","includeInAutopsy":true},"evidence-truncated-axis":{"reachWeight":18,"techniqueId":"truncated_axis","autopsyTitle":"Gráfico con eje truncado","autopsyTip":"Rastrea la escala: un eje cortado exagera cualquier cambio. Los números pueden ser reales y la conclusión falsa.","includeInAutopsy":true}},"simulationAssets":{"educationalDisclaimer":"Simulación educativa: no se publica contenido externo ni se crea una cuenta real. El alcance simulado explica el mecanismo; no es un premio. Practica Investigar y Rastrear.","fictionalComments":["@preocupado22: No puedo creerlo… COMPARTIDO. Hay que avisar a todos!!","@tia_de_todos: Reenviado a mis 8 grupos. Hay que proteger a la familia.","@esceptico_ok: ¿Fuente? Esto huele raro. La «prueba» no cuadra.","Verificadores: Esta publicación fue marcada como FALSA. Su alcance simulado se redujo. La cuenta ficticia fue suspendida."]}}'::jsonb,
  '{"rule":"domain_mechanics"}'::jsonb
) on conflict (item_id) do update set
  solution_payload = excluded.solution_payload,
  evaluation_rule = excluded.evaluation_rule;
insert into private_arcade.item_media (
  item_id, kind, src, alt, decorative, width, height, fallback_text
) values (
  'b5f4da28-2f18-8da5-2674-b5c86831de55'::uuid,
  'none',
  null,
  null,
  true,
  null,
  null,
  'Sin media editorial.'
) on conflict (item_id) do update set
  kind = excluded.kind,
  src = excluded.src,
  alt = excluded.alt,
  decorative = excluded.decorative,
  width = excluded.width,
  height = excluded.height,
  fallback_text = excluded.fallback_text;

