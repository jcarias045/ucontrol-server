let express = require('express');
let router = express.Router();


const docType = require('../controllers/documenttypes');


router.get('/get-docType/:company', docType.getDocType);
router.post('/create-docType', docType.createDocType);


module.exports = router;