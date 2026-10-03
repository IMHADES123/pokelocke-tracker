const router = require('express').Router();
const c = require('../controllers/legendsController');

router.get('/', c.getLegends);
router.get('/sources', c.getSources);
router.post('/', c.createLegend);
router.put('/:id', c.updateLegend);
router.delete('/:id', c.deleteLegend);

module.exports = router;