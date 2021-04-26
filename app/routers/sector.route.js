let express = require('express');
let router = express.Router();


const sectors = require('../controllers/sectors');


router.get('/get-sectors/:id', sectors.getSectors);
router.post('/create-sectors', sectors.createSector);


module.exports = router;