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

module.exports = CommonRoutes;