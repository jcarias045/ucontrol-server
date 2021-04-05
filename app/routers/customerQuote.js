let express = require('express');
let router = express.Router();


const quotes = require('../controllers/customerQuotes');


router.get('/get-customerquotes/:id/:company', quotes.getCustomerQuote);


module.exports = router;