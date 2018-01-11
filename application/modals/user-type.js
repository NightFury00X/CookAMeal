// The User Type Model.
'use strict'

module.exports = function (sequelize, DataTypes) {
    // 1: The model schema.
    let modelDefinition = {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: {
                args: true,
                msg: 'Oops. Looks like you already have an account. Please try to login.',
                fields: [sequelize.fn('lower', sequelize.col('email'))]
            }
        },
        user_type: { // 1 - Normal User, 2 - Facebook User
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                isIn: {
                    args: [['1', '2']],
                    msg: 'Invalid user type.'
                }
            }
        },
        user_role: { // 1 - cook, 2 - customer, 3 - admin
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                isIn: {
                    args: [['1', '2']],
                    msg: 'Invalid user role.'
                }
            }
        },
        updated_at: DataTypes.DATE,
        deleted_at: DataTypes.DATE
    }
    // 2: The model options.
    let modelOptions = {
        underscored: true,
        getterMethods: {
            userInfo () {
                return {
                    id: this.id,
                    username: this.user_id,
                    user_role: this.user_role,
                    user_type: this.user_type
                }
            }
        }
    }
    let UserTypeModel = sequelize.define('UserType', modelDefinition, modelOptions)
    UserTypeModel.associate = function (models) {
        UserTypeModel.hasOne(models.User, {
            foreignKey: {
                allowNull: false,
                onDelete: 'CASCADE'
            }
        })
        UserTypeModel.hasOne(models.Profile, {
            foreignKey: {
                allowNull: false,
                onDelete: 'CASCADE'
            }
        })
        UserTypeModel.hasMany(models.BlackListedToken, {
            foreignKey: {
                allowNull: false,
                onDelete: 'CASCADE'
            }
        })
        UserTypeModel.hasMany(models.ResetPassword, {
            foreignKey: {
                allowNull: false,
                onDelete: 'CASCADE'
            }
        })
        UserTypeModel.hasMany(models.Allergy, {
            foreignKey: {
                allowNull: false,
                onDelete: 'CASCADE'
            }
        })
        // UserTypeModel.hasMany(models.Category, {
        //     foreignKey: {
        //         name: 'created_by',
        //         allowNull: false,
        //         onDelete: 'CASCADE'
        //     }
        // });
        UserTypeModel.hasMany(models.SubCategory, {
            foreignKey: {
                allowNull: false,
                onDelete: 'CASCADE'
            }
        })
        UserTypeModel.hasMany(models.Unit, {
            foreignKey: {
                allowNull: false,
                onDelete: 'CASCADE'
            }
        })
        UserTypeModel.hasMany(models.Review, {
            foreignKey: {
                allowNull: false,
                onDelete: 'CASCADE'
            }
        })
        UserTypeModel.hasMany(models.Favorite, {
            foreignKey: {
                allowNull: false,
                onDelete: 'CASCADE'
            }
        })
        UserTypeModel.hasMany(models.Feedback, {
            foreignKey: {
                allowNull: false,
                onDelete: 'CASCADE'
            }
        })
        UserTypeModel.hasMany(models.Order, {
            foreignKey: {
                allowNull: false,
                onDelete: 'CASCADE'
            }
        })
        UserTypeModel.hasMany(models.TransactionDetail, {
            foreignKey: {
                name: 'paidTo',
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
    }
    return UserTypeModel
}
