let express = require('express');
let router = express.Router();


const conversion = require('../controllers/conversions');


router.get('/get-conversion/:id/:company', conversion.getConversion);
router.post('/create-conversion', conversion.createConversion);


module.exports = router;