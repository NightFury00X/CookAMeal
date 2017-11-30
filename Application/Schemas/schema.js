let Joi = require('joi');

module.exports = {
    ParamSchemas: {
        idSchema: Joi.object().keys({
            param: Joi.string().regex(/^[a-z]{4}$/).required()
        })
    },
    BodySchemas: {
        Login: Joi.object().keys({
            username: Joi.string().email().required(),
            password: Joi.string().required()
        }),
        ResetPassword: Joi.object().keys({
            email: Joi.string().email().required()
        })
    }
};