'use strict';

const router = require('express').Router(),
    AnonymousController = require('../../Application/Controllers-Services/Controllers/anonymous.controller');
const RequestMethods = require('../../Configurations/middlewares/request-checker');

const AnonymousRoutes = function (passport) {
    //1: Facebook User SignIn
    router.post('/fbsign', RequestMethods.CheckContentType.ApplicationJsonData, AnonymousController.Anonymous.FbSignIn);
    
    //2: SignUp
    router.post('/signup', RequestMethods.CheckContentType.ApplicationFormData, AnonymousController.Anonymous.SignUp);
    
    //3: Normal User SignIn
    router.post('/authenticate', RequestMethods.CheckContentType.ApplicationJsonData, AnonymousController.Anonymous.AuthenticateUser);
    
    return router;
};

module.exports = AnonymousRoutes;