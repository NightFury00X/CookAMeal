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

    let RecipeImage = sequelize.define('RecipeImage', modelDefinition)

    RecipeImage.associate = function (models) {
        RecipeImage.belongsTo(models.MediaObject, {
            foreignKey: {
                name: 'mediaId',
                onDelete: 'CASCADE'
            }
        })
    }

    return RecipeImage
}
