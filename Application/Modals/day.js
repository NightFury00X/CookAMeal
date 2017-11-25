// The Social Model.
'use strict';

module.exports = function (sequelize, DataTypes) {
    // 1: The model schema.
    let modelDefinition = {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false
        },
        mon: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        tue: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        web: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        thu: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        fri: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        sat: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        sun: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        updated_at: DataTypes.DATE,
        deleted_at: DataTypes.DATE
    };

    // 2: The model options.
    let modelOptions = {
        underscored: true
    };

    return sequelize.define('Day', modelDefinition, modelOptions);
};