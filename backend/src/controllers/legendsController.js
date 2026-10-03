const pool = require('../config/db');

const key = (s) => (s || '').trim().toLowerCase();

exports.getLegends = async (req, res) => {
  const [lg, pk, ch] = await Promise.all([
    pool.query('SELECT * FROM legends'),
    pool.query(`
      SELECT p.id, p.nickname, p.species, p.gender, p.image_url, p.shiny,
             (p.kills + p.assists * 0.5 + p.mvps * 3)::float AS score,
             s.name AS log_name, s.locke_id
      FROM score_pokemon p JOIN score_logs s ON s.id = p.log_id
      ORDER BY p.id`),
    pool.query(`
      SELECT c.id, c.nickname, c.species, c.gender, c.image_url, c.shiny, c.locke_id,
             l.name AS locke_name, l.status AS locke_status,
             ROW_NUMBER() OVER (PARTITION BY c.locke_id ORDER BY c.id)::int AS pos
      FROM champions c JOIN lockes l ON l.id = c.locke_id
      ORDER BY c.id`),
  ]);

  const result = lg.rows.map((g) => {
    const k = key(g.nickname);
    const runs = pk.rows.filter((p) => key(p.nickname) === k);
    const halls = ch.rows
      .filter((c) => key(c.nickname) === k)
      .map((c) => ({
        ...c,
        points: c.locke_status === 'ganado' && c.pos <= 6 ? 7 - c.pos : 0,
      }));

    const total_score = runs.reduce((a, r) => a + r.score, 0);
    const score_points = Math.floor(total_score / 100);

    // +2 por cada locke distinto donde apareció shiny
    const shinyLockes = new Set(
      [...runs, ...halls].filter((x) => x.shiny).map((x) => x.locke_id)
    );
    const shiny_count = shinyLockes.size;
    const shiny = shiny_count > 0;
    const shiny_points = shiny_count * 2;

    const win_points = halls.reduce((a, h) => a + h.points, 0);
    const extra = Number(g.extra_points) || 0;
    const latest = runs[runs.length - 1] || halls[halls.length - 1];

    return {
      ...g,
      extra_points: extra,
      image_url: g.image_url || latest?.image_url || null,
      gender: g.gender || latest?.gender || null,
      species: [...new Set([...runs, ...halls].map((x) => x.species))],
      shiny,
      shiny_count,
      runs,
      halls,
      total_score,
      score_points,
      shiny_points,
      win_points,
      total: score_points + shiny_points + win_points + extra,
    };
  });

  res.json(result.sort((a, b) => b.total - a.total));
};

// Nombres ya usados en bitácoras y halls (sugerencias para el formulario)
exports.getSources = async (req, res) => {
  const { rows } = await pool.query(`
    SELECT DISTINCT ON (lower(nickname)) nickname FROM (
      SELECT nickname FROM score_pokemon
      UNION ALL SELECT nickname FROM champions
    ) t ORDER BY lower(nickname), nickname`);
  res.json({ names: rows.map((r) => r.nickname) });
};

const values = (b) => [
  b.nickname.trim(),
  b.gender || null,
  b.image_url || null,
  Number(b.extra_points) || 0,
  b.extra_notes || null,
];

const dupError = (res, err) => {
  if (err.code === '23505')
    return res.status(409).json({ error: 'Ya existe una leyenda con ese nombre' });
  throw err;
};

exports.createLegend = async (req, res) => {
  if (!req.body.nickname?.trim())
    return res.status(400).json({ error: 'El nombre es requerido' });
  try {
    const { rows } = await pool.query(
      `INSERT INTO legends (nickname, gender, image_url, extra_points, extra_notes)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      values(req.body)
    );
    res.status(201).json(rows[0]);
  } catch (err) { dupError(res, err); }
};

exports.updateLegend = async (req, res) => {
  if (!req.body.nickname?.trim())
    return res.status(400).json({ error: 'El nombre es requerido' });
  try {
    const { rows } = await pool.query(
      `UPDATE legends SET nickname=$1, gender=$2, image_url=$3, extra_points=$4, extra_notes=$5
       WHERE id=$6 RETURNING *`,
      [...values(req.body), req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'No encontrada' });
    res.json(rows[0]);
  } catch (err) { dupError(res, err); }
};

exports.deleteLegend = async (req, res) => {
  await pool.query('DELETE FROM legends WHERE id = $1', [req.params.id]);
  res.status(204).end();
};