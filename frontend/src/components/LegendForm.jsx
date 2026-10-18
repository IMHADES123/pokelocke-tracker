import { useState } from 'react';

export default function LegendForm({ initial, sources, onSave, onCancel }) {
  const locked = Boolean(initial); // la clave no se edita en una leyenda existente
  const [f, setF] = useState({
    nickname: initial?.nickname || '',
    trainer: initial?.trainer || sources.trainers[0] || 'Yo',
    species: Array.isArray(initial?.species) ? initial.species[0] || '' : initial?.species || '',
    evo_line: initial?.evo_line || '',
    gender: initial?.gender || '',
    image_url: initial?.image_url || '',
    extra_points: initial?.extra_points ?? 0,
    extra_notes: initial?.extra_notes || '',
  });
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  // Elegir un registro existente rellena nombre, entrenador y especie
  const pick = (e) => {
    const entry = sources.entries[Number(e.target.value)];
    if (!entry) return;
    setF((p) => ({
      ...p,
      nickname: entry.nickname,
      trainer: entry.trainer,
      species: entry.species,
      evo_line: entry.evo_line,
    }));
  };

  const submit = (e) => {
    e.preventDefault();
    onSave({ ...f, extra_points: Number(f.extra_points) || 0 });
  };

  return (
    <form className="form" onSubmit={submit}>
      {!locked && (
        <label>Elegir un Pokémon ya registrado
          <select defaultValue="" onChange={pick}>
            <option value="">— Escribirlo a mano —</option>
            {sources.entries.map((s, i) => (
              <option key={i} value={i}>
                {s.nickname} ({s.species}) · {s.trainer}
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="form-row">
        <label>Nombre
          <input value={f.nickname} onChange={set('nickname')} required disabled={locked} />
        </label>
        <label>Entrenador
          <input list="trainer-names" value={f.trainer} onChange={set('trainer')}
            required disabled={locked} />
          <datalist id="trainer-names">
            {sources.trainers.map((t) => <option key={t} value={t} />)}
          </datalist>
        </label>
      </div>

      <label>Pokémon (en inglés; basta cualquier etapa de la línea)
        <input value={f.species} onChange={set('species')} required disabled={locked}
          placeholder="Venusaur" />
      </label>
      <p className="form-msg">
        La leyenda es única por entrenador, línea evolutiva y nombre. Solo cuentan los
        Pokémon que coincidan en los tres.
      </p>

      <div className="form-row">
        <label>Género
          <select value={f.gender} onChange={set('gender')}>
            <option value="">Automático</option>
            <option value="M">♂ Macho</option>
            <option value="F">♀ Hembra</option>
            <option value="N">Sin género</option>
          </select>
        </label>
        <label>Puntos extra (puede ser negativo)
          <input type="number" step="0.5" value={f.extra_points} onChange={set('extra_points')} />
        </label>
      </div>

      <label>Imagen (opcional, si la dejas vacía usa la del último registro)
        <input value={f.image_url} onChange={set('image_url')} placeholder="https://..." />
      </label>
      {f.image_url && <img className="form-preview" src={f.image_url} alt="Vista previa" />}

      <label>Motivo de los puntos extra
        <textarea rows={2} value={f.extra_notes} onChange={set('extra_notes')} />
      </label>

      <div className="form-actions">
        <button type="button" className="btn-ghost" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn-primary">Guardar</button>
      </div>
    </form>
  );
}