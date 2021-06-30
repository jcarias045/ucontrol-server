const moment = require("moment");
const saleOrderInvoice = require("../models/saleorderinvoice.model");
const saleOrderInvoiceDetails = require("../models/saleorderinvoicedetails.model");
const saleOrders = require("../models/saleorder.model");
const saleOrderDetails = require("../models/saleorderdetail.model");
const company = require("../models/company.model");
const User = require("../models/user.model");
const inventory = require("../models/inventory.model");
const inventoryTraceability = require("../models/inventorytraceability.model");
const MovementTypes = require("../models/movementtype.model");
const customerInvoice = require("../models/saleorderinvoice.model");
const customer = require("../models/customer.model");
const productOutput = require("../models/productoutput.model");
const productOutputDetail = require("../models/productoutputdetail.model");
const CustomerPayment = require('../models/customerpayments.model');
const CustomerPaymentDetails = require('../models/customerpaymentsdetails.model');
const correlativeDocument = require('../models/documentcorrelatives.model');
const taxes = require('../models/taxes.model');
const users = require('../models/user.model');
const product = require('../models/product.model');
const fs = require("fs");
const path = require("path");
const PDFDocument = require('pdfkit');
const PDFTable = require('voilab-pdf-table');
const blobStream = require('blob-stream');
const CustomerAdvance = require('../models/advancepayment.model');
const CustomerAdvanceDetails = require('../models/advancepaymentdetails.model');
const productAdvance = require("../models/advanceproductdetail.model");
const bodega = require("../models/bodega.model")


//registro de movimientos bancarios
const bankingTransaction = require('../models/bankingtransaction.model');
const bankAccount = require('../models/bankaccount.model');
const bankMovement = require('../models/bankmovement.model');
const movementType = require('../models/concepts.model');
//movimiento caja
const cashTransaction = require('../models/cashtransaction.model');
const cashAccount = require('../models/cashaccounts.model');
const cashMovement = require('../models/cashmovement.model');

//requiriendo el modelo coordinate para obtener coordenadas
const coordinatesInvoice = require('../models/coordinatesInvoice.model');


function getSaleOrderInvoices(req, res) {
    const { id, company, profile } = req.params
    //verificar el perfil para filtrar informacion
    if (profile === "Admin") {
        saleOrderInvoice.find().populate({ path: 'Customer', model: 'Customer', match: { Company: company } }).sort({ CodInvoice: -1 })
            .then(facturas => {
                if (!facturas) {
                    res.status(404).send({ message: "No hay " });
                } else {
                    var invoices = facturas.filter(function (item) {
                        return item.Customer !== null;
                    });
                    res.status(200).send({ invoices })
                }
            });
    } else {
        saleOrderInvoice.find({ User: id }).populate({ path: 'Customer', model: 'Customer', match: { Company: company } }).sort({ CodInvoice: -1 })
            .then(facturas => {
                if (!facturas) {
                    res.status(404).send({ message: "No hay " });
                } else {
                    var invoices = facturas.filter(function (item) {
                        return item.Customer !== null;
                    });
                    res.status(200).send({ invoices })
                }
            });
    }

}

function getDetallesVentaContribuyente(req, res) {
    const company = req.params.id;
    saleOrderInvoice.find()
        .populate({ path: 'Customer', model: 'Customer', match: { TypeofTaxpayer: 'CreditoFiscal' } }).sort({ CodInvoice: -1 })
        .populate({
            path: 'User', model: 'User', populate: { path: 'Company', model: 'Company' }
            , match: { Company: company }
        })
        .populate({ path: 'SaleOrder', model: 'SaleOrder' })
        .populate({
            path: 'DocumentCorrelative', model: 'DocumentCorrelative'
            , populate: { path: 'DocumentType', model: 'DocumentType' }
        })
        .then(invoices => {
            if (!invoices) {
                console.log("no entro");
                res.status(404).send({ message: "No hay " });
            } else {
                console.log(("Si entro"));
                res.status(200).send({ invoices })
            }
        });
}

function getDetallesVentaConsumidorFinal(req, res) {
    const company = req.params.id;
    saleOrderInvoice.find()
        .populate({ path: 'Customer', model: 'Customer', match: { TypeofTaxpayer: 'CreditoFiscal' } }).sort({ CodInvoice: -1 })
        .populate({
            path: 'User', model: 'User', populate: { path: 'Company', model: 'Company' }
            , match: { Company: company }
        })
        .populate({ path: 'SaleOrder', model: 'SaleOrder' })
        .populate({
            path: 'DocumentCorrelative', model: 'DocumentCorrelative'
            , populate: { path: 'DocumentType', model: 'DocumentType' }
        })
        .then(invoices => {
            if (!invoices) {
                console.log("no entro");
                res.status(404).send({ message: "No hay " });
            } else {
                console.log(("Si entro"));
                res.status(200).send({ invoices })
            }
        });
}

async function getSaleOrdersClosed(req, res) { //funcion para cargar ordenes en el select que aparece al momento de crear una factura
    const { id, company } = req.params;


    saleOrders.find({ User: id, State: 'Cerrada' }).populate({ path: 'Customer', model: 'Customer', match: { Company: company } })
        .then(orders => {
            if (!orders) {
                res.status(404).send({ message: "No hay " });
            } else {

                res.status(200).send({ orders })
            }
        });


}


function getSaleOrderInfo(req, res) { //se utiliza para obtener la info de la orden que se selecciono en la pantalla de facturas
    let saleId = req.params.id;

    saleOrders.find({ _id: saleId }).populate({ path: 'Customer', model: 'Customer', populate: { path: 'Discount', model: 'Discount' } })
        .then(quote => {
            if (!quote) {
                res.status(404).send({ message: "No hay " });
            } else {
                res.status(200).send({ quote })

            }
        });
}

function getSaleOrderDetails(req, res) {  //utilizada para obtener todos los productos relacionados con la orden seleccionada
    let saleId = req.params.id;

    saleOrderDetails.find({ SaleOrder: saleId }).populate({
        path: 'Inventory', model: 'Inventory',
        populate: ({ path: 'Bodega', model: 'Bodega', match: { Name: 'Principal' } }),
        populate: ({ path: 'Product', model: 'Product', populate: { path: 'Measure', model: 'Measure' } })
    })

        .then(order => {
            if (!order) {
                res.status(404).send({ message: "No hay " });
                console.log(order);
            } else {
                res.status(200).send({ order })
                console.log(order);
            }
        });
}


//función inicial ue ya no esta en uso
async function createSaleOrderInvoiceWithOrder(req, res) {

    const SaleOrderInvoice = new saleOrderInvoice();
    const ProductOuput = new productOutput();
    const payment = new CustomerPayment();
    const paymentDetails = new CustomerPaymentDetails();
    let messageError = false;
    const saledetails = req.body.details;

    let dePurchaseOrder = req.body.ordenAnt;
    let addTaxes = req.body.impuestos;
    const detalle = [];
    let outputDataDetail = [];

    let deudor = false;
    moment.locale();
    // let creacion = moment().format('DD/MM/YYYY');
    let now = new Date();
    let creacion = now.toISOString().substring(0, 10);

    const { InvoiceDate, CustomerName, SaleOrderId, CommentsSaleOrder, Total, User, companyId, InvoiceNumber, Customer, Comments,
        diasCredito, InvoiceComments, condicionPago, Reason, PaymentMethodName, PaymentMethodId, Monto, NumberAccount, BankName, NoTransaction } = req.body;

    let details = [];
    let deOrden = [];
    let impuestos = [];


    let codigo = 0;
    let codigoSalidas = 0;

    let codigoSaleOrderInvoice = await saleOrderInvoice.findOne().sort({ CodInvoice: -1 })
        .populate({ path: 'Customer', model: 'Customer', match: { Company: companyId } }).then(function (doc) {

            if (doc) {
                if (doc.CodInvoice !== null) {
                    return (doc.CodInvoice)
                }
            }
        });
    //para generar el correctivo del ingreso en caso de que sea requerido
    let codOutput = await productOutput.findOne({ Company: companyId }).sort({ CodOutput: -1 })
        .populate({ path: 'Customer', model: 'Customer', match: { Company: companyId } }).then(function (doc) {
            if (doc) {
                if (doc.CodOutput !== null) {
                    return (doc.CodOutput)
                }
            }
        });
    //obteniendo informacion de la compañia para validar
    let companyParams = await company.findById(companyId) //esta variable la mando a llamar luego que se ingreso factura
        .then(params => {
            if (!params) {
                res.status(404).send({ message: "No hay " });
            } else {
                return (params)
            }
        });


    //Deuda ppor cobrar actual
    let deudaAct = await customer.findOne({ _id: Customer }).then(function (doc) {
        console.log(doc);
        if (doc) {
            if (doc.AccountsReceivable !== null) {
                return (doc.AccountsReceivable)
            }
        }
    });
    let deuda = deudaAct;
    //OBTENCION DE CORRELATIVOS
    //OBTENIENDO TIPO DE CLIENTE
    let customerType = await customer.findOne({ _id: Customer }).then(function (doc) {

        if (doc) {
            if (doc.TypeofTaxpayer !== null) {
                return (doc.TypeofTaxpayer)
            }
        }
    });
    let correlativos = await correlativeDocument.findOne({ State: true })
        .populate({ path: 'DocumentType', model: 'DocumentType', match: { Ref: customerType.TypeofTaxpayer } })
        .then(docCorrelative => {
            if (docCorrelative) {
                return docCorrelative
            }

        });

    let lengEndNumber = (correlativos.EndNumber).toString().length;
    let nLineas = parseInt(companyParams.InvoiceLines);
    let iniNumber = correlativos.StartNumber;

    console.log(iniNumber);
    console.log("lineas", nLineas);
    let longitudArreglo = details.length;
    console.log(longitudArreglo);
    let contador = 0;
    let i = 0;
    let step = 0;
    let correlativeNumber = parseInt(iniNumber);
    console.log(longitudArreglo);
    //FIN DE OBTENCION DE CORRELATIVOS
    //Creacion de correlativo de doc

    if (!codigoSaleOrderInvoice) {
        codigo = 1;
    } else { codigo = codigoSaleOrderInvoice + 1 }


    if (!codOutput) {
        codigoSalidas = 1;
    } else { codigoSalidas = codOutput + 1 }
    console.log(codOutput);
    console.log("Codigo de salida", codigoSalidas);

    //++++++++++++++ verificando deudas +++++++++++++++++++
    //obtener fecha de facturas relacionadas con el cliente
    let invoices = await customerInvoice.find({ Pagada: false, Customer: Customer }, 'CreationDate')
        .then(resultado => { return resultado }).catch(err => { console.log("error en proveedir"); return err });
    console.log(invoices);
    invoices.map(item => {
        //  let date = moment(item.CreationDate).format('DD/MM/YYYY');
        console.log((item.CreationDate));
        let now = new Date();
        let fecha = now.getTime();
        var date = new Date(item.CreationDate);
        console.log(date);
        date.setDate(date.getDate() + diasCredito);
        let fechaPago = date.toISOString().substring(0, 10);
        let fechaAct = now.toISOString().substring(0, 10);
        console.log('fecha sumada', date.toISOString().substring(0, 10));
        console.log(fechaAct);
        if (fechaPago <= fechaAct) {
            deudor = true;
        } else { deudor = false; }

    });

    if (deudor) {
        console.log('esta en deuda');
    } else {
        console.log('agregar ingreso');
    }
    //++++++++++++++  FIN  +++++++++++++++++++
    SaleOrderInvoice.CodInvoice = codigo;
    SaleOrderInvoice.Customer = Customer;
    SaleOrderInvoice.Total = Total;
    SaleOrderInvoice.Active = true;
    SaleOrderInvoice.User = User,
        SaleOrderInvoice.CreationDate = creacion;
    SaleOrderInvoice.State = 'Creada';
    SaleOrderInvoice.InvoiceComments = InvoiceComments;
    SaleOrderInvoice.CommentsofSale = CommentsSaleOrder;
    SaleOrderInvoice.CustomerName = CustomerName;
    SaleOrderInvoice.SaleOrder = SaleOrderId;
    SaleOrderInvoice.InvoiceDate = InvoiceDate;
    SaleOrderInvoice.Pagada = false;
    SaleOrderInvoice.Entregada = !companyParams.RequieredOutput ? true : false;
    SaleOrderInvoice.InvoiceNumber = InvoiceNumber;

    let invoiceId = null;
    if ((companyParams.OrderWithWallet && (deudor || !deudor)) || (!companyParams.OrderWithWallet && !deudor)) {
        console.log("Si entro de condicion");
        SaleOrderInvoice.save((err, SaleOrderStored) => {
            if (err) {
                res.status(500).send({ message: err });

            } else {
                if (!SaleOrderStored) {
                    res.status(500).send({ message: "Error al crear factura." });
                    console.log(SaleOrderStored);
                }
                else {
                    console.log("INGRESOO FACT ");
                    console.log(SaleOrderStored);
                    invoiceId = SaleOrderStored._id;
                    let quoteId = SaleOrderStored.CustomerQuote;
                    //cambio de estado a orden de venta
                    saleOrders.findByIdAndUpdate({ _id: SaleOrderId }, { State: "Facturada" }, async (err, update) => {
                        if (err) {
                            res.status(500).send({ message: "Error del servidor." });
                        }
                        if (update) { }
                    });
                    if (invoiceId) {
                        console.log("INGRESANDO DETALLES");


                        if (dePurchaseOrder.length > 0) {
                            dePurchaseOrder.map(async item => {
                                deOrden.push({
                                    ProductName: item.ProductName,
                                    SaleOrderInvoice: invoiceId,
                                    Quantity: parseFloat(item.Quantity),
                                    Discount: parseFloat(item.Discount),
                                    Price: parseFloat(item.Price),
                                    Inventory: item.Inventory._id,
                                    SubTotal: parseFloat(item.Quantity * item.Price) - parseFloat((item.Quantity * item.Price) * item.Discount),
                                    Entregados: !companyParams.RequieredOutput ? item.Quantity : 0,
                                    State: !companyParams.RequieredOutput ? true : false,
                                    Measure: item.Measure,
                                    CodProduct: item.CodProduct,
                                    Product: item.Inventory.Product._id,
                                    Entregados: !companyParams.RequieredOutput ? item.Quantity : 0,
                                    iniQuantity: item.Quantity

                                })
                            })
                        }
                        if (deOrden.length > 0) {    //insertando detalles de los detalles de la orden
                            saleOrderInvoiceDetails.insertMany(deOrden)
                                .then(function (detalles) {
                                    //si ingreso no requerido

                                    if (detalles) {
                                        //cuenta por cobrar
                                        let nuevaCuenta = parseFloat(deudaAct) + parseFloat(Total)
                                        customer.findByIdAndUpdate({ _id: Customer }, {
                                            AccountsReceivable: nuevaCuenta.toFixed(2),
                                        }).then(function (update) {
                                            if (!update) {

                                            }
                                            else { }
                                        }).catch(err => { console.log(err) });

                                        if (!companyParams.RequieredOutput) {
                                            let salidaId = null;
                                            ProductOuput.EntryDate = creacion;
                                            ProductOuput.User = User;
                                            ProductOuput.Comments = "Ingreso automatico " + creacion;
                                            ProductOuput.State = true;
                                            ProductOuput.CodOutput = codigoSalidas;
                                            ProductOuput.Company = companyId;
                                            ProductOuput.SaleOrderInvoice = invoiceId;
                                            ProductOuput.Customer = Customer;
                                            ProductOuput.InvoiceNumber = InvoiceNumber;
                                            ProductOuput.save((err, outputStored) => {
                                                if (err) {
                                                    console.log(err);

                                                } else {
                                                    if (!outputStored) {
                                                        console.log('no se ingreso entrada');

                                                    }
                                                    else {
                                                        let salidaId = outputStored._id;


                                                        detalles.map(async item => {

                                                            //obteniendo stock de producto  (bodega principal)
                                                            let infoInventary = await inventory.findOne({ _id: item.Inventory }, ['Stock', 'Product'])
                                                                .then(resultado => { return resultado }).catch(err => { console.log("error en proveedir"); return err });
                                                            console.log('EN STOCK:', infoInventary);

                                                            let productreserved = await inventory.findOne({ Product: infoInventary.Product, _id: { $nin: infoInventary._id } }, ['Stock', 'Product'])
                                                                .populate({ path: 'Bodega', model: 'Bodega', match: { Name: 'Reserva' } })
                                                                .then(resultado => { return resultado }).catch(err => { console.log("error en proveedir"); return err });

                                                            //obteniendo id del movimiento de tipo reserva
                                                            let movementId = await MovementTypes.findOne({ Name: 'salida' }, ['_id'])
                                                                .then(resultado => { return resultado }).catch(err => { console.log("error en proveedir"); return err });

                                                            if (parseFloat(infoInventary.Stock) >= parseFloat(item.Quantity) && !companyParams.AvailableReservation) {
                                                                //descontando cantidad que se reservara
                                                                inventory.findByIdAndUpdate({ _id: item.Inventory }, {
                                                                    Stock: parseFloat(infoInventary.Stock - item.Quantity),
                                                                }).then(function (update) {
                                                                    if (!update) {

                                                                    }
                                                                    else {
                                                                        outputDataDetail.push({
                                                                            SaleInvoiceDetail: item._id,
                                                                            ProductOutput: salidaId,
                                                                            Quantity: item.Quantity,
                                                                            Inventory: infoInventary._id,
                                                                            ProductName: item.ProductName,
                                                                            Price: item.Price,
                                                                            Measure: item.Measure,
                                                                            CodProduct: item.CodProduct,
                                                                            Product: item.Product
                                                                        });
                                                                        productOutputDetail.insertMany(outputDataDetail).then(function (outputStored) {
                                                                            console.log("INSERTANDO SALIDA DETALLE");
                                                                            console.log(outputStored);
                                                                            if (outputStored) {
                                                                                const inventorytraceability = new inventoryTraceability();
                                                                                inventorytraceability.Quantity = item.Quantity;
                                                                                inventorytraceability.Product = item.Product;
                                                                                inventorytraceability.WarehouseDestination = null; //destino
                                                                                inventorytraceability.MovementType = movementId._id;
                                                                                inventorytraceability.MovDate = creacion;
                                                                                inventorytraceability.WarehouseOrigin = item.Inventory; //origen
                                                                                inventorytraceability.User = User;
                                                                                inventorytraceability.Company = companyId;
                                                                                inventorytraceability.DocumentId = invoiceId;
                                                                                inventorytraceability.ProductDestiny = null;
                                                                                inventorytraceability.Cost = parseFloat(item.Quantity) * parseFloat(item.Price);
                                                                                inventorytraceability.save((err, traceabilityStored) => {
                                                                                    if (err) {
                                                                                        // res.status(500).send({message: err});

                                                                                    } else {
                                                                                        if (!traceabilityStored) {
                                                                                            // res.status(500).send({message: "Error al crear el nuevo usuario."});
                                                                                            console.log(traceabilityStored);
                                                                                        }
                                                                                        else {

                                                                                        }
                                                                                    }
                                                                                });

                                                                            }
                                                                        }).catch(err => console.log(err))
                                                                        console.log('id del moviminto de reserva', movementId);
                                                                        //registro de movimiento

                                                                        res.status(200).send({ orden: detalles });
                                                                    }
                                                                })
                                                                    .catch(err => { console.log(err); });

                                                                //stock de bodega de reserva
                                                                console.log(infoInventary.Product);

                                                            }
                                                            else if (parseFloat(productreserved.Stock) >= parseFloat(item.Quantity) && companyParams.AvailableReservation) {
                                                                console.log("EMPRESA HABILITADA PARA RESERVAS");
                                                                console.log('BODEGA RESERVA');
                                                                console.log(productreserved);

                                                                //actualizando el stock de reserva
                                                                inventory.findByIdAndUpdate({ _id: productreserved._id }, {
                                                                    Stock: parseFloat(productreserved.Stock - item.Quantity),
                                                                }).then(function (update) {
                                                                    if (!update) {
                                                                        res.status(500).send({ message: "No se actualizo inventario" });
                                                                    } else {
                                                                        outputDataDetail.push({
                                                                            SaleInvoiceDetail: item._id,
                                                                            ProductOutput: salidaId,
                                                                            Quantity: item.Quantity,
                                                                            Inventory: productreserved._id,
                                                                            ProductName: item.ProductName,
                                                                            Price: item.Price,
                                                                            Measure: item.Measure,
                                                                            CodProduct: item.CodProduct,
                                                                            Product: item.Product
                                                                        });
                                                                        productOutputDetail.insertMany(outputDataDetail).then(function (outputStored) {
                                                                            console.log("INSERTANDO SALIDA DETALLE");
                                                                            console.log(outputStored);
                                                                            if (outputStored) {
                                                                                const inventorytraceability = new inventoryTraceability();
                                                                                inventorytraceability.Quantity = item.Quantity;
                                                                                inventorytraceability.Product = item.Product;
                                                                                inventorytraceability.WarehouseDestination = null; //destino
                                                                                inventorytraceability.MovementType = movementId._id;
                                                                                inventorytraceability.MovDate = creacion;
                                                                                inventorytraceability.WarehouseOrigin = productreserved._id; //origen
                                                                                inventorytraceability.User = User;
                                                                                inventorytraceability.Company = companyId;
                                                                                inventorytraceability.DocumentId = invoiceId;
                                                                                inventorytraceability.ProductDestiny = null;
                                                                                inventorytraceability.Cost = parseFloat(item.Quantity) * parseFloat(item.Price);
                                                                                inventorytraceability.save((err, traceabilityStored) => {
                                                                                    if (err) {

                                                                                        res.status(500).send({ message: "No se actualizo inventario" });
                                                                                    } else {
                                                                                        if (!traceabilityStored) {
                                                                                            // // res.status(500).send({message: "Error al crear el nuevo usuario."});
                                                                                            // console.log(traceabilityStored);
                                                                                        }
                                                                                        else {
                                                                                            console.log(traceabilityStored);
                                                                                        }
                                                                                    }
                                                                                });
                                                                            }
                                                                        }).catch(err => console.log(err));


                                                                    }

                                                                })
                                                                    .catch(err => { console.log(err); });

                                                            }
                                                            else {

                                                                res.status(500).send({ message: "Verificar Inventario" });

                                                            }


                                                        })


                                                    }
                                                }
                                            });

                                            // res.status(200).send({orden: detalles})
                                        }
                                        else {
                                            res.status(200).send({ orden: detalles });
                                        }
                                    } else {
                                        res.status(500).send({ message: "No se registraron detalles" });
                                    }


                                })
                                .catch(function (err) {
                                    console.log(err);
                                });
                        }

                    }

                    if (condicionPago === 'Contado') {
                        console.log("PAGO DE CONTADO");
                        payment.save((err, paymentStored) => {
                            if (err) {
                                res.status(500).send({ message: err });

                            } else {
                                if (!paymentStored) {
                                    res.status(500).send({ message: "No se inserto registro" });

                                }
                                else {
                                    let paymentid = paymentStored._id;
                                    console.log('METODO', PaymentMethodId);
                                    paymentDetails.CreationDate = creacion;
                                    paymentDetails.Reason = Reason;
                                    paymentDetails.PaymentMethods = PaymentMethodId;
                                    paymentDetails.Cancelled = false;
                                    paymentDetails.Amount = Monto;
                                    paymentDetails.CustomerPayment = paymentid;
                                    paymentDetails.SaleOrderInvoice = invoiceId;

                                    console.log(paymentDetails);
                                    if (PaymentMethodName !== 'Contado') {
                                        paymentDetails.NumberAccount = PaymentMethodName === "TargetaCredito" ? null : NumberAccount;
                                        paymentDetails.BankName = BankName;
                                        paymentDetails.NoTransaction = NoTransaction;
                                    }
                                    if (PaymentMethodName === 'Contado') {
                                        paymentDetails.NumberAccount = null;
                                        paymentDetails.BankName = null;
                                        paymentDetails.NoTransaction = null;
                                    }
                                    paymentDetails.save(async (err, detailStored) => {
                                        if (err) {
                                            // res.status(500).send({message: err});
                                            console.log(err);

                                        } else {
                                            if (!detailStored) {
                                                // res.status(500).send({message: err});
                                                console.log(err);
                                            }
                                            else {
                                                let paymentDetailId = detailStored._id;
                                                if (paymentDetailId) {
                                                    let sumMontos = await CustomerPaymentDetails.aggregate([
                                                        { $match: { CustomerPayment: paymentid } },

                                                        {
                                                            $group: {
                                                                _id: null,
                                                                "sumAmount": { $sum: '$Amount' }
                                                            }
                                                        },

                                                    ]);
                                                    let sumaMontos = 0.0;
                                                    sumMontos.map(item => {
                                                        sumaMontos = item.sumAmount;
                                                    })
                                                    //actualizando deuda con cliente
                                                    let nuevaCuenta = parseFloat(deuda) - parseFloat(Monto)
                                                    customer.findByIdAndUpdate({ _id: Customer }, { AccountsReceivable: nuevaCuenta.toFixed(2) }, (err, updateDeuda) => {
                                                        if (err) {

                                                            console.log(err);
                                                        } else { console.log(updateDeuda) }
                                                    });
                                                    if (parseFloat(sumMontos) === parseFloat(totalFactura)) {
                                                        console.log('SUMANDO MONTOS');
                                                        saleOrderInvoice.findByIdAndUpdate({ _id: invoiceId }, { Pagada: true }, (err, updateDeuda) => {
                                                            if (err) {

                                                                console.log(err);
                                                            } else { console.log(updateDeuda); }
                                                        });


                                                    }

                                                }

                                            }
                                        }
                                    });

                                    res.status(200).send({ paymentStored });
                                }
                            }
                        });

                    } else {
                        res.status(200).send({ orden: detalles });
                    }

                }
            }
        })


    }

    if (!companyParams.OrderWithWallet && deudor) {
        res.status(500).send({ message: "No se puede registrar orden de venta a cliente" });
    }




}

