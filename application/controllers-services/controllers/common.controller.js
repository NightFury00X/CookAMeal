const {ResponseHelpers} = require('../../../configurations/helpers/helper')
const CommonService = require('../services/common.service')
const CookService = require('../services/cook.service')
const CommonConfig = require('../../../configurations/helpers/common-config')
const GeoLOcation = require('../../../configurations/helpers/geo-location-helper')
const braintree = require('braintree')
const config = require('../../../configurations/main')

let User = {
    GetCookprofile: async (req, res, next) => {
        try {
            const userId = req.user.id
            const profileId = req.value.params.id
            const cookProfileDetails = await CommonService.User.GetCookProfileDetailsById(profileId)
            const profileReview = await CommonService.User.FindProfileRatingByProfileId(profileId)
            const cookDealWithCategories = await CommonService.User.FindCookAllCategoriesByProfileId(profileId)
            let cookDealWithCategoriesToJSON = JSON.parse(JSON.stringify(cookDealWithCategories))
            let categoryList = ''
            for (const outer in cookDealWithCategoriesToJSON) {
                if (cookDealWithCategoriesToJSON.hasOwnProperty(outer)) {
                    categoryList += cookDealWithCategoriesToJSON[outer].name + ', '
                }
            }
            categoryList = categoryList.substr(0, categoryList.length - 2)
            let cookProfileDetailsToJSON = JSON.parse(JSON.stringify(cookProfileDetails))
            cookProfileDetailsToJSON.rating = !profileReview[0].rating ? 0 : profileReview[0].rating
            const cookRecipesDetails = await CommonService.Recipe.FindAllRecipeByProfileId(profileId)
            let cookRecipesToJSON = JSON.parse(JSON.stringify(cookRecipesDetails))
            for (const outer in cookRecipesToJSON) {
                if (cookRecipesToJSON.hasOwnProperty(outer)) {
                    for (const inner in cookRecipesToJSON[outer].Recipes) {
                        if (cookRecipesToJSON[outer].Recipes.hasOwnProperty(inner)) {
                            const tempRecipeId = cookRecipesToJSON[outer].Recipes[inner].id
                            const tempFav = await CommonService.Recipe.CheckRecipeIsFavoriteByRecipeIdAndUserId(userId, tempRecipeId)
                            const tempRating = await CommonService.Recipe.FindRatingByRecipeId(tempRecipeId)
                            cookRecipesToJSON[outer].Recipes[inner].favorite = !!tempFav
                            cookRecipesToJSON[outer].Recipes[inner].rating = !tempRating[0].rating ? 0 : tempRating[0].rating
                        }
                    }
                }
            }
            const result = {
                categories: categoryList || null,
                cook_profile: cookProfileDetailsToJSON,
                recipes: cookRecipesToJSON
            }
            return ResponseHelpers.SetSuccessResponse(result, res, CommonConfig.STATUS_CODE.OK)
        } catch (error) {
            next(error)
        }
    },
    GetAllReviewsByProfileId: async (req, res, next) => {
        try {
            const userId = req.user.id
            const profile = await CommonService.User.GetProfileIdByUserTypeId(userId)
            const result = await CommonService.User.FindAllReviewsByProfileId(profile.id)
            return ResponseHelpers.SetSuccessResponse(result, res, CommonConfig.STATUS_CODE.OK)
        } catch (error) {
            next(error)
        }
    },
    geo: async (req, res, next) => {
        try {
            const data = {
                address: 'cynoteck dehradun',
                state: 'uttarakhand',
                city: 'dehradun',
                zipCode: '248001'
            }
            const result = await await GeoLOcation.geocoder.geocode(`${data.address}, ${data.state}, ${data.city} ${data.zipCode}`)
            return ResponseHelpers.SetSuccessResponse(result, res, CommonConfig.STATUS_CODE.OK)
        } catch (error) {
            next(error)
        }
    }
}

