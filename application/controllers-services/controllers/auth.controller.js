const db = require('../../modals')
const {ResponseHelpers} = require('../../../configurations/helpers/helper')
const CommonConfig = require('../../../configurations/helpers/common-config')
const AuthService = require('../services/auth-service')
const CommonService = require('../services/common.service')
const CookService = require('../services/cook.service')
const braintree = require('braintree')
const config = require('../../../configurations/main')
const gateway = braintree.connect({
    environment: braintree.Environment.Sandbox,
    merchantId: config.braintree.merchantId,
    publicKey: config.braintree.publicKey,
    privateKey: config.braintree.privateKey
})

let Auth = {
    LogOutUser: async (req, res, next) => {
        try {
            req.check('type').notEmpty()
            if (req.validationErrors() || req.validationErrors().length > 0) {
                return next({
                    message: CommonConfig.ERRORS.CREATION,
                    status: CommonConfig.STATUS_CODE.BAD_REQUEST
                }, false)
            }
            let tokenDetails = {
                userId: req.user.id,
                token: req.get('Authorization'),
                reasons: CommonConfig.REASONS.USER_LOGGED_OUT
            }
            let data = await AuthService.User.Logout(tokenDetails)
            if (!data) {
                return next({
                    message: CommonConfig.ERRORS.INTERNAL_SERVER_ERROR,
                    status: CommonConfig.STATUS_CODE.INTERNAL_SERVER_ERROR
                }, false)
            }
            return ResponseHelpers.SetSuccessResponse({message: CommonConfig.SUCCESS.LOGGED_OUT}, res, CommonConfig.STATUS_CODE.OK)
        } catch (error) {
            next(error)
        }
    },
    ChangePassword: async (req, res, next) => {
        try {
            let userDetails = {
                id: req.user.id,
                email: req.user.emailId,
                password: req.body.newPassword
            }
            let userData = await AuthService.GetResetPasswordData(req.user.email)
            const isMatch = await userData.comparePasswords(req.body.oldPassword)
            if (!isMatch) {
                return next({
                    message: CommonConfig.ERRORS.PASSWORD_NOT_MATCHED,
                    status: CommonConfig.STATUS_CODE.BAD_REQUEST
                }, false)
            }
            let data = await AuthService.ChangePassword(userDetails)
            if (!data) {
                return next({
                    message: CommonConfig.ERRORS.INTERNAL_SERVER_ERROR,
                    status: CommonConfig.STATUS_CODE.INTERNAL_SERVER_ERROR
                }, false)
            }
            const TokenData = await AuthService.GenerateTokenByUserTypeId(req.user.createdBy)
            return ResponseHelpers.SetSuccessResponse({
                token: TokenData,
                message: CommonConfig.SUCCESS.PASSWORD_CHANGED
            }, res, CommonConfig.STATUS_CODE.OK)
        } catch (error) {
            next(error)
        }
    },
    ProfileCover: async (req, res, next) => {
        try {
            const userId = req.user.id
            const profile = await CommonService.User.GetProfileIdByUserTypeId(userId)
            const profileId = profile.id
            const result = await CommonService.User.ProfileCover({profileId: profileId}, req.files)
            if (!result) {
                return ResponseHelpers.SetSuccessResponse({message: 'Profile cover not updated.'}, res, CommonConfig.STATUS_CODE.OK)
            }
            return ResponseHelpers.SetSuccessResponse({message: 'Profile cover updated.'}, res, CommonConfig.STATUS_CODE.OK)
        } catch (error) {
            next(error)
        }
    }
}