//función inicial ue ya no esta en uso
async function createSaleOrderInvoice(req, res) {
    const SaleOrderInvoice = new saleOrderInvoice();
    const ProductOuput = new productOutput();
    const payment = new CustomerPayment();
    const paymentDetails = new CustomerPaymentDetails();
    let messageError = false;
    const saledetails = req.body.details;

    let dePurchaseOrder = req.body.ordenAnt;
    let addTaxes = req.body.impuestos;
    const detalle = [];
    let outputDataDetail = [];

    let deudor = false;
    moment.locale();
    // let creacion = moment().format('DD/MM/YYYY');
    let now = new Date();
    let fecha = now.getTime();

    let creacion = now.toISOString().substring(0, 10);

    const { InvoiceDate, CustomerName, SaleOrderId, CommentsSaleOrder, Total, User, companyId, InvoiceNumber, Customer, Comments,
        diasCredito, InvoiceComments, condicionPago, Reason, PaymentMethodName, PaymentMethodId, Monto, NumberAccount, BankName, NoTransaction } = req.body;

    let details = [];
    let deOrden = [];
    let impuestos = [];


    let codigo = 0;
    let codigoSalidas = 0;

    let codigoSaleOrderInvoice = await saleOrderInvoice.findOne().sort({ CodInvoice: -1 })
        .populate({ path: 'Customer', model: 'Customer', match: { Company: companyId } }).then(function (doc) {
            console.log(doc);
            if (doc) {
                if (doc.CodInvoice !== null) {
                    return (doc.CodInvoice)
                }
            }
        });
    let codOutput = await productOutput.findOne({ Company: companyId }).sort({ CodOutput: -1 })
        .populate({ path: 'Customer', model: 'Customer', match: { Company: companyId } }).then(function (doc) {
            if (doc) {
                if (doc.CodOutput !== null) {
                    return (doc.CodOutput)
                }
            }
        });
    //obteniendo informacion de la compañia para validar
    let companyParams = await company.findById(companyId) //esta variable la mando a llamar luego que se ingreso factura
        .then(params => {
            if (!params) {
                res.status(404).send({ message: "No hay " });
            } else {
                return (params)
            }
        });
    console.log(companyParams);

    //Deuda ppor cobrar actual
    let deudaAct = await customer.findOne({ _id: Customer }).then(function (doc) {
        console.log(doc);
        if (doc) {
            if (doc.AccountsReceivable !== null) {
                return (doc.AccountsReceivable)
            }
        }
    });
    console.log("Deuda cliente", deudaAct);
    let deuda = deudaAct;
    //Creacion de correlativo de doc

    if (!codigoSaleOrderInvoice) {
        codigo = 1;
    } else { codigo = codigoSaleOrderInvoice + 1 }

    if (!codOutput) {
        codigoSalidas = 1;
    } else { codigo = codOutput + 1 }

    console.log("Codigo de salida", codigoSalidas);
    //++++++++++++++ verificando deudas +++++++++++++++++++
    //obtener fecha de facturas relacionadas con el cliente
    let invoices = await customerInvoice.find({ Pagada: false, Customer: Customer }, 'CreationDate')
        .then(resultado => { return resultado }).catch(err => { console.log("error en proveedir"); return err });
    console.log(invoices);
    invoices.map(item => {
        //  let date = moment(item.CreationDate).format('DD/MM/YYYY');
        console.log((item.CreationDate));
        let now = new Date();
        let fecha = now.getTime();
        var date = new Date(item.CreationDate);
        console.log(date);
        date.setDate(date.getDate() + diasCredito);
        let fechaPago = date.toISOString().substring(0, 10);
        let fechaAct = now.toISOString().substring(0, 10);
        console.log('fecha sumada', date.toISOString().substring(0, 10));
        console.log(fechaAct);
        if (fechaPago <= fechaAct) {
            deudor = true;
        } else { deudor = false; }

    });

    if (deudor) {
        console.log('esta en deuda');
    } else {
        console.log('agregar ingreso');
    }
    //++++++++++++++  FIN  +++++++++++++++++++
    SaleOrderInvoice.CodInvoice = codigo;
    SaleOrderInvoice.Customer = Customer;
    SaleOrderInvoice.Total = Total;
    SaleOrderInvoice.Active = true;
    SaleOrderInvoice.User = User,
        SaleOrderInvoice.CreationDate = creacion;
    SaleOrderInvoice.State = 'Creada';
    SaleOrderInvoice.InvoiceComments = InvoiceComments;
    SaleOrderInvoice.CommentsofSale = " ";
    SaleOrderInvoice.CustomerName = CustomerName;
    SaleOrderInvoice.SaleOrder = null;
    SaleOrderInvoice.InvoiceDate = InvoiceDate;
    SaleOrderInvoice.Pagada = false;
    SaleOrderInvoice.Entregada = !companyParams.RequieredOutput ? true : false;
    SaleOrderInvoice.InvoiceNumber = InvoiceNumber;
    let invoiceId = null;
    if ((companyParams.OrderWithWallet && (deudor || !deudor)) || (!companyParams.OrderWithWallet && !deudor)) {
        console.log("Si entro de condicion");
        SaleOrderInvoice.save((err, SaleOrderStored) => {
            if (err) {
                res.status(500).send({ message: err });

            } else {
                if (!SaleOrderStored) {
                    res.status(500).send({ message: "Error al crear factura." });
                    console.log(SaleOrderStored);
                }
                else {
                    console.log("INGRESOO FACT ");
                    console.log(SaleOrderStored);
                    invoiceId = SaleOrderStored._id;
                    let quoteId = SaleOrderStored.CustomerQuote;
                    if (invoiceId) {
                        console.log("INGRESANDO DETALLES");


                        if (saledetails.length > 0) {
                            saledetails.map(async item => {
                                deOrden.push({
                                    ProductName: item.Name,
                                    SaleOrderInvoice: invoiceId,
                                    Quantity: parseFloat(item.Quantity),
                                    Discount: parseFloat(item.Discount),
                                    Price: parseFloat(item.Price),
                                    Inventory: item.Inventory,
                                    SubTotal: parseFloat(item.total),
                                    State: !companyParams.RequieredOutput ? true : false,
                                    Measure: item.Measure,
                                    CodProduct: item.CodProduct,
                                    Product: item.ProductId,
                                    Entregados: !companyParams.RequieredOutput ? item.Quantity : 0,
                                    iniQuantity: item.Quantity

                                })
                            })
                        }
                        if (deOrden.length > 0) {    //insertando detalles de los detalles de la orden
                            saleOrderInvoiceDetails.insertMany(deOrden)
                                .then(function (detalles) {
                                    //si ingreso no requerido

                                    if (condicionPago === 'Contado') {
                                        console.log("PAGO DE CONTADO");
                                        payment.SaleOrderInvoice = invoiceId;
                                        payment.DatePayment = creacion;
                                        payment.User = User;
                                        payment.codpayment = codigo;
                                        payment.Saldo = 0;

                                        payment.save((err, paymentStored) => {
                                            if (err) {
                                                res.status(500).send({ message: err });

                                            } else {
                                                if (!paymentStored) {
                                                    res.status(500).send({ message: "No se inserto registro" });

                                                }
                                                else {
                                                    let paymentid = paymentStored._id;
                                                    console.log('METODO', PaymentMethodId);
                                                    paymentDetails.CreationDate = creacion;
                                                    paymentDetails.Reason = Reason;
                                                    paymentDetails.PaymentMethods = PaymentMethodId;
                                                    paymentDetails.Cancelled = false;
                                                    paymentDetails.Amount = Monto;
                                                    paymentDetails.CustomerPayment = paymentid;
                                                    paymentDetails.SaleOrderInvoice = invoiceId;

                                                    console.log(paymentDetails);
                                                    if (PaymentMethodName !== 'Contado') {
                                                        paymentDetails.NumberAccount = PaymentMethodName === "TargetaCredito" ? null : NumberAccount;
                                                        paymentDetails.BankName = BankName;
                                                        paymentDetails.NoTransaction = NoTransaction;
                                                    }
                                                    if (PaymentMethodName === 'Contado') {
                                                        paymentDetails.NumberAccount = null;
                                                        paymentDetails.BankName = null;
                                                        paymentDetails.NoTransaction = null;
                                                    }
                                                    paymentDetails.save(async (err, detailStored) => {
                                                        if (err) {
                                                            // res.status(500).send({message: err});
                                                            console.log(err);

                                                        } else {
                                                            if (!detailStored) {
                                                                // res.status(500).send({message: err});
                                                                console.log(err);
                                                            }
                                                            else {
                                                                let paymentDetailId = detailStored._id;
                                                                if (paymentDetailId) {
                                                                    let sumMontos = await CustomerPaymentDetails.aggregate([
                                                                        { $match: { CustomerPayment: paymentid } },

                                                                        {
                                                                            $group: {
                                                                                _id: null,
                                                                                "sumAmount": { $sum: '$Amount' }
                                                                            }
                                                                        },

                                                                    ]);
                                                                    let sumaMontos = 0.0;
                                                                    sumMontos.map(item => {
                                                                        sumaMontos = item.sumAmount;
                                                                    })
                                                                    //actualizando deuda con cliente
                                                                    let nuevaCuenta = parseFloat(deuda) - parseFloat(Monto);
                                                                    customer.findByIdAndUpdate({ _id: Customer }, { AccountsReceivable: nuevaCuenta.toFixed(2) }, (err, updateDeuda) => {
                                                                        if (err) {

                                                                            console.log(err);
                                                                        } else { console.log(updateDeuda) }
                                                                    });

                                                                    saleOrderInvoice.findByIdAndUpdate({ _id: invoiceId }, { Pagada: true }, (err, updateDeuda) => {
                                                                        if (err) {

                                                                            console.log(err);
                                                                        } else { console.log(updateDeuda); }
                                                                    });




                                                                }

                                                            }
                                                        }
                                                    });


                                                }
                                            }
                                        })
                                    }
                                    if (detalles) {
                                        //cuenta por cobrar
                                        let nuevaCuenta = parseFloat(deudaAct) + parseFloat(Total);
                                        customer.findByIdAndUpdate({ _id: Customer }, {
                                            AccountsReceivable: nuevaCuenta.toFixed(2),
                                        }).then(function (update) {
                                            if (!update) {

                                            }
                                            else { }
                                        }).catch(err => { console.log(err) });

                                        if (!companyParams.RequieredOutput) {
                                            let salidaId = null;
                                            ProductOuput.EntryDate = creacion;
                                            ProductOuput.User = User;
                                            ProductOuput.Comments = "Ingreso automatico " + creacion;
                                            ProductOuput.State = true;
                                            ProductOuput.CodOutput = codigoSalidas;
                                            ProductOuput.Company = companyId;
                                            ProductOuput.SaleOrderInvoice = invoiceId;
                                            ProductOuput.Customer = Customer;
                                            ProductOuput.InvoiceNumber = InvoiceNumber;
                                            ProductOuput.save((err, outputStored) => {
                                                if (err) {
                                                    console.log(err);

                                                } else {
                                                    if (!outputStored) {
                                                        console.log('no se ingreso entrada');

                                                    }
                                                    else {
                                                        let salidaId = outputStored._id;


                                                        detalles.map(async item => {

                                                            //obteniendo stock de producto  (bodega principal)
                                                            let infoInventary = await inventory.findOne({ _id: item.Inventory }, ['Stock', 'Product'])
                                                                .then(resultado => { return resultado }).catch(err => { console.log("error en proveedir"); return err });
                                                            console.log('EN STOCK:', infoInventary);

                                                            let productreserved = await inventory.findOne({ Product: infoInventary.Product, _id: { $nin: infoInventary._id } }, ['Stock', 'Product'])
                                                                .populate({ path: 'Bodega', model: 'Bodega', match: { Name: 'Reserva' } })
                                                                .then(resultado => { return resultado }).catch(err => { console.log("error en proveedir"); return err });

                                                            //obteniendo id del movimiento de tipo reserva
                                                            let movementId = await MovementTypes.findOne({ Name: 'salida' }, ['_id'])
                                                                .then(resultado => { return resultado }).catch(err => { console.log("error en proveedir"); return err });

                                                            if (parseFloat(infoInventary.Stock) >= parseFloat(item.Quantity) && !companyParams.AvailableReservation) {
                                                                //descontando cantidad que se reservara
                                                                inventory.findByIdAndUpdate({ _id: item.Inventory }, {
                                                                    Stock: parseFloat(infoInventary.Stock - item.Quantity),
                                                                }).then(function (update) {
                                                                    if (!update) {

                                                                    }
                                                                    else {
                                                                        outputDataDetail.push({
                                                                            SaleInvoiceDetail: item._id,
                                                                            ProductOutput: salidaId,
                                                                            Quantity: item.Quantity,
                                                                            Inventory: infoInventary._id,
                                                                            ProductName: item.ProductName,
                                                                            Price: item.Price,
                                                                            Measure: item.Measure,
                                                                            CodProduct: item.CodProduct,
                                                                            Product: item.Product
                                                                        });
                                                                        productOutputDetail.insertMany(outputDataDetail).then(function (outputStored) {
                                                                            console.log("INSERTANDO SALIDA DETALLE");
                                                                            console.log(outputStored);
                                                                            if (outputStored) {
                                                                                const inventorytraceability = new inventoryTraceability();
                                                                                inventorytraceability.Quantity = item.Quantity;
                                                                                inventorytraceability.Product = item.Product;
                                                                                inventorytraceability.WarehouseDestination = null; //destino
                                                                                inventorytraceability.MovementType = movementId._id;
                                                                                inventorytraceability.MovDate = creacion;
                                                                                inventorytraceability.WarehouseOrigin = item.Inventory; //origen
                                                                                inventorytraceability.User = User;
                                                                                inventorytraceability.Company = companyId;
                                                                                inventorytraceability.DocumentId = invoiceId;
                                                                                inventorytraceability.ProductDestiny = null;
                                                                                inventorytraceability.Cost = parseFloat(item.Quantity) * parseFloat(item.Price);
                                                                                inventorytraceability.save((err, traceabilityStored) => {
                                                                                    if (err) {
                                                                                        // res.status(500).send({message: err});

                                                                                    } else {
                                                                                        if (!traceabilityStored) {
                                                                                            // res.status(500).send({message: "Error al crear el nuevo usuario."});
                                                                                            console.log(traceabilityStored);
                                                                                        }
                                                                                        else {

                                                                                        }
                                                                                    }
                                                                                });

                                                                            }
                                                                        }).catch(err => console.log(err))
                                                                        console.log('id del moviminto de reserva', movementId);
                                                                        //registro de movimiento

                                                                        res.status(200).send({ orden: detalles });
                                                                    }
                                                                })
                                                                    .catch(err => { console.log(err); });

                                                                //stock de bodega de reserva
                                                                console.log(infoInventary.Product);

                                                            }
                                                            else if (parseFloat(productreserved.Stock) >= parseFloat(item.Quantity) && companyParams.AvailableReservation) {
                                                                console.log("EMPRESA HABILITADA PARA RESERVAS");
                                                                console.log('BODEGA RESERVA');
                                                                console.log(productreserved);

                                                                //actualizando el stock de reserva
                                                                inventory.findByIdAndUpdate({ _id: productreserved._id }, {
                                                                    Stock: parseFloat(productreserved.Stock - item.Quantity),
                                                                }).then(function (update) {
                                                                    if (!update) {
                                                                        res.status(500).send({ message: "No se actualizo inventario" });
                                                                    } else {
                                                                        outputDataDetail.push({
                                                                            SaleInvoiceDetail: item._id,
                                                                            ProductOutput: salidaId,
                                                                            Quantity: item.Quantity,
                                                                            Inventory: productreserved._id,
                                                                            ProductName: item.ProductName,
                                                                            Price: item.Price,
                                                                            Measure: item.Measure,
                                                                            CodProduct: item.CodProduct,
                                                                            Product: item.Product
                                                                        });
                                                                        productOutputDetail.insertMany(outputDataDetail).then(function (outputStored) {
                                                                            console.log("INSERTANDO SALIDA DETALLE");
                                                                            console.log(outputStored);
                                                                            if (outputStored) {
                                                                                const inventorytraceability = new inventoryTraceability();
                                                                                inventorytraceability.Quantity = item.Quantity;
                                                                                inventorytraceability.Product = item.Product;
                                                                                inventorytraceability.WarehouseDestination = null; //destino
                                                                                inventorytraceability.MovementType = movementId._id;
                                                                                inventorytraceability.MovDate = creacion;
                                                                                inventorytraceability.WarehouseOrigin = productreserved._id; //origen
                                                                                inventorytraceability.User = User;
                                                                                inventorytraceability.Company = companyId;
                                                                                inventorytraceability.DocumentId = invoiceId;
                                                                                inventorytraceability.ProductDestiny = null;
                                                                                inventorytraceability.Cost = parseFloat(item.Quantity) * parseFloat(item.Price);
                                                                                inventorytraceability.save((err, traceabilityStored) => {
                                                                                    if (err) {

                                                                                        res.status(500).send({ message: "No se actualizo inventario" });
                                                                                    } else {
                                                                                        if (!traceabilityStored) {
                                                                                            // // res.status(500).send({message: "Error al crear el nuevo usuario."});
                                                                                            // console.log(traceabilityStored);
                                                                                        }
                                                                                        else {
                                                                                            console.log(traceabilityStored);
                                                                                        }
                                                                                    }
                                                                                });
                                                                            }
                                                                        }).catch(err => console.log(err));


                                                                    }

                                                                })
                                                                    .catch(err => { console.log(err); });

                                                            }
                                                            else {

                                                                res.status(500).send({ message: "Verificar Inventario" });

                                                            }


                                                        })


                                                    }
                                                }
                                            });

                                            res.status(200).send({ orden: detalles })
                                        }
                                        else {
                                            res.status(200).send({ orden: detalles });
                                        }
                                    } else {
                                        res.status(500).send({ message: "No se registraron detalles" });
                                    }


                                })
                                .catch(function (err) {
                                    console.log(err);
                                });
                        }

                    }


                }
            }
        })


    }

    if (!companyParams.OrderWithWallet && deudor) {
        res.status(500).send({ message: "No se puede registrar orden de venta a cliente" });
    }

}


