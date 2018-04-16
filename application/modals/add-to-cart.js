'use strict'

module.exports = function (sequelize, DataTypes) {
    let modelDefinition = {
        id: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        cartFor: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: false
        },
        status: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        updatedAt: DataTypes.DATE,
        deletedAt: DataTypes.DATE
    }

    const AddToCart = sequelize.define('AddToCart', modelDefinition)
    AddToCart.associate = function (models) {
        AddToCart.hasMany(models.CartItem, {
            foreignKey: {
                name: 'cartId',
                allowNull: false,
                onDelete: 'CASCADE'
            }
        })
        AddToCart.hasMany(models.Order, {
            foreignKey: {
                name: 'cartId',
                onDelete: 'CASCADE'
            }
        })
    }

    return AddToCart
}
