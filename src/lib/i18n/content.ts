import type {
  GameCatalogEntry,
  GameResult,
  GameState,
  PublicFeedback,
  PublicItem,
} from "@antidoto/contracts";

import catalogDocument from "../../features/game/content/arcade-catalog.v1.json";
import clickbaitPack from "../../features/game/content/game-items/clickbait-swipe.v1.json";
import feedPack from "../../features/game/content/game-items/feed-60.v1.json";
import grupoPack from "../../features/game/content/game-items/grupo.v1.json";
import mastermindPack from "../../features/game/content/game-items/mente-maestra.v1.json";
import radarPack from "../../features/game/content/game-items/radar-de-fuentes.v1.json";
import realAiPack from "../../features/game/content/game-items/real-o-ia.v1.json";
import { getMessages, type Locale } from "./i18n";

type ItemTranslation = Readonly<{
  prompt?: string;
  context?: string;
  messages?: readonly Readonly<{ sender: string; text: string; timeLabel: string | null }>[];
  headline?: string;
  sourceLabel?: string;
  description?: string;
  post?: string;
  media?: Readonly<{ alt?: string | null; fallbackText?: string | null }>;
  feedback?: Readonly<{
    explanation: string;
    signals: readonly string[];
    recommendation: string;
    revealedAnswer: string | null;
  }>;
}>;

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

const ENGLISH_ITEM_COPY: Record<string, ItemTranslation> = {
  "grupo-001": {
    prompt: "A supposed health remedy attributed to the WHO arrives in the family chat. Decide what to do before someone stops their treatment.",
    messages: [
      { sender: "Aunt Marta", text: "⚠️ URGENT: lemon and baking soda CURE cancer, the WHO confirmed it. Forward to everyone; you could save a life 🙏🍋", timeLabel: "10:02" },
      { sender: "Cousin Luis", text: "Is that really true? My doctor told me to continue my treatment, but this message worried me.", timeLabel: "10:03" },
    ],
    feedback: {
      explanation: "The WHO did not confirm this remedy. Health chains mix a miracle promise, an authority with no statement, and pressure to forward; treatment decisions should never be made from an anonymous message.",
      signals: [
        "A promise of a quick cure without clinical evidence.",
        "The WHO is used as authority, but there is no verifiable statement.",
        "Urgency and the request to forward replace actual evidence.",
        "A health decision requires a professional, reliable source.",
      ],
      recommendation: "Check health claims with the relevant health authority and professionals before sharing or acting on them.",
      revealedAnswer: "It is not a WHO recommendation; verify it and stop the chain.",
    },
  },
  "grupo-002": {
    prompt: "A real photo appears in the chat as if it showed today's flood. Decide whether it has the context people claim.",
    messages: [
      { sender: "Cousin Diego", text: "THIS IS WHAT THE RIVER LOOKS LIKE RIGHT NOW. It overflowed downtown; spread the word 😱 The photo is attached.", timeLabel: "10:14" },
      { sender: "Friend Vale", text: "Does anyone know when it was taken? My sister has to travel through that area.", timeLabel: "10:15" },
    ],
    feedback: {
      explanation: "The photo is real, but it comes from a 2016 flood. An authentic image can still mislead when it is posted with a different date, place, or situation.",
      signals: ["The message says it is happening now but provides no verifiable date.", "The forwarded image has no confirmed author or location.", "A reverse image search can reveal earlier posts.", "Context matters, not only whether the photo looks real."],
      recommendation: "Reverse-search the image and check the date and location before sharing an emergency image.",
      revealedAnswer: "The photo is real, but out of context and not from a current flood.",
    },
  },
  "grupo-003": {
    prompt: "A message offers fake UNESCO scholarships and asks for sensitive data. Decide how to protect the group from possible phishing.",
    messages: [
      { sender: "Unknown number", text: "🎓 UNESCO SCHOLARSHIPS 2026: 500 dollars monthly for young people. LAST SPOTS. Complete the form with your ID and card through the link.", timeLabel: "10:31" },
      { sender: "Aunt Marta", text: "Could it be real? It says we lose the opportunity if we do not fill it out today.", timeLabel: "10:32" },
    ],
    feedback: {
      explanation: "This is a phishing attempt. Urgency, an easy promise, and requests for an ID and card do not prove a scholarship is real; a legitimate institution should be verifiable through official channels.",
      signals: ["It promises money and limited spots to pressure a decision.", "It asks for an ID and card through an unverified link.", "The sender is not a recognizable institutional channel.", "The call should be checked through UNESCO's official channel."],
      recommendation: "Do not enter sensitive data; verify the call through an official channel, report the message, and warn the group.",
      revealedAnswer: "The offer is phishing, not an official UNESCO scholarship call.",
    },
  },
  "grupo-004": {
    prompt: "A twelve-second political clip causes outrage, but it looks cut. Decide what to do before judging or spreading it.",
    messages: [
      { sender: "Friend Vale", text: "LOOK WHAT THIS POLITICIAN SAID 😡 It is twelve seconds and I am already furious. Share it so everyone knows how they think.", timeLabel: "10:48" },
      { sender: "Cousin Diego", text: "The video does not show who posted it or what was said before. Does anyone have the full speech?", timeLabel: "10:49" },
    ],
    feedback: {
      explanation: "The clip is cut in the middle of a sentence and changes the meaning of the speech. A video can be authentic and still mislead when it removes the context that completes it.",
      signals: ["The fragment begins and ends without a complete idea.", "The original account and full speech are missing.", "Anger is used to push immediate sharing.", "A full recording can change how the fragment should be understood."],
      recommendation: "Find the full speech and compare the clip with an original source before commenting or sharing.",
      revealedAnswer: "The clip is cut and does not show the statement's full meaning.",
    },
  },
  "grupo-005": {
    prompt: "An official, verified weather alert arrives. Decide whether sharing reliable information can also be an act of care.",
    messages: [
      { sender: "Uncle Carlos", text: "⚠️ VERIFIED OFFICIAL ALERT: Civil Protection reports a strong thunderstorm from 21:00 to 02:00. Secure windows and unplug equipment.", timeLabel: "11:02" },
      { sender: "Uncle Carlos", text: "The institutional account is verified and the notice matches the authority's bulletin. I am sharing it so the group can prepare.", timeLabel: "11:03" },
    ],
    feedback: {
      explanation: "This alert is official and verified. Critical thinking does not mean rejecting everything; it means checking the source and sharing reliable information when it can protect others.",
      signals: ["The message gives a concrete time range and useful steps.", "The institutional account is verified.", "The alert matches the authority's bulletin.", "Reliable service information can deserve to be shared."],
      recommendation: "Verify the source and, if the alert is authentic and useful, share it with its context and concrete safety steps.",
      revealedAnswer: "It is a verified official alert worth sharing.",
    },
  },
  "grupo-006": {
    prompt: "A chain uses guilt and fear to demand ten forwards. Decide how to stop the pressure without becoming part of the chain.",
    messages: [
      { sender: "Anonymous chain", text: "😨 If you love your mother, forward this to ten people. Ignore it and you will have seven years of bad luck. It happened to a neighbor; DO NOT BREAK THE CHAIN!", timeLabel: "11:19" },
      { sender: "Aunt Marta", text: "It scared me a little. Should I send it just in case?", timeLabel: "11:20" },
    ],
    feedback: {
      explanation: "The chain uses guilt, fear, and an anonymous anecdote to turn forwarding into a test of love. There is no real consequence for breaking it; its goal is to replicate itself.",
      signals: ["It links affection to an action instead of evidence.", "It threatens bad luck to create pressure.", "The anecdote has no identifiable source.", "The message measures success by how many people forward it."],
      recommendation: "Do not forward it; calmly explain that it is an emotional chain and encourage the group to stop it.",
      revealedAnswer: "It is an emotional chain based on guilt and fear; the responsible choice is to break it.",
    },
  },
};

