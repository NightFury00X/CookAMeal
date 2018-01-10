const randomString = require('random-string')
const Sequelize = require('sequelize')
const Op = Sequelize.Op
const db = require('../../modals')
const {AuthenticationHelpers} = require('../../../configurations/helpers/helper')
const CommonConfig = require('../../../configurations/helpers/common-config')
const isJSON = require('is-json')
const braintree = require('braintree')
const config = require('../../../configurations/main')

CommonService = function () {
}

CommonService.prototype.UserModel = {
    GetDetailsByEmail: async (email) => {
        return await db.UserType.findOne({
            where: {
                user_id: {
                    [Op.eq]: [email]
                }
            }
        })
    }
}

CommonService.prototype.Keys = {
    RandomKeys: {
        GenerateRandomKey: async () => {
            return await randomString(CommonConfig.OPTIONS.RANDOM_KEYS)
        },
        GenerateUnique16DigitKey: async () => {
            return await randomString(CommonConfig.OPTIONS.UNIQUE_RANDOM_KEYS)
        }
    }
}

CommonService.prototype.GetResetPasswordData = async (email) => {
    try {
        return await db.ResetPassword.findOne({
            where: {
                email: {
                    [Op.eq]: [email]
                }
            }
        })
    } catch (error) {
        throw (error)
    }
}

CommonService.prototype.CheckUserTypeByUserId = async (fbId) => {
    try {
        return await db.UserType.findOne({
            attributes: ['id'],
            where: {
                user_id: {
                    [Op.eq]: [fbId]
                }
            }
        })
    } catch (error) {
        throw (error)
    }
}

CommonService.prototype.GetUserDetailsByUserTypeId = async (userTypeId) => {
    try {
        return await db.UserType.findOne({
            where: {
                id: {
                    [Op.eq]: [userTypeId]
                }
            },
            include: [{
                model: db.Profile,
                include: [{
                    model: db.MediaObject
                }]
            }]
        })
    } catch (error) {
        throw (error)
    }
}

CommonService.prototype.GenerateToken = async (tokenData, userData) => {
    try {
        return {
            token: AuthenticationHelpers.GenerateToken(tokenData, false, true),
            userDetails: userData
        }
    } catch (error) {
        throw (error)
    }
}

CommonService.prototype.GetCategories = async () => {
    try {
        return await db.Category.findAll({
            attributes: ['id', 'name'],
            include: [
                {
                    model: db.MediaObject,
                    attributes: ['imageurl'],
                    where: {
                        imageurl: {
                            $ne: null
                        }
                    }
                }
            ]
        })
    } catch (error) {
        throw (error)
    }
}

CommonService.prototype.GetCategoryById = async (catId) => {
    try {
        return await db.Category.findOne({
            attributes: ['id', 'name'],
            where: {
                id: {
                    [Op.eq]: [catId]
                }
            },
            include: [{model: db.MediaObject, attributes: ['imageurl']}]
        })
    } catch (error) {
        return error
    }
}

CommonService.prototype.GenerateRandomKey = async () => {
    return randomString(CommonConfig.OPTIONS.RANDOM_KEYS)
}

CommonService.prototype.GenerateUnique16DigitKey = async () => {
    return randomString(CommonConfig.OPTIONS.UNIQUE_RANDOM_KEYS)
}

CommonService.prototype.ChangePassword = async (userDetails) => {
    const trans = await db.sequelize.transaction()
    try {
        // Check reset password is requested or not.
        let records = await db.ResetPassword.findOne({
            where: {
                user_type_id: {
                    [Op.eq]: [userDetails.id]
                },
                [Op.and]: [{
                    status: true,
                    is_valid: true
                }]
            }
        })

        if (!records) {
            trans.rollback()
            return null
        }

        // If reset password requested, update the record in ResetPassword
        let resetPasswordData = await db.ResetPassword.update({
            is_valid: false,
            status: false
        }, {
            where: {
                [Op.and]: [{
                    id: records.id,
                    email: records.email
                }]
            }
        }, {transaction: trans})

        if (!resetPasswordData) {
            trans.rollback()
            return null
        }

        // Update password field in user table
        let userData = await db.User.update({
            password: userDetails.password
        }, {
            where: {
                [Op.and]: [{
                    id: userDetails.id,
                    email: userDetails.email
                }]
            }
        }, {transaction: trans})

        if (!userData) {
            trans.rollback()
            return null
        }

        await trans.commit()
        return userData
    } catch (error) {
        await trans.rollback()
        throw (error)
    }
}

