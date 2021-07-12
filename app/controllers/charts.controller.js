//este controlador tendra todas las peticiones para mostrar datos en las graficas
//de la pantalla inicial
//importando el modelo bankaccounts
const BankAccount = require('../models/bankaccount.model')
//importando modelo de proveedores
const supplier = require("../models/supplier.model");
//importando modelo categorias de productos
const catproduct = require('../models/catpoduct.model');
//importando modelo de inventario
const Inventory = require("../models/inventory.model");

//funcion para tomar las cuentas de banco y mandar la informacion 
//a la grafica en el front
function bankAccounts() {

}

//funcion que toma los proveedores para tomar las cuentas por pagar
function CxP(req, res) {
    const companyId = req.params.companyId;

    //realizando busqueda en los proveedores
    supplier.find({ Company: companyId }).then(suppliers => {
        if (!suppliers) {
            res.status(404).send({ message: "No hay " });
        } else {
            res.status(200).send({ suppliers })
        }
    })
}

//funcion que toma las categorias y los productos que esta contiene
function productsByCategory(req, res) {
    const companyId = req.params.companyId;

    // catproduct.find({ Company: companyId }).populate({ path: "Product", model: "Product" })
    //     .then(categori => {
    //         if (!categori) {
    //             res.status(404).send({ message: "No hay" })
    //         } else {
    //             res.status(200).send({ categori })
    //         }
    //     })
    Inventory.find({ Company: companyId }).populate({ path: 'Bodega', model: 'Bodega', match: { Company: companyId } })
        .populate({
            path: 'Product', model: 'Product',
            populate: { path: 'CatProduct', model: 'CatProduct' },
        })
        .then(inventory => {
            if (!inventory) {
                res.status(404).send({ message: "No hay " });
            } else {
                //filtrando que vayan diferente de cero
                var productos = inventory.filter(function (item) {
                    return item.Stock != 0;
                })
                res.status(200).send({ productos })
            }
        });
}

module.exports = {
    CxP,
    productsByCategory
}
