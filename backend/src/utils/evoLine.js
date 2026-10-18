const cache = new Map();

const norm = (s) =>
  (s || '').trim().toLowerCase().replace(/[.'’:]/g, '').replace(/\s+/g, '-');

async function getJson(url, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url);
      if (r.ok) return await r.json();
      if (r.status === 404) return null; // no existe, no tiene caso reintentar
    } catch { /* reintenta */ }
    await new Promise((ok) => setTimeout(ok, 400 * (i + 1)));
  }
  return null;
}

// Primera etapa de la línea evolutiva (ej: 'bulbasaur'). Devuelve null si no se pudo consultar.
async function evoLine(species) {
  const name = norm(species);
  if (!name) return null;
  if (cache.has(name)) return cache.get(name);

  const sp = await getJson(`https://pokeapi.co/api/v2/pokemon-species/${name}`);
  if (!sp?.evolution_chain?.url) return null;
  const chain = await getJson(sp.evolution_chain.url);
  const line = chain?.chain?.species?.name || null;
  if (line) cache.set(name, line);
  return line;
}

module.exports = { evoLine };