function getSaleInvoiceDetails(req, res) {
    //se usa al momento de editar una factura, se encarga de mostrar el detalle de la factura que se va a editar
    let invoiceId = req.params.id;

    saleOrderInvoiceDetails.find({ SaleOrderInvoice: invoiceId }).populate({
        path: 'Inventory', model: 'Inventory',
        populate: ({ path: 'Bodega', model: 'Bodega', match: { Name: 'Principal' } }),
        populate: ({
            path: 'Product', model: 'Product',
            populate: { path: 'Measure', model: 'Measure' }
        }
        )
    }).populate({ path: 'SaleOrderInvoice', model: 'SaleOrderInvoice' })
        .then(details => {
            if (!details) {
                res.status(404).send({ message: "No hay " });
            } else {
                res.status(200).send({ details })
            }
        });
}

function getExportInfoFacturas(req, res) {
    let Company = req.params.id;
    console.log(Company);
    //exportar todo el detalle de la facturas (para generar archivo excel)
    saleOrderInvoiceDetails.find().populate({
        path: 'Inventory', model: 'Inventory',
        populate: ({ path: 'Bodega', model: 'Bodega', match: { Name: 'Principal' } }),
        populate: ({
            path: 'Product', model: 'Product',
            populate: { path: 'Measure', model: 'Measure' }
        }
        )
    }).populate({ path: 'SaleOrderInvoice', model: 'SaleOrderInvoice' })
        .populate({ path: 'User', model: 'User', match: { Company: Company } })
        .then(details => {
            if (!details) {
                res.status(404).send({ message: "No hay " });
            } else {
                res.status(200).send({ details })
            }
        });
}

async function updateSaleOrderInvoice(req, res) {
    let invoiceId = req.params.id;
    let invoiceDetalle = req.body.details; //productos nuevos
    let detailsAnt = req.body.ordenAnt; //productos que ya estaban en la factura
    let companyId = req.body.Company;
    let Customer = req.body.Customer;
    let iva = req.body.iva;
    let User = req.body.User;
    let updateInvoice = {};
    let tipoProveedor = req.body.tipoProveedor;
    let entryDataDetail = [];
    let now = new Date();
    let fecha = now.getTime();

    let creacion = now.toISOString().substring(0, 10);

    updateInvoice.Customer = req.body.Customer;
    updateInvoice.InvoiceNumber = req.body.InvoiceNumber;
    updateInvoice.Total = parseFloat((req.body.Total).toFixed(2));
    updateInvoice.InvoiceComments = req.body.InvoiceComments;
    updateInvoice.InvoiceDate = req.body.InvoiceDate;
    updateInvoice.iva = req.body.iva;

    let detallePrev = {};
    let detalle = [];
    let idEntry;
    let outputDataDetail = [];

    //obteniendo informacion de la compañia para validar
    let companyParams = await company.findById(companyId) //esta variable la mando a llamar luego que se ingreso factura
        .then(params => {
            if (!params) {
                res.status(404).send({ message: "No hay " });
            } else {
                return (params)
            }
        });

    //Deuda ppor cobrar actual
    let deudaAct = await customer.findOne({ _id: Customer }).then(function (doc) {
        console.log(doc);
        if (doc) {
            if (doc.AccountsReceivable !== null) {
                return (doc.AccountsReceivable)
            }
        }
    });

    saleOrderInvoice.findByIdAndUpdate({ _id: invoiceId }, updateInvoice, async (err, invoiceUpdate) => { //actualiza datos
        if (err) {
            res.status(500).send({ message: "Error del Servidor." });
            console.log(err);
        } else {
            if (!invoiceUpdate) {

                res.status(404).send({ message: "No se actualizo registro" });
            }
            else {

                let codInvoice;
                let idd = await saleOrderDetails.find({ SaleOrder: invoiceId }).then(function (doc) {  //obtiendi id del detalles de la orden
                    if (doc) {
                        if (doc.CodInvoice !== null) {
                            return (doc._id)
                        }
                    }
                });
                console.log('id', idd);
                if (detailsAnt.length > 0) {

                    detailsAnt.map(async item => {
                        codDetail = item._id;
                        detallePrev.ProductName = item.ProductName;
                        detallePrev.Quantity = parseFloat(item.Quantity),
                            detallePrev.Discount = parseFloat(item.Discount),
                            detallePrev.Price = parseFloat(item.Price),
                            detallePrev.PriceDiscount = parseFloat(item.PriceDiscount),
                            detallePrev.Inventory = item.Inventory._id,
                            detallePrev.SubTotal = parseFloat((item.PriceDiscount) * (item.Quantity))
                        saleOrderInvoiceDetails.updateMany({ _id: item._id, SaleOrderInvoice: invoiceId }, detallePrev) //actualizamos la info de los prodcutos que ya estaban en la factura
                            .then(function (detalles) {
                                if (!companyParams.RequieredOutput) {

                                    productOutputDetail.findOneAndUpdate({ SaleInvoiceDetail: item._id }, {
                                        Quantity: parseFloat(item.Quantity),
                                        Inventory: item.Inventory._id
                                    }).then((detalles) => { });


                                }
                            })
                            .catch(function (err) {
                                console.log(err);
                            });


                    });

                    console.log('-------');
                    console.log('ENTRADA', idEntry);
                    console.log('ENTRADA', codInvoice);
                    console.log('-------');
                }

                if (invoiceDetalle.length > 0) {
                    invoiceDetalle.map(async item => {
                        detalle.push({  //se hace el arreglo con los productos nuevos que seran agreados a la factura
                            ProductName: item.Name,
                            SaleOrderInvoice: invoiceId,
                            Quantity: parseFloat(item.Quantity),
                            Discount: parseFloat(item.Discount),
                            Price: parseFloat(item.GrossSellPrice),
                            Inventory: item.Inventory,
                            SubTotal: parseFloat(item.total),
                            Entregados: !companyParams.RequieredOutput ? parseFloat(item.Quantity) : 0,
                            State: !companyParams.RequieredOutput ? true : false,
                            Measure: item.Measures,
                            CodProduct: item.codproducts,
                            Product: item.ProductId,

                            iniQuantity: item.Quantity,
                            BuyPrice: parseFloat(item.BuyPrice),
                            PriceDiscount: parseFloat(item.PrecioDescuento) ?
                                parseFloat(item.PrecioDescuento) : parseFloat(item.Descuento)
                        })
                    });
                    console.log("DETALLLES A INSETRTAR", detalle);
                    if (detalle.length > 0) {
                        saleOrderInvoiceDetails.insertMany(detalle)  //agregamos los productos nuevos
                            .then(async function (detalleStored) {
                                console.log(detalleStored);
                                console.log("INSERTADOS");
                                let outputId = await productOutput.findOne({ SaleOrderInvoice: invoiceId })
                                    .then(entry => {
                                        if (entry !== null) {
                                            return entry._id;
                                        } else { return null }

                                    }).catch(err => { console.log(err); })
                                console.log(invoiceId);
                                console.log(outputId);

                                //verificar si la empresa tenia deshabilitado el ingreso requerido
                                if (!companyParams.RequieredOutput) {
                                    //esto es para registrar la salida de los nuevos productos que fueron agregados
                                    detalleStored.map(item => {
                                        outputDataDetail.push({
                                            SaleInvoiceDetail: item._id,
                                            ProductOutput: outputId,
                                            Quantity: item.Quantity,
                                            Inventory: item.Inventory,
                                            ProductName: item.ProductName,
                                            Price: item.Price,
                                            Measure: item.Measure,
                                            CodProduct: item.CodProduct,
                                            Product: item.Product
                                        });
                                        productOutputDetail.insertMany(outputDataDetail).then(function (outputStored) { //registramos el detalle de la salida o sea el producto
                                            console.log("INSERTANDO SALIDA DETALLE");
                                            console.log(outputStored);
                                            if (outputStored) {

                                            }
                                        });

                                    })
                                }


                            })
                            .catch(function (err) {
                                console.log(err);
                            });
                    }
                }
                if (!companyParams.RequieredOutput) {
                    console.log("CALCULOS POR INGRESO REQUERIDO");
                    //ACTULIZACION DEL INVENTARIO DE TODOS LOS PRODCUTOS INGRESADOS TANTO NUEVOS COMO ANTIGUOS
                    saleOrderInvoiceDetails.find({ SaleOrderInvoice: invoiceId }).then(function (detalles) {
                        detalles.map(async item => {

                            //obteniendo stock de producto  (bodega principal)
                            let infoInventary = await inventory.findOne({ _id: item.Inventory }, ['Stock', 'Product'])
                                .then(resultado => { return resultado }).catch(err => { console.log("error en proveedir"); return err });
                            console.log('EN STOCK:', infoInventary);

                            //obteniendo stock de la bodega de reserva
                            let productreserved = await inventory.findOne({ Product: infoInventary.Product, _id: { $nin: infoInventary._id } }, ['Stock', 'Product'])
                                .populate({ path: 'Bodega', model: 'Bodega', match: { Name: 'Reserva' } })
                                .then(resultado => { return resultado }).catch(err => { console.log("error en proveedir"); return err });

                            //obteniendo id del movimiento de tipo reserva
                            let movementId = await MovementTypes.findOne({ Name: 'salida' }, ['_id'])
                                .then(resultado => { return resultado }).catch(err => { console.log("error en proveedir"); return err });

                            if (parseFloat(infoInventary.Stock) >= parseFloat(item.Quantity) && !companyParams.AvailableReservation) {
                                //MOVIENDO PRODCUTOS DE PRINCIPAL
                                //descontando cantidad que se reservara
                                inventory.findByIdAndUpdate({ _id: item.Inventory }, {
                                    Stock: parseFloat((infoInventary.Stock + parseFloat(item.iniQuantity)) - item.Quantity),
                                }).then(result => console.log(result))
                                    .catch(err => { console.log(err); });

                                //stock de bodega de reserva
                                console.log(infoInventary.Product);



                                console.log('id del moviminto de reserva', movementId);
                                //registro de movimiento
                                const inventorytraceability = new inventoryTraceability();
                                inventorytraceability.Quantity = item.Quantity;
                                inventorytraceability.Product = item.Product;
                                inventorytraceability.WarehouseDestination = productreserved._id; //destino
                                inventorytraceability.MovementType = movementId._id;
                                inventorytraceability.MovDate = creacion;
                                inventorytraceability.WarehouseOrigin = item.Inventory; //origen
                                inventorytraceability.User = User;
                                inventorytraceability.Company = companyId;
                                inventorytraceability.DocumentId = saleId;
                                inventorytraceability.ProductDestiny = null;
                                inventorytraceability.Cost = parseFloat(item.Quantity) * parseFloat(item.Price);

                                inventorytraceability.save((err, traceabilityStored) => {
                                    if (err) {
                                        // res.status(500).send({message: err});

                                    } else {
                                        if (!traceabilityStored) {
                                            // res.status(500).send({message: "Error al crear el nuevo usuario."});
                                            console.log(traceabilityStored);
                                        }
                                        else {
                                            saleOrderInvoiceDetails.findByIdAndUpdate({ _id: item._id }, {
                                                iniQuantity: parseFloat(item.Quantity),
                                            }).then(result => {
                                                console.log(result);
                                            })
                                                .catch(err => { console.log(err); });

                                        }
                                    }
                                });

                                res.status(200).send({ orden: detalles });
                            }

                            else if (parseFloat(productreserved.Stock) >= parseFloat(item.Quantity) && companyParams.AvailableReservation) {
                                //MOVIENDO DE RESERVA
                                //se realiza descuento en la bodega de reserva
                                inventory.findByIdAndUpdate({ _id: productreserved._id }, {
                                    Stock: parseFloat((infoInventary.Stock + parseFloat(item.iniQuantity)) - item.Quantity),
                                }).then(result => console.log(result))
                                    .catch(err => { console.log(err); });


                                //stock de bodega de reserva
                                console.log(infoInventary.Product);
                                console.log('id del moviminto de reserva', movementId);
                                //registro de movimiento
                                const inventorytraceability = new inventoryTraceability();
                                inventorytraceability.Quantity = item.Quantity;
                                inventorytraceability.Product = item.Product;
                                inventorytraceability.WarehouseDestination = productreserved._id; //destino
                                inventorytraceability.MovementType = movementId._id;
                                inventorytraceability.MovDate = creacion;
                                inventorytraceability.WarehouseOrigin = item.Inventory; //origen
                                inventorytraceability.User = User;
                                inventorytraceability.Company = companyId;
                                inventorytraceability.DocumentId = invoiceId;
                                inventorytraceability.ProductDestiny = null;
                                inventorytraceability.Cost = parseFloat(item.Quantity) * parseFloat(item.Price);

                                inventorytraceability.save((err, traceabilityStored) => {
                                    if (err) {
                                        // res.status(500).send({message: err});

                                    } else {
                                        if (!traceabilityStored) {
                                            // res.status(500).send({message: "Error al crear el nuevo usuario."});
                                            console.log(traceabilityStored);
                                        }
                                        else {
                                            saleOrderInvoiceDetails.findByIdAndUpdate({ _id: item._id }, {
                                                iniQuantity: parseFloat(item.Quantity),
                                            }).then(result => {
                                                console.log("ini", result);
                                            })
                                                .catch(err => { console.log(err); });
                                        }
                                    }
                                });


                            }
                            else {

                                res.status(500).send({ message: "Verificar Inventario" });
                            }

                        })

                    }).catch(function (err) { console.log(err); })
                }

                res.status(200).send({ invoice: invoiceUpdate });
            }
        }
    });

}

async function deleteSaleInvoiceDetails(req, res) {
    const { _id, Quantity, Inventory, User, Customer, TotalAct, Total, SubTotal } = req.body;
    let now = new Date();
    let fecha = now.getTime();

    let creacion = now.toISOString().substring(0, 10);
    let companyId = Inventory.Company;
    console.log(req.body);
    //obteniendo informacion de la compañia para validar
    let companyParams = await company.findById(companyId) //esta variable la mando a llamar luego que se ingreso factura
        .then(params => {
            if (!params) {
                res.status(404).send({ message: "No hay " });
            } else {
                return (params)
            }
        });

    //Deuda ppor cobrar actual
    let deudaAct = await customer.findOne({ _id: Customer }).then(function (doc) {
        console.log(doc);
        if (doc) {
            if (doc.AccountsReceivable !== null) {
                return (doc.AccountsReceivable)
            }
        }
    });
    console.log("deuda", deudaAct);
    saleOrderInvoiceDetails.find({ _id: _id }).then(function (detalles) {
        //cuenta por cobrar
        let nuevaCuenta = parseFloat(deudaAct) - parseFloat(SubTotal); //calculo de saldo a cobrar
        customer.findByIdAndUpdate({ _id: Customer }, {
            AccountsReceivable: nuevaCuenta.toFixed(2),
        }).then(function (update) {
            if (!update) {

            }
            else { }
        }).catch(err => { console.log(err) });
        //MOVIMIENTO DE INVENTARIO
        detalles.map(async item => {
            //obteniendo stock de producto  (bodega principal)
            let infoInventary = await inventory.findOne({ _id: item.Inventory }, ['Stock', 'Product'])
                .then(resultado => { return resultado }).catch(err => { console.log("error en proveedir"); return err });
            console.log('EN STOCK:', infoInventary);
            //obteniendo stock de la bodega de reserva
            let productreserved = await inventory.findOne({ Product: infoInventary.Product, _id: { $nin: infoInventary._id } }, ['Stock', 'Product'])
                .populate({ path: 'Bodega', model: 'Bodega', match: { Name: 'Reserva' } })
                .then(resultado => { return resultado }).catch(err => { console.log("error en proveedir"); return err });
            console.log('BODEGA RESERVA');
            console.log(productreserved);

            //obteniendo id del movimiento de tipo reserva
            let movementId = await MovementTypes.findOne({ Name: 'reversion' }, ['_id'])
                .then(resultado => { return resultado }).catch(err => { console.log("error en proveedir"); return err });

            if (!companyParams.AvailableReservation) { //SI COMPAÑIA NO ESTA HABILITADA PARA RESERVA
                //AGREGANDO EL PRODDUCTO A LA BODEGA PRINCIPAL
                inventory.findByIdAndUpdate({ _id: item.Inventory }, {
                    Stock: parseFloat((infoInventary.Stock + parseFloat(item.Quantity))),
                }).then(result => console.log(result))
                    .catch(err => { console.log(err); });

                //stock de bodega de reserva
                console.log(infoInventary.Product);

                console.log('id del moviminto de reserva', movementId);
                //registro de movimiento
                const inventorytraceability = new inventoryTraceability();
                inventorytraceability.Quantity = item.Quantity;
                inventorytraceability.Product = item.Product;
                inventorytraceability.WarehouseDestination = infoInventary._id; //destino
                inventorytraceability.MovementType = movementId._id;
                inventorytraceability.MovDate = creacion;
                inventorytraceability.WarehouseOrigin = null; //origen
                inventorytraceability.User = User;
                inventorytraceability.Company = companyId;
                inventorytraceability.DocumentId = item.SaleOrderInvoice;
                inventorytraceability.ProductDestiny = null;
                inventorytraceability.Cost = parseFloat(item.Quantity) * parseFloat(item.Price);

                inventorytraceability.save((err, traceabilityStored) => {
                    if (err) {
                        // res.status(500).send({message: err});

                    } else {
                        if (!traceabilityStored) {
                            // res.status(500).send({message: "Error al crear el nuevo usuario."});
                            console.log(traceabilityStored);
                        }
                        else {
                            saleOrderInvoiceDetails.findByIdAndDelete(_id, (err, detailDeleted) => {
                                if (err) {
                                    res.status(500).send({ message: "Error del servidor." });
                                } else {
                                    if (!detailDeleted) {
                                        res.status(404).send({ message: "Detalle no encontrado" });
                                    } else {

                                        res.status(202).send({ deleted: detailDeleted });
                                    }
                                }
                            })

                        }
                    }
                });

            }
            if (companyParams.AvailableReservation) { //HABILITADA BODE RESERVA
                //REGRESANDO EL PRODCUTO A LA RESERVA
                inventory.findByIdAndUpdate({ _id: productreserved._id }, {
                    Stock: parseFloat((productreserved.Stock + parseFloat(item.Quantity))),
                }).then(result => console.log(result))
                    .catch(err => { console.log(err); });

                //stock de bodega de reserva
                console.log(productreserved.Product);



                console.log('id del moviminto de reserva', movementId);
                //registro de movimiento
                const inventorytraceability = new inventoryTraceability();
                inventorytraceability.Quantity = item.Quantity;
                inventorytraceability.Product = item.Product;
                inventorytraceability.WarehouseDestination = productreserved._id; //destino
                inventorytraceability.MovementType = movementId._id;
                inventorytraceability.MovDate = creacion;
                inventorytraceability.WarehouseOrigin = null; //origen
                inventorytraceability.User = User;
                inventorytraceability.Company = companyId;
                inventorytraceability.DocumentId = item.SaleOrderInvoice;
                inventorytraceability.ProductDestiny = null;
                inventorytraceability.Cost = parseFloat(item.Quantity) * parseFloat(item.Price);

                inventorytraceability.save((err, traceabilityStored) => {
                    if (err) {
                        // res.status(500).send({message: err});

                    } else {
                        if (!traceabilityStored) {
                            // res.status(500).send({message: "Error al crear el nuevo usuario."});
                            console.log(traceabilityStored);
                        }
                        else {
                            saleOrderInvoiceDetails.findByIdAndDelete(_id, (err, detailDeleted) => {
                                if (err) {
                                    res.status(500).send({ message: "Error del servidor." });
                                } else {
                                    if (!detailDeleted) {
                                        res.status(404).send({ message: "Detalle no encontrado" });
                                    } else {

                                        res.status(202).send({ deleted: detailDeleted });
                                    }
                                }
                            })
                        }
                    }
                });

            }
        })

    })
}

