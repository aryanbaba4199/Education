const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        minlength: 3,
        maxlength: 50
    },
   
    mobile : {
        type: String,
        required: [true, 'Mobile number is required'],
        unique: true,
       
    },
    password: {
        type: String,

        minlength: 6,
      
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    adminId : {
        type : String,
    },
    isActive: {
        type: Boolean,
        default: true
    },
});

module.exports = mongoose.model('User', userSchema);