let User = {
    ChangeProfile: async (req, res, next) => {
        try {
            const {id, facebookId} = req.user
            const {userRole} = req.body
            const result = await AuthService.User.ChangeProfileType(userRole, id, facebookId)
            if (!result) {
                return ResponseHelpers.SetNotFoundResponse(CommonConfig.ERRORS.UNABLE_TO_PROCESS, res)
            }
            return ResponseHelpers.SetSuccessResponse({Message: 'You are successfully logged in.'}, res, CommonConfig.STATUS_CODE.OK)
        } catch (error) {
            next(error)
        }
    },
    GetUserProfile: async (req, res, next) => {
        try {
            const {id} = req.user
            const userData = await AuthService.User.GetUserTypeDetailsById(id)
            console.log('Has Profile: ', userData.hasProfile)
            if (userData.hasProfile) {
                const data = await AuthService.User.GetProfileDataIfProfileUpdated(userData.id)
                return ResponseHelpers.SetSuccessResponse(data, res, CommonConfig.STATUS_CODE.OK)
            } else {
                const data = await AuthService.User.GetProfileDataIfProfileNotUpdated(userData.id, userData.facebookId)
                return ResponseHelpers.SetSuccessResponse(data, res, CommonConfig.STATUS_CODE.OK)
            }
        } catch (error) {
            next(error)
        }
    },
    GetAllReviewsByProfileId: async (req, res, next) => {
        try {
            const userId = req.user.id
            const profile = await AuthService.User.GetProfileIdByUserTypeId(userId)
            const result = await AuthService.User.FindAllReviewsByProfileId(profile.id)
            return ResponseHelpers.SetSuccessResponse(result, res, CommonConfig.STATUS_CODE.OK)
        } catch (error) {
            next(error)
        }
    }
}

let Category = {
    GetAll: async (req, res, next) => {
        try {
            let result = await CommonService.GetCategories()
            return ResponseHelpers.SetSuccessResponse(result, res, CommonConfig.STATUS_CODE.OK)
        } catch (error) {
            next(error)
        }
    },
    FindById: async (req, res, next) => {
        try {
            if (!req.params.id) {
                return ResponseHelpers.SetNotFoundResponse(CommonConfig.ERRORS.CATEGORY.NOT_FOUND, res)
            }
            const catId = req.params.id
            const result = await CommonService.GetCategoryById(catId)
            return ResponseHelpers.SetSuccessResponse(result, res, CommonConfig.STATUS_CODE.OK)
        } catch (error) {
            next(error)
        }
    }
}

let SubCategory = {
    GetAll: async (req, res, next) => {
        try {
            const result = await AuthService.SubCategory.GettAll()
            return ResponseHelpers.SetSuccessResponse(result, res, CommonConfig.STATUS_CODE.OK)
        } catch (error) {
            next(error)
        }
    },
    FindById: async (req, res, next) => {
        try {
            if (!req.params.id) {
                return ResponseHelpers.SetNotFoundResponse(CommonConfig.ERRORS.SUB_CATEGORY.NOT_FOUND, res)
            }
            const catId = req.params.id
            const result = await CommonService.GetCategoryById(catId)
            return ResponseHelpers.SetSuccessResponse(result, res, CommonConfig.STATUS_CODE.OK)
        } catch (error) {
            next(error)
        }
    }
}

let Allergy = {
    GetAll: async (req, res, next) => {
        try {
            const result = await AuthService.Allergy.GettAll()
            return ResponseHelpers.SetSuccessResponse(result, res, CommonConfig.STATUS_CODE.OK)
        } catch (error) {
            next(error)
        }
    },
    FindById: async (req, res, next) => {
        try {
            if (!req.params.id) {
                return ResponseHelpers.SetNotFoundResponse(CommonConfig.ERRORS.ALLERGY.NOT_FOUND, res)
            }
            const catId = req.params.id
            const result = await CommonService.GetCategoryById(catId)
            return ResponseHelpers.SetSuccessResponse(result, res, CommonConfig.STATUS_CODE.OK)
        } catch (error) {
            next(error)
        }
    }
}

