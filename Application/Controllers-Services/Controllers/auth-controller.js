let AuthService = require('../Services/auth-service'),
    responseHelper = require('../../../Configurations/Helpers/ResponseHandler'),
    CommonConfig = require('../../../Configurations/Helpers/common-config');
const CommonService = require("../Services/common.service");

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
            if (!data)
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
            // Update user password
            let userDetails = {
                id: req.user.id,
                email: req.user.email,
                password: req.body.new_password
            };

            console.log('user: =>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', req.payload);

            let userData = await CommonService.GetResetPasswordData(req.user.user_id);
            const isMatch = await userData.comparePasswords(req.body.old_password);
            if (!isMatch)
                return next({
                    message: 'Password not matched. Please try again later.',
                    status: CommonConfig.STATUS_CODE.BAD_REQUEST
                }, false);
            
            
            let data = await CommonService.ChangePassword(userDetails);
            if (!data)
                return next({
                    message: 'Unable to process your request.',
                    status: CommonConfig.STATUS_CODE.INTERNAL_SERVER_ERROR
                }, false);

            // Create token
            let TokenData = await CommonService.GenerateTokenByUserTypeId(req.user.user_type_id);
            
            
            return responseHelper.setSuccessResponse({
                new_token: TokenData,
                message: 'Password has been changed successfully.'
            }, res, CommonConfig.STATUS_CODE.OK);
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