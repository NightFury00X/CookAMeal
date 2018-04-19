const {ResponseHelpers} = require('../../../configurations/helpers/helper')
const CookService = require('../services/cook.service')
const AuthService = require('../services/auth-service')
const CommonService = require('../services/common.service')
const CommonConfig = require('../../../configurations/helpers/common-config')
const db = require('../../modals')
const Recipe = {
    GetAllRecipeBySubCategory: async (req, res, next) => {
        try {
            const profile = await CommonService.User.GetProfileIdByUserTypeId(req.user.id)
            let result = await CookService.Recipe.GetAllRecipeBySubCategory(profile.id)
            return ResponseHelpers.SetSuccessResponse(result, res, CommonConfig.STATUS_CODE.OK)
        } catch (error) {
            next(error)
        }
    },
    GetAllRecipeBySubCategoryById: async (req, res, next) => {
        try {
            let id = req.params['id']
            let result = await CookService.Recipe.GetAllRecipeBySubCategoryById('e4d2e9b2-6673-4bec-aa39-85d34add646a', id)

            return ResponseHelpers.SetSuccessResponse(result, res, CommonConfig.STATUS_CODE.OK)
        } catch (error) {
            next(error)
        }
    },
    Add: async (req, res, next) => {
        try {
            const {id} = req.user
            const profile = await CommonService.User.GetProfileIdByUserTypeId(id)
            const {currencySymbol} = await CommonService.User.GetCurrencySymbolByProfileId(profile.id)
            let recipeData = await CookService.Recipe.Add(req.body, req.files, req.user.id, currencySymbol)
            if (!recipeData) {
                return next({
                    message: CommonConfig.ERRORS.CREATION,
                    status: CommonConfig.STATUS_CODE.BAD_REQUEST
                }, false)
            }
            return ResponseHelpers.SetSuccessResponse({Message: 'Your recipe added successfully.'}, res, CommonConfig.STATUS_CODE.CREATED)
        } catch (error) {
            next(error)
        }
    },
    DeleteRecipe: async (req, res, next) => {
        try {
            const {id} = req.user
            const recipeId = req.value.params.id

            const profile = await CommonService.User.GetProfileIdByUserTypeId(id)
            if (!profile) {
                return ResponseHelpers.SetSuccessErrorResponse({message: 'Recipe not found.'}, res, CommonConfig.STATUS_CODE.OK)
            }
            const isOwnedBy = await CookService.Recipe.CheckRecipeOwner(recipeId, profile.id)
            if (!isOwnedBy) {
                return ResponseHelpers.SetSuccessErrorResponse({message: 'Recipe not found.'}, res, CommonConfig.STATUS_CODE.OK)
            }
            const result = await CookService.Recipe.DeleteById(recipeId, profile.id)
            if (!result) {
                return ResponseHelpers.SetSuccessErrorResponse({message: 'Recipe not found.'}, res, CommonConfig.STATUS_CODE.OK)
            }
            return ResponseHelpers.SetSuccessResponse({message: 'Recipe remove successfully.'}, res, CommonConfig.STATUS_CODE.OK)
        } catch (error) {
            next(error)
        }
    },
    GetAllRecipesList: async (req, res, next) => {
        try {
            const {id} = req.user
            const profile = await CommonService.User.GetProfileIdByUserTypeId(id)
            const recipe = await CookService.Recipe.GetMyAllRecipesList(profile.id)
            let recipeDetailsToJSON = JSON.parse(JSON.stringify(recipe))
            for (const index in recipeDetailsToJSON) {
                if (recipeDetailsToJSON.hasOwnProperty(index)) {
                    const categoryId = recipeDetailsToJSON[index].categoryId
                    const category = await CommonService.GetCategoryById(categoryId)
                    recipeDetailsToJSON[index].categoryName = category.name
                    const subCategoryId = recipeDetailsToJSON[index].subCategoryId
                    const subCategory = await AuthService.SubCategory.FindById(subCategoryId)
                    recipeDetailsToJSON[index].subCategoryName = subCategory.name
                    const ratingDetails = await CommonService.Recipe.FindRatingByRecipeId(recipeDetailsToJSON[index].id)
                    const currencyDetails = await CommonService.User.GetCurrencySymbolByProfileId(profile.id)
                    recipeDetailsToJSON[index].Rating = ratingDetails.rating || 0
                    recipeDetailsToJSON[index].currencySymbol = currencyDetails.currencySymbol
                }
            }
            return ResponseHelpers.SetSuccessResponse(recipeDetailsToJSON, res, CommonConfig.STATUS_CODE.OK)
        } catch (error) {
            next(error)
        }
    }
}

