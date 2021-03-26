let express = require('express');
let router = express.Router();
const banksAccounts = require('../controllers/banksaccounts');

router.get('/get-banksaccounts/:id/:bankid', banksAccounts.GetBankAccount);
router.post('/create-bankaccount', banksAccounts.CreatBankAccounts);
router.put('/update-bankaccount/:id', banksAccounts.updateBankAccount);
router.put('/desactive-bankaccount/:id',banksAccounts.desactivateBanksAccounts);

module.exports = router;