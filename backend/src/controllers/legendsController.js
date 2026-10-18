const pool = require('../config/db');
const { evoLine } = require('../utils/evoLine');

const MIN_POINTS = 1; // puntos mínimos para ser leyenda automática

const low = (s) => (s || '').trim().toLowerCase();
const lineOf = (x) => x.evo_line || low(x.species);
const keyOf = (trainer, line, nick) => `${low(trainer)}|${line}|${low(nick)}`;

exports.getLegends = async (req, res) => {
  const [lg, pk, ch] = await Promise.all([
    pool.query('SELECT * FROM legends'),
    pool.query(`
      SELECT p.id, p.nickname, p.species, p.evo_line, p.gender, p.image_url, p.shiny,
             (p.kills + p.assists * 0.5 + p.mvps * 3)::float AS score,
             s.name AS log_name, s.locke_id, l.trainer
      FROM score_pokemon p
      JOIN score_logs s ON s.id = p.log_id
      JOIN lockes l ON l.id = s.locke_id
      ORDER BY p.id`),
    pool.query(`
      SELECT c.id, c.nickname, c.species, c.evo_line, c.gender, c.image_url, c.shiny, c.locke_id,
             l.name AS locke_name, l.status AS locke_status, l.trainer,
             ROW_NUMBER() OVER (PARTITION BY c.locke_id ORDER BY c.id)::int AS pos
      FROM champions c JOIN lockes l ON l.id = c.locke_id
      ORDER BY c.id`),
  ]);

  // Agrupar por entrenador + línea evolutiva + nombre
  const groups = new Map();
  const bucket = (trainer, line, nick) => {
    const k = keyOf(trainer, line, nick);
    if (!groups.has(k)) {
      groups.set(k, { k, trainer: trainer.trim(), line, name: nick.trim(), runs: [], halls: [], manual: null });
    }
    return groups.get(k);
  };
  pk.rows.forEach((p) => bucket(p.trainer, lineOf(p), p.nickname).runs.push(p));
  ch.rows.forEach((c) => bucket(c.trainer, lineOf(c), c.nickname).halls.push(c));
  lg.rows.forEach((m) => {
    const g = bucket(m.trainer, lineOf(m), m.nickname);
    g.manual = m;
    g.name = m.nickname;
  });

  const result = [];
  for (const g of groups.values()) {
    const halls = g.halls.map((c) => ({
      ...c,
      points: c.locke_status === 'ganado' && c.pos <= 6 ? 7 - c.pos : 0,
    }));
    const runs = g.runs;

    const total_score = runs.reduce((a, r) => a + r.score, 0);
    const score_points = Math.floor(total_score / 100);
    const next_in = Math.round((100 - (total_score % 100)) * 10) / 10;

    // +2 por cada locke distinto donde apareció shiny
    const shinyLockes = new Set(
      [...runs, ...halls].filter((x) => x.shiny).map((x) => x.locke_id)
    );
    const shiny_count = shinyLockes.size;
    const shiny_points = shiny_count * 2;

    const win_points = halls.reduce((a, h) => a + h.points, 0);
    const extra = Number(g.manual?.extra_points) || 0;
    const total = score_points + shiny_points + win_points + extra;

    if (total < MIN_POINTS && !g.manual) continue;

    const latest = runs[runs.length - 1] || halls[halls.length - 1];
    result.push({
      id: g.manual?.id ?? null,
      key: g.k,
      auto: !g.manual,
      nickname: g.name,
      trainer: g.trainer,
      evo_line: g.line,
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
      next_in,
      shiny_points,
      win_points,
      total,
    });
  }

  result.sort((a, b) => b.total - a.total || b.total_score - a.total_score);
  res.json(result);
};

// Combinaciones ya registradas (para elegirlas en el formulario) y entrenadores
exports.getSources = async (req, res) => {
  const entries = await pool.query(`
    SELECT DISTINCT ON (lower(t.trainer), t.evo_line, lower(t.nickname))
           t.nickname, t.trainer, t.species, t.evo_line
    FROM (
      SELECT p.nickname, l.trainer, p.species, COALESCE(p.evo_line, lower(p.species)) AS evo_line
      FROM score_pokemon p
      JOIN score_logs s ON s.id = p.log_id JOIN lockes l ON l.id = s.locke_id
      UNION ALL
      SELECT c.nickname, l.trainer, c.species, COALESCE(c.evo_line, lower(c.species))
      FROM champions c JOIN lockes l ON l.id = c.locke_id
    ) t
    ORDER BY lower(t.trainer), t.evo_line, lower(t.nickname)`);
  const trainers = await pool.query('SELECT DISTINCT trainer FROM lockes ORDER BY trainer');
  res.json({ entries: entries.rows, trainers: trainers.rows.map((r) => r.trainer) });
};

// Crea la ficha manual, o la actualiza si ya existe esa misma clave
exports.createLegend = async (req, res) => {
  const b = req.body;
  if (!b.nickname?.trim() || !(b.evo_line || b.species?.trim()))
    return res.status(400).json({ error: 'Nombre y especie son requeridos' });
  const line = b.evo_line || (await evoLine(b.species));
  const { rows } = await pool.query(
    `INSERT INTO legends (nickname, trainer, evo_line, gender, image_url, extra_points, extra_notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     ON CONFLICT (lower(trainer), evo_line, lower(nickname)) DO UPDATE
       SET gender = EXCLUDED.gender, image_url = EXCLUDED.image_url,
           extra_points = EXCLUDED.extra_points, extra_notes = EXCLUDED.extra_notes
     RETURNING *`,
    [b.nickname.trim(), (b.trainer || '').trim() || 'Yo', line,
     b.gender || null, b.image_url || null, Number(b.extra_points) || 0, b.extra_notes || null]
  );
  res.status(201).json(rows[0]);
};

// La clave (entrenador + línea + nombre) no se edita; solo gender, imagen y extras
exports.updateLegend = async (req, res) => {
  const b = req.body;
  const { rows } = await pool.query(
    `UPDATE legends SET gender=$1, image_url=$2, extra_points=$3, extra_notes=$4
     WHERE id=$5 RETURNING *`,
    [b.gender || null, b.image_url || null, Number(b.extra_points) || 0, b.extra_notes || null,
     req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'No encontrada' });
  res.json(rows[0]);
};

exports.deleteLegend = async (req, res) => {
  await pool.query('DELETE FROM legends WHERE id = $1', [req.params.id]);
  res.status(204).end();
};