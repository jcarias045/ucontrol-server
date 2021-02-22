let express = require('express');
let router = express.Router();


const purchaseInvoice = require('../controllers/purchaseInvoice');


router.get('/get-suppliersinvoices/:id/:company', purchaseInvoice.getSuppliersInvoices);
// router.post('/create-order/:id/:company', purchase.createPurchaseOrder);
// router.get('/get-purchaseorder-details/:id', purchase.getPurchaseDetails);
// router.put('/update-purchaseorder/:id', purchase.updatePurchaseOrder);
// router.delete('/delete-purchaseorder/:id', purchase.deletePurchase);
// router.put('/change-purchasestate/:id', purchase.changePurchaseState);
// router.get('/get-lastmonthpurchase/:id', purchase.getLastMonthPurchase);
// router.get('/get-thismonthpurchase/:id', purchase.getThisMonthPurchase);


module.exports = router;