let express = require('express');
let router = express.Router();


const purchaseInvoice = require('../controllers/purchaseInvoice');


router.get('/get-suppliersinvoices/:id/:company/:profile', purchaseInvoice.getSuppliersInvoices);
router.post('/create-invoicesupplier/:id/:company', purchaseInvoice.createSupplierInvoice);
router.post('/createnew-invoicesupplier/:id/:company', purchaseInvoice.createNewSupplierInvoice);
router.get('/get-invoicesupplier-details/:id', purchaseInvoice.getInvoiceDetails);
router.put('/update-invoicesupplier/:id', purchaseInvoice.updateInvoicePurchase);
router.delete('/delete-invoicedetail/:id', purchaseInvoice.deleteInvoiceDetail);
router.put('/change-invoicestate/:id/:company', purchaseInvoice.changeInvoiceState);
router.get('/export-getinvoicesupplier', purchaseInvoice.getInvoiceSupplierExport);
// // router.get('/get-lastmonthpurchase/:id', purchase.getLastMonthPurchase);
// // router.get('/get-thismonthpurchase/:id', purchase.getThisMonthPurchase);

router.get('/get-suppliersinvoicespendientes/:id/:company', purchaseInvoice.getSuppliersInvoicesPendientes);
router.get('/get-invoicenopagada/:id/:company', purchaseInvoice.getSuppliersInvoicesNoPagada);
router.get('/get-infoinvoice/:id/:company/:invoice', purchaseInvoice.getInfoInvoice);
router.get('/get-payments/:id', purchaseInvoice.getPaymentToSuppliers);
router.get('/get-invoicebysupplier/:id/:fecha1/:fecha2', purchaseInvoice.getInvoicesBySupplier);


module.exports = router;