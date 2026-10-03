import { useEffect, useRef, useState } from 'react';

export default function LockeTypeSelect({ lockeTypes, activeTypeId, onSelect }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef(null);

  const active = lockeTypes.find((t) => t.id === activeTypeId);
  const filtered = lockeTypes.filter((t) =>
    t.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const choose = (id) => {
    onSelect(id);
    setOpen(false);
    setQuery('');
  };

  return (
    <div className="type-select" ref={ref}>
      <button className="type-select-btn" onClick={() => setOpen(!open)}>
        <span className="muted">Tipo de locke:</span>
        <strong>{active ? active.name : 'Elegir'}</strong>
        <span>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="type-select-menu">
          <input
            autoFocus
            className="type-select-search"
            placeholder="Buscar tipo de locke..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="type-select-list">
            {filtered.length === 0 && <p className="muted type-select-empty">Sin resultados</p>}
            {filtered.map((t) => (
              <button
                key={t.id}
                className={`type-select-item ${t.id === activeTypeId ? 'active' : ''}`}
                onClick={() => choose(t.id)}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}