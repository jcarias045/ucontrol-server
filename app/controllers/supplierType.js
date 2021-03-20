const supplierType= require('../models/suppliertype.model');

function createSupplierType(req, res){
    const type = new supplierType();

    const {Name, Description, Company} = req.body

    type.Name= Name
    type.Description= Description;
    type.Company=Company;

    console.log(type);
    type.save((err, typeStored)=>{
        if(err){
            res.status(500).send({message: err});
        }else{
            if(!typeStored){
                res.status(500).send({message: "Error"});
            }else{
                res.status(200).send({type: typeStored})
            }
        }
    });
}


module.exports={
    createSupplierType
}