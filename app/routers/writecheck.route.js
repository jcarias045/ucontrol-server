let express = require('express');
let router = express.Router();


const writecheck = require('../controllers/writechecks');


router.get('/get-writecheck/:id', writecheck.getWriteCheck);
router.post('/create-writecheck', writecheck.createWriteCheck);
router.put('/checkcashed', writecheck.checkCashed);
router.put('/update-writecheck/:id', writecheck.updateWriteCheck);


module.exports = router;