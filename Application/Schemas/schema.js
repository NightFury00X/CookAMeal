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
            password: Joi.string().required()
        }),
        ResetPassword: Joi.object().keys({
            email: Joi.string().email().required().error(new Error('Email required.'))
        }),
        ChangePassword: Joi.object().keys({
            password: Joi.string().required().error(new Error('Password required.'))
        }),
    }
};