CommonService.prototype.InvalidateResetPasswordTokenData = async (id) => {
    try {
        return await db.ResetPassword.update({
            is_valid: false,
            status: false
        }, {
            where: {
                id: {
                    [Op.eq]: id
                }
            }
        })
    } catch (error) {
        return (error)
    }
}

CommonService.prototype.GenerateTokenByUserTypeId = async (userId) => {
    try {
        const userType = await db.UserType.findById(userId, {
            include: [{
                model: db.Profile,
                include: [{
                    model: db.MediaObject
                }]
            }]
        })
        if (!userType) return null
        return {
            token: AuthenticationHelpers.GenerateToken(userType.userInfo, false, false),
            user: {
                id: userType.id,
                email: userType.Profile.email,
                fullname: userType.Profile.fullName,
                user_type: userType.user_type,
                user_role: userType.user_role,
                profile_url: userType.Profile.MediaObjects.length > 0 ? userType.Profile.MediaObjects[0].imageurl : ''
            }
        }
    } catch (error) {
        throw (error)
    }
}

CommonService.prototype.User = {
    GetCurrencySymbolByProfileId: async (profileId) => {
        try {
            return await db.Address.findOne({
                attributes: ['currency_symbol'],
                where: {
                    profile_id: {
                        [Op.eq]: profileId
                    }
                }
            })
        } catch (error) {
            throw (error)
        }
    },
    FindAllReviewsByProfileId: async (profileId) => {
        try {
            return await db.UserType.findAll({
                attributes: ['id'],
                include: [{
                    attributes: ['id', 'comments', 'rating'],
                    model: db.Review,
                    where: {
                        profile_id: {
                            [Op.eq]: profileId
                        }
                    }
                }, {
                    attributes: ['id', 'firstname', 'lastname'],
                    model: db.Profile,
                    include: [{
                        model: db.MediaObject,
                        attributes: ['id', 'imageurl']
                    }]
                }]
            })
        } catch (error) {
            throw (error)
        }
    },
    FindProfileRatingByProfileId: async (profileId) => {
        try {
            return await db.Review.findAll({
                where: {
                    profile_id: {
                        [Op.eq]: profileId
                    }
                },
                attributes: [[Sequelize.fn('AVG', Sequelize.col('rating')), 'rating']]
            })
        } catch (error) {
            throw (error)
        }
    },
    FindCookAllCategoriesByProfileId: async (profileId) => {
        try {
            return await db.Category.findAll({
                attributes: ['id', 'name'],
                include: [{
                    required: true,
                    attributes: ['id', 'dish_name'],
                    model: db.Recipe,
                    where: {
                        profile_id: {
                            [Op.eq]: profileId
                        }
                    }
                }]
            })
        } catch (error) {
            throw (error)
        }
    },
    GetCookProfileDetailsById: async (profileId) => {
        try {
            return await db.Profile.findById(profileId, {
                attributes: ['id', 'firstname', 'lastname', 'description'],
                include: [{
                    model: db.MediaObject,
                    attributes: ['id', 'imageurl']
                }]
            })
        } catch (error) {
            throw (error)
        }
    },
    GetProfileIdByUserTypeId: async (userTypeId) => {
        try {
            return db.Profile.findOne({
                where: {
                    user_type_id: {
                        [Op.eq]: [userTypeId]
                    }
                },
                attributes: ['id', 'firstname', 'lastname']
            })
        } catch (error) {
            throw (error)
        }
    },
    Logout: async (tokenDetails) => {
        try {
            return await db.BlackListedToken.create(tokenDetails)
        } catch (error) {
            throw (error)
        }
    }
}

