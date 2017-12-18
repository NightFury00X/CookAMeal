'use strict';
const router = require('express').Router(),
    AuthController = require('../../application/controllers-services/controllers/auth.controller'),
    {ValidateBody} = require("../../configurations/middlewares/validation"),
    {BodySchemas} = require('../../application/schemas/schema'),
    {
        RequestMethodsMiddlewares,
    } = require('../../configurations/middlewares/middlewares');

//1: Logout
router.post('/logout',
    RequestMethodsMiddlewares.ApplicationJsonData,
    AuthController.Auth.LogOutUser);

//5: Change Password
router.put('/changepassword',
    RequestMethodsMiddlewares.ApplicationJsonData,
    ValidateBody(BodySchemas.ChangePassword),
    
    AuthController.Auth.ChangePassword);

module.exports = router;