const moment=require("moment");
const CustomerQuote = require("../models/customerquotes.model");
const QuoteDetails= require("../models/customerquotesdetails.model");
const Company= require("../models/company.model");
const Sector= require("../models/sector.model");
const PDFDocument = require('pdfkit-construct');
const fs =require("fs");
const path=require("path");


function getCustomerQuote(req, res){
    const { id,company } = req.params;
    CustomerQuote.find({User:id}).populate({path: 'Customer', model: 'Customer',populate:{ path:'Discount', model:'Discount'}})
    .sort({CodCustomerQuote:-1})
    .then(quotes => {
        if(!quotes){
            res.status(404).send({message:"No hay "});
        }else{
            
            res.status(200).send({quotes})
        }
    });
}


async function createCustomerQuote(req,res){
    
    const cotizacion= new CustomerQuote();

    moment.locale();
    let nuevows = moment().format('L');
    let creacion = moment().format('DD/MM/YYYY');
    
   
    const {Customer,CustomerName,Description,Total,User,companyId} = req.body;

    const quoteDetail=req.body.details;
    const detalle=[];
    
    let codigo=0;

    let codigoQuote=await CustomerQuote.findOne().sort({CodCustomerQuote:-1})
    .populate({path: 'Customer', model: 'Customer', match:{Company: companyId}}).then(function(doc){
            if(doc){
                    if(doc.CodCustomerQuote!==null){
                return(doc.CodCustomerQuote)
            }
        }
       
    });

    if(!codigoQuote){
        codigo =1;
    }else {codigo=codigoQuote+1}
    console.log(codigo);
    cotizacion.Customer=Customer;
    cotizacion.Total=Total;
    cotizacion.Active=true;
    cotizacion.User=User,
    cotizacion.CreationDate= creacion;
    cotizacion.State='Abierta'; 
    cotizacion.Description=Description; 
    cotizacion.CodCustomerQuote=codigo;
    cotizacion.CustomerName=CustomerName;
    cotizacion.DateUpdate= creacion;
    console.log(cotizacion);
    cotizacion.save((err, cotizacionStored)=>{
        if(err){
            res.status(500).send({message: err});

        }else {
            if(!cotizacionStored){
                res.status(500).send({message: "Error al crear el nuevo usuario."});
                console.log(cotizacionStored);
            }
            else{
                let quoteId=cotizacionStored._id;
             
                if(quoteId){
                    
                    quoteDetail.map(async item => {
                    detalle.push({
                        ProductName:item.Name,
                        CustomerQuote:quoteId,
                        Quantity:parseFloat(item.Quantity) ,
                        Discount:parseFloat(item.Discount),
                        Price:parseFloat(item.Price),
                        Inventory :item.Inventory,
                        Measure:item.Measures,
                        CodProduct:item.codproducts,
                        SubTotal: parseFloat(item.Quantity * item.Price)-parseFloat(item.Quantity * item.Price)*parseFloat(item.Discount/100),
                        // Priceiva:parseFloat(item.Priceiva)
                        OnRequest:false,
                        GrossSellPrice:parseFloat(item.GrossSellPrice)
                    })
                 });
                 console.log(detalle);
                    if(detalle.length>0){
                        QuoteDetails.insertMany(detalle)
                        .then(function () {
                            
                            console.log("INSERTADOS");
                            
                        })
                        .catch(function (err) {
                            console.log(err);
                        });
                    }
                }
                res.status(200).send({orden: cotizacionStored})
              
            }
        }
    })
}

function getCustomerQuotesDetails(req, res){
    let customerQuoteId = req.params.id; 
    console.log("DETALLE DE LA COTIZACION",customerQuoteId );
    QuoteDetails.find({CustomerQuote:customerQuoteId}).populate({path: 'Inventory', model: 'Inventory',
    populate:({path: 'Bodega', model: 'Bodega', match:{Name:'Principal'}}),
    populate:({path: 'Product',model:'Product',populate:{path: 'Measure',model:'Measure'}})})
    
    .then(quote => {
        if(!quote){
            res.status(404).send({message:"No hay "});
        }else{
            res.status(200).send({quote})
        }
    });
}

