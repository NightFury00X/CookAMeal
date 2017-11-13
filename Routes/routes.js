'use strict';

const router = require('express').Router();


const AuthRoutes = require('./Auth/auth-routes');


const APIRoutes = function (passport) {
    // Auth Routes    
    router.use('/auth/', AuthRoutes(passport));

    router.use(function (req, res, next) {
        console.log('Router level error');
        next();
    });
    
    return router;
};

module.exports = APIRoutes;