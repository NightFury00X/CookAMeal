'use strict';

const router = require('express').Router();
const Authorization = require('../Configurations/middlewares/authorization').Authorization;
const CommonConfig = require('../Configurations/Helpers/common-config');
const AnonymousRoutes = require('./Anonymous/anonymous.routes');
const AuthRoutes = require('./Auth/auth-routes');
const CommonRoutes = require('./Common/common-routes');
const AdminRoutes = require('./Admin/admin.routes');
const CookRoutes = require('./Cook/cook.routes');


const APIRoutes = function (passport) {
    const MiddleWareRules = {
        Admin: [passport.authenticate('jwt', {session: false}), Authorization(CommonConfig.AccessLevels.Admin, AdminRoutes(passport))],
        Auth: [passport.authenticate('jwt', {session: false})],
        Common: [passport.authenticate('jwt', {session: false}), Authorization(CommonConfig.AccessLevels.All, CommonRoutes(passport))],
        Cook: [passport.authenticate('jwt', {session: false}), Authorization(CommonConfig.AccessLevels.Cook, CookRoutes(passport))],
        Customer: [passport.authenticate('jwt', {session: false}), Authorization(CommonConfig.AccessLevels.Customer, CookRoutes(passport))]
    };
    
    //Anonymous Routes
    router.use('/', AnonymousRoutes(passport));
    
    //Anonymous Routes
    router.use('/auth', MiddleWareRules.Auth, AuthRoutes(passport));
    
    // Auth Routes    
    router.use('/common/', MiddleWareRules.Common);
    
    //Admin Routes
    router.use('/admin/', MiddleWareRules.Admin);
    
    // Cook Routes    
    router.use('/cook/', MiddleWareRules.Cook);
    
    return router;
};

module.exports = APIRoutes;