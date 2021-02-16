const db = require('../config/db.config.js');
const fs =require("fs");
const path=require("path");
const Product = db.Product;

function getProducts(req, res) {
    console.log("Probando");
}

module.exports={
    getProducts
}