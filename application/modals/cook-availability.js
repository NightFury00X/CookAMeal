'use strict'

module.exports = function (sequelize, DataTypes) {
    let modelDefinition = {
        id: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        startTime: {
            type: DataTypes.DATE,
            allowNull: false
        },
        endTime: {
            type: DataTypes.DATE,
            allowNull: false
        },
        updatedAt: DataTypes.DATE,
        deletedAt: DataTypes.DATE
    }

    return sequelize.define('CookAvailability', modelDefinition)
}
