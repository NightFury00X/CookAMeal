const {ResponseHelpers} = require('../../../configurations/helpers/helper'),
    CommonService = require('../services/common.service'),
    CookService = require('../services/cook.service'),
    CommonConfig = require('../../../configurations/helpers/common-config'),
    GeoLOcation = require('../../../configurations/helpers/geo-location-helper');

let User = {
    GetCookprofile: async (req, res, next) => {
        try {
            const userId = req.user.id;
            const profileId = req.value.params.id;
            const cookProfileDetails = await CommonService.User.GetCookProfileDetailsById(profileId);
            const profileReview = await CommonService.User.FindProfileRatingByProfileId(profileId);
            const cookDealWithCategories = await CommonService.User.FindCookAllCategoriesByProfileId(profileId);
            let cookDealWithCategoriesToJSON = JSON.parse(JSON.stringify(cookDealWithCategories));
            let categoryList = '';
            for (const outer in cookDealWithCategoriesToJSON) {
                if (cookDealWithCategoriesToJSON.hasOwnProperty(outer)) {
                    categoryList += cookDealWithCategoriesToJSON[outer].name + ', ';
                }
            }
            categoryList = categoryList.substr(0, categoryList.length - 2);
            let cookProfileDetailsToJSON = JSON.parse(JSON.stringify(cookProfileDetails));
            cookProfileDetailsToJSON.rating = !profileReview[0].rating ? 0 : profileReview[0].rating;
            const cookRecipesDetails = await CommonService.Recipe.FindAllRecipeByProfileId(profileId);
            let cookRecipesToJSON = JSON.parse(JSON.stringify(cookRecipesDetails));
            for (const outer in cookRecipesToJSON) {
                if (cookRecipesToJSON.hasOwnProperty(outer)) {
                    for (const inner in cookRecipesToJSON[outer].Recipes) {
                        if (cookRecipesToJSON[outer].Recipes.hasOwnProperty(inner)) {
                            const tempRecipeId = cookRecipesToJSON[outer].Recipes[inner].id;
                            const tempFav = await CommonService.Recipe.CheckRecipeIsFavoriteByRecipeIdAndUserId(userId, tempRecipeId);
                            const tempRating = await CommonService.Recipe.FindRatingByRecipeId(tempRecipeId);
                            cookRecipesToJSON[outer].Recipes[inner].favorite = !!tempFav;
                            cookRecipesToJSON[outer].Recipes[inner].rating = !tempRating[0].rating ? 0 : tempRating[0].rating;
                        }
                    }
                }
            }
            const result = {
                categories: categoryList ? categoryList : null,
                cook_profile: cookProfileDetailsToJSON,
                recipes: cookRecipesToJSON
            };
            return ResponseHelpers.SetSuccessResponse(result, res, CommonConfig.STATUS_CODE.OK);
        } catch (error) {
            next(error);
        }
    },
    GetAllReviewsByProfileId: async (req, res, next) => {
        try {
            const userId = req.user.id;
            const profile = await CommonService.User.GetProfileIdByUserTypeId(userId);
            const result = await CommonService.User.FindAllReviewsByProfileId(profile.id);
            return ResponseHelpers.SetSuccessResponse(result, res, CommonConfig.STATUS_CODE.OK);
        }
        catch (error) {
            next(error);
        }
    },
    geo: async (req, res, next) => {
        try {
            const data = {
                address: 'cynoteck dehradun',
                state: 'uttarakhand',
                city: 'dehradun',
                zipCode: '248001'
            };
            const result = await await GeoLOcation.geocoder.geocode(`${data.address}, ${data.state}, ${data.city} ${data.zipCode}`);
            return ResponseHelpers.SetSuccessResponse(result, res, CommonConfig.STATUS_CODE.OK);
        }
        catch (error) {
            next(error);
        }
    }
};

