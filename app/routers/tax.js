let express = require('express');
let router = express.Router();


const taxes = require('../controllers/taxes');


router.get('/get-taxes/:doc/:company', taxes.getTaxes);


module.exports = router;