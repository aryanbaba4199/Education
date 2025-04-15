const mongoose = require('mongoose');

const promptSchema = new mongoose.Schema({
    title : String, 
    prompt : String,
})

module.exports = mongoose.model('Prompt', promptSchema)