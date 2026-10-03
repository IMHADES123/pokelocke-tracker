import { useMemo, useState } from 'react';

const PAGE = 20;

const SORTS = {
  score: { label: 'Mayor puntuación', fn: (a, b) => b.score - a.score },
  kills: { label: 'Más kills', fn: (a, b) => b.kills - a.kills },
  name: { label: 'Nombre (A-Z)', fn: (a, b) => a.nickname.localeCompare(b.nickname) },
  recent: { label: 'Más recientes', fn: (a, b) => b.id - a.id },
};

export default function PokemonList({ items, render, empty }) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('score');
  const [limit, setLimit] = useState(PAGE);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items
      .filter((p) =>
        !q || p.nickname.toLowerCase().includes(q) || p.species.toLowerCase().includes(q))
      .sort(SORTS[sort].fn);
  }, [items, query, sort]);

  if (items.length === 0) return <p className="muted">{empty}</p>;

  const visible = filtered.slice(0, limit);

  return (
    <>
      {items.length > 6 && (
        <div className="list-toolbar">
          <input
            placeholder="Buscar por nombre o especie..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setLimit(PAGE); }}
          />
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            {Object.entries(SORTS).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>
      )}

      {filtered.length === 0 && <p className="muted">Sin resultados.</p>}
      <div className="grid">{visible.map(render)}</div>

      {filtered.length > limit && (
        <button className="btn-ghost list-more" onClick={() => setLimit(limit + PAGE)}>
          Ver más ({filtered.length - limit} restantes)
        </button>
      )}
    </>
  );
}