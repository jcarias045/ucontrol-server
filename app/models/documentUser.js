const moongose = require('mongoose');
const Schema = moongose.Schema
const User = require('./user.model')

const DocumentUserSchema = Schema({
    title: String,
    description: String,
    Url: String,
    User: { type: Schema.ObjectId,
            ref: "User"
          }
  })
  
  module.exports = moongose.model('DocumentUser', DocumentUserSchema)