export function RoundProgress({ current, total }: { current: number; total: number }) {
  const safeTotal = Math.max(total, 1);
  const safeCurrent = Math.min(Math.max(current, 1), safeTotal);
  return (
    <div className="round-progress" aria-label={`Pregunta ${safeCurrent} de ${safeTotal}`}>
      <p className="progress-label">Pregunta {safeCurrent} de {safeTotal}</p>
      <div className="progress-track" role="progressbar" aria-valuemin={1} aria-valuemax={safeTotal} aria-valuenow={safeCurrent} aria-valuetext={`Pregunta ${safeCurrent} de ${safeTotal}`}>
        <span style={{ width: `${(safeCurrent / safeTotal) * 100}%` }} />
      </div>
    </div>
  );
}
