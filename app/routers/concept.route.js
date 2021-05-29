let express = require('express');
let router = express.Router();


const concept = require('../controllers/concepts');


router.get('/get-concept/:id', concept.getConcept);
router.post('/create-concept', concept.createConcept);


module.exports = router;