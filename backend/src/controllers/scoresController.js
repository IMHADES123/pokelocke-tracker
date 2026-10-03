const pool = require('../config/db');

const MAX_ACTIVE_LOGS = 5;
const STAT_FIELDS = ['kills', 'assists', 'mvps'];
const SCORE_SQL = '(kills + assists * 0.5 + mvps * 3)::float AS score';

// ---------- Bitácoras ----------
exports.getLogs = async (req, res) => {
  const { rows } = await pool.query(`
    SELECT s.*, l.name AS locke_name, l.status AS locke_status,
      (SELECT COUNT(*) FROM score_pokemon p WHERE p.log_id = s.id)::int AS total,
      (SELECT COUNT(*) FROM score_pokemon p WHERE p.log_id = s.id AND p.is_dead)::int AS dead
    FROM score_logs s
    JOIN lockes l ON l.id = s.locke_id
    ORDER BY s.created_at DESC`);
  res.json(rows);
};

exports.getLog = async (req, res) => {
  const log = await pool.query(`
    SELECT s.*, l.name AS locke_name, l.status AS locke_status
    FROM score_logs s JOIN lockes l ON l.id = s.locke_id
    WHERE s.id = $1`, [req.params.id]);
  if (!log.rows.length) return res.status(404).json({ error: 'No encontrada' });

  const pokemon = await pool.query(`
    SELECT p.*, (p.kills + p.assists * 0.5 + p.mvps * 3)::float AS score,
           t1.name AS type1, t1.color AS type1_color,
           t2.name AS type2, t2.color AS type2_color
    FROM score_pokemon p
    LEFT JOIN pokemon_types t1 ON t1.id = p.type1_id
    LEFT JOIN pokemon_types t2 ON t2.id = p.type2_id
    WHERE p.log_id = $1
    ORDER BY p.id`, [req.params.id]);

  res.json({ ...log.rows[0], pokemon: pokemon.rows });
};

exports.createLog = async (req, res) => {
  const { locke_id, name } = req.body;
  const locke = await pool.query('SELECT name, status FROM lockes WHERE id = $1', [locke_id]);
  if (!locke.rows.length) return res.status(400).json({ error: 'Locke no válido' });
  if (locke.rows[0].status !== 'en_curso')
    return res.status(400).json({ error: 'Solo puedes crear bitácoras de lockes en curso' });

  const count = await pool.query(`
    SELECT COUNT(*)::int AS n FROM score_logs s
    JOIN lockes l ON l.id = s.locke_id WHERE l.status = 'en_curso'`);
  if (count.rows[0].n >= MAX_ACTIVE_LOGS)
    return res.status(409).json({ error: `Máximo ${MAX_ACTIVE_LOGS} bitácoras de lockes en curso` });

  const { rows } = await pool.query(
    'INSERT INTO score_logs (locke_id, name) VALUES ($1, $2) RETURNING *',
    [locke_id, (name && name.trim()) || locke.rows[0].name]
  );
  res.status(201).json(rows[0]);
};

exports.deleteLog = async (req, res) => {
  await pool.query('DELETE FROM score_logs WHERE id = $1', [req.params.id]);
  res.status(204).end();
};

// ---------- Pokémon de la bitácora ----------
exports.addPokemon = async (req, res) => {
  const { nickname, species, gender, image_url, type1_id, type2_id, shiny } = req.body;
  if (!nickname || !species)
    return res.status(400).json({ error: 'nickname y species son requeridos' });
  const { rows } = await pool.query(
    `INSERT INTO score_pokemon (log_id, nickname, species, gender, image_url, type1_id, type2_id, shiny)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [req.params.id, nickname, species, gender, image_url, type1_id || null, type2_id || null, !!shiny]
  );
  res.status(201).json(rows[0]);
};

exports.updatePokemon = async (req, res) => {
  const { nickname, species, gender, image_url, type1_id, type2_id, kills, assists, mvps, shiny } = req.body;
  if (!nickname || !species)
    return res.status(400).json({ error: 'nickname y species son requeridos' });
  const { rows } = await pool.query(
    `UPDATE score_pokemon
     SET nickname=$1, species=$2, gender=$3, image_url=$4, type1_id=$5, type2_id=$6,
         kills=GREATEST(0,$7), assists=GREATEST(0,$8), mvps=GREATEST(0,$9), shiny=$10
     WHERE id=$11 RETURNING *, ${SCORE_SQL}`,
    [nickname, species, gender, image_url, type1_id || null, type2_id || null,
     kills || 0, assists || 0, mvps || 0, !!shiny, req.params.pid]
  );
  if (!rows.length) return res.status(404).json({ error: 'No encontrado' });
  res.json(rows[0]);
};
// Sumar o restar 1 a kills / assists / mvps
exports.changeStat = async (req, res) => {
  const { field } = req.body;
  const delta = Number(req.body.delta);
  if (!STAT_FIELDS.includes(field) || !Number.isInteger(delta) || delta === 0 || Math.abs(delta) > 1000)
    return res.status(400).json({ error: 'Datos inválidos' });
  const { rows } = await pool.query(
    `UPDATE score_pokemon SET ${field} = GREATEST(0, ${field} + $1)
     WHERE id = $2 RETURNING *, ${SCORE_SQL}`,
    [delta, req.params.pid]
  );
  if (!rows.length) return res.status(404).json({ error: 'No encontrado' });
  res.json(rows[0]);
};

// Marcar muerto / revivir
exports.setDead = async (req, res) => {
  const dead = !!req.body.is_dead;
  const { rows } = await pool.query(
    `UPDATE score_pokemon
     SET is_dead = $1::boolean, died_at = CASE WHEN $1::boolean THEN NOW() ELSE NULL END
     WHERE id = $2 RETURNING *, ${SCORE_SQL}`,
    [dead, req.params.pid]
  );
  if (!rows.length) return res.status(404).json({ error: 'No encontrado' });
  res.json(rows[0]);
};

exports.deletePokemon = async (req, res) => {
  await pool.query('DELETE FROM score_pokemon WHERE id = $1', [req.params.pid]);
  res.status(204).end();
};
exports.evolvePokemon = async (req, res) => {
  const { species, image_url, type1_id, type2_id } = req.body;
  if (!species) return res.status(400).json({ error: 'species requerida' });
  const { rows } = await pool.query(
    `UPDATE score_pokemon
     SET species=$1, image_url=$2, type1_id=$3, type2_id=$4
     WHERE id=$5 RETURNING *, ${SCORE_SQL}`,
    [species, image_url || null, type1_id || null, type2_id || null, req.params.pid]
  );
  if (!rows.length) return res.status(404).json({ error: 'No encontrado' });
  res.json(rows[0]);
};