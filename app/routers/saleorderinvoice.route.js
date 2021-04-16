let express = require('express');
let router = express.Router();


const saleinvoice = require('../controllers/saleorderinvoices');


router.get('/get-saleorderinvoices/:id/:company', saleinvoice.getSaleOrderInvoices);
router.get('/get-saleorderclosed/:id/:company', saleinvoice.getSaleOrdersClosed);
router.get('/get-saleorderinfo/:id', saleinvoice.getSaleOrderInfo);
router.get('/get-saleordersdetails/:id', saleinvoice.getSaleOrderDetails);
router.post('/create-saleorderinvoice', saleinvoice.createSaleOrderInvoiceWithOrder);
router.post('/create-newsaleorderinvoice', saleinvoice.createSaleOrderInvoice);
router.get('/get-saleorderinvoicedetails/:id', saleinvoice.getSaleInvoiceDetails);
router.put('/update-saleorderinvoice/:id', saleinvoice.updateSaleOrderInvoice);
router.put('/delete-saleorderinvoicedetails/:id', saleinvoice.deleteSaleInvoiceDetails);
router.put('/anular-saleorderinvoice/:id', saleinvoice.anularSaleInovice);



module.exports = router;
