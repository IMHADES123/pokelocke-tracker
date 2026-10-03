import { useState } from 'react';
import TypeBadge from './TypeBadge';

const GENDER = {
  M: { symbol: '♂', color: '#4aa3ff' },
  F: { symbol: '♀', color: '#ff5fa2' },
};

export default function ChampionCard({ champion: c }) {
  const [abilityOpen, setAbilityOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const gender = GENDER[c.gender];

  return (
    <article className="card">
      <div className="card-image">
        {c.image_url && <img src={c.image_url} alt={c.species} loading="lazy" />}
      </div>

      <div className="card-body">
        <h3>
          {c.nickname}{' '}
          {gender && <span style={{ color: gender.color }}>{gender.symbol}</span>}
          {c.shiny && <span title="Shiny"> ✨</span>}
        </h3>
        <p className="muted">{c.species}</p>

        <div className="badges">
          <TypeBadge name={c.type1} color={c.type1_color} />
          {c.type2 && <TypeBadge name={c.type2} color={c.type2_color} />}
        </div>

        <div className="rows">
          <div className="row">
            <span className="muted">Habilidad</span>
            <strong>{c.ability || '—'}</strong>
          </div>
          <div className="row">
            <span className="muted">Naturaleza</span>
            <strong>
              {c.nature || '—'}
              {c.increased_stat && (
                <span className="stat up"> ▲ {c.increased_stat}</span>
              )}
              {c.decreased_stat && (
                <span className="stat down"> ▼ {c.decreased_stat}</span>
              )}
            </strong>
          </div>
        </div>

        <button className="accordion" onClick={() => setAbilityOpen(!abilityOpen)}>
          DESCRIPCIÓN DE LA HABILIDAD <span>{abilityOpen ? '▲' : '▼'}</span>
        </button>
        {abilityOpen && (
          <p className="accordion-text">
            {c.ability_description || 'Sin descripción todavía.'}
          </p>
        )}

        <button className="accordion" onClick={() => setSummaryOpen(!summaryOpen)}>
          RESUMEN DEL CAMPEÓN <span>{summaryOpen ? '▲' : '▼'}</span>
        </button>
        {summaryOpen && (
          <p className="accordion-text">{c.summary || 'Sin resumen todavía.'}</p>
        )}
      </div>
    </article>
  );
}