CommonService.prototype.Recipe = {
    FindRecipeIsExist: async (recipeId) => {
        try {
            return await db.Recipe.findById(recipeId, {
                attributes: ['id']
            })
        } catch (error) {
            throw (error)
        }
    },
    FindRecipeByCatIdAndSubIds: async (categoryId, subCategoryId) => {
        try {
            return await db.Recipe.findAll({
                attributes: ['id', 'dish_name', 'available_servings', 'order_by_date_time', 'cost_per_serving', 'preparation_method', 'preparation_time', 'cook_time'],
                where: {
                    [Op.and]: [{
                        category_id: categoryId,
                        sub_category_id: subCategoryId
                    }]
                },
                include: [{
                    model: db.Ingredient
                }, {
                    required: true,
                    attributes: ['id', 'imageurl'],
                    model: db.MediaObject
                }]
            })
        } catch (error) {
            throw (error)
        }
    },
    FindRecipeById: async (recipeId) => {
        try {
            return await db.Profile.findOne({
                attributes: ['id', 'email', 'firstname', 'lastname'],
                include: [{
                    model: db.MediaObject,
                    attributes: ['id', 'imageurl']
                }, {
                    attributes: ['id', 'dish_name', 'available_servings', 'order_by_date_time', 'cost_per_serving', 'preparation_method', 'preparation_time', 'cook_time', 'serve', 'category_id', 'sub_category_id'],
                    model: db.Recipe,
                    where: {
                        id: {
                            [Op.eq]: recipeId
                        }
                    },
                    include: [{
                        attributes: ['id', 'name', 'qty', 'cost'],
                        model: db.Ingredient,
                        include: [{
                            attributes: ['id', 'unit_name', 'sort_name'],
                            model: db.Unit
                        }]
                    }, {
                        attributes: ['id', 'imageurl'],
                        model: db.MediaObject
                    }]
                }]
            })
        } catch (error) {
            throw (error)
        }
    },
    FindRatingByRecipeId: async (recipeId) => {
        try {
            return db.Review.findAll({
                where: {
                    recipe_id: {
                        [Op.eq]: recipeId
                    }
                },
                attributes: [[Sequelize.fn('AVG', Sequelize.col('rating')), 'rating']]
            })
        } catch (error) {
            throw (error)
        }
    },
    FindAllRecipeByProfileId: async (profileId) => {
        try {
            return await db.SubCategory.findAll({
                attributes: ['id', 'name'],
                include: [{
                    model: db.Recipe,
                    attributes: ['id', 'dish_name', 'cost_per_serving', 'order_by_date_time'],
                    where: {
                        profile_id: {
                            [Op.eq]: profileId
                        }
                    },
                    include: [{
                        model: db.MediaObject,
                        attributes: ['id', 'imageurl']
                    }]
                }]
            })
        } catch (error) {
            throw (error)
        }
    },
    FindAllByCategoryId: async (categoryId) => {
        try {
            return db.SubCategory.findAll({
                attributes: ['id', 'name'],

                include: [{
                    model: db.Recipe,
                    attributes: ['id', 'dish_name', 'cost_per_serving', 'sub_category_id', 'order_by_date_time'],
                    where: {
                        // sub_category_id: {$col: 'SubCategory.id'},
                        category_id: {
                            [Op.eq]: [categoryId]
                        }
                    },
                    required: true,
                    limit: 10,
                    include: [{
                        required: true,
                        model: db.MediaObject,
                        attributes: ['id', 'imageurl']
                    }]
                }]
            })
        } catch (error) {
            throw (error)
        }
    },
    FindAllRecipeByCookIdExcludeSelectedRecipe: async (profileId, recipeId) => {
        try {
            return await db.Recipe.findAll({
                order: [
                    [Sequelize.fn('NEWID')]
                ],
                limit: 10,
                where: {
                    [Op.and]: [{
                        profile_id: {
                            [Op.eq]: profileId
                        },
                        id: {
                            [Op.ne]: recipeId
                        }
                    }]
                },
                attributes: ['id', 'dish_name', 'available_servings', 'order_by_date_time', 'cost_per_serving', 'preparation_method', 'preparation_time', 'cook_time', 'serve', 'category_id', 'sub_category_id'],
                include: [{
                    model: db.MediaObject,
                    attributes: ['id', 'imageurl']
                }]
            })
        } catch (error) {
            throw (error)
        }
    },
    FindSimilarRecipesBySubCategoryIdExcludeSelectedCookRecipe: async (subCategoryId, profileId) => {
        try {
            return await db.Recipe.findAll({
                order: [
                    [Sequelize.fn('NEWID')]
                ],
                limit: 10,
                required: true,
                where: {
                    [Op.and]: [{
                        sub_category_id: {
                            [Op.eq]: subCategoryId
                        },
                        profile_id: {
                            [Op.ne]: profileId
                        }
                    }]
                },
                attributes: ['id', 'dish_name', 'available_servings', 'order_by_date_time', 'cost_per_serving', 'preparation_method', 'preparation_time', 'cook_time', 'category_id', 'sub_category_id', 'profile_id'],
                include: [{
                    model: db.MediaObject,
                    attributes: ['id', 'imageurl']
                }]
            })
        } catch (error) {
            throw (error)
        }
    },
    MarkFavorite: async (favoriteData, isFav) => {
        try {
            if (!isFav) {
                return await db.Favorite.create(favoriteData)
            } else {
                return await db.Favorite.destroy({
                    where: {
                        [Op.and]: [{
                            recipe_id: favoriteData.recipe_id,
                            user_type_id: favoriteData.user_type_id
                        }]
                    }
                })
            }
        } catch (error) {
            throw (error)
        }
    },
    GetFavoriteRecipeListByUserId: async (userId) => {
        try {
            return await db.Favorite.findAll({
                where: {
                    [Op.and]: [{
                        user_type_id: userId,
                        is_favorite: true
                    }]
                }
            })
        } catch (error) {
            throw (error)
        }
    },
    CheckRecipeIsFavoriteByRecipeIdAndUserId: async (userId, recipeId) => {
        try {
            return await db.Favorite.findOne({
                where: {
                    [Op.and]: [{
                        user_type_id: userId,
                        recipe_id: recipeId
                    }]
                }
            })
        } catch (error) {
            throw (error)
        }
    }
}

