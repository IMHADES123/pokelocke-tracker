require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/catalogs', require('./routes/catalogs'));
app.use('/api/lockes', require('./routes/lockes'));
app.use('/api/scores', require('./routes/scores'));

app.get('/', (req, res) => res.json({ ok: true, message: 'PokéLocke API' }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API en http://localhost:${PORT}`));