let responseHelper = require('../../../Configurations/Helpers/ResponseHandler'),
    AnonymousService = require('../Services/anonymous.service'),
    CommonService = require('../Services/common.service'),
    uploadFile = require('../../../Configurations/Helpers/file-upload-multer'),
    CommonConfig = require('../../../Configurations/Helpers/common-config');

// The authentication controller.
let Anonymous = {
    FbSignIn: async (req, res, next) => {
        try {
            req.check('fbid').notEmpty();
            if (req.validationErrors() || req.validationErrors().length > 0)
                return responseHelper.setErrorResponse({message: 'Unable to connect with facebook.'}, res, CommonConfig.STATUS_CODE.BAD_REQUEST);
            let fbId = req.body.fbid;
            let user = await CommonService.CheckUserTypeByUserId(fbId);
            if (!user)
                return responseHelper.setErrorResponse({message: 'facebook user not exist.'}, res, CommonConfig.STATUS_CODE.OK);
            
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
            let files = await uploadFile(req, res);
            
            let registrationData = JSON.parse(req.body.details);
            
            if (!registrationData || !registrationData.user || !registrationData.address || !registrationData.social)
                return responseHelper.setErrorResponse({message: 'Bad Request '}, res, CommonConfig.STATUS_CODE.BAD_REQUEST);
            
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
        req.check('username').notEmpty();
        req.check('password').notEmpty();
        if (req.validationErrors() || req.validationErrors().length > 0)
            return responseHelper.setErrorResponse({message: 'Bad Request '}, res, CommonConfig.STATUS_CODE.BAD_REQUEST);
        let loginDetails = {
            email: req.body.username,
            password: req.body.password,
            potentialUser: {where: {email: req.body.username}}
        };
        try {
            //Check User Type
            let userType = await CommonService.CheckUserTypeByUserEmail(loginDetails.email);
            
            if (!userType)
                return responseHelper.setErrorResponse({message: 'Invalid User Credentials.'}, res, CommonConfig.STATUS_CODE.UNAUTHORIZED);
            
            // If user found generate and get Token and User details.
            let result = await AnonymousService.Authenticate(loginDetails);
            
            if (!result)
                return responseHelper.setErrorResponse({message: 'Invalid User Credentials.'}, res, CommonConfig.STATUS_CODE.UNAUTHORIZED);
            
            return responseHelper.setSuccessResponse(result, res, CommonConfig.STATUS_CODE.OK);
        } catch (error) {
            next(error);
        }
    },
    ResetPassword: async (req, res, next) => {
        try {
            return responseHelper.setSuccessResponse('Reset Password.', res, CommonConfig.STATUS_CODE.OK);
        } catch (error) {
            next(error);
        }
    }
};

//Check facebook user already in database or not
let AnonymousController = {
    Anonymous: Anonymous
};

module.exports = AnonymousController;