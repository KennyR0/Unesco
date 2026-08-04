import type {
  GameCode,
  GameResult,
  GameState,
  PublicFeedback,
  PublicItem,
} from "@antidoto/contracts";

import type {
  ArcadeSessionCompanion,
  AutopsySessionCompanion,
  FeedSessionCompanion,
} from "../../features/game/infrastructure/session-companion";
import {
  ENGLISH_AUTOPSY_ASSETS,
  ENGLISH_AUTOPSY_BY_OPTION_ID,
  ENGLISH_ITEM_COPY,
  type ItemTranslation,
} from "./english-item-copy";
import type { Locale } from "./i18n";

export type { ItemTranslation };

const ENGLISH_LEARNING_SUMMARIES: Record<
  GameCode,
  Readonly<{ finished: string; expired: string }>
> = {
  "real-o-ia": {
    finished: "You practiced spotting visual signals of synthetic images before believing and sharing them.",
    expired: "The game expired; keep the visual judgment you practiced.",
  },
  grupo: {
    finished: "You practiced careful decisions in a family chat before amplifying rumors.",
    expired: "The game expired; keep the care you practiced in the chat.",
  },
  "clickbait-swipe": {
    finished: "You separated journalism from clickbait by reading the signals in the headline and its source.",
    expired: "The game expired; keep the editorial judgment you practiced.",
  },
  "radar-de-fuentes": {
    finished: "You evaluated sources by their verifiable signals, not by how they look.",
    expired: "The game expired; keep the critical radar you practiced.",
  },
  "feed-60": {
    finished: "Under pressure, you decided what to verify, share, or discard in a live feed.",
    expired: "Time ran out; keep the verification pace you practiced.",
  },
  "mente-maestra": {
    finished: "You took apart, step by step, the anatomy of a fake news story in an educational simulation.",
    expired: "The game expired; keep the manipulation techniques you identified.",
  },
};

const OPTION_LABEL_BY_ID: ReadonlyMap<string, string> = (() => {
  const map = new Map<string, string>();
  for (const copy of Object.values(ENGLISH_ITEM_COPY)) {
    for (const option of copy.options ?? []) {
      map.set(option.optionId, option.label);
    }
  }
  return map;
})();

function localizeItemFields(item: PublicItem, copy: ItemTranslation): PublicItem {
  const next = { ...item } as Record<string, unknown>;
  for (const key of [
    "prompt",
    "context",
    "headline",
    "sourceLabel",
    "sourceName",
    "description",
    "post",
  ] as const) {
    if (copy[key] !== undefined) next[key] = copy[key];
  }
  if (copy.messages && item.gameCode === "grupo") next.messages = copy.messages;
  if (copy.media && item.gameCode === "real-o-ia") {
    next.media = { ...item.media, ...copy.media };
  }
  if (copy.options && item.gameCode === "mente-maestra") {
    const byId = new Map(copy.options.map((option) => [option.optionId, option]));
    next.options = item.options.map((option) => {
      const translated = byId.get(option.optionId);
      return translated
        ? { ...option, label: translated.label, description: translated.description }
        : option;
    });
  }
  return next as PublicItem;
}

export function localizePublicItem<T extends PublicItem>(item: T, locale: Locale): T {
  if (locale === "es") return item;
  const copy = ENGLISH_ITEM_COPY[item.itemId];
  return copy ? (localizeItemFields(item, copy) as T) : item;
}

export function localizeFeedback(
  feedback: PublicFeedback,
  locale: Locale,
  itemId?: string,
): PublicFeedback {
  if (locale === "es" || !itemId) return feedback;
  const copy = ENGLISH_ITEM_COPY[itemId]?.feedback;
  return copy ? { ...feedback, ...copy, signals: [...copy.signals] } : feedback;
}

function localizeFeedCompanion(
  companion: FeedSessionCompanion,
  locale: Locale,
  itemId?: string,
): FeedSessionCompanion {
  if (locale === "es" || !itemId) return companion;
  const hints = ENGLISH_ITEM_COPY[itemId]?.verificationHints;
  return hints ? { ...companion, verificationHints: [...hints] } : companion;
}

function localizeAutopsyCompanion(
  companion: AutopsySessionCompanion,
  locale: Locale,
): AutopsySessionCompanion {
  if (locale === "es") return companion;
  const selections = companion.selections.map((selection) => ({
    ...selection,
    label:
      ENGLISH_AUTOPSY_BY_OPTION_ID[selection.optionId]?.title
      ?? OPTION_LABEL_BY_ID.get(selection.optionId)
      ?? selection.label,
  }));
  const autopsyEntries = companion.autopsyEntries.map((entry) => {
    const selection = companion.selections.find((item) => item.step === entry.step);
    const translated = selection
      ? ENGLISH_AUTOPSY_BY_OPTION_ID[selection.optionId]
      : undefined;
    return translated
      ? { ...entry, title: translated.title, tip: translated.tip }
      : entry;
  });
  return {
    ...companion,
    selections,
    autopsyEntries,
    fictionalComments: [...ENGLISH_AUTOPSY_ASSETS.fictionalComments],
    educationalDisclaimer: ENGLISH_AUTOPSY_ASSETS.educationalDisclaimer,
  };
}

export function localizeSessionCompanion(
  companion: ArcadeSessionCompanion | undefined,
  locale: Locale,
  itemId?: string,
): ArcadeSessionCompanion | undefined {
  if (!companion || locale === "es") return companion;
  if (companion.kind === "feed-60") {
    return localizeFeedCompanion(companion, locale, itemId);
  }
  return localizeAutopsyCompanion(companion, locale);
}

export function localizeGameState<T extends GameState>(state: T, locale: Locale): T {
  if (locale === "es") return state;
  const withCompanion = state as T & { companion?: ArcadeSessionCompanion };
  return {
    ...state,
    item: state.item ? localizePublicItem(state.item, locale) : null,
    feedback: state.feedback
      ? localizeFeedback(state.feedback, locale, state.item?.itemId)
      : null,
    ...(withCompanion.companion
      ? {
          companion: localizeSessionCompanion(
            withCompanion.companion,
            locale,
            state.item?.itemId,
          ),
        }
      : {}),
  } as T;
}

export function localizeGameResult(result: GameResult, locale: Locale): GameResult {
  if (locale === "es") return result;
  const statusKey = result.status === "finished" ? "finished" : "expired";
  const learningSummary = ENGLISH_LEARNING_SUMMARIES[result.gameCode]?.[statusKey];
  return learningSummary ? { ...result, learningSummary } : result;
}
