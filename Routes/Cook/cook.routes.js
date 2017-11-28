'use strict';

const router = require('express').Router(),
    CookController = require('../../Application/Controllers-Services/Controllers/cook.controller'),
    CommonConfig = require('../../Configurations/Helpers/common-config');

const CookRoutes = function (passport) {
    router.use(function (req, res, next) {
        res.status(404).send(
            {
                success: false,
                data: null,
                error: {
                    message: 'The Route ' + req.url + ' is Not Found',
                    error: 404
                }
            }
        );
        next(null, false);
    });
    return router;
};

module.exports = CookRoutes;