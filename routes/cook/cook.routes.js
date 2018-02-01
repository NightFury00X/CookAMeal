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

module.exports = router
