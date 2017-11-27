let db = require('../../Modals'),
    config = require('../../../Configurations/Main'),
    generateToken = require('../../../Configurations/Helpers/authentication'),
    commonService = require('./anonymous.service');


AuthService = function () {
};

AuthService.prototype.GetUserData = async (userInfo) => {
    try {
        console.log(userInfo);
        return await db.UserType.findOne({
            where: {id: userInfo.id},
            include: [{model: db.Profile}]
        });
    } catch (error) {
        throw (error);
    }
};

module.exports = new AuthService();