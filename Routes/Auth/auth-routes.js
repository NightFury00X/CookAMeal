'use strict';

const router = require('express').Router();
const AuthController = require('../../Application/Controllers-Services/Controllers/auth-controller');
const RequestMethods = require('../../Configurations/middlewares/request-checker');

//1: Logout
router.post('/logout',
    RequestMethods.CheckContentType.ApplicationJsonData,
    AuthController.Auth.LogOutUser);

module.exports = router;