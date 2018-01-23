'use strict'

const router = require('express').Router()
const CommonController = require('../../application/controllers-services/controllers/common.controller')
const {ValidateParams, ValidateBody} = require('../../configurations/middlewares/validation')
const {ParamSchemas, BodySchemas} = require('../../application/schemas/schema')
const {
    RequestMethodsMiddlewares
} = require('../../configurations/middlewares/middlewares')

router.get('/category',
    CommonController.Category.GetAll)

router.get('/category/:id',
    CommonController.Category.FindById)

router.get('/subcategory',
    CommonController.SubCategory.GetAll)

router.get('/allergy',
    CommonController.Allergy.GetAll)

router.get('/unit',
    CommonController.Units.GetAll)

router.get('/category/:id/sub-category/recipe-list',
    ValidateParams(ParamSchemas.idSchema, 'id'),
    CommonController.Category.GetAllRecipeByCategoryId)

router.get('/category/:catid/sub-category/:subid/recipe-list',
    ValidateParams(ParamSchemas.idSchema, 'catid'),
    ValidateParams(ParamSchemas.idSchema, 'subid'),
    CommonController.Recipe.GetRecipeListByCategoryAndSubCategoryIds)

router.get('/recipe/:id',
    ValidateParams(ParamSchemas.idSchema, 'id'),
    CommonController.Recipe.GetRecipeById)

router.get('/cook-profile/:id',
    ValidateParams(ParamSchemas.idSchema, 'id'),
    CommonController.User.GetCookprofile)

router.post('/favorite/recipe',
    RequestMethodsMiddlewares.ApplicationJsonData,
    ValidateBody(BodySchemas.RecipeAsFavorite),
    CommonController.Favorite.Recipe.MarkRecipeAsFavorite)

router.get('/favorite/recipe',
    CommonController.Favorite.Recipe.GetRecipeMarkedFavoriteList)

router.post('/favorite/profile',
    RequestMethodsMiddlewares.ApplicationJsonData,
    ValidateBody(BodySchemas.ProfileAsFavorite),
    CommonController.Favorite.Profile.MarkProfileAsFavorite)

router.get('/favorite/profile',
    CommonController.Favorite.Profile.GetProfileMarkedFavoriteList)

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

router.get('/order/prepare-data/:id',
    ValidateParams(ParamSchemas.idSchema, 'id'),
    CommonController.Order.PrepareData)

router.post('/order/check-out',
    RequestMethodsMiddlewares.ApplicationJsonData,
    ValidateBody(BodySchemas.OrderFood),
    CommonController.Order.MakeOrder)

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
