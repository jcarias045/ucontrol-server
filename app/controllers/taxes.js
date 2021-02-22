const db = require('../config/db.config.js');;

const Taxes=db.Taxes;



function getTaxes(req, res){
    // Buscamos informacion para llenar el modelo de 
    let doc=req.params.doc;
    try{
        Taxes.findAll({
            where: {
                document: doc
            }
        })
        .then(taxes => {
            res.status(200).send({taxes});
          
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
    getTaxes
}