const Order = {
    CurrentOrders: async (req, res, next) => {
        try {
            const {id} = req.user
            const profile = await CommonService.User.GetProfileIdByUserTypeId(id)
            const ordersList = await CookService.Order.CurrentOrders(id)
            return ResponseHelpers.SetSuccessResponse(ordersList, res, CommonConfig.STATUS_CODE.CREATED)
        } catch (error) {
            next(error)
        }
    }
}

const Certificate = {
    Update: async (req, res, next) => {
        try {
            const {id} = req.user
            const {files} = req
            if (!files) {
                return ResponseHelpers.SetSuccessResponse({message: 'You did not upload any certificate.'}, res, CommonConfig.STATUS_CODE.CREATED)
            } else if (!files.certificate) {
                return ResponseHelpers.SetSuccessResponse({message: 'You did not upload any certificate.'}, res, CommonConfig.STATUS_CODE.CREATED)
            }
            const profile = await CommonService.User.GetProfileIdByUserTypeId(id)
            const certificateUploaded = await CookService.Certificate.CheckCertificateIsUploaded(profile.id)
            if (!certificateUploaded) {
                return ResponseHelpers.SetSuccessResponse({message: 'You did not upload any certificate.'}, res, CommonConfig.STATUS_CODE.CREATED)
            }
            let certificateFile = files.certificate[0]
            certificateFile.fileName = certificateFile.filename
            certificateFile.originalName = certificateFile.originalname
            certificateFile.mimeType = certificateFile.mimetype
            certificateFile.imageUrl = CommonConfig.FILE_LOCATIONS.CERTIFICATE + certificateFile.filename
            delete certificateFile.filename
            delete certificateFile.originalname
            delete certificateFile.mimetype
            const result = await CookService.Certificate.UpdateCertificate(certificateFile, certificateUploaded.id)
            if (!result) {
                return ResponseHelpers.SetSuccessResponse({message: 'Unable to update certificate'}, res, CommonConfig.STATUS_CODE.CREATED)
            }
            return ResponseHelpers.SetSuccessResponse({
                message: 'Certificate updated successfully.'
            }, res, CommonConfig.STATUS_CODE.CREATED)
        } catch (error) {
            next(error)
        }
    }
}

const IdentificationCard = {
    Update: async (req, res, next) => {
        try {
            const {id} = req.user
            const {type, typeId, country} = req.body
            if (!type && !typeId && !country) {
                return ResponseHelpers.SetSuccessErrorResponse('Invalid request.', res, CommonConfig.STATUS_CODE.OK)
            }
            if (!req.files) {
                return ResponseHelpers.SetSuccessErrorResponse('Invalid request.', res, CommonConfig.STATUS_CODE.OK)
            }
            const profile = await CommonService.User.GetProfileIdByUserTypeId(id)
            if (!profile) {
                return ResponseHelpers.SetSuccessErrorResponse('Profile not found.', res, CommonConfig.STATUS_CODE.OK)
            }
            let result = await CookService.UpdateIdentificationCard(profile.id, {type, typeId, country}, req.files)
            if (!result) {
                return ResponseHelpers.SetSuccessErrorResponse('Unable to update Identification Card.', res, CommonConfig.STATUS_CODE.OK)
            }
            return ResponseHelpers.SetSuccessResponse({message: 'Identification details updated successfully.'}, res, CommonConfig.STATUS_CODE.CREATED)
        } catch (error) {
            next(error)
        }
    }
}

