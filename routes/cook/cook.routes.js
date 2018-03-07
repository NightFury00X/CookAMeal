'use strict'

const router = require('express').Router()
const CookController = require('../../application/controllers-services/controllers/cook.controller')
const FileUploader = require('../../configurations/helpers/file-upload-multer')
const {ValidateParams, ValidateBody} = require('../../configurations/middlewares/validation')
const {ParamSchemas, BodySchemas} = require('../../application/schemas/schema')
const {
    RequestMethodsMiddlewares
} = require('../../configurations/middlewares/middlewares')

router.get('/GetAllRecipeBySubCategory',
    CookController.Recipe.GetAllRecipeBySubCategory)

router.get('/GetAllRecipeBySubCategory/:id',
    ValidateParams(ParamSchemas.idSchema, 'id'),
    CookController.Recipe.GetAllRecipeBySubCategoryById)

router.post('/recipe',
    RequestMethodsMiddlewares.ApplicationFormData,
    FileUploader.uploadDataFiles,
    ValidateBody(BodySchemas.Recipe),
    CookController.Recipe.Add)

router.get('/recipe/my-recipes',
    CookController.Recipe.GetAllRecipesList)

router.get('/order/current-orders',
    CookController.Order.CurrentOrders)

router.post('/certificate',
    FileUploader.UploadCertificate,
    CookController.Certificate.Update)

module.exports = router
