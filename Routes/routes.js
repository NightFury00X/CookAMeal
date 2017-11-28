'use strict';

const BaseApi = require('express').Router();
const AnonymousRoutes = require('express').Router();


const AuthRoutes = require('express').Router();
const router = require('express').Router();
const Authorization = require('../Configurations/middlewares/authorization').Authorization;
const CommonConfig = require('../Configurations/Helpers/common-config');
// const AnonymousRoutes = require('./Anonymous/anonymous.routes');
// const AuthRoutes = require('./Auth/auth-routes');
const CommonRoutes = require('./Common/common-routes');
const AdminRoutes = require('./Admin/admin.routes');
const CookRoutes = require('./Cook/cook.routes');
const RequestMethods = require('../Configurations/middlewares/request-checker');

const passport = require('passport');
const passportService= require('../Configurations/Passport/passport-strategy');

// Middleware to require login/auth
let requireAuth = passport.authenticate('jwt', {session: false}),
    requireLogin = passport.authenticate('local', {session: false});



module.exports = function (app) {

    //1: Anonymous Routes
    BaseApi.use('/api', require('./Anonymous/anonymous.routes'));

    //2: Auth Routes
    BaseApi.use('/api', AuthRoutes);
    AuthRoutes.use('/auth',
        RequestMethods.CheckAuthorizationHeader,
        passport.authenticate('jwt', {session: false}),
        Authorization(CommonConfig.ACCESS_LEVELS.CUSTOMER, require('./Auth/auth-routes')));

    //3: Common Routes
    // BaseApi.use('/api');


    app.use(BaseApi);

};

// let APIRoutes = function (app) {
//
//     router.get('/abc', function (req, res, callback) {
//         res.sendStatus(200);
//     });
//     router.use('/', AnonymousRoutes);
//     return router;
//
// };


// const APIRoutes = function (passport) {
//     const MiddleWareRules = {
//         Admin: [RequestMethods.CheckAuthorizationHeader, passport.authenticate('jwt', {session: false}), Authorization(CommonConfig.ACCESS_LEVELS.ADMIN, AdminRoutes(passport))],
//         Auth: [RequestMethods.CheckAuthorizationHeader, passport.authenticate('jwt', {session: false}), Authorization(CommonConfig.ACCESS_LEVELS.ALL, AuthRoutes(passport))],
//         Common: [RequestMethods.CheckAuthorizationHeader, passport.authenticate('jwt', {session: false}), Authorization(CommonConfig.ACCESS_LEVELS.ALL, CommonRoutes(passport))],
//         Cook: [RequestMethods.CheckAuthorizationHeader, passport.authenticate('jwt', {session: false}), Authorization(CommonConfig.ACCESS_LEVELS.COOK, CookRoutes(passport))],
//         Customer: [RequestMethods.CheckAuthorizationHeader, passport.authenticate('jwt', {session: false}), Authorization(CommonConfig.ACCESS_LEVELS.CUSTOMER, CookRoutes(passport))]
//     };
//
//     //Anonymous Routes
//     router.use('/', AnonymousRoutes(passport));
//
//     //Anonymous Routes
//     router.use('/auth', MiddleWareRules.Auth);
//
//     // Auth Routes
//     router.use('/common/', MiddleWareRules.Common);
//
//     //Admin Routes
//     router.use('/admin/', MiddleWareRules.Admin);
//
//     // Cook Routes
//     router.use('/cook/', MiddleWareRules.Cook);
//
//     return router;
// };
//
// module.exports = APIRoutes;