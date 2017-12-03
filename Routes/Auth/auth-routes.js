'use strict';

const router = require('express').Router();
const AuthController = require('../../Application/Controllers-Services/Controllers/auth-controller');
const RequestMethods = require('../../Configurations/middlewares/request-checker');
const CommonMiddleware = require("../../Configurations/middlewares/reset-password-check");
const {ValidateBody} = require("../../Configurations/middlewares/validation"),
    {BodySchemas} = require('../../Application/Schemas/schema');

//1: Logout
router.post('/logout',
    RequestMethods.CheckContentType.ApplicationJsonData,
    AuthController.Auth.LogOutUser);

//5: Change Password
router.put('/changepassword',
    RequestMethods.CheckContentType.ApplicationJsonData,
    ValidateBody(BodySchemas.ChangePassword),
    AuthController.Auth.ChangePassword);

module.exports = router;