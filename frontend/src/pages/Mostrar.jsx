import { useEffect, useState } from 'react';
import { getLockeTypes, getLockes, getLocke, createLockeType } from '../api';
import Navbar from '../components/Navbar';
import LockeHeader from '../components/LockeHeader';
import ChampionCard from '../components/ChampionCard';

function LockeSection({ locke }) {
  const [open, setOpen] = useState(false);

  return (
    <section>
      <LockeHeader locke={locke} open={open} onToggle={() => setOpen(!open)} />
      {open && (
        <main className="content">
          <h2>Hall de la Fama</h2>
          <div className="grid">
            {locke.champions.map((c) => <ChampionCard key={c.id} champion={c} />)}
          </div>
          {locke.champions.length === 0 && (
            <p className="muted">Este locke aún no tiene campeones.</p>
          )}
        </main>
      )}
    </section>
  );
}

export default function Mostrar() {
  const [lockeTypes, setLockeTypes] = useState([]);
  const [activeTypeId, setActiveTypeId] = useState(null);
  const [lockes, setLockes] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    getLockeTypes()
      .then((t) => {
        setLockeTypes(t);
        if (t.length) setActiveTypeId(t[0].id);
      })
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!activeTypeId) return;
    let cancelled = false;
    getLockes()
      .then((list) =>
        Promise.all(
          list.filter((l) => l.locke_type_id === activeTypeId).map((l) => getLocke(l.id))
        )
      )
      .then((full) => { if (!cancelled) setLockes(full); })
      .catch((e) => setError(e.message));
    return () => { cancelled = true; };
  }, [activeTypeId]);

  const addType = async () => {
    const name = window.prompt('Nombre del nuevo tipo de locke:');
    if (!name) return;
    try {
      const t = await createLockeType(name);
      setLockeTypes((prev) => [...prev, t]);
      setActiveTypeId(t.id);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <>
      <Navbar
        lockeTypes={lockeTypes}
        activeTypeId={activeTypeId}
        onSelect={setActiveTypeId}
        onAddType={addType}
      />
      {error && <p className="error">⚠ {error}</p>}

      {lockes.length === 0 && !error && (
        <p className="empty">No hay lockes de este tipo todavía. Créalos en “Administrar”.</p>
      )}

      {lockes.map((locke) => (
        <LockeSection key={locke.id} locke={locke} />
      ))}
    </>
  );
}