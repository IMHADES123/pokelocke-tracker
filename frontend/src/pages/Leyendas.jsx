import { useEffect, useState } from 'react';
import * as api from '../api';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import LegendForm from '../components/LegendForm';

const GENDER = {
  M: { symbol: '♂', color: '#4aa3ff' },
  F: { symbol: '♀', color: '#ff5fa2' },
};

export default function Leyendas() {
  const [legends, setLegends] = useState([]);
  const [sources, setSources] = useState({ champions: [], pokemon: [] });
  const [modal, setModal] = useState(null); // { data: null | legend }
  const [error, setError] = useState('');

  const fail = (e) => setError(e.message);
  const load = () => api.getLegends().then(setLegends).catch(fail);

  useEffect(() => { load(); }, []);

  const openModal = async (data) => {
    try {
      setSources(await api.getLegendSources());
      setModal({ data });
    } catch (e) { fail(e); }
  };

  const save = async (form) => {
    try {
      if (modal.data) await api.updateLegend(modal.data.id, form);
      else await api.createLegend(form);
      setModal(null);
      load();
    } catch (e) { fail(e); }
  };

  const remove = async (l) => {
    if (!window.confirm(`¿Eliminar a la leyenda ${l.nickname}?`)) return;
    try { await api.deleteLegend(l.id); load(); } catch (e) { fail(e); }
  };

  return (
    <>
      <Navbar />
      <main className="content">
        <div className="admin-title">
          <h2>Leyendas</h2>
          <button className="btn-primary" onClick={() => openModal(null)}>+ Nueva leyenda</button>
        </div>
        {error && <p className="error" style={{ padding: 0 }}>⚠ {error}</p>}
        {legends.length === 0 && <p className="muted">Aún no hay leyendas.</p>}

        <div className="grid">
          {legends.map((l, i) => {
            const g = GENDER[l.gender];
            return (
              <article key={l.id} className="card legend-card">
                <div className="card-image score-image">
                  <span className="legend-rank">#{i + 1}</span>
                  {l.image_url && <img src={l.image_url} alt={l.species} />}
                </div>
                <div className="card-body">
                  <h3>
                    {l.nickname}{' '}
                    {g && <span style={{ color: g.color }}>{g.symbol}</span>}
                    {l.shiny && <span title="Shiny"> ✨</span>}
                  </h3>
                  <p className="muted">{l.species}</p>

                  <div className="score-stats">
                    <div className="score-row">
                      <span className="muted">
                        Score {l.score != null ? `(${Number(l.score)})` : '(sin bitácora)'}
                      </span>
                      <strong>+{l.score_points}</strong>
                    </div>
                    <div className="score-row">
                      <span className="muted">Shiny</span>
                      <strong>+{l.shiny_points}</strong>
                    </div>
                    <div className="score-row">
                      <span className="muted">
                        {l.pos
                          ? `Locke ${l.locke_status === 'ganado' ? 'ganado' : 'no ganado'} · puesto ${l.pos}`
                          : 'Locke ganado'}
                      </span>
                      <strong>+{l.win_points}</strong>
                    </div>
                    <div className="score-row">
                      <span className="muted">Extra</span>
                      <strong>{l.extra_points > 0 ? '+' : ''}{l.extra_points}</strong>
                    </div>
                    {l.extra_notes && <p className="muted legend-note">{l.extra_notes}</p>}
                  </div>

                  <div className="score-total">
                    <span className="muted">PUNTOS DE LEYENDA</span>
                    <strong>{l.total}</strong>
                  </div>

                  <div className="score-actions">
                    <button className="btn-ghost" onClick={() => openModal(l)}>Editar</button>
                    <button className="btn-danger" onClick={() => remove(l)}>Eliminar</button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </main>

      {modal && (
        <Modal title={modal.data ? 'Editar leyenda' : 'Nueva leyenda'} onClose={() => setModal(null)}>
          <LegendForm
            initial={modal.data}
            sources={sources}
            onSave={save}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}
    </>
  );
}