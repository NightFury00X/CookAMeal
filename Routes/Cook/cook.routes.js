'use strict';

const router = require('express').Router();
const CookController = require('../../Application/Controllers-Services/Controllers/cook.controller');

const CookRoutes = function (passport) {    
    return router;
};

module.exports = CookRoutes;