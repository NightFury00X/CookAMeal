let AuthService = require('../Services/auth-service'),
    responseHelper = require('../../../Configurations/Helpers/ResponseHandler');

// The authentication controller.
let AuthController = {};

// Register a user.
AuthController.signUp = async (req, res, next) => {
    console.log('Request: ', req.body.details.replace('[', '{').replace(']', '}'));
    let registrationData = req.body.details.replace('[', '{').replace(']', '}');
    try {
        let result = await AuthService.signup(registrationData, req.files);
        responseHelper.setSuccessResponse({message: result}, res, 201);
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
        let result = await AuthService.authenticate(loginDetails);
        if (!result)
            responseHelper.setErrorResponse({message: 'Invalid user credentials.'}, res, 200);
        responseHelper.setSuccessResponse({Token: result}, res, 200);
    } catch (error) {
        next(error);
    }
};

//Get userDetails
AuthController.getUserData = async (req, res, next) => {
    try {
        let result = await AuthService.getUserData(req.user);
        responseHelper.setSuccessResponse({message: result}, res, 200);
    } catch (error) {
        next(error);
    }
};

module.exports = AuthController;