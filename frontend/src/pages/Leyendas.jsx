import { useEffect, useState } from 'react';
import * as api from '../api';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import LegendForm from '../components/LegendForm';

const GENDER = {
  M: { symbol: '♂', color: '#4aa3ff' },
  F: { symbol: '♀', color: '#ff5fa2' },
};

function LegendCard({ l, rank, onEdit, onDelete }) {
  const [detail, setDetail] = useState(false);
  const g = GENDER[l.gender];

  return (
    <article className="card legend-card">
      <div className="card-image score-image">
        <span className="legend-rank">#{rank}</span>
        {l.image_url && <img src={l.image_url} alt={l.nickname} loading="lazy" />}
      </div>
      <div className="card-body">
        <h3>
          {l.nickname}{' '}
          {g && <span style={{ color: g.color }}>{g.symbol}</span>}
          {l.shiny && (
            <span title={`Shiny en ${l.shiny_count} locke(s)`}>
              {' '}✨{l.shiny_count > 1 ? `×${l.shiny_count}` : ''}
            </span>
          )}
        </h3>
        <p className="muted">
          {l.species.length ? l.species.join(' · ') : 'Sin registros todavía'}
          {l.auto ? ' · automática' : ''}
        </p>

        <div className="score-stats">
          <div className="score-row">
            <span className="muted">Score acumulado ({l.total_score})</span>
            <strong>+{l.score_points}</strong>
          </div>
          <div className="score-row">
            <span className="muted">Shiny ({l.shiny_count}×)</span>
            <strong>+{l.shiny_points}</strong>
          </div>
          <div className="score-row">
            <span className="muted">Lockes ganados</span>
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

        <button className="accordion" onClick={() => setDetail(!detail)}>
          DETALLE <span>{detail ? '▲' : '▼'}</span>
        </button>
        {detail && (
          <div className="accordion-text">
            <p><strong>Bitácoras ({l.runs.length})</strong></p>
            {l.runs.length === 0 && <p className="muted">Ninguna.</p>}
            {l.runs.map((r) => (
              <p key={r.id} className="muted">
                {r.log_name} · {r.species}: {r.score} pts{r.shiny ? ' ✨' : ''}
              </p>
            ))}
            <p style={{ marginTop: 8 }}><strong>Halls de la fama ({l.halls.length})</strong></p>
            {l.halls.length === 0 && <p className="muted">Ninguno.</p>}
            {l.halls.map((h) => (
              <p key={h.id} className="muted">
                {h.locke_name} · {h.species} · puesto {h.pos} ·{' '}
                {h.locke_status === 'ganado' ? `+${h.points}` : 'locke sin ganar (+0)'}
                {h.shiny ? ' ✨' : ''}
              </p>
            ))}
          </div>
        )}

        <div className="score-actions">
          <button className="btn-ghost" onClick={() => onEdit(l)}>
            {l.auto ? 'Añadir extras' : 'Editar'}
          </button>
          {!l.auto && (
            <button className="btn-danger" onClick={() => onDelete(l)}>Restablecer</button>
          )}
        </div>
      </div>
    </article>
  );
}

export default function Leyendas() {
  const [legends, setLegends] = useState([]);
  const [names, setNames] = useState([]);
  const [modal, setModal] = useState(null); // { data: null | legend }
  const [error, setError] = useState('');

  const fail = (e) => setError(e.message);
  const load = () => api.getLegends().then(setLegends).catch(fail);

  useEffect(() => { load(); }, []);

  const openModal = async (data) => {
    try {
      const s = await api.getLegendSources();
      setNames(s.names);
      setError('');
      setModal({ data });
    } catch (e) { fail(e); }
  };

  const save = async (form) => {
    try {
      // Con id: actualiza la ficha manual. Sin id (automática o nueva): crea/actualiza por nombre
      if (modal.data?.id) await api.updateLegend(modal.data.id, form);
      else await api.createLegend(form);
      setModal(null);
      setError('');
      load();
    } catch (e) { fail(e); }
  };

  const remove = async (l) => {
    if (!window.confirm(
      `¿Quitar los extras de ${l.nickname}? Si sus puntos alcanzan, seguirá apareciendo como automática. Los Pokémon no se borran.`
    )) return;
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
        <p className="muted" style={{ marginBottom: 16 }}>
          Aparecen solas los Pokémon con al menos 1 punto, ordenados de mayor a menor.
        </p>
        {error && <p className="error" style={{ padding: 0 }}>⚠ {error}</p>}
        {legends.length === 0 && (
          <p className="muted">
            Todavía ningún Pokémon llega a 1 punto (100 de score, un shiny o un locke ganado).
          </p>
        )}

        <div className="grid">
          {legends.map((l, i) => (
            <LegendCard key={l.key} l={l} rank={i + 1} onEdit={openModal} onDelete={remove} />
          ))}
        </div>
      </main>

      {modal && (
        <Modal title={modal.data ? 'Editar leyenda' : 'Nueva leyenda'} onClose={() => setModal(null)}>
          <LegendForm
            initial={modal.data}
            names={names}
            onSave={save}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}
    </>
  );
}