async function updateCustomerQuote(req, res){
    let quoteId = req.params.id;
    let quoteDetail=req.body.details;
    let detailsAnt=req.body.ordenAnt;
    let updateQuote={};

    let now= new Date();
    let creacion=now.toISOString().substring(0, 10);
    updateQuote.Description=req.body.Description;
    updateQuote.CustomerName=req.body.CustomerName;
    updateQuote.Customer=req.body.Customer;

    updateQuote.Total=parseFloat(req.body.Total).toFixed(2);
    let detallePrev={};
    let detalle=[];
    CustomerQuote.updateOne({_id:quoteId},updateQuote,(err,purchaseUpdate)=>{
        if(err){
            res.status(500).send({message: "Error del Servidor."});
            console.log(err);
        } else {
            if(!purchaseUpdate){
                res.status(404).send({message: "No se actualizo registro"});
            }else{
              
                if(purchaseUpdate.nModified>0){
                     CustomerQuote.findByIdAndUpdate({_id:quoteId},{DateUpdate:creacion},(err,purchaseUpdate)=>{});
                }
               
                if(detailsAnt.length > 0) {
                     detailsAnt.map(async item => {  
                        detallePrev.ProductName=item.ProductName;
                        detallePrev.Quantity=parseFloat(item.Quantity);
                        detallePrev.Discount=parseFloat(item.Discount);
                        detallePrev.Price=parseFloat(item.Price);
                        detallePrev.Inventory =item.Inventory._id;
                        detallePrev.SubTotal =parseFloat(item.SubTotal);
                        // detallePrev.Priceiva=parseFloat(item.Priceiva)
                       
                        QuoteDetails.updateMany({_id: item._id ,CustomerQuote:quoteId},detallePrev)
                            .then(function () {
                                
                                console.log("Actualizados");
                                
                            })
                            .catch(function (err) {
                                console.log(err);
                            });
                       });
                        console.log(detallePrev);
                       
                }

                if(quoteDetail.length>0){
                    quoteDetail.map(async item => {
                        detalle.push({
                            ProductName:item.Name,
                            CustomerQuote:quoteId,
                            Quantity:parseFloat(item.Quantity) ,
                            Discount:parseFloat(item.Discount),
                            Price:parseFloat(item.Price),
                            Inventory :item.Inventory,
                            SubTotal:item.total,
                            // Priceiva:parseFloat(item.Priceiva)
                        })
                     });
                     console.log(detalle);
                        if(detalle.length>0){
                            QuoteDetails.insertMany(detalle)
                            .then(function () {
                                
                                console.log("INSERTADOS");
                                
                            })
                            .catch(function (err) {
                                console.log(err);
                            });
                        }
                }
                res.status(200).send(purchaseUpdate)
            }
        }
    })
}

async function deleteQuoteDetail(req, res){
    console.log(req.params.id);
    let detalleid=req.params.id;
    QuoteDetails.findByIdAndRemove(detalleid, (err, userDeleted) => {
        if (err) {
          res.status(500).send({ message: "Error del servidor." });
        } else {
          if (!userDeleted) {
            res.status(404).send({ message: "Detalle no encontrado" });
          } else {
            res
              .status(200)
              .send({ userDeleted});
          }
        }
      });

}


async function changeQuoteState(req, res){
    let purchaseId = req.params.id;
    let state=req.body;
    console.log(state);
    CustomerQuote.findByIdAndUpdate({_id:purchaseId},state,(err,purchaseUpdate)=>{
        if(err){
            res.status(500).send({message: "Error del Servidor."});
            
        } else {
            if(!purchaseUpdate){
                res.status(404).send({message: "No se actualizo registro"});
            }
            else{
                res.status(200).send(purchaseUpdate)
            }
        }
   
    })
}

function getCustomerAllQuotesDetails(req, res){

    QuoteDetails.find().populate({path: 'Inventory', model: 'Inventory',
    populate:({path: 'Bodega', model: 'Bodega', match:{Name:'Principal'}}),
    populate:({path: 'Product',model:'Product',populate:{path: 'Measure',model:'Measure'}})})
    .populate({path: 'CustomerQuote', model: 'CustomerQuote'})
    .then(quote => {
        if(!quote){
            res.status(404).send({message:"No hay "});
        }else{
            res.status(200).send({quote})
        }
    });
}

