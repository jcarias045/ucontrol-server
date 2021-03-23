let express = require('express');
let router = express.Router();
const payment = require('../controllers/paymentsToSuppliers');
const paymentMethods = require('../controllers/paymentMethods');
const paymentToSupplierDetails= require('../controllers/paymentsToSupplierDetails');

router.get('/get-paymethods' , paymentMethods.getPaymentMethods);
router.post('/create-paymethods' , paymentMethods.createMethods);
router.post('/add-paymentinvoice',payment.addPaymentToInvoice );
router.get('/get-paymentinvoicedetails/:id',payment.getPaymentDetails );
router.put('/cancelled-paymentinvoicedetails/:id',payment.cancelledPaymentInvoice);
router.put('/update-paymentinvoicedetails/:id',payment.updatePaymentInvoice);
router.get('/get-allpayments/:id' , payment.getAllPayments);


module.exports = router;