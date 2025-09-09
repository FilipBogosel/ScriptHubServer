import express from 'express'
import passport from 'passport';
import GitHubStrategy from 'passport-github2';
import dotenv from 'dotenv';

dotenv.config();


const router = express.Router();
const verify = async (accessToken, refreshToken, profile, done) => {
    try {
        //...
        const mockUser = { providerId: profile.id, username: profile.username };
        return done(null, mockUser);
    }
    catch (error) {
        console.error('Error verifying GitHub account!', error.message);
        done(error, null);
    }
}
const gitHubStrategy = new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: 'http://localhost:5000/api/auth/github/callback',
}, verify);

// Register the GitHub strategy with Passport.js
passport.use(gitHubStrategy);

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
router.get('/logout', (req, res) => {
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
    if(req.isAuthenticated()){
        res.json({authenticated:true, user:req.user});
    }
    else{
        res.json({authenticated:false});
    }
});
// Callback route that GitHub will redirect to after authentication
router.get('/github/callback', passport.authenticate('github', {
    failureRedirect: '/login'
}),
    (req, res) => {
        console.log('GitHub authentication successful!');
        res.send('GitHub authentication successful! You can close this window and return to the app.');
    });


export default router;
