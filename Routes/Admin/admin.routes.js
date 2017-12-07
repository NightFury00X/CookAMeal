'use strict';

const router = require('express').Router(),
    AdminController = require('../../Application/Controllers-Services/Controllers/admin-controller'),
    RequestMethods = require('../../Configurations/middlewares/request-checker'),
    FileUploader = require("../../Configurations/Helpers/file-upload-multer"),
    {ValidateBody} = require('../../Configurations/middlewares/validation'),
    {BodySchemas} = require('../../Application/Schemas/schema');

//1: Add Category
router.post('/category',
    RequestMethods.CheckContentType.ApplicationFormData,
    FileUploader.uploadFile,
    AdminController.Category.Add);

//2: Add Sub Category
router.post('/subcategory',
    RequestMethods.CheckContentType.ApplicationJsonData,
    AdminController.SubCategory.Add);

//3: Add Allergy
router.post('/allergy',
    RequestMethods.CheckContentType.ApplicationJsonData,
    AdminController.Allergy.Add);


//3: Add Units
router.post('/unit',
    RequestMethods.CheckContentType.ApplicationJsonData,
    ValidateBody(BodySchemas.Unit),
    AdminController.Units.Add);

module.exports = router;