const Availability = {
    Add: async (req, res, next) => {
        try {
            const {id} = req.user
            const {date, startTime, endTime} = req.body
            const result = await CookService.Availability.Add(id, date, startTime, endTime)
            if (!result) {
                return ResponseHelpers.SetSuccessErrorResponse({
                    message: 'Unable to process request.'
                }, res, CommonConfig.STATUS_CODE.CREATED)
            }
            return ResponseHelpers.SetSuccessResponse({
                message: 'Successfully Added.'
            }, res, CommonConfig.STATUS_CODE.CREATED)
        } catch (error) {
            next(error)
        }
    },
    CookAvailabilityList: async (req, res, next) => {
        try {
            const {id} = req.user
            const result = await CookService.Availability.GetAllCookAvailabilityDetails(id)
            if (!result) {
                return ResponseHelpers.SetSuccessErrorResponse({
                    message: 'Unable to process request.'
                }, res, CommonConfig.STATUS_CODE.CREATED)
            }
            return ResponseHelpers.SetSuccessResponse(result, res, CommonConfig.STATUS_CODE.CREATED)
        } catch (error) {
            next(error)
        }
    },
    CookAvailabilityListByDate: async (req, res, next) => {
        try {
            const {id} = req.user
            const {date} = req.params
            let datePart = date.split('-')
            const selctedDate = datePart[0] + ' ' + datePart[1] + ', ' + datePart[2]
            const result = await CookService.Availability.GetAllCookAvailabilityDetailsByDate(id, selctedDate)
            if (!result) {
                return ResponseHelpers.SetSuccessErrorResponse({
                    message: 'Unable to process request.'
                }, res, CommonConfig.STATUS_CODE.CREATED)
            }
            return ResponseHelpers.SetSuccessResponse(result, res, CommonConfig.STATUS_CODE.CREATED)
        } catch (error) {
            next(error)
        }
    },
    AceceptOrder: async (req, res, next) => {
        const trans = await db.sequelize.transaction()
        try {
            const {id} = req.user
            const {orderId} = req.params

            const profile = await CommonService.User.GetProfileIdByUserTypeId(id)
            if (!profile) {
                trans.rollback()
                return ResponseHelpers.SetSuccessErrorResponse({message: 'Order can not be Approved.'}, res, CommonConfig.STATUS_CODE.OK)
            }
            const orderDetails = await CookService.Order.GetOrderDetailsById(orderId, id)
            if (!orderDetails) {
                trans.rollback()
                return ResponseHelpers.SetSuccessErrorResponse({message: 'Order can not be Approved.'}, res, CommonConfig.STATUS_CODE.OK)
            }
            const paymentDetails = await CookService.Order.GetPaymentGatewayDetailsById(orderDetails.paymentGatwayId, id, orderDetails.createdBy)
            if (!paymentDetails) {
                trans.rollback()
                return ResponseHelpers.SetSuccessErrorResponse({message: 'Order can not be Approved.'}, res, CommonConfig.STATUS_CODE.OK)
            }
            const currencyData = await CommonService.User.GetCurrencySymbolByProfileId(profile.id)
            if (!currencyData) {
                trans.rollback()
                return ResponseHelpers.SetSuccessErrorResponse({message: 'Order can not be Approved.'}, res, CommonConfig.STATUS_CODE.OK)
            }
            const cancelOrderDetails = await CookService.Order.ApprovedOrder(orderDetails.id, id, orderDetails.createdBy, trans)
            if (!cancelOrderDetails) {
                trans.rollback()
                return ResponseHelpers.SetSuccessErrorResponse({message: 'Order can not be Approved.'}, res, CommonConfig.STATUS_CODE.OK)
            }
            const cancelpaymentDetails = await CookService.Order.ApprovedPaymentDetailsOrder(paymentDetails.id, id, orderDetails.createdBy, trans)
            if (!cancelpaymentDetails) {
                trans.rollback()
                return ResponseHelpers.SetSuccessErrorResponse({message: 'Order can not be Approved.'}, res, CommonConfig.STATUS_CODE.OK)
            }

            const checkOutDetails = await CookService.Order.CheckOut(paymentDetails.nonce, orderDetails.id, paymentDetails.amount)
            if (!checkOutDetails) {
                trans.rollback()
                return ResponseHelpers.SetSuccessErrorResponse({message: 'Order can not be Approved.'}, res, CommonConfig.STATUS_CODE.OK)
            }

            const transactionData = {
                transactionId: checkOutDetails.transaction.id,
                amount: checkOutDetails.transaction.amount,
                discountAmount: checkOutDetails.transaction.discountAmount,
                type: checkOutDetails.transaction.type,
                paymentInstrumentType: checkOutDetails.transaction.paymentInstrumentType,
                merchantAccountId: checkOutDetails.transaction.merchantAccountId,
                taxAmount: checkOutDetails.transaction.taxAmount,
                recurring: checkOutDetails.transaction.recurring,
                orderId: orderDetails.id,
                paidTo: checkOutDetails.transaction.merchantAccountId,
                paidBy: orderDetails.createdBy,
                status: checkOutDetails.transaction.status
            }
            const TId = transactionData.transactionId
            const transactionDetails = await CookService.Order.Transaction(transactionData, trans)
            if (!transactionDetails) {
                trans.rollback()
                return ResponseHelpers.SetSuccessErrorResponse({
                    orderState: false,
                    message: CommonConfig.ERRORS.ORDER.FAILURE,
                    orderId: OId,
                    transactionId: TId
                }, res, CommonConfig.STATUS_CODE.OK)
            }
            trans.commit()
            return ResponseHelpers.SetSuccessResponse({
                orderState: true,
                paymentDetails: {
                    transactionId: transactionDetails.id,
                    amount: currencyData.currencySymbol + ' ' + parseFloat(transactionDetails.amount),
                    paymentMethod: transactionDetails.paymentInstrumentType,
                    merchantAccountId: transactionDetails.merchantAccountId
                },
                orderDetails: {
                    id: orderDetails.id,
                    orderDate: orderDetails.createdAt,
                    amount: currencyData.currencySymbol + ' ' + parseFloat(orderDetails.totalAmount)
                },
                Message: CommonConfig.ERRORS.ORDER.SUCCESS
            }, res, CommonConfig.STATUS_CODE.CREATED)
        } catch (error) {
            trans.rollback()
            next(error)
        }
    },
    RejectOrder: async (req, res, next) => {
        const trans = await db.sequelize.transaction()
        try {
            const {id} = req.user
            const {orderId} = req.params
            const {reason, description} = req.body

            const orderDetails = await CookService.Order.GetOrderDetailsById(orderId, id)
            if (!orderDetails) {
                trans.rollback()
                return ResponseHelpers.SetSuccessErrorResponse({message: 'Order not found.'}, res, CommonConfig.STATUS_CODE.OK)
            }
            const paymentDetails = await CookService.Order.GetPaymentGatewayDetailsById(orderDetails.paymentGatwayId, id, orderDetails.createdBy)
            if (!paymentDetails) {
                trans.rollback()
                return ResponseHelpers.SetSuccessErrorResponse({message: 'Order not found.'}, res, CommonConfig.STATUS_CODE.OK)
            }
            const rejectOrderDetails = await CookService.Order.RejectedOrder(orderDetails.id, id, orderDetails.createdBy, trans)
            if (!rejectOrderDetails) {
                trans.rollback()
                return ResponseHelpers.SetSuccessErrorResponse({message: 'Unable to reject Order.'}, res, CommonConfig.STATUS_CODE.OK)
            }
            const rejectpaymentDetails = await CookService.Order.RejectPaymentDetailsOrder(paymentDetails.id, id, orderDetails.createdBy, trans)
            if (!rejectpaymentDetails) {
                trans.rollback()
                return ResponseHelpers.SetSuccessErrorResponse({message: 'Unable to reject Order.'}, res, CommonConfig.STATUS_CODE.OK)
            }
            const orderStateMasterData = {
                orderId: orderDetails.id,
                isRejected: true,
                reason: reason,
                description: description,
                userType: CommonConfig.ORDER.USER_TYPE.COOK,
                userId: orderDetails.createdBy
            }
            const orderStateMasterDetails = await AuthService.Order.AddToOrderStateMaster(orderStateMasterData, trans)
            if (!orderStateMasterDetails) {
                trans.rollback()
                return ResponseHelpers.SetSuccessErrorResponse({message: 'Unable to reject Order.'}, res, CommonConfig.STATUS_CODE.OK)
            }
            trans.commit()
            return ResponseHelpers.SetSuccessResponse({message: 'Order Successfully Rejected.'}, res, CommonConfig.STATUS_CODE.OK)
        } catch (error) {
            trans.rollback()
            next(error)
        }
    }
}

const CookController = {
    Recipe: Recipe,
    Order: Order,
    Certificate: Certificate,
    IdentificationCard: IdentificationCard,
    Availability: Availability
}

module.exports = CookController
