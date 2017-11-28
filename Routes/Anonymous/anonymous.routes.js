'use strict';

const router = require('express').Router(),
    AnonymousController = require('../../Application/Controllers-Services/Controllers/anonymous.controller'),
    RequestMethods = require('../../Configurations/middlewares/request-checker'),
    CommonConfig = require('../../Configurations/Helpers/common-config');

const AnonymousRoutes = function (passport) {
    //1: Facebook User SignIn
    router.post('/fbsign', RequestMethods.CheckContentType.ApplicationJsonData, AnonymousController.Anonymous.FbSignIn);
    
    //2: SignUp
    router.post('/signup', RequestMethods.CheckContentType.ApplicationFormData, AnonymousController.Anonymous.SignUp);
    
    //3: Normal User SignIn
    router.post('/authenticate', RequestMethods.CheckContentType.ApplicationJsonData, AnonymousController.Anonymous.AuthenticateUser);
    
    // catch 404 and forward to error handler
    router.use(function (req, res, next) {
        console.log('Anon');
        let err = {error: 'The Route ' + req.url + ' is Not Found', status: 404};
        next(err);
    });
    
    return router;
};

module.exports = AnonymousRoutes;