let Units = {
    GetAll: async (req, res, next) => {
        try {
            const result = await AuthService.Units.GettAll()
            return ResponseHelpers.SetSuccessResponse(result, res, CommonConfig.STATUS_CODE.OK)
        } catch (error) {
            next(error)
        }
    },
    FindById: async (req, res, next) => {
        try {
            if (!req.params.id) {
                return ResponseHelpers.SetNotFoundResponse(CommonConfig.ERRORS.UNIT.NOT_FOUND, res)
            }
            const catId = req.params.id
            const result = await CommonService.GetCategoryById(catId)
            return ResponseHelpers.SetSuccessResponse(result, res, CommonConfig.STATUS_CODE.OK)
        } catch (error) {
            next(error)
        }
    }
}

const Feedback = {
    Add: async (req, res, next) => {
        try {
            const userId = req.user.id
            let feedback = req.body
            feedback.createdBy = userId
            let result = await AuthService.Feedback.Add(feedback)
            if (!result) {
                return ResponseHelpers.SetErrorResponse(CommonConfig.ERRORS.FEEDBACK.FAILURE, res)
            }
            return ResponseHelpers.SetSuccessResponse({Message: CommonConfig.ERRORS.FEEDBACK.SUCCESS}, res, CommonConfig.STATUS_CODE.CREATED)
        } catch (error) {
            next(error)
        }
    }
}

const Favorite = {
    Recipe: {
        MarkRecipeAsFavorite: async (req, res, next) => {
            try {
                const userId = req.user.id
                const favorite = {
                    createdBy: userId,
                    recipeId: req.body.recipeId
                }
                const recipe = await CommonService.Recipe.FindRecipeIsExist(favorite.recipeId)
                if (!recipe) {
                    return ResponseHelpers.SetNotFoundResponse(CommonConfig.ERRORS.RECIPE.NOT_FOUND, res)
                }
                const isFavorite = await AuthService.Favorite.Recipe.CheckRecipeIsFavoriteByRecipeIdAndUserId(favorite.createdBy, favorite.recipeId)
                const flag = !!isFavorite
                await AuthService.Favorite.Recipe.MarkFavorite(favorite, flag)
                const msg = !flag ? CommonConfig.ERRORS.RECIPE.MARKED : CommonConfig.ERRORS.RECIPE.UNMARKED
                return ResponseHelpers.SetSuccessResponse({
                    Message: msg,
                    favorite: !flag
                }, res, CommonConfig.STATUS_CODE.CREATED)
            } catch (error) {
                next(error)
            }
        },
        GetRecipeMarkedFavoriteList: async (req, res, next) => {
            try {
                const userId = req.user.id
                const result = await AuthService.Favorite.Recipe.GetFavoriteRecipeListByUserId(userId)
                return ResponseHelpers.SetSuccessResponse({Message: result}, res, CommonConfig.STATUS_CODE.OK)
            } catch (error) {
                next(error)
            }
        }
    },
    Profile: {
        MarkProfileAsFavorite: async (req, res, next) => {
            try {
                const userId = req.user.id
                const favorite = {
                    createdBy: userId,
                    profileId: req.body.profileId
                }
                const profile = await AuthService.User.FindProfileIsExist(favorite.profileId)
                if (!profile) {
                    return ResponseHelpers.SetNotFoundResponse(CommonConfig.ERRORS.PROFILE.NOT_FOUND, res)
                }
                const isFavorite = await AuthService.Favorite.Profile.CheckProfileIsFavoriteByProfileIdAndUserId(favorite.createdBy, favorite.profileId)
                const flag = !!isFavorite
                await AuthService.Favorite.Profile.MarkFavorite(favorite, flag)
                const msg = !flag ? CommonConfig.ERRORS.PROFILE.MARKED : CommonConfig.ERRORS.PROFILE.UNMARKED
                return ResponseHelpers.SetSuccessResponse({
                    Message: msg,
                    favorite: !flag
                }, res, CommonConfig.STATUS_CODE.CREATED)
            } catch (error) {
                next(error)
            }
        },
        GetProfileMarkedFavoriteList: async (req, res, next) => {
            try {
                const userId = req.user.id
                const result = await AuthService.Favorite.Recipe.GetFavoriteRecipeListByUserId(userId)
                return ResponseHelpers.SetSuccessResponse({Message: result}, res, CommonConfig.STATUS_CODE.OK)
            } catch (error) {
                next(error)
            }
        }
    }
}

