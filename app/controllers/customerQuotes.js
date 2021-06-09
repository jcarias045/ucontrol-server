const moment=require("moment");
const CustomerQuote = require("../models/customerquotes.model");
const QuoteDetails= require("../models/customerquotesdetails.model");
const Company= require("../models/company.model");
const Sector= require("../models/sector.model");
const PDFDocument = require('pdfkit-construct');
const fs =require("fs");
const path=require("path");
const blobStream = require('blob-stream');



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
                        Price:parseFloat(item.PrecioDescuento),
                        Inventory :item.Inventory,
                        Measure:item.Measures,
                        CodProduct:item.codproducts,
                        SubTotal: parseFloat(item.Quantity * item.Price)-parseFloat(item.Quantity * item.Price)*parseFloat(item.Discount/100),
                        // Priceiva:parseFloat(item.Priceiva)
                        OnRequest:false,
                        GrossSellPrice:parseFloat(item.Price)
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

        const {id,logo} = req.params;
    
       
        console.log("aqwui imprimo cotizacion");
        let cotizacion = await CustomerQuote.findOne({_id: req.params.id})
        .populate({path: 'Customer', model: 'Customer',populate:{path: 'Sector', model: 'Sector'}})
        .populate({path: 'User', model: 'User',populate:{path:'Company', model:'Company'}})
        .then((facturas1) =>{ return facturas1}).catch(err =>{console.log("error en proveedir");return err});
        console.log("terminaCotizacion");
        console.log(cotizacion);
       

        console.log(cotizacion._id);
        let detalles = await  QuoteDetails.find({CustomerQuote:cotizacion._id})
        .populate({path: 'Inventory', model: 'Inventory',
        populate:({path: 'Bodega', model: 'Bodega', match:{Name:'Principal'}}),
        populate:({path: 'Product',model:'Product',populate:{path: 'Measure',model:'Measure'}})})
        .then((details)=>{return details}).catch(err=>{console.log("error en server");return err})
        console.log(detalles);
        console.log("Finaliza Detalles");

        const QuotesName = 'Cotizacion-'+cotizacion.CodCustomerQuote+'.pdf';
        createInvoice(cotizacion,QuotesName, detalles)
        console.log("paso");
    
    async function createInvoice(cotizacion, QuotesName, detalles) {
        let doc = new PDFDocument({ size: "A4", margin: 50 });
        let img = "./app/uploads/avatar/"+logo;
        console.log(img);
        doc.pipe(fs.createWriteStream('Cotizacion-'+cotizacion.CodCustomerQuote+'.pdf'));
        doc.pipe(res)
        console.log("funcion de crear");
        generateHeader(doc,cotizacion,img);
        generateCustomerInformation(doc, cotizacion);
        generateInvoiceTable(doc, cotizacion, detalles);
        generateComent(doc,cotizacion)
        generateFooter(doc, cotizacion);
        const stream = doc.pipe(blobStream())
        doc.end();        
        fs.readFile('Cotizacion-'+cotizacion.CodCustomerQuote+'.pdf',(err,data)=>{
            if(err){
                console.log("error:", err);
                console.log("entro al error");
            }
            else {                    
                console.log("entro al else");
                console.log(data);
                fs.createReadStream('Cotizacion-'+cotizacion.CodCustomerQuote+'.pdf');
                res.sendFile(path.resolve('Cotizacion-'+cotizacion.CodCustomerQuote+'.pdf'))
            }
        });
        console.log("Termino")
      }
    
    async  function generateHeader(doc,cotizacion,img) {
       
        doc
          .image(path.resolve(img), 50, 25, { width: 85 })
          .fillColor("#444444")
          .fontSize(20)
          //.text(cotizacion.User.Company.Name, 110, 57)
          .fontSize(10)
          .text(cotizacion.User.Company.Name, 200, 50, { align: "right" })
          .text(cotizacion.User.Company.Address, 200, 65, { align: "right" })
        //   .text("Santa Tecla, El Salvaodr", 200, 80, { align: "right" })
          .text(cotizacion.User.Company.Web, 200, 95, { align: "right" })
          .moveDown();
      }
      
    async  function generateCustomerInformation(doc, invoice) {
        doc
          .fillColor("#444444")
          .fontSize(20)
          .text("Cotización", 50, 160);
      
        generateHr(doc, 185);
      
        const customerInformationTop = 200;
      
        doc
          .fontSize(10)
          .text("Cotización Numero:", 50, customerInformationTop)
          .font("Helvetica-Bold")
          .text(invoice.CodCustomerQuote, 150, customerInformationTop)
          .font("Helvetica")
          .text("Fecha Cotizacion", 50, customerInformationTop + 15)
          .text(invoice.CreationDate, 150, customerInformationTop + 15)
          .text("Total", 50, customerInformationTop + 30)
          .text(
            formatCurrency(invoice.Total.toFixed(2)),
            150,
            customerInformationTop + 30
          )      
          .font("Helvetica-Bold")
          .text(invoice.Customer.Name, 300, customerInformationTop)
          .font("Helvetica")
          .text(invoice.Customer.Email, 300, customerInformationTop + 15)
          .text(
            invoice.Customer.City +
              ", " +
              invoice.Customer.Country +
              "," + 
              invoice.Customer.ZipCode,
            300,
            customerInformationTop + 30
          )
          .moveDown();
      
        generateHr(doc, 252);
      }
      
    async  function generateInvoiceTable(doc, invoice, detalles) {
        let i;
        const invoiceTableTop = 330;
        let TotalSinIva =0 ;
        doc.font("Helvetica-Bold");
        generateTableRow(
          doc,
          invoiceTableTop,
          "Cantidad",
          "Producto",
          "Medida",
          "Precio Unitario",
          "Total"
        );
        generateHr(doc, invoiceTableTop + 20);
        doc.font("Helvetica");
      
        for (i = 0; i < detalles.length; i++) {
          const item = detalles[i];
          const position = invoiceTableTop + (i + 1) * 30;
          generateTableRow(
            doc,
            position,
            item.Quantity,
            item.ProductName,
            item.Measure,
            formatCurrency(item.Price.toFixed(2)),
            formatCurrency(item.SubTotal.toFixed(2))
          );
          
          TotalSinIva = item.SubTotal + TotalSinIva
      
          generateHr(doc, position + 20);
        }
        
        console.log(TotalSinIva);
        const IvaCotizacion = (invoice.Total - TotalSinIva).toFixed(2)

        

        const subtotalPosition = invoiceTableTop + (i + 1) * 30;
        generateTableRow(
          doc,
          subtotalPosition,
          "",
          "",
          "Subtotal",
          "",
          formatCurrency(TotalSinIva.toFixed(2))
        );
      
        const paidToDatePosition = subtotalPosition + 20;
        generateTableRow(
          doc,
          paidToDatePosition,
          "",
          "",
          "IVA",
          "",
          formatCurrency(IvaCotizacion)
        );
      
        const duePosition = paidToDatePosition + 25;
        doc.font("Helvetica-Bold");
        generateTableRow(
          doc,
          duePosition,
          "",
          "",
          "Total",
          "",
          formatCurrency(invoice.Total.toFixed(2))
        );
        doc.font("Helvetica");
      }
      
      function generateComent(doc, invoice) {
        doc
          .fontSize(10)
          .text(
              "Comentario: "+
           invoice.Description,
            50,
            580,
            { align: "left", width: 500 }
          );
          generateHr(doc, 565);
          generateHr(doc, 665);
      }

      function generateFooter(doc, invoice) {
        doc
          .fontSize(10)
          .text(
            "Gracias por la preferencia, " +invoice.Customer.Name +
            ", saludos, "+ invoice.User.Company.Name,
            50,
            780,
            { align: "center", width: 500 }
          );
      }
      
      function generateTableRow(
        doc,
        y,
        item,
        description,
        unitCost,
        quantity,
        lineTotal
      ) {
        doc
          .fontSize(10)
          .text(item, 50, y)
          .text(description, 150, y)
          .text(unitCost, 280, y, { width: 90, align: "right" })
          .text(quantity, 370, y, { width: 90, align: "right" })
          .text(lineTotal, 0, y, { align: "right" });
      }
      
      function generateHr(doc, y) {
        doc
          .strokeColor("#aaaaaa")
          .lineWidth(1)
          .moveTo(50, y)
          .lineTo(550, y)
          .stroke();
      }
      
      function formatCurrency(cents) {
        return "$"+cents ;
      }
      
      
      
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