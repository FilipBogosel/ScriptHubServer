import express from 'express'
import passport from 'passport';
import GitHubStrategy from 'passport-github2';
import dotenv from 'dotenv';
import User from '../models/User.js';
import GoogleStrategy from 'passport-google-oauth20'

dotenv.config();


const router = express.Router();

export const ensureAuthenticated = (req, res, next) => {
    if(req.isAuthenticated())
    {
        return next();
    }
    res.status(401).json({message:'You must be logged in to perform this action!'});
}
const verify = (providerName)=>{
    return async (accessToken, refreshToken, profile, done) => {
        try {
            const user = await User.findOne({ provider: providerName, providerId: profile.id });
            if (user) {
                return done(null, user);
            }
            else {
                //If there is a new user, we create it in the database
                let email;
                if (profile.emails && profile.emails.length > 0) {
                    // Try to get from emails array first
                    email = profile.emails[0].value;
                } else if (profile._json && profile._json.email) {
                    // Try _json.email second
                    email = profile._json.email;
                } else {
                    // Generate placeholder email as last resort
                    email = `${profile.username || profile.id}@${providerName}.user`;
                }
                const newUser = new User({
                    provider: providerName,
                    providerId: profile.id,
                    username: providerName === 'github' ? profile.username : profile.displayName,
                    email: email,
                });
                const savedUser = await newUser.save();
                return done(null, savedUser);
            }
        }
        catch (error) {
            console.error('Error verifying GitHub account!', error.message);
            return done(error, null);
        }
    }
}

const gitHubStrategy = new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: `${process.env.BASE_URL}/api/auth/github/callback`,
}, verify('github'));

const googleStrategy = new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BASE_URL}/api/auth/google/callback`
}, verify('google'));

// Register the GitHub and Google strategy with Passport.js
passport.use(gitHubStrategy);
passport.use(googleStrategy);

// Route to initiate GitHub authentication
router.get('/github', (req, res, next) => {
    if (req.isAuthenticated()) {
        return res.json({
            message: 'Already authentificated!',
            user: req.user
        })
    }
    const githubMiddleware = passport.authenticate('github', { scope: ['user:email'] });
    githubMiddleware(req, res, next);
});

// Route to handle logout
router.get('/logout',ensureAuthenticated, (req, res) => {
    req.logout((error) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error logging out!' });
        }

        req.session.destroy((err) => {
            if (err) {
                console.error(err);
            }
            res.json({ message: 'Logged out successfully!' });
        });
    });
});

// Route to check authentication status
router.get('/status', (req, res) => {
    try {
        if (req.isAuthenticated() && req.user) {
            res.json({
                authenticated: true,
                user: {
                    id:req.user.providerId,
                    provider:req.user.provider,
                    username: req.user.username,
                    email: req.user.email,
                    _id:req.user._id
                }
            });
        } else {
            res.json({ authenticated: false });
        }
    } catch (error) {
        console.error('Error in status route:', error);
        res.status(500).json({
            authenticated: false,
            error: 'Internal server error'
        });
    }
});
// Callback route that GitHub will redirect to after authentication
// GitHub callback
router.get('/github/callback', passport.authenticate('github', {
    failureRedirect: '/login',
    scope: ['user:email']
}), (req, res) => {
    console.log('GitHub authentication successful!');
    // Send a proper HTML response that will work with Electron
    res.send(`
        <html>
            <body>
                <p>Github authentication successful! You can close this window.</p>
            </body>
        </html>
    `);
});


//Google Auth routes

router.get('/google', passport.authenticate('google', {scope:['profile', 'email']}));


router.get('/google/callback', passport.authenticate('google', { scope: ['profile', 'email'] }), (req, res) => {
    console.log("Authentication with Google successful!");
    res.send(`
        <html>
            <body>
                <p>Google authentication successful! You can close this window.</p>
            </body>
        </html>
    `); 
});


export default router;
