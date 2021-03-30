let express = require('express');
let router = express.Router();


const supplierType = require('../controllers/supplierType');


router.post('/create-suppliertype', supplierType.createSupplierType);


module.exports = router;