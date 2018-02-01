'use strict'

module.exports = function (sequelize, DataTypes) {
    let modelDefinition = {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        feedbackType: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isIn: {
                    args: [['bug', 'feedback']],
                    msg: 'Invalid feedback type.'
                }
            }
        },
        feedbackAs: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isIn: {
                    args: [['cook', 'customer', 'Cook', 'Customer', 'COOK', 'CUSTOMER']],
                    msg: 'Invalid user type.'
                }
            }
        },
        comments: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        updatedAt: DataTypes.DATE,
        deletedAt: DataTypes.DATE
    }

    return sequelize.define('Feedback', modelDefinition)
}