CommonService.prototype.Feedback = {
    Add: async (feedback) => {
        try {
            return await db.Feedback.create(feedback)
        } catch (error) {
            throw (error)
        }
    }
}

CommonService.prototype.Review = {
    CheckRecipeId: async (recipeId) => {
        try {
            return await db.Recipe.findById(recipeId)
        } catch (error) {
            throw (error)
        }
    },
    CheckUserId: async (profileId) => {
        try {
            return await db.UserType.findById(profileId)
        } catch (error) {
            throw (error)
        }
    },
    Recipe: async (reviewDetails) => {
        try {
            return await db.Review.create(reviewDetails)
        } catch (error) {
            throw (error)
        }
    },
    Profile: async (reviewDetails) => {
        try {
            return await db.Review.create(reviewDetails)
        } catch (error) {
            throw (error)
        }
    }
}

CommonService.prototype.SubCategory = {
    FindById: async (subCategoryId) => {
        try {
            return await db.SubCategory.findById(subCategoryId, {
                attributes: ['id', 'name']
            })
        } catch (error) {
            throw (error)
        }
    },
    GettAll: async () => {
        try {
            return await db.SubCategory.findAll({
                attributes: ['id', 'name']
            })
        } catch (error) {
            throw (error)
        }
    }
}

CommonService.prototype.Allergy = {
    GettAll: async () => {
        try {
            return await db.Allergy.findAll({
                attributes: ['id', 'name']
            })
        } catch (error) {
            throw (error)
        }
    }
}

CommonService.prototype.Units = {
    GettAll: async () => {
        try {
            return await db.Unit.findAll({
                attributes: ['id', 'unit_name', 'sort_name']
            })
        } catch (error) {
            throw (error)
        }
    }
}

CommonService.prototype.PaymentMethod = {
    GettAll: async () => {
        try {
            return await db.PaymentMethod.findAll({
                attributes: ['id', 'name']
            })
        } catch (error) {
            throw (error)
        }
    }
}

CommonService.prototype.Order = {
    CheckOut: async (paymentMethodNonce) => {
        try {
            let gateway = await braintree.connect({
                environment: braintree.Environment.Sandbox,
                merchantId: config.braintree.merchantId,
                publicKey: config.braintree.publicKey,
                privateKey: config.braintree.privateKey
            })
            await new Promise((resolve, reject) => {
                gateway.transaction.sale({
                    amount: '10.00',
                    paymentMethodNonce: paymentMethodNonce,
                    options: {
                        submitForSettlement: true
                    }
                }, function (err, result) {
                    if (err || !result.success) {
                        console.log('Error: ', err || result.message)
                        return reject(err || result.message)
                    } else {
                        return resolve(result)
                    }
                })
            })
        } catch (error) {
            console.log(error)
            throw (error)
        }
    },
    PlaceOrder: async (orderDetails, recipesData) => {
        let recipesToJson = !isJSON(recipesData) ? JSON.parse(JSON.stringify(recipesData)) : JSON.parse(recipesData)
        orderDetails.orderState = 0
        orderDetails.paymentState = 'pending'
        const trans = await db.sequelize.transaction()
        try {
            const order = await db.Order.create(orderDetails, {transaction: trans})
            if (!order) {
                trans.rollback()
                return null
            }
            for (const index in recipesToJson) {
                if (recipesToJson.hasOwnProperty(index)) {
                    recipesToJson[index].order_id = order.id
                }
            }
            for (const recipe of recipesToJson) {
                const orderItem = await db.OrderItem.create(recipe, {transaction: trans})
                if (!orderItem) {
                    trans.rollback()
                    return null
                }
            }
            trans.commit()
            return null
        } catch (error) {
            trans.rollback()
            throw (error)
        }
    }
}

module.exports = new CommonService()
