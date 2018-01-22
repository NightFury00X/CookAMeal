let Joi = require('joi')

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
            cost_per_serving: Joi.string().allow('', null),
            available_servings: Joi.string().allow('', null),
            order_by_date_time: Joi.string().allow('', null),
            pick_up_by_date_time: Joi.string().allow('', null),
            delivery_fee: Joi.string().allow('', null),
            total_cost_of_ingredients: Joi.string().required(),
            serving_days: Joi.any().required(),
            ingredients: Joi.any().required(),
            base_allergies: Joi.any(),
            serve: Joi.string(),
            mon: Joi.number().allow(0, 1),
            tue: Joi.number().allow(0, 1),
            wed: Joi.number().allow(0, 1),
            thu: Joi.number().allow(0, 1),
            fri: Joi.number().allow(0, 1),
            sat: Joi.number().allow(0, 1),
            sun: Joi.number().allow(0, 1),
            recipe: Joi.any()
        }),
        Unit: Joi.object().keys({
            unit_name: Joi.string().required(),
            sort_name: Joi.string().required()
        }),
        PaymentMethod: Joi.object().keys({
            name: Joi.string().required()
        }),
        RecipeAsFavorite: Joi.object().keys({
            recipe_id: Joi.string().required()
        }),
        ProfileAsFavorite: Joi.object().keys({
            profile_id: Joi.string().required()
        }),
        RecipeReview: Joi.object().keys({
            recipe_id: Joi.string().required(),
            rating: Joi.string().required(),
            comments: Joi.string().required()
        }),
        ProfileReview: Joi.object().keys({
            profile_id: Joi.string().required(),
            rating: Joi.string().required(),
            comments: Joi.string().required()
        }),
        Feedback: Joi.object().keys({
            feedbackType: Joi.string().required().allow('bug', 'feedback'),
            feedbackAs: Joi.string().required().allow('cook', 'customer', 'Cook', 'Customer', 'COOK', 'CUSTOMER'),
            comments: Joi.string().required()
        }),
        Tax: Joi.object().keys({
            countryId: Joi.string().required(),
            stateId: Joi.string().required(),
            Tax: Joi.string().required()
        }),
        OrderFood: Joi.object().keys({
            orderType: Joi.string().required().allow('0', '1'),
            spiceLevel: Joi.string().required().allow('Mild', 'Medium', 'Hot'),
            orderServings: Joi.number().required(),
            specialInstruction: Joi.string().required(),
            paymentMethodNonce: Joi.string().required(),
            deliveryType: Joi.number().required(),
            deliveryFee: Joi.string().required(),
            pickUpTime: Joi.string().required(),
            taxes: Joi.string().required(),
            totalAmount: Joi.string().required(),
            recipes: Joi.any().required()
        }),
        HireACook: Joi.object().keys({
            orderType: Joi.string().required().allow('0', '1'),
            spiceLevel: Joi.string().required().allow('Mild', 'Medium', 'Hot'),
            orderServings: Joi.number().required(),
            specialInstruction: Joi.string().required()
        })
    }
}
