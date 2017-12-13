'use strict';

const router = require('express').Router(),
    CommonController = require('../../Application/Controllers-Services/Controllers/common.controller'),
    {ValidateParams, ValidateBody} = require('../../Configurations/middlewares/validation'),
    {ParamSchemas, BodySchemas} = require('../../Application/Schemas/schema');

//1: Get All Category list
router.get('/category',
    CommonController.Category.GetAll);

//2: Get All Category by Id
router.get('/category/:id',
    CommonController.Category.FindById);

//3: Get All Sub-Category list
router.get('/subcategory',
    CommonController.SubCategory.GetAll);

//1: Get All Allergies list
router.get('/allergy',
    CommonController.Allergy.GetAll);

//1: Get All Allergies list
router.get('/unit',
    CommonController.Units.GetAll);

//1: Get All Recipe details by Id
router.get('/category/:id/sub-category/recipe-list',
    ValidateParams(ParamSchemas.idSchema, 'id'),
    CommonController.Category.GetAllRecipeByCategoryId);

//1: Get All Recipe details by Id
router.get('/category/:catid/sub-category/:subid/recipe-list',
    ValidateParams(ParamSchemas.idSchema, 'catid'),
    ValidateParams(ParamSchemas.idSchema, 'subid'),
    CommonController.Recipe.GetRecipeListByCategoryAndSubCategoryIds);

//1: Get All Recipe details by Id
router.get('/recipe/:id',
    ValidateParams(ParamSchemas.idSchema, 'id'),
    CommonController.Recipe.GetRecipeById);

// Get Cook profile
router.get('/cook-profile/:id',
    ValidateParams(ParamSchemas.idSchema, 'id'),
    CommonController.User.GetCookprofile);

module.exports = router;