let Category = {
    GetAll: async (req, res, next) => {
        try {
            let result = await CommonService.GetCategories();
            return ResponseHelpers.SetSuccessResponse(result, res, CommonConfig.STATUS_CODE.OK);
        } catch (error) {
            next(error);
        }
    },
    FindById: async (req, res, next) => {
        try {
            if (!req.params.id)
                return next({
                    message: 'Category not found.',
                    status: CommonConfig.STATUS_CODE.INTERNAL_SERVER_ERROR
                }, false);
            
            let catId = req.params.id;
            let result = await CommonService.GetCategoryById(catId);
            return ResponseHelpers.SetSuccessResponse(result, res, CommonConfig.STATUS_CODE.OK);
        } catch (error) {
            next(error);
        }
    },
    GetAllRecipeByCategoryId: async (req, res, next) => {
        try {
            const categoryId = req.value.params.id;
            const userId = req.user.id;
            const result = await CommonService.Recipe.FindAllByCategoryId(categoryId);
            
            let convertedJSON = JSON.parse(JSON.stringify(result));
            for (const outer in convertedJSON) {
                if (convertedJSON.hasOwnProperty(outer)) {
                    for (const inner in convertedJSON[outer].Recipes) {
                        if (convertedJSON[outer].Recipes.hasOwnProperty(inner)) {
                            const recipeId = convertedJSON[outer].Recipes[inner].id;
                            const ratingDetails = await CommonService.Recipe.FindRatingByRecipeId(recipeId);
                            const favorite = await CommonService.Recipe.CheckRecipeIsFavoriteByRecipeIdAndUserId(userId, recipeId);
                            convertedJSON[outer].Recipes[inner].Rating = !ratingDetails[0].rating ? 0 : ratingDetails[0].rating;
                            convertedJSON[outer].Recipes[inner].Favorite = !!favorite;
                        }
                    }
                }
            }
            return ResponseHelpers.SetSuccessResponse(convertedJSON, res, CommonConfig.STATUS_CODE.OK);
            
        } catch (error) {
            next(error);
        }
    }
};

let SubCategory = {
    GetAll: async (req, res, next) => {
        try {
            let result = await CommonService.SubCategory.GettAll();
            return ResponseHelpers.SetSuccessResponse(result, res, CommonConfig.STATUS_CODE.OK);
        } catch (error) {
            next(error);
        }
    },
    FindById: async (req, res, next) => {
        try {
            if (!req.params.id)
                return next({
                    message: 'Category not found.',
                    status: CommonConfig.STATUS_CODE.INTERNAL_SERVER_ERROR
                }, false);
            
            let catId = req.params.id;
            let result = await CommonService.GetCategoryById(catId);
            return ResponseHelpers.SetSuccessResponse(result, res, CommonConfig.STATUS_CODE.OK);
        } catch (error) {
            next(error);
        }
    }
};

let Allergy = {
    GetAll: async (req, res, next) => {
        try {
            let result = await CommonService.Allergy.GettAll();
            return ResponseHelpers.SetSuccessResponse(result, res, CommonConfig.STATUS_CODE.OK);
        } catch (error) {
            next(error);
        }
    },
    FindById: async (req, res, next) => {
        try {
            if (!req.params.id)
                return next({
                    message: 'Category not found.',
                    status: CommonConfig.STATUS_CODE.INTERNAL_SERVER_ERROR
                }, false);
            
            let catId = req.params.id;
            let result = await CommonService.GetCategoryById(catId);
            return ResponseHelpers.SetSuccessResponse(result, res, CommonConfig.STATUS_CODE.OK);
        } catch (error) {
            next(error);
        }
    }
};

let Units = {
    GetAll: async (req, res, next) => {
        try {
            let result = await CommonService.Units.GettAll();
            return ResponseHelpers.SetSuccessResponse(result, res, CommonConfig.STATUS_CODE.OK);
        } catch (error) {
            next(error);
        }
    },
    FindById: async (req, res, next) => {
        try {
            if (!req.params.id)
                return next({
                    message: 'Category not found.',
                    status: CommonConfig.STATUS_CODE.INTERNAL_SERVER_ERROR
                }, false);
            
            let catId = req.params.id;
            let result = await CommonService.GetCategoryById(catId);
            return ResponseHelpers.SetSuccessResponse(result, res, CommonConfig.STATUS_CODE.OK);
        } catch (error) {
            next(error);
        }
    }
};

let PaymentMethod = {
    GetAll: async (req, res, next) => {
        try {
            let result = await CommonService.PaymentMethod.GettAll();
            return ResponseHelpers.SetSuccessResponse(result, res, CommonConfig.STATUS_CODE.OK);
        } catch (error) {
            next(error);
        }
    }
};

