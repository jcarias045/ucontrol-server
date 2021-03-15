const moongose = require('mongoose');
import Company from './company.model';

const SupplierTypeSchema = moongose.Schema({
  Name: String,
  Description: String,
  Company: Company 
})

const SupplierType = moongose.model('SupplierType', SupplierTypeSchema)

export default SupplierType
