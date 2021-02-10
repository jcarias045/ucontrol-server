let express = require('express');
let router = express.Router();


const purchase = require('../controllers/purchaseOrders');


router.get('/get-orders', purchase.getPurchaseOrders);

module.exports = router;