const Recipe = {
    GetRecipeListByCategoryAndSubCategoryIds: async (req, res, next) => {
        try {
            const userId = req.user.id;
            const categoryId = req.value.params.catid;
            const subCategoryId = req.value.params.subid;
            const subCategoryDetails = await CommonService.SubCategory.FindById(subCategoryId);
            const result = await CommonService.Recipe.FindRecipeByCatIdAndSubIds(categoryId, subCategoryId);
            let convertedJSON = JSON.parse(JSON.stringify(result));
            for (const inner in convertedJSON) {
                if (convertedJSON.hasOwnProperty(inner)) {
                    const recipeId = convertedJSON[inner].id;
                    const ratingDetails = await CommonService.Recipe.FindRatingByRecipeId(recipeId);
                    const favorite = await CommonService.Recipe.CheckRecipeIsFavoriteByRecipeIdAndUserId(userId, recipeId);
                    convertedJSON[inner].Rating = !ratingDetails[0].rating ? 0 : ratingDetails[0].rating;
                    convertedJSON[inner].Favorite = !!favorite;
                }
            }
            let results = {
                sub_category: subCategoryDetails,
                recipes: convertedJSON
            };
            return ResponseHelpers.SetSuccessResponse(results, res, CommonConfig.STATUS_CODE.OK);
        } catch (error) {
            next(error);
        }
    },
    GetRecipeById: async (req, res, next) => {
        try {
            const userId = req.user.id;
            const recipeId = req.value.params.id;
            const profile = await CommonService.User.GetProfileIdByUserTypeId(userId);
            const recipeDetails = await CommonService.Recipe.FindRecipeById(recipeId);
            if (!recipeDetails)
                return ResponseHelpers.SetNotFoundResponse(CommonConfig.ERRORS.RECIPE.NOT_FOUND, res);
            const rating = await CommonService.Recipe.FindRatingByRecipeId(recipeId);
            const cookRecipes = await CommonService.Recipe.FindAllRecipeByCookIdExcludeSelectedRecipe(profile.id, recipeId);
            let cookRecipesToJSON = JSON.parse(JSON.stringify(cookRecipes));
            for (const index in cookRecipesToJSON) {
                if (cookRecipesToJSON.hasOwnProperty(index)) {
                    const tempRecipeId = cookRecipesToJSON[index].id;
                    const tempFav = await CommonService.Recipe.CheckRecipeIsFavoriteByRecipeIdAndUserId(userId, tempRecipeId);
                    const tempRating = await CommonService.Recipe.FindRatingByRecipeId(tempRecipeId);
                    cookRecipesToJSON[index].favorite = !!tempFav;
                    cookRecipesToJSON[index].rating = !tempRating[0].rating ? 0 : tempRating[0].rating;
                }
            }
            const similarRecipes = await CommonService.Recipe.FindSimilarRecipesBySubCategoryIdExcludeSelectedCookRecipe(recipeDetails.Recipes[0].sub_category_id, profile.id);
            let similarRecipesToJSON = JSON.parse(JSON.stringify(similarRecipes));
            for (const index in similarRecipesToJSON) {
                if (similarRecipesToJSON.hasOwnProperty(index)) {
                    const tempRecipeId = similarRecipesToJSON[index].id;
                    const tempFav = await CommonService.Recipe.CheckRecipeIsFavoriteByRecipeIdAndUserId(userId, tempRecipeId);
                    const tempRating = await CommonService.Recipe.FindRatingByRecipeId(tempRecipeId);
                    similarRecipesToJSON[index].favorite = !!tempFav;
                    similarRecipesToJSON[index].rating = !tempRating[0].rating ? 0 : tempRating[0].rating;
                }
            }
            const favorite = await CommonService.Recipe.CheckRecipeIsFavoriteByRecipeIdAndUserId(userId, recipeId);
            const result = {
                recipe_details: recipeDetails,
                rating: !rating[0].rating ? 0 : rating[0].rating,
                favorite: !!favorite,
                cook_recipes: cookRecipesToJSON,
                similar_recipes: similarRecipesToJSON
            };
            return ResponseHelpers.SetSuccessResponse(result, res, CommonConfig.STATUS_CODE.OK);
        } catch (error) {
            next(error);
        }
    },
    GetAllRecipeByCategoryId: async (req, res, next) => {
        try {
            let category_id = req.value.params.id;
            const result = await CommonService.Recipe.FindAllByCategoryId(category_id);
            return ResponseHelpers.SetSuccessResponse(result, res, CommonConfig.STATUS_CODE.OK);
        } catch (error) {
            next(error);
        }
    },
    MarkRecipeAsFavorite: async (req, res, next) => {
        try {
            const userId = req.user.id;
            const favorite = {
                user_type_id: userId,
                recipe_id: req.body.recipe_id
            };
            const recipe = await CommonService.Recipe.FindRecipeIsExist(favorite.recipe_id);
            if (!recipe)
                return ResponseHelpers.SetNotFoundResponse('Recipe is not found.', res);
            const is_favorite = await CommonService.Recipe.CheckRecipeIsFavoriteByRecipeIdAndUserId(favorite.user_type_id, favorite.recipe_id);
            const flag = !!is_favorite;
            await CommonService.Recipe.MarkFavorite(favorite, flag);
            const msg = !flag ? 'Recipe marked favorite successfully.' : 'Recipe un-marked favorite successfully.';
            return ResponseHelpers.SetSuccessResponse({
                Message: msg,
                favorite: !flag
            }, res, CommonConfig.STATUS_CODE.CREATED);
        } catch (error) {
            next(error);
        }
    },
    GetRecipeMarkedFavoriteList: async (req, res, next) => {
        try {
            const user_id = req.user.id;
            const result = await CommonService.Recipe.GetFavoriteRecipeListByUserId(user_id);
            return ResponseHelpers.SetSuccessResponse({Message: result}, res, CommonConfig.STATUS_CODE.OK);
        } catch (error) {
            next(error);
        }
    }
};

