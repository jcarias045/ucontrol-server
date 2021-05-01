const personal = require('../models/personal.model')

function getAllPersonal(req, res) {
    personal.find().populate({path: 'Company', model: 'Company'}).
    populate({path: 'Job', model: 'Job'}).
    populate({path: 'Bank', model: 'Bank'})
    .then(personal => {
        if(!personal){
            res.status(404).send({message:"No hay "});
        }else{
            res.status(200).send({personal})
        }
    });
}

function getPersonalGeneral(req,res){
    
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
gender, active, nationality, nameRef, phoneRef, companyRef, 
addressRef,nameRef2, phoneRef2, companyRef2, addressRef2,
nameRef3, phoneRef3, companyRef3, addressRef3,
spouseName, numberOfChildren, dateOfUnion, civilStatus, workplace, 
branchOffice, addressWorkPlace, officeWorkPlace} = req.body
    
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
            Personal.nameRef2= nameRef2;
            Personal.phoneRef2= phoneRef2;
            Personal.companyRef2= companyRef2;
            Personal.addressRef2= addressRef2;
            Personal.nameRef3= nameRef3;
            Personal.phoneRef3= phoneRef3;
            Personal.companyRef3= companyRef3;
            Personal.addressRef3= addressRef3;
            Personal.spouseName= spouseName;
            Personal.numberOfChildren= numberOfChildren;
            Personal.dateOfUnion= dateOfUnion;
            Personal.civilStatus= civilStatus;
            Personal.workplace= workplace;
            Personal.branchOffice= branchOffice;
            Personal.addressWorkPlace= addressWorkPlace;
            Personal.officeWorkPlace= officeWorkPlace;
            let compania = Personal.Company;
            console.log(compania);
            let codigo = Personal.codPersonal;
            console.log(codigo);
            console.log(Personal);
            personal.findOne({Company: compania, codPersonal: codigo})
            .then(colaboradores=>{
                console.log(colaboradores);
                if(!colaboradores){
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
            }else{
                res.status(500).send({message: "Error Personal ya Existe"}); 
            }  
        })

    
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
        
        await personal.findByIdAndUpdate(personalId, {active}, (personalStored) => {
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