let db = require('../../Modals'),
    generateToken = require('../../../Configurations/Helpers/authentication');


CommonService = function () {
};

CommonService.prototype.CheckUserTypeByUserId = async (fbId) => {
    try {
        return await db.UserType.findOne({
            attributes: ['id'],
            where: {userid: fbId},
            raw: true
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
                include: [{model: db.MediaObject}]
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
            include: [{model: db.MediaObject, attributes: ['imageurl']}]
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

module.exports = new CommonService();