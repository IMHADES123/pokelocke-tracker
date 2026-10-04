const pool = require('../config/db');

const MIN_POINTS = 1; // puntos mínimos para ser leyenda automática

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

  // Agrupar por nombre (sin distinguir mayúsculas)
  const groups = new Map();
  const bucket = (name) => {
    const k = key(name);
    if (!groups.has(k)) groups.set(k, { k, name: name.trim(), runs: [], halls: [], manual: null });
    return groups.get(k);
  };
  pk.rows.forEach((p) => bucket(p.nickname).runs.push(p));
  ch.rows.forEach((c) => bucket(c.nickname).halls.push(c));
  lg.rows.forEach((m) => { const g = bucket(m.nickname); g.manual = m; g.name = m.nickname; });

  const result = [];
  for (const g of groups.values()) {
    const halls = g.halls.map((c) => ({
      ...c,
      points: c.locke_status === 'ganado' && c.pos <= 6 ? 7 - c.pos : 0,
    }));
    const runs = g.runs;

    const total_score = runs.reduce((a, r) => a + r.score, 0);
    const score_points = Math.floor(total_score / 100);

    // +2 por cada locke distinto donde apareció shiny
    const shinyLockes = new Set(
      [...runs, ...halls].filter((x) => x.shiny).map((x) => x.locke_id)
    );
    const shiny_count = shinyLockes.size;
    const shiny_points = shiny_count * 2;

    const win_points = halls.reduce((a, h) => a + h.points, 0);
    const extra = Number(g.manual?.extra_points) || 0;
    const total = score_points + shiny_points + win_points + extra;

    // Califica automáticamente, o existe una ficha manual
    if (total < MIN_POINTS && !g.manual) continue;

    const latest = runs[runs.length - 1] || halls[halls.length - 1];
    result.push({
      id: g.manual?.id ?? null,
      key: g.k,
      auto: !g.manual,
      nickname: g.name,
      extra_points: extra,
      extra_notes: g.manual?.extra_notes || null,
      image_url: g.manual?.image_url || latest?.image_url || null,
      gender: g.manual?.gender || latest?.gender || null,
      species: [...new Set([...runs, ...halls].map((x) => x.species))],
      shiny: shiny_count > 0,
      shiny_count,
      runs,
      halls,
      total_score,
      score_points,
      shiny_points,
      win_points,
      total,
    });
  }

  result.sort((a, b) => b.total - a.total || b.total_score - a.total_score);
  res.json(result);
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

// Crea la ficha manual, o la actualiza si ya existe ese nombre
exports.createLegend = async (req, res) => {
  if (!req.body.nickname?.trim())
    return res.status(400).json({ error: 'El nombre es requerido' });
  const { rows } = await pool.query(
    `INSERT INTO legends (nickname, gender, image_url, extra_points, extra_notes)
     VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (lower(nickname)) DO UPDATE
       SET gender = EXCLUDED.gender, image_url = EXCLUDED.image_url,
           extra_points = EXCLUDED.extra_points, extra_notes = EXCLUDED.extra_notes
     RETURNING *`,
    values(req.body)
  );
  res.status(201).json(rows[0]);
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
  } catch (err) {
    if (err.code === '23505')
      return res.status(409).json({ error: 'Ya existe una leyenda con ese nombre' });
    throw err;
  }
};

exports.deleteLegend = async (req, res) => {
  await pool.query('DELETE FROM legends WHERE id = $1', [req.params.id]);
  res.status(204).end();
};