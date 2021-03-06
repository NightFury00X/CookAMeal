'use strict'
const router = require('express').Router()
const FileUploader = require('../../configurations/helpers/file-upload-multer')
const AuthController = require('../../application/controllers-services/controllers/auth.controller')
const {ValidateParams, ValidateBody} = require('../../configurations/middlewares/validation')
const {ParamSchemas, BodySchemas} = require('../../application/schemas/schema')
const {
    RequestMethodsMiddlewares
} = require('../../configurations/middlewares/middlewares')

router.get('/profile',
    AuthController.User.GetUserProfile)

router.post('/logout',
    RequestMethodsMiddlewares.ApplicationJsonData,
    AuthController.Auth.LogOutUser)

router.post('/profile',
    AuthController.User.updateProfile)

router.put('/changepassword',
    RequestMethodsMiddlewares.ApplicationJsonData,
    ValidateBody(BodySchemas.ChangePassword),
    AuthController.Auth.ChangePassword)

// 2. Get category details by category id
router.get('/category/:id',
    AuthController.Category.FindById)

// 3. Get all sub category details
router.get('/subcategory',
    AuthController.SubCategory.GetAll)

// 4. Get all allergies details
router.get('/allergy',
    AuthController.Allergy.GetAll)

// 5. Get all units details
router.get('/unit',
    AuthController.Units.GetAll)

router.post('/profile-cover',
    RequestMethodsMiddlewares.ApplicationFormData,
    FileUploader.UploadProfileCover,
    AuthController.Auth.ProfileCover)

router.post('/profile-cover',
    RequestMethodsMiddlewares.ApplicationFormData,
    FileUploader.UploadProfileCover,
    AuthController.Auth.ProfileCover)

router.post('/profile-image',
    RequestMethodsMiddlewares.ApplicationFormData,
    FileUploader.UploadProfileImage,
    AuthController.Auth.ProfileImage)

router.post('/favorite/recipe',
    RequestMethodsMiddlewares.ApplicationJsonData,
    ValidateBody(BodySchemas.RecipeAsFavorite),
    AuthController.Favorite.Recipe.MarkRecipeAsFavorite)
module.exports = router

router.get('/favorite/recipe',
    AuthController.Favorite.Recipe.GetRecipeMarkedFavoriteList)

router.post('/favorite/profile',
    RequestMethodsMiddlewares.ApplicationJsonData,
    ValidateBody(BodySchemas.ProfileAsFavorite),
    AuthController.Favorite.Profile.MarkProfileAsFavorite)

router.get('/favorite/profile',
    AuthController.Favorite.Profile.GetProfileMarkedFavoriteList)

router.post('/review/recipe',
    RequestMethodsMiddlewares.ApplicationJsonData,
    ValidateBody(BodySchemas.RecipeReview),
    AuthController.ReviewDetails.RecipeReview)

router.post('/review/profile',
    RequestMethodsMiddlewares.ApplicationJsonData,
    ValidateBody(BodySchemas.ProfileReview),
    AuthController.ReviewDetails.ProfileReview)

router.get('/review/profile',
    AuthController.User.GetAllReviewsByProfileId)

router.post('/feedback',
    RequestMethodsMiddlewares.ApplicationJsonData,
    ValidateBody(BodySchemas.Feedback),
    AuthController.Feedback.Add)

router.get('/order/prepare-data/:id',
    ValidateParams(ParamSchemas.idSchema, 'id'),
    AuthController.Order.PrepareData)
//
// router.post('/order/check-out',
//     RequestMethodsMiddlewares.ApplicationJsonData,
//     ValidateBody(BodySchemas.OrderFood),
//     AuthController.Order.MakeOrder)

router.get('/my-order',
    AuthController.Order.GetMyOrders)

router.get('/my-order/:orderId',
    ValidateParams(ParamSchemas.idSchema, 'orderId'),
    AuthController.Order.GetOrderDetailsByOrderId)

router.post('/cart/recipe',
    RequestMethodsMiddlewares.ApplicationJsonData,
    ValidateBody(BodySchemas.AddToCart),
    AuthController.Cart.AddToCartForRecipe)

// router.post('/cart/cook',
//     RequestMethodsMiddlewares.ApplicationJsonData,
//     ValidateBody(BodySchemas.AddToCart),
//     AuthController.Cart.AddToCart)

router.get('/cart/recipe',
    AuthController.Cart.GetRecipeCartDetails)

router.delete('/cart/:itemId',
    ValidateParams(ParamSchemas.idSchema, 'itemId'),
    AuthController.Cart.DeleteCartItem)

router.put('/cart/serve/:itemId',
    ValidateParams(ParamSchemas.idSchema, 'itemId'),
    RequestMethodsMiddlewares.ApplicationJsonData,
    ValidateBody(BodySchemas.ServingData),
    AuthController.Cart.UpdateTotalServing)

router.put('/cart/spice-level/:itemId',
    ValidateParams(ParamSchemas.idSchema, 'itemId'),
    RequestMethodsMiddlewares.ApplicationJsonData,
    ValidateBody(BodySchemas.SpiceLevelData),
    AuthController.Cart.UpdateSpiceLevel)

router.post('/facebook',
    // ValidateBody(BodySchemas.FbCheck),
    AuthController.Facebook.ConenctOrDisconnect)

router.get('/recipe/wishlist',
    AuthController.WishList.GetAll)

router.delete('/recipe/wishlist/:id',
    ValidateParams(ParamSchemas.idSchema, 'id'),
    AuthController.WishList.DeleteFromWishList)

router.get('/delivery-address/current',
    AuthController.Order.GetCurrentDeliveryAddress)

router.post('/delivery-address',
    ValidateBody(BodySchemas.DeliveryAddress),
    AuthController.Order.AddDeliveryAddress)

router.delete('/delivery-address/:address',
    ValidateParams(ParamSchemas.idSchema, 'address'),
    AuthController.Order.DeleteDeliveryAddress)

router.post('/order/create-purchase-cart',
    RequestMethodsMiddlewares.ApplicationJsonData,
    AuthController.Order.CreatePurchaseOrderForCart)

router.post('/order/create-purchase-recipe',
    RequestMethodsMiddlewares.ApplicationJsonData,
    AuthController.Order.CreatePurchaseOrderForRecipe)

router.put('/order/cancel-order/:orderId',
    ValidateParams(ParamSchemas.idSchema, 'orderId'),
    RequestMethodsMiddlewares.ApplicationJsonData,
    AuthController.Order.CancelOrder)

module.exports = router
