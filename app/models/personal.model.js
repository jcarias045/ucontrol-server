const  moongose = require('mongoose');
const Schema = moongose.Schema
const Company = require('../models/company.model')
const Bank  = require('../models/bank.model');
const Job = require('../models/job.model')
const User = require('../models/user.model')
const PersonalSchema = Schema({
    name: String,
    codPersonal: String,
    lastName: String,
    CellPhone: String,
    Phone: String,
    email: String,
    address: String,
    birthDate: Date,
    Bank: {  type: Schema.ObjectId, 
             ref: "Bank",
             // autopopulate: true,
          },
    bankAccount: String,
    Job: { type: Schema.ObjectId, 
            ref: "Job"},
    salary: Number,
    Company: { type: Schema.ObjectId, ref: "Company"},
    User: { type: Schema.ObjectId, ref: "User"},
    dui: String,
    nit: String,
    gender: String,
    active: Boolean,
    nationality: String,
    nameRef: String,
    phoneRef: String,
    companyRef: String,
    addressRef: String,
    nameRef2: String,
    phoneRef2: String,
    companyRef2: String,
    addressRef2: String,
    nameRef3: String,
    phoneRef3: String,
    companyRef3: String,
    addressRef3: String,
    spouseName: String,
    numberOfChildren: Number,
    dateOfUnion: Date,
    civilStatus: String,
    workplace: String,
    branchOffice: String,
    addressWorkPlace: String,
    officeWorkPlace: String,

})

 module.exports = moongose.model('Personal', PersonalSchema );



// module.exports = (sequelize, Sequelize) => {
// 	const Personal = sequelize.define('crm_personal', {	
//     ID_Personal:{
//       type: Sequelize.INTEGER,
//             autoIncrement: true,
//             primaryKey: true
//     },
//     codPersonal:{
//       type: Sequelize.STRING,
//     },
//     name:{
//       type: Sequelize.STRING
//     },
//     lastName:{
//       type: Sequelize.STRING
//     },
//     CellPhone:{
//       type: Sequelize.STRING
//     },
//     Phone:{
//       type: Sequelize.STRING
//     },
//     email:{
//       type: Sequelize.STRING
//     },
//     address:{
//       type: Sequelize.STRING
//     },
//     birthDate:{
//       type: Sequelize.DATE
//     },
//     ID_Bank:{
//       type: Sequelize.INTEGER,
//       foreign_key: true,
//     },
//     bankAccount:{
//       type: Sequelize.STRING
//     },
//     ID_Job:{
//       type: Sequelize.INTEGER,
//       foreign_key: true,
//     },
//     salary:{
//       type: Sequelize.INTEGER,
//     },
//     ID_Company:{
//       type: Sequelize.INTEGER,
//       foreign_key: true,
//     },
//     idNumber:{
//       type: Sequelize.STRING,
//     },
//     nit:{
//       type: Sequelize.STRING,
//     },
//     gender:{
//       type: Sequelize.STRING,
//     },
//     active:{
//       type: Sequelize.BOOLEAN,
//     },
//     nationality:{
//       type: Sequelize.STRING,
//     },
//     nameRef1:{
//       type: Sequelize.STRING,
//     },
//     phoneRef1:{
//       type: Sequelize.STRING,
//     },
//     companyRef1:{
//       type: Sequelize.STRING,
//     },
//     addressRef1:{
//       type: Sequelize.STRING,
//     },
//     nameRef2:{
//       type: Sequelize.STRING,
//     },
//     phoneRef2:{
//       type: Sequelize.STRING,
//     },
//     companyRef2:{
//       type: Sequelize.STRING,
//     },
//     addressRef2:{
//       type: Sequelize.STRING,
//     },
//     nameRef3:{
//       type: Sequelize.STRING,
//     },
//     phoneRef3:{
//       type: Sequelize.STRING,
//     },
//     companyRef3:{
//       type: Sequelize.STRING,
//     },
//     addressRef3:{
//       type: Sequelize.STRING,
//     },
//     spouseName:{
//       type: Sequelize.STRING,
//     },
//     numberOfChildren:{
//       type: Sequelize.INTEGER,
//     },
//     dateOfUnion:{
//       type: Sequelize.DATE,
//     },
//     civilStatus:{
//       type: Sequelize.STRING,
//     },
//     workplace:{
//       type: Sequelize.STRING,
//     },
//     branchOffice:{
//       type: Sequelize.STRING,
//     },
//     addresWorkplace	:{
//       type: Sequelize.STRING,
//     },
//     officeWorkplace:{
//       type: Sequelize.STRING,
//     }	  ,
//     ID_User: {
//       type: Sequelize.INTEGER,
//       foreign_key: true,
//     }  
// 	},{ //colocamos este parametro para que SEQUELIZE nos deje colocar el nombre del modelo y NO lo coloque plural
//         freezeTableName: true,
//         timestamps: false,
// 	  });
//     return Personal
//   }