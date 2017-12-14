'use strict';

const router = require('express').Router();
const AuthController = require('../../Application/Controllers-Services/Controllers/auth-controller');
const {ValidateBody} = require("../../Configurations/middlewares/validation"),
    {BodySchemas} = require('../../Application/Schemas/schema'),
    {
        RequestMethodsMiddlewares,
    } = require('../../Configurations/middlewares/middlewares');

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