let express = require('express');
let router = express.Router();
const paymentTimes = require('../controllers/paymenttime');

router.get('/get-paymenttimes' , paymentTimes.getPaymentTime);
router.post('/create-paymenttime' , paymentTimes.createPaymentTime);
router.put('/update-paymenttime/:id', paymentTimes.updatePaymentTime);
router.delete('/delete-paymenttime/:id', paymentTimes.deletePaymentTime);
router.get('/get-paymenttimeid/:id',paymentTimes.getPaymentTimeId);

module.exports = router;