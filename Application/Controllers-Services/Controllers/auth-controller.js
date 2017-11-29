let AuthService = require('../Services/auth-service'),
    responseHelper = require('../../../Configurations/Helpers/ResponseHandler'),
    CommonConfig = require('../../../Configurations/Helpers/common-config');

let Auth = {
    LogOutUser: async (req, res, next) => {
        try {
            req.check('type').notEmpty();
            if (req.validationErrors() || req.validationErrors().length > 0)
                return next({
                    message: 'Invalid request.',
                    status: CommonConfig.STATUS_CODE.BAD_REQUEST
                }, false);
            
            let tokenDetails = {
                user_type_id: req.user.id,
                token: req.get('Authorization'),
                reasons: CommonConfig.REASONS.USER_LOGGED_OUT
            };
            let data = await AuthService.Logout(tokenDetails);
            if(!data)
                return next({
                    message: 'Unable to process your request.',
                    status: CommonConfig.STATUS_CODE.INTERNAL_SERVER_ERROR
                }, false);
            
            return responseHelper.setSuccessResponse({message: 'You have successfully logged out!'}, res, CommonConfig.STATUS_CODE.OK);
        } catch (error) {
            next(error);
        }
    },
    ChangePassword: async (req, res, next) => {
        try {
            return responseHelper.setSuccessResponse('Change Password.', res, CommonConfig.STATUS_CODE.CREATED);
        } catch (error) {
            next(error);
        }
    },
    GetUser: async (req, res, next) => {
        try {
            let result = await AuthService.GetUserData(req.user);
            return responseHelper.setSuccessResponse({message: result}, res, CommonConfig.STATUS_CODE.OK);
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