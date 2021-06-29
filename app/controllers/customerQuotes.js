const moment=require("moment");
const CustomerQuote = require("../models/customerquotes.model");
const QuoteDetails= require("../models/customerquotesdetails.model");
const Company= require("../models/company.model");
const Sector= require("../models/sector.model");
const PDFDocument = require('pdfkit-construct');
const fs =require("fs");
const path=require("path");
const blobStream = require('blob-stream');
const taxes= require('../models/taxes.model');

const pdf = require("html-pdf");


function getCustomerQuote(req, res){
    const { id,company, profile } = req.params;
    //filtrado por tipo de perfil
    if(profile==="Admin"){
        CustomerQuote.find().populate({path: 'Customer', model: 'Customer',populate:{ path:'Discount', model:'Discount'}, 
        match:{Company:company}})
        .sort({CodCustomerQuote:-1})
        .then(cotizacion => {
            if(!cotizacion){
                res.status(404).send({message:"No hay "});
            }else{
                var quotes = cotizacion.filter(function (item) {
                    return item.Customer!==null;
                  });
                res.status(200).send({quotes})
            }
        });
    }else{  //perfil usuario
         CustomerQuote.find({User:id}).populate({path: 'Customer', model: 'Customer',populate:{ path:'Discount', model:'Discount'}})
        .sort({CodCustomerQuote:-1})
        .then(cotizacion => {
            if(!cotizacion){
                res.status(404).send({message:"No hay "});
            }else{
                var quotes = cotizacion.filter(function (item) {
                    return item.Customer!==null;
                  });
                res.status(200).send({quotes})
            }
        });
    }
   
}


