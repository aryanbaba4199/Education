require('dotenv').config();

const mongoose = require('mongoose');
const db_Uri = process.env.MONGODB_URI;
const connectDb = async()=>{
    try{
       await mongoose.connect(db_Uri);
       console.log('Connected to Database');
    }catch(e){
        console.error('Failed to connect to database', e);
        process.exit(1);
    }
}

module.exports = connectDb;