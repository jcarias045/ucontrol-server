let express = require('express');
let router = express.Router();


const AccountingAccounts = require('../controllers/accountingaccounts');


router.get('/get-accountingaccounts/:company', AccountingAccounts.getAccountingAccounts);
router.post('/create-accountingaccounts', AccountingAccounts.createAccountingAccounts);
router.put('/update-accountingaccounts/:id', AccountingAccounts.updateAccountingAccount);
router.get('/get-accountingaccountsgroups/:company', AccountingAccounts.getAccountingAccountsGroups);
router.put('/desactivate-accountingaccounts/:id', AccountingAccounts.desactivateAccount);



module.exports = router;