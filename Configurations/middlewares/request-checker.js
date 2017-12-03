let RequestMethods = {},
    CommonConfig = require('../Helpers/common-config');

RequestMethods.CheckAuthorizationHeader = function (req, res, next) {
    let content_type = req.get('Authorization');
    console.log('Authorization: ', content_type);
    if (!content_type) {
        return next({
            status: CommonConfig.STATUS_CODE.BAD_REQUEST,
            message: CommonConfig.ERRORS.HEADER_NOT_FOUND
        }, false);
    }
    req.content_type = content_type;
    next(null, req);
};

RequestMethods.CheckContentType = {
    ApplicationJsonData: function (req, res, next) {
        let content_type = req.get('Content-Type');
        console.log('Content-Type: ', content_type);
        if (!content_type || content_type.split(';')[0] !== CommonConfig.CONTENT_TYPE.JSON) {
            return next({
                status: CommonConfig.STATUS_CODE.BAD_REQUEST,
                message: CommonConfig.ERRORS.CONTENT_TYPE_JSON
            }, false);
        }
        req.content_type = content_type;
        next();
    },
    ApplicationFormData: function (req, res, next) {
        let content_type = req.get('Content-Type');
        console.log('Content-Type: ', content_type);
        if (!content_type || content_type.split(';')[0] !== CommonConfig.CONTENT_TYPE.MULTIPART) {
            return next({
                status: CommonConfig.STATUS_CODE.BAD_REQUEST,
                message: CommonConfig.ERRORS.CONTENT_TYPE_MULTIPART
            }, false);
        }
        req.content_type = content_type;
        next();
    }
};

module.exports = RequestMethods;

