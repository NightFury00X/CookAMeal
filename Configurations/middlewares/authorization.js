'use strict';
let CommonConfig = require('../Helpers/common-config');

exports.Authorization = function(accessLevel, callback) {
    function checkUserRole(req, res) {
        if(!(accessLevel & req.user.user_role)) {
            let response = {
                "success": false,
                data: [],
                "error": 'Access Denied/Forbidden.'
            };
            res.status(CommonConfig.STATUS_CODE.FORBIDDEN).json(response);
            return;
        }
        callback(req, res);
    }
    return checkUserRole;
};