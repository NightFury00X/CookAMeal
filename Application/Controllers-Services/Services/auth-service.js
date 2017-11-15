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
    generateToken = require('../../../Configurations/Helpers/authentication');


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
        // upload user profile image
        if (files) {
            let filename = (new Date).valueOf() + '-' + files[0].originalname;
            files[0].user_id = user.id;
            files[0].imageurl = 'http://cookamealapi.cynotecksandbox.com/' + files[0].destination + '/' + filename;
            let uploadedFile = await db.MediaObject.create(files[0], {transaction: trans});
            if (uploadedFile) {
                fs.rename(files[0].path, 'public/profile/' + filename, function (error) {
                    if (error) throw error;
                    console.log('File Uploaded...');
                });
            }
        }          
        //commit transaction
        await trans.commit();
        return generateToken(user.userInfo);
    } catch (error) {
        //rollback transaction
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