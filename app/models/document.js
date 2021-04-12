const moongose = require('mongoose');
const Schema = moongose.Schema
const Customer = require('./customer.model')
const User = require('./user.model')

const DocumentSchema = Schema({
    title: String,
    description: String,
    Url: String,
    Customer: { type: Schema.ObjectId, 
               ref: "Customer",
              // autopopulate: true,
             },
    User: { type: Schema.ObjectId,
            ref: "User"
          }
  })
  
  module.exports = moongose.model('Document', DocumentSchema)
  