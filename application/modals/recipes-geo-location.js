'use strict'

module.exports = function (sequelize, DataTypes) {
    let modelDefinition = {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        latitude: {
            type: DataTypes.FLOAT
        },
        longitude: {
            type: DataTypes.FLOAT
        },
        updatedAt: DataTypes.DATE,
        deletedAt: DataTypes.DATE
    }

    return sequelize.define('RecipesGeoLocations', modelDefinition)
}