async function anularSaleInovice(req, res) {
    let invoiceId = req.params.id;
    let companyId = req.body.Customer.Company;
    let Customer = req.body.Customer._id;
    let saleOrder = req.body.SaleOrder;
    let User = req.body.User;
    let Total = req.body.Total;
    console.log(req.body);
    const codigop = req.body.CodProduct;
    let creacion = moment().format('DD/MM/YYYY');

    //obtiendo informacion de la compañia
    let companyParams = await company.findById(companyId) //esta variable la mando a llamar luego que se ingreso factura
        .then(params => {
            if (!params) {
                res.status(404).send({ message: "No hay " });
            } else {
                return (params)
            }
        });

    //Deuda ppor cobrar actual
    let deudaAct = await customer.findOne({ _id: Customer }).then(function (doc) {
        console.log(doc);
        if (doc) {
            if (doc.AccountsReceivable !== null) {
                return (doc.AccountsReceivable)
            }
        }
    });


    saleOrderInvoice.findByIdAndUpdate({ _id: invoiceId }, { State: "Anulada" }, async (err, update) => {  //cambiando el estado de factura
        if (err) {
            res.status(500).send({ message: "Error del servidor." });
        }
        if (update) {
            //cuenta por cobrar
            let nuevaCuenta = parseFloat(deudaAct) - parseFloat(Total)
            customer.findByIdAndUpdate({ _id: Customer }, {
                AccountsReceivable: nuevaCuenta.toFixed(2),
            }).then(function (update) {
                if (!update) {

                }
                else { }
            }).catch(err => { console.log(err) });

            if (saleOrder !== null) {  //si factura se genero con orden de venta se tiene que cambiar el estado de la orden de venta
                saleOrders.findByIdAndUpdate({ _id: saleOrder }, { State: "Cerrada" }, async (err, update) => {
                    if (err) {
                        res.status(500).send({ message: "Error del servidor." });
                    }
                    if (update) { }
                })
            }
            saleOrderInvoiceDetails.find({ SaleOrderInvoice: invoiceId }) //obtenemos los detales de la factura para poder realizar el movimiento de inventario
                .then(function (detalles) {

                    detalles.map(async item => {
                        //obteniendo stock de producto  (bodega principal)
                        let infoInventary = await inventory.findOne({ _id: item.Inventory }, ['Stock', 'Product'])
                            .then(resultado => { return resultado }).catch(err => { console.log("error en proveedir"); return err });
                        console.log('EN STOCK:', infoInventary);

                        //obteniendo stock de la bodega de reserva
                        let productreserved = await inventory.findOne({ Product: infoInventary.Product, _id: { $nin: infoInventary._id } }, ['Stock', 'Product'])
                            .populate({ path: 'Bodega', model: 'Bodega', match: { Name: 'Reserva' } })
                            .then(resultado => { return resultado }).catch(err => { console.log("error en proveedir"); return err });


                        //obteniendo id del movimiento de tipo reserva
                        let movementId = await MovementTypes.findOne({ Name: 'reversion' }, ['_id'])
                            .then(resultado => { return resultado }).catch(err => { console.log("error en proveedir"); return err });
                        if (!companyParams.AvailableReservation) {  //compañia no habilitada para reserva
                            //regresando producto a la bodega principal
                            inventory.findByIdAndUpdate({ _id: item.Inventory }, {
                                Stock: parseFloat((infoInventary.Stock + parseFloat(item.Quantity))),
                            }).then(result => console.log(result))
                                .catch(err => { console.log(err); });

                            //stock de bodega de reserva
                            console.log(infoInventary.Product);

                            console.log('id del moviminto de reserva', movementId);
                            //registro de movimiento
                            const inventorytraceability = new inventoryTraceability();
                            inventorytraceability.Quantity = item.Quantity;
                            inventorytraceability.Product = item.Product;
                            inventorytraceability.WarehouseDestination = infoInventary._id; //destino
                            inventorytraceability.MovementType = movementId._id;
                            inventorytraceability.MovDate = creacion;
                            inventorytraceability.WarehouseOrigin = null; //origen
                            inventorytraceability.User = User;
                            inventorytraceability.Company = companyId;
                            inventorytraceability.DocumentId = item.SaleOrderInvoice;
                            inventorytraceability.ProductDestiny = null;
                            inventorytraceability.Cost = parseFloat(item.Quantity) * parseFloat(item.Price);

                            inventorytraceability.save((err, traceabilityStored) => {
                                if (err) {
                                    // res.status(500).send({message: err});

                                } else {
                                    if (!traceabilityStored) {
                                        // res.status(500).send({message: "Error al crear el nuevo usuario."});
                                        console.log(traceabilityStored);
                                    }
                                    else { }
                                }
                            })
                        }
                        if (companyParams.AvailableReservation) {  //emprsa habilitada para reservar producto
                            //regresando el producto a la bodega de reserva
                            inventory.findByIdAndUpdate({ _id: productreserved._id }, {
                                Stock: parseFloat((productreserved.Stock + parseFloat(item.Quantity))),
                            }).then(result => console.log(result))
                                .catch(err => { console.log(err); });

                            //stock de bodega de reserva
                            console.log(productreserved.Product);

                            console.log('id del moviminto de reserva', movementId);
                            //registro de movimiento
                            const inventorytraceability = new inventoryTraceability();
                            inventorytraceability.Quantity = item.Quantity;
                            inventorytraceability.Product = item.Product;
                            inventorytraceability.WarehouseDestination = productreserved._id; //destino
                            inventorytraceability.MovementType = movementId._id;
                            inventorytraceability.MovDate = creacion;
                            inventorytraceability.WarehouseOrigin = null; //origen
                            inventorytraceability.User = User;
                            inventorytraceability.Company = companyId;
                            inventorytraceability.DocumentId = item.SaleOrderInvoice;
                            inventorytraceability.ProductDestiny = null;
                            inventorytraceability.Cost = parseFloat(item.Quantity) * parseFloat(item.Price);
                            inventorytraceability.save((err, traceabilityStored) => {
                                if (err) {
                                    // res.status(500).send({message: err});

                                } else {
                                    if (!traceabilityStored) {
                                        // res.status(500).send({message: "Error al crear el nuevo usuario."});
                                        console.log(traceabilityStored);
                                    }
                                    else { }
                                }
                            })
                        }
                    })
                })
                .catch(err => { console.log(err) });
            res.status(202).send({ updated: update });

        } else {
            res.status(404).send({ message: "No se anulo factura" });

        }
    });
}


async function getSaleInvoicesNoPagadas(req, res) {
    const { id, company } = req.params;
    //se usa para registrar los cobros a la facturas

    saleOrderInvoice.find({ User: id, Pagada: false }).populate({ path: 'Customer', model: 'Customer', match: { Company: company } })
        .then(invoices => {
            if (!invoices) {
                res.status(404).send({ message: "No hay " });
            } else {

                res.status(200).send({ invoices })
            }
        });
}
function getSaleInvoiceHeader(req, res) {
    //se utiliza para exportar
    let invoiceId = req.params.id;
    let userId = req.params.user;
    let companyId = req.params.company;
    saleOrderInvoice.find({ _id: invoiceId }).populate({ path: 'User', model: 'User', match: { _id: userId } })
        .populate({ path: 'Customer', model: 'Customer', match: { Company: companyId } })
        .then(details => {
            if (!details) {
                res.status(404).send({ message: "No hay " });
            } else {
                res.status(200).send({ details })
            }
        });
}


function getSaleInvoicePendientesIngreso(req, res) {

    //para mostrar las factura que tiene pendiente una salida (crud de salidas)
    saleOrderInvoice.find({ Entregada: false, User: req.params.id }).populate({ path: 'Customer', model: 'Customer' })
        .then(invoices => {
            if (!invoices) {
                res.status(404).send({ message: "No hay " });
            } else {
                res.status(200).send({ invoices })
            }
        });
}


function getChargestoCustomers(req, res) {
    const { id, user, profile } = req.params;
    var ObjectID = require('mongodb').ObjectID
    //obteniendo cobros de los clientes relacionado con las facturas
    if (profile === "Admin") {

        customer.aggregate([
            {
                $match:
                {
                    $expr:
                    {
                        $and:
                            [
                                { $ne: ["$AccountsReceivable", 0] },
                                { User: user }
                            ]
                    }
                }
            },
            {

                $lookup: {
                    from: "companies",
                    let: { companyId: "$Company" },
                    pipeline: [
                        {
                            $match:
                            {
                                $expr:
                                {
                                    $and:
                                        [
                                            { $eq: ["$_id", "$$companyId"] },
                                            { _id: id }
                                        ]
                                }
                            }
                        },

                    ],
                    as: "company"
                }
            },
            {

                $lookup: {
                    from: "saleorderinvoices",
                    let: { customerId: "$_id" },
                    pipeline: [
                        {
                            $match:
                            {
                                $expr:
                                {
                                    $and:
                                        [
                                            { $eq: ["$Customer", "$$customerId"] },
                                            { $eq: ["$Pagada", false] },
                                            { $ne: ["$State", "Anulada"] },
                                        ]
                                }
                            }
                        },
                        {
                            $lookup: {
                                from: "customerpayments",
                                let: { invoiceId: "$_id" },
                                pipeline: [
                                    {
                                        $match:
                                        {
                                            $expr:

                                                { $eq: ["$SaleOrderInvoice", "$$invoiceId"] }

                                        }
                                    },

                                ],
                                as: "pagos"
                            }
                        }

                    ],
                    as: "invoices",

                }
            },


        ])
            .then(result => {
                if (!result) {
                    res.status(404).send({ message: "No hay " });
                } else {

                    console.log(result);
                    var invoice = result.filter(function (item) {
                        return (item.Company).toString() === id;
                    });
                    res.status(200).send({ invoice })
                }
            });
    } else {
        customer.aggregate([
            {
                $match:
                {
                    $expr:
                    {
                        $and:
                            [
                                { $ne: ["$AccountsReceivable", 0] },
                                { Company: ObjectID(id) }
                            ]
                    }
                }
            },
            {

                $lookup: {
                    from: "companies",
                    let: { companyId: "$Company" },
                    pipeline: [
                        {
                            $match:
                            {
                                $expr:
                                {
                                    $and:
                                        [
                                            { $eq: ["$_id", "$$companyId"] },
                                            { _id: id }
                                        ]
                                }
                            }
                        },

                    ],
                    as: "company"
                }
            },
            {

                $lookup: {
                    from: "saleorderinvoices",
                    let: { customerId: "$_id" },
                    pipeline: [
                        {
                            $match:
                            {
                                $expr:
                                {
                                    $and:
                                        [
                                            { $eq: ["$Customer", "$$customerId"] },
                                            { $eq: ["$Pagada", false] },
                                            { $ne: ["$State", "Anulada"] },
                                        ]
                                }
                            }
                        },
                        {
                            $lookup: {
                                from: "customerpayments",
                                let: { invoiceId: "$_id" },
                                pipeline: [
                                    {
                                        $match:
                                        {
                                            $expr:

                                                { $eq: ["$SaleOrderInvoice", "$$invoiceId"] }

                                        }
                                    },

                                ],
                                as: "pagos"
                            }
                        }

                    ],
                    as: "invoices",

                }
            },


        ])
            .then(result => {
                if (!result) {
                    res.status(404).send({ message: "No hay " });
                } else {
                    var ObjectID = require('mongodb').ObjectID
                    console.log(result);
                    var invoice = result.filter(function (item) {
                        return (item.Company).toString() === id;
                    });
                    res.status(200).send({ invoice })
                }
            });
    }

}


function getSaleOrderInvoicebyCustomers(req, res) {
    //para obtener las facturas por cada cliente de acuerdo a un rango de fechas
    let supplierId = req.params.id;
    let companyId = req.params.company;
    let f1 = new Date(req.params.fecha1);
    let f2 = new Date(req.params.fecha2);
    var ObjectID = require('mongodb').ObjectID
    let antCod = 0;
    let now = new Date();
    let fecha = now.getTime();
    var date = new Date(fecha);

    // date.setMonth(date.getMonth() - 1/2);
    date.setDate(date.getDate() - 15);
    let fecha1 = now.toISOString().substring(0, 10);
    let fecha2 = date.toISOString().substring(0, 10);
    console.log("gola");
    try {

        saleOrderInvoice.aggregate([
            { $match: { Customer: ObjectID(supplierId) } },

            {
                $lookup: {
                    from: "saleinvoicedetails",

                    let: { ordenId: "$_id" },
                    pipeline: [
                        {
                            $match:
                            {
                                $expr:

                                    { $eq: ["$SaleOrderInvoice", "$$ordenId"] }

                            }
                        },
                        {
                            "$lookup": {
                                "from": "products",
                                "let": { "productId": "$Product" },
                                "pipeline": [
                                    {
                                        $match: {
                                            $expr:

                                                { $eq: ["$_id", "$$productId"] }

                                        }
                                    },
                                    {
                                        "$lookup": {
                                            "from": "measures",
                                            let: { catId: "$Measure" },
                                            pipeline: [
                                                {
                                                    $match:
                                                    {
                                                        $expr:

                                                            { $eq: ["$_id", "$$catId"] }

                                                    }
                                                },
                                            ],
                                            as: "medidas"
                                        }

                                    }
                                ],
                                "as": "producto"
                            }
                        }


                    ],
                    as: "detalles",

                },



            },

        ]).then(result => {
            var order = result.filter(function (item) {
                let fecha = new Date(item.CreationDate);
                console.log("creacion", fecha);
                console.log("f1", f1);
                console.log("f2", f2);
                return fecha >= f2 && fecha <= f1;
            });
            res.status(200).send(order);

        })
    } catch (error) {
        // imprimimos a consola
        console.log(error);

        res.status(500).json({
            message: "Error!",
            error: error
        });
    }
}


async function funcionPruebaCorrelativos(req, res) {
    const { Company, Customer, details } = req.body;
    let companyParams = await company.findById(Company) //esta variable la mando a llamar luego que se ingreso factura
        .then(params => {
            if (!params) {
                res.status(404).send({ message: "No hay " });
            } else {
                return (params)
            }
        });

    //Deuda ppor cobrar actual
    let customerType = await customer.findOne({ _id: Customer }).then(function (doc) {
        console.log(doc);
        if (doc) {
            if (doc.TypeofTaxpayer !== null) {
                return (doc.TypeofTaxpayer)
            }
        }
    });
    let correlativos = await correlativeDocument.findOne({ State: true }).populate({ path: 'DocumentType', model: 'DocumentType', match: { Ref: customerType.TypeofTaxpayer } })
        .then(docCorrelative => {
            if (docCorrelative) {
                return docCorrelative
            }

        });



    let lengEndNumber = (correlativos.EndNumber).toString().length;
    let nLineas = parseInt(companyParams.InvoiceLines);
    let iniNumber = correlativos.StartNumber;

    console.log(iniNumber);
    console.log("lineas", nLineas);
    let longitudArreglo = details.length;
    console.log(longitudArreglo);
    let saltoCorrelativo = parseInt(iniNumber);
    let obj = [];
    let nuevo = [];
    var arreglo;
    let correlativosid = [];

    let contador = 0;
    let i = 0;
    let step = 0;
    let correlativeNumber = parseInt(iniNumber);
    console.log(longitudArreglo);
    let deOrden = [];
    while (contador < longitudArreglo) {


        while (correlativeNumber.toString().length < lengEndNumber) {
            correlativeNumber = "0" + correlativeNumber;

        }
        console.log("save", correlativeNumber);
        console.log("contador", contador);
        for (let i = 0; i < nLineas; i++) {

            if (details[contador + i]) {
                //    console.log("prueba",details[contador+ i].dato);
                deOrden.push({
                    ProductName: details[contador + i].dato
                })

            }
            else { break }



        }
        console.log("lo que ingreso de detalle", deOrden);
        deOrden = []
        contador += nLineas;
        i += 1;

        correlativeNumber = parseInt(correlativeNumber) + 1;
        // console.log("el contador", contador);
        // console.log("paso",step);
    }
    console.log("i", i);




}

