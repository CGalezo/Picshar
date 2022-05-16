// A Schema example, delete this file when first issue resolved 

const mongoose = require('mongoose')

const template = new mongoose.Schema({
    fullname:{
        type: String,
        required: true
    },
    username:{
        type: String,
        required:true
    },
    date:{ // Add date to all the schemas to sort!!
        type:Date,
        default: Date.now
    }
},
{collection: 'example'}
)

module.exports = mongoose.model('template', template)