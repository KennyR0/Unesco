import { describe, expect, it } from "vitest";

import {
  createContentRepository,
  type ContentRepository,
} from "./content-repository";

function makeRealItem({
  itemId,
  contentVersion,
  editorialStatus = "approved",
  sequence = 1,
}: {
  itemId: string;
  contentVersion: string;
  editorialStatus?: "draft" | "approved" | "archived";
  sequence?: number;
}) {
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
      prompt: "Observa antes de decidir.",
      context: "Contexto educativo.",
      media: {
        kind: "none" as const,
        src: null,
        alt: null,
        decorative: true,
        width: null,
        height: null,
        fallbackText: "Imagen no disponible.",
      },
      choices: ["real", "ai"] as const,
    },
    feedback: {
      status: "correct" as const,
      explanation: "La respuesta se justifica con señales observables.",
      signals: ["Busca contexto y evidencia."],
      recommendation: "Verifica antes de compartir.",
      revealedAnswer: "real",
    },
    solutionPrivate: { answer: "real" },
  };
}

describe("repositorio de contenido editorial", () => {
  it("selecciona una versión activa y publica solo contenido aprobado", () => {
    const repository: ContentRepository = createContentRepository(
      [
        makeRealItem({
          itemId: "draft-v2",
          contentVersion: "2026-08-02.1",
          editorialStatus: "draft",
          sequence: 3,
        }),
        makeRealItem({
          itemId: "real-v2-001",
          contentVersion: "2026-08-02.1",
        }),
        makeRealItem({
          itemId: "real-v2-002",
          contentVersion: "2026-08-02.1",
          sequence: 2,
        }),
        makeRealItem({
          itemId: "real-v1-001",
          contentVersion: "2026-08-01.1",
        }),
      ],
      { activeVersion: "2026-08-02.1" },
    );

    expect(repository.activeVersion).toBe("2026-08-02.1");
    expect(repository.listVersions()).toEqual(["2026-08-01.1", "2026-08-02.1"]);
    expect(repository.listPublishedItems("real-o-ia")).toHaveLength(2);
    expect(repository.getContentItem("real-o-ia", "draft-v2")).toBeNull();
    expect(
      repository.getContentItem("real-o-ia", "real-v1-001", "2026-08-01.1"),
    ).not.toBeNull();
  });

  it("mantiene feedback y solución en servidor, y proyecta solo el item público", () => {
    const repository = createContentRepository([
      makeRealItem({ itemId: "real-001", contentVersion: "2026-08-01.1" }),
      makeRealItem({
        itemId: "real-002",
        contentVersion: "2026-08-01.1",
        sequence: 2,
      }),
    ]);

    const item = repository.getContentItem("real-o-ia", "real-001");
    const publicItem = repository.getPublicItem("real-o-ia", "real-001");

    expect(item?.solutionPrivate).toEqual({ answer: "real" });
    expect(item?.feedback.recommendation).toBe("Verifica antes de compartir.");
    expect(publicItem).toMatchObject({
      itemId: "real-001",
      gameCode: "real-o-ia",
      mechanic: "image_verdict",
    });
    expect(publicItem && "solutionPrivate" in publicItem).toBe(false);
    expect(repository.getNextItem("real-o-ia", 1)?.itemId).toBe("real-002");
    expect(repository.getNextItem("real-o-ia", 2)).toBeNull();
  });
});
