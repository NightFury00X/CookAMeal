// The Profile Model.
'use strict';
let CommonConfig = require('../../Configurations/Helpers/common-config');

module.exports = function (sequelize, DataTypes) {
    let modelDefinition = {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
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
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                is: {
                    args: ["^[a-z]+$", 'i'],
                    msg: 'The first name you have entered is contains some bed characters.'
                }
            }
        },
        lastname: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                is: {
                    args: ["^[a-z]+$", 'i'],
                    msg: 'The last name you have entered is contains some bed characters.'
                }
            }
        },
        phone: {
            type: DataTypes.STRING,
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
                    msg: "Must be valid gender Male or Female."
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
                    msg: "Invalid user type."
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
    };

// 2: The model options.
    let modelOptions = {
        underscored: true,
        getterMethods: {
            fullName() {
                return this.firstname + ' ' + this.lastname;
            }
        }
    };
    
    let ProfileModel = sequelize.define('Profile', modelDefinition, modelOptions);
    
    ProfileModel.associate = function (models) {
        ProfileModel.hasOne(models.Address, {onDelete: 'CASCADE'});
        ProfileModel.hasOne(models.Social, {onDelete: 'CASCADE'});
        ProfileModel.hasOne(models.Certificate, {onDelete: 'CASCADE'});
        ProfileModel.hasOne(models.IdentificationCard, {onDelete: 'CASCADE'});
        ProfileModel.hasMany(models.Recipe, {onDelete: 'CASCADE'});
        ProfileModel.hasMany(models.MediaObject, {onDelete: 'CASCADE'});
        ProfileModel.hasMany(models.Rating, {onDelete: 'CASCADE'});
        ProfileModel.hasMany(models.Favorite, {onDelete: 'CASCADE'});
    };
    
    return ProfileModel;
};