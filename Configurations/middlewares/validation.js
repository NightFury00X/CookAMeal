let Joi = require('joi');

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
            const result = Joi.validate(req.body, schema);

            console.log('Error: ', result.error);
            if (result.error) {
                return next(result.error, false);
            } else {
                if (!req.value)
                    req.value = {};
                if (!req.value['body'])
                    req.value['body'] = {};

                req.value['body'] = result.value;
                next();
            }
        }
    },
    Schemas: {
        loginSchema: Joi.object().keys({
            username: Joi.string().email().required(),
            password: Joi.string().length(8).required()
        }),
        idSchema: Joi.object().keys({
            param: Joi.string().regex(/^[a-z]{4}$/).required()
        }),
        myidSchema: Joi.object().keys({
            param: Joi.string().regex(/^[0-9]{4}$/).required()
        })
    }
};