async function createCustomerQuote(req,res){
    
    const cotizacion= new CustomerQuote();

    moment.locale();
    let now= new Date();
    let creacion=now.toISOString().substring(0, 10);
    
    var ObjectID = require('mongodb').ObjectID;
   
    const {Customer,CustomerName,Description,Total,User,companyId,SubTotal} = req.body;

    const quoteDetail=req.body.details;
    const detalle=[];
    
    let codigo=0;
    
    //obteniendo el ultimo codigo ingresado para generar correlativo
    let codigoQuote=await CustomerQuote.findOne().sort({CodCustomerQuote:-1}) 
    .populate({path: 'Customer', model: 'Customer', match:{Company: ObjectID(companyId)}}).then(function(doc){
        console.log("codigho",doc);
            if(doc){
                    if(doc.CodCustomerQuote!==null){
                return(doc.CodCustomerQuote)
            }
        }
       
    });
    //sumando 1 para siguiente correlativo 
    if(!codigoQuote){
        codigo =1;
    }else {codigo=codigoQuote+1}
    
    //creacion de objeto para insertar
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
    cotizacion.SubTotal= SubTotal;
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
                    detalle.push({   //arreglo del detalle de la cotizacion (info productos)
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
    let quoteDetail=req.body.details; //productos nuevos
    let detailsAnt=req.body.ordenAnt; //productos que ya formaban parte de la cotizacion
    let updateQuote={};

    let now= new Date();
    let creacion=now.toISOString().substring(0, 10);
    updateQuote.Description=req.body.Description;
    updateQuote.CustomerName=req.body.CustomerName;
    updateQuote.Customer=req.body.Customer;
    updateQuote.SubTotal=parseFloat(req.body.SubTotal).toFixed(2);

    updateQuote.Total=parseFloat(req.body.Total).toFixed(2);
    console.log("LO ACTUALIZADO",updateQuote);
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
                     detailsAnt.map(async item => {    //modificando detalles ya existentes
                        detallePrev.ProductName=item.ProductName;
                        detallePrev.Quantity=parseFloat(item.Quantity);
                        detallePrev.Discount=parseFloat(item.Discount);
                        detallePrev.Price=parseFloat(item.Price);
                        detallePrev.Inventory =item.Inventory._id;
                        detallePrev.SubTotal =parseFloat(item.SubTotal);
                        // detallePrev.Priceiva=parseFloat(item.Priceiva)
                       
                        QuoteDetails.updateMany({_id: item._id ,CustomerQuote:quoteId},detallePrev) //actualizando
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
                    quoteDetail.map(async item => {  //arreglo de nuevos productos
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
                            QuoteDetails.insertMany(detalle)  //insertando nuevos prodcutos a cotización
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
    //elimina los productos de una ctoizacion cuando esta va ser editada
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

function getCustomerAllQuotesDetails(req, res){ //pendiente

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
               
                return fecha>=f2 && fecha<=f1;  //filtrado por fechas
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

// async function ImprimirCotizacionPDF(req, res) {

//     const { id, logo } = req.params;
//     var multiples_3=[];
//     var multiplos=[];

//     // bucle del 1 al 100
//     for(var i=1;i<=100;i++)
//     {
//         if (i%6 == 0 ) { multiplos.push(i) } 
//     };
    

//     console.log("aqwui imprimo cotizacion",multiplos);
//     let comentario;
   
//     //se busca la informacion de la cotizacion (header)
//     let cotizacion = await CustomerQuote.findOne({ _id: req.params.id })
//         .populate({ path: 'Customer', model: 'Customer', populate: { path: 'Sector', model: 'Sector' } })
//         .populate({ path: 'User', model: 'User', populate: { path: 'Company', model: 'Company' } })
//         .then((facturas1) => { return facturas1 }).catch(err => { console.log("error en proveedir"); return err });
//     console.log("terminaCotizacion");
//     console.log(cotizacion);


//     console.log(cotizacion._id);
//      //impuestos
//      let impuestos=await taxes.find({document:"venta",Company:cotizacion.User.Company._id})
//      .then(taxes => {
//          let exento= cotizacion.Customer.Exempt;
//          let contribuyente=cotizacion.Customer.Contributor;
 
//          console.log(exento);
//          console.log(contribuyente);
         
//          var filtered = taxes.filter(function (item) {
//          //    if(parseFloat(cotizacion.Total) >= parseFloat(item.DocValue)){
//          //        console.log("si es mas grande");
//          //    }
//              return (parseFloat(cotizacion.Total) >= parseFloat(item.DocValue) && item.Value===contribuyente) ||
//              (item.Value === exento.toString() );
//            });
//             console.log("los impuestos", filtered);
//           return filtered;
         
       
//      })
//     //obteniendo detalles de la cotización (cuerpo de la cotizacion)
//     let detalles = await QuoteDetails.find({ CustomerQuote: cotizacion._id })
//         .populate({
//             path: 'Inventory', model: 'Inventory',
//             populate: ({ path: 'Bodega', model: 'Bodega', match: { Name: 'Principal' } }),
//             populate: ({ path: 'Product', model: 'Product', populate: { path: 'Measure', model: 'Measure' } })
//         })
//         .then((details) => { return details }).catch(err => { console.log("error en server"); return err })
//     console.log(detalles);
//     console.log("Finaliza Detalles");

   
    
//     console.log("IMPUESTOS", impuestos);
//     const QuotesName = 'Cotizacion-' + cotizacion.CodCustomerQuote + '.pdf';
//     createInvoice(cotizacion, QuotesName, detalles)
//     console.log("paso");
//     let sumimpuestos=0.0;
//     let total=0.0;
//     if(cotizacion.Customer.TypeofTaxpayer==='CreditoFiscal'){
       
//         impuestos.map(item => {
//             sumimpuestos+=parseFloat(cotizacion.Total* (item.percentage/100));
//         })
//       }
//       if(cotizacion.Customer.TypeofTaxpayer==='CreditoFiscal'){
//         total=parseFloat(cotizacion.Total - sumimpuestos).toFixed(2) ;
//    }else{
//        total=cotizacion.Total 
//    }
//    console.log("TOTAL CAL", total);
 
//     async function createInvoice(cotizacion, QuotesName, detalles) {
//         let doc = new PDFDocument({ size: "A4", margin: 50 });
//         let img = "./app/uploads/avatar/" + logo;
//         console.log(img);
//         doc.pipe(fs.createWriteStream('./app/uploads/cotizaciones/Cotizacion-' + cotizacion.CodCustomerQuote + '.pdf'));
//         doc.pipe(res)
//         console.log("funcion de crear");
//         generateHeader(doc, cotizacion, img);
//         generateCustomerInformation(doc, cotizacion);
//         generateInvoiceTable(doc, cotizacion, detalles);
//         generateComent(doc, cotizacion)
//         generateFooter(doc, cotizacion);
//         const stream = doc.pipe(blobStream())
//         doc.end();
//         fs.readFile('./app/uploads/cotizaciones/Cotizacion-' + cotizacion.CodCustomerQuote + '.pdf', (err, data) => {
//             if (err) {
//                 console.log("error:", err);
//                 console.log("entro al error");
//             }
//             else {
//                 console.log("entro al else");
//                 console.log(data);
//                 fs.createReadStream('./app/uploads/cotizaciones/Cotizacion-' + cotizacion.CodCustomerQuote + '.pdf');
//                 res.sendFile(path.resolve('./app/uploads/cotizaciones/Cotizacion-' + cotizacion.CodCustomerQuote + '.pdf'))
//             }
//         });
//         console.log("Termino")
//     }

//     async function generateHeader(doc, cotizacion, img) {

//         doc
//             .image(path.resolve(img), 50, 25, { width: 85 })
//             .fillColor("#444444")
//             .fontSize(20)
//             //.text(cotizacion.User.Company.Name, 110, 57)
//             .fontSize(10)
//             .text(cotizacion.User.Company.Name, 200, 50, { align: "right" })
//             .text(cotizacion.User.Company.Address, 200, 65, { align: "right" })
//             //   .text("Santa Tecla, El Salvaodr", 200, 80, { align: "right" })
//             .text(cotizacion.User.Company.Web, 200, 95, { align: "right" })
//             .moveDown();
//     }

//     async function generateCustomerInformation(doc, invoice) {
//         doc
//             .fillColor("#444444")
//             .fontSize(20)
//             .text("Cotización", 50, 160)
//             .text("#"+invoice.CodCustomerQuote, {align:"right"},160)

//         generateHr(doc, 185);

//         const customerInformationTop = 200;

//         var date = new Date(invoice.CreationDate);
//         doc
//             .fontSize(10)
//             .text("Para:", 50, customerInformationTop)
//             .font("Helvetica-Bold")
//             .text(invoice.Customer.Images?invoice.Customer.Images:invoice.Customer.Name, 100, customerInformationTop)
//             .font("Helvetica")
//             .text("Cliente:", 50, customerInformationTop+15)
//             .font("Helvetica-Bold")
//             .text(invoice.Customer.Name, 100, customerInformationTop+15)
//             .font("Helvetica")
//             .text("Dirección:", 50, customerInformationTop+30)
//             .font("Helvetica-Bold")
//             .text( invoice.Customer.City +
//                 ", " +
//                 invoice.Customer.ZipCode +
//                 "," +
//                 invoice.Customer.Country, 100, customerInformationTop+30)
//             .font("Helvetica")
//             .text("Correo:", 50, customerInformationTop+45)
//             .font("Helvetica-Bold")
//             .text(invoice.Customer.Email, 100, customerInformationTop+45)
//             .font("Helvetica")
           
//             .text("Total", 50, customerInformationTop + 60)
//             .text(
//                 formatCurrency(invoice.Total.toFixed(2)),
//                 100,
//                 customerInformationTop + 60
//             )
//              .text("Fecha Cotizacion", 300, customerInformationTop + 60)
//             .text(date.toLocaleDateString(), 400, customerInformationTop + 60) .font("Helvetica-Bold")
          
           
//             .moveDown();

//         generateHr(doc, 275);
//     }

//     async function generateInvoiceTable(doc, invoice, detalles) {
//         let i;
//         const invoiceTableTop = 330;
//         let TotalSinIva = 0;
//         doc.font("Helvetica-Bold");
//         generateTableRow(
//             doc,
//             invoiceTableTop,
//             "Cantidad",
//             "Producto",
//             "Medida",
//             "Precio Unitario",
//             "Total"
//         );
//         generateHr(doc, invoiceTableTop + 20);
//         doc.font("Helvetica");

//         for (i = 0; i < detalles.length; i++) {
//             const item = detalles[i];
//             const position = invoiceTableTop + (i + 1) * 32;
//             console.log("longitud",( item.Inventory.Product.ShortName).length);
//             let aumentarAncho;
//             if(( item.Inventory.Product.ShortName).length > 100 &&  (item.Inventory.Product.ShortName).length < 200){
//                 aumentarAncho =10
//             }
//             if(( item.Inventory.Product.ShortName).length < 100){
//                 aumentarAncho =0

//             }
//             if(( item.Inventory.Product.ShortName).length > 200){
//                 aumentarAncho =15

//             }
//             generateTableRow(
//                 doc,
//                 position,
//                 item.Quantity,
//                 item.Inventory.Product.ShortName,
//                 item.Measure,
//                 formatCurrency(item.Price.toFixed(2)),
//                 formatCurrency(item.SubTotal.toFixed(2))
//             );

//             TotalSinIva = item.SubTotal + TotalSinIva
           

            
            
//             generateHr(doc, position + 20 + aumentarAncho);
         
//         }

//         console.log(TotalSinIva);
//         const IvaCotizacion = (invoice.Total - TotalSinIva).toFixed(2)



//         const subtotalPosition = invoiceTableTop + (i + 1) * 35;
//         generateTableRow(
//             doc,
//             subtotalPosition,
//             "",
//             "",
//             "Subtotal",
//             "",
//             formatCurrency(parseFloat(cotizacion.SubTotal).toFixed(2))
//         );

//         const paidToDatePosition = subtotalPosition + 20;
//         if(cotizacion.Customer.TypeofTaxpayer==='CreditoFiscal'){
//          for (i = 0; i < impuestos.length; i++) {
//             const item = impuestos[i];
//             const position = subtotalPosition + (i + 1) * 10;
//             console.log("nombre imp",item);
//                    generateTableRow(
//                         doc,
//                         position,
//                         "",
//                         "",
//                          item.Name,
//                         "",
//                         formatCurrency(parseFloat(parseFloat(cotizacion.SubTotal) * parseFloat(item.percentage/100)).toFixed(2))
//                     );
//         }   
//         }
        
       

//         const duePosition =cotizacion.Customer.TypeofTaxpayer==='CreditoFiscal'? subtotalPosition + 35:subtotalPosition + 15;
//         doc.font("Helvetica-Bold");
//         generateTableRow(
//             doc,
//             duePosition,
//             "",
//             "",
//             "Total",
//             "",
//             formatCurrency(invoice.Total.toFixed(2))
//         );
//         doc.font("Helvetica");
//         console.log("total posicion", duePosition);
//         comentario=duePosition;
//     }

//     function generateComent(doc, invoice) {
//         doc
//             .fontSize(10)
//             .text(
//                 "Comentario: " +
//                 invoice.Description,
//                 50,
//                 715,
//                 { align: "left", width: 500 }
//             );
//         generateHr(doc, 700);
//         generateHr(doc, 750);
//     }

//     function generateFooter(doc, invoice) {
//         doc
//             .fontSize(8)
//             .text(
//                 "Gracias por la preferencia, " + invoice.Customer.Name +
//                 ", saludos, " + invoice.User.Company.Name,
//                 50,
//                 780,
//                 { align: "center", width: 500 }
//             );
//     }

//     function generateTableRow(
//         doc,
//         y,
//         item,
//         description,
//         unitCost,
//         quantity,
//         lineTotal
//     ) {
//         doc
//             .fontSize(8)
//             .text(item, 50, y)
//             .text(description, 100, y, { width: 200, align: "left" })
//             .text(unitCost, 280, y, { width: 90, align: "right" })
//             .text(quantity, 370, y, { width: 90, align: "right" })
//             .text(lineTotal, 0, y, { align: "right" })
//     }

//     function generateHr(doc, y) {
//         doc
//             .strokeColor("#aaaaaa")
//             .lineWidth(1)
//             .moveTo(50, y)
//             .lineTo(550, y)
//             .stroke();
//     }

//     function formatCurrency(cents) {
//         return "$" + cents;
//     }



// }

 
async function ImprimirCotizacionPDF(req,res){
    const { id, logo } = req.params;
    let img = "https://ucontrolv1.herokuapp.com/api/get-logo/" + logo;
    
    const ubicacionPlantilla = require.resolve("../plantillas/cotizacion.php");
    let contenidoHtml = fs.readFileSync(ubicacionPlantilla, 'utf8')
        
        //se busca la informacion de la cotizacion (header)
    let cotizacion = await CustomerQuote.findOne({ _id: req.params.id })
    .populate({ path: 'Customer', model: 'Customer', populate: { path: 'Sector', model: 'Sector' } })
    .populate({ path: 'User', model: 'User', populate: { path: 'Company', model: 'Company' } })
    .then((facturas1) => { return facturas1 }).catch(err => { console.log("error en proveedir"); return err });

    //impuestos
    let impuestosQuote=await taxes.find({document:"venta",Company:cotizacion.User.Company._id})
    .then(taxes => {
        let exento= cotizacion.Customer.Exempt;
        let contribuyente=cotizacion.Customer.Contributor;
        var filtered = taxes.filter(function (item) {
        //    if(parseFloat(cotizacion.Total) >= parseFloat(item.DocValue)){
        //        console.log("si es mas grande");
        //    }
            return (parseFloat(cotizacion.Total) >= parseFloat(item.DocValue) && item.Value===contribuyente) ||
            (item.Value === exento.toString() );
        });
            console.log("los impuestos", filtered);
        return filtered;
        
    
    })
    //obteniendo detalles de la cotización (cuerpo de la cotizacion) PRODUCTOS
    let detalles = await QuoteDetails.find({ CustomerQuote: cotizacion._id })
        .populate({
            path: 'Inventory', model: 'Inventory',
            populate: ({ path: 'Bodega', model: 'Bodega', match: { Name: 'Principal' } }),
            populate: ({ path: 'Product', model: 'Product', populate: { path: 'Measure', model: 'Measure' } })
        })
        .then((details) => { return details }).catch(err => { console.log("error en server"); return err })
   
       console.log("los detakkes",detalles);
        const formateador = new Intl.NumberFormat("en", { style: "currency", "currency": "USD" });
        // Generar el HTML de la tabla
        let tabla = "";
        let subtotal = 0;
        let tableImpuestos="";
       
        for (const producto of detalles) {
            // Aumentar el total
            const totalProducto = producto.cantidad * producto.precio;
            console.log();
            // Y concatenar los productos
            tabla += `<tr>
            <td  width="10px">${producto.Quantity}</td>
            <td width="450px">${producto.Inventory.Product.ShortName}</td>
            <td>${producto.Inventory.Product.Measure.Name}</td>
            <td>${formateador.format(producto.Price)}</td>
            <td>${formateador.format(producto.SubTotal)}</td>
            </tr>`;
        }
        for (const item of impuestosQuote) {
            if(cotizacion.Customer.TypeofTaxpayer==='CreditoFiscal'){
            tableImpuestos += `
            <div>
            ${item.Name} (${parseFloat(item.percentage/100)}): ${parseFloat(parseFloat(cotizacion.SubTotal) * parseFloat(item.percentage/100)).toFixed(2)}
            <br/>
            </div>
            `;
            }else{
                tableImpuestos=""
            }
        }
       


        const descuento = 0;
         subtotal = cotizacion.SubTotal;
        let imgEmpresa=path.resolve(img);
       
        // Remplazar el valor {{tablaProductos}} por el verdadero valor
        let imagenLogo= ` <img class="img img-responsive" width="150px" height="200px" src="${img}" alt="Logobtipo" border="1" >`;
        contenidoHtml = contenidoHtml.replace("{{tablaProductos}}", tabla);
        contenidoHtml = contenidoHtml.replace("{{impuestos}}", tableImpuestos);
        contenidoHtml = contenidoHtml.replace("{{logo}}", imagenLogo);
        contenidoHtml = contenidoHtml.replace("{{nombreEmpresa}}", cotizacion.User.Company.Name);
        contenidoHtml = contenidoHtml.replace("{{direccionEmpresa}}", cotizacion.User.Company.Address);
        contenidoHtml = contenidoHtml.replace("{{webEmpresa}}", cotizacion.User.Company.Web);
        contenidoHtml = contenidoHtml.replace("{{para}}", cotizacion.Customer.Images?cotizacion.Customer.Images:cotizacion.Customer.Name);
        contenidoHtml = contenidoHtml.replace("{{cliente}}", cotizacion.Customer.Name);
        contenidoHtml = contenidoHtml.replace("{{direccion}}", cotizacion.Customer.City+ ","+ cotizacion.Customer.ZipCode+","+cotizacion.Customer.Country);
        contenidoHtml = contenidoHtml.replace("{{correo}}", cotizacion.Customer.Email);
        contenidoHtml = contenidoHtml.replace("{{fecha}}", cotizacion.CreationDate);
        contenidoHtml = contenidoHtml.replace("{{codigo}}", cotizacion.CodCustomerQuote);
        contenidoHtml = contenidoHtml.replace("{{saludo}}", "Gracias por la preferencia, " + cotizacion.Customer.Name +
        ", saludos, " + cotizacion.User.Company.Name,)

        // Y también los otros valores
       
        contenidoHtml = contenidoHtml.replace("{{subtotal}}", formateador.format(subtotal));
        contenidoHtml = contenidoHtml.replace("{{descuento}}", formateador.format(descuento));
        // contenidoHtml = contenidoHtml.replace("{{subtotalConDescuento}}", formateador.format(subtotalConDescuento));
        // contenidoHtml = contenidoHtml.replace("{{impuestos}}", formateador.format(impuestos));
        contenidoHtml = contenidoHtml.replace("{{total}}",cotizacion.Total);
        var options = { 
        // directory: "/tmp", 
        format: 'Letter',
        border: {
            top: "0.5in",            // default is 0, units: mm, cm, in, px
            right: "1in",
            bottom: "0.5in",
            left: "0.6in"
          },
        //  header: {
        //     height: "45mm",
        //     contents: ` <img class="img img-responsive" width="200px" height="250px" src="${img}" alt="Logobtipo">`
        //   },
        footer: {
            height: "0.5mm",
            contents: {
            //   first: 'Cover page',
            //   2: 'Second page', // Any page number is working. 1-based index
              default: " <small class='h6 text-center'> Gracias por la preferencia, " + cotizacion.Customer.Name +
              ", saludos, " + cotizacion.User.Company.Name +"</small>" // fallback value
            //   last: 'Last Page'
            }
          }
         };
        pdf.create(contenidoHtml,options).toFile("./app/uploads/cotizaciones/Cotizacion-"+cotizacion.CodCustomerQuote + '.pdf', (error) => {
            if (error) {
                console.log("Error creando PDF: " + error)
            } else {
                fs.readFile('./app/uploads/cotizaciones/Cotizacion-' + cotizacion.CodCustomerQuote + '.pdf', (err, data) => {
                    if (err) {
                        console.log("error:", err);
                        console.log("entro al error");
                    }
                    else {
                        console.log("entro al else");
                        console.log(data);
                        fs.createReadStream('./app/uploads/cotizaciones/Cotizacion-' + cotizacion.CodCustomerQuote + '.pdf');
                        res.sendFile(path.resolve('./app/uploads/cotizaciones/Cotizacion-' + cotizacion.CodCustomerQuote + '.pdf'))
                    }
                });
                console.log("PDF creado correctamente");
            }
        });
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
    ImprimirCotizacionPDF,
    // pdfPrueba
}