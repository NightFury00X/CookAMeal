'use strict';

const router = require('express').Router(),
    CookController = require('../../Application/Controllers-Services/Controllers/cook.controller'),
    CommonConfig = require('../../Configurations/Helpers/common-config');

const CookRoutes = function (passport) {

    return router;
};

module.exports = CookRoutes;