const ReviewDetails = {
    RecipeReview: async (req, res, next) => {
        try {
            const user_id = req.user.id;
            const review = {
                recipe_id: req.body.recipe_id,
                rating: req.body.rating,
                comments: req.body.comments,
                user_type_id: user_id
            };
            const isExist = await CommonService.Review.CheckRecipeId(review.recipe_id);
            if (!isExist)
                return ResponseHelpers.SetSuccessResponse({Message: 'Unable to submit review.'}, res, CommonConfig.STATUS_CODE.OK);
            const result = await CommonService.Review.Recipe(review);
            if (!result)
                return ResponseHelpers.SetSuccessResponse({Message: 'Unable to submit review.'}, res, CommonConfig.STATUS_CODE.OK);
            return ResponseHelpers.SetSuccessResponse({Message: 'Review submitted successfully.'}, res, CommonConfig.STATUS_CODE.CREATED);
        } catch (error) {
            next(error);
        }
    },
    ProfileReview: async (req, res, next) => {
        try {
            const user_id = req.user.id;
            const review = {
                profile_id: req.body.profile_id,
                rating: req.body.rating,
                comments: req.body.comments,
                user_type_id: user_id
            };
            
            const isExist = await CommonService.Review.CheckUserId(review.profile_id);
            if (!isExist)
                return ResponseHelpers.SetSuccessResponse({Message: 'Unable to submit review.'}, res, CommonConfig.STATUS_CODE.OK);
            
            const result = await CommonService.Review.Profile(review);
            if (!result)
                return ResponseHelpers.SetSuccessResponse({Message: 'Unable to submit review.'}, res, CommonConfig.STATUS_CODE.OK);
            return ResponseHelpers.SetSuccessResponse({Message: 'Review submitted successfully.'}, res, CommonConfig.STATUS_CODE.CREATED);
        } catch (error) {
            next(error);
        }
    },
};

const Feedback = {
    Add: async (req, res, next) => {
        try {
            const userId = req.user.id;
            let feedback = req.body;
            feedback.user_type_id = userId;
            let result = await CommonService.Feedback.Add(feedback);
            console.log(result);
            if (!result)
                return ResponseHelpers.SetSuccessResponse({Message: 'Unable to submit you feedback.'}, res, CommonConfig.STATUS_CODE.OK);
            return ResponseHelpers.SetSuccessResponse({Message: 'Feedback submitted successfully.'}, res, CommonConfig.STATUS_CODE.CREATED);
        }
        catch (error) {
            next(error);
        }
    }
};

let Order = {
    PrepareData: async (req, res, next) => {
        try {
            const recipeId = req.value.params.id;
            const paymentMethods = await CommonService.PaymentMethod.GettAll();
            const deliveryFees = await  CookService.Recipe.GetDeliveryFeesByRecipeId(recipeId);
            const prepareData = {
                paymentMethods: paymentMethods,
                deliveryFees: deliveryFees.delivery_fee,
                tax: 5
            };
            return ResponseHelpers.SetSuccessResponse(prepareData, res, CommonConfig.STATUS_CODE.OK);
        } catch (error) {
            next(error);
        }
    }
};

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
};

module.exports = CommonController;