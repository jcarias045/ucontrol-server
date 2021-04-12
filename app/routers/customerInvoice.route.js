let express = require('express');
let router = express.Router();


const invoice = require('../controllers/customerInvoices');


// router.get('/get-customerInvoice/:doc/:company', customerInvoice.getcustomerInvoice);
router.post('/create-customerinvoice', invoice.createCustomerInvoice);


module.exports = router;