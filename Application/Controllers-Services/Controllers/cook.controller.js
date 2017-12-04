let responseHelper = require('../../../Configurations/Helpers/ResponseHandler'),
    CookService = require('../Services/cook.service'),
    CommonService = require('../Services/common.service'),
    uploadFile = require('../../../Configurations/Helpers/file-upload-multer');
const CommonConfig = require("../../../Configurations/Helpers/common-config");
const {ValidateBody} = require("../../../Configurations/middlewares/validation");
const {BodySchemas} = require('../../Schemas/schema');

let Recipe = {
    Add: async (req, res, next) => {
        try {
            //upload file
            // let files = await uploadFile(req, res, next);
            // let a = await ValidateBody(BodySchemas.ChangePassword);
            console.log(req.body);
            return responseHelper.setSuccessResponse('OK', res, CommonConfig.STATUS_CODE.CREATED);
        } catch (error) {
            next(error);
        }
    }
};

let CookController = {
    Recipe: Recipe
};

module.exports = CookController;