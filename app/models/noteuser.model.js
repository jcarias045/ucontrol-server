const moongose = require('mongoose');
const Schema = moongose.Schema
const User = require('../models/user.model')

const NoteUserSchema = Schema({
    Subject: String,
    Text: String,
    CreationDate: Date,
    User: {type: Schema.ObjectId, ref: "User", },
  })
  
  module.exports = moongose.model('NoteUser', NoteUserSchema)