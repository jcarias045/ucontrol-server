const db = require('../config/db.config.js');
const { Op } = require("sequelize");
const sequelize = require('sequelize');

const Personal = db.Personal;
const Job = db.Job;
const Bank = db.Bank;
const Company = db.Company;

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
                model:Job,
                attributes: ['Name'],
                on:{
                   
                    ID_Job: sequelize.where(sequelize.col("crm_jobs.ID_Job"), "=", sequelize.col("crm_personal.ID_Job")),
                    
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
    let personalId;
    try{
        Personal.findByPK(personalId,{
            attribute:[
                'ID_Personal','codPersonal','name','lastName','cellPhone','Phone', 
                'email','address','birthDate','ID_Bank','bankAccount','ID_Job', 'salary',
                'ID_Company' , 'idNumber' , 'nit' , 'gender' , 'active' , 'nationality'
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
    let personal = {};
     console.log(req.body);
    try{

            personal.codPersonal=req.body.codPersonal
            personal.name=req.body.name;
            personal.lastName=req.body.lastName;
            personal.CellPhone=req.body.CellPhone;
            personal.Phone=req.body.Phone;
            personal.phoneRef1=req.body.phoneRef1;
            personal.email=req.body.email;
            personal.address=req.body.address;
            personal.birthDate=req.body.birthDate;
            personal.ID_Bank=req.body.ID_Bank;
            personal.bankAccount=req.body.bankAccount;
            personal.ID_Job=req.body.ID_Job;
            personal.salary=req.body.salary;
            personal.ID_Company=req.body.ID_Company;
            personal.idNumber=req.body.idNumber;
            personal.nit=req.body.nit;
            personal.gender=req.body.gender;
            personal.active=1;
            personal.nationality=req.body.nationality;
            personal.nameRef1=req.body.nameRef1;
            personal.phoneRef1=req.body.phoneRef1;
            personal.companyRef1=req.body.companyRef1;
            personal.addressRef1=req.body.addressRef1;
            personal.nameRef2=req.body.nameRef2;
            personal.phoneRef2=req.body.phoneRef2;
            personal.companyRef2=req.body.companyRef2;
            personal.addressRef2=req.body.addressRef2;
            personal.nameRef3=req.body.nameRef3;
            personal.phoneRef3=req.body.phoneRef3;
            personal.companyRef3=req.body.companyRef3;
            personal.addressRef3=req.body.addressRef3;
            personal.spouseName=req.body.spouseName;
            personal.numberOfChildren=req.body.numberOfChildren;
            personal.dateOfUnion=req.body.dateOfUnion;
            personal.civilStatus=req.body.civilStatus;
            personal.workplace=req.body.workplace;
            personal.branchOffice=req.body.branchOffice;
            personal.addresWorkplace=req.body.addressWorkplace;
            personal.officeWorkplace=req.body.officeWorkplace;
            personal.ID_User=req.body.ID_User;
       
        // Save to MySQL database
       Personal.create(personal)
      .then( result => {    
        if(result){
            res.status(200).json(result);
        }
        else{
            res.status(500).json({message:"error"});
        }
       console.log(result);
        
      }).catch(err => {
          console.log(err);
    
    });  

    }
      
    catch(error){
        console.log(error);
        res.status(500).json({
            message: "Fail!",
            error: error.message
        });
    }
}

async function updatePersonal(req, res){
    let personalId = req.params.id; 
    console.log(personalId);
    
    try{
        let personal = await Personal.findByPk(personalId);
        
        if(!personal){
           // retornamos el resultado al cliente
            res.status(404).json({
                message: "No se encuentra el cliente con ID = " + personalId,
                error: "404"
            });
        } else {    
            // actualizamos nuevo cambio en la base de datos, definición de
            let updatedObject = { 
                codPersonal:req.body.codPersonal,
                name:req.body.name,
                lastName:req.body.lastName,
                CellPhone:req.body.CellPhone,
                Phone:req.body.Phone,
                phoneRef1:req.body.phoneRef1,
                email:req.body.email,
                address:req.body.address,
                birthDate:req.body.birthDate,
                ID_Bank:req.body.ID_Bank,
                bankAccount:req.body.bankAccount,
                ID_Job:req.body.ID_Job,
                salary:req.body.salary,
                ID_Company:req.body.ID_Company,
                idNumber:req.body.idNumber,
                nit:req.body.nit,
                gender:req.body.gender,
                nationality:req.body.nationality,
                nameRef1:req.body.nameRef1,
                phoneRef1:req.body.phoneRef1,
                companyRef1:req.body.companyRef1,
                addressRef1:req.body.addressRef1,
                nameRef2:req.body.nameRef2,
                phoneRef2:req.body.phoneRef2,
                companyRef2:req.body.companyRef2,
                addressRef2:req.body.addressRef2,
                nameRef3:req.body.nameRef3,
                phoneRef3:req.body.phoneRef3,
                companyRef3:req.body.companyRef3,
                addressRef3:req.body.addressRef3,
                spouseName:req.body.spouseName,
                numberOfChildren:req.body.numberOfChildren,
                dateOfUnion:req.body.dateOfUnion,
                civilStatus:req.body.civilStatus,
                workplace:req.body.workplace,
                branchOffice:req.body.branchOffice,
                addresWorkplace:req.body.addressWorkplace,
                officeWorkplace:req.body.officeWorkplace,
                ID_User:req.body.ID_User,    
            }
            console.log(updatedObject);    //agregar proceso de encriptacion
            let result = await Personal.update(updatedObject,
                              { 
                                      
                                where: {ID_Personal : personalId}
                              }
                            );

            // retornamos el resultado al cliente
            if(!result) {
                res.status(500).json({
                    message: "Error -> No se puede actualizar el usuario con ID = " + req.params.id,
                    error: "No se puede actualizar",
                });
            }

            res.status(200).json(result);
        }
    } catch(error){
        console.log(error);
        res.status(500).json({
            message: "Error -> No se puede actualizar el usuario con ID = " + req.params.id,
            error: error.message
        });
    }
}

async function desactivePersonal(req, res) {
    let personalId = req.params.id; 
    const {active} = req.body;  //
    console.log(active);
    try{
        let user = await Personal.findByPk(personalId);
        
        if(!user){
           // retornamos el resultado al cliente
            res.status(404).json({
                message: "No se encuentra el registro con ID = " + personalId,
                error: "404"
            });
        } else {    
            // actualizamos nuevo cambio en la base de datos, definición de
            let updatedObject = { 
               
                active:active        
            }
            console.log(updatedObject);    //agregar proceso de encriptacion
            let result = await Personal.update(updatedObject,
                              { 
                                returning: true,                
                                where: {ID_Personal: personalId},
                                attributes:['active' ]
                              }
                            );

            // retornamos el resultado al cliente
            if(!result) {
                res.status(500).json({
                    message: "Error -> No se puede actualizar el usuario con ID = " + req.params.id,
                    error: "No se puede actualizar",
                });
            }

            res.status(200).json(result);
        }
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