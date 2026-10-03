const norm = (s) => s.trim().toLowerCase().replace(/\s+/g, '-');

export async function fetchPokemonInfo(species) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${norm(species)}`);
  if (!res.ok) throw new Error('No encontré ese Pokémon. Escríbelo en inglés (ej: Salamence).');
  const d = await res.json();

  const image =
    d.sprites.other?.['official-artwork']?.front_default || d.sprites.front_default;
  const types = d.types.map((t) => t.type.name); // ['grass', 'poison']

  const entry = d.abilities.find((a) => !a.is_hidden) || d.abilities[0];
  let ability = entry.ability.name;
  let description = '';
  try {
    const ar = await (await fetch(entry.ability.url)).json();
    const nameEn = ar.names.find((n) => n.language.name === 'en');
    const es = ar.flavor_text_entries.find((f) => f.language.name === 'es');
    const en = ar.effect_entries.find((e) => e.language.name === 'en');
    ability = nameEn?.name || ability;
    description = (es?.flavor_text || en?.short_effect || '').replace(/\s+/g, ' ');
  } catch {
    /* si falla, el usuario lo escribe a mano */
  }
  return { image, types, ability, description };
}