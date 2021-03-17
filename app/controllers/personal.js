const personal = require('../models/personal.model')

function getAllPersonal(req, res) {
    let personalId=req.params.id;
    let companyId=req.params.company;
    try{
        Personal.findAll({
            include:[
            {
                model:Company,
                attributes: ['ID_Company','Name'],
                on:{
                   
                    ID_Company: sequelize.where(sequelize.col("sys_companies.ID_Company"), "=", sequelize.col("crm_personal.ID_Company")),
                    
                 },
            },
            {
                model:Bank,
                attributes: ['Name'],
                on:{
                   
                    ID_Bank: sequelize.where(sequelize.col("crm_banks.ID_Bank"), "=", sequelize.col("crm_personal.ID_Bank")),
                    
                 },
            },
            {
                model:Personal,
                attributes: ['Name'],
                on:{
                   
                    ID_Personal: sequelize.where(sequelize.col("crm_Personals.ID_Personal"), "=", sequelize.col("crm_personal.ID_Personal")),
                    
                 },
            },
        ],
            where:{
                ID_Company: companyId,
                ID_User: personalId
            }
        })
        .then(personal => {
            res.status(200).json({personal});
          
        })
    }catch(error) {
        // imprimimos a consola
        console.log(error);

        res.status(500).json({
            message: "Error en query!",
            error: error
        });
    }    
}

function getPersonalGeneral(req,res){
    personal.find().populate({path: 'Company', model: 'Company'})
    .then(personal => {
        if(!personal){
            res.status(404).send({message:"No hay "});
        }else{
            res.status(200).send({personal})
        }
    });
}

function getPersonalRef(req,res){
    let personalId;
    try{
        Personal.findByPK(personalId,{
            attribute:[
                'nameRef1', 'phoneRef1', 'companyRef1' , 'addressRef1', 'nameRef2',
                'phoneRef2', 'companyRef2', 'addressRef2', 'nameRef3', 'phoneRef1',
                'companyRef1',
                'addressRef1'
            ]
        })
        .then(personal => {
            res.status(200).send({personal});
          
        })
    }catch(error) {
        // imprimimos a consola
        console.log(error);

        res.status(500).json({
            message: "Error en query!",
            error: error
        });
    }   
}

function getPersonalFamily(req,res){
    let personalId;
        try{
            Personal.findByPK(personalId,{
                attribute:[
                    'spouseName','numberOfChildren','dateOfUnion','civilStatus'
                ]
            })
            .then(personal => {
                res.status(200).send({personal});              
            })
        }catch(error) {
            // imprimimos a consola
            console.log(error);    
            res.status(500).json({
                message: "Error en query!",
                error: error
            });
        }   
}


function getPersonalWorkPlace(req,res){
    let personalId;
    try{
        Personal.findByPK(personalId,{
            attribute:[
                'workplace','branchOffice','addresWorkplace','officeWorkplace'
            ]
        })
        .then(personal => {
            res.status(200).send({personal});              
        })
    }catch(error) {
        // imprimimos a consola
        console.log(error);    
        res.status(500).json({
            message: "Error en query!",
            error: error
        });
    }   
}


function createPersonal(req, res) {

    const Personal = new personal();

    const {name, codPersonal, lastName, CellPhone , Phone,
    email, address, birthDate, Bank, bankAccount,Job, salary, Company, dui, nit,
gender, active, nationality, nameRef, phoneRef, companyRef, addressRef,
spouseName, numberOfChildren, dateOfUnion, civilStatus, workplace, 
branchOffice, addressWorkplace, officeWorkplace} = req.body
    
            Personal.codPersonal= codPersonal
            Personal.name= name;
            Personal.lastName= lastName;
            Personal.CellPhone= CellPhone;
            Personal.Phone= Phone;
            Personal.phoneRef= phoneRef;
            Personal.email= email;
            Personal.address= address;
            Personal.birthDate= birthDate;
            Personal.Bank= Bank;
            Personal.bankAccount= bankAccount;
            Personal.Job=Job;
            Personal.salary=salary;
            Personal.Company=Company;
            Personal.dui=dui;
            Personal.nit= nit;
            Personal.gender= gender;
            Personal.active= active;
            Personal.nationality= nationality;
            Personal.nameRef= nameRef;
            Personal.phoneRef= phoneRef;
            Personal.companyRef= companyRef;
            Personal.addressRef= addressRef;
            Personal.spouseName= spouseName;
            Personal.numberOfChildren= numberOfChildren;
            Personal.dateOfUnion= dateOfUnion;
            Personal.civilStatus= civilStatus;
            Personal.workplace= workplace;
            Personal.branchOffice= branchOffice;
            Personal.addresWorkplace= addressWorkplace;
            Personal.officeWorkplace= officeWorkplace;
            
            console.log(Personal);
            Personal.save((err, PersonalStored)=>{
                if(err){
                    res.status(500).send({message: err});
                }else{
                    if(!PersonalStored){
                        res.status(500).send({message: "Error"});
                    }else{
                        res.status(200).send({Personal: PersonalStored})
                    }
                }
            });

    
}

async function updatePersonal(req, res){
    let personalData = req.body;
    const params = req.params;

    personal.findByIdAndUpdate({_id: params.id}, personalData, (err, personalUpdate)=>{
        if(err){
            res.status(500).sen({message: "Error del Servidor."});
        } else {
            if(!personalUpdate){
                res.status(404).sen({message: "No hay"});
            }else{
                res.status(200).send({message: "Personal Actualizado"})
            }
        }
    })
}

async function desactivePersonal(req, res) {
    let personalId = req.params.id; 
  
    const {active} = req.body;  //
    try{
        
        await job.findByIdAndUpdate(personalId, {active}, (personalStored) => {
            if (!personalStored) {
                res.status(404).send({ message: "No se ha encontrado el personal." });
            }
            else if (active === false) {
                res.status(200).send({ message: "Personal desactivado correctamente." });
            }
        })
        
    } catch(error){
        res.status(500).json({
            message: "Error -> No se puede actualizar el usuario con ID = " + req.params.id,
            error: error.message
        });
    }
}

module.exports={
    getPersonalWorkPlace,
    getPersonalFamily,
    getPersonalRef,
    getPersonalGeneral,
    getAllPersonal,
    createPersonal,
    updatePersonal,
    desactivePersonal
}