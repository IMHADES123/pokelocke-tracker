import { useState } from 'react';

const norm = (s) => (s || '').trim().toLowerCase();

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
    start_lives: initial?.start_lives || '',
  });
  const [ns, setNs] = useState({ name: '', start_lives: 50 });
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  const typeName = norm(lockeTypes.find((t) => t.id === Number(f.locke_type_id))?.name);
  const isMega = typeName === 'megalocke';
  const isHard = typeName === 'hardlocke';
  const isRandom = typeName === 'randomlocke';
  const presets = isHard ? [10, 15, 20] : [10, 15, 20, 25];

  const options = series.filter(
    (s) =>
      s.locke_type_id === Number(f.locke_type_id) &&
      norm(s.trainer) === norm(f.trainer)
  );

  const submit = (e) => {
    e.preventDefault();
    const data = {
      ...f,
      locke_type_id: Number(f.locke_type_id),
      series_id: null,
      start_lives: null,
    };
    if (isMega) {
      if (f.series_id === 'new') {
        data.new_series = { name: ns.name.trim(), start_lives: Number(ns.start_lives) || 50 };
      } else if (options.some((s) => String(s.id) === String(f.series_id))) {
        data.series_id = Number(f.series_id);
      }
    } else if (isHard || isRandom) {
      const n = Number(f.start_lives);
      if (n > 0) data.start_lives = n;
      else if (isHard) data.start_lives = presets[0]; // Hardlocke siempre lleva vidas
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

      {isMega && (
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

      {(isHard || isRandom) && (
        <label>
          Vidas {isRandom ? '(opcional, solo de este locke)' : '(solo de este locke)'}
          <div className="chips">
            {isRandom && (
              <button type="button"
                className={`chip ${!f.start_lives ? 'on' : ''}`}
                onClick={() => setF((p) => ({ ...p, start_lives: '' }))}>
                Sin vidas
              </button>
            )}
            {presets.map((n) => (
              <button key={n} type="button"
                className={`chip ${Number(f.start_lives) === n ? 'on' : ''}`}
                onClick={() => setF((p) => ({ ...p, start_lives: n }))}>
                {n}
              </button>
            ))}
          </div>
          <input type="number" min="1" value={f.start_lives}
            onChange={set('start_lives')}
            placeholder={isRandom ? 'Otro número (vacío = sin vidas)' : 'Otro número'} />
        </label>
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