let RequestMethods = {},
    CommonConfig = require('../Helpers/common-config');

RequestMethods.CheckAuthorizationHeader = function (req, res, next) {
    let isAuth = req.get('Authorization');
    console.log('Authorization: ', isAuth);
    if (!isAuth) {
        return next({
            status: CommonConfig.STATUS_CODE.BAD_REQUEST,
            message: 'Header not present in the request!',
            required: 'Authorization header.'
        }, false);
    }
    next(null, req);
};

RequestMethods.CheckContentType = {
    ApplicationJsonData: function (req, res, next) {
        let isJsonData = req.get('Content-Type');
        console.log('Content-Type: ', isJsonData);
        if (!isJsonData || isJsonData.split(';')[0] !== 'application/json') {
            return next({
                status: CommonConfig.STATUS_CODE.BAD_REQUEST,
                message: 'Invalid Content Type. Content-Type: applicatiotn/json required!',
                required: 'Content-Type: application/json.'
            }, false);
        }
        next();
    },
    ApplicationFormData: function (req, res, next) {
        let isMultiPart = req.get('Content-Type');
        console.log('Content-Type: ', isMultiPart);
        if (!isMultiPart || isMultiPart.split(';')[0] !== 'multipart/form-data') {
            return next({
                status: CommonConfig.STATUS_CODE.BAD_REQUEST,
                message: 'Invalid Content Type. Content-Type: multipart/form-data required!',
                required: 'Content-Type: multipart/form-data.'
            }, false);
        }
        next();
    }
};

module.exports = RequestMethods;

