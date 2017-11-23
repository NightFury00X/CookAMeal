'use strict';

const router = require('express').Router(),
    AdminController = require('../../Application/Controllers-Services/Controllers/admin-controller');

const AdminRoutes = function (passport) {
    
    router.post('/category', AdminController.Category.Add);
    
    return router;
};

module.exports = AdminRoutes;