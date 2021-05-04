const moongose = require('mongoose');
const Schema = moongose.Schema
const User = require('./user.model');
const DocumentType = require('./documenttype.model');
const DocumentCorrelative = require('./documentcorrelatives.model');

const LogCorrelativesChangeSchema = Schema({
 
     User: { type: Schema.ObjectId, 
             ref: "User",
            // autopopulate: true,
           },
    DocumentType: { type: Schema.ObjectId, 
    ref: "DocumentType",
    // autopopulate: true,
    },
    DocumentCorrelative: { type: Schema.ObjectId, 
        ref: "DocumentCorrelative",
        // autopopulate: true,
        },
    DateUpdate:String,
    Action:String
})

module.exports = moongose.model('LogCorrelativesChange', LogCorrelativesChangeSchema)