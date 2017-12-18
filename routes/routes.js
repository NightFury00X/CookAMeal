'use strict';
const passport = require('passport'),
    requireAuth = passport.authenticate('jwt', {session: false}),
    {
        AuthorizationMiddlewares,
        TokenValidatorsMiddlewares,
        CommonMiddlewares
    } = require('../configurations/middlewares/middlewares');

// passport Strategy
require('../configurations/passport/passport-strategy');

const BaseApi = require('express').Router(),
    AuthRoutes = require('express').Router(),
    CommonRoutes = require('express').Router(),
    AdminRoutes = require('express').Router(),
    CookRoutes = require('express').Router(),
    CommonConfig = require('../configurations/helpers/common-config');

module.exports = function (app) {
    
    //1: anonymous routes
    BaseApi.use('/api',
        require('./anonymous/anonymous.routes'));
    
    //2: auth routes
    BaseApi.use('/api', AuthRoutes);
    AuthRoutes.use('/auth',
        [CommonMiddlewares.CheckAuthorizationHeader,
            requireAuth,
            TokenValidatorsMiddlewares.CheckUserTokenIsValid,
            AuthorizationMiddlewares.AccessLevel(CommonConfig.ACCESS_LEVELS.ALL)],
        require('./auth/auth-routes'));
    
    //3: common routes
    BaseApi.use('/api', CommonRoutes);
    CommonRoutes.use('/common',
        [CommonMiddlewares.CheckAuthorizationHeader,
            requireAuth,
            TokenValidatorsMiddlewares.CheckUserTokenIsValid,
            AuthorizationMiddlewares.AccessLevel(CommonConfig.ACCESS_LEVELS.ALL)],
        require('./common/common-routes'));
    
    //4: admin routes
    BaseApi.use('/api', AdminRoutes);
    AdminRoutes.use('/admin',
        [CommonMiddlewares.CheckAuthorizationHeader,
            requireAuth,
            TokenValidatorsMiddlewares.CheckUserTokenIsValid,
            AuthorizationMiddlewares.AccessLevel(CommonConfig.ACCESS_LEVELS.ADMIN)],
        require('./admin/admin.routes'));
    
    //5: cook routes
    BaseApi.use('/api', CookRoutes);
    CookRoutes.use('/cook',
        [CommonMiddlewares.CheckAuthorizationHeader,
            requireAuth,
            TokenValidatorsMiddlewares.CheckUserTokenIsValid,
            AuthorizationMiddlewares.AccessLevel(CommonConfig.ACCESS_LEVELS.COOK)],
        require('./cook/cook.routes'));
    
    app.use(BaseApi);
};