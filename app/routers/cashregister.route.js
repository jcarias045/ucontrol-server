let express = require('express');
let router = express.Router();
const cashregister = require('../controllers/cashregisters');

router.get('/get-cashregister/:id', cashregister.getCashRegisters);
router.post('/create-cashregister', cashregister.createCashRegister);
router.put('/update-cashregister/:id', cashregister.updateCashRegister);
router.put('/delete-cashregister/:id', cashregister.deleteCashRegister);
// router.get('/get-cashregisterid/:id', cashregister.getBankId);

module.exports = router;