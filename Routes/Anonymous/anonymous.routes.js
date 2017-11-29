'use strict';

const router = require('express').Router(),
    AnonymousController = require('../../Application/Controllers-Services/Controllers/anonymous.controller'),
    RequestMethods = require('../../Configurations/middlewares/request-checker');

const passport = require('passport'),
    requireLogin = passport.authenticate('local', {session: false});

// Passport Strategy
require('../../Configurations/Passport/passport-strategy');

//1: Facebook User SignIn
router.post('/fbsign',
    RequestMethods.CheckContentType.ApplicationJsonData,
    AnonymousController.Anonymous.FbSignIn);

//2: SignUp
router.post('/signup',
    RequestMethods.CheckContentType.ApplicationFormData,
    AnonymousController.Anonymous.SignUp);

//3: Normal User SignIn
router.post('/authenticate',
    RequestMethods.CheckContentType.ApplicationJsonData,
    requireLogin,
    AnonymousController.Anonymous.AuthenticateUser);

//4: Reset Password
router.post('/resetpass',
    RequestMethods.CheckContentType.ApplicationJsonData,
    AnonymousController.Anonymous.ResetPassword);

module.exports = router;