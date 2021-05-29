let express = require('express');
let router = express.Router();


const bankmovement = require('../controllers/bankmovement');


router.get('/get-bankmovement/:id', bankmovement.getBankMovement);
router.post('/create-bankmovement', bankmovement.createBankMovement);


module.exports = router;