let Category = {
    GetAll: async (req, res, next) => {
        try {
            let result = await CommonService.GetCategories()
            return ResponseHelpers.SetSuccessResponse(result, res, CommonConfig.STATUS_CODE.OK)
        } catch (error) {
            next(error)
        }
    },
    FindById: async (req, res, next) => {
        try {
            if (!req.params.id) {
                return ResponseHelpers.SetNotFoundResponse(CommonConfig.ERRORS.CATEGORY.NOT_FOUND, res)
            }
            const catId = req.params.id
            const result = await CommonService.GetCategoryById(catId)
            return ResponseHelpers.SetSuccessResponse(result, res, CommonConfig.STATUS_CODE.OK)
        } catch (error) {
            next(error)
        }
    },
    GetAllRecipeByCategoryId: async (req, res, next) => {
        try {
            const categoryId = req.value.params.id
            const userId = req.user.id
            const result = await CommonService.Recipe.FindAllByCategoryId(categoryId)

            let convertedJSON = JSON.parse(JSON.stringify(result))
            for (const outer in convertedJSON) {
                if (convertedJSON.hasOwnProperty(outer)) {
                    for (const inner in convertedJSON[outer].Recipes) {
                        if (convertedJSON[outer].Recipes.hasOwnProperty(inner)) {
                            const recipeId = convertedJSON[outer].Recipes[inner].id
                            const ratingDetails = await CommonService.Recipe.FindRatingByRecipeId(recipeId)
                            const favorite = await CommonService.Recipe.CheckRecipeIsFavoriteByRecipeIdAndUserId(userId, recipeId)
                            convertedJSON[outer].Recipes[inner].Rating = !ratingDetails[0].rating ? 0 : ratingDetails[0].rating
                            convertedJSON[outer].Recipes[inner].Favorite = !!favorite
                        }
                    }
                }
            }
            return ResponseHelpers.SetSuccessResponse(convertedJSON, res, CommonConfig.STATUS_CODE.OK)
        } catch (error) {
            next(error)
        }
    }
}

let SubCategory = {
    GetAll: async (req, res, next) => {
        try {
            const result = await CommonService.SubCategory.GettAll()
            return ResponseHelpers.SetSuccessResponse(result, res, CommonConfig.STATUS_CODE.OK)
        } catch (error) {
            next(error)
        }
    },
    FindById: async (req, res, next) => {
        try {
            if (!req.params.id) {
                return ResponseHelpers.SetNotFoundResponse(CommonConfig.ERRORS.SUB_CATEGORY.NOT_FOUND, res)
            }
            const catId = req.params.id
            const result = await CommonService.GetCategoryById(catId)
            return ResponseHelpers.SetSuccessResponse(result, res, CommonConfig.STATUS_CODE.OK)
        } catch (error) {
            next(error)
        }
    }
}

let Allergy = {
    GetAll: async (req, res, next) => {
        try {
            const result = await CommonService.Allergy.GettAll()
            return ResponseHelpers.SetSuccessResponse(result, res, CommonConfig.STATUS_CODE.OK)
        } catch (error) {
            next(error)
        }
    },
    FindById: async (req, res, next) => {
        try {
            if (!req.params.id) {
                return ResponseHelpers.SetNotFoundResponse(CommonConfig.ERRORS.ALLERGY.NOT_FOUND, res)
            }
            const catId = req.params.id
            const result = await CommonService.GetCategoryById(catId)
            return ResponseHelpers.SetSuccessResponse(result, res, CommonConfig.STATUS_CODE.OK)
        } catch (error) {
            next(error)
        }
    }
}

let Units = {
    GetAll: async (req, res, next) => {
        try {
            const result = await CommonService.Units.GettAll()
            return ResponseHelpers.SetSuccessResponse(result, res, CommonConfig.STATUS_CODE.OK)
        } catch (error) {
            next(error)
        }
    },
    FindById: async (req, res, next) => {
        try {
            if (!req.params.id) {
                return ResponseHelpers.SetNotFoundResponse(CommonConfig.ERRORS.UNIT.NOT_FOUND, res)
            }
            const catId = req.params.id
            const result = await CommonService.GetCategoryById(catId)
            return ResponseHelpers.SetSuccessResponse(result, res, CommonConfig.STATUS_CODE.OK)
        } catch (error) {
            next(error)
        }
    }
}

