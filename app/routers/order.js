let express = require('express');
let router = express.Router();
const order = require('../controllers/orders');

router.get('/get-orders-sells', order.getOrders);

module.exports = router;