'use strict';

let jwt = require('jsonwebtoken'),
    config = require('../../Configurations/Main/config');

function generateToken(user) {
    return jwt.sign(
        user,
        config.keys.secret,
        {expiresIn: '30m'}
    )
}

function setUserInfo(request) {
    return {
        id: request.id,
        username: request.email,
        role: request.role
    }
}

module.exports = generateToken;