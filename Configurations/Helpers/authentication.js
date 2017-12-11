'use strict';

let jwt = require('jsonwebtoken'),
    config = require('../../Configurations/Main');

module.exports = {
    generateToken: (user, uniqueKey, type) => {
        user.is_normal = type;
        user.unique_key = uniqueKey;
    
        console.log('=================================');
        console.log('Token Data: ', user);
        return 'JWT ' + jwt.sign(
            user,
            config.keys.secret,
            {expiresIn: '50y'}
        )
    },
    generateTokenForResetPassword: (user, uniqueKey, type) => {
        user.is_normal = type;
        user.unique_key = uniqueKey;
        return 'JWT ' + jwt.sign(
            user,
            config.keys.secret,
            {expiresIn: '1h'}
        )
    }
};