let PaymentMethod = {
    GetAll: async (req, res, next) => {
        try {
            let result = await CommonService.PaymentMethod.GettAll()
            return ResponseHelpers.SetSuccessResponse(result, res, CommonConfig.STATUS_CODE.OK)
        } catch (error) {
            next(error)
        }
    }
}

const Recipe = {
    GetRecipeListByCategoryAndSubCategoryIds: async (req, res, next) => {
        try {
            const userId = req.user.id
            const categoryId = req.value.params.catid
            const subCategoryId = req.value.params.subid
            const subCategoryDetails = await CommonService.SubCategory.FindById(subCategoryId)
            const result = await CommonService.Recipe.FindRecipeByCatIdAndSubIds(categoryId, subCategoryId)
            let convertedJSON = JSON.parse(JSON.stringify(result))
            for (const inner in convertedJSON) {
                if (convertedJSON.hasOwnProperty(inner)) {
                    const recipeId = convertedJSON[inner].id
                    const ratingDetails = await CommonService.Recipe.FindRatingByRecipeId(recipeId)
                    const favorite = await CommonService.Recipe.CheckRecipeIsFavoriteByRecipeIdAndUserId(userId, recipeId)
                    convertedJSON[inner].Rating = !ratingDetails[0].rating ? 0 : ratingDetails[0].rating
                    convertedJSON[inner].Favorite = !!favorite
                }
            }
            let results = {
                sub_category: subCategoryDetails,
                recipes: convertedJSON
            }
            return ResponseHelpers.SetSuccessResponse(results, res, CommonConfig.STATUS_CODE.OK)
        } catch (error) {
            next(error)
        }
    },
    GetRecipeById: async (req, res, next) => {
        try {
            const userId = req.user.id
            const recipeId = req.value.params.id
            const profile = await CommonService.User.GetProfileIdByUserTypeId(userId)
            const recipeDetails = await CommonService.Recipe.FindRecipeById(recipeId)
            if (!recipeDetails) {
                return ResponseHelpers.SetNotFoundResponse(CommonConfig.ERRORS.RECIPE.NOT_FOUND, res)
            }
            const rating = await CommonService.Recipe.FindRatingByRecipeId(recipeId)
            const cookRecipes = await CommonService.Recipe.FindAllRecipeByCookIdExcludeSelectedRecipe(profile.id, recipeId)
            let cookRecipesToJSON = JSON.parse(JSON.stringify(cookRecipes))
            for (const index in cookRecipesToJSON) {
                if (cookRecipesToJSON.hasOwnProperty(index)) {
                    const tempRecipeId = cookRecipesToJSON[index].id
                    const tempFav = await CommonService.Recipe.CheckRecipeIsFavoriteByRecipeIdAndUserId(userId, tempRecipeId)
                    const tempRating = await CommonService.Recipe.FindRatingByRecipeId(tempRecipeId)
                    cookRecipesToJSON[index].favorite = !!tempFav
                    cookRecipesToJSON[index].rating = !tempRating[0].rating ? 0 : tempRating[0].rating
                }
            }
            const similarRecipes = await CommonService.Recipe.FindSimilarRecipesBySubCategoryIdExcludeSelectedCookRecipe(recipeDetails.Recipes[0].sub_category_id, profile.id)
            let similarRecipesToJSON = JSON.parse(JSON.stringify(similarRecipes))
            for (const index in similarRecipesToJSON) {
                if (similarRecipesToJSON.hasOwnProperty(index)) {
                    const tempRecipeId = similarRecipesToJSON[index].id
                    const tempFav = await CommonService.Recipe.CheckRecipeIsFavoriteByRecipeIdAndUserId(userId, tempRecipeId)
                    const tempRating = await CommonService.Recipe.FindRatingByRecipeId(tempRecipeId)
                    similarRecipesToJSON[index].favorite = !!tempFav
                    similarRecipesToJSON[index].rating = !tempRating[0].rating ? 0 : tempRating[0].rating
                }
            }
            const favorite = await CommonService.Recipe.CheckRecipeIsFavoriteByRecipeIdAndUserId(userId, recipeId)
            const result = {
                recipe_details: recipeDetails,
                rating: !rating[0].rating ? 0 : rating[0].rating,
                favorite: !!favorite,
                cook_recipes: cookRecipesToJSON,
                similar_recipes: similarRecipesToJSON
            }
            return ResponseHelpers.SetSuccessResponse(result, res, CommonConfig.STATUS_CODE.OK)
        } catch (error) {
            next(error)
        }
    },
    GetAllRecipeByCategoryId: async (req, res, next) => {
        try {
            let categoryId = req.value.params.id
            const result = await CommonService.Recipe.FindAllByCategoryId(categoryId)
            return ResponseHelpers.SetSuccessResponse(result, res, CommonConfig.STATUS_CODE.OK)
        } catch (error) {
            next(error)
        }
    },
    MarkRecipeAsFavorite: async (req, res, next) => {
        try {
            const userId = req.user.id
            const favorite = {
                user_type_id: userId,
                recipe_id: req.body.recipe_id
            }
            const recipe = await CommonService.Recipe.FindRecipeIsExist(favorite.recipe_id)
            if (!recipe) {
                return ResponseHelpers.SetNotFoundResponse(CommonConfig.ERRORS.RECIPE.NOT_FOUND, res)
            }
            const isFavorite = await CommonService.Recipe.CheckRecipeIsFavoriteByRecipeIdAndUserId(favorite.user_type_id, favorite.recipe_id)
            const flag = !!isFavorite
            await CommonService.Recipe.MarkFavorite(favorite, flag)
            const msg = !flag ? CommonConfig.ERRORS.RECIPE.MARKED : CommonConfig.ERRORS.RECIPE.UNMARKED
            return ResponseHelpers.SetSuccessResponse({
                Message: msg,
                favorite: !flag
            }, res, CommonConfig.STATUS_CODE.CREATED)
        } catch (error) {
            next(error)
        }
    },
    GetRecipeMarkedFavoriteList: async (req, res, next) => {
        try {
            const userId = req.user.id
            const result = await CommonService.Recipe.GetFavoriteRecipeListByUserId(userId)
            return ResponseHelpers.SetSuccessResponse({Message: result}, res, CommonConfig.STATUS_CODE.OK)
        } catch (error) {
            next(error)
        }
    }
}

