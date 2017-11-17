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
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        updated_at: DataTypes.DATE,
        deleted_at: DataTypes.DATE
    };

// 2: The model options.
    let modelOptions = {
        hooks: {
            beforeValidate: hashPassword
        },
        underscored: true
    };
    
    const UserModel = sequelize.define('User', modelDefinition, modelOptions);
    
    // UserModel.associate = function (models) {
    //     UserModel.hasOne(models.Profile, {onDelete: 'CASCADE'});
    // };
    
    // Adding an instance level method
    UserModel.prototype.comparePasswords = function (password) {
        return comparePasswords(password, this.password);
    };
    
    return UserModel;
};

// Compares two passwords.
async function comparePasswords(password, pwd) {
    return await bcrypt.compare(password, pwd);
}

// Hashes the password for a user object.
function hashPassword(user) {
    if (user.changed('password')) {
        return bcrypt.hash(user.password, 10).then(function (password) {
            user.password = password;
        });
    }
}