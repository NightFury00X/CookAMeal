let responseHelper = require('../../../Configurations/Helpers/ResponseHandler'),
    CommonService = require('../Services/common.service'),
    CommonConfig = require('../../../Configurations/Helpers/common-config');

let Category = {
    FindAll: async (req, res, next) => {
        try {
            let result = await CommonService.GetCategories();
            return responseHelper.setSuccessResponse(result, res, CommonConfig.StatusCode.OK);
        } catch (error) {
            next(error);
        }
    },
    FindById: async (req, res, next) => {
        try {
            if (!req.params.id)
                return responseHelper.setErrorResponse({message: 'Category not found.'}, res, CommonConfig.StatusCode.OK);
            let catId = req.params.id;
            let result = await CommonService.GetCategoryById(catId);
            return responseHelper.setSuccessResponse(result, res, CommonConfig.StatusCode.OK);
        } catch (error) {
            next(error);
        }
    }
};

let CommonController = {
    Category: Category
};

module.exports = CommonController;