async function createSaleOrderInvoiceWithOrder2(req, res) {

    const SaleOrderInvoice = new saleOrderInvoice();
    const ProductOuput = new productOutput();
    const payment = new CustomerPayment();
    const paymentDetails = new CustomerPaymentDetails();
    let messageError = false;
    const saledetails = req.body.details;

    let dePurchaseOrder = req.body.ordenAnt;
    let addTaxes = req.body.impuestos;
    const detalle = [];
    let outputDataDetail = [];

    let deudor = false;
    moment.locale();
    // let creacion = moment().format('DD/MM/YYYY');
    let now = new Date();
    let creacion = now.toISOString().substring(0, 10);
    console.log("DETALLES", req.body);

    const { iva, InvoiceDate, CustomerName, SaleOrderId, CommentsSaleOrder, Total, User, companyId, InvoiceNumber, Customer, Comments,
        diasCredito, InvoiceComments, condicionPago, Reason, PaymentMethodName, PaymentMethodId,
        Monto, NumberAccount, BankName, NoTransaction, CashAccount, NumberAccountId, NumberAccountBank } = req.body;



    let details = [];
    let deOrden = [];
    let impuestos = [];


    let codigo = 0;
    let codigoSalidas = 0;

    ///////********OBTENIENDO CODIGOS DE MOVIMIENTOS Y TIPOS ******** */
    //TODO ESTO PARA EL REGISTRO DE TRANSACCIONES (SE VEN REFLEJADOS EN EL MODULO DE BANCO/CAKA)
    let idMovimiento;
    let idTipoMovimiento;
    let efectivoMovimiento;
    let tarjetaCreditoMov;
    let tarjetaTipo;
    let chequeMov;
    let chequeTipo;
    if (PaymentMethodName === "Transferencia") {
        idMovimiento = await bankMovement.findOne({ Name: 'Transferencias', Company: companyId }, ['_id'])
            .then(resultado => { return resultado }).catch(err => { console.log("error en proveedir"); return err });

        idTipoMovimiento = await movementType.findOne({ Name: 'Transferencia Externa', Company: companyId }, ['_id'])
            .then(resultado => { return resultado }).catch(err => { console.log("error en proveedir"); return err });

    }
    if (PaymentMethodName === "Contado") {
        efectivoMovimiento = await cashMovement.findOne({ Name: 'Ingreso', Company: companyId }, ['_id'])
            .then(resultado => { return resultado }).catch(err => { console.log("error en proveedir"); return err });
    }

    if (PaymentMethodName === "TarjetadeCredito") {
        tarjetaCreditoMov = await bankMovement.findOne({ Name: 'Operaciones con Tarjeta', Company: companyId }, ['_id'])
            .then(resultado => { return resultado }).catch(err => { console.log("error en proveedir"); return err });

        tarjetaTipo = await movementType.findOne({ Name: 'Tarjeta de Credito', Company: companyId }, ['_id'])
            .then(resultado => { return resultado }).catch(err => { console.log("error en proveedir"); return err });

    }
    if (PaymentMethodName === "Cheque") {
        chequeMov = await bankMovement.findOne({ Name: 'Abono', Company: companyId }, ['_id'])
            .then(resultado => { return resultado }).catch(err => { console.log("error en proveedir"); return err });

        chequeTipo = await movementType.findOne({ Name: 'Cheque', Company: companyId }, ['_id'])
            .then(resultado => { return resultado }).catch(err => { console.log("error en proveedir"); return err });

    }

    ///////********OBTENIENDO CODIGOS DE MOVIMIENTOS Y TIPOS fin ******** */

    //Obteniendo ultimi correlativo 
    let codigoSaleOrderInvoice = await saleOrderInvoice.findOne().sort({ CodInvoice: -1 })
        .populate({ path: 'Customer', model: 'Customer', match: { Company: companyId } }).then(function (doc) {

            if (doc) {
                if (doc.CodInvoice !== null) {
                    return (doc.CodInvoice)
                }
            }
        });
    //para generar el correctivo del ingreso en caso de que sea requerido
    let codOutput = await productOutput.findOne({ Company: companyId }).sort({ CodOutput: -1 })
        .populate({ path: 'Customer', model: 'Customer', match: { Company: companyId } }).then(function (doc) {
            if (doc) {
                if (doc.CodOutput !== null) {
                    return (doc.CodOutput)
                }
            }
        });
    //obteniendo informacion de la compañia para validar
    let companyParams = await company.findById(companyId) //esta variable la mando a llamar luego que se ingreso factura
        .then(params => {
            if (!params) {
                res.status(404).send({ message: "No hay " });
            } else {
                return (params)
            }
        });


    //Deuda ppor cobrar actual
    let deudaAct = await customer.findOne({ _id: Customer }).then(function (doc) {

        if (doc) {
            if (doc.AccountsReceivable !== null) {
                return (doc.AccountsReceivable)
            }
        }
    });
    let deuda = deudaAct;

    //OBTENIENDO TIPO DE CLIENTE
    let customerType = await customer.findOne({ _id: Customer }).then(function (doc) {
        if (doc) {
            if (doc.TypeofTaxpayer !== null) {
                return (doc.TypeofTaxpayer)
            }
        }
    });
    //obtener variable que indica si el cliente es excento de impuestos
    //excento=true  entonces no se aplican impuestos
    //excento=false se aplican todos los impuestos
    let excento = await customer.findOne({ _id: Customer }).then(function (doc) {
        if (doc) {
            if (doc.Exempt !== null) {
                return (doc.Exempt)
            }
        }
    });

    //verificar que tipo de contribuyentes  (consumidor final o credito fiscal)
    let contribuyente = await customer.findOne({ _id: Customer }).then(function (doc) {
        if (doc) {
            if (doc.Contributor !== null) {
                return (doc.Contributor)
            }
        }
    });

    var tipo = customerType.toString();
    //*************************************************** */

    //Correlativos para el manejo de facturas
    let correlativosselect = await correlativeDocument.find({ State: true })
        .populate({ path: 'DocumentType', model: 'DocumentType', match: { Referencia: tipo, Company: companyId } })
        .then(docCorrelative => {
            if (docCorrelative) {
                return docCorrelative
            }

        });
    var correlativos = correlativosselect.filter(function (item) {  //se filtra para evitar que venga un dato nulo
        return item.DocumentType != null;
    });



    let lengEndNumber = (correlativos.map(item => item.EndNumber)).toString().length; //para obtener la longitud del numero final del correlativo 
    let nLineas = parseInt(companyParams.InvoiceLines); //verificar parametro de compañia para determinar la cantidad de lineas  de la factura
    let iniNumber = correlativos.map(item => item.CurrentNumber);  //numero actual de correlativos

    let longitudArreglo = dePurchaseOrder.length;
    console.log(longitudArreglo);
    let contador = 0;
    let i = 0;
    let step = 0;
    let correlativeNumber = parseInt(iniNumber);


    //Creacion de correlativo de doc (de la factura)
    if (!codigoSaleOrderInvoice) {
        codigo = 1;
    } else { codigo = codigoSaleOrderInvoice + 1 }

    //codigo para salida
    if (!codOutput) {
        codigoSalidas = 1;
    } else { codigoSalidas = codOutput + 1 }

    //IMPUESTOS
    let impuestosList = await taxes.find({ document: 'venta', Company: companyId })
        .then(taxes => {
            return (taxes)

        })
    //


    //++++++++++++++ verificando deudas +++++++++++++++++++
    //obtener fecha de facturas relacionadas con el cliente
    let invoices = await customerInvoice.find({ Pagada: false, Customer: Customer }, 'CreationDate')
        .then(resultado => { return resultado }).catch(err => { console.log("error en proveedir"); return err });

    invoices.map(item => {
        //  let date = moment(item.CreationDate).format('DD/MM/YYYY');

        let now = new Date();
        let fecha = now.getTime();
        var date = new Date(item.CreationDate);

        date.setDate(date.getDate() + diasCredito); //sumar dias de credito para verificar si se paso de  la fecha de pago
        let fechaPago = date.toISOString().substring(0, 10);
        let fechaAct = now.toISOString().substring(0, 10);

        if (fechaPago <= fechaAct) {  //para verificar si es deudor o tiene mora
            deudor = true;
        } else { deudor = false; }

    });

    if (deudor) {
        console.log('esta en deuda');
    } else {
        console.log('agregar ingreso');
    }
    //++++++++++++++  FIN  +++++++++++++++++++


    let invoiceId = null;
    let invoiceN = null;
    let totalfactura = 0.0;
    let sumimpuestos = 0.0;
    let arreglo = [];
    let arregloFacturas = [];
    let chargeDetail;
    let cajad = [];
    let banco = [];
    let payDetail = [];
    if ((companyParams.OrderWithWallet && (deudor || !deudor)) || (!companyParams.OrderWithWallet && !deudor)) {

        SaleOrderInvoice.InvoiceNumber = correlativeNumber;

        while (contador < longitudArreglo) {   //para comenzar a ingresar los productos y crear la factura
            let band = false;


            while (correlativeNumber.toString().length < lengEndNumber) {  //para generar el numero de factura como 001,002,...010,011

                correlativeNumber = "0" + correlativeNumber;

            }

            let factura = [{
                CodInvoice: codigo,
                Customer: Customer,
                Total: Total,
                Active: true,
                User: User,
                CreationDate: creacion,
                State: 'Creada',
                InvoiceComments: InvoiceComments,
                CommentsofSale: CommentsSaleOrder,
                CustomerName: CustomerName,
                SaleOrder: SaleOrderId,
                InvoiceDate: InvoiceDate,
                Pagada: false,
                Entregada: !companyParams.RequieredOutput ? true : false,
                InvoiceNumber: correlativeNumber,
                DocumentCorrelative: correlativos.map(item => item._id),
                iva: parseFloat(iva)
            }]
            console.log("save", correlativeNumber);
            console.log("CONTADOR ", contador);

            await saleOrderInvoice.insertMany(factura).then(async function (SaleOrderStored) {
                if (!SaleOrderStored) {
                    res.status(500).send({ message: 'error' });

                } else {
                    band = true;
                    arregloFacturas.push(SaleOrderStored);
                    invoiceId = SaleOrderStored.map(item => { return item._id }).toString();
                    invoiceN = SaleOrderStored.map(item => { return item.InvoiceNumber }).toString();
                    let invoiceNumber = SaleOrderStored.map(item => { return item.InvoiceNumber }).toString();

                    let correlativoId = correlativos.map(item => item._id);

                    await correlativeDocument.findByIdAndUpdate({ _id: correlativoId }, { CurrentNumber: parseInt(invoiceNumber) + 1 }, async (err, update) => {
                        if (err) {
                            console.log(err);
                        }
                        if (update) {

                        }
                    });
                    let quoteId = SaleOrderStored.CustomerQuote;

                    // cambio de estado a orden de venta

                    saleOrders.findByIdAndUpdate({ _id: SaleOrderId }, { State: "Facturada" }, async (err, update) => {
                        if (err) {
                            res.status(500).send({ message: "Error del servidor." });
                        }
                        if (update) { }
                    });

                    //OBTENIENDO INFORMACIÓN DE ANTICIPO  
                    let anticipo = await CustomerAdvance.find({ SaleOrder: SaleOrderId })
                        .then(result => { return result });
                    let detalleAnticipo = await CustomerAdvanceDetails.find({ SaleOrder: SaleOrderId })
                        .then(result => { return result });

                    if (invoiceId) {

                        //creando arreglo de productos dependiendo de la cantidad de lineas de factura
                        for (let i = 0; i < nLineas; i++) {

                            if (dePurchaseOrder[contador + i]) {
                                //    console.log("prueba",dePurchaseOrder[contador+ i].dato);

                                totalfactura += (parseFloat(dePurchaseOrder[contador + i].SubTotal)); //calculando el total por la cantidad de productos que llevara esa factura
                                deOrden.push({

                                    ProductName: dePurchaseOrder[contador + i].ProductName,
                                    SaleOrderInvoice: invoiceId,
                                    Quantity: parseFloat(dePurchaseOrder[contador + i].Quantity),
                                    Discount: parseFloat(dePurchaseOrder[contador + i].Discount),
                                    Price: parseFloat(dePurchaseOrder[contador + i].Price),
                                    Inventory: dePurchaseOrder[contador + i].Inventory._id,
                                    SubTotal: parseFloat(dePurchaseOrder[contador + i].SubTotal),
                                    Entregados: !companyParams.RequieredOutput ? dePurchaseOrder[contador + i].Quantity : 0,
                                    State: !companyParams.RequieredOutput ? true : false,
                                    Measure: dePurchaseOrder[contador + i].Measure,
                                    CodProduct: dePurchaseOrder[contador + i].CodProduct,
                                    Product: dePurchaseOrder[contador + i].Inventory.Product._id,
                                    Entregados: !companyParams.RequieredOutput ? dePurchaseOrder[contador + i].Quantity : 0,
                                    iniQuantity: dePurchaseOrder[contador + i].Quantity,
                                    BuyPrice: parseFloat(dePurchaseOrder[contador + i].BuyPrice),
                                    PriceDiscount: parseFloat(dePurchaseOrder[contador + i].PrecioDescuento) ?
                                        parseFloat(dePurchaseOrder[contador + i].PrecioDescuento) : parseFloat(dePurchaseOrder[contador + i].Descuento),
                                    inAdvanced: dePurchaseOrder[contador + i].inAdvanced


                                })

                            }
                            else { deOrden[null] }
                        }
                        //para hacer el calculo de impuestos por factura 
                        //valido segun la diferentes condiciones
                        var impuestosSinRetencion = impuestosList.filter(function (item) {   //obteniendo todos los impuestos menos la retencion
                            return item.Name != "Retencion";
                        });
                        console.log("dtos del cliente", excento, contribuyente, customerType);
                        if (customerType.toString() === "CreditoFiscal" && excento.toString() === "false" && contribuyente.toString() === "Grande") {
                            console.log("GRAN CONTRIBUYENTE SIN RENTECION", totalfactura);
                            if (parseFloat(Total) > 100) {
                                impuestosList.map(item => {
                                    sumimpuestos += parseFloat(totalfactura * item.percentage / 100);
                                })
                            } else {
                                impuestosSinRetencion.map(item => {
                                    sumimpuestos += parseFloat(totalfactura * item.percentage / 100);
                                })
                            }

                        }
                        else if (customerType.toString() === "CreditoFiscal" && excento.toString() === "true" && contribuyente.toString() === "Grande") { sumimpuestos = 0 }
                        else if (customerType.toString() === "ConsumidorFinal" && excento.toString() === "true") { sumimpuestos = 0 }
                        else if (customerType.toString() === "CreditoFiscal" && excento.toString() === "false" && contribuyente.toString() !== "Grande") {
                            impuestosSinRetencion.map(item => {
                                sumimpuestos += parseFloat(totalfactura * item.percentage / 100);
                            })
                        }
                        else if (customerType.toString() === "ConsumidorFinal" && excento.toString() === "false" && contribuyente.toString() !== "Grande") {
                            impuestosSinRetencion.map(item => {
                                sumimpuestos += parseFloat(totalfactura * item.percentage / 100);
                            })
                        }
                        totalfactura = totalfactura + sumimpuestos;

                        saleOrderInvoice.findByIdAndUpdate({ _id: invoiceId }, { Total: totalfactura }, async (err, update) => {
                            if (err) {

                            }
                            if (update) { }
                        });

                        if (deOrden.length > 0 || deOrden !== null) {    //insertando detalles de los detalles de la orden
                            await saleOrderInvoiceDetails.insertMany(deOrden)
                                .then(async function (detalles) {
                                    //si ingreso no requerido

                                    if (detalles) {
                                        arreglo.push(detalles);
                                        //cuenta por cobrar
                                        let iddetalle = detalles.map(item => { return item._id }).toString();

                                        //CUANDO SEa CONDICION DE PAGO =CONTADO  y tambien al ingresar los detalles se agrega transaccion
                                        if (condicionPago === 'Contado') {
                                            await saleOrderInvoice.findByIdAndUpdate({ _id: invoiceId }, { Pagada: true }, (err, updateDeuda) => {
                                                if (err) {

                                                    console.log(err);
                                                } else { }
                                            });



                                            let pago = [{  //arreglo de pago
                                                SaleOrderInvoice: invoiceId,
                                                DatePayment: creacion,
                                                User: User,
                                                codpayment: codigo,
                                                Saldo: 0,
                                                Customer: Customer
                                            }]



                                            await CustomerPayment.insertMany(pago)
                                                .then(function (paymentStored) {
                                                    //   res.status(500).send({message: err});


                                                    if (!paymentStored) {
                                                        res.status(500).send({ message: "No se inserto registro" });

                                                    }
                                                    else {

                                                        let paymentid = paymentStored.map(item => { return item._id }).toString(); //id del pago agregado
                                                        let codInvoice = paymentStored.map(item => { return item.SaleOrderInvoice }).toString(); //codigo de la factura que registro el pago
                                                        payDetail.push({  //detalle del pago
                                                            CreationDate: creacion,
                                                            Reason: Reason,
                                                            PaymentMethods: PaymentMethodId,
                                                            Cancelled: false,
                                                            Amount: parseFloat(parseFloat(totalfactura).toFixed(2)), //verificar si se realiza por salto de factura
                                                            // (totalfactura).toFixed(2),
                                                            CustomerPayment: paymentid,
                                                            SaleOrderInvoice: codInvoice,
                                                            NumberAccount: PaymentMethodName === "Transferencia" ? NumberAccountBank : NumberAccount,
                                                            BankName: BankName,
                                                            NoTransaction: PaymentMethodName === "Transferencia"
                                                                || PaymentMethodName === "TarjetadeCredito" ? NoTransaction : null,
                                                            CashAccount: PaymentMethodName === "Contado" ? CashAccount : null,
                                                            BankAccount: PaymentMethodName === "Transferencia"
                                                                || PaymentMethodName === "TarjetadeCredito" ? NumberAccountId : null,
                                                            Type: PaymentMethodName
                                                        })


                                                        let arrayAnticipo = [];
                                                        if (detalleAnticipo.length > 0) {


                                                            detalleAnticipo.map(item => {
                                                                arrayAnticipo.push({  //para convertir el anticipo en un pago de la factura (no convertir como tal si no que ya pasa a ser un pago)
                                                                    CreationDate: creacion,
                                                                    Reason: item.Reason,
                                                                    PaymentMethods: item.PaymentMethods,
                                                                    Cancelled: false,
                                                                    Amount: item.Amount,
                                                                    CustomerPayment: paymentid,
                                                                    SaleOrderInvoice: codInvoice,
                                                                    NumberAccount: item.NumberAccount,
                                                                    BankName: item.BankName,
                                                                    NoTransaction: item.NoTransaction,
                                                                    BankAccount: item.Type === "Transferencia" || item.Type === "TarjetadeCredito" ? item.BankAccount : null,
                                                                    CashAccount: item.Type === "Contado" ? item.CashAccount : null,
                                                                    Type: item.Type
                                                                })
                                                            });

                                                        }

                                                        if (arrayAnticipo.length > 0) {
                                                            console.log("CONTADO Y ANTICIPO");
                                                            chargeDetail = payDetail.concat(arrayAnticipo);
                                                        }
                                                        else { chargeDetail = payDetail }

                                                        CustomerPaymentDetails.insertMany(chargeDetail)  //ingresando detalle del pago (solo existe un registro de pago por factura PERO ese registrar multiples pagos a esa factura)
                                                            .then(async function (detailStored) {

                                                                if (!detailStored) {
                                                                    // res.status(500).send({message: err});
                                                                    console.log(err);
                                                                }
                                                                else {
                                                                    console.log("PAGOS INSERTADOs", detailStored);
                                                                    let paymentDetailId = detailStored.map(item => { return item._id });

                                                                    if (paymentDetailId) {
                                                                        let sumMontos = await CustomerPaymentDetails.aggregate([
                                                                            { $match: { CustomerPayment: paymentid } },

                                                                            {
                                                                                $group: {
                                                                                    _id: null,
                                                                                    "sumAmount": { $sum: '$Amount' }
                                                                                }
                                                                            },

                                                                        ]);
                                                                        let sumaMontos = 0.0;
                                                                        sumMontos.map(item => {
                                                                            sumaMontos = item.sumAmount;
                                                                        })
                                                                        //   //actualizando deuda con cliente
                                                                        //   let nuevaCuenta=parseFloat(deudaAct)-parseFloat((totalfactura));
                                                                        //  await customer.findByIdAndUpdate({_id:Customer},{AccountsReceivable:nuevaCuenta.toFixed(2)},(err,updateDeuda)=>{
                                                                        //       if(err){

                                                                        //           console.log(err);
                                                                        //       }else{}
                                                                        //   })




                                                                    }

                                                                }

                                                            });




                                                    }

                                                })
                                        }
                                        else {
                                            console.log("CONDICION DE PAGO CREDITO");
                                            //EN CASO QUE SEA UN CLIENTE CON LA CONDICION DE PAGO "CREDITO"
                                            let arrayAnticipo = [];
                                            let anticipos = [];
                                            if (detalleAnticipo.length > 0) {

                                                anticipo.map(item => {  //por si se registro algun anticipo
                                                    anticipos.push({
                                                        SaleOrderInvoice: invoiceId,
                                                        DatePayment: item.DatePayment,
                                                        User: User,
                                                        codpayment: codigo,
                                                        Saldo: item.Saldo,
                                                        Customer: Customer
                                                    })
                                                })


                                                await CustomerPayment.insertMany(anticipos) //insertamo pago (solo anticipo )
                                                    .then(function (paymentStored) {
                                                        if (paymentStored) {
                                                            console.log("PAGO INGRESADO", paymentStored);
                                                            let paymentid = paymentStored.map(item => { return item._id }).toString();
                                                            let codInvoice = paymentStored.map(item => { return item.SaleOrderInvoice }).toString();
                                                            let transaccionBanco = [];
                                                            let transaccionCaja = [];
                                                            detalleAnticipo.map(async item => {


                                                                arrayAnticipo.push({
                                                                    CreationDate: creacion,
                                                                    Reason: item.Reason,
                                                                    PaymentMethods: item.PaymentMethods,
                                                                    Cancelled: false,
                                                                    Amount: item.Amount,
                                                                    CustomerPayment: paymentid,
                                                                    SaleOrderInvoice: codInvoice,
                                                                    NumberAccount: item.NumberAccount,
                                                                    BankName: item.BankName,
                                                                    NoTransaction: item.NoTransaction,
                                                                    BankAccount: item.Type === "Transferencia" || item.Type === "TarjetadeCredito" ? item.BankAccount : null,
                                                                    CashAccount: item.Type === "Contado" ? item.CashAccount : null,
                                                                    Type: item.Type
                                                                });


                                                            });

                                                            CustomerPaymentDetails.insertMany(arrayAnticipo) //insertando detalle del pago
                                                                .then(async function (detailStored) {

                                                                    if (!detailStored) {
                                                                        // res.status(500).send({message: err});
                                                                        console.log("err");
                                                                    }
                                                                    else {
                                                                        console.log("PAGOS INSERTADOs", detailStored);
                                                                        let paymentDetailId = detailStored.map(item => { return item._id });
                                                                        let amount = detailStored.map(item => { return item.Amount });
                                                                        if (paymentDetailId) {
                                                                            let sumMontos = await CustomerPaymentDetails.aggregate([
                                                                                { $match: { CustomerPayment: paymentid } },

                                                                                {
                                                                                    $group: {
                                                                                        _id: null,
                                                                                        "sumAmount": { $sum: '$Amount' }
                                                                                    }
                                                                                },

                                                                            ]);
                                                                            let sumaMontos = 0.0;
                                                                            sumMontos.map(item => {
                                                                                sumaMontos = item.sumAmount;
                                                                            })
                                                                            //actualizando deuda con cliente
                                                                            let totalPagar = parseFloat(totalfactura) - parseFloat(amount);
                                                                            let nuevaCuenta = (parseFloat(deudaAct) + parseFloat(totalPagar));
                                                                            await customer.findByIdAndUpdate({ _id: Customer }, { AccountsReceivable: nuevaCuenta.toFixed(2) }, (err, updateDeuda) => {
                                                                                if (err) {

                                                                                    console.log(err);
                                                                                } else { }
                                                                            });



                                                                        }

                                                                    }

                                                                });



                                                        }
                                                    });
                                            }

                                            // let nuevaCuenta=parseFloat(deudaAct)+parseFloat(Total);
                                            // customer.findByIdAndUpdate({_id:Customer},{
                                            //      AccountsReceivable:nuevaCuenta.toFixed(2),
                                            //  }).then(function(update){
                                            //      if(!update){

                                            //      }
                                            //      else{}}).catch(err =>{console.log(err)});
                                        }

                                    } else {
                                        res.status(500).send({ message: "No se registraron detalles" });
                                    }


                                })
                                .catch(function (err) {
                                    console.log(err);
                                });
                        }



                    }








                }
                return
            })
            //variables para controlar en que momento generar varias facturas dependiendo de las lineas con la que compañia se registro
            deOrden = [];
            totalfactura = 0.0;
            sumimpuestos = 0.0;
            contador += nLineas;
            codigo += 1;
            correlativeNumber = parseInt(correlativeNumber) + 1;
            console.log("CONTADOR FINAL while", contador);

        }//fin del while
        res.status(200).send({ orden: "cambios" });

    }



    if (!companyParams.OrderWithWallet && deudor) {  //si tiene deuda no se registrar factura
        res.status(500).send({ message: "No se puede registrar orden de venta a cliente" });
    }


    if (!companyParams.RequieredOutput) {  //registro de salidas 

        let salida = [];

        let datosFactura = [];
        let datosDetalles = [];
        let noFactura = null;
        let count = 0;
        arregloFacturas.map(async item => {  //aqui se ha guardado el detalle de las facturas
            let id = item.forEach(item => {
                datosFactura.push(item)


            });
        });
        arreglo.map(item => {
            // console.log("arreglo final", item);
            item.forEach(item => {
                datosDetalles.push(item);

            })


        })


        datosFactura.map(item => {  //el detalle de las facturas lo uso para generar la salida

            salida.push(
                {
                    EntryDate: creacion,
                    User: User,
                    Comments: "Ingreso automatico " + creacion,
                    State: true,
                    CodOutput: codigoSalidas,
                    Company: companyId,
                    SaleOrderInvoice: item._id,
                    Customer: Customer,
                    InvoiceNumber: item.InvoiceNumber,

                }
            )


        })
        await productOutput.insertMany(salida).then(async function (outputStored) { //registro salida
            if (!outputStored) {


            } else {
                var detalles = [];
                let detalleAnticipo = [];
                let cont = 0;


                outputStored.map(async item => {
                    let long = outputStored.length;

                    let idfactura = item.SaleOrderInvoice;
                    let numFactura = item.InvoieNumber;
                    let id = item._id;

                    let data = await saleOrderInvoiceDetails.find({ SaleOrderInvoice: idfactura, inAdvanced: false }).then(async function (data) {
                        return data;
                    }); //obteniendo productos que no estan en anticipo

                    let dataInAdvance = await saleOrderInvoiceDetails.find({ SaleOrderInvoice: idfactura, inAdvanced: true }).then(async function (data) {
                        return data;
                    });  //obteniendo  productos que estan en anticpo

                    let anticiposdetails = await CustomerAdvanceDetails.find({ SaleOrder: SaleOrderId })
                        .then(result => { return result });

                    if (dataInAdvance.length > 0) {
                        dataInAdvance.map(item => {  //registro de salidas de productos en anticipo
                            detalleAnticipo.push(
                                {
                                    SaleInvoiceDetail: item._id,
                                    ProductOutput: id,
                                    Quantity: item.Quantity,
                                    Inventory: item.Inventory,
                                    ProductName: item.ProductName,
                                    Price: item.Price,
                                    Measure: item.Measure,
                                    CodProduct: item.CodProduct,
                                    Product: item.Product,
                                    SaleOrderInvoice: item.SaleOrderInvoice

                                }
                            );

                        });
                    }
                    data.map(item => { //registro de salida de prodcutos 
                        detalles.push(
                            {
                                SaleInvoiceDetail: item._id,
                                ProductOutput: id,
                                Quantity: item.Quantity,
                                Inventory: item.Inventory,
                                ProductName: item.ProductName,
                                Price: item.Price,
                                Measure: item.Measure,
                                CodProduct: item.CodProduct,
                                Product: item.Product,
                                SaleOrderInvoice: item.SaleOrderInvoice

                            }
                        );

                    });
                    //    let productosout;
                    //    if(detalleAnticipo.length>0){
                    //     productosout=detalles.concat(detalleAnticipo);
                    //    }else{ productosout=detalles;}
                    console.log("LOS PRODUCOTS NO ANTICIPO", detalles);
                    console.log("LOS PRODUCOTS SI ANTICIPO", detalleAnticipo);
                    if (parseInt(long) <= parseInt(cont)) {
                        console.log("gola ");
                    }

                    cont += 1;
                    if (parseInt(long) === parseInt(cont)) {
                        //SACANDO PRODUCTOS QUE NO ESTAN EN BODEGA DE ANTICPO
                        productOutputDetail.insertMany(detalles).then(async function (outputStored) {
                            console.log("INSERTANDO DETALLES");
                            console.log(outputStored);
                            if (outputStored) {
                                outputStored.map(async item => {
                                    let SaleInvoiceId = item.SaleOrderInvoice;
                                    let salidaId = item.ProductOutput;
                                    //obteniendo stock de producto  (bodega principal)

                                    let infoInventary = await inventory.findOne({ _id: item.Inventory }, ['Stock', 'Product'])
                                        .then(resultado => { return resultado }).catch(err => { console.log("error en proveedir"); return err });
                                    console.log('EN STOCK:', infoInventary);

                                    //stock de la bodega de reserva
                                    let productreserved = await inventory.findOne({ Product: infoInventary.Product, _id: { $nin: infoInventary._id } }, ['Stock', 'Product'])
                                        .populate({ path: 'Bodega', model: 'Bodega', match: { Name: 'Reserva' } })
                                        .then(resultado => { return resultado }).catch(err => { console.log("error en proveedir"); return err });

                                    //obteniendo id del movimiento de tipo reserva
                                    let movementId = await MovementTypes.findOne({ Name: 'salida' }, ['_id'])
                                        .then(resultado => { return resultado }).catch(err => { console.log("error en proveedir"); return err });

                                    //cambios de cantidad ingresada
                                    let proIngresados = await saleOrderInvoiceDetails.findOne({ _id: item.SaleInvoiceDetail }, 'Entregados')
                                        .then(resultado => { return resultado }).catch(err => { console.log("error en proveedir"); return err });
                                    let quantityInvoice = await saleOrderInvoiceDetails.findOne({ _id: item.SaleInvoiceDetail }, 'Quantity')
                                        .then(resultado => { return resultado }).catch(err => { console.log("error en proveedir"); return err });

                                    let cantidad = 0.0;
                                    let ingresos = 0.0;
                                    let productRestante = 0.0;
                                    let ingresoUpdate = 0.0;

                                    console.log("PRODUCTOS ENTREGADOS", proIngresados);
                                    console.log("PRODUCTOS de factura", quantityInvoice);
                                    ingresos = parseFloat(proIngresados.Entregados) + parseFloat(item.Quantity);
                                    console.log("a entregar", ingresos);
                                    //cambiando estados e ingresos de  detalle factur
                                    if (proIngresados !== null) {
                                        if (parseFloat(ingresos) === parseFloat(quantityInvoice.Quantity)) {
                                            console.log('COMPLETADO INGRESO');
                                            await saleOrderInvoiceDetails.updateMany({ _id: item.SaleInvoiceDetail }, {
                                                Entregados: ingresos,
                                                State: true
                                            })
                                                .catch(err => { console.log(err); })

                                        }
                                        else {
                                            console.log('NO COMPLETADO INGRESO');

                                            await saleOrderInvoiceDetails.updateMany({ _id: item.SaleInvoiceDetail }, {
                                                Entregados: ingresos,
                                                State: false
                                            }).catch(err => { console.log(err); })

                                        }
                                        actualizado = true;
                                    }

                                    if (parseFloat(infoInventary.Stock) >= parseFloat(item.Quantity) && !companyParams.AvailableReservation) {
                                        //descontando cantidad que se reservara
                                        inventory.findByIdAndUpdate({ _id: item.Inventory }, {
                                            Stock: parseFloat(infoInventary.Stock - item.Quantity),
                                        }).then(async function (update) {
                                            if (!update) {

                                            }
                                            else {
                                                let completados = await saleOrderInvoiceDetails.countDocuments({ State: true, SaleOrderInvoice: SaleInvoiceId }).then(c => {
                                                    return c
                                                });

                                                let registrados = await saleOrderInvoiceDetails.countDocuments({ SaleOrderInvoice: SaleInvoiceId }, function (err, count) {
                                                    console.log(count); return (count)
                                                });
                                                console.log('PURCHASE INVOICE', SaleInvoiceId);
                                                console.log('completados', completados);
                                                console.log('todos', registrados);
                                                //validando si todos los productos estan ingresados
                                                if (parseInt(completados) === parseInt(registrados)) {
                                                    console.log("cambiando");
                                                    saleOrderInvoice.findByIdAndUpdate({ _id: SaleInvoiceId }, {
                                                        Entregada: true,
                                                    })
                                                        .catch(err => { console.log(err); });

                                                }
                                                //registrando movimiento de inventario
                                                const inventorytraceability = new inventoryTraceability();
                                                inventorytraceability.Quantity = item.Quantity;
                                                inventorytraceability.Product = item.Product;
                                                inventorytraceability.WarehouseDestination = null; //destino
                                                inventorytraceability.MovementType = movementId._id;
                                                inventorytraceability.MovDate = creacion;
                                                inventorytraceability.WarehouseOrigin = item.Inventory; //origen
                                                inventorytraceability.User = User;
                                                inventorytraceability.Company = Company;
                                                inventorytraceability.DocumentId = salidaId;
                                                inventorytraceability.ProductDestiny = null;
                                                inventorytraceability.DocumentNumber = numFactura;
                                                inventorytraceability.DocType = "Factura Venta";
                                                inventorytraceability.Cost = parseFloat(item.Quantity) * parseFloat(item.Price);
                                                inventorytraceability.save((err, traceabilityStored) => {
                                                    if (err) {
                                                        // res.status(500).send({message: err});

                                                    } else {
                                                        if (!traceabilityStored) {
                                                            // res.status(500).send({message: "Error al crear el nuevo usuario."});
                                                            console.log(traceabilityStored);
                                                        }
                                                        else {

                                                        }
                                                    }
                                                });


                                                console.log('id del moviminto de reserva', movementId);
                                                //registro de movimiento

                                                res.status(200).send({ orden: detalles });
                                            }
                                        })
                                            .catch(err => { console.log(err); });

                                        //stock de bodega de reserva
                                        console.log(infoInventary.Product);

                                    }
                                    else if (parseFloat(productreserved.Stock) >= parseFloat(item.Quantity) && companyParams.AvailableReservation) {
                                        console.log("EMPRESA HABILITADA PARA RESERVAS");
                                        console.log('BODEGA RESERVA');
                                        console.log(productreserved);

                                        //actualizando el stock de reserva
                                        inventory.findByIdAndUpdate({ _id: productreserved._id }, {
                                            Stock: parseFloat(productreserved.Stock - item.Quantity),
                                        }).then(async function (update) {
                                            if (!update) {
                                                res.status(500).send({ message: "No se actualizo inventario" });
                                            } else {


                                                let completados = await saleOrderInvoiceDetails.countDocuments({ State: true, SaleOrderInvoice: SaleInvoiceId }).then(c => {
                                                    return c
                                                });

                                                let registrados = await saleOrderInvoiceDetails.countDocuments({ SaleOrderInvoice: SaleInvoiceId }, function (err, count) {
                                                    console.log(count); return (count)
                                                });
                                                console.log('PURCHASE INVOICE', SaleInvoiceId);
                                                console.log('completados', completados);
                                                console.log('todos', registrados);
                                                //validando si todos los productos estan ingresados
                                                if (parseInt(completados) === parseInt(registrados)) {
                                                    console.log("cambiando");
                                                    saleOrderInvoice.findByIdAndUpdate({ _id: SaleInvoiceId }, {
                                                        Entregada: true,
                                                    })
                                                        .catch(err => { console.log(err); });

                                                }

                                                //transaccion
                                                const inventorytraceability = new inventoryTraceability();
                                                inventorytraceability.Quantity = item.Quantity;
                                                inventorytraceability.Product = item.Product;
                                                inventorytraceability.WarehouseDestination = null; //destino
                                                inventorytraceability.MovementType = movementId._id;
                                                inventorytraceability.MovDate = creacion;
                                                inventorytraceability.WarehouseOrigin = productreserved._id; //origen
                                                inventorytraceability.User = User;
                                                inventorytraceability.Company = companyId;
                                                inventorytraceability.DocumentId = salidaId;
                                                inventorytraceability.ProductDestiny = null;
                                                inventorytraceability.DocumentNumber = numFactura;
                                                inventorytraceability.DocType = "Factura Compra";
                                                inventorytraceability.Cost = parseFloat(item.Quantity) * parseFloat(item.Price);
                                                inventorytraceability.save((err, traceabilityStored) => {
                                                    if (err) {

                                                        res.status(500).send({ message: "No se actualizo inventario" });
                                                    } else {
                                                        if (!traceabilityStored) {
                                                            // // res.status(500).send({message: "Error al crear el nuevo usuario."});
                                                            // console.log(traceabilityStored);
                                                        }
                                                        else {
                                                            console.log(traceabilityStored);
                                                        }
                                                    }
                                                });



                                            }

                                        })
                                            .catch(err => { console.log(err); });

                                    }
                                    else {

                                        res.status(500).send({ message: "Verificar Inventario" });

                                    }

                                })
                            }
                        });
                        //SACANDO PRODUCTOS QUE SI ESTAN EN ANTICIPO 
                        productOutputDetail.insertMany(detalleAnticipo).then(async function (outputStored) {
                            console.log("INSERTANDO DETALLES");
                            console.log(outputStored);
                            if (outputStored) {
                                outputStored.map(async item => {
                                    let SaleInvoiceId = item.SaleOrderInvoice;
                                    let salidaId = item.ProductOutput;
                                    //obteniendo stock de producto  (bodega principal)

                                    let infoInventary = await inventory.findOne({ _id: item.Inventory }, ['Stock', 'Product'])
                                        .then(resultado => { return resultado }).catch(err => { console.log("error en proveedir"); return err });
                                    console.log('EN STOCK:', infoInventary);
                                    let bodegaAnticipo = await bodega.findOne({ Name: 'Anticipo', Company: companyId }, ['_id'])
                                        .then(resultado => { return resultado }).catch(err => { console.log("error en proveedir"); return err });
                                    //stock de la bodega de anticipo
                                    let productinAnticipo = await inventory.findOne({ Product: infoInventary.Product, Bodega: bodegaAnticipo._id }, ['Stock', 'Product'])
                                        .then(resultado => { return resultado }).catch(err => { console.log("error en proveedir"); return err });

                                    //obteniendo id del movimiento de tipo reserva
                                    let movementId = await MovementTypes.findOne({ Name: 'salida' }, ['_id'])
                                        .then(resultado => { return resultado }).catch(err => { console.log("error en proveedir"); return err });

                                    //cambios de cantidad ingresada
                                    let proIngresados = await saleOrderInvoiceDetails.findOne({ _id: item.SaleInvoiceDetail }, 'Entregados')
                                        .then(resultado => { return resultado }).catch(err => { console.log("error en proveedir"); return err });
                                    let quantityInvoice = await saleOrderInvoiceDetails.findOne({ _id: item.SaleInvoiceDetail }, 'Quantity')
                                        .then(resultado => { return resultado }).catch(err => { console.log("error en proveedir"); return err });

                                    let cantidad = 0.0;
                                    let ingresos = 0.0;
                                    let productRestante = 0.0;
                                    let ingresoUpdate = 0.0;

                                    console.log("PRODUCTOS EN ANTICIPO", proIngresados);
                                    console.log("PRODUCTOS de factura", quantityInvoice);
                                    ingresos = parseFloat(proIngresados.Entregados) + parseFloat(item.Quantity);
                                    console.log("a entregar", ingresos);
                                    //cambiando estados e ingresos de  detalle factur
                                    if (proIngresados !== null) {
                                        if (parseFloat(ingresos) === parseFloat(quantityInvoice.Quantity)) {
                                            console.log('COMPLETADO INGRESO');
                                            await saleOrderInvoiceDetails.updateMany({ _id: item.SaleInvoiceDetail }, {
                                                Entregados: ingresos,
                                                State: true
                                            })
                                                .catch(err => { console.log(err); })

                                        }
                                        else {
                                            console.log('NO COMPLETADO INGRESO');

                                            await saleOrderInvoiceDetails.updateMany({ _id: item.SaleInvoiceDetail }, {
                                                Entregados: ingresos,
                                                State: false
                                            }).catch(err => { console.log(err); })

                                        }
                                        actualizado = true;
                                    }

                                    if (parseFloat(productinAnticipo.Stock) >= parseFloat(item.Quantity)) {
                                        console.log("SACANDO PRODUCTO DE LA BODEGA DE ANTICIPO");

                                        console.log(productinAnticipo);

                                        //actualizando el stock de reserva
                                        inventory.findByIdAndUpdate({ _id: productinAnticipo._id }, {
                                            Stock: parseFloat(productinAnticipo.Stock - item.Quantity),
                                        }).then(async function (update) {
                                            if (!update) {
                                                res.status(500).send({ message: "No se actualizo inventario" });
                                            } else {


                                                let completados = await saleOrderInvoiceDetails.countDocuments({ State: true, SaleOrderInvoice: SaleInvoiceId }).then(c => {
                                                    return c
                                                });

                                                let registrados = await saleOrderInvoiceDetails.countDocuments({ SaleOrderInvoice: SaleInvoiceId }, function (err, count) {
                                                    console.log(count); return (count)
                                                });
                                                console.log('PURCHASE INVOICE', SaleInvoiceId);
                                                console.log('completados', completados);
                                                console.log('todos', registrados);
                                                //validando si todos los productos estan ingresados
                                                if (parseInt(completados) === parseInt(registrados)) {
                                                    console.log("cambiando");
                                                    saleOrderInvoice.findByIdAndUpdate({ _id: SaleInvoiceId }, {
                                                        Entregada: true,
                                                    })
                                                        .catch(err => { console.log(err); });

                                                }

                                                //transaccion
                                                const inventorytraceability = new inventoryTraceability();
                                                inventorytraceability.Quantity = item.Quantity;
                                                inventorytraceability.Product = item.Product;
                                                inventorytraceability.WarehouseDestination = null; //destino
                                                inventorytraceability.MovementType = movementId._id;
                                                inventorytraceability.MovDate = creacion;
                                                inventorytraceability.WarehouseOrigin = productinAnticipo._id; //origen
                                                inventorytraceability.User = User;
                                                inventorytraceability.Company = companyId;
                                                inventorytraceability.DocumentId = salidaId;
                                                inventorytraceability.ProductDestiny = null;
                                                inventorytraceability.Cost = parseFloat(item.Quantity) * parseFloat(item.Price);
                                                inventorytraceability.DocumentNumber = numFactura;
                                                inventorytraceability.DocType = "Factura Compra";
                                                inventorytraceability.save((err, traceabilityStored) => {
                                                    if (err) {

                                                        res.status(500).send({ message: "No se actualizo inventario" });
                                                    } else {
                                                        if (!traceabilityStored) {
                                                            // // res.status(500).send({message: "Error al crear el nuevo usuario."});
                                                            // console.log(traceabilityStored);
                                                        }
                                                        else {
                                                            console.log(traceabilityStored);
                                                        }
                                                    }
                                                });



                                            }

                                        })
                                            .catch(err => { console.log(err); });

                                    }
                                    else {

                                        res.status(500).send({ message: "Verificar Inventario" });

                                    }

                                })
                            }
                        });
                    }
                })
            }
        });
    }

    if (payDetail.length > 0) {  //para registrar alguna transaccion o el pago que tenga la factura, es decir el pago de contado
        //Reegistro de movimiento de banco
        let Type;
        let BankMovement;

        if (PaymentMethodName === "Contado") {
            const CashTransaction = new cashTransaction();

            CashTransaction.TransactionDate = creacion;
            CashTransaction.Concept = Reason;
            CashTransaction.User = User;
            CashTransaction.Deposit = Monto;
            CashTransaction.Withdrawal = 0;
            CashTransaction.CashMovement = efectivoMovimiento;
            CashTransaction.CashAccount = CashAccount;

            CashTransaction.save(async (err, CashTransactionStored) => {
                if (err) {
                    res.status(500).send({ message: err });
                } else {
                    if (!CashTransactionStored) {
                        res.status(500).send({ message: "Error" });
                    } else {
                        let saldoCurrentAccount = await cashAccount.findOne({ _id: CashAccount }, 'Saldo').then(result => { return result.Saldo });
                        cashAccount.findByIdAndUpdate({ _id: CashAccount },
                            { Saldo: parseFloat(parseFloat(saldoCurrentAccount) + parseFloat(Monto)).toFixed(2) },
                            (err, updateDeuda) => {
                                if (err) {
                                    console.log(err);
                                }
                            });
                    }
                }
            })
        }

        //verificamo el metodo de pago implementado
        if (PaymentMethodName === "Transferencia" || PaymentMethodName === "TarjetadeCredito" || PaymentMethodName === "Cheque") {
            console.log("ENTRO A MOVMIENTOS");
            let doc;
            if (PaymentMethodName === "Transferencia") {
                BankMovement = idMovimiento;
                Type = idTipoMovimiento;
                doc = NoTransaction;



            }
            if (PaymentMethodName === "TarjetadeCredito") {
                BankMovement = tarjetaCreditoMov;
                Type = tarjetaTipo;
                doc = NoTransaction;

            }
            if (PaymentMethodName === "Cheque") {
                console.log("PAGON CON CHEQUE");
                BankMovement = chequeMov;
                Type = chequeTipo;
                doc = NumberAccount;
            }
            let BankingTransaction = new bankingTransaction(); //cuando son transacciones bancarias
            BankingTransaction.Type = Type
            BankingTransaction.TransactionDate = creacion;
            BankingTransaction.Concept = Reason;
            // BankingTransaction.OperationNumber=OperationNumber;
            BankingTransaction.User = User;
            BankingTransaction.DocumentNumber = NoTransaction;
            BankingTransaction.Deposit = Monto;
            BankingTransaction.Withdrawal = 0;
            BankingTransaction.BankMovement = BankMovement;
            BankingTransaction.Account = NumberAccountId;

            BankingTransaction.save(async (err, BankingTransactionStored) => {
                if (err) {
                    // res.status(500).send({message: err});
                } else {
                    if (!BankingTransactionStored) {
                        // res.status(500).send({message: "Error"});
                    } else {
                        let saldoCurrentAccount = await bankAccount.findOne({ _id: NumberAccountId }, 'Saldo').then(result => { return result.Saldo });
                        console.log("SALDO DE LA CUENTA ACTUAL", saldoCurrentAccount);

                        bankAccount.findByIdAndUpdate({ _id: NumberAccountId },
                            { Saldo: parseFloat(parseFloat(saldoCurrentAccount) + parseFloat(Monto)).toFixed(2) },
                            (err, updateDeuda) => {
                                if (err) {
                                    console.log(err);
                                }
                            })

                    }
                }
            });


        }
    }



}

