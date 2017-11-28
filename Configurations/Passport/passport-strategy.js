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
        let user = await db.User.findOne({
            where: {email: username}
        });

        // If user not exist
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

let jwtLogin = new JwtStrategy(jwtOptions, function (payload, done) {
    console.log('JwtLogin');
});

passport.use(jwtLogin);
passport.use(localLogin);

// https://www.joshmorony.com/creating-role-based-authentication-with-passport-in-ionic-2-part-1/

// 'use strict';
//
// let JWTStrategy = require('passport-jwt').Strategy,
//     ExtractJwt = require('passport-jwt').ExtractJwt;
//
// let db = require('../../Application/Modals'),
//     config = require('../Main');
//
// // Hooks the JWT Strategy.
// function hookJWTStrategy(passport) {
//     let options = {};
//     options.secretOrKey = config.keys.secret;
//     options.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('jwt');
//     options.ignoreExpiration = false;
//     passport.use(new JWTStrategy(options, function (JWTPayload, callback) {
//         db.UserType.findOne(
//             {
//                 attributes: ['id', 'user_id', 'user_role', 'user_type'],
//                 where: {id: JWTPayload.id}
//             })
//             .then(function (user) {
//                 if (!user) {
//                     callback(null, false);
//                     return;
//                 }
//                 callback(null, user);
//             });
//     }));
// }
//
// module.exports = hookJWTStrategy;