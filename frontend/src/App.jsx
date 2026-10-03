import { Routes, Route } from 'react-router-dom';
import Mostrar from './pages/Mostrar';
import Administrar from './pages/Administrar';
import Bitacoras from './pages/Bitacoras';

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Mostrar />} />
        <Route path="/admin" element={<Administrar />} />
        <Route path="/bitacoras" element={<Bitacoras />} />
      </Routes>
      <footer className="footer">
        © 2026 PokéLocke Tracker — Diseñado para entrenadores de élite.
      </footer>
    </>
  );
}