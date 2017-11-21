'use strict';

const router = require('express').Router();


const CommonRoutes = require('./Common/common.routes');
const AuthRoutes = require('./Auth/auth-routes');


const APIRoutes = function (passport) {
    //Common Routes
    router.use('/', CommonRoutes((passport)));
    
    // Auth Routes    
    router.use('/auth/', AuthRoutes(passport));
    
    //
    // router.use(function (req, res, next) {
    //     next();
    // });
    
    return router;
};

module.exports = APIRoutes;