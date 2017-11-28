'use strict';

const router = require('express').Router(),
    AdminController = require('../../Application/Controllers-Services/Controllers/admin-controller'),
    RequestMethods = require('../../Configurations/middlewares/request-checker'),
    CommonConfig = require('../../Configurations/Helpers/common-config');

const AdminRoutes = function (passport) {
    router.post('/category', RequestMethods.CheckContentType.ApplicationFormData, AdminController.Category.Add);
    
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

module.exports = AdminRoutes;