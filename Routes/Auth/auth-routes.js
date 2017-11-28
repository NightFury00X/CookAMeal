'use strict';

const router = require('express').Router(),
    AuthController = require('../../Application/Controllers-Services/Controllers/auth-controller'),
    RequestMethods = require('../../Configurations/middlewares/request-checker'),
    CommonConfig = require('../../Configurations/Helpers/common-config');

const authRoutes = function (passport) {
    
    //1: Get User Data
    router.get('/user', AuthController.Auth.GetUser);
    
    //2. Logout User
    router.post('/logout', RequestMethods.CheckContentType.ApplicationJsonData, AuthController.Auth.LogOutUser);
    
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

module.exports = authRoutes;