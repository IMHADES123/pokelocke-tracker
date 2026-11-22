import { useState } from 'react';

export default function LockeForm({ initial, lockeTypes, series = [], onSave, onCancel }) {
  const [f, setF] = useState({
    name: initial?.name || '',
    locke_type_id: initial?.locke_type_id || lockeTypes[0]?.id || '',
    trainer: initial?.trainer || 'Hades',
    game: initial?.game || '',
    status: initial?.status || 'en_curso',
    difficulty: initial?.difficulty || 'Estándar',
    rules: initial?.rules || '',
    series_id: initial?.series_id || '',
  });
  const [ns, setNs] = useState({ name: '', start_lives: 50 });
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  const type = lockeTypes.find((t) => t.id === Number(f.locke_type_id));
  const usesLives = Boolean(type?.uses_lives);
  const options = series.filter(
    (s) =>
      s.locke_type_id === Number(f.locke_type_id) &&
      s.trainer.trim().toLowerCase() === f.trainer.trim().toLowerCase()
  );

  const submit = (e) => {
    e.preventDefault();
    const data = { ...f, locke_type_id: Number(f.locke_type_id), series_id: null };
    if (usesLives && f.series_id === 'new') {
      data.new_series = { name: ns.name.trim(), start_lives: Number(ns.start_lives) || 50 };
    } else if (usesLives && options.some((s) => String(s.id) === String(f.series_id))) {
      data.series_id = Number(f.series_id);
    }
    onSave(data);
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

      {usesLives && (
        <>
          <label>Serie de vidas (los lockes de una misma serie comparten vidas)
            <select value={f.series_id} onChange={set('series_id')}>
              <option value="">— Sin serie —</option>
              {options.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.lives} vidas)</option>
              ))}
              <option value="new">+ Crear serie nueva</option>
            </select>
          </label>
          {f.series_id === 'new' && (
            <div className="form-row">
              <label>Nombre de la serie
                <input value={ns.name} required placeholder="Megalocke 1"
                  onChange={(e) => setNs((p) => ({ ...p, name: e.target.value }))} />
              </label>
              <label>Vidas iniciales
                <input type="number" min="1" value={ns.start_lives}
                  onChange={(e) => setNs((p) => ({ ...p, start_lives: e.target.value }))} />
              </label>
            </div>
          )}
        </>
      )}

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