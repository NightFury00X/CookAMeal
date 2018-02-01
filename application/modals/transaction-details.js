'use strict'

module.exports = function (sequelize, DataTypes) {
    let modelDefinition = {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        transactionId: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        amount: {
            type: DataTypes.STRING,
            allowNull: false
        },
        discountAmount: {
            type: DataTypes.STRING
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false
        },
        paymentInstrumentType: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isIn: {
                    args: [['paypal_account', 'credit_card']],
                    msg: 'Invalid payment type.'
                }
            }
        },
        merchantAccountId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        taxAmount: {
            type: DataTypes.STRING
        },
        recurring: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false
        },
        updatedAt: DataTypes.DATE,
        deletedAt: DataTypes.DATE
    }

    return sequelize.define('TransactionDetail', modelDefinition)
}
