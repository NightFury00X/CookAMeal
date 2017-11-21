let db = require('../../Modals'),
    config = require('../../../Configurations/Main'),
    generateToken = require('../../../Configurations/Helpers/authentication');


CommonService = function () {
};

CommonService.prototype.CheckuserTypeByUserId = async (fbId) => {
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
    return {
        token: generateToken(tokenData),
        userDetails: userData
    };
};

module.exports = new CommonService();