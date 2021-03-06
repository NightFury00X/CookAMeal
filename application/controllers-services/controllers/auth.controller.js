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

const moment = require('moment')

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
            const {files} = req
            if (!files) {
                return ResponseHelpers.SetSuccessResponse({Message: 'Please select a valid profile cover image.'}, res, CommonConfig.STATUS_CODE.CREATED)
            } else if (!files.profileCover) {
                return ResponseHelpers.SetSuccessResponse({Message: 'Please select a valid profile cover image.'}, res, CommonConfig.STATUS_CODE.CREATED)
            }
            const profile = await CommonService.User.GetProfileIdByUserTypeId(userId)
            const profileId = profile.id
            const profileCover = await CommonService.User.CheckProfileCoverUploaded(profileId)
            if (!profileCover) {
                const result = await CommonService.User.ProfileCover({profileId: profileId}, req.files)
                if (!result) {
                    return ResponseHelpers.SetSuccessResponse({message: 'Profile cover not updated.'}, res, CommonConfig.STATUS_CODE.OK)
                }
                return ResponseHelpers.SetSuccessResponse({
                    message: 'Profile cover uploaded.',
                    profileCover: result
                }, res, CommonConfig.STATUS_CODE.OK)
            } else {
                let profileCoverFile = files.profileCover[0]
                profileCoverFile.fileName = profileCoverFile.filename
                profileCoverFile.originalName = profileCoverFile.originalname
                profileCoverFile.mimeType = profileCoverFile.mimetype
                profileCoverFile.imageUrl = CommonConfig.FILE_LOCATIONS.PROFILECOVER + profileCoverFile.filename
                delete profileCoverFile.filename
                delete profileCoverFile.originalname
                delete profileCoverFile.mimetype
                const result = await CommonService.User.UpdateProfileCover(profileCoverFile, profileCover.id, profileId)
                if (!result) {
                    return ResponseHelpers.SetSuccessResponse({message: 'Profile cover not updated.'}, res, CommonConfig.STATUS_CODE.OK)
                }
                return ResponseHelpers.SetSuccessResponse({
                    message: 'Profile cover updated.',
                    profileCover: result
                }, res, CommonConfig.STATUS_CODE.OK)
            }
        } catch (error) {
            next(error)
        }
    },
    ProfileImage: async (req, res, next) => {
        try {
            const userId = req.user.id
            const {files} = req
            if (!files) {
                return ResponseHelpers.SetSuccessResponse({Message: 'Please select a valid profile image.'}, res, CommonConfig.STATUS_CODE.CREATED)
            } else if (!files.profile) {
                return ResponseHelpers.SetSuccessResponse({Message: 'Please select a valid profile image.'}, res, CommonConfig.STATUS_CODE.CREATED)
            }
            const profile = await CommonService.User.GetProfileIdByUserTypeId(userId)
            const profileId = profile.id
            const profileImage = await CommonService.User.CheckProfileImageUploaded(profileId)
            if (!profileImage) {
                const result = await CommonService.User.ProfileImage({profileId: profileId}, req.files)
                if (!result) {
                    return ResponseHelpers.SetSuccessResponse({message: 'Profile image not uploaded.'}, res, CommonConfig.STATUS_CODE.OK)
                }
                return ResponseHelpers.SetSuccessResponse({
                    message: `Profile image uploaded.`,
                    profileUrl: result
                }, res, CommonConfig.STATUS_CODE.OK)
            } else {
                let profileImageFile = files.profile[0]
                profileImageFile.fileName = profileImageFile.filename
                profileImageFile.originalName = profileImageFile.originalname
                profileImageFile.mimeType = profileImageFile.mimetype
                profileImageFile.imageUrl = CommonConfig.FILE_LOCATIONS.PROFILE + profileImageFile.filename
                delete profileImageFile.filename
                delete profileImageFile.originalname
                delete profileImageFile.mimetype
                const result = await CommonService.User.UpdateProfileImage(profileImageFile, profileImage.id, profileId)
                if (!result) {
                    return ResponseHelpers.SetSuccessResponse({message: 'Profile image not updated.'}, res, CommonConfig.STATUS_CODE.OK)
                }
                return ResponseHelpers.SetSuccessResponse({
                    message: `Profile image updated.`,
                    profileUrl: result
                }, res, CommonConfig.STATUS_CODE.OK)
            }
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
    updateProfile: async (req, res, next) => {
        try {
            const {id} = req.user
            const currentProfie = await CommonService.User.GetProfileIdByUserTypeId(id)
            if (!currentProfie) {
                return ResponseHelpers.SetSuccessResponse({Message: 'Profile not found.'}, res, CommonConfig.STATUS_CODE.OK)
            }
            const {profile, address} = req.body
            const userData = await AuthService.User.updateUserProfile(id, currentProfie.id, profile, address)
            if (!userData) {
                return ResponseHelpers.SetSuccessResponse({Message: 'Unable to update profile.'}, res, CommonConfig.STATUS_CODE.OK)
            }
            const data = await AuthService.User.GetProfileDataIfProfileUpdated(id)
            return ResponseHelpers.SetSuccessResponse(data, res, CommonConfig.STATUS_CODE.OK)
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
                const profile = await CommonService.User.FindProfileIsExist(favorite.profileId)
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
    GetCurrentDeliveryAddress: async (req, res, next) => {
        try {
            const {id} = req.user
            const profile = await CommonService.User.GetProfileIdByUserTypeId(id)
            const {fullName} = profile
            let address = await AuthService.Order.GetCurrentAddressByProfileId(profile.id)
            if (!address) {
                return ResponseHelpers.SetSuccessErrorResponse({message: 'Address not found.'}, res, CommonConfig.STATUS_CODE.OK)
            }
            let addressData = JSON.parse(JSON.stringify(address))
            addressData.fullName = fullName

            const topDeliveryAddress = await AuthService.Order.GetTopDeliveryAddressByProfileId(profile.id)
            const result = {
                currentAddress: addressData,
                otherAddresses: topDeliveryAddress
            }
            return ResponseHelpers.SetSuccessResponse(result, res, CommonConfig.STATUS_CODE.OK)
        } catch (error) {
            next(error)
        }
    },
    AddDeliveryAddress: async (req, res, next) => {
        try {
            const {id} = req.user
            const {fullName, mobileNumber, street, city, state, zipCode, country, latitude, longitude} = req.body
            const profile = await CommonService.User.GetProfileIdByUserTypeId(id)
            const deliverAddressData = {
                fullName,
                mobileNumber,
                street,
                city,
                state,
                zipCode,
                country,
                latitude,
                longitude,
                profileId: profile.id
            }
            const result = await AuthService.Order.AddNewDeliveryAddress(deliverAddressData)
            if (!result) {
                return ResponseHelpers.SetSuccessErrorResponse({message: 'Unable to add delivery address.'}, res, CommonConfig.STATUS_CODE.CREATED)
            }
            return ResponseHelpers.SetSuccessResponse(result, res, CommonConfig.STATUS_CODE.CREATED)
        } catch (error) {
            next(error)
        }
    },
    DeleteDeliveryAddress: async (req, res, next) => {
        try {
            const {id} = req.user
            const profile = await CommonService.User.GetProfileIdByUserTypeId(id)
            if (!profile) {
                return ResponseHelpers.SetSuccessErrorResponse({message: 'Unable to remove delivery address.'}, res, CommonConfig.STATUS_CODE.CREATED)
            }
            const {address} = req.params
            console.log('address: ', address)
            const result = await AuthService.Order.DeleteDeliveryAddress(address, profile.id)
            if (!result) {
                return ResponseHelpers.SetSuccessErrorResponse({message: 'Unable to remove delivery address.'}, res, CommonConfig.STATUS_CODE.CREATED)
            }
            return ResponseHelpers.SetSuccessResponse({
                message: 'Delivery address removed successfully.'
            }, res, CommonConfig.STATUS_CODE.CREATED)
        } catch (error) {
            next(error)
        }
    },
    GetMyOrders: async (req, res, next) => {
        try {
            const {id, userRole} = req.user
            let orderDetails
            switch (userRole) {
                case 1:
                    orderDetails = await AuthService.Order.GetMyPendingOrdersForCook(id)
                    break
                case 2:
                    orderDetails = await AuthService.Order.GetMyPendingOrdersForCustomer(id)
                    break
            }
            let convertedOrderDetailsJSON = JSON.parse(JSON.stringify(orderDetails))
            for (let index in convertedOrderDetailsJSON) {
                if (convertedOrderDetailsJSON.hasOwnProperty(index)) {
                    const profileId = userRole === 1 ? convertedOrderDetailsJSON[index].createdBy : convertedOrderDetailsJSON[index].cookId
                    convertedOrderDetailsJSON[index].cookProfile = await CommonService.User.GetProfileIdByUserTypeId(profileId)
                }
            }
            return ResponseHelpers.SetSuccessResponse(convertedOrderDetailsJSON, res, CommonConfig.STATUS_CODE.OK)
        } catch (error) {
            next(error)
        }
    },
    GetOrderDetailsByOrderId: async (req, res, next) => {
        try {
            const {id, userRole} = req.user
            const {orderId} = req.params

            let orderDetails
            switch (userRole) {
                case 1:
                    orderDetails = await AuthService.Order.GetOrderDetailsForCookByOrderId(orderId, id)
                    break
                case 2:
                    orderDetails = await AuthService.Order.GetOrderDetailsForCustomerByOrderId(orderId, id)
                    break
            }

            const createdAt = moment(orderDetails.createdAt)
            const currentDateTime = moment()
            const duration = moment.duration(currentDateTime.diff(createdAt))

            let isCancellable = true
            if (Math.ceil(duration.asHours()) >= CommonConfig.ORDER.MAX_HOURS_VALUE_TO_CANCEL_OREDR) {
                isCancellable = false
            }

            const paymentgatewayDetails = await AuthService.Order.GetPaymentGatewayDetailsById(orderDetails.paymentGatwayId, orderDetails.cookId, orderDetails.createdBy)

            let convertedOrderDetailsJSON = JSON.parse(JSON.stringify(orderDetails))
            const profileId = userRole === 1 ? convertedOrderDetailsJSON.createdBy : convertedOrderDetailsJSON.cookId
            convertedOrderDetailsJSON.profile = await CommonService.User.GetProfileIdByUserTypeId(profileId)

            // check delivery address
            let deliveryAddress
            const customerDetails = await CommonService.User.GetProfileIdByUserTypeId(convertedOrderDetailsJSON.createdBy)
            if (convertedOrderDetailsJSON.deliveredToCurrentAddressId) {
                deliveryAddress = await AuthService.Order.GetCurrentAddressDetailsByAddressId(convertedOrderDetailsJSON.deliveredToCurrentAddressId, customerDetails.createdBy)
            } else if (convertedOrderDetailsJSON.deliveredToOtherAddressId) {
                deliveryAddress = await AuthService.Order.GetOtherAddressDetailsByAddressId(convertedOrderDetailsJSON.deliveredToOtherAddressId, customerDetails.createdBy)
            }
            convertedOrderDetailsJSON.deliveryAddress = deliveryAddress
            const orderItems = await AuthService.Order.GetOrderItemsByOrderId(orderId)
            let convertedOrderItemsJSON = JSON.parse(JSON.stringify(orderItems))

            for (let index in convertedOrderItemsJSON) {
                if (convertedOrderItemsJSON.hasOwnProperty(index)) {
                    const recipeDetails = await CommonService.Recipe.FindRecipeForOrderItemById(convertedOrderItemsJSON[index].recipeId)
                    convertedOrderItemsJSON[index].id = recipeDetails.id
                    convertedOrderItemsJSON[index].dishName = recipeDetails.dishName
                    convertedOrderItemsJSON[index].currencySymbol = recipeDetails.currencySymbol
                    if (recipeDetails.MediaObjects.length > 0) {
                        convertedOrderItemsJSON[index].imageUrl = recipeDetails.MediaObjects[0].imageUrl
                    } else {
                        convertedOrderItemsJSON[index].imageUrl = null
                    }
                }
            }
            convertedOrderDetailsJSON.recipeDetails = convertedOrderItemsJSON
            convertedOrderDetailsJSON.userRole = userRole
            convertedOrderDetailsJSON.currencyCode = paymentgatewayDetails.currencyCode
            convertedOrderDetailsJSON.currencySymbol = paymentgatewayDetails.currencySymbol
            convertedOrderDetailsJSON.isCancellable = isCancellable
            return ResponseHelpers.SetSuccessResponse(convertedOrderDetailsJSON, res, CommonConfig.STATUS_CODE.OK)
        } catch (error) {
            next(error)
        }
    },
    GetClientToken: async (req, res, next) => {
        try {
            const {orderType, id} = req.params
            let cookProfile
            let profileId
            switch (parseInt(orderType)) {
                case 1:
                    cookProfile = await CommonService.User.GetProfileIdByUserTypeId(id)
                    profileId = cookProfile.id
                    break
                case 2:
                    cookProfile = await CommonService.Recipe.GetProfileIdByRecipeId(id)
                    profileId = cookProfile.profileId
                    break
            }
            const currencyDetails = await CommonService.User.GetCurrencyCodeProfileId(profileId)
            const clientToken = await gateway.clientToken.generate()
            const clientTokenDetails = {
                token: clientToken.clientToken,
                currencyCode: currencyDetails.currencyCode
            }
            return ResponseHelpers.SetSuccessResponse(clientTokenDetails, res, CommonConfig.STATUS_CODE.OK)
        } catch (error) {
            next(error)
        }
    },
    PrepareData: async (req, res, next) => {
        try {
            const clientToken = await gateway.clientToken.generate()
            const prepareData = {
                token: clientToken.clientToken
            }
            return ResponseHelpers.SetSuccessResponse(prepareData, res, CommonConfig.STATUS_CODE.OK)
        } catch (error) {
            next(error)
        }
    },
    CreatePurchaseOrderForCart: async (req, res, next) => {
        const {id} = req.user
        const trans = await db.sequelize.transaction()
        try {
            const {
                nonce,
                chargeAmount,
                paymentType,
                deliveryAddress,
                cartId,
                cookId,
                specialInstruction,
                deliveryType,
                pickUpTime
            } = req.body

            const profile = await CommonService.User.GetProfileIdByUserTypeId(id)
            const cart = await AuthService.Cart.CheckCartStatus(id, 1)
            if (!cart) {
                trans.rollback()
                return ResponseHelpers.SetSuccessErrorResponse({Message: CommonConfig.ERRORS.ORDER.FAILURE}, res, CommonConfig.STATUS_CODE.OK)
            }

            let address
            let isCurrentAddress = false
            const currentAddress = await CommonService.User.CheckAddressIsCurrentAddress(deliveryAddress, profile.id)
            if (currentAddress) {
                address = currentAddress.id
                isCurrentAddress = true
            } else {
                const otherAddress = await CommonService.User.CheckAddressIsOtherAddress(deliveryAddress, profile.id)
                if (otherAddress) {
                    address = otherAddress.id
                    isCurrentAddress = false
                } else {
                    trans.rollback()
                    return ResponseHelpers.SetSuccessErrorResponse({Message: CommonConfig.ERRORS.ORDER.FAILURE}, res, CommonConfig.STATUS_CODE.OK)
                }
            }

            const currencyDetails = await CommonService.User.GetCurrencyCodeProfileId(cookId)
            if (!currencyDetails) {
                trans.rollback()
                return ResponseHelpers.SetSuccessErrorResponse({Message: CommonConfig.ERRORS.ORDER.FAILURE}, res, CommonConfig.STATUS_CODE.OK)
            }

            const paymentData = {
                nonce: nonce,
                amount: chargeAmount,
                paymentType: paymentType,
                cookId: cookId,
                currencyCode: currencyDetails.currencyCode,
                currencySymbol: currencyDetails.currencySymbol,
                createdBy: id
            }

            const paymentGatewayDetails = await AuthService.Order.CreateAndHoldPayment(paymentData, trans)
            if (!paymentGatewayDetails) {
                trans.rollback()
                return ResponseHelpers.SetSuccessErrorResponse({Message: CommonConfig.ERRORS.ORDER.FAILURE}, res, CommonConfig.STATUS_CODE.OK)
            }
            const taxes = 5
            let maxDeliveryFees = 0
            let totalPriceAmount = 0
            const cartItemDetails = await AuthService.Cart.GetRecipeCartDetails(cart.id)
            if (!cartItemDetails) {
                return ResponseHelpers.SetSuccessErrorResponse({Message: CommonConfig.ERRORS.ORDER.FAILURE}, res, CommonConfig.STATUS_CODE.OK)
            }
            let convertedJSON = JSON.parse(JSON.stringify(cartItemDetails))
            for (let outer in convertedJSON) {
                if (convertedJSON.hasOwnProperty(outer)) {
                    let covertedCartItems = JSON.parse(JSON.stringify(convertedJSON[outer].CartItems))
                    let totalPrice = 0
                    let tempMaxDeliverFees = 0
                    for (let inner in covertedCartItems) {
                        if (covertedCartItems.hasOwnProperty(inner)) {
                            const recipeId = covertedCartItems[inner].recipeId
                            const recipeDetails = await CommonService.Recipe.FindRecipeDetailsForCartById(recipeId)
                            const category = await CommonService.GetCategoryById(recipeDetails.categoryId)
                            let convertedRecipe = JSON.parse(JSON.stringify(recipeDetails))
                            convertedRecipe.categoryName = category.name
                            convertedJSON[outer].CartItems[inner].recipeDetails = convertedRecipe
                            totalPrice += parseFloat(covertedCartItems[inner].price)
                            if (parseFloat(convertedJSON[outer].CartItems[inner].recipeDetails.deliveryFee) > tempMaxDeliverFees) {
                                tempMaxDeliverFees = convertedJSON[outer].CartItems[inner].recipeDetails.deliveryFee
                            }
                        }
                    }
                    maxDeliveryFees = tempMaxDeliverFees
                    totalPriceAmount = totalPrice
                }
            }

            const totalCharge = parseFloat((totalPriceAmount * 5 / 100) + totalPriceAmount) + parseFloat((parseInt(deliveryType) === 1 ? 0 : maxDeliveryFees))

            if (parseFloat(chargeAmount) !== totalCharge) {
                trans.rollback()
                return ResponseHelpers.SetSuccessErrorResponse({Message: CommonConfig.ERRORS.ORDER.FAILURE}, res, CommonConfig.STATUS_CODE.OK)
            }

            let orderData = {
                paymentGatwayId: paymentGatewayDetails.id,
                orderType: 'order-food',
                specialInstruction: specialInstruction,
                deliveryType: deliveryType,
                deliveryFee: parseInt(deliveryType) === 1 ? 0 : maxDeliveryFees,
                pickUpTime: pickUpTime,
                taxes: taxes,
                totalAmount: totalPriceAmount,
                isCurrentAddress: isCurrentAddress,
                isOrderFromCart: true,
                cartId: cartId,
                cookId: cookId,
                deliveredToCurrentAddressId: isCurrentAddress ? address : null,
                deliveredToOtherAddressId: !isCurrentAddress ? address : null,
                createdBy: id
            }

            const cartItemList = await AuthService.Cart.GetAllCartItemByCartIdAndCookId(cartId, cookId)
            if (!cartItemList) {
                trans.rollback()
                return ResponseHelpers.SetSuccessErrorResponse({Message: CommonConfig.ERRORS.ORDER.FAILURE}, res, CommonConfig.STATUS_CODE.OK)
            }
            let cartItemsToJson = JSON.parse(JSON.stringify(cartItemList))
            for (const index in cartItemsToJson) {
                if (cartItemsToJson.hasOwnProperty(index)) {
                    const {costPerServing, availableServings} = await CommonService.Recipe.FindRecipePriceByRecipeId(cartItemsToJson[index].recipeId)
                    if (parseInt(availableServings) < cartItemsToJson[index].noOfServing) {
                        trans.rollback()
                        return ResponseHelpers.SetSuccessErrorResponse({Message: CommonConfig.ERRORS.ORDER.FAILURE}, res, CommonConfig.STATUS_CODE.OK)
                    }
                    cartItemsToJson[index].costPerServing = costPerServing
                }
            }
            const orderDetailsData = await AuthService.Order.PlaceOrderForCartItems(orderData, cartItemsToJson, trans)
            if (!orderDetailsData) {
                trans.rollback()
                return ResponseHelpers.SetErrorResponse(CommonConfig.ERRORS.ORDER.FAILURE, res)
            }

            const cartUpdated = await AuthService.Cart.UpdateCartByCookIdAfterOrder(cartId, cookId, trans)
            if (!cartUpdated) {
                trans.rollback()
                return ResponseHelpers.SetErrorResponse(CommonConfig.ERRORS.ORDER.FAILURE, res)
            }

            const successResultData = {
                name: profile.fullName,
                profileUrl: profile.profileUrl ? profile.profileUrl : null,
                orderId: orderDetailsData.id
            }
            trans.commit()
            return ResponseHelpers.SetSuccessResponse(successResultData, res, CommonConfig.STATUS_CODE.CREATED)
        } catch (error) {
            trans.rollback()
            next(error)
        }
    },
    CreatePurchaseOrderForRecipe: async (req, res, next) => {
        const {id} = req.user
        const trans = await db.sequelize.transaction()
        try {
            const {
                nonce,
                chargeAmount,
                recipeId,
                noOfServing,
                spiceLevel,
                paymentType,
                deliveryAddress,
                specialInstruction,
                deliveryType,
                pickUpTime
            } = req.body

            const profile = await CommonService.User.GetProfileIdByUserTypeId(id)

            let address
            let isCurrentAddress = false
            const currentAddress = await CommonService.User.CheckAddressIsCurrentAddress(deliveryAddress, profile.id)
            if (currentAddress) {
                address = currentAddress.id
                isCurrentAddress = true
            } else {
                const otherAddress = await CommonService.User.CheckAddressIsOtherAddress(deliveryAddress, profile.id)
                if (otherAddress) {
                    address = otherAddress.id
                    isCurrentAddress = false
                } else {
                    trans.rollback()
                    return ResponseHelpers.SetSuccessErrorResponse({Message: CommonConfig.ERRORS.ORDER.FAILURE}, res, CommonConfig.STATUS_CODE.OK)
                }
            }

            const recipeDetails = await CommonService.Recipe.FindRecipeDetailsForCartById(recipeId)
            if (!recipeDetails) {
                trans.rollback()
                return ResponseHelpers.SetSuccessErrorResponse({Message: CommonConfig.ERRORS.ORDER.FAILURE}, res, CommonConfig.STATUS_CODE.OK)
            }

            if (parseInt(recipeDetails.availableServings) < noOfServing) {
                trans.rollback()
                return ResponseHelpers.SetSuccessErrorResponse({Message: CommonConfig.ERRORS.ORDER.OUT_OF_STOCK}, res, CommonConfig.STATUS_CODE.OK)
            }

            const currencyDetails = await CommonService.User.GetCurrencyCodeProfileId(recipeDetails.profileId)
            if (!currencyDetails) {
                trans.rollback()
                return ResponseHelpers.SetSuccessErrorResponse({Message: CommonConfig.ERRORS.ORDER.FAILURE}, res, CommonConfig.STATUS_CODE.OK)
            }
            const paymentData = {
                nonce: nonce,
                amount: chargeAmount,
                paymentType: paymentType,
                cookId: recipeDetails.profileId,
                currencyCode: currencyDetails.currencyCode,
                currencySymbol: currencyDetails.currencySymbol,
                createdBy: id
            }

            const paymentGatewayDetails = await AuthService.Order.CreateAndHoldPayment(paymentData, trans)
            if (!paymentGatewayDetails) {
                trans.rollback()
                return ResponseHelpers.SetSuccessErrorResponse({Message: CommonConfig.ERRORS.ORDER.FAILURE}, res, CommonConfig.STATUS_CODE.OK)
            }
            const taxes = 5

            let totalPrice = parseFloat(recipeDetails.costPerServing) * parseInt(noOfServing)
            let maxDeliveryFees = parseFloat(recipeDetails.deliveryFee)

            const totalCharge = parseFloat((totalPrice * 5 / 100) + totalPrice) + parseFloat((parseInt(deliveryType) === 1 ? 0 : maxDeliveryFees))

            if (parseFloat(chargeAmount) !== totalCharge) {
                trans.rollback()
                return ResponseHelpers.SetSuccessErrorResponse({Message: CommonConfig.ERRORS.ORDER.FAILURE}, res, CommonConfig.STATUS_CODE.OK)
            }

            let orderData = {
                paymentGatwayId: paymentGatewayDetails.id,
                orderType: 'order-food',
                specialInstruction: specialInstruction,
                deliveryType: deliveryType,
                deliveryFee: parseInt(deliveryType) === 1 ? 0 : maxDeliveryFees,
                pickUpTime: pickUpTime,
                taxes: taxes,
                isOrderFromCart: false,
                cookId: recipeDetails.profileId,
                totalAmount: totalCharge,
                isCurrentAddress: isCurrentAddress,
                deliveredToCurrentAddressId: isCurrentAddress ? address : null,
                deliveredToOtherAddressId: !isCurrentAddress ? address : null,
                createdBy: id
            }

            const orderItemData = {
                noOfServing: noOfServing,
                costPerServing: recipeDetails.costPerServing,
                spiceLevel: spiceLevel,
                recipeId: recipeId
            }

            const orderDetailsData = await AuthService.Order.PlaceOrderForRecipe(orderData, orderItemData, trans)
            if (!orderDetailsData) {
                trans.rollback()
                return ResponseHelpers.SetSuccessErrorResponse({Message: CommonConfig.ERRORS.ORDER.FAILURE}, res, CommonConfig.STATUS_CODE.OK)
            }
            const updatedServingData = await AuthService.Order.UpdateAvailableServingsByRecipeId({
                availableServings: parseInt(recipeDetails.availableServings) - parseInt(noOfServing),
                recipeId: recipeId
            }, trans)
            if (!updatedServingData) {
                trans.rollback()
                return ResponseHelpers.SetSuccessErrorResponse({Message: CommonConfig.ERRORS.ORDER.FAILURE}, res, CommonConfig.STATUS_CODE.OK)
            }
            const successResultData = {
                name: profile.fullName,
                profileUrl: profile.profileUrl ? profile.profileUrl : null,
                orderId: orderDetailsData.id
            }
            trans.commit()
            return ResponseHelpers.SetSuccessResponse(successResultData, res, CommonConfig.STATUS_CODE.CREATED)
        } catch (error) {
            trans.rollback()
            next(error)
        }
    },
    CancelOrder: async (req, res, next) => {
        const trans = await db.sequelize.transaction()
        try {
            const {id} = req.user
            const {orderId} = req.params
            const {reason, description} = req.body

            const orderDetails = await CookService.Order.GetOrderDetailsForCustomerByOrderIdAndCustomerId(orderId, id)
            if (!orderDetails) {
                trans.rollback()
                return ResponseHelpers.SetSuccessErrorResponse({message: 'Invalid order details. Please try again later.'}, res, CommonConfig.STATUS_CODE.OK)
            }
            const createdAt = moment(orderDetails.createdAt)
            const currentDateTime = moment()
            const duration = moment.duration(currentDateTime.diff(createdAt))

            if (Math.ceil(duration.asHours()) >= CommonConfig.ORDER.MAX_HOURS_VALUE_TO_CANCEL_OREDR) {
                trans.rollback()
                return ResponseHelpers.SetSuccessErrorResponse({message: 'You can not cancel the order.'}, res, CommonConfig.STATUS_CODE.OK)
            }

            const paymentDetails = await CookService.Order.GetPaymentGatewayDetailsForCancellationById(orderDetails.paymentGatwayId, orderDetails.cookId, orderDetails.createdBy)
            if (!paymentDetails) {
                trans.rollback()
                return ResponseHelpers.SetSuccessErrorResponse({message: 'Invalid order details. Please try again later.'}, res, CommonConfig.STATUS_CODE.OK)
            }
            const cancelOrderDetails = await AuthService.Order.CancelOrder(orderDetails.id, id, trans)
            if (!cancelOrderDetails) {
                trans.rollback()
                return ResponseHelpers.SetSuccessErrorResponse({message: 'Order can not be cancel.'}, res, CommonConfig.STATUS_CODE.OK)
            }
            const cancelpaymentDetails = await AuthService.Order.CancelPaymentDetailsOrder(paymentDetails.id, id, trans)
            if (!cancelpaymentDetails) {
                trans.rollback()
                return ResponseHelpers.SetSuccessErrorResponse({message: 'Order can not be cancel.'}, res, CommonConfig.STATUS_CODE.OK)
            }
            const orderStateMasterData = {
                orderId: orderDetails.id,
                isCancelled: true,
                reason: reason,
                description: description,
                userType: CommonConfig.ORDER.USER_TYPE.COOK,
                userId: orderDetails.createdBy
            }
            const orderStateMasterDetails = await AuthService.Order.AddToOrderStateMaster(orderStateMasterData, trans)
            if (!orderStateMasterDetails) {
                trans.rollback()
                return ResponseHelpers.SetSuccessErrorResponse({message: 'Order can not be cancel.'}, res, CommonConfig.STATUS_CODE.OK)
            }
            trans.commit()
            return ResponseHelpers.SetSuccessResponse({message: 'You have successfully cancelled your order.'}, res, CommonConfig.STATUS_CODE.OK)
        } catch (error) {
            trans.rollback()
            next(error)
        }
    }
}

const Cart = {
    AddToCartForRecipe: async (req, res, next) => {
        try {
            const {id} = req.user
            const {recipeId, noOfServing} = req.body
            console.log('recipeId: ', recipeId)
            const recipeDetails = await CommonService.Recipe.FindRecipePriceByRecipeId(recipeId)
            if (!recipeDetails) {
                return ResponseHelpers.SetSuccessErrorResponse({Message: 'Unable to add to cart.'}, res, CommonConfig.STATUS_CODE.OK)
            }
            const isCartOpen = await AuthService.Cart.CheckRecipeCartIsOpen(id)
            if (isCartOpen) {
                const addToCartData = {
                    recipeId: recipeId,
                    noOfServing: 1,
                    spiceLevel: 'Mild',
                    cartId: isCartOpen.id,
                    cookId: recipeDetails.profileId,
                    price: recipeDetails.costPerServing
                }
                const result = AuthService.Cart.AddItemToExistingRecipeCart(addToCartData)
                if (!result) {
                    return ResponseHelpers.SetSuccessErrorResponse({Message: 'Unable to add to cart.'}, res, CommonConfig.STATUS_CODE.OK)
                }
                return ResponseHelpers.SetSuccessResponse({Message: 'Added to Cart.'}, res, CommonConfig.STATUS_CODE.CREATED)
            } else {
                const addToCartData = {
                    recipeId: recipeId,
                    noOfServing: noOfServing,
                    createdBy: id,
                    spiceLevel: 'Mild',
                    cookId: recipeDetails.profileId,
                    price: recipeDetails.costPerServing
                }
                const result = await AuthService.Cart.AddToCartRecipe(addToCartData)
                if (!result) {
                    return ResponseHelpers.SetSuccessErrorResponse({Message: 'Unable to add to cart.'}, res, CommonConfig.STATUS_CODE.OK)
                }
                return ResponseHelpers.SetSuccessResponse({Message: 'Added to Cart.'}, res, CommonConfig.STATUS_CODE.CREATED)
            }
        } catch (error) {
            next(error)
        }
    },
    // AddToCart: async (req, res, next) => {
    //     try {
    //         const {id} = req.user
    //         const {recipeId, noOfServing} = req.body
    //         const recipeDetails = await CommonService.Recipe.FindRecipePriceByRecipeId(recipeId)
    //         if (!recipeDetails) {
    //             return ResponseHelpers.SetSuccessErrorResponse({Message: 'Unable to add to cart.'}, res, CommonConfig.STATUS_CODE.OK)
    //         }
    //         const isCartOpen = await AuthService.Cart.CheckCartIsOpen(id)
    //         if (isCartOpen) {
    //             const addToCartData = {
    //                 recipeId: recipeId,
    //                 noOfServing: 1,
    //                 spiceLevel: 'Mild',
    //                 cartId: isCartOpen.id,
    //                 cookId: recipeDetails.profileId,
    //                 price: recipeDetails.costPerServing
    //             }
    //             console.log('recipeDetails.profileId: ', recipeDetails.profileId)
    //             const result = AuthService.Cart.AddItemToExistingCart(addToCartData)
    //             if (!result) {
    //                 return ResponseHelpers.SetSuccessErrorResponse({Message: 'Unable to add to cart.'}, res, CommonConfig.STATUS_CODE.OK)
    //             }
    //             return ResponseHelpers.SetSuccessResponse({Message: 'Added to Cart.'}, res, CommonConfig.STATUS_CODE.CREATED)
    //         } else {
    //             const addToCartData = {
    //                 recipeId: recipeId,
    //                 noOfServing: noOfServing,
    //                 createdBy: id,
    //                 spiceLevel: 'Mild',
    //                 cookId: recipeDetails.profileId,
    //                 price: recipeDetails.costPerServing
    //             }
    //             const result = await AuthService.Cart.AddToCart(addToCartData)
    //             if (!result) {
    //                 return ResponseHelpers.SetSuccessErrorResponse({Message: 'Unable to add to cart.'}, res, CommonConfig.STATUS_CODE.OK)
    //             }
    //             return ResponseHelpers.SetSuccessResponse({Message: 'Added to Cart.'}, res, CommonConfig.STATUS_CODE.CREATED)
    //         }
    //     } catch (error) {
    //         next(error)
    //     }
    // },
    GetRecipeCartDetails: async (req, res, next) => {
        try {
            const {id} = req.user
            const cartDetails = await AuthService.Cart.GetRecipeCartIdFromCartByCreatedBy(id)
            if (!cartDetails) {
                return ResponseHelpers.SetSuccessErrorResponse(null, res, CommonConfig.STATUS_CODE.OK)
            }
            const cartItemDetails = await AuthService.Cart.GetRecipeCartDetails(cartDetails.id)
            if (!cartItemDetails) {
                return ResponseHelpers.SetSuccessErrorResponse(null, res, CommonConfig.STATUS_CODE.OK)
            }
            let convertedJSON = JSON.parse(JSON.stringify(cartItemDetails))
            for (let outer in convertedJSON) {
                if (convertedJSON.hasOwnProperty(outer)) {
                    let covertedCartItems = JSON.parse(JSON.stringify(convertedJSON[outer].CartItems))
                    let totalPrice = 0
                    let maxDeliverFees = {
                        cartItemId: null,
                        deliveryfees: 0
                    }
                    const currencyDetails = await CommonService.User.GetCurrencySymbolByProfileId(convertedJSON[outer].id)
                    if (!currencyDetails) {
                        return ResponseHelpers.SetSuccessErrorResponse(null, res, CommonConfig.STATUS_CODE.OK)
                    }
                    for (let inner in covertedCartItems) {
                        if (covertedCartItems.hasOwnProperty(inner)) {
                            const recipeId = covertedCartItems[inner].recipeId
                            const recipeDetails = await CommonService.Recipe.FindRecipeDetailsForCartById(recipeId)
                            const category = await CommonService.GetCategoryById(recipeDetails.categoryId)
                            let convertedRecipe = JSON.parse(JSON.stringify(recipeDetails))
                            convertedRecipe.categoryName = category.name
                            convertedJSON[outer].CartItems[inner].recipeDetails = convertedRecipe
                            totalPrice += parseFloat(covertedCartItems[inner].price)
                            if (parseFloat(convertedJSON[outer].CartItems[inner].recipeDetails.deliveryFee) > maxDeliverFees.deliveryfees) {
                                maxDeliverFees = {
                                    cartItemId: convertedJSON[outer].CartItems[inner].id,
                                    deliveryfees: convertedJSON[outer].CartItems[inner].recipeDetails.deliveryFee
                                }
                            }
                        }
                    }
                    convertedJSON[outer].cartId = cartDetails.id
                    convertedJSON[outer].maxDeliverFees = maxDeliverFees
                    convertedJSON[outer].price = totalPrice
                    convertedJSON[outer].currencySymbol = currencyDetails.currencySymbol
                    convertedJSON[outer].item = convertedJSON[outer].CartItems.length
                }
            }
            return ResponseHelpers.SetSuccessResponse(convertedJSON, res, CommonConfig.STATUS_CODE.OK)
        } catch (error) {
            next(error)
        }
    },
    DeleteCartItem: async (req, res, next) => {
        try {
            const {id} = req.user
            const {itemId} = req.value.params
            const cart = await AuthService.Cart.CheckCartItemOwner(id)
            if (!cart) {
                return ResponseHelpers.SetSuccessErrorResponse({message: 'Unable to remove from cart. 0'}, res, CommonConfig.STATUS_CODE.OK)
            }

            const {profileId} = await AuthService.Cart.GetPriceOfRecipeByCartItemId(itemId)
            const cookId = profileId
            const deletedCartItem = await AuthService.Cart.DeleteCartDetails(itemId, cart.id)
            if (!deletedCartItem) {
                return ResponseHelpers.SetSuccessErrorResponse({message: 'Unable to remove from cart. 1'}, res, CommonConfig.STATUS_CODE.OK)
            }
            const totalPrice = await AuthService.Cart.GetSelectedCartTotalPrice(cart.id, cookId)
            const cartItem = {
                price: totalPrice[0].price
            }
            // const cartDetails = await AuthService.Cart.GetRecipeCartIdFromCartByCreatedBy(id)
            // if (!cartDetails) {
            //     return ResponseHelpers.SetSuccessErrorResponse(null, res, CommonConfig.STATUS_CODE.OK)
            // }
            // const cartItemDetails = await AuthService.Cart.GetRecipeCartDetails(cartDetails.id)
            // if (!cartItemDetails) {
            //     return ResponseHelpers.SetSuccessErrorResponse(null, res, CommonConfig.STATUS_CODE.OK)
            // }
            // let convertedJSON = JSON.parse(JSON.stringify(cartItemDetails))
            // for (let outer in convertedJSON) {
            //     if (convertedJSON.hasOwnProperty(outer)) {
            //         let covertedCartItems = JSON.parse(JSON.stringify(convertedJSON[outer].CartItems))
            //         let totalPrice = 0
            //         const currencyDetails = await CommonService.User.GetCurrencySymbolByProfileId(convertedJSON[outer].id)
            //         if (!currencyDetails) {
            //             return ResponseHelpers.SetSuccessErrorResponse(null, res, CommonConfig.STATUS_CODE.OK)
            //         }
            //         for (let inner in covertedCartItems) {
            //             if (covertedCartItems.hasOwnProperty(inner)) {
            //                 totalPrice += parseFloat(covertedCartItems[inner].price)
            //             }
            //         }
            //         convertedJSON[outer].price = totalPrice
            //         convertedJSON[outer].currencySymbol = currencyDetails.currencySymbol
            //         convertedJSON[outer].item = convertedJSON[outer].CartItems.length
            //     }
            // }
            return ResponseHelpers.SetSuccessResponse({
                message: 'Cart Item removed successfully.',
                price: totalPrice[0].price
            }, res, CommonConfig.STATUS_CODE.CREATED)
        } catch (error) {
            next(error)
        }
    },
    UpdateTotalServing: async (req, res, next) => {
        try {
            const {id} = req.user
            const {itemId} = req.value.params
            const {recipeId, noOfServing} = req.body
            const cart = await AuthService.Cart.CheckCartItemOwner(id)
            if (!cart) {
                return ResponseHelpers.SetSuccessErrorResponse({Message: 'Unable to update.'}, res, CommonConfig.STATUS_CODE.CREATED)
            }
            const {costPerServing, profileId, availableServings} = await AuthService.Cart.GetPriceOfRecipeByCartItemId(itemId)
            const cookId = profileId

            if (noOfServing > availableServings) {
                return ResponseHelpers.SetSuccessErrorResponse({Message: CommonConfig.ERRORS.ORDER.OUT_OF_STOCK}, res, CommonConfig.STATUS_CODE.CREATED)
            }
            const result = await AuthService.Cart.UpdateNoOfServing(itemId, cart.id, noOfServing, recipeId, (costPerServing * noOfServing))
            if (!result) {
                return ResponseHelpers.SetSuccessErrorResponse({Message: 'Unable to update.'}, res, CommonConfig.STATUS_CODE.CREATED)
            }
            const cartItemDataDetails = await AuthService.Cart.GetCartItemByCartItemId(itemId, cart.id)
            if (!cartItemDataDetails) {
                return ResponseHelpers.SetSuccessErrorResponse(null, res, CommonConfig.STATUS_CODE.OK)
            }
            const totalPrice = await AuthService.Cart.GetSelectedCartTotalPrice(cart.id, cookId)
            const cartItem = {
                id: cartItemDataDetails.id,
                noOfServing: cartItemDataDetails.noOfServing,
                spiceLevel: cartItemDataDetails.spiceLevel,
                price: totalPrice[0].price
            }
            return ResponseHelpers.SetSuccessResponse({cartItem}, res, CommonConfig.STATUS_CODE.CREATED)
        } catch (error) {
            next(error)
        }
    },
    UpdateSpiceLevel: async (req, res, next) => {
        try {
            const {id} = req.user
            const {itemId} = req.value.params
            const {recipeId, spiceLevel} = req.body
            const cartOwner = await AuthService.Cart.CheckCartItemOwner(id)
            if (!cartOwner) {
                return ResponseHelpers.SetSuccessResponse({Message: 'Unable to update space level.'}, res, CommonConfig.STATUS_CODE.CREATED)
            }
            const result = await AuthService.Cart.UpdateSpiceLevel(itemId, cartOwner.id, recipeId, spiceLevel)
            if (!result) {
                return ResponseHelpers.SetSuccessResponse({Message: 'Unable to update spice level.'}, res, CommonConfig.STATUS_CODE.CREATED)
            }
            const cartItemDataDetails = await AuthService.Cart.GetCartItemByCartItemId(itemId, cartOwner.id)
            if (!cartItemDataDetails) {
                return ResponseHelpers.SetSuccessErrorResponse(null, res, CommonConfig.STATUS_CODE.OK)
            }

            const cartItem = {
                id: cartItemDataDetails.id,
                noOfServing: cartItemDataDetails.noOfServing,
                spiceLevel: cartItemDataDetails.spiceLevel,
                price: cartItemDataDetails.price
            }

            return ResponseHelpers.SetSuccessResponse({cartItem}, res, CommonConfig.STATUS_CODE.CREATED)
        } catch (error) {
            next(error)
        }
    }
}

const Facebook = {
    ConenctOrDisconnect: async (req, res, next) => {
        try {
            const {id} = req.user
            const profileFacebookDetails = await AuthService.Facebook.CheckFacebookIsConnected(id)
            await AuthService.Facebook.UpdateUserFacebookConnectionStatus(id, !profileFacebookDetails.isFacebookConnected)
            return ResponseHelpers.SetSuccessResponse({
                Message: 'Facebook status updated.',
                status: !profileFacebookDetails.isFacebookConnected
            }, res, CommonConfig.STATUS_CODE.CREATED)
        } catch (error) {
            next(error)
        }
    }
}

const WishList = {
    GetAll: async (req, res, next) => {
        try {
            const {id} = req.user
            const recipeList = await AuthService.WishList.All(id)
            let convertedJSON = JSON.parse(JSON.stringify(recipeList))
            for (const index in convertedJSON) {
                if (convertedJSON.hasOwnProperty(index)) {
                    const {id} = convertedJSON[index]
                    const ratingDetails = await CommonService.Recipe.FindRatingByRecipeId(id)
                    convertedJSON[index].Rating = !ratingDetails[0].rating ? 0 : ratingDetails[0].rating
                }
            }
            return ResponseHelpers.SetSuccessResponse(convertedJSON, res, CommonConfig.STATUS_CODE.CREATED)
        } catch (error) {
            next(error)
        }
    },
    DeleteFromWishList: async (req, res, next) => {
        try {
            const {id} = req.user
            const itemId = req.value.params.id
            const item = await AuthService.WishList.CheckItemIsOwnedByCurrentUser(id, itemId)
            if (!item) {
                return ResponseHelpers.SetSuccessErrorResponse({
                    message: 'Item not found.'
                }, res, CommonConfig.STATUS_CODE.OK)
            }
            const result = await AuthService.WishList.Delete(itemId, id)
            if (!result) {
                return ResponseHelpers.SetSuccessErrorResponse({message: 'Unable to remove item.'}, res, CommonConfig.STATUS_CODE.OK)
            }
            return ResponseHelpers.SetSuccessResponse({ressage: 'Item removed successfully.'}, res, CommonConfig.STATUS_CODE.OK)
        } catch (error) {
            next(error)
        }
    },
    UpdateSpiceLevel: async (req, res, next) => {
        try {
            const {id} = req.user
            const {cartItemId, recipeId} = req.value.params
            const {spiceLevel} = req.body
            const cart = await AuthService.Cart.CheckCartItemOwner(id)
            if (!cart) {
                return ResponseHelpers.SetSuccessErrorResponse({
                    message: 'Cart not found.'
                }, res, CommonConfig.STATUS_CODE.OK)
            }
            const cartItem = await AuthService.Cart.CheckCartItemIsExists(cart.id, cartItemId, recipeId)
            if (!cartItem) {
                return ResponseHelpers.SetSuccessErrorResponse({
                    message: 'Item not found.'
                }, res, CommonConfig.STATUS_CODE.OK)
            }
            const updatedData = await AuthService.Cart.UpdateSpiceLevel(cartItemId, cart.id, spiceLevel, recipeId)
            if (!updatedData) {
                return ResponseHelpers.SetSuccessErrorResponse({
                    message: 'Item not found.'
                }, res, CommonConfig.STATUS_CODE.OK)
            }
            return ResponseHelpers.SetSuccessResponse({ressage: 'No. of serve updated'}, res, CommonConfig.STATUS_CODE.OK)
        } catch (error) {
            next(error)
        }
    },
    UpdateNoOfServe: async (req, res, next) => {
        try {
            const {id} = req.user
            const {cartItemId, recipeId} = req.value.params
            const {noOfServing} = req.body
            const cart = await AuthService.Cart.CheckCartItemOwner(id)
            if (!cart) {
                return ResponseHelpers.SetSuccessErrorResponse({
                    message: 'Cart not found.'
                }, res, CommonConfig.STATUS_CODE.OK)
            }
            const cartItem = await AuthService.Cart.CheckCartItemIsExists(cart.id, cartItemId, recipeId)
            if (!cartItem) {
                return ResponseHelpers.SetSuccessErrorResponse({
                    message: 'Item not found.'
                }, res, CommonConfig.STATUS_CODE.OK)
            }
            const updatedData = await AuthService.Cart.UpdateNoOfServing(noOfServing, cart.id, noOfServing, recipeId)
            if (!updatedData) {
                return ResponseHelpers.SetSuccessErrorResponse({
                    message: 'Item not found.'
                }, res, CommonConfig.STATUS_CODE.OK)
            }
            return ResponseHelpers.SetSuccessResponse({ressage: 'No. of serve updated'}, res, CommonConfig.STATUS_CODE.OK)
        } catch (error) {
            next(error)
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
    Order: Order,
    Cart: Cart,
    Facebook: Facebook,
    WishList: WishList
}

module.exports = AuthController
