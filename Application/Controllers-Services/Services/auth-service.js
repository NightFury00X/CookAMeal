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
        let userData = registrationData.user;
        
        // Add user type
        let userType = await db.UserType.create({
            userid: userData.email,
            type: 1,
            role: userData.type
        }, {transaction: trans});
        // console.log('User Type: ', userType);
        
        //add user login data
        let userCredentialsData = await db.User.create({
            user_type_id: userType.id,
            email: userData.email,
            password: userData.password
        }, {transaction: trans});
        // console.log('User Credentials: ', userCredentialsData);
        
        //add user profile data
        let tempData = userData;
        delete tempData.password;
        tempData.user_type_id = userType.id;
        tempData.user_id = userCredentialsData.id;
        // console.log('TempData: ', tempData);
        let userProfileData = await db.Profile.create(tempData, {transaction: trans});
        // console.log('User Profile: ', userProfileData);
        // let user = await db.User.create(registrationData.user, {transaction: trans});
        registrationData.address.profile_id = userProfileData.id;
        registrationData.social.profile_id = userProfileData.id;
        await db.Address.create(registrationData.address, {transaction: trans});
        await db.Social.create(registrationData.social, {transaction: trans});
        
        // console.log('Files: ', files);
        //upload profile image
        if (files && files.profile) {
            let data = await FileUploader.UploadProfile(files.profile);
            console.log('File: ', data);
        }
        if (files && files.doc) {
            let data = await FileUploader.UploadDoc(files.doc);
            console.log('File: ', data);
        }
        
        // commit transaction
        await trans.commit();
        console.log('user Type: ', userType.userInfo);
        return generateToken(userType.userInfo);
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