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
db.Inventory = require('../models/inventory.model.js')(sequelize, Sequelize);
db.Supplier= require('../models/supplier.model')(sequelize, Sequelize);
db.PurchaseOrder= require('../models/purchaseOrder.model')(sequelize, Sequelize);
db.PurchaseDetails= require('../models/purchaseDetail.model')(sequelize, Sequelize);
db.Note = require('../models/note.model')(sequelize, Sequelize);
// db.CatProduct = require('../models/CatProduct.model')(sequelize, Sequelize);
db.Product = require('../models/product.model')(sequelize, Sequelize);




db.SysOptions=require('../models/systemOp.model')(sequelize, Sequelize);
db.ProfileOptions=require('../models/profileOptions.model')(sequelize, Sequelize);
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


//relaciones PurchaseOrder y Supplier
db.Supplier.hasMany(db.PurchaseOrder,{   
  foreignKey: 'ID_Supplier' 
});

db.PurchaseOrder.belongsTo(db.Supplier, { 
  foreignKey: {
    name: 'ID_Supplier'
  }
});

//relaciones purchaseorder y  user
db.User.hasMany(db.PurchaseOrder,{   
  foreignKey: 'ID_User' 
});

db.PurchaseOrder.belongsTo(db.User, { 
  foreignKey: {
    name: 'ID_User'
  }
});

//Relaciones purchase order y inventario 
db.Inventory.hasMany(db.PurchaseOrder,{   
  foreignKey: 'ID_Inventory' 
});

db.PurchaseOrder.belongsTo(db.Inventory, { 
  foreignKey: {
    name: 'ID_Inventory'
  }
});


//Relaciones purchase order y inventario 
// db.Inventory.belongsTo(db.Product,{   
//   foreignKey: 'ID_Products' 
// });

// db.Product.hasMany(db.Inventory, { 
//   foreignKey: {
//     name: 'ID_Products'
//   }
// });


//Relaciones purchase order y inventario 
db.PurchaseDetails.belongsTo(db.PurchaseOrder,{   
  foreignKey: 'ID_PurchaseOrder ' 
});

db.PurchaseOrder.hasMany(db.PurchaseDetails, { 
  foreignKey: {
    name: 'ID_PurchaseOrder '
  }
});

db.Product

module.exports = db;