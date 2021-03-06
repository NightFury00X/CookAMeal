'use strict'

module.exports = function (sequelize, DataTypes) {
    let modelDefinition = {
        id: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        updatedAt: DataTypes.DATE,
        deletedAt: DataTypes.DATE
    }

    let ProfileCover = sequelize.define('ProfileCover', modelDefinition)

    ProfileCover.associate = function (models) {
        ProfileCover.hasMany(models.MediaObject, {
            foreignKey: {
                name: 'profileCoverId',
                onDelete: 'CASCADE'
            }
        })
    }

    return ProfileCover
}
