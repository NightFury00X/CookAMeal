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
            let result = await AnonymousService.Authenticate(req.user.user_type_id, !req.user.random_key);
            result.type = !req.user.random_key;
            return responseHelper.setSuccessResponse(result, res, CommonConfig.STATUS_CODE.OK);
        } catch (error) {
            next(error);
        }
    },
    ResetPassword: async (req, res, next) => {
        try {
            if (req.tokenData) {
                let data = await AnonymousService.SendResetPasswordKeyToMail(req.tokenData.email);
                if (!data)
                    return next({
                        message: 'Unable to process your request! Please try again later.',
                        status: CommonConfig.STATUS_CODE.INTERNAL_SERVER_ERROR
                    }, false);
                
                return responseHelper.setSuccessResponse({
                    email: req.tokenData.email,
                    message: 'We have sent an email to your registered email address. Thank you.'
                }, res, CommonConfig.STATUS_CODE.OK);
            }
            const email = req.body.email;
            let user = await CommonService.CheckUserTypeByUserEmail(email);
            
            if (!user)
                return next({
                    message: 'Email not exists in our database!',
                    status: CommonConfig.STATUS_CODE.OK
                }, false);
            
            //Generate rendom password
            let randomKey = await CommonService.GenerateRandomKey();
            
            //get token by random key
            let token = generateTokenForResetPassword({id: user.id, email: email});
            
            //Add key to database            
            let data = await AnonymousService.AddResetPasswordDetails({
                email: email,
                temp_password: randomKey,
                random_key: randomKey,
                token: token,
                user_type_id: user.id
            }, email);
            
            if (!data)
                return next({
                    message: 'Unable to process your request. Please try again later.',
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
            // TODO Update user password
            console.log(req.user);
            return responseHelper.setSuccessResponse(req.user, res, CommonConfig.STATUS_CODE.OK);
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