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
import helmet from 'helmet';
import cors from 'cors'
import MongoStore from 'connect-mongo';
import rateLimit from 'express-rate-limit';



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

//security middleware
app.use(helmet());

const whitelist = ['http://localhost:5173', 'app://.'];

const isProduction = process.env.NODE_ENV === 'production';

const corsOptions = {
    // The origin option can be a function. This function checks if the
    // origin of the incoming request is in our whitelist.
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1 || !origin) {
            // If the origin is in our whitelist, allow it.
            // '!origin' allows requests from tools like Postman that don't have an origin.
            callback(null, true);
        } else {
            // If the origin is not in the whitelist, block it.
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // This is essential for sending cookies.
};

// Use the new, more flexible CORS options
app.use(cors(corsOptions));

// Apply a rate limiter to all requests
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use(limiter);

//middleware for handling sessions, required for passport.js to manage user authentication state across different requests.
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store:MongoStore.create({
        mongoUrl:process.env.MONGO_URI,
        collectionName:'sessions'
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,
        secure: isProduction,//make the cookie only work in https in production for security
        httpOnly: true,
        sameSite: isProduction ? 'none' : 'lax'
    }//24 hours
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
    done(null, `${user.provider}:${user.providerId}`);
});

passport.deserializeUser(async (serializedId, done) => {
    try {
        const [provider, providerId] = serializedId.split(':');
        const user = await User.findOne({ provider, providerId });
        done(null, user);
    }
    catch (error) {
        done(error, null);
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
