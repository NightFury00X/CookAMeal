'use strict'

module.exports = function (sequelize, DataTypes) {
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
        updatedAt: DataTypes.DATE,
        deletedAt: DataTypes.DATE
    }

    return sequelize.define('Tax', modelDefinition)
}
