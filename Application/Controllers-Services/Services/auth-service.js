let chalk = require('chalk'),
    log = console.log,
    jwt = require('jsonwebtoken'),
    // config = require('../../../Configurations/Main/config'),
    // BaseService = require('./base-service'),
    responseHelper = require('../../../Configurations/Helpers/ResponseHandler'),
    nodemailer = require('nodemailer'),
    hbs = require('nodemailer-express-handlebars'),
    db = require('../../Modals'),
    generateToken = require('../../../Configurations/Helpers/authentication');


AuthService = function () {
};

// AuthService = new BaseService();

AuthService.prototype.signup = async (registrationData) => {
    const trans = await db.sequelize.transaction();
    try {
        let user = await db.User.create(registrationData.user, {transaction: trans});
        registrationData.address.user_id = user.id;
        registrationData.social.user_id = user.id;
        await db.Address.create(registrationData.address, {transaction: trans});
        await db.Social.create(registrationData.social, {transaction: trans});
        await trans.commit();
        return generateToken(user.userInfo);
    } catch (error) {
        await trans.rollback();
        throw (error);
    }
};

AuthService.prototype.authenticate = async (loginDetails) => {
    let user = await db.User.findOne(loginDetails.potentialUser);
    if(!user)
        throw ('User not found.'); 
    let isMatch = await user.comparePasswords(loginDetails.password);
    if (isMatch) {
        return generateToken(user.userInfo);
    } else {
        throw ('Login Failed.');
    }
};

AuthService.prototype.getUserData = function (user, res) {
    db.User.findAll({
        include: [{model: db.Address, paranoid: false, required: true}]
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