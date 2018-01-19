// The Certificate Model.
'use strict'

module.exports = function (sequelize, DataTypes) {
    // 1: The model schema.
    let modelDefinition = {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        latitude: {
            type: DataTypes.DECIMAL(12, 9)
        },
        longitude: {
            type: DataTypes.DECIMAL(12, 9)
        },
        updated_at: DataTypes.DATE,
        deleted_at: DataTypes.DATE
    }

    // 2: The model options.
    let modelOptions = {
        underscored: true
    }

    return sequelize.define('CooksDealWithCategory', modelDefinition, modelOptions)
}
