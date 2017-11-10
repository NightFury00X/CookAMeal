let chalk = require('chalk'),
    AuthService = require('../Services/auth-service'),
    responseHelper = require('../../../Configurations/Helpers/ResponseHandler');

// The authentication controller.
let AuthController = {};

// Register a user.
AuthController.signUp = async (req, res) => {
    let registrationData = req.body.details;
    try {
        let result = await AuthService.signup(registrationData);
        responseHelper.setSuccessResponse({message: result}, res, 201);
    } catch (error) {
        console.log(error);
        responseHelper.setErrorResponse({message: error.message.replace(',\n', ',').split(',')}, res, 400);
    }
};

// Authenticate a user.
AuthController.authenticateUser = async (req, res) => {
    let loginDetails = {
        email: req.body.username,
        password: req.body.password,
        potentialUser: {where: {email: req.body.username}}
    };
    try {
        let result = await AuthService.authenticate(loginDetails);       
        responseHelper.setSuccessResponse({message: result}, res, 200);
    } catch (error) {
        responseHelper.setErrorResponse({message: error}, res, 400);
    }
};

//Get userDetails
AuthController.getUserData = function (req, res) {
    AuthService.getUserData(req.user, res);
};

module.exports = AuthController;