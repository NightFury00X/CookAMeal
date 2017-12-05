let db = require('../../Modals'),
    config = require('../../../Configurations/Main'),
    generateToken = require('../../../Configurations/Helpers/authentication'),
    commonService = require('./anonymous.service');


AuthService = function () {
};

AuthService.prototype.User = {
    Logout: async (tokenDetails) => {
        try {
            return await db.BlackListedToken.create(tokenDetails);
        } catch (error) {
            throw (error);
        }
    }
};

module.exports = new AuthService();