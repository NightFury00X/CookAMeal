'use strict';

const router = require('express').Router();
const CommonController = require('../../Application/Controllers-Services/Controllers/common.controller');
const RequestMethods = require('../../Configurations/middlewares/request-checker');

const CommonRoutes = function (passport) {
    
    //1: Get All Category list
    router.get('/category', CommonController.Category.FindAll);
    
    //1: Get All Category by Id
    router.get('/category/:id', CommonController.Category.FindById);
    
    return router;
};

module.exports = CommonRoutes;