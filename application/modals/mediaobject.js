// The MediaObject Model.
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
        originalname: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        encoding: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        mimetype: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        destination: {
            type: DataTypes.STRING(200),
            allowNull: false
        },
        filename: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        imageurl: {
            type: DataTypes.STRING(200),
            allowNull: false
        },
        size: {
            type: DataTypes.STRING,
            allowNull: false
        },
        object_type: {
            type: DataTypes.STRING,
            allowNull: false
        },
        updated_at: DataTypes.DATE,
        deleted_at: DataTypes.DATE
    };
    
    // 2: The model options.
    let modelOptions = {
        underscored: true
    };
    
    return sequelize.define('MediaObject', modelDefinition, modelOptions);
};