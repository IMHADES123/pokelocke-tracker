const norm = (s) => s.trim().toLowerCase().replace(/\s+/g, '-');

export async function fetchPokemonInfo(species) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${norm(species)}`);
  if (!res.ok) throw new Error('No encontré ese Pokémon. Escríbelo en inglés (ej: Salamence).');
  const d = await res.json();

  const art = d.sprites.other?.['official-artwork'];
  const image = art?.front_default || d.sprites.front_default;
  const shinyImage = art?.front_shiny || d.sprites.front_shiny || image;
  const types = d.types.map((t) => t.type.name);

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
    /* si falla, se escribe a mano */
  }
  return { image, shinyImage, types, ability, description };
}
// Evoluciones directas de una especie (sin megas ni formas alternas)
export async function fetchEvolutions(species) {
  const sp = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${norm(species)}`);
  if (!sp.ok) throw new Error('No encontré esa especie en PokéAPI.');
  const spData = await sp.json();

  const chain = await (await fetch(spData.evolution_chain.url)).json();

  // Buscar el nodo de la especie actual dentro de la cadena
  const find = (node) => {
    if (node.species.name === spData.name) return node;
    for (const next of node.evolves_to) {
      const found = find(next);
      if (found) return found;
    }
    return null;
  };
  const node = find(chain.chain);
  if (!node) return [];

  return node.evolves_to.map((n) => n.species.name); // ['ivysaur']
}

export const prettyName = (s) =>
  s.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('-');