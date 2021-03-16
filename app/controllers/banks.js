
const bcrypt=require("bcrypt-nodejs");
const jwt=require('../services/jwt');


function getBanks(req, res) {
    
}

function createBank(req, res){
  
}


async function updateBank(req, res){
   
    let bankId = req.params.id; 
    console.log(bankId);
    const { Name, Phone, Address} = req.body;  //
    console.log(Name);
    console.log(Phone);
    try{
        let bank = await Bank.findByPk(bankId);
        console.log(bank);
        if(!bank){
           // retornamos el resultado al descuento
            res.status(404).json({
                message: "No se encuentra el banco con ID = " + bankId,
                error: "404"
            });
        } else {    
            // actualizamos nuevo cambio en la base de datos, definición de
            let updatedObject = {             
                Name: Name,
                Phone: Phone,
                Address:Address    
            }
            console.log(updatedObject);    //agregar proceso de encriptacion
            let result = await bank.update(updatedObject,
                              { 
                                returning: true,                
                                where: {ID_Bank: bankId}
                              }
                            );

            // retornamos el resultado al descuento
            if(!result) {
                res.status(500).json({
                    message: "Error -> No se puede actualizar el descuento con ID = " + req.params.id,
                    error: "No se puede actualizar",
                });
            }
            res.status(200).json(result);
        }
    } catch(error){
        res.status(500).json({
            message: "Error -> No se puede actualizar el descuento con ID = " + req.params.id,
            error: error.message
        });
    }
}

async function deleteBank(req, res){
    console.log(req.params.id);
    try{
        let bankId = req.params.id;
        let bank = await Bank.findByPk(bankId);
       
        if(!bank){
            res.status(404).json({
                message: "El banco con este ID no existe = " + bankId,
                error: "404",
            });
        } else {
            await bank.destroy();
            res.status(200).send({
                message:"El Banco fue eliminad con exito"
            });
        }
    } catch(errr) {
        res.status(500).json({
            mesage: "Error -> No se puede eliminar el banco con el ID = " + req.params.id,
            error: error.message
        });
    }
}

function getBankId (req, res){
    
    let companyId = req.params.id;

    try{
        Bank.findAll({
            where:{ID_Company: companyId},
            attributes: ['ID_Bank', 'Name']
        })
        .then(banks =>{
            res.status(200).json({banks});
            
        })
    }catch(error){
        console.log(error);
        res.status(500).json({
            message: "Error en el query!",
            error: error
        })
    }
}


module.exports={
    getBanks,
    createBank,
    updateBank,
    deleteBank,
    getBankId

}
