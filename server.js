const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');


require("dotenv").config({
    path: "./config.env"
});

//importancion de los archivos que contienen las rutas de los controladores
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
let productOutputRoutes= require('./app/routers/productoutput.route');
let sectorRoutes= require('./app/routers/sector.route');
let docTypeRoutes= require('./app/routers/documentype.route');
let docCorrelativeRoutes= require('./app/routers/documentcorrelatives.route');
let conversionRoutes= require('./app/routers/conversion.route');
let customerAdvancedRoutes= require('./app/routers/customeradvance.route');
let cashRegisterRoutes= require('./app/routers/cashregister.route');
let cashAccountsRoutes= require('./app/routers/cashcounts.route');
let bankingTransactionRoutes= require('./app/routers/bankingtransaction.route');
let bankMovementRoutes= require('./app/routers/bankmovement.route');
let conceptRoutes= require('./app/routers/concept.route');
let cashMovementRoutes= require('./app/routers/cashmovement.route');
let cashTransactionRoutes= require('./app/routers/cashtransaction.route');
let checkbookRoutes= require('./app/routers/checkbook.route');
let writeCheckRoutes= require('./app/routers/writecheck.route');
let accountingAccountsRoutes= require('./app/routers/accountingaccounts.route');



const app=express();
//funcion cors
// const cors = require('cors');
// const corsOptions = {
//     // origin: 'https://ucontrolsoftware.netlify.app',
//     // origin: 'http://localhost:3000',
//     origin:'https://master.d1qx17th3y62lk.amplifyapp.com/#/',
//     optionsSuccessStatus: 200
// }
// app.use(cors(corsOptions));

//se utiliza para no tener problemas con CORS
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




app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//sección para habilitar las rutas (para que se tenga acceso desde la app donde se consuma la api)
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
// app.use('/api', authCustomerRoutes);
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
app.use('/api',productOutputRoutes);
app.use('/api',sectorRoutes);
app.use('/api',docTypeRoutes);
app.use('/api',docCorrelativeRoutes);
app.use('/api',conversionRoutes);
app.use('/api',customerAdvancedRoutes);
app.use('/api',cashAccountsRoutes);
app.use('/api',cashRegisterRoutes);
app.use('/api',bankingTransactionRoutes);
app.use('/api',bankMovementRoutes);
app.use('/api',conceptRoutes);
app.use('/api',cashMovementRoutes);
app.use('/api',cashTransactionRoutes);
app.use('/api',checkbookRoutes);
app.use('/api',writeCheckRoutes);
app.use('/api',accountingAccountsRoutes);



if(process.env.NODE_ENV === 'production'){
    app.use('/api',express.static('./ucontrol-front_end/build'));
    // app.get('*',(req, res)=>{
    //     res.sendFile(path.join(__dirname,'ucontrol-front_end','build','index.html'))
    // })
}else{
    res.send(403, 'Sorry! you cant see that.');
}

//**********CONEXION A BASE DE DATOS ****************************

//url para conectarse de manera local a la base de datos (en caso contrario comentar la url)
<<<<<<< HEAD
// const CONNECTION_URL='mongodb://ucontrol_sa:3Du9BSi3Bh3XTXU9@cluster0-shard-00-00.7t1pq.mongodb.net:27017,cluster0-shard-00-01.7t1pq.mongodb.net:27017,cluster0-shard-00-02.7t1pq.mongodb.net:27017/ucontrol?ssl=true&replicaSet=atlas-ap7dbv-shard-0&authSource=admin&retryWrites=true&w=majority'
=======
//const CONNECTION_URL='mongodb://ucontrol_sa:3Du9BSi3Bh3XTXU9@cluster0-shard-00-00.7t1pq.mongodb.net:27017,cluster0-shard-00-01.7t1pq.mongodb.net:27017,cluster0-shard-00-02.7t1pq.mongodb.net:27017/ucontrol?ssl=true&replicaSet=atlas-ap7dbv-shard-0&authSource=admin&retryWrites=true&w=majority'
>>>>>>> origin/master

const PORT = process.env.PORT || 3050 ;

//habilitar esta conxion cuando se haga el deploy y comentar la que se encuentra abajo 
//hace referencia a variables colocadas en heroku

mongoose.connect( process.env.CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true })

//para trabajar de manera local habilitar esta conexion Y NO OLVIDE COMENTAR LA DE ARRIBA
<<<<<<< HEAD
// mongoose.connect(CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true })
=======
//mongoose.connect(CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true })
>>>>>>> origin/master

 //NOTA SIEMPRE TIENE QUE COMENTAR ALGUNA DE LAS DOS DEPENDIENDO LAS SITUACIONES PLANTEADAS ANTERIORMENTE

    .then( () => app.listen(PORT, () => {
        console.log(`Server Running on Port: http://localhost:3050`)
    }))
    .catch((error) => console.log(`${error} did not connect`))


    mongoose.set('useFindAndModify', false);