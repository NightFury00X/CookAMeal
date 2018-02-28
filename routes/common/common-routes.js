'use strict'

const router = require('express').Router()
const CommonController = require('../../application/controllers-services/controllers/common.controller')
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
router.get('/category/:type',
    ValidateParams(ParamSchemas.idSchema, 'type'),
    CommonController.Category.GetAll)

// 6. Get all recipies list categorised by sub-category by category id
router.get('/category/:id/sub-category/recipe-list/:type',
    ValidateParams(ParamSchemas.idSchema, 'id'),
    ValidateParams(ParamSchemas.idSchema, 'type'),
    CommonController.Category.GetAllRecipeByCategoryId)

// 7. Get all recipies list by category id and sub-category id
router.get('/category/:catid/sub-category/:subid/recipe-list',
    ValidateParams(ParamSchemas.idSchema, 'catid'),
    ValidateParams(ParamSchemas.idSchema, 'subid'),
    CommonController.Recipe.GetRecipeListByCategoryAndSubCategoryIds)

// 8. Get recipe details by recipe id
router.get('/recipe/:id',
    ValidateParams(ParamSchemas.idSchema, 'id'),
    CommonController.Recipe.GetRecipeById)

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

module.exports = router
