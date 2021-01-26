const db = require('../config/db.config.js');
const Customer = db.Customer;

/* //Crear
exports.createCustomer = (req, res) => {
    let customer = {};

    try{
        // Construimos el modelo del objeto Customer para enviarlo como body del request
        customer.nombre = req.body.nombre;

    
        // Save to MySQL database
        Customer.create(customer, 
                          {attributes: ['id', 'nombre']})
                    .then(result => {    
                      res.status(200).json(result);
                    });
    }catch(error){
        res.status(500).json({
            message: "Fail!",
            error: error.message
        });
    }
}
//Seleccionar unico
exports.getCustomer = (req, res) => {
    Customer.findByPk(req.params.id, 
                        {attributes: ['id', 'nombre']})
        .then(customer => {
          res.status(200).json(customer);
        }).catch(error => {
        // imprimimos a consola
          console.log(error);

          res.status(500).json({
              message: "Error!",
              error: error
          });
        })
} */

//Seleccionar TODOS
exports.customers = (req, res) => {
    // Buscamos informacion para llenar el modelo de Customers
    try{
        Customer.findAll({attributes: ['ID_Customer', 'Name']})
        .then(customers => {
            res.status(200).send({customers});
          
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

/* //Eliminar
exports.deleteCustomer = async (req, res) => {
    try{
        let customerId = req.params.id;
        let customer = await Customer.findByPk(customerId);

        if(!customer){
            res.status(404).json({
                message: "El cliente con este ID no existe = " + customerId,
                error: "404",
            });
        } else {
            await customer.destroy();
            res.status(200);
        }
    } catch(error) {
        res.status(500).json({
            message: "Error -> No se puede eliminar el cliente con el ID = " + req.params.id,
            error: error.message
        });
    }
}

//Actualizar
exports.updateCustomer = async (req, res) => {
    try{
        let customer = await Customer.findByPk(req.body.id);
    
        if(!customer){
           // retornamos el resultado al cliente
            res.status(404).json({
                message: "No se encuentra el cliente con ID = " + customerId,
                error: "404"
            });
        } else {    
            // actualizamos nuevo cambio en la base de datos
            let updatedObject = {
                nombre: req.body.nombre,
              
            }
            let result = await Customer.update(updatedObject,
                              { 
                                returning: true, 
                                where: {id: req.body.id},
                                attributes: ['id', 'nombre']
                              }
                            );

            // retornamos el resultado al cliente
            if(!result) {
                res.status(500).json({
                    message: "Error -> No se puede actualizar el cliente con ID = " + req.params.id,
                    error: "No se puede actualizar",
                });
            }

            res.status(200).json(result);
        }
    } catch(error){
        res.status(500).json({
            message: "Error -> No se puede actualizar el cliente con ID = " + req.params.id,
            error: error.message
        });
    }
} */