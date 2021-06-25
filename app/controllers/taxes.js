const taxes= require('../models/taxes.model');

function createTaxes(req, res){
    const Taxes = new taxes();

    const {Name, document, percentage, Company,Parameter,Value,DocValue,State} = req.body

    Taxes.Name= Name
    Taxes.document= document;
    Taxes.percentage= percentage;
    Taxes.Company=Company;
    Taxes.Parameter= Parameter;
    Taxes.Value= Value;
    Taxes.DocValue= DocValue;
    Taxes.State=true;

    Taxes.save((err, TaxesStored)=>{
        if(err){
            res.status(500).send({message: err});
        }else{
            if(!TaxesStored){
                res.status(500).send({message: "Error"});
            }else{
                res.status(200).send({Taxes: TaxesStored})
            }
        }
    });
}


function getTaxes(req, res){
    // Buscamos informacion para llenar el modelo de 
    let doc=req.params.doc;
    let companyId=req.params.company;
    console.log(req.body);
    try{
        taxes.find({document:doc,Company:companyId})
        .then(taxes => {
            var filtered = taxes.filter(function (item) {
                return item.Bodega != null && item.Product!=null;
              });

              console.log("hola",taxes);
              res.status(200).send({taxes: taxes})
          
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

function getTaxesCustom(req, res){
    // Buscamos informacion para llenar el modelo de 
    let doc=req.params.doc;
    let companyId=req.params.company;
    console.log("IMPUESTOS", req.body);
    let {proveedor,total}=req.body;
    let infoProveedor=proveedor;
    try{
        taxes.find({document:doc,Company:companyId})
        .then(taxes => {
            let exento;
            let contribuyente;
            let clasificacion;
            infoProveedor.map(item => {
                exento = item.Exempt;
                contribuyente = item.Contributor;
                clasificacion=item.Classification;
            });
            let impuestos; //esta sera la variable final que se enviara
            //filtrado de condiciones del proveedor
            //si gran contribuyente
            // if(contribuyente==="Grande" && parseFloat(total)>=){}
            console.log(exento);
            console.log(contribuyente);
            
            var filtered = taxes.filter(function (item) {
               if(parseFloat(total) >= parseFloat(item.DocValue)){
                   console.log("si es mas grande");
               }
                return (parseFloat(total) >= parseFloat(item.DocValue) && item.Value===contribuyente) ||
                (item.Value === exento.toString() ) ||  (item.Value === clasificacion );
              });
               console.log("los impuestos", filtered);
             
              res.status(200).send({taxes: filtered})
          
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
    getTaxes,
    createTaxes,
    getTaxesCustom
}