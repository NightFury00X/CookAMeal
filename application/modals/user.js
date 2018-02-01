'use strict'

let bcrypt = require('bcrypt')

module.exports = function (sequelize, DataTypes) {
    let modelDefinition = {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        // email: {
        //     type: DataTypes.STRING,
        //     allowNull: false,
        //     unique: {
        //         args: true,
        //         msg: 'Oops. Looks like you already have an account with this email address. Please try to login.',
        //         fields: [sequelize.fn('lower', sequelize.col('email'))]
        //     },
        //     validate: {
        //         isEmail: {
        //             args: true,
        //             msg: 'You have entered invalid email format.'
        //         }
        //     }
        // },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        updatedAt: DataTypes.DATE,
        deletedAt: DataTypes.DATE
    }
    let modelOptions = {
        hooks: {
            beforeValidate: hashPassword
        }
    }

    const UserModel = sequelize.define('User', modelDefinition, modelOptions)

    UserModel.prototype.comparePasswords = function (password) {
        return comparePasswords(password, this.password)
    }

    return UserModel
}

async function comparePasswords (password, pwd) {
    return await bcrypt.compare(password, pwd)
}

function hashPassword (user) {
    if (user.changed('password')) {
        return bcrypt.hash(user.password, 10).then(function (password) {
            user.password = password
        })
    }
}
