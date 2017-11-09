// The User model.
'use strict';

let bcrypt = require('bcrypt'),
    config = require('../../Configurations/Main/config');

// Compares two passwords.
function comparePasswords(password, callback) {
    bcrypt.compare(password, this.password, function (error, isMatch) {
        if (error) {
            return callback(error);
        }        
        return callback(null, isMatch);
    });
}

// Hashes the password for a user object.
function hashPassword(user) {
    if (user.changed('password')) {
        return bcrypt.hash(user.password, 10).then(function (password) {
            user.password = password;
        });
    }
}

module.exports = function (sequelize, DataTypes) {
    let modelDefinition = {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        role: {
            type: DataTypes.INTEGER,
            defaultValue: config.userRoles.user
        },
    };

// 2: The model options.
    let modelOptions = {
        instanceMethods: {
            comparePasswords: comparePasswords
        },
        hooks: {
            beforeValidate: hashPassword
        },
        classMethods: {
            associate: function (models) {
                UserModel.hasMany(models.AddressModel, { onDelete: 'CASCADE' });
            }
        },
        underscored: true
    };
    
    let UserModel = sequelize.define('user', modelDefinition, modelOptions);    
    return UserModel;
};