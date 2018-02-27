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
            validate: {
                isEmail: {
                    args: true,
                    msg: 'You have entered invalid email format.'
                }
            }
        },
        firstName: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                is: {
                    args: ['^[a-z]+$', 'i'],
                    msg: 'The first name you have entered is contains some bed characters.'
                }
            },
            set (value) {
                this.setDataValue('firstName', CommonConfig.toTitleCase(value))
            }
        },
        lastName: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                is: {
                    args: ['^[a-z]+$', 'i'],
                    msg: 'The last name you have entered is contains some bed characters.'
                }
            },
            set (value) {
                this.setDataValue('lastName', CommonConfig.toTitleCase(value))
            }
        },
        phone: {
            type: DataTypes.STRING(12),
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
            },
            set (value) {
                if (value === 'm' || value === 'M') {
                    value = 'Male'
                } else {
                    value = 'Female'
                }
                this.setDataValue('gender', CommonConfig.toTitleCase(value))
            }
        },
        description: {
            type: DataTypes.TEXT
        },
        dietPreference: {
            type: DataTypes.STRING
        },
        allergies: {
            type: DataTypes.STRING
        },
        drivingDistance: {
            type: DataTypes.FLOAT,
            validate: {
                isFloat: {
                    args: true,
                    msg: 'Invalid driving distance value.'
                }
            }
        },
        allowNotification: {
            type: DataTypes.BOOLEAN
        },
        facebookId: {
            type: DataTypes.STRING
        },
        profileUrl: {
            type: DataTypes.STRING
        },
        coverPhotoUrl: {
            type: DataTypes.STRING
        },
        userRole: {
            type: DataTypes.INTEGER,
            allowNull: false
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
            fullName () {
                return this.firstName + ' ' + this.lastName
            }
        }
    }

    let ProfileModel = sequelize.define('Profile', modelDefinition, modelOptions)

    ProfileModel.associate = function (models) {
        ProfileModel.hasOne(models.Address, {
            foreignKey: {
                name: 'profileId',
                allowNull: false,
                onDelete: 'CASCADE'
            }
        })
        ProfileModel.hasOne(models.Social, {
            foreignKey: {
                name: 'profileId',
                allowNull: false,
                onDelete: 'CASCADE'
            }
        })
        ProfileModel.hasOne(models.Certificate, {
            foreignKey: {
                name: 'profileId',
                allowNull: false,
                onDelete: 'CASCADE'
            }
        })
        ProfileModel.hasOne(models.IdentificationCard, {
            foreignKey: {
                name: 'profileId',
                allowNull: false,
                onDelete: 'CASCADE'
            }
        })
        ProfileModel.hasMany(models.Recipe, {
            foreignKey: {
                name: 'profileId',
                allowNull: false,
                onDelete: 'CASCADE'
            }
        })
        ProfileModel.hasMany(models.MediaObject, {
            foreignKey: {
                name: 'profileId',
                onDelete: 'CASCADE'
            }
        })
        ProfileModel.hasMany(models.Review, {
            foreignKey: {
                name: 'profileId',
                onDelete: 'CASCADE'
            }
        })
        ProfileModel.hasMany(models.Favorite, {
            foreignKey: {
                name: 'profileId',
                onDelete: 'CASCADE'
            }
        })
        ProfileModel.hasMany(models.ProfileCover, {
            foreignKey: {
                name: 'profileId',
                onDelete: 'CASCADE'
            }
        })
    }

    return ProfileModel
}
