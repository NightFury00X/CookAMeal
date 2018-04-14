'use strict'
module.exports = function (sequelize, DataTypes) {
    let modelDefinition = {
        id: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        noOfServing: {
            type: DataTypes.STRING,
            allowNull: false
        },
        costPerServing: {
            type: DataTypes.STRING,
            allowNull: false
        },
        spiceLevel: {
            type: DataTypes.STRING,
            allowNull: false
        },
        updatedAt: DataTypes.DATE,
        deletedAt: DataTypes.DATE
    }

    return sequelize.define('OrderItem', modelDefinition)
}
