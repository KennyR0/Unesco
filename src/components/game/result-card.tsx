import Link from "next/link";

type Result = { alias: string; score: number; correctAnswers: number; totalQuestions: number; maxScore: number; educationalClosingMessage: string };

export function ResultCard({ result }: { result: Result }) {
  return <main className="landing-shell" aria-labelledby="result-title"><section className="landing-content result-card"><p className="eyebrow">Partida terminada</p><h1 id="result-title">{result.alias}, tu resultado</h1><p className="score-value">{result.score}<span>/{result.maxScore}</span></p><p>Acertaste {result.correctAnswers} de {result.totalQuestions} preguntas.</p><p className="supporting-copy">{result.educationalClosingMessage}</p><div className="action-row"><Link className="primary-action" href="/ranking">Ver ranking</Link><Link className="secondary-action" href="/">Jugar otra vez</Link></div></section></main>;
}
