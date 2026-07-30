import Link from "next/link";

import { LeaderboardTable } from "../../components/game/leaderboard-table";
import { getLeaderboardServer } from "../../features/game/application/server-operations";

export const dynamic = "force-dynamic";

export default async function RankingPage() {
  const result = await getLeaderboardServer();
  const data = result.ok ? result.data as any : { entries: [], currentPlayerEntry: null };
  return <main className="game-shell"><LeaderboardTable entries={data.entries} currentPlayerEntry={data.currentPlayerEntry} />{!result.ok ? <p role="alert" className="form-error">{result.error.message}</p> : null}<Link className="secondary-action" href="/">Volver a jugar</Link></main>;
}
