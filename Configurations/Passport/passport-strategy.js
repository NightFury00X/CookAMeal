let passport = require('passport');
let db = require('../../Application/Modals');
let config = require('../Main');
let JwtStrategy = require('passport-jwt').Strategy;
let ExtractJwt = require('passport-jwt').ExtractJwt;
let LocalStrategy = require('passport-local').Strategy;
let CommonService = require('../../Application/Controllers-Services/Services/common.service');
const CommonConfig = require("../Helpers/common-config");

let localOptions = {
    usernameField: 'username'
};

let localLogin = new LocalStrategy(localOptions, async (username, password, done) => {
    try {
        console.log('======================');
        // Find user specified in email
        let normalUserLogin = await db.User.findOne({
            where: {
                email: username
            }
        });
        if (normalUserLogin) {
            // Compare password
            console.log('normalUserLogin: ', normalUserLogin);
            let isMatch = await normalUserLogin.comparePasswords(password);
            if (isMatch) return done(null, normalUserLogin);
        }
        
        // Check user is exist for reset password
        let resetPasswordUserLogin = await db.ResetPassword.findOne({
            where: {
                email: username
            }
        });
        
        if (resetPasswordUserLogin) {
            // Compare password
            let isMatch = await resetPasswordUserLogin.comparePasswords(password);
            if (isMatch) return done(null, resetPasswordUserLogin);
        }
        done({
            message: 'Login failed. Please try again.',
            status: CommonConfig.STATUS_CODE.OK
        }, false);
    } catch (error) {
        done({
            message: error,
            status: CommonConfig.STATUS_CODE.INTERNAL_SERVER_ERROR
        }, false);
    }
});

let jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('jwt'),
    secretOrKey: config.keys.secret
};

let jwtLogin = new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
        console.log('======================');
        console.log(payload);
        // Find user specified in token
        let user = await db.UserType.findById(payload.id);
        
        if (payload.is_normal && !payload.unique_key) {
            console.log('======================');
            // If user doesn't exists, handle it
            if (!user)
                return done({
                    message: 'Access Denied/Forbidden',
                    status: CommonConfig.STATUS_CODE.FORBIDDEN
                }, false);
            
            // Otherwise, return the user);
            done(null, user);
        } else {
            console.log('**********************');
            // Find user specified in token
            let userForResetPassword = await db.ResetPassword.findOne({
                where: {
                    unique_key: payload.unique_key,
                    is_valid: true,
                    status: true
                }
            });
            console.log('**********************', userForResetPassword);
            // If user doesn't exists, handle it
            if (!userForResetPassword)
                return done({
                    message: 'Access Denied/Forbidden',
                    status: CommonConfig.STATUS_CODE.FORBIDDEN
                }, false);
            console.log('**********************');
            // Otherwise, return the user);
            user.user_role = payload.user_role;
            done(null, user);
        }
    } catch (error) {
        done({
            message: error,
            status: CommonConfig.STATUS_CODE.INTERNAL_SERVER_ERROR
        }, false);
    }
});

passport.use(jwtLogin);
passport.use(localLogin);