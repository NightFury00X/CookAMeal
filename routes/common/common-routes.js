'use strict'

const router = require('express').Router()
const CommonController = require('../../application/controllers-services/controllers/common.controller')
const AuthController = require('../../application/controllers-services/controllers/auth.controller')
const {ValidateParams, ValidateBody} = require('../../configurations/middlewares/validation')
const {ParamSchemas, BodySchemas} = require('../../application/schemas/schema')
const {
    RequestMethodsMiddlewares
} = require('../../configurations/middlewares/middlewares')

router.post('/profile/change-profile',
    RequestMethodsMiddlewares.ApplicationJsonData,
    ValidateBody(BodySchemas.ChangeProfile),
    CommonController.User.ChangeProfile)

// 1. Get all category for dashboard
router.get('/category',
    CommonController.Category.GetAll)

// 6. Get all recipies list categorised by sub-category by category id
router.get('/category/:id/sub-category/recipe-list/:type/lat/:lat/long/:long/unit/:unit/filter/:filter',
    ValidateParams(ParamSchemas.idSchema, 'id'),
    ValidateParams(ParamSchemas.idSchema, 'type'),
    ValidateParams(ParamSchemas.idSchema, 'lat'),
    ValidateParams(ParamSchemas.idSchema, 'long'),
    ValidateParams(ParamSchemas.idSchema, 'unit'),
    ValidateParams(ParamSchemas.idSchema, 'filter'),
    CommonController.Category.GetAllRecipeByCategoryId)

// 7. Get all recipies list by category id and sub-category id
router.get('/category/:catid/sub-category/:subid/recipe-list',
    ValidateParams(ParamSchemas.idSchema, 'catid'),
    ValidateParams(ParamSchemas.idSchema, 'subid'),
    // ValidateParams(ParamSchemas.idSchema, 'lat'),
    // ValidateParams(ParamSchemas.idSchema, 'long'),
    // ValidateParams(ParamSchemas.idSchema, 'unit'),
    // ValidateParams(ParamSchemas.idSchema, 'filter'),
    CommonController.Recipe.GetRecipeListByCategoryAndSubCategoryIds)

// 8. Get recipe details by recipe id
router.get('/recipe/:id/lat/:lat/long/:long/unit/:unit/filter/:filter',
    ValidateParams(ParamSchemas.idSchema, 'id'),
    ValidateParams(ParamSchemas.idSchema, 'lat'),
    ValidateParams(ParamSchemas.idSchema, 'long'),
    ValidateParams(ParamSchemas.idSchema, 'unit'),
    ValidateParams(ParamSchemas.idSchema, 'filter'),
    CommonController.Recipe.GetRecipeById)

// 8. Get recipe details by recipe id
router.get('/recipe/:id/lat/:lat/long/:long/unit/:unit/filter/:filter/cart-item/:cartId',
    ValidateParams(ParamSchemas.idSchema, 'id'),
    ValidateParams(ParamSchemas.idSchema, 'lat'),
    ValidateParams(ParamSchemas.idSchema, 'long'),
    ValidateParams(ParamSchemas.idSchema, 'unit'),
    ValidateParams(ParamSchemas.idSchema, 'cartId'),
    ValidateParams(ParamSchemas.idSchema, 'filter'),
    CommonController.Recipe.GetRecipeByCartItemId)

// 9. Get cook-profile by profile id
router.get('/cook-profile/:id',
    ValidateParams(ParamSchemas.idSchema, 'id'),
    CommonController.User.GetCookprofile)

router.get('/map/lat/:latitude/long/:longitude',
    ValidateParams(ParamSchemas.idSchema, 'latitude'),
    ValidateParams(ParamSchemas.idSchema, 'longitude'),
    CommonController.Map.GetAllCookLocationForMap)

router.get('/map/category-wise-cook-details',
    CommonController.Map.GetAllCookListForMap)

router.get('/profile/:profileId/sub-categories/recipes',
    ValidateParams(ParamSchemas.idSchema, 'profileId'),
    CommonController.Recipe.GetAllRecipesByCookId)

router.get('/order/prepare-data/:id',
    ValidateParams(ParamSchemas.idSchema, 'id'),
    AuthController.Order.PrepareData)

router.get('/order/order-summary/cart/:cookId',
    ValidateParams(ParamSchemas.idSchema, 'cookId'),
    CommonController.Order.GetOrderSummaryDetailsByCookId)

router.get('/order/order-summary/:id',
    ValidateParams(ParamSchemas.idSchema, 'id'),
    CommonController.Order.GetOrderSummaryDetailsByRecipeId)

router.get('/order/client-token/:orderType/:id',
    ValidateParams(ParamSchemas.idSchema, 'orderType'),
    ValidateParams(ParamSchemas.idSchema, 'id'),
    AuthController.Order.GetClientToken)

// router.post('/order/create-purchase-cart',
//     RequestMethodsMiddlewares.ApplicationJsonData,
//     AuthController.Order.CreatePurchaseOrderForCart)
//
// router.post('/order/create-purchase-recipe',
//     RequestMethodsMiddlewares.ApplicationJsonData,
//     AuthController.Order.CreatePurchaseOrderForRecipe)

module.exports = router
