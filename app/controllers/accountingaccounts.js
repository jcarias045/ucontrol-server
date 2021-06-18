const accountingAccounts= require('../models/accountingaccounts.model');
var _ = require('lodash');
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
                $group :
                { 
                    _id : { no:"$Group"},
                    grupo: { $push:  { nombre:"$Name", cuentaPadre: "$FatherAccount", NoCuenta: "$NumberAccount",ref:"$ReferenceAccount" } }
                    
                    // usersIds: {
                    //     $addToSet: '$NumberRef',
                    //   }
                } 
            },
            
            {
                $lookup: {
                    from: "accountingaccounts" ,
                    let: {companyId: "$_id"},
                    pipeline: [
                        { $match:
                            { $expr:
                                { $and:
                                [
                                    { $eq: [ "$_id",  "$$companyId" ] },
                                    
                                ]
                                }
                            }
                        },
    
                    ],
                    as: "cuenta"
                }
            },
           
            // { $project : {  Name : 1 } }
        ] )
        // accountingAccounts.find()
        // .populate({path:"ReferenceAccount", model: "AccountingAccount"})
        .then(cuentas => {
            let grupos={};
            cuentas.map(item=>{
                grupos=item.grupo;
            })
            // console.log(grupos);
            const result = _.chain(grupos)
                .groupBy("cuentaPadre")
            console.log("RESUL",result)
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


function getCuentasPadre(req, res) {
    console.log("cuentas contables");
    const {company}=req.params;
    // let companyId=req.params.company;
    try{
        accountingAccounts.find({Company:company, NumberRef:0})
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

function getCuentasHija(req, res) {
    console.log("cuentas contables");
    const {company,ref}=req.params;
    // let companyId=req.params.company;
    try{
        accountingAccounts.find({Company:company, NumberRef:ref})
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


function getPruebas(req, res) {
    console.log("cuentas contables");
    const {company,ref}=req.params;
    // let companyId=req.params.company;
    try{
        accountingAccounts.find({Company:company})
        .populate({path:"AccountingAccount", model:"AccountingAccount"})
        .sort({NumberAccount:1})
        .then(cuentas => {
            const grouped = _.groupBy(cuentas, car => car.Group );
              
            //   console.log(grouped);
              var result = _(cuentas)
              .groupBy("Group")
              .map(function(v, group) {
                  _(v)
                  .groupBy("NumberRef")
                  .map(function(x,list){
                        return {
                            list,
                    FatherAccount: _.map(x, function(o) {
                    return {
                      cuenrta: o.NumberAccount,
                      ref:o.NumberRef
                      
                    };
                  }),
                }
                  })
              
              })
              .value();
            // const result = _(cuentas)
            // .groupBy('Group')
            // .map(group => ({
            //     ..._.omit(_.head(group), ['FatherAccount', 'NumberRef']),
            //     events: _.map(group, o => ({ id: o.FatherAccount, name: o.NumberRef }))
            // }))
            // .value();
            function groupBy( arr, prop ) {
                return Object.values( arr.reduce( ( aggregate, item ) => {
                  const val = item[prop];
                  if (!aggregate[val]) {
                    aggregate[val] = {
                      [prop]: val,
                      data: []
                    };
                  }
                  aggregate[val].data.push( item );
                  return aggregate;
                }, {} ) );
              }
            const output = _.mapValues(_.groupBy(cuentas, i =>  i.Group ),app => _.groupBy(app, i => i.NumberRef))
            const grouped2 = groupBy( cuentas, 'Group' )
            .map( item => ({ ...item, data: groupBy( item.data, 'NumberRef' ) }) );
            console.log(grouped2.data);
            res.status(200).send({grouped2});

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
    createAccountingAccounts,
    updateAccountingAccount,
    getAccountingAccountsGroups,
    desactivateAccount,
    getCuentasPadre,
    getCuentasHija,
    getPruebas
}