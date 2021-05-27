let express = require('express');
let router = express.Router();


const advance = require('../controllers/customeradvance');


// router.get('/get-advance/:doc/:company', advance.getadvance);
router.post('/add-advancesaleinvoice', advance.addCustomerAdvance);
router.get('/get-advancesaleinvoicedetails/:id', advance.getPaymentDetails);
router.get('/get-advanceexportdetails', advance.getExportExcelInfo);
router.put('/update-advancesaleinvoicedetail/:id', advance.updatePaymentInvoice);
router.put('/cancelled-advancesaleinvoicedetail/:id', advance.cancelledPaymentInvoice);
router.get('/get-advancecustomers/:id', advance.getAllAdvancePayments);
router.get('/get-advancesdetailsnocancelled/:id', advance.getAdvanceDetailsNocancelled);


module.exports = router;