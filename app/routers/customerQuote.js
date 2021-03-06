const quotes = require('../controllers/customerQuotes');
let express = require('express');
let router = express.Router();


router.get('/get-customerquotes/:id/:company/:profile', quotes.getCustomerQuote);
router.get('/get-customerquotespdf/:id/:logo', quotes.ImprimirCotizacionHtmlPDF);
router.post('/create-customerquotes', quotes.createCustomerQuote);
router.get('/get-customerquotesdetails/:id', quotes.getCustomerQuotesDetails);
router.get('/get-customerallquotesdetails/:companyId', quotes.getCustomerAllQuotesDetails);
router.put('/update-customerquotes/:id', quotes.updateCustomerQuote);
router.delete('/delete-customerquotedetails/:id', quotes.deleteQuoteDetail);
router.put('/update-customerquotestate/:id', quotes.changeQuoteState);
router.get('/get-quotesbycustomer/:id/:fecha1/:fecha2', quotes.getQuotesbyCustomers);
router.get('/get-pdfprueba/:id/:logo', quotes.ImprimirCotizacionHtmlPDF);


module.exports = router;