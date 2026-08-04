import type { PublicFeedback, PublicItem } from "@antidoto/contracts";

import clickbaitPack from "../../features/game/content/game-items/clickbait-swipe.v1.json";
import feedPack from "../../features/game/content/game-items/feed-60.v1.json";
import grupoPack from "../../features/game/content/game-items/grupo.v1.json";
import mastermindPack from "../../features/game/content/game-items/mente-maestra.v1.json";
import radarPack from "../../features/game/content/game-items/radar-de-fuentes.v1.json";
import realAiPack from "../../features/game/content/game-items/real-o-ia.v1.json";
import { getLocalizedCatalog, translateMechanic } from "./catalog-locale";
import { ENGLISH_ITEM_COPY } from "./english-item-copy";
import {
  localizeFeedback,
  localizeGameResult,
  localizeGameState,
  localizePublicItem,
  localizeSessionCompanion,
  type ItemTranslation,
} from "./localize-game";

export type { ItemTranslation };
export {
  getLocalizedCatalog,
  localizeFeedback,
  localizeGameResult,
  localizeGameState,
  localizePublicItem,
  localizeSessionCompanion,
  translateMechanic,
};

const ALL_CONTENT_ITEMS = [
  ...realAiPack,
  ...grupoPack,
  ...clickbaitPack,
  ...radarPack,
  ...feedPack,
  ...mastermindPack,
] as const;

/** Cobertura editorial EN: solo se usa en tests/tooling, no en el bundle de interacción. */
export function validateEnglishContentCoverage(): {
  ok: boolean;
  missing: readonly string[];
} {
  const missing = ALL_CONTENT_ITEMS.filter((entry) => {
    const item = entry.publicItem as PublicItem;
    const feedback = entry.feedback as PublicFeedback;
    const copy = ENGLISH_ITEM_COPY[item.itemId];
    if (!copy?.prompt || !copy.feedback?.explanation) return true;
    const translatedItem = localizePublicItem(item, "en");
    const translatedFeedback = localizeFeedback(feedback, "en", item.itemId);
    return (
      translatedItem.prompt === item.prompt
      || translatedFeedback.explanation === feedback.explanation
    );
  }).map((entry) => entry.itemId);
  return { ok: missing.length === 0, missing };
}
