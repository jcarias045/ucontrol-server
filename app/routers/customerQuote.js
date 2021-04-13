let express = require('express');
let router = express.Router();


const quotes = require('../controllers/customerQuotes');


router.get('/get-customerquotes/:id', quotes.getCustomerQuote);
router.post('/create-customerquotes', quotes.createCustomerQuote);
router.get('/get-customerquotesdetails/:id', quotes.getCustomerQuotesDetails);
router.put('/update-customerquotes/:id', quotes.updateCustomerQuote);
router.delete('/delete-customerquotedetails/:id', quotes.deleteQuoteDetail);
router.put('/update-customerquotestate/:id', quotes.changeQuoteState);


module.exports = router;