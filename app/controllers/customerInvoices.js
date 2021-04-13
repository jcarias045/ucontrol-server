const moment=require("moment");
const customerInvoice= require('../models/customerinvoice.model');

function createCustomerInvoice(req, res){
    const CustomerInvoice = new customerInvoice();

    const {Customer} = req.body
    moment.locale();
    let creacion = moment().format('L');

    CustomerInvoice.CreationDate= creacion
    CustomerInvoice.Customer= Customer;
  

    console.log(CustomerInvoice);
    CustomerInvoice.save((err, CustomerInvoiceStored)=>{
        if(err){
            res.status(500).send({message: err});
        }else{
            if(!CustomerInvoiceStored){
                res.status(500).send({message: "Error"});
            }else{
                res.status(200).send({CustomerInvoice: CustomerInvoiceStored})
            }
        }
    });
}


function getCustomerInvoice(req, res){
    // Buscamos informacion para llenar el modelo de 
    let doc=req.params.doc;
    let companyId=req.params.company;
    try{
        CustomerInvoice.find({document:doc,Company:companyId})
        .then(CustomerInvoice => {
            res.status(200).send({CustomerInvoice});
          
        })
    }catch(error) {
        // imprimimos a consola
        console.log(error);

        res.status(500).json({
            message: "Error en query!",
            error: error
        });
    }
}

module.exports={
    getCustomerInvoice,
    createCustomerInvoice
}