let responseHelper = require('../../../Configurations/Helpers/ResponseHandler'),
    AdminService = require('../Services/admin.service'),
    uploadFile = require('../../../Configurations/Helpers/file-upload-multer'),
    CommonConfig = require('../../../Configurations/Helpers/common-config');

let Category = {
    Add: async (req, res, next) => {
        try {
            //upload file
            let files = await uploadFile(req, res);

            console.log('Request Body: ', req.body);
            console.log('==============================================================');
            console.log('Files: ', files);
            let categoryName = {
                name: req.body.name
            };
            let result = await AdminService.Add(req.user.id, categoryName, files);
            return responseHelper.setSuccessResponse(result, res, CommonConfig.STATUS_CODE.CREATED);
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