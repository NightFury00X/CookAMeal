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
                let certificate = files.certificate[0];
                certificate.user_type_id = userType.id;
                certificate.imageurl = CommonConfig.FILE_LOCATIONS.CERTIFICATE + certificate.filename;
                certificateMediaObject = await db.MediaObject.create(certificate, {transaction: trans});
            }
        }

        // committing transaction
        await trans.commit();

        return {
            token: generateToken(userType.userInfo),
            user: {
                id: userType.user_id,
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
            where: {id: user.user_type_id, user_type: CommonConfig.USER_TYPE.NORMAL_USER},
            include: [{
                model: db.Profile,
                include: [{
                    model: db.MediaObject,
                    where: {
                        object_type: CommonConfig.OBJECT_TYPE.PROFILE
                    }
                }]
            }]
        });

        if (!userType)
            return null;

        return {
            token: generateToken(userFound.userInfo),
            user: {
                id: userType.userid,
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

module.exports = new AnonymousService();