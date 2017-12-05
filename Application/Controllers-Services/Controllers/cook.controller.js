let responseHelper = require('../../../Configurations/Helpers/ResponseHandler'),
    CookService = require('../Services/cook.service'),
    CommonService = require('../Services/common.service'),
    CommonConfig = require("../../../Configurations/Helpers/common-config");

let Recipe = {
    Add: async (req, res, next) => {
        try {
            console.log(req.body);
            return responseHelper.setSuccessResponse(req.body, res, CommonConfig.STATUS_CODE.CREATED);
        } catch (error) {
            next(error);
        }
    }
};

let CookController = {
    Recipe: Recipe
};

module.exports = CookController;