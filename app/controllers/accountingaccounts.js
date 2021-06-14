const accountingAccounts= require('../models/accountingaccounts.model');

async function createAccountingAccounts(req, res){
    const AccountingAccounts = new accountingAccounts();
   
    const {Name, NumberAccount, Type, Company,ReferenceAccount,NumberRef} = req.body
    let codigo=0;

    let codCuenta=await accountingAccounts.findOne({Company:Company}).sort({Code:-1})
    .then(function(doc){
        console.log(doc);
            if(doc){
                    if(doc.Code!==null){
                return(doc.Code)
            }
        }
    });

    if(!codCuenta){
        codigo =1;
    }else {codigo=codCuenta+1}

    AccountingAccounts.Code=codigo;
    AccountingAccounts.Name= Name
    AccountingAccounts.NumberAccount= NumberAccount;
    AccountingAccounts.Type= Type;
    AccountingAccounts.Company=Company;
    AccountingAccounts.ReferenceAccount= ReferenceAccount;
    AccountingAccounts.State=true;
    AccountingAccounts.NumberRef=NumberRef

    console.log(AccountingAccounts);
    if(ReferenceAccount===null){
        AccountingAccounts.NumberRef=0;
        AccountingAccounts.FatherAccount=0;

    }else{
        let cod=await accountingAccounts.findOne({_id:ReferenceAccount }).sort({Code:-1})
        .then(function(doc){
            console.log(doc);
                if(doc){
                        if(doc.Code!==null){
                    return(doc)
                }
            }
        });
    AccountingAccounts.NumberRef=cod.Code;
    AccountingAccounts.FatherAccount=cod.NumberAccount;
    }
    AccountingAccounts.save((err, AccountingAccountsStored)=>{
        if(err){
            console.log(err);
            res.status(500).send({message: err});
        }else{
            if(!AccountingAccountsStored){
                res.status(500).send({message: "Error"});
            }else{
                console.log(AccountingAccountsStored);
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
        .populate({path:"AccountingAccount", model:"AccountingAccount"})
        .sort({NumberAccount:1})
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

async function updateAccountingAccount(req, res){
    let BankData = req.body;
    const params = req.params;
    const {ReferenceAccount, Name,NumberAccount,Type} =req.body;
   console.log("update");
    let cod=await accountingAccounts.findOne({_id:ReferenceAccount }).sort({Code:-1})
    .then(function(doc){
        console.log(doc);
            if(doc){
                    if(doc.Code!==null){
                return(doc)
            }
        }
    });
    update={
        NumberRef:cod.Code,
        ReferenceAccount:ReferenceAccount, 
        Name: Name,
        NumberAccount:NumberAccount,
        Type: Type,
        FatherAccount:cod.NumberAccount

    };
    console.log("hola",update);
    accountingAccounts.findByIdAndUpdate({_id: params.id}, update, (err, BankUpdate)=>{
        if(err){
            res.status(500).sen({message: "Error del Servidor."});
        } else {
            if(!BankUpdate){
                res.status(404).sen({message: "No existe "});
            }else{
                res.status(200).send({update: BankUpdate})
            }
        }
    })
}

function getAccountingAccountsGroups(req, res){
    console.log("cuentas contables");
    const {company}=req.params;
    // let companyId=req.params.company;
    try{
        accountingAccounts.aggregate([ 
            { 
                $group : { 
                    _id : "$NumberRef",
                    itemsSold: { $push:  { nombre:"$Name", cuentaPadre: "$FatherAccount", NoCuenta: "$NumberAccount",  } }
            } 
        }
        ] )
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

function desactivateAccount(req, res){
    let BankData = req.body;
    const params = req.params;
    let companyId = req.params.id; 

    const {State} = req.body;  //
    accountingAccounts.findByIdAndUpdate({_id: params.id}, {State}, (err, BankUpdate)=>{
        if(err){
            res.status(500).sen({message: "Error del Servidor."});
        } else {
            if(!BankUpdate){
                res.status(404).sen({message: "No hay"});
            }else{
                res.status(200).send({message: "Banca Actualizado"})
            }
        }
    })
}

module.exports={
    getAccountingAccounts,
    createAccountingAccounts,
    updateAccountingAccount,
    getAccountingAccountsGroups,
    desactivateAccount
}