const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const app = express();
const PORT = 5000;

async function connectDB() {
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Success: Connection to MongoDB Atlas has been established.');
    }
    catch(error){
        console.error("Error connecting tot the database",error.message);
        process.exit(1);
    }
}

connectDB();

app.get('/', (req, res) => {
    res.send("The server is running and has attempted to connect to the database!");
});

app.listen(PORT,()=>{
    console.log(`Listening for HTTP requests on http://localhost:${PORT}`);
});
