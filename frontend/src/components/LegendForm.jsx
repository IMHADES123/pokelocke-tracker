import { useState } from 'react';

export default function LegendForm({ initial, names, onSave, onCancel }) {
  const [f, setF] = useState({
    nickname: initial?.nickname || '',
    gender: initial?.gender || '',
    image_url: initial?.image_url || '',
    extra_points: initial?.extra_points ?? 0,
    extra_notes: initial?.extra_notes || '',
  });
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    onSave({ ...f, extra_points: Number(f.extra_points) || 0 });
  };

  return (
    <form className="form" onSubmit={submit}>
      <label>Nombre de la leyenda (único)
        <input list="legend-names" value={f.nickname} onChange={set('nickname')}
          required placeholder="Fern" />
        <datalist id="legend-names">
          {names.map((n) => <option key={n} value={n} />)}
        </datalist>
      </label>
      <p className="form-msg">
        Todos los Pokémon de bitácoras y halls con este nombre cuentan para esta leyenda.
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