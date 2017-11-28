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
    
    router.use(function (req, res, next) {
        res.status(404).send(
            {
                success: false,
                data: null,
                error: {
                    message: 'The Route ' + req.url + ' is Not Found',
                    error: 404
                }
            }
        );
        next(null, false);
    });
    
    
    return router;
};

module.exports = AnonymousRoutes;