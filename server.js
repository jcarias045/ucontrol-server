const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');


require("dotenv").config({
    path: "./config.env"
})   

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
let SupplierType = require('./app/routers/suppliertype');
let BanksRoutes= require('./app/routers/bank');
let JobsRoutes = require('./app/routers/job');
let BrandsRoutes = require('./app/routers/brand');
let BookingCustomerRoutes = require('./app/routers/bookingcustomer');
let BookingSupplierRoutes = require('./app/routers/bookingsupplier');
let BookingUserRoutes = require('./app/routers/bookinguser');
let Bodega = require('./app/routers/bodega');
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
let supplierTypeRoutes= require('./app/routers/supplierType.route');
let notePersonal = require('./app/routers/notepersonal');
let bankAccount = require('./app/routers/bankaccount');
let document = require('./app/routers/document')
let documentProduct = require('./app/routers/documentProduct')
let documentPersonal = require('./app/routers/documentPersonal')
let documentUser = require('./app/routers/documentUser')

let customerQuoteRoutes= require('./app/routers/customerQuote');
let saleOrderRoutes= require('./app/routers/saleOrder.route');
let movementTypeRoutes= require('./app/routers/movementtype.route');
let customerInvoicesRoutes= require('./app/routers/customerInvoice.route');
let saleOrderInvoiceRoutes= require('./app/routers/saleorderinvoice.route');
let customerPaymentRoutes= require('./app/routers/customerpayments.route');

const app=express();

const cors = require('cors');
const corsOptions = {
    // origin: 'https://ucontrolsoftware.netlify.app',
    // origin: 'http://localhost:3000',
    origin:'https://master.d1qx17th3y62lk.amplifyapp.com',
    optionsSuccessStatus: 200
}

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method"
    );
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    res.header("Allow", "GET, POST, OPTIONS, PUT, DELETE");
    next();
  });




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
app.use('/api',BookingUserRoutes)
app.use('/api',rolesRoutes);
app.use('/api', Bodega);
app.use('/api',supplierTypeRoutes);
app.use('/api', SupplierType);
app.use('/api', notePersonal);
app.use('/api',bankAccount);
app.use('/api',customerQuoteRoutes);
app.use('/api',saleOrderRoutes);
app.use('/api',movementTypeRoutes);
app.use('/api',customerInvoicesRoutes);
app.use('/api',document);
app.use('/api',documentProduct);
app.use('/api',documentPersonal);
app.use('/api',documentUser);
app.use('/api',saleOrderInvoiceRoutes);
app.use('/api',customerPaymentRoutes);

if(process.env.NODE_ENV === 'production'){
    app.use('/api',express.static('./ucontrol-front_end/build'));
    // app.get('*',(req, res)=>{
    //     res.sendFile(path.join(__dirname,'ucontrol-front_end','build','index.html'))
    // })
}else{
    res.send(403, 'Sorry! you cant see that.');
}



// Create a Server
// const server = app.listen(3050, function () {
 
//   let host = server.address().address
//   let port = server.address().port

//   console.log("App listening at http://%s:%s", host, port); 
// })
const CONNECTION_URL='mongodb://sa_ucontrol:g3eX7amgBxVn3GhJ@cluster0-shard-00-00.juv1p.mongodb.net:27017,cluster0-shard-00-01.juv1p.mongodb.net:27017,cluster0-shard-00-02.juv1p.mongodb.net:27017/ucontrol?ssl=true&replicaSet=atlas-uvwby0-shard-0&authSource=admin&retryWrites=true&w=majority'
const PORT = process.env.PORT || 3050 ;
// const CONNECTION_URL='mongodb+srv://sa_ucontrol:g3eX7amgBxVn3GhJ@cluster0.juv1p.mongodb.net/ucontrol?retryWrites=true&w=majority'
mongoose.connect( process.env.CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true })
// mongoose.connect(CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true })

    .then( () => app.listen(PORT, () => {
        console.log(`Server Running on Port: http://localhost:3050`)
    }))
    .catch((error) => console.log(`${error} did not connect`))
    
    
    mongoose.set('useFindAndModify', false);