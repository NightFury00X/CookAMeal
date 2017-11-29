let passport = require('passport');
let db = require('../../Application/Modals');
let config = require('../Main');
let JwtStrategy = require('passport-jwt').Strategy;
let ExtractJwt = require('passport-jwt').ExtractJwt;
let LocalStrategy = require('passport-local').Strategy;

let localOptions = {
    usernameField: 'username'
};

let localLogin = new LocalStrategy(localOptions, async (username, password, done) => {
    try {
        // Find user specified in email
        let user = await db.User.findOne({
            where: {email: username}
        });
        
        // If user doesn't exists, handle it
        if (!user)
            return done({error: 'Login failed. Please try again.'}, false);
        
        // Compare password
        let isMatch = await user.comparePasswords(password);
        
        // If  not matched
        if (!isMatch)
            return done({error: 'Login failed. Please try again.'}, false);
        
        // Success return user
        done(null, user);
    } catch (error) {
        done(error, false);
    }
});

let jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('jwt'),
    secretOrKey: config.keys.secret
};

let jwtLogin = new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
        // Find user specified in token
        let user = await db.UserType.findById(payload.id);
        
        // If user doesn't exists, handle it
        if (!user)
            return done(null, false);
        
        // Otherwise, return the user);
        done(null, user);
    } catch (error) {
        done(null, false);
    }
});

passport.use(jwtLogin);
passport.use(localLogin);