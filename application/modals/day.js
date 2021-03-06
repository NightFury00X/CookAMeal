'use strict'

module.exports = function (sequelize, DataTypes) {
    let modelDefinition = {
        id: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        mon: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        tue: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        wed: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        thu: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        fri: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        sat: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        sun: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        updatedAt: DataTypes.DATE,
        deletedAt: DataTypes.DATE
    }

    return sequelize.define('Day', modelDefinition)
}
