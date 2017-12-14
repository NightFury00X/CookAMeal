const {ResponseHelpers} = require('../../../Configurations/Helpers/helper'),
    CommonService = require('../Services/common.service'),
    CommonConfig = require('../../../Configurations/Helpers/common-config');

let User = {
    GetCookprofile: async (req, res, next) => {
        try {
            const profile_id = req.value.params.id;
            const result = await CommonService.User.GetCookProfileDetailsById(profile_id);
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
                            const favorite = await CommonService.Recipe.CheckRecipeIsFavoriteByRecipeIdAndProfileId(profile.id, recipe_id);
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
        
                    // Check recipe is marked favorite or not
                    const favorite = await CommonService.Recipe.CheckRecipeIsFavoriteByRecipeIdAndProfileId(profile.id, recipe_id);
        
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
            const recipe_id = req.value.params.id;
            const recipe_details = await CommonService.Recipe.FindRecipeById(recipe_id);
            const rating = await CommonService.Recipe.FindRatingByRecipeId(recipe_id);
            
            const cook_recipes = await CommonService.Recipe.FindAllRecipeByCookId(recipe_details.id);
            const similar_recipes = await CommonService.Recipe.FindSimilarRecipesBySubCategoryId(recipe_details.Recipes[0].sub_category_id);
    
            const profile = await CommonService.User.GetProfileIdByUserTypeId(req.user.id);
            const favorite = await CommonService.Recipe.CheckRecipeIsFavoriteByRecipeIdAndProfileId(profile.id, recipe_id);
            const result = {
                recipe_details: recipe_details,
                rating: !rating[0].rating ? 0 : rating[0].rating,
                favorite: !favorite ? 0 : favorite.is_favorite,
                cook_recipes: cook_recipes,
                similar_recipes: similar_recipes
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
    MarkFavorite: async (req, res, next) => {
        try {
            // Get profile ID
            const user_id = req.user.id;
            const profile = await CommonService.User.GetProfileIdByUserTypeId(user_id);
            const favorite = {
                profile_id: profile.id,
                recipe_id: req.body.recipe_id
            };
    
            // check recipe id is exist
            const recipe = await CommonService.Recipe.FindRecipeIsExist(favorite.recipe_id);
    
            if (!recipe)
                next('Invalid Recipe.');
            
            //check recipe marked favorite by user
            const is_favorite = await CommonService.Recipe.CheckRecipeIsFavoriteByRecipeIdAndProfileId(favorite.profile_id, favorite.recipe_id);
    
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
    GetMarkedFavoriteList: async (req, res, next) => {
        try {
            // Get profile ID
            const user_id = req.user.id;
            const profile = await CommonService.User.GetProfileIdByUserTypeId(user_id);
            const result = await CommonService.Recipe.GetFavoriteListByProfileId(profile.id);
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