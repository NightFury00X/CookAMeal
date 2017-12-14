'use strict';

const router = require('express').Router();
const CookController = require('../../Application/Controllers-Services/Controllers/cook.controller');
const FileUploader = require('../../Configurations/Helpers/file-upload-multer');
const {ValidateParams, ValidateBody} = require('../../Configurations/middlewares/validation'),
    {ParamSchemas, BodySchemas} = require('../../Application/Schemas/schema'),
    {
        RequestMethodsMiddlewares,
    } = require('../../Configurations/middlewares/middlewares');

//2: Get All Recipe list By Sub Category
router.get('/GetAllRecipeBySubCategory',
    CookController.Recipe.GetAllRecipeBySubCategory);

//3: Get All Recipe list By Sub Category
router.get('/GetAllRecipeBySubCategory/:id',
    ValidateParams(ParamSchemas.idSchema, 'id'),
    CookController.Recipe.GetAllRecipeBySubCategoryById);

//4: Add Recipe
router.post('/recipe',
    RequestMethodsMiddlewares.ApplicationFormData,
    FileUploader.uploadDataFiles,
    ValidateBody(BodySchemas.Recipe),
    CookController.Recipe.Add);

module.exports = router;