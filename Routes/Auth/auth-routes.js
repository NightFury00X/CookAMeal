'use strict';

const router = require('express').Router();
const AuthController = require('../../Application/Controllers-Services/Controllers/auth-controller');

const authRoutes = function (passport) {
    
    //1: Get User Data
    // router.get('/:id', middlewares, AuthController.getUserData);
    
    return router;
};

module.exports = authRoutes;