const accountingAccounts= require('../models/accountingaccounts.model');

function createAccountingAccounts(req, res){
    const AccountingAccounts = new accountingAccounts();

    const {Name, document, percentage, Company} = req.body

    AccountingAccounts.Name= Name
    AccountingAccounts.document= document;
    AccountingAccounts.percentage= percentage;
    AccountingAccounts.Company=Company;

    console.log(AccountingAccounts);
    AccountingAccounts.save((err, AccountingAccountsStored)=>{
        if(err){
            res.status(500).send({message: err});
        }else{
            if(!AccountingAccountsStored){
                res.status(500).send({message: "Error"});
            }else{
                res.status(200).send({AccountingAccounts: AccountingAccountsStored})
            }
        }
    });
}


function getAccountingAccounts(req, res){
    console.log("cuentas contables");
    const {company}=req.params;
    // let companyId=req.params.company;
    try{
        accountingAccounts.find({Company:company})
        .then(cuentas => {
            res.status(200).send({cuentas});

        })
    }catch(error) {
        res.status(500).json({
            message: "Error en query!",
            error: error
        });
    }
}

module.exports={
    getAccountingAccounts,
    createAccountingAccounts
}