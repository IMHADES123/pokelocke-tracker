import TypeBadge from './TypeBadge';

const GENDER = {
  M: { symbol: '♂', color: '#4aa3ff' },
  F: { symbol: '♀', color: '#ff5fa2' },
};

const STATS = [
  { key: 'kills', label: 'Kills', pts: '×1' },
  { key: 'assists', label: 'Asist', pts: '×0.5' },
  { key: 'mvps', label: 'MVP', pts: '×3' },
];

export default function ScoreCard({ p, onStat, onEdit, onDead, onEvolve, readOnly }) {
  const gender = GENDER[p.gender];

  return (
    <article className={`card score-card ${p.is_dead ? 'dead' : ''}`}>
      <div className="card-image score-image">
        {c.image_url && <img src={c.image_url} alt={c.species} loading="lazy" />}
      </div>

      <div className="card-body">
        <h3>
          {p.nickname}{' '}
          {gender && <span style={{ color: gender.color }}>{gender.symbol}</span>}
          {p.shiny && <span title="Shiny"> ✨</span>}
        </h3>
        <p className="muted">{p.species}</p>

        <div className="badges">
          {p.type1 && <TypeBadge name={p.type1} color={p.type1_color} />}
          {p.type2 && <TypeBadge name={p.type2} color={p.type2_color} />}
        </div>

        <div className="score-stats">
          {STATS.map((s) => (
            <div key={s.key} className="score-row">
              <span className="muted">{s.label} <small>{s.pts}</small></span>
              <div className="counter-box">
                <button
                  className="counter-btn"
                  disabled={readOnly || p.is_dead || p[s.key] === 0}
                  onClick={() => onStat(p, s.key, -1)}
                >−</button>
                <strong>{p[s.key]}</strong>
                <button
                  className="counter-btn plus"
                  disabled={readOnly || p.is_dead}
                  onClick={() => onStat(p, s.key, 1)}
                >+</button>
              </div>
            </div>
          ))}
        </div>

        <div className="score-total">
          <span className="muted">PUNTUACIÓN TOTAL</span>
          <strong>{Number(p.score)}</strong>
        </div>

        {!readOnly && (
          <div className="score-actions">
            <button className="btn-ghost" onClick={() => onEdit(p)}>Editar ficha</button>
            <button className="btn-ghost" onClick={() => onEvolve(p)} disabled={p.is_dead}>
  Evolución
</button>
            {p.is_dead ? (
              <button className="btn-revive" onClick={() => onDead(p, false)}>Revivir</button>
            ) : (
              <button className="btn-danger" onClick={() => onDead(p, true)}>Murió</button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}