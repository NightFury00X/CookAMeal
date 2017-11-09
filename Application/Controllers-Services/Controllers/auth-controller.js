let chalk = require('chalk'),
    AuthService = require('../Services/auth-service'),
    responseHelper = require('../../../Configurations/Helpers/ResponseHandler');

// The authentication controller.
let AuthController = {};

// Register a user.
AuthController.signUp = async (req, res) => {
    let registrationData = req.body.details;
    try {
        let result = await AuthService.signup(registrationData, res);
        responseHelper.setSuccessResponse({message: result}, res, 201);
    } catch (error) {
        console.log('error: ', error);
        responseHelper.setErrorResponse({message: error}, res, 401);
    }
    
    // .then(function (success) {
    //     AuthService.getUserData(success.user_id)
    //         .then(function (result) {
    //             responseHelper.setSuccessResponse({message: result}, res, 201);
    //         });
    // })
    // .catch(function (error) {
    //     responseHelper.setErrorResponse({message: error.errors}, res, 403);
    // });
};

// Authenticate a user.
AuthController.authenticateUser = function (req, res) {
    req.checkBody('username', 'User Name field required!').notEmpty();
    req.checkBody('password', 'password field required!').notEmpty();
    const errors = req.validationErrors();
    if (errors) {
        res.status(400).json({message: errors});
    } else {
        let loginDetails = {
            email: req.body.username,
            password: req.body.password,
            potentialUser: {where: {email: req.body.username}}
        };
        console.log('user: ', loginDetails);
        AuthService.authenticate(loginDetails, res);
    }
};

//Get userDetails
AuthController.getUserData = function (req, res) {
    AuthService.getUserData(req.user, res);
};

module.exports = AuthController;