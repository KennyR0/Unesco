import Link from "next/link";
import { notFound } from "next/navigation";

import type { GameCode } from "@antidoto/contracts";

import { GameShell } from "../../../components/game/game-shell";
import { GrupoPlaySession } from "../../../components/game/grupo-play-session";
import { SecureStateView } from "../../../components/game/secure-state-view";
import { getArcadeGameStateServer } from "../../../features/game/application/server-operations";
import {
  listAvailableArcadeCatalog,
  requireArcadeCatalogEntry,
} from "../../../features/game/content/catalog";

type GamePageProps = Readonly<{
  params: Promise<{ gameCode: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>;

export function generateStaticParams(): Array<{ gameCode: GameCode }> {
  return listAvailableArcadeCatalog().map(({ gameCode }) => ({ gameCode }));
}

function firstSearchValue(
  value: string | string[] | undefined,
): string | null {
  if (typeof value === "string" && value.trim()) return value;
  if (Array.isArray(value) && typeof value[0] === "string" && value[0].trim()) {
    return value[0];
  }
  return null;
}

export default async function GamePage({ params, searchParams }: GamePageProps) {
  const { gameCode } = await params;
  const query = await searchParams;

  let game;
  try {
    game = requireArcadeCatalogEntry(gameCode);
  } catch {
    notFound();
  }

  if (game.gameCode === "grupo") {
    const stateResult = await getArcadeGameStateServer({ gameCode: "grupo" });

    if (
      !stateResult.ok &&
      (stateResult.error.code === "SESSION_INVALID" ||
        stateResult.error.code === "GAME_MISMATCH")
    ) {
      return (
        <SecureStateView gameCode="grupo" reason="invalid" canClear />
      );
    }

    const startError = firstSearchValue(query.startError);

    return (
      <GrupoPlaySession
        gameName={game.name}
        objective={game.objective}
        initialState={stateResult.ok ? stateResult.data : null}
        bootstrapError={
          startError ??
          (!stateResult.ok && stateResult.error.code !== "SESSION_NOT_FOUND"
            ? stateResult.error.message
            : null)
        }
      />
    );
  }

  return (
    <GameShell
      title={game.name}
      gameCode={game.gameCode}
      eyebrow="Antídoto / Arcade MIL"
      status="intro"
      statusMessage="Misión lista"
      className="game-route"
    >
      <article className="game-route__intro">
        <p className="game-route__label">Misión {game.gameCode}</p>
        <p className="game-route__objective">{game.objective}</p>
        <p className="game-route__mechanic">
          Mecánica: {game.mechanic.replaceAll("_", " ")}
        </p>
      </article>

      <nav className="game-route__navigation" aria-label="Navegación de la misión">
        <Link className="primary-action" href="/">
          Volver al arcade
        </Link>
      </nav>
    </GameShell>
  );
}
