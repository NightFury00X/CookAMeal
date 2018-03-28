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
    GetCurrentDeliverAddress: async (req, res, next) => {
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
    AddDeliverAddress: async (req, res, next) => {
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
                return ResponseHelpers.SetSuccessErrorResponse({message: 'Unable to add deliver address.'}, res, CommonConfig.STATUS_CODE.CREATED)
            }
            return ResponseHelpers.SetSuccessResponse({message: 'Doen'}, res, CommonConfig.STATUS_CODE.CREATED)
        } catch (error) {
            next(error)
        }
    },
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

const Cart = {
    AddToCart: async (req, res, next) => {
        try {
            const {id} = req.user
            const {recipeId, noOfServing} = req.body
            const recipeDetails = await CommonService.Recipe.FindRecipePriceByRecipeId(recipeId)
            if (!recipeDetails) {
                return ResponseHelpers.SetSuccessErrorResponse({Message: 'Unable to add to cart.'}, res, CommonConfig.STATUS_CODE.OK)
            }
            const isCartOpen = await AuthService.Cart.CheckCartIsOpen(id)
            if (isCartOpen) {
                const addToCartData = {
                    recipeId: recipeId,
                    noOfServing: 1,
                    spiceLevel: 'Mild',
                    cartId: isCartOpen.id,
                    price: recipeDetails.costPerServing
                }
                const result = AuthService.Cart.AddItemToExistingCart(addToCartData)
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
                    price: recipeDetails.costPerServing
                }
                const result = await AuthService.Cart.AddToCart(addToCartData)
                if (!result) {
                    return ResponseHelpers.SetSuccessErrorResponse({Message: 'Unable to add to cart.'}, res, CommonConfig.STATUS_CODE.OK)
                }
                return ResponseHelpers.SetSuccessResponse({Message: 'Added to Cart.'}, res, CommonConfig.STATUS_CODE.CREATED)
            }
        } catch (error) {
            next(error)
        }
    },
    GetCartDetails: async (req, res, next) => {
        try {
            const {id} = req.user
            const cartDetails = await AuthService.Cart.GetCartDetails(id)
            if (!cartDetails) {
                return ResponseHelpers.SetSuccessResponse(null, res, CommonConfig.STATUS_CODE.OK)
            }
            const profile = await CommonService.User.GetProfileIdByUserTypeId(id)
            let convertedJSON = JSON.parse(JSON.stringify(cartDetails))
            let price = 0
            for (const index in convertedJSON.CartItems) {
                if (convertedJSON.CartItems.hasOwnProperty(index)) {
                    const {recipeId} = convertedJSON.CartItems[index]
                    const recipeDetails = await CommonService.Recipe.FindRecipeDetailsForCartById(recipeId)
                    const cookDetails = await CommonService.Recipe.FindCookDetailsByRecipeId(recipeId)
                    delete convertedJSON.CartItems[index].recipeId
                    const categoryId = recipeDetails.categoryId
                    const category = await CommonService.GetCategoryById(categoryId)
                    const currencyDetails = await CommonService.User.GetCurrencySymbolByProfileId(profile.id)
                    convertedJSON.CartItems[index].Recipe = recipeDetails
                    convertedJSON.CartItems[index].categoryName = category.name
                    convertedJSON.CartItems[index].Cook = cookDetails.fullName
                    convertedJSON.CartItems[index].CurrencySymbol = currencyDetails.currencySymbol
                    price = price + parseInt(convertedJSON.CartItems[index].price)
                }
            }
            convertedJSON.totalItems = convertedJSON.CartItems.length
            convertedJSON.totalPrice = price
            return ResponseHelpers.SetSuccessResponse(convertedJSON, res, CommonConfig.STATUS_CODE.CREATED)
        } catch (error) {
            next(error)
        }
    },
    DeleteCartItem: async (req, res, next) => {
        try {
            const {id} = req.user
            const {itemId} = req.value.params
            const cartOwner = await AuthService.Cart.CheckCartItemOwner(id)
            if (!cartOwner) {
                return ResponseHelpers.SetSuccessErrorResponse({message: 'Unable to remove from cart.'}, res, CommonConfig.STATUS_CODE.OK)
            }
            const deletedCartItem = await AuthService.Cart.DeleteCartDetails(itemId, cartOwner.id)
            if (!deletedCartItem) {
                return ResponseHelpers.SetSuccessErrorResponse({message: 'Unable to remove from cart.'}, res, CommonConfig.STATUS_CODE.OK)
            }
            const cartDetails = await AuthService.Cart.GetCartDetails(id)
            if (!cartDetails) {
                return ResponseHelpers.SetSuccessErrorResponse({message: 'Unable to remove from cart.'}, res, CommonConfig.STATUS_CODE.OK)
            }
            const profile = await CommonService.User.GetProfileIdByUserTypeId(id)
            let convertedJSON = JSON.parse(JSON.stringify(cartDetails))
            let totalPrice = 0
            for (const index in convertedJSON.CartItems) {
                if (convertedJSON.CartItems.hasOwnProperty(index)) {
                    const {recipeId} = convertedJSON.CartItems[index]
                    const recipeDetails = await CommonService.Recipe.FindRecipeDetailsForCartById(recipeId)
                    const cookDetails = await CommonService.Recipe.FindCookDetailsByRecipeId(recipeId)
                    delete convertedJSON.CartItems[index].recipeId
                    const categoryId = recipeDetails.categoryId
                    const category = await CommonService.GetCategoryById(categoryId)
                    const currencyDetails = await CommonService.User.GetCurrencySymbolByProfileId(profile.id)
                    convertedJSON.CartItems[index].Recipe = recipeDetails
                    convertedJSON.CartItems[index].categoryName = category.name
                    convertedJSON.CartItems[index].Cook = cookDetails.fullName
                    convertedJSON.CartItems[index].CurrencySymbol = currencyDetails.currencySymbol
                    totalPrice = totalPrice + parseInt(convertedJSON.CartItems[index].price)
                }
            }
            convertedJSON.totalItems = convertedJSON.CartItems.length
            convertedJSON.totalPrice = totalPrice
            return ResponseHelpers.SetSuccessResponse(convertedJSON, res, CommonConfig.STATUS_CODE.CREATED)
        } catch (error) {
            next(error)
        }
    },
    UpdateTotalServing: async (req, res, next) => {
        try {
            const {id} = req.user
            const {itemId} = req.value.params
            const {recipeId, noOfServing} = req.body
            const cartOwner = await AuthService.Cart.CheckCartItemOwner(id)
            if (!cartOwner) {
                return ResponseHelpers.SetSuccessResponse({Message: 'Unable to update.'}, res, CommonConfig.STATUS_CODE.CREATED)
            }
            const {costPerServing} = await AuthService.Cart.GetPriceOfRecipeByCartItemId(itemId)
            const result = await AuthService.Cart.UpdateNoOfServing(itemId, cartOwner.id, noOfServing, recipeId, (costPerServing * noOfServing))
            if (!result) {
                return ResponseHelpers.SetSuccessResponse({Message: 'Unable to update.'}, res, CommonConfig.STATUS_CODE.CREATED)
            }
            const cartDetails = await AuthService.Cart.GetCartDetails(id)
            if (!cartDetails) {
                return ResponseHelpers.SetSuccessResponse(null, res, CommonConfig.STATUS_CODE.OK)
            }
            const profile = await CommonService.User.GetProfileIdByUserTypeId(id)
            let convertedJSON = JSON.parse(JSON.stringify(cartDetails))
            let totalPrice = 0
            for (const index in convertedJSON.CartItems) {
                if (convertedJSON.CartItems.hasOwnProperty(index)) {
                    const {recipeId} = convertedJSON.CartItems[index]
                    const recipeDetails = await CommonService.Recipe.FindRecipeDetailsForCartById(recipeId)
                    const cookDetails = await CommonService.Recipe.FindCookDetailsByRecipeId(recipeId)
                    delete convertedJSON.CartItems[index].recipeId
                    const categoryId = recipeDetails.categoryId
                    const category = await CommonService.GetCategoryById(categoryId)
                    const currencyDetails = await CommonService.User.GetCurrencySymbolByProfileId(profile.id)
                    convertedJSON.CartItems[index].Recipe = recipeDetails
                    convertedJSON.CartItems[index].categoryName = category.name
                    convertedJSON.CartItems[index].Cook = cookDetails.fullName
                    convertedJSON.CartItems[index].currencySymbol = currencyDetails.currencySymbol
                    totalPrice = totalPrice + parseInt(convertedJSON.CartItems[index].price)
                }
            }
            convertedJSON.totalItems = convertedJSON.CartItems.length
            convertedJSON.totalPrice = totalPrice
            return ResponseHelpers.SetSuccessResponse(convertedJSON, res, CommonConfig.STATUS_CODE.CREATED)
        } catch (error) {
            next(error)
        }
    },
    UpdateSpiceLevel: async (req, res, next) => {
        try {
            const {id} = req.user
            const {itemId} = req.value.params
            const {recipeId, spiceLevel} = req.body
            console.log('RecipeId: ', recipeId)
            console.log('spiceLevel: ', spiceLevel)
            const cartOwner = await AuthService.Cart.CheckCartItemOwner(id)
            if (!cartOwner) {
                return ResponseHelpers.SetSuccessResponse({Message: 'Unable to update space level.'}, res, CommonConfig.STATUS_CODE.CREATED)
            }
            const result = await AuthService.Cart.UpdateSpiceLevel(itemId, cartOwner.id, recipeId, spiceLevel)
            if (!result) {
                return ResponseHelpers.SetSuccessResponse({Message: 'Unable to update spice level.'}, res, CommonConfig.STATUS_CODE.CREATED)
            }
            const cartDetails = await AuthService.Cart.GetCartDetails(id)
            if (!cartDetails) {
                return ResponseHelpers.SetSuccessResponse(null, res, CommonConfig.STATUS_CODE.OK)
            }
            const profile = await CommonService.User.GetProfileIdByUserTypeId(id)
            let convertedJSON = JSON.parse(JSON.stringify(cartDetails))
            let totalPrice = 0
            for (const index in convertedJSON.CartItems) {
                if (convertedJSON.CartItems.hasOwnProperty(index)) {
                    const {recipeId} = convertedJSON.CartItems[index]
                    const recipeDetails = await CommonService.Recipe.FindRecipeDetailsForCartById(recipeId)
                    const cookDetails = await CommonService.Recipe.FindCookDetailsByRecipeId(recipeId)
                    delete convertedJSON.CartItems[index].recipeId
                    const categoryId = recipeDetails.categoryId
                    const category = await CommonService.GetCategoryById(categoryId)
                    const currencyDetails = await CommonService.User.GetCurrencySymbolByProfileId(profile.id)
                    convertedJSON.CartItems[index].Recipe = recipeDetails
                    convertedJSON.CartItems[index].categoryName = category.name
                    convertedJSON.CartItems[index].Cook = cookDetails.fullName
                    convertedJSON.CartItems[index].currencySymbol = currencyDetails.currencySymbol
                    totalPrice = totalPrice + parseInt(convertedJSON.CartItems[index].price)
                }
            }
            convertedJSON.totalItems = convertedJSON.CartItems.length
            convertedJSON.totalPrice = totalPrice
            return ResponseHelpers.SetSuccessResponse(convertedJSON, res, CommonConfig.STATUS_CODE.CREATED)
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
