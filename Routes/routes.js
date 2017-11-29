'use strict';
const passport = require('passport'),
    requireAuth = passport.authenticate('jwt', {session: false});

// Passport Strategy
require('../Configurations/Passport/passport-strategy');

const BaseApi = require('express').Router(),
    AuthRoutes = require('express').Router(),
    CommonRoutes = require('express').Router(),
    AdminRoutes = require('express').Router(),
    CookRoutes = require('express').Router();

const Authorization = require('../Configurations/middlewares/authorization'),
    CommonConfig = require('../Configurations/Helpers/common-config'),
    RequestMethods = require('../Configurations/middlewares/request-checker'),
    RequireLogin = require('../Configurations/middlewares/token-validate');

module.exports = function (app) {
    
    //1: Anonymous Routes
    BaseApi.use('/api',
        require('./Anonymous/anonymous.routes'));

    //2: Auth Routes
    BaseApi.use('/api', AuthRoutes);
    AuthRoutes.use('/auth',
        RequestMethods.CheckAuthorizationHeader,
        requireAuth,
        RequireLogin.IsUserTokenValid,
        Authorization(CommonConfig.ACCESS_LEVELS.ALL),
        require('./Auth/auth-routes'));

    //3: Common Routes
    BaseApi.use('/api', CommonRoutes);
    CommonRoutes.use('/common',
        RequestMethods.CheckAuthorizationHeader,
        requireAuth,
        RequireLogin.IsUserTokenValid,
        Authorization(CommonConfig.ACCESS_LEVELS.ALL),
        require('./Common/common-routes'));
    
    //4: Admin Routes
    BaseApi.use('/api', AdminRoutes);
    AdminRoutes.use('/admin',
        RequestMethods.CheckAuthorizationHeader,
        requireAuth,
        RequireLogin.IsUserTokenValid,
        Authorization(CommonConfig.ACCESS_LEVELS.ADMIN),
        require('./Admin/admin.routes'));
    
    //5: Cook Routes
    BaseApi.use('/api', CookRoutes);
    CookRoutes.use('/cook',
        RequestMethods.CheckAuthorizationHeader,
        requireAuth,
        RequireLogin.IsUserTokenValid,
        Authorization(CommonConfig.ACCESS_LEVELS.COOK),
        require('./Cook/cook.routes'));
    
    app.use(BaseApi);
};