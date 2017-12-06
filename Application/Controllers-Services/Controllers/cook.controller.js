let responseHelper = require('../../../Configurations/Helpers/ResponseHandler'),
    CookService = require('../Services/cook.service'),
    CommonService = require('../Services/common.service'),
    CommonConfig = require("../../../Configurations/Helpers/common-config");

let Recipe = {
    GetAllRecipeBySubCategory: async (req, res, next) => {
        try {
            const profile = await CommonService.User.GetProfileIdByUserTypeId(req.user.id);
            let result = await CookService.Recipe.GetAllRecipeBySubCategory(profile.id);
            return responseHelper.setSuccessResponse(result, res, CommonConfig.STATUS_CODE.CREATED);
        } catch (error) {
            next(error);
        }
    },
    GetAllRecipeBySubCategoryById: async (req, res, next) => {
        try {
            let id = req.params['id'];
            let result = await CookService.Recipe.GetAllRecipeBySubCategoryById('e4d2e9b2-6673-4bec-aa39-85d34add646a', id);
            
            return responseHelper.setSuccessResponse(result, res, CommonConfig.STATUS_CODE.CREATED);
        } catch (error) {
            next(error);
        }
    },
    Add: async (req, res, next) => {
        try {
            console.log('========================================================');
            console.log('Body: ', req.body);
            console.log('========================================================');
            console.log('File: ', req.files);
            
            let recipeData = await CookService.Recipe.Add(req.body, req.files, req.user.id);
            if (!recipeData)
                return next({
                    message: CommonConfig.ERRORS.CREATION,
                    status: CommonConfig.STATUS_CODE.BAD_REQUEST
                }, false);
            
            return responseHelper.setSuccessResponse({Message: 'Your recipe added successfully.'}, res, CommonConfig.STATUS_CODE.CREATED);
        } catch (error) {
            next(error);
        }
    }
};

let CookController = {
    Recipe: Recipe
};

module.exports = CookController;