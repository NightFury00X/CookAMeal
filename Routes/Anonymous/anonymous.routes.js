'use strict';

const router = require('express').Router(),
    AnonymousController = require('../../Application/Controllers-Services/Controllers/anonymous.controller'),
    RequestMethods = require('../../Configurations/middlewares/request-checker');

const passport = require('passport'),
    requireLogin = passport.authenticate('local', {session: false});

// Passport Strategy
require('../../Configurations/Passport/passport-strategy');
const CommonMiddleware = require("../../Configurations/middlewares/reset-password-check"),
    {ValidateParams, ValidateBody} = require('../../Configurations/middlewares/validation'),
    {ParamSchemas, BodySchemas} = require('../../Application/Schemas/schema');

//1: Facebook User SignIn
router.post('/fbsign',
    RequestMethods.CheckContentType.ApplicationJsonData,
    requireLogin,
    AnonymousController.Anonymous.FbSignIn);

//2: SignUp
router.post('/signup',
    RequestMethods.CheckContentType.ApplicationFormData,
    AnonymousController.Anonymous.SignUp);

//3: Normal User SignIn
router.post('/authenticate',
    RequestMethods.CheckContentType.ApplicationJsonData,
    ValidateBody(BodySchemas.Login),
    requireLogin,
    AnonymousController.Anonymous.AuthenticateUser);

//4: Reset Password
router.post('/resetpass',
    RequestMethods.CheckContentType.ApplicationJsonData,
    ValidateBody(BodySchemas.ResetPassword),
    CommonMiddleware.VarifyResetPasswordPassKey,
    AnonymousController.Anonymous.ResetPassword);

module.exports = router;