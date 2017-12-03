let RequestMethods = {},
    CommonConfig = require('../Helpers/common-config');

RequestMethods.CheckAuthorizationHeader = function (req, res, next) {
    let content_type = req.get('Authorization');
    console.log('Authorization: ', content_type);
    if (!content_type) {
        return next({
            status: CommonConfig.STATUS_CODE.BAD_REQUEST,
            message: 'Header not present in the request!',
            required: 'Authorization header.'
        }, false);
    }
    req.content_type = content_type;
    next(null, req);
};

RequestMethods.CheckContentType = {
    ApplicationJsonData: function (req, res, next) {
        let content_type = req.get('Content-Type');
        console.log('Content-Type: ', content_type);
        if (!content_type || content_type.split(';')[0] !== 'application/json') {
            return next({
                status: CommonConfig.STATUS_CODE.BAD_REQUEST,
                message: 'Invalid Content Type. Content-Type: applicatiotn/json required!',
                required: 'Content-Type: application/json.'
            }, false);
        }
        req.content_type = content_type;
        next();
    },
    ApplicationFormData: function (req, res, next) {
        let content_type = req.get('Content-Type');
        console.log('Content-Type: ', content_type);
        if (!content_type || content_type.split(';')[0] !== 'multipart/form-data') {
            return next({
                status: CommonConfig.STATUS_CODE.BAD_REQUEST,
                message: 'Invalid Content Type. Content-Type: multipart/form-data required!',
                required: 'Content-Type: multipart/form-data.'
            }, false);
        }
        req.content_type = content_type;
        next();
    }
};

module.exports = RequestMethods;

