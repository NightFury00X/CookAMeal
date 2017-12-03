let responseHelper = require('../../../Configurations/Helpers/ResponseHandler'),
    AnonymousService = require('../Services/anonymous.service'),
    {generateTokenForResetPassword} = require('../../../Configurations/Helpers/authentication'),
    CommonService = require('../Services/common.service'),
    uploadFile = require('../../../Configurations/Helpers/file-upload-multer'),
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

            let token = await CommonService.GenerateToken(userDetails.userInfo, userData);
            return responseHelper.setSuccessResponse(token, res, CommonConfig.STATUS_CODE.OK);
        } catch (error) {
            next(error);
        }
    },
    SignUp: async (req, res, next) => {
        try {
            //upload file
            let files = await uploadFile(req, res, next);

            let registrationData = JSON.parse(req.body.details);

            if (!registrationData || !registrationData.user || !registrationData.address || !registrationData.social)
                return next({
                    message: 'Bad Request.',
                    status: CommonConfig.STATUS_CODE.BAD_REQUEST
                }, false);

            console.log('Data: ', registrationData);
            console.log('--------------------------------------------------------------------------');
            console.log('Files: ', files);

            let result = await AnonymousService.SignUp(registrationData, files);
            return responseHelper.setSuccessResponse(result, res, CommonConfig.STATUS_CODE.CREATED);
        } catch (error) {
            next(error);
        }
    },
    AuthenticateUser: async (req, res, next) => {
        try {
            if (req.user.token && !req.token_status) {
                // TODO Invalidate token and inform user to reset password again.
                console.log('token expired');
                await CommonService.InvalidateResetPasswordTokenData(req.user.id);
                return next({message: 'temporary password has been expired.'}, false);
            }

            let userDetails = {
                user_id: !req.token_status ? req.user.id : false,
                user_type_id: req.user.user_type_id,
                token_id: req.token_status ? req.user.id : false,
                token_status: !!req.token_status
            };

            console.log(userDetails);
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
                // TODO generate new password and token
                console.log('generate reset password and token.');
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

            // If token expired
            if (!req.token_status && req.reset_password_generated && !req.token_data) {
                // TODO invalidate old Token
                // TODO set flag to true to issue new token
                console.log('Invalidate token');
                console.log('generate new token and password');
                let data = await CommonService.InvalidateResetPasswordTokenData(req.token_id);
                if (!data)
                    flag = false;

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
                }, email, req.token_id);
                if (!result)
                    flag = false;
            }

            // If Token is valid and password already generated
            if (req.token_data && req.reset_password_generated && req.token_status) {
                // TODO get password and resend the email
                console.log('sending password to mail.');
                let data = AnonymousService.SendResetPasswordKeyToMail(req.token_data.email);
                if (!data)
                    flag = false;
            }

            if (!flag)
                return next({
                    message: 'Unable to process your request! Please try again later.',
                    status: CommonConfig.STATUS_CODE.OK
                }, false);

            return responseHelper.setSuccessResponse({
                email: email,
                message: 'We have sent an email to your registered email address. Thank you.'
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
            return responseHelper.setSuccessResponse('Password has been changed successfully.', res, CommonConfig.STATUS_CODE.OK);
        } catch (error) {
            next(error);
        }
    },
};

//Check facebook user already in database or not
let AnonymousController = {
    Anonymous: Anonymous
};

module.exports = AnonymousController;