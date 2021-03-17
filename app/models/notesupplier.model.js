const moongose = require('mongoose');
const Schema = moongose.Schema
const User = require('../models/user.model')
const Supplier = require('../models/supplier.model')

const NoteSupplierSchema = Schema({
    Subject: String,
    Text: String,
    CreationDate: Date,
    User: {type: Schema.ObjectId, ref: "User", },
    Supplier: { type: Schema.ObjectId, ref: "Supplier"}

  })
  
  module.exports = moongose.model('NoteSupplier', NoteSupplierSchema)