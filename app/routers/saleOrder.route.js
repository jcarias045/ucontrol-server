let express = require('express');
let router = express.Router();


const salesorder = require('../controllers/salesOrders');


router.get('/get-closedcustomerquotes/:id/:company', salesorder.getSelesOrderClosed);
router.get('/get-saleorders/:id/:company/:profile', salesorder.getSaleOrders);
router.get('/get-customerquotesdetails/:id', salesorder.getCustomerQuoteDetails);
router.get('/get-customerquotesinfo/:id', salesorder.getCustomerQuoteInfo);
router.post('/create-saleorderwithquote', salesorder.createSaleOrderWithQuote);
router.post('/create-saleorder', salesorder.createSaleOrder);
router.get('/get-saleorderdetails/:id', salesorder.getSaleOrderDetails);
router.get('/get-saleallorderdetails/:companyId', salesorder.getAllSaleOrderDetails);
router.put('/update-saleorder/:id', salesorder.updateSaleOrder);
router.put('/delete-saleorderdetail/:id', salesorder.deleteSaleOrderDetail);
router.put('/anular-saleorder/:id', salesorder.anulaSaleOrder);
router.put('/changestate-saleorder/:id', salesorder.changeSaleOrderState);
router.get('/get-saleorderbycustomer/:id/:fecha1/:fecha2', salesorder.getSaleOrdersbyCustomers);
router.get('/get-opensaleorder/:id/:company', salesorder.getOpenSaleOrders);

router.get('/get-saleorderheader/:id/:user/:company', salesorder.getSaleOrderHeader);




module.exports = router;