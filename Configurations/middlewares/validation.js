let Joi = require('joi');
const CommonConfig = require("../Helpers/common-config");

module.exports = {
    ValidateParams: (schema, name) => {
        return (req, res, next) => {
            const result = Joi.validate({param: req['params'][name]}, schema);
            if (result.error) {
                return res.status(400).json(result.error);
            } else {
                if (!req.value)
                    req.value = {};
                
                if (!req.value['params'])
                    req.value['params'] = {};
                
                req.value['params'][name] = result.value.param;
                next();
            }
        }
    },
    ValidateBody: (schema) => {
        return (req, res, next) => {
            try {
                const result = Joi.validate(req.body, schema);
                if (result.error) {
                    return next({
                        message: result.error.message,
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
                    message: 'Something wrong in your request. please try again later!',
                    status: CommonConfig.STATUS_CODE.INTERNAL_SERVER_ERROR
                }, false);
            }
        }
    }
};