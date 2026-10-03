const pool = require('../config/db');

const BASE = `
  SELECT g.*, sp.score, ch.pos, ch.locke_name, ch.locke_status
  FROM legends g
  LEFT JOIN (
    SELECT id, (kills + assists * 0.5 + mvps * 3)::float AS score FROM score_pokemon
  ) sp ON sp.id = g.score_pokemon_id
  LEFT JOIN (
    SELECT c.id, l.name AS locke_name, l.status AS locke_status,
           ROW_NUMBER() OVER (PARTITION BY c.locke_id ORDER BY c.id)::int AS pos
    FROM champions c JOIN lockes l ON l.id = c.locke_id
  ) ch ON ch.id = g.champion_id`;

function withPoints(r) {
  const score_points = r.score ? Math.floor(r.score / 100) : 0;
  const shiny_points = r.shiny ? 2 : 0;
  const win_points = r.locke_status === 'ganado' && r.pos <= 6 ? 7 - r.pos : 0;
  const extra = Number(r.extra_points) || 0;
  return {
    ...r,
    extra_points: extra,
    score_points, shiny_points, win_points,
    total: score_points + shiny_points + win_points + extra,
  };
}

exports.getLegends = async (req, res) => {
  const { rows } = await pool.query(BASE);
  res.json(rows.map(withPoints).sort((a, b) => b.total - a.total));
};

// Campeones y Pokémon de bitácora que se pueden vincular
exports.getSources = async (req, res) => {
  const champions = await pool.query(`
    SELECT c.id, c.nickname, c.species, c.gender, c.image_url, c.shiny,
           l.name AS locke_name, l.status AS locke_status
    FROM champions c JOIN lockes l ON l.id = c.locke_id
    ORDER BY l.id, c.id`);
  const pokemon = await pool.query(`
    SELECT p.id, p.nickname, p.species, p.gender, p.image_url, p.shiny, s.name AS log_name
    FROM score_pokemon p JOIN score_logs s ON s.id = p.log_id
    ORDER BY s.id, p.id`);
  res.json({ champions: champions.rows, pokemon: pokemon.rows });
};

const values = (b) => [
  b.nickname, b.species, b.gender || null, b.image_url || null, !!b.shiny,
  b.champion_id || null, b.score_pokemon_id || null,
  Number(b.extra_points) || 0, b.extra_notes || null,
];

exports.createLegend = async (req, res) => {
  if (!req.body.nickname || !req.body.species)
    return res.status(400).json({ error: 'nickname y species son requeridos' });
  const { rows } = await pool.query(
    `INSERT INTO legends (nickname, species, gender, image_url, shiny,
       champion_id, score_pokemon_id, extra_points, extra_notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    values(req.body)
  );
  res.status(201).json(rows[0]);
};

exports.updateLegend = async (req, res) => {
  if (!req.body.nickname || !req.body.species)
    return res.status(400).json({ error: 'nickname y species son requeridos' });
  const { rows } = await pool.query(
    `UPDATE legends SET nickname=$1, species=$2, gender=$3, image_url=$4, shiny=$5,
       champion_id=$6, score_pokemon_id=$7, extra_points=$8, extra_notes=$9
     WHERE id=$10 RETURNING *`,
    [...values(req.body), req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'No encontrada' });
  res.json(rows[0]);
};

exports.deleteLegend = async (req, res) => {
  await pool.query('DELETE FROM legends WHERE id = $1', [req.params.id]);
  res.status(204).end();
};