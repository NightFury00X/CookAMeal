'use strict';

const router = require('express').Router(),
    CommonController = require('../../Application/Controllers-Services/Controllers/common.controller'),
    RequestMethods = require('../../Configurations/middlewares/request-checker'),
    CommonConfig = require('../../Configurations/Helpers/common-config');

const CommonRoutes = function (passport) {
    
    //1: Get All Category list
    router.get('/category', CommonController.Category.GetAll);
    
    //1: Get All Category by Id
    router.get('/category/:id', CommonController.Category.FindById);
    
    router.use(function (req, res, next) {
        let err = {error: 'The Route ' + req.url + ' is Not Found', status: 404};
        next(err);
    });
    
    return router;
};

module.exports = CommonRoutes;