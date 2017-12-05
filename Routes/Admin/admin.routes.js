'use strict';

const router = require('express').Router(),
    AdminController = require('../../Application/Controllers-Services/Controllers/admin-controller');
const RequestMethods = require('../../Configurations/middlewares/request-checker');
const FileUploader = require("../../Configurations/Helpers/file-upload-multer");

//1: Add Category
router.post('/category',
    RequestMethods.CheckContentType.ApplicationFormData,
    FileUploader.uploadFile,
    AdminController.Category.Add);

//1: Add SubCategory
router.post('/subcategory',
    RequestMethods.CheckContentType.ApplicationJsonData,
    AdminController.SubCategory.Add);

//1: Add Allergy
router.post('/allergy',
    RequestMethods.CheckContentType.ApplicationJsonData,
    AdminController.Allergy.Add);

module.exports = router;