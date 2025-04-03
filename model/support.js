const mongoose = require('mongoose');

const supportSchema = new mongoose.Schema({
    name : {
        type : String,
    }, 
    mobile : {
        type : Number, 
        required : [true, 'Mobile number is required'],
        minlength: 10,
        maxlength: 10
    }
})

module.exports = mongoose.model('Support', supportSchema);