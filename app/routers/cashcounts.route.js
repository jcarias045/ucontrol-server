let express = require('express');
let router = express.Router();
const cashAccounts = require('../controllers/cashaccounts');

router.get('/get-cashaccounts/:id', cashAccounts.getCashAccount);
router.post('/create-cashaccount', cashAccounts.creatCashAccounts);
router.put('/update-cashaccount/:id', cashAccounts.updateCashAccount);
router.put('/desactive-cashaccount/:id',cashAccounts.desactivateBanksAccounts);
router.get('/get-cashaccountcompany/:id',cashAccounts.getCashAccountCompany);

module.exports = router;