let express = require('express');
let router = express.Router();


const suppliers = require('../controllers/suppliers');


router.get('/get-suppliers/:id', suppliers.getSuppliers);
router.post('/create-supplier', suppliers.createSupplier);
router.put('/update-supplier/:id', suppliers.updateSupplier);
router.delete('/delete-supplier/:id',suppliers.deleteSupplier);
router.put('/desactivate-supplier/:id',suppliers.desactivateSupplier);


//para obtener nada más el id y nombre 
router.get('/get-infosuplier/:id',suppliers.getSuppliersInfo);
router.get('/get-supplierdetails/:id/:company',suppliers.getSuppliersDetails)
module.exports = router;