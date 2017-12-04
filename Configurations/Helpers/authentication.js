'use strict';

let jwt = require('jsonwebtoken'),
    config = require('../../Configurations/Main');

module.exports = {
    generateToken: async (user, uniqueKey, type) => {
        user.is_normal = type;
        user.unique_key = uniqueKey;
        return await 'JWT ' + jwt.sign(
            user,
            config.keys.secret,
            {expiresIn: '50y'}
        )
    },
    generateTokenForResetPassword: async (user, uniqueKey, type) => {
        user.is_normal = type;
        user.unique_key = uniqueKey;
        return await 'JWT ' + jwt.sign(
            user,
            config.keys.secret,
            {expiresIn: '1h'}
        )
    }
};