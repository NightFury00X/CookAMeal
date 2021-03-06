'use strict'

const router = require('express').Router()
const AdminController = require('../../application/controllers-services/controllers/admin.controller')
const FileUploader = require('../../configurations/helpers/file-upload-multer')
const {ValidateBody} = require('../../configurations/middlewares/validation')
const {BodySchemas} = require('../../application/schemas/schema')
const {RequestMethodsMiddlewares} = require('../../configurations/middlewares/middlewares')

// 1: Add Category
router.post('/category',
    RequestMethodsMiddlewares.ApplicationFormData,
    FileUploader.uploadFile,
    AdminController.Category.Add)

// 2: Add Sub Category
router.post('/subcategory',
    RequestMethodsMiddlewares.ApplicationJsonData,
    AdminController.SubCategory.Add)

// 3: Add Allergy
router.post('/allergy',
    RequestMethodsMiddlewares.ApplicationJsonData,
    AdminController.Allergy.Add)

// 3: Add Units
router.post('/unit',
    RequestMethodsMiddlewares.ApplicationJsonData,
    ValidateBody(BodySchemas.Unit),
    AdminController.Units.Add)

router.post('/tax',
    RequestMethodsMiddlewares.ApplicationJsonData,
    ValidateBody(BodySchemas.Tax),
    AdminController.Tax.Add)

module.exports = router
