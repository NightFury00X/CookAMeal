let db = require('../../Modals'),
    config = require('../../../Configurations/Main'),
    CommonService = require('./common.service'),
    generateToken = require('../../../Configurations/Helpers/authentication');


AnonymousService = function () {
};

AnonymousService.prototype.SignUp = async (registrationData, files) => {
    const trans = await db.sequelize.transaction();
    try {
        console.log('Registration Data: ', registrationData);
        let userData = registrationData.user;
        userData.allergies = JSON.stringify(userData.allergies);
        
        let type = 1;
        //checking facebook id if exist
        if (registrationData.facebook && registrationData.facebook.fbId) {
            let fb = await CommonService.CheckuserTypeByUserId(registrationData.facebook.fbId);
            if (!fb)
                type = 2;
        }
    
        console.log('User: ', userData);
        
        console.log('User: ', type === 1 ? userData.email : registrationData.facebook.fbId);
    
        console.log('Type: ', type);
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

AnonymousService.prototype.Authenticate = async (loginDetails) => {
    try {
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
            where: {id: user.user_type_id, type: 1},
            include: [{
                model: db.Profile,
                include: [{model: db.MediaObject}]
            }]
        });
        if (!userType)
            return null;
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

module.exports = new AnonymousService();