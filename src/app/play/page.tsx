import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { FeedbackCard } from "../../components/game/feedback-card";
import { QuestionCard } from "../../components/game/question-card";
import { SecureStateView } from "../../components/game/secure-state-view";
import { getGameStateServer } from "../../features/game/application/server-operations";

export const dynamic = "force-dynamic";

export default async function PlayPage() {
  const result = await getGameStateServer();
  if (!result.ok) return <SecureStateView canClear={Boolean((await cookies()).get("antidoto_session"))} />;
  const state = result.data;
  if (state.view === "finished") redirect("/results");
  if (state.view === "question") return <main className="game-shell"><QuestionCard state={state} /></main>;
  return <main className="game-shell"><FeedbackCard state={state} /></main>;
}
