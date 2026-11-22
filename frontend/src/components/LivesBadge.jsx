export default function LivesBadge({ series }) {
  if (!series) return null;
  const out = series.lives <= 0;
  return (
    <span
      className={`lives ${out ? 'out' : ''}`}
      title={`${series.start_lives} iniciales − ${series.total_deaths} muertes + ${series.total_bonus} bonus`}
    >
      ❤ {out ? 'Sin vidas' : `${series.lives} vidas`} · {series.name}
    </span>
  );
}