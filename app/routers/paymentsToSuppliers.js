let express = require('express');
let router = express.Router();
const paymentToSupplier = require('../controllers/paymentsToSuppliers');
const paymentMethods = require('../controllers/paymentMethods');
const paymentToSupplierDetails= require('../controllers/paymentsToSupplierDetails');

router.get('/get-paymethods' , paymentMethods.getPaymentMethods);


module.exports = router;