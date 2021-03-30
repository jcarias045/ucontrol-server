let express = require('express');
let router = express.Router();
const suppliertypes = require('../controllers/supplierstypes');

router.get('/get-suppliertype/:id', suppliertypes.getSupplierTypes);
router.post('/create-suppliertype', suppliertypes.createSupplierType);
router.delete('/suppliertype-delete/:id',suppliertypes.deletSupplierType);
router.put('/suppliertype-update/:id', suppliertypes.updateSupplierType);
// router.get('/get-suppliertype/:id',suppliertypes.getCatProductsId);

module.exports = router;