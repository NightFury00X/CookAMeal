'use strict';
const passport = require('passport'),
    requireAuth = passport.authenticate('jwt', {session: false}),
    {
        AuthorizationMiddlewares,
        TokenValidatorsMiddlewares,
        CommonMiddlewares
    } = require('../Configurations/middlewares/middlewares');

// Passport Strategy
require('../Configurations/Passport/passport-strategy');

const BaseApi = require('express').Router(),
    AuthRoutes = require('express').Router(),
    CommonRoutes = require('express').Router(),
    AdminRoutes = require('express').Router(),
    CookRoutes = require('express').Router(),
    CommonConfig = require('../Configurations/Helpers/common-config');

module.exports = function (app) {
    
    //1: Anonymous Routes
    BaseApi.use('/api',
        require('./Anonymous/anonymous.routes'));
    
    //2: Auth Routes
    BaseApi.use('/api', AuthRoutes);
    AuthRoutes.use('/auth',
        [CommonMiddlewares.CheckAuthorizationHeader,
            requireAuth,
            TokenValidatorsMiddlewares.CheckUserTokenIsValid,
            AuthorizationMiddlewares.AccessLevel(CommonConfig.ACCESS_LEVELS.ALL)],
        require('./Auth/auth-routes'));
    
    //3: Common Routes
    BaseApi.use('/api', CommonRoutes);
    CommonRoutes.use('/common',
        [CommonMiddlewares.CheckAuthorizationHeader,
            requireAuth,
            TokenValidatorsMiddlewares.CheckUserTokenIsValid,
            AuthorizationMiddlewares.AccessLevel(CommonConfig.ACCESS_LEVELS.ALL)],
        require('./Common/common-routes'));
    
    //4: Admin Routes
    BaseApi.use('/api', AdminRoutes);
    AdminRoutes.use('/admin',
        [CommonMiddlewares.CheckAuthorizationHeader,
            requireAuth,
            TokenValidatorsMiddlewares.CheckUserTokenIsValid,
            AuthorizationMiddlewares.AccessLevel(CommonConfig.ACCESS_LEVELS.ADMIN)],
        require('./Admin/admin.routes'));
    
    //5: Cook Routes
    BaseApi.use('/api', CookRoutes);
    CookRoutes.use('/cook',
        [CommonMiddlewares.CheckAuthorizationHeader,
            requireAuth,
            TokenValidatorsMiddlewares.CheckUserTokenIsValid,
            AuthorizationMiddlewares.AccessLevel(CommonConfig.ACCESS_LEVELS.COOK)],
        require('./Cook/cook.routes'));
    
    app.use(BaseApi);
};