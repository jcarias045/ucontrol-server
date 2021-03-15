const moongose = require('mongoose');


const ProfileSchema = moongose.Schema({
  Name: String,
  Description: String, 
})

const Profile = moongose.model('Profile', UserSchema)

export default Profile



// module.exports = (sequelize, Sequelize) => {
// 	const Profile = sequelize.define('sys_profile', {	
// 	  ID_Profile: {
//             type: Sequelize.INTEGER,
//             autoIncrement: true,
//             primaryKey: true
//     },
// 	  Name: {
// 			type: Sequelize.STRING
//       },
//       Description:{
//         type: Sequelize.STRING
//       }
      
   
// 	},{ //colocamos este parametro para que SEQUELIZE nos deje colocar el nombre del modelo y NO lo coloque plural
//         freezeTableName: true,
//         timestamps: false,
// 	  });
	
// 	return Profile;
// }