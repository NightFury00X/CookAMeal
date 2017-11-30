let randomString = require('random-string'),
    db = require('../../Modals'),
    generateToken = require('../../../Configurations/Helpers/authentication'),
    CommonConfig = require('../../../Configurations/Helpers/common-config');

CommonService = function () {
};
CommonService.prototype.CheckuserExistInResetPasswordByEmailID = async (email) => {
    try {
        return await db.ResetPassword.findOne({
            attributes: ['id'],
            where: {email: email}
        });
    } catch (error) {
        console.log('error');
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
        console.log('error');
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
        console.log('Inner');
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

module.exports = new CommonService();