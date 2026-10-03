import { useEffect, useState } from 'react';
import * as api from '../api';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import ScoreCard from '../components/ScoreCard';
import ScoreLogForm from '../components/ScoreLogForm';
import ScorePokemonForm from '../components/ScorePokemonForm';

const MAX_LOGS = 5;

export default function Bitacoras() {
  const [logs, setLogs] = useState([]);
  const [activeLockes, setActiveLockes] = useState([]);
  const [pokemonTypes, setPokemonTypes] = useState([]);
  const [openLog, setOpenLog] = useState(null);
  const [logModal, setLogModal] = useState(false);
  const [pokeModal, setPokeModal] = useState(null); // { data: null | pokemon }
  const [error, setError] = useState('');

  const fail = (e) => setError(e.message);
  const loadLogs = () => api.getScoreLogs().then(setLogs).catch(fail);
  const loadLog = (id) => api.getScoreLog(id).then(setOpenLog).catch(fail);
  const loadActiveLockes = () =>
    api.getLockes()
      .then((l) => setActiveLockes(l.filter((x) => x.status === 'en_curso')))
      .catch(fail);

  useEffect(() => {
    loadLogs();
    loadActiveLockes();
    api.getPokemonTypes().then(setPokemonTypes).catch(fail);
  }, []);

  // Cuántas bitácoras cuentan para el límite (lockes en curso)
  const activeCount = logs.filter((l) => l.locke_status === 'en_curso').length;

  const toggle = (id) => {
    if (openLog?.id === id) setOpenLog(null);
    else loadLog(id);
  };

  // ---- Bitácoras ----
  const saveLog = async (form) => {
    try {
      const created = await api.createScoreLog(form);
      setLogModal(false);
      setError('');
      await loadLogs();
      loadLog(created.id);
    } catch (e) { fail(e); }
  };

  const removeLog = async (l) => {
    if (!window.confirm(`¿Eliminar la bitácora "${l.name}" con todos sus Pokémon?`)) return;
    try {
      await api.deleteScoreLog(l.id);
      if (openLog?.id === l.id) setOpenLog(null);
      loadLogs();
    } catch (e) { fail(e); }
  };

  // ---- Pokémon ----
  const merge = (updated) =>
    setOpenLog((log) => ({
      ...log,
      pokemon: log.pokemon.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)),
    }));

  const changeStat = (p, field, delta) =>
    api.changeScoreStat(p.id, field, delta).then(merge).catch(fail);

  const setDead = (p, dead) => {
    if (dead && !window.confirm(`¿Confirmas que ${p.nickname} murió?`)) return;
    api.setScoreDead(p.id, dead).then(merge).then(loadLogs).catch(fail);
  };

  const savePokemon = async (form) => {
    try {
      if (pokeModal.data) await api.updateScorePokemon(pokeModal.data.id, form);
      else await api.addScorePokemon(openLog.id, form);
      setPokeModal(null);
      loadLog(openLog.id);
      loadLogs();
    } catch (e) { fail(e); }
  };

  const removePokemon = async () => {
    const p = pokeModal.data;
    if (!window.confirm(`¿Eliminar a ${p.nickname} definitivamente?`)) return;
    try {
      await api.deleteScorePokemon(p.id);
      setPokeModal(null);
      loadLog(openLog.id);
      loadLogs();
    } catch (e) { fail(e); }
  };

  const alive = openLog?.pokemon.filter((p) => !p.is_dead) || [];
  const dead = openLog?.pokemon.filter((p) => p.is_dead) || [];

  return (
    <>
      <Navbar />
      <main className="content">
        <div className="admin-title">
          <h2>
            Bitácoras de puntuación{' '}
            <span className="muted">({activeCount}/{MAX_LOGS} en curso)</span>
          </h2>
          <button
            className="btn-primary"
            disabled={activeCount >= MAX_LOGS}
            onClick={() => { loadActiveLockes(); setLogModal(true); }}
          >
            + Nueva bitácora
          </button>
        </div>
        {error && <p className="error" style={{ padding: 0 }}>⚠ {error}</p>}

        <div className="admin-list">
          {logs.length === 0 && (
            <p className="muted">Aún no tienes bitácoras. Crea la primera.</p>
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
                      {l.locke_status === 'en_curso' ? 'En curso' : 'Finalizado'} ·{' '}
                      {l.total - l.dead} vivos · {l.dead} muertos
                    </p>
                  </div>
                  <div className="admin-actions">
                    <button className="btn-danger" onClick={() => removeLog(l)}>Eliminar</button>
                    <button className="toggle-btn" onClick={() => toggle(l.id)}>
                      Pokémon {isOpen ? '▲' : '▼'}
                    </button>
                  </div>
                </div>

                {isOpen && openLog && (
                  <div className="admin-panel">
                    <div className="admin-panel-head">
                      <span className="muted">Equipo de la bitácora</span>
                      <button className="btn-primary" onClick={() => setPokeModal({ data: null })}>
                        + Añadir Pokémon
                      </button>
                    </div>

                    <h4 className="score-section">Vivos ({alive.length})</h4>
                    {alive.length === 0 && <p className="muted">No hay Pokémon vivos.</p>}
                    <div className="grid">
                      {alive.map((p) => (
                        <ScoreCard key={p.id} p={p} onStat={changeStat}
                          onEdit={(x) => setPokeModal({ data: x })} onDead={setDead} />
                      ))}
                    </div>

                    <h4 className="score-section">💀 Muertos ({dead.length})</h4>
                    {dead.length === 0 && <p className="muted">Nadie ha muerto todavía.</p>}
                    <div className="grid">
                      {dead.map((p) => (
                        <ScoreCard key={p.id} p={p} onStat={changeStat}
                          onEdit={(x) => setPokeModal({ data: x })} onDead={setDead} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {logModal && (
        <Modal title="Nueva bitácora" onClose={() => setLogModal(false)}>
          <ScoreLogForm lockes={activeLockes} onSave={saveLog} onCancel={() => setLogModal(false)} />
        </Modal>
      )}

      {pokeModal && (
        <Modal
          title={pokeModal.data ? 'Editar ficha' : 'Añadir Pokémon'}
          onClose={() => setPokeModal(null)}
        >
          <ScorePokemonForm
            initial={pokeModal.data}
            pokemonTypes={pokemonTypes}
            onSave={savePokemon}
            onCancel={() => setPokeModal(null)}
            onDelete={pokeModal.data ? removePokemon : null}
          />
        </Modal>
      )}
    </>
  );
}