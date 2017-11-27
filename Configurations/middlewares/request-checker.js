let RequestMethods = {},
    responseHelper = require('../Helpers/ResponseHandler'),
    CommonConfig = require('../Helpers/common-config');

RequestMethods.CheckAuthorizationHeader = function (req, res, next) {
    let isAuth = req.get('Authorization');
    if (!isAuth)
        return responseHelper.setErrorResponse({message: 'Header not present in the request. '}, res, CommonConfig.STATUS_CODE.BAD_REQUEST);
    next();
};

RequestMethods.CheckContentType = {
    ApplicationJsonData: function (req, res, next) {
        let isJsonData = req.get('Content-Type');
        if (isJsonData !== 'application/json')
            return responseHelper.setErrorResponse({message: 'Invalid Content Type. Content-Type: applicaiotn/json required!'}, res, CommonConfig.STATUS_CODE.BAD_REQUEST);
        next();
    },
    ApplicationFormData: function (req, res, next) {
        let isMultiPart = req.get('Content-Type');
        if (isMultiPart.split(';')[0] !== 'multipart/form-data')
            return responseHelper.setErrorResponse({message: 'Invalid Content Type. Content-Type: multipart/form-data required!'}, res, CommonConfig.STATUS_CODE.BAD_REQUEST);
        next();
    }
};

module.exports = RequestMethods;

