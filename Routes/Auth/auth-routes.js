'use strict';

let multer = require('multer'),
    upload = multer({dest: 'Public/Profile'});

const router = require('express').Router();
const AuthController = require('../../Application/Controllers-Services/Controllers/auth-controller');
const isAuthorized = require('../../Configurations/middlewares/authorization');

const authRoutes = function (passport) {
    const middlewares = [passport.authenticate('jwt', {session: false}), isAuthorized];
    
    // Signup    
    router.post('/signup', upload.any(), AuthController.signUp);
    
    // Authenticate user
    router.post('/authenticate', AuthController.authenticateUser);
    
    // Authenticate user
    router.get('/:id', middlewares, AuthController.getUserData);
    
    return router;
};

module.exports = authRoutes;