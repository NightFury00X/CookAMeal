'use strict';
let CommonConfig = require('../Helpers/common-config');

exports.Authorization = function(accessLevel, callback) {
    function checkUserRole(req, res) {
        if(!(accessLevel & req.user.role)) {
            console.log('Denied');
            let response = {
                "success": false,
                data: [],
                "error": 'Access Denied/Forbidden.'
            };
            res.status(CommonConfig.StatusCode.FORBIDDEN).json(response);
            return;
        }
        callback(req, res);
    }
    return checkUserRole;
};