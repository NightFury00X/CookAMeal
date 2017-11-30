'use strict';

let jwt = require('jsonwebtoken'),
    config = require('../../Configurations/Main');

module.exports = {
    generateToken: (user, type) => {
        user.is_normal = type;
        console.log('user: ', user);
        return 'JWT ' + jwt.sign(
            user,            
            config.keys.secret,
            {expiresIn: '50y'}
        )
    },
    generateTokenForResetPassword: (user, type) => {
        user.is_normal = type;
        return 'JWT ' + jwt.sign(
            user,
            config.keys.secret,
            {expiresIn: '1h'}
        )
    }
};