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

    let RecipeAllergy = sequelize.define('RecipeAllergy', modelDefinition)

    RecipeAllergy.associate = function (models) {
        RecipeAllergy.belongsTo(models.Recipe, {
            foreignKey: {
                name: 'recipeAllergyId',
                onDelete: 'CASCADE'
            }
        })
        RecipeAllergy.belongsTo(models.Allergy, {
            foreignKey: {
                name: 'recipeAllergyId',
                allowNull: false,
                onDelete: 'CASCADE'
            }
        })
    }

    return RecipeAllergy
}
