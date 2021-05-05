let express = require('express');
let router = express.Router();


const saleinvoice = require('../controllers/saleorderinvoices');


router.get('/get-saleorderinvoices/:id/:company', saleinvoice.getSaleOrderInvoices);
router.get('/get-saleorderclosed/:id/:company', saleinvoice.getSaleOrdersClosed);
router.get('/get-saleorderinfo/:id', saleinvoice.getSaleOrderInfo);
router.get('/get-saleordersdetails/:id', saleinvoice.getSaleOrderDetails);
router.post('/create-saleorderinvoice', saleinvoice.createSaleOrderInvoiceWithOrder2);
router.post('/create-newsaleorderinvoice', saleinvoice.createSaleOrderInvoice);
router.get('/get-saleorderinvoicedetails/:id', saleinvoice.getSaleInvoiceDetails);
router.put('/update-saleorderinvoice/:id', saleinvoice.updateSaleOrderInvoice);
router.put('/delete-saleorderinvoicedetails/:id', saleinvoice.deleteSaleInvoiceDetails);
router.put('/anular-saleorderinvoice/:id', saleinvoice.anularSaleInovice);
router.get('/get-saleinvoicesnopagadas/:id/:company', saleinvoice.getSaleInvoicesNoPagadas);
router.get('/get-saleinvoiceheader/:id/:user/:company', saleinvoice.getSaleInvoiceHeader);
router.get('/get-saleinvoicenoingresados/:id', saleinvoice.getSaleInvoicePendientesIngreso);


router.get('/get-charges/:id', saleinvoice.getChargestoCustomers);
router.get('/get-saleorderinvoicebycustomer/:id/:fecha1/:fecha2', saleinvoice.getSaleOrderInvoicebyCustomers);



router.post('/pruebascorrelativos', saleinvoice.funcionPruebaCorrelativos);
router.get('/get-saleforuser/:id/:fecha1/:fecha2', saleinvoice.getSalesForUsers);
router.get('/get-saleforproduct/:id/:fecha1/:fecha2', saleinvoice.getSalesForProducts);





module.exports = router;
