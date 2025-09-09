import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
//const scriptRoutes = require('./routes/script');
import scriptRoutes from './routes/script.js';
import authRoutes from './routes/auth.js';
import passport from 'passport';
import session from 'express-session';
import User from './models/User.js';



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
//Auth Setup Start
//middleware for handling sessions, required for passport.js to manage user authentication state across different requests.
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized:false,
    cookie: { maxAge: 3600000 }
    //in a production env we should use a cookie:{ secure:true } option to ensure cookies are only sent over HTTPS
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user,done) => {
    done(null,user.providerId);
});

passport.deserializeUser(async (providerId,done) => {
    try{
        const user = await User.findOne({providerId:providerId});
        done(null,user);
    }
    catch(error){
        done(error,null);
    }
});

//Auth Setup End

// Middleware setup for scripts: ensures that incoming requests with JSON payloads are correctly parsrsed make the JSON data available on req.body
//and gives the task of handling requests to the /api/scripts endpoint to the scriptRoutes router.
app.use(express.json());
app.use('/api/scripts', scriptRoutes);
app.use('/api/auth', authRoutes);
//a simple roue to test if the server is running
app.get('/', (req, res) => {
    res.send("The server is running and has attempted to connect to the database!");
});
// Start the server and listen on the specified port for incoming HTTP requests.
app.listen(PORT, () => {
    console.log(`Listening for HTTP requests on http://localhost:${PORT}`);
});
