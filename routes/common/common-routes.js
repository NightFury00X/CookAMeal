'use strict'

const router = require('express').Router()
const CommonController = require('../../application/controllers-services/controllers/common.controller')
const {ValidateParams, ValidateBody} = require('../../configurations/middlewares/validation')
const {ParamSchemas, BodySchemas} = require('../../application/schemas/schema')
const {
    RequestMethodsMiddlewares
} = require('../../configurations/middlewares/middlewares')

// 1: Get All Category list
router.get('/category',
    CommonController.Category.GetAll)

// 2: Get All Category by Id
router.get('/category/:id',
    CommonController.Category.FindById)

// 3: Get All Sub-Category list
router.get('/subcategory',
    CommonController.SubCategory.GetAll)

// 1: Get All Allergies list
router.get('/allergy',
    CommonController.Allergy.GetAll)

// 1: Get All Allergies list
router.get('/unit',
    CommonController.Units.GetAll)

// 1: Get All Recipe details by Id
router.get('/category/:id/sub-category/recipe-list',
    ValidateParams(ParamSchemas.idSchema, 'id'),
    CommonController.Category.GetAllRecipeByCategoryId)

// 1: Get All Recipe details by Id
router.get('/category/:catid/sub-category/:subid/recipe-list',
    ValidateParams(ParamSchemas.idSchema, 'catid'),
    ValidateParams(ParamSchemas.idSchema, 'subid'),
    CommonController.Recipe.GetRecipeListByCategoryAndSubCategoryIds)

// 1: Get All Recipe details by Id
router.get('/recipe/:id',
    ValidateParams(ParamSchemas.idSchema, 'id'),
    CommonController.Recipe.GetRecipeById)

// Get cook profile
router.get('/cook-profile/:id',
    ValidateParams(ParamSchemas.idSchema, 'id'),
    CommonController.User.GetCookprofile)

router.post('/favorite/recipe',
    RequestMethodsMiddlewares.ApplicationJsonData,
    ValidateBody(BodySchemas.Favorite),
    CommonController.Recipe.MarkRecipeAsFavorite)

router.get('/favorite/recipe',
    CommonController.Recipe.GetRecipeMarkedFavoriteList)

// router.post('/favorite/profile',
//     RequestMethodsMiddlewares.ApplicationJsonData,
//     ValidateBody(BodySchemas.Favorite),
//     CommonController.Recipe.MarkProfileAsFavorite);

router.post('/review/recipe',
    RequestMethodsMiddlewares.ApplicationJsonData,
    ValidateBody(BodySchemas.RecipeReview),
    CommonController.ReviewDetails.RecipeReview)

router.post('/review/profile',
    RequestMethodsMiddlewares.ApplicationJsonData,
    ValidateBody(BodySchemas.ProfileReview),
    CommonController.ReviewDetails.ProfileReview)

router.get('/review/profile',
    CommonController.User.GetAllReviewsByProfileId)

router.post('/feedback',
    RequestMethodsMiddlewares.ApplicationJsonData,
    ValidateBody(BodySchemas.Feedback),
    CommonController.Feedback.Add)

router.get('/payment-method',
    CommonController.PaymentMethod.GetAll)

router.get('/order/prepare-data/:id',
    ValidateParams(ParamSchemas.idSchema, 'id'),
    CommonController.Order.PrepareData)

// router.post('/order',
//     RequestMethodsMiddlewares.ApplicationJsonData,
//     ValidateBody(BodySchemas.Order),
//     CommonController.Order.MakeOrder)

// 3: checkout order
router.post('/order/check-out',
    RequestMethodsMiddlewares.ApplicationJsonData,
    ValidateBody(BodySchemas.Order),
    CommonController.Order.MakeOrder)

router.get('/geo',
    CommonController.User.geo)

module.exports = router
