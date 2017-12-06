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
        dish_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        preparation_method: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        preparation_time: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        cook_time: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        tags: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        cost_per_serving: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        available_servings: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        order_by_date_time: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        pick_up_by_date_time: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        delivery_fee: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        total_cost_of_ingredients:{
          type:DataTypes.DECIMAL,
          allowNull: false
        },
        updated_at: DataTypes.DATE,
        deleted_at: DataTypes.DATE
    };

    // 2: The model options.
    let modelOptions = {
        underscored: true
    };

    let Recipe = sequelize.define('Recipe', modelDefinition, modelOptions);

    Recipe.associate = function (models) {
        Recipe.hasOne(models.Day, { onDelete: 'CASCADE' });
        Recipe.hasMany(models.Ingredient, {onDelete: 'CASCADE'});
        Recipe.hasMany(models.MediaObject, { onDelete: 'CASCADE' });
        Recipe.hasMany(models.RecipeAllergy, {onDelete: 'CASCADE'});
    };

    return Recipe;
};