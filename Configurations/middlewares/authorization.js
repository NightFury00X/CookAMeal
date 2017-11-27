'use strict';
let CommonConfig = require('../Helpers/common-config'),
    db = require('../../Application/Modals');

exports.Authorization = function (accessLevel, callback) {
    function checkUserRole(req, res) {
        if (!(accessLevel & req.user.user_role)) {
            let response = {
                "success": false,
                data: [],
                "error": 'Access Denied/Forbidden.'
            };
            res.status(CommonConfig.STATUS_CODE.FORBIDDEN).json(response);
            return;
        }
        db.BlackListedToken.findOne({
            where: {
                token: req.get('Authorization'),
                user_type_id: req.user.id
            }
        }).then(function (record) {
            if (record) {
                let response = {
                    "success": false,
                    data: [],
                    "error": 'Access Denied/Forbidden.'
                };
                res.status(CommonConfig.STATUS_CODE.FORBIDDEN).json(response);
                return;
            }
            callback(req, res);
        });
    }
    
    return checkUserRole;
};