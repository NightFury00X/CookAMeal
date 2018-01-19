// The Tax Model.
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
        countryKey: {
            type: DataTypes.STRING,
            allowNull: false
        },
        stateKey: {
            type: DataTypes.STRING,
            allowNull: false
        },
        tax: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        updated_at: DataTypes.DATE,
        deleted_at: DataTypes.DATE
    }

    // 2: The model options.
    let modelOptions = {
        underscored: true
    }

    return sequelize.define('Tax', modelDefinition, modelOptions)
}
