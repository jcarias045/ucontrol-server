const db = require('../config/db.config.js');;

const PaymentMethods = db.PaymentMethods;



function getPaymentMethods(req, res){
    // Buscamos informacion para llenar el modelo de 
   
    try{
        PaymentMethods.findAll()
        .then(metodos => {
            res.status(200).send({metodos});
          
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
    getPaymentMethods
}