const ReviewDetails = {
    RecipeReview: async (req, res, next) => {
        try {
            const userId = req.user.id
            const review = {
                recipe_id: req.body.recipe_id,
                rating: req.body.rating,
                comments: req.body.comments,
                user_type_id: userId
            }
            const isExist = await CommonService.Review.CheckRecipeId(review.recipe_id)
            if (!isExist) {
                return ResponseHelpers.SetErrorResponse(CommonConfig.ERRORS.REVIEW.FAILURE, res)
            }
            const result = await CommonService.Review.Recipe(review)
            if (!result) {
                return ResponseHelpers.SetErrorResponse(CommonConfig.ERRORS.REVIEW.FAILURE, res)
            }
            return ResponseHelpers.SetSuccessResponse({Message: CommonConfig.ERRORS.REVIEW.SUCCESS}, res, CommonConfig.STATUS_CODE.CREATED)
        } catch (error) {
            next(error)
        }
    },
    ProfileReview: async (req, res, next) => {
        try {
            const userId = req.user.id
            const review = {
                profile_id: req.body.profile_id,
                rating: req.body.rating,
                comments: req.body.comments,
                user_type_id: userId
            }

            const isExist = await CommonService.Review.CheckUserId(review.profile_id)
            if (!isExist) {
                return ResponseHelpers.SetErrorResponse(CommonConfig.ERRORS.REVIEW.FAILURE, res)
            }

            const result = await CommonService.Review.Profile(review)
            if (!result) {
                return ResponseHelpers.SetErrorResponse(CommonConfig.ERRORS.REVIEW.FAILURE, res)
            }
            return ResponseHelpers.SetSuccessResponse({Message: CommonConfig.ERRORS.REVIEW.SUCCESS}, res, CommonConfig.STATUS_CODE.CREATED)
        } catch (error) {
            next(error)
        }
    }
}

