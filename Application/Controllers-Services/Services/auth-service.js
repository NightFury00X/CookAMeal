let db = require('../../Modals'),
    config = require('../../../Configurations/Main'),
    generateToken = require('../../../Configurations/Helpers/authentication'),
    commonService = require('./anonymous.service');


AuthService = function () {
};

AuthService.prototype.fb = async (fbId) => {
    try {
         return await db.UserType.findAll({
            attributes: ['id'],
            where: {userid: fbId},
            raw: true
        });
    } catch (error) {
        return error;
    }
};

AuthService.prototype.signup = async (registrationData, files) => {
    const trans = await db.sequelize.transaction();
    try {
        let userData = registrationData.user;
        userData.allergies = JSON.stringify(userData.allergies);
        
        let type = 1;
        //checking facebook id if exist
        if (registrationData.facebook && registrationData.facebook.fbId) {
            let fb = await commonService.CheckuserTypeByFbId(registrationData.facebook.fbId);
            if (!fb)
                type = 2;
        }
        
        console.log('User: ', type === 1 ? userData.email : registrationData.facebook.fbId);
        
        // Add user type
        let userType = await db.UserType.create({
            userid: type === 1 ? userData.email : registrationData.facebook.fbId,
            type: type,
            role: userData.type
        }, {transaction: trans});
        
        //add user login data
        if (type === 1) {
            await db.User.create({
                user_type_id: userType.id,
                email: userData.email,
                password: userData.password
            }, {transaction: trans});
        }
        
        //add user profile data
        let tempData = userData;
        delete tempData.password;
        tempData.user_type_id = userType.id;
        let userProfileData = await db.Profile.create(tempData, {transaction: trans});
        
        registrationData.address.profile_id = userProfileData.id;
        registrationData.social.profile_id = userProfileData.id;
        await db.Address.create(registrationData.address, {transaction: trans});
        await db.Social.create(registrationData.social, {transaction: trans});
        
        //upload profile image
        let mediaObject;
        if (files && files.profile) {
            let profileImage = files.profile[0];
            profileImage.profile_id = userProfileData.id;
            profileImage.imageurl = config.UPLOAD_LOCATION + profileImage.filename;
            mediaObject = await db.MediaObject.create(profileImage, {transaction: trans});
        }
        
        // commit transaction
        await trans.commit();
        return {
            token: generateToken(userType.userInfo),
            user: {
                id: userType.userid,
                fullname: userProfileData.fullName,
                type: userType.type,
                role: userType.role,
                profile_url: mediaObject ? mediaObject.imageurl : ''
            }
        };
    } catch (error) {
        // rollback transaction
        await trans.rollback();
        throw (error);
    }
};

AuthService.prototype.Authenticate = async (loginDetails) => {
    try {
        console.log('loginDetails: ', loginDetails);
        let user = await db.User.findOne(loginDetails.potentialUser);
        if (!user)
            return;
        let isMatch = await user.comparePasswords(loginDetails.password);
        if (!isMatch)
            return;
        let userFound = await db.UserType.findOne({
            where: {id: user.user_type_id}
        });
        
        let userType = await db.UserType.findOne({
            where: {id: user.user_type_id},
            include: [{
                model: db.Profile,
                include: [{model: db.MediaObject}]
            }]
        });
        return {
            token: generateToken(userFound.userInfo),
            user: {
                id: userType.userid,
                fullname: userType.Profile.fullName,
                type: userType.type,
                role: userType.role,
                profile_url: userType.Profile.MediaObject ? userType.Profile.MediaObject.imageurl : ''
            }
        };
    } catch (error) {
        throw (error);
    }
};

AuthService.prototype.GetUserData = async (userInfo) => {
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

AuthService.prototype.getUserType = async (userId) => {
    try {
        return await db.UserType.findOne({
            attributes: ['id'],
            where: {userid: userId, type: 1},
            raw: true
        });
    } catch (error) {
        throw (error);
    }
};

module.exports = new AuthService();