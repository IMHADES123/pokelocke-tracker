const pool = require('../config/db');

exports.getPokemonTypes = async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM pokemon_types ORDER BY name');
  res.json(rows);
};

exports.getNatures = async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM natures ORDER BY name');
  res.json(rows);
};

exports.getLockeTypes = async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM locke_types ORDER BY id');
  res.json(rows);
};

// "Añadir Tipo de Locke"
exports.createLockeType = async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Nombre requerido' });
  try {
    const { rows } = await pool.query(
      'INSERT INTO locke_types (name) VALUES ($1) RETURNING *',
      [name.trim()]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Ese tipo ya existe' });
    res.status(500).json({ error: 'Error del servidor' });
  }
};