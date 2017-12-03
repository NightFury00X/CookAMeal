'use strict';

const router = require('express').Router(),
    AnonymousController = require('../../Application/Controllers-Services/Controllers/anonymous.controller'),
    RequestMethods = require('../../Configurations/middlewares/request-checker');

const passport = require('passport'),
    requireLogin = passport.authenticate('local', {session: false});

// Passport Strategy
require('../../Configurations/Passport/passport-strategy');
const {ValidateBody} = require('../../Configurations/middlewares/validation'),
    {BodySchemas} = require('../../Application/Schemas/schema'),
    {Token} = require('../../Configurations/middlewares/middlewares');

const {ResetPassword} = require('../../Configurations/middlewares/middlewares');
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
    Token.VerifyResetPasswordToken,
    AnonymousController.Anonymous.AuthenticateUser);

//4: Reset Password
router.post('/resetpass',
    RequestMethods.CheckContentType.ApplicationJsonData,
    ValidateBody(BodySchemas.ResetPassword),
    ResetPassword.CheckPasswordIsGenerated,
    AnonymousController.Anonymous.ResetPassword);

module.exports = router;