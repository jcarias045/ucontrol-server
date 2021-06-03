const moongose = require('mongoose');
const Schema = moongose.Schema
const Bank = require('./bank.model');
const User = require('./user.model');
const Checkbook = require('./checkbook.model');

const WriteCheckSchema = Schema({
    Checkbook:{
        type: Schema.ObjectId,
        ref: "Checkbook"
    },
    Bank:{ type: Schema.ObjectId,ref: "Bank"},
    User:{ type: Schema.ObjectId,ref: "User"},
    CreationDate:Date,
    Receiver:String,
    Amount:Number,
    State:String,
    CheckNumber:String,
    Comment:String
    
})

module.exports = moongose.model('WriteCheck',WriteCheckSchema )