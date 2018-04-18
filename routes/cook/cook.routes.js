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

router.delete('/recipe/:id',
    ValidateParams(ParamSchemas.idSchema, 'id'),
    CookController.Recipe.DeleteRecipe)

router.get('/recipe/my-recipes',
    CookController.Recipe.GetAllRecipesList)

router.get('/order/current-orders',
    CookController.Order.CurrentOrders)

router.post('/certificate',
    RequestMethodsMiddlewares.ApplicationFormData,
    FileUploader.UploadCertificate,
    CookController.Certificate.Update)

router.post('/identificationCard',
    RequestMethodsMiddlewares.ApplicationFormData,
    FileUploader.UploadIdentificationCard,
    CookController.IdentificationCard.Update)

router.post('/availability',
    RequestMethodsMiddlewares.ApplicationJsonData,
    ValidateBody(BodySchemas.AvailabilityDetails),
    CookController.Availability.Add)

router.get('/availability',
    CookController.Availability.CookAvailabilityList)

router.get('/availability/:date',
    ValidateParams(ParamSchemas.idSchema, 'date'),
    CookController.Availability.CookAvailabilityListByDate)

router.put('/accept-order/:orderId',
    ValidateParams(ParamSchemas.idSchema, 'orderId'),
    RequestMethodsMiddlewares.ApplicationJsonData,
    CookController.Availability.AceceptOrder)

router.put('/reject-order/:orderId',
    ValidateParams(ParamSchemas.idSchema, 'orderId'),
    CookController.Availability.RejectOrder)

module.exports = router
