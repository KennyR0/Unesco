import Link from "next/link";
import { notFound } from "next/navigation";

import type { GameCode } from "@antidoto/contracts";

import { GameShell } from "../../../components/game/game-shell";
import {
  listAvailableArcadeCatalog,
  requireArcadeCatalogEntry,
} from "../../../features/game/content/catalog";

type GamePageProps = Readonly<{
  params: Promise<{ gameCode: string }>;
}>;

export function generateStaticParams(): Array<{ gameCode: GameCode }> {
  return listAvailableArcadeCatalog().map(({ gameCode }) => ({ gameCode }));
}

export default async function GamePage({ params }: GamePageProps) {
  const { gameCode } = await params;

  let game;
  try {
    game = requireArcadeCatalogEntry(gameCode);
  } catch {
    notFound();
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
