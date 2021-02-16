let express = require('express');
let router = express.Router();


const purchase = require('../controllers/purchaseOrders');


router.get('/get-orders/:id/:company', purchase.getPurchaseOrders);
router.post('/create-order/:id/:company', purchase.createPurchaseOrder);
router.get('/get-purchaseorder-details/:id', purchase.getPurchaseDetails);
router.put('/update-purchaseorder/:id', purchase.updatePurchaseOrder);
router.delete('/delete-purchaseorder/:id', purchase.deletePurchase);

module.exports = router;