require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || true }));
app.use(express.json());

// Clave de acceso compartida
const requireKey = (req, res, next) => {
  if (!process.env.ACCESS_KEY) return next(); // sin clave = modo local
  if (req.headers['x-access-key'] !== process.env.ACCESS_KEY)
    return res.status(401).json({ error: 'Clave incorrecta' });
  next();
};
app.use('/api', requireKey);

app.use('/api/catalogs', require('./routes/catalogs'));
app.use('/api/lockes', require('./routes/lockes'));
app.use('/api/scores', require('./routes/scores'));
app.use('/api/legends', require('./routes/legends'));

app.get('/', (req, res) => res.json({ ok: true, message: 'PokéLocke API' }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API en http://localhost:${PORT}`));