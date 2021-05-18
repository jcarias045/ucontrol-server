let express = require('express');
let router = express.Router();


const conversion = require('../controllers/conversions');


router.get('/get-conversion/:id/:company', conversion.getConversion);
router.post('/create-conversion', conversion.createConversion);
router.get('/get-conversiondetail/:id', conversion.getConversionDetails);
router.get('/get-conversioninfo/:id', conversion.getConversionInfo);
router.put('/update-conversioninprocess/:id', conversion.ConversionInProcess);
router.put('/update-conversioncompleted/:id', conversion.ConversionCompleted);
router.put('/anular-conversion/:id', conversion.ConversionAnular);



module.exports = router;