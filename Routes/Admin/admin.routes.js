'use strict';

const router = require('express').Router(),
    AdminController = require('../../Application/Controllers-Services/Controllers/admin-controller'),
    FileUploader = require("../../Configurations/Helpers/file-upload-multer"),
    {ValidateBody} = require('../../Configurations/middlewares/validation'),
    {BodySchemas} = require('../../Application/Schemas/schema'),
    {
        RequestMethodsMiddlewares,
    } = require('../../Configurations/middlewares/middlewares');

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