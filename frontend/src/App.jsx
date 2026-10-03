import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Mostrar from './pages/Mostrar';
import Administrar from './pages/Administrar';
import Bitacoras from './pages/Bitacoras';
import Historial from './pages/Historial';
import Leyendas from './pages/Leyendas';
import { getKey, setKey } from './api';

function Gate({ onOk }) {
  const [value, setValue] = useState('');
  const submit = (e) => {
    e.preventDefault();
    setKey(value.trim());
    onOk();
  };
  return (
    <div className="modal-backdrop" style={{ alignItems: 'center' }}>
      <form className="modal form" onSubmit={submit}>
        <h3>PokéLocke Tracker</h3>
        <label>Clave de acceso
          <input type="password" value={value} onChange={(e) => setValue(e.target.value)} autoFocus />
        </label>
        <button className="btn-primary" type="submit">Entrar</button>
      </form>
    </div>
  );
}

export default function App() {
  const [ready, setReady] = useState(Boolean(getKey()) || !import.meta.env.PROD);

  if (!ready) return <Gate onOk={() => setReady(true)} />;

  return (
    <>
      <Routes>
        <Route path="/" element={<Mostrar />} />
        <Route path="/admin" element={<Administrar />} />
        <Route path="/bitacoras" element={<Bitacoras />} />
        <Route path="/historial" element={<Historial />} />
        <Route path="/leyendas" element={<Leyendas />} />
      </Routes>
      <footer className="footer">
        © 2026 PokéLocke Tracker — Diseñado para entrenadores de élite.
      </footer>
    </>
  );
}