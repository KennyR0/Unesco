import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  MisinformationAutopsyGame,
  type MisinformationAutopsyItem,
  type PersistedAutopsySelection,
} from "../../src/components/games/misinformation-autopsy-game";
import { createContentRepository } from "../../src/features/game/content/content-repository";
import { validateContentCollection } from "../../src/features/game/content/content-validation";
import contentPack from "../../src/features/game/content/game-items/mente-maestra.v1.json";
import {
  AUTOPSY_STEPS,
  assembleGuidedAutopsySession,
  evaluateGuidedAutopsyStep,
  parseGuidedAutopsySolution,
  SIMULATED_REACH_MAX,
  SIMULATED_REACH_MIN,
  type GuidedAutopsySelection,
} from "../../src/features/game/domain/mechanics/guided-autopsy";
import {
  calculateGameScore,
  maxPointsForGame,
} from "../../src/features/game/domain/scoring";

function makeItem(
  overrides: Partial<MisinformationAutopsyItem> = {},
): MisinformationAutopsyItem {
  return {
    gameCode: "mente-maestra",
    mechanic: "guided_autopsy",
    itemId: "mente-maestra-t065",
    step: "objective",
    prompt: "Paso 1 · Elige el objetivo de esta simulación educativa.",
    options: [
      {
        optionId: "objective-health-panic",
        label: "Pánico sanitario",
        description: "Alarma fabricada sobre salud.",
      },
      {
        optionId: "objective-political-attack",
        label: "Ataque político",
        description: "Clip engañoso contra una figura pública.",
      },
      {
        optionId: "objective-click-scam",
        label: "Estafa de clics",
        description: "Promesas imposibles para cosechar datos.",
      },
    ],
    ...overrides,
  };
}

