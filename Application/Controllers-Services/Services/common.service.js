let randomString = require('random-string'),
    db = require('../../Modals'),
    generateToken = require('../../../Configurations/Helpers/authentication'),
    CommonConfig = require('../../../Configurations/Helpers/common-config');

CommonService = function () {
};

CommonService.prototype.GetResetPasswordData = async (email) => {
    try {
        return await db.ResetPassword.findOne({
            where: {
                email: email
            }
        });
    } catch (error) {
        return error;
    }
};

CommonService.prototype.GetUserTypeDetailsById = async (userId) => {
    try {
        return await db.UserType.findById(userId);
    } catch (error) {
        return error;
    }
};

CommonService.prototype.CheckUserTypeByUserEmail = async (email) => {
    try {
        return await db.UserType.findOne({
            attributes: ['id'],
            where: {user_id: email}
        });
    } catch (error) {
        return error;
    }
};

CommonService.prototype.CheckUserTypeByUserId = async (fbId) => {
    try {
        return await db.UserType.findOne({
            attributes: ['id'],
            where: {user_id: fbId}
        });
    } catch (error) {
        return error;
    }
};

CommonService.prototype.GetUserDetailsByUserTypeId = async (userTypeId) => {
    try {
        return await db.UserType.findOne({
            where: {id: userTypeId},
            include: [{
                model: db.Profile,
                include: [{
                    model: db.MediaObject
                }]
            }]
        });
    } catch (error) {
        return error;
    }
};

CommonService.prototype.GenerateToken = async (tokenData, userData) => {
    try {
        return {
            token: generateToken(tokenData),
            userDetails: userData
        };
    } catch (error) {
        return error;
    }
};

CommonService.prototype.GetCategories = async () => {
    try {
        return await db.Category.findAll({
            attributes: ['id', 'name'],
            include: [
                {
                    model: db.MediaObject,
                    attributes: ['imageurl'],
                    where: {
                        imageurl: {
                            $ne: null
                        }
                    }
                }
            ]
        });
    } catch (error) {
        return error;
    }
};

CommonService.prototype.GetCategoryById = async (catId) => {
    try {
        return await db.Category.findOne({
            attributes: ['id', 'name'],
            where: {id: catId},
            include: [{model: db.MediaObject, attributes: ['imageurl']}]
        });
    } catch (error) {
        return error;
    }
};

CommonService.prototype.GenerateRandomKey = async () => {
    return randomString(CommonConfig.OPTIONS.RANDOM_KEYS);
};

CommonService.prototype.GenerateUnique16DigitKey = async () => {
    return randomString(CommonConfig.OPTIONS.UNIQUE_RANDOM_KEYS);
};

CommonService.prototype.ChangePassword = async (userDetails) => {
    const trans = await db.sequelize.transaction();
    try {
        // Check reset password is requested or not.        
        let records = await db.ResetPassword.findOne({
            where: {
                user_type_id: userDetails.id,
                status: true,
                is_valid: true
            }
        });
        console.log('u r here');
        if (!records) {
            trans.rollback();
            return null;
        }
        console.log('u r here');
        // console.log(resetPasswordData);
        // If reset password requested, update the record in ResetPassword
        let resetPasswordData = await db.ResetPassword.update({
            is_valid: false,
            status: false,
        }, {
            where: {
                id: records.id,
                email: records.email
            }
        }, {transaction: trans});
    
        
        if (!resetPasswordData) {
            trans.rollback();
            return null;
        }
        
        // Update password field in user table
        let userData = await db.User.update({
            password: userDetails.password
        }, {
            where: {
                user_type_id: userDetails.id,
                email: userDetails.email
            }
        }, {transaction: trans});
        
        if (!userData) {
            trans.rollback();
            return null;
        }
        console.log('password changed');
        return await trans.commit();
    }
    catch (error) {
        await trans.rollback();
        return error;
    }
};

CommonService.prototype.InvalidateResetPasswordTokenData = async (id) => {
    try {
        return await db.ResetPassword.update({
            is_valid: false,
            status: false
        }, {
            where: {id: id}
        });
    } catch (error) {
        return (error);
    }
};

CommonService.prototype.GenerateTokenByUserTypeId = async (userId) => {
    try {
        const userType = await db.UserType.findById(userId, {
            include: [{
                model: db.Profile,
                include: [{
                    model: db.MediaObject
                }]
            }]
        });
        if (!userType) return null;
        return {
            token: generateToken(userType.userInfo, false, false),
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
        return error;
    }
};

module.exports = new CommonService();