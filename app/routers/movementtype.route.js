let express = require('express');
let router = express.Router();


const movement = require('../controllers/movementtypes');


// router.get('/get-movement/:doc/:company', movement.getmovement);
router.post('/create-movement', movement.createMovementType);


module.exports = router;