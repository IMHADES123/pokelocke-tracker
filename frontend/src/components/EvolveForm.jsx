import { useEffect, useState } from 'react';
import { fetchEvolutions, fetchPokemonInfo, prettyName } from '../pokeapi';

export default function EvolveForm({ pokemon, pokemonTypes, onSave, onCancel }) {
  const [options, setOptions] = useState(null); // null = cargando
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchEvolutions(pokemon.species)
      .then(setOptions)
      .catch((e) => { setError(e.message); setOptions([]); });
  }, [pokemon.species]);

  const typeId = (name) =>
    pokemonTypes.find((t) => t.name.toLowerCase() === name)?.id || null;

  const evolve = async (name) => {
    setSaving(true);
    setError('');
    try {
      const info = await fetchPokemonInfo(name);
      await onSave({
        species: prettyName(name),
        image_url: (pokemon.shiny ? info.shinyImage : info.image) || pokemon.image_url,
        type1_id: typeId(info.types[0]),
        type2_id: info.types[1] ? typeId(info.types[1]) : null,
      });
    } catch (e) {
      setError(e.message);
      setSaving(false);
    }
  };

  return (
    <div className="form">
      <p>
        <strong>{pokemon.nickname}</strong> ({pokemon.species}) puede evolucionar a:
      </p>

      {options === null && <p className="muted">Buscando evoluciones...</p>}
      {options?.length === 0 && !error && (
        <p className="muted">{pokemon.species} no tiene más evoluciones.</p>
      )}
      {error && <p className="error" style={{ padding: 0 }}>⚠ {error}</p>}

      {options?.map((name) => (
        <button key={name} className="btn-primary" disabled={saving} onClick={() => evolve(name)}>
          {saving ? 'Evolucionando...' : `Evolucionar a ${prettyName(name)}`}
        </button>
      ))}

      <div className="form-actions">
        <button className="btn-ghost" onClick={onCancel}>Cancelar</button>
      </div>
    </div>
  );
}