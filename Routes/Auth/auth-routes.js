'use strict';

const router = require('express').Router();
const AuthController = require('../../Application/Controllers-Services/Controllers/auth-controller');
const isAuthorized = require('../../Configurations/middlewares/authorization');

const authRoutes = function (passport) {
    const middlewares = [passport.authenticate('jwt', {session: false}), isAuthorized];
    
    //1: Get User Data
    router.get('/:id', middlewares, AuthController.getUserData);
    
    return router;
};

module.exports = authRoutes;