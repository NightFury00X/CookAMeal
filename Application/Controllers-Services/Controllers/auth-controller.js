let AuthService = require('../Services/auth-service'),
    responseHelper = require('../../../Configurations/Helpers/ResponseHandler'),
    CommonConfig = require('../../../Configurations/Helpers/common-config');

let Auth = {
    ChangePassword: async (req, res, next) => {
        try {
            return responseHelper.setSuccessResponse('Change Password.', res, CommonConfig.StatusCode.CREATED);
        } catch (error) {
            next(error);
        }
    },
    GetUser: async (req, res, next) => {
        try {
            let result = await AuthService.GetUserData(req.user);
            return responseHelper.setSuccessResponse({message: result}, res, CommonConfig.StatusCode.OK);
        } catch (error) {
            next(error);
        }
    }
};

// The authentication controller.
let AuthController = {
    Auth: Auth
};

module.exports = AuthController;