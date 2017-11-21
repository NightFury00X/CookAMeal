'use strict';

const router = require('express').Router();
const AnonymousController = require('../../Application/Controllers-Services/Controllers/anonymous.controller');

const commonRoutes = function (passport) {
    //1: Facebook User SignIn
    router.post('/signup', AnonymousController.FbSignIn);
    
    //2: SignUp
    router.post('/fbsign', AnonymousController.SignUp);
    
    //3: Normal User SignIn
    router.post('/authenticate', AnonymousController.AuthenticateUser);
    
    return router;
};

module.exports = commonRoutes;