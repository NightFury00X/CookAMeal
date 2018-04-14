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
                    facebookEmailId: `${email}`
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
                model: db.Profile,
                include: [{
                    model: db.Address
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
                user: userData
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
    CheckAddressIsCurrentAddress: async (addressId, profileId) => {
        console.log('addressId: ', addressId)
        console.log('profileId: ', profileId)
        try {
            return await db.Address.findOne({
                where: {
                    [Op.and]: {
                        id: `${addressId}`,
                        profileId: `${profileId}`
                    }
                }
            })
        } catch (error) {
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
                const userRoleChanged = await db.UserType.update({
                    userRole: userRole,
                    profileSelected: true
                }, {
                    where: {
                        [Op.and]: {
                            id: `${userId}`,
                            facebookId: `${facebookId}`
                        }
                    },
                    transaction: trans
                })
                if (!userRoleChanged) {
                    trans.rollback()
                    return null
                }
                const profileChanged = await db.Profile.update({
                    userRole: userRole
                }, {
                    where: {
                        [Op.and]: {
                            createdBy: `${userId}`
                        }
                    },
                    transaction: trans
                })
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
    ProfileCover: async (profileCoverData, files) => {
        const trans = await db.sequelize.transaction()
        try {
            const profileCover = await db.ProfileCover.create(profileCoverData, {transaction: trans})
            if (!profileCover) {
                trans.rollback()
                return false
            }
            let profileCoverImage = files.profileCover[0]
            profileCoverImage.profileId = profileCover.profileId
            profileCoverImage.objectType = CommonConfig.OBJECT_TYPE.PROFILECOVER
            profileCoverImage.imageUrl = CommonConfig.FILE_LOCATIONS.PROFILECOVER + profileCoverImage.filename
            profileCoverImage.fileName = profileCoverImage.filename
            profileCoverImage.originalName = profileCoverImage.originalname
            profileCoverImage.mimeType = profileCoverImage.mimetype
            delete profileCoverImage.filename
            delete profileCoverImage.originalname
            delete profileCoverImage.mimetype
            const ProfileCoverMediaObject = await db.MediaObject.create(profileCoverImage, {transaction: trans})
            const profile = await db.Profile.update({
                coverPhotoUrl: ProfileCoverMediaObject.imageUrl
            }, {
                where: {
                    [Op.and]: {
                        id: `${ProfileCoverMediaObject.profileId}`
                    }
                },
                transaction: trans
            })
            if (!profile) {
                trans.rollback()
                return false
            }
            trans.commit()
            return ProfileCoverMediaObject.imageUrl
        } catch (error) {
            trans.rollback()
            throw (error)
        }
    },
    CheckProfileCoverUploaded: async (profileId) => {
        try {
            return await db.ProfileCover.findOne({
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
    CheckProfileImageUploaded: async (profileId) => {
        try {
            return await db.MediaObject.findOne({
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
    UpdateProfileCover: async (profileImageFile, profileCoverId, profileId) => {
        const trans = await db.sequelize.transaction()
        try {
            const mediaObject = await db.MediaObject.update(profileImageFile, {
                where: {
                    profileCoverId: {
                        [Op.eq]: `${profileCoverId}`
                    }
                },
                transaction: trans
            })
            if (!mediaObject) {
                trans.rollback()
                return false
            }
            const profile = await db.Profile.update({
                coverPhotoUrl: profileImageFile.imageUrl
            }, {
                where: {
                    [Op.and]: {
                        id: `${profileId}`
                    }
                },
                transaction: trans
            })
            if (!profile) {
                trans.rollback()
                return false
            }
            trans.commit()
            return profileImageFile.imageUrl
        } catch (error) {
            trans.rollback()
            throw (error)
        }
    },
    UpdateProfileImage: async (profileImageFile, mediaObjectId, profileId) => {
        const trans = await db.sequelize.transaction()
        try {
            const mediaObject = await db.MediaObject.update(profileImageFile, {
                where: {
                    id: {
                        [Op.eq]: `${mediaObjectId}`
                    }
                },
                transaction: trans
            })
            if (!mediaObject) {
                trans.rollback()
                return false
            }
            const profile = await db.Profile.update({
                profileUrl: profileImageFile.imageUrl
            }, {
                where: {
                    [Op.and]: {
                        id: `${profileId}`
                    }
                },
                transaction: trans
            })
            if (!profile) {
                trans.rollback()
                return false
            }
            trans.commit()
            return profileImageFile.imageUrl
        } catch (error) {
            trans.rollback()
            throw (error)
        }
    },
    ProfileImage: async (profileImageData, files) => {
        const trans = await db.sequelize.transaction()
        try {
            let profileImage = files.profile[0]
            profileImage.profileId = profileImageData.profileId
            profileImage.objectType = CommonConfig.OBJECT_TYPE.PROFILE
            profileImage.imageUrl = CommonConfig.FILE_LOCATIONS.PROFILE + profileImage.filename
            profileImage.fileName = profileImage.filename
            profileImage.originalName = profileImage.originalname
            profileImage.mimeType = profileImage.mimetype
            delete profileImage.filename
            delete profileImage.originalname
            delete profileImage.mimetype
            const ProfileImageMediaObject = await db.MediaObject.create(profileImage, {transaction: trans})
            const profile = await db.Profile.update({
                profileUrl: ProfileImageMediaObject.imageUrl
            }, {
                where: {
                    [Op.and]: {
                        id: `${ProfileImageMediaObject.profileId}`
                    }
                },
                transaction: trans
            })
            if (!profile) {
                trans.rollback()
                return false
            }
            trans.commit()
            return ProfileImageMediaObject.imageUrl
        } catch (error) {
            trans.rollback()
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
    GetCurrencySymbolByProfileId:
        async (profileId) => {
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
    FindAllReviewsByProfileId:
        async (profileId) => {
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
                        model: db.Profile,
                        attributes: ['id', 'firstName', 'lastName', 'profileUrl', 'createdBy'],
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
    FindProfileRatingByProfileId:
        async (profileId) => {
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
    FindCookAllCategoriesByProfileId:
        async (profileId) => {
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
    GetCookProfileDetailsById:
        async (profileId) => {
            try {
                return await db.Profile.findById(profileId, {
                    attributes: ['id', 'firstName', 'lastName', 'description', 'profileUrl', 'createdBy', 'coverPhotoUrl'],
                    include: [{
                        model: db.MediaObject,
                        attributes: ['id', 'imageUrl']
                    }]
                })
            } catch (error) {
                throw (error)
            }
        },
    GetCookDrivingDistanceById:
        async (profileId) => {
            try {
                return await db.Profile.findById(profileId, {
                    attributes: ['drivingDistance']
                })
            } catch (error) {
                throw (error)
            }
        },
    GetCookProfileDetailsForCartById:
        async (profileId) => {
            try {
                return await db.Profile.findById(profileId, {
                    attributes: ['id', 'firstName', 'lastName', 'profileUrl']
                })
            } catch (error) {
                throw (error)
            }
        },
    GetProfileIdByUserTypeId:
        async (userTypeId) => {
            try {
                return db.Profile.findOne({
                    where: {
                        createdBy: {
                            [Op.eq]: [userTypeId]
                        }
                    },
                    attributes: ['id', 'firstName', 'lastName', 'profileUrl', 'createdBy']
                })
            } catch (error) {
                throw (error)
            }
        },
    Logout:
        async (tokenDetails) => {
            try {
                return await db.BlackListedToken.create(tokenDetails)
            } catch (error) {
                throw (error)
            }
        }
}

CommonService.prototype.Recipe = {
    FindMaxDeliverFeesForcart: async (cartId) => {
        try {
            return await db.CartItem.findAll()
        } catch (error) {
            throw (error)
        }
    },
    FindCookDetailsByRecipeId: async (recipeId) => {
        try {
            return await db.Profile.findOne({
                include: [{
                    model: db.Recipe,
                    where: {
                        id: {
                            [Op.eq]: `${recipeId}`
                        }
                    }
                }, {
                    model: db.MediaObject,
                    attributes: ['id', 'imageUrl']
                }]
            })
        } catch (error) {
            throw (error)
        }
    },
    FindRecipePriceByRecipeId: async (recipeId) => {
        try {
            return await db.Recipe.findById(recipeId, {
                attributes: ['id', 'costPerServing', 'profileId']
            })
        } catch (error) {
            throw (error)
        }
    },
    FindRecipeDetailsForCartById: async (recipeId) => {
        try {
            return await db.Recipe.findById(recipeId, {
                attributes: ['id', 'dishName', 'availableServings', 'costPerServing', 'categoryId', 'subCategoryId', 'deliveryFee', 'currencySymbol'],
                include: [{
                    model: db.MediaObject,
                    attributes: ['id', 'imageUrl']
                }]
            })
        } catch (error) {
            throw (error)
        }
    },
    FindRecipePrice: async (recipeId) => {
        try {
            return await db.Recipe.findById(recipeId, {
                include: [{
                    model: db.MediaObject,
                    attributes: ['id', 'imageUrl']
                }]
            })
        } catch (error) {
            throw (error)
        }
    },
    FindProfileIsEligible: async (profileId, eligibility) => {
        try {
            return await db.Profile.findOne({
                where: {
                    id: profileId,
                    isEligibleForHire: eligibility
                }
            })
        } catch (error) {
            throw (error)
        }
    },
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
                attributes: ['id', 'dishName', 'availableServings', 'orderByDateTime', 'costPerServing', 'orderByDateTime', 'preparationTime', 'cookTime', 'profileId'],
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
                attributes: ['id', 'email', 'firstName', 'lastName', 'profileUrl', 'createdBy'],
                include: [{
                    model: db.MediaObject,
                    attributes: ['id', 'imageUrl']
                }, {
                    model: db.Recipe,
                    attributes: ['id', 'dishName', 'availableServings', 'orderByDateTime', 'costPerServing', 'preparationTime', 'cookTime', 'serve', 'categoryId', 'subCategoryId', 'profileId', 'currencySymbol'],
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
                    }, {
                        attributes: ['id', 'latitude', 'longitude'],
                        model: db.RecipesGeoLocations
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
                    attributes: ['id', 'dishName', 'costPerServing', 'orderByDateTime', 'currencySymbol'],
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
    FindAllByCategoryId: async (categoryId, type) => {
        try {
            return db.SubCategory.findAll({
                attributes: ['id', 'name'],
                include: [{
                    model: db.Recipe,
                    attributes: ['id', 'dishName', 'costPerServing', 'subCategoryId', 'orderByDateTime', 'profileId', 'eligibleFor', 'currencySymbol'],
                    where: {
                        [Op.and]: [{
                            categoryId: categoryId
                        }],
                        [Op.or]: [{
                            eligibleFor: `${type}`
                        }, {
                            eligibleFor: `${3}`
                        }]
                    },
                    // required: true,
                    limit: 10,
                    include: [{
                        // required: true,
                        model: db.MediaObject,
                        attributes: ['id', 'imageUrl']
                    }, {
                        attributes: ['id', 'latitude', 'longitude'],
                        model: db.RecipesGeoLocations
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
                    attributes: ['id', 'dishName', 'costPerServing', 'subCategoryId', 'orderByDateTime', 'profileId', 'currencySymbol'],
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
                attributes: ['id', 'dishName', 'availableServings', 'orderByDateTime', 'costPerServing', 'preparationTime', 'cookTime', 'serve', 'categoryId', 'subCategoryId', 'profileId', 'currencySymbol'],
                include: [{
                    model: db.MediaObject,
                    attributes: ['id', 'imageUrl']
                }, {
                    attributes: ['id', 'latitude', 'longitude'],
                    model: db.RecipesGeoLocations
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
                    profileId: {
                        [Op.ne]: `${profileId}`
                    },
                    subCategoryId: {
                        [Op.eq]: `${subCategoryId}`
                    }
                },
                attributes: ['id', 'dishName', 'availableServings', 'orderByDateTime', 'costPerServing', 'preparationTime', 'cookTime', 'categoryId', 'subCategoryId', 'profileId', 'currencySymbol'],
                include: [{
                    model: db.MediaObject,
                    attributes: ['id', 'imageUrl']
                }, {
                    attributes: ['id', 'latitude', 'longitude'],
                    model: db.RecipesGeoLocations
                }]
            })
        } catch (error) {
            throw (error)
        }
    }
}

module.exports = new CommonService()
