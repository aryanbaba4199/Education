const express = require('express');
const app = express();
const cors = require('cors');
const connectDb = require('./utils/db');
const errorHandler = require('./utils/errorHandler');
const userRoutes = require('./routes/user');
const collegeRoutes = require('./routes/college');


connectDb();
app.use(cors({ origin: "*" }));

app.use(express.json());

app.use('/college', collegeRoutes)
app.use('/users', userRoutes);



app.use(errorHandler);


app.listen(5000, ()=>{

    console.log('Server is running on port 5000');
});