async function getSalesForUsers(req, res) {
    //se encarga de obtener todo lo facturado por los usuarios
    const id = req.params.id;
    const supplierId = req.params.customer;

    let companyId = req.params.company;
    let f1 = new Date(req.params.fecha1);
    let f2 = new Date(req.params.fecha2);
    var ObjectID = require('mongodb').ObjectID;
    users.aggregate([
        { $match: { Company: ObjectID(companyId) } },
        {
            $lookup: {
                from: "saleorderinvoices",

                let: { userId: "$_id" },
                pipeline: [
                    {
                        $match:

                        {
                            $expr:
                            {
                                $and:
                                    [
                                        { $eq: ["$User", "$$userId"] },
                                        { $lte: ["$CreationDate", f1] },
                                        { $gte: ["$CreationDate", f2] },
                                    ]
                            }
                        }
                    },
                    {
                        $lookup: {
                            from: "saleinvoicedetails",

                            let: { ordenId: "$_id" },
                            pipeline: [
                                {
                                    $match:
                                    {
                                        $expr:

                                            { $eq: ["$SaleOrderInvoice", "$$ordenId"] }

                                    }
                                },
                                {
                                    "$lookup": {
                                        "from": "products",
                                        "let": { "productId": "$Product" },
                                        "pipeline": [
                                            {
                                                $match: {
                                                    $expr:

                                                        { $eq: ["$_id", "$$productId"] }

                                                }
                                            },
                                            {
                                                "$lookup": {
                                                    "from": "measures",
                                                    let: { catId: "$Measure" },
                                                    pipeline: [
                                                        {
                                                            $match:
                                                            {
                                                                $expr:

                                                                    { $eq: ["$_id", "$$catId"] }

                                                            }
                                                        },
                                                    ],
                                                    as: "medidas"
                                                }

                                            }
                                        ],
                                        "as": "producto"
                                    }
                                }


                            ],
                            as: "detalles",

                        },



                    },
                    {
                        $lookup: {
                            from: "customers",
                            let: { customerId: "$Customer" },
                            pipeline: [
                                {
                                    $match: {
                                        $expr:

                                            { $eq: ["$_id", "$$customerId"] }

                                    }
                                },

                            ],
                            as: "cliente"
                        }
                    },

                ],

                as: "facturas",

            }
        },
        { $project: { BirthDate: 0, LastLogin: 0 } }



    ]).then(result => {

        res.status(200).send(result);

    }).catch(err => { console.log(err) })
}


async function getSalesForProducts(req, res) {
    //obtener todo lo facturado de un producto, esto mostrara cuanto ha sido el monto facturado de cada productos registrado por la empresa
    //a partir de un rango de fecha especifico
    const id = req.params.id;
    const supplierId = req.params.customer;
    let companyId = req.params.company;
    let f1 = new Date(req.params.fecha1);
    let f2 = new Date(req.params.fecha2);
    var ObjectID = require('mongodb').ObjectID;
    product.aggregate([
        { $match: { Company: ObjectID(companyId) } },
        {
            $lookup: {
                from: "saleorderinvoices",

                let: { productId: "$_id" },
                pipeline: [
                    {
                        $match:

                        {
                            $expr:
                            {
                                $and:
                                    [

                                        { $lte: ["$CreationDate", f1] },   //forma de comparar fechas con mongodb
                                        { $gte: ["$CreationDate", f2] },
                                    ]
                            }
                        }
                    },
                    {
                        $lookup: {
                            from: "saleinvoicedetails",

                            let: { ordenId: "$_id" },
                            pipeline: [
                                {
                                    $match:

                                    {
                                        $expr:
                                        {
                                            $and:
                                                [

                                                    { $eq: ["$SaleOrderInvoice", "$$ordenId"] },
                                                    { $eq: ["$Product", "$$productId"] },
                                                ]
                                        }
                                    }
                                },
                                {
                                    "$lookup": {
                                        "from": "products",
                                        "let": { "productId": "$Product" },
                                        "pipeline": [
                                            {
                                                $match: {
                                                    $expr:

                                                        { $eq: ["$_id", "$$productId"] }

                                                }
                                            },
                                            {
                                                "$lookup": {
                                                    "from": "measures",
                                                    let: { catId: "$Measure" },
                                                    pipeline: [
                                                        {
                                                            $match:
                                                            {
                                                                $expr:

                                                                    { $eq: ["$_id", "$$catId"] }

                                                            }
                                                        },
                                                    ],
                                                    as: "medidas"
                                                }

                                            }
                                        ],
                                        "as": "producto"
                                    }
                                }


                            ],
                            as: "detalles",

                        },



                    },
                    {
                        $lookup: {
                            from: "customers",
                            let: { customerId: "$Customer" },
                            pipeline: [
                                {
                                    $match: {
                                        $expr:

                                            { $eq: ["$_id", "$$customerId"] }

                                    }
                                },

                            ],
                            as: "cliente"
                        }
                    }
                ],

                as: "facturas",

            }
        },
        {
            $lookup: {
                from: "catproducts",
                let: { catId: "$CatProduct" },
                pipeline: [
                    {
                        $match: {
                            $expr:

                                { $eq: ["$_id", "$$catId"] }

                        }
                    },

                ],
                as: "categoria"
            }
        },
        {
            $lookup: {
                from: "brands",
                let: { brandId: "$Brand" },
                pipeline: [
                    {
                        $match: {
                            $expr:

                                { $eq: ["$_id", "$$brandId"] }

                        }
                    },

                ],
                as: "marca"
            }
        },
        {
            $lookup: {
                from: "measures",
                let: { meedidaId: "$Measure" },
                pipeline: [
                    {
                        $match: {
                            $expr:

                                { $eq: ["$_id", "$$meedidaId"] }

                        }
                    },

                ],
                as: "medida"
            }
        },
        { $project: { BirthDate: 0, LastLogin: 0 } }



    ]).then(result => {

        res.status(200).send(result);

    }).catch(err => { console.log(err) })
}


