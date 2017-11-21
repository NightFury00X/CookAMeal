let responseHelper = require('../../../Configurations/Helpers/ResponseHandler'),
    AnonymousService = require('../Services/anonymous.service'),
    CommonService = require('../Services/common.service'),
    uploadFile = require('../../../Configurations/Helpers/file-upload-multer');

// The authentication controller.
let AnonymousController = {};

//Check facebook user already in database or not
AnonymousController.FbSignIn = async (req, res, next) => {
    try {
        req.check('fbId').notEmpty();
        if (req.validationErrors() || req.validationErrors().length > 0)
            return responseHelper.setErrorResponse({message: 'Unable to connect with facebook.'}, res, 201);
        let fbId = req.body.fbId;
        let user = await CommonService.CheckuserTypeByUserId(fbId);
        if (!user)
            return responseHelper.setErrorResponse({message: 'facebook user not exist.'}, res, 201);
        
        // Get User Details
        let userDetails = await CommonService.GetUserDetailsByUserTypeId(user.id);
        
        //Generate Token        
        let userData = {
            id: userDetails.userid,
            fullname: userDetails.Profile.fullName,
            type: userDetails.type,
            role: userDetails.role,
            profile_url: userDetails.Profile.MediaObject ? userDetails.Profile.MediaObject.imageurl : ''
        };
        let token = await CommonService.GenerateToken(userDetails.userInfo, userData);
        return responseHelper.setSuccessResponse(token, res, 200);
    } catch (error) {
        next(error);
    }
};

AnonymousController.SignUp = async (req, res, next) => {
    try {
        //upload file
        let files = await uploadFile(req, res);
        let registrationData = JSON.parse(req.body.details);
        let result = await CommonService.SignUp(registrationData, files);
        return responseHelper.setSuccessResponse(result, res, 201);
    } catch (error) {
        next(error);
    }
};

AnonymousController.AuthenticateUser = async (req, res, next) => {
    req.check('username').notEmpty();
    req.check('password').notEmpty();
    if (req.validationErrors() || req.validationErrors().length > 0)
        return responseHelper.setErrorResponse({message: 'Invalid User Credentials.'}, res, 201);
    let loginDetails = {
        email: req.body.username,
        password: req.body.password,
        potentialUser: {where: {email: req.body.username}}
    };
    try {
        //Check User Type
        let userType = await CommonService.CheckuserTypeByUserId(loginDetails.email);
        if (!userType)
            return responseHelper.setErrorResponse({message: 'Invalid User Credentials.'}, res, 200);
        
        // If user found generate and get Token and User details.
        let result = await AnonymousService.Authenticate(loginDetails);
        if (!result)
            return responseHelper.setErrorResponse({message: 'Invalid User Credentials.'}, res, 200);
        return responseHelper.setSuccessResponse(result, res, 200);
    } catch (error) {
        next(error);
    }
};

AnonymousController.ResetPassword = async (req, res, next) => {
    try {
        return responseHelper.setSuccessResponse('Reset Password.', res, 200);
    } catch (error) {
        next(error);
    }
};

module.exports = AnonymousController;