let chalk = require('chalk'),
    log = console.log,
    jwt = require('jsonwebtoken'),
    config = require('../../../Configurations/Main/config'),
    // BaseService = require('./base-service'),
    responseHelper = require('../../../Configurations/Helpers/ResponseHandler'),
    nodemailer = require('nodemailer'),
    hbs = require('nodemailer-express-handlebars'),
    db = require('../../Modals'),
    generateToken = require('../../../Configurations/Helpers/authentication');


AuthService = function () {
};

// AuthService = new BaseService();

AuthService.prototype.signup = async (registrationData, res) => {
    const trans = await db.sequelize.transaction();
    try {
        console.log('db: ', registrationData);
        let user = await db.User.create(registrationData.user, {transaction: trans});
        registrationData.address.user_id = user.id;
        registrationData.social.user_id = user.id;
        let a =await db.Address.create(registrationData.address, {transaction: trans});
        await db.Social.create(registrationData.social, {transaction: trans});
        let d = await trans.commit();
        console.log(d);
        // return a;
    } catch (error) {
        await trans.rollback();
        throw (error);
    }

    // let address = await db.AddressModel.create(registrationData.address);
    // let social = await db.SocialModel.create(registrationData.social);
    // return user;
    // return db.sequelize.transaction(function (t) {
    //     return db.UserModel.create(registrationData.user, {transaction: t})
    //         .then(function (user) {
    //             registrationData.user.user_id = user.id;
    //             return db.AddressModel.create(registrationData.address, {transaction: t})
    //                 .then(function () {
    //                     registrationData.social.user_id = user.id;
    //                     return db.SocialModel.create(registrationData.social, {transaction: t})
    //                 })
    //         });
    // }).then(function (result) {
    //     return result;
    // }).catch(function (error) {
    //     throw (error);
    // });
};

AuthService.prototype.authenticate = function (loginDetails, res) {
    db.UserModel.findOne(loginDetails.potentialUser)
        .then(function (user) {
            if (!user) {
                res.status(404).json({message: 'Authentication failed!'});
            } else {
                user.comparePasswords(loginDetails.password, function (error, isMatch) {
                    if (isMatch && !error) {
                        let userInfo = {
                            id: user.id,
                            username: user.email,
                            role: user.role
                        };
                        let token = generateToken(userInfo);
                        responseHelper.setSuccessResponse({
                            token: 'JWT ' + token,
                            role: user.role
                        }, res, 200);
                    } else {
                        responseHelper.setErrorResponse({message: 'Login failed!'}, res, 403);
                    }
                });
            }
        })
        .catch(function () {
            log(chalk.gray.bgRed.bold('Login Failed!'));
            responseHelper.setErrorResponse({message: 'There was an error!'}, res, 403);
        });
};

AuthService.prototype.getUserData = function (user, res) {
    db.UserModel.findAll({
        include: [{model: db.AddressModel, paranoid: false, required: true}]
    }).then(function (data) {
        responseHelper.setSuccessResponse({
            user
        }, res, 200);
    }).catch(function (error) {
        responseHelper.setErrorResponse({
            error
        }, res, 403);
    });
};

module.exports = new AuthService();