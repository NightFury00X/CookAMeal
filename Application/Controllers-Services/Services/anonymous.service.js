let db = require('../../Modals'),
    CommonService = require('./common.service'),
    {generateToken} = require('../../../Configurations/Helpers/authentication'),
    CommonConfig = require('../../../Configurations/Helpers/common-config'),
    Email = require('../../../Configurations/Helpers/send-email');

AnonymousService = function () {
};

AnonymousService.prototype.SignUp = async (registrationData, files) => {
    const trans = await db.sequelize.transaction();
    try {
        let userData = registrationData.user;
        if (userData.allergies)
            userData.allergies = JSON.stringify(userData.allergies);
        
        let type = CommonConfig.USER_TYPE.NORMAL_USER;
        
        //checking facebook id if exist
        if (registrationData.facebook && registrationData.facebook.fbid) {
            let fb = await CommonService.CheckUserTypeByUserId(registrationData.facebook.fbid);
            if (!fb)
                type = CommonConfig.USER_TYPE.FACEBOOK_USER;
        }
        
        // Add user type
        let userType = await db.UserType.create({
            user_id: type === CommonConfig.USER_TYPE.NORMAL_USER ? userData.email : registrationData.facebook.fbid,
            user_type: type,
            user_role: userData.user_role
        }, {transaction: trans});
        
        //add user login data
        if (type === CommonConfig.USER_TYPE.NORMAL_USER) {
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
        
        //Adding user address and social
        registrationData.address.profile_id = userProfileData.id;
        registrationData.social.profile_id = userProfileData.id;
        await db.Address.create(registrationData.address, {transaction: trans});
        await db.Social.create(registrationData.social, {transaction: trans});
        
        
        //upload profile image
        let ProfileMediaObject;
        let IdenitificateMediaObject;
        let certificateMediaObject;
        let identificationCardData;
        
        if (files) {
            if (files.profile) {
                let profileImage = files.profile[0];
                profileImage.profile_id = userProfileData.id;
                profileImage.object_type = CommonConfig.OBJECT_TYPE.PROFILE;
                profileImage.imageurl = CommonConfig.FILE_LOCATIONS.PROFILE + profileImage.filename;
                ProfileMediaObject = await db.MediaObject.create(profileImage, {transaction: trans});
            }
            if (files.identification_card) {
                //Adding Identification Card Details
                if (registrationData.identification_card) {
                    let identificationCard = registrationData.identification_card
                    identificationCard.user_type_id = userType.id;
                    
                    identificationCardData = await db.IdentificationCard.create(identificationCard, {transaction: trans});
                }
                
                let identificationCardMedia = files.identification_card[0];
                identificationCardMedia.identification_card_id = identificationCardData.id;
                identificationCardMedia.object_type = CommonConfig.OBJECT_TYPE.IDENTIFICATIONCARD;
                identificationCardMedia.imageurl = CommonConfig.FILE_LOCATIONS.IDENTIFICATIONCARD + identificationCardMedia.filename;
                
                IdenitificateMediaObject = await db.MediaObject.create(identificationCardMedia, {transaction: trans});
            }
            if (files.certificate) {
                let certificateData = await db.Certificate.create({profile_id: userProfileData.id}, {transaction: trans});
                let certificateMedia = files.certificate[0];
                certificateMedia.certificate_id = certificateData.id;
                certificateMedia.object_type = CommonConfig.OBJECT_TYPE.CERTIFICATE;
                certificateMedia.imageurl = CommonConfig.FILE_LOCATIONS.CERTIFICATE + certificateMedia.filename;
                certificateMediaObject = await db.MediaObject.create(certificateMedia, {transaction: trans});
            }
        }
        
        // committing transaction
        await trans.commit();
        
        return {
            token: generateToken(userType.userInfo, false),
            user: {
                id: userType.id,
                email: userProfileData.email,
                fullname: userProfileData.fullName,
                user_type: userType.user_type,
                user_role: userType.user_role,
                profile_url: ProfileMediaObject ? ProfileMediaObject.imageurl : ''
            }
        };
    } catch (error) {
        // rollback transaction
        await trans.rollback();
        throw (error);
    }
};

AnonymousService.prototype.Authenticate = async (userTypeId, type) => {
    try {
        let userType = await db.UserType.findOne({
            where: {id: userTypeId, user_type: CommonConfig.USER_TYPE.NORMAL_USER},
            include: [{
                model: db.Profile,
                include: [{
                    model: db.MediaObject
                }]
            }]
        });
        
        return {
            token: generateToken(userType.userInfo, type),
            user: {
                id: userType.id,
                email: userType.Profile.email,
                fullname: userType.Profile.fullName,
                user_type: userType.user_type,
                user_role: userType.user_role,
                profile_url: userType.Profile.MediaObjects.length > 0 ? userType.Profile.MediaObjects[0].imageurl : ''
            }
        };
    } catch (error) {
        throw (error);
    }
};

AnonymousService.prototype.AddResetPasswordDetails = async (userDetails, email) => {
    const trans = await db.sequelize.transaction();
    try {
        //get user info
        let userInfo = await CommonService.GetUserDetailsByUserTypeId(userDetails.user_type_id);
        
        if (!userInfo) {
            trans.rollback();
            return null;
        }
        let fullname = userInfo.Profile.firstname + ' ' + userInfo.Profile.lastname;
        
        let data = await db.ResetPassword.create(userDetails, {transaction: trans});
        
        if (!data) {
            trans.rollback();
            return null;
        }
        
        let isSent = await Email.ToResetPassword({
            fullname: fullname,
            email: email,
            key: userDetails.random_key
        });
        
        if (!isSent) {
            trans.rollback();
            return null;
        }
        
        // committing transaction
        await trans.commit();
        
        return isSent;
    } catch (error) {
        // rollback transaction
        await trans.rollback();
        throw (error);
    }
};

AnonymousService.prototype.SendResetPasswordKeyToMail = async (email) => {
    try {
        //get user info
        let tokenData = await db.UserType.findOne({
            where: {
                user_id: email
            },
            attributes: ['id'],
            include: [{
                attributes: ['firstname', 'lastname'],
                model: db.Profile
            }, {
                where: {status: 1, is_valid: 1},
                attributes: ['random_key'],
                model: db.ResetPassword
            }]
        });
        
        if (!tokenData)
            return null;
        
        let fullname = tokenData.Profile.firstname + ' ' + tokenData.Profile.lastname;
        let keyValue = tokenData.ResetPasswords[0].random_key;
        
        return await Email.ToResetPassword({
            fullname: fullname,
            email: email,
            key: keyValue
        });
        
    } catch (error) {
        throw (error);
    }
};

module.exports = new AnonymousService();