const mongoose = require('mongoose');

const slideSchema = new mongoose.Schema({
    title : {
        type : String,
        required : [true, 'Title is required'],
        minlength: 1,
    }, 
    rank : Number,
    image : String,
});

module.exports = mongoose.model('Slide', slideSchema);