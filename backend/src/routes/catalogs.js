const router = require('express').Router();
const c = require('../controllers/catalogsController');

router.get('/pokemon-types', c.getPokemonTypes);
router.get('/natures', c.getNatures);
router.get('/locke-types', c.getLockeTypes);
router.post('/locke-types', c.createLockeType);

module.exports = router;