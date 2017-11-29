'use strict';

const router = require('express').Router(),
    AdminController = require('../../Application/Controllers-Services/Controllers/admin-controller');
const RequestMethods = require('../../Configurations/middlewares/request-checker');

//1: Add Category
router.post('/category',
    RequestMethods.CheckContentType.ApplicationFormData,
    AdminController.Category.Add);

module.exports = router;