async function createSaleOrderInvoice2(req, res) {

    const SaleOrderInvoice = new saleOrderInvoice();
    const ProductOuput = new productOutput();
    const payment = new CustomerPayment();
    const paymentDetails = new CustomerPaymentDetails();
    let messageError = false;
    const saledetails = req.body.details;

    let dePurchaseOrder = req.body.details;
    let addTaxes = req.body.impuestos;
    const detalle = [];
    let outputDataDetail = [];

    let deudor = false;
    moment.locale();
    // let creacion = moment().format('DD/MM/YYYY');
    let now = new Date();
    let creacion = now.toISOString().substring(0, 10);
    console.log("DETALLES", req.body);
    const { iva, InvoiceDate, CustomerName, SaleOrderId, CommentsSaleOrder, Total, User, companyId, InvoiceNumber, Customer, Comments,
        diasCredito, InvoiceComments, condicionPago, Reason, PaymentMethodName, PaymentMethodId, Monto, NumberAccount,
        BankName, NoTransaction, CashAccount, NumberAccountId, NumberAccountBank } = req.body;

    ///////********OBTENIENDO CODIGOS DE MOVIMIENTOS Y TIPOS ******** */
    let idMovimiento;
    let idTipoMovimiento;
    let efectivoMovimiento;
    let tarjetaCreditoMov;
    let tarjetaTipo;
    if (PaymentMethodName === "Transferencia") {
        idMovimiento = await bankMovement.findOne({ Name: 'Transferencias', Company: companyId }, ['_id'])
            .then(resultado => { return resultado }).catch(err => { console.log("error en proveedir"); return err });

        idTipoMovimiento = await movementType.findOne({ Name: 'Transferencia Externa', Company: companyId }, ['_id'])
            .then(resultado => { return resultado }).catch(err => { console.log("error en proveedir"); return err });

    }
    if (PaymentMethodName === "Contado") {
        efectivoMovimiento = await cashMovement.findOne({ Name: 'Ingreso', Company: companyId }, ['_id'])
            .then(resultado => { return resultado }).catch(err => { console.log("error en proveedir"); return err });
    }

    if (PaymentMethodName === "TarjetadeCredito") {
        tarjetaCreditoMov = await bankMovement.findOne({ Name: 'Operaciones con Tarjeta', Company: companyId }, ['_id'])
            .then(resultado => { return resultado }).catch(err => { console.log("error en proveedir"); return err });

        tarjetaTipo = await movementType.findOne({ Name: 'Tarjeta de Credito', Company: companyId }, ['_id'])
            .then(resultado => { return resultado }).catch(err => { console.log("error en proveedir"); return err });

    }

    ///////********OBTENIENDO CODIGOS DE MOVIMIENTOS Y TIPOS fin ******** */

    let details = [];
    let deOrden = [];
    let impuestos = [];


    let codigo = 0;
    let codigoSalidas = 0;

    let codigoSaleOrderInvoice = await saleOrderInvoice.findOne().sort({ CodInvoice: -1 })
        .populate({ path: 'Customer', model: 'Customer', match: { Company: companyId } }).then(function (doc) {

            if (doc) {
                if (doc.CodInvoice !== null) {
                    return (doc.CodInvoice)
                }
            }
        });
    //para generar el correctivo del ingreso en caso de que sea requerido
    let codOutput = await productOutput.findOne({ Company: companyId }).sort({ CodOutput: -1 })
        .populate({ path: 'Customer', model: 'Customer', match: { Company: companyId } }).then(function (doc) {
            if (doc) {
                if (doc.CodOutput !== null) {
                    return (doc.CodOutput)
                }
            }
        });
    //obteniendo informacion de la compañia para validar
    let companyParams = await company.findById(companyId) //esta variable la mando a llamar luego que se ingreso factura
        .then(params => {
            if (!params) {
                res.status(404).send({ message: "No hay " });
            } else {
                return (params)
            }
        });


    //Deuda ppor cobrar actual
    let deudaAct = await customer.findOne({ _id: Customer }).then(function (doc) {

        if (doc) {
            if (doc.AccountsReceivable !== null) {
                return (doc.AccountsReceivable)
            }
        }
    });
    let deuda = deudaAct;
    //OBTENCION DE CORRELATIVOS
    //OBTENIENDO TIPO DE CLIENTE
    let customerType = await customer.findOne({ _id: Customer }).then(function (doc) {

        if (doc) {
            if (doc.TypeofTaxpayer !== null) {
                return (doc.TypeofTaxpayer)
            }
        }
    });
    let excento = await customer.findOne({ _id: Customer }).then(function (doc) {
        if (doc) {
            if (doc.Exempt !== null) {
                return (doc.Exempt)
            }
        }
    });

    let contribuyente = await customer.findOne({ _id: Customer }).then(function (doc) {
        if (doc) {
            if (doc.Contributor !== null) {
                return (doc.Contributor)
            }
        }
    });
    console.log("type", customerType);
    var tipo = customerType.toString();
    console.log(tipo);

    let correlativosselect = await correlativeDocument.find({ State: true })
        .populate({ path: 'DocumentType', model: 'DocumentType', match: { Referencia: tipo, Company: companyId } })
        .then(docCorrelative => {
            if (docCorrelative) {
                return docCorrelative
            }

        });
    var correlativos = correlativosselect.filter(function (item) {
        return item.DocumentType != null;
    });



    let lengEndNumber = (correlativos.map(item => item.EndNumber)).toString().length;
    let nLineas = parseInt(companyParams.InvoiceLines);
    let iniNumber = correlativos.map(item => item.CurrentNumber);

    console.log(iniNumber);
    console.log("lineas", nLineas);
    let longitudArreglo = dePurchaseOrder.length;
    console.log(longitudArreglo);
    let contador = 0;
    let i = 0;
    let step = 0;
    let correlativeNumber = parseInt(iniNumber);

    //FIN DE OBTENCION DE CORRELATIVOS
    //Creacion de correlativo de doc

    if (!codigoSaleOrderInvoice) {
        codigo = 1;
    } else { codigo = codigoSaleOrderInvoice + 1 }


    if (!codOutput) {
        codigoSalidas = 1;
    } else { codigoSalidas = codOutput + 1 }

    //IMPUESTOS
    let impuestosList = await taxes.find({ document: 'venta', Company: companyId })
        .then(taxes => {
            return (taxes)

        })
    //


    //++++++++++++++ verificando deudas +++++++++++++++++++
    //obtener fecha de facturas relacionadas con el cliente
    let invoices = await customerInvoice.find({ Pagada: false, Customer: Customer }, 'CreationDate')
        .then(resultado => { return resultado }).catch(err => { console.log("error en proveedir"); return err });

    invoices.map(item => {
        //  let date = moment(item.CreationDate).format('DD/MM/YYYY');

        let now = new Date();
        let fecha = now.getTime();
        var date = new Date(item.CreationDate);

        date.setDate(date.getDate() + diasCredito);
        let fechaPago = date.toISOString().substring(0, 10);
        let fechaAct = now.toISOString().substring(0, 10);

        if (fechaPago <= fechaAct) {
            deudor = true;
        } else { deudor = false; }

    });

    if (deudor) {
        console.log('esta en deuda');
    } else {
        console.log('agregar ingreso');
    }
    //++++++++++++++  FIN  +++++++++++++++++++


    let invoiceId = null;
    let invoiceN = null;
    let totalfactura = 0.0;
    let sumimpuestos = 0.0;
    let arreglo = [];
    let arregloFacturas = [];
    if ((companyParams.OrderWithWallet && (deudor || !deudor)) || (!companyParams.OrderWithWallet && !deudor)) {

        SaleOrderInvoice.InvoiceNumber = correlativeNumber;

        while (contador < longitudArreglo) {
            let band = false;


            while (correlativeNumber.toString().length < lengEndNumber) {

                correlativeNumber = "0" + correlativeNumber;

            }

            let factura = [{
                CodInvoice: codigo,
                Customer: Customer,
                Total: Total,
                Active: true,
                User: User,
                CreationDate: creacion,
                State: 'Creada',
                InvoiceComments: InvoiceComments,
                CommentsofSale: "",
                CustomerName: CustomerName,
                SaleOrder: null,
                InvoiceDate: InvoiceDate,
                Pagada: false,
                Entregada: !companyParams.RequieredOutput ? true : false,
                InvoiceNumber: correlativeNumber,
                DocumentCorrelative: correlativos.map(item => item._id),
                iva: parseFloat(iva)
            }]
            console.log("save", correlativeNumber);
            console.log("CONTADOR ", contador);

            await saleOrderInvoice.insertMany(factura).then(async function (SaleOrderStored) {
                if (!SaleOrderStored) {
                    res.status(500).send({ message: 'error' });

                } else {
                    band = true;
                    arregloFacturas.push(SaleOrderStored);
                    invoiceId = SaleOrderStored.map(item => { return item._id }).toString();

                    invoiceN = SaleOrderStored.map(item => { return item.InvoiceNumber }).toString();
                    let invoiceNumber = SaleOrderStored.map(item => { return item.InvoiceNumber }).toString();

                    let correlativoId = correlativos.map(item => item._id);

                    await correlativeDocument.findByIdAndUpdate({ _id: correlativoId }, { CurrentNumber: parseInt(invoiceNumber) + 1 }, async (err, update) => {
                        if (err) {
                            console.log(err);
                        }
                        if (update) {

                        }
                    });
                    let quoteId = SaleOrderStored.CustomerQuote;
                    //cambio de estado a orden de venta

                    // saleOrders.findByIdAndUpdate({_id:SaleOrderId},{State:"Facturada"},async (err,update)=>{
                    //     if(err){
                    //         res.status(500).send({ message: "Error del servidor." });
                    //     }
                    //     if(update){}});
                    //OBTENIENDO INFORMACIÓN DE ANTICIPO 

                    if (invoiceId) {


                        for (let i = 0; i < nLineas; i++) {

                            if (dePurchaseOrder[contador + i]) {
                                //    console.log("prueba",dePurchaseOrder[contador+ i].dato);

                                totalfactura += (parseFloat(dePurchaseOrder[contador + i].total));
                                deOrden.push({

                                    ProductName: dePurchaseOrder[contador + i].Name,
                                    SaleOrderInvoice: invoiceId,
                                    Quantity: parseFloat(dePurchaseOrder[contador + i].Quantity),
                                    Discount: parseFloat(dePurchaseOrder[contador + i].Discount),
                                    Price: parseFloat(dePurchaseOrder[contador + i].Price),
                                    Inventory: dePurchaseOrder[contador + i].Inventory,
                                    SubTotal: parseFloat(dePurchaseOrder[contador + i].total),
                                    Entregados: !companyParams.RequieredOutput ? parseFloat(dePurchaseOrder[contador + i].Quantity) : 0,
                                    State: !companyParams.RequieredOutput ? true : false,
                                    Measure: dePurchaseOrder[contador + i].Measures,
                                    CodProduct: dePurchaseOrder[contador + i].codproducts,
                                    Product: dePurchaseOrder[contador + i].ProductId,

                                    iniQuantity: dePurchaseOrder[contador + i].Quantity,
                                    BuyPrice: parseFloat(dePurchaseOrder[contador + i].BuyPrice),
                                    PriceDiscount: parseFloat(dePurchaseOrder[contador + i].PrecioDescuento) ?
                                        parseFloat(dePurchaseOrder[contador + i].PrecioDescuento) : parseFloat(dePurchaseOrder[contador + i].Descuento)
                                })

                            }
                            else { deOrden[null] }
                        }


                        //para hacer el calculo de impuestos por factura
                        var impuestosSinRetencion = impuestosList.filter(function (item) {   //obteniendo todos los impuestos menos la retencion
                            return item.Name != "Retencion";
                        });
                        console.log("dtos del cliente", excento, contribuyente, customerType);
                        if (customerType.toString() === "CreditoFiscal" && excento.toString() === "false" && contribuyente.toString() === "Grande") {
                            console.log("GRAN CONTRIBUYENTE SIN exento", totalfactura);
                            if (parseFloat(Total) > 100) {
                                impuestosList.map(item => {
                                    sumimpuestos += parseFloat(totalfactura * item.percentage / 100);
                                })
                            } else {
                                impuestosSinRetencion.map(item => {
                                    sumimpuestos += parseFloat(totalfactura * item.percentage / 100);
                                })
                            }
                            console.log("IMPUESTOS A SUMAR", sumimpuestos);
                        }
                        else if (customerType.toString() === "CreditoFiscal" && excento.toString() === "true" && contribuyente.toString() === "Grande") { sumimpuestos = 0 }
                        else if (customerType.toString() === "ConsumidorFinal" && excento.toString() === "true") { sumimpuestos = 0 }
                        else if (customerType.toString() === "CreditoFiscal" && excento.toString() === "false" && contribuyente.toString() !== "Grande") {
                            impuestosSinRetencion.map(item => {
                                sumimpuestos += parseFloat(totalfactura * item.percentage / 100);
                            })
                        }
                        else if (customerType.toString() === "ConsumidorFinal" && excento.toString() === "false" && contribuyente.toString() !== "Grande") { sumimpuestos = 0 }


                        totalfactura = totalfactura + sumimpuestos;

                        saleOrderInvoice.findByIdAndUpdate({ _id: invoiceId }, { Total: totalfactura }, async (err, update) => {
                            if (err) {

                            }
                            if (update) { }
                        });
                        console.log("AREGGLO DEL DETALLE DE LA FACTURA", deOrden);
                        if (deOrden.length > 0 || deOrden !== null) {    //insertando detalles de los detalles de la orden
                            await saleOrderInvoiceDetails.insertMany(deOrden)
                                .then(async function (detalles) {
                                    //si ingreso no requerido
                                    console.log("DETALLES INGRESADOS", detalles);
                                    if (detalles) {
                                        arreglo.push(detalles);
                                        //cuenta por cobrar
                                        let iddetalle = detalles.map(item => { return item._id }).toString();


                                        if (condicionPago === 'Contado') {
                                            await saleOrderInvoice.findByIdAndUpdate({ _id: invoiceId }, { Pagada: true }, (err, updateDeuda) => {
                                                if (err) {

                                                    console.log(err);
                                                } else { }
                                            });


                                            let pago = [{
                                                SaleOrderInvoice: invoiceId,
                                                DatePayment: creacion,
                                                User: User,
                                                codpayment: codigo,
                                                Saldo: 0,
                                                Customer: Customer
                                            }]



                                            await CustomerPayment.insertMany(pago)
                                                .then(function (paymentStored) {
                                                    //   res.status(500).send({message: err});


                                                    if (!paymentStored) {
                                                        res.status(500).send({ message: "No se inserto registro" });

                                                    }
                                                    else {

                                                        let paymentid = paymentStored.map(item => { return item._id }).toString();
                                                        let codInvoice = paymentStored.map(item => { return item.SaleOrderInvoice }).toString();
                                                        let payDetail = [{
                                                            CreationDate: creacion,
                                                            Reason: Reason,
                                                            PaymentMethods: PaymentMethodId,
                                                            Cancelled: false,
                                                            Amount: (totalfactura).toFixed(2),
                                                            CustomerPayment: paymentid,
                                                            SaleOrderInvoice: codInvoice,
                                                            NumberAccount: PaymentMethodName === "Transferencia" ? NumberAccountBank : NumberAccount,
                                                            BankName: BankName,
                                                            NoTransaction: PaymentMethodName === "Transferencia"
                                                                || PaymentMethodName === "TarjetadeCredito" ? NoTransaction : null,
                                                            CashAccount: PaymentMethodName === "Contado" ? CashAccount : null,
                                                            BankAccount: PaymentMethodName === "Transferencia"
                                                                || PaymentMethodName === "TarjetadeCredito" ? NumberAccountId : null,

                                                        }]

                                                        CustomerPaymentDetails.insertMany(payDetail)
                                                            .then(async function (detailStored) {

                                                                if (!detailStored) {
                                                                    // res.status(500).send({message: err});
                                                                    console.log(err);
                                                                }
                                                                else {
                                                                    let paymentDetailId = detailStored.map(item => { return item._id });

                                                                    if (paymentDetailId) {
                                                                        let sumMontos = await CustomerPaymentDetails.aggregate([
                                                                            { $match: { CustomerPayment: paymentid } },

                                                                            {
                                                                                $group: {
                                                                                    _id: null,
                                                                                    "sumAmount": { $sum: '$Amount' }
                                                                                }
                                                                            },

                                                                        ]);
                                                                        let sumaMontos = 0.0;
                                                                        sumMontos.map(item => {
                                                                            sumaMontos = item.sumAmount;
                                                                        })
                                                                        //actualizando deuda con cliente
                                                                        let cuentaNueva = parseFloat(deuda) + parseFloat(totalfactura);


                                                                        //  await customer.findByIdAndUpdate({_id:Customer},{AccountsReceivable:cuentaNueva.toFixed(2)},(err,updateDeuda)=>{
                                                                        //       if(err){

                                                                        //           console.log(err);
                                                                        //       }else{}
                                                                        //   });




                                                                    }

                                                                }

                                                            });


                                                        //Reegistro de movimiento de banco
                                                        let Type;
                                                        let BankMovement;

                                                        if (PaymentMethodName === "Contado") {
                                                            const CashTransaction = new cashTransaction();

                                                            CashTransaction.TransactionDate = creacion;
                                                            CashTransaction.Concept = Reason;
                                                            CashTransaction.User = User;
                                                            CashTransaction.Deposit = Monto;
                                                            CashTransaction.Withdrawal = 0;
                                                            CashTransaction.CashMovement = efectivoMovimiento;
                                                            CashTransaction.CashAccount = CashAccount;

                                                            CashTransaction.save(async (err, CashTransactionStored) => {
                                                                if (err) {
                                                                    res.status(500).send({ message: err });
                                                                } else {
                                                                    if (!CashTransactionStored) {
                                                                        res.status(500).send({ message: "Error" });
                                                                    } else {
                                                                        let saldoCurrentAccount = await cashAccount.findOne({ _id: CashAccount }, 'Saldo').then(result => { return result.Saldo });
                                                                        cashAccount.findByIdAndUpdate({ _id: CashAccount },
                                                                            { Saldo: parseFloat(parseFloat(saldoCurrentAccount) + parseFloat(Monto)).toFixed(2) },
                                                                            (err, updateDeuda) => {
                                                                                if (err) {
                                                                                    console.log(err);
                                                                                }
                                                                            });
                                                                    }
                                                                }
                                                            })
                                                        }


                                                        if (PaymentMethodName === "Transferencia" || PaymentMethodName === "TarjetadeCredito") {
                                                            console.log("ENTRO A MOVMIENTOS");
                                                            if (PaymentMethodName === "Transferencia") {
                                                                BankMovement = idMovimiento;
                                                                Type = idTipoMovimiento


                                                            }
                                                            if (PaymentMethodName === "TarjetadeCredito") {
                                                                console.log("PAGO TARJERA DE CREDITO");
                                                                BankMovement = tarjetaCreditoMov;
                                                                Type = tarjetaTipo;
                                                            }

                                                            let BankingTransaction = new bankingTransaction();
                                                            BankingTransaction.Type = Type
                                                            BankingTransaction.TransactionDate = creacion;
                                                            BankingTransaction.Concept = Reason;
                                                            // BankingTransaction.OperationNumber=OperationNumber;
                                                            BankingTransaction.User = User;
                                                            BankingTransaction.DocumentNumber = NoTransaction;
                                                            BankingTransaction.Deposit = Monto;
                                                            BankingTransaction.Withdrawal = 0;
                                                            BankingTransaction.BankMovement = BankMovement;
                                                            BankingTransaction.Account = NumberAccountId;

                                                            BankingTransaction.save(async (err, BankingTransactionStored) => {
                                                                if (err) {
                                                                    // res.status(500).send({message: err});
                                                                } else {
                                                                    if (!BankingTransactionStored) {
                                                                        // res.status(500).send({message: "Error"});
                                                                    } else {
                                                                        let saldoCurrentAccount = await bankAccount.findOne({ _id: NumberAccountId }, 'Saldo').then(result => { return result.Saldo });
                                                                        console.log("SALDO DE LA CUENTA ACTUAL", saldoCurrentAccount);

                                                                        bankAccount.findByIdAndUpdate({ _id: NumberAccountId },
                                                                            { Saldo: parseFloat(parseFloat(saldoCurrentAccount) + parseFloat(Monto)).toFixed(2) },
                                                                            (err, updateDeuda) => {
                                                                                if (err) {
                                                                                    console.log(err);
                                                                                }
                                                                            })

                                                                    }
                                                                }
                                                            });


                                                        }


                                                    }

                                                })
                                        } else {
                                            let cuentaNueva = parseFloat(deudaAct) + parseFloat(Total);
                                            customer.findByIdAndUpdate({ _id: Customer }, {
                                                AccountsReceivable: cuentaNueva.toFixed(2),
                                            }).then(function (update) {
                                                if (!update) {

                                                }
                                                else { }
                                            }).catch(err => { console.log(err) });
                                        }

                                    } else {
                                        res.status(500).send({ message: "No se registraron detalles" });
                                    }


                                })
                                .catch(function (err) {
                                    console.log(err);
                                });
                        }



                    }








                }
                return
            })
            deOrden = [];
            totalfactura = 0.0;
            sumimpuestos = 0.0;
            contador += nLineas;
            codigo += 1;
            correlativeNumber = parseInt(correlativeNumber) + 1;
            console.log("CONTADOR FINAL while", contador);

        }//fin del while
        res.status(200).send({ orden: "cambios" });

    }

    if (!companyParams.OrderWithWallet && deudor) {
        res.status(500).send({ message: "No se puede registrar orden de venta a cliente" });
    }


    if (!companyParams.RequieredOutput) {

        let salida = [];

        let datosFactura = [];
        let datosDetalles = [];
        let noFactura = null;
        let count = 0;
        arregloFacturas.map(async item => {
            let id = item.forEach(item => {
                datosFactura.push(item)


            });
        });
        arreglo.map(item => {
            // console.log("arreglo final", item);
            item.forEach(item => {
                datosDetalles.push(item);

            })


        })


        datosFactura.map(item => {
            noFactura = item.InvoiceNumber
            salida.push(
                {
                    EntryDate: creacion,
                    User: User,
                    Comments: "Ingreso automatico " + creacion,
                    State: true,
                    CodOutput: codigoSalidas,
                    Company: companyId,
                    SaleOrderInvoice: item._id,
                    Customer: Customer,
                    InvoiceNumber: item.InvoiceNumber,

                }
            )


        })
        await productOutput.insertMany(salida).then(async function (outputStored) {
            if (!outputStored) {


            } else {
                var detalles = [];
                let cont = 0;


                outputStored.map(async item => {
                    let long = outputStored.length;
                    console.log("INICIO CATASTROFE ¨¨¨¨¨¨¨¨");
                    let idfactura = item.SaleOrderInvoice;
                    let numFactura = item.InvoiceNumber;
                    let id = item._id;
                    console.log("ID+++++++++++++++++++++++++++++", id);
                    let data = await saleOrderInvoiceDetails.find({ SaleOrderInvoice: idfactura }).then(async function (data) {
                        return data;


                    });
                    data.map(item => {
                        detalles.push(
                            {
                                SaleInvoiceDetail: item._id,
                                ProductOutput: id,
                                Quantity: item.Quantity,
                                Inventory: item.Inventory,
                                ProductName: item.ProductName,
                                Price: item.Price,
                                Measure: item.Measure,
                                CodProduct: item.CodProduct,
                                Product: item.Product,
                                SaleOrderInvoice: item.SaleOrderInvoice

                            }
                        );

                    })
                    if (parseInt(long) <= parseInt(cont)) {
                        console.log("gola ");
                    }

                    cont += 1;
                    if (parseInt(long) === parseInt(cont)) {
                        productOutputDetail.insertMany(detalles).then(async function (outputStored) {
                            console.log("INSERTANDO DETALLES");
                            console.log(outputStored);
                            if (outputStored) {
                                outputStored.map(async item => {
                                    let SaleInvoiceId = item.SaleOrderInvoice;
                                    let salidaId = item.ProductOutput;
                                    //obteniendo stock de producto  (bodega principal)

                                    let infoInventary = await inventory.findOne({ _id: item.Inventory }, ['Stock', 'Product'])
                                        .then(resultado => { return resultado }).catch(err => { console.log("error en proveedir"); return err });
                                    console.log('EN STOCK:', infoInventary);

                                    let productreserved = await inventory.findOne({ Product: infoInventary.Product, _id: { $nin: infoInventary._id } }, ['Stock', 'Product'])
                                        .populate({ path: 'Bodega', model: 'Bodega', match: { Name: 'Reserva' } })
                                        .then(resultado => { return resultado }).catch(err => { console.log("error en proveedir"); return err });

                                    //obteniendo id del movimiento de tipo reserva
                                    let movementId = await MovementTypes.findOne({ Name: 'salida' }, ['_id'])
                                        .then(resultado => { return resultado }).catch(err => { console.log("error en proveedir"); return err });

                                    //cambios de cantidad ingresada
                                    let proIngresados = await saleOrderInvoiceDetails.findOne({ _id: item.SaleInvoiceDetail }, 'Entregados')
                                        .then(resultado => { return resultado }).catch(err => { console.log("error en proveedir"); return err });
                                    let quantityInvoice = await saleOrderInvoiceDetails.findOne({ _id: item.SaleInvoiceDetail }, 'Quantity')
                                        .then(resultado => { return resultado }).catch(err => { console.log("error en proveedir"); return err });

                                    let cantidad = 0.0;
                                    let ingresos = 0.0;
                                    let productRestante = 0.0;
                                    let ingresoUpdate = 0.0;
                                    console.log("RESERVA", productreserved);
                                    console.log("PRODUCTOS ENTREGADOS", proIngresados);
                                    console.log("PRODUCTOS de factura", quantityInvoice);
                                    console.log("compamnia habitada reserva", companyParams.AvailableReservation);
                                    ingresos = parseFloat(proIngresados.Entregados) + parseFloat(item.Quantity);
                                    console.log("a entregar", ingresos);
                                    //cambiando estados e ingresos de  detalle factur
                                    if (proIngresados !== null) {
                                        if (parseFloat(ingresos) === parseFloat(quantityInvoice.Quantity)) {
                                            console.log('COMPLETADO INGRESO');
                                            //    await saleOrderInvoiceDetails.updateMany({_id:item.SaleInvoiceDetail},{
                                            //         Entregados:ingresos,
                                            //         State:true
                                            //     })
                                            //     .catch(err => {console.log(err);})

                                        }
                                        else {
                                            console.log('NO COMPLETADO INGRESO');

                                            // await saleOrderInvoiceDetails.updateMany({_id:item.SaleInvoiceDetail},{
                                            //     Entregados:ingresos,
                                            //     State:false
                                            // }).catch(err => {console.log(err);})

                                        }
                                        actualizado = true;
                                    }

                                    if (parseFloat(infoInventary.Stock) >= parseFloat(item.Quantity)) {
                                        //descontando cantidad que se reservara
                                        inventory.findByIdAndUpdate({ _id: item.Inventory }, {
                                            Stock: parseFloat(infoInventary.Stock - item.Quantity),
                                        }).then(async function (update) {
                                            if (!update) {

                                            }
                                            else {
                                                let completados = await saleOrderInvoiceDetails.countDocuments({ State: true, SaleOrderInvoice: SaleInvoiceId }).then(c => {
                                                    return c
                                                });

                                                let registrados = await saleOrderInvoiceDetails.countDocuments({ SaleOrderInvoice: SaleInvoiceId }, function (err, count) {
                                                    console.log(count); return (count)
                                                });
                                                console.log('PURCHASE INVOICE', SaleInvoiceId);
                                                console.log('completados', completados);
                                                console.log('todos', registrados);
                                                //validando si todos los productos estan ingresados
                                                if (parseInt(completados) === parseInt(registrados)) {
                                                    console.log("cambiando");
                                                    saleOrderInvoice.findByIdAndUpdate({ _id: SaleInvoiceId }, {
                                                        Entregada: true,
                                                    })
                                                        .catch(err => { console.log(err); });

                                                }
                                                const inventorytraceability = new inventoryTraceability();
                                                inventorytraceability.Quantity = item.Quantity;
                                                inventorytraceability.Product = item.Product;
                                                inventorytraceability.WarehouseDestination = null; //destino
                                                inventorytraceability.MovementType = movementId._id;
                                                inventorytraceability.MovDate = creacion;
                                                inventorytraceability.WarehouseOrigin = item.Inventory; //origen
                                                inventorytraceability.User = User;
                                                inventorytraceability.Company = companyId;
                                                inventorytraceability.DocumentId = salidaId;
                                                inventorytraceability.ProductDestiny = null;
                                                inventorytraceability.DocumentNumber = numFactura;
                                                inventorytraceability.DocType = "Factura Compra";
                                                inventorytraceability.Cost = parseFloat(item.Quantity) * parseFloat(item.Price);
                                                inventorytraceability.save((err, traceabilityStored) => {
                                                    if (err) {
                                                        // res.status(500).send({message: err});

                                                    } else {
                                                        if (!traceabilityStored) {
                                                            // res.status(500).send({message: "Error al crear el nuevo usuario."});
                                                            console.log(traceabilityStored);
                                                        }
                                                        else {

                                                        }
                                                    }
                                                });


                                                console.log('id del moviminto de reserva', movementId);
                                                //registro de movimiento


                                            }
                                        })
                                            .catch(err => { console.log(err); });

                                        //stock de bodega de reserva
                                        console.log(infoInventary.Product);

                                    }

                                    else {

                                        res.status(500).send({ message: "Verificar Inventario" });

                                    }

                                })
                            }
                        })
                    }
                })
            }
        });
    }
}

