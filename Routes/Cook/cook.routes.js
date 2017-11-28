'use strict';

const router = require('express').Router(),
    CookController = require('../../Application/Controllers-Services/Controllers/cook.controller'),
    CommonConfig = require('../../Configurations/Helpers/common-config');

const CookRoutes = function (passport) {
    router.use(function (req, res, next) {
        let err = {error: 'The Route ' + req.url + ' is Not Found', status: 404};
        next(err);
    });
    return router;
};

module.exports = CookRoutes;