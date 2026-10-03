const router = require('express').Router();
const c = require('../controllers/lockesController');

router.get('/', c.getLockes);
router.post('/', c.createLocke);
router.get('/full', c.getLockesFull);
router.get('/:id', c.getLockeById);
router.patch('/:id/status', c.updateStatus);
router.delete('/:id', c.deleteLocke);
router.put('/:id', c.updateLocke);
router.put('/:id/champions/:championId', c.updateChampion);
router.post('/:id/champions', c.addChampion);
router.delete('/:id/champions/:championId', c.deleteChampion);

module.exports = router;