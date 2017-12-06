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
            password: Joi.string().min(8).max(30).required()
        }),
        ResetPassword: Joi.object().keys({
            email: Joi.string().email().required()
        }),
        ChangePassword: Joi.object().keys({
            old_password: Joi.string().min(8).max(30).required(),
            new_password: Joi.string().min(8).max(30)
                .regex(/(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9].*[0-9]).{8,24}/).required()
        }),
        Recipe: Joi.object().options({abortEarly: false}).keys({
            dish_name: Joi.string().required().label('dish name'),
            preparation_method: Joi.string().required(),
            preparation_time: Joi.string().required(),
            cook_time: Joi.string().required(),
            category_id: Joi.string().required(),
            sub_category_id: Joi.string().required(),
            tags: Joi.string().required(),
            cost_per_serving: Joi.string(),
            available_servings: Joi.string(),
            order_by_date_time: Joi.string(),
            pick_up_by_date_time: Joi.string(),
            delivery_fee: Joi.string(),
            total_cost_of_ingredients: Joi.string().required(),
            serving_days: Joi.any(),
            ingredients: Joi.any(),
            base_allergies: Joi.any(),
            mon: Joi.number().allow(0, 1),
            tue: Joi.number().allow(0, 1),
            wed: Joi.number().allow(0, 1),
            thu: Joi.number().allow(0, 1),
            fri: Joi.number().allow(0, 1),
            sat: Joi.number().allow(0, 1),
            sun: Joi.number().allow(0, 1)
        })
    }
};