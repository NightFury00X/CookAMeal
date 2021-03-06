'use strict'

module.exports = function (sequelize, DataTypes) {
    let modelDefinition = {
        id: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        originalName: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        encoding: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        mimeType: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        destination: {
            type: DataTypes.STRING(200),
            allowNull: false
        },
        fileName: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        imageUrl: {
            type: DataTypes.STRING(200),
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
        updatedAt: DataTypes.DATE,
        deletedAt: DataTypes.DATE
    }

    return sequelize.define('MediaObject', modelDefinition)
}
