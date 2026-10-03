import { useState } from 'react';
import { fetchPokemonInfo } from '../pokeapi';

export default function LegendForm({ initial, sources, onSave, onCancel }) {
  const [f, setF] = useState({
    nickname: initial?.nickname || '',
    species: initial?.species || '',
    gender: initial?.gender || 'M',
    image_url: initial?.image_url || '',
    shiny: initial?.shiny || false,
    champion_id: initial?.champion_id || '',
    score_pokemon_id: initial?.score_pokemon_id || '',
    extra_points: initial?.extra_points ?? 0,
    extra_notes: initial?.extra_notes || '',
  });
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  // Al elegir un campeón o un Pokémon de bitácora, copia sus datos
  const pick = (kind) => (e) => {
    const id = e.target.value;
    const list = kind === 'champion_id' ? sources.champions : sources.pokemon;
    const src = list.find((x) => String(x.id) === id);
    setF((p) => ({
      ...p,
      [kind]: id,
      ...(src && {
        nickname: p.nickname || src.nickname,
        species: p.species || src.species,
        gender: src.gender || p.gender,
        image_url: src.image_url || p.image_url,
        shiny: p.shiny || src.shiny,
      }),
    }));
  };

  const toggleShiny = async (e) => {
    const shiny = e.target.checked;
    setF((p) => ({ ...p, shiny }));
    if (!f.species.trim()) return;
    try {
      const info = await fetchPokemonInfo(f.species);
      setF((p) => ({ ...p, image_url: (shiny ? info.shinyImage : info.image) || p.image_url }));
    } catch { /* se queda con la imagen actual */ }
  };

  const submit = (e) => {
    e.preventDefault();
    onSave({
      ...f,
      champion_id: f.champion_id ? Number(f.champion_id) : null,
      score_pokemon_id: f.score_pokemon_id ? Number(f.score_pokemon_id) : null,
      extra_points: Number(f.extra_points) || 0,
    });
  };

  return (
    <form className="form" onSubmit={submit}>
      <label>Campeón vinculado (da puntos por locke ganado)
        <select value={f.champion_id} onChange={pick('champion_id')}>
          <option value="">— Ninguno —</option>
          {sources.champions.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nickname} ({c.species}) · {c.locke_name}
            </option>
          ))}
        </select>
      </label>

      <label>Pokémon de bitácora vinculado (da puntos por score)
        <select value={f.score_pokemon_id} onChange={pick('score_pokemon_id')}>
          <option value="">— Ninguno —</option>
          {sources.pokemon.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nickname} ({p.species}) · {p.log_name}
            </option>
          ))}
        </select>
      </label>

      <div className="form-row">
        <label>Nombre (apodo)
          <input value={f.nickname} onChange={set('nickname')} required />
        </label>
        <label>Pokémon (en inglés)
          <input value={f.species} onChange={set('species')} required />
        </label>
      </div>

      <div className="form-row">
        <label>Género
          <select value={f.gender} onChange={set('gender')}>
            <option value="M">♂ Macho</option>
            <option value="F">♀ Hembra</option>
            <option value="N">Sin género</option>
          </select>
        </label>
        <label className="check">
          <input type="checkbox" checked={f.shiny} onChange={toggleShiny} />
          ✨ Es shiny (+2)
        </label>
      </div>

      <label>URL de la imagen
        <input value={f.image_url} onChange={set('image_url')} placeholder="https://..." />
      </label>
      {f.image_url && <img className="form-preview" src={f.image_url} alt="Vista previa" />}

      <div className="form-row">
        <label>Puntos extra (puede ser negativo)
          <input type="number" step="0.5" value={f.extra_points} onChange={set('extra_points')} />
        </label>
      </div>
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