const mongoose = require('mongoose');

const collegeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        minlength: 3,

    },
    description : {
        type: String,
        required: [true, 'Description is required'],

    },

    
    university : {
        type : String,
        required : [true, 'University is required'],
        minlength: 1,

    },
    address : {
        type : String,
        required : [true, 'City is required'],
        minlength: 1,
    }, 
    mainCity : {
        type : String,
        required : [true, 'Main City is required'],
        minlength: 1,
    },
    mainCityDistance : {
        type : Number,
        required : [true, 'Main City Distance is required'],
    },
    news : [],
    images : [],
    video : String,

    courseIds : [{type : mongoose.Schema.ObjectId, ref : 'Course'}],
    supportIds : [{type : mongoose.Schema.ObjectId, ref : 'Support'}],

});

module.exports = mongoose.model('College', collegeSchema);