const PaymentMethods= require('../models/paymentMethods.model')



function getPaymentMethods(req, res){
    // Buscamos informacion para llenar el modelo de 
   
    try{
        PaymentMethods.find()
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

function createMethods(req, res){
    const Methods = new PaymentMethods();

    const {Name, Description} = req.body

    Methods.Name= Name
    Methods.Description= Description;
   

    console.log(Methods);
    Methods.save((err, MethodsStored)=>{
        if(err){
            res.status(500).send({message: err});
        }else{
            if(!MethodsStored){
                res.status(500).send({message: "Error"});
            }else{
                res.status(200).send({Methods: MethodsStored})
            }
        }
    });
}


module.exports={
    getPaymentMethods,
    createMethods
}