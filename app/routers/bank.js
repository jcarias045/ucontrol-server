let express = require('express');
let router = express.Router();
const banks = require('../controllers/banks');

router.get('/get-banks/:id', banks.getBanks);
router.post('/create-bank', banks.createBank);
router.put('/update-bank/:id', banks.updateBank);
router.delete('/delete-bank/:id', banks.deleteBank);
router.get('/get-banksid/:id', banks.getBankId);

module.exports = router;