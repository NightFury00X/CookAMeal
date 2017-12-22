'use strict';

const router = require('express').Router(),
    AnonymousController = require('../../application/controllers-services/controllers/anonymous.controller'),
    {
        RequestMethodsMiddlewares,
        TokenMiddlewares,
        ResetPasswordMiddlewares
    } = require('../../configurations/middlewares/middlewares');

const passport = require('passport'),
    requireLogin = passport.authenticate('local', {session: false});

// passport Strategy
require('../../configurations/passport/passport-strategy');
const FileUploader = require("../../configurations/helpers/file-upload-multer");
const {ValidateBody} = require('../../configurations/middlewares/validation'),
    {BodySchemas} = require('../../application/schemas/schema');

//1: Facebook User SignIn
router.post('/fbsign',
    RequestMethodsMiddlewares.ApplicationJsonData,
    ValidateBody(BodySchemas.FbLogin),
    AnonymousController.Anonymous.FbSignIn);

//2: SignUp
router.post('/signup',
    RequestMethodsMiddlewares.ApplicationFormData,
    FileUploader.uploadFile,
    AnonymousController.Anonymous.SignUp);

//3: Normal User SignIn
router.post('/authenticate',
    RequestMethodsMiddlewares.ApplicationJsonData,
    ValidateBody(BodySchemas.Login),
    requireLogin,
    TokenMiddlewares.VerifyResetPasswordToken,
    AnonymousController.Anonymous.AuthenticateUser);

//4: Reset Password
router.post('/resetpass',
    RequestMethodsMiddlewares.ApplicationJsonData,
    ValidateBody(BodySchemas.ResetPassword),
    ResetPasswordMiddlewares.CheckPasswordIsGenerated,
    AnonymousController.Anonymous.ResetPassword);


router.post('/currency',
    AnonymousController.Anonymous.Currency);
module.exports = router;