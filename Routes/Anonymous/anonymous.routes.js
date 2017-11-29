'use strict';

const router = require('express').Router(),
    AnonymousController = require('../../Application/Controllers-Services/Controllers/anonymous.controller'),
    RequestMethods = require('../../Configurations/middlewares/request-checker');

const passport = require('passport'),
    requireLogin = passport.authenticate('local', {session: false});

// Passport Strategy
require('../../Configurations/Passport/passport-strategy');
const CommonMiddleware = require("../../Configurations/middlewares/reset-password-check"),
    {ValidateParams, ValidateBody, Schemas} = require('../../Configurations/middlewares/validation');

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
    ValidateBody(Schemas.loginSchema),
    // RequestMethods.CheckContentType.ApplicationJsonData,
    // requireLogin,
    AnonymousController.Anonymous.AuthenticateUser);

//4: Reset Password
router.post('/resetpass',
    RequestMethods.CheckContentType.ApplicationJsonData,
    CommonMiddleware.VarifyResetPasswordPassKey,
    AnonymousController.Anonymous.ResetPassword);

//4: test
router.get('/:id/:myid',
    ValidateParams(Schemas.idSchema, 'id'),
    ValidateParams(Schemas.myidSchema, 'myid'),
    AnonymousController.Anonymous.Test);

module.exports = router;