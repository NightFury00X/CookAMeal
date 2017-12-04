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
        // let IdenitificateMediaObject;
        // let certificateMediaObject;
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
                    let identificationCard = registrationData.identification_card;
                    identificationCard.user_type_id = userType.id;
                    
                    identificationCardData = await db.IdentificationCard.create(identificationCard, {transaction: trans});
                }
                
                let identificationCardMedia = files.identification_card[0];
                identificationCardMedia.identification_card_id = identificationCardData.id;
                identificationCardMedia.object_type = CommonConfig.OBJECT_TYPE.IDENTIFICATIONCARD;
                identificationCardMedia.imageurl = CommonConfig.FILE_LOCATIONS.IDENTIFICATIONCARD + identificationCardMedia.filename;
                
                await db.MediaObject.create(identificationCardMedia, {transaction: trans});
            }
            if (files.certificate) {
                let certificateData = await db.Certificate.create({profile_id: userProfileData.id}, {transaction: trans});
                let certificateMedia = files.certificate[0];
                certificateMedia.certificate_id = certificateData.id;
                certificateMedia.object_type = CommonConfig.OBJECT_TYPE.CERTIFICATE;
                certificateMedia.imageurl = CommonConfig.FILE_LOCATIONS.CERTIFICATE + certificateMedia.filename;
                await db.MediaObject.create(certificateMedia, {transaction: trans});
            }
        }
        
        // committing transaction
        await trans.commit();
        
        return {
            token: generateToken(userType.userInfo, null, true),
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

AnonymousService.prototype.Authenticate = async (userDetails) => {
    try {
        let userTypeDetails;
        if (userDetails.token_status && userDetails.token_id) {
            userTypeDetails = await db.UserType.findOne({
                where: {id: userDetails.user_type_id, user_type: CommonConfig.USER_TYPE.NORMAL_USER},
                include: [{
                    model: db.Profile,
                    include: [{
                        model: db.MediaObject
                    }],
                }, {
                    model: db.ResetPassword,
                    where: {
                        id: userDetails.token_id,
                        is_valid: true,
                        status: true
                    }
                }]
            });
        } else {
            userTypeDetails = await db.UserType.findOne({
                where: {id: userDetails.user_type_id, user_type: CommonConfig.USER_TYPE.NORMAL_USER},
                include: [{
                    model: db.Profile,
                    include: [{
                        model: db.MediaObject
                    }]
                }]
            });
        }
        
        return {
            token: !userDetails.token_status ? generateToken(userTypeDetails.userInfo, false, true) : userTypeDetails.ResetPasswords[0].token,
            user: {
                id: userTypeDetails.id,
                email: userTypeDetails.Profile.email,
                fullname: userTypeDetails.Profile.fullName,
                user_type: userTypeDetails.user_type,
                user_role: userTypeDetails.user_role,
                profile_url: userTypeDetails.Profile.MediaObjects.length > 0 ? userTypeDetails.Profile.MediaObjects[0].imageurl : ''
            }
        };
    } catch (error) {
        throw (error);
    }
};

AnonymousService.prototype.AddResetPasswordDetails = async (userDetails, email, token_data) => {
    const trans = await db.sequelize.transaction();
    try {
        //invalidate token if token expired
        if (token_data && !token_data.token_status) {
            let data = await db.ResetPassword.update({
                is_valid: false,
                status: false
            }, {
                where: {id: token_data.token_id}
            }, {transaction: trans});
            if (!data) {
                await trans.rollback();
                return null;
            }
        }
        //get user info
        let userInfo = await CommonService.GetUserDetailsByUserTypeId(userDetails.user_type_id);
        
        if (!userInfo) {
            await trans.rollback();
            return null;
        }
        let fullname = userInfo.Profile.firstname + ' ' + userInfo.Profile.lastname;
        
        let data = await db.ResetPassword.create(userDetails, {transaction: trans});
        
        if (!data) {
            await trans.rollback();
            return null;
        }
        
        console.log('Sending mail ... Please wait......');
        console.log('waiting...');
        let isSent = await Email.ToResetPassword({
            fullname: fullname,
            email: email,
            key: userDetails.random_key
        });
        
        if (!isSent) {
            await trans.rollback();
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
        
        console.log('Sending mail ... Please wait......');
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