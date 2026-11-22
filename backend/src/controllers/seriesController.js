const pool = require('../config/db');
const { computeSeries } = require('../utils/series');

const clean = (b) => [
  (b.name || '').trim(),
  (b.trainer || '').trim() || 'Hades',
  b.locke_type_id || null,
  Math.max(1, parseInt(b.start_lives, 10) || 50),
  Math.max(0, parseInt(b.bonus_lives, 10) || 0),
  Math.max(0, parseInt(b.bonus_if_deaths_under, 10) || 0),
];

exports.getSeries = async (req, res) => res.json(await computeSeries());

exports.createSeries = async (req, res) => {
  if (!req.body.name?.trim()) return res.status(400).json({ error: 'Nombre requerido' });
  const { rows } = await pool.query(
    `INSERT INTO locke_series
     (name, trainer, locke_type_id, start_lives, bonus_lives, bonus_if_deaths_under)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    clean({ bonus_lives: 3, bonus_if_deaths_under: 10, ...req.body })
  );
  res.status(201).json(rows[0]);
};

exports.updateSeries = async (req, res) => {
  if (!req.body.name?.trim()) return res.status(400).json({ error: 'Nombre requerido' });
  const { rows } = await pool.query(
    `UPDATE locke_series
     SET name=$1, trainer=$2, locke_type_id=$3, start_lives=$4, bonus_lives=$5, bonus_if_deaths_under=$6
     WHERE id=$7 RETURNING *`,
    [...clean(req.body), req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'No encontrada' });
  res.json(rows[0]);
};

exports.deleteSeries = async (req, res) => {
  await pool.query('DELETE FROM locke_series WHERE id=$1', [req.params.id]);
  res.status(204).end();
};