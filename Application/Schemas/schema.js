let Joi = require('joi');

module.exports = {
    ParamSchemas: {
        idSchema: Joi.object().keys({
            param: Joi.string().required().error(new Error('Invalid parameter value.'))
        })
    },
    BodySchemas: {
        Login: Joi.object().options({abortEarly: false}).keys({
            username: Joi.string().email().required(),
            password: Joi.string().min(8).max(30).regex(/[a-zA-Z0-9]{3,30}/).required()
        }),
        ResetPassword: Joi.object().keys({
            email: Joi.string().email().required()
        }),
        ChangePassword: Joi.object().keys({
            old_password: Joi.string().min(8).max(30).regex(/[a-zA-Z0-9]{3,30}/).required(),
            new_password: Joi.string().min(8).max(30).regex(/[a-zA-Z0-9]{3,30}/).required()
        }),
    }
};