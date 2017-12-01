'use strict';
let CommonConfig = require('../Helpers/common-config'),
    db = require('../../Application/Modals');

module.exports = (accessLevel) => {
    return (req, res, next) => {
        console.log('7777777777777777777777', req.user);
        if (!(accessLevel & req.user.user_role)) {
            let response = {
                message: 'You are not authorized to perform this action!',
                status: CommonConfig.STATUS_CODE.FORBIDDEN
            };
            return next(response, false);
        }
        console.log('0000000000000000000000000000000000000');
        next();
    }
};