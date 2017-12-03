'use strict';
let CommonConfig = require('../Helpers/common-config');

module.exports = (accessLevel) => {
    return (req, res, next) => {
        if (!(accessLevel & req.user.user_role)) {
            let response = {
                message: CommonConfig.ERRORS.NON_AUTHORIZED,
                status: CommonConfig.STATUS_CODE.FORBIDDEN
            };
            return next(response, false);
        }
        next();
    }
};