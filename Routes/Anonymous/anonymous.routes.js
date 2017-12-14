'use strict';

const router = require('express').Router(),
    AnonymousController = require('../../Application/Controllers-Services/Controllers/anonymous.controller'),
    {
        RequestMethodsMiddlewares,
        TokenMiddlewares,
        ResetPasswordMiddlewares
    } = require('../../Configurations/middlewares/middlewares');

const passport = require('passport'),
    requireLogin = passport.authenticate('local', {session: false});

// Passport Strategy
require('../../Configurations/Passport/passport-strategy');
const FileUploader = require("../../Configurations/Helpers/file-upload-multer");
const {ValidateBody} = require('../../Configurations/middlewares/validation'),
    {BodySchemas} = require('../../Application/Schemas/schema');

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

module.exports = router;