describe("MisinformationAutopsyGame (T065)", () => {
  it("recorre los cuatro pasos en orden contractual y persiste selecciones de sesión", async () => {
    const user = userEvent.setup();
    const items = validateContentCollection(contentPack);
    const repository = createContentRepository(contentPack, {
      activeVersion: "2026-07-30.1",
    });
    const published = repository.listPublishedItems("mente-maestra");

    expect(AUTOPSY_STEPS).toEqual([
      "objective",
      "emotion",
      "headline",
      "evidence",
    ]);
    expect(
      published.map((item) =>
        item.publicItem.gameCode === "mente-maestra"
          ? item.publicItem.step
          : null,
      ),
    ).toEqual([...AUTOPSY_STEPS]);

    const sessionSelections: PersistedAutopsySelection[] = [];
    const domainSelections: GuidedAutopsySelection[] = [];
    let points = 0;

    for (const [index, item] of published.entries()) {
      if (item.publicItem.gameCode !== "mente-maestra") {
        throw new Error("Se esperaba un item de mente-maestra.");
      }

      const publicItem = item.publicItem;
      const onChoose = vi.fn();
      const { rerender, unmount } = render(
        <MisinformationAutopsyGame
          item={publicItem}
          stepNumber={index + 1}
          sessionSelections={sessionSelections}
          onChoose={onChoose}
        />,
      );

      expect(
        screen.getByText(
          new RegExp(
            `Paso ${index + 1} de 4: (Objetivo|Emoción|Titular|Prueba)`,
          ),
        ),
      ).toBeVisible();

      const firstOption = publicItem.options[0];
      await user.click(
        screen.getByRole("button", { name: new RegExp(firstOption.label) }),
      );
      expect(onChoose).toHaveBeenCalledWith({ optionId: firstOption.optionId });

      const evaluation = evaluateGuidedAutopsyStep({
        step: publicItem.step,
        optionId: firstOption.optionId,
        solution: item.solutionPrivate,
        feedback: item.feedback,
      });
      expect(evaluation.points).toBe(1);
      points += evaluation.points;

      sessionSelections.push({
        step: publicItem.step,
        optionId: firstOption.optionId,
        label: firstOption.label,
      });
      domainSelections.push({
        step: evaluation.step,
        optionId: evaluation.optionId,
        reachWeight: evaluation.reachWeight,
        autopsyEntry: evaluation.autopsyEntry,
      });

      rerender(
        <MisinformationAutopsyGame
          item={publicItem}
          stepNumber={index + 1}
          sessionSelections={sessionSelections}
          selectedOptionId={firstOption.optionId}
          onChoose={onChoose}
        />,
      );

      expect(screen.getByRole("status")).toHaveTextContent(
        `Elegiste ${firstOption.label}.`,
      );
      expect(
        screen.getByRole("button", { name: new RegExp(firstOption.label) }),
      ).toBeDisabled();

      unmount();
    }

    expect(sessionSelections.map((selection) => selection.step)).toEqual([
      ...AUTOPSY_STEPS,
    ]);
    expect(points).toBe(4);

    const evidenceSolution = parseGuidedAutopsySolution(
      items[3].solutionPrivate,
    );
    const session = assembleGuidedAutopsySession({
      selections: domainSelections,
      simulationAssets: evidenceSolution.simulationAssets,
    });

    render(
      <MisinformationAutopsyGame
        item={null}
        sessionSelections={sessionSelections}
        simulatedReach={session.simulatedReach}
        autopsyEntries={session.autopsyEntries.map((entry) => ({
          step: entry.step,
          title: entry.title,
          tip: entry.tip,
        }))}
        fictionalComments={session.fictionalComments}
        educationalDisclaimer={session.educationalDisclaimer}
      />,
    );

    const sessionPanel = screen.getByRole("region", {
      name: /Selecciones de esta sesión/i,
    });
    expect(sessionPanel).toBeVisible();
    expect(sessionSelections).toHaveLength(4);
    for (const selection of sessionSelections) {
      expect(within(sessionPanel).getByText(selection.label)).toBeVisible();
    }
  });

  it("muestra la autopsia inline y separa el alcance simulado del score educativo", () => {
    const items = validateContentCollection(contentPack);
    const selections: GuidedAutopsySelection[] = [];

    for (const item of items) {
      if (item.publicItem.gameCode !== "mente-maestra") {
        throw new Error("Se esperaba un item de mente-maestra.");
      }
      const optionId = item.publicItem.options[0].optionId;
      const evaluation = evaluateGuidedAutopsyStep({
        step: item.publicItem.step,
        optionId,
        solution: item.solutionPrivate,
        feedback: item.feedback,
      });
      selections.push({
        step: evaluation.step,
        optionId: evaluation.optionId,
        reachWeight: evaluation.reachWeight,
        autopsyEntry: evaluation.autopsyEntry,
      });
    }

    const session = assembleGuidedAutopsySession({
      selections,
      simulationAssets: parseGuidedAutopsySolution(items[3].solutionPrivate)
        .simulationAssets,
    });
    const score = calculateGameScore({
      gameCode: "mente-maestra",
      answers: selections.map(() => ({ completed: true })),
    });

    expect(maxPointsForGame("mente-maestra")).toBe(4);
    expect(score.points).toBe(4);
    expect(score.maxPoints).toBe(4);
    expect(session.simulatedReach).toBeGreaterThanOrEqual(SIMULATED_REACH_MIN);
    expect(session.simulatedReach).toBeLessThanOrEqual(SIMULATED_REACH_MAX);
    expect(session.simulatedReach).not.toBe(score.points);
    expect(score).not.toHaveProperty("simulatedReach");

    render(
      <MisinformationAutopsyGame
        item={null}
        simulatedReach={session.simulatedReach}
        autopsyEntries={session.autopsyEntries.map((entry) => ({
          step: entry.step,
          title: entry.title,
          tip: entry.tip,
        }))}
        fictionalComments={session.fictionalComments}
        educationalDisclaimer={session.educationalDisclaimer}
      />,
    );

    const autopsyHeading = screen.getByRole("heading", {
      name: /Autopsia de tu fake news/i,
    });
    expect(autopsyHeading).toBeVisible();
    const autopsy = autopsyHeading.closest("section");
    expect(autopsy).not.toBeNull();

    expect(
      within(autopsy!).getByText(new RegExp(`${session.simulatedReach} de 95`)),
    ).toBeVisible();
    expect(within(autopsy!).getByRole("meter")).toHaveAttribute(
      "aria-valuenow",
      String(session.simulatedReach),
    );
    expect(within(autopsy!).getByText(/no suma puntos/i)).toBeVisible();

    for (const entry of session.autopsyEntries) {
      expect(within(autopsy!).getByText(entry.title)).toBeVisible();
      expect(within(autopsy!).getByText(entry.tip)).toBeVisible();
    }
  });

  it("no ofrece publicación externa ni cuenta real en la simulación", () => {
    render(
      <MisinformationAutopsyGame
        item={makeItem()}
        onChoose={() => {}}
        simulatedReach={70}
        autopsyEntries={[
          {
            step: "emotion",
            title: "Miedo",
            tip: "Si te asusta, detente.",
          },
        ]}
        fictionalComments={["@esceptico_ok: ¿Fuente?"]}
        educationalDisclaimer="Simulación educativa: no se publica contenido externo ni se crea una cuenta real."
      />,
    );

    expect(
      screen.getByText(/no se publica contenido externo/i),
    ).toBeVisible();
    expect(
      screen.getByText(/No se publicó nada fuera de esta simulación/),
    ).toBeVisible();
    expect(
      screen.queryByRole("button", {
        name: /publicar|compartir|crear cuenta|tweet|postear/i,
      }),
    ).toBeNull();
    expect(screen.queryByRole("link", { name: /publicar|compartir/i })).toBeNull();
  });

  it("rechaza un paso fuera de orden en el evaluador y mantiene el foco en el paso actual", async () => {
    const user = userEvent.setup();
    const items = validateContentCollection(contentPack);
    const emotion = items[1];
    const solution = parseGuidedAutopsySolution(emotion.solutionPrivate);

    expect(() =>
      evaluateGuidedAutopsyStep({
        step: "headline",
        optionId: Object.keys(solution.optionEvaluations)[0],
        solution,
        feedback: emotion.feedback,
      }),
    ).toThrow("GUIDED_AUTOPSY_STEP_MISMATCH");

    const item = makeItem({ step: "emotion", itemId: "mente-maestra-focus" });
    const onChoose = vi.fn();
    const { rerender } = render(
      <MisinformationAutopsyGame item={item} onChoose={onChoose} />,
    );

    await user.click(screen.getByRole("button", { name: /Pánico sanitario/ }));
    expect(onChoose).toHaveBeenCalled();

    rerender(
      <MisinformationAutopsyGame
        item={item}
        onChoose={onChoose}
        selectedOptionId="objective-health-panic"
      />,
    );

    expect(
      screen.getByRole("heading", { name: /simulación educativa/i }),
    ).toHaveFocus();
  });

  it("limita el score educativo a 4 aunque el alcance simulado sea mayor", () => {
    const items = validateContentCollection(contentPack);
    const selections: GuidedAutopsySelection[] = [];

    for (const item of items) {
      if (item.publicItem.gameCode !== "mente-maestra") {
        throw new Error("Se esperaba un item de mente-maestra.");
      }

      const solution = parseGuidedAutopsySolution(item.solutionPrivate);
      const highest = Object.entries(solution.optionEvaluations).reduce(
        (current, candidate) =>
          candidate[1].reachWeight > current[1].reachWeight
            ? candidate
            : current,
      );

      const evaluation = evaluateGuidedAutopsyStep({
        step: item.publicItem.step,
        optionId: highest[0],
        solution,
        feedback: item.feedback,
      });

      expect(evaluation.points).toBe(1);
      selections.push({
        step: evaluation.step,
        optionId: evaluation.optionId,
        reachWeight: evaluation.reachWeight,
        autopsyEntry: evaluation.autopsyEntry,
      });
    }

    const session = assembleGuidedAutopsySession({
      selections,
      simulationAssets: parseGuidedAutopsySolution(items[3].solutionPrivate)
        .simulationAssets,
    });
    const score = calculateGameScore({
      gameCode: "mente-maestra",
      answers: selections.map(() => ({ completed: true })),
    });

    expect(session.simulatedReach).toBe(95);
    expect(score.points).toBe(4);
    expect(score.maxPoints).toBe(4);
    expect(session.publishesExternally).toBe(false);
  });
});