async function ImprimirPdf(req, res) {
    //se tiene que generar una factura sin ningun formato ya que esto se imprimera sobre una factura preimpresa de la compañia
    // ucontrol solo tiene que generar la informacion a imprimir
    console.log(req.params)

    //obtenmos la cabecera de la factura
    let facturas = await saleOrderInvoice.findOne({ _id: req.params.id })
        .populate({
            path: 'Customer', model: 'Customer'
            , populate: { path: 'Sector', model: 'Sector' }
        })
        .populate({ path: 'User', model: 'User', populate: { path: 'Company', model: 'Company' } })
        .populate({ path: 'SaleOrder', model: 'SaleOrder' })
        .populate({
            path: 'DocumentCorrelative', model: 'DocumentCorrelative'
            , populate: { path: 'DocumentType', model: 'DocumentType' }
        })
        .then((facturas1) => { return facturas1 }).catch(err => { console.log("error en proveedir"); return err });
    console.log(facturas);
    //obtemos el cuerpo de la factura es decir todos sus prodcuctos
    let resultado = await saleOrderInvoiceDetails.find({ SaleOrderInvoice: facturas._id })
        .populate({
            path: 'Inventory', model: 'Inventory',
            populate: ({ path: 'Bodega', model: 'Bodega', match: { Name: 'Principal' } }),
            populate: ({
                path: 'Product', model: 'Product',
                populate: { path: 'Measure', model: 'Measure' }
            }
            )
        })
        .populate({ path: 'SaleOrderInvoice', model: 'SaleOrderInvoice' })
        .then((resultado1) => { return resultado1 }).catch(err => { console.log("error en proveedir"); return err });

    //arreglando la fecha al formato del pais
    var date = new Date(facturas.InvoiceDate);
    //se valida que tipo de factura es ya que son de formato diferente tipos : credito fiscal y consumidor final
    //varia la forma de visualizacion de los imppuestos, ya que para credito fiscal se muestra en el detalle de la factura
    if (facturas.Customer.TypeofTaxpayer === "ConsumidorFinal") {   //para consumidor final
        //se va a realizar la busqueda por empresa para mostrar el formato de factura de la empresa
        //en este caso cuando sea consumidor final
        let coordenadasfinal = await coordinatesInvoice.findOne({ Company: req.params.companyId, typeInvoice: "ConsumidorFinal" })
            .then(coor => {
                return coor;
            })
            .catch(err => {
                return err
            })
        //termina la busqueda
        const invoiceName = 'Factura-' + facturas.CodInvoice + '.pdf';
        var i = 0
        let total = 0
        //creando pdf y dandole el tamaño de pagina
        const doc = new PDFDocument()
        const filePath = 'Factura-' + facturas.InvoiceNumber + '.pdf';
        doc.pipe(fs.createWriteStream('Factura-' + facturas.CodInvoice + '.pdf'));
        doc.pipe(res);
        doc
            .font('Times-Roman', 6)
            .text(date.toLocaleDateString(), coordenadasfinal.dateCoorX, coordenadasfinal.dateCoorY)
            .text(facturas.Customer.Name + ' ' + facturas.Customer.LastName, coordenadasfinal.nameCoorX, coordenadasfinal.nameCoorY)
            .text(facturas.Customer.Country + ', ' + facturas.Customer.City, coordenadasfinal.cityCoorX, coordenadasfinal.cityCoorY)
            .text(facturas.Customer.Nit, coordenadasfinal.nitCoorX, coordenadasfinal.nitCoorY)
            .text(facturas.Customer.PaymentCondition, coordenadasfinal.payConditionCoorX, coordenadasfinal.payConditionCoorY)
        doc.y = coordenadasfinal.posY;
        resultado.forEach(function (valor, indice, resultado) {
            let yPos = doc.y + 10
            doc.text(valor.Quantity, coordenadasfinal.quantityCoorX, yPos)
                .text(valor.ProductName, coordenadasfinal.productsCoorX, yPos)
                .text(valor.Price.toFixed(2), coordenadasfinal.priceCoorX, yPos)
                .text(valor.SubTotal.toFixed(2), coordenadasfinal.subtotalCoor, yPos)
            total = valor.SubTotal + total;
            doc.moveDown()
        })
        console.log(total);
        doc.text(total.toFixed(2), coordenadasfinal.totalCoorX, coordenadasfinal.totalCoorY)
            .text(total.toFixed(2), coordenadasfinal.totalCoorX, coordenadasfinal.totalCoorY2)
            .moveDown();
        const stream = doc.pipe(blobStream())
        doc.end();
        fs.readFile('Factura-' + facturas.CodInvoice + '.pdf', (err, data) => {
            if (err) {
                console.log("error:", err);
                console.log("entro al error");
            }
            else {
                console.log("entro al else");
                console.log(data);
                fs.createReadStream('Factura-' + facturas.CodInvoice + '.pdf');
                res.sendFile(path.resolve('Factura-' + facturas.CodInvoice + '.pdf'))
            }
        });
        console.log("Termino")

    } else {   //en el caso de credito fiscal

        //buscando coordenadas cuando sea creditofiscal
        let coordenadasfiscal = await coordinatesInvoice.findOne({ Company: req.params.companyId, typeInvoice: "CreditoFiscal" })
            .then(coor => {
                return coor;
            })
            .catch(err => {
                return err
            })
        //fin de busqueda de coordenadas


        var i = 0
        let total = 0
        const doc = new PDFDocument()
        const filePath = 'CreditoFiscal-' + facturas.InvoiceNumber + '.pdf';
        doc.pipe(fs.createWriteStream('CreditoFiscal-' + facturas.CodInvoice + '.pdf'));
        doc.pipe(res);
        doc
            .font('Times-Roman', 7)
            .text(facturas.CodInvoice, coordenadasfiscal.codInvoiceCoorX, coordenadasfiscal.codInvoiceCoorY)
            .text(facturas.Customer.Name + ' ' + facturas.Customer.LastName, coordenadasfiscal.nameCoorX, coordenadasfiscal.nameCoorY)
            .text(date.toLocaleDateString(), coordenadasfiscal.dateCoorX, coordenadasfiscal.dateCoorY)
            .text(facturas.Customer.Address, coordenadasfiscal.cityCoorX, coordenadasfiscal.cityCoorY)
            .text(facturas.Customer.Sector.Name, coordenadasfiscal.sectorNameCoorX, coordenadasfiscal.sectorNameCoorY)
            .text(facturas.Customer.Ncr, coordenadasfiscal.ncrCoorX, coordenadasfiscal.ncrCoorY)
            .text(facturas.Customer.City, coordenadasfiscal.cityCoorX, 190)
            .text(facturas.Customer.Nit, coordenadasfiscal.nitCoorX, coordenadasfiscal.nitCoorY)
            .text(facturas.Customer.PaymentCondition, coordenadasfiscal.payConditionCoorX, coordenadasfiscal.payConditionCoorY)
        doc.y = coordenadasfiscal.posY;
        resultado.forEach(function (valor, indice, resultado) {
            let yPos = doc.y + 10
            doc.text(valor.Quantity, coordenadasfiscal.quantityCoorX, yPos)
                .text(valor.ProductName, coordenadasfiscal.productsCoorX, yPos)
                .text(valor.Price.toFixed(2), coordenadasfiscal.priceCoorX, yPos)
                .text(valor.SubTotal.toFixed(2), coordenadasfiscal.subtotalCoor, yPos)
            total = valor.SubTotal + total;
            doc.moveDown()
        })
        console.log(total);
        doc.text(total.toFixed(2), 370, 440)
            .text((total - (total / 1.13)).toFixed(2), coordenadasfiscal.totalCoorX, coordenadasfiscal.totalCoorY)
            .text((total + (total - (total / 1.13))).toFixed(2), coordenadasfiscal.totalCoorX, coordenadasfiscal.totalCoorY2)
            .moveDown();
        const stream = doc.pipe(blobStream())
        doc.end();
        fs.readFile('CreditoFiscal-' + facturas.CodInvoice + '.pdf', (err, data) => {
            if (err) {
                console.log("error:", err);
                console.log("entro al error");
            }
            else {
                console.log("entro al else");
                console.log(data);
                fs.createReadStream('CreditoFiscal-' + facturas.CodInvoice + '.pdf');
                res.sendFile(path.resolve('CreditoFiscal-' + facturas.CodInvoice + '.pdf'))
            }
        });
        console.log("Termino")
    }
}

var pdf = require('html-pdf')
//funcion para probar la libreria html-pdf
async function InvoiceHtmlPdf(req, res) {
    var html = fs.readFileSync('app/templates/factura1.php', 'utf8');
    var options = { format: 'Letter' }
    //obteniendo la informacion que se mostrara en la factura
    //obtenmos la cabecera de la factura
    let facturas = await saleOrderInvoice.findOne({ _id: req.params.id })
        .populate({
            path: 'Customer', model: 'Customer'
            , populate: { path: 'Sector', model: 'Sector' }
        })
        .populate({ path: 'User', model: 'User', populate: { path: 'Company', model: 'Company' } })
        .populate({ path: 'SaleOrder', model: 'SaleOrder' })
        .populate({
            path: 'DocumentCorrelative', model: 'DocumentCorrelative'
            , populate: { path: 'DocumentType', model: 'DocumentType' }
        })
        .then((facturas1) => { return facturas1 }).catch(err => { console.log("error en proveedir"); return err });
    console.log(facturas);
    //obtemos el cuerpo de la factura es decir todos sus prodcuctos
    let resultado = await saleOrderInvoiceDetails.find({ SaleOrderInvoice: facturas._id })
        .populate({
            path: 'Inventory', model: 'Inventory',
            populate: ({ path: 'Bodega', model: 'Bodega', match: { Name: 'Principal' } }),
            populate: ({
                path: 'Product', model: 'Product',
                populate: { path: 'Measure', model: 'Measure' }
            }
            )
        })
        .populate({ path: 'SaleOrderInvoice', model: 'SaleOrderInvoice' })
        .then((resultado1) => { return resultado1 }).catch(err => { console.log("error en proveedir"); return err });
    //fin de busqueda de informacion

    let rowProducts = ``;
    resultado.forEach(function (valor) {
        rowProducts +=
            `<tr>
        <td>${valor.Quantity}</td>
        <td>${valor.ProductName}</td>
        <td>${valor.Price}</td>
        </tr>   `
    })

    //reemplazando elementos en el html
    html = html.replace("{{tablaProductos}}", rowProducts);
    html = html.replace("{{nombrecliente}}", facturas.Customer.Name)
    html = html.replace("{{fechafactura}}", facturas.Customer.InvoiceDate)
    html = html.replace("{{direccion}}", facturas.Customer.Address)
    html = html.replace("{{nit}}", facturas.Customer.Nit)
    html = html.replace("{{condicion}}", `<p>${facturas.Customer.PaymentCondition}</p>`)

    pdf.create(html, options).toFile('app/download/factura1.pdf', function (err, res) {
        if (err) {
            console.log(err)
        } else {
            console.log(res)
        }
    });
}


async function getSalesThisMonth(req, res) {
    //obtener lo facturado por el usuario logueado en el mes actual
    const id = req.params.id;
    const supplierId = req.params.customer;
    let now = new Date();
    let fecha = now.getTime();

    let f1 = now;
    var ObjectID = require('mongodb').ObjectID;
    var date = new Date(fecha);

    date.setMonth(date.getMonth() - 1);
    /* Obtenemos la fecha en formato YYYY-mm */
    let f2 = date;
    console.log("ahora", f1);
    console.log("mes", f2);
    var date = new Date(), y = date.getFullYear(), m = date.getMonth();  //obteniendo dia inicial del mes actual
    console.log("y", y);
    var firstDay = new Date(y, m, 1);
    console.log("inicial", firstDay);
    saleOrderInvoice.aggregate([
        {
            $match:

            {
                $expr:
                {
                    $and:
                        [
                            { $eq: ["$User", ObjectID(id)] },
                            { $lte: ["$InvoiceDate", f1] },  // $lte menor o igual  (fecha actual)
                            { $gte: ["$InvoiceDate", firstDay] },   //$gte mayor o igual (pprimer dia del mes)
                        ]
                }
            }
        },
        {
            $group: {
                _id: null,
                "sumAmount": { $sum: '$Total' }
            }
        }
    ])
        .then(result => {

            res.status(200).send(result);

        }).catch(err => { console.log(err) })
}
async function getSalesLastMonth(req, res) {
    // obtiene lo facturado el mes anterior 
    const id = req.params.id;
    const supplierId = req.params.customer;
    var ObjectID = require('mongodb').ObjectID;

    let now = new Date();
    let fecha = now.getTime();
    var date = new Date(fecha);

    date.setMonth(date.getMonth() - 1); //calculo para obtener el mes anterior al actual

    let mesanterior = date;

    console.log("mes", mesanterior);
    //determinando primer y ultimo día del mes anterior
    var date = new Date(), y = date.getFullYear(), m = date.getMonth() - 1;
    var firstDay = new Date(y, m, 1);
    var lastDay = new Date(y, m + 1, 0);
    console.log("inicial", firstDay);
    console.log("inicial", lastDay);
    saleOrderInvoice.aggregate([
        {
            $match:

            {
                $expr:
                {
                    $and:
                        [
                            { $eq: ["$User", ObjectID(id)] },
                            { $lte: ["$InvoiceDate", lastDay] },  // $lte menor o igual (ultimo dia )
                            { $gte: ["$InvoiceDate", firstDay] },   //$gte mayor o igual (primer dia)
                        ]
                }
            }
        },
        {
            $group: {
                _id: null,
                "sumAmount": { $sum: '$Total' }
            }
        }
    ])
        .then(result => {

            res.status(200).send(result);

        }).catch(err => { console.log(err) })
}
module.exports = {
    InvoiceHtmlPdf,
    getSaleOrderInvoices,
    getSaleOrdersClosed,
    getSaleOrderInfo,
    getSaleOrderDetails,
    createSaleOrderInvoiceWithOrder,
    createSaleOrderInvoice,
    getSaleInvoiceDetails,
    updateSaleOrderInvoice,
    deleteSaleInvoiceDetails,
    anularSaleInovice,
    getSaleInvoicesNoPagadas,
    getSaleInvoiceHeader,
    getSaleInvoicePendientesIngreso,
    getChargestoCustomers,
    getSaleOrderInvoicebyCustomers,
    funcionPruebaCorrelativos,
    createSaleOrderInvoiceWithOrder2,
    getSalesForUsers,
    getSalesForProducts,
    getExportInfoFacturas,
    getDetallesVentaContribuyente,
    createSaleOrderInvoice2,
    ImprimirPdf,
    getSalesThisMonth,
    getSalesLastMonth
}