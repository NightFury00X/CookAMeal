'use strict';

let jwt = require('jsonwebtoken'),
    config = require('../../Configurations/Main');

module.exports = {
    generateToken: (user) => {
        return 'JWT ' + jwt.sign(
            user,
            config.keys.secret,
            {expiresIn: '50y'}
        )
    },
    generateTokenForResetPassword: (user) => {
        return 'JWT ' + jwt.sign(
            user,
            config.keys.secret,
            {expiresIn: '1h'}
        )
    }
};