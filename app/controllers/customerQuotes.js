const moment=require("moment");
const CustomerQuote = require("../models/customerquotes.model");
const QuoteDetails= require("../models/customerquotesdetails.model");


function getCustomerQuote(req, res){
    const { id,company } = req.params;
    CustomerQuote.find({User:id}).populate({path: 'Customer', model: 'Customer',populate:{ path:'Discount', model:'Discount'}})
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
                        OnRequest:false
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

    let creacion = moment().format('DD/MM/YYYY');
    updateQuote.Description=req.body.Description;
    updateQuote.CustomerName=req.body.CustomerName;
    updateQuote.Customer=req.body.Customer;

    updateQuote.Total=parseFloat(req.body.Total).toFixed(2);
    let detallePrev={};
    let detalle=[];
    CustomerQuote.findByIdAndUpdate({_id:quoteId},updateQuote,(err,purchaseUpdate)=>{
        if(err){
            res.status(500).send({message: "Error del Servidor."});
            console.log(err);
        } else {
            if(!purchaseUpdate){
                res.status(404).send({message: "No se actualizo registro"});
            }else{
                CustomerQuote.findByIdAndUpdate({_id:quoteId},{DateUpdate:creacion},(err,purchaseUpdate)=>{});
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

module.exports={
    getCustomerQuote,
    createCustomerQuote,
    getCustomerQuotesDetails,
    updateCustomerQuote,
    deleteQuoteDetail,
    changeQuoteState
}