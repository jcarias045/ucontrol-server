const db = require('../config/db.config.js');
const fs =require("fs");
const path=require("path");
const Order = db.Order;

function getOrders(req, res) {
    console.log("hola");
    try{
        Order.findAll()
        .then(order => {
            res.status(200).send({order});
         
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
    getOrders
}