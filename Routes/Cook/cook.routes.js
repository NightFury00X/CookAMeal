'use strict';

const router = require('express').Router(),
    CookController = require('../../Application/Controllers-Services/Controllers/cook.controller'),
    CommonConfig = require('../../Configurations/Helpers/common-config');

const CookRoutes = function (passport) {
    router.use(function (req, res, next) {
        let err = new Error('The Route ' + req.url + ' is Not Found');
        res.status(CommonConfig.STATUS_CODE.NOT_FOUND).send(
            {
                success: false,
                data: '{}',
                error: err.message
            }
        );
        next();
    });
    return router;
};

module.exports = CookRoutes;