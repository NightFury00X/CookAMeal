let db = require('../../Modals'),
    config = require('../../../Configurations/Main'),
    generateToken = require('../../../Configurations/Helpers/authentication');


AuthService = function () {
};

// AuthService = new BaseService();

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
        
        // Add user type
        let userType = await db.UserType.create({
            userid: userData.email,
            type: 1,
            role: userData.type
        }, {transaction: trans});
        
        //add user login data
        let userCredentialsData = await db.User.create({
            user_type_id: userType.id,
            email: userData.email,
            password: userData.password
        }, {transaction: trans});
        
        //add user profile data
        let tempData = userData;
        delete tempData.password;
        tempData.user_type_id = userType.id;
        tempData.user_id = userCredentialsData.id;
        let userProfileData = await db.Profile.create(tempData, {transaction: trans});
        
        registrationData.address.profile_id = userProfileData.id;
        registrationData.social.profile_id = userProfileData.id;
        await db.Address.create(registrationData.address, {transaction: trans});
        await db.Social.create(registrationData.social, {transaction: trans});
        
        //upload profile image
        if (files && files.profile) {
            let profileImage = files.profile[0];
            profileImage.user_type_id = userType.id;
            profileImage.imageurl = config.UPLOAD_LOCATION + profileImage.filename;
            await db.MediaObject.create(profileImage, {transaction: trans});
        }
        
        // commit transaction
        await trans.commit();
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
        if (!isMatch)
            return;
        let userFound = await db.UserType.findOne({
            where: {id: user.user_type_id}
        });
        return generateToken(userFound.userInfo);
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