const moongose = require('mongoose');
const Schema = moongose.Schema

const PaymentMethodsSchema = Schema({
  Name: String,
  Description: String, 
})

module.exports = moongose.model('PaymentMethods', PaymentMethodsSchema)