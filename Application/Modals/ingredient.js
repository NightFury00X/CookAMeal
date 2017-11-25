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
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        quantity: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        unit: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        cost: {
            type: DataTypes.DECIMAL,
            allowNull: false
        },
        updated_at: DataTypes.DATE,
        deleted_at: DataTypes.DATE
    };

    // 2: The model options.
    let modelOptions = {
        underscored: true
    };

    return sequelize.define('Ingredients', modelDefinition, modelOptions);
};