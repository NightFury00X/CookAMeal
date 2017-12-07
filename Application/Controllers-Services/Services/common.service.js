let randomString = require('random-string'),
    db = require('../../Modals'),
    {generateToken} = require('../../../Configurations/Helpers/authentication'),
    CommonConfig = require('../../../Configurations/Helpers/common-config');

CommonService = function () {
};

CommonService.prototype.UserModel = {
    GetDetailsByEmail: async (email) => {
        return await db.UserType.findOne({where: {user_id: email}});
    }
};

CommonService.prototype.Keys = {
    RandomKeys: {
        GenerateRandomKey: async () => {
            return await randomString(CommonConfig.OPTIONS.RANDOM_KEYS);
        },
        GenerateUnique16DigitKey: async () => {
            return await randomString(CommonConfig.OPTIONS.UNIQUE_RANDOM_KEYS);
        }
    }
};

CommonService.prototype.GetResetPasswordData = async (email) => {
    try {
        return await db.ResetPassword.findOne({
            where: {
                email: email
            }
        });
    } catch (error) {
        throw (error);
    }
};

CommonService.prototype.CheckUserTypeByUserId = async (fbId) => {
    try {
        return await db.UserType.findOne({
            attributes: ['id'],
            where: {user_id: fbId}
        });
    } catch (error) {
        throw (error);
    }
};

CommonService.prototype.GetUserDetailsByUserTypeId = async (userTypeId) => {
    try {
        return await db.UserType.findOne({
            where: {id: userTypeId},
            include: [{
                model: db.Profile,
                include: [{
                    model: db.MediaObject
                }]
            }]
        });
    } catch (error) {
        throw (error);
    }
};

CommonService.prototype.GenerateToken = async (tokenData, userData) => {
    try {
        return {
            token: generateToken(tokenData),
            userDetails: userData
        };
    } catch (error) {
        throw (error);
    }
};

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
        });
    } catch (error) {
        throw (error);
    }
};

CommonService.prototype.GetCategoryById = async (catId) => {
    try {
        return await db.Category.findOne({
            attributes: ['id', 'name'],
            where: {id: catId},
            include: [{model: db.MediaObject, attributes: ['imageurl']}]
        });
    } catch (error) {
        return error;
    }
};

CommonService.prototype.GenerateRandomKey = async () => {
    return randomString(CommonConfig.OPTIONS.RANDOM_KEYS);
};

CommonService.prototype.GenerateUnique16DigitKey = async () => {
    return randomString(CommonConfig.OPTIONS.UNIQUE_RANDOM_KEYS);
};

CommonService.prototype.ChangePassword = async (userDetails) => {
    const trans = await db.sequelize.transaction();
    try {
    
        // Check reset password is requested or not.        
        let records = await db.ResetPassword.findOne({
            where: {
                user_type_id: userDetails.id,
                status: true,
                is_valid: true
            }
        });
    
        if (!records) {
            trans.rollback();
            return null;
        }
    
        // If reset password requested, update the record in ResetPassword
        let resetPasswordData = await db.ResetPassword.update({
            is_valid: false,
            status: false,
        }, {
            where: {
                id: records.id,
                email: records.email
            }
        }, {transaction: trans});
    
    
        if (!resetPasswordData) {
            trans.rollback();
            return null;
        }
    
        // Update password field in user table
        let userData = await db.User.update({
            password: userDetails.password
        }, {
            where: {
                user_type_id: userDetails.id,
                email: userDetails.email
            }
        }, {transaction: trans});
    
        if (!userData) {
            trans.rollback();
            return null;
        }
    
        console.log('password changed');
        await trans.commit();
        return userData;
    }
    catch (error) {
        await trans.rollback();
        throw (error);
    }
};

CommonService.prototype.InvalidateResetPasswordTokenData = async (id) => {
    try {
        return await db.ResetPassword.update({
            is_valid: false,
            status: false
        }, {
            where: {id: id}
        });
    } catch (error) {
        return (error);
    }
};

