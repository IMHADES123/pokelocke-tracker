const STATUS = {
  ganado: { label: 'GANADO', cls: 'won' },
  perdido: { label: 'PERDIDO', cls: 'lost' },
  en_curso: { label: 'EN CURSO', cls: 'ongoing' },
};

export default function LockeHeader({ locke, open, onToggle }) {
  const status = STATUS[locke.status] || STATUS.en_curso;
  const total = locke.champions.length;

  return (
    <section className="locke-header">
      <div>
        <h1>
          {locke.name} <span className={`status ${status.cls}`}>{status.label}</span>
        </h1>
        <p className="muted">{total} Pokémon Campeones</p>
      </div>

      <div className="locke-right">
        <div className="locke-meta">
          <div>
            <small>DIFICULTAD</small>
            <strong>{locke.difficulty}</strong>
          </div>
          <div>
            <small>REGLAS ACTIVAS</small>
            <strong>{locke.rules || '—'}</strong>
          </div>
        </div>

        {onToggle && (
          <button className="toggle-btn" onClick={onToggle}>
            {open ? 'Ocultar campeones ▲' : 'Ver campeones ▼'}
          </button>
        )}
      </div>
    </section>
  );
}