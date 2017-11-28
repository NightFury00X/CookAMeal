'use strict';

const router = require('express').Router(),
    AdminController = require('../../Application/Controllers-Services/Controllers/admin-controller');
const RequestMethods = require('../../Configurations/middlewares/request-checker');

const AdminRoutes = function (passport) {
    router.post('/category', RequestMethods.CheckContentType.ApplicationFormData, AdminController.Category.Add);
    
    return router;
};

module.exports = AdminRoutes;