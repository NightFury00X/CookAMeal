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
        let err = new Error('The Route ' + req.url + ' is Not Found');
        res.status(CommonConfig.STATUS_CODE.NOT_FOUND).send(
            {
                success: false,
                data: '{}',
                error: err.message
            }
        );
        next();
    });
    
    return router;
};

module.exports = authRoutes;