let express = require('express');
let router = express.Router();
const banksAccounts = require('../controllers/banksaccounts');

router.get('/get-banksaccounts/:id/:bankid', banksAccounts.GetBankAccount);
router.post('/create-bankaccount', banksAccounts.CreatBankAccounts);
router.put('/update-bankaccount/:id', banksAccounts.updateBankAccount);
router.put('/desactive-bankaccount/:id',banksAccounts.desactivateBanksAccounts);
router.get('/get-bankaccountcompany/:id',banksAccounts.getBankAccountCompany);
router.get('/get-bankcurrentaccounts/:id',banksAccounts.getBankCurrentAccountsCompany);
router.get('/get-banksaccountscompany/:id', banksAccounts.getBankAccountByCompany);


module.exports = router;