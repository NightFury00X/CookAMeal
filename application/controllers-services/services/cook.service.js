const Sequelize = require('sequelize')
const Op = Sequelize.Op
const db = require('../../modals')
const CommonService = require('./common.service')
const MapService = require('./map-service')
const CommonConfig = require('../../../configurations/helpers/common-config')
const braintree = require('braintree')
const config = require('../../../configurations/main')
CookService = function () {
}

CookService.prototype.Recipe = {
    CheckRecipeOwner: async (recipeId, profileId) => {
        try {
            return await db.Recipe.findOne({
                attributes: ['id'],
                where: {
                    [Op.and]: [{
                        id: `${recipeId}`,
                        profileId: `${profileId}`
                    }]
                }
            })
        } catch (error) {
            throw (error)
        }
    },
    GetMyAllRecipesList: async (profileId) => {
        try {
            return await db.Recipe.findAll({
                attributes: ['id', 'dishName', 'createdAt', 'subCategoryId', 'categoryId', 'costPerServing'],
                include: [{
                    model: db.MediaObject,
                    attributes: ['imageUrl']
                }],
                where: {
                    [Op.and]: [{
                        profileId: `${profileId}`,
                        isDeleted: false
                    }]
                }
            })
        } catch (error) {
            throw (error)
        }
    },
    Add: async (recipe, files, userTypeId, currencySymbol) => {
        const trans = await db.sequelize.transaction()
        try {
            let allergies
            let servingDays
            let ingredients
            if (recipe.baseAllergies) {
                allergies = JSON.parse(recipe.baseAllergies)
            }
            if (recipe.servingDays) {
                servingDays = JSON.parse(recipe.servingDays)
            }
            if (recipe.ingredients) {
                ingredients = JSON.parse(recipe.ingredients)
            }
            let preparationMethod = JSON.parse(recipe.preparationMethod)
            const profile = await CommonService.User.GetProfileIdByUserTypeId(userTypeId)
            recipe.profileId = profile.id
            recipe.currencySymbol = currencySymbol
            const recipeData = await db.Recipe.create(recipe, {transaction: trans})
            if (!recipeData) {
                await trans.rollback()
                return null
            }
            const geoCordinations = await MapService.Map.FindGeoCordinationsByProfileId(profile.id)
            if (!geoCordinations) {
                await trans.rollback()
                return null
            }
            const cooksDealWith = await db.CooksDealWithCategory.findOne({
                where: {
                    [Op.and]: [{
                        CooksDealWithCategoryId: profile.id,
                        categoryId: recipe.categoryId
                    }]
                }
            })
            if (!cooksDealWith) {
                await db.CooksDealWithCategory.create({
                    latitude: geoCordinations.latitude,
                    longitude: geoCordinations.longitude,
                    cooksDealWithCategoryId: profile.id,
                    categoryId: recipe.categoryId
                }, {transaction: trans})
            }
            const recipeGeoLocationsData = {
                latitude: geoCordinations.latitude,
                longitude: geoCordinations.longitude,
                profileId: profile.id,
                recipeId: recipeData.id
            }

            const recipeGeoLocations = await db.RecipesGeoLocations.create(recipeGeoLocationsData, {transaction: trans})
            if (!recipeGeoLocations) {
                await trans.rollback()
                return null
            }
            for (const index in allergies) {
                if (allergies.hasOwnProperty(index)) {
                    allergies[index].recipeId = recipeData.id
                    let allergydata = await db.RecipeAllergy.create(allergies[index], {transaction: trans})
                    if (!allergydata) {
                        await trans.rollback()
                        return null
                    }
                }
            }
            for (let index in files.recipe) {
                if (files.recipe.hasOwnProperty(index)) {
                    files.recipe[index].recipeId = recipeData.id
                    files.recipe[index].objectType = CommonConfig.OBJECT_TYPE.RECIPE
                    files.recipe[index].imageUrl = CommonConfig.FILE_LOCATIONS.RECIPE + files.recipe[index].filename
                    files.recipe[index].fileName = files.recipe[index].filename
                    files.recipe[index].originalName = files.recipe[index].originalname
                    files.recipe[index].mimeType = files.recipe[index].mimetype
                    delete files.recipe[index].filename
                    delete files.recipe[index].originalname
                    delete files.recipe[index].mimetype
                    const recipeImage = await db.MediaObject.create(files.recipe[index], {transaction: trans})
                    if (!recipeImage) {
                        await trans.rollback()
                        return null
                    }
                }
            }
            if (servingDays) {
                servingDays.recipeId = recipeData.id
                const daysData = await db.Day.create(servingDays, {transaction: trans})
                if (!daysData) {
                    await trans.rollback()
                    return null
                }
            }
            for (const index in ingredients) {
                if (ingredients.hasOwnProperty(index)) {
                    ingredients[index].recipeId = recipeData.id
                    let ingredientData = await db.Ingredient.create(ingredients[index], {transaction: trans})
                    if (!ingredientData) {
                        await trans.rollback()
                        return null
                    }
                }
            }
            for (const index in preparationMethod) {
                if (preparationMethod.hasOwnProperty(index)) {
                    preparationMethod[index].recipeId = recipeData.id
                    preparationMethod[index].step = parseInt(index) + 1
                    let preparationMethodData = await db.PreparationMethod.create(preparationMethod[index], {transaction: trans})
                    if (!preparationMethodData) {
                        await trans.rollback()
                        return null
                    }
                }
            }
            await trans.commit()
            return true
        } catch (error) {
            await trans.rollback()
            throw (error)
        }
    },
    GetAllRecipeBySubCategory: async (profileId) => {
        try {
            return await db.SubCategory.findAll({
                attributes: ['id', 'name'],
                include: [{
                    attributes: ['id', 'dishName', 'costPerServing', 'orderByDateTime'],
                    model: db.Recipe,
                    where: {
                        profileId: {
                            [Op.eq]: profileId
                        }
                    },
                    include: [{
                        attributes: ['id'],
                        model: db.RecipeAllergy,
                        include: [{
                            attributes: ['id', 'name'],
                            model: db.Allergy
                        }]
                    }, {
                        model: db.MediaObject,
                        attributes: ['imageUrl']
                    }]
                }]
            })
        } catch (error) {
            throw (error)
        }
    },
    GetAllRecipeBySubCategoryById: async (profileId, Id) => {
        try {
            return await db.SubCategory.findAll({
                where: {
                    id: {
                        [Op.eq]: Id
                    }
                },
                attributes: ['id', 'name'],
                include: [{
                    attributes: ['id', 'dishName', 'costPerServing', 'orderByDateTime'],
                    model: db.Recipe,
                    where: {
                        profileId: {
                            [Op.eq]: profileId
                        }
                    },
                    include: [{
                        model: db.MediaObject
                    }]
                }]
            })
        } catch (error) {
            throw (error)
        }
    },
    GetDeliveryFeesByRecipeId: async (recipeId) => {
        try {
            return db.Recipe.findOne({
                attributes: ['costPerServing', 'availableServings', 'deliveryFee', 'profileId', 'currencySymbol'],
                where: {
                    id: {
                        [Op.eq]: recipeId
                    }
                }
            })
        } catch (error) {
            throw (error)
        }
    },
    GetRecipeDetailsForOrderSummaryByRecipeId: async (recipeId) => {
        try {
            return db.Recipe.findOne({
                attributes: ['id', 'dishName', 'costPerServing', 'availableServings', 'deliveryFee', 'profileId', 'currencySymbol'],
                where: {
                    id: {
                        [Op.eq]: `${recipeId}`
                    }
                },
                include: [{
                    attributes: ['imageUrl'],
                    model: db.MediaObject
                }]
            })
        } catch (error) {
            throw (error)
        }
    },
    DeleteById: async (recipeId, profileId) => {
        try {
            return await db.Recipe.update({
                isDeleted: true,
                deletedAt: new Date()
            }, {
                where: {
                    [Op.and]: [{
                        id: `${recipeId}`,
                        profileId: `${profileId}`
                    }]
                }
            })
        } catch (error) {
            throw (error)
        }
    }
}

