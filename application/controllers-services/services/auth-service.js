const Sequelize = require('sequelize')
const Op = Sequelize.Op
const db = require('../../modals')
const isJSON = require('is-json')
const braintree = require('braintree')
const config = require('../../../configurations/main')
const CommonConfig = require('../../../configurations/helpers/common-config')
const MapService = require('../services/map-service')
AuthService = function () {
}

AuthService.prototype.User = {
    updateUserProfile: async (userId, profileId, profileData, addressData) => {
        const trans = await db.sequelize.transaction()
        try {
            delete profileData.addressForm
            const profile = await db.Profile.update(profileData, {
                where: {
                    createdBy: {
                        [Op.eq]: userId
                    }
                },
                transaction: trans
            })
            if (!profile) {
                trans.rollback()
                return false
            }
            const address = await db.Address.update(addressData, {
                where: {
                    profileId: {
                        [Op.eq]: profileId
                    }
                },
                transaction: trans
            })
            if (!address) {
                trans.rollback()
                return false
            }
            trans.commit()
            return true
        } catch (error) {
            trans.rollback()
            throw (error)
        }
    },
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
                    attributes: ['id', 'email', 'firstName', 'lastName', 'phone', 'gender', 'description', 'dietPreference', 'allergies', 'drivingDistance', 'profileUrl', 'coverPhotoUrl', 'isEligibleForHire', 'isFacebookConnected'],
                    include: [{
                        model: db.Address,
                        attributes: ['id', 'street', 'city', 'state', 'zipCode', 'country', 'latitude', 'longitude']
                    }, {
                        model: db.IdentificationCard,
                        attributes: ['id', 'type', 'typeId', 'country'],
                        include: [{
                            model: db.MediaObject,
                            attributes: ['imageUrl']
                        }]
                    }, {
                        model: db.Certificate,
                        attributes: ['id', 'profileId'],
                        include: [{
                            model: db.MediaObject,
                            attributes: ['imageUrl']
                        }]
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
                        attributes: ['id', 'street', 'city', 'state', 'zipCode', 'country', 'latitude', 'longitude']
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
            },
            transaction: trans
        })
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
            },
            transaction: trans
        })
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
    GetCurrentAddressByProfileId: async (profileId) => {
        try {
            return await db.Address.findOne({
                attributes: ['id', 'street', 'city', 'state', 'zipCode', 'country'],
                where: {
                    profileId: {
                        [Op.eq]: `${profileId}`
                    }
                }
            })
        } catch (error) {
            throw (error)
        }
    },
    GetTopDeliveryAddressByProfileId: async (profileId) => {
        try {
            return await db.DeliveryAddress.findAll({
                attributes: ['id', 'street', 'city', 'state', 'zipCode', 'country', 'fullName', 'createdAt'],
                where: {
                    [Op.and]: [{
                        isDeleted: 0,
                        profileId: `${profileId}`
                    }]
                },
                limit: 5,
                order: [
                    ['createdAt', 'DESC']
                ]
            })
        } catch (error) {
            throw (error)
        }
    },
    AddNewDeliveryAddress: async (address) => {
        try {
            const location = await MapService.Map.GetGeoCordinatesFromAddress(`${address.street}, ${address.city}, ${address.state}, ${address.country}`)
            address.latitude = location[0].latitude
            address.longitude = location[0].longitude

            console.log('deliverAddressData: ', address)
            return await db.DeliveryAddress.create(address)
        } catch (error) {
            throw (error)
        }
    },
    DeleteDeliveryAddress: async (addressId, profileId) => {
        try {
            const address = {
                isDeleted: 1,
                deletedAt: new Date()
            }
            return await db.DeliveryAddress.update(address, {
                where: {
                    [Op.and]: [{
                        id: `${addressId}`,
                        profileId: `${profileId}`
                    }]
                }
            })
        } catch (error) {
            throw (error)
        }
    },
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
    // CheckOut: async (paymentMethodNonce, orderId, totalAmount) => {
    //     try {
    //         let gateway = await braintree.connect({
    //             environment: braintree.Environment.Sandbox,
    //             merchantId: config.braintree.merchantId,
    //             publicKey: config.braintree.publicKey,
    //             privateKey: config.braintree.privateKey
    //         })
    //         return await new Promise((resolve, reject) => {
    //             gateway.transaction.sale({
    //                 amount: totalAmount,
    //                 orderId: orderId,
    //                 paymentMethodNonce: paymentMethodNonce,
    //                 options: {
    //                     submitForSettlement: true
    //                 }
    //             }, function (err, result) {
    //                 if (err || !result.success) {
    //                     return reject(err || result.message)
    //                 } else {
    //                     return resolve(result)
    //                 }
    //             })
    //         })
    //     } catch (error) {
    //         throw (error)
    //     }
    // },
    CreateAndHoldPayment: async (paymentData, trans) => {
        try {
            return db.PaymentGateway.create(paymentData, {transaction: trans})
        } catch (error) {
            throw (errorl)
        }
    },
    CheckOut: async (paymentMethodNonce, totalAmount) => {
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
            // if (!order) {
            //     return false
            // }
            for (const index in recipesToJson) {
                if (recipesToJson.hasOwnProperty(index)) {
                    recipesToJson[index].orderId = order.id
                }
            }
            for (const recipe of recipesToJson) {
                const orderItem = await db.OrderItem.create(recipe, {transaction: trans})
                // if (!orderItem) {
                //     return false
                // }
            }
            return order
        } catch (error) {
            return error
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
            console.log('Error: ', error)
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

AuthService.prototype.Facebook = {
    CheckFacebookIsConnected: async (createdBy) => {
        try {
            return await db.Profile.findOne({
                attributes: ['id', 'isFacebookConnected'],
                where: {
                    createdBy: {
                        [Op.eq]: `${createdBy}`
                    }
                }
            })
        } catch (error) {
            throw (error)
        }
    },
    UpdateUserFacebookConnectionStatus: async (createdBy, isFacebookConnected) => {
        try {
            const profile = {
                isFacebookConnected: isFacebookConnected,
                updatedAt: Sequelize.fn('NOW')
            }
            return await db.Profile.update(profile, {
                where: {
                    createdBy: {
                        [Op.eq]: `${createdBy}`
                    }
                }
            })
        } catch (error) {
            throw (error)
        }
    }
}

AuthService.prototype.Cart = {
    GetAllCartItemByCartIdAndCookId: async (cartId, cookId) => {
        try {
            return await db.CartItem.findAll({
                attributes: ['noOfServing', 'spiceLevel', 'recipeId'],
                where: {
                    [Op.and]: [{
                        cartId: `${cartId}`,
                        cookId: `${cookId}`
                    }]
                }
            })
        } catch (error) {
            throw (error)
        }
    },
    GetCartItemByCartItemId: async (cartItemId, cartId) => {
        try {
            return await db.CartItem.findOne({
                where: {
                    [Op.and]: [{
                        id: `${cartItemId}`,
                        cartId: `${cartId}`
                    }]
                }
            })
        } catch (error) {
            throw (error)
        }
    },
    GetSelectedCartTotalPrice: async (cartId, cookId) => {
        try {
            return await db.CartItem.findAll({
                where: {
                    [Op.and]: [{
                        cartId: `${cartId}`,
                        cookId: `${cookId}`
                    }]
                },
                attributes: [[Sequelize.fn('SUM', Sequelize.col('price')), 'price']]
            })
        } catch (error) {
            throw (error)
        }
    },
    GetRecipeCartIdFromCartByCreatedBy: async (createdBy) => {
        try {
            return await db.AddToCart.findOne({
                attributes: ['id'],
                where: {
                    [Op.and]: [{
                        createdBy: `${createdBy}`,
                        cartFor: `${1}`,
                        status: 0
                    }]
                }
            })
        } catch (error) {
            throw (error)
        }
    },
    CheckCartItemOwner: async (createdBy) => {
        try {
            return await db.AddToCart.findOne({
                where: {
                    [Op.and]: [{
                        createdBy: `${createdBy}`,
                        status: 0
                    }]
                }
            })
        } catch (error) {
            throw (error)
        }
    },
    CheckCartItemIsExists: async (cartId, cartItemId, recipeId) => {
        try {
            return await db.CartItem.findOne({
                where: {
                    [Op.and]: [{
                        id: `${cartItemId}`,
                        cartId: `${cartId}`,
                        recipeId: `${recipeId}`,
                        status: 0
                    }]
                }
            })
        } catch (error) {
            throw (error)
        }
    },
    UpdateSpiceLevel: async (cartItemId, cartId, recipeId, spiceLevel) => {
        try {
            const updatedAt = Sequelize.fn('NOW')
            return await db.CartItem.update({
                spiceLevel, updatedAt
            }, {
                where: {
                    [Op.and]: [{
                        id: `${cartItemId}`,
                        cartId: `${cartId}`,
                        recipeId: `${recipeId}`,
                        isDeleted: false
                    }]
                }
            })
        } catch (errro) {
            throw (errro)
        }
    },
    UpdateNoOfServing: async (cartItemId, cartId, noOfServing, recipeId, price) => {
        try {
            const updatedAt = Sequelize.fn('NOW')
            return await db.CartItem.update({
                noOfServing, updatedAt, price
            }, {
                where: {
                    [Op.and]: [{
                        id: `${cartItemId}`,
                        cartId: `${cartId}`,
                        recipeId: `${recipeId}`,
                        isDeleted: false
                    }]
                }
            })
        } catch (errro) {
            throw (errro)
        }
    },
    CheckRecipeCartIsOpen: async (createdBy) => {
        try {
            return await db.AddToCart.findOne({
                where: {
                    [Op.and]: {
                        createdBy: `${createdBy}`,
                        cartFor: `${1}`,
                        status: false
                    }
                }
            })
        } catch (error) {
            throw (error)
        }
    },
    AddToCartRecipe: async (addToCartDetails) => {
        const trans = await db.sequelize.transaction()
        try {
            const addToCart = await db.AddToCart.create({
                createdBy: addToCartDetails.createdBy,
                cartFor: 1
            }, {transaction: trans})
            if (!addToCart) {
                return false
            }
            addToCartDetails.cartId = addToCart.id
            const cartItem = await db.CartItem.create({
                spiceLevel: addToCartDetails.spiceLevel,
                noOfServing: addToCartDetails.noOfServing,
                price: addToCartDetails.price,
                cartId: addToCart.id,
                cookId: addToCartDetails.cookId,
                recipeId: addToCartDetails.recipeId
            }, {transaction: trans})
            if (!cartItem) {
                return false
            }
            trans.commit()
            return true
        } catch (error) {
            trans.rollback()
            throw (error)
        }
    },
    GetCartRecipeItemByRecipeId: async (recipeId, createdBy, cartId) => {
        try {
            return await db.AddToCart.findOne({
                where: [{
                    createdBy: {
                        [Op.eq]: `${createdBy}`
                    }
                }],
                include: [{
                    model: db.CartItem,
                    attributes: ['id', 'spiceLevel', 'noOfServing'],
                    where: {
                        [Op.and]: [{
                            recipeId: `${recipeId}`,
                            id: `${cartId}`
                        }]
                    }
                }]
            })
        } catch (error) {
            throw (error)
        }
    },
    AddItemToExistingRecipeCart: async (addToCartDetails) => {
        try {
            return await db.CartItem.create(addToCartDetails)
        } catch (error) {
            throw (error)
        }
    },
    GetRecipeCartDetails: async (cartId) => {
        try {
            return await db.Profile.findAll({
                attributes: ['id', 'firstName', 'lastName', 'createdBy', 'profileUrl'],
                include: [{
                    required: true,
                    model: db.CartItem,
                    where: {
                        cartId: {
                            [Op.eq]: `${cartId}`
                        }
                    },
                    attributes: ['id', 'id', 'noOfServing', 'price', 'recipeId', 'spiceLevel', 'cookId']
                }]
            })
        } catch (error) {
            throw (error)
        }
    },
    GetRecipeCartDetailsByCookId: async (cartId, cookId) => {
        try {
            return await db.Profile.findAll({
                attributes: ['id', 'firstName', 'lastName', 'createdBy', 'profileUrl'],
                include: [{
                    required: true,
                    model: db.CartItem,
                    where: {
                        [Op.and]: [{
                            cartId: `${cartId}`,
                            cookId: `${cookId}`
                        }]
                    },
                    attributes: ['id', 'id', 'noOfServing', 'price', 'recipeId', 'spiceLevel', 'cookId']
                }]
            })
        } catch (error) {
            throw (error)
        }
    },
    GetCartItemsGroupedByCook: async (cartId) => {
        try {
            return await db.CartItem.findAll({
                attributes: ['cookId'],
                where: {
                    cartId: {
                        [Op.eq]: cartId
                    }
                },
                group: ['cookId']
            })
        } catch (error) {
            throw (error)
        }
    },
    GetPriceOfRecipeByCartItemId: async (itemId) => {
        try {
            return await db.Recipe.findOne({
                attributes: ['costPerServing', 'profileId'],
                include: [{
                    model: db.CartItem,
                    where: {
                        id: {
                            [Op.eq]: `${itemId}`
                        }
                    }
                }]
            })
        } catch (error) {
            throw (error)
        }
    },
    GetCartItemDetailsById: async (itemId) => {
        try {
            return await db.CartItem.findById(itemId)
        } catch (error) {
            throw (error)
        }
    },
    DeleteCartDetails: async (itemId, cartId) => {
        try {
            return await db.CartItem.destroy({
                where: {
                    [Op.and]: [{
                        id: `${itemId}`,
                        cartId: `${cartId}`
                    }]
                }
            })
        } catch (error) {
            throw (error)
        }
    }
}

AuthService.prototype.WishList = {
    All: async (createdBy) => {
        try {
            return db.Recipe.findAll({
                attributes: ['id', 'dishName', 'costPerServing', 'profileId', 'currencySymbol'],
                include: [{
                    attributes: ['imageUrl'],
                    model: db.MediaObject
                }, {
                    model: db.Favorite,
                    attributes: ['id'],
                    required: true,
                    where: {
                        createdBy: {
                            [Op.eq]: `${createdBy}`
                        }
                    }
                }]
            })
            // return db.Favorite.findAll({
            //     where: {
            //         createdBy: {
            //             [Op.eq]: `${createdBy}`
            //         }
            //     },
            //     include: [{
            //         model: db.Recipe
            //     }]
            // })
        } catch (error) {
            throw (error)
        }
    },
    CheckItemIsOwnedByCurrentUser: async (createdBy, itemId) => {
        try {
            return await db.Favorite.findOne({
                where: {
                    [Op.and]: [{
                        createdBy: `${createdBy}`,
                        id: `${itemId}`
                    }]
                }
            })
        } catch (error) {
            throw (error)
        }
    },
    Delete: async (itemId, createdBy) => {
        try {
            return await db.Favorite.destroy({
                where: {
                    [Op.and]: [{
                        createdBy: `${createdBy}`,
                        id: `${itemId}`
                    }]
                }
            })
        } catch (error) {
            throw (error)
        }
    }
}

module.exports = new AuthService()
