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
let orderRoutes= require('./app/routers/purchaseOrder');
let sellOrderRoutes = require ('./app/routers/order');
//let systemOpRoutes=require('./app/routers/sysOptions');
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
app.use('/api', catproductRoutes);
app.use('./api', ProductRoutes );
//app.use('/api',systemOpRoutes);
app.use('/api',orderRoutes)
app.use('/api', sellOrderRoutes);
app.use('./api', authCustomerRoutes);
// Create a Server
const server = app.listen(3050, function () {
 
  let host = server.address().address
  let port = server.address().port

  console.log("App listening at http://%s:%s", host, port); 
})