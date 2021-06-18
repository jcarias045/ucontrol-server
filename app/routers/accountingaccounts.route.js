let express = require('express');
let router = express.Router();


const AccountingAccounts = require('../controllers/accountingaccounts');


router.get('/get-accountingaccounts/:company', AccountingAccounts.getAccountingAccounts);
router.post('/create-accountingaccounts', AccountingAccounts.createAccountingAccounts);
router.put('/update-accountingaccounts/:id', AccountingAccounts.updateAccountingAccount);
router.get('/get-accountingaccountsgroups/:company', AccountingAccounts.getAccountingAccountsGroups);
router.put('/desactivate-accountingaccounts/:id', AccountingAccounts.desactivateAccount);
router.get('/get-cuentaspadre/:company', AccountingAccounts.getCuentasPadre);
router.get('/get-cuentashija/:company/:ref', AccountingAccounts.getCuentasHija);
router.get('/get-pruebas/:company', AccountingAccounts.getPruebas);



module.exports = router;