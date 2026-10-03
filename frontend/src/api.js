const API = import.meta.env.VITE_API_URL;

async function request(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Error ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

const json = (method, body) => ({ method, body: JSON.stringify(body) });

// Catálogos
export const getLockeTypes = () => request('/catalogs/locke-types');
export const getPokemonTypes = () => request('/catalogs/pokemon-types');
export const getNatures = () => request('/catalogs/natures');
export const createLockeType = (name) =>
  request('/catalogs/locke-types', json('POST', { name }));

// Lockes
export const getLockes = () => request('/lockes');
export const getLocke = (id) => request(`/lockes/${id}`);
export const createLocke = (data) => request('/lockes', json('POST', data));
export const updateLocke = (id, data) => request(`/lockes/${id}`, json('PUT', data));
export const deleteLocke = (id) => request(`/lockes/${id}`, { method: 'DELETE' });

// Campeones
export const addChampion = (lockeId, data) =>
  request(`/lockes/${lockeId}/champions`, json('POST', data));
export const updateChampion = (lockeId, id, data) =>
  request(`/lockes/${lockeId}/champions/${id}`, json('PUT', data));
export const deleteChampion = (lockeId, id) =>
  request(`/lockes/${lockeId}/champions/${id}`, { method: 'DELETE' });
// Bitácoras de puntuación
export const getScoreLogs = () => request('/scores/logs');
export const getScoreLog = (id) => request(`/scores/logs/${id}`);
export const createScoreLog = (data) => request('/scores/logs', json('POST', data));
export const deleteScoreLog = (id) => request(`/scores/logs/${id}`, { method: 'DELETE' });
export const addScorePokemon = (logId, data) =>
  request(`/scores/logs/${logId}/pokemon`, json('POST', data));
export const updateScorePokemon = (id, data) =>
  request(`/scores/pokemon/${id}`, json('PUT', data));
export const changeScoreStat = (id, field, delta) =>
  request(`/scores/pokemon/${id}/stat`, json('PATCH', { field, delta }));
export const setScoreDead = (id, is_dead) =>
  request(`/scores/pokemon/${id}/dead`, json('PATCH', { is_dead }));
export const deleteScorePokemon = (id) =>
  request(`/scores/pokemon/${id}`, { method: 'DELETE' });