CookService.prototype.Order = {
    CurrentOrders: async (createdBy) => {
        try {
            return await db.Order.findAll({
                where: {
                    createdBy: {
                        [Op.eq]: createdBy
                    }
                }
            })
        } catch (error) {
            throw (error)
        }
    }
}

CookService.prototype.Certificate = {
    CheckCertificateIsUploaded: async (profileId) => {
        try {
            return await db.Certificate.findOne({
                attributes: ['id'],
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
    UpdateCertificate: async (certificateFile, certificateId) => {
        try {
            return await db.MediaObject.update(certificateFile, {
                where: {
                    certificateId: {
                        [Op.eq]: `${certificateId}`
                    }
                }
            })
        } catch (error) {
            throw (error)
        }
    }
}

CookService.prototype.UpdateIdentificationCard = async (profileId, identificationCardData, files) => {
    const trans = await db.sequelize.transaction()
    try {
        const identificationCardDetails = await db.IdentificationCard.findOne({
            where: {
                profileId: {
                    [Op.eq]: profileId
                }
            }
        })
        identificationCardData.updatedAt = Sequelize.fn('NOW')
        await db.IdentificationCard.update(identificationCardData,
            {
                where: {
                    id: {
                        [Op.eq]: identificationCardDetails.id
                    }
                },
                transaction: trans
            })
        if (files.identificationCard) {
            let identificationCardMedia = files.identificationCard[0]
            identificationCardMedia.objectType = CommonConfig.OBJECT_TYPE.IDENTIFICATIONCARD
            identificationCardMedia.imageUrl = CommonConfig.FILE_LOCATIONS.IDENTIFICATIONCARD + identificationCardMedia.filename
            identificationCardMedia.fileName = identificationCardMedia.filename
            identificationCardMedia.originalName = identificationCardMedia.originalname
            identificationCardMedia.mimeType = identificationCardMedia.mimetype
            delete identificationCardMedia.filename
            delete identificationCardMedia.originalname
            delete identificationCardMedia.mimetype
            const identificationCardMediaObject = await db.MediaObject.update(identificationCardMedia, {
                where: {
                    [Op.and]: [{
                        identificationCardId: `${identificationCardDetails.id}`,
                        profileId: `${profileId}`
                    }]
                },
                transaction: trans
            })
            if (!identificationCardMediaObject) {
                trans.rollback()
                return false
            }
            await trans.commit()
            return true
        }
    } catch (error) {
        trans.rollback()
        throw (error)
    }
}

CookService.prototype.Availability = {
    Add: async (createdBy, date, startTime, endTime) => {
        return await db.CookAvailability.create({createdBy, date, startTime, endTime})
    },
    GetAllCookAvailabilityDetails: async (createdBy) => {
        return await db.CookAvailability.findAll({
            attributes: ['startTime', 'endTime'],
            where: {
                createdBy: {
                    [Op.eq]: createdBy
                }
            }
        })
    },
    GetAllCookAvailabilityDetailsByDate: async (createdBy, date) => {
        return await db.CookAvailability.findAll({
            attributes: ['id', 'startTime', 'endTime'],
            where: {
                [Op.and]: [{
                    createdBy: `${createdBy}`,
                    date: `${date}`
                }]
            }
        })
    }
}

CookService.prototype.Order = {
    GetOrderDetailsForCustomerByOrderIdAndCustomerId: async (orderId, customerId) => {
        try {
            return await db.Order.findOne({
                where: {
                    [Op.and]: [{
                        id: `${orderId}`,
                        createdBy: `${customerId}`,
                        orderState: 0,
                        paymentState: 0
                    }]
                }
            })
        } catch (error) {
            throw (error)
        }
    },
    GetPaymentGatewayDetailsForCancellationById: async (paymentGatewayId, cookId, createdBy) => {
        try {
            return await db.PaymentGateway.findOne({
                attributes: ['id', 'nonce', 'amount', 'cookId', 'createdBy'],
                where: {
                    [Op.and]: [{
                        id: `${paymentGatewayId}`,
                        cookId: `${cookId}`,
                        createdBy: `${createdBy}`,
                        status: `Pending`
                    }]
                }
            })
        } catch (error) {
            throw (error)
        }
    },
    GetOrderDetailsById: async (orderId, cookId) => {
        try {
            return await db.Order.findOne({
                where: {
                    [Op.and]: [{
                        id: `${orderId}`,
                        cookId: `${cookId}`,
                        orderState: 0,
                        paymentState: 0
                    }]
                }
            })
        } catch (error) {
            throw (error)
        }
    },
    GetPaymentGatewayDetailsById: async (paymentGatewayId, cookId, customerId) => {
        try {
            return await db.PaymentGateway.findOne({
                attributes: ['id', 'nonce', 'amount', 'cookId', 'createdBy'],
                where: {
                    [Op.and]: [{
                        id: `${paymentGatewayId}`,
                        cookId: `${cookId}`,
                        createdBy: `${customerId}`,
                        status: `Pending`
                    }]
                }
            })
        } catch (error) {
            throw (error)
        }
    },
    ApprovedOrder: async (orderId, cookId, createdBy, trans) => {
        try {
            return await db.Order.update({
                updatedAt: Sequelize.fn('NOW'),
                orderState: CommonConfig.ORDER.ORDER_STATE.PROCESSING,
                paymentState: CommonConfig.ORDER.PAYMENT_STATE.COMPLETE
            }, {
                where: {
                    [Op.and]: [{
                        id: `${orderId}`,
                        cookId: `${cookId}`,
                        createdBy: `${createdBy}`,
                        orderState: 0,
                        paymentState: 0
                    }]
                },
                transaction: trans
            })
        } catch (error) {
            throw (error)
        }
    },
    ApprovedPaymentDetailsOrder: async (paymentGatewayId, cookId, createdBy, trans) => {
        try {
            return await db.PaymentGateway.update({
                updatedAt: Sequelize.fn('NOW'),
                status: 'APPROVED'
            }, {
                where: {
                    [Op.and]: [{
                        id: `${paymentGatewayId}`,
                        cookId: `${cookId}`,
                        createdBy: `${createdBy}`,
                        status: 'Pending'
                    }]
                },
                transaction: trans
            })
        } catch (error) {
            throw (error)
        }
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
    Transaction: async (transactionData, trans) => {
        try {
            return await db.TransactionDetail.create(transactionData, {transaction: trans})
        } catch (error) {
            return false
        }
    },
    RejectOrderByOrderId: async (orderId, cookId, trans) => {
        try {
            return await db.Order.update({
                updatedAt: Sequelize.fn('NOW'),
                orderState: CommonConfig.ORDER.ORDER_STATE.CANCELLED,
                paymentState: CommonConfig.ORDER.PAYMENT_STATE.COMPLETE
            }, {
                where: {
                    [Op.and]: [{
                        id: `${orderId}`,
                        cookId: `${cookId}`,
                        orderState: 0,
                        paymentState: 0
                    }]
                },
                transaction: trans
            })
        } catch (error) {
            throw (error)
        }
    }
}

module.exports = new CookService()
