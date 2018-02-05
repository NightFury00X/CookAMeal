const Sequelize = require('sequelize')
const Op = Sequelize.Op
const db = require('../../modals')
const isJSON = require('is-json')
const braintree = require('braintree')
const config = require('../../../configurations/main')
const CommonConfig = require('../../../configurations/helpers/common-config')
AuthService = function () {
}

AuthService.prototype.User = {
    GetUserTypeDetailsById: async (userId) => {
        try {
            return await db.UserType.findOne({
                where: {
                    id: {
                        [Op.eq]: `${userId}`
                    }
                }
            })
        } catch (error) {
            throw (error)
        }
    },
    GetProfileDataIfProfileUpdated: async (userId) => {
        try {
            return await db.UserType.findOne({
                attributes: ['id', 'facebookId', 'emailId', 'userRole'],
                where: {
                    [Op.and]: {
                        id: `${userId}`
                    }
                },
                include: [{
                    model: db.Profile,
                    attributes: ['id', 'email', 'firstName', 'lastName', 'phone', 'gender', 'description', 'dietPreference', 'allergies', 'drivingDistance', 'profileUrl'],
                    include: [{
                        model: db.Address,
                        attributes: ['id', 'street', 'city', 'state', 'zipCode', 'country']
                    }]
                }]
            })
        } catch (error) {
            throw (error)
        }
    },
    GetProfileDataIfProfileNotUpdated: async (userId, facebookId) => {
        try {
            return await db.UserType.findOne({
                attributes: ['id', 'facebookId', 'emailId', 'userRole'],
                where: {
                    [Op.and]: {
                        id: `${userId}`,
                        facebookId: `${facebookId}`
                    }
                },
                include: [{
                    model: db.Profile,
                    attributes: ['id', 'email', 'firstName', 'lastName', 'phone', 'gender', 'description', 'dietPreference', 'allergies', 'drivingDistance', 'profileUrl', 'coverPhotoUrl'],
                    include: [{
                        model: db.Address,
                        attributes: ['id', 'street', 'city', 'state', 'zipCode', 'country']
                    }]
                }]
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

AuthService.prototype.GetResetPasswordData = async (email) => {
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

AuthService.prototype.GenerateTokenByUserTypeId = async (userId) => {
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
                fullName: userType.Profile.fullName,
                userRole: userType.userRole,
                profileUrl: userType.Profile.profileUrl,
                hasProfile: true,
                profileSelected: userType.profileSelected
            }
        }
    } catch (error) {
        throw (error)
    }
}

AuthService.prototype.Feedback = {
    Add: async (feedback) => {
        try {
            return await db.Feedback.create(feedback)
        } catch (error) {
            throw (error)
        }
    }
}

AuthService.prototype.ChangePassword = async (userDetails) => {
    const trans = await db.sequelize.transaction()
    try {
        let records = await db.ResetPassword.findOne({
            where: {
                createdBy: {
                    [Op.eq]: [userDetails.id]
                },
                [Op.and]: [{
                    status: true,
                    isValid: true
                }]
            }
        })
        if (!records) {
            trans.rollback()
            return null
        }
        let resetPasswordData = await db.ResetPassword.update({
            isValid: false,
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

AuthService.prototype.Recipe = {
    GetDeliveryFeesByRecipeId: async (recipeId) => {
        try {
            return db.Recipe.findOne({
                attributes: ['costPerServing', 'availableServings', 'deliveryFee', 'profileId'],
                where: {
                    id: {
                        [Op.eq]: recipeId
                    }
                }
            })
        } catch (error) {
            throw (error)
        }
    }
}

AuthService.prototype.Order = {
    ValidateOrder: async (totalAmount, taxes, deliveryFee, noOfServes, recipes, deliveryType) => {
        const recipesToJson = !isJSON(recipes) ? JSON.parse(JSON.stringify(recipes)) : JSON.parse(recipes)
        const recipeId = recipesToJson[0].recipeId
        const recipeDetails = await db.Recipe.findOne({
            attributes: ['costPerServing', 'availableServings', 'deliveryFee'],
            where: {
                id: {
                    [Op.eq]: recipeId
                }
            }
        })
        const tempDeliveryFees = parseFloat(deliveryType) === 0 ? 0 : parseFloat(recipeDetails.deliveryFee)
        const total = ((parseFloat(recipeDetails.costPerServing) * parseInt(noOfServes)) + tempDeliveryFees)
        const taxAmount = total * 5 / 100
        const totalAmountIncludingTax = (total || 0) + (taxAmount || 0)
        return parseFloat(totalAmount) === parseFloat(totalAmountIncludingTax)
    },
    CheckOut: async (paymentMethodNonce, orderId, totalAmount) => {
        try {
            let gateway = await braintree.connect({
                environment: braintree.Environment.Sandbox,
                merchantId: config.braintree.merchantId,
                publicKey: config.braintree.publicKey,
                privateKey: config.braintree.privateKey
            })
            return await new Promise((resolve, reject) => {
                gateway.transaction.sale({
                    amount: totalAmount,
                    orderId: orderId,
                    paymentMethodNonce: paymentMethodNonce,
                    options: {
                        submitForSettlement: true
                    }
                }, function (err, result) {
                    if (err || !result.success) {
                        return reject(err || result.message)
                    } else {
                        return resolve(result)
                    }
                })
            })
        } catch (error) {
            throw (error)
        }
    },
    PlaceOrder: async (orderDetails, recipesData, trans) => {
        let recipesToJson = !isJSON(recipesData) ? JSON.parse(JSON.stringify(recipesData)) : JSON.parse(recipesData)
        try {
            const order = await db.Order.create(orderDetails, {transaction: trans})
            if (!order) {
                return false
            }
            for (const index in recipesToJson) {
                if (recipesToJson.hasOwnProperty(index)) {
                    recipesToJson[index].orderId = order.id
                }
            }
            for (const recipe of recipesToJson) {
                const orderItem = await db.OrderItem.create(recipe, {transaction: trans})
                if (!orderItem) {
                    return false
                }
            }
            return order
        } catch (error) {
            return false
        }
    },
    Transaction: async (transactionData, trans) => {
        try {
            return await db.TransactionDetail.create(transactionData, {transaction: trans})
        } catch (error) {
            return false
        }
    },
    UpdatePaymentStateAfterSuccess: async (orderId, trans) => {
        try {
            return await db.Order.update({
                paymentState: CommonConfig.ORDER.PAYMENT_STATE.COMPLETE
            }, {
                where: {
                    id: {
                        [Op.eq]: orderId
                    }
                },
                transaction: trans
            })
        } catch (error) {
            throw (error)
        }
    }
}

AuthService.prototype.Favorite = {
    Recipe: {
        CheckRecipeIsFavoriteByRecipeIdAndUserId: async (userId, recipeId) => {
            try {
                return await db.Favorite.findOne({
                    where: {
                        [Op.and]: [{
                            createdBy: userId,
                            recipeId: recipeId
                        }]
                    }
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
                                recipeId: favoriteData.recipeId,
                                createdBy: favoriteData.createdBy
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
                            createdBy: userId,
                            isFavorite: true
                        }]
                    }
                })
            } catch (error) {
                throw (error)
            }
        }
    },
    Profile: {
        CheckProfileIsFavoriteByProfileIdAndUserId: async (userId, profileId) => {
            try {
                return await db.Favorite.findOne({
                    where: {
                        [Op.and]: [{
                            createdBy: userId,
                            profileId: profileId
                        }]
                    }
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
                                profileId: favoriteData.profileId,
                                createdBy: favoriteData.createdBy
                            }]
                        }
                    })
                }
            } catch (error) {
                throw (error)
            }
        },
        GetFavoriteProfileListByUserId: async (userId) => {
            try {
                return await db.Favorite.findAll({
                    where: {
                        [Op.and]: [{
                            createdBy: userId,
                            isFavorite: true
                        }]
                    }
                })
            } catch (error) {
                throw (error)
            }
        }
    }
}

AuthService.prototype.Review = {
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

AuthService.prototype.SubCategory = {
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

AuthService.prototype.Allergy = {
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

AuthService.prototype.Units = {
    GettAll: async () => {
        try {
            return await db.Unit.findAll({
                attributes: ['id', 'unitName', 'sortName']
            })
        } catch (error) {
            throw (error)
        }
    }
}

module.exports = new AuthService()
