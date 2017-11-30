'use strict';
let CommonConfig = require('../Helpers/common-config'),
    db = require('../../Application/Modals');

module.exports = (accessLevel) => {
    return (req, res, next) => {
        if (!(accessLevel & req.user.user_role)) {
            let response = {
                message: 'You are not authorized to perform this action!',
                status: CommonConfig.STATUS_CODE.FORBIDDEN
            };
            return next(response, false);
        }
        next();
    }
};