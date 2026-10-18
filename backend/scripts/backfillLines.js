require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const pool = require('../src/config/db');
const { evoLine } = require('../src/utils/evoLine');

(async () => {
  for (const table of ['champions', 'score_pokemon']) {
    const { rows } = await pool.query(`SELECT DISTINCT species FROM ${table}`);
    for (const { species } of rows) {
      const line = await evoLine(species);
      if (!line) {
        console.log(`⚠ ${table} ${species}: sin respuesta, se deja como está`);
        continue;
      }
      await pool.query(`UPDATE ${table} SET evo_line=$1 WHERE species=$2`, [line, species]);
      console.log(table, species, '→', line);
    }
  }

  // Leyendas manuales: toman la línea de un Pokémon del mismo entrenador y nombre
  await pool.query(`
    UPDATE legends g SET evo_line = COALESCE(
      (SELECT p.evo_line FROM score_pokemon p
         JOIN score_logs s ON s.id = p.log_id
         JOIN lockes l ON l.id = s.locke_id
       WHERE lower(p.nickname) = lower(g.nickname)
         AND lower(l.trainer) = lower(g.trainer)
         AND p.evo_line IS NOT NULL
       ORDER BY p.id LIMIT 1),
      (SELECT c.evo_line FROM champions c
         JOIN lockes l ON l.id = c.locke_id
       WHERE lower(c.nickname) = lower(g.nickname)
         AND lower(l.trainer) = lower(g.trainer)
         AND c.evo_line IS NOT NULL
       ORDER BY c.id LIMIT 1),
      g.evo_line)`);

  console.log('Listo');
  await pool.end();
})();