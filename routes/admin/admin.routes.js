'use strict';

const router = require('express').Router(),
    AdminController = require('../../application/controllers-services/controllers/admin.controller'),
    FileUploader = require("../../configurations/helpers/file-upload-multer"),
    {ValidateBody} = require('../../configurations/middlewares/validation'),
    {BodySchemas} = require('../../application/schemas/schema'),
    {
        RequestMethodsMiddlewares,
    } = require('../../configurations/middlewares/middlewares');

//1: Add Category
router.post('/category',
    RequestMethodsMiddlewares.ApplicationFormData,
    FileUploader.uploadFile,
    AdminController.Category.Add);

//2: Add Sub Category
router.post('/subcategory',
    RequestMethodsMiddlewares.ApplicationJsonData,
    AdminController.SubCategory.Add);

//3: Add Allergy
router.post('/allergy',
    RequestMethodsMiddlewares.ApplicationJsonData,
    AdminController.Allergy.Add);


//3: Add Units
router.post('/unit',
    RequestMethodsMiddlewares.ApplicationJsonData,
    ValidateBody(BodySchemas.Unit),
    AdminController.Units.Add);

module.exports = router;