const pool = require('../config/db');

// Muertes por locke (todas sus bitácoras)
async function deathsByLocke() {
  const { rows } = await pool.query(`
    SELECT sl.locke_id, COUNT(*)::int AS deaths
    FROM score_pokemon p JOIN score_logs sl ON sl.id = p.log_id
    WHERE p.is_dead GROUP BY sl.locke_id`);
  return new Map(rows.map((r) => [r.locke_id, r.deaths]));
}

// Series (Megalocke) con sus lockes, muertes, bonus y vidas actuales
async function computeSeries() {
  const [se, lk, deaths] = await Promise.all([
    pool.query(`
      SELECT s.*, lt.name AS locke_type
      FROM locke_series s LEFT JOIN locke_types lt ON lt.id = s.locke_type_id
      ORDER BY s.created_at DESC`),
    pool.query(`
      SELECT id, name, game, status, series_id FROM lockes
      WHERE series_id IS NOT NULL ORDER BY created_at, id`),
    deathsByLocke(),
  ]);

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
    return {
      ...s, lockes, total_deaths, total_bonus,
      lives: s.start_lives - total_deaths + total_bonus,
    };
  });
}

// Agrega a cada fila (que traiga id de locke como locke_id o id) el resumen de vidas:
// - con series_id: vidas compartidas de la serie
// - sin serie pero con start_lives: vidas propias del locke
async function withSeries(rows) {
  const needs = rows.some((r) => r.series_id || r.start_lives);
  if (!needs) return rows;

  const [series, deaths] = await Promise.all([computeSeries(), deathsByLocke()]);
  const map = new Map(series.map((s) => [s.id, s]));

  return rows.map((r) => {
    if (r.series_id) {
      const s = map.get(r.series_id);
      if (!s) return r;
      const { lockes, ...brief } = s;
      return { ...r, series: brief };
    }
    if (r.start_lives) {
      const lockeId = r.locke_id ?? r.id;
      const d = deaths.get(lockeId) || 0;
      return {
        ...r,
        series: {
          name: 'Vidas propias',
          start_lives: r.start_lives,
          total_deaths: d,
          total_bonus: 0,
          lives: r.start_lives - d,
        },
      };
    }
    return r;
  });
}

module.exports = { computeSeries, withSeries };