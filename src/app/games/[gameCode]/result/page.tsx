import Link from "next/link";
import { notFound } from "next/navigation";

import type { ArcadePublicErrorCode, GameCode } from "@antidoto/contracts";

import { GameShell } from "../../../../components/game/game-shell";
import { ResultCard } from "../../../../components/game/result-card";
import { SecureStateView } from "../../../../components/game/secure-state-view";
import { getArcadeGameResultServer } from "../../../../features/game/application/server-operations";
import { listAvailableArcadeCatalog, requireArcadeCatalogEntry } from "../../../../features/game/content/catalog";
import { getLocalizedCatalog } from "../../../../lib/i18n/content";
import { getMessages } from "../../../../lib/i18n/i18n";
import { getServerLocale } from "../../../../lib/i18n/server";
import { localizeErrorMessage } from "../../../../lib/i18n/errors";

type GameResultPageProps = Readonly<{ params: Promise<{ gameCode: string }> }>;

export function generateStaticParams(): Array<{ gameCode: GameCode }> {
  return listAvailableArcadeCatalog().map(({ gameCode }) => ({ gameCode }));
}

function secureReasonForError(code: ArcadePublicErrorCode): "missing" | "invalid" | "expired" | "result-expired" | null {
  switch (code) {
    case "SESSION_NOT_FOUND": return "missing";
    case "SESSION_INVALID":
    case "GAME_MISMATCH":
    case "INVALID_GAME": return "invalid";
    case "SESSION_EXPIRED": return "expired";
    case "RESULT_ACCESS_EXPIRED": return "result-expired";
    default: return null;
  }
}

export default async function GameResultPage({ params }: GameResultPageProps) {
  const locale = await getServerLocale();
  const messages = getMessages(locale);
  const { gameCode } = await params;
  let game;
  try { game = requireArcadeCatalogEntry(gameCode); } catch { notFound(); }
  const localizedGame = getLocalizedCatalog(locale).find((entry) => entry.gameCode === game.gameCode) ?? game;
  const result = await getArcadeGameResultServer({ gameCode: game.gameCode });

  if (!result.ok) {
    const secureReason = secureReasonForError(result.error.code);
    if (secureReason) return <SecureStateView gameCode={game.gameCode} reason={secureReason} canClear={secureReason === "invalid" || secureReason === "result-expired"} />;
    return (
      <GameShell title={localizedGame.name} gameCode={game.gameCode} eyebrow={messages.result.result} status="invalid" statusMessage={messages.state.resultUnavailable} className="game-route game-route--result">
        <article className="result-card result-card--unavailable">
          <p className="eyebrow">{messages.result.result} / {game.gameCode}</p>
          <h2>{messages.state.resultUnavailable}</h2>
          <p role="status">{localizeErrorMessage(result.error.code, result.error.message, locale)}</p>
          <nav className="result-card__actions" aria-label={messages.result.actions}>
            <Link className="primary-action" href={`/games/${game.gameCode}`}>{messages.state.backToMission}</Link>
            <Link className="secondary-action" href="/">{messages.games.backToArcade}</Link>
          </nav>
        </article>
      </GameShell>
    );
  }

  if (result.data.gameCode !== game.gameCode) return <SecureStateView gameCode={game.gameCode} reason="invalid" canClear />;
  return (
    <GameShell title={localizedGame.name} gameCode={game.gameCode} eyebrow={messages.result.result} status={result.data.status === "finished" ? "finished" : "expired"} statusMessage={result.data.status === "finished" ? messages.games.gameFinished : messages.games.gameExpired} className="game-route game-route--result">
      <ResultCard result={result.data} gameName={localizedGame.name} />
    </GameShell>
  );
}
