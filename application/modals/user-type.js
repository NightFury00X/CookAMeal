'use strict'

module.exports = function (sequelize, DataTypes) {
    let modelDefinition = {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        emailId: {
            type: DataTypes.STRING
        },
        facebookId: {
            type: DataTypes.STRING
        },
        facebookEmailId: {
            type: DataTypes.STRING
        },
        userRole: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                isIn: {
                    args: [['1', '2']],
                    msg: 'Invalid user role.'
                }
            }
        },
        hasProfile: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        profileSelected: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        hasLogin: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        updatedAt: DataTypes.DATE,
        deletedAt: DataTypes.DATE,
        deleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }
    let modelOptions = {
        getterMethods: {
            userInfo () {
                return {
                    id: this.id,
                    facebookId: this.facebookId,
                    email: this.emailId,
                    userRole: this.userRole
                }
            }
        }
    }
    let UserTypeModel = sequelize.define('UserType', modelDefinition, modelOptions)
    UserTypeModel.associate = function (models) {
        UserTypeModel.hasOne(models.User, {
            foreignKey: {
                name: 'createdBy',
                allowNull: false,
                onDelete: 'CASCADE'
            }
        })

        UserTypeModel.hasOne(models.Profile, {
            foreignKey: {
                name: 'createdBy',
                allowNull: false,
                onDelete: 'CASCADE'
            }
        })
        UserTypeModel.hasMany(models.BlackListedToken, {
            foreignKey: {
                name: 'userId',
                allowNull: false,
                onDelete: 'CASCADE'
            }
        })
        UserTypeModel.hasMany(models.ResetPassword, {
            foreignKey: {
                name: 'createdBy',
                allowNull: false,
                onDelete: 'CASCADE'
            }
        })
        UserTypeModel.hasMany(models.Allergy, {
            foreignKey: {
                name: 'createdBy',
                allowNull: false,
                onDelete: 'CASCADE'
            }
        })
        UserTypeModel.hasMany(models.SubCategory, {
            foreignKey: {
                name: 'createdBy',
                allowNull: false,
                onDelete: 'CASCADE'
            }
        })
        UserTypeModel.hasMany(models.Unit, {
            foreignKey: {
                name: 'createdBy',
                allowNull: false,
                onDelete: 'CASCADE'
            }
        })
        UserTypeModel.hasMany(models.Review, {
            foreignKey: {
                name: 'createdBy',
                allowNull: false,
                onDelete: 'CASCADE'
            }
        })
        UserTypeModel.hasMany(models.Favorite, {
            foreignKey: {
                name: 'createdBy',
                allowNull: false,
                onDelete: 'CASCADE'
            }
        })
        UserTypeModel.hasMany(models.Feedback, {
            foreignKey: {
                name: 'createdBy',
                allowNull: false,
                onDelete: 'CASCADE'
            }
        })
        UserTypeModel.hasMany(models.Order, {
            foreignKey: {
                name: 'createdBy',
                allowNull: false,
                onDelete: 'CASCADE'
            }
        })
        UserTypeModel.hasMany(models.TransactionDetail, {
            foreignKey: {
                name: 'paidBy',
                allowNull: false,
                onDelete: 'CASCADE'
            }
        })
        UserTypeModel.hasMany(models.Tax, {
            foreignKey: {
                name: 'createdBy',
                allowNull: false,
                onDelete: 'CASCADE'
            }
        })

        UserTypeModel.hasOne(models.AddToCart, {
            foreignKey: {
                name: 'createdBy',
                allowNull: false,
                onDelete: 'CASCADE'
            }
        })

        UserTypeModel.hasOne(models.CookAvailability, {
            foreignKey: {
                name: 'createdBy',
                allowNull: false,
                onDelete: 'CASCADE'
            }
        })

        UserTypeModel.hasMany(models.PaymentGateway, {
            foreignKey: {
                name: 'createdBy',
                allowNull: false,
                onDelete: 'CASCADE'
            }
        })
    }
    return UserTypeModel
}
