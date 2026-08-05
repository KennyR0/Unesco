import { describe, expect, it } from "vitest";

import { createContentRepository } from "../content-repository";
import { validateContentCollection } from "../content-validation";
import contentPack from "./feed-60.v1.json";

const DECISIONS = ["share", "discard"] as const;
type AppropriateDecision = (typeof DECISIONS)[number];

const POST_KINDS = ["reliable", "false", "out_of_context", "satire"] as const;
type PostKind = (typeof POST_KINDS)[number];

const REVEALED_ANSWERS: Record<AppropriateDecision, string> = {
  share: "Compartir",
  discard: "Descartar",
};

/** Feed 60” enseña prioritariamente Find + Trace. */
const SIFT_FOCUS_MARKERS = [
  "Encuentra mejor cobertura",
  "Rastrea el original",
] as const;

function readAppropriateDecision(
  solutionPrivate: Record<string, unknown>,
): AppropriateDecision {
  const decision = solutionPrivate["appropriateDecision"];
  if (
    typeof decision !== "string" ||
    !DECISIONS.includes(decision as AppropriateDecision)
  ) {
    throw new Error(
      "solutionPrivate debe declarar appropriateDecision share o discard.",
    );
  }
  return decision as AppropriateDecision;
}

function readPostKind(solutionPrivate: Record<string, unknown>): PostKind {
  const postKind = solutionPrivate["postKind"];
  if (
    typeof postKind !== "string" ||
    !POST_KINDS.includes(postKind as PostKind)
  ) {
    throw new Error(
      "solutionPrivate debe declarar postKind reliable, false, out_of_context o satire.",
    );
  }
  return postKind as PostKind;
}

describe("pack editorial feed-60.v1 (T057)", () => {
  const items = validateContentCollection(contentPack);

  it("pasa la revisión estructural con exactamente diez publicaciones", () => {
    expect(items).toHaveLength(10);
  });

  it("declara los diez items aprobados en la versión registrada del manifiesto", () => {
    for (const item of items) {
      expect(item.editorialStatus).toBe("approved");
      expect(item.contentVersion).toBe("2026-07-30.1");
      expect(item.gameCode).toBe("feed-60");
      expect(item.mechanic).toBe("timed_feed");
    }
    expect(items.map((item) => item.sequence)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    ]);
  });

  it("equilibra decisiones adecuadas y declara señales SIFT Find/Trace con feedback", () => {
    const decisions = items.map((item) =>
      readAppropriateDecision(item.solutionPrivate),
    );
    expect(decisions.filter((value) => value === "share")).toHaveLength(4);
    expect(decisions.filter((value) => value === "discard")).toHaveLength(6);

    const postKinds = items.map((item) => readPostKind(item.solutionPrivate));
    expect(postKinds.filter((value) => value === "reliable")).toHaveLength(4);
    expect(postKinds.filter((value) => value === "false").length).toBeGreaterThanOrEqual(
      2,
    );
    expect(
      postKinds.filter((value) => value === "out_of_context").length,
    ).toBeGreaterThanOrEqual(1);
    expect(postKinds.filter((value) => value === "satire").length).toBeGreaterThanOrEqual(
      1,
    );

    for (const item of items) {
      const decision = readAppropriateDecision(item.solutionPrivate);
      expect(item.feedback.revealedAnswer).toBe(REVEALED_ANSWERS[decision]);
      expect(item.feedback.signals.length).toBeGreaterThanOrEqual(3);
      expect(item.feedback.signals.length).toBeLessThanOrEqual(4);
      for (const marker of SIFT_FOCUS_MARKERS) {
        expect(
          item.feedback.signals.some((signal) => signal.startsWith(marker)),
        ).toBe(true);
      }
      expect(item.feedback.signals[0]?.startsWith("Encuentra mejor cobertura")).toBe(
        true,
      );
      expect(item.feedback.signals[1]?.startsWith("Rastrea el original")).toBe(true);
      expect(item.feedback.recommendation.trim().length).toBeGreaterThan(0);
      expect(item.feedback.explanation.trim().length).toBeGreaterThan(0);
    }
  });

  it("publica post, fuente y acciones sin revelar la decisión ni las pistas privadas", () => {
    for (const item of items) {
      const publicItem = item.publicItem;
      if (publicItem.gameCode !== "feed-60") {
        throw new Error("El pack solo debe contener items de feed-60.");
      }

      expect(publicItem.post.trim().length).toBeGreaterThan(0);
      expect(publicItem.sourceLabel.trim().length).toBeGreaterThan(0);
      expect(publicItem.prompt.trim().length).toBeGreaterThan(0);
      expect(publicItem.prompt).not.toMatch(/^Practica\b/i);
      expect(publicItem.prompt).not.toMatch(/^Practice Find\b/i);
      expect(publicItem.actions).toEqual(["verify", "share", "discard"]);
      expect(publicItem.remainingSeconds).toBe(60);
      expect(publicItem.verificationAvailable).toBe(true);
      if (publicItem.media) {
        expect(publicItem.media.kind).toBe("image");
        expect(publicItem.media.src).toMatch(/^\/media\/feed-60\//);
        expect(publicItem.media.alt?.trim().length).toBeGreaterThan(0);
      }

      for (const label of Object.values(REVEALED_ANSWERS)) {
        expect(publicItem.post).not.toContain(label);
        expect(publicItem.sourceLabel).not.toContain(label);
        expect(publicItem.prompt).not.toContain(label);
      }

      expect(publicItem.post).not.toContain(item.feedback.revealedAnswer ?? "");
      for (const signal of item.feedback.signals) {
        expect(publicItem.post).not.toContain(signal);
      }

      const evaluationSignals = item.solutionPrivate["evaluationSignals"];
      expect(Array.isArray(evaluationSignals)).toBe(true);
      expect((evaluationSignals as unknown[]).length).toBeGreaterThanOrEqual(1);

      const verificationHints = item.solutionPrivate["verificationHints"];
      expect(Array.isArray(verificationHints)).toBe(true);
      expect((verificationHints as unknown[]).length).toBe(3);
      for (const hint of verificationHints as unknown[]) {
        expect(typeof hint).toBe("string");
        expect((hint as string).trim().length).toBeGreaterThan(0);
        expect(publicItem.post).not.toContain(hint as string);
      }
    }
  });

  it("publica las diez publicaciones en orden y nunca expone la solución privada", () => {
    const repository = createContentRepository(contentPack);

    expect(repository.activeVersion).toBe("2026-07-30.1");
    const published = repository.listPublishedItems("feed-60");
    expect(published.map((item) => item.itemId)).toEqual([
      "feed-60-001",
      "feed-60-002",
      "feed-60-003",
      "feed-60-004",
      "feed-60-005",
      "feed-60-006",
      "feed-60-007",
      "feed-60-008",
      "feed-60-009",
      "feed-60-010",
    ]);

    for (const item of published) {
      const publicItem = repository.getPublicItem("feed-60", item.itemId);
      expect(publicItem).not.toBeNull();
      expect(publicItem && "solutionPrivate" in publicItem).toBe(false);
      expect(publicItem && "feedback" in publicItem).toBe(false);
      expect(
        repository.getFeedback("feed-60", item.itemId)?.revealedAnswer,
      ).not.toBeNull();
    }
  });
});
