const moongose = require('mongoose');
const Schema = moongose.Schema
const Company = require('./company.model')

const JobSchema = Schema({
  Name: String,
  Description: String,
  Estado: Boolean,
  Company: { type: Schema.ObjectId, 
             ref: "Company",
             // autopopulate: true,
          } 
})

module.exports = moongose.model('Job', JobSchema)




// module.exports = (sequelize, Sequelize) =>{

//     const Job = sequelize.define('crm_job',{
        
//         ID_Job: { 
//             type: Sequelize.INTEGER,
//             autoIncrement: true,
//             primaryKey: true
//         },
//         Name:{
//             type: Sequelize.STRING,
//         },
//         Description:{
//             type: Sequelize.INTEGER,
//         },
//         Estado:{
//             type: Sequelize.BOOLEAN
//         },
//         ID_Company:{
//             type: Sequelize.INTEGER,
// 		    foreign_key:true,
//         }
//     },{
// 		freezeTableName: true,
// 		timestamps: false,
// 	});
	
// 	return Job;
// }