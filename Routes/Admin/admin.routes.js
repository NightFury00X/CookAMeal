'use strict';

const router = require('express').Router(),
    AdminController = require('../../Application/Controllers-Services/Controllers/admin-controller'),
    RequestMethods = require('../../Configurations/middlewares/request-checker'),
    CommonConfig = require('../../Configurations/Helpers/common-config');

const AdminRoutes = function (passport) {
    router.post('/category', RequestMethods.CheckContentType.ApplicationFormData, AdminController.Category.Add);
    
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

module.exports = AdminRoutes;