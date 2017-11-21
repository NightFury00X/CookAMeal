'use strict';

const router = require('express').Router();


const AnonymousRoutes = require('./Anonymous/anonymous.routes');
const AuthRoutes = require('./Auth/auth-routes');


const APIRoutes = function (passport) {
    //Anonymous Routes
    router.use('/', AnonymousRoutes(passport));
    
    // Auth Routes    
    router.use('/auth/', AuthRoutes(passport));
    
    //
    // router.use(function (req, res, next) {
    //     next();
    // });
    
    return router;
};

module.exports = APIRoutes;