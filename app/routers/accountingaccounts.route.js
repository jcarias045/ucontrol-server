let express = require('express');
let router = express.Router();


const AccountingAccounts = require('../controllers/accountingaccounts');


router.get('/get-accountingaccounts/:company', AccountingAccounts.getAccountingAccounts);
router.post('/create-accountingaccounts', AccountingAccounts.createAccountingAccounts);


module.exports = router;