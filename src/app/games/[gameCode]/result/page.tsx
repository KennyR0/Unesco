import Link from "next/link";
import { notFound } from "next/navigation";

import type { ArcadePublicErrorCode, GameCode } from "@antidoto/contracts";

import { GameShell } from "../../../../components/game/game-shell";
import { ResultCard } from "../../../../components/game/result-card";
import { SecureStateView } from "../../../../components/game/secure-state-view";
import { getArcadeGameResultServer } from "../../../../features/game/application/server-operations";
import {
  listAvailableArcadeCatalog,
  requireArcadeCatalogEntry,
} from "../../../../features/game/content/catalog";

type GameResultPageProps = Readonly<{
  params: Promise<{ gameCode: string }>;
}>;

export function generateStaticParams(): Array<{ gameCode: GameCode }> {
  return listAvailableArcadeCatalog().map(({ gameCode }) => ({ gameCode }));
}

function secureReasonForError(
  code: ArcadePublicErrorCode,
): "missing" | "invalid" | "expired" | "result-expired" | null {
  switch (code) {
    case "SESSION_NOT_FOUND":
      return "missing";
    case "SESSION_INVALID":
    case "GAME_MISMATCH":
    case "INVALID_GAME":
      return "invalid";
    case "SESSION_EXPIRED":
      return "expired";
    case "RESULT_ACCESS_EXPIRED":
      return "result-expired";
    default:
      return null;
  }
}

export default async function GameResultPage({ params }: GameResultPageProps) {
  const { gameCode } = await params;

  let game;
  try {
    game = requireArcadeCatalogEntry(gameCode);
  } catch {
    notFound();
  }

  const result = await getArcadeGameResultServer({ gameCode: game.gameCode });

  if (!result.ok) {
    const secureReason = secureReasonForError(result.error.code);
    if (secureReason) {
      return (
        <SecureStateView
          gameCode={game.gameCode}
          reason={secureReason}
          canClear={
            secureReason === "invalid" || secureReason === "result-expired"
          }
        />
      );
    }

    return (
      <GameShell
        title={game.name}
        gameCode={game.gameCode}
        eyebrow="Resultado"
        status="invalid"
        statusMessage="Resultado no disponible"
        className="game-route game-route--result"
      >
        <article className="result-card result-card--unavailable">
          <p className="eyebrow">Resultado / {game.gameCode}</p>
          <h2>Todavía no hay resultado</h2>
          <p role="status">{result.error.message}</p>
          <nav className="result-card__actions" aria-label="Recuperar partida">
            <Link className="primary-action" href={`/games/${game.gameCode}`}>
              Volver a la misión
            </Link>
            <Link className="secondary-action" href="/">
              Volver al arcade
            </Link>
          </nav>
        </article>
      </GameShell>
    );
  }

  if (result.data.gameCode !== game.gameCode) {
    return (
      <SecureStateView gameCode={game.gameCode} reason="invalid" canClear />
    );
  }

  return (
    <GameShell
      title={game.name}
      gameCode={game.gameCode}
      eyebrow="Resultado de la misión"
      status={result.data.status === "finished" ? "finished" : "expired"}
      statusMessage={
        result.data.status === "finished"
          ? "Partida terminada"
          : "Partida expirada"
      }
      className="game-route game-route--result"
    >
      <ResultCard result={result.data} gameName={game.name} />
    </GameShell>
  );
}
