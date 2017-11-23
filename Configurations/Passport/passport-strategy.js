'use strict';

let JWTStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;

let db = require('../../Application/Modals'),
    config = require('../Main');

// Hooks the JWT Strategy.
function hookJWTStrategy(passport) {
    let options = {};
    options.secretOrKey = config.keys.secret;
    options.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('jwt');
    options.ignoreExpiration = false;
    
    passport.use(new JWTStrategy(options, function (JWTPayload, callback) {
        db.UserType.findOne(
            {
                attributes: ['id', 'userid', 'role', 'type'],
                where: {userid: JWTPayload.username}
            })
            .then(function (user) {
                if (!user) {
                    callback(null, false);
                    return;
                }
                callback(null, user);
            });
    }));
}

module.exports = hookJWTStrategy;