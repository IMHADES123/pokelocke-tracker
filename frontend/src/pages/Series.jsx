import { useEffect, useState } from 'react';
import * as api from '../api';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';

const STATUS = { ganado: 'Ganado', perdido: 'Perdido', en_curso: 'En curso' };

function SeriesForm({ initial, lockeTypes, onSave, onCancel }) {
  const types = lockeTypes.filter((t) => t.uses_lives);
  const [f, setF] = useState({
    name: initial?.name || '',
    trainer: initial?.trainer || 'Hades',
    locke_type_id: initial?.locke_type_id || types[0]?.id || '',
    start_lives: initial?.start_lives ?? 50,
    bonus_lives: initial?.bonus_lives ?? 3,
    bonus_if_deaths_under: initial?.bonus_if_deaths_under ?? 10,
  });
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    onSave({
      ...f,
      locke_type_id: Number(f.locke_type_id) || null,
      start_lives: Number(f.start_lives) || 50,
      bonus_lives: Number(f.bonus_lives) || 0,
      bonus_if_deaths_under: Number(f.bonus_if_deaths_under) || 0,
    });
  };

  return (
    <form className="form" onSubmit={submit}>
      <div className="form-row">
        <label>Nombre de la serie
          <input value={f.name} onChange={set('name')} required placeholder="Megalocke 1" />
        </label>
        <label>Entrenador
          <input value={f.trainer} onChange={set('trainer')} required />
        </label>
      </div>
      <label>Tipo de locke
        <select value={f.locke_type_id} onChange={set('locke_type_id')}>
          {types.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </label>
      <div className="form-row">
        <label>Vidas iniciales
          <input type="number" min="1" value={f.start_lives} onChange={set('start_lives')} />
        </label>
        <label>Vidas de bonus
          <input type="number" min="0" value={f.bonus_lives} onChange={set('bonus_lives')} />
        </label>
        <label>Bonus si muertes &lt;
          <input type="number" min="0" value={f.bonus_if_deaths_under}
            onChange={set('bonus_if_deaths_under')} />
        </label>
      </div>
      <p className="form-msg">
        Al ganar un locke de la serie con menos muertes que el límite, se suman las vidas de bonus.
      </p>
      <div className="form-actions">
        <button type="button" className="btn-ghost" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn-primary">Guardar</button>
      </div>
    </form>
  );
}

export default function Series() {
  const [series, setSeries] = useState([]);
  const [lockeTypes, setLockeTypes] = useState([]);
  const [modal, setModal] = useState(null); // { data: null | serie }
  const [error, setError] = useState('');

  const fail = (e) => setError(e.message);
  const load = () => api.getSeries().then(setSeries).catch(fail);

  useEffect(() => {
    load();
    api.getLockeTypes().then(setLockeTypes).catch(fail);
  }, []);

  const save = async (form) => {
    try {
      if (modal.data) await api.updateSeries(modal.data.id, form);
      else await api.createSeries(form);
      setModal(null);
      setError('');
      load();
    } catch (e) { fail(e); }
  };

  const remove = async (s) => {
    if (!window.confirm(`¿Eliminar la serie "${s.name}"? Los lockes no se borran, solo dejan de compartir vidas.`)) return;
    try { await api.deleteSeries(s.id); load(); } catch (e) { fail(e); }
  };

  return (
    <>
      <Navbar />
      <main className="content">
        <div className="admin-title">
          <h2>Series de vidas</h2>
          <button className="btn-primary" onClick={() => setModal({ data: null })}>+ Nueva serie</button>
        </div>
        <p className="muted" style={{ marginBottom: 16 }}>
          Los lockes de una misma serie comparten vidas. Asigna cada locke a su serie desde Administrar.
        </p>
        {error && <p className="error" style={{ padding: 0 }}>⚠ {error}</p>}
        {series.length === 0 && <p className="muted">Aún no hay series.</p>}

        <div className="grid">
          {series.map((s) => (
            <article key={s.id} className="card">
              <div className="card-body" style={{ paddingTop: 20 }}>
                <h3>{s.name}</h3>
                <p className="muted">{s.trainer} · {s.locke_type || 'Sin tipo'}</p>

                <div className={`score-total ${s.lives <= 0 ? 'out' : ''}`}>
                  <span className="muted">VIDAS RESTANTES</span>
                  <strong style={{ color: s.lives <= 0 ? '#ef4444' : '#22c55e' }}>{s.lives}</strong>
                </div>

                <div className="score-stats">
                  <div className="score-row"><span className="muted">Iniciales</span><strong>{s.start_lives}</strong></div>
                  <div className="score-row"><span className="muted">Muertes</span><strong>−{s.total_deaths}</strong></div>
                  <div className="score-row"><span className="muted">Bonus</span><strong>+{s.total_bonus}</strong></div>
                  <p className="muted legend-note">
                    Bonus: +{s.bonus_lives} al ganar con menos de {s.bonus_if_deaths_under} muertes
                  </p>
                </div>

                <p className="score-section">Lockes de la serie ({s.lockes.length})</p>
                {s.lockes.length === 0 && <p className="muted">Ninguno todavía.</p>}
                {s.lockes.map((l) => (
                  <p key={l.id} className="muted">
                    {l.name} · {STATUS[l.status]} · {l.deaths} muertes
                    {l.bonus ? ` · +${l.bonus} bonus` : ''}
                  </p>
                ))}

                <div className="score-actions" style={{ marginTop: 12 }}>
                  <button className="btn-ghost" onClick={() => setModal({ data: s })}>Editar</button>
                  <button className="btn-danger" onClick={() => remove(s)}>Eliminar</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>

      {modal && (
        <Modal title={modal.data ? 'Editar serie' : 'Nueva serie'} onClose={() => setModal(null)}>
          <SeriesForm
            initial={modal.data}
            lockeTypes={lockeTypes}
            onSave={save}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}
    </>
  );
}