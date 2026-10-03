import { useState } from 'react';
import { fetchPokemonInfo } from '../pokeapi';

export default function ChampionForm({ initial, pokemonTypes, natures, onSave, onCancel }) {
  const [f, setF] = useState({
    nickname: initial?.nickname || '',
    species: initial?.species || '',
    gender: initial?.gender || 'M',
    image_url: initial?.image_url || '',
    type1_id: initial?.type1_id || '',
    type2_id: initial?.type2_id || '',
    ability: initial?.ability || '',
    ability_description: initial?.ability_description || '',
    nature_id: initial?.nature_id || '',
    summary: initial?.summary || '',
    shiny: initial?.shiny || false,
  });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const typeId = (name) =>
    pokemonTypes.find((t) => t.name.toLowerCase() === name)?.id || '';

  const autofill = async () => {
    if (!f.species.trim()) return setMsg('Escribe primero el nombre del Pokémon.');
    setLoading(true);
    setMsg('');
    try {
      const info = await fetchPokemonInfo(f.species);
      setF((p) => ({
        ...p,
        image_url: (p.shiny ? info.shinyImage : info.image) || p.image_url,
        type1_id: typeId(info.types[0]),
        type2_id: info.types[1] ? typeId(info.types[1]) : '',
        ability: info.ability,
        ability_description: info.description,
      }));
      setMsg('✔ Datos cargados. Revisa y ajusta lo que necesites.');
    } catch (e) {
      setMsg(`⚠ ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleShiny = async (e) => {
    const shiny = e.target.checked;
    setF((p) => ({ ...p, shiny }));
    if (!f.species.trim()) return;
    try {
      const info = await fetchPokemonInfo(f.species);
      setF((p) => ({
        ...p,
        image_url: (shiny ? info.shinyImage : info.image) || p.image_url,
      }));
    } catch {
      /* se queda con la imagen actual */
    }
  };

  const submit = (e) => {
    e.preventDefault();
    onSave({
      ...f,
      type1_id: Number(f.type1_id),
      type2_id: f.type2_id ? Number(f.type2_id) : null,
      nature_id: f.nature_id ? Number(f.nature_id) : null,
    });
  };

  return (
    <form className="form" onSubmit={submit}>
      <div className="form-row">
        <label>Nombre (apodo)
          <input value={f.nickname} onChange={set('nickname')} required placeholder="Fern" />
        </label>
        <label>Pokémon (en inglés)
          <input value={f.species} onChange={set('species')} required placeholder="Venusaur" />
        </label>
      </div>

      <button type="button" className="btn-ghost" onClick={autofill} disabled={loading}>
        {loading ? 'Buscando...' : '✨ Autocompletar imagen, tipos y habilidad'}
      </button>
      {msg && <p className="form-msg">{msg}</p>}

      <div className="form-row">
        <label>Género
          <select value={f.gender} onChange={set('gender')}>
            <option value="M">♂ Macho</option>
            <option value="F">♀ Hembra</option>
            <option value="N">Sin género</option>
          </select>
        </label>
        <label>Naturaleza
          <select value={f.nature_id} onChange={set('nature_id')}>
            <option value="">— Elegir —</option>
            {natures.map((n) => (
              <option key={n.id} value={n.id}>
                {n.name}{n.increased_stat ? ` (▲${n.increased_stat} ▼${n.decreased_stat})` : ' (neutra)'}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="form-row">
        <label>Tipo 1
          <select value={f.type1_id} onChange={set('type1_id')} required>
            <option value="">— Elegir —</option>
            {pokemonTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </label>
        <label>Tipo 2 (opcional)
          <select value={f.type2_id} onChange={set('type2_id')}>
            <option value="">— Ninguno —</option>
            {pokemonTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </label>
      </div>

      <label className="check">
        <input type="checkbox" checked={f.shiny} onChange={toggleShiny} />
        ✨ Es shiny
      </label>

      <label>URL de la imagen
        <input value={f.image_url} onChange={set('image_url')} placeholder="https://..." />
      </label>
      {f.image_url && <img className="form-preview" src={f.image_url} alt="Vista previa" />}

      <label>Habilidad
        <input value={f.ability} onChange={set('ability')} placeholder="Overgrow" />
      </label>
      <label>Descripción de la habilidad
        <textarea rows={2} value={f.ability_description} onChange={set('ability_description')} />
      </label>
      <label>Resumen del campeón
        <textarea rows={3} value={f.summary} onChange={set('summary')}
          placeholder="El pilar del equipo desde el inicio..." />
      </label>

      <div className="form-actions">
        <button type="button" className="btn-ghost" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn-primary">Guardar</button>
      </div>
    </form>
  );
}