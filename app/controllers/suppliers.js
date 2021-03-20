const supplier = require('../models/supplier.model')
const bcrypt=require("bcrypt-nodejs");
const jwt=require('../services/jwt');

function createSupplier(req, res){

    const Supplier = new supplier();

    const {Name, Web, Email, Phone, Address, DebsToPay, Active,
    codsupplier, PaymentTime, Company, deliveryDays, SupplierType} = req.body

    Supplier.Name= Name
    Supplier.Web= Web;
    Supplier.Email= Email;
    Supplier.Phone=Phone;
    Supplier.Address=Address;
    Supplier.DebsToPay=DebsToPay;
    Supplier.Active=Active;
    Supplier.codsupplier=codsupplier;
    Supplier.PaymentTime=PaymentTime;
    Supplier.Company=Company;
    Supplier.deliveryDays=deliveryDays;
    Supplier.SupplierType= SupplierType


    console.log(Supplier);
    Supplier.save((err, SupplierStored)=>{
        if(err){
            res.status(500).send({message: err});
        }else{
            if(!SupplierStored){
                res.status(500).send({message: "Error"});
            }else{
                res.status(200).send({Supplier: SupplierStored})
            }
        }
    });
    
}


function getSuppliers(req, res){
    const {id} = req.params;
    console.log(req.params.id);
    console.log(id);
    supplier.find({Company:id}).populate({path: 'Company', model: 'Company'}).
    populate({path: 'SupplierType', model: 'SupplierType'})
    .then(supplier => {
        if(!supplier){
            res.status(404).send({message:"No hay "});
        }else{
            res.status(200).send({supplier})
        }
    });
}

 function updateSupplier(req, res){
    let supplierData = req.body;
    const params = req.params;

    supplier.findByIdAndUpdate({_id: params.id}, supplierData, (err, supplierUpdate)=>{
        if(err){
            res.status(500).send({message: "Error del Servidor."});
        } else {
            if(!supplierUpdate){
                res.status(404).send({message: "No hay"});
            }else{
                res.status(200).send({message: "Trabajo Actualizado"})
            }
        }
    })
}


function deleteSupplier(req, res){
    const { id } = req.params;
  
    supplier.findByIdAndRemove(id, (err, supplierDeleted) => {
      if (err) {
        res.status(500).send({ message: "Error del servidor." });
      } else {
        if (!supplierDeleted) {
          res.status(404).send({ message: "Proveedor no encontrado." });
        } else {
          res
            .status(200)
            .send({ message: "El Proveedor ha sido eliminado correctamente." });
        }
      }
    });
}

async function desactivateSupplier(req, res){
    let supplierId = req.params.id; 
  
    const {Active} = req.body;  //
    try{
        
        await supplier.findByIdAndUpdate(supplierId, {Active}, (supplierStored) => {
            if (!supplierStored) {
                res.status(404).send({ message: "No se ha encontrado el proveedor." });
            }
            else if (Active === false) {
                res.status(200).send({ message: "Proveedor desactivado correctamente." });
            }
        })
        
    } catch(error){
        res.status(500).json({
            message: "Error -> No se puede actualizar el usuario con ID = " + req.params.id,
            error: error.message
        });
    }
}

function getSuppliersInfo(req, res){
    const {id} = req.params;
    console.log(id);
    try{
        supplier.findById({_id: id}).populate({path: 'Company', model: 'Company'})
        .populate({path: 'SupplierType', model: 'SupplierType'})
        .then(suppliers => {
            res.status(200).send({suppliers});          
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

function getSuppliersDetails(req, res){
 
    let supplierId = req.params.id;
    let companyId = req.params.company;
    console.log(companyId);
    try{
        supplier.find({Company: companyId,_id:supplierId})
        .then(suppliers => {
            res.status(200).send(suppliers);
          
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

function Suppliers(req, res){
 
    try{
        Supplier.findAll({
            include:[{
                model:Company,
                attributes: ['ID_Company','Name','ShortName']
            },
           ],
            attributes:['ID_supplier','Name','Web','Email',
        'Adress', 'Active','codsupplier','PaymentTime','ID_Company',
        'deliveryDays']
        })
        .then(suppliers => {
            res.status(200).send({suppliers});
          
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

function getSuppliersAll(req, res){
    const {id} = req.params;
    console.log(req.params.id);
    console.log(id);
    supplier.find({Company:id}).populate({path: 'Company', model: 'Company'}).
    populate({path: 'SupplierType', model: 'SupplierType'})
    .then(supplier => {
        if(!supplier){
            res.status(404).send({message:"No hay "});
        }else{
            res.status(200).send({supplier})
        }
    });
}
// function getImages(req,res){
//     const logoName=req.params.logoName;
//     const filePath="./app/uploads/avatar/"+logoName;
//     console.log(filePath);
//     fs.exists(filePath,exists=>{
//         if(!exists){
//             res.status(404)
//             .send({message:"el avatar que buscas no existe"});
//         }
//         else{
//             res.sendFile(path.resolve(filePath));
//         }
       
//     });
// }

// function uploadImages(req, res) {
//     const params= req.params;
//     const id=params.id;
//     console.log(req.files);
//     Product.findByPk(id).then((productData)=>{        
//           if(!productData){
//             res.status(404)
//             .send({message:"no se encontro usuario"});
//           }
//           else{
//             let product =productData;
//             console.log(productData);
//             if(req.files){
//                 let filePath=req.files.avatar.path;
                
//                 let fileSplit=filePath.split("\\");
//                 let fileName=fileSplit[3];
//                 let extSplit=fileName.split(".");
//                 let fileExt=extSplit[1];
//                 console.log(fileName);
//                 if(fileExt !== "png" && fileExt!=="jpg"){
//                     res.status(400)
//                     .send({message: "la extesion no es valida"});
//                 }    
//             else{          
//                 console.log();
//                 let updatedObject = {                   
//                     Logo: fileName,
//                   }
//                 let result =  Product.update(updatedObject,
//                     { 
//                       returning: true,                
//                       where: {ID_Products: id},
//                       attributes: [ 'Logo']
//                     }
//                   );
//                   if(!result) {
//                     res.status(500).json({
//                         message: "Error -> No se puede actualizar el cliente con ID = " + req.params.id,
//                         error: "No se puede actualizar",
//                     });
//                 }
    
//                 res.status(200).json(result);
//             }
            
//         }
//         else{
//             console.log("no reconoce ");
//         }
//           }
//        });
    
// }

function getSupplierInfo(req, res){
    console.log("gola");
    supplier.findByPk(req.params.id,{
        attributes:['Name','Web','Email',
        'Adress', 'Active','codsupplier','PaymentTime','ID_Company',
        'deliveryDays','Phone','DebsToPay']})
        .then(supplier => {
          res.status(200).json(supplier);
        }).catch(error => {
        // imprimimos a consola
          console.log(error);

          res.status(500).json({
              message: "Error!",
              error: error
          });
        })
}


module.exports={
    createSupplier,
    getSuppliers,
    updateSupplier,
    deleteSupplier,
    desactivateSupplier,
    getSuppliersInfo,
    getSuppliersDetails,
    Suppliers,
    getSuppliersAll
    // getSupplierInfo
}
