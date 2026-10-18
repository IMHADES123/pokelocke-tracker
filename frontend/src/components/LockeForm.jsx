import { useState } from 'react';

export default function LockeForm({ initial, lockeTypes, onSave, onCancel }) {
  const [f, setF] = useState({
    name: initial?.name || '',
    locke_type_id: initial?.locke_type_id || lockeTypes[0]?.id || '',
    trainer: initial?.trainer || 'Hades',
    game: initial?.game || '',
    status: initial?.status || 'en_curso',
    difficulty: initial?.difficulty || 'Estándar',
    rules: initial?.rules || '',
  });
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    onSave({ ...f, locke_type_id: Number(f.locke_type_id) });
  };

  return (
    <form className="form" onSubmit={submit}>
      <label>Nombre del locke
        <input value={f.name} onChange={set('name')} required placeholder="Nuzlocke — Platinum" />
      </label>

      <div className="form-row">
        <label>Tipo de locke
          <select value={f.locke_type_id} onChange={set('locke_type_id')}>
            {lockeTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </label>
        <label>Entrenador
          <input value={f.trainer} onChange={set('trainer')} required placeholder="Tu nombre o el de tu novia" />
        </label>
      </div>

      <div className="form-row">
        <label>Estado
          <select value={f.status} onChange={set('status')}>
            <option value="en_curso">En curso</option>
            <option value="ganado">Ganado</option>
            <option value="perdido">Perdido</option>
          </select>
        </label>
        <label>Juego
          <input value={f.game} onChange={set('game')} placeholder="Platinum" />
        </label>
      </div>

      <div className="form-row">
        <label>Dificultad
          <input value={f.difficulty} onChange={set('difficulty')} />
        </label>
        <label>Reglas activas
          <input value={f.rules} onChange={set('rules')} placeholder="3 Reglas Básicas" />
        </label>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-ghost" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn-primary">Guardar</button>
      </div>
    </form>
  );
}