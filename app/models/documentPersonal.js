const moongose = require('mongoose');
const Schema = moongose.Schema
const Personal = require('./personal.model')
const User = require('./user.model')

const DocumentPersonalSchema = Schema({
    title: String,
    description: String,
    Url: String,
    Personal: { type: Schema.ObjectId, 
               ref: "Personal",
              // autopopulate: true,
             },
    User: { type: Schema.ObjectId,
            ref: "User"
          }
  })
  
  module.exports = moongose.model('DocumentPersonal', DocumentPersonalSchema)