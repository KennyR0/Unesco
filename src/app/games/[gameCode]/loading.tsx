export default function Loading() {
  return (
    <main
      className="game-shell game-route__loading"
      aria-busy="true"
      aria-labelledby="game-loading-title"
    >
      <header className="game-shell__header">
        <p className="eyebrow">Antídoto / Arcade MIL</p>
        <h1 id="game-loading-title">Preparando tu misión</h1>
        <p role="status" aria-live="polite">
          Cargando la misión…
        </p>
      </header>
    </main>
  );
}
