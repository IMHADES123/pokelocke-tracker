const pool = require('../config/db');

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

exports.createLocke = async (req, res) => {
  const { name, locke_type_id, game, status, difficulty, rules } = req.body;
  if (!name) return res.status(400).json({ error: 'Nombre requerido' });
  const { rows } = await pool.query(
    `INSERT INTO lockes (name, locke_type_id, game, status, difficulty, rules)
     VALUES ($1,$2,$3,COALESCE($4,'en_curso'),COALESCE($5,'Estándar'),$6) RETURNING *`,
    [name, locke_type_id, game, status, difficulty, rules]
  );
  res.status(201).json(rows[0]);
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

// Añadir un Pokémon campeón a un locke
exports.addChampion = async (req, res) => {
  const {
    nickname, species, gender, image_url, type1_id, type2_id,
    ability, ability_description, nature_id, summary,
  } = req.body;
  if (!nickname || !species || !type1_id)
    return res.status(400).json({ error: 'nickname, species y type1_id son requeridos' });

  const { rows } = await pool.query(
    `INSERT INTO champions
     (locke_id, nickname, species, gender, image_url, type1_id, type2_id,
      ability, ability_description, nature_id, summary)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
    [req.params.id, nickname, species, gender, image_url, type1_id, type2_id || null,
     ability, ability_description, nature_id, summary]
  );
  res.status(201).json(rows[0]);
};

exports.deleteChampion = async (req, res) => {
  await pool.query('DELETE FROM champions WHERE id=$1', [req.params.championId]);
  res.status(204).end();
};
exports.updateLocke = async (req, res) => {
  const { name, locke_type_id, game, status, difficulty, rules } = req.body;
  if (!name) return res.status(400).json({ error: 'Nombre requerido' });
  const { rows } = await pool.query(
    `UPDATE lockes
     SET name=$1, locke_type_id=$2, game=$3, status=$4, difficulty=$5, rules=$6
     WHERE id=$7 RETURNING *`,
    [name, locke_type_id, game, status, difficulty, rules, req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'No encontrado' });
  res.json(rows[0]);
};

exports.updateChampion = async (req, res) => {
  const {
    nickname, species, gender, image_url, type1_id, type2_id,
    ability, ability_description, nature_id, summary,
  } = req.body;
  if (!nickname || !species || !type1_id)
    return res.status(400).json({ error: 'nickname, species y type1_id son requeridos' });

  const { rows } = await pool.query(
    `UPDATE champions
     SET nickname=$1, species=$2, gender=$3, image_url=$4, type1_id=$5, type2_id=$6,
         ability=$7, ability_description=$8, nature_id=$9, summary=$10
     WHERE id=$11 AND locke_id=$12 RETURNING *`,
    [nickname, species, gender, image_url, type1_id, type2_id || null,
     ability, ability_description, nature_id || null, summary,
     req.params.championId, req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'No encontrado' });
  res.json(rows[0]);
};