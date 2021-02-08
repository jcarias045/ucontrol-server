const env = require('./env.js');
 
const Sequelize = require('sequelize');
const sequelize = new Sequelize(env.database, env.username, env.password, {
  host: env.host,
  port: 3306,
  dialect: env.dialect,
  operatorsAliases: 0,
 
  pool: {
    max: env.max,
    min: env.pool.min,
    acquire: env.pool.acquire,
    idle: env.pool.idle
  }
});

const db = {};

db.Sequelize = Sequelize;

db.Customer = require('../models/customer.model.js')(sequelize, Sequelize);
db.User = require('../models/user.model.js')(sequelize, Sequelize);
db.Company = require('../models/company.model.js')(sequelize, Sequelize);
db.Profile = require('../models/profile.model.js')(sequelize, Sequelize);
db.Product = require('../models/product.model.js')(sequelize, Sequelize);
db.CatProduct = require('../models/catproduct.model.js')(sequelize, Sequelize);
db.Notes = require('../models/notes.model.js')(sequelize, Sequelize);
db.Inventory = require('../models/inventory.model.js')(sequelize, Sequelize);


//estableciendo relaciones entre las tablas sys_user y sys_profile
db.Profile.hasMany(db.User,{   
  foreignKey: 'ID_Profile' 
});

db.User.belongsTo(db.Profile, { 
  foreignKey: {
    name: 'ID_Profile'
  }
});

//estableciendo relaciones entre las tablas sys_user y sys_company
db.User.belongsTo(db.Company, {   
  foreignKey: {
    name: 'ID_Company'
  }
});

db.Company.hasMany(db.User,{
  foreignKey: 'ID_Company'
});




db.Product = require('../models/product.model.js')(sequelize, Sequelize);
db.CatProduct = require('../models/catproduct.model.js')(sequelize, Sequelize);
db.Notes = require('../models/notes.model.js')(sequelize, Sequelize);
db.Profile = require('../models/profile.model.js')(sequelize, Sequelize);
db.Product = require('../models/product.model.js')(sequelize, Sequelize);
db.CatProduct = require('../models/catproduct.model.js')(sequelize, Sequelize);
db.Notes = require('../models/notes.model.js')(sequelize, Sequelize);
db.Inventory = require('../models/inventory.model.js')(sequelize, Sequelize);
module.exports = db;