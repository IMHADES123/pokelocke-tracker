const pool = require('../config/db');

// Series con sus lockes, muertes, bonus y vidas actuales
async function computeSeries() {
  const [se, lk, de] = await Promise.all([
    pool.query(`
      SELECT s.*, lt.name AS locke_type
      FROM locke_series s LEFT JOIN locke_types lt ON lt.id = s.locke_type_id
      ORDER BY s.created_at DESC`),
    pool.query(`
      SELECT id, name, game, status, series_id FROM lockes
      WHERE series_id IS NOT NULL ORDER BY created_at, id`),
    pool.query(`
      SELECT sl.locke_id, COUNT(*)::int AS deaths
      FROM score_pokemon p JOIN score_logs sl ON sl.id = p.log_id
      WHERE p.is_dead GROUP BY sl.locke_id`),
  ]);
  const deaths = new Map(de.rows.map((r) => [r.locke_id, r.deaths]));

  return se.rows.map((s) => {
    const lockes = lk.rows
      .filter((l) => l.series_id === s.id)
      .map((l) => {
        const d = deaths.get(l.id) || 0;
        const bonus = l.status === 'ganado' && d < s.bonus_if_deaths_under ? s.bonus_lives : 0;
        return { ...l, deaths: d, bonus };
      });
    const total_deaths = lockes.reduce((a, l) => a + l.deaths, 0);
    const total_bonus = lockes.reduce((a, l) => a + l.bonus, 0);
    return { ...s, lockes, total_deaths, total_bonus, lives: s.start_lives - total_deaths + total_bonus };
  });
}

// Agrega un resumen de la serie (sin la lista de lockes) a cada fila que tenga series_id
async function withSeries(rows) {
  if (!rows.some((r) => r.series_id)) return rows;
  const map = new Map((await computeSeries()).map((s) => [s.id, s]));
  return rows.map((r) => {
    const s = map.get(r.series_id);
    if (!s) return r;
    const { lockes, ...brief } = s;
    return { ...r, series: brief };
  });
}

module.exports = { computeSeries, withSeries };