import type { AutopsyStep } from "../../features/game/domain/mechanics/guided-autopsy";

export type AssembledSelection = Readonly<{
  step: AutopsyStep;
  optionId: string;
  label: string;
}>;

export type AssembledFakePost = Readonly<{
  kicker: string;
  headline: string;
  lede: string;
  metaLine: string;
}>;

type Locale = "es" | "en";

const LEDES_ES: Record<string, string> = {
  "objective-health-panic":
    "Una alarma sanitaria fabricada circula como si fuera un aviso urgente. Mezcla emoción, un titular-trampa y una «prueba» que no resiste verificación.",
  "objective-political-attack":
    "Un ataque reputacional se presenta como denuncia viral. El montaje combina indignación, un titular engañoso y una prueba fuera de contexto.",
  "objective-click-scam":
    "Una promesa imposible busca clics y datos. El engaño une urgencia emocional, un titular de cebo y una prueba que no se puede contrastar.",
};

const LEDES_EN: Record<string, string> = {
  "objective-health-panic":
    "A manufactured health alarm circulates as if it were an urgent warning. It mixes emotion, a trap headline, and “proof” that does not survive verification.",
  "objective-political-attack":
    "A reputational attack is framed as a viral exposé. The montage combines outrage, a misleading headline, and out-of-context proof.",
  "objective-click-scam":
    "An impossible promise hunts clicks and data. The scam joins emotional urgency, a bait headline, and proof that cannot be checked.",
};

function byStep(
  selections: readonly AssembledSelection[],
  step: AutopsyStep,
): AssembledSelection | undefined {
  return selections.find((selection) => selection.step === step);
}

/**
 * Compone la “noticia” ficticia a partir de las 4 elecciones de sesión.
 * Solo para teatro educativo; no se publica fuera del juego.
 */
export function assembleFakeNewsPost(
  selections: readonly AssembledSelection[],
  locale: Locale,
): AssembledFakePost | null {
  if (selections.length === 0) return null;

  const objective = byStep(selections, "objective");
  const emotion = byStep(selections, "emotion");
  const headline = byStep(selections, "headline");
  const evidence = byStep(selections, "evidence");

  const ledes = locale === "en" ? LEDES_EN : LEDES_ES;
  const lede =
    (objective ? ledes[objective.optionId] : undefined) ??
    (locale === "en"
      ? "A fabricated story assembled from the techniques you chose. Investigate the intention and trace the supposed proof."
      : "Una historia fabricada con las técnicas que elegiste. Investiga la intención y rastrea la supuesta prueba.");

  const kicker =
    locale === "en" ? "BREAKING — SIMULATION" : "NOTICIA DE ÚLTIMA HORA — SIMULACIÓN";

  const headlineText =
    headline?.label ??
    (locale === "en" ? "Trap headline still assembling…" : "Titular-trampa en construcción…");

  const metaParts = [
    objective?.label,
    emotion?.label,
    evidence?.label,
  ].filter((part): part is string => Boolean(part));

  const metaLine =
    metaParts.length === 0
      ? locale === "en"
        ? "Recipe still assembling"
        : "Receta en construcción"
      : locale === "en"
        ? `Objective: ${metaParts[0]}${metaParts[1] ? ` · Hook: ${metaParts[1]}` : ""}${metaParts[2] ? ` · “Proof”: ${metaParts[2]}` : ""}`
        : `Objetivo: ${metaParts[0]}${metaParts[1] ? ` · Gancho: ${metaParts[1]}` : ""}${metaParts[2] ? ` · «Prueba»: ${metaParts[2]}` : ""}`;

  return { kicker, headline: headlineText, lede, metaLine };
}
