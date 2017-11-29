'use strict';

let jwt = require('jsonwebtoken'),
    config = require('../../Configurations/Main');

function generateToken(user) {
    return 'JWT ' + jwt.sign(
        user,
        config.keys.secret,
        {expiresIn: '50y'}
    )
}

function generateTokenForResetPassword(user) {
    return 'JWT ' + jwt.sign(
        user,
        config.keys.secret,
        {expiresIn: '1d'}
    )
}

module.exports = generateToken;