CommonService.prototype.GenerateTokenByUserTypeId = async (userId) => {
    try {
        const userType = await db.UserType.findById(userId, {
            include: [{
                model: db.Profile,
                include: [{
                    model: db.MediaObject
                }]
            }]
        });
        if (!userType) return null;
        return {
            token: generateToken(userType.userInfo, false, false),
            user: {
                id: userType.id,
                email: userType.Profile.email,
                fullname: userType.Profile.fullName,
                user_type: userType.user_type,
                user_role: userType.user_role,
                profile_url: userType.Profile.MediaObjects.length > 0 ? userType.Profile.MediaObjects[0].imageurl : ''
            }
        };
    } catch (error) {
        return error;
    }
};

CommonService.prototype.User = {
    GetProfileIdByUserTypeId: async (user_type_id) => {
        try {
            return db.Profile.findOne({
                where: {
                    user_type_id: user_type_id
                },
                attributes: ['id']
            })
        } catch (error) {
            throw (error);
        }
        
    },
    Logout: async (tokenDetails) => {
        try {
            return await db.BlackListedToken.create(tokenDetails);
        } catch (error) {
            throw (error);
        }
    },
    GetFullProfile:
        async (user_id) => {
            try {
                return await db.SubCategory.findAll({
                    attributes: ['id', 'name'],
                    include: [{
                        model: db.Recipe,
                        where: {
                            profile_id: 'e4d2e9b2-6673-4bec-aa39-85d34add646a'
                        }
                    }]
                });
                // return await db.UserType.findById(user_id,
                //     {
                //         attributes: ['id', 'user_type', 'user_role'],
                //         include: [{
                //             attributes: ['id', 'firstname', 'lastname', 'phone', 'gender', 'description', 'diet_preference', 'allergies', 'card_type_bank_details', 'driving_distance'],
                //             model: db.Profile,
                //             include: [{
                //                 attributes: ['id', 'street', 'city', 'state', 'zip_code', 'country'],
                //                 model: db.Address
                //             }, {
                //                 attributes: ['id', 'facebook', 'linkedin'],
                //                 model: db.Social
                //             }, {
                //                 attributes: ['id', 'imageurl'],
                //                 model: db.MediaObject
                //             }, {
                //                 attributes: ['id'],
                //                 model: db.IdentificationCard,
                //                 include: [{model: db.MediaObject}]
                //             }, {
                //                 attributes: ['id'],
                //                 model: db.Certificate,
                //                 include: [{model: db.MediaObject}]
                //             }, {
                //                 attributes: ['id', 'dish_name'],
                //                 model: db.Recipe
                //             }]
                //         }]
                //     });
            } catch (error) {
                throw (error);
            }
        }
};

CommonService.prototype.Recipe = {
    FindAllByCategoryId: async (category_id) => {
        try {
            return db.SubCategory.findAll({
                attributes: ['id', 'name'],
                include: [{
                    where: {
                        category_id: category_id
                    },
                    model: db.Recipe,
                    attributes: ['id', 'dish_name', 'cost_per_serving']
                }]
            });
        } catch (error) {
            throw (error);
        }
    }
};

CommonService.prototype.SubCategory = {
    GettAll: async () => {
        try {
            return await db.SubCategory.findAll({
                attributes: ['id', 'name']
            });
        } catch (error) {
            throw (error);
        }
    }
};

CommonService.prototype.Allergy = {
    GettAll: async () => {
        try {
            return await db.Allergy.findAll({
                attributes: ['id', 'name']
            });
        } catch (error) {
            throw (error);
        }
    }
};

CommonService.prototype.Units = {
    GettAll: async () => {
        try {
            return await db.Unit.findAll({
                attributes: ['id', 'unit_name', 'sort_name']
            });
        } catch (error) {
            throw (error);
        }
    }
};

module.exports = new CommonService();