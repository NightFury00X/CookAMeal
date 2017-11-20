let db = require('../../Modals');


CommonService = function () {
};

CommonService.prototype.CheckuserTypeByFbId = async (fbId) => {
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

module.exports = new CommonService();