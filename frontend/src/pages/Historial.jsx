import { useEffect, useState } from 'react';
import * as api from '../api';
import Navbar from '../components/Navbar';
import ScoreCard from '../components/ScoreCard';

const noop = () => {};

export default function Historial() {
  const [logs, setLogs] = useState([]);
  const [openLog, setOpenLog] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getScoreLogs()
      .then((l) => setLogs(l.filter((x) => x.locke_status !== 'en_curso')))
      .catch((e) => setError(e.message));
  }, []);

  const toggle = (id) => {
    if (openLog?.id === id) return setOpenLog(null);
    api.getScoreLog(id).then(setOpenLog).catch((e) => setError(e.message));
  };

  const ranking = (log) =>
    [...log.pokemon].sort((a, b) => b.score - a.score);

  return (
    <>
      <Navbar />
      <main className="content">
        <div className="admin-title">
          <h2>Historial de bitácoras</h2>
        </div>
        {error && <p className="error" style={{ padding: 0 }}>⚠ {error}</p>}

        <div className="admin-list">
          {logs.length === 0 && (
            <p className="muted">
              Aún no hay bitácoras finalizadas. Aparecen aquí cuando marcas su locke
              como Ganado o Perdido.
            </p>
          )}

          {logs.map((l) => {
            const isOpen = openLog?.id === l.id;
            return (
              <div key={l.id} className={`admin-block ${isOpen ? 'selected' : ''}`}>
                <div className="admin-item-row">
                  <div>
                    <strong>{l.name}</strong>
                    <p className="muted">
                      Locke: {l.locke_name} ·{' '}
                      {l.locke_status === 'ganado' ? 'Ganado' : 'Perdido'} ·{' '}
                      {l.total - l.dead} vivos · {l.dead} muertos
                    </p>
                  </div>
                  <button className="toggle-btn" onClick={() => toggle(l.id)}>
                    Pokémon {isOpen ? '▲' : '▼'}
                  </button>
                </div>

                {isOpen && (
                  <div className="admin-panel">
                    <div className="grid">
                      {ranking(openLog).map((p) => (
                        <ScoreCard key={p.id} p={p} readOnly
                          onStat={noop} onEdit={noop} onDead={noop} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}