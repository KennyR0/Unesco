import { cookies } from "next/headers";

import { ResultCard } from "../../components/game/result-card";
import { SecureStateView } from "../../components/game/secure-state-view";
import { getGameResultServer } from "../../features/game/application/server-operations";

export const dynamic = "force-dynamic";

export default async function ResultsPage() {
  const result = await getGameResultServer();
  if (!result.ok) return <SecureStateView canClear={Boolean((await cookies()).get("antidoto_session"))} />;
  return <ResultCard result={result.data} />;
}
