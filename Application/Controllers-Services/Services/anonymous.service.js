let db = require('../../Modals'),
    config = require('../../../Configurations/Main'),
    CommonService = require('./common.service'),
    generateToken = require('../../../Configurations/Helpers/authentication'),
    CommonConfig = require('../../../Configurations/Helpers/common-config');

AnonymousService = function () {
};

AnonymousService.prototype.SignUp = async (registrationData, files) => {
    const trans = await db.sequelize.transaction();
    try {
        let userData = registrationData.user;
        userData.allergies = JSON.stringify(userData.allergies);
        
        let type = CommonConfig.UserType.Normal_User;
        //checking facebook id if exist
        if (registrationData.facebook && registrationData.facebook.fbId) {
            let fb = await CommonService.CheckUserTypeByUserId(registrationData.facebook.fbId);
            if (!fb)
                type = CommonConfig.UserType.Facebook_User;
        }
        
        // Add user type
        let userType = await db.UserType.create({
            userid: type === CommonConfig.UserType.Normal_User ? userData.email : registrationData.facebook.fbId,
            type: type,
            role: userData.type
        }, {transaction: trans});
        
        //add user login data
        if (type === CommonConfig.UserType.Normal_User) {
            await db.User.create({
                user_type_id: userType.id,
                email: userData.email,
                password: userData.password
            }, {transaction: trans});
        }
        
        //upload profile image
        let ProfileMediaObject;
        let IdenitificateMediaObject;
        let certificateMediaObject;
        let identificationCardData;
        
        if (files) {
            if (files.profile) {
                let profileImage = files.profile[0];
                profileImage.user_type_id = userType.id;
                profileImage.objectType = CommonConfig.ObjectType.Profile;
                profileImage.imageurl = config.UPLOAD_LOCATION + profileImage.filename;
                ProfileMediaObject = await db.MediaObject.create(profileImage, {transaction: trans});
            }
            if (files.identificationCard) {
                let identificationCardMedia = files.identificationCard[0];
                identificationCardMedia.user_type_id = userType.id;
                identificationCardMedia.objectType = CommonConfig.ObjectType.IdentificationCard;
                identificationCardMedia.imageurl = config.UPLOAD_LOCATION + identificationCardMedia.filename;
                IdenitificateMediaObject = await db.MediaObject.create(identificationCardMedia, {transaction: trans});
    
                //Adding Identification Card Details
                if(registrationData.identificationCard) {
                    let identificationCard = registrationData.identificationCard
    
                    identificationCard.media_object_id = IdenitificateMediaObject.id;
                    identificationCard.user_type_id = userType.id;
    
                    identificationCardData = await db.IdentificationCard.create(identificationCard, {transaction: trans});
                }
            }
            // if (files.certificate) {
            //     let certificate = files.certificate[0];
            //     certificate.user_type_id = userType.id;
            //     certificate.imageurl = config.UPLOAD_LOCATION + certificate.filename;
            //     certificateMediaObject = await db.MediaObject.create(certificate, {transaction: trans});
            // }
        }
        
        //add user profile data
        let tempData = userData;
        delete tempData.password;
        tempData.user_type_id = userType.id;
        tempData.media_object_id =ProfileMediaObject? ProfileMediaObject.id : null;
        let userProfileData = await db.Profile.create(tempData, {transaction: trans});
        
        //Adding user address and social
        registrationData.address.profile_id = userProfileData.id;
        registrationData.social.profile_id = userProfileData.id;
        await db.Address.create(registrationData.address, {transaction: trans});
        await db.Social.create(registrationData.social, {transaction: trans});        
        
        // committing transaction
        await trans.commit();
        
        return {
            token: generateToken(userType.userInfo),
            user: {
                id: userType.userid,
                fullname: userProfileData.fullName,
                type: userType.type,
                role: userType.role,
                profile_url: ProfileMediaObject ? ProfileMediaObject.imageurl : ''
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
            where: {id: user.user_type_id, type: 2},
            include: [{
                model: db.Profile
            }, {
                model: db.MediaObject
            }],
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
                profile_url: userType.MediaObjects ? userType.MediaObjects[0].imageurl : ''
            }
        };
    } catch (error) {
        throw (error);
    }
};

module.exports = new AnonymousService();