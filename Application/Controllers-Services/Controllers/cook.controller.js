let responseHelper = require('../../../Configurations/Helpers/ResponseHandler'),
    CookService = require('../Services/cook.service'),
    CommonService = require('../Services/common.service'),
    CommonConfig = require("../../../Configurations/Helpers/common-config");

let Recipe = {
    Add: async (req, res, next) => {
        try {
            let recipeData = await CookService.Recipe.Add(req.body);
        
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