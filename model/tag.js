const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
    title : {
        type : String,
        required : true, 
    }, 
    type : {
        type : String,
        
    }
});

module.exports = mongoose.model('Tag', tagSchema);