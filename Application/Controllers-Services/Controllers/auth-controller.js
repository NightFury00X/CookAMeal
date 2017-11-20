let AuthService = require('../Services/auth-service'),
    responseHelper = require('../../../Configurations/Helpers/ResponseHandler'),
    uploadFile = require('../../../Configurations/Helpers/file-upload-multer');

// The authentication controller.
let AuthController = {};

//Check facebook user already in database or not
AuthController.fb = async (req, res, next) => {
    try {
        let user = await AuthService.fb(req.params.id);
        if (user)
            responseHelper.setSuccessResponse(user, res, 201);
        else
            responseHelper.setErrorResponse({message: 'facebook user not exist.'}, res, 201);
    } catch (error) {
        next(error);
    }
};

// Register a user.
AuthController.signUp = async (req, res, next) => {
    try {
        //upload file
        let files = await uploadFile(req, res);
        
        let registrationData = JSON.parse(req.body.details);
        let result = await AuthService.signup(registrationData, files);
        return responseHelper.setSuccessResponse(result, res, 201);
    } catch (error) {
        next(error);
    }
};

// Authenticate a user.
AuthController.authenticateUser = async (req, res, next) => {
    let loginDetails = {
        email: req.body.username,
        password: req.body.password,
        potentialUser: {where: {email: req.body.username}}
    };
    try {
        //check user type
        let userType = await AuthService.getUserType(loginDetails.email);
        if (!userType)
            return responseHelper.setErrorResponse({message: 'Invalid user credentials.'}, res, 200);
        let result = await AuthService.authenticate(loginDetails);
        if (!result)
            return responseHelper.setErrorResponse({message: 'Invalid user credentials.'}, res, 200);
        return responseHelper.setSuccessResponse(result, res, 200);
    } catch (error) {
        next(error);
    }
};

//Get userDetails
AuthController.getUserData = async (req, res, next) => {
    try {
        let result = await AuthService.getUserData(req.user);
        return responseHelper.setSuccessResponse({message: result}, res, 200);
    } catch (error) {
        next(error);
    }
};

module.exports = AuthController;