// The ResetPassword Model.
'use strict';

const bcrypt = require("bcrypt");
module.exports = function (sequelize, DataTypes) {
    // 1: The model schema.
    let modelDefinition = {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        temp_password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        random_key: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        token: {
            type: DataTypes.STRING(500),
            allowNull: false
        },
        unique_key: {
            type: DataTypes.STRING(16),
            allowNull: false
        },
        is_valid: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        valid_upto: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1 //in hour
        },
        status: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: 1
        }
    };
    
    // 2: The model options.
    let modelOptions = {
        hooks: {
            beforeValidate: hashPassword
        },
        underscored: true
    };
    
    let ResetPassword = sequelize.define('ResetPassword', modelDefinition, modelOptions);
    
    // Adding an instance level method
    ResetPassword.prototype.comparePasswords = function (password) {
        return comparePasswords(password, this.temp_password);
    };
    
    return ResetPassword;
};

// Compares two passwords.
async function comparePasswords(password, pwd) {
    return await bcrypt.compare(password, pwd);
}

// Hashes the password for a reset-password object.
function hashPassword(resetpassword) {
    if (resetpassword.changed('temp_password')) {
        return bcrypt.hash(resetpassword.temp_password, 10).then(function (password) {
            resetpassword.temp_password = password;
        });
    }
}