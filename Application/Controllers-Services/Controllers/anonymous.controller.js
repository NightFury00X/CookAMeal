let responseHelper = require('../../../Configurations/Helpers/ResponseHandler'),
    AnonymousService = require('../Services/anonymous.service'),
    CommonService = require('../Services/common.service'),
    uploadFile = require('../../../Configurations/Helpers/file-upload-multer'),
    CommonConfig = require('../../../Configurations/Helpers/common-config');

// The authentication controller.
let Anonymous = {
    FbSignIn: async (req, res, next) => {
        try {
            req.check('fbId').notEmpty();
            if (req.validationErrors() || req.validationErrors().length > 0)
                return responseHelper.setErrorResponse({message: 'Unable to connect with facebook.'}, res, 201);
            let fbId = req.body.fbId;
            let user = await CommonService.CheckUserTypeByUserId(fbId);
            if (!user)
                return responseHelper.setErrorResponse({message: 'facebook user not exist.'}, res, CommonConfig.StatusCode.OK);
            
            // Get User Details
            let userDetails = await CommonService.GetUserDetailsByUserTypeId(user.id);
            
            console.log('User Details: ', userDetails);
            //Generate Token        
            let userData = {
                id: userDetails.userid,
                fullname: userDetails.Profile.fullName,
                type: userDetails.type,
                role: userDetails.role,
                profile_url: userDetails.Profile.MediaObject ? userDetails.Profile.MediaObject.imageurl : ''
            };
            let token = await CommonService.GenerateToken(userDetails.userInfo, userData);
            return responseHelper.setSuccessResponse(token, res, CommonConfig.StatusCode.OK);
        } catch (error) {
            next(error);
        }
    },
    SignUp: async (req, res, next) => {
        try {
            //upload file
            let files = await uploadFile(req, res);
            let registrationData = JSON.parse(req.body.details);
            console.log('Data: ', registrationData);
            console.log('--------------------------------------------------------------------------');
            console.log('Files: ', files);
            let result = await AnonymousService.SignUp(registrationData, files);
            return responseHelper.setSuccessResponse(result, res, CommonConfig.StatusCode.CREATED);
        } catch (error) {
            next(error);
        }
    },
    AuthenticateUser: async (req, res, next) => {
        req.check('username').notEmpty();
        req.check('password').notEmpty();
        if (req.validationErrors() || req.validationErrors().length > 0)
            return responseHelper.setErrorResponse({message: 'Bad Request '}, res, CommonConfig.StatusCode.BAD_REQUEST);
        let loginDetails = {
            email: req.body.username,
            password: req.body.password,
            potentialUser: {where: {email: req.body.username}}
        };
        try {
            //Check User Type
            let userType = await CommonService.CheckUserTypeByUserId(loginDetails.email);            
            
            if (!userType)
                return responseHelper.setErrorResponse({message: 'Invalid User Credentials.'}, res, CommonConfig.StatusCode.UNAUTHORIZED);
            
            // If user found generate and get Token and User details.
            let result = await AnonymousService.Authenticate(loginDetails);
    
            if (!result)
                return responseHelper.setErrorResponse({message: 'Invalid User Credentials.'}, res, CommonConfig.StatusCode.UNAUTHORIZED);
            
            console.log('Login Details: ', result);
            return responseHelper.setSuccessResponse(result, res, CommonConfig.StatusCode.OK);
        } catch (error) {
            next(error);
        }
    },
    ResetPassword: async (req, res, next) => {
        try {
            return responseHelper.setSuccessResponse('Reset Password.', res, CommonConfig.StatusCode.OK);
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