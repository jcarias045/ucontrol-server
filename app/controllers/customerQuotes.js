const moment=require("moment");
const CustomerQuote = require("../models/customerquotes.model");


function getCustomerQuote(req, res){
    const { id,company } = req.params;
    console.log("customerquotes");
    CustomerQuote.find({User:id})
    .then(order => {
        if(!order){
            res.status(404).send({message:"No hay "});
        }else{
            
            res.status(200).send({order})
        }
    });
}

module.exports={
    getCustomerQuote
}