const router = require('express').Router();
const c = require('../controllers/seriesController');

router.get('/', c.getSeries);
router.post('/', c.createSeries);
router.put('/:id', c.updateSeries);
router.delete('/:id', c.deleteSeries);

module.exports = router;