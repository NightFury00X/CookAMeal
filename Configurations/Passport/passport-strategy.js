let passport = require('passport'),
    JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt,
    LocalStrategy = require('passport-local').Strategy;

let db = require('../../Application/Modals'),
    config = require('../Main'),
    CommonConfig = require("../Helpers/common-config");

let localOptions = {
    usernameField: 'username'
};

let localLogin = new LocalStrategy(localOptions, async (username, password, done) => {
    try {
        // Find user specified in email
        let normalUserLogin = await db.User.findOne({
            where: {
                email: username
            }
        });
        if (normalUserLogin) {
            // Compare password
            let isMatch = await normalUserLogin.comparePasswords(password);
            if (isMatch) return done(null, normalUserLogin);
        }

        // Check user is exist for reset password
        let resetPasswordUserLogin = await db.ResetPassword.findOne({
            where: {
                email: username,
                is_valid: true,
                status: true
            }
        });

        if (resetPasswordUserLogin) {
            // Compare password
            let isMatch = await resetPasswordUserLogin.comparePasswords(password);

            if (isMatch)
                return done(null, resetPasswordUserLogin);
        } else {
            // Check token is expired
            let temp = await db.ResetPassword.findOne({
                where: {
                    email: username,
                    random_key: password
                }
            });
            if (temp)
                return done({
                    message: CommonConfig.ERRORS.TOKEN_EXPIRED,
                    status: CommonConfig.STATUS_CODE.OK
                }, false);
        }
        done({
            message: CommonConfig.ERRORS.LOGIN_FAILED,
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
        // Find user specified in token
        let user = await db.UserType.findById(payload.id);

        if (payload.is_normal && !payload.unique_key) {
            // If user doesn't exists, handle it
            if (!user)
                return done({
                    message: CommonConfig.ERRORS.ACCESS_DENIED,
                    status: CommonConfig.STATUS_CODE.FORBIDDEN
                }, false);

            // Otherwise, return the user);
            done(null, user);
        } else {
            // Find user specified in token
            let userForResetPassword = await db.ResetPassword.findOne({
                where: {
                    unique_key: payload.unique_key,
                    is_valid: true,
                    status: true
                }
            });

            // If user doesn't exists, handle it
            if (!userForResetPassword)
                return done({
                    message: CommonConfig.ERRORS.ACCESS_DENIED,
                    status: CommonConfig.STATUS_CODE.FORBIDDEN
                }, false);

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