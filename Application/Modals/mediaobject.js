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
        originalname: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        encoding: {
            type: DataTypes.STRING,
            allowNull: false
        },
        mimetype: {
            type: DataTypes.STRING,
            allowNull: false
        },
        destination: {
            type: DataTypes.STRING,
            allowNull: false
        },
        filename: {
            type: DataTypes.STRING,
            allowNull: false
        },
        imageurl: {
            type: DataTypes.STRING,
            allowNull: false
        },
        size: {
            type: DataTypes.STRING,
            allowNull: false
        },
        objectType: {
            type: DataTypes.STRING,
            allowNull: false
        },
        linkedObject: {
            type: DataTypes.STRING,
            allowNull: true
        },
        updated_at: DataTypes.DATE,
        deleted_at: DataTypes.DATE
    };
    
    // 2: The model options.
    let modelOptions = {
        underscored: true
    };
    
    let MediaObject = sequelize.define('MediaObject', modelDefinition, modelOptions);
    
    MediaObject.associate = function (models) {
        // MediaObject.belongsTo(models.Profile);
    };
    
    return MediaObject;
};