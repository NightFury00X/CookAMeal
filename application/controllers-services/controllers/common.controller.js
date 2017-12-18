const {ResponseHelpers} = require('../../../configurations/helpers/helper'),
    CommonService = require('../services/common.service'),
    CommonConfig = require('../../../configurations/helpers/common-config');

let User = {
    GetCookprofile: async (req, res, next) => {
        try {
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
                            const tempFav = await CommonService.Recipe.CheckRecipeIsFavoriteByRecipeIdAndUserId(profileId, tempRecipeId);
                            const tempRating = await CommonService.Recipe.FindRatingByRecipeId(tempRecipeId);
                            cookRecipesToJSON[outer].Recipes[inner].favorite = !tempFav ? false : tempFav.is_favorite;
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
            const category_id = req.value.params.id;
            const user_id = req.user.id;
            const profile = await CommonService.User.GetProfileIdByUserTypeId(user_id);
            const result = await CommonService.Recipe.FindAllByCategoryId(category_id);
            
            let convertedJSON = JSON.parse(JSON.stringify(result));
            for (const outer in convertedJSON) {
                if (convertedJSON.hasOwnProperty(outer)) {
                    for (const inner in convertedJSON[outer].Recipes) {
                        if (convertedJSON[outer].Recipes.hasOwnProperty(inner)) {
                            const recipe_id = convertedJSON[outer].Recipes[inner].id;
    
                            // Get racipe ratings
                            const ratingDetails = await CommonService.Recipe.FindRatingByRecipeId(recipe_id);
    
                            // Check recipe is marked favorite or not
                            const favorite = await CommonService.Recipe.CheckRecipeIsFavoriteByRecipeIdAndUserId(profile.id, recipe_id);
                            convertedJSON[outer].Recipes[inner].Rating = !ratingDetails[0].rating ? 0 : ratingDetails[0].rating;
                            convertedJSON[outer].Recipes[inner].Favorite = !favorite ? false : favorite.is_favorite;
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

const Recipe = {
    GetRecipeListByCategoryAndSubCategoryIds: async (req, res, next) => {
        try {
            const category_id = req.value.params.catid;
            const sub_category_id = req.value.params.subid;
            const sub_category_details = await CommonService.SubCategory.FindById(sub_category_id);
            const result = await CommonService.Recipe.FindRecipeByCatIdAndSubIds(category_id, sub_category_id);
            let convertedJSON = JSON.parse(JSON.stringify(result));
            for (const inner in convertedJSON) {
                if (convertedJSON.hasOwnProperty(inner)) {
                    const recipe_id = convertedJSON[inner].id;
                    const profile = await CommonService.User.GetProfileIdByUserTypeId(req.user.id);
                    const ratingDetails = await CommonService.Recipe.FindRatingByRecipeId(recipe_id);
                    const favorite = await CommonService.Recipe.CheckRecipeIsFavoriteByRecipeIdAndUserId(profile.id, recipe_id);
                    convertedJSON[inner].Rating = !ratingDetails[0].rating ? 0 : ratingDetails[0].rating;
                    convertedJSON[inner].Favorite = !favorite ? false : favorite.is_favorite;
                }
            }
            let results = {
                sub_category: sub_category_details,
                recipes: convertedJSON
            };
            return ResponseHelpers.SetSuccessResponse(results, res, CommonConfig.STATUS_CODE.OK);
        } catch (error) {
            next(error);
        }
    },
    GetRecipeById: async (req, res, next) => {
        try {
            const recipeId = req.value.params.id;
            const profile = await CommonService.User.GetProfileIdByUserTypeId(req.user.id);
            const recipeDetails = await CommonService.Recipe.FindRecipeById(recipeId);
            if (!recipeDetails)
                return ResponseHelpers.SetNotFoundResponse(CommonConfig.ERRORS.RECIPE.NOT_FOUND, res);
            const rating = await CommonService.Recipe.FindRatingByRecipeId(recipeId);
            const cookRecipes = await CommonService.Recipe.FindAllRecipeByCookIdExcludeSelectedRecipe(recipeDetails.id, recipeId);
            let cookRecipesToJSON = JSON.parse(JSON.stringify(cookRecipes));
            for (const index in cookRecipesToJSON) {
                if (cookRecipesToJSON.hasOwnProperty(index)) {
                    const tempRecipeId = cookRecipesToJSON[index].id;
                    const tempFav = await CommonService.Recipe.CheckRecipeIsFavoriteByRecipeIdAndUserId(profile.id, tempRecipeId);
                    const tempRating = await CommonService.Recipe.FindRatingByRecipeId(tempRecipeId);
                    cookRecipesToJSON[index].favorite = !tempFav ? false : tempFav.is_favorite;
                    cookRecipesToJSON[index].rating = !tempRating[0].rating ? 0 : tempRating[0].rating;
                }
            }
            const similarRecipes = await CommonService.Recipe.FindSimilarRecipesBySubCategoryIdExcludeSelectedCookRecipe(recipeDetails.Recipes[0].sub_category_id, profile.id);
            let similarRecipesToJSON = JSON.parse(JSON.stringify(similarRecipes));
            for (const index in similarRecipesToJSON) {
                if (similarRecipesToJSON.hasOwnProperty(index)) {
                    const tempRecipeId = similarRecipesToJSON[index].id;
                    const tempFav = await CommonService.Recipe.CheckRecipeIsFavoriteByRecipeIdAndUserId(profile.id, tempRecipeId);
                    const tempRating = await CommonService.Recipe.FindRatingByRecipeId(tempRecipeId);
                    similarRecipesToJSON[index].favorite = !tempFav ? false : tempFav.is_favorite;
                    similarRecipesToJSON[index].rating = !tempRating[0].rating ? 0 : tempRating[0].rating;
                }
            }
            const favorite = await CommonService.Recipe.CheckRecipeIsFavoriteByRecipeIdAndUserId(profile.id, recipeId);
            const result = {
                recipe_details: recipeDetails,
                rating: !rating[0].rating ? 0 : rating[0].rating,
                favorite: !favorite ? 0 : favorite.is_favorite,
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
            const user_id = req.user.id;
            const favorite = {
                comment: req.body.comment,
                user_type_id: user_id,
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

let CommonController = {
    User: User,
    Category: Category,
    SubCategory: SubCategory,
    Allergy: Allergy,
    Recipe: Recipe,
    Units: Units
};

module.exports = CommonController;