require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const pool = require('../src/config/db');
const { evoLine } = require('../src/utils/evoLine');

(async () => {
  for (const table of ['champions', 'score_pokemon']) {
    const { rows } = await pool.query(`SELECT DISTINCT species FROM ${table} WHERE evo_line IS NULL`);
    for (const { species } of rows) {
      const line = await evoLine(species);
      await pool.query(`UPDATE ${table} SET evo_line=$1 WHERE species=$2 AND evo_line IS NULL`, [line, species]);
      console.log(table, species, '→', line);
    }
  }
  // Leyendas manuales: toman la línea de un Pokémon con su mismo nombre
  await pool.query(`
    UPDATE legends g SET evo_line = (
      SELECT p.evo_line FROM score_pokemon p
      WHERE lower(p.nickname) = lower(g.nickname) AND p.evo_line IS NOT NULL LIMIT 1)
    WHERE g.evo_line IS NULL`);
  await pool.query(`
    UPDATE legends g SET evo_line = (
      SELECT c.evo_line FROM champions c
      WHERE lower(c.nickname) = lower(g.nickname) AND c.evo_line IS NOT NULL LIMIT 1)
    WHERE g.evo_line IS NULL`);
  console.log('Listo');
  await pool.end();
})();