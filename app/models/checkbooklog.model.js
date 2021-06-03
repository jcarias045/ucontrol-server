const moongose = require('mongoose');
const Schema = moongose.Schema
const User = require('./user.model');
const Checkbook = require('./checkbook.model');
const DocumentCorrelative = require('./documentcorrelatives.model');

const CheckbookLogChangeSchema = Schema({
 
     User: { type: Schema.ObjectId, 
             ref: "User",
            // autopopulate: true,
           },
    Checkbook: { type: Schema.ObjectId, 
    ref: "Checkbook",
    // autopopulate: true,
    },
    DateUpdate:String,
    Action:String
})

module.exports = moongose.model('CheckbookLogChange', CheckbookLogChangeSchema)