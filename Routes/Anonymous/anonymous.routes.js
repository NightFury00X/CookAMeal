'use strict';

const router = require('express').Router(),
    AnonymousController = require('../../Application/Controllers-Services/Controllers/anonymous.controller'),
    RequestMethods = require('../../Configurations/middlewares/request-checker');

const passport = require('passport'),
    requireLogin = passport.authenticate('local', {session: false}),
    requireAuth = passport.authenticate('jwt', {session: false});

// Passport Strategy
require('../../Configurations/Passport/passport-strategy');
const CommonMiddleware = require("../../Configurations/middlewares/reset-password-check"),
    {ValidateBody} = require('../../Configurations/middlewares/validation'),
    {BodySchemas} = require('../../Application/Schemas/schema');

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

//5: Change Password
router.put('/changepassword',
    RequestMethods.CheckAuthorizationHeader,
    RequestMethods.CheckContentType.ApplicationJsonData,
    ValidateBody(BodySchemas.ChangePassword),
    requireAuth,
    CommonMiddleware.AccessToChangePassword,
    AnonymousController.Anonymous.ChangePassword);

module.exports = router;