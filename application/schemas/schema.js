let Joi = require('joi')

module.exports = {
    ParamSchemas: {
        idSchema: Joi.object().keys({
            param: Joi.string().required().error(new Error('Invalid parameter value.'))
        })
    },
    BodySchemas: {
        ServingData: Joi.object().options({abortEarly: false}).keys({
            recipeId: Joi.string().required(),
            noOfServing: Joi.number().required()
        }),
        SpiceLevelData: Joi.object().options({abortEarly: false}).keys({
            recipeId: Joi.string().required(),
            spiceLevel: Joi.string().required().allow('Mild', 'Medium', 'Hot')
        }),
        FbCheck: Joi.object().options({abortEarly: false}).keys({
            facebookId: Joi.string().required(),
            facebookEmailId: Joi.any()
        }),
        FbLogin: Joi.object().options({abortEarly: false}).keys({
            facebookId: Joi.string().required(),
            firstName: Joi.string().required(),
            lastName: Joi.string().required(),
            email: Joi.string(),
            gender: Joi.string().required(),
            imageUrl: Joi.string().required(),
            verified: Joi.number().allow(0, 1)
        }),
        Login: Joi.object().options({abortEarly: false}).keys({
            username: Joi.string().email().required(),
            password: Joi.string().min(8).max(30).required()
        }),
        ResetPassword: Joi.object().keys({
            email: Joi.string().email().required()
        }),
        ChangePassword: Joi.object().keys({
            oldPassword: Joi.string().min(8).max(30).required(),
            newPassword: Joi.string().min(8).max(30)
                .regex(/(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9].*[0-9]).{8,24}/).required()
        }),
        Recipe: Joi.object().options({abortEarly: false}).keys({
            dishName: Joi.string().required().label('dish name'),
            preparationMethod: Joi.any().required(),
            preparationTime: Joi.string().required(),
            cookTime: Joi.string().required(),
            categoryId: Joi.string().required(),
            subCategoryId: Joi.string().required(),
            tags: Joi.string().required(),
            costPerServing: Joi.string().allow('', null),
            availableServings: Joi.string().allow('', null),
            orderByDateTime: Joi.string().allow('', null),
            pickUpByDateTime: Joi.string().allow('', null),
            deliveryFee: Joi.string().allow('', null),
            totalCostOfIngredients: Joi.string().required(),
            servingDays: Joi.any().required(),
            ingredients: Joi.any().required(),
            eligibleFor: Joi.number().allow(1, 2, 3),
            baseAllergies: Joi.any(),
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
            unitName: Joi.string().required(),
            sortName: Joi.string().required()
        }),
        PaymentMethod: Joi.object().keys({
            name: Joi.string().required()
        }),
        ChangeProfile: Joi.object().keys({
            userRole: Joi.number().allow(1, 2)
        }),
        RecipeAsFavorite: Joi.object().keys({
            recipeId: Joi.string().required()
        }),
        ProfileAsFavorite: Joi.object().keys({
            profileId: Joi.string().required()
        }),
        RecipeReview: Joi.object().keys({
            recipeId: Joi.string().required(),
            rating: Joi.string().required(),
            comments: Joi.string().required()
        }),
        ProfileReview: Joi.object().keys({
            profileId: Joi.string().required(),
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
        }),
        AddToCart: Joi.object().keys({
            recipeId: Joi.string().required(),
            noOfServing: Joi.string().required()
        }),
        DeliveryAddress: Joi.object().keys({
            fullName: Joi.string().required(),
            mobileNumber: Joi.string().required(),
            street: Joi.string().required(),
            city: Joi.string().required(),
            state: Joi.string().required(),
            zipCode: Joi.string().required(),
            country: Joi.string().required(),
            latitude: Joi.any().required(),
            longitude: Joi.any().required()
        }),
        AvailabilityDetails: Joi.object().keys({
            date: Joi.string().required(),
            startTime: Joi.string().required(),
            endTime: Joi.string().required()
        })
    }
}
