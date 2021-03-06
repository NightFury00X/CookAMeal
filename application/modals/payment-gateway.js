module.exports = function (sequelize, DataTypes) {
    let modelDefinition = {
        id: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        nonce: {
            type: DataTypes.STRING,
            allowNull: false
        },
        amount: {
            type: DataTypes.STRING,
            allowNull: false
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'PENDING'
        },
        currencyCode: {
            type: DataTypes.STRING,
            allowNull: false
        },
        currencySymbol: {
            type: DataTypes.STRING,
            allowNull: false
        },
        paymentType: {
            type: DataTypes.STRING,
            allowNull: false
        },
        updatedAt: DataTypes.DATE,
        deletedAt: DataTypes.DATE
    }

    const PaymentGateway = sequelize.define('PaymentGateway', modelDefinition)
    PaymentGateway.associate = function (models) {
        PaymentGateway.hasOne(models.Order, {
            foreignKey: {
                name: 'paymentGatwayId',
                allowNull: false,
                onDelete: 'CASCADE'
            }
        })
    }
    return PaymentGateway
}
