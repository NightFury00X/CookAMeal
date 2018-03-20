'use strict'

module.exports = function (sequelize, DataTypes) {
    let modelDefinition = {
        id: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        rating: {
            type: DataTypes.FLOAT,
            defaultValue: 0,
            allowNull: false
        },
        comments: {
            type: DataTypes.TEXT
        },
        updatedAt: DataTypes.DATE,
        deletedAt: DataTypes.DATE
    }

    return sequelize.define('Review', modelDefinition)
}
