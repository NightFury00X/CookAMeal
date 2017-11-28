'use strict';

const router = require('express').Router(),
    AdminController = require('../../Application/Controllers-Services/Controllers/admin-controller'),
    RequestMethods = require('../../Configurations/middlewares/request-checker'),
    CommonConfig = require('../../Configurations/Helpers/common-config');

const AdminRoutes = function (passport) {
    router.post('/category', RequestMethods.CheckContentType.ApplicationFormData, AdminController.Category.Add);
    
    router.use(function (req, res, next) {
        let err = {error: 'The Route ' + req.url + ' is Not Found', status: 404};
        next(err);
    });
    
    return router;
};

module.exports = AdminRoutes;