function getQuotesbyCustomers(req, res){
    let supplierId = req.params.id; 
    let companyId = req.params.company;
    let f1=new Date(req.params.fecha1);
    let f2=new Date(req.params.fecha2);
    var ObjectID = require('mongodb').ObjectID
    let antCod=0;
    let now= new Date();
    let fecha=now.getTime();
    var date = new Date(fecha);
   
    // date.setMonth(date.getMonth() - 1/2);
    date.setDate(date.getDate() -15);
    let fecha1=now.toISOString().substring(0, 10);
    let fecha2=date.toISOString().substring(0, 10);
    console.log("gola");
    try{

        CustomerQuote.aggregate([
            {  $match: {Customer:ObjectID(supplierId)}},
        
            {
                $lookup: {
                    from:"customerquotedetails",
                   
                    let:{ordenId:"$_id" },
                    pipeline: [
                        { $match:
                            { $expr:
                               
                                    { $eq: [ "$CustomerQuote",  "$$ordenId" ] }
                                   
                                }
                            }
    
                    ],
                    as:"detalles",
                    
                },
                
                  
                
            }, 
            
        ]).then(result => {
            var order = result.filter(function (item) {
                let fecha=new Date(item.CreationDate);
                console.log("creacion",fecha);
                console.log("f1",f1);
                console.log("f2",f2);
                return fecha>=f2 && fecha<=f1;
              });
            res.status(200).send(order);
            
        })
    }catch(error) {
        // imprimimos a consola
        console.log(error);

        res.status(500).json({
            message: "Error!",
            error: error
        });
    }
}

async function ImprimirCotizacionPDF(req,res) {

    const {id} = req.params.id;

    let cotizacion = await CustomerQuote.findOne({_id: req.params.id})
    .populate({path: 'Customer', model: 'Customer'
    ,populate:{path: 'Sector', model: 'Sector'}})
    .populate({path: 'User', model: 'User',populate:{path:'Company', model:'Company'}})
    .then((facturas1) =>{ return facturas1}).catch(err =>{console.log("error en proveedir");return err});
    console.log(cotizacion);
    console.log("terminaCotizacion");

    let Sector1 = cotizacion.User.Company.ActividadPrimaria
    console.log(Sector1);
    let actividad1 = await Sector.findOne({_id: Sector1})
    .then((actividad) =>{ return actividad}).catch(err =>{console.log("error en proveedir");return err});
    console.log(actividad1);
    console.log("finaliza primero");

    let Sector2 = cotizacion.User.Company.ActividadSecundaria
    console.log(Sector2);
    let actividad2 = await Sector.findOne({_id: Sector2})
    .then((actividad) =>{ return actividad}).catch(err =>{console.log("error en proveedir");return err});
    console.log(actividad2);
    console.log("Finaliza Segundo");

    let Sector3 = cotizacion.User.Company.ActividadTerciaria
    console.log(Sector3);
    let actividad3 = await Sector.findOne({_id: Sector3})
    .then((actividad) =>{ return actividad}).catch(err =>{console.log("error en proveedir");return err});
    console.log(actividad3);
    console.log("actividad3");
    console.log(cotizacion._id);
    let detalles = await  QuoteDetails.findOne({CustomerQuote:cotizacion._id})
    .populate({path: 'Inventory', model: 'Inventory',
    populate:({path: 'Bodega', model: 'Bodega', match:{Name:'Principal'}}),
    populate:({path: 'Product',model:'Product',populate:{path: 'Measure',model:'Measure'}})})
    .then((details)=>{return details}).catch(err=>{console.log("error en server");return err})
    console.log(detalles);
    console.log("Finaliza Detalles");
    let img = "app/uploads/avatar/SolucionesDiversas.jpeg"
    const QuotesName = 'Cotizacion-'+cotizacion.CodCustomerQuote+'.pdf';
    const doc = new PDFDocument()
    doc.pipe(fs.createWriteStream(QuotesName));
    doc.pipe(res);
    doc.font('Times-Roman',14)
    .text(cotizacion.User.Company.Name,20,35).font('Times-Roman',16)
    .image(path.resolve(img),{scale:0.25}).moveDown()
    .text(cotizacion.User.Company.Web,20,45)
    .moveDown();
    doc.end();
}


module.exports={
    getCustomerQuote,
    createCustomerQuote,
    getCustomerQuotesDetails,
    updateCustomerQuote,
    deleteQuoteDetail,
    changeQuoteState,
    getCustomerAllQuotesDetails,
    getQuotesbyCustomers,
    ImprimirCotizacionPDF
}