// The Rating Model.
'use strict';

module.exports = function (sequelize, DataTypes) {
    // 1: The model schema.
    let modelDefinition = {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        rating: {
            type: DataTypes.FLOAT,
            defaultValue: 0,
            allowNull: false
        },
        comments: {
            type: DataTypes.TEXT
        },
        updated_at: DataTypes.DATE,
        deleted_at: DataTypes.DATE
    };
    
    // 2: The model options.
    let modelOptions = {
        underscored: true
    };
    
    return sequelize.define('Review', modelDefinition, modelOptions);
};