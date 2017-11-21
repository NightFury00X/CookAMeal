let AuthService = require('../Services/auth-service'),
    responseHelper = require('../../../Configurations/Helpers/ResponseHandler');

// The authentication controller.
let AuthController = {};

//Get userDetails
AuthController.getUserData = async (req, res, next) => {
    try {
        let result = await AuthService.getUserData(req.user);
        return responseHelper.setSuccessResponse({message: result}, res, 200);
    } catch (error) {
        next(error);
    }
};

AuthController.ChangePassword = async (req, res, next) => {
    try {
        return responseHelper.setSuccessResponse('Change Password.', res, 200);
    } catch (error) {
        next(error);
    }
};

module.exports = AuthController;