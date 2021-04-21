let express = require('express');
let router = express.Router();


const payment = require('../controllers/customerpayments');


// router.get('/get-payment/:doc/:company', payment.getpayment);
router.post('/add-paymentsaleinvoice', payment.addCustomerPayment);
router.get('/get-paymentsaleinvoicedetails/:id', payment.getPaymentDetails);
router.put('/update-paymentsaleinvoicedetail/:id', payment.updatePaymentInvoice);
router.put('/cancelled-paymentsaleinvoicedetail/:id', payment.cancelledPaymentInvoice);
router.get('/get-paymentcustomers/:id', payment.getAllPayments);


module.exports = router;