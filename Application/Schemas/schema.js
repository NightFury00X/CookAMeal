let Joi = require('joi');

module.exports = {
    ParamSchemas: {
        idSchema: Joi.object().keys({
            param: Joi.string().required().error(new Error('Invalid parameter value.'))
        })
    },
    BodySchemas: {
        FbLogin: Joi.object().options({abortEarly: false}).keys({
            fbid: Joi.string().regex(/[0-9]/).required()
        }),
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
        Recipe: Joi.object().options({abortEarly: false}).keys({
            dish_name: Joi.string().required().label('dish name'),
            preparation_method: Joi.string().required(),
            preparation_time: Joi.string().required(),
            cook_time: Joi.string().required(),
            tags: Joi.string().required(),
            cost_per_serving: Joi.string().required(),
            available_servings: Joi.string().required(),
            order_by_date_time: Joi.string().required(),
            pick_up_by_date_time: Joi.string().required(),
            delivery_fee: Joi.string().required(),
            total_cost_of_ingredients: Joi.string().required(),
        })
    }
};