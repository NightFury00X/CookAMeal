'use strict'

module.exports = function (sequelize, DataTypes) {
    let modelDefinition = {
        id: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        step: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        method: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        updatedAt: DataTypes.DATE,
        deletedAt: DataTypes.DATE
    }

    return sequelize.define('PreparationMethod', modelDefinition)
}
