const cache = new Map();
const norm = (s) => s.trim().toLowerCase().replace(/\s+/g, '-');

// Devuelve el nombre de la primera etapa de la línea evolutiva (ej: 'bulbasaur')
async function evoLine(species) {
  const name = norm(species || '');
  if (!name) return null;
  if (cache.has(name)) return cache.get(name);

  try {
    const sp = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${name}`);
    if (sp.ok) {
      const data = await sp.json();
      const chain = await fetch(data.evolution_chain.url);
      if (chain.ok) {
        const line = (await chain.json()).chain.species.name;
        cache.set(name, line);
        return line;
      }
    }
  } catch { /* sin conexión: se usa el nombre tal cual */ }
  return name; // respaldo (no se guarda en caché)
}

module.exports = { evoLine };