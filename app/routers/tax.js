let express = require('express');
let router = express.Router();


const taxes = require('../controllers/taxes');


router.get('/get-taxes/:doc/:company', taxes.getTaxes);
router.post('/get-taxescompany/:doc/:company', taxes.getTaxesCustom);
router.post('/create-taxes', taxes.createTaxes);


module.exports = router;