let db = require('../../Modals'),
    config = require('../../../Configurations/Main'),
    generateToken = require('../../../Configurations/Helpers/authentication'),
    commonService = require('./anonymous.service');


AuthService = function () {
};

AuthService.prototype.GetUserData = async (userInfo) => {
    try {
        return await db.UserType.findOne({
            where: {id: userInfo.id},
            include: [{model: db.Profile}]
        });
    } catch (error) {
        throw (error);
    }
};

AuthService.prototype.Logout = async (tokenDetails) => {
    try {
        return await db.BlackListedToken.create(tokenDetails);
    } catch (error) {
        throw (error);
    }
};

module.exports = new AuthService();