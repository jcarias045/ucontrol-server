var express = require('express');
var app=express();

var bodyParser = require('body-parser');

global.__basedir = __dirname;

const db= require('./app/config/db.config.js');

const Customer = db.Customer;
const User = db.User;
const Product = db.Product;
const Inventory = db.Inventory;

let userRoutes = require('./app/routers/user');
let customerRoutes = require('./app/routers/customer');
let authRoutes = require('./app/routers/auth');
let companyRoutes=require('./app/routers/company');
let profileRoutes=require('./app/routers/profile');
let productRoutes=require('./app/routers/product');
let catproudctRoutes=require('./app/routers/catproduct');
let notesRoutes=require('./app/routers/notes');
let inventoryRoutes = require('./app/routers/inventory');

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
app.use('/api',companyRoutes);
app.use('/api',profileRoutes);
app.use('/api', companyRoutes);
app.use('/api', productRoutes);
app.use('/api', catproudctRoutes);
app.use('/api', notesRoutes);
app.use('/api', inventoryRoutes);

// Create a Server
const server = app.listen(3050, function () {
 
  let host = server.address().address
  let port = server.address().port

  console.log("App listening at http://%s:%s", host, port); 
})