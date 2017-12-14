const Joi = require('joi'),
    CommonConfig = require("../Helpers/common-config");

const options = {
    language: {
        key: '{{key}} '
    },
};

module.exports = {
    ValidateParams: (schema, name) => {
        return (req, res, next) => {
            try {
                const result = Joi.validate({param: req['params'][name]}, schema);
                if (result.error) {
                    return next({
                        message: result.error.message,
                        status: CommonConfig.STATUS_CODE.BAD_REQUEST
                    }, false);
                } else {
                    if (!req.value)
                        req.value = {};
    
                    if (!req.value['params'])
                        req.value['params'] = {};
    
                    req.value['params'][name] = result.value.param;
                    next();
                }
            } catch (error) {
                return next({
                    message: CommonConfig.ERRORS.INTERNAL_SERVER_ERROR,
                    status: CommonConfig.STATUS_CODE.INTERNAL_SERVER_ERROR
                }, false);
            }
        }
    },
    ValidateBody: (schema) => {
        return (req, res, next) => {
            try {
                const result = Joi.validate(req.body, schema, options);
                if (result.error) {
                    let errors = [];
                    let i = 1;
                    result.error.details.forEach(function (detail) {
                        errors.push(i++ + ': ' + detail.message);
                    });
                    return next({
                        // message: 'Invalid input data.',
                        message: errors,
                        status: CommonConfig.STATUS_CODE.BAD_REQUEST
                    }, false);
                } else {
                    if (!req.value)
                        req.value = {};
                    if (!req.value['body'])
                        req.value['body'] = {};
    
                    req.value['body'] = result.value;
                    next();
                }
            } catch (error) {
                return next({
                    message: CommonConfig.ERRORS.INTERNAL_SERVER_ERROR,
                    status: CommonConfig.STATUS_CODE.INTERNAL_SERVER_ERROR
                }, false);
            }
        }
    }
};