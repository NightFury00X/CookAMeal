'use strict'

const bcrypt = require('bcrypt')
module.exports = function (sequelize, DataTypes) {
    let modelDefinition = {
        id: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        tempPassword: {
            type: DataTypes.STRING,
            allowNull: false
        },
        randomKey: {
            type: DataTypes.STRING,
            allowNull: false
        },
        token: {
            type: DataTypes.STRING(500),
            allowNull: false
        },
        uniqueKey: {
            type: DataTypes.STRING(16),
            allowNull: false
        },
        isValid: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        validUpto: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1 // in hour
        },
        status: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: 1
        },
        updatedAt: DataTypes.DATE,
        deletedAt: DataTypes.DATE
    }
    let modelOptions = {
        hooks: {
            beforeValidate: hashPassword
        }
    }

    let ResetPassword = sequelize.define('ResetPassword', modelDefinition, modelOptions)

    // Adding an instance level method
    ResetPassword.prototype.comparePasswords = function (password) {
        return comparePasswords(password, this.tempPassword)
    }

    return ResetPassword
}

// Compares two passwords.
async function comparePasswords (password, pwd) {
    return await bcrypt.compare(password, pwd)
}

// Hashes the password for a reset-password object.
function hashPassword (resetPassword) {
    if (resetPassword.changed('tempPassword')) {
        return bcrypt.hash(resetPassword.tempPassword, 10).then(function (password) {
            resetPassword.tempPassword = password
        })
    }
}
