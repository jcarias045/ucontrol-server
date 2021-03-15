var express = require('express');
var app=express();

var bodyParser = require('body-parser');

global.__basedir = __dirname;

const db= require('./app/config/db.config.js');

const Customer = db.Customer;
const User = db.User;


let userRoutes = require('./app/routers/user');
let customerRoutes = require('./app/routers/customer');
let authRoutes = require('./app/routers/auth');
let authCustomerRoutes = require('./app/routers/auth');
let companyRoutes=require('./app/routers/company');
let profileRoutes=require('./app/routers/profile');
let supplierRoutes= require('./app/routers/supplier');
let inventoryRoutes = require('./app/routers/inventory');
let noteRoutes = require('./app/routers/note');
let catproductRoutes = require('./app/routers/catproduct');
let ProductRoutes = require('./app/routers/product');
let noteCustomerRoutes = require('./app/routers/notecustomer');
let purchaseOrdersRoutes= require('./app/routers/purchaseOrder');
let systemOpRoutes=require('./app/routers/sysOptions');
let ProductNoteRoutes = require('./app/routers/noteproduct');
let SupplierNoteRoutes = require('./app/routers/notesupplier');
let BanksRoutes= require('./app/routers/bank');
let JobsRoutes = require('./app/routers/job');
let BrandsRoutes = require('./app/routers/brand');
let BookingCustomerRoutes = require('./app/routers/bookingcustomer');
let BookingSupplierRoutes = require('./app/routers/bookingsupplier');

let PurchaseDetails=require('./app/routers/purchaseDetail');
let orderRoutes= require('./app/routers/purchaseOrder');

let sellOrderRoutes = require ('./app/routers/order');
let taxesRoutes = require ('./app/routers/tax');
let measureRoutes = require ('./app/routers/measure');
let suppliersInvoicesRoutes = require ('./app/routers/purchaseInvoice');  //suppliers invoices para hacer referencia a facturas de los proveedores
//let systemOpRoutes=require('./app/routers/sysOptions');
let discountRoutes = require('./app/routers/discount');
// let paymenttimeRoutes = require('./app/routers/paymenttime');

let productEntries= require('./app/routers/productEntries');
let invoiceEntriesDetails=require('./app/routers/invoiceEntriesDetails');
let paymentsToSuppliersRoutes= require('./app/routers/paymentsToSuppliers');

let personalRoutes= require('./app/routers/personalroutes');
let rolesRoutes= require('./app/routers/roles.route');
const cors = require('cors');
const corsOptions = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200
}

app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(express.static('resources'));
app.use('/api', userRoutes);
app.use('/api', customerRoutes);
app.use('/api', authRoutes);
app.use('/api',supplierRoutes)
app.use('/api',companyRoutes);
app.use('/api',profileRoutes);
app.use('/api', companyRoutes);
app.use('/api', inventoryRoutes);
app.use('/api', noteRoutes);



app.use('/api',systemOpRoutes);

app.use('/api',PurchaseDetails);
app.use('/api',purchaseOrdersRoutes);

app.use('/api', catproductRoutes);
app.use('./api', ProductRoutes );
app.use('/api',systemOpRoutes);
app.use('/api',systemOpRoutes);
app.use('/api', catproductRoutes); 
app.use('/api', ProductRoutes );
//app.use('/api',systemOpRoutes);
app.use('/api',orderRoutes)
app.use('/api', sellOrderRoutes);
app.use('/api', authCustomerRoutes);
app.use('/api',taxesRoutes);
app.use('/api',measureRoutes);
app.use('/api',suppliersInvoicesRoutes);
app.use('/api', discountRoutes);
app.use('/api', noteCustomerRoutes);
app.use('/api', ProductNoteRoutes);
app.use('/api', SupplierNoteRoutes);
// // app.use('/api', paymenttimeRoutes);
// app.use('/api', paymenttimeRoutes);
app.use('/api', invoiceEntriesDetails);
app.use('/api', productEntries);
app.use('/api', paymentsToSuppliersRoutes);
app.use('/api', BanksRoutes);
app.use('/api', JobsRoutes);
app.use('/api', personalRoutes);
app.use('/api', BrandsRoutes);
app.use('/api', BookingCustomerRoutes);
app.use('/api', BookingSupplierRoutes);
app.use('/api',rolesRoutes);

// Create a Server
const server = app.listen(3050, function () {
 
  let host = server.address().address
  let port = server.address().port

  console.log("App listening at http://%s:%s", host, port); 
})