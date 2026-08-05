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
import { GUEST_DISPLAY_ALIAS } from "../../features/game/domain/alias";
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
    finished: "You practiced Stop and Investigate before amplifying rumors in a family chat.",
    expired: "The game expired; keep the Stop and Investigate habits you practiced.",
  },
  "clickbait-swipe": {
    finished: "You practiced Stop and Investigate to separate journalism from clickbait.",
    expired: "The game expired; keep the Stop and Investigate habits you practiced.",
  },
  "radar-de-fuentes": {
    finished: "You practiced Investigate and Trace to judge sources by checkable signals.",
    expired: "The game expired; keep the Investigate and Trace habits you practiced.",
  },
  "feed-60": {
    finished: "Under pressure, you practiced Find better coverage and Trace the original.",
    expired: "Time ran out; keep the Find and Trace habits you practiced.",
  },
  "mente-maestra": {
    finished: "You practiced Investigate and Trace by reverse-engineering a fake news recipe.",
    expired: "The game expired; keep the Investigate and Trace habits from the autopsy.",
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
  if (copy.messages && item.gameCode === "grupo") {
    next.messages = item.messages.map((message, index) => {
      const translated = copy.messages?.[index];
      if (!translated) return message;
      return {
        ...message,
        sender: translated.sender,
        text: translated.text,
        timeLabel: translated.timeLabel,
        media: message.media
          ? { ...message.media, ...(translated.media ?? {}) }
          : message.media,
      };
    });
  }
  if (
    copy.media &&
    (item.gameCode === "real-o-ia" || item.gameCode === "feed-60") &&
    "media" in item &&
    item.media
  ) {
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

function localizeAlias(alias: string, locale: Locale): string {
  if (locale === "es") return alias;
  return alias === GUEST_DISPLAY_ALIAS ? "Guest" : alias;
}

export function localizeGameState<T extends GameState>(state: T, locale: Locale): T {
  if (locale === "es") return state;
  const withCompanion = state as T & { companion?: ArcadeSessionCompanion };
  return {
    ...state,
    alias: localizeAlias(state.alias, locale),
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
  const itemDigests =
    result.itemDigests?.map((digest) => {
      const copy = ENGLISH_ITEM_COPY[digest.itemId];
      if (!copy?.feedback) return digest;
      return {
        ...digest,
        prompt: copy.prompt ?? digest.prompt,
        keySignal: copy.feedback.signals?.[0] ?? digest.keySignal,
        explanation: copy.feedback.explanation ?? digest.explanation,
        recommendation: copy.feedback.recommendation ?? digest.recommendation,
        revealedAnswer: copy.feedback.revealedAnswer ?? digest.revealedAnswer,
      };
    }) ?? null;
  return {
    ...result,
    alias: localizeAlias(result.alias, locale),
    ...(learningSummary ? { learningSummary } : {}),
    ...(result.itemDigests ? { itemDigests } : {}),
  };
}
