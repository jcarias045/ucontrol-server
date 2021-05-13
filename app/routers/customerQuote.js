let express = require('express');
let router = express.Router();


const quotes = require('../controllers/customerQuotes');


router.get('/get-customerquotes/:id', quotes.getCustomerQuote);
router.get('/get-customerquotespdf/:id', quotes.ImprimirCotizacionPDF);
router.post('/create-customerquotes', quotes.createCustomerQuote);
router.get('/get-customerquotesdetails/:id', quotes.getCustomerQuotesDetails);
router.get('/get-customerallquotesdetails', quotes.getCustomerAllQuotesDetails);
router.put('/update-customerquotes/:id', quotes.updateCustomerQuote);
router.delete('/delete-customerquotedetails/:id', quotes.deleteQuoteDetail);
router.put('/update-customerquotestate/:id', quotes.changeQuoteState);
router.get('/get-quotesbycustomer/:id/:fecha1/:fecha2', quotes.getQuotesbyCustomers);


module.exports = router;