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
    router.use('', AnonymousRoutes(passport));
    
    //Anonymous Routes
    router.use('/auth/', MiddleWareRules.Auth);
    
    // Auth Routes    
    router.use('/common/', MiddleWareRules.Common);
    
    //Admin Routes
    router.use('/admin/', MiddleWareRules.Admin);
    
    // Cook Routes    
    router.use('/cook/', MiddleWareRules.Cook);
    
    router.use(function (req, res, next) {
        res.status(404).send(
            {
                success: false,
                data: null,
                error: {
                    message: 'The Route ' + req.url + ' is Not Found',
                    error: 404
                }
            }
        );
        next(null, false);
    });

    return router;
};


module.exports = APIRoutes;