let express = require('express');
let router = express.Router();


const cashmovement = require('../controllers/cashmovement');


router.get('/get-cashmovement/:id', cashmovement.getCashMovement);
router.post('/create-cashmovement', cashmovement.createCashMovement);


module.exports = router;