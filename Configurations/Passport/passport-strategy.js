'use strict';

let JWTStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;

let db = require('../../Application/Modals'),
    config = require('../Main/config');

// Hooks the JWT Strategy.
function hookJWTStrategy(passport) {
    let options = {};
    options.secretOrKey = config.keys.secret;
    options.jwtFromRequest = ExtractJwt.fromAuthHeader();
    options.ignoreExpiration = false;

    passport.use(new JWTStrategy(options, function (JWTPayload, callback) {
        db.UserModel.findOne({where: {username: JWTPayload.username}, raw: true})
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