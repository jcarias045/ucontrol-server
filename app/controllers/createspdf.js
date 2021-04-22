const product = require('../models/product.model');
const fs =require("fs");
const PDFDocument = require('pdfkit') 

function ExportProductList(req, res){
    
    const productos = product.find({Company: req.params.id}).populate({path: 'Company', model: 'Company'}).
    populate({path: 'Supplier', model: 'Supplier'}).
    populate({path: 'Brand', model: 'Brand'}).
    populate({path: 'CatProduct', model: 'CatProduct'}).
    populate({path: 'Measure', model: 'Measure'})
    .then(product => {
        if(!product){
            res.status(404).send({message:"No hay "});
        }else{
            res.status(200).send({product})
        }
    });

    console.log(productos);

    const listproducts= productos.product;
    console.log(listproducts);
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream('ListaProductos'));
    doc.pipe(res);


    listproducts.map(producto=>{
        let ypos = doc.y;
        doc
        .fontSize(10)
        .text('Codigo Producto: ' +producto.codproducts)
        .text('Nombre Producto: '+producto.Name)
        .text('Marca: '+ producto.Brand.Name)
    })


    doc.end();

}