let CheckToken = {},
    db = require('../../Application/Modals'),
    CommonConfig = require("../Helpers/common-config");

CheckToken.IsUserTokenValid = async (req, res, next) => {
    const {userTypeId} = req.user.unique_key ? req.user.user_type_id : req.user.id;
    let isExists = await db.BlackListedToken.findOne({
        where: {
            token: req.get('Authorization'),
            user_type_id: userTypeId
        }
    });
    
    let response = {
        message: 'You are not authorized to perform this action!',
        status: CommonConfig.STATUS_CODE.FORBIDDEN
    };
    
    // If  record exists, handle it
    if (isExists)
        return next(response, false);
    
    //Otherwise, return ok
    next();
};

module.exports = CheckToken;

