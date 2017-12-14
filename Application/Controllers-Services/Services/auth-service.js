let db = require('../../Modals');


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