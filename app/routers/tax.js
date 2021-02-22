let express = require('express');
let router = express.Router();


const taxes = require('../controllers/taxes');


router.get('/get-taxes/:doc', taxes.getTaxes);


module.exports = router;