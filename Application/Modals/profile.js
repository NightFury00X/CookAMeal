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
            type: DataTypes.CHAR,
            length: 1,
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
        dietpreffrence: {
            type: DataTypes.STRING
        },
        allergies: {
            type: DataTypes.STRING
        },
        type: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                isIn: {
                    args: [['1', '2']],
                    msg: "Invalid user type."
                }
            }
        },
        cardtypebankdetails: {
            type: DataTypes.STRING
        },
        drivingdistance: {
            type: DataTypes.FLOAT,
            validate: {
                isFloat: {
                    args: true,
                    msg: 'Invalid driving distance value.'
                }
            }
        },
        updated_at: DataTypes.DATE,
        deleted_at: DataTypes.DATE
    };

// 2: The model options.
    let modelOptions = {
        hooks: {
            beforeCreate: UpdateLinkedMediaObject
        },
        underscored: true,
        getterMethods: {
            fullName() {
                return this.firstname + ' ' + this.lastname;
            }
        }
    };
    
    let ProfileModel = sequelize.define('Profile', modelDefinition, modelOptions);
    
    ProfileModel.associate = function (models) {
        // ProfileModel.hasOne(models.Address);
        // ProfileModel.hasOne(models.Social);
        // ProfileModel.hasOne(models.Category);
        // ProfileModel.hasOne(models.Certificate);
        // ProfileModel.hasOne(models.IdentificationCard);
        ProfileModel.belongsTo(models.MediaObject);
    };
    
    return ProfileModel;
};

function UpdateLinkedMediaObject(model, trans) {
    let MediaObject = this.associations.MediaObject.target;
    MediaObject.update({
        linkedObject: model.id
    }, {
        where: {
            user_type_id: model.user_type_id,
            objectType: CommonConfig.ObjectType.Profile
        }
    }, {transaction: trans});
}