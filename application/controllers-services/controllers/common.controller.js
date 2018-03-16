const {ResponseHelpers} = require('../../../configurations/helpers/helper')
const AuthService = require('../services/auth-service')
const CommonService = require('../services/common.service')
const CommonConfig = require('../../../configurations/helpers/common-config')
const MapService = require('../services/map-service')

let User = {
    ChangeProfile: async (req, res, next) => {
        try {
            const {id, facebookId} = req.user
            const {userRole} = req.body
            const result = await CommonService.User.ChangeProfileType(userRole, id, facebookId)
            if (!result) {
                return ResponseHelpers.SetNotFoundResponse(CommonConfig.ERRORS.UNABLE_TO_PROCESS, res)
            }
            return ResponseHelpers.SetSuccessResponse({Message: 'You are successfully logged in.'}, res, CommonConfig.STATUS_CODE.OK)
        } catch (error) {
            next(error)
        }
    },
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
                            if (userId) {
                                const tempFav = await AuthService.Favorite.Recipe.CheckRecipeIsFavoriteByRecipeIdAndUserId(userId, tempRecipeId)
                                cookRecipesToJSON[outer].Recipes[inner].favorite = !!tempFav
                            } else {
                                cookRecipesToJSON[outer].Recipes[inner].favorite = false
                            }
                            const tempRating = await CommonService.Recipe.FindRatingByRecipeId(tempRecipeId)
                            cookRecipesToJSON[outer].Recipes[inner].rating = !tempRating[0].rating ? 0 : tempRating[0].rating
                        }
                    }
                }
            }
            const result = {
                categories: categoryList || null,
                cookProfile: cookProfileDetailsToJSON,
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
            const type = req.value.params.type
            const userId = req.user.id
            const {unit, filter} = req.value.params

            const {lat, long} = req.value.params
            const recipesList = await CommonService.Recipe.FindAllByCategoryId(categoryId, type)
            let convertedJSON = JSON.parse(JSON.stringify(recipesList))
            convertedJSON = convertedJSON.filter(function (item) {
                return item.Recipes.length > 0
            })
            for (const outer in convertedJSON) {
                if (convertedJSON.hasOwnProperty(outer)) {
                    for (const inner in convertedJSON[outer].Recipes) {
                        if (convertedJSON[outer].Recipes.hasOwnProperty(inner)) {
                            const recipeId = convertedJSON[outer].Recipes[inner].id
                            const profileId = convertedJSON[outer].Recipes[inner].profileId
                            if (!convertedJSON[outer].Recipes[inner].RecipesGeoLocation) {
                                convertedJSON[outer].Recipes[inner].map = null
                                continue
                            }
                            const destination = {
                                latitude: convertedJSON[outer].Recipes[inner].RecipesGeoLocation.latitude,
                                longitude: convertedJSON[outer].Recipes[inner].RecipesGeoLocation.longitude
                            }
                            let unitValue = 'metric'
                            if (unit.toLowerCase() === 'unitedstates') {
                                unitValue = 'imperial'
                            }
                            let filterValue = 5
                            if (filter) {
                                filterValue = filter
                            }
                            const map = await MapService.Map.FindGeoDistance(`${lat}, ${long}`, destination, `${unitValue}`, filterValue)
                            if (!map) {
                                convertedJSON[outer].Recipes[inner].map = null
                                continue
                            }
                            convertedJSON[outer].Recipes[inner].map = true
                            const ratingDetails = await CommonService.Recipe.FindRatingByRecipeId(recipeId)
                            const currencyDetails = await CommonService.User.GetCurrencySymbolByProfileId(profileId)
                            if (userId) {
                                const favorite = await AuthService.Favorite.Recipe.CheckRecipeIsFavoriteByRecipeIdAndUserId(userId, recipeId)
                                convertedJSON[outer].Recipes[inner].Favorite = !!favorite
                            } else {
                                convertedJSON[outer].Recipes[inner].Favorite = false
                            }
                            convertedJSON[outer].Recipes[inner].Rating = !ratingDetails[0].rating ? 0 : ratingDetails[0].rating
                            convertedJSON[outer].Recipes[inner].CurrencySymbol = currencyDetails.currencySymbol
                        }
                    }
                }
            }
            convertedJSON = convertedJSON.filter(function (item) {
                // item.Recipes = item.Recipes.filter(function (recipe) {
                //     return recipe.map != null
                // })
                return item.Recipes.length > 0
            })
            return ResponseHelpers.SetSuccessResponse(convertedJSON, res, CommonConfig.STATUS_CODE.OK)
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
            const recipesList = await CommonService.Recipe.FindRecipeByCatIdAndSubIds(categoryId, subCategoryId)
            let convertedJSON = JSON.parse(JSON.stringify(recipesList))
            for (const inner in convertedJSON) {
                if (convertedJSON.hasOwnProperty(inner)) {
                    const recipeId = convertedJSON[inner].id
                    const ratingDetails = await CommonService.Recipe.FindRatingByRecipeId(recipeId)
                    if (userId) {
                        const favorite = await AuthService.Favorite.Recipe.CheckRecipeIsFavoriteByRecipeIdAndUserId(userId, recipeId)
                        convertedJSON[inner].Favorite = !!favorite
                    } else {
                        convertedJSON[inner].Favorite = false
                    }
                    convertedJSON[inner].Rating = !ratingDetails[0].rating ? 0 : ratingDetails[0].rating
                    const profileId = convertedJSON[inner].profileId
                    const currencyDetails = await CommonService.User.GetCurrencySymbolByProfileId(profileId)
                    convertedJSON[inner].CurrencySymbol = currencyDetails.currencySymbol
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
            const recipeDetails = await CommonService.Recipe.FindRecipeById(recipeId)
            if (!recipeDetails && recipeDetails.Recipes.length === 0) {
                return ResponseHelpers.SetNotFoundResponse(CommonConfig.ERRORS.RECIPE.NOT_FOUND, res)
            }
            let recipeDetailsToJSON = JSON.parse(JSON.stringify(recipeDetails.Recipes[0]))
            const rating = await CommonService.Recipe.FindRatingByRecipeId(recipeDetailsToJSON.id)
            recipeDetailsToJSON.rating = !rating[0].rating ? 0 : rating[0].rating
            if (userId) {
                const favorite = await AuthService.Favorite.Recipe.CheckRecipeIsFavoriteByRecipeIdAndUserId(userId, recipeId)
                recipeDetailsToJSON.favorite = !!favorite
            } else {
                recipeDetailsToJSON.favorite = false
            }
            const profileId = recipeDetailsToJSON.profileId
            const profileDetails = await CommonService.User.GetCookProfileDetailsById(profileId)
            const currencyDetails = await CommonService.User.GetCurrencySymbolByProfileId(profileId)
            recipeDetailsToJSON.CurrencySymbol = currencyDetails.currencySymbol
            const cookRecipes = await CommonService.Recipe.FindAllRecipeByCookIdExcludeSelectedRecipe(profileId, recipeId)
            let cookRecipesToJSON = JSON.parse(JSON.stringify(cookRecipes))
            for (const index in cookRecipesToJSON) {
                if (cookRecipesToJSON.hasOwnProperty(index)) {
                    const tempRecipeId = cookRecipesToJSON[index].id
                    if (userId) {
                        const tempFav = await AuthService.Favorite.Recipe.CheckRecipeIsFavoriteByRecipeIdAndUserId(userId, tempRecipeId)
                        cookRecipesToJSON[index].favorite = !!tempFav
                    } else {
                        cookRecipesToJSON[index].favorite = false
                    }
                    const tempRating = await CommonService.Recipe.FindRatingByRecipeId(tempRecipeId)
                    cookRecipesToJSON[index].rating = !tempRating[0].rating ? 0 : tempRating[0].rating
                    const profileId = cookRecipesToJSON[index].profileId
                    const currencyDetails = await CommonService.User.GetCurrencySymbolByProfileId(profileId)
                    cookRecipesToJSON[index].currencySymbol = currencyDetails.currencySymbol
                }
            }
            const similarRecipes = await CommonService.Recipe.FindSimilarRecipesBySubCategoryIdExcludeSelectedCookRecipe(recipeDetailsToJSON.subCategoryId, profileId)
            let similarRecipesToJSON = JSON.parse(JSON.stringify(similarRecipes))
            for (const index in similarRecipesToJSON) {
                if (similarRecipesToJSON.hasOwnProperty(index)) {
                    const tempRecipeId = similarRecipesToJSON[index].id
                    if (userId) {
                        const tempFav = await AuthService.Favorite.Recipe.CheckRecipeIsFavoriteByRecipeIdAndUserId(userId, tempRecipeId)
                        similarRecipesToJSON[index].favorite = !!tempFav
                    } else {
                        similarRecipesToJSON[index].favorite = false
                    }
                    const tempRating = await CommonService.Recipe.FindRatingByRecipeId(tempRecipeId)
                    similarRecipesToJSON[index].rating = !tempRating[0].rating ? 0 : tempRating[0].rating
                    const profileId = similarRecipesToJSON[index].profileId
                    const currencyDetails = await CommonService.User.GetCurrencySymbolByProfileId(profileId)
                    similarRecipesToJSON[index].currencySymbol = currencyDetails.currencySymbol
                }
            }
            const result = {
                recipeDetails: recipeDetailsToJSON,
                profile: profileDetails,
                cookRecipes: cookRecipesToJSON,
                similarRecipes: similarRecipesToJSON
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
    GetAllRecipesByCookId: async (req, res, next) => {
        try {
            const profileId = req.value.params.profileId
            const userId = req.user.id
            const recipesList = await CommonService.Recipe.FindAllByCategoryByProfileId(profileId)
            let convertedJSON = JSON.parse(JSON.stringify(recipesList))
            convertedJSON = convertedJSON.filter(function (item) {
                return item.Recipes.length > 0
            })
            for (const outer in convertedJSON) {
                if (convertedJSON.hasOwnProperty(outer)) {
                    for (const inner in convertedJSON[outer].Recipes) {
                        if (convertedJSON[outer].Recipes.hasOwnProperty(inner)) {
                            const recipeId = convertedJSON[outer].Recipes[inner].id
                            const profileId = convertedJSON[outer].Recipes[inner].profileId
                            const ratingDetails = await CommonService.Recipe.FindRatingByRecipeId(recipeId)
                            const currencyDetails = await CommonService.User.GetCurrencySymbolByProfileId(profileId)
                            if (userId) {
                                const favorite = await AuthService.Favorite.Recipe.CheckRecipeIsFavoriteByRecipeIdAndUserId(userId, recipeId)
                                convertedJSON[outer].Recipes[inner].Favorite = !!favorite
                            } else {
                                convertedJSON[outer].Recipes[inner].Favorite = false
                            }
                            convertedJSON[outer].Recipes[inner].Rating = !ratingDetails[0].rating ? 0 : ratingDetails[0].rating
                            convertedJSON[outer].Recipes[inner].Favorite = !!favorite
                            convertedJSON[outer].Recipes[inner].CurrencySymbol = currencyDetails.currencySymbol
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

const Map = {
    GetAllCookLocationForMap: async (req, res, next) => {
        try {
            const userOrigin = `${req.value.params.latitude}` + ',' + `${req.value.params.longitude}`
            const allCookList = await MapService.Map.FindAllCooksLocationsForMap()
            if (!allCookList) {
                return ResponseHelpers.SetErrorResponse(CommonConfig.ERRORS.INTERNAL_SERVER_ERROR, res)
            }
            const cookProfileDataForMap = []
            for (const profile of allCookList) {
                if (profile.Address) {
                    const destinationData = await MapService.Map.FindGeoDistance(userOrigin, profile.Address)
                    if (destinationData) {
                        cookProfileDataForMap.push({
                            profile: profile,
                            distanceValue: destinationData.distanceValue,
                            distance: destinationData.distance,
                            durationValue: destinationData.durationValue
                        })
                    }
                }
            }
            return ResponseHelpers.SetSuccessResponse(cookProfileDataForMap, res, CommonConfig.STATUS_CODE.OK)
        } catch (error) {
            next(error)
        }
    },
    GetAllCookListForMap: async (req, res, next) => {
        try {
            const cookProfileList = await MapService.Map.FindAllCooksDealsWithCategoryForMap()
            if (!cookProfileList) {
                return ResponseHelpers.SetErrorResponse(CommonConfig.ERRORS.INTERNAL_SERVER_ERROR, res)
            }
            const userId = req.user.id
            let cookProfileListToJSON = JSON.parse(JSON.stringify(cookProfileList))
            cookProfileListToJSON = cookProfileListToJSON.filter(function (item) {
                return item.CooksDealWithCategories.length > 0
            })
            for (const outer in cookProfileListToJSON) {
                if (cookProfileListToJSON.hasOwnProperty(outer)) {
                    for (const inner in cookProfileListToJSON[outer].CooksDealWithCategories) {
                        if (cookProfileListToJSON[outer].CooksDealWithCategories.hasOwnProperty(inner)) {
                            const profileId = cookProfileListToJSON[outer].CooksDealWithCategories[inner].cooksDealWithCategoryId
                            const cookData = await CommonService.User.FindProfileRatingByProfileId(profileId)
                            cookProfileListToJSON[outer].CooksDealWithCategories[inner].Profile.rating = cookData.rating | 0
                            if (userId) {
                                const favorite = await AuthService.Favorite.Profile.CheckProfileIsFavoriteByProfileIdAndUserId(userId, profileId)
                                cookProfileListToJSON[outer].CooksDealWithCategories[inner].Profile.favorite = !!favorite
                            } else {
                                cookProfileListToJSON[outer].CooksDealWithCategories[inner].Profile.favorite = false
                            }
                        }
                    }
                }
            }
            return ResponseHelpers.SetSuccessResponse(cookProfileListToJSON, res, CommonConfig.STATUS_CODE.OK)
        } catch (error) {
            next(error)
        }
    }
}

const CommonController = {
    User: User,
    Category: Category,
    Recipe: Recipe,
    Map: Map
}

module.exports = CommonController
