import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
//const scriptRoutes = require('./routes/script');
import scriptRoutes from './routes/script.js';


//This function connects to the MongoDB database using Mongoose, specifically the connect function that uses the connection string stored in the MONGO_URI environment variable in the .env file.
async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Success: Connection to MongoDB Atlas has been established.');
    }
    catch (error) {
        console.error("Error connecting tot the database", error.message);
        process.exit(1);
    }
}

connectDB();

// Middleware setup: ensures that incoming requests with JSON payloads are correctly parsrsed make the JSON data available on req.body
//and gives the task of handling requests to the /api/scripts endpoint to the scriptRoutes router.
app.use(express.json());
app.use('/api/scripts', scriptRoutes);

//a simple roue to test if the server is running
app.get('/', (req, res) => {
    res.send("The server is running and has attempted to connect to the database!");
});
// Start the server and listen on the specified port for incoming HTTP requests.
app.listen(PORT, () => {
    console.log(`Listening for HTTP requests on http://localhost:${PORT}`);
});
