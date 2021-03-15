const moongose = require('mongoose');
import Company from './company.model';

const JobSchema = moongose.Schema({
  Name: String,
  Description: String,
  Estado: Boolean,
  Company: Company 
})

const Job = moongose.model('Job', JobSchema)

export default Job


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