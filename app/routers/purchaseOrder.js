let express = require('express');
let router = express.Router();


const purchase = require('../controllers/purchaseOrders');


router.get('/get-orders/:id/:company', purchase.getPurchaseOrders);
router.post('/create-order/:id/:company', purchase.createPurchaseOrder);
router.get('/get-purchaseorder-details/:id', purchase.getPurchaseDetails);
router.put('/update-purchaseorder/:id', purchase.updatePurchaseOrder);
// router.delete('/delete-purchaseorder/:id', purchase.deletePurchase);
router.put('/change-purchasestate/:id', purchase.changePurchaseState);
// router.get('/get-lastmonthpurchase/:id', purchase.getLastMonthPurchase);
// router.get('/get-thismonthpurchase/:id', purchase.getThisMonthPurchase);


router.get('/get-closedorders/:id/:company', purchase.getPurchaseOrdersClosed);
router.get('/get-closedordersdetails/:id', purchase.getClosedPurchaseDetails);
// router.get('/get-purchasebysupplier/:id/:fecha1/:fecha2', purchase.getPurchaseOrdersBySupplier);
// router.get('/get-invoicebysupplier/:id/:fecha1/:fecha2', purchase.getInvoicesBySupplier);


module.exports = router;