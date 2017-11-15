let chalk = require('chalk'),
    log = console.log,
    jwt = require('jsonwebtoken'),
    // config = require('../../../Configurations/Main/config'),
    // BaseService = require('./base-service'),
    responseHelper = require('../../../Configurations/Helpers/ResponseHandler'),
    nodemailer = require('nodemailer'),
    hbs = require('nodemailer-express-handlebars'),
    fs = require('fs'),
    db = require('../../Modals'),
    generateToken = require('../../../Configurations/Helpers/authentication'),
    FileUploader = require('../../../Configurations/Helpers/file-uploader');


AuthService = function () {
};

// AuthService = new BaseService();

AuthService.prototype.signup = async (registrationData, files) => {
    const trans = await db.sequelize.transaction();
    try {
        let user = await db.User.create(registrationData.user, {transaction: trans});
        registrationData.address.user_id = user.id;
        registrationData.social.user_id = user.id;
        await db.Address.create(registrationData.address, {transaction: trans});
        await db.Social.create(registrationData.social, {transaction: trans});
        
        //upload profile image
        if (files.profile) {
            let data = await FileUploader.UploadProfile(files.profile);
            console.log('File: ', data);
        }
        if (files.doc) {
            let data = await FileUploader.UploadDoc(files.doc);
            console.log('File: ', data);
        }
        
        // commit transaction
        await trans.commit();
        return generateToken(user.userInfo);
    } catch (error) {
        // rollback transaction
        await trans.rollback();
        throw (error);
    }
};

AuthService.prototype.authenticate = async (loginDetails) => {
    try {
        let user = await db.User.findOne(loginDetails.potentialUser);
        if (!user)
            return;
        let isMatch = await user.comparePasswords(loginDetails.password);
        if (!isMatch) {
            return;
        }
        return generateToken(user.userInfo);
    } catch (error) {
        throw (error);
    }
};

AuthService.prototype.getUserData = async (userInfo) => {
    try {
        return await db.User.findAll({
            attributes: {exclude: ['password', 'updated_at', 'deleted_at', 'created_at']},
            where: {email: userInfo.email},
            include: [{model: db.Address, paranoid: false, required: true},
                {model: db.Social, paranoid: false, required: true}]
        });
    } catch (error) {
        throw (error);
    }
};

module.exports = new AuthService();