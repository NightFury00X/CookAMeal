const {ResponseHelpers} = require('../../../configurations/helpers/helper')
const AuthService = require('../services/auth-service')
const CommonService = require('../services/common.service')
const CookService = require('../services/cook.service')
const CommonConfig = require('../../../configurations/helpers/common-config')
const MapService = require('../services/map-service')
const db = require('../../modals')

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
            let favoriteDetails = await AuthService.Favorite.Profile.CheckProfileIsFavoriteByProfileIdAndUserId(userId, cookProfileDetails.id)
            cookProfileDetailsToJSON.favorite = !!favoriteDetails
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
                            if (!convertedJSON[outer].Recipes[inner].RecipesGeoLocation) {
                                convertedJSON[outer].Recipes[inner].map = false
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
                                convertedJSON[outer].Recipes[inner].map = false
                                continue
                            }

                            const cookId = convertedJSON[outer].Recipes[inner].profileId
                            const cookProfile = await CommonService.User.GetCookDrivingDistanceById(cookId)
                            if (!cookProfile) {
                                convertedJSON[outer].Recipes[inner].map = false
                                continue
                            }

                            if (unitValue === 'metric') {
                                const cookDrivingDistance = cookProfile.drivingDistance * 1000
                                if (cookDrivingDistance < map.distanceValue) {
                                    convertedJSON[outer].Recipes[inner].map = false
                                    continue
                                }
                            } else {
                                const cookDrivingDistance = cookProfile.drivingDistance * 1609.34
                                if (cookDrivingDistance < map.distanceValue) {
                                    convertedJSON[outer].Recipes[inner].map = false
                                    continue
                                }
                            }

                            convertedJSON[outer].Recipes[inner].map = true
                            const ratingDetails = await CommonService.Recipe.FindRatingByRecipeId(recipeId)
                            if (userId) {
                                const favorite = await AuthService.Favorite.Recipe.CheckRecipeIsFavoriteByRecipeIdAndUserId(userId, recipeId)
                                convertedJSON[outer].Recipes[inner].Favorite = !!favorite
                            } else {
                                convertedJSON[outer].Recipes[inner].Favorite = false
                            }
                            convertedJSON[outer].Recipes[inner].Rating = !ratingDetails[0].rating ? 0 : ratingDetails[0].rating
                        }
                    }
                }
            }
            convertedJSON = convertedJSON.filter(function (item) {
                item.Recipes = item.Recipes.filter(function (recipe) {
                    return recipe.map === true
                })
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
            const {unit, filter, lat, long} = req.value.params

            const recipeDetails = await CommonService.Recipe.FindRecipeById(recipeId)
            if (!recipeDetails && recipeDetails.Recipes.length === 0) {
                return ResponseHelpers.SetSuccessErrorResponse({messgae: 'Recipe not found.'}, res, CommonConfig.ERRORS.RECIPE.OK)
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
                }
            }
            const similarRecipes = await CommonService.Recipe.FindSimilarRecipesBySubCategoryIdExcludeSelectedCookRecipe(recipeDetailsToJSON.subCategoryId, profileId)
            let similarRecipesToJSON = JSON.parse(JSON.stringify(similarRecipes))
            for (const index in similarRecipesToJSON) {
                if (similarRecipesToJSON.hasOwnProperty(index)) {
                    const tempRecipeId = similarRecipesToJSON[index].id
                    if (!similarRecipesToJSON[index].RecipesGeoLocation) {
                        similarRecipesToJSON[index].map = false
                        continue
                    }
                    const destination = {
                        latitude: similarRecipesToJSON[index].RecipesGeoLocation.latitude,
                        longitude: similarRecipesToJSON[index].RecipesGeoLocation.longitude
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
                        similarRecipesToJSON[index].map = false
                        continue
                    }

                    const cookId = similarRecipesToJSON[index].profileId
                    const cookProfile = await CommonService.User.GetCookDrivingDistanceById(cookId)
                    if (!cookProfile) {
                        similarRecipesToJSON[index].map = false
                        continue
                    }

                    if (unitValue === 'metric') {
                        const cookDrivingDistance = cookProfile.drivingDistance * 1000
                        if (cookDrivingDistance < map.distanceValue) {
                            similarRecipesToJSON[index].map = false
                            continue
                        }
                    } else {
                        const cookDrivingDistance = cookProfile.drivingDistance * 1609.34
                        if (cookDrivingDistance < map.distanceValue) {
                            similarRecipesToJSON[index].map = false
                            continue
                        }
                    }

                    similarRecipesToJSON[index].map = true

                    if (userId) {
                        const tempFav = await AuthService.Favorite.Recipe.CheckRecipeIsFavoriteByRecipeIdAndUserId(userId, tempRecipeId)
                        similarRecipesToJSON[index].favorite = !!tempFav
                    } else {
                        similarRecipesToJSON[index].favorite = false
                    }
                    const tempRating = await CommonService.Recipe.FindRatingByRecipeId(tempRecipeId)
                    similarRecipesToJSON[index].rating = !tempRating[0].rating ? 0 : tempRating[0].rating
                }
            }

            similarRecipesToJSON = similarRecipesToJSON.filter(function (recipe) {
                return recipe.map === true
            })

            const result = {
                recipeDetails: recipeDetailsToJSON,
                cartItemDetails: null,
                profile: profileDetails,
                cookRecipes: cookRecipesToJSON,
                similarRecipes: similarRecipesToJSON
            }
            return ResponseHelpers.SetSuccessResponse(result, res, CommonConfig.STATUS_CODE.OK)
        } catch (error) {
            next(error)
        }
    },
    GetRecipeByCartItemId: async (req, res, next) => {
        try {
            const userId = req.user.id
            const recipeId = req.value.params.id
            const cartItemId = req.value.params.cartId
            const {unit, filter, lat, long} = req.value.params

            const recipeDetails = await CommonService.Recipe.FindRecipeById(recipeId)
            if (!recipeDetails && recipeDetails.Recipes.length === 0) {
                return ResponseHelpers.SetSuccessErrorResponse({messgae: 'Recipe not found.'}, res, CommonConfig.ERRORS.RECIPE.OK)
            }
            let recipeDetailsToJSON = JSON.parse(JSON.stringify(recipeDetails.Recipes[0]))

            const rating = await CommonService.Recipe.FindRatingByRecipeId(recipeDetailsToJSON.id)
            recipeDetailsToJSON.rating = !rating[0].rating ? 0 : rating[0].rating
            if (userId) {
                const favorite = await AuthService.Favorite.Recipe.CheckRecipeIsFavoriteByRecipeIdAndUserId(userId, recipeId, cartItemId)
                recipeDetailsToJSON.favorite = !!favorite
            } else {
                recipeDetailsToJSON.favorite = false
            }

            let cartItemDetails = await AuthService.Cart.GetCartRecipeItemByRecipeId(recipeId, userId, cartItemId)
            if (cartItemDetails) {
                cartItemDetails = cartItemDetails.CartItems[0]
            }
            const profileId = recipeDetailsToJSON.profileId
            const profileDetails = await CommonService.User.GetCookProfileDetailsById(profileId)
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
                }
            }
            const similarRecipes = await CommonService.Recipe.FindSimilarRecipesBySubCategoryIdExcludeSelectedCookRecipe(recipeDetailsToJSON.subCategoryId, profileId)
            let similarRecipesToJSON = JSON.parse(JSON.stringify(similarRecipes))
            for (const index in similarRecipesToJSON) {
                if (similarRecipesToJSON.hasOwnProperty(index)) {
                    const tempRecipeId = similarRecipesToJSON[index].id
                    if (!similarRecipesToJSON[index].RecipesGeoLocation) {
                        similarRecipesToJSON[index].map = false
                        continue
                    }
                    const destination = {
                        latitude: similarRecipesToJSON[index].RecipesGeoLocation.latitude,
                        longitude: similarRecipesToJSON[index].RecipesGeoLocation.longitude
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
                        similarRecipesToJSON[index].map = false
                        continue
                    }

                    const cookId = similarRecipesToJSON[index].profileId
                    const cookProfile = await CommonService.User.GetCookDrivingDistanceById(cookId)
                    if (!cookProfile) {
                        similarRecipesToJSON[index].map = false
                        continue
                    }

                    if (unitValue === 'metric') {
                        const cookDrivingDistance = cookProfile.drivingDistance * 1000
                        if (cookDrivingDistance < map.distanceValue) {
                            similarRecipesToJSON[index].map = false
                            continue
                        }
                    } else {
                        const cookDrivingDistance = cookProfile.drivingDistance * 1609.34
                        if (cookDrivingDistance < map.distanceValue) {
                            similarRecipesToJSON[index].map = false
                            continue
                        }
                    }

                    similarRecipesToJSON[index].map = true

                    if (userId) {
                        const tempFav = await AuthService.Favorite.Recipe.CheckRecipeIsFavoriteByRecipeIdAndUserId(userId, tempRecipeId)
                        similarRecipesToJSON[index].favorite = !!tempFav
                    } else {
                        similarRecipesToJSON[index].favorite = false
                    }
                    const tempRating = await CommonService.Recipe.FindRatingByRecipeId(tempRecipeId)
                    similarRecipesToJSON[index].rating = !tempRating[0].rating ? 0 : tempRating[0].rating
                }
            }

            similarRecipesToJSON = similarRecipesToJSON.filter(function (recipe) {
                return recipe.map === true
            })

            const result = {
                recipeDetails: recipeDetailsToJSON,
                cartItemDetails: cartItemDetails,
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
                            const ratingDetails = await CommonService.Recipe.FindRatingByRecipeId(recipeId)
                            if (userId) {
                                const favorite = await AuthService.Favorite.Recipe.CheckRecipeIsFavoriteByRecipeIdAndUserId(userId, recipeId)
                                convertedJSON[outer].Recipes[inner].Favorite = !!favorite
                            } else {
                                convertedJSON[outer].Recipes[inner].Favorite = false
                            }
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

let Order = {
    GetOrderSummaryDetailsByCookId: async (req, res, next) => {
        try {
            const {id} = req.user
            const cartDetails = await AuthService.Cart.GetRecipeCartIdFromCartByCreatedBy(id)
            const {cookId} = req.params
            if (!cartDetails) {
                return ResponseHelpers.SetSuccessErrorResponse({messgae: 'Unable to laod cart. Please try again later.'}, res, CommonConfig.STATUS_CODE.OK)
            }
            const cartItemDetails = await AuthService.Cart.GetRecipeCartDetailsByCookId(cartDetails.id, cookId)
            if (!cartItemDetails) {
                return ResponseHelpers.SetSuccessErrorResponse({messgae: 'Unable to laod cart. Please try again later.'}, res, CommonConfig.STATUS_CODE.OK)
            }
            let convertedJSON = JSON.parse(JSON.stringify(cartItemDetails))
            for (let outer in convertedJSON) {
                if (convertedJSON.hasOwnProperty(outer)) {
                    let covertedCartItems = JSON.parse(JSON.stringify(convertedJSON[outer].CartItems))
                    let totalPrice = 0
                    let maxDeliverFees = {
                        cartItemId: null,
                        deliveryfees: 0
                    }
                    const currencyDetails = await CommonService.User.GetCurrencySymbolByProfileId(convertedJSON[outer].id)
                    if (!currencyDetails) {
                        return ResponseHelpers.SetSuccessErrorResponse(null, res, CommonConfig.STATUS_CODE.OK)
                    }
                    for (let inner in covertedCartItems) {
                        if (covertedCartItems.hasOwnProperty(inner)) {
                            const recipeId = covertedCartItems[inner].recipeId
                            const recipeDetails = await CommonService.Recipe.FindRecipeDetailsForCartById(recipeId)
                            const category = await CommonService.GetCategoryById(recipeDetails.categoryId)
                            let convertedRecipe = JSON.parse(JSON.stringify(recipeDetails))
                            convertedRecipe.categoryName = category.name
                            convertedJSON[outer].CartItems[inner].recipeDetails = convertedRecipe
                            totalPrice += parseFloat(covertedCartItems[inner].price)
                            if (parseFloat(convertedJSON[outer].CartItems[inner].recipeDetails.deliveryFee) > maxDeliverFees.deliveryfees) {
                                maxDeliverFees = {
                                    cartItemId: convertedJSON[outer].CartItems[inner].id,
                                    deliveryfees: convertedJSON[outer].CartItems[inner].recipeDetails.deliveryFee
                                }
                            }
                        }
                    }
                    convertedJSON[outer].maxDeliverFees = maxDeliverFees
                    convertedJSON[outer].price = totalPrice
                    convertedJSON[outer].tax = parseFloat(5)
                    convertedJSON[outer].currencySymbol = currencyDetails.currencySymbol
                    convertedJSON[outer].item = convertedJSON[outer].CartItems.length
                }
            }
            return ResponseHelpers.SetSuccessResponse(convertedJSON, res, CommonConfig.STATUS_CODE.OK)
        } catch (error) {
            next(error)
        }
    },
    GetOrderSummaryDetailsByRecipeId: async (req, res, next) => {
        try {
            const recipeId = req.value.params.id
            const recipeData = await CookService.Recipe.GetRecipeDetailsForOrderSummaryByRecipeId(recipeId)
            const {profileId} = recipeData
            const cookProfile = await CommonService.User.GetCookProfileDetailsById(profileId)
            const result = {
                RecipeDetails: {
                    cookProfile: cookProfile,
                    recipeData: recipeData,
                    costPerServing: parseFloat(recipeData.costPerServing),
                    availableServings: parseFloat(recipeData.availableServings),
                    deliveryFees: parseFloat(recipeData.deliveryFee),
                    currencySymbol: recipeData.currencySymbol
                },
                Tax: parseFloat(5)
            }
            return ResponseHelpers.SetSuccessResponse(result, res, CommonConfig.STATUS_CODE.OK)
        } catch (error) {
            next(error)
        }
    },
    CreatePurchaseOrderForGuest: async (req, res, next) => {
        const trans = await db.sequelize.transaction()
        console.log('=================START=====================')
        try {
            const {
                firstName,
                lastName,
                email,
                phoneNumber,
                streetAddress,
                city,
                state,
                zipCode,
                country
            } = req.body

            const {
                nonce,
                chargeAmount,
                recipeId,
                noOfServing,
                spiceLevel,
                paymentType,
                specialInstruction,
                deliveryType,
                pickUpTime
            } = req.body

            console.log('PASSWORD: ', email)

            // const checkUserEmailExist = await CommonService.User.CheckUserEmailIdExistForGuestLogin(email)
            // if (checkUserEmailExist) {
            //     trans.rollback()
            //     return ResponseHelpers.SetSuccessErrorResponse({message: 'Email Id already registered.'}, res, CommonConfig.STATUS_CODE.OK)
            // }

            const password = await CommonService.Keys.GeneratePassword()

            console.log('PASSWORD: ', password)
            const userDetails = await CommonService.Order.GuestOrderFood({
                firstName,
                lastName,
                email,
                password,
                phoneNumber,
                streetAddress,
                city,
                state,
                zipCode,
                country
            }, trans)

            if (!userDetails) {
                trans.rollback()
                return ResponseHelpers.SetSuccessErrorResponse({message: 'Email Id already registered.'}, res, CommonConfig.STATUS_CODE.OK)
            }

            console.log('====================================')
            console.log(JSON.parse(JSON.stringify(userDetails)))
            // const profile = await CommonService.User.GetProfileIdByUserTypeId(userDetails.userType.id,)

            let address = userDetails.addressDetails.id
            let isCurrentAddress = true
            // const currentAddress = await CommonService.User.CheckAddressIsCurrentAddress(id, userDetails.userProfileData.id)
            // if (currentAddress) {
            //     address = currentAddress.id
            //     isCurrentAddress = true
            // } else {
            //     trans.rollback()
            //     return ResponseHelpers.SetSuccessErrorResponse({Message: CommonConfig.ERRORS.ORDER.FAILURE}, res, CommonConfig.STATUS_CODE.OK)
            // }

            const recipeDetails = await CommonService.Recipe.FindRecipeDetailsForCartById(recipeId)
            if (!recipeDetails) {
                trans.rollback()
                return ResponseHelpers.SetSuccessErrorResponse({Message: CommonConfig.ERRORS.ORDER.FAILURE}, res, CommonConfig.STATUS_CODE.OK)
            }

            if (parseInt(recipeDetails.availableServings) < noOfServing) {
                trans.rollback()
                return ResponseHelpers.SetSuccessErrorResponse({Message: CommonConfig.ERRORS.ORDER.OUT_OF_STOCK}, res, CommonConfig.STATUS_CODE.OK)
            }

            // const currencyDetails = await CommonService.User.GetCurrencyCodeProfileId(recipeDetails.profileId)
            // if (!currencyDetails) {
            //     trans.rollback()
            //     return ResponseHelpers.SetSuccessErrorResponse({Message: CommonConfig.ERRORS.ORDER.FAILURE}, res, CommonConfig.STATUS_CODE.OK)
            // }
            const paymentData = {
                nonce: nonce,
                amount: chargeAmount,
                paymentType: paymentType,
                cookId: recipeDetails.profileId,
                currencyCode: userDetails.addressDetails.currencyCode,
                currencySymbol: userDetails.addressDetails.currencySymbol,
                createdBy: userDetails.userType.id
            }

            console.log('====================================')
            console.log(JSON.parse(JSON.stringify(paymentData)))

            const paymentGatewayDetails = await AuthService.Order.CreateAndHoldPayment(paymentData, trans)
            if (!paymentGatewayDetails) {
                trans.rollback()
                return ResponseHelpers.SetSuccessErrorResponse({Message: CommonConfig.ERRORS.ORDER.FAILURE}, res, CommonConfig.STATUS_CODE.OK)
            }
            const taxes = 5

            let totalPrice = parseFloat(recipeDetails.costPerServing) * parseInt(noOfServing)
            let maxDeliveryFees = parseFloat(recipeDetails.deliveryFee)

            const totalCharge = parseFloat((totalPrice * 5 / 100) + totalPrice) + parseFloat((parseInt(deliveryType) === 1 ? 0 : maxDeliveryFees))

            if (parseFloat(chargeAmount) !== totalCharge) {
                trans.rollback()
                return ResponseHelpers.SetSuccessErrorResponse({Message: CommonConfig.ERRORS.ORDER.FAILURE}, res, CommonConfig.STATUS_CODE.OK)
            }

            let orderData = {
                paymentGatwayId: paymentGatewayDetails.id,
                orderType: 'order-food',
                specialInstruction: specialInstruction,
                deliveryType: deliveryType,
                deliveryFee: parseInt(deliveryType) === 1 ? 0 : maxDeliveryFees,
                pickUpTime: pickUpTime,
                taxes: taxes,
                isOrderFromCart: false,
                cookId: recipeDetails.profileId,
                totalAmount: totalCharge,
                isCurrentAddress: isCurrentAddress,
                deliveredToCurrentAddressId: isCurrentAddress ? address : null,
                deliveredToOtherAddressId: !isCurrentAddress ? address : null,
                createdBy: userDetails.userType.id
            }

            const orderItemData = {
                noOfServing: noOfServing,
                costPerServing: recipeDetails.costPerServing,
                spiceLevel: spiceLevel,
                recipeId: recipeId
            }

            const orderDetailsData = await AuthService.Order.PlaceOrderForRecipe(orderData, orderItemData, trans)
            if (!orderDetailsData) {
                trans.rollback()
                return ResponseHelpers.SetSuccessErrorResponse({Message: CommonConfig.ERRORS.ORDER.FAILURE}, res, CommonConfig.STATUS_CODE.OK)
            }
            const updatedServingData = await AuthService.Order.UpdateAvailableServingsByRecipeId({
                availableServings: parseInt(recipeDetails.availableServings) - parseInt(noOfServing),
                recipeId: recipeId
            }, trans)
            if (!updatedServingData) {
                trans.rollback()
                return ResponseHelpers.SetSuccessErrorResponse({Message: CommonConfig.ERRORS.ORDER.FAILURE}, res, CommonConfig.STATUS_CODE.OK)
            }
            const successResultData = {
                name: userDetails.userProfileData.fullName,
                profileUrl: !userDetails.userProfileData.profileUrl ? null : userDetails.userProfileData.profileUrl,
                orderId: orderDetailsData.id
            }

            trans.commit()
            return ResponseHelpers.SetSuccessResponse(successResultData, res, CommonConfig.STATUS_CODE.CREATED)
        } catch (error) {
            trans.rollback()
            next(error)
        }
    }
}

const CommonController = {
    User: User,
    Category: Category,
    Recipe: Recipe,
    Map: Map,
    Order: Order,
}

module.exports = CommonController
