const moongose = require('mongoose');
const Schema = moongose.Schema
const Personal = require('../models/personal.model')
const User = require('../models/user.model')
const NotePersonalSchema = Schema({
    Subject: String,
    Text: String,
    CreationDate: String,
    date: String,
    User: {type: Schema.ObjectId, ref: "User", },
    Personal: {type: Schema.ObjectId, ref: "Personal", },
  })
module.exports = moongose.model('NotePersonal', NotePersonalSchema)