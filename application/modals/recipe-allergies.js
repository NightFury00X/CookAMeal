// The RecipeAllergies Model.
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
        updated_at: DataTypes.DATE,
        deleted_at: DataTypes.DATE
    };
    
    // 2: The model options.
    let modelOptions = {
        underscored: true
    };
    
    let RecipeAllergy = sequelize.define('RecipeAllergy', modelDefinition, modelOptions);
    
    RecipeAllergy.associate = function (models) {
        RecipeAllergy.belongsTo(models.Recipe, {onDelete: 'CASCADE'});
        RecipeAllergy.belongsTo(models.Allergy, {onDelete: 'CASCADE'});
    };
    
    return RecipeAllergy;
};