const CATALOG = catalogDocument.games as GameCatalogEntry[];
const ALL_CONTENT_ITEMS = [
  ...realAiPack,
  ...grupoPack,
  ...clickbaitPack,
  ...radarPack,
  ...feedPack,
  ...mastermindPack,
] as const;

function generatedEnglishCopy(item: PublicItem): ItemTranslation {
  const sequence = item.itemId.slice(item.itemId.lastIndexOf("-") + 1);
  const missionCopy: Record<string, Readonly<{ prompt: string; explanation: string; recommendation: string }>> = {
    "real-o-ia": {
      prompt: `Real or AI? Review scene ${sequence} before deciding.`,
      explanation: "The image is an educational exercise: physical details, text, context, and the source all matter before trusting a visual post.",
      recommendation: "Inspect hands, faces, text, lighting, and context before accepting or sharing an image.",
    },
    "clickbait-swipe": {
      prompt: "Journalism or clickbait? Read the headline and source before swiping.",
      explanation: "A useful headline gives concrete facts and an identifiable source. Clickbait hides the fact behind urgency, outrage, or curiosity.",
      recommendation: "Look for who, what, when, and a source you can verify before clicking or sharing.",
    },
    "radar-de-fuentes": {
      prompt: "Read the authorship, domain, date, and references. Where does this source belong?",
      explanation: "Source quality depends on accountable authorship, a traceable context, and references that can be checked independently.",
      recommendation: "Check the domain, author, date, and original references before treating a source as evidence.",
    },
    "feed-60": {
      prompt: "You have seconds. Verify, share, or discard this post.",
      explanation: "A fast decision still needs observable signals: source, date, context, and whether the claim is supported elsewhere.",
      recommendation: "Pause long enough to check the source and context before amplifying a post.",
    },
    "mente-maestra": {
      prompt: `Step ${sequence}: take apart the manipulation without publishing it.`,
      explanation: "Manipulation often combines a target, an emotional hook, a misleading format, and a false proof. Naming each part makes it easier to resist.",
      recommendation: "Ask what the message wants, which emotion it uses, and what evidence would actually verify it.",
    },
    grupo: {
      prompt: "A message arrives in the family chat. Decide what to do before forwarding it.",
      explanation: "Careful sharing means checking the source, context, and possible harm before adding a message to the chain.",
      recommendation: "Pause, verify the claim with a reliable source, and share only when the context is clear.",
    },
  };
  const copy = missionCopy[item.gameCode] ?? missionCopy.grupo;
  const next: ItemTranslation = {
    prompt: copy.prompt,
    context: "Educational scenario for media and information literacy.",
    description: "Educational scenario with observable signals to review.",
    post: "Review the source, context, and evidence before deciding.",
    feedback: {
      explanation: copy.explanation,
      signals: ["Check the source and authorship.", "Check the date and context.", "Look for evidence that can be verified.", "Notice whether emotion is replacing proof."],
      recommendation: copy.recommendation,
      revealedAnswer: "The responsible choice follows the evidence, not the pressure to react.",
    },
  };
  const media = item.gameCode === "real-o-ia"
    ? {
      alt: "Editorial image for the visual verification mission.",
      fallbackText: "The image is unavailable. The question and educational clues remain available in the feedback.",
    }
    : undefined;
  
  const headline = item.gameCode === "clickbait-swipe"
    ? "A headline designed to test your pause before clicking"
    : undefined;
  const sourceLabel = item.gameCode === "clickbait-swipe"
    ? "Editorial source to verify"
    : item.gameCode === "radar-de-fuentes" || item.gameCode === "feed-60"
      ? "Source to verify"
      : undefined;
  return {
    ...next,
    ...(media ? { media } : {}),
    ...(headline ? { headline } : {}),
    ...(sourceLabel ? { sourceLabel } : {}),
  };
}

