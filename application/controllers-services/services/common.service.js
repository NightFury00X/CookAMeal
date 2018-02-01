const randomString = require('random-string')
const Sequelize = require('sequelize')
const Op = Sequelize.Op
const db = require('../../modals')
const {AuthenticationHelpers} = require('../../../configurations/helpers/helper')
const CommonConfig = require('../../../configurations/helpers/common-config')

CommonService = function () {
}

CommonService.prototype.UserModel = {
    GetDetailsByEmail: async (email) => {
        return await db.UserType.findOne({
            where: {
                [Op.or]: {
                    emailId: `${email}`,
                    facebookId: `${email}`
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

CommonService.prototype.GetUserDetailsByUserTypeId = async (userTypeId) => {
    try {
        return await db.UserType.findOne({
            where: {
                id: {
                    [Op.eq]: `${userTypeId}`
                }
            },
            include: [{
                model: db.Profile
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
            user: userData
        }
    } catch (error) {
        throw (error)
    }
}

CommonService.prototype.Token = {
    GuestLoginToken: async (tokenData) => {
        try {
            return {
                token: AuthenticationHelpers.GenerateTokenForGuest(tokenData),
                user: null,
                guest: true
            }
        } catch (error) {
            throw (error)
        }
    },
    FacebookToken: async (tokenData, userData, hasProfile) => {
        try {
            return {
                token: AuthenticationHelpers.GenerateToken(tokenData, false, hasProfile),
                userDetails: userData
            }
        } catch (error) {
            throw (error)
        }
    }
}

CommonService.prototype.GetCategories = async () => {
    try {
        return await db.Category.findAll({
            attributes: ['id', 'name'],
            include: [
                {
                    model: db.MediaObject,
                    attributes: ['imageUrl'],
                    where: {
                        imageUrl: {
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
            include: [{model: db.MediaObject, attributes: ['imageUrl']}]
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

CommonService.prototype.InvalidateResetPasswordTokenData = async (id) => {
    try {
        return await db.ResetPassword.update({
            isValid: false,
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

CommonService.prototype.User = {
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
    CheckFacebookAlreadyLinked: async (facebookId, facebookEmailId) => {
        try {
            return await db.UserType.findOne({
                attributes: ['id'],
                where: {
                    [Op.or]: {
                        emailId: `${facebookEmailId}`,
                        facebookId: `${facebookId}`,
                        facebookEmailId: `${facebookEmailId}`
                    }
                }
            })
        } catch (error) {
            throw (error)
        }
    },
    CheckUserEmailIdExist: async (emailId) => {
        try {
            return await db.UserType.findOne({
                where: {
                    [Op.or]: {
                        emailId: `${emailId}`,
                        facebookEmailId: `${emailId}`
                    }
                }
            })
        } catch (error) {
            throw (error)
        }
    },
    CheckUserHasLogin: async (userId) => {
        try {
            return await db.User.findOne({
                where: {
                    createdBy: {
                        [Op.eq]: `${userId}`
                    }
                }
            })
        } catch (error) {
            throw (error)
        }
    },
    ValidateUserCredentials: async (userId, password) => {
        try {
            const userDetails = await db.User.findOne({
                where: {
                    createdBy: {
                        [Op.eq]: `${userId}`
                    }
                }
            })
            return await userDetails.comparePasswords(password)
        } catch (error) {
            throw (error)
        }
    },
    ChangeProfileType: async (userRole, userId, facebookId) => {
        const trans = await db.sequelize.transaction()
        try {
            const checkProfileExist = await db.Profile.findOne({
                where: {
                    createdBy: {
                        [Op.eq]: `${userId}`
                    }
                }
            })
            if (checkProfileExist) {
                const profileChanged = await db.UserType.update({
                    userRole: userRole,
                    profileSelected: true
                }, {
                    where: {
                        [Op.and]: {
                            id: `${userId}`,
                            facebookId: `${facebookId}`
                        }
                    }
                }, {transaction: trans})
                if (!profileChanged) {
                    trans.rollback()
                    return null
                }
                return true
            }
            return false
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
    CheckUserHasProfileByFacebookId: async (facebookId, facebookEmailId) => {
        try {
            return await db.UserType.findOne({
                where: {
                    [Op.or]: {
                        facebookId: `${facebookId}`,
                        facebookEmailId: `${facebookEmailId}`
                    }
                }
            })
        } catch (error) {
            throw (error)
        }
    },
    ProfileCover: async (profileId) => {
        try {
            return await db.ProfileCover.create(profileId)
        } catch (error) {
            throw (error)
        }
    },
    FindProfileIsExist: async (profileId) => {
        try {
            return await db.Profile.findOne({
                attributes: ['id'],
                where: {
                    id: {
                        [Op.eq]: profileId
                    }
                }
            })
        } catch (error) {
            throw (error)
        }
    },
    GetCurrencySymbolByProfileId: async (profileId) => {
        try {
            return await db.Address.findOne({
                attributes: ['currencySymbol'],
                where: {
                    profileId: {
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
                        profileId: {
                            [Op.eq]: profileId
                        }
                    }
                }, {
                    attributes: ['id', 'firstName', 'lastName', 'profileUrl'],
                    model: db.Profile,
                    include: [{
                        model: db.MediaObject,
                        attributes: ['id', 'imageUrl']
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
                    profileId: {
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
                    attributes: ['id', 'dishName'],
                    model: db.Recipe,
                    where: {
                        profileId: {
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
                attributes: ['id', 'firstName', 'lastName', 'description', 'profileUrl'],
                include: [{
                    model: db.MediaObject,
                    attributes: ['id', 'imageUrl']
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
                    createdBy: {
                        [Op.eq]: [userTypeId]
                    }
                },
                attributes: ['id', 'firstName', 'lastName', 'profileUrl']
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
                attributes: ['id', 'dishName', 'availableServings', 'orderByDateTime', 'costPerServing', 'preparationMethod', 'preparationTime', 'cookTime', 'profileId'],
                where: {
                    [Op.and]: [{
                        categoryId: categoryId,
                        subCategoryId: subCategoryId
                    }]
                },
                include: [{
                    model: db.Ingredient
                }, {
                    required: true,
                    attributes: ['id', 'imageUrl'],
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
                attributes: ['id', 'email', 'firstName', 'lastName', 'profileUrl'],
                include: [{
                    model: db.MediaObject,
                    attributes: ['id', 'imageUrl']
                }, {
                    attributes: ['id', 'dishName', 'availableServings', 'orderByDateTime', 'costPerServing', 'preparationMethod', 'preparationTime', 'cookTime', 'serve', 'categoryId', 'subCategoryId', 'profileId'],
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
                            attributes: ['id', 'unitName', 'sortName'],
                            model: db.Unit
                        }]
                    }, {
                        attributes: ['id', 'imageUrl'],
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
                    recipeId: {
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
                    attributes: ['id', 'dishName', 'costPerServing', 'orderByDateTime'],
                    where: {
                        profileId: {
                            [Op.eq]: `${profileId}`
                        }
                    },
                    include: [{
                        model: db.MediaObject,
                        attributes: ['id', 'imageUrl']
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
                    attributes: ['id', 'dishName', 'costPerServing', 'subCategoryId', 'orderByDateTime', 'profileId'],
                    where: {
                        categoryId: {
                            [Op.eq]: [categoryId]
                        }
                    },
                    required: true,
                    limit: 10,
                    include: [{
                        required: true,
                        model: db.MediaObject,
                        attributes: ['id', 'imageUrl']
                    }]
                }]
            })
        } catch (error) {
            throw (error)
        }
    },
    FindAllByCategoryByProfileId: async (profileId) => {
        try {
            return db.SubCategory.findAll({
                attributes: ['id', 'name'],
                include: [{
                    model: db.Recipe,
                    attributes: ['id', 'dishName', 'costPerServing', 'subCategoryId', 'orderByDateTime', 'profileId'],
                    where: {
                        profileId: {
                            [Op.eq]: `${profileId}`
                        }
                    },
                    required: true,
                    limit: 10,
                    include: [{
                        required: true,
                        model: db.MediaObject,
                        attributes: ['id', 'imageUrl']
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
                    profileId: {
                        [Op.eq]: `${profileId}`
                    },
                    id: {
                        [Op.ne]: `${recipeId}`
                    }
                },
                attributes: ['id', 'dishName', 'availableServings', 'orderByDateTime', 'costPerServing', 'preparationMethod', 'preparationTime', 'cookTime', 'serve', 'categoryId', 'subCategoryId', 'profileId'],
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
                        subCategoryId: `${subCategoryId}`,
                        profileId: `${profileId}`
                    }]
                },
                attributes: ['id', 'dishName', 'availableServings', 'orderByDateTime', 'costPerServing', 'preparationMethod', 'preparationTime', 'cookTime', 'categoryId', 'subCategoryId', 'profileId'],
                include: [{
                    model: db.MediaObject,
                    attributes: ['id', 'imageurl']
                }]
            })
        } catch (error) {
            throw (error)
        }
    }
}

module.exports = new CommonService()
