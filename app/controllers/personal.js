const db = require('../config/db.config.js');
const { Op } = require("sequelize");
const sequelize = require('sequelize');

const Personal = db.Personal;
const Job = db.Job;
const Bank = db.Bank;
const Company = db.Company;

function getAllPersonal(req, res) {
    try{
        Personal.findAll({
            where:{ID_Company: companyId}
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

module.exports={
    getPersonalWorkPlace,
    getPersonalFamily,
    getPersonalRef,
    getPersonalGeneral,
    getAllPersonal
}