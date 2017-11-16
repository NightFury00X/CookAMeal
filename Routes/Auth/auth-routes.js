'use strict';

const router = require('express').Router();
const AuthController = require('../../Application/Controllers-Services/Controllers/auth-controller');
const isAuthorized = require('../../Configurations/middlewares/authorization');

const authRoutes = function (passport) {
    const middlewares = [passport.authenticate('jwt', {session: false}), isAuthorized];
    
    //Check Facebook user already registered or not    
    router.get('/:id/fb', AuthController.fb);
    
    // Signup    
    router.post('/signup', AuthController.signUp);
    
    // Authenticate user
    router.post('/authenticate', AuthController.authenticateUser);
    
    // Authenticate user
    router.get('/:id', middlewares, AuthController.getUserData);
    
    return router;
};

module.exports = authRoutes;