const ReviewDetails = {
    RecipeReview: async (req, res, next) => {
        try {
            const userId = req.user.id
            const review = {
                recipeId: req.body.recipeId,
                rating: req.body.rating,
                comments: req.body.comments,
                createdBy: userId
            }
            const isExist = await AuthService.Review.CheckRecipeId(review.recipeId)
            if (!isExist) {
                return ResponseHelpers.SetErrorResponse(CommonConfig.ERRORS.REVIEW.FAILURE, res)
            }
            const result = await AuthService.Review.Recipe(review)
            if (!result) {
                return ResponseHelpers.SetErrorResponse(CommonConfig.ERRORS.REVIEW.FAILURE, res)
            }
            return ResponseHelpers.SetSuccessResponse({Message: CommonConfig.ERRORS.REVIEW.SUCCESS}, res, CommonConfig.STATUS_CODE.CREATED)
        } catch (error) {
            next(error)
        }
    },
    ProfileReview: async (req, res, next) => {
        try {
            const userId = req.user.id
            const review = {
                profileId: req.body.profileId,
                rating: req.body.rating,
                comments: req.body.comments,
                createdBy: userId
            }

            const isExist = await AuthService.Review.CheckUserId(review.profileId)
            if (!isExist) {
                return ResponseHelpers.SetErrorResponse(CommonConfig.ERRORS.REVIEW.FAILURE, res)
            }

            const result = await AuthService.Review.Profile(review)
            if (!result) {
                return ResponseHelpers.SetErrorResponse(CommonConfig.ERRORS.REVIEW.FAILURE, res)
            }
            return ResponseHelpers.SetSuccessResponse({Message: CommonConfig.ERRORS.REVIEW.SUCCESS}, res, CommonConfig.STATUS_CODE.CREATED)
        } catch (error) {
            next(error)
        }
    }
}

