'use strict';

const router = require('express').Router(),
    CommonController = require('../../application/controllers-services/controllers/common.controller'),
    {ValidateParams, ValidateBody} = require('../../configurations/middlewares/validation'),
    {ParamSchemas, BodySchemas} = require('../../application/schemas/schema'),
    {
        RequestMethodsMiddlewares,
    } = require('../../configurations/middlewares/middlewares');

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

// Get cook profile
router.get('/cook-profile/:id',
    ValidateParams(ParamSchemas.idSchema, 'id'),
    CommonController.User.GetCookprofile);

router.post('/favorite/recipe',
    RequestMethodsMiddlewares.ApplicationJsonData,
    ValidateBody(BodySchemas.Favorite),
    CommonController.Recipe.MarkRecipeAsFavorite);

router.get('/favorite/recipe',
    CommonController.Recipe.GetRecipeMarkedFavoriteList);

// router.post('/favorite/profile',
//     RequestMethodsMiddlewares.ApplicationJsonData,
//     ValidateBody(BodySchemas.Favorite),
//     CommonController.Recipe.MarkProfileAsFavorite);

router.post('/review/recipe',
    RequestMethodsMiddlewares.ApplicationJsonData,
    ValidateBody(BodySchemas.RecipeReview),
    CommonController.ReviewDetails.RecipeReview);

router.post('/review/profile',
    RequestMethodsMiddlewares.ApplicationJsonData,
    ValidateBody(BodySchemas.ProfileReview),
    CommonController.ReviewDetails.ProfileReview);

router.get('/review/profile',
    CommonController.User.GetAllReviewsByProfileId);


router.post('/feedback',
    RequestMethodsMiddlewares.ApplicationJsonData,
    ValidateBody(BodySchemas.Feedback),
    CommonController.Feedback.Add);

router.get('/geo',
    CommonController.User.geo);

module.exports = router;