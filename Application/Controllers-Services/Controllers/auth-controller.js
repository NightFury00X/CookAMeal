let chalk = require('chalk'),
    AuthService = require('../Services/auth-service');

// The authentication controller.
let AuthController = {};

// Register a user.
AuthController.signUp = function (req, res) {
    req.checkBody('username', 'User Name field required!').notEmpty();
    req.checkBody('password', 'password field required!').notEmpty();
    const errors = req.validationErrors();
    if (errors) {
        res.status(400).json({message: errors});
    } else {
        let newUser = {
            username: req.body.username,
            password: req.body.password
        };
        AuthService.signup(newUser, res);
    }
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
            username: req.body.username,
            password: req.body.password,
            potentialUser: {where: {username: req.body.username}}
        };
        
        AuthService.authenticate(loginDetails, res);
    }
};

//Get userDetails
AuthController.getUserData = function (req, res) {
    console.log('Req', req.user);
    AuthService.getUserData('', res);
};

module.exports = AuthController;