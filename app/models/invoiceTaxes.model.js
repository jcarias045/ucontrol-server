const moongose = require('mongoose');
const Schema = moongose.Schema
const PurchaseInvoice = require('./purchaseInvoice.model');
const Taxes = require('./taxes.model')

const InvoiceTaxesSchema = Schema({
  PurchaseInvoice: { type: Schema.ObjectId, 
                    ref: "PurchaseInvoice",
                   // autopopulate: true,
                  },
  Taxes: { type: Schema.ObjectId, 
    ref: "Taxes",
    // autopopulate: true,
  },
  Monto: Schema.Types.Decimal128
  
})

module.exports = moongose.model('InvoiceTaxes', InvoiceTaxesSchema)
