let express = require('express');
let router = express.Router();


const saleinvoice = require('../controllers/saleorderinvoices');


router.get('/get-saleorderinvoices/:id/:company', saleinvoice.getSaleOrderInvoices);
router.get('/get-saleorderinvoicesvncr/:id', saleinvoice.getDetallesVentaContribuyente);
router.get('/get-saleorderclosed/:id/:company', saleinvoice.getSaleOrdersClosed);
router.get('/get-saleorderinfo/:id', saleinvoice.getSaleOrderInfo);
router.get('/get-saleordersdetails/:id', saleinvoice.getSaleOrderDetails);
router.post('/create-saleorderinvoice', saleinvoice.createSaleOrderInvoiceWithOrder2);
router.post('/create-newsaleorderinvoice', saleinvoice.createSaleOrderInvoice2);
router.get('/get-saleorderinvoicedetails/:id', saleinvoice.getSaleInvoiceDetails);
router.get('/get-saleorderinvoiceexport/:id', saleinvoice.getExportInfoFacturas);
router.put('/update-saleorderinvoice/:id', saleinvoice.updateSaleOrderInvoice);
router.put('/delete-saleorderinvoicedetails/:id', saleinvoice.deleteSaleInvoiceDetails);
router.put('/anular-saleorderinvoice/:id', saleinvoice.anularSaleInovice);
router.get('/get-saleinvoicesnopagadas/:id/:company', saleinvoice.getSaleInvoicesNoPagadas);
router.get('/get-saleinvoiceheader/:id/:user/:company', saleinvoice.getSaleInvoiceHeader);
router.get('/get-saleinvoicenoingresados/:id', saleinvoice.getSaleInvoicePendientesIngreso);
router.get('/get-saleorderinvoicepdf/:id', saleinvoice.ImprimirPdf);
router.get('/get-charges/:id/:user', saleinvoice.getChargestoCustomers);
router.get('/get-saleorderinvoicebycustomer/:id/:fecha1/:fecha2', saleinvoice.getSaleOrderInvoicebyCustomers);
router.post('/pruebascorrelativos', saleinvoice.funcionPruebaCorrelativos);
router.get('/get-saleforuser/:id/:company/:fecha1/:fecha2', saleinvoice.getSalesForUsers);
router.get('/get-saleforproduct/:id/:company/:fecha1/:fecha2', saleinvoice.getSalesForProducts);


//para el titulo de la pagina para mostrar total de lo facturado
router.get('/get-facturadoestemes/:id', saleinvoice.getSalesThisMonth);
router.get('/get-facturadomespasado/:id', saleinvoice.getSalesLastMonth);



module.exports = router;
