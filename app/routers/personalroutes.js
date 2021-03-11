let express = require('express');
let router = express.Router();
const personal = require('../controllers/personal');

router.get('/get-personal/:id/:company', personal.getAllPersonal);
router.post('/create-personal', personal.createPersonal);
router.put('/update-personal/:id', personal.updatePersonal);
router.put('/desactivate-personal/:id', personal.desactivePersonal);

module.exports = router;