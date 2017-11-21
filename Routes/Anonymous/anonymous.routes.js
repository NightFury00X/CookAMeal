'use strict';

const router = require('express').Router();
const AnonymousController = require('../../Application/Controllers-Services/Controllers/anonymous.controller');

const AnonymousRoutes = function (passport) {
    //1: Facebook User SignIn
    router.post('/fbsign', AnonymousController.FbSignIn);
    
    //2: SignUp
    router.post('/signup', AnonymousController.SignUp);
    
    //3: Normal User SignIn
    router.post('/authenticate', AnonymousController.AuthenticateUser);
    
    return router;
};

module.exports = AnonymousRoutes;