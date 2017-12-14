let responseHelper = require('../../../Configurations/Helpers/ResponseHandler'),
    AnonymousService = require('../Services/anonymous.service'),
    {generateTokenForResetPassword} = require('../../../Configurations/Helpers/authentication'),
    CommonService = require('../Services/common.service'),
    CommonConfig = require('../../../Configurations/Helpers/common-config');

// The authentication controller.
let Anonymous = {
    FbSignIn: async (req, res, next) => {
        try {
            req.check('fbid').notEmpty();
            if (req.validationErrors() || req.validationErrors().length > 0)
                return next({
                    message: 'Unable to connect with facebook.',
                    status: CommonConfig.STATUS_CODE.BAD_REQUEST
                }, false);
            let fbId = req.body.fbid;
            let user = await CommonService.CheckUserTypeByUserId(fbId);
            if (!user)
                return next({
                    message: 'facebook user not exist.',
                    status: CommonConfig.STATUS_CODE.OK
                }, false);
    
            // Get User Details
            let userDetails = await CommonService.GetUserDetailsByUserTypeId(user.id);
    
            //Generate Token        
            let userData = {
                id: userDetails.userid,
                fullname: userDetails.Profile.fullName,
                user_type: userDetails.user_type,
                user_role: userDetails.user_role,
                profile_url: userDetails.Profile.MediaObjects.length > 0 ? userDetails.Profile.MediaObjects[0].imageurl : ''
            };
    
            let result = await CommonService.GenerateToken(userDetails.userInfo, userData);
            result.type = true;
            return responseHelper.setSuccessResponse(result, res, CommonConfig.STATUS_CODE.OK);
        } catch (error) {
            next(error);
        }
    },
    SignUp: async (req, res, next) => {
        try {
            let registrationData = JSON.parse(req.body.details);
    
            if (!registrationData || !registrationData.user || !registrationData.address || !registrationData.social)
                return next({
                    message: CommonConfig.ERRORS.CREATION,
                    status: CommonConfig.STATUS_CODE.BAD_REQUEST
                }, false);
    
            let result = await AnonymousService.SignUp(registrationData, req.files);
            result.type = true;
            return responseHelper.setSuccessResponse(result, res, CommonConfig.STATUS_CODE.CREATED);
        } catch (error) {
            next(error);
        }
    },
    AuthenticateUser: async (req, res, next) => {
        try {
            if (req.user.token && !req.token_status) {
                await CommonService.InvalidateResetPasswordTokenData(req.user.id);
                return next({message: CommonConfig.ERRORS.TOKEN_EXPIRED}, false);
            }
        
            let userDetails = {
                user_id: !req.token_status ? req.user.id : false,
                user_type_id: req.user.user_type_id,
                token_id: req.token_status ? req.user.id : false,
                token_status: !!req.token_status
            };
        
            let result = await AnonymousService.Authenticate(userDetails);
        
            result.type = !req.user.random_key;
            return responseHelper.setSuccessResponse(result, res, CommonConfig.STATUS_CODE.OK);
        } catch (error) {
            next(error);
        }
    },
    ResetPassword: async (req, res, next) => {
        try {
            let flag = true;
            let email = req.body.email;
    
            // If reset password not generated
            if (!req.reset_password_generated && !req.token_status && !req.token_data) {
                let userModel = await CommonService.UserModel.GetDetailsByEmail(email);
                let temp_password = await CommonService.Keys.RandomKeys.GenerateRandomKey();
    
                let unique_key = await CommonService.Keys.RandomKeys.GenerateUnique16DigitKey();
    
                let token = await generateTokenForResetPassword(userModel.userInfo, unique_key, false);
                
                //add data to reset password
                let data = await AnonymousService.AddResetPasswordDetails({
                    email: userModel.user_id,
                    temp_password: temp_password,
                    random_key: temp_password,
                    token: token,
                    unique_key: unique_key,
                    user_type_id: userModel.id
                }, email, null);
                if (!data)
                    flag = false;
            }
            else if (req.reset_password_generated && !req.token_status && !req.token_data) {
                let userModel = await CommonService.UserModel.GetDetailsByEmail(email);
    
                let temp_password = await CommonService.Keys.RandomKeys.GenerateRandomKey();
    
                let unique_key = await CommonService.Keys.RandomKeys.GenerateUnique16DigitKey();
    
                let token = await generateTokenForResetPassword(userModel.userInfo, unique_key, false);
    
                //add data to reset password
                let result = await AnonymousService.AddResetPasswordDetails({
                    email: userModel.user_id,
                    temp_password: temp_password,
                    random_key: temp_password,
                    token: token,
                    unique_key: unique_key,
                    user_type_id: userModel.id
                }, email, {token_status: req.token_status, token_id: req.token_id});
                if (!result)
                    flag = false;
            }
            else if (req.reset_password_generated && req.token_data && req.token_status) {
                let data = await AnonymousService.SendResetPasswordKeyToMail(req.token_data.email);
                if (!data)
                    flag = false;
            }
    
            if (!flag)
                return next({
                    message: CommonConfig.ERRORS.CREATION,
                    status: CommonConfig.STATUS_CODE.OK
                }, false);
    
            console.log('We have sent an email to your registered email address. Thank you.');
            
            return responseHelper.setSuccessResponse({
                email: email,
                message: CommonConfig.SUCCESS.EMAIL_SENT
            }, res, CommonConfig.STATUS_CODE.OK);
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
                password: req.body.password
            };
    
            await CommonService.ChangePassword(userDetails);
            return responseHelper.setSuccessResponse(CommonConfig.SUCCESS.PASSWORD_CHANGED, res, CommonConfig.STATUS_CODE.OK);
        } catch (error) {
            next(error);
        }
    },
};

let AnonymousController = {
    Anonymous: Anonymous
};

module.exports = AnonymousController;