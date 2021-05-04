let express = require('express');
let router = express.Router();


const correlative = require('../controllers/documentcorrelatives');


router.get('/get-correlative/:company', correlative.getdocCorrelative);
router.post('/create-correlative', correlative.createdocCorrelative);
router.put('/join-correlative/:id/:user', correlative.joinDocumentCorrelative);
router.put('/desactivate-correlative/:id/:user', correlative.desactivateDocumentCorrelative);


module.exports = router;