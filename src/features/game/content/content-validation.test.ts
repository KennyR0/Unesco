import { describe, expect, it } from "vitest";

import {
  ContentCollectionSchema,
  ContentItemSchema,
  validateContentCollection,
  validateContentItem,
} from "./content-validation";

function makeRealItem({
  itemId = "real-001",
  contentVersion = "2026-08-01.1",
  editorialStatus = "approved",
  sequence = 1,
  revealedAnswer = "real",
}: {
  itemId?: string;
  contentVersion?: string;
  editorialStatus?: "draft" | "approved" | "archived";
  sequence?: number;
  revealedAnswer?: string | null;
} = {}) {
  return {
    itemId,
    gameCode: "real-o-ia" as const,
    mechanic: "image_verdict" as const,
    sequence,
    contentVersion,
    editorialStatus,
    publicItem: {
      gameCode: "real-o-ia" as const,
      mechanic: "image_verdict" as const,
      itemId,
      prompt: "¿Qué observas antes de decidir?",
      context: "La imagen se presenta para practicar observación crítica.",
      media: {
        kind: "none" as const,
        src: null,
        alt: null,
        decorative: true,
        width: null,
        height: null,
        fallbackText: "Imagen educativa no disponible.",
      },
      choices: ["real", "ai"] as const,
    },
    feedback: {
      status: "correct" as const,
      explanation: "La decisión correcta se apoya en varias señales observables.",
      signals: ["Compara contexto y detalles antes de concluir."],
      recommendation: "Verifica la fuente y busca evidencia adicional.",
      revealedAnswer,
    },
    solutionPrivate: {
      answer: "real",
      evaluationRule: "image_verdict.v1",
    },
  };
}

describe("validación de contenido editorial", () => {
  it("valida item, feedback, versión y estado editorial", () => {
    const item = makeRealItem();
    const parsed = validateContentItem(item);

    expect(parsed.contentVersion).toBe("2026-08-01.1");
    expect(parsed.editorialStatus).toBe("approved");
    expect(parsed.feedback.signals).toHaveLength(1);
    expect(parsed.feedback.revealedAnswer).toBe("real");
  });

  it("rechaza mecánica discordante, feedback sin respuesta y campos desconocidos", () => {
    const item = makeRealItem();

    expect(
      ContentItemSchema.safeParse({ ...item, mechanic: "group_decision" }),
    ).toHaveProperty("success", false);
    expect(
      ContentItemSchema.safeParse({
        ...item,
        feedback: { ...item.feedback, revealedAnswer: null },
      }),
    ).toHaveProperty("success", false);
    expect(
      ContentItemSchema.safeParse({ ...item, clientScore: 100 }),
    ).toHaveProperty("success", false);
  });

  it("rechaza secuencias duplicadas dentro de una misma versión y juego", () => {
    const collection = [
      makeRealItem({ itemId: "real-001", sequence: 1 }),
      makeRealItem({ itemId: "real-002", sequence: 1 }),
    ];

    expect(ContentCollectionSchema.safeParse(collection)).toHaveProperty(
      "success",
      false,
    );
    expect(() => validateContentCollection(collection)).toThrow();
  });
});

