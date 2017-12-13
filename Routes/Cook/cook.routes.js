'use strict';

const router = require('express').Router();
const CookController = require('../../Application/Controllers-Services/Controllers/cook.controller');
const RequestMethods = require("../../Configurations/middlewares/request-checker");
const FileUploader = require('../../Configurations/Helpers/file-upload-multer');
const CommonController = require("../../Application/Controllers-Services/Controllers/common.controller");
const {ValidateParams, ValidateBody} = require('../../Configurations/middlewares/validation'),
    {ParamSchemas, BodySchemas} = require('../../Application/Schemas/schema');

//1: Get All Category list
router.get('/user',
    CommonController.User.GetprofileDetails);

//2: Get All Recipe list By Sub Category
router.get('/GetAllRecipeBySubCategory',
    CookController.Recipe.GetAllRecipeBySubCategory);

//3: Get All Recipe list By Sub Category
router.get('/GetAllRecipeBySubCategory/:id',
    ValidateParams(ParamSchemas.idSchema, 'id'),
    CookController.Recipe.GetAllRecipeBySubCategoryById);

//4: Add Recipe
router.post('/recipe',
    RequestMethods.CheckContentType.ApplicationFormData,
    FileUploader.uploadDataFiles,
    ValidateBody(BodySchemas.Recipe),
    CookController.Recipe.Add);

router.post('/favorite',
    RequestMethods.CheckContentType.ApplicationJsonData,
    CookController.Recipe.MarkFavorite);

router.get('/favorite',
    CookController.Recipe.GetMarkedFavoriteList);


module.exports = router;