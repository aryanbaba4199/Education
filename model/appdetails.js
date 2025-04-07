const mongoose = require('mongoose');

const appDetailsSchema = new mongoose.Schema({
   
    mobile : {
        type : String,
        required: true,
    }, 
    whatsapp : {
        type : String,
        
    },
    email : {
        type : String,
    }, 
    contactTitle : {
        type : String,
    }, 
    
    

});

module.exports = mongoose.model('AppDetails', appDetailsSchema);