export function getLocalizedCatalog(locale: Locale): readonly GameCatalogEntry[] {
  if (locale === "es") return CATALOG;
  return CATALOG.map((game) => ({
    ...game,
    name: ENGLISH_CATALOG[game.gameCode]?.name ?? game.name,
    objective: ENGLISH_CATALOG[game.gameCode]?.objective ?? game.objective,
  }));
}

function localizeItemFields(item: PublicItem, copy: ItemTranslation): PublicItem {
  const next = { ...item } as Record<string, unknown>;
  for (const key of ["prompt", "context", "headline", "sourceLabel", "description", "post"] as const) {
    if (copy[key] !== undefined) next[key] = copy[key];
  }
  if (copy.messages && item.gameCode === "grupo") next.messages = copy.messages;
  if (copy.media && item.gameCode === "real-o-ia") {
    next.media = { ...item.media, ...copy.media };
  }
  return next as PublicItem;
}

export function localizePublicItem<T extends PublicItem>(item: T, locale: Locale): T {
  if (locale === "es") return item;
  return localizeItemFields(item, ENGLISH_ITEM_COPY[item.itemId] ?? generatedEnglishCopy(item)) as T;
}

export function localizeFeedback(
  feedback: PublicFeedback,
  locale: Locale,
  itemId?: string,
): PublicFeedback {
  if (locale === "es" || !itemId) return feedback;
  const copy = ENGLISH_ITEM_COPY[itemId]?.feedback ?? {
    explanation: "Review the source, context, and evidence before trusting this claim.",
    signals: ["Check the source and authorship.", "Check the date and context.", "Look for evidence that can be verified."],
    recommendation: "Pause and verify the claim with an independent, reliable source before sharing it.",
    revealedAnswer: "The responsible choice follows the evidence, not the pressure to react.",
  };
  return copy ? { ...feedback, ...copy, signals: [...copy.signals] } : feedback;
}

export function localizeGameState<T extends GameState>(state: T, locale: Locale): T {
  if (locale === "es") return state;
  return {
    ...state,
    item: state.item ? localizePublicItem(state.item, locale) : null,
    feedback: state.feedback
      ? localizeFeedback(state.feedback, locale, state.item?.itemId)
      : null,
  } as T;
}

export function localizeGameResult(result: GameResult, locale: Locale): GameResult {
  if (locale === "es") return result;
  return result;
}

export function validateEnglishContentCoverage(): { ok: boolean; missing: readonly string[] } {
  const missing = ALL_CONTENT_ITEMS
    .filter((entry) => {
      const item = entry.publicItem as PublicItem;
      const feedback = entry.feedback as PublicFeedback;
      const translatedItem = localizePublicItem(item, "en");
      const translatedFeedback = localizeFeedback(feedback, "en", item.itemId);
      return translatedItem.prompt === item.prompt || translatedFeedback.explanation === feedback.explanation;
    })
    .map((entry) => entry.itemId);
  return { ok: missing.length === 0, missing };
}

export function translateMechanic(mechanic: string, locale: Locale): string {
  return getMessages(locale).mechanics[mechanic] ?? mechanic.replaceAll("_", " ");
}