const Feedback = {
    Add: async (req, res, next) => {
        try {
            const userId = req.user.id
            let feedback = req.body
            feedback.user_type_id = userId
            let result = await CommonService.Feedback.Add(feedback)
            if (!result) {
                return ResponseHelpers.SetErrorResponse(CommonConfig.ERRORS.FEEDBACK.FAILURE, res)
            }
            return ResponseHelpers.SetSuccessResponse({Message: CommonConfig.ERRORS.FEEDBACK.SUCCESS}, res, CommonConfig.STATUS_CODE.CREATED)
        } catch (error) {
            next(error)
        }
    }
}

let Order = {
    PrepareData: async (req, res, next) => {
        try {
            let gateway = braintree.connect({
                environment: braintree.Environment.Sandbox,
                merchantId: config.braintree.merchantId,
                publicKey: config.braintree.publicKey,
                privateKey: config.braintree.privateKey
            })
            const clientToken = await gateway.clientToken.generate({}, function (err, response) {
                if (err) {
                    console.log('error: ', err)
                }
                console.log('response: ', response)
            })
            const recipeId = req.value.params.id
            const paymentMethods = await CommonService.PaymentMethod.GettAll()
            const recipeData = await CookService.Recipe.GetDeliveryFeesByRecipeId(recipeId)
            const currencySymbol = await CommonService.User.GetCurrencySymbolByProfileId(recipeData.profile_id)
            const prepareData = {
                ClientToken: clientToken.clientToken,
                PaymentMethods: paymentMethods,
                RecipeDetails: {
                    costPerServing: parseFloat(recipeData.cost_per_serving),
                    availableServings: parseFloat(recipeData.available_servings),
                    deliveryFees: parseFloat(recipeData.delivery_fee),
                    currencySymbol: currencySymbol.currency_symbol
                },
                Tax: parseFloat(5)
            }
            return ResponseHelpers.SetSuccessResponse(prepareData, res, CommonConfig.STATUS_CODE.OK)
        } catch (error) {
            next(error)
        }
    },
    // MakeOrder1: async (req, res, next) => {
    //     try {
    //         const userId = req.user.id
    //         let orderDetails = req.body
    //         let recipesToJson = JSON.parse(JSON.stringify(orderDetails.recipes))
    //         orderDetails.user_type_id = userId
    //         const result = await CommonService.Order.PlaceOrder(orderDetails, recipesToJson)
    //         if (!result) {
    //             return ResponseHelpers.SetErrorResponse(CommonConfig.ERRORS.ORDER.FAILURE, res)
    //         }
    //         return ResponseHelpers.SetSuccessResponse({
    //             OrderId: result.id,
    //             Message: CommonConfig.ERRORS.ORDER.SUCCESS
    //         }, res, CommonConfig.STATUS_CODE.CREATED)
    //     } catch (error) {
    //         next(error)
    //     }
    // },
    MakeOrder: async (req, res, next) => {
        try {
            const orderDetails = req.body
            const paymentMethodNonce = orderDetails.paymentMethodNonce
            let data = await CommonService.Order.CheckOut(paymentMethodNonce)
            if (!data) {
                return ResponseHelpers.SetErrorResponse(CommonConfig.ERRORS.ORDER.FAILURE, res)
            }
            const userId = req.user.id
            let recipesToJson = JSON.parse(JSON.stringify(orderDetails.recipes))
            orderDetails.user_type_id = userId
            const result = await CommonService.Order.PlaceOrder(orderDetails, recipesToJson)
            if (!result) {
                return ResponseHelpers.SetErrorResponse(CommonConfig.ERRORS.ORDER.FAILURE, res)
            }
            return ResponseHelpers.SetSuccessResponse({
                Transaction: data,
                result: result,
                Message: CommonConfig.ERRORS.ORDER.SUCCESS
            }, res, CommonConfig.STATUS_CODE.CREATED)
        } catch (error) {
            next(error)
        }
    }
}

let CommonController = {
    User: User,
    Category: Category,
    SubCategory: SubCategory,
    Allergy: Allergy,
    Recipe: Recipe,
    ReviewDetails: ReviewDetails,
    Units: Units,
    PaymentMethod: PaymentMethod,
    Feedback: Feedback,
    Order: Order
}

module.exports = CommonController
