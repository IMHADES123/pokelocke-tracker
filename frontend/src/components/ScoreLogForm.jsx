import { useState } from 'react';

export default function ScoreLogForm({ lockes, onSave, onCancel }) {
  const [lockeId, setLockeId] = useState(lockes[0]?.id || '');
  const [name, setName] = useState('');

  if (lockes.length === 0) {
    return (
      <div className="form">
        <p className="muted">
          No tienes lockes en curso. Primero crea uno en la sección Administrar
          con estado “En curso”.
        </p>
        <div className="form-actions">
          <button className="btn-ghost" onClick={onCancel}>Cerrar</button>
        </div>
      </div>
    );
  }

  const submit = (e) => {
    e.preventDefault();
    onSave({ locke_id: Number(lockeId), name });
  };

  return (
    <form className="form" onSubmit={submit}>
      <label>Locke que estás jugando
        <select value={lockeId} onChange={(e) => setLockeId(e.target.value)}>
          {lockes.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
      </label>
      <label>Nombre de la bitácora (opcional)
        <input value={name} onChange={(e) => setName(e.target.value)}
          placeholder="Si lo dejas vacío usa el nombre del locke" />
      </label>
      <div className="form-actions">
        <button type="button" className="btn-ghost" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn-primary">Crear</button>
      </div>
    </form>
  );
}