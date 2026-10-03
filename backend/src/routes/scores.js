const router = require('express').Router();
const c = require('../controllers/scoresController');

router.get('/logs', c.getLogs);
router.post('/logs', c.createLog);
router.get('/logs/:id', c.getLog);
router.delete('/logs/:id', c.deleteLog);
router.post('/logs/:id/pokemon', c.addPokemon);

router.put('/pokemon/:pid', c.updatePokemon);
router.patch('/pokemon/:pid/stat', c.changeStat);
router.patch('/pokemon/:pid/dead', c.setDead);
router.delete('/pokemon/:pid', c.deletePokemon);

module.exports = router;