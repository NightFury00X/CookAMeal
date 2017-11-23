let responseHelper = require('../../../Configurations/Helpers/ResponseHandler'),
    AdminService = require('../Services/admin.service'),
    uploadFile = require('../../../Configurations/Helpers/file-upload-multer'),
    CommonConfig = require('../../../Configurations/Helpers/common-config');

let Category = {
    Add: async (req, res, next) => {
        try {
            //upload file
            let files = await uploadFile(req, res);
            
            let categoryName = {
                name: req.body.name
            };
            let result = await AdminService.Add(req.user.id, categoryName, files);
            return responseHelper.setSuccessResponse(result, res, CommonConfig.StatusCode.CREATED);
        } catch (error) {
            next(error);
        }
    }
};

// The authentication controller.
let AdminController = {
    Category: Category
};

module.exports = AdminController;