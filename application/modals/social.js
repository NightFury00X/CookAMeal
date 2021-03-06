// The Social Model.
'use strict'

module.exports = function (sequelize, DataTypes) {
    // 1: The model schema.
    let modelDefinition = {
        id: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        facebook: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        linkedin: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        updated_at: DataTypes.DATE,
        deleted_at: DataTypes.DATE
    }

    // 2: The model options.
    let modelOptions = {
        underscored: true
    }

    return sequelize.define('Social', modelDefinition, modelOptions)
}
