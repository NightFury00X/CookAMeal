// The User Model.
'use strict';

let bcrypt = require('bcrypt');

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
        password: {
            type: DataTypes.STRING,
            allowNull: false
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
        instanceMethods: {
            comparePasswords: comparePasswords
        },
        hooks: {
            beforeValidate: hashPassword
        },
        underscored: true,
        getterMethods: {
            fullName() {
                return this.firstname + ' ' + this.lastname;
            },
            userInfo() {
                return {
                    id: this.id,
                    username: this.username,
                    role: this.type
                }
            }
        }
    };
    
    const UserModel = sequelize.define('User', modelDefinition, modelOptions);
    
    UserModel.associate = function (models) {
        UserModel.hasMany(models.Address);
        UserModel.hasMany(models.Social);
    };
    
    return UserModel;
};

// Compares two passwords.
async function comparePasswords(password) {
    return await bcrypt.compare(password, this.password);
}

// Hashes the password for a user object.
function hashPassword(user) {
    if (user.changed('password')) {
        return bcrypt.hash(user.password, 10).then(function (password) {
            user.password = password;
        });
    }
}