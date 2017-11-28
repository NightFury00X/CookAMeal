'use strict';

const router = require('express').Router();
const Authorization = require('../Configurations/middlewares/authorization').Authorization;
const CommonConfig = require('../Configurations/Helpers/common-config');
const AnonymousRoutes = require('./Anonymous/anonymous.routes');
const AuthRoutes = require('./Auth/auth-routes');
const CommonRoutes = require('./Common/common-routes');
const AdminRoutes = require('./Admin/admin.routes');
const CookRoutes = require('./Cook/cook.routes');
const RequestMethods = require('../Configurations/middlewares/request-checker');
const AnonymousController = require('../Application/Controllers-Services/Controllers/anonymous.controller');


const APIRoutes = function (passport) {
    const MiddleWareRules = {
        Admin: [RequestMethods.CheckAuthorizationHeader, passport.authenticate('jwt', {session: false}), Authorization(CommonConfig.ACCESS_LEVELS.ADMIN, AdminRoutes(passport))],
        Auth: [RequestMethods.CheckAuthorizationHeader, passport.authenticate('jwt', {session: false}), Authorization(CommonConfig.ACCESS_LEVELS.ALL, AuthRoutes(passport))],
        Common: [RequestMethods.CheckAuthorizationHeader, passport.authenticate('jwt', {session: false}), Authorization(CommonConfig.ACCESS_LEVELS.ALL, CommonRoutes(passport))],
        Cook: [RequestMethods.CheckAuthorizationHeader, passport.authenticate('jwt', {session: false}), Authorization(CommonConfig.ACCESS_LEVELS.COOK, CookRoutes(passport))],
        Customer: [RequestMethods.CheckAuthorizationHeader, passport.authenticate('jwt', {session: false}), Authorization(CommonConfig.ACCESS_LEVELS.CUSTOMER, CookRoutes(passport))]
    };
    
    //Anonymous Routes
    // //1: Facebook User SignIn
    // router.post('/fbsign', RequestMethods.CheckContentType.ApplicationJsonData, AnonymousController.Anonymous.FbSignIn);
    //
    // //2: SignUp
    // router.post('/signup', RequestMethods.CheckContentType.ApplicationFormData, AnonymousController.Anonymous.SignUp);
    //
    // //3: Normal User SignIn
    // router.post('/authenticate', RequestMethods.CheckContentType.ApplicationJsonData, AnonymousController.Anonymous.AuthenticateUser);
    
    router.use('/', AnonymousRoutes(passport));
    
    //Anonymous Routes
    router.use('/auth/', MiddleWareRules.Auth);
    
    // Auth Routes    
    router.use('/common/', MiddleWareRules.Common);
    
    //Admin Routes
    router.use('/admin/', MiddleWareRules.Admin);
    
    // Cook Routes    
    router.use('/cook/', MiddleWareRules.Cook);
    
    // router.use(function (req, res, next) {
    //     let err = {error: 'The Route ' + req.url + ' is Not Found', status: 404};
    //     next(err);
    // });
    //
    return router;
};


module.exports = APIRoutes;