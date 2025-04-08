const mongoose = require('mongoose');

const feeTagSchema = new mongoose.Schema({
    title : {
        type : String, 
        require : true,
    }
})

module.exports = mongoose.model('FeeTags', feeTagSchema);