const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title : {
        type : String, 
        required : [true, 'Title is required'],
        minlength: 1,
    
    }, 
    fee : Number, 
    Eligibility : String, 
    faculty : [],
    collegeIds : [],
});

module.exports = mongoose.model('Course', courseSchema);