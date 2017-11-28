'use strict';

const router = require('express').Router();
const AuthController = require('../../Application/Controllers-Services/Controllers/auth-controller');
const RequestMethods = require('../../Configurations/middlewares/request-checker');

const authRoutes = function (passport) {
    
    //1: Get User Data
    router.get('/user', AuthController.Auth.GetUser);
    
    //2. Logout User
    router.post('/logout', RequestMethods.CheckContentType.ApplicationJsonData, AuthController.Auth.LogOutUser);
    
    return router;
};

module.exports = authRoutes;