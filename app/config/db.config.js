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
db.Product = require('../models/product.model.js')(sequelize, Sequelize);
db.Order = require('../models/order.model')(sequelize, Sequelize);
db.CatProduct = require('../models/catpoduct.model')(sequelize, Sequelize);



db.Measure= require('../models/measure.model')(sequelize, Sequelize);
db.SysOptions=require('../models/systemOp.model')(sequelize, Sequelize);
db.ProfileOptions=require('../models/profileOptions.model')(sequelize, Sequelize);
db.Taxes=require('../models/taxes.model')(sequelize, Sequelize);
db.PurchaseInvoice=require('../models/purchaseInvoice.model')(sequelize, Sequelize);
db.PurchaseInvoiceDetails=require('../models/purchaseInvoiceDetails.model')(sequelize, Sequelize);

db.SysOptions=require('../models/systemOp.model')(sequelize, Sequelize);
db.ProfileOptions=require('../models/profileOptions.model')(sequelize, Sequelize);
// db.SysOptions=require('../models/systemOp.model')(sequelize, Sequelize);
// db.ProfileOptions=require('../models/profileOptions.model')(sequelize, Sequelize);
db.Discount = require('../models/discount.model')(sequelize, Sequelize);
db.PaymentTime = require('../models/paymenttime.model')(sequelize, Sequelize);
db.InvoiceTaxes= require('../models/invoiceTaxes.model')(sequelize, Sequelize);
db.ProductEntries= require('../models/productEntries.model')(sequelize, Sequelize);
db.InvoiceEntriesDetails= require('../models/invoiceEntriesDetails.model')(sequelize, Sequelize); //detalle de la entrada respecto a detalle de factura
db.PaymentMethods= require('../models/paymentMethods.model')(sequelize, Sequelize);
db.PaymentToSupplier= require('../models/paymentstoSuppliers.model')(sequelize, Sequelize);
db.PaymentToSupplierDetails= require('../models/paymenttoSupplierDetail.model')(sequelize, Sequelize);

//estableciendo relaciones entre las tablas sys_user y sys_profile
db.Profile.hasMany(db.User,{   
  foreignKey: 'ID_Profile' 
});

db.User.belongsTo(db.Profile, { 
  foreignKey: {
    name: 'ID_Profile'
  }
});

// estableciendo relacion entre las tablas customer y user
db.User.hasMany(db.Customer,{
  foreignkey: 'ID_User'
});

db.Customer.belongsTo(db.User,{
  foreignKey:{
    name:'ID_User'
  }
})
//estableciendo relacion entre las tablas customer y user


//estableciendo relacion entre compañia y descuento

db.Company.hasMany(db.Discount, {
  foreignKey: 'ID_Company'
});

db.Discount.belongsTo(db.Company,{
  foreignKey:{
    name: 'ID_Company'
  }
});

//estableciendo relacion entre company y paymenttime
db.Company.hasMany(db.PaymentTime, {
  foreignKey: 'ID_Company'
});

