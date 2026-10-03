import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SECTIONS } from '../sections';

export default function SectionSelect() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const active = SECTIONS.find((s) => s.path === pathname);
  const filtered = SECTIONS.filter((s) =>
    s.label.toLowerCase().includes(query.trim().toLowerCase())
  );

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const go = (path) => {
    navigate(path);
    setOpen(false);
    setQuery('');
  };

  return (
    <div className="type-select" ref={ref}>
      <button className="type-select-btn section" onClick={() => setOpen(!open)}>
        <span className="muted">Sección:</span>
        <strong>{active ? active.label : 'Elegir'}</strong>
        <span>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="type-select-menu">
          <input
            autoFocus
            className="type-select-search"
            placeholder="Buscar sección..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="type-select-list">
            {filtered.length === 0 && <p className="muted type-select-empty">Sin resultados</p>}
            {filtered.map((s) => (
              <button
                key={s.path}
                className={`type-select-item ${s.path === pathname ? 'active' : ''}`}
                onClick={() => go(s.path)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}