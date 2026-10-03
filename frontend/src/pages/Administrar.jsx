import { useEffect, useState } from 'react';
import * as api from '../api';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import LockeForm from '../components/LockeForm';
import ChampionForm from '../components/ChampionForm';

const STATUS_LABEL = { ganado: 'Ganado', perdido: 'Perdido', en_curso: 'En curso' };
const MAX_CHAMPIONS = 6;

export default function Administrar() {
  const [lockeTypes, setLockeTypes] = useState([]);
  const [pokemonTypes, setPokemonTypes] = useState([]);
  const [natures, setNatures] = useState([]);
  const [lockes, setLockes] = useState([]);
  const [selected, setSelected] = useState(null); // locke desplegado con sus campeones
  const [lockeModal, setLockeModal] = useState(null);
  const [champModal, setChampModal] = useState(null);
  const [error, setError] = useState('');

  const fail = (e) => setError(e.message);
  const loadLockes = () => api.getLockes().then(setLockes).catch(fail);
  const loadSelected = (id) => api.getLocke(id).then(setSelected).catch(fail);

  useEffect(() => {
    Promise.all([
      api.getLockeTypes(), api.getPokemonTypes(), api.getNatures(), api.getLockes(),
    ])
      .then(([lt, pt, n, l]) => {
        setLockeTypes(lt); setPokemonTypes(pt); setNatures(n); setLockes(l);
      })
      .catch(fail);
  }, []);

  // Desplegar / comprimir un locke
  const toggle = (id) => {
    if (selected?.id === id) setSelected(null);
    else loadSelected(id);
  };

  // ---- Lockes ----
  const saveLocke = async (form) => {
    try {
      if (lockeModal.data) await api.updateLocke(lockeModal.data.id, form);
      else await api.createLocke(form);
      setLockeModal(null);
      await loadLockes();
      if (selected) loadSelected(selected.id);
    } catch (e) { fail(e); }
  };

  const removeLocke = async (l) => {
    if (!window.confirm(`¿Eliminar "${l.name}" y todos sus campeones?`)) return;
    try {
      await api.deleteLocke(l.id);
      if (selected?.id === l.id) setSelected(null);
      loadLockes();
    } catch (e) { fail(e); }
  };

  // ---- Campeones ----
  const saveChampion = async (form) => {
    try {
      if (champModal.data) await api.updateChampion(selected.id, champModal.data.id, form);
      else await api.addChampion(selected.id, form);
      setChampModal(null);
      loadSelected(selected.id);
    } catch (e) { fail(e); }
  };

  const removeChampion = async (c) => {
    if (!window.confirm(`¿Eliminar a ${c.nickname} (${c.species})?`)) return;
    try {
      await api.deleteChampion(selected.id, c.id);
      loadSelected(selected.id);
    } catch (e) { fail(e); }
  };

  return (
    <>
      <Navbar />
      <main className="content">
        <div className="admin-title">
          <h2>Administrar lockes</h2>
          <button className="btn-primary" onClick={() => setLockeModal({ data: null })}>
            + Nuevo locke
          </button>
        </div>
        {error && <p className="error" style={{ padding: 0 }}>⚠ {error}</p>}

        <div className="admin-list">
          {lockes.length === 0 && <p className="muted">Aún no hay lockes. Crea el primero.</p>}

          {lockes.map((l) => {
            const isOpen = selected?.id === l.id;
            return (
              <div key={l.id} className={`admin-block ${isOpen ? 'selected' : ''}`}>
                {/* Fila del locke */}
                <div className="admin-item-row">
                  <div>
                    <strong>{l.name}</strong>
                    <p className="muted">{l.locke_type} · {STATUS_LABEL[l.status]}</p>
                  </div>
                  <div className="admin-actions">
                    <button className="btn-ghost" onClick={() => setLockeModal({ data: l })}>Editar</button>
                    <button className="btn-danger" onClick={() => removeLocke(l)}>Eliminar</button>
                    <button className="toggle-btn" onClick={() => toggle(l.id)}>
                      Campeones {isOpen ? '▲' : '▼'}
                    </button>
                  </div>
                </div>

                {/* Desplegable de campeones */}
                {isOpen && (
                  <div className="admin-panel">
                    <div className="admin-panel-head">
                      <span className="muted">
                        Campeones ({selected.champions.length}/{MAX_CHAMPIONS})
                      </span>
                      <button
                        className="btn-primary"
                        disabled={selected.champions.length >= MAX_CHAMPIONS}
                        onClick={() => setChampModal({ data: null })}
                      >
                        + Añadir campeón
                      </button>
                    </div>

                    {selected.champions.length === 0 && (
                      <p className="muted">Este locke todavía no tiene campeones.</p>
                    )}

                    {selected.champions.map((c) => (
                      <div key={c.id} className="admin-item">
                        <div className="admin-champ">
                          {c.image_url && <img src={c.image_url} alt={c.species} />}
                          <div>
                            <strong>{c.nickname}</strong>
                            <p className="muted">{c.species}</p>
                          </div>
                        </div>
                        <div className="admin-actions">
                          <button className="btn-ghost" onClick={() => setChampModal({ data: c })}>Editar</button>
                          <button className="btn-danger" onClick={() => removeChampion(c)}>Eliminar</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {lockeModal && (
        <Modal
          title={lockeModal.data ? 'Editar locke' : 'Nuevo locke'}
          onClose={() => setLockeModal(null)}
        >
          <LockeForm
            initial={lockeModal.data}
            lockeTypes={lockeTypes}
            onSave={saveLocke}
            onCancel={() => setLockeModal(null)}
          />
        </Modal>
      )}

      {champModal && (
        <Modal
          title={champModal.data ? 'Editar campeón' : 'Añadir campeón'}
          onClose={() => setChampModal(null)}
        >
          <ChampionForm
            initial={champModal.data}
            pokemonTypes={pokemonTypes}
            natures={natures}
            onSave={saveChampion}
            onCancel={() => setChampModal(null)}
          />
        </Modal>
      )}
    </>
  );
}