let Order = {
    GetMyOrders: async (req, res, next) => {
        try {
            console.log('Done')
        } catch (error) {
            next(error)
        }
    },
    PrepareData: async (req, res, next) => {
        try {
            const clientToken = await gateway.clientToken.generate()
            const recipeId = req.value.params.id
            const recipeData = await CookService.Recipe.GetDeliveryFeesByRecipeId(recipeId)
            const currencySymbol = await CommonService.User.GetCurrencySymbolByProfileId(recipeData.profileId)
            const prepareData = {
                ClientToken: clientToken.clientToken,
                RecipeDetails: {
                    costPerServing: parseFloat(recipeData.costPerServing),
                    availableServings: parseFloat(recipeData.availableServings),
                    deliveryFees: parseFloat(recipeData.deliveryFee),
                    currencySymbol: currencySymbol.currencySymbol
                },
                Tax: parseFloat(5)
            }
            return ResponseHelpers.SetSuccessResponse(prepareData, res, CommonConfig.STATUS_CODE.OK)
        } catch (error) {
            next(error)
        }
    },
    MakeOrder: async (req, res, next) => {
        let flag = false
        let payment = false
        let OId
        let TId
        const trans = await db.sequelize.transaction()
        try {
            const orderData = req.body
            const userId = req.user.id
            const profile = await CommonService.User.GetProfileIdByUserTypeId(userId)
            const currencySymbol = await CommonService.User.GetCurrencySymbolByProfileId(profile.id)
            let recipesToJson = JSON.parse(JSON.stringify(orderData.recipes))
            const {totalAmount, taxes, orderServings, deliveryFee, deliveryType} = orderData
            const valid = await AuthService.Order.ValidateOrder(totalAmount, taxes, deliveryFee, orderServings, recipesToJson, deliveryType)
            if (!valid) {
                return ResponseHelpers.SetErrorResponse(CommonConfig.ERRORS.ORDER.FAILURE, res)
            }
            orderData.createdBy = userId
            const orderDetails = await AuthService.Order.PlaceOrder(orderData, recipesToJson, trans)
            if (!orderDetails) {
                trans.rollback()
                return ResponseHelpers.SetErrorResponse(CommonConfig.ERRORS.ORDER.FAILURE, res)
            }
            OId = orderDetails.id
            const orderId = orderDetails.id
            const paymentMethodNonce = orderData.paymentMethodNonce
            const checkOutDetails = await AuthService.Order.CheckOut(paymentMethodNonce, orderId, totalAmount)
            if (!checkOutDetails) {
                return ResponseHelpers.SetErrorResponse(CommonConfig.ERRORS.ORDER.FAILURE, res)
            }
            console.log('Transaction Details: ', checkOutDetails)
            payment = true
            const transactionData = {
                transactionId: checkOutDetails.transaction.id,
                amount: checkOutDetails.transaction.amount,
                discountAmount: checkOutDetails.transaction.discountAmount,
                type: checkOutDetails.transaction.type,
                paymentInstrumentType: checkOutDetails.transaction.paymentInstrumentType,
                merchantAccountId: checkOutDetails.transaction.merchantAccountId,
                taxAmount: checkOutDetails.transaction.taxAmount,
                recurring: checkOutDetails.transaction.recurring,
                orderId: orderId,
                paidTo: checkOutDetails.transaction.merchantAccountId,
                paidBy: userId,
                status: checkOutDetails.transaction.status
            }
            TId = transactionData.transactionId
            const transactionDetails = await AuthService.Order.Transaction(transactionData, trans)
            if (!transactionDetails) {
                trans.rollback()
                return ResponseHelpers.SetSuccessResponse({
                    orderState: false,
                    message: CommonConfig.ERRORS.ORDER.FAILURE,
                    orderId: OId,
                    transactionId: TId
                }, res, CommonConfig.STATUS_CODE.OK)
            }
            flag = true
            const result = await AuthService.Order.UpdatePaymentStateAfterSuccess(orderId, trans)
            trans.commit()
            if (!result) {
                return ResponseHelpers.SetSuccessResponse({
                    orderState: false,
                    message: CommonConfig.ERRORS.ORDER.FAILURE,
                    orderId: orderId,
                    transactionId: transactionData.transactionId
                }, res, CommonConfig.STATUS_CODE.OK)
            }
            return ResponseHelpers.SetSuccessResponse({
                orderState: true,
                paymentDetails: {
                    transactionId: transactionDetails.id,
                    amount: currencySymbol.currencySymbol + ' ' + parseFloat(transactionDetails.amount),
                    paymentMethod: transactionDetails.paymentInstrumentType,
                    merchantAccountId: transactionDetails.merchantAccountId
                },
                orderDetails: {
                    id: orderDetails.id,
                    orderDate: orderDetails.createdAt,
                    amount: currencySymbol.currencySymbol + ' ' + parseFloat(orderDetails.totalAmount)
                },
                Message: CommonConfig.ERRORS.ORDER.SUCCESS
            }, res, CommonConfig.STATUS_CODE.CREATED)
        } catch (error) {
            if (!flag && !payment) {
                trans.rollback()
                next(error)
            } else {
                return ResponseHelpers.SetSuccessResponse({
                    orderState: false,
                    message: CommonConfig.ERRORS.ORDER.FAILURE,
                    orderId: OId,
                    transactionId: TId
                }, res, CommonConfig.STATUS_CODE.CREATED)
            }
        }
    }
}

let AuthController = {
    Auth: Auth,
    User: User,
    Category: Category,
    SubCategory: SubCategory,
    Units: Units,
    Allergy: Allergy,
    Feedback: Feedback,
    Favorite: Favorite,
    ReviewDetails: ReviewDetails,
    Order: Order
}

module.exports = AuthController
