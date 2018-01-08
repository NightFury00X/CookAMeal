// The Profile Model.
'use strict'
let CommonConfig = require('../../configurations/helpers/common-config')

module.exports = function (sequelize, DataTypes) {
    let modelDefinition = {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: {
                args: true,
                msg: 'Oops. Looks like you already have an account with this email address. Please try to login.',
                fields: [sequelize.fn('lower', sequelize.col('email'))]
            },
            validate: {
                isEmail: {
                    args: true,
                    msg: 'You have entered invalid email format.'
                }
            }
        },
        firstname: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                is: {
                    args: ['^[a-z]+$', 'i'],
                    msg: 'The first name you have entered is contains some bed characters.'
                }
            },
            set (value) {
                this.setDataValue('firstname', CommonConfig.toTitleCase(value))
            }
        },
        lastname: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                is: {
                    args: ['^[a-z]+$', 'i'],
                    msg: 'The last name you have entered is contains some bed characters.'
                }
            },
            set (value) {
                this.setDataValue('lastname', CommonConfig.toTitleCase(value))
            }
        },
        phone: {
            type: DataTypes.STRING(12),
            allowNull: false,
            validate: {
                isNumeric: {
                    args: true,
                    msg: 'you have entered invalid phone number.'
                }
            }
        },
        gender: {
            type: DataTypes.CHAR(1),
            allowNull: false,
            validate: {
                isIn: {
                    args: [['m', 'M', 'f', 'F']],
                    msg: 'Must be valid gender Male or Female.'
                }
            }
        },
        description: {
            type: DataTypes.TEXT
        },
        diet_preference: {
            type: DataTypes.STRING
        },
        allergies: {
            type: DataTypes.STRING
        },
        user_role: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                isIn: {
                    args: [['1', '2']],
                    msg: 'Invalid user type.'
                }
            }
        },
        card_type_bank_details: {
            type: DataTypes.STRING
        },
        driving_distance: {
            type: DataTypes.FLOAT,
            validate: {
                isFloat: {
                    args: true,
                    msg: 'Invalid driving distance value.'
                }
            }
        },
        allow_notification: {
            type: DataTypes.BOOLEAN
        },
        updated_at: DataTypes.DATE,
        deleted_at: DataTypes.DATE
    }

    // 2: The model options.
    let modelOptions = {
        underscored: true,
        getterMethods: {
            fullName () {
                return this.firstname + ' ' + this.lastname
            }
        }
    }

    let ProfileModel = sequelize.define('Profile', modelDefinition, modelOptions)

    ProfileModel.associate = function (models) {
        ProfileModel.hasOne(models.Address, {
            foreignKey: {
                allowNull: false,
                onDelete: 'CASCADE'
            }
        })
        ProfileModel.hasOne(models.Social, {
            foreignKey: {
                allowNull: false,
                onDelete: 'CASCADE'
            }
        })
        ProfileModel.hasOne(models.Certificate, {
            foreignKey: {
                allowNull: false,
                onDelete: 'CASCADE'
            }
        })
        ProfileModel.hasOne(models.IdentificationCard, {
            foreignKey: {
                allowNull: false,
                onDelete: 'CASCADE'
            }
        })
        ProfileModel.hasMany(models.Recipe, {
            foreignKey: {
                allowNull: false,
                onDelete: 'CASCADE'
            }
        })
        ProfileModel.hasMany(models.MediaObject, {
            onDelete: 'CASCADE'
        })
        ProfileModel.hasMany(models.Review, {
            onDelete: 'CASCADE'
        })
        ProfileModel.hasMany(models.Favorite, {
            onDelete: 'CASCADE'
        })
    }

    return ProfileModel
}
