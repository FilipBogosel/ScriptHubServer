import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
//const scriptRoutes = require('./routes/script');
import scriptRoutes from './routes/script.js';

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

// Middleware setup BEFORE routes
app.use(express.json());
app.use('/api/scripts', scriptRoutes);

app.get('/', (req, res) => {
    res.send("The server is running and has attempted to connect to the database!");
});

app.listen(PORT, () => {
    console.log(`Listening for HTTP requests on http://localhost:${PORT}`);
});