db.PaymentTime.belongsTo(db.Company,{
  foreignKey:{
    name: 'ID_Company'
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
db.User.belongsTo(db.PurchaseOrder,{   
  foreignKey: 'ID_User' 
});

db.PurchaseOrder.hasMany(db.User, { 
  foreignKey: {
    name: 'ID_User'
  }
});

//Relaciones purchase order y inventario 
// db.Inventory.hasMany(db.PurchaseOrder,{   
//   foreignKey: 'ID_Inventory' 
// });

// db.PurchaseOrder.belongsTo(db.Inventory, { 
//   foreignKey: {
//     name: 'ID_Inventory'
//   }
// });


//Relaciones purchase order y inventario 
db.Inventory.hasMany(db.Product,{   
  foreignKey: 'ID_Products' ,

});

db.Product.belongsTo(db.Inventory, { 
  foreignKey: {
    name: 'ID_Products'
  }
});


//Relaciones purchase order y detalle
db.PurchaseDetails.hasMany(db.PurchaseOrder,{   
  foreignKey: 'ID_PurchaseOrder' 
});

db.PurchaseOrder.belongsTo(db.PurchaseDetails, { 
  foreignKey: {
    name: 'ID_PurchaseOrder'
  }
});


db.Supplier.belongsTo(db.Product,{   
  foreignKey: 'ID_Supplier' 
});

db.Product.hasMany(db.Supplier, { 
  foreignKey: {
    name: 'ID_Supplier'
  }
});

//Relaciones entre order y customers
db.Customer.hasMany(db.Order,{   
  foreignKey: 'ID_Customer' 
});

db.Order.belongsTo(db.Customer, { 
  foreignKey: {
    name: 'ID_Customer'
  }
});


//Relacion entre order y user
db.User.hasMany(db.Order,{   
  foreignKey: 'ID_User' 
});

db.Order.belongsTo(db.User, { 
  foreignKey: {
    name: 'ID_User'
  }
});

db.Company.hasMany(db.Product,{   
  foreignKey: 'ID_Company' 
});

db.Product.belongsTo(db.Company, { 
  foreignKey: {
    name: 'ID_Company'
  }
});

db.CatProduct.hasMany(db.Product,{   
  foreignKey: 'ID_CatProduct' 
});

db.Product.belongsTo(db.CatProduct, { 
  foreignKey: {
    name: 'CatProduct'
  }
});

db.Company.hasMany(db.Product,{   
  foreignKey: 'ID_Company' 
});

db.Product.belongsTo(db.Company, { 
  foreignKey: {
    name: 'ID_Company'
  }
});

db.Company.hasMany(db.Product,{   
  foreignKey: 'ID_Company' 
});

db.Product.belongsTo(db.Company, { 
  foreignKey: {
    name: 'ID_Company'
  }
});





db.PurchaseDetails.hasMany(db.Inventory,{
  foreignKey: {
    name: 'ID_Inventory'
  }
});

db.Inventory.belongsTo(db.PurchaseDetails,{
  foreignKey: {
    name: 'ID_Inventory'
  }
});

db.Product.hasMany(db.Measure,{   
  foreignKey: 'ID_Measure' 
});

db.Measure.belongsTo(db.Product, { 
  foreignKey: {
    name: 'ID_Measure'
  }
});

db.PurchaseOrder.hasMany(db.PurchaseInvoice,{   
  foreignKey: 'ID_PurchaseOrder' 
});

db.PurchaseInvoice.belongsTo(db.PurchaseOrder, { 
  foreignKey: {
    name: 'ID_PurchaseOrder'
  }
});

db.PurchaseInvoice.hasMany(db.PurchaseInvoiceDetails,{   
  foreignKey: 'ID_PurchaseInvoice' 
});

db.PurchaseInvoiceDetails.belongsTo(db.PurchaseInvoice, { 
  foreignKey: {
    name: 'ID_PurchaseInvoice'
  }
});

db.PurchaseInvoice.hasMany(db.Supplier,{   
  foreignKey: 'ID_Supplier' 
});

db.Supplier.belongsTo(db.PurchaseInvoice, { 
  foreignKey: {
    name: 'ID_Supplier'
  }
});

db.PurchaseInvoiceDetails.hasMany(db.Inventory,{
  foreignKey: {
    name: 'ID_Inventory'
  }
});

db.Inventory.belongsTo(db.PurchaseInvoiceDetails,{
  foreignKey: {
    name: 'ID_Inventory'
  }
});


db.ProductEntries.belongsTo(db.InvoiceEntriesDetails,{
  foreignKey: {
    name: 'ID_ProductEntry'
  }
});

db.InvoiceEntriesDetails.hasMany(db.ProductEntries,{
  foreignKey: {
    name: 'ID_ProductEntry'
  }
});

db.PurchaseInvoiceDetails.belongsTo(db.InvoiceEntriesDetails,{
  foreignKey: {
    name: 'ID_PurchaseInvoiceDetail'
  }
});

db.InvoiceEntriesDetails.hasMany(db.PurchaseInvoiceDetails,{
  foreignKey: {
    name: 'ID_PurchaseInvoiceDetail'
  }
});


db.PaymentMethods.belongsTo(db.PaymentToSupplier,{
  foreignKey: {
    name: 'ID_PaymentMethods'
  }
});

db.PaymentToSupplier.hasMany(db.PaymentMethods,{
  foreignKey: {
    name: 'ID_PaymentMethods'
  }
});

db.PaymentToSupplierDetails.hasMany(db.PaymentToSupplier,{
  foreignKey: {
    name: 'ID_Payments'
  }
});

db.PaymentToSupplier.belongsTo(db.PaymentToSupplierDetails,{
  foreignKey: {
    name: 'ID_Payments'
  }
})

module.exports = db;