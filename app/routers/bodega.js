let express = require('express');
let router = express.Router();
const bodegas = require('../controllers/bodegas');

router.get('/get-bodegas/:id', bodegas.getBodega);
router.post('/create-bodega', bodegas.createBodega);
router.put('/update-bodega/:id', bodegas.updateBodega);
router.delete('/delete-bodega/:id', bodegas.deleteBodega);
router.get('/get-bodega/:id', bodegas.getBodegaId);
router.put('/desactive-bodega/:id', bodegas.desactivate);

module.exports = router;