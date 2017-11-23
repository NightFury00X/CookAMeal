'use strict';

const router = require('express').Router(),
    AnonymousController = require('../../Application/Controllers-Services/Controllers/anonymous.controller');

const AnonymousRoutes = function (passport) {
    //1: Facebook User SignIn
    router.post('/fbsign', AnonymousController.Anonymous.FbSignIn);
    
    //2: SignUp
    router.post('/signup', AnonymousController.Anonymous.SignUp);
    
    //3: Normal User SignIn
    router.post('/authenticate', AnonymousController.Anonymous.AuthenticateUser);
    
    return router;
};

module.exports = AnonymousRoutes;