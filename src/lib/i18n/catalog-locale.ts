import type { GameCatalogEntry } from "@antidoto/contracts";

import catalogDocument from "../../features/game/content/arcade-catalog.v1.json";
import { getMessages, type Locale } from "./i18n";

const ENGLISH_CATALOG: Record<string, Readonly<{ name: string; objective: string }>> = {
  "real-o-ia": {
    name: "Real or AI?",
    objective: "Spot visual signs of synthetic images before accepting them as real.",
  },
  grupo: {
    name: "The Group",
    objective: "Decide carefully whether to forward, verify, or stop messages in a family chat.",
  },
  "clickbait-swipe": {
    name: "Clickbait Swipe",
    objective: "Separate news headlines from clickbait in seconds.",
  },
  "radar-de-fuentes": {
    name: "Source Radar",
    objective: "Classify sources as reliable, doubtful, or fraudulent using observable signals.",
  },
  "feed-60": {
    name: "60” Feed",
    objective: "Prioritize verifying, sharing, or discarding under an authoritative time limit.",
  },
  "mente-maestra": {
    name: "Mastermind",
    objective: "Recognize manipulation techniques by taking apart a fake news story without causing real harm.",
  },
};

const CATALOG = catalogDocument.games as GameCatalogEntry[];

export function getLocalizedCatalog(locale: Locale): readonly GameCatalogEntry[] {
  if (locale === "es") return CATALOG;
  return CATALOG.map((game) => ({
    ...game,
    name: ENGLISH_CATALOG[game.gameCode]?.name ?? game.name,
    objective: ENGLISH_CATALOG[game.gameCode]?.objective ?? game.objective,
  }));
}

export function translateMechanic(mechanic: string, locale: Locale): string {
  return getMessages(locale).mechanics[mechanic] ?? mechanic.replaceAll("_", " ");
}
