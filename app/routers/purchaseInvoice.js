let express = require('express');
let router = express.Router();


const purchaseInvoice = require('../controllers/purchaseInvoice');


router.get('/get-suppliersinvoices/:id/:company', purchaseInvoice.getSuppliersInvoices);
router.post('/create-invoicesupplier/:id/:company', purchaseInvoice.createSupplierInvoice);
router.post('/createnew-invoicesupplier/:id/:company', purchaseInvoice.createNewSupplierInvoice);
// router.get('/get-purchaseorder-details/:id', purchase.getPurchaseDetails);
router.put('/update-invoicesupplier/:id', purchaseInvoice.updateInvoicePurchase);
// router.delete('/delete-purchaseorder/:id', purchase.deletePurchase);
// router.put('/change-purchasestate/:id', purchase.changePurchaseState);
// router.get('/get-lastmonthpurchase/:id', purchase.getLastMonthPurchase);
// router.get('/get-thismonthpurchase/:id', purchase.getThisMonthPurchase);


module.exports = router;