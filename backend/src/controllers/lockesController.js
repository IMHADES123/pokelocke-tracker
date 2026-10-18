const pool = require('../config/db');
const { evoLine } = require('../utils/evoLine');

// Lista de lockes
exports.getLockes = async (req, res) => {
  const { rows } = await pool.query(`
    SELECT l.*, lt.name AS locke_type
    FROM lockes l
    LEFT JOIN locke_types lt ON lt.id = l.locke_type_id
    ORDER BY l.created_at DESC
  `);
  res.json(rows);
};

// Un locke con sus campeones
exports.getLockeById = async (req, res) => {
  const { id } = req.params;
  const locke = await pool.query(`
    SELECT l.*, lt.name AS locke_type
    FROM lockes l
    LEFT JOIN locke_types lt ON lt.id = l.locke_type_id
    WHERE l.id = $1`, [id]);
  if (!locke.rows.length) return res.status(404).json({ error: 'No encontrado' });

  const champions = await pool.query(`
    SELECT c.*,
           t1.name AS type1, t1.color AS type1_color,
           t2.name AS type2, t2.color AS type2_color,
           n.name AS nature, n.increased_stat, n.decreased_stat
    FROM champions c
    JOIN pokemon_types t1 ON t1.id = c.type1_id
    LEFT JOIN pokemon_types t2 ON t2.id = c.type2_id
    LEFT JOIN natures n ON n.id = c.nature_id
    WHERE c.locke_id = $1
    ORDER BY c.id`, [id]);

  res.json({ ...locke.rows[0], champions: champions.rows });
};

// Todos los lockes (opcionalmente de un tipo) con sus campeones, en 2 consultas
exports.getLockesFull = async (req, res) => {
  const typeId = req.query.type_id ? Number(req.query.type_id) : null;

  const lockes = await pool.query(`
    SELECT l.*, lt.name AS locke_type
    FROM lockes l
    LEFT JOIN locke_types lt ON lt.id = l.locke_type_id
    WHERE ($1::int IS NULL OR l.locke_type_id = $1)
    ORDER BY l.created_at DESC`, [typeId]);

  const ids = lockes.rows.map((l) => l.id);
  if (!ids.length) return res.json([]);

  const champs = await pool.query(`
    SELECT c.*,
           t1.name AS type1, t1.color AS type1_color,
           t2.name AS type2, t2.color AS type2_color,
           n.name AS nature, n.increased_stat, n.decreased_stat
    FROM champions c
    JOIN pokemon_types t1 ON t1.id = c.type1_id
    LEFT JOIN pokemon_types t2 ON t2.id = c.type2_id
    LEFT JOIN natures n ON n.id = c.nature_id
    WHERE c.locke_id = ANY($1::int[])
    ORDER BY c.id`, [ids]);

  res.json(lockes.rows.map((l) => ({
    ...l,
    champions: champs.rows.filter((c) => c.locke_id === l.id),
  })));
};

exports.createLocke = async (req, res) => {
  const { name, locke_type_id, game, status, difficulty, rules, trainer } = req.body;
  if (!name) return res.status(400).json({ error: 'Nombre requerido' });
  const { rows } = await pool.query(
    `INSERT INTO lockes (name, locke_type_id, game, status, difficulty, rules, trainer)
     VALUES ($1,$2,$3,COALESCE($4,'en_curso'),COALESCE($5,'Estándar'),$6,$7) RETURNING *`,
    [name, locke_type_id, game, status, difficulty, rules, (trainer || '').trim() || 'Hades']
  );
  res.status(201).json(rows[0]);
};

exports.updateLocke = async (req, res) => {
  const { name, locke_type_id, game, status, difficulty, rules, trainer } = req.body;
  if (!name) return res.status(400).json({ error: 'Nombre requerido' });
  const { rows } = await pool.query(
    `UPDATE lockes
     SET name=$1, locke_type_id=$2, game=$3, status=$4, difficulty=$5, rules=$6, trainer=$7
     WHERE id=$8 RETURNING *`,
    [name, locke_type_id, game, status, difficulty, rules,
     (trainer || '').trim() || 'Hades', req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'No encontrado' });
  res.json(rows[0]);
};

exports.updateStatus = async (req, res) => {
  const { status } = req.body; // ganado | perdido | en_curso
  const { rows } = await pool.query(
    'UPDATE lockes SET status=$1 WHERE id=$2 RETURNING *',
    [status, req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'No encontrado' });
  res.json(rows[0]);
};

exports.deleteLocke = async (req, res) => {
  await pool.query('DELETE FROM lockes WHERE id=$1', [req.params.id]);
  res.status(204).end();
};

// ---------- Campeones ----------
exports.addChampion = async (req, res) => {
  const {
    nickname, species, gender, image_url, type1_id, type2_id,
    ability, ability_description, nature_id, summary, shiny,
  } = req.body;
  if (!nickname || !species || !type1_id)
    return res.status(400).json({ error: 'nickname, species y type1_id son requeridos' });
  const line = await evoLine(species);

  const { rows } = await pool.query(
    `INSERT INTO champions
     (locke_id, nickname, species, evo_line, gender, image_url, type1_id, type2_id,
      ability, ability_description, nature_id, summary, shiny)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
    [req.params.id, nickname.trim(), species, line, gender, image_url, type1_id, type2_id || null,
     ability, ability_description, nature_id || null, summary, !!shiny]
  );
  res.status(201).json(rows[0]);
};

exports.updateChampion = async (req, res) => {
  const {
    nickname, species, gender, image_url, type1_id, type2_id,
    ability, ability_description, nature_id, summary, shiny,
  } = req.body;
  if (!nickname || !species || !type1_id)
    return res.status(400).json({ error: 'nickname, species y type1_id son requeridos' });
  const line = await evoLine(species);

  const { rows } = await pool.query(
    `UPDATE champions
     SET nickname=$1, species=$2, evo_line=$3, gender=$4, image_url=$5, type1_id=$6, type2_id=$7,
         ability=$8, ability_description=$9, nature_id=$10, summary=$11, shiny=$12
     WHERE id=$13 AND locke_id=$14 RETURNING *`,
    [nickname.trim(), species, line, gender, image_url, type1_id, type2_id || null,
     ability, ability_description, nature_id || null, summary, !!shiny,
     req.params.championId, req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'No encontrado' });
  res.json(rows[0]);
};

exports.deleteChampion = async (req, res) => {
  await pool.query('DELETE FROM champions WHERE id=$1', [req.params.championId]);
  res.status(204).end();
};