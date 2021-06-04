let express = require('express');
let router = express.Router();


const checkbook = require('../controllers/checkbooks');


router.get('/get-checkbook/:company/:bank', checkbook.getCheckbook);
router.get('/get-checkbookinfo/:id', checkbook.getCheckbookInfo);
router.post('/create-checkbook', checkbook.createCheckbook);
router.put('/join-checkbook/:id/:user', checkbook.joinDocumentCheckbook);
router.put('/desactivate-checkbook/:id/:user', checkbook.desactivateDocumentCheckbook);


module.exports = router;