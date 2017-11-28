'use strict';

const router = require('express').Router(),
    AdminController = require('../../Application/Controllers-Services/Controllers/admin-controller'),
    RequestMethods = require('../../Configurations/middlewares/request-checker'),
    CommonConfig = require('../../Configurations/Helpers/common-config');

const AdminRoutes = function (passport) {
    router.post('/category', RequestMethods.CheckContentType.ApplicationFormData, AdminController.Category.Add);
    
    return router;
};

module.exports = AdminRoutes;